/**
 * Pot Display Formatter
 *
 * Converts pot calculation results into format expected by PotCalculationDisplay component
 */

import type { Player, Stage } from '../../../types/poker';
import type { PotInfo as EnginePotInfo } from './potCalculationEngine';
import type { ContributedAmounts } from '../../../types/poker/pot.types';

/**
 * Display component interfaces (matching PotCalculationDisplay.tsx)
 */
export interface PlayerContribution {
  playerId: number;
  amount: number;
  isAllIn?: boolean;
  isExcluded?: boolean;
  exclusionReason?: string;
}

export interface StreetContribution {
  street: 'preflop' | 'flop' | 'turn' | 'river';
  amount: number;
  detail: string;
}

export interface DisplayPotInfo {
  potType: 'main' | 'side';
  potNumber?: number;
  amount: number;
  eligiblePlayers: Player[];
  excludedPlayers?: Array<{ player: Player; reason: string }>;
  contributions: PlayerContribution[];
  streetBreakdown: StreetContribution[];
  calculation: {
    formula: string;
    variables: Record<string, string | number>;
    result: string;
  };
  description: string;
}

export interface DisplayPotData {
  totalPot: number;
  mainPot: DisplayPotInfo;
  sidePots: DisplayPotInfo[];
  players: Player[];
}

/**
 * Format pot calculation results for display component
 */
export function formatPotsForDisplay(
  enginePotInfo: EnginePotInfo,
  players: Player[],
  contributedAmounts: ContributedAmounts,
  currentStreet: Stage
): DisplayPotData {
  const { mainPot, sidePots, totalPot, deadMoneyBreakdown } = enginePotInfo;

  // Format main pot
  const formattedMainPot = formatPotInfo(
    mainPot,
    'main',
    undefined,
    players,
    contributedAmounts,
    currentStreet,
    deadMoneyBreakdown
  );

  // Format side pots
  const formattedSidePots = sidePots.map((pot, index) =>
    formatPotInfo(
      pot,
      'side',
      index + 1,
      players,
      contributedAmounts,
      currentStreet,
      deadMoneyBreakdown
    )
  );

  return {
    totalPot,
    mainPot: formattedMainPot,
    sidePots: formattedSidePots,
    players: players.filter(p => p.name), // Only include named players
  };
}

/**
 * Format a single pot for display
 */
function formatPotInfo(
  pot: EnginePotInfo['mainPot'],
  potType: 'main' | 'side',
  potNumber: number | undefined,
  players: Player[],
  contributedAmounts: ContributedAmounts,
  currentStreet: Stage,
  deadMoneyBreakdown: { total: number; ante: number; foldedBlinds: number; foldedBets: number }
): DisplayPotInfo {
  // Get eligible and excluded players
  const eligiblePlayers = players.filter(p =>
    pot.eligiblePlayers.some(ep => ep.id === p.id)
  );

  const excludedPlayers = players
    .filter(p => pot.excludedPlayers.some(ep => ep.id === p.id))
    .map(player => ({
      player,
      reason: getExclusionReason(player, pot.cappedAt),
    }));

  // Build contributions list
  const contributions: PlayerContribution[] = eligiblePlayers.map(player => ({
    playerId: player.id,
    amount: getPlayerTotalContribution(player.id, contributedAmounts, currentStreet),
    isAllIn: player.stack === 0,
  }));

  // Build street breakdown
  // Note: For side pots, this shows total contributions from eligible players
  // The pot engine has already capped these at the appropriate level
  const streetBreakdown = buildStreetBreakdown(
    eligiblePlayers.map(p => p.id),
    contributedAmounts,
    currentStreet,
    potType,
    pot.amount
  );

  // Generate calculation formula
  const calculation = generateCalculation(
    pot,
    potType,
    potNumber,
    eligiblePlayers,
    players,
    contributedAmounts,
    currentStreet,
    deadMoneyBreakdown
  );

  // Generate description
  const description = generateDescription(pot, potType, potNumber, eligiblePlayers.length);

  return {
    potType,
    potNumber,
    amount: pot.amount,
    eligiblePlayers,
    excludedPlayers: excludedPlayers.length > 0 ? excludedPlayers : undefined,
    contributions,
    streetBreakdown,
    calculation,
    description,
  };
}

/**
 * Get exclusion reason for a player
 */
function getExclusionReason(player: Player, cappedAt: number): string {
  if (player.stack === 0) {
    return `All-in for $${cappedAt.toLocaleString()}`;
  }
  return 'Folded';
}

/**
 * Calculate total contribution for a player up to current street
 *
 * ContributedAmounts structure:
 * {
 *   "preflop_base": { 1: 500, 2: 1000 },
 *   "preflop_more": { 1: 1000, 2: 1000 },
 *   "flop_base": { 1: 2000, 2: 2000 },
 *   ...
 * }
 */
function getPlayerTotalContribution(
  playerId: number,
  contributedAmounts: ContributedAmounts,
  currentStreet: Stage
): number {
  let total = 0;

  const streets: Stage[] = ['preflop', 'flop', 'turn', 'river'];
  const currentIndex = streets.indexOf(currentStreet);

  // Loop through all section keys and find ones that match streets up to current street
  for (const sectionKey in contributedAmounts) {
    // Check if this section belongs to any street up to current street
    for (let i = 0; i <= currentIndex; i++) {
      const street = streets[i];
      if (sectionKey.startsWith(street)) {
        const sectionContributions = contributedAmounts[sectionKey] || {};
        const playerContribution = sectionContributions[playerId] || 0;
        total += playerContribution;
        break; // Move to next section key
      }
    }
  }

  return total;
}

/**
 * Build street-by-street contribution breakdown
 * Shows total amount contributed to the pot on each street (from eligible players only)
 *
 * ContributedAmounts structure:
 * {
 *   "preflop_base": { 1: 500, 2: 1000 },
 *   "preflop_more": { 1: 1000, 2: 1000 },
 *   "flop_base": { 1: 2000, 2: 2000 },
 *   ...
 * }
 *
 * For side pots, we show a simplified breakdown that just displays the pot amount
 * because calculating exact street-by-street incremental contributions is complex.
 */
function buildStreetBreakdown(
  eligiblePlayerIds: number[],
  contributedAmounts: ContributedAmounts,
  currentStreet: Stage,
  potType: 'main' | 'side',
  potAmount: number
): StreetContribution[] {
  const streets: Array<'preflop' | 'flop' | 'turn' | 'river'> = ['preflop', 'flop', 'turn', 'river'];
  const currentIndex = streets.indexOf(currentStreet as 'preflop' | 'flop' | 'turn' | 'river');

  // For side pots, show simplified breakdown: just the current street with the pot amount
  // This avoids complexity of calculating incremental contributions above previous caps
  if (potType === 'side') {
    return [{
      street: currentStreet,
      amount: potAmount,
      detail: `${eligiblePlayerIds.length} player${eligiblePlayerIds.length !== 1 ? 's' : ''} eligible for this side pot`,
    }];
  }

  // For main pot, show detailed street-by-street breakdown
  return streets.slice(0, currentIndex + 1).map(street => {
    let amount = 0;
    const playersWhoContributed = new Set<number>();

    // Loop through all section keys (e.g., "preflop_base", "preflop_more", "flop_base")
    for (const sectionKey in contributedAmounts) {
      // Check if this section belongs to the current street
      if (sectionKey.startsWith(street)) {
        const sectionContributions = contributedAmounts[sectionKey] || {};

        // Sum up contributions ONLY from eligible players for THIS pot
        for (const playerIdStr in sectionContributions) {
          const playerId = parseInt(playerIdStr);

          // IMPORTANT: Only include contributions from eligible players
          if (!eligiblePlayerIds.includes(playerId)) {
            continue; // Skip players not eligible for this pot
          }

          const contribution = sectionContributions[playerId] || 0;

          if (contribution > 0) {
            amount += contribution;
            playersWhoContributed.add(playerId);
          }
        }
      }
    }

    const contributingPlayers = playersWhoContributed.size;

    return {
      street,
      amount,
      detail: generateStreetDetail(contributingPlayers, amount),
    };
  });
}

/**
 * Generate detail text for street contribution
 */
function generateStreetDetail(numPlayers: number, amount: number): string {
  if (amount === 0) return 'No contributions';
  return `${numPlayers} player${numPlayers !== 1 ? 's' : ''} contributed`;
}

/**
 * Generate calculation formula for pot
 * Shows street-by-street breakdown with Posted money logic
 *
 * IMPORTANT: This function receives pot.amount which is the FINAL pot amount
 * already calculated by the pot engine. We just need to show how it breaks down by street.
 *
 * For the formula display, we simply show the pot.amount value that was already calculated.
 * The street breakdown in "Contributions by Street" section uses buildStreetBreakdown() separately.
 */
function generateCalculation(
  pot: EnginePotInfo['mainPot'],
  potType: 'main' | 'side',
  potNumber: number | undefined,
  eligiblePlayers: Player[],
  allPlayers: Player[],
  contributedAmounts: ContributedAmounts,
  currentStreet: Stage,
  deadMoneyBreakdown: { total: number; ante: number; foldedBlinds: number; foldedBets: number }
): DisplayPotInfo['calculation'] {
  const streets: Array<'preflop' | 'flop' | 'turn' | 'river'> = ['preflop', 'flop', 'turn', 'river'];
  const currentIndex = streets.indexOf(currentStreet as 'preflop' | 'flop' | 'turn' | 'river');

  // For the formula display, we just show pot.amount
  // The pot engine has already calculated this correctly
  // The detailed street-by-street breakdown is shown in "Contributions by Street" section
  const formulaLines: string[] = [];

  // For main pot on preflop, show Posted money
  if (potType === 'main' && currentStreet === 'preflop') {
    const postedLine = generatePostedMoneyLine(allPlayers, eligiblePlayers, deadMoneyBreakdown);
    if (postedLine) {
      formulaLines.push(postedLine);
    }
  }

  // Simple display: Just show the pot total
  // The pot engine calculated this based on eligible players and pot caps
  const potDescription = potType === 'main'
    ? `Main Pot Amount:`
    : `Side Pot ${potNumber} Amount:`;

  formulaLines.push(`${potDescription}`.padEnd(25) + `$${pot.amount.toLocaleString()}`.padEnd(20));

  const formula = formulaLines.join('\n');

  return {
    formula,
    variables: {}, // No variables needed for simple display
    result: `Total = $${pot.amount.toLocaleString()}`,
  };
}

/**
 * Generate Posted money line based on who folded
 * Returns formatted string or empty if no posted money to show
 */
function generatePostedMoneyLine(
  allPlayers: Player[],
  eligiblePlayers: Player[],
  deadMoneyBreakdown: { total: number; ante: number; foldedBlinds: number; foldedBets: number }
): string {
  // Find SB and BB players
  const sbPlayer = allPlayers.find(p =>
    p.position?.toLowerCase() === 'sb' ||
    p.position?.toLowerCase() === 'small blind'
  );
  const bbPlayer = allPlayers.find(p =>
    p.position?.toLowerCase() === 'bb' ||
    p.position?.toLowerCase() === 'big blind'
  );

  // Check if they're in the pot (eligible)
  const sbInPot = sbPlayer && eligiblePlayers.some(ep => ep.id === sbPlayer.id);
  const bbInPot = bbPlayer && eligiblePlayers.some(ep => ep.id === bbPlayer.id);

  // Determine what to show based on logic
  const parts: string[] = [];
  let total = 0;

  // If SB folded, include SB
  if (sbPlayer && !sbInPot) {
    parts.push('SB');
  }

  // If BB folded, include BB
  if (bbPlayer && !bbInPot) {
    parts.push('BB');
  }

  // Add folded blinds amount
  if (deadMoneyBreakdown.foldedBlinds > 0) {
    total += deadMoneyBreakdown.foldedBlinds;
  }

  // Always include ante if > 0
  if (deadMoneyBreakdown.ante > 0) {
    parts.push('Ante');
    total += deadMoneyBreakdown.ante;
  }

  // If both blinds in pot, only show ante
  if (sbInPot && bbInPot) {
    if (deadMoneyBreakdown.ante > 0) {
      return `Posted (Ante):`.padEnd(25) + `$${deadMoneyBreakdown.ante.toLocaleString()}`.padEnd(20);
    }
    return ''; // No posted money to show
  }

  if (parts.length === 0) {
    return ''; // No posted money to show
  }

  const label = `Posted (${parts.join(' + ')}):`;
  const formattedAmount = `$${total.toLocaleString()}`;

  return label.padEnd(25) + formattedAmount.padEnd(20);
}

/**
 * Generate description text for pot
 */
function generateDescription(
  pot: EnginePotInfo['mainPot'],
  potType: 'main' | 'side',
  potNumber: number | undefined,
  numEligiblePlayers: number
): string {
  if (potType === 'main') {
    return `The main pot is capped at the smallest all-in amount ($${pot.cappedAt.toLocaleString()}). ${numEligiblePlayers} player${numEligiblePlayers !== 1 ? 's' : ''} contributed this amount, making the main pot $${pot.amount.toLocaleString()}. Any contributions above this threshold go into side pots.`;
  } else {
    const excluded = pot.excludedPlayers.length;
    return `This side pot contains contributions from players who put in more than the previous cap. ${excluded} player${excluded !== 1 ? 's were' : ' was'} excluded because they didn't contribute enough to be eligible for this pot.`;
  }
}
