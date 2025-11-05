/**
 * Pot Calculation Engine
 *
 * Implements the three-step pot calculation system documented in COMPLETE_SYSTEM_HANDOVER.md:
 * 1. gatherContributions() - Collect player contributions
 * 2. calculateDeadMoney() - Calculate ante, folded blinds, folded bets
 * 3. createPots() - Create main pot and side pots
 */

import type { Player, PlayerData, Stage, ActionLevel, ChipUnit, ProcessedSections, SectionStacks } from '../../../types/poker';
import type { ContributedAmounts } from '../../../types/poker/pot.types';

/**
 * Contribution object for a single player
 */
export interface PlayerContribution {
  playerId: number;
  playerName: string;
  position: string;
  totalContributed: number;
  contributions: {
    base: number;
    more: number;
    more2: number;
  };
  postedSB: number;
  postedBB: number;
  postedAnte: number;
  isFolded: boolean;
  isAllIn: boolean;
  currentStack: number;
}

/**
 * Dead money breakdown
 */
export interface DeadMoney {
  total: number;
  ante: number;
  foldedBlinds: number;
  foldedBets: number;
}

/**
 * Single pot structure
 */
export interface Pot {
  potNumber: number;
  amount: number;
  cappedAt: number;
  eligiblePlayers: { id: number; name: string }[];
  excludedPlayers: { id: number; name: string }[];
  percentage?: number;
}

/**
 * Complete pot information
 */
export interface PotInfo {
  mainPot: Pot;
  sidePots: Pot[];
  totalPot: number;
  deadMoney: number;
  deadMoneyBreakdown: DeadMoney;
  hasZeroContributor: boolean;
  zeroContributors: { id: number; name: string }[];
}

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
 * Check if player is folded in a stage
 */
function isPlayerFolded(
  playerId: number,
  stage: Stage,
  playerData: PlayerData
): boolean {
  const data = playerData[playerId];
  if (!data) return false;

  // Check all action levels for fold
  const baseAction = data[`${stage}Action`];
  const moreAction = data[`${stage}_moreActionAction`];
  const more2Action = data[`${stage}_moreAction2Action`];

  if (baseAction === 'fold') return true;
  if (moreAction === 'fold') return true;
  if (more2Action === 'fold') return true;

  // For preflop base: undefined or 'no action' = folded
  if (stage === 'preflop' && (!baseAction || baseAction === 'no action')) {
    return true;
  }

  return false;
}

/**
 * STEP 1: Gather Contributions
 *
 * Collects all player contributions for a given stage up to the specified level.
 *
 * @param stage - 'preflop', 'flop', 'turn', 'river'
 * @param level - 'base', 'more', 'more2'
 * @param players - Array of players
 * @param playerData - Player data object
 * @param contributedAmounts - Contributed amounts state
 * @param processedSections - Processed sections state
 * @param sectionStacks - Section stacks state
 * @param stackData - Game config with blinds/ante
 * @param onlyCurrentSection - If true, only gather from current section
 * @returns Array of player contributions
 */
export function gatherContributions(
  stage: Stage,
  level: ActionLevel,
  players: Player[],
  playerData: PlayerData,
  contributedAmounts: ContributedAmounts,
  processedSections: ProcessedSections,
  sectionStacks: SectionStacks,
  stackData: { bigBlind: number; smallBlind: number; ante: number },
  onlyCurrentSection: boolean = false
): PlayerContribution[] {
  console.log(`\n💰 ${'='.repeat(50)}`);
  console.log(`💰 GATHERING CONTRIBUTIONS FOR ${stage.toUpperCase()} (up to ${level})`);
  console.log(`💰 ${'='.repeat(50)}`);

  // Define section keys
  const baseSectionKey = `${stage}_base`;
  const more1SectionKey = `${stage}_more`;
  const more2SectionKey = `${stage}_more2`;

  // Determine which sections to include
  let includeBase = false;
  let includeMore = false;
  let includeMore2 = false;

  if (onlyCurrentSection) {
    // Only include the current level's section
    if (level === 'base') includeBase = true;
    else if (level === 'more') includeMore = true;
    else if (level === 'more2') includeMore2 = true;
  } else {
    // Cumulative: include all sections up to level
    if (level === 'base') {
      includeBase = true;
    } else if (level === 'more') {
      includeBase = true;
      includeMore = true;
    } else if (level === 'more2') {
      includeBase = true;
      includeMore = true;
      includeMore2 = true;
    }
  }

  console.log(`   📊 Including sections: base=${includeBase}, more=${includeMore}, more2=${includeMore2}`);
  console.log(`\n   🔍 SECTION PROCESSING STATUS:`);
  console.log(`      ${baseSectionKey}: ${processedSections[baseSectionKey] ? '✅ PROCESSED' : '❌ NOT PROCESSED'}`);
  console.log(`      ${more1SectionKey}: ${processedSections[more1SectionKey] ? '✅ PROCESSED' : '❌ NOT PROCESSED'}`);
  console.log(`      ${more2SectionKey}: ${processedSections[more2SectionKey] ? '✅ PROCESSED' : '❌ NOT PROCESSED'}`);

  // Build contributions array
  const contributions: PlayerContribution[] = [];

  for (const player of players) {
    if (!player.name) continue;

    const data = playerData[player.id] || {};
    let totalContributed = 0;
    const contributionBreakdown = { base: 0, more: 0, more2: 0 };

    // For preflop base ONLY: Add posted blinds
    let postedSB = 0;
    let postedBB = 0;
    let postedAnte = 0;

    if (stage === 'preflop' && includeBase) {
      const position = normalizePosition(player.position);

      if (position === 'sb') {
        postedSB = data.postedSB || 0;
        totalContributed += postedSB;
        console.log(`   💵 ${player.name} (SB): Posted SB ${postedSB}`);
      } else if (position === 'bb') {
        postedBB = data.postedBB || 0;
        postedAnte = data.postedAnte || 0;
        totalContributed += postedBB; // ⚠️ Ante NOT added (dead money)
        console.log(`   💵 ${player.name} (BB): Posted BB ${postedBB}, Ante ${postedAnte} (DEAD MONEY)`);
        console.log(`      ✅ BB's Live Contribution: ${postedBB} (excluding ${postedAnte} ante)`);
      }
    }

    // Add contributions from included sections
    if (includeBase && contributedAmounts[baseSectionKey]) {
      const baseContrib = contributedAmounts[baseSectionKey][player.id] || 0;
      contributionBreakdown.base = baseContrib;
      totalContributed += baseContrib;
    }

    if (includeMore && contributedAmounts[more1SectionKey]) {
      const moreContrib = contributedAmounts[more1SectionKey][player.id] || 0;
      contributionBreakdown.more = moreContrib;
      totalContributed += moreContrib;
    }

    if (includeMore2 && contributedAmounts[more2SectionKey]) {
      const more2Contrib = contributedAmounts[more2SectionKey][player.id] || 0;
      contributionBreakdown.more2 = more2Contrib;
      totalContributed += more2Contrib;
    }

    // Check if folded
    const isFolded = isPlayerFolded(player.id, stage, playerData);

    // Get current stack from latest processed section
    let currentStack = player.stack;

    // Find most recent section stack data
    const sections = [more2SectionKey, more1SectionKey, baseSectionKey];
    for (const sectionKey of sections) {
      if (sectionStacks[sectionKey]?.updated?.[player.id] !== undefined) {
        currentStack = sectionStacks[sectionKey].updated[player.id];
        break;
      }
    }

    // Check if all-in
    const isAllIn = currentStack <= 0;

    contributions.push({
      playerId: player.id,
      playerName: player.name,
      position: player.position || '',
      totalContributed,
      contributions: contributionBreakdown,
      postedSB,
      postedBB,
      postedAnte,
      isFolded,
      isAllIn,
      currentStack
    });

    if (totalContributed > 0 || isFolded) {
      console.log(`   💵 ${player.name}: ${totalContributed} contributed (${isFolded ? 'FOLDED' : 'ACTIVE'})`);
    }
  }

  const activeCount = contributions.filter(c => !c.isFolded).length;
  const foldedCount = contributions.filter(c => c.isFolded).length;

  console.log(`\n   📊 Total players: ${contributions.length}`);
  console.log(`   ✅ Active (not folded): ${activeCount}`);
  console.log(`   ❌ Folded: ${foldedCount}`);

  return contributions;
}

/**
 * STEP 2: Calculate Dead Money
 *
 * Calculates all dead money: ante, folded blinds, folded bets.
 *
 * @param stage - Current stage
 * @param contributions - Array of player contributions
 * @returns Dead money breakdown
 */
export function calculateDeadMoney(
  stage: Stage,
  contributions: PlayerContribution[]
): DeadMoney {
  console.log(`\n💀 ${'='.repeat(50)}`);
  console.log(`💀 CALCULATING DEAD MONEY FOR ${stage.toUpperCase()}`);
  console.log(`💀 ${'='.repeat(50)}`);

  let anteAmount = 0;
  let foldedBlinds = 0;
  let foldedBets = 0;

  for (const contrib of contributions) {
    // 1. Ante (preflop only)
    if (stage === 'preflop') {
      anteAmount += contrib.postedAnte;
    }

    // 2. Folded blinds (preflop only)
    if (stage === 'preflop' && contrib.isFolded) {
      const position = normalizePosition(contrib.position);

      if (position === 'sb' && contrib.postedSB > 0) {
        foldedBlinds += contrib.postedSB;
        console.log(`   💀 SB folded: ${contrib.postedSB} (${contrib.playerName})`);
      } else if (position === 'bb' && contrib.postedBB > 0) {
        foldedBlinds += contrib.postedBB;
        console.log(`   💀 BB folded: ${contrib.postedBB} (${contrib.playerName})`);
      }
    }

    // 3. Folded bets
    if (contrib.isFolded && contrib.totalContributed > 0) {
      if (stage === 'preflop') {
        // Subtract blinds and ante already counted
        const additionalBets = contrib.totalContributed - contrib.postedSB - contrib.postedBB;
        if (additionalBets > 0) {
          foldedBets += additionalBets;
          console.log(`   💀 ${contrib.playerName} folded bets: ${additionalBets}`);
        }
      } else {
        // Postflop: entire contribution is dead
        foldedBets += contrib.totalContributed;
        console.log(`   💀 ${contrib.playerName} folded bets: ${contrib.totalContributed}`);
      }
    }
  }

  const total = anteAmount + foldedBlinds + foldedBets;

  console.log(`\n   💀 Ante: ${anteAmount}`);
  console.log(`   💀 Folded blinds: ${foldedBlinds}`);
  console.log(`   💀 Folded bets: ${foldedBets}`);
  console.log(`   💀 TOTAL DEAD MONEY: ${total}`);

  return {
    total,
    ante: anteAmount,
    foldedBlinds,
    foldedBets
  };
}

/**
 * STEP 3: Create Pots
 *
 * Creates main pot and side pots based on all-in situations.
 * Adds dead money and previous street pot to main pot.
 *
 * @param contributions - Array of player contributions
 * @param deadMoney - Dead money breakdown
 * @param previousStreetPot - Pot from previous street/level
 * @param stage - Current stage
 * @param level - Current level
 * @returns Complete pot information
 */
export function createPots(
  contributions: PlayerContribution[],
  deadMoney: DeadMoney,
  previousStreetPot: number = 0,
  stage: Stage,
  level: ActionLevel
): PotInfo {
  console.log(`\n🎯 ${'='.repeat(50)}`);
  console.log(`🎯 CREATING POTS FOR ${stage.toUpperCase()} ${level.toUpperCase()}`);
  console.log(`🎯 ${'='.repeat(50)}`);

  // Get active players only (not folded)
  const activePlayers = contributions.filter(c => !c.isFolded);

  if (activePlayers.length === 0) {
    console.log(`   ⚠️  No active players - creating zero pot`);
    return {
      mainPot: {
        potNumber: 0,
        amount: deadMoney.total + previousStreetPot,
        cappedAt: 0,
        eligiblePlayers: [],
        excludedPlayers: [],
        percentage: 100
      },
      sidePots: [],
      totalPot: deadMoney.total + previousStreetPot,
      deadMoney: deadMoney.total,
      deadMoneyBreakdown: deadMoney,
      hasZeroContributor: false,
      zeroContributors: []
    };
  }

  // Calculate total contributions
  const totalContributions = activePlayers.reduce((sum, p) => sum + p.totalContributed, 0);

  // Check for all-in players
  const allInPlayers = activePlayers.filter(p => p.isAllIn);

  console.log(`   💰 Total contributions: ${totalContributions}`);
  console.log(`   💀 Dead money: ${deadMoney.total}`);
  console.log(`   🎰 Previous street pot: ${previousStreetPot}`);
  console.log(`   🔴 All-in players: ${allInPlayers.length}`);

  if (allInPlayers.length > 0) {
    console.log(`\n   🔴 ALL-IN PLAYERS DETAILS:`);
    allInPlayers.forEach(p => {
      console.log(`      ${p.playerName}: ${p.totalContributed} (all-in)`);
    });
  }

  // CASE 1: No all-ins - Single main pot
  if (allInPlayers.length === 0) {
    console.log(`\n   ✅ No all-ins - Creating single main pot`);

    const maxContribution = Math.max(...activePlayers.map(p => p.totalContributed));
    const mainPotAmount = totalContributions + deadMoney.total + previousStreetPot;

    const mainPot: Pot = {
      potNumber: 0,
      amount: mainPotAmount,
      cappedAt: maxContribution,
      eligiblePlayers: activePlayers.map(p => ({ id: p.playerId, name: p.playerName })),
      excludedPlayers: [],
      percentage: 100
    };

    console.log(`\n   🎯 MAIN POT: ${mainPotAmount}`);
    console.log(`      Capped at: ${maxContribution} per player`);
    console.log(`      Eligible: ${mainPot.eligiblePlayers.map(p => p.name).join(', ')}`);

    return {
      mainPot,
      sidePots: [],
      totalPot: totalContributions + deadMoney.total + previousStreetPot,
      deadMoney: deadMoney.total,
      deadMoneyBreakdown: deadMoney,
      hasZeroContributor: activePlayers.some(p => p.totalContributed === 0),
      zeroContributors: activePlayers.filter(p => p.totalContributed === 0).map(p => ({ id: p.playerId, name: p.playerName }))
    };
  }

  // CASE 2: Has all-ins - Create multiple pots
  console.log(`\n   🔴 Has all-ins - Creating multiple pots`);

  // Sort players by contribution (ascending)
  const sortedPlayers = [...activePlayers].sort((a, b) => a.totalContributed - b.totalContributed);

  const pots: Pot[] = [];
  let previousCap = 0;

  // Get unique contribution levels
  const uniqueLevels = [...new Set(sortedPlayers.map(p => p.totalContributed))].sort((a, b) => a - b);

  console.log(`\n   🎯 Unique contribution levels: ${uniqueLevels.join(', ')}`);

  for (let i = 0; i < uniqueLevels.length; i++) {
    const currentCap = uniqueLevels[i];
    const contributionPerPlayer = currentCap - previousCap;

    // Players at this level and above
    const playersAtThisLevel = sortedPlayers.filter(p => p.totalContributed >= currentCap);

    const potAmount = contributionPerPlayer * playersAtThisLevel.length;

    // Excluded players are those below this level
    const excludedPlayers = sortedPlayers
      .filter(p => p.totalContributed < currentCap)
      .map(p => ({ id: p.playerId, name: p.playerName }));

    const pot: Pot = {
      potNumber: pots.length,
      amount: potAmount,
      cappedAt: currentCap,
      eligiblePlayers: playersAtThisLevel.map(p => ({ id: p.playerId, name: p.playerName })),
      excludedPlayers
    };

    pots.push(pot);
    previousCap = currentCap;

    console.log(`\n   🎯 ${pots.length === 1 ? 'MAIN POT' : `SIDE POT ${pots.length - 1}`}: ${potAmount}`);
    console.log(`      Capped at: ${currentCap} per player`);
    console.log(`      Calculation: (${currentCap} - ${currentCap - contributionPerPlayer}) × ${playersAtThisLevel.length} players`);
    console.log(`      Eligible: ${pot.eligiblePlayers.map(p => p.name).join(', ')}`);
    if (excludedPlayers.length > 0) {
      console.log(`      Excluded: ${excludedPlayers.map(p => p.name).join(', ')}`);
    }
  }

  // Add dead money to main pot
  if (pots.length > 0) {
    pots[0].amount += deadMoney.total;
    console.log(`\n   💀 Added ${deadMoney.total} dead money to main pot`);
  }

  // Add previous street pot to main pot
  if (previousStreetPot > 0 && pots.length > 0) {
    pots[0].amount += previousStreetPot;
    console.log(`   🎰 Added ${previousStreetPot} from previous street to main pot`);
  }

  // Calculate percentages
  const grandTotal = totalContributions + deadMoney.total + previousStreetPot;
  pots.forEach(pot => {
    pot.percentage = grandTotal > 0 ? Math.round((pot.amount / grandTotal) * 100) : 0;
  });

  console.log(`\n   ${'='.repeat(50)}`);
  console.log(`   💰 TOTAL POT: ${grandTotal}`);
  console.log(`   ${'='.repeat(50)}`);

  return {
    mainPot: pots[0],
    sidePots: pots.slice(1),
    totalPot: grandTotal,
    deadMoney: deadMoney.total,
    deadMoneyBreakdown: deadMoney,
    hasZeroContributor: activePlayers.some(p => p.totalContributed === 0),
    zeroContributors: activePlayers.filter(p => p.totalContributed === 0).map(p => ({ id: p.playerId, name: p.playerName }))
  };
}

/**
 * Main orchestrator function for pot calculation
 *
 * Executes the three-step process and returns complete pot information.
 *
 * @param stage - Current stage
 * @param level - Current level
 * @param players - Array of players
 * @param playerData - Player data object
 * @param contributedAmounts - Contributed amounts state
 * @param processedSections - Processed sections state
 * @param sectionStacks - Section stacks state
 * @param stackData - Game config
 * @param previousStreetPot - Pot from previous street/level
 * @returns Complete pot information
 */
export function calculatePotsForBettingRound(
  stage: Stage,
  level: ActionLevel,
  players: Player[],
  playerData: PlayerData,
  contributedAmounts: ContributedAmounts,
  processedSections: ProcessedSections,
  sectionStacks: SectionStacks,
  stackData: { bigBlind: number; smallBlind: number; ante: number },
  previousStreetPot: number = 0
): PotInfo {
  console.log(`\n\n🎰 ${'='.repeat(60)}`);
  console.log(`🎰 CALCULATE POTS FOR BETTING ROUND: ${stage.toUpperCase()} ${level.toUpperCase()}`);
  console.log(`🎰 ${'='.repeat(60)}`);

  // Step 1: Gather contributions
  const contributions = gatherContributions(
    stage,
    level,
    players,
    playerData,
    contributedAmounts,
    processedSections,
    sectionStacks,
    stackData,
    false // Cumulative
  );

  // Step 2: Calculate dead money
  const deadMoney = calculateDeadMoney(stage, contributions);

  // Step 3: Create pots
  const potInfo = createPots(contributions, deadMoney, previousStreetPot, stage, level);

  console.log(`\n🎰 ${'='.repeat(60)}`);
  console.log(`🎰 POT CALCULATION COMPLETE`);
  console.log(`🎰 ${'='.repeat(60)}\n\n`);

  return potInfo;
}
