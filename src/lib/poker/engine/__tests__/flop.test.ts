/**
 * Flop Pot Calculation Tests
 *
 * Comprehensive test suite for flop betting round with:
 * - Base action level
 * - More action level (more)
 * - More action 2 level (more2)
 * - All-in scenarios in each level
 * - Pot carry-forward from preflop
 * - Side pot creation
 */

import { describe, it, expect } from 'vitest';
import { calculatePotsForBettingRound } from '../potCalculationEngine';
import type { Player, PlayerData, ContributedAmounts, ProcessedSections, SectionStacks } from '../../../../types/poker';

describe('Flop Pot Calculation Tests', () => {
  // Common test setup
  const createPlayers = (count: number): Player[] => {
    const positions = ['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'];
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Player${i + 1}`,
      position: positions[i] || `P${i + 1}`,
      stack: 10000,
      cards: []
    }));
  };

  const gameConfig = {
    smallBlind: 50,
    bigBlind: 100,
    ante: 10
  };

  describe('Flop - Base Action Level', () => {
    it('should calculate pot with simple calls on flop (no preflop pot carry)', () => {
      // 3 players, each calls 100 on flop
      const players = createPlayers(3);
      const playerData: PlayerData = {
        1: { currentStack: 9900 },
        2: { currentStack: 9900 },
        3: { currentStack: 9900 }
      };

      const contributedAmounts: ContributedAmounts = {
        'flop_base': {
          1: 100,
          2: 100,
          3: 100
        }
      };

      const processedSections: ProcessedSections = {
        'flop_base': true
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          1: 9900,
          2: 9900,
          3: 9900
        }
      };

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        0 // No previous street pot
      );

      // Expected: 3 × 100 = 300
      expect(potInfo.totalPot).toBe(300);
      expect(potInfo.mainPot.amount).toBe(300);
      expect(potInfo.sidePots.length).toBe(0);
      expect(potInfo.deadMoney).toBe(0);
    });

    it('should calculate pot with flop base + preflop pot carry-forward', () => {
      // Preflop pot was 500, flop adds 3 × 150 = 450
      const players = createPlayers(3);
      const playerData: PlayerData = {
        1: { currentStack: 9850 },
        2: { currentStack: 9850 },
        3: { currentStack: 9850 }
      };

      const contributedAmounts: ContributedAmounts = {
        'preflop_base': {
          1: 100,
          2: 100,
          3: 100
        },
        'flop_base': {
          1: 150,
          2: 150,
          3: 150
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          1: 9900,
          2: 9900,
          3: 9900
        },
        'flop_base': {
          1: 9850,
          2: 9850,
          3: 9850
        }
      };

      const previousPreflopPot = 330; // 300 + 30 ante

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPreflopPot
      );

      // Expected: previousPot (330) + flop contributions (450) = 780
      expect(potInfo.totalPot).toBe(780);
    });

    it('should handle all-in on flop base with side pot creation', () => {
      // Player 1 all-in for 200, Player 2 calls 500, Player 3 calls 500
      const players = createPlayers(3);
      const playerData: PlayerData = {
        1: { currentStack: 0, flopAction: 'all-in' },
        2: { currentStack: 9500 },
        3: { currentStack: 9500 }
      };

      const contributedAmounts: ContributedAmounts = {
        'flop_base': {
          1: 200, // all-in
          2: 500,
          3: 500
        }
      };

      const processedSections: ProcessedSections = {
        'flop_base': true
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          1: 0,
          2: 9500,
          3: 9500
        }
      };

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        0
      );

      // Main Pot (capped at 200): 200 × 3 = 600
      // Side Pot (200 to 500): (500 - 200) × 2 = 600
      // Total: 600 + 600 = 1200
      expect(potInfo.totalPot).toBe(1200);
      expect(potInfo.mainPot.amount).toBe(600);
      expect(potInfo.mainPot.cappedAt).toBe(200);
      expect(potInfo.sidePots.length).toBe(1);
      expect(potInfo.sidePots[0].amount).toBe(600);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(3);
      expect(potInfo.sidePots[0].eligiblePlayers.length).toBe(2);
    });
  });

  describe('Flop - More Action Level', () => {
    it('should calculate pot with flop more action (after base)', () => {
      // Base: 3 × 200 = 600, More: 3 × 300 = 900
      const players = createPlayers(3);
      const playerData: PlayerData = {
        1: { currentStack: 9500 },
        2: { currentStack: 9500 },
        3: { currentStack: 9500 }
      };

      const contributedAmounts: ContributedAmounts = {
        'flop_base': {
          1: 200,
          2: 200,
          3: 200
        },
        'flop_more': {
          1: 300,
          2: 300,
          3: 300
        }
      };

      const processedSections: ProcessedSections = {
        'flop_base': true,
        'flop_more': true
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          1: 9800,
          2: 9800,
          3: 9800
        },
        'flop_more': {
          1: 9500,
          2: 9500,
          3: 9500
        }
      };

      const previousPreflopPot = 500;

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'more',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPreflopPot
      );

      // Total contributions in flop: base (600) + more (900) = 1500
      // With previousPot (500): 1500 + 500 = 2000
      expect(potInfo.totalPot).toBe(2000);
    });

    it('should handle all-in in flop more action with side pot', () => {
      // Player 1 all-in for 150 in more, Players 2-3 bet 400 each
      const players = createPlayers(3);
      const playerData: PlayerData = {
        1: { currentStack: 0, flop_moreActionAction: 'all-in' },
        2: { currentStack: 9400 },
        3: { currentStack: 9400 }
      };

      const contributedAmounts: ContributedAmounts = {
        'flop_base': {
          1: 200,
          2: 200,
          3: 200
        },
        'flop_more': {
          1: 150, // all-in
          2: 400,
          3: 400
        }
      };

      const processedSections: ProcessedSections = {
        'flop_base': true,
        'flop_more': true
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          1: 9800,
          2: 9800,
          3: 9800
        },
        'flop_more': {
          1: 0,
          2: 9400,
          3: 9400
        }
      };

      const previousPreflopPot = 600;

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'more',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPreflopPot
      );

      // Base contributions: 3 × 200 = 600
      // More contributions up to 150: 150 × 3 = 450
      // More contributions 150-400: (400-150) × 2 = 500
      // With previous pot: 600 + 450 + 500 + 600 = 2150
      expect(potInfo.totalPot).toBe(2150);
      expect(potInfo.sidePots.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Flop - More Action 2 Level', () => {
    it('should calculate pot with flop more2 action (after base and more)', () => {
      // Base: 3 × 150 = 450, More: 3 × 250 = 750, More2: 3 × 350 = 1050
      const players = createPlayers(3);
      const playerData: PlayerData = {
        1: { currentStack: 9250 },
        2: { currentStack: 9250 },
        3: { currentStack: 9250 }
      };

      const contributedAmounts: ContributedAmounts = {
        'flop_base': {
          1: 150,
          2: 150,
          3: 150
        },
        'flop_more': {
          1: 250,
          2: 250,
          3: 250
        },
        'flop_more2': {
          1: 350,
          2: 350,
          3: 350
        }
      };

      const processedSections: ProcessedSections = {
        'flop_base': true,
        'flop_more': true,
        'flop_more2': true
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          1: 9850,
          2: 9850,
          3: 9850
        },
        'flop_more': {
          1: 9600,
          2: 9600,
          3: 9600
        },
        'flop_more2': {
          1: 9250,
          2: 9250,
          3: 9250
        }
      };

      const previousPreflopPot = 450;

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'more2',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPreflopPot
      );

      // Total flop: 450 + 750 + 1050 = 2250
      // With preflop: 2250 + 450 = 2700
      expect(potInfo.totalPot).toBe(2700);
    });

    it('should handle all-in in flop more2 with multiple side pots', () => {
      // Player 1 all-in 100 in more2, Player 2 all-in 300, Player 3 bets 500
      const players = createPlayers(3);
      const playerData: PlayerData = {
        1: { currentStack: 0, flop_moreAction2Action: 'all-in' },
        2: { currentStack: 0, flop_moreAction2Action: 'all-in' },
        3: { currentStack: 8900 }
      };

      const contributedAmounts: ContributedAmounts = {
        'flop_base': {
          1: 200,
          2: 200,
          3: 200
        },
        'flop_more': {
          1: 300,
          2: 300,
          3: 300
        },
        'flop_more2': {
          1: 100, // all-in
          2: 300, // all-in
          3: 500
        }
      };

      const processedSections: ProcessedSections = {
        'flop_base': true,
        'flop_more': true,
        'flop_more2': true
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          1: 9800,
          2: 9800,
          3: 9800
        },
        'flop_more': {
          1: 9500,
          2: 9500,
          3: 9500
        },
        'flop_more2': {
          1: 0,
          2: 0,
          3: 8900
        }
      };

      const previousPreflopPot = 360;

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'more2',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPreflopPot
      );

      // Verify multiple side pots created
      expect(potInfo.sidePots.length).toBeGreaterThanOrEqual(2);
      expect(potInfo.totalPot).toBeGreaterThan(0);
    });
  });

  describe('Flop - Fold Scenarios', () => {
    it('should handle fold on flop base and calculate dead money', () => {
      // Player 1 bets 200 then folds, Players 2-3 continue
      const players = createPlayers(3);
      const playerData: PlayerData = {
        1: { currentStack: 9800, flopAction: 'fold' },
        2: { currentStack: 9700 },
        3: { currentStack: 9700 }
      };

      const contributedAmounts: ContributedAmounts = {
        'flop_base': {
          1: 200, // folded
          2: 300,
          3: 300
        }
      };

      const processedSections: ProcessedSections = {
        'flop_base': true
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          1: 9800,
          2: 9700,
          3: 9700
        }
      };

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        0
      );

      // Total: 200 (folded) + 300 + 300 = 800
      expect(potInfo.totalPot).toBe(800);
      expect(potInfo.deadMoneyBreakdown.foldedBets).toBeGreaterThan(0);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(2);
      expect(potInfo.mainPot.excludedPlayers.length).toBe(1);
    });
  });

  describe('Flop - Complex Multi-Level All-In Scenarios', () => {
    it('should handle all-ins across base, more, and more2 levels', () => {
      // Player 1: all-in in base (100)
      // Player 2: all-in in more (total 400)
      // Player 3: survives to more2 (total 900)
      const players = createPlayers(3);
      const playerData: PlayerData = {
        1: { currentStack: 0, flopAction: 'all-in' },
        2: { currentStack: 0, flop_moreActionAction: 'all-in' },
        3: { currentStack: 9100 }
      };

      const contributedAmounts: ContributedAmounts = {
        'flop_base': {
          1: 100, // all-in
          2: 100,
          3: 100
        },
        'flop_more': {
          1: 0,
          2: 300, // all-in (total 400)
          3: 300
        },
        'flop_more2': {
          1: 0,
          2: 0,
          3: 500 // (total 900)
        }
      };

      const processedSections: ProcessedSections = {
        'flop_base': true,
        'flop_more': true,
        'flop_more2': true
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          1: 0,
          2: 9900,
          3: 9900
        },
        'flop_more': {
          1: 0,
          2: 0,
          3: 9600
        },
        'flop_more2': {
          1: 0,
          2: 0,
          3: 9100
        }
      };

      const previousPreflopPot = 300;

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'more2',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPreflopPot
      );

      // Should create multiple side pots
      expect(potInfo.sidePots.length).toBeGreaterThanOrEqual(2);
      expect(potInfo.totalPot).toBeGreaterThan(0);

      // Main pot should be capped at Player 1's all-in amount
      expect(potInfo.mainPot.cappedAt).toBeLessThanOrEqual(100);
    });
  });

  describe('Flop - Realistic Scenarios with More Actions', () => {
    it('Scenario F1: Flop base - SB bets 500, BB raises 1500, SB calls', () => {
      // Preflop pot: 9000 (from user scenario with 9 players)
      // Flop base: SB bets 500, BB raises to 1500, SB calls
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 15000 },
        { id: 2, name: 'BB', position: 'BB', stack: 15000 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 13500 }, // 15000 - 1500
        2: { currentStack: 13500 }  // 15000 - 1500
      };

      const contributedAmounts: ContributedAmounts = {
        'preflop_base': {
          1: 500,  // SB posted
          2: 2000  // BB posted 1000 + 1000 ante
        },
        'flop_base': {
          1: 1500,  // called raise
          2: 1500   // raised to 1500
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          1: 14500,
          2: 13000
        },
        'flop_base': {
          1: 13500,
          2: 13500
        }
      };

      const previousPreflopPot = 9000; // From previous scenario

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPreflopPot
      );

      // Expected pot: 9000 (preflop) + 3000 (flop base) = 12000
      expect(potInfo.totalPot).toBe(12000);
      expect(potInfo.mainPot.amount).toBe(12000);
    });

    it('Scenario F2: Flop more action 1 - SB raises 3000, BB re-raises 5000', () => {
      // After F1: pot is 12000, both players have 13500 stacks
      // More Action 1: SB raises 3000, BB re-raises to 5000
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 13500 },
        { id: 2, name: 'BB', position: 'BB', stack: 13500 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 10500 }, // 13500 - 3000
        2: { currentStack: 8500 }   // 13500 - 5000
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
          1: 3000,  // raised
          2: 5000   // re-raised
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'flop_more': true
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
        }
      };

      const previousPreflopPot = 9000;

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'more',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPreflopPot
      );

      // Expected pot: 9000 (preflop) + 3000 (flop base) + 8000 (more) = 20000
      expect(potInfo.totalPot).toBe(20000);
    });

    it('Scenario F3: Flop more action 2 - SB calls 5000', () => {
      // After F2: SB calls BB's 5000 re-raise
      // SB needs to add 2000 more to match 5000
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 10500 },
        { id: 2, name: 'BB', position: 'BB', stack: 8500 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 8500 },  // 10500 - 2000
        2: { currentStack: 8500 }   // unchanged
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
          1: 2000,  // calls to match 5000
          2: 0      // no action needed
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true,
        'flop_more': true,
        'flop_more2': true
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
        }
      };

      const previousPreflopPot = 9000;

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'more2',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPreflopPot
      );

      // Expected pot: 9000 (preflop) + 3000 (flop base) + 8000 (more) + 2000 (more2) = 22000
      expect(potInfo.totalPot).toBe(22000);
      expect(potInfo.mainPot.amount).toBe(22000);
    });

    it('Scenario F4: Flop with all-in creating side pot - 3 players', () => {
      // Preflop pot: 9000
      // 3 players: SB (15k), BB (15k), UTG (2k short stack)
      // Flop base: SB bets 1000, BB calls, UTG all-in 2000
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 15000 },
        { id: 2, name: 'BB', position: 'BB', stack: 15000 },
        { id: 3, name: 'UTG', position: 'UTG', stack: 2000 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 13000 }, // 15000 - 2000
        2: { currentStack: 13000 }, // 15000 - 2000
        3: { currentStack: 0, flopAction: 'all-in' }
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
          3: 2000  // all-in
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          1: 14500,
          2: 13000,
          3: 1000
        },
        'flop_base': {
          1: 13000,
          2: 13000,
          3: 0
        }
      };

      const previousPreflopPot = 9000;

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPreflopPot
      );

      // Main pot: 9000 (preflop) + 6000 (flop: 3 × 2000) = 15000
      // All 3 players eligible since all contributed equally
      expect(potInfo.totalPot).toBe(15000);
      expect(potInfo.mainPot.amount).toBe(15000);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(3);
      expect(potInfo.sidePots.length).toBe(0); // No side pot since all matched
    });

    it('Scenario F5: Flop with all-in and side pot - short stack', () => {
      // Preflop pot: 9000
      // 3 players: SB (15k), BB (15k), UTG (1.5k short stack)
      // Flop base: SB bets 2000, BB raises 4000, UTG all-in 1500
      const players: Player[] = [
        { id: 1, name: 'SB', position: 'SB', stack: 15000 },
        { id: 2, name: 'BB', position: 'BB', stack: 15000 },
        { id: 3, name: 'UTG', position: 'UTG', stack: 1500 },
      ];

      const playerData: PlayerData = {
        1: { currentStack: 11000 }, // 15000 - 4000
        2: { currentStack: 11000 }, // 15000 - 4000
        3: { currentStack: 0, flopAction: 'all-in' }
      };

      const contributedAmounts: ContributedAmounts = {
        'preflop_base': {
          1: 500,
          2: 2000,
          3: 500
        },
        'flop_base': {
          1: 4000,
          2: 4000,
          3: 1500  // all-in
        }
      };

      const processedSections: ProcessedSections = {
        'preflop_base': true,
        'flop_base': true
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          1: 14500,
          2: 13000,
          3: 1000
        },
        'flop_base': {
          1: 11000,
          2: 11000,
          3: 0
        }
      };

      const previousPreflopPot = 9000;

      const potInfo = calculatePotsForBettingRound(
        'flop',
        'base',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        gameConfig,
        previousPreflopPot
      );

      // Main pot (capped at 1500): 9000 + (1500 × 3) = 13500
      // Side pot (1500-4000): (4000-1500) × 2 = 5000
      // Total: 13500 + 5000 = 18500
      expect(potInfo.totalPot).toBe(18500);
      expect(potInfo.mainPot.cappedAt).toBe(1500);
      expect(potInfo.sidePots.length).toBe(1);
      expect(potInfo.sidePots[0].amount).toBe(5000);
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(3);
      expect(potInfo.sidePots[0].eligiblePlayers.length).toBe(2);
    });
  });
});
