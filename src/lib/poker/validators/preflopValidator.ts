/**
 * Preflop Validator
 *
 * Validates preflop base section specifically.
 * Handles auto-folding players with no action or missing cards.
 */

import type {
  Player,
  PlayerData
} from '../../../types/poker';
import { hasValidCards } from './sectionValidator';

/**
 * Preflop validation result
 */
export type PreflopValidationResult = {
  isValid: boolean;
  errors: string[];
  playersToFold: Player[];
  autoFoldedPlayerNames: string[];
};

/**
 * Validate preflop base section
 *
 * Rules:
 * - Players with 'no action' and missing cards are auto-folded
 * - Players with action (except fold) must have both cards
 * - Returns list of errors and players to auto-fold
 *
 * @param players - All players in the game
 * @param playerData - Player data object
 * @returns Validation result
 */
export function validatePreFlopBase(
  players: Player[],
  playerData: PlayerData
): PreflopValidationResult {
  const errors: string[] = [];
  const playersToFold: Player[] = [];
  const autoFoldedPlayerNames: string[] = [];

  players.forEach(player => {
    // Skip empty seats
    if (!player.name) {
      return;
    }

    const data = playerData[player.id] || {};
    const action = data.preflop_action as string;

    // Auto-fold players with 'no action' and missing cards
    if (action === 'no action' && !hasValidCards(data)) {
      playersToFold.push(player);
      autoFoldedPlayerNames.push(player.name);
      return;
    }

    // Validate cards for players with action (except fold and 'no action')
    if (action && action !== 'fold' && action !== 'no action') {
      const hasCard1 = data.card1?.rank && data.card1?.suit;
      const hasCard2 = data.card2?.rank && data.card2?.suit;

      if (!hasCard1 || !hasCard2) {
        if (!hasCard1 && !hasCard2) {
          errors.push(`${player.name}: Missing both cards`);
        } else if (!hasCard1) {
          const missing = !data.card1?.rank ? 'rank' : 'suit';
          errors.push(`${player.name}: Missing card 1 ${missing}`);
        } else if (!hasCard2) {
          const missing = !data.card2?.rank ? 'rank' : 'suit';
          errors.push(`${player.name}: Missing card 2 ${missing}`);
        }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    playersToFold,
    autoFoldedPlayerNames
  };
}

/**
 * Auto-fold players with 'no action' in preflop base
 *
 * This is used when switching views to auto-fold players who haven't acted.
 *
 * @param players - All players in the game
 * @param playerData - Player data object
 * @returns List of players to fold and their names
 */
export function autoFoldNoActionPlayersInPreflopBase(
  players: Player[],
  playerData: PlayerData
): {
  playersToFold: Player[];
  autoFoldedPlayerNames: string[];
} {
  const playersToFold: Player[] = [];
  const autoFoldedPlayerNames: string[] = [];

  players.forEach(player => {
    if (!player.name) {
      return;
    }

    const data = playerData[player.id] || {};
    const action = data.preflop_action as string;

    // Auto-fold if no action or 'no action'
    if (!action || action === 'no action' || action === 'none') {
      playersToFold.push(player);
      autoFoldedPlayerNames.push(player.name);
    }
  });

  return {
    playersToFold,
    autoFoldedPlayerNames
  };
}

/**
 * Check if a player has folded in any stage
 *
 * @param playerId - Player ID
 * @param playerData - Player data object
 * @returns True if player has folded
 */
export function hasPlayerFolded(
  playerId: number,
  playerData: PlayerData
): boolean {
  const data = playerData[playerId] || {};
  const stages = ['preflop', 'flop', 'turn', 'river'] as const;

  for (const stage of stages) {
    if (data[`${stage}_action`] === 'fold') return true;
    if (data[`${stage}_moreAction_action`] === 'fold') return true;
    if (data[`${stage}_moreAction2_action`] === 'fold') return true;
  }

  return false;
}

/**
 * Get list of folded players
 *
 * @param players - All players in the game
 * @param playerData - Player data object
 * @returns List of folded players
 */
export function getFoldedPlayers(
  players: Player[],
  playerData: PlayerData
): Player[] {
  return players.filter(player =>
    player.name && hasPlayerFolded(player.id, playerData)
  );
}
