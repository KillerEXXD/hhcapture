/**
 * Player Action Status Tests
 *
 * Tests for the checkPlayerNeedsToAct function that determines
 * if a player should be enabled, auto-skipped (matched max bet),
 * or auto-skipped (all-in) in More Action rounds.
 */

import { describe, it, expect } from 'vitest';
import { checkPlayerNeedsToAct } from '../playerActionStatus';
import type { Player, PlayerData, ActionLevel } from '../../../../types/poker';

describe('checkPlayerNeedsToAct - More Action 1', () => {
  describe('Case 1: Player Already Matched Max Bet from BASE', () => {
    it('should detect when player raised in BASE and is at max contribution', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '1',
          preflopUnit: 'K',
        },
        5: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K',
        },
        6: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '3',
          preflopUnit: 'K',
        },
      };

      // Charlie raised to 3K in BASE
      // Current max in More Action 1 is 3K (no new bets yet)
      // Charlie already matched max bet
      const result = checkPlayerNeedsToAct(5, 'more', players, playerData);

      expect(result.needsToAct).toBe(false);
      expect(result.alreadyMatchedMaxBet).toBe(true);
      expect(result.alreadyAllIn).toBe(false);
      expect(result.cumulativeContribution).toBe(3000);
      expect(result.maxContribution).toBe(3000);
    });

    it('should detect when BB already matched max bet', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 3, name: 'Bob', position: 'BB', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '2',
          preflopUnit: 'K',
        },
        5: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'raise',
          preflopAmount: '5',
          preflopUnit: 'K',
        },
        3: {
          postedSB: 0,
          postedBB: 500,
          preflopAction: 'raise',
          preflopAmount: '5',
          preflopUnit: 'K',
        },
      };

      // Bob (BB) raised to 5K in BASE (posted 500 + raised 5K)
      // Current max is 5K
      // Bob already matched max bet
      const result = checkPlayerNeedsToAct(3, 'more', players, playerData);

      expect(result.needsToAct).toBe(false);
      expect(result.alreadyMatchedMaxBet).toBe(true);
      expect(result.cumulativeContribution).toBe(5500);
      expect(result.maxContribution).toBe(5500);
    });
  });

  describe('Case 2: Player All-In from BASE', () => {
    it('should detect when player went all-in in BASE round', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '3',
          preflopUnit: 'K',
        },
        5: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'all-in',
          preflopAmount: '2',
          preflopUnit: 'K',
        },
        6: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K',
        },
      };

      // Charlie went all-in for 2K in BASE
      const result = checkPlayerNeedsToAct(5, 'more', players, playerData);

      expect(result.needsToAct).toBe(false);
      expect(result.alreadyMatchedMaxBet).toBe(false);
      expect(result.alreadyAllIn).toBe(true);
    });

    it('should detect forced all-in during blind posting', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 3, name: 'Bob', position: 'BB', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '1',
          preflopUnit: 'K',
        },
        3: {
          postedSB: 0,
          postedBB: 500,
          isForcedAllInPreflop: true,
        },
      };

      // Bob forced all-in when posting BB
      const result = checkPlayerNeedsToAct(3, 'more', players, playerData);

      expect(result.needsToAct).toBe(false);
      expect(result.alreadyAllIn).toBe(true);
    });
  });

  describe('Case 3: Player Needs to Act', () => {
    it('should detect when player needs to act (contribution < max)', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '1',
          preflopUnit: 'K',
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: '0',
        },
        5: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '1',
          preflopUnit: 'K',
        },
        6: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K',
        },
      };

      // Alice called 1K in BASE, then called in More Action 1
      // Charlie called 1K in BASE
      // David raised to 3K in BASE
      // Charlie's contribution (1K) < max (3K) → Needs to act
      const result = checkPlayerNeedsToAct(5, 'more', players, playerData);

      expect(result.needsToAct).toBe(true);
      expect(result.alreadyMatchedMaxBet).toBe(false);
      expect(result.alreadyAllIn).toBe(false);
      expect(result.cumulativeContribution).toBe(1000);
      expect(result.maxContribution).toBe(3000);
    });

    it('should detect when new raise in More Action creates need to act', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '5',
          preflop_moreActionUnit: 'K',
        },
        5: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K',
        },
        6: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '3',
          preflopUnit: 'K',
        },
      };

      // Alice raised to 5K in More Action 1
      // Charlie raised to 3K in BASE
      // Charlie's cumulative: 3K (BASE)
      // Max cumulative: 3K (BASE) + 5K (More Action) = 8K
      // Charlie needs to act
      const result = checkPlayerNeedsToAct(5, 'more', players, playerData);

      expect(result.needsToAct).toBe(true);
      expect(result.cumulativeContribution).toBe(3000);
      expect(result.maxContribution).toBe(8000);
    });
  });
});

describe('checkPlayerNeedsToAct - More Action 2', () => {
  describe('Case 1: Player All-In from More Action 1', () => {
    it('should detect when player went all-in in More Action 1', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '5',
          preflop_moreActionUnit: 'K',
        },
        5: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'all-in',
          preflop_moreActionAmount: '4',
          preflop_moreActionUnit: 'K',
        },
      };

      // Charlie went all-in in More Action 1
      const result = checkPlayerNeedsToAct(5, 'more2', players, playerData);

      expect(result.needsToAct).toBe(false);
      expect(result.alreadyAllIn).toBe(true);
    });
  });

  describe('Case 2: Cumulative Contributions from BASE + More Action 1', () => {
    it('should calculate cumulative contributions correctly', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '2',
          preflopUnit: 'K',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '5',
          preflop_moreActionUnit: 'K',
          preflop_moreAction2Action: 'call',
          preflop_moreAction2Amount: '0',
        },
        5: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: '5',
          preflop_moreActionUnit: 'K',
        },
        6: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: '5',
          preflop_moreActionUnit: 'K',
        },
      };

      // Charlie's cumulative: 3K (BASE) + 5K (More Action 1) = 8K
      // Alice's cumulative: 2K (BASE) + 5K (More Action 1) = 7K
      // Max is 8K
      // Charlie already matched max bet
      const result = checkPlayerNeedsToAct(5, 'more2', players, playerData);

      expect(result.needsToAct).toBe(false);
      expect(result.alreadyMatchedMaxBet).toBe(true);
      expect(result.cumulativeContribution).toBe(8000);
      expect(result.maxContribution).toBe(8000);
    });

    it('should include posted blinds in cumulative calculation', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 3, name: 'Bob', position: 'BB', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '5',
          preflop_moreActionUnit: 'K',
        },
        3: {
          postedSB: 0,
          postedBB: 500,
          preflopAction: 'call',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: '5',
          preflop_moreActionUnit: 'K',
        },
      };

      // Bob's cumulative: 500 (BB) + 3K (BASE) + 5K (More Action 1) = 8.5K
      const result = checkPlayerNeedsToAct(3, 'more2', players, playerData);

      expect(result.cumulativeContribution).toBe(8500);
    });
  });
});

describe('checkPlayerNeedsToAct - Edge Cases', () => {
  describe('Edge Case 1: Multiple All-Ins', () => {
    it('should handle scenario with multiple all-in players', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
        { id: 7, name: 'Emma', position: 'CO', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'all-in',
          preflopAmount: '1',
          preflopUnit: 'K',
        },
        5: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'all-in',
          preflopAmount: '2',
          preflopUnit: 'K',
        },
        6: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'raise',
          preflopAmount: '5',
          preflopUnit: 'K',
        },
        7: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '5',
          preflopUnit: 'K',
        },
      };

      // Alice and Charlie both all-in
      const aliceResult = checkPlayerNeedsToAct(4, 'more', players, playerData);
      const charlieResult = checkPlayerNeedsToAct(5, 'more', players, playerData);

      expect(aliceResult.alreadyAllIn).toBe(true);
      expect(charlieResult.alreadyAllIn).toBe(true);
    });
  });

  describe('Edge Case 2: All Players Matched Max Bet', () => {
    it('should handle when all players already matched in BASE', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '3',
          preflopUnit: 'K',
        },
        5: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '3',
          preflopUnit: 'K',
        },
        6: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K',
        },
      };

      // All players at 3K
      const aliceResult = checkPlayerNeedsToAct(4, 'more', players, playerData);
      const charlieResult = checkPlayerNeedsToAct(5, 'more', players, playerData);
      const davidResult = checkPlayerNeedsToAct(6, 'more', players, playerData);

      expect(aliceResult.alreadyMatchedMaxBet).toBe(true);
      expect(charlieResult.alreadyMatchedMaxBet).toBe(true);
      expect(davidResult.alreadyMatchedMaxBet).toBe(true);
    });
  });

  describe('Edge Case 3: Partial All-In (Less Than Max Bet)', () => {
    it('should detect all-in even when contribution < max', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'all-in',
          preflopAmount: '2',
          preflopUnit: 'K',
        },
        5: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'raise',
          preflopAmount: '5',
          preflopUnit: 'K',
        },
        6: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '5',
          preflopUnit: 'K',
        },
      };

      // Alice all-in for 2K (less than max of 5K)
      const result = checkPlayerNeedsToAct(4, 'more', players, playerData);

      expect(result.needsToAct).toBe(false);
      expect(result.alreadyAllIn).toBe(true);
      expect(result.alreadyMatchedMaxBet).toBe(false);
      expect(result.cumulativeContribution).toBe(2000);
      expect(result.maxContribution).toBe(5000);
    });
  });

  describe('Edge Case 4: No Actions Yet in More Action Round', () => {
    it('should calculate max contribution from BASE only when More Action just started', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'call',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'no action',
        },
        5: {
          postedSB: 0,
          postedBB: 0,
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K',
          preflop_moreActionAction: 'no action',
        },
      };

      // No actions yet in More Action, max is from BASE (3K)
      const result = checkPlayerNeedsToAct(4, 'more', players, playerData);

      expect(result.maxContribution).toBe(3000);
    });
  });
});
