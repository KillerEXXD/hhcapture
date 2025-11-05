/**
 * Round Completion Validator (Fix #6)
 *
 * Complex logic for determining when More Action betting rounds are complete
 * Ported from Dev_HHTool lines 7518-7797
 *
 * Features:
 * - Separate preflop vs postflop logic
 * - Call pending resolution
 * - Pending player detection
 * - All-in detection
 * - Contribution matching
 */

import type { Stage, ActionLevel, Player, PlayerData } from '../../../types/poker';

/**
 * Result of betting round completion check
 */
export interface RoundCompletionResult {
  isComplete: boolean;
  reason?: string;
  pendingPlayers?: number[];
  maxContribution?: number;
}

/**
 * Check if a betting round is complete
 *
 * A round is complete when:
 * 1. All active players have acted
 * 2. All active players have matching contributions OR are all-in
 * 3. No pending calls remain
 *
 * @param stage - Current stage ('preflop', 'flop', 'turn', 'river')
 * @param actionLevel - Action level ('base', 'more', 'more2')
 * @param players - All players with their current state
 * @param playerData - Player data with actions and amounts
 * @returns Completion check result
 */
export function checkBettingRoundComplete(
  stage: Stage,
  actionLevel: ActionLevel,
  players: Player[],
  playerData: PlayerData
): RoundCompletionResult {
  console.log('═══════════════════════════════════════════');
  console.log('🔍 checkBettingRoundComplete called');
  console.log('   Stage:', stage);
  console.log('   Action Level:', actionLevel);
  console.log('   Total Players:', players.length);

  // Get all active players (have names and not folded)
  const activePlayers = players.filter(p => {
    const isFolded = checkIfPlayerFolded(p, stage, actionLevel, playerData);
    return p.name && !isFolded;
  });

  console.log('   Active Players:', activePlayers.length);

  if (activePlayers.length === 0) {
    console.log('   → No active players, round complete');
    console.log('═══════════════════════════════════════════');
    return { isComplete: true, reason: 'No active players' };
  }

  if (activePlayers.length === 1) {
    console.log('   → Only 1 active player, round complete');
    console.log('═══════════════════════════════════════════');
    return { isComplete: true, reason: 'Only one active player' };
  }

  // Separate logic for preflop vs postflop
  if (stage === 'preflop') {
    return checkPreflopRoundComplete(stage, actionLevel, activePlayers, playerData);
  } else {
    return checkPostflopRoundComplete(stage, actionLevel, activePlayers, playerData);
  }
}

/**
 * Check if preflop betting round is complete
 */
function checkPreflopRoundComplete(
  stage: Stage,
  actionLevel: ActionLevel,
  activePlayers: Player[],
  playerData: PlayerData
): RoundCompletionResult {
  console.log('🔍 Checking PREFLOP round completion');

  // Get action suffix for this level
  const suffix = actionLevel === 'base' ? '' : actionLevel === 'more' ? '_moreAction' : '_moreAction2';

  // Get all preflop actions for this action level
  const contributions = activePlayers.map(p => {
    const data = playerData[p.id];
    // Base level: Include posted blinds/antes
    let contribution = 0;

    if (actionLevel === 'base') {
      // Include posted blinds and antes
      const blindsAntes = (data.postedSB || 0) + (data.postedBB || 0) + (data.postedAnte || 0);

      // Get BASE action (if any)
      const preflopAction = getPreflopAction(p, suffix, playerData);
      if (preflopAction && preflopAction.amount && parseFloat(preflopAction.amount) > 0) {
        // After processStack, the amount already includes blinds!
        // Convert from display format (e.g., 2, 3, 4) to actual value (2000, 3000, 4000)
        const amount = parseFloat(preflopAction.amount);
        contribution = amount < 1000 ? amount * 1000 : amount;
      } else {
        // No action, just blinds
        contribution = blindsAntes;
      }
    } else {
      // More Action rounds: Use the most recent action amount (TOTAL contribution)
      // After processStack, amounts are TOTAL contributions including all previous rounds

      // Check if player acted in this More Action round
      const currentAction = getPreflopAction(p, suffix, playerData);
      if (currentAction && currentAction.amount && parseFloat(currentAction.amount) > 0) {
        // This amount is the TOTAL contribution including BASE + previous More Actions
        const amount = parseFloat(currentAction.amount);
        const unit = currentAction.unit;

        // Convert based on unit
        if (unit === 'K') {
          contribution = amount * 1000;
        } else if (unit === 'Mil') {
          contribution = amount * 1000000;
        } else if (unit === 'actual') {
          contribution = amount;
        } else {
          // No unit - infer based on magnitude
          contribution = amount < 1000 ? amount * 1000 : amount;
        }
      } else {
        // No action in this More Action round, check previous rounds (most recent first)
        const blindsAntes = (data.postedSB || 0) + (data.postedBB || 0) + (data.postedAnte || 0);

        // For More Action 2, check More Action 1 first
        if (actionLevel === 'more2') {
          const moreAction1 = getPreflopAction(p, '_moreAction', playerData);
          console.log(`      [DEBUG] ${p.name} More Action 1 data:`, moreAction1);
          if (moreAction1 && moreAction1.amount && parseFloat(moreAction1.amount) > 0) {
            const amount = parseFloat(moreAction1.amount);
            const unit = moreAction1.unit;
            console.log(`      [DEBUG] ${p.name} MA1 amount=${amount}, unit=${unit}`);

            // Convert based on unit
            if (unit === 'K') {
              contribution = amount * 1000;
            } else if (unit === 'Mil') {
              contribution = amount * 1000000;
            } else if (unit === 'actual') {
              contribution = amount;
            } else {
              // No unit - infer based on magnitude
              contribution = amount < 1000 ? amount * 1000 : amount;
            }
            console.log(`      [DEBUG] ${p.name} MA1 contribution=${contribution}`);
          } else {
            console.log(`      [DEBUG] ${p.name} No More Action 1, falling back to BASE`);
            // Fall back to BASE round
            const baseAction = getPreflopAction(p, '', playerData);
            if (baseAction && baseAction.amount && parseFloat(baseAction.amount) > 0) {
              const amount = parseFloat(baseAction.amount);
              const unit = baseAction.unit;

              // Convert based on unit
              if (unit === 'K') {
                contribution = amount * 1000;
              } else if (unit === 'Mil') {
                contribution = amount * 1000000;
              } else if (unit === 'actual') {
                contribution = amount;
              } else {
                // No unit - infer based on magnitude
                contribution = amount < 1000 ? amount * 1000 : amount;
              }
            } else {
              contribution = blindsAntes;
            }
          }
        } else {
          // For More Action 1, fall back to BASE round
          const baseAction = getPreflopAction(p, '', playerData);
          if (baseAction && baseAction.amount && parseFloat(baseAction.amount) > 0) {
            const amount = parseFloat(baseAction.amount);
            const unit = baseAction.unit;

            // Convert based on unit
            if (unit === 'K') {
              contribution = amount * 1000;
            } else if (unit === 'Mil') {
              contribution = amount * 1000000;
            } else if (unit === 'actual') {
              contribution = amount;
            } else {
              // No unit - infer based on magnitude
              contribution = amount < 1000 ? amount * 1000 : amount;
            }
          } else {
            contribution = blindsAntes;
          }
        }
      }
    }

    return {
      playerId: p.id,
      playerName: p.name,
      contribution,
      action: getPreflopAction(p, suffix, playerData)?.action || 'none',
      isAllIn: data.isForcedAllInPreflop || checkIfPlayerAllIn(p, stage, actionLevel, playerData)
    };
  });

  console.log('   Contributions:');
  contributions.forEach(c => {
    console.log(`      ${c.playerName}: contribution=${c.contribution}, action="${c.action}", isAllIn=${c.isAllIn}`);
  });

  // Find max contribution
  const maxContribution = Math.max(...contributions.map(c => c.contribution));
  console.log('   Max Contribution:', maxContribution);

  // Check if all players have acted
  // A player has acted if:
  // 1. They have an action that's not 'none' or 'no action' (undefined action becomes 'none')
  // 2. OR they are all-in
  // 3. OR they already matched the max bet (check contribution)
  const playersWithoutAction = contributions.filter(c => {
    const hasNoAction = c.action === 'none' || c.action === 'no action';
    const notAllIn = !c.isAllIn;
    const matchedBet = c.contribution >= maxContribution;

    console.log(`      ${c.playerName}: hasNoAction=${hasNoAction}, notAllIn=${notAllIn}, matchedBet=${matchedBet}`);

    // Player needs to act if: no action, not all-in, AND hasn't matched the bet
    return hasNoAction && notAllIn && !matchedBet;
  });

  if (playersWithoutAction.length > 0) {
    console.log('   → Players without action:', playersWithoutAction.map(p => p.playerName));
    console.log('   → Round NOT complete (players pending action)');
    console.log('═══════════════════════════════════════════');
    return {
      isComplete: false,
      reason: 'Players pending action',
      pendingPlayers: playersWithoutAction.map(p => p.playerId)
    };
  }

  // Check if all players have matching contributions OR are all-in
  const playersWithMismatch = contributions.filter(c => {
    return !c.isAllIn && c.contribution < maxContribution;
  });

  if (playersWithMismatch.length > 0) {
    console.log('   → Players with mismatched contributions:', playersWithMismatch.map(p => p.playerName));
    console.log('   → Round NOT complete (contributions not matched)');
    console.log('═══════════════════════════════════════════');
    return {
      isComplete: false,
      reason: 'Contributions not matched',
      pendingPlayers: playersWithMismatch.map(p => p.playerId),
      maxContribution
    };
  }

  // All checks passed - round is complete
  console.log('   → All checks passed, round COMPLETE');
  console.log('═══════════════════════════════════════════');
  return {
    isComplete: true,
    reason: 'All players acted and contributions matched',
    maxContribution
  };
}

/**
 * Check if postflop betting round is complete
 */
function checkPostflopRoundComplete(
  stage: Stage,
  actionLevel: ActionLevel,
  activePlayers: Player[],
  playerData: PlayerData
): RoundCompletionResult {
  console.log('🔍 Checking POSTFLOP round completion');

  // Get action suffix for this level
  const suffix = actionLevel === 'base' ? '' : actionLevel === 'more' ? '_moreAction' : '_moreAction2';

  // Get all postflop actions for this action level
  const contributions = activePlayers.map(p => {
    const data = playerData[p.id];
    const actionKey = `${stage}${suffix}Action`;
    const amountKey = `${stage}${suffix}Amount`;

    const action = data[actionKey] as string | undefined;
    let contribution = 0;

    if (action === 'bet' || action === 'raise' || action === 'call') {
      contribution = parseFloat((data[amountKey] as string) || '0');
    }

    return {
      playerId: p.id,
      playerName: p.name,
      contribution,
      action: action || 'none',
      isAllIn: checkIfPlayerAllIn(p, stage, actionLevel, playerData)
    };
  });

  console.log('   Contributions:', contributions);

  // Find max contribution
  const maxContribution = Math.max(...contributions.map(c => c.contribution));
  console.log('   Max Contribution:', maxContribution);

  // Postflop special case: If no one has bet/raised, all must check
  if (maxContribution === 0) {
    const allCheckedOrAllIn = contributions.every(c =>
      c.action === 'check' || c.isAllIn
    );

    if (allCheckedOrAllIn) {
      console.log('   → All players checked or all-in, round COMPLETE');
      console.log('═══════════════════════════════════════════');
      return {
        isComplete: true,
        reason: 'All players checked or all-in',
        maxContribution: 0
      };
    } else {
      console.log('   → Not all players have checked');
      console.log('   → Round NOT complete');
      console.log('═══════════════════════════════════════════');
      return {
        isComplete: false,
        reason: 'Players pending action (check required)',
        pendingPlayers: contributions.filter(c => c.action === 'none' && !c.isAllIn).map(c => c.playerId)
      };
    }
  }

  // Check if all players have acted
  const playersWithoutAction = contributions.filter(c => c.action === 'none' && !c.isAllIn);
  if (playersWithoutAction.length > 0) {
    console.log('   → Players without action:', playersWithoutAction.map(p => p.playerName));
    console.log('   → Round NOT complete (players pending action)');
    console.log('═══════════════════════════════════════════');
    return {
      isComplete: false,
      reason: 'Players pending action',
      pendingPlayers: playersWithoutAction.map(p => p.playerId)
    };
  }

  // Check if all players have matching contributions OR are all-in
  const playersWithMismatch = contributions.filter(c => {
    return !c.isAllIn && c.contribution < maxContribution;
  });

  if (playersWithMismatch.length > 0) {
    console.log('   → Players with mismatched contributions:', playersWithMismatch.map(p => p.playerName));
    console.log('   → Round NOT complete (contributions not matched)');
    console.log('═══════════════════════════════════════════');
    return {
      isComplete: false,
      reason: 'Contributions not matched',
      pendingPlayers: playersWithMismatch.map(p => p.playerId),
      maxContribution
    };
  }

  // All checks passed - round is complete
  console.log('   → All checks passed, round COMPLETE');
  console.log('═══════════════════════════════════════════');
  return {
    isComplete: true,
    reason: 'All players acted and contributions matched',
    maxContribution
  };
}

/**
 * Check if a player has folded in a specific stage/level
 */
function checkIfPlayerFolded(
  player: Player,
  stage: Stage,
  actionLevel: ActionLevel,
  playerData: PlayerData
): boolean {
  const data = playerData[player.id];
  const suffix = actionLevel === 'base' ? '' : actionLevel === 'more' ? '_moreAction' : '_moreAction2';

  // Check all previous stages and current stage
  const stages: Stage[] = ['preflop', 'flop', 'turn', 'river'];
  const stageIndex = stages.indexOf(stage);

  for (let i = 0; i <= stageIndex; i++) {
    const checkStage = stages[i];

    // For current stage, check up to current action level
    if (i === stageIndex) {
      // Check base action
      const baseActionKey = `${checkStage}Action`;
      if (data[baseActionKey] === 'fold') return true;

      // Check more action if we're at more or more2 level
      if (actionLevel === 'more' || actionLevel === 'more2') {
        const moreActionKey = `${checkStage}_moreActionAction`;
        if (data[moreActionKey] === 'fold') return true;
      }

      // Check more2 action if we're at more2 level
      if (actionLevel === 'more2') {
        const more2ActionKey = `${checkStage}_moreAction2Action`;
        if (data[more2ActionKey] === 'fold') return true;
      }
    } else {
      // For previous stages, check all action levels
      const baseActionKey = `${checkStage}Action`;
      const moreActionKey = `${checkStage}_moreActionAction`;
      const more2ActionKey = `${checkStage}_moreAction2Action`;

      if (data[baseActionKey] === 'fold') return true;
      if (data[moreActionKey] === 'fold') return true;
      if (data[more2ActionKey] === 'fold') return true;
    }
  }

  return false;
}

/**
 * Check if a player is all-in at a specific stage/level
 */
function checkIfPlayerAllIn(
  player: Player,
  stage: Stage,
  actionLevel: ActionLevel,
  playerData: PlayerData
): boolean {
  const data = playerData[player.id];
  const suffix = actionLevel === 'base' ? '' : actionLevel === 'more' ? '_moreAction' : '_moreAction2';

  // Check if forced all-in during preflop blind posting
  if (data.isForcedAllInPreflop) return true;

  // Check current stage/level for all-in action
  const actionKey = `${stage}${suffix}Action`;
  if (data[actionKey] === 'all-in') return true;

  // Check all previous stages and action levels
  const stages: Stage[] = ['preflop', 'flop', 'turn', 'river'];
  const stageIndex = stages.indexOf(stage);

  for (let i = 0; i < stageIndex; i++) {
    const checkStage = stages[i];

    const baseActionKey = `${checkStage}Action`;
    const moreActionKey = `${checkStage}_moreActionAction`;
    const more2ActionKey = `${checkStage}_moreAction2Action`;

    if (data[baseActionKey] === 'all-in') return true;
    if (data[moreActionKey] === 'all-in') return true;
    if (data[more2ActionKey] === 'all-in') return true;
  }

  return false;
}

/**
 * Get preflop action for a player at a specific level
 */
function getPreflopAction(
  player: Player,
  suffix: string,
  playerData: PlayerData
): { action: string; amount: string; unit?: string } | null {
  const data = playerData[player.id];
  const actionKey = `preflop${suffix}Action`;
  const amountKey = `preflop${suffix}Amount`;
  const unitKey = `preflop${suffix}Unit`;

  const action = data[actionKey] as string | undefined;
  const amount = data[amountKey] as string | undefined;
  const unit = data[unitKey] as string | undefined;

  if (action) {
    return { action, amount: amount || '0', unit };
  }

  return null;
}
