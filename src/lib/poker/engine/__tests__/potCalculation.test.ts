/**
 * Pot Calculation Engine Tests
 *
 * Tests the three-step pot calculation system with various scenarios.
 */

import { describe, it, expect } from 'vitest';
import {
  gatherContributions,
  calculateDeadMoney,
  createPots,
  calculatePotsForBettingRound
} from '../potCalculationEngine';
import type { Player, PlayerData } from '../../../../types/poker';

describe('Pot Calculation Engine', () => {
  // Sample players setup
  const createPlayers = (): Player[] => [
    { id: 1, name: 'Alice', position: 'UTG', stack: 10000 },
    { id: 2, name: 'Bob', position: 'BB', stack: 12000 },
    { id: 3, name: 'Charlie', position: 'CO', stack: 11000 },
    { id: 4, name: 'Jane', position: 'SB', stack: 8500 },
    { id: 5, name: 'John', position: 'Dealer', stack: 10000 }
  ];

  describe('Scenario 1: Preflop Base - Simple Calls', () => {
    it('should calculate pot correctly with BB and calls', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: 1, preflopUnit: 'K' },
        2: { preflopAction: 'check', postedBB: 1000, postedAnte: 1000 },
        3: { preflopAction: 'call', preflopAmount: 1, preflopUnit: 'K' },
        4: { preflopAction: 'call', preflopAmount: 1, preflopUnit: 'K', postedSB: 500 },
        5: { preflopAction: 'fold' }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 1000, // Alice called 1K
          2: 0,    // BB checked (already posted 1K)
          3: 1000, // Charlie called 1K
          4: 500,  // SB called additional 500 (posted 500 already)
          5: 0     // John folded
        }
      };

      const processedSections = { 'preflop_base': true };
      const sectionStacks = {
        'preflop_base': {
          current: { 1: 10000, 2: 11000, 3: 11000, 4: 8000, 5: 10000 },
          updated: { 1: 9000, 2: 11000, 3: 10000, 4: 7500, 5: 10000 }
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

      // Expected: SB (500) + BB (1000) + Ante (1000) + Alice (1000) + Charlie (1000) + SB additional (500) = 5000
      expect(potInfo.totalPot).toBe(5000);
      expect(potInfo.deadMoney).toBe(1000); // Ante only
      expect(potInfo.sidePots.length).toBe(0); // No all-ins
    });
  });

  describe('Scenario 2: Preflop with Raise', () => {
    it('should calculate pot correctly with raise to 3K', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: 3, preflopUnit: 'K' },
        2: { preflopAction: 'call', preflopAmount: 3, preflopUnit: 'K', postedBB: 1000, postedAnte: 1000 },
        3: { preflopAction: 'raise', preflopAmount: 3, preflopUnit: 'K' },
        4: { preflopAction: 'fold', postedSB: 500 },
        5: { preflopAction: 'fold' }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 3000, // Alice called 3K
          2: 2000, // BB called additional 2K (already posted 1K)
          3: 3000, // Charlie raised to 3K
          4: 0,    // SB folded (posted 500)
          5: 0     // John folded
        }
      };

      const processedSections = { 'preflop_base': true };
      const sectionStacks = {
        'preflop_base': {
          current: { 1: 10000, 2: 11000, 3: 11000, 4: 8000, 5: 10000 },
          updated: { 1: 7000, 2: 9000, 3: 8000, 4: 8000, 5: 10000 }
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

      // Expected: Folded SB (500) + BB (1000) + Ante (1000) + Alice (3000) + BB additional (2000) + Charlie (3000) = 10500
      expect(potInfo.totalPot).toBe(10500);
      expect(potInfo.deadMoney).toBe(1500); // Ante (1000) + Folded SB (500)
      expect(potInfo.deadMoneyBreakdown.ante).toBe(1000);
      expect(potInfo.deadMoneyBreakdown.foldedBlinds).toBe(500);
    });
  });

  describe('Scenario 3: All-In Situation - Side Pots', () => {
    it('should create side pots when player goes all-in', () => {
      const players = createPlayers();

      // Alice has only 2K, goes all-in
      players[0].stack = 2000;

      const playerData: PlayerData = {
        1: { preflopAction: 'all-in', preflopAmount: 2, preflopUnit: 'K' },
        2: { preflopAction: 'call', preflopAmount: 5, preflopUnit: 'K', postedBB: 1000, postedAnte: 1000 },
        3: { preflopAction: 'raise', preflopAmount: 5, preflopUnit: 'K' },
        4: { preflopAction: 'fold', postedSB: 500 },
        5: { preflopAction: 'fold' }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 2000, // Alice all-in 2K
          2: 4000, // BB called 5K (additional 4K beyond posted 1K)
          3: 5000, // Charlie raised to 5K
          4: 0,    // SB folded
          5: 0     // John folded
        }
      };

      const processedSections = { 'preflop_base': true };
      const sectionStacks = {
        'preflop_base': {
          current: { 1: 2000, 2: 11000, 3: 11000, 4: 8000, 5: 10000 },
          updated: { 1: 0, 2: 7000, 3: 6000, 4: 8000, 5: 10000 }
        }
      };

      const stackData = { bigBlind: 1000, smallBlind: 500, ante: 1000 };

      // Need to mark Alice as all-in
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

      // Manually set Alice as all-in
      contributions[0].isAllIn = true;

      const deadMoney = calculateDeadMoney('preflop', contributions);
      const potInfo = createPots(contributions, deadMoney, 0, 'preflop', 'base');

      // Expected:
      // Main Pot: 2K × 3 players = 6000, plus dead money (SB 500 + ante 1000) = 7500
      // Side Pot: (5K - 2K) × 2 players = 6000
      // Total: 7500 + 6000 = 13500
      expect(potInfo.totalPot).toBe(13500);
      expect(potInfo.sidePots.length).toBeGreaterThan(0);

      // Main pot should have all 3 active players eligible
      expect(potInfo.mainPot.eligiblePlayers.length).toBe(3);

      // Side pot should exclude Alice
      if (potInfo.sidePots.length > 0) {
        expect(potInfo.sidePots[0].eligiblePlayers.length).toBe(2);
        expect(potInfo.sidePots[0].excludedPlayers.some(p => p.name === 'Alice')).toBe(true);
      }
    });
  });

  describe('Scenario 4: User Scenario - 9 Players with Raise', () => {
    it('should calculate pot correctly: SB=500, BB=1000, Ante=1000, P1 calls, P2 raises 2k', () => {
      const players: Player[] = [
        { id: 1, name: 'Player1', position: 'UTG', stack: 10000 },
        { id: 2, name: 'Player2', position: 'UTG+1', stack: 5000 },
        { id: 3, name: 'Player3', position: 'UTG+2', stack: 10000 },
        { id: 4, name: 'Player4', position: 'MP', stack: 10000 },
        { id: 5, name: 'Player5', position: 'MP+1', stack: 10000 },
        { id: 6, name: 'Player6', position: 'MP+2', stack: 10000 },
        { id: 7, name: 'Player7', position: 'CO', stack: 10000 },
        { id: 8, name: 'SB', position: 'SB', stack: 15000 },
        { id: 9, name: 'BB', position: 'BB', stack: 15000 }
      ];

      const playerData: PlayerData = {
        1: { preflopAction: 'call', preflopAmount: 1, preflopUnit: 'K' },
        2: { preflopAction: 'raise', preflopAmount: 2, preflopUnit: 'K' },
        3: { preflopAction: 'fold' },
        4: { preflopAction: 'fold' },
        5: { preflopAction: 'fold' },
        6: { preflopAction: 'fold' },
        7: { preflopAction: 'fold' },
        8: { preflopAction: 'call', preflopAmount: 2, preflopUnit: 'K', postedSB: 500 },
        9: { preflopAction: 'call', preflopAmount: 2, preflopUnit: 'K', postedBB: 1000, postedAnte: 1000 }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 1000,  // Player1 called BB only
          2: 2000,  // Player2 raised to 2K
          3: 0,     // Folded
          4: 0,     // Folded
          5: 0,     // Folded
          6: 0,     // Folded
          7: 0,     // Folded
          8: 1500,  // SB called raise (500 blind + 1500)
          9: 1000   // BB called raise (1000 blind + 1000)
        }
      };

      const processedSections = { 'preflop_base': true };
      const sectionStacks = {
        'preflop_base': {
          current: { 1: 10000, 2: 5000, 3: 10000, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 8: 14500, 9: 14000 },
          updated: { 1: 9000, 2: 3000, 3: 10000, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 8: 13000, 9: 13000 }
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

      // Expected pot calculation:
      // Live contributions: P1 (1000) + P2 (2000) + SB (2000 total: 500 blind + 1500) + BB (2000 total: 1000 blind + 1000)
      // = 1000 + 2000 + 2000 + 2000 = 8000
      // Dead money: BB Ante (1000)
      // Total pot: 8000 + 1000 = 9000
      expect(potInfo.totalPot).toBe(9000);
      expect(potInfo.deadMoney).toBe(1000); // Ante only
      expect(potInfo.sidePots.length).toBe(0); // No all-ins
    });
  });

  describe('Scenario 5: User Scenario - More Action 1 with Re-raise', () => {
    it('should calculate pot correctly: P1 raises 3K, P2 calls, SB calls, BB raises 4K', () => {
      const players: Player[] = [
        { id: 1, name: 'Player1', position: 'UTG', stack: 10000 },
        { id: 2, name: 'Player2', position: 'UTG+1', stack: 5000 },
        { id: 3, name: 'Player3', position: 'UTG+2', stack: 10000 },
        { id: 4, name: 'Player4', position: 'MP', stack: 10000 },
        { id: 5, name: 'Player5', position: 'MP+1', stack: 10000 },
        { id: 6, name: 'Player6', position: 'MP+2', stack: 10000 },
        { id: 7, name: 'Player7', position: 'CO', stack: 10000 },
        { id: 8, name: 'SB', position: 'SB', stack: 15000 },
        { id: 9, name: 'BB', position: 'BB', stack: 15000 }
      ];

      const playerData: PlayerData = {
        1: {
          preflopAction: 'call',
          preflopAmount: 1,
          preflopUnit: 'K',
          postedSB: 0,
          postedBB: 0,
          postedAnte: 0,
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: 3,
          preflop_moreActionUnit: 'K'
        },
        2: {
          preflopAction: 'raise',
          preflopAmount: 2,
          preflopUnit: 'K',
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: 3,
          preflop_moreActionUnit: 'K'
        },
        3: { preflopAction: 'fold' },
        4: { preflopAction: 'fold' },
        5: { preflopAction: 'fold' },
        6: { preflopAction: 'fold' },
        7: { preflopAction: 'fold' },
        8: {
          preflopAction: 'call',
          preflopAmount: 2,
          preflopUnit: 'K',
          postedSB: 500,
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: 3,
          preflop_moreActionUnit: 'K'
        },
        9: {
          preflopAction: 'call',
          preflopAmount: 2,
          preflopUnit: 'K',
          postedBB: 1000,
          postedAnte: 1000,
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: 4,
          preflop_moreActionUnit: 'K'
        }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 1000,  // Player1 called BB only
          2: 2000,  // Player2 raised to 2K
          3: 0,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
          8: 1500,  // SB: 500 blind + 1500
          9: 1000   // BB: 1000 blind + 1000
        },
        'preflop_more': {
          1: 2000,  // P1 raises to 3K (additional 2K from 1K base)
          2: 1000,  // P2 calls 3K (additional 1K from 2K base)
          3: 0,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
          8: 1000,  // SB calls 3K (additional 1K from 2K base)
          9: 2000   // BB raises to 4K (additional 2K from 2K base)
        }
      };

      const processedSections = {
        'preflop_base': true,
        'preflop_more': true
      };

      const sectionStacks = {
        'preflop_base': {
          current: { 1: 10000, 2: 5000, 3: 10000, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 8: 14500, 9: 14000 },
          updated: { 1: 9000, 2: 3000, 3: 10000, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 8: 13000, 9: 13000 }
        },
        'preflop_more': {
          current: { 1: 9000, 2: 3000, 3: 10000, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 8: 13000, 9: 13000 },
          updated: { 1: 7000, 2: 2000, 3: 10000, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 8: 12000, 9: 11000 }
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

      // Expected pot calculation:
      // Cumulative contributions:
      // P1: 1K (base) + 2K (more) = 3K
      // P2: 2K (base) + 1K (more) = 3K
      // SB: 2K (base) + 1K (more) = 3K
      // BB: 2K (base) + 2K (more) = 4K
      // Total live: 3K + 3K + 3K + 4K = 13K
      // Dead money: 1K (ante)
      // Total pot: 14K
      expect(potInfo.totalPot).toBe(14000);
      expect(potInfo.deadMoney).toBe(1000);
      expect(potInfo.sidePots.length).toBe(0); // No all-ins
    });
  });

  describe('Scenario 5b: User Scenario - More Action 2, Everyone Calls', () => {
    it('should calculate pot correctly: P1, P2, SB all call BB\'s 4K', () => {
      const players: Player[] = [
        { id: 1, name: 'Player1', position: 'UTG', stack: 10000 },
        { id: 2, name: 'Player2', position: 'UTG+1', stack: 5000 },
        { id: 3, name: 'Player3', position: 'UTG+2', stack: 10000 },
        { id: 4, name: 'Player4', position: 'MP', stack: 10000 },
        { id: 5, name: 'Player5', position: 'MP+1', stack: 10000 },
        { id: 6, name: 'Player6', position: 'MP+2', stack: 10000 },
        { id: 7, name: 'Player7', position: 'CO', stack: 10000 },
        { id: 8, name: 'SB', position: 'SB', stack: 15000 },
        { id: 9, name: 'BB', position: 'BB', stack: 15000 }
      ];

      const playerData: PlayerData = {
        1: {
          preflopAction: 'call',
          preflopAmount: 1,
          preflopUnit: 'K',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: 3,
          preflop_moreActionUnit: 'K',
          preflop_moreAction2Action: 'call',
          preflop_moreAction2Amount: 4,
          preflop_moreAction2Unit: 'K'
        },
        2: {
          preflopAction: 'raise',
          preflopAmount: 2,
          preflopUnit: 'K',
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: 3,
          preflop_moreActionUnit: 'K',
          preflop_moreAction2Action: 'call',
          preflop_moreAction2Amount: 4,
          preflop_moreAction2Unit: 'K'
        },
        3: { preflopAction: 'fold' },
        4: { preflopAction: 'fold' },
        5: { preflopAction: 'fold' },
        6: { preflopAction: 'fold' },
        7: { preflopAction: 'fold' },
        8: {
          preflopAction: 'call',
          preflopAmount: 2,
          preflopUnit: 'K',
          postedSB: 500,
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: 3,
          preflop_moreActionUnit: 'K',
          preflop_moreAction2Action: 'call',
          preflop_moreAction2Amount: 4,
          preflop_moreAction2Unit: 'K'
        },
        9: {
          preflopAction: 'call',
          preflopAmount: 2,
          preflopUnit: 'K',
          postedBB: 1000,
          postedAnte: 1000,
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: 4,
          preflop_moreActionUnit: 'K',
          preflop_moreAction2Action: 'check'
        }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 1000, 2: 2000, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1500, 9: 1000
        },
        'preflop_more': {
          1: 2000, 2: 1000, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1000, 9: 2000
        },
        'preflop_more2': {
          1: 1000, 2: 1000, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1000, 9: 0
        }
      };

      const processedSections = {
        'preflop_base': true,
        'preflop_more': true,
        'preflop_more2': true
      };

      const sectionStacks = {
        'preflop_base': {
          current: { 1: 10000, 2: 5000, 3: 10000, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 8: 14500, 9: 14000 },
          updated: { 1: 9000, 2: 3000, 3: 10000, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 8: 13000, 9: 13000 }
        },
        'preflop_more': {
          current: { 1: 9000, 2: 3000, 3: 10000, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 8: 13000, 9: 13000 },
          updated: { 1: 7000, 2: 2000, 3: 10000, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 8: 12000, 9: 11000 }
        },
        'preflop_more2': {
          current: { 1: 7000, 2: 2000, 3: 10000, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 8: 12000, 9: 11000 },
          updated: { 1: 6000, 2: 1000, 3: 10000, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 8: 11000, 9: 11000 }
        }
      };

      const stackData = { bigBlind: 1000, smallBlind: 500, ante: 1000 };

      const potInfo = calculatePotsForBettingRound(
        'preflop',
        'more2',
        players,
        playerData,
        contributedAmounts,
        processedSections,
        sectionStacks,
        stackData,
        0
      );

      // Expected pot calculation:
      // Cumulative contributions:
      // P1: 1K (base) + 2K (more) + 1K (more2) = 4K
      // P2: 2K (base) + 1K (more) + 1K (more2) = 4K
      // SB: 2K (base) + 1K (more) + 1K (more2) = 4K
      // BB: 2K (base) + 2K (more) + 0 (more2) = 4K
      // Total live: 4K × 4 = 16K
      // Dead money: 1K (ante)
      // Total pot: 17K
      expect(potInfo.totalPot).toBe(17000);
      expect(potInfo.deadMoney).toBe(1000);
      expect(potInfo.sidePots.length).toBe(0); // No all-ins
    });
  });

  describe('Scenario 6: More Action Round', () => {
    it('should calculate cumulative contributions correctly', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        // Base round
        1: {
          preflopAction: 'call',
          preflopAmount: 1,
          preflopUnit: 'K',
          // More action
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: 3,
          preflop_moreActionUnit: 'K'
        },
        2: {
          preflopAction: 'check',
          postedBB: 1000,
          postedAnte: 1000,
          // More action
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: 3,
          preflop_moreActionUnit: 'K'
        },
        3: {
          preflopAction: 'raise',
          preflopAmount: 3,
          preflopUnit: 'K',
          // More action - already at 3K, no action needed
          preflop_moreActionAction: 'check'
        },
        4: { preflopAction: 'fold', postedSB: 500 },
        5: { preflopAction: 'fold' }
      };

      const contributedAmounts = {
        'preflop_base': {
          1: 1000,
          2: 0,
          3: 3000,
          4: 0,
          5: 0
        },
        'preflop_more': {
          1: 2000, // Additional 2K to reach 3K total
          2: 2000, // Additional 2K to reach 3K total
          3: 0,    // Already at 3K
          4: 0,
          5: 0
        }
      };

      const processedSections = {
        'preflop_base': true,
        'preflop_more': true
      };

      const sectionStacks = {
        'preflop_base': {
          current: { 1: 10000, 2: 11000, 3: 11000, 4: 8000, 5: 10000 },
          updated: { 1: 9000, 2: 11000, 3: 8000, 4: 8000, 5: 10000 }
        },
        'preflop_more': {
          current: { 1: 9000, 2: 11000, 3: 8000, 4: 8000, 5: 10000 },
          updated: { 1: 7000, 2: 9000, 3: 8000, 4: 8000, 5: 10000 }
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

      // Expected total contributions:
      // Alice: 1K (base) + 2K (more) = 3K
      // Bob: 1K (posted BB) + 2K (more) = 3K
      // Charlie: 3K (base)
      // Plus: Folded SB (500) + Ante (1000)
      // Total: 3K + 3K + 3K + 1.5K = 10.5K
      expect(potInfo.totalPot).toBe(10500);
    });
  });

  describe('gatherContributions', () => {
    it('should exclude ante from BB contribution', () => {
      const players = createPlayers();
      const playerData: PlayerData = {
        2: { postedBB: 1000, postedAnte: 1000 }
      };

      const contributions = gatherContributions(
        'preflop',
        'base',
        players,
        playerData,
        {},
        {},
        {},
        { bigBlind: 1000, smallBlind: 500, ante: 1000 },
        false
      );

      const bbContribution = contributions.find(c => c.playerName === 'Bob');

      expect(bbContribution).toBeDefined();
      expect(bbContribution!.postedBB).toBe(1000);
      expect(bbContribution!.postedAnte).toBe(1000);
      // Total contributed should be BB only, NOT including ante
      expect(bbContribution!.totalContributed).toBe(1000);
    });
  });

  describe('calculateDeadMoney', () => {
    it('should correctly identify all dead money components', () => {
      const contributions = [
        {
          playerId: 1,
          playerName: 'Alice',
          position: 'UTG',
          totalContributed: 0,
          contributions: { base: 0, more: 0, more2: 0 },
          postedSB: 0,
          postedBB: 0,
          postedAnte: 0,
          isFolded: false,
          isAllIn: false,
          currentStack: 10000
        },
        {
          playerId: 2,
          playerName: 'Bob',
          position: 'BB',
          totalContributed: 1000,
          contributions: { base: 1000, more: 0, more2: 0 },
          postedSB: 0,
          postedBB: 1000,
          postedAnte: 1000,
          isFolded: false,
          isAllIn: false,
          currentStack: 11000
        },
        {
          playerId: 4,
          playerName: 'Jane',
          position: 'SB',
          totalContributed: 500,
          contributions: { base: 500, more: 0, more2: 0 },
          postedSB: 500,
          postedBB: 0,
          postedAnte: 0,
          isFolded: true, // SB folded
          isAllIn: false,
          currentStack: 8000
        }
      ];

      const deadMoney = calculateDeadMoney('preflop', contributions);

      expect(deadMoney.ante).toBe(1000);
      expect(deadMoney.foldedBlinds).toBe(500); // SB folded
      expect(deadMoney.total).toBe(1500);
    });
  });
});
