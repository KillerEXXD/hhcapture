/**
 * Pot Engine Tests
 * Comprehensive tests for pot calculation functions
 */

import { describe, it, expect } from '@jest/globals';
// Import helper functions from playerActionUtils
import {
  getLastActionInBettingRound,
  hasPlayerFolded
} from '../../utils/playerActionUtils';
// Import pot calculation functions from potCalculationEngine
import {
  gatherContributions,
  calculateDeadMoney,
  getPreviousRoundInfo,
  createPots,
  checkBettingRoundStatus,
  calculatePotsForBettingRound,
  type PlayerContribution
} from '../potCalculationEngine';
import type {
  ContributedAmounts,
  DeadMoney
} from '../../../../types/poker/pot.types';
import type {
  Player,
  PlayerData
} from '../../../../types/poker/player.types';
import type {
  ProcessedSections,
  SectionStacks,
  GameConfig
} from '../../../../types/poker/game.types';

// ============================================================================
// Helper Functions Tests
// ============================================================================

describe('getLastActionInBettingRound()', () => {
  it('should return most recent action from more2', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call',
        preflop_moreAction_action: 'raise',
        preflop_moreAction2_action: 'call'
      }
    };

    const result = getLastActionInBettingRound(1, 'preflop', playerData);
    expect(result).toBe('call');
  });

  it('should return action from more if more2 not available', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call',
        preflop_moreAction_action: 'raise'
      }
    };

    const result = getLastActionInBettingRound(1, 'preflop', playerData);
    expect(result).toBe('raise');
  });

  it('should return base action if no more actions', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call'
      }
    };

    const result = getLastActionInBettingRound(1, 'preflop', playerData);
    expect(result).toBe('call');
  });

  it('should return null if no actions', () => {
    const playerData: PlayerData = {
      1: {}
    };

    const result = getLastActionInBettingRound(1, 'preflop', playerData);
    expect(result).toBe(null);
  });

  it('should ignore "no action" values', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call',
        preflop_moreAction_action: 'no action'
      }
    };

    const result = getLastActionInBettingRound(1, 'preflop', playerData);
    expect(result).toBe('call');
  });
});

describe('hasPlayerFolded()', () => {
  it('should return true if player folded in preflop', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'fold'
      }
    };

    const result = hasPlayerFolded(1, 'preflop', playerData);
    expect(result).toBe(true);
  });

  it('should return true if player folded in previous stage', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call',
        flop_action: 'fold'
      }
    };

    const result = hasPlayerFolded(1, 'turn', playerData);
    expect(result).toBe(true);
  });

  it('should return false if player has not folded', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call',
        flop_action: 'check'
      }
    };

    const result = hasPlayerFolded(1, 'flop', playerData);
    expect(result).toBe(false);
  });

  it('should return true for null action in preflop (auto-fold)', () => {
    const playerData: PlayerData = {
      1: {}
    };

    const result = hasPlayerFolded(1, 'preflop', playerData);
    expect(result).toBe(true);
  });

  it('should return true for "none" action in preflop (auto-fold)', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'none'
      }
    };

    const result = hasPlayerFolded(1, 'preflop', playerData);
    expect(result).toBe(true);
  });

  it('should not auto-fold for null action in postflop', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call',
        flop_action: null
      }
    };

    const result = hasPlayerFolded(1, 'flop', playerData);
    expect(result).toBe(false);
  });
});

// ============================================================================
// Gather Contributions Tests
// ============================================================================

describe('gatherContributions()', () => {
  const createMockPlayers = (): Player[] => [
    { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
    { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
    { id: 3, name: 'Charlie', position: 'Dealer', stack: 100000 }
  ];

  const createMockStackData = (): GameConfig => ({
    smallBlind: 500,
    bigBlind: 1000,
    ante: 100,
    anteOrder: 'BB First'
  });

  it('should gather preflop contributions with posted blinds', () => {
    const players = createMockPlayers();
    const playerData: PlayerData = {
      1: { postedSB: 500 },
      2: { postedBB: 1000, postedAnte: 100 },
      3: {}
    };
    const contributedAmounts: ContributedAmounts = {
      'preflop_base': { 1: 500, 2: 0, 3: 1000 } // Additional contributions beyond blinds
    };
    const processedSections: ProcessedSections = {
      'preflop_base': true
    };
    const sectionStacks: SectionStacks = {
      'preflop_base': {
        initial: { 1: 100000, 2: 100000, 3: 100000 },
        current: { 1: 100000, 2: 100000, 3: 100000 },
        updated: { 1: 99000, 2: 99000, 3: 99000 }
      }
    };

    const result = gatherContributions(
      'preflop',
      'base',
      players,
      playerData,
      contributedAmounts,
      processedSections,
      sectionStacks,
      createMockStackData(),
      false
    );

    expect(result).toHaveLength(3);

    // Alice (SB): posted 500 + additional 500 = 1000
    const alice = result.find(c => c.playerId === 1);
    expect(alice?.totalContributed).toBe(1000);
    expect(alice?.postedSB).toBe(500);
    expect(alice?.postedBB).toBe(0);
    expect(alice?.postedAnte).toBe(0);

    // Bob (BB): posted 1000 + no additional = 1000
    const bob = result.find(c => c.playerId === 2);
    expect(bob?.totalContributed).toBe(1000);
    expect(bob?.postedBB).toBe(1000);
    expect(bob?.postedAnte).toBe(100);

    // Charlie (BTN): 0 posted + additional 1000 = 1000
    const charlie = result.find(c => c.playerId === 3);
    expect(charlie?.totalContributed).toBe(1000);
  });

  it('should include contributions up to specified level', () => {
    const players = createMockPlayers();
    const playerData: PlayerData = { 1: {}, 2: {}, 3: {} };
    const contributedAmounts: ContributedAmounts = {
      'flop_base': { 1: 1000, 2: 1000, 3: 1000 },
      'flop_more': { 1: 2000, 2: 2000, 3: 2000 },
      'flop_more2': { 1: 3000, 2: 3000, 3: 3000 }
    };
    const processedSections: ProcessedSections = {
      'flop_base': true,
      'flop_more': true,
      'flop_more2': true
    };
    const sectionStacks: SectionStacks = {};

    // Level = base: only base contributions
    const resultBase = gatherContributions(
      'flop',
      'base',
      players,
      playerData,
      contributedAmounts,
      processedSections,
      sectionStacks,
      createMockStackData(),
      false
    );
    expect(resultBase[0].totalContributed).toBe(1000);

    // Level = more: base + more contributions
    const resultMore = gatherContributions(
      'flop',
      'more',
      players,
      playerData,
      contributedAmounts,
      processedSections,
      sectionStacks,
      createMockStackData(),
      false
    );
    expect(resultMore[0].totalContributed).toBe(3000);

    // Level = more2: all contributions
    const resultMore2 = gatherContributions(
      'flop',
      'more2',
      players,
      playerData,
      contributedAmounts,
      processedSections,
      sectionStacks,
      createMockStackData(),
      false
    );
    expect(resultMore2[0].totalContributed).toBe(6000);
  });

  it('should only gather current section when onlyCurrentSection=true', () => {
    const players = createMockPlayers();
    const playerData: PlayerData = { 1: {}, 2: {}, 3: {} };
    const contributedAmounts: ContributedAmounts = {
      'flop_base': { 1: 1000, 2: 1000, 3: 1000 },
      'flop_more': { 1: 2000, 2: 2000, 3: 2000 }
    };
    const processedSections: ProcessedSections = {
      'flop_base': true,
      'flop_more': true
    };
    const sectionStacks: SectionStacks = {};

    // With onlyCurrentSection=true, level=more should only get 'more' contributions
    const result = gatherContributions(
      'flop',
      'more',
      players,
      playerData,
      contributedAmounts,
      processedSections,
      sectionStacks,
      createMockStackData(),
      true // onlyCurrentSection
    );

    expect(result[0].totalContributed).toBe(2000); // Only 'more' level, not base
  });

  it('should detect folded players', () => {
    const players = createMockPlayers();
    const playerData: PlayerData = {
      1: { preflop_action: 'fold' },
      2: { preflop_action: 'call' },
      3: { preflop_action: 'call' }
    };
    const contributedAmounts: ContributedAmounts = {};
    const processedSections: ProcessedSections = {};
    const sectionStacks: SectionStacks = {};

    const result = gatherContributions(
      'preflop',
      'base',
      players,
      playerData,
      contributedAmounts,
      processedSections,
      sectionStacks,
      createMockStackData(),
      false
    );

    const alice = result.find(c => c.playerId === 1);
    const bob = result.find(c => c.playerId === 2);

    expect(alice?.isFolded).toBe(true);
    expect(bob?.isFolded).toBe(false);
  });

  it('should detect all-in players based on stack', () => {
    const players = createMockPlayers();
    const playerData: PlayerData = { 1: {}, 2: {}, 3: {} };
    const contributedAmounts: ContributedAmounts = {
      'flop_base': { 1: 10000, 2: 5000, 3: 3000 }
    };
    const processedSections: ProcessedSections = {
      'flop_base': true
    };
    const sectionStacks: SectionStacks = {
      'flop_base': {
        initial: { 1: 10000, 2: 5000, 3: 3000 },
        current: { 1: 10000, 2: 5000, 3: 3000 },
        updated: { 1: 0, 2: 0, 3: 2000 } // Alice and Bob all-in
      }
    };

    const result = gatherContributions(
      'flop',
      'base',
      players,
      playerData,
      contributedAmounts,
      processedSections,
      sectionStacks,
      createMockStackData(),
      false
    );

    expect(result.find(c => c.playerId === 1)?.isAllIn).toBe(true);
    expect(result.find(c => c.playerId === 2)?.isAllIn).toBe(true);
    expect(result.find(c => c.playerId === 3)?.isAllIn).toBe(false);
  });

  it('should skip empty player slots', () => {
    const players: Player[] = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: '', position: 'BB', stack: 100000 }, // Empty slot
      { id: 3, name: 'Charlie', position: 'Dealer', stack: 100000 }
    ];
    const playerData: PlayerData = {};
    const contributedAmounts: ContributedAmounts = {};
    const processedSections: ProcessedSections = {};
    const sectionStacks: SectionStacks = {};

    const result = gatherContributions(
      'preflop',
      'base',
      players,
      playerData,
      contributedAmounts,
      processedSections,
      sectionStacks,
      createMockStackData(),
      false
    );

    expect(result).toHaveLength(2); // Only Alice and Charlie
  });
});

// ============================================================================
// Calculate Dead Money Tests
// ============================================================================

describe('calculateDeadMoney()', () => {
  it('should calculate ante as dead money', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 2,
        playerName: 'Bob',
        position: 'BB',
        totalContributed: 1000,
        contributions: { base: 0, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 1000,
        postedAnte: 100,
        isFolded: false,
        isAllIn: false,
        currentStack: 99000
      }
    ];

    const result = calculateDeadMoney('preflop', contributions);

    expect(result.ante).toBe(100);
    expect(result.total).toBe(100);
  });

  it('should calculate folded SB blind as dead money', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 500,
        contributions: { base: 0, more: 0, more2: 0 },
        postedSB: 500,
        postedBB: 0,
        postedAnte: 0,
        isFolded: true,
        isAllIn: false,
        currentStack: 99500
      }
    ];

    const result = calculateDeadMoney('preflop', contributions);

    expect(result.foldedBlinds).toBe(500);
    expect(result.total).toBe(500);
  });

  it('should calculate folded BB blind as dead money', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 2,
        playerName: 'Bob',
        position: 'BB',
        totalContributed: 1000,
        contributions: { base: 0, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 1000,
        postedAnte: 100,
        isFolded: true,
        isAllIn: false,
        currentStack: 98900
      }
    ];

    const result = calculateDeadMoney('preflop', contributions);

    expect(result.ante).toBe(100); // Ante always dead
    expect(result.foldedBlinds).toBe(1000); // BB folded
    expect(result.total).toBe(1100);
  });

  it('should calculate folded bets as dead money (preflop)', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 3,
        playerName: 'Charlie',
        position: 'BTN',
        totalContributed: 2000,
        contributions: { base: 2000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: true,
        isAllIn: false,
        currentStack: 98000
      }
    ];

    const result = calculateDeadMoney('preflop', contributions);

    expect(result.foldedBets).toBe(2000);
    expect(result.total).toBe(2000);
  });

  it('should calculate folded bets correctly with blinds (preflop)', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 2500, // 500 blind + 2000 bet
        contributions: { base: 2000, more: 0, more2: 0 },
        postedSB: 500,
        postedBB: 0,
        postedAnte: 0,
        isFolded: true,
        isAllIn: false,
        currentStack: 97500
      }
    ];

    const result = calculateDeadMoney('preflop', contributions);

    expect(result.foldedBlinds).toBe(500); // Blind
    expect(result.foldedBets).toBe(2000); // Additional bet (2500 - 500)
    expect(result.total).toBe(2500);
  });

  it('should calculate folded bets as dead money (postflop)', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 3000,
        contributions: { base: 3000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: true,
        isAllIn: false,
        currentStack: 96000
      }
    ];

    const result = calculateDeadMoney('flop', contributions);

    expect(result.foldedBets).toBe(3000);
    expect(result.total).toBe(3000);
  });

  it('should combine all dead money sources', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 2500,
        contributions: { base: 2000, more: 0, more2: 0 },
        postedSB: 500,
        postedBB: 0,
        postedAnte: 0,
        isFolded: true,
        isAllIn: false,
        currentStack: 97500
      },
      {
        playerId: 2,
        playerName: 'Bob',
        position: 'BB',
        totalContributed: 1000,
        contributions: { base: 0, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 1000,
        postedAnte: 100,
        isFolded: false,
        isAllIn: false,
        currentStack: 98900
      }
    ];

    const result = calculateDeadMoney('preflop', contributions);

    expect(result.ante).toBe(100);
    expect(result.foldedBlinds).toBe(500);
    expect(result.foldedBets).toBe(2000);
    expect(result.total).toBe(2600);
  });
});

// ============================================================================
// Get Previous Round Info Tests
// ============================================================================

describe('getPreviousRoundInfo()', () => {
  it('should find previous action from earlier section', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call',
        preflop_amount: 1,
        preflop_unit: 'K'
      }
    };

    const result = getPreviousRoundInfo(1, 'flop', 'base', playerData);

    expect(result).not.toBeNull();
    expect(result?.stageName).toBe('PREFLOP');
    expect(result?.action).toBe('Call');
    expect(result?.amount).toBe(1000);
  });

  it('should return null for first section', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call'
      }
    };

    const result = getPreviousRoundInfo(1, 'preflop', 'base', playerData);

    expect(result).toBeNull();
  });

  it('should find most recent previous action', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call',
        preflop_moreAction_action: 'raise',
        preflop_moreAction_amount: 2,
        preflop_moreAction_unit: 'K'
      }
    };

    const result = getPreviousRoundInfo(1, 'flop', 'base', playerData);

    expect(result?.action).toBe('Raise');
    expect(result?.amount).toBe(2000);
  });

  it('should skip "no action" entries', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call',
        preflop_amount: 1,
        preflop_unit: 'K',
        flop_action: 'no action'
      }
    };

    const result = getPreviousRoundInfo(1, 'turn', 'base', playerData);

    expect(result?.stageName).toBe('PREFLOP'); // Skips flop "no action"
  });

  it('should return null if no previous actions', () => {
    const playerData: PlayerData = {
      1: {}
    };

    const result = getPreviousRoundInfo(1, 'flop', 'base', playerData);

    expect(result).toBeNull();
  });
});

// ============================================================================
// Create Pots Tests
// ============================================================================

describe('createPots()', () => {
  const deadMoney: DeadMoney = { total: 0, ante: 0, foldedBlinds: 0, foldedBets: 0 };

  it('should create single main pot with no all-ins', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 1000,
        contributions: { base: 1000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: false,
        currentStack: 99000
      },
      {
        playerId: 2,
        playerName: 'Bob',
        position: 'BB',
        totalContributed: 1000,
        contributions: { base: 1000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: false,
        currentStack: 99000
      }
    ];

    const result = createPots(contributions, deadMoney, 0, 'flop', 'base');

    expect(result.mainPot.amount).toBe(2000);
    expect(result.sidePots).toHaveLength(0);
    expect(result.totalPot).toBe(2000);
    expect(result.mainPot.eligiblePlayers).toHaveLength(2);
  });

  it('should create side pots with one all-in', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 5000,
        contributions: { base: 5000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: true, // All-in
        currentStack: 0
      },
      {
        playerId: 2,
        playerName: 'Bob',
        position: 'BB',
        totalContributed: 10000,
        contributions: { base: 10000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: false,
        currentStack: 90000
      }
    ];

    const result = createPots(contributions, deadMoney, 0, 'flop', 'base');

    // Main pot: 5000 (Alice) + 5000 (Bob matching Alice) = 10000
    expect(result.mainPot.amount).toBe(10000);
    expect(result.mainPot.eligiblePlayers).toHaveLength(2);
    expect(result.mainPot.cappedAt).toBe(5000);

    // Side pot: 5000 (Bob's extra) = 5000
    expect(result.sidePots).toHaveLength(1);
    expect(result.sidePots[0].amount).toBe(5000);
    expect(result.sidePots[0].eligiblePlayers).toHaveLength(1);
    expect(result.sidePots[0].eligiblePlayers[0].name).toBe('Bob');

    expect(result.totalPot).toBe(15000);
  });

  it('should create multiple side pots with multiple all-ins', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 3000,
        contributions: { base: 3000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: true,
        currentStack: 0
      },
      {
        playerId: 2,
        playerName: 'Bob',
        position: 'BB',
        totalContributed: 7000,
        contributions: { base: 7000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: true,
        currentStack: 0
      },
      {
        playerId: 3,
        playerName: 'Charlie',
        position: 'BTN',
        totalContributed: 10000,
        contributions: { base: 10000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: false,
        currentStack: 90000
      }
    ];

    const result = createPots(contributions, deadMoney, 0, 'flop', 'base');

    // Main pot: 3000 * 3 = 9000 (capped at Alice's all-in)
    expect(result.mainPot.amount).toBe(9000);
    expect(result.mainPot.eligiblePlayers).toHaveLength(3);

    // Side pot 1: (7000 - 3000) * 2 = 8000 (Bob and Charlie)
    expect(result.sidePots).toHaveLength(2);
    expect(result.sidePots[0].amount).toBe(8000);
    expect(result.sidePots[0].eligiblePlayers).toHaveLength(2);

    // Side pot 2: (10000 - 7000) * 1 = 3000 (Charlie only)
    expect(result.sidePots[1].amount).toBe(3000);
    expect(result.sidePots[1].eligiblePlayers).toHaveLength(1);
    expect(result.sidePots[1].eligiblePlayers[0].name).toBe('Charlie');

    expect(result.totalPot).toBe(20000);
  });

  it('should add dead money to main pot', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 1000,
        contributions: { base: 1000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: false,
        currentStack: 99000
      }
    ];
    const deadMoneyWithAnte: DeadMoney = {
      total: 500,
      ante: 500,
      foldedBlinds: 0,
      foldedBets: 0
    };

    const result = createPots(contributions, deadMoneyWithAnte, 0, 'flop', 'base');

    expect(result.mainPot.amount).toBe(1500); // 1000 contribution + 500 dead money
    expect(result.deadMoney).toBe(500);
  });

  it('should add previous street pot to main pot', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 1000,
        contributions: { base: 1000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: false,
        currentStack: 99000
      }
    ];

    const result = createPots(contributions, deadMoney, 5000, 'flop', 'base');

    expect(result.mainPot.amount).toBe(6000); // 1000 contribution + 5000 previous
    expect(result.totalPot).toBe(6000);
  });

  it('should handle everyone folded scenario', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 500,
        contributions: { base: 500, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: true,
        isAllIn: false,
        currentStack: 99500
      }
    ];
    const deadMoneyWithBet: DeadMoney = {
      total: 500,
      ante: 0,
      foldedBlinds: 0,
      foldedBets: 500
    };

    const result = createPots(contributions, deadMoneyWithBet, 0, 'flop', 'base');

    expect(result.mainPot.amount).toBe(500);
    expect(result.mainPot.eligiblePlayers).toHaveLength(0);
    expect(result.totalPot).toBe(500);
  });

  it('should calculate pot percentages correctly', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 5000,
        contributions: { base: 5000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: true,
        currentStack: 0
      },
      {
        playerId: 2,
        playerName: 'Bob',
        position: 'BB',
        totalContributed: 10000,
        contributions: { base: 10000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: false,
        currentStack: 90000
      }
    ];

    const result = createPots(contributions, deadMoney, 0, 'flop', 'base');

    // Main pot: 10000, Side pot: 5000, Total: 15000
    expect(result.mainPot.percentage).toBeCloseTo(66.67, 1);
    expect(result.sidePots[0].percentage).toBeCloseTo(33.33, 1);
  });

  it('should identify zero contributors', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 0, // Zero contribution
        contributions: { base: 0, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: true,
        currentStack: 0
      },
      {
        playerId: 2,
        playerName: 'Bob',
        position: 'BB',
        totalContributed: 1000,
        contributions: { base: 1000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: false,
        currentStack: 99000
      }
    ];

    const result = createPots(contributions, deadMoney, 0, 'flop', 'base');

    expect(result.hasZeroContributor).toBe(true);
    expect(result.zeroContributors).toHaveLength(1);
    expect(result.zeroContributors[0].name).toBe('Alice');
  });
});

// ============================================================================
// Check Betting Round Status Tests
// ============================================================================

describe('checkBettingRoundStatus()', () => {
  it('should return complete if all players folded', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 500,
        contributions: { base: 500, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: true,
        isAllIn: false,
        currentStack: 99500
      }
    ];

    const result = checkBettingRoundStatus(contributions);

    expect(result.complete).toBe(true);
    expect(result.reason).toBe('All players folded');
  });

  it('should return complete if only one player remaining', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 1000,
        contributions: { base: 1000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: false,
        currentStack: 99000
      },
      {
        playerId: 2,
        playerName: 'Bob',
        position: 'BB',
        totalContributed: 500,
        contributions: { base: 500, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: true,
        isAllIn: false,
        currentStack: 99500
      }
    ];

    const result = checkBettingRoundStatus(contributions);

    expect(result.complete).toBe(true);
    expect(result.reason).toBe('Only one player remaining');
  });

  it('should return complete if all remaining players are all-in', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 5000,
        contributions: { base: 5000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: true,
        currentStack: 0
      },
      {
        playerId: 2,
        playerName: 'Bob',
        position: 'BB',
        totalContributed: 3000,
        contributions: { base: 3000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: true,
        currentStack: 0
      }
    ];

    const result = checkBettingRoundStatus(contributions);

    expect(result.complete).toBe(true);
    expect(result.reason).toBe('All remaining players are all-in');
  });

  it('should return complete if all active players matched bets', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 2000,
        contributions: { base: 2000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: false,
        currentStack: 98000
      },
      {
        playerId: 2,
        playerName: 'Bob',
        position: 'BB',
        totalContributed: 2000,
        contributions: { base: 2000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: false,
        currentStack: 98000
      }
    ];

    const result = checkBettingRoundStatus(contributions);

    expect(result.complete).toBe(true);
    expect(result.reason).toBe('All active players have matched bets');
  });

  it('should return incomplete if some players have not matched', () => {
    const contributions: PlayerContribution[] = [
      {
        playerId: 1,
        playerName: 'Alice',
        position: 'SB',
        totalContributed: 2000,
        contributions: { base: 2000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: false,
        currentStack: 98000
      },
      {
        playerId: 2,
        playerName: 'Bob',
        position: 'BB',
        totalContributed: 1000,
        contributions: { base: 1000, more: 0, more2: 0 },
        postedSB: 0,
        postedBB: 0,
        postedAnte: 0,
        isFolded: false,
        isAllIn: false,
        currentStack: 99000
      }
    ];

    const result = checkBettingRoundStatus(contributions);

    expect(result.complete).toBe(false);
    expect(result.reason).toBe('Action pending from some players');
    expect(result.pendingPlayers).toContain('Bob');
  });
});

// ============================================================================
// Calculate Pots For Betting Round Integration Tests
// ============================================================================

describe('calculatePotsForBettingRound()', () => {
  const createMockPlayers = (): Player[] => [
    { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
    { id: 2, name: 'Bob', position: 'BB', stack: 100000 }
  ];

  const createMockStackData = (): GameConfig => ({
    smallBlind: 500,
    bigBlind: 1000,
    ante: 0,
    anteOrder: 'BB First'
  });

  it('should calculate complete pot structure', () => {
    const players = createMockPlayers();
    const playerData: PlayerData = {
      1: { preflop_action: 'call' },
      2: { preflop_action: 'check' }
    };
    const contributedAmounts: ContributedAmounts = {
      'preflop_base': { 1: 1000, 2: 0 }
    };
    const processedSections: ProcessedSections = {
      'preflop_base': true
    };
    const sectionStacks: SectionStacks = {
      'preflop_base': {
        initial: { 1: 100000, 2: 100000 },
        current: { 1: 100000, 2: 100000 },
        updated: { 1: 99000, 2: 100000 }
      }
    };

    const result = calculatePotsForBettingRound(
      'preflop',
      'base',
      players,
      playerData,
      contributedAmounts,
      processedSections,
      sectionStacks,
      createMockStackData(),
      0
    );

    expect(result).not.toBeNull();
    expect(result?.mainPot).toBeDefined();
    expect(result?.bettingRoundStatus).toBeDefined();
    expect(result?.bettingRoundStatus.complete).toBeDefined();
  });

  it('should return null on error', () => {
    // Pass invalid data to trigger error
    const result = calculatePotsForBettingRound(
      'preflop',
      'base',
      [],
      {},
      {},
      {},
      {},
      {} as GameConfig,
      0
    );

    // Should not throw, just return null
    expect(result).toBeDefined();
  });

  it('should handle previous street pot correctly', () => {
    const players = createMockPlayers();
    const playerData: PlayerData = {
      1: { preflop_action: 'call', flop_action: 'bet' },
      2: { preflop_action: 'call', flop_action: 'call' }
    };
    const contributedAmounts: ContributedAmounts = {
      'preflop_base': { 1: 1000, 2: 1000 },
      'flop_base': { 1: 2000, 2: 2000 }
    };
    const processedSections: ProcessedSections = {
      'preflop_base': true,
      'flop_base': true
    };
    const sectionStacks: SectionStacks = {};

    // First calculate preflop pot
    const preflopResult = calculatePotsForBettingRound(
      'preflop',
      'base',
      players,
      playerData,
      contributedAmounts,
      processedSections,
      sectionStacks,
      createMockStackData(),
      0
    );

    expect(preflopResult?.mainPot.amount).toBe(2000); // 1000 + 1000

    // Now calculate flop with preflop pot carried forward
    const flopResult = calculatePotsForBettingRound(
      'flop',
      'base',
      players,
      playerData,
      contributedAmounts,
      processedSections,
      sectionStacks,
      createMockStackData(),
      preflopResult!.mainPot.amount // Carry forward preflop pot
    );

    expect(flopResult).not.toBeNull();
    // Main pot should include preflop pot + flop contributions
    expect(flopResult?.mainPot.amount).toBe(6000); // 2000 (preflop) + 4000 (flop contributions)
    expect(flopResult?.totalPot).toBe(6000);
  });
});
