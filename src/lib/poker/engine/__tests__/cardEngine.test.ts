/**
 * Unit Tests for cardEngine
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import {
  generateDeck,
  shuffleDeck,
  getSelectedCards,
  isCardAvailable,
  getAvailableCardsForPlayer,
  areAllSuitsTaken,
  cardToString,
  parseCardString,
} from '../cardEngine';
import { Player, PlayerData, CommunityCards } from '../../../../types/poker';

describe('cardEngine', () => {
  describe('generateDeck', () => {
    it('should generate a 52-card deck', () => {
      const deck = generateDeck();
      expect(deck).toHaveLength(52);
    });

    it('should have no duplicate cards', () => {
      const deck = generateDeck();
      const cardStrings = deck.map(c => `${c.rank}${c.suit}`);
      const uniqueCards = new Set(cardStrings);
      expect(uniqueCards.size).toBe(52);
    });

    it('should have all 13 ranks', () => {
      const deck = generateDeck();
      const ranks = new Set(deck.map(c => c.rank));
      expect(ranks.size).toBe(13);
    });

    it('should have all 4 suits', () => {
      const deck = generateDeck();
      const suits = new Set(deck.map(c => c.suit));
      expect(suits.size).toBe(4);
    });
  });

  describe('shuffleDeck', () => {
    it('should return a deck of same size', () => {
      const deck = generateDeck();
      const shuffled = shuffleDeck(deck);
      expect(shuffled).toHaveLength(52);
    });

    it('should contain all the same cards', () => {
      const deck = generateDeck();
      const shuffled = shuffleDeck(deck);

      const originalCards = new Set(deck.map(c => `${c.rank}${c.suit}`));
      const shuffledCards = new Set(shuffled.map(c => `${c.rank}${c.suit}`));

      expect(shuffledCards).toEqual(originalCards);
    });

    it('should not modify the original deck', () => {
      const deck = generateDeck();
      const originalFirst = deck[0];
      shuffleDeck(deck);
      expect(deck[0]).toEqual(originalFirst);
    });
  });

  describe('getSelectedCards', () => {
    const players: Player[] = [
      { id: 1, name: 'Alice', position: 'Dealer', stack: 10000 },
      { id: 2, name: 'Bob', position: 'SB', stack: 8500 },
    ];

    it('should return empty set when no cards selected', () => {
      const playerData: PlayerData = {};
      const communityCards: CommunityCards = {
        flop: { card1: null, card2: null, card3: null },
        turn: { card1: null },
        river: { card1: null },
      };

      const selected = getSelectedCards(players, playerData, communityCards);
      expect(selected.size).toBe(0);
    });

    it('should track player cards', () => {
      const playerData: PlayerData = {
        1: {
          card1: { rank: 'A', suit: '♠' },
          card2: { rank: 'K', suit: '♠' },
        },
      };
      const communityCards: CommunityCards = {
        flop: { card1: null, card2: null, card3: null },
        turn: { card1: null },
        river: { card1: null },
      };

      const selected = getSelectedCards(players, playerData, communityCards);
      expect(selected.size).toBe(2);
      expect(selected.has('A♠')).toBe(true);
      expect(selected.has('K♠')).toBe(true);
    });

    it('should track community cards', () => {
      const playerData: PlayerData = {};
      const communityCards: CommunityCards = {
        flop: {
          card1: { rank: 'A', suit: '♥' },
          card2: { rank: 'K', suit: '♦' },
          card3: { rank: 'Q', suit: '♣' },
        },
        turn: { card1: { rank: 'J', suit: '♠' } },
        river: { card1: null },
      };

      const selected = getSelectedCards(players, playerData, communityCards);
      expect(selected.size).toBe(4);
      expect(selected.has('A♥')).toBe(true);
      expect(selected.has('K♦')).toBe(true);
      expect(selected.has('Q♣')).toBe(true);
      expect(selected.has('J♠')).toBe(true);
    });

    it('should track both player and community cards', () => {
      const playerData: PlayerData = {
        1: {
          card1: { rank: 'A', suit: '♠' },
          card2: { rank: 'K', suit: '♠' },
        },
        2: {
          card1: { rank: 'Q', suit: '♥' },
          card2: { rank: 'J', suit: '♥' },
        },
      };
      const communityCards: CommunityCards = {
        flop: {
          card1: { rank: 'T', suit: '♦' },
          card2: { rank: '9', suit: '♣' },
          card3: { rank: '8', suit: '♠' },
        },
        turn: { card1: null },
        river: { card1: null },
      };

      const selected = getSelectedCards(players, playerData, communityCards);
      expect(selected.size).toBe(7); // 4 player cards + 3 flop cards
    });
  });

  describe('isCardAvailable', () => {
    const players: Player[] = [
      { id: 1, name: 'Alice', position: 'Dealer', stack: 10000 },
      { id: 2, name: 'Bob', position: 'SB', stack: 8500 },
    ];

    it('should return true for unselected card', () => {
      const playerData: PlayerData = {};
      const communityCards: CommunityCards = {
        flop: { card1: null, card2: null, card3: null },
        turn: { card1: null },
        river: { card1: null },
      };

      const available = isCardAvailable('A', '♠', 1, 1, players, playerData, communityCards, true);
      expect(available).toBe(true);
    });

    it('should return false for card assigned to another player', () => {
      const playerData: PlayerData = {
        2: {
          card1: { rank: 'A', suit: '♠' },
        },
      };
      const communityCards: CommunityCards = {
        flop: { card1: null, card2: null, card3: null },
        turn: { card1: null },
        river: { card1: null },
      };

      const available = isCardAvailable('A', '♠', 1, 1, players, playerData, communityCards, true);
      expect(available).toBe(false);
    });

    it('should return true when reassigning same card to same player slot', () => {
      const playerData: PlayerData = {
        1: {
          card1: { rank: 'A', suit: '♠' },
        },
      };
      const communityCards: CommunityCards = {
        flop: { card1: null, card2: null, card3: null },
        turn: { card1: null },
        river: { card1: null },
      };

      const available = isCardAvailable('A', '♠', 1, 1, players, playerData, communityCards, true);
      expect(available).toBe(true); // Can reassign same card
    });

    it('should return false for card in community cards', () => {
      const playerData: PlayerData = {};
      const communityCards: CommunityCards = {
        flop: {
          card1: { rank: 'A', suit: '♥' },
          card2: null,
          card3: null,
        },
        turn: { card1: null },
        river: { card1: null },
      };

      const available = isCardAvailable('A', '♥', 1, 1, players, playerData, communityCards, true);
      expect(available).toBe(false);
    });
  });

  describe('getAvailableCardsForPlayer', () => {
    const players: Player[] = [
      { id: 1, name: 'Alice', position: 'Dealer', stack: 10000 },
      { id: 2, name: 'Bob', position: 'SB', stack: 8500 },
    ];

    it('should return all 52 cards when none selected', () => {
      const playerData: PlayerData = {};
      const communityCards: CommunityCards = {
        flop: { card1: null, card2: null, card3: null },
        turn: { card1: null },
        river: { card1: null },
      };

      const available = getAvailableCardsForPlayer(1, players, playerData, communityCards);
      expect(available).toHaveLength(52);
    });

    it('should exclude cards assigned to other players', () => {
      const playerData: PlayerData = {
        2: {
          card1: { rank: 'A', suit: '♠' },
          card2: { rank: 'K', suit: '♠' },
        },
      };
      const communityCards: CommunityCards = {
        flop: { card1: null, card2: null, card3: null },
        turn: { card1: null },
        river: { card1: null },
      };

      const available = getAvailableCardsForPlayer(1, players, playerData, communityCards);
      expect(available).toHaveLength(50); // 52 - 2 cards

      const availableStrings = available.map(c => `${c.rank}${c.suit}`);
      expect(availableStrings).not.toContain('A♠');
      expect(availableStrings).not.toContain('K♠');
    });

    it('should include current player own cards', () => {
      const playerData: PlayerData = {
        1: {
          card1: { rank: 'A', suit: '♠' },
          card2: { rank: 'K', suit: '♠' },
        },
      };
      const communityCards: CommunityCards = {
        flop: { card1: null, card2: null, card3: null },
        turn: { card1: null },
        river: { card1: null },
      };

      const available = getAvailableCardsForPlayer(1, players, playerData, communityCards);
      expect(available).toHaveLength(52); // Own cards are available for reassignment

      const availableStrings = available.map(c => `${c.rank}${c.suit}`);
      expect(availableStrings).toContain('A♠');
      expect(availableStrings).toContain('K♠');
    });
  });

  describe('areAllSuitsTaken', () => {
    const players: Player[] = [
      { id: 1, name: 'Alice', position: 'Dealer', stack: 10000 },
    ];

    it('should return false when rank has available suits', () => {
      const playerData: PlayerData = {
        1: {
          card1: { rank: 'A', suit: '♠' },
        },
      };
      const communityCards: CommunityCards = {
        flop: { card1: null, card2: null, card3: null },
        turn: { card1: null },
        river: { card1: null },
      };

      const allTaken = areAllSuitsTaken('A', players, playerData, communityCards);
      expect(allTaken).toBe(false); // Only 1 of 4 Aces taken
    });

    it('should return true when all suits of rank are taken', () => {
      const playerData: PlayerData = {
        1: {
          card1: { rank: 'A', suit: '♠' },
          card2: { rank: 'A', suit: '♥' },
        },
      };
      const communityCards: CommunityCards = {
        flop: {
          card1: { rank: 'A', suit: '♦' },
          card2: { rank: 'A', suit: '♣' },
          card3: null,
        },
        turn: { card1: null },
        river: { card1: null },
      };

      const allTaken = areAllSuitsTaken('A', players, playerData, communityCards);
      expect(allTaken).toBe(true); // All 4 Aces taken
    });
  });

  describe('cardToString', () => {
    it('should convert card to string', () => {
      expect(cardToString({ rank: 'A', suit: '♠' })).toBe('A♠');
      expect(cardToString({ rank: 'K', suit: '♥' })).toBe('K♥');
    });

    it('should return empty string for null card', () => {
      expect(cardToString(null)).toBe('');
    });
  });

  describe('parseCardString', () => {
    it('should parse valid card string', () => {
      const card = parseCardString('A♠');
      expect(card).toEqual({ rank: 'A', suit: '♠' });
    });

    it('should return null for invalid string', () => {
      expect(parseCardString('')).toBe(null);
      expect(parseCardString('X')).toBe(null);
      expect(parseCardString('A')).toBe(null); // Missing suit
    });
  });
});
