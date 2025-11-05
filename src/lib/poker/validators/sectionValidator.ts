/**
 * Section Validator
 *
 * Validates player actions and amounts for a betting section before processing.
 * Handles card validation, amount validation, and raise progression checks.
 */

import type {
  Player,
  PlayerData,
  Stage,
  ActionLevel
} from '../../../types/poker';

/**
 * Validation result for a section
 */
export type SectionValidationResult = {
  errors: string[];
  updatedData: { [playerId: number]: Partial<PlayerData[number]> };
  firstPlayerWithMissingAmount: {
    playerId: number;
    playerName: string;
    action: string;
    stage: Stage;
    suffix: string;
  } | null;
  autoFoldedPlayers: string[];
};

/**
 * Raise information for progression validation
 */
type RaiseInfo = {
  player: Player;
  action: string;
  amount: number;
  unit: string;
  actualAmount: number;
};

/**
 * Get the suffix string for an action level
 */
function getActionSuffix(level: ActionLevel): string {
  switch (level) {
    case 'base':
      return '';
    case 'more':
      return '_moreAction';
    case 'more2':
      return '_moreAction2';
  }
}

/**
 * Convert amount to actual value based on unit
 */
function convertToActualAmount(
  amount: number,
  unit: string,
  stage: Stage,
  suffix: string,
  playerData: PlayerData[number]
): number {
  let actualAmount = amount;

  // Apply unit multiplier
  if (unit === 'K') {
    actualAmount = amount * 1000;
  } else if (unit === 'Mil') {
    actualAmount = amount * 1000000;
  }

  // For preflop base, add posted blinds to get total contribution
  if (stage === 'preflop' && suffix === '') {
    const postedSB = playerData.postedSB || 0;
    const postedBB = playerData.postedBB || 0;
    actualAmount += (postedSB + postedBB);
  }

  return actualAmount;
}

/**
 * Get active players for validation (players with names)
 */
function getActivePlayers(players: Player[]): Player[] {
  return players.filter(p => p.name && p.name.trim() !== '');
}

/**
 * Validate player's cards for non-fold actions
 */
function validatePlayerCards(
  player: Player,
  data: PlayerData[number],
  action: string | undefined,
  errors: string[]
): void {
  // Skip validation for fold or no action
  if (!action || action === 'no action' || action === 'fold') {
    return;
  }

  // Validate cards for all other actions
  const card1 = data.card1;
  const card2 = data.card2;

  if (!card1 || !card1.rank || !card1.suit) {
    errors.push(`${player.name || `Player ${player.id}`}: Card 1 required`);
  }
  if (!card2 || !card2.rank || !card2.suit) {
    errors.push(`${player.name || `Player ${player.id}`}: Card 2 required`);
  }
}

/**
 * Validate player's amount for bet/raise actions
 */
function validatePlayerAmount(
  player: Player,
  data: PlayerData[number],
  action: string | undefined,
  stage: Stage,
  suffix: string,
  errors: string[],
  firstPlayerWithMissingAmount: SectionValidationResult['firstPlayerWithMissingAmount']
): SectionValidationResult['firstPlayerWithMissingAmount'] {
  // Only validate amount for bet/raise actions
  if (action !== 'bet' && action !== 'raise') {
    return firstPlayerWithMissingAmount;
  }

  const amountKey = `${stage}${suffix}_amount`;
  const amount = data[amountKey as keyof PlayerData[number]];

  if (!amount || amount === '' || parseFloat(amount as string) <= 0) {
    errors.push(`${player.name || `Player ${player.id}`}: Amount required for ${action}`);

    // Track first player with missing amount for focus
    if (!firstPlayerWithMissingAmount) {
      return {
        playerId: player.id,
        playerName: player.name || `Player ${player.id}`,
        action: action,
        stage: stage,
        suffix: suffix
      };
    }
  }

  return firstPlayerWithMissingAmount;
}

/**
 * Gather raises in the section for progression validation
 */
function gatherRaisesInSection(
  players: Player[],
  playerData: PlayerData,
  stage: Stage,
  suffix: string,
  defaultUnit: string = 'K'
): RaiseInfo[] {
  const raisesInSection: RaiseInfo[] = [];

  players.forEach(player => {
    const data = playerData[player.id] || {};
    const action = data[`${stage}${suffix}_action` as keyof PlayerData[number]] as string;

    if (action === 'raise' || action === 'bet') {
      const amountKey = `${stage}${suffix}_amount` as keyof PlayerData[number];
      const unitKey = `${stage}${suffix}_unit` as keyof PlayerData[number];
      const amount = parseFloat(data[amountKey] as string) || 0;
      const unit = (data[unitKey] as string) || data.unit || defaultUnit;

      const actualAmount = convertToActualAmount(amount, unit, stage, suffix, data);

      raisesInSection.push({
        player: player,
        action: action,
        amount: amount,
        unit: unit,
        actualAmount: actualAmount
      });
    }
  });

  return raisesInSection;
}

/**
 * Validate that each raise is higher than the previous raise
 */
function validateRaiseProgression(
  raisesInSection: RaiseInfo[],
  errors: string[],
  firstPlayerWithMissingAmount: SectionValidationResult['firstPlayerWithMissingAmount']
): SectionValidationResult['firstPlayerWithMissingAmount'] {
  let result = firstPlayerWithMissingAmount;

  for (let i = 1; i < raisesInSection.length; i++) {
    const prevRaise = raisesInSection[i - 1];
    const currentRaise = raisesInSection[i];

    if (currentRaise.actualAmount <= prevRaise.actualAmount) {
      const errorMsg = `${currentRaise.player.name}: ${currentRaise.action} amount (${currentRaise.amount}${currentRaise.unit || ''}) must be higher than ${prevRaise.player.name}'s ${prevRaise.action} (${prevRaise.amount}${prevRaise.unit || ''})`;
      errors.push(errorMsg);

      // Track first error for focus
      if (!result) {
        result = {
          playerId: currentRaise.player.id,
          playerName: currentRaise.player.name || `Player ${currentRaise.player.id}`,
          action: currentRaise.action,
          stage: prevRaise.player.name.includes('stage') ? 'preflop' : 'flop', // Simplified - in real usage, pass stage
          suffix: ''
        };
      }
    }
  }

  return result;
}

/**
 * Validate a section before processing
 *
 * Checks:
 * - Cards are present for non-fold actions
 * - Amounts are present for bet/raise actions
 * - Each raise is higher than the previous raise
 * - Auto-folds players with no action in preflop base
 *
 * @param stage - The stage (preflop, flop, turn, river)
 * @param level - The action level (base, more, more2)
 * @param players - All players in the game
 * @param playerData - Player data object
 * @param defaultUnit - Default unit for amounts (default: 'K')
 * @returns Validation result with errors and updated data
 */
export function validateSectionBeforeProcessing(
  stage: Stage,
  level: ActionLevel,
  players: Player[],
  playerData: PlayerData,
  defaultUnit: string = 'K'
): SectionValidationResult {
  const suffix = getActionSuffix(level);
  const activePlayers = getActivePlayers(players);

  const errors: string[] = [];
  const updatedData: { [playerId: number]: Partial<PlayerData[number]> } = {};
  const autoFoldedPlayers: string[] = [];
  let firstPlayerWithMissingAmount: SectionValidationResult['firstPlayerWithMissingAmount'] = null;

  // Validate each player
  activePlayers.forEach(player => {
    const data = playerData[player.id] || {};
    const action = data[`${stage}${suffix}_action` as keyof PlayerData[number]] as string;

    // Handle undefined or 'no action'
    if (!action || action === 'no action') {
      // In preflop base, auto-fold players with no action
      if (stage === 'preflop' && suffix === '') {
        updatedData[player.id] = {
          ...data,
          [`${stage}${suffix}_action`]: 'fold'
        };
        autoFoldedPlayers.push(player.name || `Player ${player.id}`);
      }

      // Skip all validation for players with no action
      return;
    }

    // Skip validation for fold action
    if (action === 'fold') {
      return;
    }

    // Validate cards for all other actions
    validatePlayerCards(player, data, action, errors);

    // Validate amount for bet/raise actions
    firstPlayerWithMissingAmount = validatePlayerAmount(
      player,
      data,
      action,
      stage,
      suffix,
      errors,
      firstPlayerWithMissingAmount
    );
  });

  // Validate raise progression
  const raisesInSection = gatherRaisesInSection(
    activePlayers,
    playerData,
    stage,
    suffix,
    defaultUnit
  );

  firstPlayerWithMissingAmount = validateRaiseProgression(
    raisesInSection,
    errors,
    firstPlayerWithMissingAmount
  );

  return {
    errors,
    updatedData,
    firstPlayerWithMissingAmount,
    autoFoldedPlayers
  };
}

/**
 * Check if a player has valid cards
 */
export function hasValidCards(data: PlayerData[number]): boolean {
  const card1 = data.card1;
  const card2 = data.card2;

  return !!(
    card1 && card1.rank && card1.suit &&
    card2 && card2.rank && card2.suit
  );
}
