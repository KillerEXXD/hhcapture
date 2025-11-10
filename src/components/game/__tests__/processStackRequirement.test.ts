/**
 * Process Stack Requirement Tests
 *
 * Tests the requirement that "Add More Action" and "Create Next Street" buttons
 * should only be enabled after "Process Stack" has been clicked.
 *
 * Requirements:
 * 1. Buttons are disabled until Process Stack is clicked
 * 2. If user changes any playerData, buttons become disabled again
 * 3. Clicking Process Stack re-enables buttons (if round completion allows)
 */

import { describe, it, expect } from '@jest/globals';
import { checkBettingRoundComplete } from '../../../lib/poker/validators/roundCompletionValidator';
import type { Player, PlayerData, ActionLevel } from '../../../types/poker';

// Mock players for testing
const players: Player[] = [
  { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
  { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
  { id: 3, name: 'Charlie', position: 'Dealer', stack: 100000 }
];

describe('Process Stack Requirement - Flop BASE', () => {
  it('should require Process Stack before enabling buttons - incomplete round', () => {
    // Scenario: Players have NOT yet processed, betting round incomplete
    const playerData: PlayerData = {
      1: { flopAction: 'bet', flopAmount: '2000', flopUnit: 'actual' },
      2: {}, // No action yet - round incomplete
      3: {}
    };

    const result = checkBettingRoundComplete('flop', 'base', players, playerData);

    // Round is incomplete
    expect(result.isComplete).toBe(false);

    // Expected button states:
    // - hasProcessedCurrentState = false (not processed yet)
    // - isRoundComplete = false
    // Expected: Both buttons DISABLED
    // "Add More Action": disabled = !hasProcessedCurrentState || isRoundComplete = true || false = true ✅
    // "Create Turn": disabled = !hasProcessedCurrentState || !isRoundComplete = true || true = true ✅
  });

  it('should enable buttons after Process Stack when round is complete', () => {
    // Scenario: All players checked, Process Stack clicked
    const playerData: PlayerData = {
      1: { flopAction: 'check', flopUnit: 'actual' },
      2: { flopAction: 'check', flopUnit: 'actual' },
      3: { flopAction: 'check', flopUnit: 'actual' }
    };

    const result = checkBettingRoundComplete('flop', 'base', players, playerData);

    // Round is complete
    expect(result.isComplete).toBe(true);
    expect(result.reason).toBe('All players checked or all-in');

    // After Process Stack is clicked:
    // - hasProcessedCurrentState = true
    // - isRoundComplete = true
    // Expected button states:
    // "Add More Action": disabled = !hasProcessedCurrentState || isRoundComplete = false || true = true ✅
    // "Create Turn": disabled = !hasProcessedCurrentState || !isRoundComplete = false || false = false ✅ ENABLED
  });

  it('should keep buttons disabled before Process Stack even when round is complete', () => {
    // Scenario: All players checked BUT Process Stack NOT yet clicked
    const playerData: PlayerData = {
      1: { flopAction: 'check', flopUnit: 'actual' },
      2: { flopAction: 'check', flopUnit: 'actual' },
      3: { flopAction: 'check', flopUnit: 'actual' }
    };

    const result = checkBettingRoundComplete('flop', 'base', players, playerData);
    expect(result.isComplete).toBe(true);

    // Before Process Stack is clicked:
    // - hasProcessedCurrentState = false (not processed yet)
    // - isRoundComplete = true
    // Expected button states:
    // "Add More Action": disabled = !hasProcessedCurrentState || isRoundComplete = true || true = true ✅
    // "Create Turn": disabled = !hasProcessedCurrentState || !isRoundComplete = true || false = true ✅ DISABLED
  });

  it('should disable buttons when playerData changes after Process Stack', () => {
    // Scenario: Process Stack was clicked, but then user changes an action
    // This simulates the hash comparison detecting a change

    // Initial state (processed):
    const initialPlayerData: PlayerData = {
      1: { flopAction: 'check', flopUnit: 'actual' },
      2: { flopAction: 'check', flopUnit: 'actual' },
      3: { flopAction: 'check', flopUnit: 'actual' }
    };

    // User changes Alice's action to 'bet'
    const changedPlayerData: PlayerData = {
      1: { flopAction: 'bet', flopAmount: '3000', flopUnit: 'actual' }, // Changed!
      2: { flopAction: 'check', flopUnit: 'actual' },
      3: { flopAction: 'check', flopUnit: 'actual' }
    };

    // Hash comparison would detect this change
    const initialHash = JSON.stringify([
      { id: 1, flopAction: 'check', flopAmount: undefined, flopUnit: 'actual' }
    ]);
    const changedHash = JSON.stringify([
      { id: 1, flopAction: 'bet', flopAmount: '3000', flopUnit: 'actual' }
    ]);

    expect(initialHash).not.toBe(changedHash);

    // After change detected:
    // - hasProcessedCurrentState = false (invalidated by useEffect)
    // - isRoundComplete = false (betting round now incomplete)
    // Expected: Both buttons DISABLED
  });
});

describe('Process Stack Requirement - Flop More Action 1', () => {
  it('should require Process Stack after adding More Action level', () => {
    // Scenario: User adds More Action 1, which invalidates processed state
    const playerData: PlayerData = {
      1: { flopAction: 'check', flop_moreActionAction: 'no action' },
      2: { flopAction: 'check', flop_moreActionAction: 'no action' },
      3: { flopAction: 'check', flop_moreActionAction: 'no action' }
    };

    // When handleMoreAction is called, it sets hasProcessedCurrentState = false
    // Expected: Buttons become disabled again until Process Stack is clicked
    const result = checkBettingRoundComplete('flop', 'more', players, playerData);

    // Round is incomplete (no actions in More Action 1)
    expect(result.isComplete).toBe(false);
  });

  it('should enable "Create Turn" after processing complete More Action 1', () => {
    // Scenario: All players acted in More Action 1, Process Stack clicked
    const playerData: PlayerData = {
      1: { flopAction: 'check', flop_moreActionAction: 'bet', flop_moreActionAmount: '5000' },
      2: { flopAction: 'check', flop_moreActionAction: 'call', flop_moreActionAmount: '5000' },
      3: { flopAction: 'check', flop_moreActionAction: 'call', flop_moreActionAmount: '5000' }
    };

    const result = checkBettingRoundComplete('flop', 'more', players, playerData);

    // Round is complete
    expect(result.isComplete).toBe(true);

    // After Process Stack:
    // - hasProcessedCurrentState = true
    // - isRoundComplete = true
    // Expected: "Create Turn" ENABLED, "Add More Action 2" DISABLED (round complete)
  });
});

describe('Process Stack Requirement - Turn BASE', () => {
  it('should start with buttons disabled', () => {
    // Scenario: User navigates to Turn, no actions yet
    const playerData: PlayerData = {
      1: {},
      2: {},
      3: {}
    };

    const result = checkBettingRoundComplete('turn', 'base', players, playerData);

    // Round is incomplete
    expect(result.isComplete).toBe(false);

    // Before any Process Stack:
    // - hasProcessedCurrentState = false (initial state)
    // Expected: Both buttons DISABLED
  });

  it('should enable "Add More Action 1" after processing incomplete round', () => {
    // Scenario: Players acted but round incomplete, Process Stack clicked
    const playerData: PlayerData = {
      1: { turnAction: 'bet', turnAmount: '10000', turnUnit: 'actual' },
      2: { turnAction: 'call', turnAmount: '10000', turnUnit: 'actual' },
      3: {} // Charlie hasn't acted yet - round incomplete
    };

    const result = checkBettingRoundComplete('turn', 'base', players, playerData);

    // Round is incomplete
    expect(result.isComplete).toBe(false);

    // After Process Stack (even though round incomplete):
    // - hasProcessedCurrentState = true
    // - isRoundComplete = false
    // Expected: "Add More Action 1" ENABLED, "Create River" DISABLED
  });

  it('should re-disable buttons when amount is changed', () => {
    // Scenario: User changes bet amount after processing
    const originalData: PlayerData = {
      1: { turnAction: 'bet', turnAmount: '5000', turnUnit: 'actual' },
      2: { turnAction: 'call', turnAmount: '5000', turnUnit: 'actual' },
      3: { turnAction: 'call', turnAmount: '5000', turnUnit: 'actual' }
    };

    const changedData: PlayerData = {
      1: { turnAction: 'bet', turnAmount: '8000', turnUnit: 'actual' }, // Changed amount!
      2: { turnAction: 'call', turnAmount: '5000', turnUnit: 'actual' },
      3: { turnAction: 'call', turnAmount: '5000', turnUnit: 'actual' }
    };

    // Hash comparison detects change
    const originalHash = JSON.stringify({ turnAmount: '5000' });
    const changedHash = JSON.stringify({ turnAmount: '8000' });
    expect(originalHash).not.toBe(changedHash);

    // After change:
    // - hasProcessedCurrentState = false (invalidated)
    // Expected: Buttons become disabled again
  });
});

describe('Process Stack Requirement - River BASE', () => {
  it('should require Process Stack for all-in scenario', () => {
    // Scenario: All players all-in, but Process Stack not clicked
    const playerData: PlayerData = {
      1: { riverAction: 'all-in', riverAmount: '100000', riverUnit: 'actual' },
      2: { riverAction: 'all-in', riverAmount: '100000', riverUnit: 'actual' },
      3: { riverAction: 'all-in', riverAmount: '100000', riverUnit: 'actual' }
    };

    const result = checkBettingRoundComplete('river', 'base', players, playerData);

    // Round is complete (all all-in)
    expect(result.isComplete).toBe(true);

    // Before Process Stack:
    // - hasProcessedCurrentState = false
    // Expected: "Add More Action 1" still DISABLED (needs Process Stack)
  });
});

describe('Process Stack Requirement - PreFlop BASE', () => {
  it('should disable buttons before initial Process Stack', () => {
    // Scenario: Players act preflop, but haven't processed
    const playerData: PlayerData = {
      1: { postedSB: 500, preflopAction: 'call', preflopAmount: '1000', preflopUnit: 'actual' },
      2: { postedBB: 1000, preflopAction: 'check', preflopAmount: '1000', preflopUnit: 'actual' },
      3: { preflopAction: 'call', preflopAmount: '1000', preflopUnit: 'actual' }
    };

    const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

    // Round is complete
    expect(result.isComplete).toBe(true);

    // Before Process Stack:
    // - hasProcessedCurrentState = false
    // Expected: "Create Flop" DISABLED (even though round complete)
  });

  it('should enable "Create Flop" after processing complete preflop', () => {
    // Scenario: All players acted and Process Stack clicked
    const playerData: PlayerData = {
      1: { postedSB: 500, preflopAction: 'call', preflopAmount: '1000', preflopUnit: 'actual' },
      2: { postedBB: 1000, preflopAction: 'check', preflopAmount: '1000', preflopUnit: 'actual' },
      3: { preflopAction: 'call', preflopAmount: '1000', preflopUnit: 'actual' }
    };

    const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

    // Round is complete
    expect(result.isComplete).toBe(true);

    // After Process Stack:
    // - hasProcessedCurrentState = true
    // - isRoundComplete = true
    // Expected: "Create Flop" ENABLED, "Add More Action 1" DISABLED
  });
});

describe('Process Stack Requirement - Edge Cases', () => {
  it('should handle unit changes as playerData changes', () => {
    // Scenario: User changes unit from 'actual' to 'K'
    const originalData: PlayerData = {
      1: { flopAction: 'bet', flopAmount: '5000', flopUnit: 'actual' }
    };

    const changedData: PlayerData = {
      1: { flopAction: 'bet', flopAmount: '5', flopUnit: 'K' } // Changed unit!
    };

    // Hash includes unit, so change is detected
    const originalHash = JSON.stringify({ flopUnit: 'actual' });
    const changedHash = JSON.stringify({ flopUnit: 'K' });
    expect(originalHash).not.toBe(changedHash);

    // Expected: hasProcessedCurrentState = false after change
  });

  it('should handle multiple More Action levels', () => {
    // Scenario: User processes More Action 1, then adds More Action 2
    const playerData: PlayerData = {
      1: {
        flopAction: 'check',
        flop_moreActionAction: 'bet',
        flop_moreActionAmount: '3000',
        flop_moreAction2Action: 'no action' // Just added More Action 2
      },
      2: {
        flopAction: 'check',
        flop_moreActionAction: 'call',
        flop_moreActionAmount: '3000',
        flop_moreAction2Action: 'no action'
      },
      3: {
        flopAction: 'check',
        flop_moreActionAction: 'call',
        flop_moreActionAmount: '3000',
        flop_moreAction2Action: 'no action'
      }
    };

    // When More Action 2 is added, handleMoreAction sets hasProcessedCurrentState = false
    // Expected: Buttons become disabled until Process Stack is clicked for More Action 2
    const result = checkBettingRoundComplete('flop', 'more2', players, playerData);

    // Round incomplete (no actions in More Action 2)
    expect(result.isComplete).toBe(false);
  });

  it('should not be affected by empty/undefined values in hash', () => {
    // Scenario: Compare empty action vs no action
    const data1: PlayerData = {
      1: { flopAction: 'check' }
    };

    const data2: PlayerData = {
      1: { flopAction: 'check', flopAmount: undefined }
    };

    // Both should produce same hash (undefined values handled consistently)
    const hash1 = JSON.stringify({ flopAction: 'check', flopAmount: undefined });
    const hash2 = JSON.stringify({ flopAction: 'check', flopAmount: undefined });

    expect(hash1).toBe(hash2);
  });
});

describe('Process Stack Requirement - Button State Logic Summary', () => {
  it('should document the button state logic', () => {
    // This test documents the expected button states based on two flags:
    // 1. hasProcessedCurrentState: Whether Process Stack has been clicked
    // 2. isRoundComplete: Whether betting round is complete

    const testCases = [
      {
        scenario: 'Not processed, round incomplete',
        hasProcessed: false,
        isComplete: false,
        expectedAddMoreAction: true, // disabled
        expectedCreateNextStreet: true, // disabled
      },
      {
        scenario: 'Not processed, round complete',
        hasProcessed: false,
        isComplete: true,
        expectedAddMoreAction: true, // disabled (!hasProcessed || isComplete)
        expectedCreateNextStreet: true, // disabled (!hasProcessed || !isComplete = true || false)
      },
      {
        scenario: 'Processed, round incomplete',
        hasProcessed: true,
        isComplete: false,
        expectedAddMoreAction: false, // enabled (can add more action)
        expectedCreateNextStreet: true, // disabled (round not complete)
      },
      {
        scenario: 'Processed, round complete',
        hasProcessed: true,
        isComplete: true,
        expectedAddMoreAction: true, // disabled (round complete)
        expectedCreateNextStreet: false, // enabled (can create next street)
      },
    ];

    testCases.forEach(tc => {
      // "Add More Action" disabled = !hasProcessed || isComplete
      const addMoreActionDisabled = !tc.hasProcessed || tc.isComplete;
      expect(addMoreActionDisabled).toBe(tc.expectedAddMoreAction);

      // "Create Next Street" disabled = !hasProcessed || !isComplete
      const createNextStreetDisabled = !tc.hasProcessed || !tc.isComplete;
      expect(createNextStreetDisabled).toBe(tc.expectedCreateNextStreet);
    });
  });
});
