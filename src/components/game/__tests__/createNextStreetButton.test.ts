/**
 * Create Next Street Button - State Tests
 *
 * These tests verify that the "Create Next Street" button is correctly enabled/disabled
 * based on betting round completion status.
 *
 * RULE: The "Create Next Street" button should be:
 * - DISABLED when the betting round is INCOMPLETE (players haven't finished acting)
 * - ENABLED when the betting round is COMPLETE (all players acted and contributions matched)
 *
 * This ensures users can only advance to the next street when the current betting round is finished.
 *
 * BUTTONS TESTED:
 * - PreFlop: "Create Flop" button
 * - Flop: "Create Turn" button
 * - Turn: "Create River" button
 * - River: No next street (final street)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { checkBettingRoundComplete } from '../../../lib/poker/validators/roundCompletionValidator';
import type { Player, PlayerData } from '../../../types/poker';

/**
 * BUTTON STATE LOGIC:
 *
 * In each view component (PreFlopView, FlopView, TurnView):
 *
 * ```typescript
 * const [isCreateNextStreetDisabled, setIsCreateNextStreetDisabled] = useState(true);
 *
 * React.useEffect(() => {
 *   const isRoundComplete = checkBettingRoundComplete(stage, level, players, playerData);
 *   setIsCreateNextStreetDisabled(!isRoundComplete.isComplete);
 * }, [playerData, visibleActionLevels, players]);
 * ```
 *
 * Button render:
 * ```typescript
 * <button disabled={isCreateNextStreetDisabled}>
 *   Create Next Street
 * </button>
 * ```
 */

describe('Create Next Street Button - PreFlop', () => {
  let players: Player[];

  beforeEach(() => {
    players = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
      { id: 3, name: 'Charlie', position: 'UTG', stack: 100000 },
    ];
  });

  describe('"Create Flop" Button States', () => {
    it('should be DISABLED when PreFlop BASE is incomplete', () => {
      const playerData: PlayerData = {
        1: { postedSB: 500 },
        2: { postedBB: 1000 },
        3: {} // No action - round incomplete
      };

      const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

      expect(result.isComplete).toBe(false);
      // Button should be disabled (isCreateNextStreetDisabled = true)
    });

    it('should be ENABLED when PreFlop BASE is complete', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          preflopUnit: 'actual'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          preflopAmount: '1000',
          preflopUnit: 'actual'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          preflopUnit: 'actual'
        }
      };

      const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('All players acted and contributions matched');
      // Button should be enabled (isCreateNextStreetDisabled = false)
    });

    it('should be DISABLED when PreFlop More Action 1 is incomplete', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'raise',
          preflopAmount: '3000',
          preflopUnit: 'actual',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '10000',
          preflop_moreActionUnit: 'actual'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'call',
          preflopAmount: '3000',
          preflopUnit: 'actual'
          // No More Action 1 - incomplete
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '3000',
          preflopUnit: 'actual'
          // No More Action 1 - incomplete
        }
      };

      const result = checkBettingRoundComplete('preflop', 'more', players, playerData);

      expect(result.isComplete).toBe(false);
      expect(result.reason).toContain('pending action');
      // Button should be disabled
    });

    it('should be ENABLED when PreFlop More Action 1 is complete', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'raise',
          preflopAmount: '3000',
          preflopUnit: 'actual',
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: '5000',
          preflop_moreActionUnit: 'actual'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'call',
          preflopAmount: '3000',
          preflopUnit: 'actual',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '5000',
          preflop_moreActionUnit: 'actual'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '3000',
          preflopUnit: 'actual',
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: '5000',
          preflop_moreActionUnit: 'actual'
        }
      };

      const result = checkBettingRoundComplete('preflop', 'more', players, playerData);

      expect(result.isComplete).toBe(true);
      // Button should be enabled
    });

    it('should be ENABLED when only one player remains (others folded)', () => {
      const playerData: PlayerData = {
        1: { postedSB: 500, preflopAction: 'fold' },
        2: { postedBB: 1000, preflopAction: 'fold' },
        3: { preflopAction: 'raise', preflopAmount: '3000', preflopUnit: 'actual' }
      };

      const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('Only one active player');
      // Button should be enabled - hand is over
    });

    it('should be ENABLED when all players are all-in', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'all-in',
          preflopAmount: '100000',
          preflopUnit: 'actual'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'all-in',
          preflopAmount: '100000',
          preflopUnit: 'actual'
        },
        3: {
          preflopAction: 'all-in',
          preflopAmount: '100000',
          preflopUnit: 'actual'
        }
      };

      const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

      expect(result.isComplete).toBe(true);
      // Button should be enabled - can proceed to run out board
    });
  });
});

describe('Create Next Street Button - Flop', () => {
  let players: Player[];

  beforeEach(() => {
    players = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
      { id: 3, name: 'Charlie', position: 'UTG', stack: 100000 },
    ];
  });

  describe('"Create Turn" Button States', () => {
    it('should be DISABLED when Flop BASE is incomplete', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'bet',
          flopAmount: '2000'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check'
          // No flop action - incomplete
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000'
          // No flop action - incomplete
        }
      };

      const result = checkBettingRoundComplete('flop', 'base', players, playerData);

      expect(result.isComplete).toBe(false);
      expect(result.reason).toContain('pending action');
      // Button should be disabled
    });

    it('should be ENABLED when Flop BASE is complete (all checked)', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'check'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check'
        }
      };

      const result = checkBettingRoundComplete('flop', 'base', players, playerData);

      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('All players checked or all-in');
      // Button should be enabled
    });

    it('should be ENABLED when Flop BASE is complete (all matched bet)', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'bet',
          flopAmount: '2000'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'call',
          flopAmount: '2000'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'call',
          flopAmount: '2000'
        }
      };

      const result = checkBettingRoundComplete('flop', 'base', players, playerData);

      expect(result.isComplete).toBe(true);
      // Button should be enabled
    });

    it('should be DISABLED when Flop More Action 1 has pending calls', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'bet',
          flopAmount: '2000',
          flop_moreActionAction: 'raise',
          flop_moreActionAmount: '6000'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'call',
          flopAmount: '2000'
          // No More Action yet
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'raise',
          flopAmount: '6000'
          // No More Action yet
        }
      };

      const result = checkBettingRoundComplete('flop', 'more', players, playerData);

      expect(result.isComplete).toBe(false);
      // Button should be disabled
    });

    it('should be ENABLED when Flop More Action 1 is complete', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'bet',
          flopAmount: '2000',
          flop_moreActionAction: 'raise',
          flop_moreActionAmount: '6000'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'call',
          flopAmount: '2000',
          flop_moreActionAction: 'call',
          flop_moreActionAmount: '6000'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'raise',
          flopAmount: '6000',
          flop_moreActionAction: 'call',
          flop_moreActionAmount: '6000'
        }
      };

      const result = checkBettingRoundComplete('flop', 'more', players, playerData);

      expect(result.isComplete).toBe(true);
      // Button should be enabled
    });

    it('should be ENABLED when only one player remains after folds', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'bet',
          flopAmount: '5000'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'fold'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'fold'
        }
      };

      const result = checkBettingRoundComplete('flop', 'base', players, playerData);

      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('Only one active player');
      // Button should be enabled - hand is over
    });
  });
});

describe('Create Next Street Button - Turn', () => {
  let players: Player[];

  beforeEach(() => {
    players = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
      { id: 3, name: 'Charlie', position: 'UTG', stack: 100000 },
    ];
  });

  describe('"Create River" Button States', () => {
    it('should be DISABLED when Turn BASE is incomplete', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'bet',
          turnAmount: '3000'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'check'
          // No turn action - incomplete
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check'
          // No turn action - incomplete
        }
      };

      const result = checkBettingRoundComplete('turn', 'base', players, playerData);

      expect(result.isComplete).toBe(false);
      expect(result.reason).toContain('pending action');
      // Button should be disabled
    });

    it('should be ENABLED when Turn BASE is complete (all checked)', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'check'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'check',
          turnAction: 'check'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'check'
        }
      };

      const result = checkBettingRoundComplete('turn', 'base', players, playerData);

      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('All players checked or all-in');
      // Button should be enabled
    });

    it('should be DISABLED when Turn More Action 1 has pending calls', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'check',
          turn_moreActionAction: 'call',
          turn_moreActionAmount: '10000'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'check',
          turnAction: 'bet',
          turnAmount: '5000',
          turn_moreActionAction: 'raise',
          turn_moreActionAmount: '10000'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'call',
          turnAmount: '5000'
          // No More Action yet - incomplete
        }
      };

      const result = checkBettingRoundComplete('turn', 'more', players, playerData);

      expect(result.isComplete).toBe(false);
      // Button should be disabled
    });

    it('should be ENABLED when Turn More Action 1 is complete', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'check',
          turn_moreActionAction: 'call',
          turn_moreActionAmount: '10000'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'check',
          turnAction: 'bet',
          turnAmount: '5000',
          turn_moreActionAction: 'raise',
          turn_moreActionAmount: '10000'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'call',
          turnAmount: '5000',
          turn_moreActionAction: 'call',
          turn_moreActionAmount: '10000'
        }
      };

      const result = checkBettingRoundComplete('turn', 'more', players, playerData);

      expect(result.isComplete).toBe(true);
      // Button should be enabled
    });

    it('should be ENABLED when all players are all-in', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'all-in',
          turnAmount: '50000'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'check',
          turnAction: 'all-in',
          turnAmount: '50000'
        },
        3: {
          preflopAction: 'fold'
        }
      };

      const result = checkBettingRoundComplete('turn', 'base', players, playerData);

      expect(result.isComplete).toBe(true);
      // Button should be enabled - can run out river
    });
  });
});

describe('Create Next Street Button - Edge Cases', () => {
  let players: Player[];

  beforeEach(() => {
    players = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
      { id: 3, name: 'Charlie', position: 'UTG', stack: 100000 },
    ];
  });

  it('should be ENABLED when contributions mismatch but one player all-in with less', () => {
    const playerData: PlayerData = {
      1: {
        postedSB: 500,
        preflopAction: 'all-in',
        preflopAmount: '5000', // Smaller stack
        preflopUnit: 'actual'
      },
      2: {
        postedBB: 1000,
        preflopAction: 'raise',
        preflopAmount: '10000',
        preflopUnit: 'actual'
      },
      3: {
        preflopAction: 'call',
        preflopAmount: '10000',
        preflopUnit: 'actual'
      }
    };

    const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

    expect(result.isComplete).toBe(true);
    // Alice all-in with less, Bob and Charlie matched at 10K - round complete
    // Button should be enabled
  });

  it('should be DISABLED when side pot exists and players need to match', () => {
    const playerData: PlayerData = {
      1: {
        postedSB: 500,
        preflopAction: 'all-in',
        preflopAmount: '5000',
        preflopUnit: 'actual'
      },
      2: {
        postedBB: 1000,
        preflopAction: 'raise',
        preflopAmount: '10000',
        preflopUnit: 'actual'
      },
      3: {
        preflopAction: 'call',
        preflopAmount: '5000', // Only called to Alice's all-in
        preflopUnit: 'actual'
      }
    };

    const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

    expect(result.isComplete).toBe(false);
    // Charlie needs to match Bob's 10K or fold
    // Button should be disabled
  });

  it('should be ENABLED when no active players remain', () => {
    const playerData: PlayerData = {
      1: { postedSB: 500, preflopAction: 'fold' },
      2: { postedBB: 1000, preflopAction: 'fold' },
      3: { preflopAction: 'fold' }
    };

    const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

    expect(result.isComplete).toBe(true);
    expect(result.reason).toBe('No active players');
    // Button should be enabled - hand is over
  });

  it('should be DISABLED when initial state (no actions)', () => {
    const playerData: PlayerData = {
      1: { postedSB: 500 },
      2: { postedBB: 1000 },
      3: {}
    };

    const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

    expect(result.isComplete).toBe(false);
    // Button should be disabled - round not started
  });
});

describe('Button State Summary', () => {
  /**
   * SUMMARY: Button State Logic
   *
   * The "Create Next Street" button state is controlled by betting round completion:
   *
   * 1. When round is INCOMPLETE:
   *    - "Create Next Street" button: DISABLED
   *    - "Add More Action" button: ENABLED (if not at max 3 levels)
   *
   * 2. When round is COMPLETE:
   *    - "Create Next Street" button: ENABLED
   *    - "Add More Action" button: DISABLED
   *
   * This ensures:
   * - Users must finish the current betting round before advancing to next street
   * - Users can only add more betting rounds when current round is incomplete
   * - Natural poker flow is enforced (complete betting before dealing next card)
   */

  it('should document button state relationship', () => {
    const players: Player[] = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
      { id: 3, name: 'Charlie', position: 'UTG', stack: 100000 },
    ];

    // Example: Round incomplete
    const incompleteData: PlayerData = {
      1: { postedSB: 500 },
      2: { postedBB: 1000 },
      3: {}
    };
    const incompleteResult = checkBettingRoundComplete('preflop', 'base', players, incompleteData);
    expect(incompleteResult.isComplete).toBe(false);
    // isCreateNextStreetDisabled = true (button DISABLED)
    // isAddMoreActionDisabled = false (button ENABLED)

    // Example: Round complete
    const completeData: PlayerData = {
      1: { postedSB: 500, preflopAction: 'call', preflopAmount: '1000', preflopUnit: 'actual' },
      2: { postedBB: 1000, preflopAction: 'check', preflopAmount: '1000', preflopUnit: 'actual' },
      3: { preflopAction: 'call', preflopAmount: '1000', preflopUnit: 'actual' }
    };
    const completeResult = checkBettingRoundComplete('preflop', 'base', players, completeData);
    expect(completeResult.isComplete).toBe(true);
    // isCreateNextStreetDisabled = false (button ENABLED)
    // isAddMoreActionDisabled = true (button DISABLED)
  });
});
