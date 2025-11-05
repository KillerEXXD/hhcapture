/**
 * Focus Utilities (Fix #5)
 *
 * Enhanced focus management for moving between players during hand play
 * Key improvements from Dev_HHTool:
 * - Fold action gets 650ms delay (vs 150ms for others) to wait for animation
 * - Uses requestAnimationFrame for better timing
 * - Forces blur on current element before focusing next
 * - Retry mechanism: up to 5 attempts with 100ms between retries
 */

import type { Player, Stage, ActionLevel } from '../../../types/poker';

/**
 * Move focus to the next player's input field
 *
 * @param playerId - Current player ID
 * @param stage - Current stage ('preflop', 'flop', 'turn', 'river')
 * @param suffix - Action suffix ('', '_moreAction', '_moreAction2')
 * @param actionName - Action that triggered the move (for logging and delay calculation)
 * @param players - All active players
 */
export function moveToNextPlayer(
  playerId: number,
  stage: Stage,
  suffix: string,
  actionName: string = '',
  players: Player[]
): void {
  // 🔥 Fold has animation, needs longer delay (650ms vs 150ms)
  const delay = actionName === 'Fold' ? 650 : 150;

  setTimeout(() => {
    // Determine action level from suffix
    const actionLevel: ActionLevel =
      suffix === '' ? 'base' :
      suffix === '_moreAction' ? 'more' : 'more2';

    // Get all active players (those with names)
    const allPlayers = players.filter(p => p.name);
    const currentIndex = allPlayers.findIndex(p => p.id === playerId);

    if (currentIndex !== -1 && currentIndex < allPlayers.length - 1) {
      const nextPlayer = allPlayers[currentIndex + 1];

      // 🔥 Determine focus target based on stage and action level
      const isPreFlopBase = stage === 'preflop' && suffix === '';
      let selector = '';
      let focusType = '';

      if (isPreFlopBase) {
        // Pre-flop base: Focus Card 1
        selector = `[data-card-focus="${nextPlayer.id}-1-${stage}${suffix}"]`;
        focusType = 'Card 1';
      } else {
        // All other sections: Focus Action
        selector = `[data-action-focus="${nextPlayer.id}-${stage}${suffix}"]`;
        focusType = 'Action';
      }

      console.log(`🎯 ${actionName}: Moving focus from player index ${currentIndex} to ${nextPlayer.name} (index ${currentIndex + 1})`);
      console.log(`🔍 Selector: ${selector} (${focusType})`);

      // 🔥 AGGRESSIVE retry mechanism with longer delays
      const tryFocus = (attempts = 0) => {
        const nextElement = document.querySelector(selector) as HTMLElement;

        if (nextElement) {
          // Force blur on current element first
          const currentFocused = document.activeElement as HTMLElement;
          if (currentFocused && currentFocused.blur) {
            currentFocused.blur();
          }

          // Use requestAnimationFrame for better timing
          requestAnimationFrame(() => {
            nextElement.focus();
            console.log(`✅ ${actionName}: Focus attempt ${attempts + 1} to ${nextPlayer.name} ${focusType}`);

            // Verify focus after 100ms, retry if failed (up to 5 attempts)
            setTimeout(() => {
              const focused = document.activeElement;
              const attrName = isPreFlopBase ? 'data-card-focus' : 'data-action-focus';
              const focusAttr = focused?.getAttribute(attrName);
              const expectedAttr = isPreFlopBase
                ? `${nextPlayer.id}-1-${stage}${suffix}`
                : `${nextPlayer.id}-${stage}${suffix}`;

              if (focusAttr !== expectedAttr && attempts < 5) {
                console.log(`⚠️ Focus verification failed, retrying (attempt ${attempts + 2}/5)...`);
                setTimeout(() => tryFocus(attempts + 1), 100);
              } else if (focusAttr === expectedAttr) {
                console.log(`✅ Focus verified successfully`);
              } else {
                console.error(`❌ Focus failed after 5 attempts`);
              }
            }, 100);
          });
        } else {
          console.error(`❌ Target element not found: ${selector}`);
          if (attempts < 5) {
            console.log(`⚠️ Retrying in 100ms (attempt ${attempts + 2}/5)...`);
            setTimeout(() => tryFocus(attempts + 1), 100);
          }
        }
      };

      tryFocus();
    } else if (currentIndex === allPlayers.length - 1) {
      console.log(`🏁 ${actionName}: Last player, no next player to focus`);
    } else {
      console.error(`❌ Current player not found in active players list`);
    }
  }, delay);
}

/**
 * Focus on a specific player's action input
 *
 * @param playerId - Player ID to focus
 * @param stage - Current stage
 * @param suffix - Action suffix
 */
export function focusPlayerAction(
  playerId: number,
  stage: Stage,
  suffix: string
): void {
  const selector = `[data-action-focus="${playerId}-${stage}${suffix}"]`;
  const element = document.querySelector(selector) as HTMLElement;

  if (element) {
    requestAnimationFrame(() => {
      element.focus();
      console.log(`✅ Focused action for player ${playerId}`);
    });
  } else {
    console.error(`❌ Action element not found for player ${playerId}`);
  }
}

/**
 * Focus on a specific player's card input
 *
 * @param playerId - Player ID to focus
 * @param cardNumber - Card number (1 or 2)
 * @param stage - Current stage
 * @param suffix - Action suffix
 */
export function focusPlayerCard(
  playerId: number,
  cardNumber: 1 | 2,
  stage: Stage,
  suffix: string
): void {
  const selector = `[data-card-focus="${playerId}-${cardNumber}-${stage}${suffix}"]`;
  const element = document.querySelector(selector) as HTMLElement;

  if (element) {
    requestAnimationFrame(() => {
      element.focus();
      console.log(`✅ Focused card ${cardNumber} for player ${playerId}`);
    });
  } else {
    console.error(`❌ Card element not found for player ${playerId} card ${cardNumber}`);
  }
}

/**
 * Focus on amount input for bet/raise actions (Fix #2: 200ms timeout)
 *
 * @param playerId - Player ID
 * @param suffix - Action suffix
 */
export function focusAmountInput(
  playerId: number,
  suffix: string
): void {
  console.log('🎯🎯🎯 BET/RAISE DETECTED 🎯🎯🎯');
  console.log(`   Player: ${playerId}, Suffix: ${suffix}`);
  console.log('   Setting up focus setTimeout (200ms)...');

  // Fix #2: Use 200ms timeout (was 100ms in older versions)
  setTimeout(() => {
    console.log('⏰⏰⏰ SETTIMEOUT FIRED ⏰⏰⏰');
    const inputId = `amount-input-${playerId}${suffix || ''}`;
    console.log(`   Looking for input ID: ${inputId}`);

    const amountInput = document.querySelector(`#${inputId}`) as HTMLInputElement;
    console.log(`   Input element found:`, amountInput);
    console.log(`   Input element tagName:`, amountInput?.tagName);
    console.log(`   Input element id:`, amountInput?.id);

    if (amountInput) {
      console.log(`   ✅ Input exists - calling focus() and select()`);
      amountInput.focus();
      amountInput.select();

      // Verify focus after 10ms
      setTimeout(() => {
        console.log(`   After focus, document.activeElement:`, document.activeElement);
        console.log(`   After focus, activeElement.id:`, (document.activeElement as HTMLElement)?.id);
        console.log(`   Focus successful:`, document.activeElement === amountInput);
      }, 10);
    } else {
      console.error(`   ❌ INPUT NOT FOUND!`);
      console.error(`   Available inputs:`, Array.from(document.querySelectorAll('input[id^="amount-input-"]')).map(el => el.id));
    }
  }, 200); // 200ms timeout (Fix #2)
}
