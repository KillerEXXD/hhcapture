/**
 * Sequential Raise Validation Tests
 *
 * Tests order-aware FR-12 validation for sequential raises across all 12 sections
 * (preflop/flop/turn/river × base/more/more2)
 *
 * Scenario: Multiple players raise in sequence, each must exceed the previous raise.
 * Validates that early raises are not incorrectly rejected based on later raises.
 */

import { describe, it, expect } from '@jest/globals';
import { validateRaiseAmount } from '../raiseValidator';
import type { Player, PlayerData, SectionStacks } from '../../../../types/poker';

describe('Sequential Raise Validation - Order-Aware FR-12', () => {
  // Common setup: 9 players with 10K starting stacks
  const players: Player[] = [
    { id: 1, name: 'Alice', position: 'Dealer', stack: 10000 },
    { id: 2, name: 'Bob', position: 'SB', stack: 10000 },
    { id: 3, name: 'Charlie', position: 'BB', stack: 10000 },
    { id: 4, name: 'David', position: 'UTG', stack: 10000 },
    { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
    { id: 6, name: 'David', position: 'MP', stack: 10000 },
    { id: 7, name: 'Emma', position: 'MP+1', stack: 10000 },
    { id: 8, name: 'Frank', position: 'CO', stack: 10000 },
    { id: 9, name: 'Grace', position: 'HJ', stack: 10000 },
  ];

  /**
   * PREFLOP BASE - Sequential Raises
   *
   * Scenario from user's bug report:
   * - Player 5 (Charlie) raises to 2K (first raiser, should be valid)
   * - Player 6 (David) raises to 3K (exceeds Charlie's 2K, should be valid)
   * - Player 7 (Emma) raises to 4K (exceeds David's 3K, should be valid)
   * - Player 8 (Frank) raises to 3K (INVALID - doesn't exceed Emma's 4K)
   * - Player 9 (Grace) raises to 2K (INVALID - doesn't exceed Emma's 4K)
   */
  describe('PreFlop BASE - Sequential Raises', () => {
    it('should validate sequential raises in player order (Charlie 2K → David 3K → Emma 4K)', () => {
      const playerData: PlayerData = {
        2: { postedSB: 500, postedBB: 0 },
        3: { postedSB: 0, postedBB: 1000 },
        5: { preflopAction: 'raise', preflopAmount: '2', preflopUnit: 'K' }, // Charlie: 2K
        6: { preflopAction: 'raise', preflopAmount: '3', preflopUnit: 'K' }, // David: 3K
        7: { preflopAction: 'raise', preflopAmount: '4', preflopUnit: 'K' }, // Emma: 4K
        8: { preflopAction: 'raise', preflopAmount: '3', preflopUnit: 'K' }, // Frank: 3K (invalid)
        9: { preflopAction: 'raise', preflopAmount: '2', preflopUnit: 'K' }, // Grace: 2K (invalid)
      };

      const sectionStacks: SectionStacks = {
        preflop_base: {
          initial: {},
          current: {},
          updated: {
            5: 10000, 6: 10000, 7: 10000, 8: 10000, 9: 10000
          }
        }
      };

      // Validate Player 5 (Charlie) - First raiser, 2K should be valid
      const charlieResult = validateRaiseAmount(
        5, 2, 'preflop', 'base', players, playerData, sectionStacks, 'K', 5
      );
      expect(charlieResult.isValid).toBe(true);

      // Validate Player 6 (David) - 3K exceeds Charlie's 2K, should be valid
      const davidResult = validateRaiseAmount(
        6, 3, 'preflop', 'base', players, playerData, sectionStacks, 'K', 6
      );
      expect(davidResult.isValid).toBe(true);

      // Validate Player 7 (Emma) - 4K exceeds David's 3K, should be valid
      const emmaResult = validateRaiseAmount(
        7, 4, 'preflop', 'base', players, playerData, sectionStacks, 'K', 7
      );
      expect(emmaResult.isValid).toBe(true);

      // Validate Player 8 (Frank) - 3K does NOT exceed Emma's 4K, should be INVALID
      const frankResult = validateRaiseAmount(
        8, 3, 'preflop', 'base', players, playerData, sectionStacks, 'K', 8
      );
      expect(frankResult.isValid).toBe(false);
      expect(frankResult.errorMessage).toContain('must be greater than current max bet');

      // Validate Player 9 (Grace) - 2K does NOT exceed Emma's 4K, should be INVALID
      const graceResult = validateRaiseAmount(
        9, 2, 'preflop', 'base', players, playerData, sectionStacks, 'K', 9
      );
      expect(graceResult.isValid).toBe(false);
      expect(graceResult.errorMessage).toContain('must be greater than current max bet');
    });

    it('should handle all players folding except one raiser', () => {
      const playerData: PlayerData = {
        2: { postedSB: 500, postedBB: 0, preflopAction: 'fold' },
        3: { postedSB: 0, postedBB: 1000, preflopAction: 'fold' },
        4: { preflopAction: 'fold' },
        5: { preflopAction: 'raise', preflopAmount: '2', preflopUnit: 'K' }, // Charlie: 2K (only raiser)
        6: { preflopAction: 'fold' },
        7: { preflopAction: 'fold' },
        8: { preflopAction: 'fold' },
        9: { preflopAction: 'fold' },
      };

      const sectionStacks: SectionStacks = {
        preflop_base: {
          initial: {},
          current: {},
          updated: { 5: 10000 }
        }
      };

      const charlieResult = validateRaiseAmount(
        5, 2, 'preflop', 'base', players, playerData, sectionStacks, 'K', 5
      );
      expect(charlieResult.isValid).toBe(true);
    });
  });

  /**
   * PREFLOP MORE - Sequential Raises
   */
  describe('PreFlop MORE - Sequential Raises', () => {
    it('should validate sequential raises in More Action round', () => {
      const playerData: PlayerData = {
        2: { postedSB: 500, postedBB: 0, preflopAction: 'call', preflopAmount: '2', preflopUnit: 'K' },
        3: { postedSB: 0, postedBB: 1000, preflopAction: 'raise', preflopAmount: '2', preflopUnit: 'K' },
        5: {
          preflopAction: 'call', preflopAmount: '2', preflopUnit: 'K',
          preflop_moreActionAction: 'raise', preflop_moreActionAmount: '5', preflop_moreActionUnit: 'K'
        },
        6: {
          preflopAction: 'call', preflopAmount: '2', preflopUnit: 'K',
          preflop_moreActionAction: 'raise', preflop_moreActionAmount: '7', preflop_moreActionUnit: 'K'
        },
        7: {
          preflopAction: 'call', preflopAmount: '2', preflopUnit: 'K',
          preflop_moreActionAction: 'raise', preflop_moreActionAmount: '10', preflop_moreActionUnit: 'K'
        },
      };

      const sectionStacks: SectionStacks = {
        preflop_more: {
          initial: {},
          current: {},
          updated: { 5: 8000, 6: 8000, 7: 8000 }
        }
      };

      // Player 5: 5K raise (first in More Action)
      const p5Result = validateRaiseAmount(
        5, 5, 'preflop', 'more', players, playerData, sectionStacks, 'K', 5
      );
      expect(p5Result.isValid).toBe(true);

      // Player 6: 7K raise (exceeds 5K)
      const p6Result = validateRaiseAmount(
        6, 7, 'preflop', 'more', players, playerData, sectionStacks, 'K', 6
      );
      expect(p6Result.isValid).toBe(true);

      // Player 7: 10K raise (exceeds 7K)
      const p7Result = validateRaiseAmount(
        7, 10, 'preflop', 'more', players, playerData, sectionStacks, 'K', 7
      );
      expect(p7Result.isValid).toBe(true);
    });
  });

  /**
   * PREFLOP MORE2 - Sequential Raises
   */
  describe('PreFlop MORE2 - Sequential Raises', () => {
    it('should validate sequential raises in More Action 2 round', () => {
      const playerData: PlayerData = {
        2: {
          postedSB: 500, postedBB: 0,
          preflopAction: 'call', preflopAmount: '2', preflopUnit: 'K',
          preflop_moreActionAction: 'call', preflop_moreActionAmount: '5', preflop_moreActionUnit: 'K',
          preflop_moreAction2Action: 'raise', preflop_moreAction2Amount: '8', preflop_moreAction2Unit: 'K'
        },
        3: {
          postedSB: 0, postedBB: 1000,
          preflopAction: 'raise', preflopAmount: '2', preflopUnit: 'K',
          preflop_moreActionAction: 'raise', preflop_moreActionAmount: '5', preflop_moreActionUnit: 'K',
          preflop_moreAction2Action: 'raise', preflop_moreAction2Amount: '9', preflop_moreAction2Unit: 'K'
        },
      };

      const sectionStacks: SectionStacks = {
        preflop_more2: {
          initial: {},
          current: {},
          updated: { 2: 5000, 3: 5000 }
        }
      };

      // Player 2: 8K raise
      const p2Result = validateRaiseAmount(
        2, 8, 'preflop', 'more2', players, playerData, sectionStacks, 'K', 2
      );
      expect(p2Result.isValid).toBe(true);

      // Player 3: 9K raise (exceeds 8K)
      const p3Result = validateRaiseAmount(
        3, 9, 'preflop', 'more2', players, playerData, sectionStacks, 'K', 3
      );
      expect(p3Result.isValid).toBe(true);
    });
  });

  /**
   * FLOP BASE - Sequential Raises
   */
  describe('Flop BASE - Sequential Raises', () => {
    it('should validate sequential raises on flop', () => {
      const playerData: PlayerData = {
        2: { flopAction: 'bet', flopAmount: '1', flopUnit: 'K' },
        3: { flopAction: 'raise', flopAmount: '3', flopUnit: 'K' },
        4: { flopAction: 'raise', flopAmount: '6', flopUnit: 'K' },
        5: { flopAction: 'raise', flopAmount: '5', flopUnit: 'K' }, // INVALID: doesn't exceed 6K
      };

      const sectionStacks: SectionStacks = {
        flop_base: {
          initial: {},
          current: {},
          updated: { 2: 9000, 3: 9000, 4: 9000, 5: 9000 }
        }
      };

      // Player 2: 1K bet (first action)
      const p2Result = validateRaiseAmount(
        2, 1, 'flop', 'base', players, playerData, sectionStacks, 'K', 2
      );
      expect(p2Result.isValid).toBe(true);

      // Player 3: 3K raise (exceeds 1K)
      const p3Result = validateRaiseAmount(
        3, 3, 'flop', 'base', players, playerData, sectionStacks, 'K', 3
      );
      expect(p3Result.isValid).toBe(true);

      // Player 4: 6K raise (exceeds 3K)
      const p4Result = validateRaiseAmount(
        4, 6, 'flop', 'base', players, playerData, sectionStacks, 'K', 4
      );
      expect(p4Result.isValid).toBe(true);

      // Player 5: 5K raise (INVALID - doesn't exceed 6K)
      const p5Result = validateRaiseAmount(
        5, 5, 'flop', 'base', players, playerData, sectionStacks, 'K', 5
      );
      expect(p5Result.isValid).toBe(false);
    });
  });

  /**
   * FLOP MORE - Sequential Raises
   */
  describe('Flop MORE - Sequential Raises', () => {
    it('should validate sequential raises in Flop More Action', () => {
      const playerData: PlayerData = {
        2: {
          flopAction: 'bet', flopAmount: '2', flopUnit: 'K',
          flop_moreActionAction: 'raise', flop_moreActionAmount: '4', flop_moreActionUnit: 'K'
        },
        3: {
          flopAction: 'call', flopAmount: '2', flopUnit: 'K',
          flop_moreActionAction: 'raise', flop_moreActionAmount: '6', flop_moreActionUnit: 'K'
        },
      };

      const sectionStacks: SectionStacks = {
        flop_more: {
          initial: {},
          current: {},
          updated: { 2: 8000, 3: 8000 }
        }
      };

      const p2Result = validateRaiseAmount(
        2, 4, 'flop', 'more', players, playerData, sectionStacks, 'K', 2
      );
      expect(p2Result.isValid).toBe(true);

      const p3Result = validateRaiseAmount(
        3, 6, 'flop', 'more', players, playerData, sectionStacks, 'K', 3
      );
      expect(p3Result.isValid).toBe(true);
    });
  });

  /**
   * FLOP MORE2 - Sequential Raises
   */
  describe('Flop MORE2 - Sequential Raises', () => {
    it('should validate sequential raises in Flop More Action 2', () => {
      const playerData: PlayerData = {
        2: {
          flopAction: 'bet', flopAmount: '1', flopUnit: 'K',
          flop_moreActionAction: 'raise', flop_moreActionAmount: '3', flop_moreActionUnit: 'K',
          flop_moreAction2Action: 'raise', flop_moreAction2Amount: '5', flop_moreAction2Unit: 'K'
        },
        3: {
          flopAction: 'call', flopAmount: '1', flopUnit: 'K',
          flop_moreActionAction: 'call', flop_moreActionAmount: '3', flop_moreActionUnit: 'K',
          flop_moreAction2Action: 'raise', flop_moreAction2Amount: '7', flop_moreAction2Unit: 'K'
        },
      };

      const sectionStacks: SectionStacks = {
        flop_more2: {
          initial: {},
          current: {},
          updated: { 2: 7000, 3: 7000 }
        }
      };

      const p2Result = validateRaiseAmount(
        2, 5, 'flop', 'more2', players, playerData, sectionStacks, 'K', 2
      );
      expect(p2Result.isValid).toBe(true);

      const p3Result = validateRaiseAmount(
        3, 7, 'flop', 'more2', players, playerData, sectionStacks, 'K', 3
      );
      expect(p3Result.isValid).toBe(true);
    });
  });

  /**
   * TURN BASE - Sequential Raises
   */
  describe('Turn BASE - Sequential Raises', () => {
    it('should validate sequential raises on turn', () => {
      const playerData: PlayerData = {
        1: { turnAction: 'bet', turnAmount: '2', turnUnit: 'K' },
        2: { turnAction: 'raise', turnAmount: '5', turnUnit: 'K' },
        3: { turnAction: 'raise', turnAmount: '8', turnUnit: 'K' },
        4: { turnAction: 'raise', turnAmount: '7', turnUnit: 'K' }, // INVALID
      };

      const sectionStacks: SectionStacks = {
        turn_base: {
          initial: {},
          current: {},
          updated: { 1: 8000, 2: 8000, 3: 8000, 4: 8000 }
        }
      };

      const p1Result = validateRaiseAmount(
        1, 2, 'turn', 'base', players, playerData, sectionStacks, 'K', 1
      );
      expect(p1Result.isValid).toBe(true);

      const p2Result = validateRaiseAmount(
        2, 5, 'turn', 'base', players, playerData, sectionStacks, 'K', 2
      );
      expect(p2Result.isValid).toBe(true);

      const p3Result = validateRaiseAmount(
        3, 8, 'turn', 'base', players, playerData, sectionStacks, 'K', 3
      );
      expect(p3Result.isValid).toBe(true);

      const p4Result = validateRaiseAmount(
        4, 7, 'turn', 'base', players, playerData, sectionStacks, 'K', 4
      );
      expect(p4Result.isValid).toBe(false);
    });
  });

  /**
   * TURN MORE - Sequential Raises
   */
  describe('Turn MORE - Sequential Raises', () => {
    it('should validate sequential raises in Turn More Action', () => {
      const playerData: PlayerData = {
        1: {
          turnAction: 'bet', turnAmount: '3', turnUnit: 'K',
          turn_moreActionAction: 'raise', turn_moreActionAmount: '6', turn_moreActionUnit: 'K'
        },
        2: {
          turnAction: 'call', turnAmount: '3', turnUnit: 'K',
          turn_moreActionAction: 'raise', turn_moreActionAmount: '9', turn_moreActionUnit: 'K'
        },
      };

      const sectionStacks: SectionStacks = {
        turn_more: {
          initial: {},
          current: {},
          updated: { 1: 7000, 2: 7000 }
        }
      };

      const p1Result = validateRaiseAmount(
        1, 6, 'turn', 'more', players, playerData, sectionStacks, 'K', 1
      );
      expect(p1Result.isValid).toBe(true);

      const p2Result = validateRaiseAmount(
        2, 9, 'turn', 'more', players, playerData, sectionStacks, 'K', 2
      );
      expect(p2Result.isValid).toBe(true);
    });
  });

  /**
   * TURN MORE2 - Sequential Raises
   */
  describe('Turn MORE2 - Sequential Raises', () => {
    it('should validate sequential raises in Turn More Action 2', () => {
      const playerData: PlayerData = {
        1: {
          turnAction: 'bet', turnAmount: '2', turnUnit: 'K',
          turn_moreActionAction: 'raise', turn_moreActionAmount: '4', turn_moreActionUnit: 'K',
          turn_moreAction2Action: 'raise', turn_moreAction2Amount: '6', turn_moreAction2Unit: 'K'
        },
        2: {
          turnAction: 'call', turnAmount: '2', turnUnit: 'K',
          turn_moreActionAction: 'call', turn_moreActionAmount: '4', turn_moreActionUnit: 'K',
          turn_moreAction2Action: 'raise', turn_moreAction2Amount: '8', turn_moreAction2Unit: 'K'
        },
      };

      const sectionStacks: SectionStacks = {
        turn_more2: {
          initial: {},
          current: {},
          updated: { 1: 6000, 2: 6000 }
        }
      };

      const p1Result = validateRaiseAmount(
        1, 6, 'turn', 'more2', players, playerData, sectionStacks, 'K', 1
      );
      expect(p1Result.isValid).toBe(true);

      const p2Result = validateRaiseAmount(
        2, 8, 'turn', 'more2', players, playerData, sectionStacks, 'K', 2
      );
      expect(p2Result.isValid).toBe(true);
    });
  });

  /**
   * RIVER BASE - Sequential Raises
   */
  describe('River BASE - Sequential Raises', () => {
    it('should validate sequential raises on river', () => {
      const playerData: PlayerData = {
        1: { riverAction: 'bet', riverAmount: '1', riverUnit: 'K' },
        2: { riverAction: 'raise', riverAmount: '3', riverUnit: 'K' },
        3: { riverAction: 'raise', riverAmount: '5', riverUnit: 'K' },
        4: { riverAction: 'raise', riverAmount: '4', riverUnit: 'K' }, // INVALID - doesn't exceed 5K
      };

      const sectionStacks: SectionStacks = {
        river_base: {
          initial: {},
          current: {},
          updated: { 1: 9000, 2: 9000, 3: 9000, 4: 9000 }
        }
      };

      const p1Result = validateRaiseAmount(
        1, 1, 'river', 'base', players, playerData, sectionStacks, 'K', 1
      );
      expect(p1Result.isValid).toBe(true);

      const p2Result = validateRaiseAmount(
        2, 3, 'river', 'base', players, playerData, sectionStacks, 'K', 2
      );
      expect(p2Result.isValid).toBe(true);

      const p3Result = validateRaiseAmount(
        3, 5, 'river', 'base', players, playerData, sectionStacks, 'K', 3
      );
      expect(p3Result.isValid).toBe(true);

      const p4Result = validateRaiseAmount(
        4, 4, 'river', 'base', players, playerData, sectionStacks, 'K', 4
      );
      expect(p4Result.isValid).toBe(false);
    });
  });

  /**
   * RIVER MORE - Sequential Raises
   */
  describe('River MORE - Sequential Raises', () => {
    it('should validate sequential raises in River More Action', () => {
      const playerData: PlayerData = {
        1: {
          riverAction: 'bet', riverAmount: '2', riverUnit: 'K',
          river_moreActionAction: 'raise', river_moreActionAmount: '4', river_moreActionUnit: 'K'
        },
        2: {
          riverAction: 'call', riverAmount: '2', riverUnit: 'K',
          river_moreActionAction: 'raise', river_moreActionAmount: '6', river_moreActionUnit: 'K'
        },
      };

      const sectionStacks: SectionStacks = {
        river_more: {
          initial: {},
          current: {},
          updated: { 1: 8000, 2: 8000 }
        }
      };

      const p1Result = validateRaiseAmount(
        1, 4, 'river', 'more', players, playerData, sectionStacks, 'K', 1
      );
      expect(p1Result.isValid).toBe(true);

      const p2Result = validateRaiseAmount(
        2, 6, 'river', 'more', players, playerData, sectionStacks, 'K', 2
      );
      expect(p2Result.isValid).toBe(true);
    });
  });

  /**
   * RIVER MORE2 - Sequential Raises
   */
  describe('River MORE2 - Sequential Raises', () => {
    it('should validate sequential raises in River More Action 2', () => {
      const playerData: PlayerData = {
        1: {
          riverAction: 'bet', riverAmount: '1', riverUnit: 'K',
          river_moreActionAction: 'raise', river_moreActionAmount: '3', river_moreActionUnit: 'K',
          river_moreAction2Action: 'raise', river_moreAction2Amount: '5', river_moreAction2Unit: 'K'
        },
        2: {
          riverAction: 'call', riverAmount: '1', riverUnit: 'K',
          river_moreActionAction: 'call', river_moreActionAmount: '3', river_moreActionUnit: 'K',
          river_moreAction2Action: 'raise', river_moreAction2Amount: '7', river_moreAction2Unit: 'K'
        },
      };

      const sectionStacks: SectionStacks = {
        river_more2: {
          initial: {},
          current: {},
          updated: { 1: 7000, 2: 7000 }
        }
      };

      const p1Result = validateRaiseAmount(
        1, 5, 'river', 'more2', players, playerData, sectionStacks, 'K', 1
      );
      expect(p1Result.isValid).toBe(true);

      const p2Result = validateRaiseAmount(
        2, 7, 'river', 'more2', players, playerData, sectionStacks, 'K', 2
      );
      expect(p2Result.isValid).toBe(true);
    });
  });
});
