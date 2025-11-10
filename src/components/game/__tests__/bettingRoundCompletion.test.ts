/**
 * Betting Round Completion - Button State Tests
 *
 * These tests verify that betting round completion is correctly detected across all sections.
 * The button states depend on the `checkBettingRoundComplete()` function, which determines
 * when the "Add More Action" button should be disabled.
 *
 * SECTIONS TESTED:
 * - PreFlop: BASE, More Action 1, More Action 2
 * - Flop: BASE, More Action 1, More Action 2
 * - Turn: BASE, More Action 1, More Action 2
 * - River: BASE, More Action 1, More Action 2
 *
 * BUTTON LOGIC:
 * - "Add More Action" button: DISABLED when round is complete OR at max 3 levels
 * - "Create Next Street" button: ALWAYS ENABLED
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { checkBettingRoundComplete } from '../../../lib/poker/validators/roundCompletionValidator';
import type { Player, PlayerData, Stage, ActionLevel } from '../../../types/poker';

describe('Betting Round Completion - PreFlop', () => {
  let players: Player[];

  beforeEach(() => {
    players = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
      { id: 3, name: 'Charlie', position: 'UTG', stack: 100000 },
    ];
  });

  describe('PreFlop BASE', () => {
    it('should mark round as COMPLETE when all players call BB', () => {
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
    });

    it('should mark round as INCOMPLETE when players have not acted', () => {
      const playerData: PlayerData = {
        1: { postedSB: 500 },
        2: { postedBB: 1000 },
        3: {} // No action
      };

      const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

      expect(result.isComplete).toBe(false);
      expect(result.reason).toContain('pending action');
    });

    it('should mark round as INCOMPLETE when contributions do not match', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          preflopUnit: 'actual'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'raise',
          preflopAmount: '3000',
          preflopUnit: 'actual'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          preflopUnit: 'actual'
        }
      };

      const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

      expect(result.isComplete).toBe(false);
      expect(result.reason).toContain('not matched');
    });

    it('should mark round as COMPLETE when only one player remains', () => {
      const playerData: PlayerData = {
        1: { postedSB: 500, preflopAction: 'fold' },
        2: { postedBB: 1000, preflopAction: 'fold' },
        3: { preflopAction: 'raise', preflopAmount: '3000', preflopUnit: 'actual' }
      };

      const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('Only one active player');
    });

    it('should mark round as COMPLETE when all players all-in', () => {
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
      expect(result.reason).toBe('All players acted and contributions matched');
    });
  });

  describe('PreFlop More Action 1', () => {
    it('should mark round as COMPLETE when all players match raise', () => {
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
      expect(result.reason).toBe('All players acted and contributions matched');
    });

    it('should mark round as INCOMPLETE when player needs to call', () => {
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
          // No More Action 1 action yet
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '3000',
          preflopUnit: 'actual'
          // No More Action 1 action yet
        }
      };

      const result = checkBettingRoundComplete('preflop', 'more', players, playerData);

      expect(result.isComplete).toBe(false);
      expect(result.reason).toContain('pending action');
    });
  });

  describe('PreFlop More Action 2', () => {
    it('should mark round as COMPLETE when all players all-in', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'raise',
          preflopAmount: '3000',
          preflopUnit: 'actual',
          preflop_moreActionAction: 'raise',
          preflop_moreActionAmount: '10000',
          preflop_moreActionUnit: 'actual',
          preflop_moreAction2Action: 'all-in',
          preflop_moreAction2Amount: '100000',
          preflop_moreAction2Unit: 'actual'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'call',
          preflopAmount: '3000',
          preflopUnit: 'actual',
          preflop_moreActionAction: 'call',
          preflop_moreActionAmount: '10000',
          preflop_moreActionUnit: 'actual',
          preflop_moreAction2Action: 'all-in',
          preflop_moreAction2Amount: '100000',
          preflop_moreAction2Unit: 'actual'
        },
        3: {
          preflopAction: 'fold'
        }
      };

      const result = checkBettingRoundComplete('preflop', 'more2', players, playerData);

      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('All players acted and contributions matched');
    });
  });
});

describe('Betting Round Completion - Flop', () => {
  let players: Player[];

  beforeEach(() => {
    players = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
      { id: 3, name: 'Charlie', position: 'UTG', stack: 100000 },
    ];
  });

  describe('Flop BASE', () => {
    it('should mark round as COMPLETE when all players check', () => {
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
    });

    it('should mark round as INCOMPLETE when bet is pending calls', () => {
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
          // No flop action yet
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000'
          // No flop action yet
        }
      };

      const result = checkBettingRoundComplete('flop', 'base', players, playerData);

      expect(result.isComplete).toBe(false);
      expect(result.reason).toContain('pending action');
    });

    it('should mark round as COMPLETE when all players match bet', () => {
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
      expect(result.reason).toBe('All players acted and contributions matched');
    });

    it('should mark round as COMPLETE when only one player remains after folds', () => {
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
    });
  });

  describe('Flop More Action 1', () => {
    it('should mark round as COMPLETE when all players match raise', () => {
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
      expect(result.reason).toBe('All players acted and contributions matched');
    });

    it('should mark round as INCOMPLETE when raise is pending calls', () => {
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
      expect(result.reason).toContain('pending action');
    });
  });

  describe('Flop More Action 2', () => {
    it('should mark round as COMPLETE when all players all-in', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'bet',
          flopAmount: '2000',
          flop_moreActionAction: 'raise',
          flop_moreActionAmount: '10000',
          flop_moreAction2Action: 'all-in',
          flop_moreAction2Amount: '50000'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'fold'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'raise',
          flopAmount: '10000',
          flop_moreActionAction: 'raise',
          flop_moreActionAmount: '30000',
          flop_moreAction2Action: 'all-in',
          flop_moreAction2Amount: '50000'
        }
      };

      const result = checkBettingRoundComplete('flop', 'more2', players, playerData);

      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('All players acted and contributions matched');
    });
  });
});

describe('Betting Round Completion - Turn', () => {
  let players: Player[];

  beforeEach(() => {
    players = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
      { id: 3, name: 'Charlie', position: 'UTG', stack: 100000 },
    ];
  });

  describe('Turn BASE', () => {
    it('should mark round as COMPLETE when all players check', () => {
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
    });

    it('should mark round as INCOMPLETE when bet is pending calls', () => {
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
          // No turn action yet
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check'
          // No turn action yet
        }
      };

      const result = checkBettingRoundComplete('turn', 'base', players, playerData);

      expect(result.isComplete).toBe(false);
      expect(result.reason).toContain('pending action');
    });
  });

  describe('Turn More Action 1', () => {
    it('should mark round as COMPLETE when all players match raise', () => {
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

      // All players matched at 10000 in More Action 1
      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('All players acted and contributions matched');
    });
  });

  describe('Turn More Action 2', () => {
    it('should mark round as COMPLETE when all players all-in', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'bet',
          turnAmount: '3000',
          turn_moreActionAction: 'raise',
          turn_moreActionAmount: '10000',
          turn_moreAction2Action: 'all-in',
          turn_moreAction2Amount: '100000'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'check',
          turnAction: 'raise',
          turnAmount: '10000',
          turn_moreActionAction: 'raise',
          turn_moreActionAmount: '30000',
          turn_moreAction2Action: 'all-in',
          turn_moreAction2Amount: '100000'
        },
        3: {
          preflopAction: 'fold'
        }
      };

      const result = checkBettingRoundComplete('turn', 'more2', players, playerData);

      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('All players acted and contributions matched');
    });
  });
});

describe('Betting Round Completion - River', () => {
  let players: Player[];

  beforeEach(() => {
    players = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
      { id: 3, name: 'Charlie', position: 'UTG', stack: 100000 },
    ];
  });

  describe('River BASE', () => {
    it('should mark round as COMPLETE when all players check', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'check',
          riverAction: 'check'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'check',
          turnAction: 'check',
          riverAction: 'check'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'check',
          riverAction: 'check'
        }
      };

      const result = checkBettingRoundComplete('river', 'base', players, playerData);

      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('All players checked or all-in');
    });

    it('should mark round as INCOMPLETE when value bet is pending calls', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'check',
          riverAction: 'bet',
          riverAmount: '15000'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'check',
          turnAction: 'check'
          // No river action yet
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'check'
          // No river action yet
        }
      };

      const result = checkBettingRoundComplete('river', 'base', players, playerData);

      expect(result.isComplete).toBe(false);
      expect(result.reason).toContain('pending action');
    });
  });

  describe('River More Action 1', () => {
    it('should mark round as COMPLETE when all players match raise', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'check',
          riverAction: 'check',
          river_moreActionAction: 'call',
          river_moreActionAmount: '30000'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'check',
          flopAction: 'check',
          turnAction: 'check',
          riverAction: 'bet',
          riverAmount: '10000',
          river_moreActionAction: 'raise',
          river_moreActionAmount: '30000'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'check',
          turnAction: 'check',
          riverAction: 'call',
          riverAmount: '10000',
          river_moreActionAction: 'call',
          river_moreActionAmount: '30000'
        }
      };

      const result = checkBettingRoundComplete('river', 'more', players, playerData);

      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('All players acted and contributions matched');
    });
  });

  describe('River More Action 2', () => {
    it('should mark round as COMPLETE when heads-up all-in', () => {
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'fold'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'bet',
          flopAmount: '2000',
          turnAction: 'bet',
          turnAmount: '5000',
          riverAction: 'bet',
          riverAmount: '10000',
          river_moreActionAction: 'raise',
          river_moreActionAmount: '30000',
          river_moreAction2Action: 'all-in',
          river_moreAction2Amount: '100000'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '1000',
          flopAction: 'call',
          flopAmount: '2000',
          turnAction: 'call',
          turnAmount: '5000',
          riverAction: 'call',
          riverAmount: '10000',
          river_moreActionAction: 'call',
          river_moreActionAmount: '30000',
          river_moreAction2Action: 'all-in',
          river_moreAction2Amount: '100000'
        }
      };

      const result = checkBettingRoundComplete('river', 'more2', players, playerData);

      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('All players acted and contributions matched');
    });
  });
});

describe('Betting Round Completion - Edge Cases', () => {
  let players: Player[];

  beforeEach(() => {
    players = [
      { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
      { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
      { id: 3, name: 'Charlie', position: 'UTG', stack: 100000 },
    ];
  });

  it('should mark round as COMPLETE when no active players', () => {
    const playerData: PlayerData = {
      1: { postedSB: 500, preflopAction: 'fold' },
      2: { postedBB: 1000, preflopAction: 'fold' },
      3: { preflopAction: 'fold' }
    };

    const result = checkBettingRoundComplete('preflop', 'base', players, playerData);

    expect(result.isComplete).toBe(true);
    expect(result.reason).toBe('No active players');
  });

  it('should mark round as COMPLETE with all-in player not needing to match', () => {
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
    // Alice is all-in with less, Bob and Charlie matched at 10K
    expect(result.reason).toBe('All players acted and contributions matched');
  });

  it('should mark round as INCOMPLETE when all-in player causes side pot but others need to match', () => {
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
    expect(result.reason).toContain('not matched');
  });
});

describe('Betting Round Completion - Cumulative Contribution Tests', () => {
  let players: Player[];

  beforeEach(() => {
    players = [
      { id: 4, name: 'Alice', position: 'UTG', stack: 100000 },
      { id: 5, name: 'Charlie', position: 'UTG+1', stack: 100000 },
      { id: 6, name: 'David', position: 'UTG+2', stack: 100000 },
    ];
  });

  describe('Flop - Players matched in BASE, one calls in MORE', () => {
    it('should mark round as COMPLETE when one player calls to match BASE amount', () => {
      // BASE: Alice bet 1K, Charlie raise 2K, David call 2K
      // MORE: Alice call 2K (matching Charlie's raise from BASE)
      // Result: All at 2K, round complete
      const playerData: PlayerData = {
        4: {
          flopAction: 'bet',
          flopAmount: '1'  // 1K
        },
        5: {
          flopAction: 'raise',
          flopAmount: '2'  // 2K
        },
        6: {
          flopAction: 'call',
          flopAmount: '2'  // 2K
        }
      };

      // Check BASE - should be incomplete (Alice at 1K, others at 2K)
      const baseResult = checkBettingRoundComplete('flop', 'base', players, playerData);
      expect(baseResult.isComplete).toBe(false);
      expect(baseResult.reason).toContain('not matched');

      // Now Alice calls in MORE ACTION 1
      playerData[4].flop_moreActionAction = 'call';
      playerData[4].flop_moreActionAmount = '2';  // 2K total
      playerData[4].flop_moreActionUnit = 'K';

      // Check MORE - should be complete (all at 2K)
      const moreResult = checkBettingRoundComplete('flop', 'more', players, playerData);
      expect(moreResult.isComplete).toBe(true);
      expect(moreResult.reason).toBe('All players acted and contributions matched');
    });

    it('should mark round as INCOMPLETE when one player raises in MORE', () => {
      // BASE: Alice bet 1K, Charlie raise 2K, David call 2K
      // MORE: Alice raise 4K (instead of calling 2K)
      // Result: Incomplete, Charlie and David need to act
      const playerData: PlayerData = {
        4: {
          flopAction: 'bet',
          flopAmount: '1',
          flop_moreActionAction: 'raise',
          flop_moreActionAmount: '4',  // 4K total
          flop_moreActionUnit: 'K'
        },
        5: {
          flopAction: 'raise',
          flopAmount: '2'  // 2K from BASE
        },
        6: {
          flopAction: 'call',
          flopAmount: '2'  // 2K from BASE
        }
      };

      const result = checkBettingRoundComplete('flop', 'more', players, playerData);
      expect(result.isComplete).toBe(false);
      expect(result.reason).toContain('pending action');
    });

    it('should mark round as COMPLETE when all match new raise in MORE', () => {
      // BASE: Alice bet 1K, Charlie raise 2K, David call 2K
      // MORE: Alice raise 4K, Charlie call 4K, David call 4K
      // Result: All at 4K, round complete
      const playerData: PlayerData = {
        4: {
          flopAction: 'bet',
          flopAmount: '1',
          flop_moreActionAction: 'raise',
          flop_moreActionAmount: '4',
          flop_moreActionUnit: 'K'
        },
        5: {
          flopAction: 'raise',
          flopAmount: '2',
          flop_moreActionAction: 'call',
          flop_moreActionAmount: '4',
          flop_moreActionUnit: 'K'
        },
        6: {
          flopAction: 'call',
          flopAmount: '2',
          flop_moreActionAction: 'call',
          flop_moreActionAmount: '4',
          flop_moreActionUnit: 'K'
        }
      };

      const result = checkBettingRoundComplete('flop', 'more', players, playerData);
      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('All players acted and contributions matched');
    });
  });

  describe('Turn - Players matched in BASE and MORE, one calls in MORE2', () => {
    it('should mark round as COMPLETE when one player calls to match MORE amount', () => {
      // BASE: Alice bet 2K, Charlie raise 4K, David call 4K
      // MORE: Alice call 4K (all matched at 4K)
      // MORE2: Charlie raise 8K, Alice call 8K, David hasn't acted yet
      const playerData: PlayerData = {
        4: {
          turnAction: 'bet',
          turnAmount: '2',
          turn_moreActionAction: 'call',
          turn_moreActionAmount: '4',
          turn_moreActionUnit: 'K'
        },
        5: {
          turnAction: 'raise',
          turnAmount: '4',
          turn_moreActionAction: 'none'  // Already matched in BASE
        },
        6: {
          turnAction: 'call',
          turnAmount: '4',
          turn_moreActionAction: 'none'  // Already matched in BASE
        }
      };

      // After Alice calls in MORE, all should be at 4K
      const moreResult = checkBettingRoundComplete('turn', 'more', players, playerData);
      expect(moreResult.isComplete).toBe(true);
      expect(moreResult.reason).toBe('All players acted and contributions matched');

      // Now Charlie raises to 8K in MORE2
      playerData[5].turn_moreAction2Action = 'raise';
      playerData[5].turn_moreAction2Amount = '8';
      playerData[5].turn_moreAction2Unit = 'K';

      // Alice calls 8K in MORE2
      playerData[4].turn_moreAction2Action = 'call';
      playerData[4].turn_moreAction2Amount = '8';
      playerData[4].turn_moreAction2Unit = 'K';

      // David hasn't acted yet - incomplete
      const more2Incomplete = checkBettingRoundComplete('turn', 'more2', players, playerData);
      expect(more2Incomplete.isComplete).toBe(false);
      expect(more2Incomplete.reason).toContain('pending action');

      // David calls 8K in MORE2
      playerData[6].turn_moreAction2Action = 'call';
      playerData[6].turn_moreAction2Amount = '8';
      playerData[6].turn_moreAction2Unit = 'K';

      // Now all matched at 8K - complete
      const more2Complete = checkBettingRoundComplete('turn', 'more2', players, playerData);
      expect(more2Complete.isComplete).toBe(true);
      expect(more2Complete.reason).toBe('All players acted and contributions matched');
    });
  });

  describe('River - Mixed scenarios with folds and all-ins', () => {
    it('should mark round as COMPLETE when player folds in MORE after everyone matched in BASE', () => {
      // BASE: Alice bet 3K, Charlie raise 6K, David call 6K
      // MORE: Alice fold
      // Result: Complete (only Charlie and David remain, both at 6K)
      const playerData: PlayerData = {
        4: {
          riverAction: 'bet',
          riverAmount: '3',
          river_moreActionAction: 'fold'
        },
        5: {
          riverAction: 'raise',
          riverAmount: '6'
        },
        6: {
          riverAction: 'call',
          riverAmount: '6'
        }
      };

      const result = checkBettingRoundComplete('river', 'more', players, playerData);
      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('All players acted and contributions matched');
    });

    it('should mark round as COMPLETE when player goes all-in in MORE', () => {
      // BASE: Alice bet 2K, Charlie raise 4K, David call 4K
      // MORE: Alice all-in 50K, Charlie call 50K, David call 50K
      const playerData: PlayerData = {
        4: {
          riverAction: 'bet',
          riverAmount: '2',
          river_moreActionAction: 'all-in',
          river_moreActionAmount: '50',
          river_moreActionUnit: 'K'
        },
        5: {
          riverAction: 'raise',
          riverAmount: '4',
          river_moreActionAction: 'call',
          river_moreActionAmount: '50',
          river_moreActionUnit: 'K'
        },
        6: {
          riverAction: 'call',
          riverAmount: '4',
          river_moreActionAction: 'call',
          river_moreActionAmount: '50',
          river_moreActionUnit: 'K'
        }
      };

      const result = checkBettingRoundComplete('river', 'more', players, playerData);
      expect(result.isComplete).toBe(true);
      expect(result.reason).toBe('All players acted and contributions matched');
    });
  });

  describe('Preflop - With blinds and cumulative contributions', () => {
    beforeEach(() => {
      players = [
        { id: 1, name: 'Alice', position: 'SB', stack: 100000 },
        { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
        { id: 3, name: 'Charlie', position: 'UTG', stack: 100000 },
      ];
    });

    it('should mark round as COMPLETE when SB calls BB in MORE after raise in BASE', () => {
      // BASE: SB raise 3K, BB call 3K, Charlie call 3K
      // MORE: BB raise 6K, SB needs to call, Charlie needs to call
      const playerData: PlayerData = {
        1: {
          postedSB: 500,
          preflopAction: 'raise',
          preflopAmount: '3',
          preflopUnit: 'K'
        },
        2: {
          postedBB: 1000,
          preflopAction: 'call',
          preflopAmount: '3',
          preflopUnit: 'K'
        },
        3: {
          preflopAction: 'call',
          preflopAmount: '3',
          preflopUnit: 'K'
        }
      };

      // BASE should be complete
      const baseResult = checkBettingRoundComplete('preflop', 'base', players, playerData);
      expect(baseResult.isComplete).toBe(true);

      // BB raises in MORE
      playerData[2].preflop_moreActionAction = 'raise';
      playerData[2].preflop_moreActionAmount = '6';
      playerData[2].preflop_moreActionUnit = 'K';

      // MORE should be incomplete (SB and Charlie need to call)
      const moreIncomplete = checkBettingRoundComplete('preflop', 'more', players, playerData);
      expect(moreIncomplete.isComplete).toBe(false);
      expect(moreIncomplete.reason).toContain('pending action');

      // SB calls
      playerData[1].preflop_moreActionAction = 'call';
      playerData[1].preflop_moreActionAmount = '6';
      playerData[1].preflop_moreActionUnit = 'K';

      // Still incomplete (Charlie needs to call)
      const stillIncomplete = checkBettingRoundComplete('preflop', 'more', players, playerData);
      expect(stillIncomplete.isComplete).toBe(false);
      expect(stillIncomplete.reason).toContain('pending action');

      // Charlie calls
      playerData[3].preflop_moreActionAction = 'call';
      playerData[3].preflop_moreActionAmount = '6';
      playerData[3].preflop_moreActionUnit = 'K';

      // Now complete
      const moreComplete = checkBettingRoundComplete('preflop', 'more', players, playerData);
      expect(moreComplete.isComplete).toBe(true);
      expect(moreComplete.reason).toBe('All players acted and contributions matched');
    });
  });
});
