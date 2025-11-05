/**
 * More Action Sequential Enabling Tests
 *
 * Tests the sequential button enabling logic for more action rounds:
 * - Only first player enabled initially
 * - Subsequent players enabled only after previous player acts
 * - Players disabled when betting round is complete
 */

import { describe, it, expect } from 'vitest';
import { checkBettingRoundComplete } from '../roundCompletionValidator';
import type { Player, PlayerData, ActionLevel } from '../../../../types/poker';

describe('More Action - Sequential Enabling Logic', () => {
  /**
   * Helper to simulate getAvailableActionsForPlayer logic
   * This mimics the logic in PreFlopView.tsx lines 262-314
   */
  function getAvailableActionsForPlayer(
    playerId: number,
    actionLevel: ActionLevel,
    players: Player[],
    playerData: PlayerData
  ): string[] {
    // For BASE level, all actions available
    if (actionLevel === 'base') {
      return ['fold', 'check', 'call', 'bet', 'raise', 'all-in', 'no action'];
    }

    // Get active players (not folded)
    const activePlayers = players.filter(p => {
      const data = playerData[p.id];
      if (!data) return true;
      if (data.preflopAction === 'fold') return false;
      if (data.preflop_moreActionAction === 'fold') return false;
      if (data.preflop_moreAction2Action === 'fold') return false;
      return true;
    });

    const currentPlayerIndex = activePlayers.findIndex(p => p.id === playerId);
    if (currentPlayerIndex === -1) {
      return []; // Player not found
    }

    // Check if player has already acted
    const suffix = actionLevel === 'more' ? '_moreAction' : '_moreAction2';
    const actionKey = `preflop${suffix}Action` as keyof PlayerData[number];
    const playerAction = playerData[playerId]?.[actionKey];

    // If player has already acted, allow them to modify
    if (playerAction && playerAction !== 'no action') {
      return ['call', 'raise', 'all-in', 'fold', 'no action'];
    }

    // First player: Enable buttons
    if (currentPlayerIndex === 0) {
      return ['call', 'raise', 'all-in', 'fold', 'no action'];
    }

    // Subsequent players: Check if previous player has acted
    const previousPlayer = activePlayers[currentPlayerIndex - 1];
    const previousPlayerData = playerData[previousPlayer.id];
    const previousPlayerAction = previousPlayerData?.[actionKey];

    // If previous player hasn't acted yet, disable
    if (!previousPlayerAction || previousPlayerAction === 'no action') {
      return [];
    }

    // CRITICAL: Check if betting round is complete
    const completionCheck = checkBettingRoundComplete('preflop', actionLevel, players, playerData);
    if (completionCheck.isComplete) {
      return []; // Disabled - round is complete
    }

    // Previous player has acted AND round is not complete
    return ['call', 'raise', 'all-in', 'fold', 'no action'];
  }

  describe('Scenario 1: Initial More Action - Only First Player Enabled', () => {
    it('should only enable first player when more action starts', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
        { id: 3, name: 'Bob', position: 'BB', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'K' },
        5: { preflopAction: 'raise', preflopAmount: '2', preflopUnit: 'K' },
        6: { preflopAction: 'raise', preflopAmount: '3', preflopUnit: 'K' },
        3: { preflopAction: 'call', preflopAmount: '3', preflopUnit: 'K' },
      };

      // Check each player's available actions
      const aliceActions = getAvailableActionsForPlayer(4, 'more', players, playerData);
      const charlieActions = getAvailableActionsForPlayer(5, 'more', players, playerData);
      const davidActions = getAvailableActionsForPlayer(6, 'more', players, playerData);
      const bobActions = getAvailableActionsForPlayer(3, 'more', players, playerData);

      // Only Alice (first player) should be enabled
      expect(aliceActions.length).toBeGreaterThan(0);
      expect(aliceActions).toContain('call');
      expect(aliceActions).toContain('raise');

      // All others should be disabled
      expect(charlieActions).toEqual([]);
      expect(davidActions).toEqual([]);
      expect(bobActions).toEqual([]);
    });
  });

  describe('Scenario 2: Sequential Enabling - Previous Player Acts', () => {
    it('should enable second player after first player acts', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
        { id: 3, name: 'Bob', position: 'BB', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          preflopAction: 'call',
          preflop_moreActionAction: 'call', // Alice acted in more action
        },
        5: { preflopAction: 'raise' },
        6: { preflopAction: 'raise' },
        3: { preflopAction: 'call' },
      };

      const aliceActions = getAvailableActionsForPlayer(4, 'more', players, playerData);
      const charlieActions = getAvailableActionsForPlayer(5, 'more', players, playerData);
      const davidActions = getAvailableActionsForPlayer(6, 'more', players, playerData);

      // Alice has acted, should still be modifiable
      expect(aliceActions.length).toBeGreaterThan(0);

      // Charlie (second player) should now be enabled
      expect(charlieActions.length).toBeGreaterThan(0);
      expect(charlieActions).toContain('call');
      expect(charlieActions).toContain('raise');

      // David should still be disabled
      expect(davidActions).toEqual([]);
    });
  });

  describe('Scenario 3: Betting Round Complete - Disable Remaining Players', () => {
    it('should disable David when Alice and Charlie both call (betting complete)', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
        { id: 3, name: 'Bob', position: 'BB', stack: 10000 },
      ];

      // David raised to 3K in base
      // Alice and Charlie both called in more action
      // Betting is now complete - David should be disabled
      const playerData: PlayerData = {
        4: {
          preflopAction: 'call',
          preflopAmount: '1',
          preflop_moreActionAction: 'call', // Alice called
        },
        5: {
          preflopAction: 'raise',
          preflopAmount: '2',
          preflop_moreActionAction: 'call', // Charlie called
        },
        6: {
          preflopAction: 'raise',
          preflopAmount: '3', // David raised to 3K
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '3',
        },
      };

      // Check if round is complete
      const completionCheck = checkBettingRoundComplete('preflop', 'more', players, playerData);
      expect(completionCheck.isComplete).toBe(true);
      expect(completionCheck.reason).toBe('All players acted and contributions matched');

      // David should be disabled because betting is complete
      const davidActions = getAvailableActionsForPlayer(6, 'more', players, playerData);
      expect(davidActions).toEqual([]);
    });

    it('should enable David if Charlie raises (betting not complete)', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
        { id: 3, name: 'Bob', position: 'BB', stack: 10000 },
      ];

      // Alice called, Charlie raised to 5K
      // Betting NOT complete - David should be enabled
      const playerData: PlayerData = {
        4: {
          preflopAction: 'call',
          preflopAmount: '1',
          preflop_moreActionAction: 'call',
        },
        5: {
          preflopAction: 'raise',
          preflopAmount: '2',
          preflop_moreActionAction: 'raise', // Charlie raised!
          preflop_moreActionAmount: '5',
        },
        6: {
          preflopAction: 'raise',
          preflopAmount: '3',
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '3',
        },
      };

      // Check if round is complete
      const completionCheck = checkBettingRoundComplete('preflop', 'more', players, playerData);
      expect(completionCheck.isComplete).toBe(false);
      expect(completionCheck.reason).toBe('Contributions not matched');

      // David should be ENABLED because Charlie raised
      const davidActions = getAvailableActionsForPlayer(6, 'more', players, playerData);
      expect(davidActions.length).toBeGreaterThan(0);
      expect(davidActions).toContain('call');
      expect(davidActions).toContain('raise');
    });
  });

  describe('Scenario 4: More Action 2 - Sequential Logic', () => {
    it('should apply same sequential logic to more action 2', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
      ];

      const playerData: PlayerData = {
        4: {
          preflopAction: 'call',
          preflop_moreActionAction: 'call',
          // No more action 2 yet
        },
        5: {
          preflopAction: 'raise',
          preflop_moreActionAction: 'raise',
        },
        6: {
          preflopAction: 'raise',
          preflop_moreActionAction: 'raise',
        },
      };

      // In more action 2, only Alice should be enabled initially
      const aliceActions = getAvailableActionsForPlayer(4, 'more2', players, playerData);
      const charlieActions = getAvailableActionsForPlayer(5, 'more2', players, playerData);
      const davidActions = getAvailableActionsForPlayer(6, 'more2', players, playerData);

      expect(aliceActions.length).toBeGreaterThan(0);
      expect(charlieActions).toEqual([]);
      expect(davidActions).toEqual([]);
    });
  });

  describe('Scenario 5: Player Folds - Skip in Sequence', () => {
    it('should skip folded players in sequential enabling', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 10000 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 10000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 10000 },
        { id: 3, name: 'Bob', position: 'BB', stack: 10000 },
      ];

      // Alice called, Charlie folded in more action
      // David should be enabled next (skipping Charlie)
      const playerData: PlayerData = {
        4: {
          preflopAction: 'call',
          preflop_moreActionAction: 'call',
        },
        5: {
          preflopAction: 'raise',
          preflop_moreActionAction: 'fold', // Charlie folded
        },
        6: {
          preflopAction: 'raise',
        },
        3: {
          preflopAction: 'call',
        },
      };

      // Get active players (Charlie should be filtered out)
      const activePlayers = players.filter(p => {
        const data = playerData[p.id];
        if (!data) return true;
        if (data.preflop_moreActionAction === 'fold') return false;
        return true;
      });

      expect(activePlayers.length).toBe(3); // Alice, David, Bob (not Charlie)

      // David should be enabled (second active player after Alice)
      const davidActions = getAvailableActionsForPlayer(6, 'more', players, playerData);
      expect(davidActions.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario 6: Real World - 4 Players, David Raises Base', () => {
    it('should handle the exact scenario from the screenshot', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 9500 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 11000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 7500 },
        { id: 3, name: 'Bob', position: 'BB', stack: 12000 },
      ];

      // Base level: Alice called 1K, Charlie raised 2K, David raised 3K, Bob called 3K
      const playerData: PlayerData = {
        4: { preflopAction: 'call', preflopAmount: '1', preflopUnit: 'K' },
        5: { preflopAction: 'raise', preflopAmount: '2', preflopUnit: 'K' },
        6: { preflopAction: 'raise', preflopAmount: '3', preflopUnit: 'K' }, // David raised
        3: { preflopAction: 'call', preflopAmount: '3', preflopUnit: 'K' },
      };

      // After process stack, More Action 1 begins
      // Only Alice should be enabled
      const aliceActions = getAvailableActionsForPlayer(4, 'more', players, playerData);
      const charlieActions = getAvailableActionsForPlayer(5, 'more', players, playerData);
      const davidActions = getAvailableActionsForPlayer(6, 'more', players, playerData);
      const bobActions = getAvailableActionsForPlayer(3, 'more', players, playerData);

      expect(aliceActions.length).toBeGreaterThan(0);
      expect(charlieActions).toEqual([]);
      expect(davidActions).toEqual([]);
      expect(bobActions).toEqual([]);
    });

    it('should enable Charlie after Alice calls', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 9500 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 11000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 7500 },
        { id: 3, name: 'Bob', position: 'BB', stack: 12000 },
      ];

      const playerData: PlayerData = {
        4: {
          preflopAction: 'call',
          preflop_moreActionAction: 'call', // Alice called
        },
        5: { preflopAction: 'raise' },
        6: { preflopAction: 'raise' },
        3: { preflopAction: 'call' },
      };

      const charlieActions = getAvailableActionsForPlayer(5, 'more', players, playerData);
      expect(charlieActions.length).toBeGreaterThan(0);
    });

    it('should disable David when Alice and Charlie both call', () => {
      const players: Player[] = [
        { id: 4, name: 'Alice', position: 'UTG', stack: 9500 },
        { id: 5, name: 'Charlie', position: 'UTG+1', stack: 11000 },
        { id: 6, name: 'David', position: 'UTG+2', stack: 7500 },
        { id: 3, name: 'Bob', position: 'BB', stack: 12000 },
      ];

      const playerData: PlayerData = {
        4: {
          preflopAction: 'call',
          preflop_moreActionAction: 'call', // Alice called
        },
        5: {
          preflopAction: 'raise',
          preflop_moreActionAction: 'call', // Charlie called
        },
        6: {
          preflopAction: 'raise', // David raised in base
        },
        3: {
          preflopAction: 'call',
        },
      };

      // Betting round should be complete
      const completionCheck = checkBettingRoundComplete('preflop', 'more', players, playerData);
      expect(completionCheck.isComplete).toBe(true);

      // David should be disabled
      const davidActions = getAvailableActionsForPlayer(6, 'more', players, playerData);
      expect(davidActions).toEqual([]);
    });
  });
});
