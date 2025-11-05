/**
 * Card Engine
 * Pure functions for card management and validation
 */

import {
  Card,
  Deck,
  Rank,
  Suit,
  ALL_RANKS,
  ALL_SUITS,
  CommunityCards,
  PlayerData,
  Player,
} from '../../../types/poker';

/**
 * Generate a full 52-card deck
 */
export function generateDeck(): Deck {
  const deck: Deck = [];

  ALL_RANKS.forEach(rank => {
    ALL_SUITS.forEach(suit => {
      deck.push({ rank, suit });
    });
  });

  return deck;
}

/**
 * Shuffle a deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: Deck): Deck {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Get all currently selected cards from players and community cards
 */
export function getSelectedCards(
  players: Player[],
  playerData: PlayerData,
  communityCards: CommunityCards
): Set<string> {
  const selectedCards = new Set<string>();

  // Get player cards
  players.forEach(player => {
    const data = playerData[player.id];
    if (data) {
      if (data.card1?.rank && data.card1?.suit) {
        selectedCards.add(`${data.card1.rank}${data.card1.suit}`);
      }
      if (data.card2?.rank && data.card2?.suit) {
        selectedCards.add(`${data.card2.rank}${data.card2.suit}`);
      }
    }
  });

  // Get community cards
  if (communityCards.flop.card1?.rank && communityCards.flop.card1?.suit) {
    selectedCards.add(`${communityCards.flop.card1.rank}${communityCards.flop.card1.suit}`);
  }
  if (communityCards.flop.card2?.rank && communityCards.flop.card2?.suit) {
    selectedCards.add(`${communityCards.flop.card2.rank}${communityCards.flop.card2.suit}`);
  }
  if (communityCards.flop.card3?.rank && communityCards.flop.card3?.suit) {
    selectedCards.add(`${communityCards.flop.card3.rank}${communityCards.flop.card3.suit}`);
  }
  if (communityCards.turn.card1?.rank && communityCards.turn.card1?.suit) {
    selectedCards.add(`${communityCards.turn.card1.rank}${communityCards.turn.card1.suit}`);
  }
  if (communityCards.river.card1?.rank && communityCards.river.card1?.suit) {
    selectedCards.add(`${communityCards.river.card1.rank}${communityCards.river.card1.suit}`);
  }

  return selectedCards;
}

/**
 * Check if a specific card is available (not already selected)
 */
export function isCardAvailable(
  rank: Rank,
  suit: Suit,
  playerId: number,
  cardNumber: number,
  players: Player[],
  playerData: PlayerData,
  communityCards: CommunityCards,
  isPlayerCard: boolean
): boolean {
  const cardString = `${rank}${suit}`;
  const selectedCards = getSelectedCards(players, playerData, communityCards);

  // If it's the current player's current card slot, it's available to them
  if (isPlayerCard) {
    const currentPlayerData = playerData[playerId];
    const currentCard = cardNumber === 1 ? currentPlayerData?.card1 : currentPlayerData?.card2;

    if (currentCard?.rank === rank && currentCard?.suit === suit) {
      return true; // Same card being re-selected is OK
    }
  }

  return !selectedCards.has(cardString);
}

/**
 * Get available cards for a player (all cards minus selected ones)
 */
export function getAvailableCardsForPlayer(
  playerId: number,
  players: Player[],
  playerData: PlayerData,
  communityCards: CommunityCards
): Deck {
  const allCards = generateDeck();
  const selectedCards = getSelectedCards(players, playerData, communityCards);

  // Exclude current player's own cards from "selected" so they can be reassigned
  const currentPlayerData = playerData[playerId];
  if (currentPlayerData) {
    if (currentPlayerData.card1?.rank && currentPlayerData.card1?.suit) {
      selectedCards.delete(`${currentPlayerData.card1.rank}${currentPlayerData.card1.suit}`);
    }
    if (currentPlayerData.card2?.rank && currentPlayerData.card2?.suit) {
      selectedCards.delete(`${currentPlayerData.card2.rank}${currentPlayerData.card2.suit}`);
    }
  }

  return allCards.filter(card => !selectedCards.has(`${card.rank}${card.suit}`));
}

/**
 * Check if all suits of a given rank are taken
 */
export function areAllSuitsTaken(
  rank: Rank,
  players: Player[],
  playerData: PlayerData,
  communityCards: CommunityCards
): boolean {
  const selectedCards = getSelectedCards(players, playerData, communityCards);

  return ALL_SUITS.every(suit => selectedCards.has(`${rank}${suit}`));
}

/**
 * Assign random cards to a player
 */
export function assignRandomCardsToPlayer(
  playerId: number,
  players: Player[],
  playerData: PlayerData,
  communityCards: CommunityCards
): { card1: Card; card2: Card } {
  const availableCards = getAvailableCardsForPlayer(playerId, players, playerData, communityCards);

  if (availableCards.length < 2) {
    throw new Error('Not enough available cards to assign');
  }

  const shuffled = shuffleDeck(availableCards);

  return {
    card1: { rank: shuffled[0].rank, suit: shuffled[0].suit },
    card2: { rank: shuffled[1].rank, suit: shuffled[1].suit },
  };
}

/**
 * Validate community cards for a given stage
 */
export function validateCommunityCardsForStage(
  stage: string,
  communityCards: CommunityCards
): { isValid: boolean; missingCards: string[] } {
  const missingCards: string[] = [];

  if (stage === 'flop' || stage === 'turn' || stage === 'river') {
    if (!communityCards.flop.card1?.rank) missingCards.push('Flop Card 1');
    if (!communityCards.flop.card2?.rank) missingCards.push('Flop Card 2');
    if (!communityCards.flop.card3?.rank) missingCards.push('Flop Card 3');
  }

  if (stage === 'turn' || stage === 'river') {
    if (!communityCards.turn.card1?.rank) missingCards.push('Turn Card');
  }

  if (stage === 'river') {
    if (!communityCards.river.card1?.rank) missingCards.push('River Card');
  }

  return {
    isValid: missingCards.length === 0,
    missingCards,
  };
}

/**
 * Create a card string representation for display
 */
export function cardToString(card: Card): string {
  if (!card || !card.rank || !card.suit) {
    return '';
  }
  return `${card.rank}${card.suit}`;
}

/**
 * Parse a card string into a Card object
 */
export function parseCardString(cardString: string): Card {
  if (!cardString || cardString.length < 2) {
    return null;
  }

  const rank = cardString[0] as Rank;
  const suit = cardString.slice(1) as Suit;

  if (!ALL_RANKS.includes(rank) || !ALL_SUITS.includes(suit)) {
    return null;
  }

  return { rank, suit };
}

// Export constants for external use
export const ranks = ALL_RANKS;
export const suits = ALL_SUITS;
