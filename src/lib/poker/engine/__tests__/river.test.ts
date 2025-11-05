/**
 * River Pot Calculation Tests
 *
 * Comprehensive test suite for river betting round with:
 * - Base action level
 * - More action level (more)
 * - More action 2 level (more2)
 * - All-in scenarios in each level
 * - Pot carry-forward from preflop, flop, and turn
 * - Side pot creation
 * - Final showdown scenarios
 */

import { describe, it, expect } from 'vitest';
import { calculatePotsForBettingRound } from '../potCalculationEngine';
import type { Player, PlayerData, ContributedAmounts, ProcessedSections, SectionStacks } from '../../../../types/poker';

describe('River Pot Calculation Tests', () => {
  const gameConfig = {
    smallBlind: 50,
    bigBlind: 100,
    ante: 10
  };

  describe('River - Realistic Scenarios with More Actions', () => {
    it('Scenario R1: River base - SB bets 2000, BB calls', () => {
      // Previous pot: 39000 (from Turn T2)
      // River base: SB bets 2000, BB calls
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 3500 },
        { id: 2, name: 'BB', position: 'BB', stack: 3500 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 1500 }, // 3500 - 2000
        2: { currentStack: 1500 }  // 3500 - 2000
      };

      const contributedAmounts: ContributedAmounts = {
        'preflop_base': {
          1: 500,
          2: 2000
        },
        'flop_base': {
          1: 1500,
          2: 1500
        },
        'flop_more': {
          1: 3000,
          2: 5000
        },
        'flop_more2': {
          1: 2000,
          2: 0
        },
        'turn_base': {
          1: 5000,
          2: 5000
        },
        'turn_more': {
          1: 3500,
          2: 3500
        },
        'river_base': {
          1: 2000,
          2: 2000
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'flop_more': true,
        'flop_more2': true,
        'turn_base': true,
        'turn_more': true,
        'river_base': true
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          1: 14500,
          2: 13000
        },
        'flop_base': {
          1: 13500,
          2: 13500
        },
        'flop_more': {
          1: 10500,
          2: 8500
        },
        'flop_more2': {
          1: 8500,
          2: 8500
        },
        'turn_base': {
          1: 3500,
          2: 3500
        },
        'turn_more': {
          1: 0,
          2: 0
        },
        'river_base': {
          1: 1500,
          2: 1500
        }
      };

      const previousPot = 39000; // From turn T2

      const potInfo = calculatePotsForBettingRound(
        'river',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Expected pot: 39000 (previous) + 4000 (river base) = 43000
      expect(potInfo.totalPot).toBe(43000);
      expect(potInfo.mainPot.amount).toBe(43000);
    });

    it('Scenario R2: River more action 1 - SB all-in 1500, BB calls', () => {
      // After R1: pot is 43000, both players have 1500 stacks
      // More Action 1: SB goes all-in for remaining 1500, BB calls
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 1500 },
        { id: 2, name: 'BB', position: 'BB', stack: 1500 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 0, river_moreActionAction: 'all-in' },
        2: { currentStack: 0 }
      };

      const contributedAmounts: ContributedAmounts = {
        'preflop_base': {
          1: 500,
          2: 2000
        },
        'flop_base': {
          1: 1500,
          2: 1500
        },
        'flop_more': {
          1: 3000,
          2: 5000
        },
        'flop_more2': {
          1: 2000,
          2: 0
        },
        'turn_base': {
          1: 5000,
          2: 5000
        },
        'turn_more': {
          1: 3500,
          2: 3500
        },
        'river_base': {
          1: 2000,
          2: 2000
        },
        'river_more': {
          1: 1500,  // all-in
          2: 1500   // calls
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'flop_more': true,
        'flop_more2': true,
        'turn_base': true,
        'turn_more': true,
        'river_base': true,
        'river_more': true
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          1: 14500,
          2: 13000
        },
        'flop_base': {
          1: 13500,
          2: 13500
        },
        'flop_more': {
          1: 10500,
          2: 8500
        },
        'flop_more2': {
          1: 8500,
          2: 8500
        },
        'turn_base': {
          1: 3500,
          2: 3500
        },
        'turn_more': {
          1: 0,
          2: 0
        },
        'river_base': {
          1: 1500,
          2: 1500
        },
        'river_more': {
          1: 0,
          2: 0
        }
      };

      const previousPot = 39000;

      const potInfo = calculatePotsForBettingRound(
        'river',
        'more',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Expected pot: 39000 (previous) + 4000 (river base) + 3000 (river more) = 46000
      expect(potInfo.totalPot).toBe(46000);
      expect(potInfo.mainPot.amount).toBe(46000);
    });

    it('Scenario R3: River with 3 players and all-in side pot', () => {
      // Previous pot: 30000 (from turn)
      // 3 players: SB (5k), BB (5k), UTG (2k short stack)
      // River base: SB bets 3000, BB raises 5000, UTG all-in 2000
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 5000 },
        { id: 2, name: 'BB', position: 'BB', stack: 5000 },
        { id: 3, name: 'UTG', position: 'UTG', stack: 2000 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 0 },  // 5000 - 5000
        2: { currentStack: 0 },  // 5000 - 5000
        3: { currentStack: 0, riverAction: 'all-in' }
      };

      const contributedAmounts: ContributedAmounts = {
        'preflop_base': {
          1: 500,
          2: 2000,
          3: 1000
        },
        'flop_base': {
          1: 2000,
          2: 2000,
          3: 2000
        },
        'turn_base': {
          1: 6000,
          2: 6000,
          3: 3000
        },
        'river_base': {
          1: 5000,
          2: 5000,
          3: 2000  // all-in
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'turn_base': true,
        'river_base': true
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          1: 14500,
          2: 13000,
          3: 9000
        },
        'flop_base': {
          1: 12500,
          2: 11000,
          3: 7000
        },
        'turn_base': {
          1: 6500,
          2: 5000,
          3: 4000
        },
        'river_base': {
          1: 0,
          2: 0,
          3: 0
        }
      };

      const previousPot = 30000;

      const potInfo = calculatePotsForBettingRound(
        'river',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Main pot (capped at 2000): 30000 + (2000 × 3) = 36000
      // Side pot (2000-5000): (5000-2000) × 2 = 6000
      // Total: 36000 + 6000 = 42000
      expect(potInfo.totalPot).toBe(42000);
      expect(potInfo.mainPot.cappedAt).toBe(2000);
      expect(potInfo.sidePots.length).toBe(1);
      expect(potInfo.sidePots[0].amount).toBe(6000);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(3);
      expect(potInfo.sidePots[0].eligiblePlayers.length).toBe(2);
    });

    it('Scenario R4: River more action with re-raise', () => {
      // Previous pot: 25000
      // River base: both bet 2000 (pot: 29000)
      // River more: SB raises 3000, BB re-raises 6000
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 10000 },
        { id: 2, name: 'BB', position: 'BB', stack: 10000 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 5000 },  // 10000 - 2000 - 3000
        2: { currentStack: 2000 }   // 10000 - 2000 - 6000
      };

      const contributedAmounts: ContributedAmounts = {
        'preflop_base': {
          1: 500,
          2: 2000
        },
        'flop_base': {
          1: 3000,
          2: 3000
        },
        'turn_base': {
          1: 2000,
          2: 2000
        },
        'river_base': {
          1: 2000,
          2: 2000
        },
        'river_more': {
          1: 3000,  // raised
          2: 6000   // re-raised
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'turn_base': true,
        'river_base': true,
        'river_more': true
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          1: 14500,
          2: 13000
        },
        'flop_base': {
          1: 11500,
          2: 10000
        },
        'turn_base': {
          1: 9500,
          2: 8000
        },
        'river_base': {
          1: 8000,
          2: 8000
        },
        'river_more': {
          1: 5000,
          2: 2000
        }
      };

      const previousPot = 25000;

      const potInfo = calculatePotsForBettingRound(
        'river',
        'more',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Expected pot: 25000 (previous) + 4000 (river base) + 9000 (river more) = 38000
      expect(potInfo.totalPot).toBe(38000);
    });

    it('Scenario R5: River more action 2 - SB calls BB re-raise', () => {
      // After R4: SB calls BB's 6000 re-raise
      // SB needs to add 3000 more to match 6000
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 5000 },
        { id: 2, name: 'BB', position: 'BB', stack: 2000 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 2000 },  // 5000 - 3000
        2: { currentStack: 2000 }   // unchanged
      };

      const contributedAmounts: ContributedAmounts = {
        'preflop_base': {
          1: 500,
          2: 2000
        },
        'flop_base': {
          1: 3000,
          2: 3000
        },
        'turn_base': {
          1: 2000,
          2: 2000
        },
        'river_base': {
          1: 2000,
          2: 2000
        },
        'river_more': {
          1: 3000,
          2: 6000
        },
        'river_more2': {
          1: 3000,  // calls to match 6000
          2: 0      // no action needed
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'turn_base': true,
        'river_base': true,
        'river_more': true,
        'river_more2': true
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          1: 14500,
          2: 13000
        },
        'flop_base': {
          1: 11500,
          2: 10000
        },
        'turn_base': {
          1: 9500,
          2: 8000
        },
        'river_base': {
          1: 8000,
          2: 8000
        },
        'river_more': {
          1: 5000,
          2: 2000
        },
        'river_more2': {
          1: 2000,
          2: 2000
        }
      };

      const previousPot = 25000;

      const potInfo = calculatePotsForBettingRound(
        'river',
        'more2',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Expected pot: 25000 (previous) + 4000 (river base) + 9000 (river more) + 3000 (river more2) = 41000
      expect(potInfo.totalPot).toBe(41000);
      expect(potInfo.mainPot.amount).toBe(41000);
    });

    it('Scenario R6: River with multiple all-ins and side pots', () => {
      // Previous pot: 20000
      // 4 players with varying stacks
      // River base: P1 all-in 500, P2 all-in 2000, P3 bets 4000, P4 bets 4000
      const players: Player[] = [
        { id: 1, name: 'P1', position: 'SB', stack: 500 },
        { id: 2, name: 'P2', position: 'BB', stack: 2000 },
        { id: 3, name: 'P3', position: 'UTG', stack: 6000 },
        { id: 4, name: 'P4', position: 'MP', stack: 6000 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 0, riverAction: 'all-in' },
        2: { currentStack: 0, riverAction: 'all-in' },
        3: { currentStack: 2000 },
        4: { currentStack: 2000 }
      };

      const contributedAmounts: ContributedAmounts = {
        'preflop_base': {
          1: 500,
          2: 1000,
          3: 1000,
          4: 1000
        },
        'flop_base': {
          1: 0,
          2: 1000,
          3: 2000,
          4: 2000
        },
        'turn_base': {
          1: 0,
          2: 1000,
          3: 3000,
          4: 3000
        },
        'river_base': {
          1: 500,   // all-in
          2: 2000,  // all-in
          3: 4000,
          4: 4000
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'turn_base': true,
        'river_base': true
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          1: 0,
          2: 1000,
          3: 5000,
          4: 5000
        },
        'flop_base': {
          1: 0,
          2: 0,
          3: 3000,
          4: 3000
        },
        'turn_base': {
          1: 0,
          2: 0,
          3: 2000,
          4: 2000
        },
        'river_base': {
          1: 0,
          2: 0,
          3: 2000,
          4: 2000
        }
      };

      const previousPot = 20000;

      const potInfo = calculatePotsForBettingRound(
        'river',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Main pot (capped at 500): 20000 + (500 × 4) = 22000
      // Side pot 1 (500-2000): (2000-500) × 3 = 4500
      // Side pot 2 (2000-4000): (4000-2000) × 2 = 4000
      // Total: 22000 + 4500 + 4000 = 30500
      expect(potInfo.totalPot).toBe(30500);
      expect(potInfo.mainPot.cappedAt).toBe(500);
      expect(potInfo.sidePots.length).toBeGreaterThanOrEqual(2);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(4);
    });

    it('Scenario R7: River with fold and dead money', () => {
      // Previous pot: 28000
      // 3 players: P1 bets 3000 then folds, P2 and P3 continue
      const players: Player[] = [
        { id: 1, name: 'P1', position: 'SB', stack: 8000 },
        { id: 2, name: 'P2', position: 'BB', stack: 8000 },
        { id: 3, name: 'P3', position: 'UTG', stack: 8000 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 5000, riverAction: 'fold' },
        2: { currentStack: 4000 },
        3: { currentStack: 4000 }
      };

      const contributedAmounts: ContributedAmounts = {
        'preflop_base': {
          1: 500,
          2: 1000,
          3: 1000
        },
        'flop_base': {
          1: 2000,
          2: 2000,
          3: 2000
        },
        'turn_base': {
          1: 3000,
          2: 3000,
          3: 3000
        },
        'river_base': {
          1: 3000,  // folded
          2: 4000,
          3: 4000
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'turn_base': true,
        'river_base': true
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          1: 9500,
          2: 9000,
          3: 9000
        },
        'flop_base': {
          1: 7500,
          2: 7000,
          3: 7000
        },
        'turn_base': {
          1: 4500,
          2: 4000,
          3: 4000
        },
        'river_base': {
          1: 5000,
          2: 4000,
          3: 4000
        }
      };

      const previousPot = 28000;

      const potInfo = calculatePotsForBettingRound(
        'river',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Total: 28000 (previous) + 3000 (folded) + 8000 (active) = 39000
      expect(potInfo.totalPot).toBe(39000);
      expect(potInfo.deadMoneyBreakdown.foldedBets).toBeGreaterThan(0);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(2);
      expect(potInfo.mainPot.excludedPlayers.length).toBe(1);
    });

    it('Scenario R8: River check-down (no betting)', () => {
      // Previous pot: 15000
      // All players check on river
      const players: Player[] = [
        { id: 1, name: 'P1', position: 'SB', stack: 9500 },
        { id: 2, name: 'P2', position: 'BB', stack: 9500 },
        { id: 3, name: 'P3', position: 'UTG', stack: 9500 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 9500, riverAction: 'check' },
        2: { currentStack: 9500, riverAction: 'check' },
        3: { currentStack: 9500, riverAction: 'check' }
      };

      const contributedAmounts: ContributedAmounts = {
        'preflop_base': {
          1: 500,
          2: 1000,
          3: 1000
        },
        'flop_base': {
          1: 1000,
          2: 1000,
          3: 1000
        },
        'turn_base': {
          1: 2000,
          2: 2000,
          3: 2000
        },
        'river_base': {
          1: 0,
          2: 0,
          3: 0
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'turn_base': true,
        'river_base': true
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          1: 9500,
          2: 9000,
          3: 9000
        },
        'flop_base': {
          1: 8500,
          2: 8000,
          3: 8000
        },
        'turn_base': {
          1: 6500,
          2: 6000,
          3: 6000
        },
        'river_base': {
          1: 9500,
          2: 9500,
          3: 9500
        }
      };

      const previousPot = 15000;

      const potInfo = calculatePotsForBettingRound(
        'river',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Total: 15000 (no additional betting)
      expect(potInfo.totalPot).toBe(15000);
      expect(potInfo.mainPot.amount).toBe(15000);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(3);
    });
  });
});
