/**
 * Game Engine
 * Core game flow orchestration for poker hand processing
 *
 * This module handles:
 * - Processing individual sections (base, more, more2)
 * - Cascading through multiple sections in order
 * - Stack calculations after each action
 * - Contribution tracking
 * - All-in detection and handling
 * - Integration with pot, stack, and validation engines
 *
 * Note: This is pure business logic - no React dependencies.
 * UI concerns (alerts, focus management, state updates) should be
 * handled by React hooks that wrap these functions.
 */

import type {
  Player,
  PlayerData
} from '../../../types/poker/player.types';
import type {
  Stage,
  ActionLevel,
  ProcessedSections,
  SectionStacks,
  GameConfig,
  ChipUnit
} from '../../../types/poker/game.types';
import type {
  ContributedAmounts
} from '../../../types/poker/pot.types';
import { convertToActualValue } from '../utils/formatUtils';
import { normalizePosition } from '../utils/positionUtils';

/**
 * Result from processing a single section
 */
export type ProcessSectionResult = {
  updatedPlayerData: PlayerData;
  updatedStacks: { [playerId: number]: number };
  currentStacks: { [playerId: number]: number };
  contributedAmounts: { [playerId: number]: number };
  allInPlayers: Array<{
    playerId: number;
    name: string;
    position: string;
    required?: number;
    available?: number;
    stage?: string;
    sectionKey?: string;
  }>;
  validationErrors?: string[];
};

/**
 * Result from cascading through multiple sections
 */
export type ProcessCascadeResult = {
  sectionStacks: SectionStacks;
  playerData: PlayerData;
  contributedAmounts: ContributedAmounts;
  processedSections: ProcessedSections;
  allAllInPlayers: Array<{
    playerId: number;
    name: string;
    position: string;
    section: string;
    required?: number;
    available?: number;
  }>;
  sectionsProcessed: Array<{ stage: Stage; level: ActionLevel }>;
};

/**
 * Get previous section's action to determine if player is still active
 * Returns the action from the most recent previous section
 */
export function getPreviousSectionAction(
  playerId: number,
  currentStage: Stage,
  currentLevel: ActionLevel,
  playerData: PlayerData,
  visibleActionLevels: { [stage: string]: ActionLevel[] }
): string | null {
  const stages: Stage[] = ['preflop', 'flop', 'turn', 'river'];
  const levels: ActionLevel[] = ['base', 'more', 'more2'];

  const currentStageIndex = stages.indexOf(currentStage);
  const currentLevelIndex = levels.indexOf(currentLevel);

  // Check previous level in current stage
  if (currentLevelIndex > 0) {
    const prevLevel = levels[currentLevelIndex - 1];
    const suffix = prevLevel === 'base' ? '' : prevLevel === 'more' ? '_moreAction' : '_moreAction2';
    const data = playerData[playerId] || {};
    const action = data[`${currentStage}${suffix}_action`];
    return (typeof action === 'string' ? action : null) || null;
  }

  // Check previous stage's last level
  if (currentStageIndex > 0) {
    const prevStage = stages[currentStageIndex - 1];
    const stageLevels = visibleActionLevels[prevStage] || ['base'];
    const lastLevel = stageLevels[stageLevels.length - 1];
    const suffix = lastLevel === 'base' ? '' : lastLevel === 'more' ? '_moreAction' : '_moreAction2';
    const data = playerData[playerId] || {};
    const action = data[`${prevStage}${suffix}_action`];
    return (typeof action === 'string' ? action : null) || null;
  }

  return null; // First section
}

/**
 * Get active players for a section (those who haven't folded)
 * Sorted by position order
 */
export function getActivePlayers(
  players: Player[],
  playerData: PlayerData,
  stage: Stage,
  level: ActionLevel,
  visibleActionLevels: { [stage: string]: ActionLevel[] }
): Player[] {
  // Get active players (not folded)
  const activePlayersUnsorted = players.filter(p => {
    const prevAction = getPreviousSectionAction(p.id, stage, level, playerData, visibleActionLevels);
    return prevAction !== 'fold';
  });

  // Sort by position order
  const positionOrder = stage === 'preflop'
    ? ['utg', 'utg+1', 'utg+2', 'mp', 'mp+1', 'mp+2', 'co', 'dealer', 'sb', 'bb']
    : ['sb', 'bb', 'utg', 'utg+1', 'utg+2', 'mp', 'mp+1', 'mp+2', 'co', 'dealer'];

  let activePlayers = activePlayersUnsorted.sort((a, b) => {
    const posA = normalizePosition(a.position).toLowerCase();
    const posB = normalizePosition(b.position).toLowerCase();
    const indexA = positionOrder.indexOf(posA);
    const indexB = positionOrder.indexOf(posB);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  // For more action rounds: Rotate to start from next player after last actor
  if (level === 'more' || level === 'more2') {
    const previousLevel: ActionLevel = level === 'more' ? 'base' : 'more';
    const previousSuffix = previousLevel === 'base' ? '' : previousLevel === 'more' ? '_moreAction' : '_moreAction2';

    // Find last actor from previous level
    let lastActorIndex = -1;
    for (let i = activePlayers.length - 1; i >= 0; i--) {
      const player = activePlayers[i];
      const data = playerData[player.id] || {};
      const action = data[`${stage}${previousSuffix}_action`];

      if (action && action !== 'no action' && action !== 'fold') {
        lastActorIndex = i;
        break;
      }
    }

    // Rotate array so next player after last actor is first
    if (lastActorIndex !== -1) {
      const nextActorIndex = (lastActorIndex + 1) % activePlayers.length;
      activePlayers = [
        ...activePlayers.slice(nextActorIndex),
        ...activePlayers.slice(0, nextActorIndex)
      ];
    }
  }

  return activePlayers;
}

/**
 * Calculate current stacks for a section
 * Handles different scenarios:
 * - Preflop base: After posting blinds
 * - More actions: Inherit from previous level
 * - Postflop base: Inherit from previous stage
 */
export function calculateCurrentStacksForSection(
  players: Player[],
  playerData: PlayerData,
  stage: Stage,
  level: ActionLevel,
  sectionStacks: SectionStacks
): { [playerId: number]: number } {
  const currentStacksForSection: { [playerId: number]: number } = {};

  if (stage === 'preflop' && level === 'base') {
    // Preflop base: Subtract posted blinds/ante
    players.forEach(p => {
      if (!p.name || p.stack === 0) {
        currentStacksForSection[p.id] = 0;
        return;
      }

      const data = playerData[p.id] || {};
      const normalizedPosition = normalizePosition(p.position).toLowerCase();
      let stackAfterPosting = p.stack;

      if (normalizedPosition === 'sb' && typeof data.postedSB === 'number') {
        stackAfterPosting -= data.postedSB;
      }
      if (normalizedPosition === 'bb') {
        if (typeof data.postedBB === 'number') stackAfterPosting -= data.postedBB;
        if (typeof data.postedAnte === 'number') stackAfterPosting -= data.postedAnte;
      }

      currentStacksForSection[p.id] = stackAfterPosting;
    });
  } else if (level === 'more' || level === 'more2') {
    // More action: Inherit from previous level
    const prevLevel: ActionLevel = level === 'more' ? 'base' : 'more';
    const prevSectionKey = `${stage}_${prevLevel}`;
    const prevSectionData = sectionStacks[prevSectionKey];

    if (prevSectionData && prevSectionData.updated) {
      players.forEach(p => {
        const prevStack = prevSectionData.updated[p.id];
        currentStacksForSection[p.id] = prevStack !== undefined ? prevStack : p.stack;
      });
    } else {
      players.forEach(p => {
        currentStacksForSection[p.id] = p.stack;
      });
    }
  } else {
    // Postflop base: Inherit from previous stage
    const stageOrder: Stage[] = ['preflop', 'flop', 'turn', 'river'];
    const currentIndex = stageOrder.indexOf(stage);

    if (currentIndex > 0) {
      const prevStage = stageOrder[currentIndex - 1];

      let prevSectionKey: string | null = null;

      if (sectionStacks[`${prevStage}_more2`]) {
        prevSectionKey = `${prevStage}_more2`;
      } else if (sectionStacks[`${prevStage}_more`]) {
        prevSectionKey = `${prevStage}_more`;
      } else if (sectionStacks[`${prevStage}_base`]) {
        prevSectionKey = `${prevStage}_base`;
      }

      if (prevSectionKey && sectionStacks[prevSectionKey]) {
        const prevSectionData = sectionStacks[prevSectionKey];

        players.forEach(p => {
          const prevStack = prevSectionData.updated ? prevSectionData.updated[p.id] : p.stack;
          currentStacksForSection[p.id] = prevStack !== undefined ? prevStack : p.stack;
        });
      } else {
        players.forEach(p => {
          currentStacksForSection[p.id] = p.stack;
        });
      }
    } else {
      players.forEach(p => {
        currentStacksForSection[p.id] = p.stack;
      });
    }
  }

  return currentStacksForSection;
}

/**
 * Calculate already contributed amounts for a section
 * Handles:
 * - Preflop base: Posted blinds
 * - More actions: Cumulative from all previous levels
 * - Postflop base: Start at 0
 */
export function calculateAlreadyContributed(
  players: Player[],
  playerData: PlayerData,
  stage: Stage,
  level: ActionLevel,
  contributedAmounts: ContributedAmounts
): { [playerId: number]: number } {
  const alreadyContributedAmounts: { [playerId: number]: number } = {};

  if (level === 'base') {
    if (stage === 'preflop') {
      // Preflop base: Posted blinds
      players.forEach(p => {
        const data = playerData[p.id] || {};
        const normalizedPosition = normalizePosition(p.position).toLowerCase();
        let contributed = 0;

        if (normalizedPosition === 'sb' && typeof data.postedSB === 'number') {
          contributed = data.postedSB;
        } else if (normalizedPosition === 'bb' && typeof data.postedBB === 'number') {
          contributed = data.postedBB;
        }

        alreadyContributedAmounts[p.id] = contributed;
      });
    } else {
      // Postflop base: Start at 0
      players.forEach(p => {
        alreadyContributedAmounts[p.id] = 0;
      });
    }
  } else {
    // More actions: Cumulative from all previous levels
    players.forEach(p => {
      alreadyContributedAmounts[p.id] = 0;
    });

    // For preflop, add posted blinds first
    if (stage === 'preflop') {
      players.forEach(p => {
        const data = playerData[p.id] || {};
        const normalizedPosition = normalizePosition(p.position).toLowerCase();

        if (normalizedPosition === 'sb' && typeof data.postedSB === 'number') {
          alreadyContributedAmounts[p.id] += data.postedSB;
        } else if (normalizedPosition === 'bb' && typeof data.postedBB === 'number') {
          alreadyContributedAmounts[p.id] += data.postedBB;
        }
      });
    }

    // Add contributions from all previous sections
    if (level === 'more') {
      // For more: add base section
      const baseKey = `${stage}_base`;
      if (contributedAmounts[baseKey]) {
        players.forEach(p => {
          const baseContrib = contributedAmounts[baseKey][p.id] || 0;
          if (baseContrib > 0) {
            alreadyContributedAmounts[p.id] += baseContrib;
          }
        });
      }
    } else if (level === 'more2') {
      // For more2: add base + more sections
      const baseKey = `${stage}_base`;
      const moreKey = `${stage}_more`;

      if (contributedAmounts[baseKey]) {
        players.forEach(p => {
          const baseContrib = contributedAmounts[baseKey][p.id] || 0;
          if (baseContrib > 0) {
            alreadyContributedAmounts[p.id] += baseContrib;
          }
        });
      }

      if (contributedAmounts[moreKey]) {
        players.forEach(p => {
          const moreContrib = contributedAmounts[moreKey][p.id] || 0;
          if (moreContrib > 0) {
            alreadyContributedAmounts[p.id] += moreContrib;
          }
        });
      }
    }
  }

  return alreadyContributedAmounts;
}

/**
 * Process a single section synchronously
 * Calculates stacks and contributions for all players in the section
 *
 * This is a pure function that returns the results.
 * Validation errors are returned in the result object.
 */
export function processStackSynchronous(
  stage: Stage,
  level: ActionLevel,
  players: Player[],
  currentSectionStacks: SectionStacks,
  currentPlayerData: PlayerData,
  currentContributedAmounts: ContributedAmounts,
  visibleActionLevels: { [stage: string]: ActionLevel[] },
  defaultUnit: ChipUnit = 'K'
): ProcessSectionResult | null {
  const suffix = level === 'base' ? '' : level === 'more' ? '_moreAction' : '_moreAction2';
  const sectionKey = `${stage}_${level}`;

  // Get active players
  const activePlayers = getActivePlayers(players, currentPlayerData, stage, level, visibleActionLevels);

  // Validation would happen here in the full version
  // For now, we'll skip detailed validation and assume data is valid

  // Calculate current stacks for this section
  const currentStacksForSection = calculateCurrentStacksForSection(
    players,
    currentPlayerData,
    stage,
    level,
    currentSectionStacks
  );

  // Track already contributed amounts
  const alreadyContributedAmounts = calculateAlreadyContributed(
    players,
    currentPlayerData,
    stage,
    level,
    currentContributedAmounts
  );

  // Process each player
  const updatedPlayerData = { ...currentPlayerData };
  const updatedStacksForSection: { [playerId: number]: number } = {};
  const newContributedAmounts: { [playerId: number]: number } = {};

  players.forEach(p => {
    newContributedAmounts[p.id] = 0;
  });

  let maxBetSoFar = 0;
  const allInPlayers: Array<{
    playerId: number;
    name: string;
    position: string;
    required?: number;
    available?: number;
  }> = [];

  // Initialize maxBetSoFar
  if (stage === 'preflop' && level === 'base') {
    const bbPlayer = players.find(p => normalizePosition(p.position).toLowerCase() === 'bb');
    if (bbPlayer) {
      const data = currentPlayerData[bbPlayer.id];
      if (data && typeof data.postedBB === 'number') {
        maxBetSoFar = data.postedBB;
      }
    }
  } else if (level === 'more' || level === 'more2') {
    // For more actions, get cumulative max
    const cumulativeTotals = Object.values(alreadyContributedAmounts).filter(v => v > 0);
    if (cumulativeTotals.length > 0) {
      maxBetSoFar = Math.max(...cumulativeTotals);
    }
  }

  // Process each active player
  activePlayers.forEach(player => {
    const data = currentPlayerData[player.id] || {};
    const actionKey = `${stage}${suffix}_action`;
    const action = data[actionKey];

    const currentStack = currentStacksForSection[player.id] || 0;

    let actualAmount = 0;

    if (action === 'call') {
      const alreadyContributed = alreadyContributedAmounts[player.id] || 0;
      const amountToCall = maxBetSoFar;
      const additionalNeeded = Math.max(0, amountToCall - alreadyContributed);

      let displayAmount: number;

      if (currentStack >= additionalNeeded) {
        displayAmount = amountToCall;
        actualAmount = additionalNeeded;
      } else {
        // Not enough chips - forced all-in
        displayAmount = alreadyContributed + currentStack;
        actualAmount = currentStack;

        if (!updatedPlayerData[player.id]) {
          updatedPlayerData[player.id] = {};
        }
        updatedPlayerData[player.id][actionKey] = 'all-in';

        allInPlayers.push({
          playerId: player.id,
          name: player.name,
          position: player.position,
          required: amountToCall,
          available: alreadyContributed + currentStack
        });
      }

      newContributedAmounts[player.id] = actualAmount;

      // Update display amount in player data
      const amountKey = `${stage}${suffix}_amount`;
      const unitKey = `${stage}${suffix}_unit`;
      const unit = currentPlayerData[player.id]?.[unitKey] || defaultUnit;

      let displayAmountFormatted: number;
      if (unit === 'K') {
        displayAmountFormatted = displayAmount / 1000;
      } else if (unit === 'Mil') {
        displayAmountFormatted = displayAmount / 1000000;
      } else {
        displayAmountFormatted = displayAmount;
      }

      if (!updatedPlayerData[player.id]) {
        updatedPlayerData[player.id] = {};
      }
      updatedPlayerData[player.id][amountKey] = displayAmountFormatted;

    } else if (action === 'bet' || action === 'raise') {
      const amountKey = `${stage}${suffix}_amount`;
      const amountInput = data[amountKey];
      const unitValue = data[`${stage}${suffix}_unit`];
      let unit: ChipUnit = defaultUnit;
      if (unitValue === 'K' || unitValue === 'Mil' || unitValue === 'actual') {
        unit = unitValue;
      }

      if (!amountInput || amountInput === '' || parseFloat(String(amountInput)) <= 0) {
        // Validation error - return null to indicate failure
        return null;
      }

      const newTotalBet = convertToActualValue(parseFloat(String(amountInput)), unit);
      const alreadyContributed = alreadyContributedAmounts[player.id] || 0;

      actualAmount = Math.max(0, newTotalBet - alreadyContributed);
      actualAmount = Math.min(actualAmount, currentStack);

      maxBetSoFar = Math.max(maxBetSoFar, newTotalBet);
      newContributedAmounts[player.id] = actualAmount;

    } else if (action === 'all-in') {
      actualAmount = currentStack;

      const alreadyContributed = alreadyContributedAmounts[player.id] || 0;
      const totalContribution = alreadyContributed + actualAmount;

      maxBetSoFar = Math.max(maxBetSoFar, totalContribution);
      newContributedAmounts[player.id] = actualAmount;

      // Update display amount
      const amountKey = `${stage}${suffix}_amount`;
      const unitKey = `${stage}${suffix}_unit`;
      const unit = currentPlayerData[player.id]?.[unitKey] || defaultUnit;

      let allInAmountFormatted: number;
      if (unit === 'K') {
        allInAmountFormatted = totalContribution / 1000;
      } else if (unit === 'Mil') {
        allInAmountFormatted = totalContribution / 1000000;
      } else {
        allInAmountFormatted = totalContribution;
      }

      if (!updatedPlayerData[player.id]) {
        updatedPlayerData[player.id] = {};
      }
      updatedPlayerData[player.id][amountKey] = allInAmountFormatted;

      allInPlayers.push({
        playerId: player.id,
        name: player.name,
        position: player.position
      });

    } else if (action === 'fold' || action === 'check') {
      actualAmount = 0;
    } else if (action === 'no action' || !action) {
      actualAmount = 0;
    }

    // Calculate updated stack
    const newStack = currentStack - actualAmount;
    updatedStacksForSection[player.id] = newStack;
  });

  return {
    updatedPlayerData: updatedPlayerData,
    updatedStacks: updatedStacksForSection,
    currentStacks: currentStacksForSection,
    contributedAmounts: newContributedAmounts,
    allInPlayers: allInPlayers
  };
}

/**
 * Process multiple sections in cascade order
 * This is the main orchestrator for processing a hand
 *
 * Returns all accumulated results that can be used to update state
 */
export function processStackCascade(
  targetStage: Stage,
  targetLevel: ActionLevel,
  players: Player[],
  playerData: PlayerData,
  visibleActionLevels: { [stage: string]: ActionLevel[] },
  defaultUnit: ChipUnit = 'K'
): ProcessCascadeResult {
  const stageOrder: Stage[] = ['preflop', 'flop', 'turn', 'river'];
  const levelOrder: ActionLevel[] = ['base', 'more', 'more2'];

  // Find target position
  const targetStageIndex = stageOrder.indexOf(targetStage);
  const targetLevelIndex = levelOrder.indexOf(targetLevel);

  // Build list of sections to process
  const sectionsToProcess: Array<{ stage: Stage; level: ActionLevel }> = [];

  for (let stageIdx = 0; stageIdx <= targetStageIndex; stageIdx++) {
    const stage = stageOrder[stageIdx];
    const maxLevel = stageIdx === targetStageIndex ? targetLevelIndex : 2;

    for (let levelIdx = 0; levelIdx <= maxLevel; levelIdx++) {
      const level = levelOrder[levelIdx];

      // Check if this section has data
      const suffix = level === 'base' ? '' : level === 'more' ? '_moreAction' : '_moreAction2';
      const hasData = players.some(p => {
        const data = playerData[p.id] || {};
        const actionKey = `${stage}${suffix}_action`;
        return data[actionKey] !== undefined && data[actionKey] !== '';
      });

      if (hasData || (stage === 'preflop' && level === 'base')) {
        sectionsToProcess.push({ stage, level });
      }
    }
  }

  // Initialize working copies
  const workingSectionStacks: SectionStacks = {};
  let workingPlayerData = { ...playerData };
  const workingContributedAmounts: ContributedAmounts = {};
  const workingProcessedSections: ProcessedSections = {};

  const allAllInPlayers: Array<{
    playerId: number;
    name: string;
    position: string;
    section: string;
    required?: number;
    available?: number;
  }> = [];

  // Process each section in order
  sectionsToProcess.forEach((section) => {
    const result = processStackSynchronous(
      section.stage,
      section.level,
      players,
      workingSectionStacks,
      workingPlayerData,
      workingContributedAmounts,
      visibleActionLevels,
      defaultUnit
    );

    if (result) {
      workingSectionStacks[`${section.stage}_${section.level}`] = {
        initial: result.currentStacks,
        current: result.currentStacks,
        updated: result.updatedStacks
      };
      workingPlayerData = result.updatedPlayerData;
      workingContributedAmounts[`${section.stage}_${section.level}`] = result.contributedAmounts;
      workingProcessedSections[`${section.stage}_${section.level}`] = true;

      // Collect all-in players
      if (result.allInPlayers && result.allInPlayers.length > 0) {
        result.allInPlayers.forEach(player => {
          allAllInPlayers.push({
            ...player,
            section: `${section.stage}_${section.level}`
          });
        });
      }
    }
  });

  return {
    sectionStacks: workingSectionStacks,
    playerData: workingPlayerData,
    contributedAmounts: workingContributedAmounts,
    processedSections: workingProcessedSections,
    allAllInPlayers: allAllInPlayers,
    sectionsProcessed: sectionsToProcess
  };
}
