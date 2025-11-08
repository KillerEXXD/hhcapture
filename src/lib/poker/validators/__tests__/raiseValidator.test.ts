/**
 * FR-12: Raise Amount Validation Tests
 *
 * Comprehensive tests for the raise/bet amount validator that ensures:
 * - Cannot exceed "Now" stack (FR-12.1)
 * - Must exceed current max bet (FR-12.2)
 * - Minimum raise increment (FR-12.3)
 * - Cannot exceed starting stack in PreFlop BASE (FR-12.4)
 * - Clear error messages (FR-12.5)
 */

import { describe, it, expect } from '@jest/globals';
import { validateRaiseAmount } from '../raiseValidator';
import type { Player, PlayerData, SectionStacks, Stage, ActionLevel, ChipUnit } from '../../../../types/poker';

describe('FR-12: Raise Amount Validation', () => {
  // Helper to create test players
  const createPlayers = (): Player[] => [
    { id: 1, name: 'Alice', position: 'UTG', stack: 10000 },
    { id: 2, name: 'Bob', position: 'BB', stack: 12000 },
    { id: 3, name: 'Charlie', position: 'CO', stack: 11000 },
  ];

  describe('FR-12.1: Cannot Exceed "Now" Stack', () => {
    it('should reject raise that exceeds player\'s current stack', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'K' },
        2: { preflopAction: 'check', postedBB: 1000 },
        3: { preflopAction: 'raise', preflopAmount: '3', preflopUnit: 'K' },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 12000, 3: 11000 },
          current: { 1: 9000, 2: 12000, 3: 8000 },
          updated: { 1: 9000, 2: 12000, 3: 8000 }
        }
      };

      // Alice has 9K now, trying to raise to 15K
      const result = validateRaiseAmount(
        1, // Alice
        15, // Raise to 15K
        'preflop',
        'base',
        players,
        playerData,
        sectionStacks,
        'K'
      );

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Cannot raise to');
      expect(result.errorMessage).toContain('current stack is');
      expect(result.maxAllowed).toBeDefined();
    });

    it('should allow raise equal to player\'s current stack (all-in)', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'K' },
        2: { preflopAction: 'check', postedBB: 1000 },
        3: { preflopAction: 'raise', preflopAmount: '3', preflopUnit: 'K' },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 12000, 3: 11000 },
          current: { 1: 9000, 2: 12000, 3: 8000 },
          updated: { 1: 9000, 2: 12000, 3: 8000 }
        }
      };

      // Alice has 9K now (already contributed 1K), can raise to 10K (all-in)
      const result = validateRaiseAmount(
        1, // Alice
        10, // Raise to 10K (all-in)
        'preflop',
        'base',
        players,
        playerData,
        sectionStacks,
        'K'
      );

      expect(result.isValid).toBe(true);
      expect(result.allInSuggestion).toBe(true);
      expect(result.suggestedAllInAmount).toBe(10000);
      expect(result.errorMessage).toContain('all-in');
    });

    it('should suggest all-in when raise exceeds available stack', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'K' },
        2: { preflopAction: 'check', postedBB: 1000 },
        3: { preflopAction: 'raise', preflopAmount: '3', preflopUnit: 'K' },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 12000, 3: 11000 },
          current: { 1: 9000, 2: 12000, 3: 8000 },
          updated: { 1: 9000, 2: 12000, 3: 8000 }
        }
      };

      // Alice has 9K now (already contributed 1K), tries to raise to 15K (exceeds available)
      // Should suggest all-in for 10K instead
      const result = validateRaiseAmount(
        1, // Alice
        15, // Raise to 15K (more than available)
        'preflop',
        'base',
        players,
        playerData,
        sectionStacks,
        'K'
      );

      expect(result.isValid).toBe(false);
      expect(result.allInSuggestion).toBe(true);
      expect(result.suggestedAllInAmount).toBe(10000);
      expect(result.maxAllowed).toBe(10000);
      expect(result.errorMessage).toContain('all-in');
      expect(result.errorMessage).toContain('10000');
    });
  });

  describe('FR-12.2: Must Exceed Current Max Bet', () => {
    it('should reject raise that equals current max bet', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'K' },
        2: { preflopAction: 'check', postedBB: 1000 },
        3: { preflopAction: 'raise', preflopAmount: '5', preflopUnit: 'K' },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 12000, 3: 11000 },
          current: { 1: 9000, 2: 12000, 3: 6000 },
          updated: { 1: 9000, 2: 12000, 3: 6000 }
        }
      };

      // Alice trying to raise to 5K (same as Charlie's raise)
      const result = validateRaiseAmount(
        1, // Alice
        5, // Raise to 5K (equals max)
        'preflop',
        'base',
        players,
        playerData,
        sectionStacks,
        'K'
      );

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('must be greater than current max bet');
      expect(result.minRequired).toBeDefined();
    });

    it('should accept raise that exceeds current max bet', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'K' },
        2: { preflopAction: 'check', postedBB: 1000 },
        3: { preflopAction: 'raise', preflopAmount: '5', preflopUnit: 'K' },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 12000, 3: 11000 },
          current: { 1: 9000, 2: 12000, 3: 6000 },
          updated: { 1: 9000, 2: 12000, 3: 6000 }
        }
      };

      // Alice raising to 9K (more than Charlie's 5K)
      const result = validateRaiseAmount(
        1, // Alice
        9, // Raise to 9K
        'preflop',
        'base',
        players,
        playerData,
        sectionStacks,
        'K'
      );

      expect(result.isValid).toBe(true);
    });
  });

  describe('FR-12.3: Minimum Raise Increment', () => {
    it('should enforce minimum raise increment', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'raise', preflopAmount: '3', preflopUnit: 'K' }, // Raised from 1K to 3K (+2K)
        2: { preflopAction: 'check', postedBB: 1000 },
        3: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'K' },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 12000, 3: 11000 },
          current: { 1: 7000, 2: 12000, 3: 10000 },
          updated: { 1: 7000, 2: 12000, 3: 10000 }
        }
      };

      // Bob trying to raise to 4K (only +1K, but increment was +2K)
      const result = validateRaiseAmount(
        2, // Bob
        4, // Raise to 4K
        'preflop',
        'base',
        players,
        playerData,
        sectionStacks,
        'K'
      );

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Minimum raise is');
      expect(result.errorMessage).toContain('Previous raise increment was');
      expect(result.minRequired).toBe(5000); // 3K + 2K increment = 5K
    });

    it('should accept raise with correct minimum increment', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'raise', preflopAmount: '3', preflopUnit: 'K' }, // Raised from 1K to 3K (+2K)
        2: { preflopAction: 'check', postedBB: 1000 },
        3: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'K' },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 12000, 3: 11000 },
          current: { 1: 7000, 2: 12000, 3: 10000 },
          updated: { 1: 7000, 2: 12000, 3: 10000 }
        }
      };

      // Bob raising to 5K (+2K increment, matching Alice's increment)
      const result = validateRaiseAmount(
        2, // Bob
        5, // Raise to 5K
        'preflop',
        'base',
        players,
        playerData,
        sectionStacks,
        'K'
      );

      expect(result.isValid).toBe(true);
    });
  });

  describe('FR-12.4: Cannot Exceed Starting Stack (PreFlop BASE Only)', () => {
    it('should reject raise exceeding starting stack in preflop BASE', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'K' },
        2: { preflopAction: 'check', postedBB: 1000 },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 12000 },
          current: { 1: 9000, 2: 12000 },
          updated: { 1: 9000, 2: 12000 }
        }
      };

      // Alice trying to raise to 15K (exceeds her starting stack of 10K)
      const result = validateRaiseAmount(
        1, // Alice
        15, // Raise to 15K
        'preflop',
        'base',
        players,
        playerData,
        sectionStacks,
        'K'
      );

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Cannot raise to');
      expect(result.errorMessage).toContain('starting stack is');
    });

    it('should allow raise exceeding starting stack in More Action rounds', () => {
      const players = createPlayers();
      // In More Action, if you won chips in BASE, you can raise above original starting stack
      const playerData: PlayerData = {
        1: {
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '12',
          preflop_moreActionUnit: 'K'
        },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000 },
          current: { 1: 7000 },
          updated: { 1: 7000 }
        },
        'preflop_more': {
          initial: { 1: 7000 },
          current: { 1: 7000 },
          updated: { 1: 7000 }
        }
      };

      // Alice raising to 12K in More Action (exceeds original 10K starting stack)
      const result = validateRaiseAmount(
        1, // Alice
        12, // Raise to 12K
        'preflop',
        'more',
        players,
        playerData,
        sectionStacks,
        'K'
      );

      // This should be valid in More Action (FR-12.4 only applies to preflop BASE)
      expect(result.isValid).toBe(true);
    });

    it('should allow raise exceeding starting stack on postflop streets', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: {
          flopAction: 'raise',
          flopAmount: '12',
          flopUnit: 'K'
        },
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          initial: { 1: 8000 }, // Alice has 8K after preflop
          current: { 1: 8000 },
          updated: { 1: 8000 }
        }
      };

      // Alice raising to 12K on flop (exceeds original preflop starting stack of 10K)
      const result = validateRaiseAmount(
        1, // Alice
        12, // Raise to 12K
        'flop',
        'base',
        players,
        playerData,
        sectionStacks,
        'K'
      );

      // This should be valid on postflop (FR-12.4 only applies to preflop BASE)
      expect(result.isValid).toBe(true);
    });
  });

  describe('FR-12.5: Clear Error Messages', () => {
    it('should provide clear error message for exceeding stack', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'K' },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000 },
          current: { 1: 9000 },
          updated: { 1: 9000 }
        }
      };

      const result = validateRaiseAmount(1, 15, 'preflop', 'base', players, playerData, sectionStacks, 'K');

      expect(result.errorMessage).toBeDefined();
      expect(result.errorMessage).toMatch(/Cannot raise to \d+/);
      expect(result.errorMessage).toMatch(/current stack is \d+/);
      expect(result.errorMessage).toMatch(/Maximum raise is \d+/);
    });

    it('should provide clear error message for insufficient raise', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'raise', preflopAmount: '3', preflopUnit: 'K' },
        2: { preflopAction: 'check', postedBB: 1000 },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 12000 },
          current: { 1: 7000, 2: 12000 },
          updated: { 1: 7000, 2: 12000 }
        }
      };

      const result = validateRaiseAmount(2, 4, 'preflop', 'base', players, playerData, sectionStacks, 'K');

      expect(result.errorMessage).toBeDefined();
      expect(result.errorMessage).toMatch(/Minimum raise is \d+/);
      expect(result.errorMessage).toMatch(/Previous raise increment was \d+/);
    });
  });

  describe('Unit Conversion Tests', () => {
    it('should handle K (thousand) unit correctly', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'K' },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000 },
          current: { 1: 9000 },
          updated: { 1: 9000 }
        }
      };

      // Raise to 5K (should convert to 5000)
      const result = validateRaiseAmount(1, 5, 'preflop', 'base', players, playerData, sectionStacks, 'K');

      expect(result.isValid).toBe(true);
    });

    it('should handle Mil (million) unit correctly', () => {
      const players: Player[] = [
        { id: 1, name: 'Alice', position: 'UTG', stack: 10000000 },
      ];

      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'Mil' },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000000 },
          current: { 1: 9000000 },
          updated: { 1: 9000000 }
        }
      };

      // Raise to 5 Mil (should convert to 5,000,000)
      const result = validateRaiseAmount(1, 5, 'preflop', 'base', players, playerData, sectionStacks, 'Mil');

      expect(result.isValid).toBe(true);
    });

    it('should handle actual unit correctly', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: '1000', preflopUnit: 'actual' },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000 },
          current: { 1: 9000 },
          updated: { 1: 9000 }
        }
      };

      // Raise to 5000 (actual value)
      const result = validateRaiseAmount(1, 5000, 'preflop', 'base', players, playerData, sectionStacks, 'actual');

      expect(result.isValid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle player with zero contribution', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'no action' },
        2: { preflopAction: 'check', postedBB: 1000 },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 12000 },
          current: { 1: 10000, 2: 12000 },
          updated: { 1: 10000, 2: 12000 }
        }
      };

      // Alice raising to 3K with no prior contribution
      const result = validateRaiseAmount(1, 3, 'preflop', 'base', players, playerData, sectionStacks, 'K');

      expect(result.isValid).toBe(true);
    });

    it('should handle BB with posted blind', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'K' },
        2: { preflopAction: 'raise', preflopAmount: '5', preflopUnit: 'K', postedBB: 1000 },
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 10000, 2: 12000 },
          current: { 1: 9000, 2: 7000 },
          updated: { 1: 9000, 2: 7000 }
        }
      };

      // BB raising to 5K (already contributed 1K blind)
      const result = validateRaiseAmount(2, 5, 'preflop', 'base', players, playerData, sectionStacks, 'K');

      expect(result.isValid).toBe(true);
    });
  });
});
