/**
 * Validator Tests
 *
 * Comprehensive tests for all validator functions:
 * - Section validation (cards, amounts, raise progression)
 * - Preflop validation (auto-fold logic)
 * - Community card validation (flop/turn/river requirements)
 */

import { describe, it, expect } from 'vitest';
import {
  validateSectionBeforeProcessing,
  hasValidCards,
  validatePreFlopBase,
  autoFoldNoActionPlayersInPreflopBase,
  hasPlayerFolded,
  getFoldedPlayers,
  validateCommunityCards,
  getSelectedCards,
  isCardAvailable,
  areAllSuitsTaken,
  type CommunityCards
} from '../index';
import type { Player, PlayerData, Card, Position, Rank, Suit } from '../../../../types/poker';

// ============================================================================
// Mock Data Helpers
// ============================================================================

function createMockPlayer(id: number, name: string, position: string, stack: number = 100000): Player {
  return {
    id,
    name,
    position: position as Position,
    stack
  };
}

function createMockCard(rank: string, suit: string): Card {
  return { rank: rank as Rank, suit: suit as Suit };
}

// ============================================================================
// Section Validator Tests
// ============================================================================

describe('validateSectionBeforeProcessing', () => {
  it('should pass validation when all players have valid cards and actions', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG'),
      createMockPlayer(2, 'Bob', 'Dealer')
    ];

    const playerData: PlayerData = {
      1: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 's'),
        flop_action: 'bet',
        flop_amount: '5000',
        flop_unit: 'K'
      },
      2: {
        card1: createMockCard('Q', 'h'),
        card2: createMockCard('J', 'h'),
        flop_action: 'call'
      }
    };

    const result = validateSectionBeforeProcessing('flop', 'base', players, playerData);

    expect(result.errors).toHaveLength(0);
    expect(result.autoFoldedPlayers).toHaveLength(0);
    expect(Object.keys(result.updatedData)).toHaveLength(0);
  });

  it('should detect missing cards for non-fold actions', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        card1: null,
        card2: null,
        flop_action: 'bet',
        flop_amount: '5000'
      }
    };

    const result = validateSectionBeforeProcessing('flop', 'base', players, playerData);

    expect(result.errors).toContain('Alice: Card 1 required');
    expect(result.errors).toContain('Alice: Card 2 required');
  });

  it('should not require cards for fold action', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        card1: null,
        card2: null,
        flop_action: 'fold'
      }
    };

    const result = validateSectionBeforeProcessing('flop', 'base', players, playerData);

    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing amount for bet action', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 's'),
        flop_action: 'bet',
        flop_amount: ''
      }
    };

    const result = validateSectionBeforeProcessing('flop', 'base', players, playerData);

    expect(result.errors).toContain('Alice: Amount required for bet');
    expect(result.firstPlayerWithMissingAmount).toBeTruthy();
    expect(result.firstPlayerWithMissingAmount?.playerId).toBe(1);
  });

  it('should detect missing amount for raise action', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 's'),
        turn_action: 'raise',
        turn_amount: '0'
      }
    };

    const result = validateSectionBeforeProcessing('turn', 'base', players, playerData);

    expect(result.errors).toContain('Alice: Amount required for raise');
  });

  it('should validate raise progression (each raise must be higher)', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG'),
      createMockPlayer(2, 'Bob', 'Dealer')
    ];

    const playerData: PlayerData = {
      1: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 's'),
        flop_action: 'bet',
        flop_amount: '10',
        flop_unit: 'K'
      },
      2: {
        card1: createMockCard('Q', 'h'),
        card2: createMockCard('J', 'h'),
        flop_action: 'raise',
        flop_amount: '5',
        flop_unit: 'K'
      }
    };

    const result = validateSectionBeforeProcessing('flop', 'base', players, playerData);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('must be higher than');
  });

  it('should auto-fold players with no action in preflop base', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG'),
      createMockPlayer(2, 'Bob', 'Dealer')
    ];

    const playerData: PlayerData = {
      1: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 's'),
        preflop_action: 'call'
      },
      2: {
        card1: null,
        card2: null,
        preflop_action: 'no action'
      }
    };

    const result = validateSectionBeforeProcessing('preflop', 'base', players, playerData);

    expect(result.autoFoldedPlayers).toContain('Bob');
    expect(result.updatedData[2]).toBeTruthy();
    expect(result.updatedData[2].preflop_action).toBe('fold');
  });

  it('should handle more action sections', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 's'),
        flop_moreAction_action: 'bet',
        flop_moreAction_amount: '10',
        flop_moreAction_unit: 'K'
      }
    };

    const result = validateSectionBeforeProcessing('flop', 'more', players, playerData);

    expect(result.errors).toHaveLength(0);
  });

  it('should handle more2 action sections', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 's'),
        river_moreAction2_action: 'raise',
        river_moreAction2_amount: '20',
        river_moreAction2_unit: 'K'
      }
    };

    const result = validateSectionBeforeProcessing('river', 'more2', players, playerData);

    expect(result.errors).toHaveLength(0);
  });

  it('should skip validation for players without names', () => {
    const players: Player[] = [
      createMockPlayer(1, '', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        card1: null,
        card2: null,
        flop_action: 'bet'
      }
    };

    const result = validateSectionBeforeProcessing('flop', 'base', players, playerData);

    // Should not generate errors for unnamed players
    expect(result.errors).toHaveLength(0);
  });

  it('should handle multiple raises in correct order', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG'),
      createMockPlayer(2, 'Bob', 'Dealer'),
      createMockPlayer(3, 'Charlie', 'BB')
    ];

    const playerData: PlayerData = {
      1: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 's'),
        flop_action: 'bet',
        flop_amount: '5',
        flop_unit: 'K'
      },
      2: {
        card1: createMockCard('Q', 'h'),
        card2: createMockCard('J', 'h'),
        flop_action: 'raise',
        flop_amount: '10',
        flop_unit: 'K'
      },
      3: {
        card1: createMockCard('T', 'd'),
        card2: createMockCard('9', 'd'),
        flop_action: 'raise',
        flop_amount: '20',
        flop_unit: 'K'
      }
    };

    const result = validateSectionBeforeProcessing('flop', 'base', players, playerData);

    expect(result.errors).toHaveLength(0);
  });
});

describe('hasValidCards', () => {
  it('should return true for valid cards', () => {
    const data: PlayerData[number] = {
      card1: createMockCard('A', 's'),
      card2: createMockCard('K', 's')
    };

    expect(hasValidCards(data)).toBe(true);
  });

  it('should return false for missing card1', () => {
    const data: PlayerData[number] = {
      card1: null,
      card2: createMockCard('K', 's')
    };

    expect(hasValidCards(data)).toBe(false);
  });

  it('should return false for missing card2', () => {
    const data: PlayerData[number] = {
      card1: createMockCard('A', 's'),
      card2: null
    };

    expect(hasValidCards(data)).toBe(false);
  });

  it('should return false for card with missing rank', () => {
    const data: PlayerData[number] = {
      card1: { rank: '' as Rank, suit: 's' as Suit },
      card2: createMockCard('K', 's')
    };

    expect(hasValidCards(data)).toBe(false);
  });

  it('should return false for card with missing suit', () => {
    const data: PlayerData[number] = {
      card1: createMockCard('A', 's'),
      card2: { rank: 'K' as Rank, suit: '' as Suit }
    };

    expect(hasValidCards(data)).toBe(false);
  });
});

// ============================================================================
// Preflop Validator Tests
// ============================================================================

describe('validatePreFlopBase', () => {
  it('should pass validation for valid preflop setup', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG'),
      createMockPlayer(2, 'Bob', 'Dealer')
    ];

    const playerData: PlayerData = {
      1: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 's'),
        preflop_action: 'call'
      },
      2: {
        card1: createMockCard('Q', 'h'),
        card2: createMockCard('J', 'h'),
        preflop_action: 'raise'
      }
    };

    const result = validatePreFlopBase(players, playerData);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should auto-fold players with no action and missing cards', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG'),
      createMockPlayer(2, 'Bob', 'Dealer')
    ];

    const playerData: PlayerData = {
      1: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 's'),
        preflop_action: 'call'
      },
      2: {
        card1: null,
        card2: null,
        preflop_action: 'no action'
      }
    };

    const result = validatePreFlopBase(players, playerData);

    expect(result.playersToFold).toHaveLength(1);
    expect(result.playersToFold[0].name).toBe('Bob');
    expect(result.autoFoldedPlayerNames).toContain('Bob');
  });

  it('should detect missing cards for players with action', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        card1: null,
        card2: null,
        preflop_action: 'call'
      }
    };

    const result = validatePreFlopBase(players, playerData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Alice: Missing both cards');
  });

  it('should detect missing card 1 rank', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        card1: { rank: '' as Rank, suit: 's' as Suit },
        card2: createMockCard('K', 's'),
        preflop_action: 'raise'
      }
    };

    const result = validatePreFlopBase(players, playerData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Alice: Missing card 1 rank');
  });

  it('should detect missing card 2 suit', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        card1: createMockCard('A', 's'),
        card2: { rank: 'K' as Rank, suit: '' as Suit },
        preflop_action: 'call'
      }
    };

    const result = validatePreFlopBase(players, playerData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Alice: Missing card 2 suit');
  });

  it('should skip validation for fold action', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        card1: null,
        card2: null,
        preflop_action: 'fold'
      }
    };

    const result = validatePreFlopBase(players, playerData);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should skip empty seats', () => {
    const players: Player[] = [
      createMockPlayer(1, '', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        card1: null,
        card2: null,
        preflop_action: 'call'
      }
    };

    const result = validatePreFlopBase(players, playerData);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('autoFoldNoActionPlayersInPreflopBase', () => {
  it('should identify players with no action', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG'),
      createMockPlayer(2, 'Bob', 'Dealer')
    ];

    const playerData: PlayerData = {
      1: {
        preflop_action: 'call'
      },
      2: {
        preflop_action: 'no action'
      }
    };

    const result = autoFoldNoActionPlayersInPreflopBase(players, playerData);

    expect(result.playersToFold).toHaveLength(1);
    expect(result.playersToFold[0].name).toBe('Bob');
    expect(result.autoFoldedPlayerNames).toContain('Bob');
  });

  it('should identify players with undefined action', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {}
    };

    const result = autoFoldNoActionPlayersInPreflopBase(players, playerData);

    expect(result.playersToFold).toHaveLength(1);
    expect(result.playersToFold[0].name).toBe('Alice');
  });

  it('should identify players with "none" action', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        preflop_action: 'none'
      }
    };

    const result = autoFoldNoActionPlayersInPreflopBase(players, playerData);

    expect(result.playersToFold).toHaveLength(1);
  });

  it('should not fold players with action', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG'),
      createMockPlayer(2, 'Bob', 'Dealer')
    ];

    const playerData: PlayerData = {
      1: {
        preflop_action: 'call'
      },
      2: {
        preflop_action: 'raise'
      }
    };

    const result = autoFoldNoActionPlayersInPreflopBase(players, playerData);

    expect(result.playersToFold).toHaveLength(0);
  });

  it('should skip empty seats', () => {
    const players: Player[] = [
      createMockPlayer(1, '', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        preflop_action: 'no action'
      }
    };

    const result = autoFoldNoActionPlayersInPreflopBase(players, playerData);

    expect(result.playersToFold).toHaveLength(0);
  });
});

describe('hasPlayerFolded', () => {
  it('should return false for player who has not folded', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call',
        flop_action: 'bet'
      }
    };

    expect(hasPlayerFolded(1, playerData)).toBe(false);
  });

  it('should detect fold in preflop base', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'fold'
      }
    };

    expect(hasPlayerFolded(1, playerData)).toBe(true);
  });

  it('should detect fold in flop more action', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call',
        flop_action: 'bet',
        flop_moreAction_action: 'fold'
      }
    };

    expect(hasPlayerFolded(1, playerData)).toBe(true);
  });

  it('should detect fold in turn more action 2', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call',
        flop_action: 'bet',
        turn_action: 'raise',
        turn_moreAction2_action: 'fold'
      }
    };

    expect(hasPlayerFolded(1, playerData)).toBe(true);
  });

  it('should detect fold in river', () => {
    const playerData: PlayerData = {
      1: {
        preflop_action: 'call',
        flop_action: 'bet',
        turn_action: 'call',
        river_action: 'fold'
      }
    };

    expect(hasPlayerFolded(1, playerData)).toBe(true);
  });

  it('should return false for missing player data', () => {
    const playerData: PlayerData = {};

    expect(hasPlayerFolded(99, playerData)).toBe(false);
  });
});

describe('getFoldedPlayers', () => {
  it('should return list of folded players', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG'),
      createMockPlayer(2, 'Bob', 'Dealer'),
      createMockPlayer(3, 'Charlie', 'BB')
    ];

    const playerData: PlayerData = {
      1: {
        preflop_action: 'call'
      },
      2: {
        preflop_action: 'fold'
      },
      3: {
        flop_action: 'fold'
      }
    };

    const folded = getFoldedPlayers(players, playerData);

    expect(folded).toHaveLength(2);
    expect(folded.map(p => p.name)).toContain('Bob');
    expect(folded.map(p => p.name)).toContain('Charlie');
  });

  it('should return empty list when no one has folded', () => {
    const players: Player[] = [
      createMockPlayer(1, 'Alice', 'UTG'),
      createMockPlayer(2, 'Bob', 'Dealer')
    ];

    const playerData: PlayerData = {
      1: {
        preflop_action: 'call'
      },
      2: {
        preflop_action: 'raise'
      }
    };

    const folded = getFoldedPlayers(players, playerData);

    expect(folded).toHaveLength(0);
  });

  it('should skip players without names', () => {
    const players: Player[] = [
      createMockPlayer(1, '', 'UTG')
    ];

    const playerData: PlayerData = {
      1: {
        preflop_action: 'fold'
      }
    };

    const folded = getFoldedPlayers(players, playerData);

    expect(folded).toHaveLength(0);
  });
});

// ============================================================================
// Community Card Validator Tests
// ============================================================================

describe('validateCommunityCards', () => {
  it('should pass validation for preflop and flop', () => {
    const communityCards: CommunityCards = {
      flop: { card1: null, card2: null, card3: null },
      turn: { card1: null },
      river: { card1: null }
    };

    expect(validateCommunityCards('preflop', communityCards).isValid).toBe(true);
    expect(validateCommunityCards('flop', communityCards).isValid).toBe(true);
  });

  it('should require 3 flop cards for turn', () => {
    const communityCards: CommunityCards = {
      flop: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 'h'),
        card3: null
      },
      turn: { card1: null },
      river: { card1: null }
    };

    const result = validateCommunityCards('turn', communityCards);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('Flop must have 3 complete cards');
  });

  it('should pass validation for turn with complete flop', () => {
    const communityCards: CommunityCards = {
      flop: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 'h'),
        card3: createMockCard('Q', 'd')
      },
      turn: { card1: null },
      river: { card1: null }
    };

    const result = validateCommunityCards('turn', communityCards);

    expect(result.isValid).toBe(true);
  });

  it('should require turn card for river', () => {
    const communityCards: CommunityCards = {
      flop: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 'h'),
        card3: createMockCard('Q', 'd')
      },
      turn: { card1: null },
      river: { card1: null }
    };

    const result = validateCommunityCards('river', communityCards);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('Turn must have 1 complete card');
  });

  it('should pass validation for river with complete flop and turn', () => {
    const communityCards: CommunityCards = {
      flop: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 'h'),
        card3: createMockCard('Q', 'd')
      },
      turn: {
        card1: createMockCard('J', 'c')
      },
      river: { card1: null }
    };

    const result = validateCommunityCards('river', communityCards);

    expect(result.isValid).toBe(true);
  });

  it('should reject incomplete cards (missing rank)', () => {
    const communityCards: CommunityCards = {
      flop: {
        card1: createMockCard('A', 's'),
        card2: { rank: '' as Rank, suit: 'h' as Suit },
        card3: createMockCard('Q', 'd')
      },
      turn: { card1: null },
      river: { card1: null }
    };

    const result = validateCommunityCards('turn', communityCards);

    expect(result.isValid).toBe(false);
  });

  it('should reject incomplete cards (missing suit)', () => {
    const communityCards: CommunityCards = {
      flop: {
        card1: createMockCard('A', 's'),
        card2: createMockCard('K', 'h'),
        card3: createMockCard('Q', 'd')
      },
      turn: {
        card1: { rank: 'J' as Rank, suit: '' as Suit }
      },
      river: { card1: null }
    };

    const result = validateCommunityCards('river', communityCards);

    expect(result.isValid).toBe(false);
  });
});

describe('getSelectedCards', () => {
  it('should collect all player and community cards', () => {
    const players = [
      { id: 1, card1: createMockCard('A', 's'), card2: createMockCard('K', 's') },
      { id: 2, card1: createMockCard('Q', 'h'), card2: createMockCard('J', 'h') }
    ];

    const communityCards: CommunityCards = {
      flop: {
        card1: createMockCard('T', 'd'),
        card2: createMockCard('9', 'd'),
        card3: createMockCard('8', 'd')
      },
      turn: { card1: createMockCard('7', 'c') },
      river: { card1: createMockCard('6', 'c') }
    };

    const selected = getSelectedCards(players, communityCards);

    expect(selected.size).toBe(9);
    expect(selected.has('As')).toBe(true);
    expect(selected.has('Ks')).toBe(true);
    expect(selected.has('Qh')).toBe(true);
    expect(selected.has('Jh')).toBe(true);
    expect(selected.has('Td')).toBe(true);
    expect(selected.has('9d')).toBe(true);
    expect(selected.has('8d')).toBe(true);
    expect(selected.has('7c')).toBe(true);
    expect(selected.has('6c')).toBe(true);
  });

  it('should skip null or incomplete cards', () => {
    const players = [
      { id: 1, card1: createMockCard('A', 's'), card2: null },
      { id: 2, card1: { rank: 'Q' as Rank, suit: '' as Suit }, card2: createMockCard('J', 'h') }
    ];

    const communityCards: CommunityCards = {
      flop: { card1: null, card2: null, card3: null },
      turn: { card1: null },
      river: { card1: null }
    };

    const selected = getSelectedCards(players, communityCards);

    expect(selected.size).toBe(2);
    expect(selected.has('As')).toBe(true);
    expect(selected.has('Jh')).toBe(true);
  });
});

describe('isCardAvailable', () => {
  it('should return true for unselected card', () => {
    const selected = new Set(['As', 'Kh']);

    expect(isCardAvailable('Q', 'd', selected)).toBe(true);
  });

  it('should return false for already selected card', () => {
    const selected = new Set(['As', 'Kh']);

    expect(isCardAvailable('A', 's', selected)).toBe(false);
  });

  it('should return true for selected card if it matches current card', () => {
    const selected = new Set(['As', 'Kh']);
    const currentCard = createMockCard('A', 's');

    expect(isCardAvailable('A', 's', selected, currentCard)).toBe(true);
  });

  it('should return true for empty rank or suit', () => {
    const selected = new Set(['As']);

    expect(isCardAvailable('', 's', selected)).toBe(true);
    expect(isCardAvailable('A', '', selected)).toBe(true);
  });
});

describe('areAllSuitsTaken', () => {
  it('should return false when some suits are available', () => {
    const selected = new Set(['As', 'Ah']);
    const suits = ['s', 'h', 'd', 'c'];

    expect(areAllSuitsTaken('A', selected, suits)).toBe(false);
  });

  it('should return true when all suits are taken', () => {
    const selected = new Set(['As', 'Ah', 'Ad', 'Ac']);
    const suits = ['s', 'h', 'd', 'c'];

    expect(areAllSuitsTaken('A', selected, suits)).toBe(true);
  });

  it('should consider current card as available', () => {
    const selected = new Set(['As', 'Ah', 'Ad', 'Ac']);
    const suits = ['s', 'h', 'd', 'c'];
    const currentCard = createMockCard('A', 's');

    expect(areAllSuitsTaken('A', selected, suits, currentCard)).toBe(false);
  });
});
