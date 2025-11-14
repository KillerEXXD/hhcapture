/**
 * Player Action Utilities
 *
 * Helper functions for working with player actions across betting rounds.
 * Moved from potEngine.ts during pot calculation consolidation (2025-11-14).
 */

import type { Stage, PlayerData } from '../../../types/poker';

/**
 * Get the last action taken by a player in a betting round
 *
 * Checks actions in reverse order (more2 → more → base) to find the most recent action.
 * Used to determine if a player has folded or what their last action was.
 *
 * @param playerId - The player ID to check
 * @param stage - The betting stage (preflop, flop, turn, river)
 * @param playerData - All player action data
 * @returns The last action string, or null if no action found
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
 *
 * This is critical for pot calculations in later streets, as a player who folded
 * in an earlier street is not eligible for pots in later streets.
 *
 * Special handling:
 * - In preflop, "none" or null action = auto-fold
 * - Checks all stages from preflop up to and including current stage
 *
 * @param playerId - The player ID to check
 * @param currentStage - Current betting stage
 * @param playerData - All player action data
 * @returns True if player has folded, false otherwise
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
 * Check if player is all-in at a given stage
 *
 * @param playerId - The player ID to check
 * @param stage - The betting stage
 * @param playerData - All player action data
 * @returns True if player is all-in, false otherwise
 */
export function isPlayerAllIn(
  playerId: number,
  stage: Stage,
  playerData: PlayerData
): boolean {
  const lastAction = getLastActionInBettingRound(playerId, stage, playerData);
  return lastAction === 'all-in';
}
