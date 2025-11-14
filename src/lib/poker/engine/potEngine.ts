/**
 * @deprecated This file is deprecated. Use potCalculationEngine.ts instead.
 *
 * This file will be removed in a future version.
 * All new code should use potCalculationEngine.ts.
 *
 * Migration:
 * - Helper functions moved to src/lib/poker/utils/playerActionUtils.ts
 * - Main pot calculation functions available in potCalculationEngine.ts
 * - checkBettingRoundStatus() and getPreviousRoundInfo() now in potCalculationEngine.ts
 *
 * Migration date: 2025-11-14
 * Target removal: Next major version
 *
 * ---
 *
 * Pot Engine
 * Pure functions for pot calculations in poker
 *
 * This module handles:
 * - Gathering contributions from players across betting rounds
 * - Calculating dead money (ante, folded blinds, folded bets)
 * - Creating main pot and side pots based on all-ins
 * - Tracking betting round completion status
 * - Previous round information for UI display
 */

import type {
  Contribution,
  ContributedAmounts,
  DeadMoney,
  Pot,
  PotStructure,
  PreviousRoundInfo,
  BettingRoundStatus,
  PotPlayer
} from '../../../types/poker/pot.types';
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
import { convertToActualValue } from '../../poker/utils/formatUtils';

/**
 * Helper: Get the last action taken by a player in a betting round
 * Used to determine if a player has folded
 */
export function getLastActionInBettingRound(
  playerId: number,
  stage: Stage,
  playerData: PlayerData
): string | null {
  const data = playerData[playerId] || {};

  // Check sections in reverse order: more2 -> more -> base
  const more2Action = data[`${stage}_moreAction2_action`];
  if (more2Action && typeof more2Action === 'string' && more2Action !== 'no action') {
    return more2Action;
  }

  const moreAction = data[`${stage}_moreAction_action`];
  if (moreAction && typeof moreAction === 'string' && moreAction !== 'no action') {
    return moreAction;
  }

  const baseAction = data[`${stage}_action`];
  if (baseAction && typeof baseAction === 'string' && baseAction !== 'no action') {
    return baseAction;
  }

  return null;
}

/**
 * Check if player folded in current stage or any previous stage
 * This is critical for pot calculations in later streets
 */
export function hasPlayerFolded(
  playerId: number,
  currentStage: Stage,
  playerData: PlayerData
): boolean {
  const stageOrder: Stage[] = ['preflop', 'flop', 'turn', 'river'];
  const currentIndex = stageOrder.indexOf(currentStage);

  // Check all stages up to and including current stage
  for (let i = 0; i <= currentIndex; i++) {
    const stageToCheck = stageOrder[i];
    const lastAction = getLastActionInBettingRound(playerId, stageToCheck, playerData);

    // 🔥 SPECIAL CASE: In preflop, "none" or null action = auto-fold
    if (stageToCheck === 'preflop') {
      if (lastAction === null || lastAction === 'none' || lastAction === 'no action') {
        return true; // Auto-folded in preflop
      }
    }

    // If player explicitly folded in any stage, they're out
    if (lastAction === 'fold') {
      return true;
    }
  }

  return false;
}

/**
 * Step 1: Gather contributions from all players for a betting round
 *
 * This function collects all contributions from players across multiple action levels
 * (base, more, more2) within a single betting stage (preflop/flop/turn/river).
 *
 * Special handling:
 * - Preflop blinds (SB/BB) are added as posted amounts
 * - BB's ante is tracked separately (dead money)
 * - When onlyCurrentSection=true, only gathers from the specified level (for carry-forward scenarios)
 *
 * @param stage - The betting stage (preflop, flop, turn, river)
 * @param level - The action level to gather up to (base, more, more2)
 * @param players - Array of all players
 * @param playerData - All player action data
 * @param contributedAmounts - Contributions by section and player
 * @param processedSections - Which sections have been processed
 * @param sectionStacks - Stack information for each processed section
 * @param stackData - Game configuration (blinds, antes, etc.)
 * @param onlyCurrentSection - If true, only gather from current level (prevents double-counting)
 * @returns Array of player contributions
 */
export function gatherContributions(
  stage: Stage,
  level: ActionLevel,
  players: Player[],
  playerData: PlayerData,
  contributedAmounts: ContributedAmounts,
  processedSections: ProcessedSections,
  sectionStacks: SectionStacks,
  stackData: GameConfig,
  onlyCurrentSection: boolean = false
): Contribution[] {
  const contributions: Contribution[] = [];

  // Section keys for this betting round
  const baseSectionKey = `${stage}_base`;
  const more1SectionKey = `${stage}_more`;
  const more2SectionKey = `${stage}_more2`;

  // Determine which sections to include based on level parameter
  // If onlyCurrentSection=true, ONLY include the current level's section
  const includeSections = onlyCurrentSection
    ? {
        base: level === 'base',
        more: level === 'more',
        more2: level === 'more2'
      }
    : {
        base: level === 'base' || level === 'more' || level === 'more2',
        more: level === 'more' || level === 'more2',
        more2: level === 'more2'
      };

  players.forEach(player => {
    if (!player.name) return; // Skip empty player slots

    const data = playerData[player.id] || {};
    const position = player.position.toLowerCase();

    let totalContributed = 0;
    let postedSB = 0;
    let postedBB = 0;
    let postedAnte = 0;

    // For preflop, track posted amounts (blinds/ante) - only in base level
    // Don't add to totalContributed yet - will be added based on fold/stay status
    if (stage === 'preflop' && includeSections.base) {
      if (position === 'sb') {
        postedSB = data.postedSB || 0;
      }

      if (position === 'bb') {
        postedAnte = data.postedAnte || 0;
        postedBB = data.postedBB || 0;
      }
    }

    // Add contributions from base section (if included)
    // CRITICAL: contributedAmounts[base] contains ONLY additional action beyond posted blinds
    if (includeSections.base && processedSections[baseSectionKey]) {
      const baseContrib = contributedAmounts[baseSectionKey]?.[player.id] || 0;
      totalContributed += baseContrib;
    }

    // Add contributions from more action 1 (if included)
    if (includeSections.more && processedSections[more1SectionKey]) {
      const more1Contrib = contributedAmounts[more1SectionKey]?.[player.id] || 0;
      totalContributed += more1Contrib;
    }

    // Add contributions from more action 2 (if included)
    if (includeSections.more2 && processedSections[more2SectionKey]) {
      const more2Contrib = contributedAmounts[more2SectionKey]?.[player.id] || 0;
      totalContributed += more2Contrib;
    }

    // Check if player folded
    const isFolded = hasPlayerFolded(player.id, stage, playerData);

    // Add blind contributions (NOT ante - that's dead money)
    // contributedAmounts contains ADDITIONAL amount beyond posted blinds
    // So we need to add the posted blind to get the total contribution
    if (stage === 'preflop' && includeSections.base) {
      console.log(`   🎲 [potEngine] ${player.name} preflop blind handling:`);
      console.log(`      - Base contribution from actions: ${contributedAmounts[baseSectionKey]?.[player.id] || 0}`);
      console.log(`      - Posted SB: ${postedSB}`);
      console.log(`      - Posted BB: ${postedBB}`);
      console.log(`      - Posted Ante: ${postedAnte}`);
      console.log(`      - Is folded: ${isFolded}`);
      console.log(`      - Total contributed before blinds: ${totalContributed}`);

      if (postedSB > 0) {
        totalContributed += postedSB;
        console.log(`      ✅ Added SB ${postedSB} → totalContributed now: ${totalContributed}`);
      }
      if (postedBB > 0) {
        totalContributed += postedBB;
        console.log(`      ✅ Added BB ${postedBB} → totalContributed now: ${totalContributed}`);
      }
      if (postedAnte > 0) {
        console.log(`      ⚠️ Ante ${postedAnte} NOT added (dead money, handled separately)`);
      }
    }

    // Get current stack from latest processed section
    let currentStack = player.stack;
    const sectionKeys = [baseSectionKey, more1SectionKey, more2SectionKey];
    for (let i = sectionKeys.length - 1; i >= 0; i--) {
      if (processedSections[sectionKeys[i]] && sectionStacks[sectionKeys[i]]) {
        // sectionStacks has structure: { current: {...}, updated: {...} }
        // We want the "updated" stack after the section was processed
        const stackInfo = sectionStacks[sectionKeys[i]].updated?.[player.id];
        if (stackInfo !== undefined) {
          currentStack = stackInfo;
          break;
        }
      }
    }

    const isAllIn = currentStack <= 0;

    const contrib: Contribution = {
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      totalContributed: totalContributed,
      contributions: {
        base: contributedAmounts[baseSectionKey]?.[player.id] || 0,
        more: contributedAmounts[more1SectionKey]?.[player.id] || 0,
        more2: contributedAmounts[more2SectionKey]?.[player.id] || 0
      },
      postedSB: postedSB,
      postedBB: postedBB,
      postedAnte: postedAnte,
      isFolded: isFolded,
      isAllIn: isAllIn,
      currentStack: Math.max(0, currentStack)
    };

    console.log(`   📊 [potEngine] ${player.name} final contribution: ${totalContributed} (folded: ${isFolded})`);

    contributions.push(contrib);
  });

  return contributions;
}

/**
 * Step 2: Calculate dead money (ante + folded blinds + folded bets)
 *
 * Dead money is money in the pot that cannot be won back by the player who contributed it.
 * This includes:
 * - Antes (always dead, typically posted by BB)
 * - Blinds from folded players (SB/BB who folded)
 * - Bets from folded players (any additional bets beyond blinds)
 *
 * @param stage - The betting stage
 * @param contributions - Array of player contributions
 * @returns Breakdown of dead money components
 */
export function calculateDeadMoney(
  stage: Stage,
  contributions: Contribution[]
): DeadMoney {
  let anteAmount = 0;
  let foldedBlinds = 0;
  let foldedBets = 0;

  contributions.forEach((c: Contribution) => {
    // Ante is always dead (for BB player in preflop)
    if (stage === 'preflop') {
      anteAmount += c.postedAnte;

      // If SB or BB folded, their blind becomes dead
      if (c.isFolded) {
        const position = c.position.toLowerCase();
        if (position === 'sb') {
          foldedBlinds += c.postedSB;
        }
        if (position === 'bb') {
          foldedBlinds += c.postedBB;
        }
      }
    }

    // Any bets from folded players are dead
    if (c.isFolded && c.totalContributed > 0) {
      // For preflop, subtract already counted blinds AND ante
      if (stage === 'preflop') {
        const position = c.position.toLowerCase();
        let alreadyCounted = c.postedAnte; // Start with ante

        if (position === 'sb') alreadyCounted += c.postedSB;
        if (position === 'bb') alreadyCounted += c.postedBB;

        const additionalBets = Math.max(0, c.totalContributed - alreadyCounted);
        if (additionalBets > 0) {
          foldedBets += additionalBets;
        }
      } else {
        foldedBets += c.totalContributed;
      }
    }
  });

  const total = anteAmount + foldedBlinds + foldedBets;

  console.log(`   💀 [calculateDeadMoney] Dead money breakdown:`);
  console.log(`      - Ante: ${anteAmount}`);
  console.log(`      - Folded blinds: ${foldedBlinds}`);
  console.log(`      - Folded bets: ${foldedBets}`);
  console.log(`      - Total dead money: ${total}`);

  return {
    total: total,
    ante: anteAmount,
    foldedBlinds: foldedBlinds,
    foldedBets: foldedBets
  };
}

/**
 * Get previous round information for a player
 * Used to display betting history in the pot display UI
 *
 * @param playerId - The player ID to look up
 * @param currentStage - Current betting stage
 * @param currentLevel - Current action level
 * @param playerData - All player action data
 * @param defaultUnit - Default unit for amount conversion
 * @returns Previous round info or null if not found
 */
export function getPreviousRoundInfo(
  playerId: number,
  currentStage: Stage,
  currentLevel: ActionLevel,
  playerData: PlayerData,
  defaultUnit: ChipUnit = 'K'
): PreviousRoundInfo {
  try {
    // Define the order of sections
    const sectionOrder = [
      'preflop_base', 'preflop_more', 'preflop_more2',
      'flop_base', 'flop_more', 'flop_more2',
      'turn_base', 'turn_more', 'turn_more2',
      'river_base', 'river_more', 'river_more2'
    ];

    // Map level names to section keys
    const levelToKey: Record<ActionLevel, string> = {
      'base': 'base',
      'more': 'more',
      'more2': 'more2'
    };

    const currentSectionKey = `${currentStage}_${levelToKey[currentLevel] || currentLevel}`;
    const currentIndex = sectionOrder.indexOf(currentSectionKey);

    if (currentIndex <= 0) {
      return null; // No previous round
    }

    // Look backwards to find the most recent action by this player
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevSectionKey = sectionOrder[i];
      const [prevStage, prevLevelRaw] = prevSectionKey.split('_');
      const prevLevel: ActionLevel = prevLevelRaw === 'base' ? 'base' :
                        prevLevelRaw === 'more' ? 'more' : 'more2';

      // Map level to suffix for data keys
      const suffix = prevLevel === 'base' ? '' :
                     prevLevel === 'more' ? '_moreAction' : '_moreAction2';

      const actionKey = `${prevStage}${suffix}_action`;
      const amountKey = `${prevStage}${suffix}_amount`;
      const unitKey = `${prevStage}${suffix}_unit`;

      // Check if player has action data for this section
      const prevAction = playerData[playerId]?.[actionKey];

      if (prevAction && typeof prevAction === 'string' && prevAction !== 'no action' && prevAction !== '') {
        // Found a previous action!
        const amountValue = playerData[playerId]?.[amountKey];
        const amount = typeof amountValue === 'number' ? amountValue : 0;
        const unitValue = playerData[playerId]?.[unitKey];
        let unit: ChipUnit = defaultUnit;
        if (unitValue === 'K' || unitValue === 'Mil' || unitValue === 'actual') {
          unit = unitValue;
        }
        const actualAmount = convertToActualValue(amount, unit);

        const prevInfo: PreviousRoundInfo = {
          stageName: prevStage.toUpperCase(),
          levelName: prevLevel === 'base' ? 'BASE' :
                    prevLevel === 'more' ? 'MORE ACTION 1' : 'MORE ACTION 2',
          action: prevAction.charAt(0).toUpperCase() + prevAction.slice(1), // Capitalize
          amount: actualAmount,
          sectionKey: prevSectionKey
        };

        return prevInfo;
      }
    }

    return null; // No previous action found
  } catch (error) {
    console.error(`Error in getPreviousRoundInfo:`, error);
    return null; // Return null on error to avoid breaking pot calculation
  }
}

/**
 * Step 3: Create pots (main pot + side pots)
 *
 * This is the core pot-splitting algorithm. It handles:
 * - Simple case: No all-ins → single main pot
 * - Complex case: Multiple all-ins → main pot + side pots
 *
 * Algorithm for side pots:
 * 1. Sort players by contribution amount (ascending)
 * 2. For each unique contribution level:
 *    - Create a pot at that level
 *    - Include all players at or above that level
 *    - Exclude players below that level
 * 3. Add dead money to main pot (pot 0)
 * 4. Add previous street pot to main pot
 *
 * @param contributions - Array of player contributions
 * @param deadMoney - Dead money breakdown
 * @param previousStreetPot - Amount from previous betting round
 * @param stage - Current betting stage
 * @param level - Current action level
 * @param playerData - All player action data
 * @param defaultUnit - Default unit for amount conversion
 * @returns Complete pot structure
 */
export function createPots(
  contributions: Contribution[],
  deadMoney: DeadMoney,
  previousStreetPot: number,
  stage: Stage,
  level: ActionLevel,
  playerData: PlayerData,
  defaultUnit: ChipUnit = 'K'
): Omit<PotStructure, 'bettingRoundStatus'> {
  // Filter to active players only (not folded)
  const activePlayers = contributions.filter(c => !c.isFolded);

  if (activePlayers.length === 0) {
    // Everyone folded - only dead money
    return {
      mainPot: {
        potNumber: 0,
        amount: deadMoney.total,
        percentage: 100,
        cappedAt: 0,
        eligiblePlayers: [],
        excludedPlayers: []
      },
      sidePots: [],
      totalPot: deadMoney.total,
      deadMoney: deadMoney.total,
      deadMoneyBreakdown: deadMoney,
      hasZeroContributor: false,
      zeroContributors: []
    };
  }

  // Sort by contribution (ascending)
  const sortedPlayers = [...activePlayers].sort((a, b) =>
    a.totalContributed - b.totalContributed
  );

  const pots: Pot[] = [];
  let previousCap = 0;

  // Check for players with 0 contribution (Ante First, BB < Ante)
  const zeroContributors = sortedPlayers.filter(p => p.totalContributed === 0);
  const hasZeroContributor = zeroContributors.length > 0;

  // Find all all-in players
  const allInPlayers = sortedPlayers.filter(p => p.isAllIn);

  if (allInPlayers.length === 0) {
    // NO ALL-INS: Everything goes to main pot (simple case)
    const totalContributions = sortedPlayers.reduce((sum, p) => sum + p.totalContributed, 0);

    console.log(`   🎰 [createPots] No all-ins - creating main pot:`);
    console.log(`      - Total contributions: ${totalContributions}`);
    console.log(`      - Dead money: ${deadMoney.total}`);
    console.log(`      - Previous street pot: ${previousStreetPot}`);
    console.log(`      - Main pot amount: ${totalContributions + deadMoney.total + previousStreetPot}`);

    pots.push({
      potNumber: 0,
      amount: totalContributions,
      percentage: 0, // Will be calculated later
      cappedAt: Math.max(...sortedPlayers.map(p => p.totalContributed)),
      eligiblePlayers: sortedPlayers.map(p => {
        const previousRoundInfo = getPreviousRoundInfo(p.playerId, stage, level, playerData, defaultUnit);
        return {
          id: p.playerId,
          name: p.playerName,
          position: p.position,
          contribution: p.totalContributed,
          totalContribution: p.totalContributed,
          isAllIn: p.isAllIn,
          previousRound: previousRoundInfo
        };
      }),
      excludedPlayers: []
    });
  } else {
    // HAS ALL-INS: Create pots at each all-in level
    // Create pots at each contribution level
    sortedPlayers.forEach((player, index) => {
      const currentCap = player.totalContributed;

      // Skip if same as previous (already in same pot) AND not creating a pot
      if (currentCap === previousCap && index > 0) {
        return;
      }

      // Create a new pot if:
      // 1. This is the first player (main pot), OR
      // 2. This player's contribution is DIFFERENT from previous cap (level change)
      const isFirstPlayer = index === 0;
      const hasLevelChange = currentCap > previousCap;
      const hasPlayersRemaining = index < sortedPlayers.length;

      const shouldCreatePot = isFirstPlayer || (hasLevelChange && hasPlayersRemaining);

      if (shouldCreatePot) {
        // Players at this level and above
        const playersAtThisLevel = sortedPlayers.slice(index);

        // Amount per player for this pot level
        const contributionPerPlayer = currentCap - previousCap;
        const potAmount = contributionPerPlayer * playersAtThisLevel.length;

        // Determine excluded players (below this level)
        const excludedPlayers: PotPlayer[] = sortedPlayers.slice(0, index).map(p => ({
          id: p.playerId,
          name: p.playerName,
          position: p.position,
          contribution: p.totalContributed,
          totalContribution: p.totalContributed,
          reason: p.isAllIn
            ? `All-in at ${p.totalContributed}`
            : `Contributed only ${p.totalContributed}`
        }));

        const pot: Pot = {
          potNumber: pots.length,
          amount: potAmount,
          percentage: 0, // Will be calculated later
          cappedAt: currentCap,
          eligiblePlayers: playersAtThisLevel.map(p => {
            const previousRoundInfo = getPreviousRoundInfo(p.playerId, stage, level, playerData, defaultUnit);
            return {
              id: p.playerId,
              name: p.playerName,
              position: p.position,
              contribution: contributionPerPlayer, // Contribution to THIS pot only
              totalContribution: p.totalContributed, // Total contribution for the round
              isAllIn: p.isAllIn,
              previousRound: previousRoundInfo
            };
          }),
          excludedPlayers: excludedPlayers
        };

        pots.push(pot);
      }

      // Always update previousCap
      previousCap = currentCap;
    });
  }

  // Add dead money to main pot (index 0)
  if (pots.length > 0) {
    pots[0].amount += deadMoney.total;

    // Add previous street pot
    if (previousStreetPot > 0) {
      pots[0].amount += previousStreetPot;
    }
  } else {
    // Edge case: only dead money
    pots.push({
      potNumber: 0,
      amount: deadMoney.total + previousStreetPot,
      percentage: 0,
      cappedAt: 0,
      eligiblePlayers: activePlayers.map(p => {
        const previousRoundInfo = getPreviousRoundInfo(p.playerId, stage, level, playerData, defaultUnit);
        return {
          id: p.playerId,
          name: p.playerName,
          position: p.position,
          contribution: p.totalContributed,
          totalContribution: p.totalContributed,
          previousRound: previousRoundInfo
        };
      }),
      excludedPlayers: []
    });
  }

  // Calculate total pot
  const totalContributions = sortedPlayers.reduce((sum, p) => sum + p.totalContributed, 0);
  const totalPot = totalContributions + deadMoney.total + previousStreetPot;

  console.log(`   💰 [createPots] FINAL POT CALCULATION:`);
  console.log(`      - Total contributions from active players: ${totalContributions}`);
  console.log(`      - Dead money total: ${deadMoney.total}`);
  console.log(`      - Previous street pot: ${previousStreetPot}`);
  console.log(`      - TOTAL POT: ${totalPot}`);
  console.log(`      - Active players breakdown:`);
  sortedPlayers.forEach(p => {
    console.log(`        * ${p.playerName}: ${p.totalContributed}`);
  });

  // Calculate percentages
  pots.forEach(pot => {
    pot.percentage = totalPot > 0 ? (pot.amount / totalPot) * 100 : 0;
  });

  // Main pot is first, side pots are rest
  const mainPot = pots[0];
  const sidePots = pots.slice(1);

  return {
    mainPot: mainPot,
    sidePots: sidePots,
    totalPot: totalPot,
    deadMoney: deadMoney.total,
    deadMoneyBreakdown: deadMoney,
    hasZeroContributor: hasZeroContributor,
    zeroContributors: zeroContributors.map(p => ({
      id: p.playerId,
      name: p.playerName,
      position: p.position,
      contribution: 0,
      totalContribution: 0
    }))
  };
}

/**
 * Check if betting round is complete or if action is still pending
 *
 * A betting round is complete when:
 * - All players have folded
 * - Only one player remains
 * - All active players have acted and contributions are equal (or all-in)
 *
 * @param contributions - Array of player contributions
 * @returns Betting round completion status
 */
export function checkBettingRoundStatus(
  contributions: Contribution[]
): BettingRoundStatus {
  const activePlayers = contributions.filter(c => !c.isFolded);

  if (activePlayers.length === 0) {
    return { complete: true, reason: 'All players folded', pendingPlayers: [] };
  }

  if (activePlayers.length === 1) {
    return { complete: true, reason: 'Only one player remaining', pendingPlayers: [] };
  }

  // Check if all non-all-in players have matching contributions
  const nonAllInPlayers = activePlayers.filter(p => !p.isAllIn);

  if (nonAllInPlayers.length === 0) {
    // All remaining players are all-in
    return { complete: true, reason: 'All remaining players are all-in', pendingPlayers: [] };
  }

  // Check if all non-all-in players have the same contribution
  const maxContribution = Math.max(...nonAllInPlayers.map(p => p.totalContributed));
  const allMatched = nonAllInPlayers.every(p => p.totalContributed === maxContribution);

  if (allMatched) {
    return { complete: true, reason: 'All active players have matched bets', pendingPlayers: [] };
  }

  // Identify pending players
  const pendingPlayers = nonAllInPlayers
    .filter(p => p.totalContributed < maxContribution)
    .map(p => p.playerName);

  return {
    complete: false,
    reason: 'Action pending from some players',
    pendingPlayers: pendingPlayers
  };
}

/**
 * Main orchestrator: Calculate pots for a betting round
 *
 * This is the main entry point for pot calculations. It:
 * 1. Gathers contributions from all players
 * 2. Checks betting round status
 * 3. Calculates dead money
 * 4. Creates pots (main + side pots)
 * 5. Returns complete pot structure
 *
 * @param stage - Betting stage
 * @param level - Action level
 * @param players - Array of all players
 * @param playerData - All player action data
 * @param contributedAmounts - Contributions by section and player
 * @param processedSections - Which sections have been processed
 * @param sectionStacks - Stack information for each processed section
 * @param stackData - Game configuration
 * @param previousStreetPot - Amount from previous betting round
 * @param defaultUnit - Default unit for amount conversion
 * @returns Complete pot structure with betting round status
 */
export function calculatePotsForBettingRound(
  stage: Stage,
  level: ActionLevel,
  players: Player[],
  playerData: PlayerData,
  contributedAmounts: ContributedAmounts,
  processedSections: ProcessedSections,
  sectionStacks: SectionStacks,
  stackData: GameConfig,
  previousStreetPot: number = 0,
  defaultUnit: ChipUnit = 'K'
): PotStructure | null {
  try {
    // When previousStreetPot > 0, only gather contributions from CURRENT section
    // This prevents double-counting contributions that are already in the carried pot
    const onlyCurrentSection = previousStreetPot > 0;

    // Step 1: Gather contributions UP TO this level
    const contributions = gatherContributions(
      stage,
      level,
      players,
      playerData,
      contributedAmounts,
      processedSections,
      sectionStacks,
      stackData,
      onlyCurrentSection
    );

    // Step 1.5: Check if betting round is complete
    const roundStatus = checkBettingRoundStatus(contributions);

    // Step 2: Calculate dead money
    const deadMoney = calculateDeadMoney(stage, contributions);

    // Step 3: Create pots
    const potInfo = createPots(
      contributions,
      deadMoney,
      previousStreetPot,
      stage,
      level,
      playerData,
      defaultUnit
    );

    // Add betting round status to pot info
    const completeStructure: PotStructure = {
      ...potInfo,
      bettingRoundStatus: roundStatus
    };

    return completeStructure;
  } catch (error) {
    console.error(`Error calculating pots for ${stage}:`, error);
    return null;
  }
}

// Re-export types for convenience
export type {
  PotStructure,
  BettingRoundStatus,
  Contribution,
  DeadMoney,
  Pot,
  PotPlayer,
  PreviousRoundInfo
} from '../../../types/poker/pot.types';
