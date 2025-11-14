/**
 * Pot Calculation Engine
 *
 * Implements the three-step pot calculation system documented in COMPLETE_SYSTEM_HANDOVER.md:
 * 1. gatherContributions() - Collect player contributions
 * 2. calculateDeadMoney() - Calculate ante, folded blinds, folded bets
 * 3. createPots() - Create main pot and side pots
 */

import type { Player, PlayerData, Stage, ActionLevel, ChipUnit, ProcessedSections, SectionStacks } from '../../../types/poker';
import type { ContributedAmounts, BettingRoundStatus, PreviousRoundInfo, PotStructure, Pot, DeadMoney, PotPlayer } from '../../../types/poker/pot.types';
import { convertToActualValue } from '../utils/formatUtils';

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
 * Helper function to create a PotPlayer from a PlayerContribution
 */
function createPotPlayer(player: PlayerContribution): PotPlayer {
  return {
    id: player.playerId,
    name: player.playerName,
    position: player.position,
    contribution: player.totalContributed,
    totalContribution: player.totalContributed,
    isAllIn: player.isAllIn
  };
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
  zeroContributors: PotPlayer[];
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

    // For preflop base ONLY: Add posted blinds and antes
    let postedSB = 0;
    let postedBB = 0;
    let postedAnte = 0;

    if (stage === 'preflop' && includeBase) {
      const position = normalizePosition(player.position);

      if (position === 'sb') {
        postedSB = data.postedSB || 0;
        // Don't add to totalContributed yet - will be added with actions if player stays
        console.log(`   💵 ${player.name} (SB): Posted SB ${postedSB}`);
      } else if (position === 'bb') {
        postedBB = data.postedBB || 0;
        postedAnte = data.postedAnte || 0;
        // Don't add to totalContributed yet - will be added based on whether player stays or folds
        console.log(`   💵 ${player.name} (BB): Posted BB ${postedBB}, Ante ${postedAnte}`);
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

    // Add blind/ante contributions based on fold/stay status
    if (stage === 'preflop' && includeBase) {
      if (isFolded) {
        // When player folds, posted blinds/antes become dead money for pot
        if (postedSB > 0) {
          totalContributed += postedSB;
          console.log(`   💀 ${player.name} (SB) folded: ${postedSB} goes to pot as dead money`);
        }
        if (postedBB > 0 || postedAnte > 0) {
          const bbAnteTotal = postedBB + postedAnte;
          totalContributed += bbAnteTotal;
          console.log(`   💀 ${player.name} (BB) folded: ${postedBB} (BB) + ${postedAnte} (Ante) = ${bbAnteTotal} goes to pot as dead money`);
        }
      } else {
        // When player stays, contributedAmounts contains ADDITIONAL amount beyond posted blinds
        // So we need to add the posted blind to get the total contribution
        // Ante for BB is always dead money (not counted in contribution matching)
        if (postedSB > 0) {
          totalContributed += postedSB;
          console.log(`   💰 ${player.name} (SB) stayed: ${postedSB} SB included in actions`);
        }
        if (postedBB > 0) {
          totalContributed += postedBB;
          console.log(`   💰 ${player.name} (BB) stayed: ${postedBB} BB included in actions`);
        }
        if (postedAnte > 0) {
          // Ante is dead money but needs to be deducted from stack
          // It's NOT part of contribution matching, so we don't add it to totalContributed here
          console.log(`   💰 ${player.name} (BB) stayed: ${postedAnte} ante is dead money (separate from contribution)`);
        }
      }
    }

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
        const additionalBets = contrib.totalContributed - contrib.postedSB - contrib.postedBB - contrib.postedAnte;
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
      eligiblePlayers: activePlayers.map(createPotPlayer),
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
      zeroContributors: activePlayers.filter(p => p.totalContributed === 0).map(createPotPlayer)
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
      .map(p => ({ ...createPotPlayer(p), reason: 'Below contribution level' }));

    const pot: Pot = {
      potNumber: pots.length,
      amount: potAmount,
      cappedAt: currentCap,
      eligiblePlayers: playersAtThisLevel.map(createPotPlayer),
      excludedPlayers,
      percentage: 0 // Will be calculated later
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
    zeroContributors: activePlayers.filter(p => p.totalContributed === 0).map(createPotPlayer)
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
): PotStructure {
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

  // Step 1.5: Check if betting round is complete
  const bettingRoundStatus = checkBettingRoundStatus(contributions);

  // Step 2: Calculate dead money
  const deadMoney = calculateDeadMoney(stage, contributions);

  // Step 3: Create pots
  const potInfo = createPots(contributions, deadMoney, previousStreetPot, stage, level);

  console.log(`\n🎰 ${'='.repeat(60)}`);
  console.log(`🎰 POT CALCULATION COMPLETE`);
  console.log(`🎰 ${'='.repeat(60)}\n\n`);

  // Return complete pot structure with betting round status
  return {
    ...potInfo,
    bettingRoundStatus
  };
}

/**
 * Check if betting round is complete or if action is still pending
 *
 * A betting round is complete when:
 * - All players have folded
 * - Only one player remains
 * - All active players have acted and contributions are equal (or all-in)
 *
 * @param contributions - Array of player contributions
 * @returns Betting round completion status
 */
export function checkBettingRoundStatus(
  contributions: PlayerContribution[]
): BettingRoundStatus {
  const activePlayers = contributions.filter(c => !c.isFolded);

  if (activePlayers.length === 0) {
    return { complete: true, reason: 'All players folded', pendingPlayers: [] };
  }

  if (activePlayers.length === 1) {
    return { complete: true, reason: 'Only one player remaining', pendingPlayers: [] };
  }

  // Check if all non-all-in players have matching contributions
  const nonAllInPlayers = activePlayers.filter(p => !p.isAllIn);

  if (nonAllInPlayers.length === 0) {
    // All remaining players are all-in
    return { complete: true, reason: 'All remaining players are all-in', pendingPlayers: [] };
  }

  // Check if all non-all-in players have the same contribution
  const maxContribution = Math.max(...nonAllInPlayers.map(p => p.totalContributed));
  const allMatched = nonAllInPlayers.every(p => p.totalContributed === maxContribution);

  if (allMatched) {
    return { complete: true, reason: 'All active players have matched bets', pendingPlayers: [] };
  }

  // Identify pending players
  const pendingPlayers = nonAllInPlayers
    .filter(p => p.totalContributed < maxContribution)
    .map(p => p.playerName);

  return {
    complete: false,
    reason: 'Action pending from some players',
    pendingPlayers: pendingPlayers
  };
}

/**
 * Get the previous round information for a player
 *
 * This looks backwards through betting rounds to find the player's most recent action
 * before the current section. Used for display purposes in pot calculation UI.
 *
 * @param playerId - The player ID to check
 * @param currentStage - Current betting stage
 * @param currentLevel - Current action level
 * @param playerData - All player action data
 * @param defaultUnit - Default chip unit
 * @returns Previous round info, or null if no previous action
 */
export function getPreviousRoundInfo(
  playerId: number,
  currentStage: Stage,
  currentLevel: ActionLevel,
  playerData: PlayerData,
  defaultUnit: ChipUnit = 'K'
): PreviousRoundInfo | null {
  try {
    // Define the order of sections
    const sectionOrder = [
      'preflop_base', 'preflop_more', 'preflop_more2',
      'flop_base', 'flop_more', 'flop_more2',
      'turn_base', 'turn_more', 'turn_more2',
      'river_base', 'river_more', 'river_more2'
    ];

    // Map level names to section keys
    const levelToKey: Record<ActionLevel, string> = {
      'base': 'base',
      'more': 'more',
      'more2': 'more2'
    };

    const currentSectionKey = `${currentStage}_${levelToKey[currentLevel] || currentLevel}`;
    const currentIndex = sectionOrder.indexOf(currentSectionKey);

    if (currentIndex <= 0) {
      return null; // No previous round
    }

    // Look backwards to find the most recent action by this player
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevSectionKey = sectionOrder[i];
      const [prevStage, prevLevelRaw] = prevSectionKey.split('_');
      const prevLevel: ActionLevel = prevLevelRaw === 'base' ? 'base' :
                        prevLevelRaw === 'more' ? 'more' : 'more2';

      // Map level to suffix for data keys
      const suffix = prevLevel === 'base' ? '' :
                     prevLevel === 'more' ? '_moreAction' : '_moreAction2';

      const actionKey = `${prevStage}${suffix}_action`;
      const amountKey = `${prevStage}${suffix}_amount`;
      const unitKey = `${prevStage}${suffix}_unit`;

      // Check if player has action data for this section
      const prevAction = playerData[playerId]?.[actionKey];

      if (prevAction && typeof prevAction === 'string' && prevAction !== 'no action' && prevAction !== '') {
        // Found a previous action!
        const amountValue = playerData[playerId]?.[amountKey];
        const amount = typeof amountValue === 'number' ? amountValue : 0;
        const unitValue = playerData[playerId]?.[unitKey];
        let unit: ChipUnit = defaultUnit;
        if (unitValue === 'K' || unitValue === 'Mil' || unitValue === 'actual') {
          unit = unitValue;
        }
        const actualAmount = convertToActualValue(amount, unit);

        const prevInfo: PreviousRoundInfo = {
          stageName: prevStage.toUpperCase(),
          levelName: prevLevel === 'base' ? 'BASE' :
                    prevLevel === 'more' ? 'MORE ACTION 1' : 'MORE ACTION 2',
          action: prevAction.charAt(0).toUpperCase() + prevAction.slice(1), // Capitalize
          amount: actualAmount,
          sectionKey: prevSectionKey
        };

        return prevInfo;
      }
    }

    return null; // No previous action found
  } catch (error) {
    console.error(`Error in getPreviousRoundInfo:`, error);
    return null; // Return null on error to avoid breaking pot calculation
  }
}
