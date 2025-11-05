/**
 * Player Action Status Validator
 *
 * Determines if a specific player needs to act in More Action rounds
 * based on cumulative contributions and all-in status.
 *
 * Features:
 * - Cumulative contribution calculation (BASE + More Action)
 * - All-in detection from previous rounds
 * - Max bet matching detection
 */

import type { Stage, ActionLevel, Player, PlayerData, ChipUnit } from '../../../types/poker';

/**
 * Result of player action status check
 */
export interface PlayerActionStatus {
  needsToAct: boolean;
  alreadyMatchedMaxBet: boolean;
  alreadyAllIn: boolean;
  cumulativeContribution: number;
  maxContribution: number;
}

/**
 * Convert amount string and unit to actual numeric value
 * IMPORTANT: When unit is undefined after processStack, the amount is a display value
 * that was formatted from actual value. We need to infer the unit:
 * - If amount < 1000: likely 'K' format (2 = 2000, 3 = 3000, etc.)
 * - If amount >= 1000: likely 'actual' format (already converted)
 */
function convertAmount(amount: string | number | undefined, unit: ChipUnit | undefined): number {
  if (!amount) return 0;

  // Handle numeric input
  if (typeof amount === 'number') {
    const numericAmount = amount;
    if (isNaN(numericAmount) || numericAmount === 0) return 0;

    if (unit === 'K') {
      return numericAmount * 1000;
    } else if (unit === 'Mil') {
      return numericAmount * 1000000;
    } else if (unit === 'actual') {
      return numericAmount;
    } else if (unit === undefined) {
      if (numericAmount < 1000) {
        console.log(`   🔍 [convertAmount] Unit undefined, amount ${numericAmount} < 1000, inferring 'K' format → ${numericAmount * 1000}`);
        return numericAmount * 1000;
      } else {
        console.log(`   🔍 [convertAmount] Unit undefined, amount ${numericAmount} >= 1000, treating as actual value`);
        return numericAmount;
      }
    }
    return numericAmount;
  }

  // Handle string input
  if (amount.trim() === '') return 0;

  const numericAmount = parseFloat(amount.trim());
  if (isNaN(numericAmount) || numericAmount === 0) return 0;

  if (unit === 'K') {
    return numericAmount * 1000;
  } else if (unit === 'Mil') {
    return numericAmount * 1000000;
  } else if (unit === 'actual') {
    return numericAmount;
  } else if (unit === undefined) {
    // After processStack, unit is undefined but amount is display-formatted
    // Infer unit based on amount magnitude:
    // - Small values (< 1000) are likely 'K' format from processStack
    // - Large values (>= 1000) are likely already in actual format (blinds, antes)
    if (numericAmount < 1000) {
      console.log(`   🔍 [convertAmount] Unit undefined, amount ${numericAmount} < 1000, inferring 'K' format → ${numericAmount * 1000}`);
      return numericAmount * 1000;
    } else {
      console.log(`   🔍 [convertAmount] Unit undefined, amount ${numericAmount} >= 1000, treating as actual value`);
      return numericAmount;
    }
  }

  return numericAmount;
}

/**
 * Check if a player is all-in from previous rounds
 */
function checkIfPlayerAllIn(
  playerId: number,
  actionLevel: ActionLevel,
  playerData: PlayerData
): boolean {
  const data = playerData[playerId];
  if (!data) return false;

  // Check forced all-in during blind posting
  if (data.isForcedAllInPreflop) return true;

  // For More Action 1: Check BASE round
  if (actionLevel === 'more') {
    return data.preflopAction === 'all-in';
  }

  // For More Action 2: Check BASE and More Action 1
  if (actionLevel === 'more2') {
    return (
      data.preflopAction === 'all-in' ||
      data.preflop_moreActionAction === 'all-in'
    );
  }

  return false;
}

/**
 * Calculate player's cumulative contribution up to current action level
 *
 * NOTE: After processStack, the amounts stored in playerData represent TOTAL
 * contributions including blinds/antes. We should use the action amount directly,
 * not add blinds again.
 *
 * For More Action rounds: we want the contribution UP TO (but not including) the current round.
 */
function calculateCumulativeContribution(
  playerId: number,
  actionLevel: ActionLevel,
  playerData: PlayerData
): number {
  const data = playerData[playerId];
  if (!data) return 0;

  let contribution = 0;
  const blindsAntes = (data.postedSB || 0) + (data.postedBB || 0) + (data.postedAnte || 0);
  console.log(`   🔍 [calculateCumulativeContribution] Player ${playerId} posted blinds/antes:`, blindsAntes);

  // For More Action 1: Get contribution from BASE round only
  if (actionLevel === 'more') {
    if (data.preflopAction && data.preflopAction !== 'fold' && data.preflopAction !== 'check' && data.preflopAction !== 'no action') {
      console.log(`   🔍 [calculateCumulativeContribution] Player ${playerId} BASE action:`, data.preflopAction);
      console.log(`   🔍 [calculateCumulativeContribution] Player ${playerId} preflopAmount:`, data.preflopAmount);
      console.log(`   🔍 [calculateCumulativeContribution] Player ${playerId} preflopUnit:`, data.preflopUnit);
      const baseAmount = convertAmount(data.preflopAmount as string | undefined, data.preflopUnit as ChipUnit | undefined);
      console.log(`   🔍 [calculateCumulativeContribution] Player ${playerId} converted baseAmount:`, baseAmount, '(includes blinds)');
      contribution = baseAmount; // Already includes blinds!
    } else {
      // No action in BASE, just blinds
      contribution = blindsAntes;
      console.log(`   🔍 [calculateCumulativeContribution] Player ${playerId} no BASE action, using blinds only`);
    }
  }

  // For More Action 2: Get contribution from BASE + More Action 1
  else if (actionLevel === 'more2') {
    // Check if player acted in More Action 1
    const moreAction1 = data.preflop_moreActionAction;
    if (moreAction1 && moreAction1 !== 'fold' && moreAction1 !== 'check' && moreAction1 !== 'no action') {
      const moreAction1Amount = convertAmount(
        data.preflop_moreActionAmount as string | undefined,
        data.preflop_moreActionUnit as ChipUnit | undefined
      );
      console.log(`   🔍 [calculateCumulativeContribution] Player ${playerId} More Action 1 amount:`, moreAction1Amount, '(TOTAL including BASE)');
      contribution = moreAction1Amount; // This is the cumulative total through More Action 1
    }
    // Otherwise check BASE
    else if (data.preflopAction && data.preflopAction !== 'fold' && data.preflopAction !== 'check' && data.preflopAction !== 'no action') {
      const baseAmount = convertAmount(data.preflopAmount as string | undefined, data.preflopUnit as ChipUnit | undefined);
      console.log(`   🔍 [calculateCumulativeContribution] Player ${playerId} BASE amount:`, baseAmount, '(includes blinds, no MA1 action)');
      contribution = baseAmount;
    }
    // Otherwise just blinds
    else {
      contribution = blindsAntes;
      console.log(`   🔍 [calculateCumulativeContribution] Player ${playerId} no actions, using blinds only`);
    }
  }

  console.log(`   🔍 [calculateCumulativeContribution] Player ${playerId} cumulative contribution:`, contribution);
  return contribution;
}

/**
 * Calculate the maximum contribution among all active players
 * IMPORTANT: This includes contributions made in the CURRENT More Action round
 *
 * NOTE: After processStack runs, the amounts stored in playerData represent TOTAL
 * contributions including blinds/antes. We should NOT add blinds again when an
 * action amount exists (it already includes them).
 */
function calculateMaxContribution(
  actionLevel: ActionLevel,
  players: Player[],
  playerData: PlayerData
): number {
  let maxContribution = 0;

  console.log(`   🔍 [calculateMaxContribution] Action level: ${actionLevel}`);

  for (const player of players) {
    if (!player.name) continue;

    const data = playerData[player.id];
    if (!data) continue;

    // Skip folded players
    if (data.preflopAction === 'fold') continue;
    if (data.preflop_moreActionAction === 'fold') continue;
    if (data.preflop_moreAction2Action === 'fold') continue;

    let contribution = 0;
    const blindsAntes = (data.postedSB || 0) + (data.postedBB || 0) + (data.postedAnte || 0);
    console.log(`   🔍 [calculateMaxContribution] Player ${player.id} (${player.name}) blinds/antes: ${blindsAntes}`);

    // BASE round: Use action amount if exists (already includes blinds), otherwise just blinds
    if (data.preflopAction && data.preflopAction !== 'fold' && data.preflopAction !== 'check' && data.preflopAction !== 'no action') {
      const baseAmount = convertAmount(data.preflopAmount as string | undefined, data.preflopUnit as ChipUnit | undefined);
      console.log(`   🔍 [calculateMaxContribution] Player ${player.id} BASE: ${data.preflopAction} ${data.preflopAmount}${data.preflopUnit || ''} = ${baseAmount} (includes blinds)`);
      contribution = baseAmount; // Already includes blinds!
    } else {
      // No action in BASE, just blinds
      contribution = blindsAntes;
      console.log(`   🔍 [calculateMaxContribution] Player ${player.id} BASE: no action, using blinds only`);
    }

    // For More Action 1 or More Action 2: Add More Action 1 contributions
    if (actionLevel === 'more' || actionLevel === 'more2') {
      const moreAction1 = data.preflop_moreActionAction;
      if (moreAction1 && moreAction1 !== 'fold' && moreAction1 !== 'check' && moreAction1 !== 'no action') {
        console.log(`   🔍 [calculateMaxContribution] Player ${player.id} checking More Action 1 data:`);
        console.log(`      preflop_moreActionAction: "${moreAction1}"`);
        console.log(`      preflop_moreActionAmount: "${data.preflop_moreActionAmount}" (type: ${typeof data.preflop_moreActionAmount})`);
        console.log(`      preflop_moreActionUnit: "${data.preflop_moreActionUnit}" (type: ${typeof data.preflop_moreActionUnit})`);

        const moreAction1Amount = convertAmount(
          data.preflop_moreActionAmount as string | undefined,
          data.preflop_moreActionUnit as ChipUnit | undefined
        );
        console.log(`   🔍 [calculateMaxContribution] Player ${player.id} More Action 1: ${moreAction1} ${data.preflop_moreActionAmount}${data.preflop_moreActionUnit || ''} = ${moreAction1Amount} (TOTAL including BASE)`);
        contribution = moreAction1Amount; // This is the NEW total, replaces previous
      }
    }

    // For More Action 2: Use More Action 2 amount if exists
    if (actionLevel === 'more2') {
      const moreAction2 = data.preflop_moreAction2Action;
      if (moreAction2 && moreAction2 !== 'fold' && moreAction2 !== 'check' && moreAction2 !== 'no action') {
        const moreAction2Amount = convertAmount(
          data.preflop_moreAction2Amount as string | undefined,
          data.preflop_moreAction2Unit as ChipUnit | undefined
        );
        console.log(`   🔍 [calculateMaxContribution] Player ${player.id} More Action 2: ${moreAction2} ${data.preflop_moreAction2Amount}${data.preflop_moreAction2Unit || ''} = ${moreAction2Amount} (TOTAL including BASE + MA1)`);
        contribution = moreAction2Amount; // This is the NEW total, replaces previous
      }
    }

    console.log(`   🔍 [calculateMaxContribution] Player ${player.id} TOTAL contribution: ${contribution}`);
    maxContribution = Math.max(maxContribution, contribution);
  }

  console.log(`   🔍 [calculateMaxContribution] MAX contribution: ${maxContribution}`);
  return maxContribution;
}

/**
 * Check if a specific player needs to act in the current More Action round
 *
 * @param playerId - ID of the player to check
 * @param actionLevel - Current action level ('more' or 'more2')
 * @param players - All players in the game
 * @param playerData - Player data with actions and amounts
 * @returns Player action status with needsToAct, alreadyMatchedMaxBet, alreadyAllIn
 */
export function checkPlayerNeedsToAct(
  playerId: number,
  actionLevel: ActionLevel,
  players: Player[],
  playerData: PlayerData
): PlayerActionStatus {
  console.log(`🔍 [checkPlayerNeedsToAct] Checking player ${playerId}, action level: ${actionLevel}`);

  // Calculate cumulative contribution for this player
  const cumulativeContribution = calculateCumulativeContribution(playerId, actionLevel, playerData);
  console.log(`   Player ${playerId} cumulative contribution: ${cumulativeContribution}`);

  // Calculate max contribution among all players
  const maxContribution = calculateMaxContribution(actionLevel, players, playerData);
  console.log(`   Max contribution: ${maxContribution}`);

  // Check if player is all-in from previous rounds
  const alreadyAllIn = checkIfPlayerAllIn(playerId, actionLevel, playerData);
  console.log(`   Player ${playerId} all-in: ${alreadyAllIn}`);

  if (alreadyAllIn) {
    console.log(`   → Player ${playerId} is all-in, does NOT need to act`);
    return {
      needsToAct: false,
      alreadyMatchedMaxBet: false,
      alreadyAllIn: true,
      cumulativeContribution,
      maxContribution,
    };
  }

  // Check if player already matched max bet
  const alreadyMatchedMaxBet = cumulativeContribution >= maxContribution;
  console.log(`   Player ${playerId} matched max bet: ${alreadyMatchedMaxBet}`);

  if (alreadyMatchedMaxBet) {
    console.log(`   → Player ${playerId} already matched max bet, does NOT need to act`);
    return {
      needsToAct: false,
      alreadyMatchedMaxBet: true,
      alreadyAllIn: false,
      cumulativeContribution,
      maxContribution,
    };
  }

  // Player needs to act
  console.log(`   → Player ${playerId} NEEDS to act (contribution ${cumulativeContribution} < max ${maxContribution})`);
  return {
    needsToAct: true,
    alreadyMatchedMaxBet: false,
    alreadyAllIn: false,
    cumulativeContribution,
    maxContribution,
  };
}
