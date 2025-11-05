/**
 * Stack Engine - Pure Functions for Stack Calculations
 *
 * Handles all stack-related calculations including:
 * - Current stack calculation
 * - Stack at section start
 * - Contribution tracking
 * - Posted blinds/antes handling
 *
 * All functions are pure (no side effects) and can be tested in isolation.
 */

import type {
  Player,
  PlayerData,
  Stage,
  ActionLevel,
  ActionSuffix,
  SectionKey,
  SectionStacks,
  ChipUnit,
  Position
} from '../../../types/poker';

/**
 * Convert action level to suffix format
 */
export function getLevelSuffix(level: ActionLevel): ActionSuffix {
  switch (level) {
    case 'base': return '';
    case 'more': return '_moreAction';
    case 'more2': return '_moreAction2';
  }
}

/**
 * Convert suffix to action level
 */
export function getSuffixLevel(suffix: ActionSuffix): ActionLevel {
  switch (suffix) {
    case '': return 'base';
    case '_moreAction': return 'more';
    case '_moreAction2': return 'more2';
  }
}

/**
 * Normalize position string to standard format
 * @param position - Raw position string (case-insensitive)
 * @returns Normalized position ('sb', 'bb', 'dealer', etc.)
 */
export function normalizePosition(position: string | Position): string {
  if (!position) return '';
  const pos = position.toLowerCase().trim();

  const positionMap: { [key: string]: string } = {
    'dealer': 'dealer',
    'btn': 'dealer',
    'button': 'dealer',
    'sb': 'sb',
    'small blind': 'sb',
    'bb': 'bb',
    'big blind': 'bb',
    'utg': 'utg',
    'under the gun': 'utg',
    'utg+1': 'utg+1',
    'utg1': 'utg+1',
    'utg+2': 'utg+2',
    'utg2': 'utg+2',
    'mp': 'mp',
    'middle position': 'mp',
    'mp+1': 'mp+1',
    'mp1': 'mp+1',
    'mp+2': 'mp+2',
    'mp2': 'mp+2',
    'co': 'co',
    'cutoff': 'co',
    'cut-off': 'co'
  };

  return positionMap[pos] || pos;
}

/**
 * Convert chip amount from formatted unit to actual value
 * @param amount - Amount in the specified unit
 * @param unit - 'K', 'Mil', or 'actual'
 * @returns Actual chip value
 */
export function convertToActualValue(amount: number, unit: ChipUnit): number {
  if (unit === 'K') return amount * 1000;
  else if (unit === 'Mil') return amount * 1000000;
  return amount;
}

/**
 * Calculate the current stack for a player at a specific section
 *
 * This is the main stack calculation function that determines what stack
 * to display based on whether the section has been processed or not.
 *
 * @param playerId - Player ID
 * @param players - Array of all players
 * @param playerData - All player data (actions, cards, etc.)
 * @param stage - Current stage ('preflop', 'flop', 'turn', 'river')
 * @param suffix - Action suffix ('', '_moreAction', '_moreAction2')
 * @param sectionStacks - Processed stack data for all sections
 * @param isProcessing - Whether stack processing is currently in progress
 * @param defaultUnit - Default chip unit
 * @returns Current stack value, or null if not yet calculated
 */
export function calculateCurrentStack(
  playerId: number,
  players: Player[],
  playerData: PlayerData,
  stage: Stage,
  suffix: ActionSuffix,
  sectionStacks: SectionStacks,
  isProcessing: boolean = false,
  defaultUnit: ChipUnit = 'K'
): number | null {
  const player = players.find(p => p.id === playerId);
  if (!player || !player.stack) return 0;

  // If currently processing, don't show cached data
  if (isProcessing) {
    return null;
  }

  // Build section key to match processStack format
  const level = getSuffixLevel(suffix);
  const sectionKey: SectionKey = `${stage}_${level}`;

  const processedStackData = sectionStacks[sectionKey];

  // If section has been processed, show the updated stack
  if (processedStackData) {
    // For all sections, show UPDATED (after actions)
    if (processedStackData.updated && processedStackData.updated[playerId] !== undefined) {
      return processedStackData.updated[playerId];
    }
    // Fallback to current if updated doesn't exist (shouldn't happen)
    if (processedStackData.current && processedStackData.current[playerId] !== undefined) {
      return processedStackData.current[playerId];
    }
  }

  // SPECIAL CASE: For SB/BB in preflop base, show stack after posting (even before processing)
  if (stage === 'preflop' && suffix === '') {
    const data = playerData[playerId] || {};
    const normalizedPosition = normalizePosition(player.position);

    // Only calculate for SB and BB
    if (normalizedPosition === 'sb' || normalizedPosition === 'bb') {
      let stackAfterPosting = player.stack;

      // Subtract posted amounts
      if (normalizedPosition === 'sb' && data.postedSB) {
        stackAfterPosting -= data.postedSB;
      }
      if (normalizedPosition === 'bb') {
        if (data.postedBB) {
          stackAfterPosting -= data.postedBB;
        }
        if (data.postedAnte) {
          stackAfterPosting -= data.postedAnte;
        }
      }

      return stackAfterPosting;
    }
  }

  // Section not processed yet - return null (show empty)
  return null;
}

/**
 * Calculate the stack at the start of a specific section
 *
 * This looks back to the previous section's updated stack to determine
 * what stack the player had at the start of the current section.
 *
 * @param playerId - Player ID
 * @param players - Array of all players
 * @param stage - Current stage
 * @param suffix - Action suffix
 * @param sectionStacks - Processed stack data
 * @param visibleActionLevels - Map of visible action levels per stage
 * @returns Stack at section start
 */
export function calculateStackAtSectionStart(
  playerId: number,
  players: Player[],
  stage: Stage,
  suffix: ActionSuffix,
  sectionStacks: SectionStacks,
  visibleActionLevels: { [stage: string]: ActionLevel[] }
): number {
  const player = players.find(p => p.id === playerId);
  if (!player || !player.stack) return 0;

  // Determine the previous section
  const stages: Stage[] = ['preflop', 'flop', 'turn', 'river'];
  const levels: ActionLevel[] = ['base', 'more', 'more2'];

  const currentStageIndex = stages.indexOf(stage);
  const currentLevel = getSuffixLevel(suffix);
  const currentLevelIndex = levels.indexOf(currentLevel);

  let prevSectionKey: SectionKey | null = null;

  // Check if there's a previous level in the current stage
  if (currentLevelIndex > 0) {
    const prevLevel = levels[currentLevelIndex - 1];
    prevSectionKey = `${stage}_${prevLevel}`;
  }
  // Check if there's a previous stage
  else if (currentStageIndex > 0) {
    const prevStage = stages[currentStageIndex - 1];
    // Find the last processed level in the previous stage
    const visibleLevels = visibleActionLevels[prevStage] || ['base'];
    const lastLevel = visibleLevels[visibleLevels.length - 1];
    prevSectionKey = `${prevStage}_${lastLevel}`;
  }

  // If no previous section, return initial stack
  if (!prevSectionKey) {
    return player.stack;
  }

  // Get the updated stack from the previous section
  const prevSectionData = sectionStacks[prevSectionKey];

  if (prevSectionData && prevSectionData.updated && prevSectionData.updated[playerId] !== undefined) {
    return prevSectionData.updated[playerId];
  }

  // If previous section not processed yet, return initial stack
  return player.stack;
}

/**
 * Calculate how much a player has already contributed in previous sections of the current stage
 *
 * This is used to determine the "additional" amount needed for calls/raises.
 * For example, if SB already posted 500 and the call is to 2000, they only need to add 1500.
 *
 * @param playerId - Player ID
 * @param players - Array of all players
 * @param playerData - All player data
 * @param stage - Current stage
 * @param suffix - Action suffix
 * @param defaultUnit - Default chip unit
 * @returns Total amount already contributed in current stage
 */
export function getAlreadyContributed(
  playerId: number,
  players: Player[],
  playerData: PlayerData,
  stage: Stage,
  suffix: ActionSuffix,
  defaultUnit: ChipUnit = 'K'
): number {
  const player = players.find(p => p.id === playerId);
  if (!player) return 0;

  const data = playerData[playerId] || {};
  const normalizedPosition = normalizePosition(player.position);

  let totalContributed = 0;

  // For preflop, include posted blinds/antes
  if (stage === 'preflop') {
    if (normalizedPosition === 'sb' && data.postedSB) {
      totalContributed += data.postedSB;
    }
    if (normalizedPosition === 'bb') {
      if (data.postedBB) {
        totalContributed += data.postedBB;
      }
      // Note: Ante is NOT included in "already contributed" for betting purposes
    }

    // Add preflop base action amount (if in more action)
    if (suffix === '_moreAction' || suffix === '_moreAction2') {
      const baseAmountValue = data.preflop_amount;
      if (baseAmountValue && (typeof baseAmountValue === 'string' || typeof baseAmountValue === 'number')) {
        const baseUnitValue = data.preflop_unit;
        const baseUnit = (typeof baseUnitValue === 'string' && (baseUnitValue === 'K' || baseUnitValue === 'Mil' || baseUnitValue === 'actual')) ? baseUnitValue : defaultUnit;
        totalContributed += convertToActualValue(parseFloat(String(baseAmountValue)), baseUnit);
      }
    }

    // Add more action 1 amount (if in more action 2)
    if (suffix === '_moreAction2') {
      const more1AmountValue = data.preflop_moreAction_amount;
      if (more1AmountValue && (typeof more1AmountValue === 'string' || typeof more1AmountValue === 'number')) {
        const more1UnitValue = data.preflop_moreAction_unit;
        const more1Unit = (typeof more1UnitValue === 'string' && (more1UnitValue === 'K' || more1UnitValue === 'Mil' || more1UnitValue === 'actual')) ? more1UnitValue : defaultUnit;
        totalContributed += convertToActualValue(parseFloat(String(more1AmountValue)), more1Unit);
      }
    }
  }

  // For postflop stages (flop/turn/river)
  else {
    // Add base action amount (if in more action)
    if (suffix === '_moreAction' || suffix === '_moreAction2') {
      const baseAmountValue = data[`${stage}_amount`];
      if (baseAmountValue && (typeof baseAmountValue === 'string' || typeof baseAmountValue === 'number')) {
        const baseUnitValue = data[`${stage}_unit`];
        const baseUnit = (typeof baseUnitValue === 'string' && (baseUnitValue === 'K' || baseUnitValue === 'Mil' || baseUnitValue === 'actual')) ? baseUnitValue : defaultUnit;
        totalContributed += convertToActualValue(parseFloat(String(baseAmountValue)), baseUnit);
      }
    }

    // Add more action 1 amount (if in more action 2)
    if (suffix === '_moreAction2') {
      const more1AmountValue = data[`${stage}_moreAction_amount`];
      if (more1AmountValue && (typeof more1AmountValue === 'string' || typeof more1AmountValue === 'number')) {
        const more1UnitValue = data[`${stage}_moreAction_unit`];
        const more1Unit = (typeof more1UnitValue === 'string' && (more1UnitValue === 'K' || more1UnitValue === 'Mil' || more1UnitValue === 'actual')) ? more1UnitValue : defaultUnit;
        totalContributed += convertToActualValue(parseFloat(String(more1AmountValue)), more1Unit);
      }
    }
  }

  return totalContributed;
}

/**
 * Calculate the "payoff amount" - how much a player actually needs to pay for an action
 *
 * This is the amount that gets subtracted from their stack.
 * For calls/raises, it's the (total amount - already contributed).
 * For bets/all-ins, it's the full amount.
 *
 * @param playerId - Player ID
 * @param players - Array of all players
 * @param playerData - All player data
 * @param stage - Current stage
 * @param suffix - Action suffix
 * @param defaultUnit - Default chip unit
 * @returns Amount to subtract from stack
 */
export function getPayoffAmount(
  playerId: number,
  players: Player[],
  playerData: PlayerData,
  stage: Stage,
  suffix: ActionSuffix,
  defaultUnit: ChipUnit = 'K'
): number {
  const data = playerData[playerId] || {};

  const actionKey = `${stage}${suffix}_action`;
  const amountKey = `${stage}${suffix}_amount`;
  const unitKey = `${stage}${suffix}_unit`;

  const action = data[actionKey];
  const amountValue = data[amountKey];
  const amountStr = (typeof amountValue === 'string' || typeof amountValue === 'number') ? String(amountValue) : '';
  const unitValue = data[unitKey];
  const unit = (typeof unitValue === 'string' && (unitValue === 'K' || unitValue === 'Mil' || unitValue === 'actual')) ? unitValue : defaultUnit;

  // No amount specified
  if (!amountStr || amountStr === '' || amountStr === '0') {
    return 0;
  }

  const amount = parseFloat(amountStr);
  const amountInActual = convertToActualValue(amount, unit);

  // Get already contributed in this stage
  const alreadyContributed = getAlreadyContributed(
    playerId,
    players,
    playerData,
    stage,
    suffix,
    defaultUnit
  );

  // For calls and raises, subtract what was already contributed
  if (action === 'call' || action === 'raise') {
    return Math.max(amountInActual - alreadyContributed, 0);
  }

  // For bets, all-in, and other actions, use the full amount
  return amountInActual;
}

/**
 * Check if a player has folded in any section up to (but not including) the current section
 *
 * @param playerId - Player ID
 * @param playerData - All player data
 * @param currentStage - Current stage
 * @param currentLevel - Current level
 * @returns true if player has folded
 */
export function hasPlayerFolded(
  playerId: number,
  playerData: PlayerData,
  currentStage: Stage,
  currentLevel: ActionLevel
): boolean {
  const data = playerData[playerId] || {};
  const stages: Stage[] = ['preflop', 'flop', 'turn', 'river'];
  const levels: ActionLevel[] = ['base', 'more', 'more2'];

  const currentStageIndex = stages.indexOf(currentStage);
  const currentLevelIndex = levels.indexOf(currentLevel);

  // Check all previous stages
  for (let i = 0; i < currentStageIndex; i++) {
    const stage = stages[i];
    // Check all levels in previous stages
    if (data[`${stage}_action`] === 'fold') return true;
    if (data[`${stage}_moreAction_action`] === 'fold') return true;
    if (data[`${stage}_moreAction2_action`] === 'fold') return true;
  }

  // Check previous levels in current stage
  for (let i = 0; i < currentLevelIndex; i++) {
    const level = levels[i];
    const suffix = getLevelSuffix(level);
    if (data[`${currentStage}${suffix}_action`] === 'fold') return true;
  }

  return false;
}

/**
 * Get all active players for a specific section (players who haven't folded)
 *
 * @param players - Array of all players
 * @param playerData - All player data
 * @param stage - Stage to check
 * @param level - Level to check
 * @returns Array of active players
 */
export function getActivePlayersForSection(
  players: Player[],
  playerData: PlayerData,
  stage: Stage,
  level: ActionLevel
): Player[] {
  return players.filter(player => {
    if (!player.name) return false;
    return !hasPlayerFolded(player.id, playerData, stage, level);
  });
}
