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
  const { mainPot, sidePots, totalPot } = enginePotInfo;

  // Format main pot
  const formattedMainPot = formatPotInfo(
    mainPot,
    'main',
    undefined,
    players,
    contributedAmounts,
    currentStreet,
    enginePotInfo.deadMoneyBreakdown.ante
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
      0
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
  anteAmount: number
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
  const streetBreakdown = buildStreetBreakdown(
    eligiblePlayers.map(p => p.id),
    contributedAmounts,
    currentStreet
  );

  // Generate calculation formula
  const calculation = generateCalculation(
    pot,
    potType,
    potNumber,
    eligiblePlayers.length,
    anteAmount
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
 */
function getPlayerTotalContribution(
  playerId: number,
  contributedAmounts: ContributedAmounts,
  currentStreet: Stage
): number {
  const playerContributions = contributedAmounts[playerId] || {};
  let total = 0;

  const streets: Stage[] = ['preflop', 'flop', 'turn', 'river'];
  const currentIndex = streets.indexOf(currentStreet);

  // Sum contributions up to and including current street
  for (let i = 0; i <= currentIndex; i++) {
    const street = streets[i];
    for (const key in playerContributions) {
      if (key.startsWith(street)) {
        total += playerContributions[key] || 0;
      }
    }
  }

  return total;
}

/**
 * Build street-by-street contribution breakdown
 */
function buildStreetBreakdown(
  eligiblePlayerIds: number[],
  contributedAmounts: ContributedAmounts,
  currentStreet: Stage
): StreetContribution[] {
  const streets: Array<'preflop' | 'flop' | 'turn' | 'river'> = ['preflop', 'flop', 'turn', 'river'];
  const currentIndex = streets.indexOf(currentStreet as 'preflop' | 'flop' | 'turn' | 'river');

  return streets.slice(0, currentIndex + 1).map(street => {
    let amount = 0;
    let contributingPlayers = 0;

    for (const playerId of eligiblePlayerIds) {
      const contributions = contributedAmounts[playerId] || {};
      let streetContribution = 0;

      for (const key in contributions) {
        if (key.startsWith(street)) {
          streetContribution += contributions[key] || 0;
        }
      }

      if (streetContribution > 0) {
        amount += streetContribution;
        contributingPlayers++;
      }
    }

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
 */
function generateCalculation(
  pot: EnginePotInfo['mainPot'],
  potType: 'main' | 'side',
  potNumber: number | undefined,
  numEligiblePlayers: number,
  anteAmount: number
): DisplayPotInfo['calculation'] {
  if (potType === 'main') {
    const perPlayer = pot.cappedAt;
    const liveAmount = perPlayer * numEligiblePlayers;

    return {
      formula: `Main Pot = (Smallest Stack × Players) + Ante\nMain Pot = ($${perPlayer.toLocaleString()} × ${numEligiblePlayers}) + $${anteAmount.toLocaleString()}`,
      variables: {
        smallestStack: perPlayer,
        activePlayers: numEligiblePlayers,
        ante: anteAmount,
      },
      result: `= $${pot.amount.toLocaleString()} (capped at smallest contribution)`,
    };
  } else {
    // Side pot calculation
    return {
      formula: `Side Pot ${potNumber} = Contributions above previous cap\nSide Pot ${potNumber} = $${pot.cappedAt.toLocaleString()} × ${numEligiblePlayers} players`,
      variables: {
        cappedAt: pot.cappedAt,
        eligiblePlayers: numEligiblePlayers,
      },
      result: `= $${pot.amount.toLocaleString()}`,
    };
  }
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
