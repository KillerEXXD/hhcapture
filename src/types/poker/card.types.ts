/**
 * Card Type Definitions
 * Defines types for playing cards, ranks, suits, and decks
 */

export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
export type Suit = '♠' | '♥' | '♦' | '♣';

export type Card = {
  rank: Rank;
  suit: Suit;
} | null;

export type Deck = Array<{ rank: Rank; suit: Suit }>;

export type CommunityCards = {
  flop: {
    card1: Card;
    card2: Card;
    card3: Card;
  };
  turn: {
    card1: Card;
  };
  river: {
    card1: Card;
  };
};

export type PlayerCards = {
  card1: Card;
  card2: Card;
};

export const ALL_RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
export const ALL_SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
