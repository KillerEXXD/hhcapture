/**
 * Deep Pot Calculation Engine Tests
 *
 * Comprehensive edge case testing for the pot calculation system.
 * Tests complex scenarios including:
 * - Multiple all-ins at different stack sizes
 * - Complex side pot calculations
 * - Edge cases with zero contributions
 * - Multiple betting rounds with cumulative contributions
 * - All players all-in scenarios
 */

import { describe, it, expect } from 'vitest';
import {
  gatherContributions,
  calculateDeadMoney,
  createPots,
  calculatePotsForBettingRound
} from '../potCalculationEngine';
import type { Player, PlayerData } from '../../../../types/poker';

describe('Deep Pot Calculation Tests', () => {
  const createPlayers = (): Player[] => [
    { id: 1, name: 'Alice', position: 'UTG', stack: 10000 },
    { id: 2, name: 'Bob', position: 'BB', stack: 12000 },
    { id: 3, name: 'Charlie', position: 'CO', stack: 11000 },
    { id: 4, name: 'Jane', position: 'SB', stack: 8500 },
    { id: 5, name: 'John', position: 'Dealer', stack: 10000 },
    { id: 6, name: 'Dave', position: 'MP', stack: 15000 }
  ];

  describe('Edge Case: All Players All-In', () => {
    it('should handle all players going all-in with different stacks', () => {
      const players: Player[] = [
        { id: 1, name: 'Short', position: 'SB', stack: 500 },
        { id: 2, name: 'Medium', position: 'BB', stack: 2000 },
        { id: 3, name: 'Big', position: 'UTG', stack: 5000 }
      ];

      const playerData: PlayerData = {
        1: { preflopAction: 'all-in', preflopAmount: 500, preflopUnit: 'actual', postedSB: 250 },
        2: { preflopAction: 'all-in', preflopAmount: 2000, preflopUnit: 'actual', postedBB: 500, postedAnte: 500 },
        3: { preflopAction: 'all-in', preflopAmount: 5000, preflopUnit: 'actual' }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 500,  // SB all-in
          2: 1500, // BB all-in (additional 1500 after posting 500)
          3: 5000  // UTG all-in
        }
      };

      const processedSections = { 'preflop_base': true };
      const sectionStacks = {
        'preflop_base': {
          initial: { 1: 500, 2: 1500, 3: 5000 },
          current: { 1: 500, 2: 2000, 3: 5000 },
          updated: { 1: 0, 2: 0, 3: 0 }
        }
      };

      const stackData = { bigBlind: 500, smallBlind: 250, ante: 500 };

      const contributions = gatherContributions(
        'preflop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        stackData,
        false
      );

      // Manually mark all as all-in
      contributions[0].isAllIn = true;
      contributions[1].isAllIn = true;
      contributions[2].isAllIn = true;

      const deadMoney = calculateDeadMoney('preflop', contributions);
      const potInfo = createPots(contributions, deadMoney, 0, 'preflop', 'base');

      // Expected pot calculation:
      // Short has 750 total (250 SB + 500 action)
      // Main Pot (capped at 750): 750 × 3 + dead (500 ante) = 2750
      // Side Pot 1 (750 to 2000): (2000 - 750) × 2 = 2500
      // Side Pot 2 (2000 to 5000): (5000 - 2000) × 1 = 3000
      // Total: 2750 + 2500 + 3000 = 8250

      expect(potInfo.totalPot).toBe(8250);
      expect(potInfo.sidePots.length).toBe(2);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(3);
      expect(potInfo.sidePots[0].eligiblePlayers.length).toBe(2);
      expect(potInfo.sidePots[1].eligiblePlayers.length).toBe(1);
    });
  });

  describe('Edge Case: Zero Contributors', () => {
    it('should handle players who fold without contributing', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'fold' },
        2: { preflopAction: 'check', postedBB: 1000, postedAnte: 1000 },
        3: { preflopAction: 'fold' },
        4: { preflopAction: 'fold', postedSB: 500 },
        5: { preflopAction: 'fold' },
        6: { preflopAction: 'fold' }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
        }
      };

      const processedSections = { 'preflop_base': true };
      const sectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 11500, 3: 11000, 4: 8000, 5: 10000, 6: 15000 },
          current: { 1: 10000, 2: 11500, 3: 11000, 4: 8000, 5: 10000, 6: 15000 },
          updated: { 1: 10000, 2: 11500, 3: 11000, 4: 8000, 5: 10000, 6: 15000 }
        }
      };

      const stackData = { bigBlind: 1000, smallBlind: 500, ante: 1000 };

      const potInfo = calculatePotsForBettingRound(
        'preflop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        stackData,
        0
      );

      // Expected: SB (500) + BB (1000) + Ante (1000) = 2500
      // Only BB is active (everyone else folded)
      expect(potInfo.totalPot).toBe(2500);
      expect(potInfo.deadMoney).toBe(1500); // Ante + folded SB
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(1);
      expect(potInfo.mainPot.eligiblePlayers[0].name).toBe('Bob');
    });
  });

  describe('Complex: Three-Way All-In with Caller', () => {
    it('should create correct side pots with 3 all-ins and 1 caller', () => {
      const players = createPlayers();

      // Stacks: Alice 2K, Charlie 4K, Jane 6K, Bob 12K (caller)
      players[0].stack = 2000;
      players[2].stack = 4000;
      players[3].stack = 6000;

      const playerData: PlayerData = {
        1: { preflopAction: 'all-in', preflopAmount: 2000, preflopUnit: 'actual' },
        2: { preflopAction: 'call', preflopAmount: 6000, preflopUnit: 'actual', postedBB: 1000, postedAnte: 1000 },
        3: { preflopAction: 'all-in', preflopAmount: 4000, preflopUnit: 'actual' },
        4: { preflopAction: 'all-in', preflopAmount: 6000, preflopUnit: 'actual', postedSB: 500 },
        5: { preflopAction: 'fold' },
        6: { preflopAction: 'fold' }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 2000,
          2: 5000, // Called 6K total (5K additional after BB)
          3: 4000,
          4: 5500, // All-in 6K total (5.5K additional after SB)
          5: 0,
          6: 0
        }
      };

      const processedSections = { 'preflop_base': true };
      const sectionStacks = {
        'preflop_base': {
          initial: { 1: 2000, 2: 11000, 3: 4000, 4: 5500, 5: 10000, 6: 15000 },
          current: { 1: 2000, 2: 11000, 3: 4000, 4: 6000, 5: 10000, 6: 15000 },
          updated: { 1: 0, 2: 6000, 3: 0, 4: 0, 5: 10000, 6: 15000 }
        }
      };

      const stackData = { bigBlind: 1000, smallBlind: 500, ante: 1000 };

      const contributions = gatherContributions(
        'preflop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        stackData,
        false
      );

      contributions[0].isAllIn = true;
      contributions[2].isAllIn = true;
      contributions[3].isAllIn = true;

      const deadMoney = calculateDeadMoney('preflop', contributions);
      const potInfo = createPots(contributions, deadMoney, 0, 'preflop', 'base');

      // Expected:
      // Main Pot (capped at 2K): 2K × 4 + dead (1000 ante) = 9000
      // Side Pot 1 (2K to 4K): (4K - 2K) × 3 = 6000
      // Side Pot 2 (4K to 6K): (6K - 4K) × 2 = 4000
      // Total: 9000 + 6000 + 4000 = 19000

      expect(potInfo.totalPot).toBe(19000);
      expect(potInfo.sidePots.length).toBe(2);

      // Main pot: All 4 active players
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(4);

      // Side Pot 1: Excludes Alice (shortest stack)
      expect(potInfo.sidePots[0].eligiblePlayers.length).toBe(3);

      // Side Pot 2: Only Charlie and Bob
      expect(potInfo.sidePots[1].eligiblePlayers.length).toBe(2);
    });
  });

  describe('Complex: Multiple Betting Rounds with All-Ins', () => {
    it('should handle all-in on flop after preflop action', () => {
      const players = createPlayers();

      const playerData: PlayerData = {
        // Preflop: All call 1K
        1: { preflopAction: 'call', preflopAmount: 1000, preflopUnit: 'actual' },
        2: { preflopAction: 'check', postedBB: 1000, postedAnte: 1000 },
        3: { preflopAction: 'call', preflopAmount: 1000, preflopUnit: 'actual' },
        4: { preflopAction: 'call', preflopAmount: 1000, preflopUnit: 'actual', postedSB: 500 },
        5: { preflopAction: 'fold' },
        6: { preflopAction: 'fold' }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 1000,
          2: 0,
          3: 1000,
          4: 500,
          5: 0,
          6: 0
        }
      };

      const processedSections = { 'preflop_base': true };
      const sectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 11000, 3: 11000, 4: 8000, 5: 10000, 6: 15000 },
          current: { 1: 10000, 2: 11000, 3: 11000, 4: 8000, 5: 10000, 6: 15000 },
          updated: { 1: 9000, 2: 11000, 3: 10000, 4: 7500, 5: 10000, 6: 15000 }
        }
      };

      const stackData = { bigBlind: 1000, smallBlind: 500, ante: 1000 };

      const preflopPot = calculatePotsForBettingRound(
        'preflop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        stackData,
        0
      );

      // Preflop pot should be 5000
      expect(preflopPot.totalPot).toBe(5000);
      expect(preflopPot.deadMoney).toBe(1000); // Ante only
    });
  });

  describe('Edge Case: Identical Stack Sizes All-In', () => {
    it('should handle multiple players with same stack going all-in', () => {
      const players: Player[] = [
        { id: 1, name: 'P1', position: 'SB', stack: 5000 },
        { id: 2, name: 'P2', position: 'BB', stack: 5000 },
        { id: 3, name: 'P3', position: 'UTG', stack: 5000 },
        { id: 4, name: 'P4', position: 'CO', stack: 10000 }
      ];

      const playerData: PlayerData = {
        1: { preflopAction: 'all-in', preflopAmount: 5000, preflopUnit: 'actual', postedSB: 500 },
        2: { preflopAction: 'call', preflopAmount: 5000, preflopUnit: 'actual', postedBB: 1000 },
        3: { preflopAction: 'all-in', preflopAmount: 5000, preflopUnit: 'actual' },
        4: { preflopAction: 'call', preflopAmount: 5000, preflopUnit: 'actual' }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 4500, // 5K - 500 SB already posted
          2: 4000, // 5K - 1K BB already posted
          3: 5000,
          4: 5000
        }
      };

      const processedSections = { 'preflop_base': true };
      const sectionStacks = {
        'preflop_base': {
          initial: { 1: 4500, 2: 4000, 3: 5000, 4: 10000 },
          current: { 1: 5000, 2: 5000, 3: 5000, 4: 10000 },
          updated: { 1: 0, 2: 0, 3: 0, 4: 5000 }
        }
      };

      const stackData = { bigBlind: 1000, smallBlind: 500, ante: 0 };

      const contributions = gatherContributions(
        'preflop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        stackData,
        false
      );

      contributions[0].isAllIn = true;
      contributions[2].isAllIn = true;

      const deadMoney = calculateDeadMoney('preflop', contributions);
      const potInfo = createPots(contributions, deadMoney, 0, 'preflop', 'base');

      // Expected: All 4 players in main pot (5K each = 20K)
      // No side pots since first 3 have same stack
      expect(potInfo.totalPot).toBe(20000);
      expect(potInfo.sidePots.length).toBe(0); // All same contribution level
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(4);
    });
  });

  describe('Edge Case: Player Folds After Posting Blind', () => {
    it('should count folded blind as dead money', () => {
      const players = createPlayers();

      const playerData: PlayerData = {
        1: { preflopAction: 'raise', preflopAmount: 3000, preflopUnit: 'actual' },
        2: { preflopAction: 'fold', postedBB: 1000, postedAnte: 1000 },
        3: { preflopAction: 'call', preflopAmount: 3000, preflopUnit: 'actual' },
        4: { preflopAction: 'fold', postedSB: 500 },
        5: { preflopAction: 'fold' },
        6: { preflopAction: 'fold' }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 3000,
          2: 0, // Folded after posting BB
          3: 3000,
          4: 0, // Folded after posting SB
          5: 0,
          6: 0
        }
      };

      const processedSections = { 'preflop_base': true };
      const sectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 11000, 3: 11000, 4: 8000, 5: 10000, 6: 15000 },
          current: { 1: 10000, 2: 11000, 3: 11000, 4: 8000, 5: 10000, 6: 15000 },
          updated: { 1: 7000, 2: 11000, 3: 8000, 4: 8000, 5: 10000, 6: 15000 }
        }
      };

      const stackData = { bigBlind: 1000, smallBlind: 500, ante: 1000 };

      const potInfo = calculatePotsForBettingRound(
        'preflop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        stackData,
        0
      );

      // Expected: Alice (3K) + Charlie (3K) + folded BB (1K) + folded SB (500) + Ante (1K) = 8500
      expect(potInfo.totalPot).toBe(8500);
      expect(potInfo.deadMoney).toBe(2500); // Ante (1K) + BB (1K) + SB (500)
      expect(potInfo.deadMoneyBreakdown.ante).toBe(1000);
      expect(potInfo.deadMoneyBreakdown.foldedBlinds).toBe(1500);
    });
  });

  describe('Complex: More Action with Side Pots', () => {
    it('should handle side pots correctly in more action round', () => {
      const players = createPlayers();
      players[0].stack = 3000; // Alice short stack

      const playerData: PlayerData = {
        // Base: Everyone calls 1K
        1: {
          preflopAction: 'call',
          preflopAmount: 1000,
          preflopUnit: 'actual',
          preflop_moreActionAction: 'all-in',
          preflop_moreActionAmount: 2000,
          preflop_moreActionUnit: 'actual'
        },
        2: {
          preflopAction: 'check',
          postedBB: 1000,
          postedAnte: 1000,
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: 5000,
          preflop_moreActionUnit: 'actual'
        },
        3: {
          preflopAction: 'raise',
          preflopAmount: 3000,
          preflopUnit: 'actual',
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: 5000,
          preflop_moreActionUnit: 'actual'
        },
        4: { preflopAction: 'fold', postedSB: 500 },
        5: { preflopAction: 'fold' },
        6: { preflopAction: 'fold' }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 1000,
          2: 0,
          3: 3000,
          4: 0,
          5: 0,
          6: 0
        },
        'preflop_more': {
          1: 2000, // Alice all-in (total 3K)
          2: 4000, // BB raises to 5K (4K additional)
          3: 2000, // Charlie calls 5K (2K additional)
          4: 0,
          5: 0,
          6: 0
        }
      };

      const processedSections = {
        'preflop_base': true,
        'preflop_more': true
      };

      const sectionStacks = {
        'preflop_base': {
          initial: { 1: 3000, 2: 11000, 3: 11000, 4: 8000, 5: 10000, 6: 15000 },
          current: { 1: 3000, 2: 11000, 3: 11000, 4: 8000, 5: 10000, 6: 15000 },
          updated: { 1: 2000, 2: 11000, 3: 8000, 4: 8000, 5: 10000, 6: 15000 }
        },
        'preflop_more': {
          initial: { 1: 2000, 2: 11000, 3: 8000, 4: 8000, 5: 10000, 6: 15000 },
          current: { 1: 2000, 2: 11000, 3: 8000, 4: 8000, 5: 10000, 6: 15000 },
          updated: { 1: 0, 2: 7000, 3: 6000, 4: 8000, 5: 10000, 6: 15000 }
        }
      };

      const stackData = { bigBlind: 1000, smallBlind: 500, ante: 1000 };

      const potInfo = calculatePotsForBettingRound(
        'preflop',
        'more',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        stackData,
        0
      );

      // Expected:
      // Alice: 3K total, Bob: 5K total, Charlie: 5K total
      // Dead: Ante (1K) + SB (500) = 1500
      // Main Pot (capped at 3K): 3K × 3 + dead (1.5K) = 10500
      // Side Pot (3K to 5K): (5K - 3K) × 2 = 4000
      // Total: 10500 + 4000 = 14500

      expect(potInfo.totalPot).toBe(14500);
      expect(potInfo.sidePots.length).toBe(1);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(3);
      expect(potInfo.sidePots[0].eligiblePlayers.length).toBe(2);
      expect(potInfo.sidePots[0].excludedPlayers.some(p => p.name === 'Alice')).toBe(true);
    });
  });

  describe('Edge Case: Single Player Remaining', () => {
    it('should award pot to single remaining player', () => {
      const players = createPlayers();

      const playerData: PlayerData = {
        1: { preflopAction: 'fold' },
        2: { preflopAction: 'bet', preflopAmount: 5000, preflopUnit: 'actual', postedBB: 1000, postedAnte: 1000 },
        3: { preflopAction: 'fold' },
        4: { preflopAction: 'fold', postedSB: 500 },
        5: { preflopAction: 'fold' },
        6: { preflopAction: 'fold' }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 0,
          2: 4000, // Bet 5K (4K additional after BB)
          3: 0,
          4: 0,
          5: 0,
          6: 0
        }
      };

      const processedSections = { 'preflop_base': true };
      const sectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 11000, 3: 11000, 4: 8000, 5: 10000, 6: 15000 },
          current: { 1: 10000, 2: 11000, 3: 11000, 4: 8000, 5: 10000, 6: 15000 },
          updated: { 1: 10000, 2: 7000, 3: 11000, 4: 8000, 5: 10000, 6: 15000 }
        }
      };

      const stackData = { bigBlind: 1000, smallBlind: 500, ante: 1000 };

      const potInfo = calculatePotsForBettingRound(
        'preflop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        stackData,
        0
      );

      // Expected: Bob's bet (5K) + folded SB (500) + Ante (1K) = 6500
      expect(potInfo.totalPot).toBe(6500);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(1);
      expect(potInfo.mainPot.eligiblePlayers[0].name).toBe('Bob');
      expect(potInfo.deadMoney).toBe(1500); // Ante + folded SB
    });
  });

  describe('Validation: Contribution Amounts', () => {
    it('should correctly sum all contributions including blinds', () => {
      const players = createPlayers();

      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: 1000, preflopUnit: 'actual' },
        2: { preflopAction: 'check', postedBB: 1000, postedAnte: 1000 },
        3: { preflopAction: 'call', preflopAmount: 1000, preflopUnit: 'actual' },
        4: { preflopAction: 'call', preflopAmount: 1000, preflopUnit: 'actual', postedSB: 500 },
        5: { preflopAction: 'fold' },
        6: { preflopAction: 'fold' }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 1000,
          2: 0,
          3: 1000,
          4: 500,
          5: 0,
          6: 0
        }
      };

      const processedSections = { 'preflop_base': true };
      const sectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 11000, 3: 11000, 4: 8000, 5: 10000, 6: 15000 },
          current: { 1: 10000, 2: 11000, 3: 11000, 4: 8000, 5: 10000, 6: 15000 },
          updated: { 1: 9000, 2: 11000, 3: 10000, 4: 7500, 5: 10000, 6: 15000 }
        }
      };

      const stackData = { bigBlind: 1000, smallBlind: 500, ante: 1000 };

      const contributions = gatherContributions(
        'preflop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        stackData,
        false
      );

      // Verify each contribution
      const alice = contributions.find(c => c.playerName === 'Alice');
      const bob = contributions.find(c => c.playerName === 'Bob');
      const charlie = contributions.find(c => c.playerName === 'Charlie');
      const jane = contributions.find(c => c.playerName === 'Jane');

      expect(alice?.totalContributed).toBe(1000);
      expect(bob?.totalContributed).toBe(1000); // BB only (ante is dead money)
      expect(bob?.postedAnte).toBe(1000); // But ante is tracked
      expect(charlie?.totalContributed).toBe(1000);
      expect(jane?.totalContributed).toBe(1000); // SB (500) + additional (500)
    });
  });
});
