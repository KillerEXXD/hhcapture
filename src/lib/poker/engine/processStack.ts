/**
 * processStackSynchronous - Core stack processing logic
 *
 * Based on the original implementation from PokerHandCollector.tsx lines 2250-2800.
 * This function:
 * 1. Calculates current stacks for the section
 * 2. Loads cumulative "already contributed" amounts
 * 3. Processes players sequentially in action order
 * 4. Calculates actual amounts for call/bet/raise/all-in
 * 5. Updates contributedAmounts, sectionStacks, processedSections
 * 6. Calls pot calculation engine
 * 7. Returns pot information
 */

import type { Player, PlayerData, Stage, ActionLevel, ChipUnit, ProcessedSections, SectionStacks } from '../../../types/poker';
import type { ContributedAmounts } from '../../../types/poker/pot.types';
import { calculatePotsForBettingRound, type PotInfo } from './potCalculationEngine';

/**
 * Normalize position to standard format
 */
function normalizePosition(pos: string | undefined): string {
  if (!pos) return '';
  const p = pos.toLowerCase();
  if (p === 'd' || p === 'btn' || p === 'button') return 'dealer';
  if (p === 'u' || p === 'utg') return 'utg';
  return p;
}

/**
 * Convert amount from display unit to actual value
 */
function convertToActualValue(amount: number | string | undefined, unit: ChipUnit): number {
  if (!amount) return 0;
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 0;

  if (unit === 'K') return numAmount * 1000;
  if (unit === 'Mil') return numAmount * 1000000;
  return numAmount; // 'actual'
}

/**
 * Process stack result
 */
export interface ProcessStackResult {
  success: boolean;
  potInfo: PotInfo | null;
  updatedPlayerData: PlayerData;
  updatedContributedAmounts: ContributedAmounts;
  updatedSectionStacks: SectionStacks;
  updatedProcessedSections: ProcessedSections;
  error?: string;
}

/**
 * Process Stack Synchronous
 *
 * Main function for processing a betting section and calculating pots.
 *
 * @param stage - Current stage ('preflop', 'flop', 'turn', 'river')
 * @param level - Current level ('base', 'more', 'more2')
 * @param players - Array of all players
 * @param playerData - Current player data
 * @param contributedAmounts - Current contributed amounts state
 * @param processedSections - Current processed sections state
 * @param sectionStacks - Current section stacks state
 * @param stackData - Game config (blinds, ante)
 * @param defaultUnit - Default chip unit
 * @returns Process result with pot info and updated state
 */
export function processStackSynchronous(
  stage: Stage,
  level: ActionLevel,
  players: Player[],
  playerData: PlayerData,
  contributedAmounts: ContributedAmounts,
  processedSections: ProcessedSections,
  sectionStacks: SectionStacks,
  stackData: { bigBlind: number; smallBlind: number; ante: number },
  defaultUnit: ChipUnit
): ProcessStackResult {
  const sectionKey = `${stage}_${level}`;
  const suffix = level === 'base' ? '' : level === 'more' ? '_moreAction' : '_moreAction2';

  console.log('\n' + '═'.repeat(60));
  console.log(`🔄 PROCESSING (SYNC): ${stage.toUpperCase()} - ${level.toUpperCase()}`);
  console.log(`   Section Key: "${sectionKey}"`);
  console.log('═'.repeat(60));

  // STEP 1: Get active players and sort by position order
  const positionOrder = stage === 'preflop'
    ? ['utg', 'utg+1', 'utg+2', 'lj', 'hj', 'mp', 'mp+1', 'mp+2', 'co', 'dealer', 'sb', 'bb']
    : ['sb', 'bb', 'utg', 'utg+1', 'utg+2', 'lj', 'hj', 'mp', 'mp+1', 'mp+2', 'co', 'dealer'];

  let activePlayers = players
    .filter(p => p.name && p.stack > 0)
    .sort((a, b) => {
      const posA = normalizePosition(a.position).toLowerCase();
      const posB = normalizePosition(b.position).toLowerCase();
      const indexA = positionOrder.indexOf(posA);
      const indexB = positionOrder.indexOf(posB);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

  console.log(`   👥 Initial player order: ${activePlayers.map(p => `${p.name}(${p.position})`).join(' → ')}`);

  // STEP 2: Calculate current stacks for this section
  const currentStacksForSection: { [playerId: number]: number } = {};

  if (stage === 'preflop' && level === 'base') {
    console.log(`\n🎲 PREFLOP BASE - Building CURRENT stacks AFTER posting blinds`);
    players.forEach(p => {
      if (!p.name || p.stack === 0) {
        currentStacksForSection[p.id] = 0;
        return;
      }

      const data = playerData[p.id] || {};
      const normalizedPosition = normalizePosition(p.position);
      let stackAfterPosting = p.stack;

      if (normalizedPosition === 'sb' && data.postedSB) {
        stackAfterPosting -= data.postedSB as number;
      }
      if (normalizedPosition === 'bb') {
        if (data.postedBB) stackAfterPosting -= data.postedBB as number;
        if (data.postedAnte) stackAfterPosting -= data.postedAnte as number;
      }

      currentStacksForSection[p.id] = stackAfterPosting;
      console.log(`   ${p.name}: Current = ${stackAfterPosting}`);
    });
  } else if (level === 'more' || level === 'more2') {
    console.log(`\n📋 MORE ACTION - Inheriting from previous section`);
    const prevLevel = level === 'more' ? 'base' : 'more';
    const prevSectionKey = `${stage}_${prevLevel}`;
    const prevSectionData = sectionStacks[prevSectionKey];

    if (prevSectionData && prevSectionData.updated) {
      players.forEach(p => {
        const prevStack = prevSectionData.updated[p.id];
        currentStacksForSection[p.id] = prevStack !== undefined ? prevStack : p.stack;
        console.log(`   ${p.name}: Current = ${currentStacksForSection[p.id]} (from ${prevSectionKey}.updated)`);
      });
    } else {
      console.log(`   ⚠️ Previous section not found - using initial stacks`);
      players.forEach(p => {
        currentStacksForSection[p.id] = p.stack;
      });
    }
  } else {
    // Postflop BASE rounds: Use current stacks from sectionStacks (which carry over from previous street)
    console.log(`\n🎴 ${stage.toUpperCase()} BASE - Using current stacks from sectionStacks`);
    const currentSectionData = sectionStacks[sectionKey];

    if (currentSectionData && currentSectionData.current) {
      players.forEach(p => {
        const currentStack = currentSectionData.current[p.id];
        currentStacksForSection[p.id] = currentStack !== undefined ? currentStack : p.stack;
        console.log(`   ${p.name}: Current = ${currentStacksForSection[p.id]} (from ${sectionKey}.current)`);
      });
    } else {
      console.log(`   ⚠️ Section data not found - using initial stacks as fallback`);
      players.forEach(p => {
        currentStacksForSection[p.id] = p.stack;
      });
    }
  }

  // STEP 3: Calculate cumulative "already contributed" amounts
  const alreadyContributedAmounts: { [playerId: number]: number } = {};

  if (level === 'base') {
    console.log(`\n💰 BASE section - Loading posted blinds as already contributed`);

    if (stage === 'preflop') {
      players.forEach(p => {
        const data = playerData[p.id] || {};
        const normalizedPosition = normalizePosition(p.position);
        let contributed = 0;

        if (normalizedPosition === 'sb' && data.postedSB) {
          contributed = data.postedSB as number;
        } else if (normalizedPosition === 'bb' && data.postedBB) {
          contributed = data.postedBB as number;
        }

        alreadyContributedAmounts[p.id] = contributed;

        if (contributed > 0) {
          console.log(`   💰 ${p.name} already contributed (blinds): ${contributed}`);
        }
      });
    } else {
      players.forEach(p => {
        alreadyContributedAmounts[p.id] = 0;
      });
    }
  } else {
    // For more/more2: Accumulate ALL previous contributions
    console.log(`\n📊 MORE/MORE2 section - loading CUMULATIVE previous contributions`);

    players.forEach(p => {
      alreadyContributedAmounts[p.id] = 0;
    });

    // For preflop, add posted blinds first
    if (stage === 'preflop') {
      console.log(`   🎲 Adding posted blinds for preflop...`);
      players.forEach(p => {
        const data = playerData[p.id] || {};
        const normalizedPosition = normalizePosition(p.position);

        if (normalizedPosition === 'sb' && data.postedSB) {
          alreadyContributedAmounts[p.id] += data.postedSB as number;
          console.log(`      ${p.name} (SB): +${data.postedSB} (posted blind)`);
        } else if (normalizedPosition === 'bb' && data.postedBB) {
          alreadyContributedAmounts[p.id] += data.postedBB as number;
          console.log(`      ${p.name} (BB): +${data.postedBB} (posted blind)`);
        }
      });
    }

    // Add contributions from previous sections
    if (level === 'more') {
      const baseKey = `${stage}_base`;
      console.log(`   📊 Adding contributions from ${baseKey}...`);
      if (contributedAmounts[baseKey]) {
        players.forEach(p => {
          const baseContrib = contributedAmounts[baseKey][p.id] || 0;
          if (baseContrib > 0) {
            alreadyContributedAmounts[p.id] += baseContrib;
            console.log(`      ${p.name}: +${baseContrib} from ${baseKey}, total now: ${alreadyContributedAmounts[p.id]}`);
          }
        });
      }
    } else if (level === 'more2') {
      const baseKey = `${stage}_base`;
      const moreKey = `${stage}_more`;

      console.log(`   📊 Adding contributions from ${baseKey} and ${moreKey}...`);

      if (contributedAmounts[baseKey]) {
        players.forEach(p => {
          const baseContrib = contributedAmounts[baseKey][p.id] || 0;
          if (baseContrib > 0) {
            alreadyContributedAmounts[p.id] += baseContrib;
            console.log(`      ${p.name}: +${baseContrib} from ${baseKey}`);
          }
        });
      }

      if (contributedAmounts[moreKey]) {
        players.forEach(p => {
          const moreContrib = contributedAmounts[moreKey][p.id] || 0;
          if (moreContrib > 0) {
            alreadyContributedAmounts[p.id] += moreContrib;
            console.log(`      ${p.name}: +${moreContrib} from ${moreKey}, total now: ${alreadyContributedAmounts[p.id]}`);
          }
        });
      }
    }

    console.log(`   💰 FINAL cumulative contributions entering this section:`);
    players.forEach(p => {
      if (alreadyContributedAmounts[p.id] > 0) {
        console.log(`      ${p.name}: ${alreadyContributedAmounts[p.id]}`);
      }
    });
  }

  // STEP 4: Initialize maxBetSoFar
  let maxBetSoFar = 0;

  if (stage === 'preflop' && level === 'base') {
    const bbPlayer = players.find(p => normalizePosition(p.position) === 'bb');
    if (bbPlayer) {
      const data = playerData[bbPlayer.id];
      if (data && data.postedBB) {
        maxBetSoFar = data.postedBB as number;
      }
    }
  } else if (level === 'more' || level === 'more2') {
    // For More Actions, use cumulative max from already contributed
    const cumulativeTotals = Object.values(alreadyContributedAmounts).filter(v => v > 0);
    if (cumulativeTotals.length > 0) {
      maxBetSoFar = Math.max(...cumulativeTotals);
      console.log(`   🎯 More Action: Using cumulative max from alreadyContributedAmounts: ${maxBetSoFar}`);
    }
  }

  console.log(`   💰 Starting maxBetSoFar: ${maxBetSoFar}`);

  // STEP 5: Process each player sequentially
  const updatedPlayerData = { ...playerData };
  const updatedStacksForSection: { [playerId: number]: number } = {};
  const newContributedAmounts: { [playerId: number]: number } = {};

  players.forEach(p => {
    newContributedAmounts[p.id] = 0;
  });

  activePlayers.forEach(player => {
    const data = playerData[player.id] || {};
    const actionKey = `${stage}${suffix}Action`;
    const amountKey = `${stage}${suffix}Amount`;
    const unitKey = `${stage}${suffix}Unit`;
    const action = data[actionKey];
    const unit = (data[unitKey] as ChipUnit) || defaultUnit;

    console.log(`\n🎲 Processing ${player.name}:`);
    console.log(`   action: ${action}`);

    const currentStack = currentStacksForSection[player.id] || 0;
    let actualAmount = 0;

    if (action === 'call') {
      const alreadyContributed = alreadyContributedAmounts[player.id] || 0;
      const amountToCall = maxBetSoFar;
      const additionalNeeded = Math.max(0, amountToCall - alreadyContributed);

      console.log(`   📞 CALL ACTION:`);
      console.log(`      alreadyContributed (cumulative): ${alreadyContributed}`);
      console.log(`      maxBetSoFar (target): ${maxBetSoFar}`);
      console.log(`      additionalNeeded: ${additionalNeeded}`);
      console.log(`      currentStack: ${currentStack}`);

      let displayAmount;

      if (currentStack >= additionalNeeded) {
        displayAmount = amountToCall;
        actualAmount = additionalNeeded;
        console.log(`      ✅ Has enough chips`);
      } else {
        displayAmount = alreadyContributed + currentStack;
        actualAmount = currentStack;
        console.log(`      🔴 NOT enough chips - going all-in`);
        updatedPlayerData[player.id] = {
          ...updatedPlayerData[player.id],
          [actionKey]: 'all-in'
        };
      }

      newContributedAmounts[player.id] = actualAmount;

      // Update display amount in player data
      let displayAmountFormatted = displayAmount;
      if (unit === 'K') displayAmountFormatted = displayAmount / 1000;
      else if (unit === 'Mil') displayAmountFormatted = displayAmount / 1000000;

      updatedPlayerData[player.id] = {
        ...updatedPlayerData[player.id],
        [amountKey]: displayAmountFormatted.toString(),
        [unitKey]: unit
      };

      console.log(`      💾 Display amount: ${displayAmountFormatted} ${unit} (actual: ${actualAmount})`);
      console.log(`      💾 Stored in ${amountKey}: "${displayAmountFormatted}"`);
      console.log(`      💾 Stored in ${unitKey}: "${unit}"`);

    } else if (action === 'bet' || action === 'raise') {
      const amountInput = data[amountKey];
      const amountValue = typeof amountInput === 'number' || typeof amountInput === 'string' ? amountInput : undefined;
      actualAmount = convertToActualValue(amountValue, unit);

      console.log(`   💵 ${action.toUpperCase()} ACTION: ${actualAmount}`);

      // Update maxBetSoFar if this bet/raise is higher
      if (actualAmount > maxBetSoFar) {
        const oldMax = maxBetSoFar;
        maxBetSoFar = actualAmount;
        console.log(`      🎯 Updated maxBetSoFar: ${oldMax} → ${maxBetSoFar}`);
      }

      // Calculate additional needed
      const alreadyContributed = alreadyContributedAmounts[player.id] || 0;
      const additionalNeeded = Math.max(0, actualAmount - alreadyContributed);

      console.log(`      alreadyContributed: ${alreadyContributed}`);
      console.log(`      additionalNeeded: ${additionalNeeded}`);

      if (currentStack >= additionalNeeded) {
        newContributedAmounts[player.id] = additionalNeeded;
      } else {
        newContributedAmounts[player.id] = currentStack;
        console.log(`      🔴 Not enough for full ${action} - going all-in with ${currentStack}`);
        updatedPlayerData[player.id] = {
          ...updatedPlayerData[player.id],
          [actionKey]: 'all-in'
        };
      }

    } else if (action === 'all-in') {
      actualAmount = currentStack;
      newContributedAmounts[player.id] = actualAmount;
      console.log(`   🔴 ALL-IN: ${actualAmount}`);

      // Calculate display amount (total contribution)
      const alreadyContributed = alreadyContributedAmounts[player.id] || 0;
      const totalContribution = alreadyContributed + actualAmount;

      // Update maxBetSoFar if this all-in amount exceeds it
      if (totalContribution > maxBetSoFar) {
        const oldMax = maxBetSoFar;
        maxBetSoFar = totalContribution;
        console.log(`      🎯 Updated maxBetSoFar: ${oldMax} → ${maxBetSoFar} (all-in total)`);
      }

      let displayAmountFormatted = totalContribution;
      if (unit === 'K') displayAmountFormatted = totalContribution / 1000;
      else if (unit === 'Mil') displayAmountFormatted = totalContribution / 1000000;

      updatedPlayerData[player.id] = {
        ...updatedPlayerData[player.id],
        [amountKey]: displayAmountFormatted
      };

      console.log(`      💾 Display amount: ${displayAmountFormatted} ${unit}`);

    } else if (action === 'fold' || action === 'check' || action === 'no action') {
      // No contribution
      newContributedAmounts[player.id] = 0;
      console.log(`   ${action?.toUpperCase() || 'NO ACTION'}: No contribution`);
    }

    // Update stack for this player
    updatedStacksForSection[player.id] = currentStack - newContributedAmounts[player.id];
    console.log(`   📊 Updated stack: ${currentStack} - ${newContributedAmounts[player.id]} = ${updatedStacksForSection[player.id]}`);
  });

  // STEP 6: Update state objects
  const updatedContributedAmounts = {
    ...contributedAmounts,
    [sectionKey]: newContributedAmounts
  };

  const updatedSectionStacks = {
    ...sectionStacks,
    [sectionKey]: {
      initial: currentStacksForSection,
      current: currentStacksForSection,
      updated: updatedStacksForSection
    }
  };

  const updatedProcessedSections = {
    ...processedSections,
    [sectionKey]: true
  };

  // STEP 7: Calculate pots
  console.log(`\n🎰 Calling pot calculation...`);

  const potInfo = calculatePotsForBettingRound(
    stage,
    level,
    players,
    updatedPlayerData,
    updatedContributedAmounts,
    updatedProcessedSections,
    updatedSectionStacks,
    stackData,
    0 // previousStreetPot - TODO: Add in PHASE 2
  );

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ PROCESSING COMPLETE: ${sectionKey}`);
  console.log('═'.repeat(60));

  return {
    success: true,
    potInfo,
    updatedPlayerData,
    updatedContributedAmounts,
    updatedSectionStacks,
    updatedProcessedSections
  };
}
