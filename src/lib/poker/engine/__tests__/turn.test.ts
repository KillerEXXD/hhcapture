/**
 * Turn Pot Calculation Tests
 *
 * Comprehensive test suite for turn betting round with:
 * - Base action level
 * - More action level (more)
 * - More action 2 level (more2)
 * - All-in scenarios in each level
 * - Pot carry-forward from preflop and flop
 * - Side pot creation
 */

import { describe, it, expect } from 'vitest';
import { calculatePotsForBettingRound } from '../potCalculationEngine';
import type { Player, PlayerData, ContributedAmounts, ProcessedSections, SectionStacks } from '../../../../types/poker';

describe('Turn Pot Calculation Tests', () => {
  const gameConfig = {
    smallBlind: 50,
    bigBlind: 100,
    ante: 10
  };

  describe('Turn - Realistic Scenarios with More Actions', () => {
    it('Scenario T1: Turn base - SB bets 2000, BB raises 5000, SB calls', () => {
      // Previous pot: 22000 (from Flop F3)
      // Turn base: SB bets 2000, BB raises to 5000, SB calls
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 8500 },
        { id: 2, name: 'BB', position: 'BB', stack: 8500 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 3500 }, // 8500 - 5000
        2: { currentStack: 3500 }  // 8500 - 5000
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
          1: 5000,  // called raise
          2: 5000   // raised to 5000
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'flop_more': true,
        'flop_more2': true,
        'turn_base': true
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
        }
      };

      const previousPot = 22000; // From flop F3

      const potInfo = calculatePotsForBettingRound(
        'turn',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Expected pot: 22000 (previous) + 10000 (turn base) = 32000
      expect(potInfo.totalPot).toBe(32000);
      expect(potInfo.mainPot.amount).toBe(32000);
    });

    it('Scenario T2: Turn more action 1 - SB all-in 3500, BB calls', () => {
      // After T1: pot is 32000, both players have 3500 stacks
      // More Action 1: SB goes all-in for remaining 3500, BB calls
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 3500 },
        { id: 2, name: 'BB', position: 'BB', stack: 3500 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 0, turn_moreActionAction: 'all-in' },
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
          1: 3500,  // all-in
          2: 3500   // calls
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'flop_more': true,
        'flop_more2': true,
        'turn_base': true,
        'turn_more': true
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
        }
      };

      const previousPot = 22000;

      const potInfo = calculatePotsForBettingRound(
        'turn',
        'more',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Expected pot: 22000 (previous) + 10000 (turn base) + 7000 (turn more) = 39000
      expect(potInfo.totalPot).toBe(39000);
      expect(potInfo.mainPot.amount).toBe(39000);
    });

    it('Scenario T3: Turn with 3 players and all-in side pot', () => {
      // Previous pot: 15000 (from flop)
      // 3 players: SB (10k), BB (10k), UTG (3k short stack)
      // Turn base: SB bets 3000, BB raises 6000, UTG all-in 3000
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 10000 },
        { id: 2, name: 'BB', position: 'BB', stack: 10000 },
        { id: 3, name: 'UTG', position: 'UTG', stack: 3000 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 4000 },  // 10000 - 6000
        2: { currentStack: 4000 },  // 10000 - 6000
        3: { currentStack: 0, turnAction: 'all-in' }
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
          3: 3000  // all-in
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'turn_base': true
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
          1: 4000,
          2: 4000,
          3: 0
        }
      };

      const previousPot = 15000;

      const potInfo = calculatePotsForBettingRound(
        'turn',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Main pot (capped at 3000): 15000 + (3000 × 3) = 24000
      // Side pot (3000-6000): (6000-3000) × 2 = 6000
      // Total: 24000 + 6000 = 30000
      expect(potInfo.totalPot).toBe(30000);
      expect(potInfo.mainPot.cappedAt).toBe(3000);
      expect(potInfo.sidePots.length).toBe(1);
      expect(potInfo.sidePots[0].amount).toBe(6000);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(3);
      expect(potInfo.sidePots[0].eligiblePlayers.length).toBe(2);
    });

    it('Scenario T4: Turn more action with re-raise', () => {
      // Previous pot: 18000
      // Turn base: both bet 2000 (pot: 22000)
      // Turn more: SB raises 4000, BB re-raises 8000
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 12000 },
        { id: 2, name: 'BB', position: 'BB', stack: 12000 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 6000 },  // 12000 - 2000 - 4000
        2: { currentStack: 2000 }   // 12000 - 2000 - 8000
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
        'turn_more': {
          1: 4000,  // raised
          2: 8000   // re-raised
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'turn_base': true,
        'turn_more': true
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
          1: 10000,
          2: 10000
        },
        'turn_more': {
          1: 6000,
          2: 2000
        }
      };

      const previousPot = 18000;

      const potInfo = calculatePotsForBettingRound(
        'turn',
        'more',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Expected pot: 18000 (previous) + 4000 (turn base) + 12000 (turn more) = 34000
      expect(potInfo.totalPot).toBe(34000);
    });

    it('Scenario T5: Turn more action 2 - SB calls BB re-raise', () => {
      // After T4: SB calls BB's 8000 re-raise
      // SB needs to add 4000 more to match 8000
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 6000 },
        { id: 2, name: 'BB', position: 'BB', stack: 2000 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 2000 },  // 6000 - 4000
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
        'turn_more': {
          1: 4000,
          2: 8000
        },
        'turn_more2': {
          1: 4000,  // calls to match 8000
          2: 0      // no action needed
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'turn_base': true,
        'turn_more': true,
        'turn_more2': true
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
          1: 10000,
          2: 10000
        },
        'turn_more': {
          1: 6000,
          2: 2000
        },
        'turn_more2': {
          1: 2000,
          2: 2000
        }
      };

      const previousPot = 18000;

      const potInfo = calculatePotsForBettingRound(
        'turn',
        'more2',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Expected pot: 18000 (previous) + 4000 (turn base) + 12000 (turn more) + 4000 (turn more2) = 38000
      expect(potInfo.totalPot).toBe(38000);
      expect(potInfo.mainPot.amount).toBe(38000);
    });

    it('Scenario T6: Turn with multiple all-ins and side pots', () => {
      // Previous pot: 12000
      // 4 players with varying stacks
      // Turn base: P1 all-in 1000, P2 all-in 3000, P3 bets 5000, P4 bets 5000
      const players: Player[] = [
        { id: 1, name: 'P1', position: 'SB', stack: 1000 },
        { id: 2, name: 'P2', position: 'BB', stack: 3000 },
        { id: 3, name: 'P3', position: 'UTG', stack: 8000 },
        { id: 4, name: 'P4', position: 'MP', stack: 8000 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 0, turnAction: 'all-in' },
        2: { currentStack: 0, turnAction: 'all-in' },
        3: { currentStack: 3000 },
        4: { currentStack: 3000 }
      };

      const contributedAmounts: ContributedAmounts = {
        'preflop_base': {
          1: 500,
          2: 1000,
          3: 1000,
          4: 1000
        },
        'flop_base': {
          1: 500,
          2: 2000,
          3: 2000,
          4: 2000
        },
        'turn_base': {
          1: 1000,  // all-in
          2: 3000,  // all-in
          3: 5000,
          4: 5000
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'turn_base': true
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          1: 500,
          2: 2000,
          3: 7000,
          4: 7000
        },
        'flop_base': {
          1: 0,
          2: 0,
          3: 5000,
          4: 5000
        },
        'turn_base': {
          1: 0,
          2: 0,
          3: 3000,
          4: 3000
        }
      };

      const previousPot = 12000;

      const potInfo = calculatePotsForBettingRound(
        'turn',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Main pot (capped at 1000): 12000 + (1000 × 4) = 16000
      // Side pot 1 (1000-3000): (3000-1000) × 3 = 6000
      // Side pot 2 (3000-5000): (5000-3000) × 2 = 4000
      // Total: 16000 + 6000 + 4000 = 26000
      expect(potInfo.totalPot).toBe(26000);
      expect(potInfo.mainPot.cappedAt).toBe(1000);
      expect(potInfo.sidePots.length).toBeGreaterThanOrEqual(2);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(4);
    });

    it('Scenario T7: Turn with fold and dead money', () => {
      // Previous pot: 15000
      // 3 players: P1 bets 2000 then folds, P2 and P3 continue
      const players: Player[] = [
        { id: 1, name: 'P1', position: 'SB', stack: 10000 },
        { id: 2, name: 'P2', position: 'BB', stack: 10000 },
        { id: 3, name: 'P3', position: 'UTG', stack: 10000 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 8000, turnAction: 'fold' },
        2: { currentStack: 7000 },
        3: { currentStack: 7000 }
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
          1: 2000,  // folded
          2: 3000,
          3: 3000
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'turn_base': true
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
          1: 8000,
          2: 7000,
          3: 7000
        }
      };

      const previousPot = 15000;

      const potInfo = calculatePotsForBettingRound(
        'turn',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPot
      );

      // Total: 15000 (previous) + 2000 (folded) + 6000 (active) = 23000
      expect(potInfo.totalPot).toBe(23000);
      expect(potInfo.deadMoneyBreakdown.foldedBets).toBeGreaterThan(0);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(2);
      expect(potInfo.mainPot.excludedPlayers.length).toBe(1);
    });
  });
});
