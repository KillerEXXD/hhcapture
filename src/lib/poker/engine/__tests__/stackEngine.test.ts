import { describe, it, expect } from 'vitest';
import {
  getLevelSuffix,
  getSuffixLevel,
  normalizePosition,
  convertToActualValue,
  calculateCurrentStack,
  calculateStackAtSectionStart,
  getAlreadyContributed,
  getPayoffAmount,
  hasPlayerFolded,
  getActivePlayersForSection
} from '../stackEngine';
import type { Player, PlayerData, SectionStacks } from '../../../../types/poker';

describe('stackEngine', () => {
  describe('getLevelSuffix', () => {
    it('should convert base level to empty suffix', () => {
      expect(getLevelSuffix('base')).toBe('');
    });

    it('should convert more level to _moreAction suffix', () => {
      expect(getLevelSuffix('more')).toBe('_moreAction');
    });

    it('should convert more2 level to _moreAction2 suffix', () => {
      expect(getLevelSuffix('more2')).toBe('_moreAction2');
    });
  });

  describe('getSuffixLevel', () => {
    it('should convert empty suffix to base level', () => {
      expect(getSuffixLevel('')).toBe('base');
    });

    it('should convert _moreAction suffix to more level', () => {
      expect(getSuffixLevel('_moreAction')).toBe('more');
    });

    it('should convert _moreAction2 suffix to more2 level', () => {
      expect(getSuffixLevel('_moreAction2')).toBe('more2');
    });
  });

  describe('normalizePosition', () => {
    it('should normalize BTN to dealer', () => {
      expect(normalizePosition('BTN')).toBe('dealer');
      expect(normalizePosition('btn')).toBe('dealer');
      expect(normalizePosition('Button')).toBe('dealer');
    });

    it('should normalize SB variations', () => {
      expect(normalizePosition('SB')).toBe('sb');
      expect(normalizePosition('sb')).toBe('sb');
      expect(normalizePosition('Small Blind')).toBe('sb');
    });

    it('should normalize BB variations', () => {
      expect(normalizePosition('BB')).toBe('bb');
      expect(normalizePosition('bb')).toBe('bb');
      expect(normalizePosition('Big Blind')).toBe('bb');
    });

    it('should normalize UTG variations', () => {
      expect(normalizePosition('UTG')).toBe('utg');
      expect(normalizePosition('UTG+1')).toBe('utg+1');
      expect(normalizePosition('UTG1')).toBe('utg+1');
    });

    it('should return empty string for empty input', () => {
      expect(normalizePosition('')).toBe('');
    });
  });

  describe('convertToActualValue', () => {
    it('should convert K units to actual value', () => {
      expect(convertToActualValue(25, 'K')).toBe(25000);
      expect(convertToActualValue(1.5, 'K')).toBe(1500);
    });

    it('should convert Mil units to actual value', () => {
      expect(convertToActualValue(2.5, 'Mil')).toBe(2500000);
      expect(convertToActualValue(1, 'Mil')).toBe(1000000);
    });

    it('should return same value for actual unit', () => {
      expect(convertToActualValue(5000, 'actual')).toBe(5000);
      expect(convertToActualValue(123456, 'actual')).toBe(123456);
    });
  });

  describe('calculateCurrentStack', () => {
    const players: Player[] = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: 'Bob', position: 'BB', stack: 150000 }
    ];

    it('should return 0 if player not found', () => {
      const result = calculateCurrentStack(
        999,
        players,
        {},
        'preflop',
        '',
        {},
        false
      );
      expect(result).toBe(0);
    });

    it('should return null when processing', () => {
      const result = calculateCurrentStack(
        1,
        players,
        {},
        'preflop',
        '',
        {},
        true  // isProcessing = true
      );
      expect(result).toBeNull();
    });

    it('should return updated stack if section is processed', () => {
      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000, 2: 150000 },
          current: { 1: 100000, 2: 150000 },
          updated: { 1: 95000, 2: 145000 }
        }
      };

      const result = calculateCurrentStack(
        1,
        players,
        {},
        'preflop',
        '',
        sectionStacks,
        false
      );
      expect(result).toBe(95000);
    });

    it('should calculate stack after posting for SB in preflop base', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500
        }
      };

      const result = calculateCurrentStack(
        1,
        players,
        playerData,
        'preflop',
        '',
        {},
        false
      );
      expect(result).toBe(99500); // 100000 - 500
    });

    it('should calculate stack after posting for BB in preflop base', () => {
      const playerData: PlayerData = {
        2: {
          postedBB: 1000,
          postedAnte: 100
        }
      };

      const result = calculateCurrentStack(
        2,
        players,
        playerData,
        'preflop',
        '',
        {},
        false
      );
      expect(result).toBe(148900); // 150000 - 1000 - 100
    });

    it('should return null if section not processed and not preflop SB/BB', () => {
      const players: Player[] = [
        { id: 3, name: 'Charlie', position: 'UTG', stack: 100000 }
      ];

      const result = calculateCurrentStack(
        3,
        players,
        {},
        'preflop',
        '',
        {},
        false
      );
      expect(result).toBeNull();
    });
  });

  describe('calculateStackAtSectionStart', () => {
    const players: Player[] = [
      { id: 1, name: 'Alice', position: 'Dealer', stack: 100000 }
    ];

    it('should return initial stack if no previous section', () => {
      const result = calculateStackAtSectionStart(
        1,
        players,
        'preflop',
        '',
        {},
        {}
      );
      expect(result).toBe(100000);
    });

    it('should return updated stack from previous level in same stage', () => {
      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000 },
          current: { 1: 100000 },
          updated: { 1: 95000 }
        }
      };

      const result = calculateStackAtSectionStart(
        1,
        players,
        'preflop',
        '_moreAction',
        sectionStacks,
        { preflop: ['base', 'more'] }
      );
      expect(result).toBe(95000);
    });

    it('should return updated stack from last level of previous stage', () => {
      const sectionStacks: SectionStacks = {
        'preflop_base': {
          initial: { 1: 100000 },
          current: { 1: 100000 },
          updated: { 1: 90000 }
        },
        'preflop_more': {
          initial: { 1: 90000 },
          current: { 1: 90000 },
          updated: { 1: 80000 }
        }
      };

      const result = calculateStackAtSectionStart(
        1,
        players,
        'flop',
        '',
        sectionStacks,
        { preflop: ['base', 'more'] }
      );
      expect(result).toBe(80000);
    });

    it('should return initial stack if previous section not processed', () => {
      const result = calculateStackAtSectionStart(
        1,
        players,
        'flop',
        '',
        {},
        { preflop: ['base'] }
      );
      expect(result).toBe(100000);
    });
  });

  describe('getAlreadyContributed', () => {
    const players: Player[] = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: 'Bob', position: 'BB', stack: 150000 },
      { id: 3, name: 'Charlie', position: 'UTG', stack: 120000 }
    ];

    it('should return 0 if player not found', () => {
      const result = getAlreadyContributed(
        999,
        players,
        {},
        'preflop',
        ''
      );
      expect(result).toBe(0);
    });

    it('should include posted SB for SB position in preflop', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500
        }
      };

      const result = getAlreadyContributed(
        1,
        players,
        playerData,
        'preflop',
        ''
      );
      expect(result).toBe(500);
    });

    it('should include posted BB for BB position in preflop (but not ante)', () => {
      const playerData: PlayerData = {
        2: {
          postedBB: 1000,
          postedAnte: 100
        }
      };

      const result = getAlreadyContributed(
        2,
        players,
        playerData,
        'preflop',
        ''
      );
      expect(result).toBe(1000); // BB but NOT ante
    });

    it('should include posted blinds + base action for preflop more action', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflop_amount: '3',
          preflop_unit: 'K'
        }
      };

      const result = getAlreadyContributed(
        1,
        players,
        playerData,
        'preflop',
        '_moreAction',
        'K'
      );
      expect(result).toBe(3500); // 500 + 3000
    });

    it('should include base + more1 for preflop more action 2', () => {
      const playerData: PlayerData = {
        2: {
          postedBB: 1000,
          preflop_amount: '3',
          preflop_unit: 'K',
          preflop_moreAction_amount: '6',
          preflop_moreAction_unit: 'K'
        }
      };

      const result = getAlreadyContributed(
        2,
        players,
        playerData,
        'preflop',
        '_moreAction2',
        'K'
      );
      expect(result).toBe(10000); // 1000 + 3000 + 6000
    });

    it('should only include base action for postflop more action', () => {
      const playerData: PlayerData = {
        3: {
          flop_amount: '5',
          flop_unit: 'K'
        }
      };

      const result = getAlreadyContributed(
        3,
        players,
        playerData,
        'flop',
        '_moreAction',
        'K'
      );
      expect(result).toBe(5000);
    });

    it('should return 0 for postflop base action', () => {
      const result = getAlreadyContributed(
        3,
        players,
        {},
        'flop',
        ''
      );
      expect(result).toBe(0);
    });
  });

  describe('getPayoffAmount', () => {
    const players: Player[] = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: 'Bob', position: 'Dealer', stack: 150000 }
    ];

    it('should return 0 if no amount specified', () => {
      const playerData: PlayerData = {
        1: {
          preflop_action: 'call',
          preflop_amount: ''
        }
      };

      const result = getPayoffAmount(
        1,
        players,
        playerData,
        'preflop',
        ''
      );
      expect(result).toBe(0);
    });

    it('should return amount minus already contributed for call', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflop_action: 'call',
          preflop_amount: '2',
          preflop_unit: 'K'
        }
      };

      const result = getPayoffAmount(
        1,
        players,
        playerData,
        'preflop',
        ''
      );
      expect(result).toBe(1500); // 2000 - 500
    });

    it('should return amount minus already contributed for raise', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflop_action: 'raise',
          preflop_amount: '6',
          preflop_unit: 'K'
        }
      };

      const result = getPayoffAmount(
        1,
        players,
        playerData,
        'preflop',
        ''
      );
      expect(result).toBe(5500); // 6000 - 500
    });

    it('should return full amount for bet', () => {
      const playerData: PlayerData = {
        2: {
          flop_action: 'bet',
          flop_amount: '10',
          flop_unit: 'K'
        }
      };

      const result = getPayoffAmount(
        2,
        players,
        playerData,
        'flop',
        ''
      );
      expect(result).toBe(10000);
    });

    it('should return full amount for all-in', () => {
      const playerData: PlayerData = {
        2: {
          flop_action: 'all-in',
          flop_amount: '25',
          flop_unit: 'K'
        }
      };

      const result = getPayoffAmount(
        2,
        players,
        playerData,
        'flop',
        ''
      );
      expect(result).toBe(25000);
    });

    it('should not return negative payoff', () => {
      // BB calls to 1K but already posted 1K BB
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflop_action: 'call',
          preflop_amount: '0.5',  // Call to 500 (same as SB)
          preflop_unit: 'K'
        }
      };

      const result = getPayoffAmount(
        1,
        players,
        playerData,
        'preflop',
        ''
      );
      expect(result).toBe(0); // Max(500 - 500, 0) = 0
    });
  });

  describe('hasPlayerFolded', () => {
    it('should return false if player has not folded', () => {
      const playerData: PlayerData = {
        1: {
          preflop_action: 'call',
          flop_action: 'check'
        }
      };

      const result = hasPlayerFolded(1, playerData, 'turn', 'base');
      expect(result).toBe(false);
    });

    it('should return true if player folded in previous stage', () => {
      const playerData: PlayerData = {
        1: {
          preflop_action: 'fold'
        }
      };

      const result = hasPlayerFolded(1, playerData, 'flop', 'base');
      expect(result).toBe(true);
    });

    it('should return true if player folded in previous level of current stage', () => {
      const playerData: PlayerData = {
        1: {
          preflop_action: 'call',
          preflop_moreAction_action: 'fold'
        }
      };

      const result = hasPlayerFolded(1, playerData, 'preflop', 'more2');
      expect(result).toBe(true);
    });

    it('should return false if player folded in current level (not yet checked)', () => {
      const playerData: PlayerData = {
        1: {
          preflop_action: 'fold'
        }
      };

      const result = hasPlayerFolded(1, playerData, 'preflop', 'base');
      expect(result).toBe(false); // Only checks PREVIOUS levels
    });
  });

  describe('getActivePlayersForSection', () => {
    const players: Player[] = [
      { id: 1, name: 'Alice', position: 'Dealer', stack: 100000 },
      { id: 2, name: 'Bob', position: 'SB', stack: 120000 },
      { id: 3, name: 'Charlie', position: 'BB', stack: 150000 },
      { id: 4, name: '', position: '', stack: 0 }  // Empty player
    ];

    it('should return all named players if none have folded', () => {
      const playerData: PlayerData = {
        1: { preflop_action: 'call' },
        2: { preflop_action: 'raise' },
        3: { preflop_action: 'call' }
      };

      const result = getActivePlayersForSection(
        players,
        playerData,
        'preflop',
        'more'
      );
      expect(result).toHaveLength(3);
      expect(result.map(p => p.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('should exclude players who folded in previous stages', () => {
      const playerData: PlayerData = {
        1: { preflop_action: 'fold' },
        2: { preflop_action: 'call' },
        3: { preflop_action: 'raise' }
      };

      const result = getActivePlayersForSection(
        players,
        playerData,
        'flop',
        'base'
      );
      expect(result).toHaveLength(2);
      expect(result.map(p => p.name)).toEqual(['Bob', 'Charlie']);
    });

    it('should exclude players without names', () => {
      const result = getActivePlayersForSection(
        players,
        {},
        'preflop',
        'base'
      );
      expect(result).toHaveLength(3); // Only Alice, Bob, Charlie (no empty player)
    });
  });
});
