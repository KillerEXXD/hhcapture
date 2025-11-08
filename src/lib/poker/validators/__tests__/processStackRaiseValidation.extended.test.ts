/**
 * Extended Process Stack Raise Validation Tests
 *
 * Comprehensive test coverage for FR-12 raise validation across all 12 sections
 * Tests progress from simple to complex scenarios:
 * - Simple: Single raise/bet scenarios
 * - Medium: Multiple re-raises, different units
 * - Complex: All-in scenarios, edge cases, mixed units
 *
 * Covers all 12 sections:
 * - PREFLOP: base, more, more2
 * - FLOP: base, more, more2
 * - TURN: base, more, more2
 * - RIVER: base, more, more2
 */

import { describe, it, expect } from '@jest/globals';
import { validateRaiseAmount } from '../raiseValidator';
import type { Player, PlayerData, SectionStacks } from '../../../../types/poker';

// Helper to create standard 9-player setup
function createPlayers(): Player[] {
  return [
    { id: 1, name: 'Alice', position: 'UTG', stack: 100000 },
    { id: 2, name: 'Bob', position: 'UTG+1', stack: 100000 },
    { id: 3, name: 'Charlie', position: 'MP', stack: 100000 },
    { id: 4, name: 'David', position: 'MP+1', stack: 100000 },
    { id: 5, name: 'Emma', position: 'CO', stack: 100000 },
    { id: 6, name: 'Frank', position: 'Dealer', stack: 100000 },
    { id: 7, name: 'Grace', position: 'SB', stack: 99500 },
    { id: 8, name: 'Henry', position: 'BB', stack: 99000 },
    { id: 9, name: 'Ivy', position: 'UTG', stack: 100000 }
  ];
}

describe('Extended Process Stack Raise Validation - All 12 Sections', () => {
  const players = createPlayers();

  // ============================================================================
  // PREFLOP BASE - Simple to Complex
  // ============================================================================
  describe('PREFLOP BASE - Simple to Complex', () => {
    it('[SIMPLE] Single raise over BB', () => {
      const playerData: PlayerData = {
        1: { preflopAction: 'raise', preflopAmount: '3', preflopUnit: 'K' },
        7: { postedSB: 500 },
        8: { postedBB: 1000 }
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000, 7: 99500, 8: 99000 },
          current: { 1: 100000, 7: 99500, 8: 99000 },
          updated: { 1: 100000, 7: 99500, 8: 99000 }
        }
      };

      const result = validateRaiseAmount(1, 3, 'preflop', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });

    it('[SIMPLE] Raise with different units - actual', () => {
      const playerData: PlayerData = {
        1: { preflopAction: 'raise', preflopAmount: '3000', preflopUnit: 'actual' },
        7: { postedSB: 500 },
        8: { postedBB: 1000 }
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000, 7: 99500, 8: 99000 },
          current: { 1: 100000, 7: 99500, 8: 99000 },
          updated: { 1: 100000, 7: 99500, 8: 99000 }
        }
      };

      const result = validateRaiseAmount(1, 3000, 'preflop', 'base', players, playerData, sectionStacks, 'actual');
      expect(result.isValid).toBe(true);
    });

    it('[SIMPLE] Raise with Mil unit', () => {
      const playerData: PlayerData = {
        1: { preflopAction: 'raise', preflopAmount: '0.003', preflopUnit: 'Mil' },
        7: { postedSB: 500 },
        8: { postedBB: 1000 }
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000, 7: 99500, 8: 99000 },
          current: { 1: 100000, 7: 99500, 8: 99000 },
          updated: { 1: 100000, 7: 99500, 8: 99000 }
        }
      };

      const result = validateRaiseAmount(1, 0.003, 'preflop', 'base', players, playerData, sectionStacks, 'Mil');
      expect(result.isValid).toBe(true);
    });

    it('[MEDIUM] Re-raise scenario', () => {
      const playerData: PlayerData = {
        1: { preflopAction: 'raise', preflopAmount: '3', preflopUnit: 'K' },
        2: { preflopAction: 'raise', preflopAmount: '8', preflopUnit: 'K' },
        7: { postedSB: 500 },
        8: { postedBB: 1000 }
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000, 2: 100000, 7: 99500, 8: 99000 },
          current: { 1: 100000, 2: 100000, 7: 99500, 8: 99000 },
          updated: { 1: 100000, 2: 100000, 7: 99500, 8: 99000 }
        }
      };

      const result = validateRaiseAmount(2, 8, 'preflop', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });

    it('[MEDIUM] Multiple players - third re-raise', () => {
      const playerData: PlayerData = {
        1: { preflopAction: 'raise', preflopAmount: '3', preflopUnit: 'K' },
        2: { preflopAction: 'raise', preflopAmount: '10', preflopUnit: 'K' },
        3: { preflopAction: 'raise', preflopAmount: '25', preflopUnit: 'K' },
        7: { postedSB: 500 },
        8: { postedBB: 1000 }
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000, 2: 100000, 3: 100000, 7: 99500, 8: 99000 },
          current: { 1: 100000, 2: 100000, 3: 100000, 7: 99500, 8: 99000 },
          updated: { 1: 100000, 2: 100000, 3: 100000, 7: 99500, 8: 99000 }
        }
      };

      const result = validateRaiseAmount(3, 25, 'preflop', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });

    it('[COMPLEX] Short-stack all-in raise', () => {
      const playerData: PlayerData = {
        1: { preflopAction: 'raise', preflopAmount: '5', preflopUnit: 'K' },
        2: { preflopAction: 'raise', preflopAmount: '3.5', preflopUnit: 'K' }, // All-in
        7: { postedSB: 500 },
        8: { postedBB: 1000 }
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000, 2: 3500, 7: 99500, 8: 99000 },
          current: { 1: 100000, 2: 3500, 7: 99500, 8: 99000 },
          updated: { 1: 100000, 2: 3500, 7: 99500, 8: 99000 }
        }
      };

      const result = validateRaiseAmount(2, 3.5, 'preflop', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
      expect(result.allInSuggestion).toBe(true);
      expect(result.suggestedAllInAmount).toBe(3500);
    });

    it('[COMPLEX] Reject raise exceeding stack', () => {
      const playerData: PlayerData = {
        1: { preflopAction: 'raise', preflopAmount: '150', preflopUnit: 'K' },
        7: { postedSB: 500 },
        8: { postedBB: 1000 }
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000, 7: 99500, 8: 99000 },
          current: { 1: 100000, 7: 99500, 8: 99000 },
          updated: { 1: 100000, 7: 99500, 8: 99000 }
        }
      };

      const result = validateRaiseAmount(1, 150, 'preflop', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(false);
      expect(result.allInSuggestion).toBe(true);
      expect(result.suggestedAllInAmount).toBe(100000);
    });

    it('[COMPLEX] Reject raise below current max', () => {
      const playerData: PlayerData = {
        1: { preflopAction: 'raise', preflopAmount: '10', preflopUnit: 'K' },
        2: { preflopAction: 'raise', preflopAmount: '8', preflopUnit: 'K' }, // Invalid
        7: { postedSB: 500 },
        8: { postedBB: 1000 }
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000, 2: 100000, 7: 99500, 8: 99000 },
          current: { 1: 100000, 2: 100000, 7: 99500, 8: 99000 },
          updated: { 1: 100000, 2: 100000, 7: 99500, 8: 99000 }
        }
      };

      const result = validateRaiseAmount(2, 8, 'preflop', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('must be greater than');
    });
  });

  // ============================================================================
  // PREFLOP MORE - Simple to Complex
  // ============================================================================
  describe('PREFLOP MORE - Simple to Complex', () => {
    it('[SIMPLE] Valid re-raise in MORE action', () => {
      const playerData: PlayerData = {
        1: {
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '12',
          preflop_moreActionUnit: 'K'
        },
        2: { preflopAction: 'raise', preflopAmount: '8', preflopUnit: 'K' },
        7: { postedSB: 500 },
        8: { postedBB: 1000 }
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000, 2: 100000, 7: 99500, 8: 99000 },
          current: { 1: 97000, 2: 92000, 7: 99500, 8: 99000 },
          updated: { 1: 97000, 2: 92000, 7: 99500, 8: 99000 }
        },
        'preflop_more': {
          initial: { 1: 97000, 2: 92000, 7: 99500, 8: 99000 },
          current: { 1: 97000, 2: 92000, 7: 99500, 8: 99000 },
          updated: { 1: 97000, 2: 92000, 7: 99500, 8: 99000 }
        }
      };

      const result = validateRaiseAmount(1, 12, 'preflop', 'more', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });

    it('[MEDIUM] Multiple players with calls and raises', () => {
      const playerData: PlayerData = {
        1: {
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '20',
          preflop_moreActionUnit: 'K'
        },
        2: { preflopAction: 'raise', preflopAmount: '8', preflopUnit: 'K' },
        3: { preflopAction: 'call', preflopAmount: '8', preflopUnit: 'K' },
        4: { preflopAction: 'call', preflopAmount: '8', preflopUnit: 'K' },
        7: { postedSB: 500 },
        8: { postedBB: 1000 }
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000, 2: 100000, 3: 100000, 4: 100000, 7: 99500, 8: 99000 },
          current: { 1: 97000, 2: 92000, 3: 92000, 4: 92000, 7: 99500, 8: 99000 },
          updated: { 1: 97000, 2: 92000, 3: 92000, 4: 92000, 7: 99500, 8: 99000 }
        },
        'preflop_more': {
          initial: { 1: 97000, 2: 92000, 3: 92000, 4: 92000, 7: 99500, 8: 99000 },
          current: { 1: 97000, 2: 92000, 3: 92000, 4: 92000, 7: 99500, 8: 99000 },
          updated: { 1: 97000, 2: 92000, 3: 92000, 4: 92000, 7: 99500, 8: 99000 }
        }
      };

      const result = validateRaiseAmount(1, 20, 'preflop', 'more', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });

    it('[COMPLEX] All-in in MORE action with limited stack', () => {
      const playerData: PlayerData = {
        1: {
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '12',
          preflop_moreActionUnit: 'K'
        },
        2: { preflopAction: 'raise', preflopAmount: '8', preflopUnit: 'K' },
        7: { postedSB: 500 },
        8: { postedBB: 1000 }
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 12000, 2: 100000, 7: 99500, 8: 99000 },
          current: { 1: 9000, 2: 92000, 7: 99500, 8: 99000 },
          updated: { 1: 9000, 2: 92000, 7: 99500, 8: 99000 }
        },
        'preflop_more': {
          initial: { 1: 9000, 2: 92000, 7: 99500, 8: 99000 },
          current: { 1: 9000, 2: 92000, 7: 99500, 8: 99000 },
          updated: { 1: 9000, 2: 92000, 7: 99500, 8: 99000 }
        }
      };

      const result = validateRaiseAmount(1, 12, 'preflop', 'more', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
      expect(result.allInSuggestion).toBe(true);
      expect(result.suggestedAllInAmount).toBe(12000);
    });
  });

  // ============================================================================
  // PREFLOP MORE2 - Simple to Complex
  // ============================================================================
  describe('PREFLOP MORE2 - Simple to Complex', () => {
    it('[SIMPLE] Valid raise in MORE2', () => {
      const playerData: PlayerData = {
        1: {
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '12',
          preflop_moreActionUnit: 'K',
          preflop_moreAction2Action: 'raise',
          preflop_moreAction2Amount: '30',
          preflop_moreAction2Unit: 'K'
        },
        2: {
          preflopAction: 'raise',
          preflopAmount: '8',
          preflopUnit: 'K',
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: '12',
          preflop_moreActionUnit: 'K'
        },
        7: { postedSB: 500 },
        8: { postedBB: 1000 }
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000, 2: 100000, 7: 99500, 8: 99000 },
          current: { 1: 97000, 2: 92000, 7: 99500, 8: 99000 },
          updated: { 1: 97000, 2: 92000, 7: 99500, 8: 99000 }
        },
        'preflop_more': {
          initial: { 1: 97000, 2: 92000, 7: 99500, 8: 99000 },
          current: { 1: 88000, 2: 88000, 7: 99500, 8: 99000 },
          updated: { 1: 88000, 2: 88000, 7: 99500, 8: 99000 }
        },
        'preflop_more2': {
          initial: { 1: 88000, 2: 88000, 7: 99500, 8: 99000 },
          current: { 1: 88000, 2: 88000, 7: 99500, 8: 99000 },
          updated: { 1: 88000, 2: 88000, 7: 99500, 8: 99000 }
        }
      };

      const result = validateRaiseAmount(1, 30, 'preflop', 'more2', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });

    it('[COMPLEX] Large pot with multiple re-raises', () => {
      const playerData: PlayerData = {
        1: {
          preflopAction: 'raise',
          preflopAmount: '5',
          preflopUnit: 'K',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '20',
          preflop_moreActionUnit: 'K',
          preflop_moreAction2Action: 'raise',
          preflop_moreAction2Amount: '60',
          preflop_moreAction2Unit: 'K'
        },
        2: {
          preflopAction: 'raise',
          preflopAmount: '15',
          preflopUnit: 'K',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '45',
          preflop_moreActionUnit: 'K'
        },
        7: { postedSB: 500 },
        8: { postedBB: 1000 }
      };

      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000, 2: 100000, 7: 99500, 8: 99000 },
          current: { 1: 95000, 2: 85000, 7: 99500, 8: 99000 },
          updated: { 1: 95000, 2: 85000, 7: 99500, 8: 99000 }
        },
        'preflop_more': {
          initial: { 1: 95000, 2: 85000, 7: 99500, 8: 99000 },
          current: { 1: 80000, 2: 55000, 7: 99500, 8: 99000 },
          updated: { 1: 80000, 2: 55000, 7: 99500, 8: 99000 }
        },
        'preflop_more2': {
          initial: { 1: 80000, 2: 55000, 7: 99500, 8: 99000 },
          current: { 1: 80000, 2: 55000, 7: 99500, 8: 99000 },
          updated: { 1: 80000, 2: 55000, 7: 99500, 8: 99000 }
        }
      };

      const result = validateRaiseAmount(1, 60, 'preflop', 'more2', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });
  });

  // ============================================================================
  // FLOP BASE - Simple to Complex
  // ============================================================================
  describe('FLOP BASE - Simple to Complex', () => {
    it('[SIMPLE] Single bet on flop', () => {
      const playerData: PlayerData = {
        1: { flopAction: 'bet', flopAmount: '5', flopUnit: 'K' }
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          initial: { 1: 90000 },
          current: { 1: 90000 },
          updated: { 1: 90000 }
        }
      };

      const result = validateRaiseAmount(1, 5, 'flop', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });

    it('[MEDIUM] Bet and raise on flop', () => {
      const playerData: PlayerData = {
        1: { flopAction: 'bet', flopAmount: '8', flopUnit: 'K' },
        2: { flopAction: 'raise', flopAmount: '20', flopUnit: 'K' }
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          initial: { 1: 85000, 2: 90000 },
          current: { 1: 85000, 2: 90000 },
          updated: { 1: 85000, 2: 90000 }
        }
      };

      const result = validateRaiseAmount(2, 20, 'flop', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });

    it('[COMPLEX] Large pot-sized bet', () => {
      const playerData: PlayerData = {
        1: { flopAction: 'bet', flopAmount: '30', flopUnit: 'K' },
        2: { flopAction: 'raise', flopAmount: '80', flopUnit: 'K' }
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          initial: { 1: 95000, 2: 95000 },
          current: { 1: 95000, 2: 95000 },
          updated: { 1: 95000, 2: 95000 }
        }
      };

      const result = validateRaiseAmount(2, 80, 'flop', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });
  });

  // ============================================================================
  // FLOP MORE - Simple to Complex
  // ============================================================================
  describe('FLOP MORE - Simple to Complex', () => {
    it('[SIMPLE] Re-raise in FLOP MORE', () => {
      const playerData: PlayerData = {
        1: {
          flopAction: 'bet',
          flopAmount: '10',
          flopUnit: 'K',
          flop_moreActionAction: 'raise',
          flop_moreActionAmount: '35',
          flop_moreActionUnit: 'K'
        },
        2: { flopAction: 'raise', flopAmount: '25', flopUnit: 'K' }
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          initial: { 1: 80000, 2: 80000 },
          current: { 1: 70000, 2: 55000 },
          updated: { 1: 70000, 2: 55000 }
        },
        'flop_more': {
          initial: { 1: 70000, 2: 55000 },
          current: { 1: 70000, 2: 55000 },
          updated: { 1: 70000, 2: 55000 }
        }
      };

      const result = validateRaiseAmount(1, 35, 'flop', 'more', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });

    it('[MEDIUM] Multiple players with mixed actions', () => {
      const playerData: PlayerData = {
        1: {
          flopAction: 'bet',
          flopAmount: '8',
          flopUnit: 'K',
          flop_moreActionAction: 'raise',
          flop_moreActionAmount: '40',
          flop_moreActionUnit: 'K'
        },
        2: { flopAction: 'raise', flopAmount: '20', flopUnit: 'K' },
        3: { flopAction: 'call', flopAmount: '20', flopUnit: 'K' }
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          initial: { 1: 75000, 2: 75000, 3: 75000 },
          current: { 1: 67000, 2: 55000, 3: 55000 },
          updated: { 1: 67000, 2: 55000, 3: 55000 }
        },
        'flop_more': {
          initial: { 1: 67000, 2: 55000, 3: 55000 },
          current: { 1: 67000, 2: 55000, 3: 55000 },
          updated: { 1: 67000, 2: 55000, 3: 55000 }
        }
      };

      const result = validateRaiseAmount(1, 40, 'flop', 'more', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });
  });

  // ============================================================================
  // FLOP MORE2 - Simple to Complex
  // ============================================================================
  describe('FLOP MORE2 - Simple to Complex', () => {
    it('[SIMPLE] Valid raise in FLOP MORE2', () => {
      const playerData: PlayerData = {
        1: {
          flopAction: 'bet',
          flopAmount: '10',
          flopUnit: 'K',
          flop_moreActionAction: 'raise',
          flop_moreActionAmount: '30',
          flop_moreActionUnit: 'K',
          flop_moreAction2Action: 'raise',
          flop_moreAction2Amount: '70',
          flop_moreAction2Unit: 'K'
        },
        2: {
          flopAction: 'raise',
          flopAmount: '20',
          flopUnit: 'K',
          flop_moreActionAction: 'call',
          flop_moreActionAmount: '30',
          flop_moreActionUnit: 'K'
        }
      };

      const sectionStacks: SectionStacks = {
        'flop_base': {
          initial: { 1: 90000, 2: 90000 },
          current: { 1: 80000, 2: 70000 },
          updated: { 1: 80000, 2: 70000 }
        },
        'flop_more': {
          initial: { 1: 80000, 2: 70000 },
          current: { 1: 60000, 2: 60000 },
          updated: { 1: 60000, 2: 60000 }
        },
        'flop_more2': {
          initial: { 1: 60000, 2: 60000 },
          current: { 1: 60000, 2: 60000 },
          updated: { 1: 60000, 2: 60000 }
        }
      };

      const result = validateRaiseAmount(1, 70, 'flop', 'more2', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });
  });

  // ============================================================================
  // TURN BASE - Simple to Complex
  // ============================================================================
  describe('TURN BASE - Simple to Complex', () => {
    it('[SIMPLE] Single bet on turn', () => {
      const playerData: PlayerData = {
        1: { turnAction: 'bet', turnAmount: '15', turnUnit: 'K' }
      };

      const sectionStacks: SectionStacks = {
        'turn_base': {
          initial: { 1: 70000 },
          current: { 1: 70000 },
          updated: { 1: 70000 }
        }
      };

      const result = validateRaiseAmount(1, 15, 'turn', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });

    it('[MEDIUM] Bet and raise on turn', () => {
      const playerData: PlayerData = {
        1: { turnAction: 'bet', turnAmount: '20', turnUnit: 'K' },
        2: { turnAction: 'raise', turnAmount: '50', turnUnit: 'K' }
      };

      const sectionStacks: SectionStacks = {
        'turn_base': {
          initial: { 1: 60000, 2: 65000 },
          current: { 1: 60000, 2: 65000 },
          updated: { 1: 60000, 2: 65000 }
        }
      };

      const result = validateRaiseAmount(2, 50, 'turn', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });

    it('[COMPLEX] All-in on turn', () => {
      const playerData: PlayerData = {
        1: { turnAction: 'bet', turnAmount: '25', turnUnit: 'K' },
        2: { turnAction: 'raise', turnAmount: '45', turnUnit: 'K' } // All-in
      };

      const sectionStacks: SectionStacks = {
        'turn_base': {
          initial: { 1: 70000, 2: 45000 },
          current: { 1: 70000, 2: 45000 },
          updated: { 1: 70000, 2: 45000 }
        }
      };

      const result = validateRaiseAmount(2, 45, 'turn', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
      expect(result.allInSuggestion).toBe(true);
      expect(result.suggestedAllInAmount).toBe(45000);
    });
  });

  // ============================================================================
  // TURN MORE - Simple to Complex
  // ============================================================================
  describe('TURN MORE - Simple to Complex', () => {
    it('[SIMPLE] Re-raise in TURN MORE', () => {
      const playerData: PlayerData = {
        1: {
          turnAction: 'bet',
          turnAmount: '15',
          turnUnit: 'K',
          turn_moreActionAction: 'raise',
          turn_moreActionAmount: '60',
          turn_moreActionUnit: 'K'
        },
        2: { turnAction: 'raise', turnAmount: '35', turnUnit: 'K' }
      };

      const sectionStacks: SectionStacks = {
        'turn_base': {
          initial: { 1: 70000, 2: 70000 },
          current: { 1: 55000, 2: 35000 },
          updated: { 1: 55000, 2: 35000 }
        },
        'turn_more': {
          initial: { 1: 55000, 2: 35000 },
          current: { 1: 55000, 2: 35000 },
          updated: { 1: 55000, 2: 35000 }
        }
      };

      const result = validateRaiseAmount(1, 60, 'turn', 'more', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });
  });

  // ============================================================================
  // TURN MORE2 - Simple to Complex
  // ============================================================================
  describe('TURN MORE2 - Simple to Complex', () => {
    it('[SIMPLE] Valid raise in TURN MORE2', () => {
      const playerData: PlayerData = {
        1: {
          turnAction: 'bet',
          turnAmount: '20',
          turnUnit: 'K',
          turn_moreActionAction: 'raise',
          turn_moreActionAmount: '50',
          turn_moreActionUnit: 'K',
          turn_moreAction2Action: 'raise',
          turn_moreAction2Amount: '90',
          turn_moreAction2Unit: 'K'
        },
        2: {
          turnAction: 'raise',
          turnAmount: '40',
          turnUnit: 'K',
          turn_moreActionAction: 'call',
          turn_moreActionAmount: '50',
          turn_moreActionUnit: 'K'
        }
      };

      const sectionStacks: SectionStacks = {
        'turn_base': {
          initial: { 1: 100000, 2: 100000 },
          current: { 1: 80000, 2: 60000 },
          updated: { 1: 80000, 2: 60000 }
        },
        'turn_more': {
          initial: { 1: 80000, 2: 60000 },
          current: { 1: 50000, 2: 50000 },
          updated: { 1: 50000, 2: 50000 }
        },
        'turn_more2': {
          initial: { 1: 50000, 2: 50000 },
          current: { 1: 50000, 2: 50000 },
          updated: { 1: 50000, 2: 50000 }
        }
      };

      const result = validateRaiseAmount(1, 90, 'turn', 'more2', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });
  });

  // ============================================================================
  // RIVER BASE - Simple to Complex
  // ============================================================================
  describe('RIVER BASE - Simple to Complex', () => {
    it('[SIMPLE] Single bet on river', () => {
      const playerData: PlayerData = {
        1: { riverAction: 'bet', riverAmount: '25', riverUnit: 'K' }
      };

      const sectionStacks: SectionStacks = {
        'river_base': {
          initial: { 1: 55000 },
          current: { 1: 55000 },
          updated: { 1: 55000 }
        }
      };

      const result = validateRaiseAmount(1, 25, 'river', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });

    it('[MEDIUM] Bet and raise on river', () => {
      const playerData: PlayerData = {
        1: { riverAction: 'bet', riverAmount: '30', riverUnit: 'K' },
        2: { riverAction: 'raise', riverAmount: '70', riverUnit: 'K' }
      };

      const sectionStacks: SectionStacks = {
        'river_base': {
          initial: { 1: 50000, 2: 50000 },
          current: { 1: 50000, 2: 50000 },
          updated: { 1: 50000, 2: 50000 }
        }
      };

      const result = validateRaiseAmount(2, 70, 'river', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(false); // Exceeds stack
      expect(result.allInSuggestion).toBe(true);
    });

    it('[COMPLEX] Pot-sized river jam', () => {
      const playerData: PlayerData = {
        1: { riverAction: 'bet', riverAmount: '20', riverUnit: 'K' },
        2: { riverAction: 'raise', riverAmount: '45', riverUnit: 'K' } // All-in jam
      };

      const sectionStacks: SectionStacks = {
        'river_base': {
          initial: { 1: 60000, 2: 45000 },
          current: { 1: 60000, 2: 45000 },
          updated: { 1: 60000, 2: 45000 }
        }
      };

      const result = validateRaiseAmount(2, 45, 'river', 'base', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
      expect(result.allInSuggestion).toBe(true);
      expect(result.suggestedAllInAmount).toBe(45000);
    });
  });

  // ============================================================================
  // RIVER MORE - Simple to Complex
  // ============================================================================
  describe('RIVER MORE - Simple to Complex', () => {
    it('[SIMPLE] Re-raise in RIVER MORE', () => {
      const playerData: PlayerData = {
        1: {
          riverAction: 'bet',
          riverAmount: '20',
          riverUnit: 'K',
          river_moreActionAction: 'raise',
          river_moreActionAmount: '80',
          river_moreActionUnit: 'K'
        },
        2: { riverAction: 'raise', riverAmount: '50', riverUnit: 'K' }
      };

      const sectionStacks: SectionStacks = {
        'river_base': {
          initial: { 1: 100000, 2: 80000 },
          current: { 1: 80000, 2: 30000 },
          updated: { 1: 80000, 2: 30000 }
        },
        'river_more': {
          initial: { 1: 80000, 2: 30000 },
          current: { 1: 80000, 2: 30000 },
          updated: { 1: 80000, 2: 30000 }
        }
      };

      const result = validateRaiseAmount(1, 80, 'river', 'more', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });
  });

  // ============================================================================
  // RIVER MORE2 - Simple to Complex
  // ============================================================================
  describe('RIVER MORE2 - Simple to Complex', () => {
    it('[SIMPLE] Valid raise in RIVER MORE2', () => {
      const playerData: PlayerData = {
        1: {
          riverAction: 'bet',
          riverAmount: '25',
          riverUnit: 'K',
          river_moreActionAction: 'raise',
          river_moreActionAmount: '60',
          river_moreActionUnit: 'K',
          river_moreAction2Action: 'raise',
          river_moreAction2Amount: '100',
          river_moreAction2Unit: 'K'
        },
        2: {
          riverAction: 'raise',
          riverAmount: '50',
          riverUnit: 'K',
          river_moreActionAction: 'call',
          river_moreActionAmount: '60',
          river_moreActionUnit: 'K'
        }
      };

      const sectionStacks: SectionStacks = {
        'river_base': {
          initial: { 1: 150000, 2: 120000 },
          current: { 1: 125000, 2: 70000 },
          updated: { 1: 125000, 2: 70000 }
        },
        'river_more': {
          initial: { 1: 125000, 2: 70000 },
          current: { 1: 90000, 2: 60000 },
          updated: { 1: 90000, 2: 60000 }
        },
        'river_more2': {
          initial: { 1: 90000, 2: 60000 },
          current: { 1: 90000, 2: 60000 },
          updated: { 1: 90000, 2: 60000 }
        }
      };

      const result = validateRaiseAmount(1, 100, 'river', 'more2', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true);
    });

    it('[COMPLEX] Final all-in war on river', () => {
      const playerData: PlayerData = {
        1: {
          riverAction: 'bet',
          riverAmount: '30',
          riverUnit: 'K',
          river_moreActionAction: 'raise',
          river_moreActionAmount: '80',
          river_moreActionUnit: 'K',
          river_moreAction2Action: 'raise',
          river_moreAction2Amount: '150',
          river_moreAction2Unit: 'K'
        },
        2: {
          riverAction: 'raise',
          riverAmount: '70',
          riverUnit: 'K',
          river_moreActionAction: 'call',
          river_moreActionAmount: '80',
          river_moreActionUnit: 'K'
        }
      };

      const sectionStacks: SectionStacks = {
        'river_base': {
          initial: { 1: 150000, 2: 150000 },
          current: { 1: 120000, 2: 80000 },
          updated: { 1: 120000, 2: 80000 }
        },
        'river_more': {
          initial: { 1: 120000, 2: 80000 },
          current: { 1: 70000, 2: 70000 },
          updated: { 1: 70000, 2: 70000 }
        },
        'river_more2': {
          initial: { 1: 70000, 2: 70000 },
          current: { 1: 70000, 2: 70000 },
          updated: { 1: 70000, 2: 70000 }
        }
      };

      const result = validateRaiseAmount(1, 150, 'river', 'more2', players, playerData, sectionStacks, 'K');
      expect(result.isValid).toBe(true); // Exactly all-in
      expect(result.allInSuggestion).toBe(true);
      expect(result.suggestedAllInAmount).toBe(150000); // Total contributed across all rounds
    });
  });
});
