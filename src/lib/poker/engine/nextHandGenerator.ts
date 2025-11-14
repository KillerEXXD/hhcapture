/**
 * Next Hand Generator
 *
 * Generates the next poker hand with proper:
 * - Winner selection (multiple winners for different pots)
 * - Stack calculations
 * - Button rotation
 * - Full validations
 */

import type { Player } from '../../../types/poker/player.types';

export interface Pot {
  name: string;
  type: 'main' | 'side1' | 'side2' | 'side3' | 'side4' | 'side5';
  amount: number;
  eligible: string[]; // Player names
  percentage: number;
}

export interface WinnerSelection {
  potName: string;
  potType: string;
  winnerNames: string[]; // Changed from winnerName to support multiple winners
}

export interface NextHandPlayer {
  name: string;
  position: string;
  stack: number;
  previousStack: number;  // Stack before this hand
  netChange: number;      // + for winnings, - for losses
  // Detailed breakdown for transparency
  breakdown?: {
    previousPosition: string;      // Position in the previous hand
    anteContribution: number;      // Ante paid
    blindContribution: number;     // SB/BB paid (if applicable)
    actionContribution: number;    // Additional bets/raises beyond blind
    totalContribution: number;     // Total put into pot
    potWinnings: number;          // Amount won from pot(s)
    isBlindPosition: boolean;     // Was SB or BB
    blindType?: 'SB' | 'BB';      // Which blind
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PlayerContribution {
  playerName: string;
  amount: number;
}

/**
 * Calculate new stacks based on winner selections
 * Formula: New Stack = Starting Stack - Total Contributions + Pot Winnings
 */
export function calculateNewStacks(
  players: Player[],
  pots: Pot[],
  winnerSelections: WinnerSelection[],
  playerContributions?: PlayerContribution[]
): Record<string, number> {
  const newStacks: Record<string, number> = {};

  // Calculate ending stack for each player
  players.forEach(player => {
    const startingStack = player.stack;

    // Find total contributions for this player
    let totalContribution = 0;
    if (playerContributions) {
      const contribution = playerContributions.find(c => c.playerName === player.name);
      totalContribution = contribution?.amount || 0;
    }

    // Starting stack minus contributions = remaining stack
    newStacks[player.name] = startingStack - totalContribution;

    console.log(`[calculateNewStacks] ${player.name}: ${startingStack} - ${totalContribution} = ${newStacks[player.name]}`);
  });

  // Award each pot to its winner(s)
  winnerSelections.forEach(selection => {
    const pot = pots.find(p => p.name === selection.potName);
    if (!pot) {
      console.error(`Pot ${selection.potName} not found`);
      return;
    }

    const winners = selection.winnerNames;
    if (!winners || winners.length === 0) {
      console.error(`No winners selected for ${pot.name}`);
      return;
    }

    // Validate all winners are eligible for this pot
    const ineligibleWinners = winners.filter(w => !pot.eligible.includes(w));
    if (ineligibleWinners.length > 0) {
      console.error(`Ineligible winners for ${pot.name}: ${ineligibleWinners.join(', ')}`);
      return;
    }

    // Split pot equally among winners
    const splitAmount = pot.amount / winners.length;
    console.log(`[calculateNewStacks] Splitting ${pot.name} (${pot.amount}) among ${winners.length} winner(s): ${splitAmount.toFixed(2)} each`);

    winners.forEach(winnerName => {
      newStacks[winnerName] += splitAmount;
      console.log(`[calculateNewStacks] ${winnerName} receives ${splitAmount.toFixed(2)} from ${pot.name}, new stack: ${newStacks[winnerName].toFixed(2)}`);
    });
  });

  return newStacks;
}

/**
 * Position mappings for different player counts
 */
const POSITIONS: Record<number, string[]> = {
  2: ['SB', 'BB'],
  3: ['Dealer', 'SB', 'BB'],
  4: ['Dealer', 'SB', 'BB', 'UTG'],
  5: ['Dealer', 'SB', 'BB', 'UTG', 'CO'],
  6: ['Dealer', 'SB', 'BB', 'UTG', 'MP', 'CO'],
  7: ['Dealer', 'SB', 'BB', 'UTG', 'MP', 'HJ', 'CO'],
  8: ['Dealer', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'HJ', 'CO'],
  9: ['Dealer', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP', 'HJ', 'CO']
};

/**
 * Rotate button clockwise and generate next hand
 */
export function generateNextHand(
  players: Player[],
  newStacks: Record<string, number>
): NextHandPlayer[] {
  const numPlayers = players.length;
  const positions = POSITIONS[numPlayers];

  if (!positions) {
    throw new Error(`Unsupported player count: ${numPlayers}`);
  }

  // Find current dealer index
  const dealerIdx = players.findIndex(p =>
    p.position === 'Dealer' || (numPlayers === 2 && p.position === 'SB')
  );

  if (dealerIdx === -1) {
    throw new Error('Dealer not found in current hand');
  }

  // Rotate button: next player becomes dealer
  const nextHand: NextHandPlayer[] = [];

  for (let i = 0; i < numPlayers; i++) {
    const playerIdx = (dealerIdx + 1 + i) % numPlayers;
    const player = players[playerIdx];
    const newPosition = positions[i];
    const previousStack = player.stack;  // Stack at end of previous hand
    const newStack = newStacks[player.name];
    const netChange = newStack - previousStack;

    nextHand.push({
      name: player.name,
      position: newPosition,
      stack: newStack,
      previousStack: previousStack,
      netChange: netChange
    });
  }

  return nextHand;
}

/**
 * Validate button rotation
 */
export function validateButtonRotation(
  currentPlayers: Player[],
  nextPlayers: NextHandPlayer[]
): ValidationResult {
  const errors: string[] = [];
  const numPlayers = currentPlayers.length;

  // Find previous positions
  const prevSB = currentPlayers.find(p => p.position === 'SB');
  const prevBB = currentPlayers.find(p => p.position === 'BB');
  const prevDealer = currentPlayers.find(p => p.position === 'Dealer');

  if (numPlayers === 2) {
    // 2-player: SB/Dealer alternates, BB alternates
    const nextSB = nextPlayers.find(p => p.position === 'SB');
    const nextBB = nextPlayers.find(p => p.position === 'BB');

    if (!nextSB || !nextBB) {
      errors.push('SB or BB not found in next hand');
    } else {
      // In 2P, previous BB becomes new SB
      if (prevBB && nextSB.name !== prevBB.name) {
        errors.push(`Button rotation wrong: ${prevBB.name} (prev BB) should be new SB, got ${nextSB.name}`);
      }

      // In 2P, previous SB becomes new BB
      if (prevSB && nextBB.name !== prevSB.name) {
        errors.push(`Button rotation wrong: ${prevSB.name} (prev SB) should be new BB, got ${nextBB.name}`);
      }
    }
  } else {
    // 3+ players: previous SB becomes new Dealer
    const nextDealer = nextPlayers.find(p => p.position === 'Dealer');

    if (!nextDealer) {
      errors.push('No dealer found in next hand');
    } else if (prevSB && nextDealer.name !== prevSB.name) {
      errors.push(`Button rotation wrong: ${prevSB.name} (prev SB) should be Dealer, got ${nextDealer.name}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate all players are present in next hand (including busted players)
 */
export function validateAllPlayersPresent(
  currentPlayers: Player[],
  nextPlayers: NextHandPlayer[]
): ValidationResult {
  const errors: string[] = [];

  if (currentPlayers.length !== nextPlayers.length) {
    errors.push(`Player count mismatch: ${currentPlayers.length} current, ${nextPlayers.length} next`);
  }

  const currentNames = new Set(currentPlayers.map(p => p.name));
  const nextNames = new Set(nextPlayers.map(p => p.name));

  const missing = Array.from(currentNames).filter(name => !nextNames.has(name));
  const extra = Array.from(nextNames).filter(name => !currentNames.has(name));

  if (missing.length > 0 || extra.length > 0) {
    errors.push(`Players mismatch. Missing: ${missing.join(', ')}, Extra: ${extra.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate winner selections
 */
export function validateWinnerSelections(
  pots: Pot[],
  winnerSelections: WinnerSelection[]
): ValidationResult {
  const errors: string[] = [];

  // Check all pots have winners
  pots.forEach(pot => {
    const selection = winnerSelections.find(s => s.potName === pot.name);
    if (!selection) {
      errors.push(`No winner selected for ${pot.name}`);
    } else if (!selection.winnerNames || selection.winnerNames.length === 0) {
      errors.push(`No winners selected for ${pot.name}`);
    } else {
      // Check all winners are eligible
      const ineligibleWinners = selection.winnerNames.filter(w => !pot.eligible.includes(w));
      if (ineligibleWinners.length > 0) {
        errors.push(`Ineligible winners for ${pot.name}: ${ineligibleWinners.join(', ')}. Eligible: ${pot.eligible.join(', ')}`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate next hand stacks are non-negative
 */
export function validateStacksNonNegative(
  nextPlayers: NextHandPlayer[]
): ValidationResult {
  const errors: string[] = [];

  nextPlayers.forEach(player => {
    if (player.stack < 0) {
      errors.push(`${player.name} has negative stack: ${player.stack}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Run all validations on next hand
 */
export function validateNextHand(
  currentPlayers: Player[],
  nextPlayers: NextHandPlayer[],
  pots: Pot[],
  winnerSelections: WinnerSelection[]
): ValidationResult {
  const allErrors: string[] = [];

  // Validate winner selections
  const winnerResult = validateWinnerSelections(pots, winnerSelections);
  allErrors.push(...winnerResult.errors);

  // Validate button rotation
  const rotationResult = validateButtonRotation(currentPlayers, nextPlayers);
  allErrors.push(...rotationResult.errors);

  // Validate all players present
  const presenceResult = validateAllPlayersPresent(currentPlayers, nextPlayers);
  allErrors.push(...presenceResult.errors);

  // Validate stacks are non-negative
  const stacksResult = validateStacksNonNegative(nextPlayers);
  allErrors.push(...stacksResult.errors);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

/**
 * Complete process: Calculate stacks, generate next hand, and validate
 */
export function processWinnersAndGenerateNextHand(
  currentPlayers: Player[],
  pots: Pot[],
  winnerSelections: WinnerSelection[],
  playerContributions?: PlayerContribution[]
): {
  nextHand: NextHandPlayer[];
  validation: ValidationResult;
  newStacks: Record<string, number>;
} {
  console.log('🎯 Processing winners and generating next hand...');
  console.log('Current players count:', currentPlayers.length);
  console.log('Current players details:', currentPlayers.map(p => ({ id: p.id, name: p.name, position: p.position, stack: p.stack })));
  console.log('Winner selections:', winnerSelections);
  console.log('Player contributions:', playerContributions);

  // Filter out any empty/invalid players
  const validPlayers = currentPlayers.filter(p => p.name && p.name.trim() !== '');
  if (validPlayers.length !== currentPlayers.length) {
    console.warn(`⚠️ Filtered out ${currentPlayers.length - validPlayers.length} invalid players`);
  }

  // Step 1: Calculate new stacks
  const newStacks = calculateNewStacks(validPlayers, pots, winnerSelections, playerContributions);
  console.log('New stacks:', newStacks);

  // Step 2: Generate next hand
  const nextHand = generateNextHand(validPlayers, newStacks);
  console.log('Next hand:', nextHand);

  // Step 3: Validate everything
  const validation = validateNextHand(validPlayers, nextHand, pots, winnerSelections);

  if (!validation.isValid) {
    console.error('❌ Validation failed:', validation.errors);
  } else {
    console.log('✅ Validation passed');
  }

  return {
    nextHand,
    validation,
    newStacks
  };
}
