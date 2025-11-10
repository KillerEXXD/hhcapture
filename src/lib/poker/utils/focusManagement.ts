/**
 * Focus Management Utilities
 *
 * FR-13.4: Process Stack Focus Return Logic
 * After processing stack, check if betting round is complete:
 * - If complete → Focus "Create Next Street" button (and disable "Add More Action")
 * - If incomplete → Focus "Add More Action" button (user needs to add more action to complete round)
 */

import type { Player, PlayerData, Stage, ActionLevel } from '../../../types/poker';
import { checkBettingRoundComplete } from '../validators/roundCompletionValidator';

interface FocusReturnOptions {
  stage: Stage;
  actionLevel: ActionLevel;
  players: Player[];
  playerData: PlayerData;
  hasMoreActionButton: boolean;
  hasCreateNextStreetButton: boolean;
}

/**
 * FR-13.4: Return focus after Process Stack completes
 *
 * Logic (Corrected v2):
 * After clicking "Process Stack", we need to check if the betting round is complete:
 *
 * 1. Check if betting round is complete using checkBettingRoundComplete()
 * 2. If COMPLETE → Focus "Create Next Street" button
 *    - Betting is done, move to next street
 *    - "Add More Action" should be disabled (no point adding more if round complete)
 * 3. If INCOMPLETE → Focus "Add More Action" button
 *    - User needs to add another action round to complete the betting
 * 4. Special case: If no buttons available (River more2 complete) → Do nothing
 */
export function returnFocusAfterProcessStack(options: FocusReturnOptions): void {
  const { stage, actionLevel, players, playerData, hasMoreActionButton, hasCreateNextStreetButton } = options;

  console.log(`🎯 [FocusReturn] ========================================`);
  console.log(`🎯 [FocusReturn] Determining focus after Process Stack`);
  console.log(`🎯 [FocusReturn] Stage: ${stage}, Level: ${actionLevel}`);

  // Check if the betting round is complete
  const isRoundComplete = checkBettingRoundComplete(
    stage,
    actionLevel,
    players,
    playerData
  );

  console.log(`🎯 [FocusReturn] Betting round complete: ${isRoundComplete}`);

  setTimeout(() => {
    // If round is COMPLETE → Focus "Create Next Street"
    if (isRoundComplete) {
      if (hasCreateNextStreetButton) {
        // Try street-specific button names first
        const streetButtons = [
          `[data-create-flop-focus]`,
          `[data-create-turn-focus]`,
          `[data-create-river-focus]`,
          `[data-create-next-street-focus]` // Fallback generic name
        ];

        for (const selector of streetButtons) {
          const createNextButton = document.querySelector(selector) as HTMLElement;
          if (createNextButton) {
            console.log(`🎯 [FocusReturn] Round complete → Focusing "Create Next Street" button`);
            createNextButton.focus();
            console.log(`🎯 [FocusReturn] ========================================`);
            return;
          }
        }
      }
      console.log(`ℹ️ [FocusReturn] Round complete but no "Create Next Street" button (River final round)`);
      console.log(`🎯 [FocusReturn] ========================================`);
      return;
    }

    // If round is INCOMPLETE → Focus "Add More Action"
    if (hasMoreActionButton) {
      const moreActionButton = document.querySelector('[data-add-more-focus]') as HTMLElement;
      if (moreActionButton) {
        console.log(`🎯 [FocusReturn] Round incomplete → Focusing "Add More Action" button`);
        moreActionButton.focus();
        console.log(`🎯 [FocusReturn] ========================================`);
        return;
      }
    }

    console.warn(`⚠️ [FocusReturn] Round incomplete but no "Add More Action" button available`);
    console.log(`🎯 [FocusReturn] ========================================`);
  }, 100);
}
