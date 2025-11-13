/**
 * Raise Amount Validator (FR-12)
 *
 * Comprehensive validation of raise/bet amounts against available stacks and poker rules.
 *
 * Validation Rules:
 * 12.1: Cannot exceed "Now" stack
 * 12.2: Must exceed current max bet
 * 12.3: Minimum raise increment
 * 12.4: Cannot exceed starting stack (PreFlop BASE only)
 */

import type { Stage, ActionLevel, Player, PlayerData, ChipUnit, SectionStacks } from '../../../types/poker';

export interface RaiseValidationResult {
  isValid: boolean;
  errorMessage?: string;
  maxAllowed?: number;
  minRequired?: number;
  /**
   * If true, suggests user wants to go all-in but entered amount exceeds available chips.
   * UI should show confirmation dialog: "You're trying to raise to X, but you only have Y available. Go all-in instead?"
   */
  allInSuggestion?: boolean;
  suggestedAllInAmount?: number;
}

/**
 * Convert amount string and unit to actual numeric value
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
        return numericAmount * 1000;
      } else {
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
    if (numericAmount < 1000) {
      return numericAmount * 1000;
    } else {
      return numericAmount;
    }
  }

  return numericAmount;
}

/**
 * Get player's "Now" stack for current section
 */
function getNowStack(
  playerId: number,
  stage: Stage,
  actionLevel: ActionLevel,
  sectionStacks: SectionStacks
): number {
  const sectionKey = `${stage}_${actionLevel}`;
  return sectionStacks[sectionKey]?.updated?.[playerId] ?? 0;
}

/**
 * Get player's already contributed amount in current round
 * NOTE: For validation purposes, we should NOT count a player's in-progress raise/bet
 * that they are currently typing. Only count completed actions or blinds.
 */
function getAlreadyContributed(
  playerId: number,
  stage: Stage,
  actionLevel: ActionLevel,
  playerData: PlayerData,
  isValidatingThisPlayer: boolean = false
): number {
  const data = playerData[playerId];
  if (!data) return 0;

  let contribution = 0;

  // Only preflop has blinds (SB + BB)
  // NOTE: Ante is DEAD MONEY and does NOT count toward betting contribution
  const blinds = stage === 'preflop' ? ((data.postedSB || 0) + (data.postedBB || 0)) : 0;

  console.log(`🔍 [getAlreadyContributed] Player ${playerId}, stage: ${stage}, level: ${actionLevel}, isValidatingThisPlayer: ${isValidatingThisPlayer}`);
  console.log(`   Blinds: SB=${data.postedSB || 0}, BB=${data.postedBB || 0}, Total=${blinds}`);
  console.log(`   Ante (dead money, not counted): ${data.postedAnte || 0}`);

  // Build field names dynamically based on stage
  const baseActionKey = `${stage}Action` as keyof PlayerData[number];
  const baseAmountKey = `${stage}Amount` as keyof PlayerData[number];
  const baseUnitKey = `${stage}Unit` as keyof PlayerData[number];
  const moreAction1ActionKey = `${stage}_moreActionAction` as keyof PlayerData[number];
  const moreAction1AmountKey = `${stage}_moreActionAmount` as keyof PlayerData[number];
  const moreAction1UnitKey = `${stage}_moreActionUnit` as keyof PlayerData[number];

  // For BASE round
  if (actionLevel === 'base') {
    const baseAction = data[baseActionKey];
    console.log(`   BASE round: action="${baseAction}", amount="${data[baseAmountKey]}", unit="${data[baseUnitKey]}"`);

    // CRITICAL FIX: If we're validating THIS player's raise, don't count their in-progress action
    // Only count their blinds. Otherwise we compare their raise against itself!
    if (isValidatingThisPlayer) {
      console.log(`   ✓ Validating THIS player - using only blinds: ${blinds}`);
      contribution = blinds;
    } else if (baseAction && baseAction !== 'fold' && baseAction !== 'check' && baseAction !== 'no action') {
      const baseAmount = convertAmount(data[baseAmountKey] as string | undefined, data[baseUnitKey] as ChipUnit | undefined);
      console.log(`   ⚠️ Player has base action, converted amount: ${baseAmount}`);
      contribution = baseAmount; // Already includes blinds
    } else {
      console.log(`   ✓ Player has no action yet, using only blinds: ${blinds}`);
      contribution = blinds;
    }
  }

  // For More Action 1: Get contribution from BASE round only
  else if (actionLevel === 'more') {
    const baseAction = data[baseActionKey];
    if (baseAction && baseAction !== 'fold' && baseAction !== 'check' && baseAction !== 'no action') {
      const baseAmount = convertAmount(data[baseAmountKey] as string | undefined, data[baseUnitKey] as ChipUnit | undefined);
      contribution = baseAmount; // Already includes blinds
    } else {
      contribution = blinds;
    }
  }

  // For More Action 2: Get contribution from More Action 1 (which is cumulative)
  else if (actionLevel === 'more2') {
    const moreAction1 = data[moreAction1ActionKey];
    if (moreAction1 && moreAction1 !== 'fold' && moreAction1 !== 'check' && moreAction1 !== 'no action') {
      const moreAction1Amount = convertAmount(
        data[moreAction1AmountKey] as string | undefined,
        data[moreAction1UnitKey] as ChipUnit | undefined
      );
      contribution = moreAction1Amount; // This is the cumulative total through More Action 1
    } else {
      // Check BASE
      const baseAction = data[baseActionKey];
      if (baseAction && baseAction !== 'fold' && baseAction !== 'check' && baseAction !== 'no action') {
        const baseAmount = convertAmount(data[baseAmountKey] as string | undefined, data[baseUnitKey] as ChipUnit | undefined);
        contribution = baseAmount;
      } else {
        contribution = blinds;
      }
    }
  }

  return contribution;
}

/**
 * Get current max bet in the round
 * @param excludePlayerId - Optional player ID to exclude (when validating their raise)
 * @param maxPlayerIdToConsider - Optional max player ID to consider (for order-aware validation)
 */
function getMaxBet(
  stage: Stage,
  actionLevel: ActionLevel,
  players: Player[],
  playerData: PlayerData,
  excludePlayerId?: number,
  maxPlayerIdToConsider?: number
): number {
  console.log(`🔍 [getMaxBet] Calculating max bet for stage: ${stage}, level: ${actionLevel}, excluding player: ${excludePlayerId || 'none'}, maxPlayerId: ${maxPlayerIdToConsider || 'none'}`);
  let maxContribution = 0;

  // Build field names dynamically based on stage
  const baseActionKey = `${stage}Action` as keyof PlayerData[number];
  const baseAmountKey = `${stage}Amount` as keyof PlayerData[number];
  const baseUnitKey = `${stage}Unit` as keyof PlayerData[number];
  const moreAction1ActionKey = `${stage}_moreActionAction` as keyof PlayerData[number];
  const moreAction1AmountKey = `${stage}_moreActionAmount` as keyof PlayerData[number];
  const moreAction1UnitKey = `${stage}_moreActionUnit` as keyof PlayerData[number];
  const moreAction2ActionKey = `${stage}_moreAction2Action` as keyof PlayerData[number];
  const moreAction2AmountKey = `${stage}_moreAction2Amount` as keyof PlayerData[number];
  const moreAction2UnitKey = `${stage}_moreAction2Unit` as keyof PlayerData[number];

  for (const player of players) {
    if (!player.name) continue;

    const data = playerData[player.id];
    if (!data) continue;

    // Skip players who haven't acted yet (order-aware validation)
    if (maxPlayerIdToConsider !== undefined && player.id > maxPlayerIdToConsider) {
      console.log(`   Player ${player.id} (${player.name}): SKIPPED (hasn't acted yet in this validation order)`);
      continue;
    }

    // Skip folded players
    if (data[baseActionKey] === 'fold') continue;
    if (data[moreAction1ActionKey] === 'fold') continue;
    if (data[moreAction2ActionKey] === 'fold') continue;

    let contribution = 0;

    // Only preflop has blinds (SB + BB). Ante is dead money and NOT counted.
    const blinds = stage === 'preflop' ? ((data.postedSB || 0) + (data.postedBB || 0)) : 0;

    // BASE round: Use action amount if exists (already includes blinds), otherwise just blinds
    const baseAction = data[baseActionKey];

    // CRITICAL: If this is the player being validated, we need to exclude their in-progress action
    // at the CURRENT action level, but still count their completed actions from PRIOR levels
    const isExcludedPlayer = excludePlayerId && player.id === excludePlayerId;

    // Start with BASE action (or blinds if no BASE action yet)
    if (actionLevel === 'base' && isExcludedPlayer) {
      // Validating BASE: exclude in-progress BASE action, use only blinds
      contribution = blinds;
      console.log(`   Player ${player.id} (${player.name}): VALIDATING BASE - using only blinds: ${blinds}`);
    } else if (baseAction && baseAction !== 'fold' && baseAction !== 'check' && baseAction !== 'no action') {
      const baseAmount = convertAmount(data[baseAmountKey] as string | undefined, data[baseUnitKey] as ChipUnit | undefined);
      contribution = baseAmount;
      console.log(`   Player ${player.id} (${player.name}): baseAction="${baseAction}", amount="${data[baseAmountKey]}", converted=${baseAmount}`);
    } else {
      contribution = blinds;
      console.log(`   Player ${player.id} (${player.name}): no action, blinds=${blinds}`);
    }

    // For More Action 1: Use More Action 1 amount if exists
    // BUT: If validating MORE level, exclude this player's MORE action (still count their BASE)
    if (actionLevel === 'more' || actionLevel === 'more2') {
      const moreAction1 = data[moreAction1ActionKey];
      if (moreAction1 && moreAction1 !== 'fold' && moreAction1 !== 'check' && moreAction1 !== 'no action') {
        if (actionLevel === 'more' && isExcludedPlayer) {
          // Validating MORE: exclude in-progress MORE action, keep BASE contribution
          console.log(`   Player ${player.id} (${player.name}): VALIDATING MORE - keeping BASE: ${contribution}`);
        } else {
          const moreAction1Amount = convertAmount(
            data[moreAction1AmountKey] as string | undefined,
            data[moreAction1UnitKey] as ChipUnit | undefined
          );
          contribution = moreAction1Amount;
          console.log(`   Player ${player.id} (${player.name}): moreAction1="${moreAction1}", amount="${data[moreAction1AmountKey]}", converted=${moreAction1Amount}`);
        }
      }
    }

    // For More Action 2: Use More Action 2 amount if exists
    // BUT: If validating MORE2 level, exclude this player's MORE2 action (still count BASE + MORE)
    if (actionLevel === 'more2') {
      const moreAction2 = data[moreAction2ActionKey];
      if (moreAction2 && moreAction2 !== 'fold' && moreAction2 !== 'check' && moreAction2 !== 'no action') {
        if (isExcludedPlayer) {
          // Validating MORE2: exclude in-progress MORE2 action, keep BASE + MORE contribution
          console.log(`   Player ${player.id} (${player.name}): VALIDATING MORE2 - keeping BASE+MORE: ${contribution}`);
        } else {
          const moreAction2Amount = convertAmount(
            data[moreAction2AmountKey] as string | undefined,
            data[moreAction2UnitKey] as ChipUnit | undefined
          );
          contribution = moreAction2Amount;
          console.log(`   Player ${player.id} (${player.name}): moreAction2="${moreAction2}", amount="${data[moreAction2AmountKey]}", converted=${moreAction2Amount}`);
        }
      }
    }

    maxContribution = Math.max(maxContribution, contribution);
  }

  console.log(`   → Max contribution found: ${maxContribution}`);
  return maxContribution;
}

/**
 * Get previous bet (for calculating minimum raise increment)
 * This is the second-highest bet amount
 */
function getPreviousBet(
  stage: Stage,
  actionLevel: ActionLevel,
  players: Player[],
  playerData: PlayerData
): number {
  const contributions: number[] = [];

  // Build field names dynamically based on stage
  const baseActionKey = `${stage}Action` as keyof PlayerData[number];
  const baseAmountKey = `${stage}Amount` as keyof PlayerData[number];
  const baseUnitKey = `${stage}Unit` as keyof PlayerData[number];
  const moreAction1ActionKey = `${stage}_moreActionAction` as keyof PlayerData[number];
  const moreAction1AmountKey = `${stage}_moreActionAmount` as keyof PlayerData[number];
  const moreAction1UnitKey = `${stage}_moreActionUnit` as keyof PlayerData[number];
  const moreAction2ActionKey = `${stage}_moreAction2Action` as keyof PlayerData[number];
  const moreAction2AmountKey = `${stage}_moreAction2Amount` as keyof PlayerData[number];
  const moreAction2UnitKey = `${stage}_moreAction2Unit` as keyof PlayerData[number];

  for (const player of players) {
    if (!player.name) continue;

    const data = playerData[player.id];
    if (!data) continue;

    // Skip folded players
    if (data[baseActionKey] === 'fold') continue;
    if (data[moreAction1ActionKey] === 'fold') continue;
    if (data[moreAction2ActionKey] === 'fold') continue;

    let contribution = 0;

    // Only preflop has blinds (SB + BB). Ante is dead money and NOT counted.
    const blinds = stage === 'preflop' ? ((data.postedSB || 0) + (data.postedBB || 0)) : 0;

    // BASE round
    const baseAction = data[baseActionKey];
    if (baseAction && baseAction !== 'fold' && baseAction !== 'check' && baseAction !== 'no action') {
      const baseAmount = convertAmount(data[baseAmountKey] as string | undefined, data[baseUnitKey] as ChipUnit | undefined);
      contribution = baseAmount;
    } else {
      contribution = blinds;
    }

    // For More Action 1 or More Action 2
    if (actionLevel === 'more' || actionLevel === 'more2') {
      const moreAction1 = data[moreAction1ActionKey];
      if (moreAction1 && moreAction1 !== 'fold' && moreAction1 !== 'check' && moreAction1 !== 'no action') {
        const moreAction1Amount = convertAmount(
          data[moreAction1AmountKey] as string | undefined,
          data[moreAction1UnitKey] as ChipUnit | undefined
        );
        contribution = moreAction1Amount;
      }
    }

    // For More Action 2
    if (actionLevel === 'more2') {
      const moreAction2 = data[moreAction2ActionKey];
      if (moreAction2 && moreAction2 !== 'fold' && moreAction2 !== 'check' && moreAction2 !== 'no action') {
        const moreAction2Amount = convertAmount(
          data[moreAction2AmountKey] as string | undefined,
          data[moreAction2UnitKey] as ChipUnit | undefined
        );
        contribution = moreAction2Amount;
      }
    }

    if (contribution > 0) {
      contributions.push(contribution);
    }
  }

  // Sort descending and get second-highest
  contributions.sort((a, b) => b - a);
  return contributions.length > 1 ? contributions[1] : 0;
}

/**
 * Get starting stack for player (for PreFlop BASE validation)
 */
function getStartingStack(playerId: number, players: Player[]): number {
  const player = players.find(p => p.id === playerId);
  return player?.stack ?? 0;
}

/**
 * Validate raise/bet amount according to FR-12
 *
 * @param playerId - Player making the raise/bet
 * @param raiseToAmount - The total amount player wants to raise/bet to
 * @param stage - Current stage ('preflop', 'flop', 'turn', 'river')
 * @param actionLevel - Current action level ('base', 'more', 'more2')
 * @param players - All players in the game
 * @param playerData - Player data with actions and amounts
 * @param sectionStacks - Section stacks tracking
 * @param inputUnit - The unit used for the input amount
 * @param maxPlayerIdToConsider - Optional max player ID to consider (for order-aware validation)
 * @returns Validation result with error message if invalid
 */
export function validateRaiseAmount(
  playerId: number,
  raiseToAmount: number,
  stage: Stage,
  actionLevel: ActionLevel,
  players: Player[],
  playerData: PlayerData,
  sectionStacks: SectionStacks,
  inputUnit: ChipUnit,
  maxPlayerIdToConsider?: number
): RaiseValidationResult {
  console.log(`🔍 [validateRaiseAmount] Player ${playerId}, raiseToAmount: ${raiseToAmount}, stage: ${stage}, level: ${actionLevel}`);

  // Convert raiseToAmount based on unit
  const actualRaiseToAmount = convertAmount(raiseToAmount, inputUnit);
  console.log(`   Converted raiseToAmount: ${actualRaiseToAmount}`);

  // FR-12.1: Cannot exceed "Now" stack
  const playerNowStack = getNowStack(playerId, stage, actionLevel, sectionStacks);
  // Pass true to indicate we're validating THIS player, so don't count their in-progress action
  const alreadyContributed = getAlreadyContributed(playerId, stage, actionLevel, playerData, true);
  const additionalNeeded = actualRaiseToAmount - alreadyContributed;

  console.log(`   Now stack: ${playerNowStack}, Already contributed: ${alreadyContributed}, Additional needed: ${additionalNeeded}`);

  // Calculate max total amount player can raise to (already contributed + current stack)
  const maxAllowed = alreadyContributed + playerNowStack;

  // Check if player is trying to raise more than they have available
  if (actualRaiseToAmount > maxAllowed) {
    // Exceeds available - suggest all-in as alternative
    return {
      isValid: false,
      errorMessage: `Cannot raise to ${actualRaiseToAmount}. You only have ${playerNowStack} available (already contributed ${alreadyContributed}). Would you like to go all-in for ${maxAllowed} instead?`,
      maxAllowed,
      allInSuggestion: true,
      suggestedAllInAmount: maxAllowed
    };
  }

  // Special case: If player is trying to raise equal to their total available (all-in)
  if (actualRaiseToAmount === maxAllowed) {
    console.log(`   → All-in detected: raise amount (${actualRaiseToAmount}) equals max available (${maxAllowed})`);
    return {
      isValid: true,
      allInSuggestion: true,
      suggestedAllInAmount: maxAllowed,
      errorMessage: `You're trying to raise to ${actualRaiseToAmount}, which is your total available. This will put you all-in.`
    };
  }

  // FR-12.2: Must exceed current max bet
  // Exclude THIS player from max bet calculation (don't compare raise against itself)
  // Only consider players who have acted before this player (order-aware validation)
  const currentMaxBet = getMaxBet(stage, actionLevel, players, playerData, playerId, maxPlayerIdToConsider);
  console.log(`   Current max bet: ${currentMaxBet}`);

  // FR-12.3: Get previous bet for minimum raise increment calculation
  const previousBet = getPreviousBet(stage, actionLevel, players, playerData);
  console.log(`   Previous bet: ${previousBet}`);

  if (actualRaiseToAmount <= currentMaxBet) {
    // For preflop with no raises yet, currentMaxBet is the BB
    // In this case, minimum raise should be 2x BB
    const isBigBlindScenario = stage === 'preflop' && previousBet === 0;
    const minRaise = isBigBlindScenario ? currentMaxBet * 2 : currentMaxBet + 1;

    let errorMessage: string;
    if (isBigBlindScenario) {
      errorMessage = `Raise amount (${actualRaiseToAmount}) is less than the big blind (${currentMaxBet}). Minimum raise must be at least 2x BB = ${minRaise}.`;
    } else {
      errorMessage = `Raise amount (${actualRaiseToAmount}) must be greater than current max bet (${currentMaxBet}).`;
    }

    return {
      isValid: false,
      errorMessage,
      minRequired: minRaise
    };
  }

  // FR-12.3: Minimum raise increment
  const raiseIncrement = currentMaxBet - previousBet;
  const minValidRaise = currentMaxBet + raiseIncrement;

  console.log(`   Raise increment: ${raiseIncrement}, Min valid raise: ${minValidRaise}`);

  if (actualRaiseToAmount < minValidRaise && raiseIncrement > 0) {
    return {
      isValid: false,
      errorMessage: `Minimum raise is ${minValidRaise}. Previous raise increment was ${raiseIncrement}.`,
      minRequired: minValidRaise
    };
  }

  // FR-12.4: Cannot exceed starting stack (PreFlop BASE only)
  if (stage === 'preflop' && actionLevel === 'base') {
    const startingStack = getStartingStack(playerId, players);
    console.log(`   PreFlop BASE: Starting stack = ${startingStack}`);

    if (actualRaiseToAmount > startingStack) {
      return {
        isValid: false,
        errorMessage: `Cannot raise to ${actualRaiseToAmount}. Your starting stack is ${startingStack}.`,
        maxAllowed: startingStack
      };
    }
  }

  // All validations passed
  console.log(`   ✅ Validation passed`);
  return {
    isValid: true
  };
}
