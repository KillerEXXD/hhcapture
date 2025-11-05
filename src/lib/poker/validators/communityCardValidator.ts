/**
 * Community Card Validator
 *
 * Validates community cards before allowing progression to later stages.
 * Ensures flop has 3 cards before turn, and turn has 1 card before river.
 */

import type { Card, Stage } from '../../../types/poker';

/**
 * Community cards structure
 */
export type CommunityCards = {
  flop: {
    card1: Card | null;
    card2: Card | null;
    card3: Card | null;
  };
  turn: {
    card1: Card | null;
  };
  river: {
    card1: Card | null;
  };
};

/**
 * Community card validation result
 */
export type CommunityCardValidationResult = {
  isValid: boolean;
  errorMessage: string | null;
};

/**
 * Check if a card is complete (has both rank and suit)
 */
function isCardComplete(card: Card | null | undefined): boolean {
  return !!(card && card.rank && card.suit);
}

/**
 * Validate community cards for a target stage
 *
 * Rules:
 * - To proceed to Turn: Flop must have 3 complete cards
 * - To proceed to River: Flop must have 3 complete cards AND Turn must have 1 complete card
 *
 * @param targetStage - The stage being switched to
 * @param communityCards - Community cards object
 * @returns Validation result with error message if invalid
 */
export function validateCommunityCards(
  targetStage: Stage,
  communityCards: CommunityCards
): CommunityCardValidationResult {
  // Only validate when switching TO turn or river
  if (targetStage !== 'turn' && targetStage !== 'river') {
    return {
      isValid: true,
      errorMessage: null
    };
  }

  // Check flop cards for turn or river
  if (targetStage === 'turn' || targetStage === 'river') {
    const flop1 = communityCards.flop.card1;
    const flop2 = communityCards.flop.card2;
    const flop3 = communityCards.flop.card3;

    const flopComplete = (
      isCardComplete(flop1) &&
      isCardComplete(flop2) &&
      isCardComplete(flop3)
    );

    if (!flopComplete) {
      return {
        isValid: false,
        errorMessage: `Flop must have 3 complete cards (rank and suit) before proceeding to ${targetStage}`
      };
    }
  }

  // Check turn card for river
  if (targetStage === 'river') {
    const turn1 = communityCards.turn.card1;

    if (!isCardComplete(turn1)) {
      return {
        isValid: false,
        errorMessage: 'Turn must have 1 complete card (rank and suit) before proceeding to River'
      };
    }
  }

  return {
    isValid: true,
    errorMessage: null
  };
}

/**
 * Get all selected cards (both player cards and community cards)
 *
 * This is used to check for duplicate cards in the deck.
 *
 * @param players - All players with their card data
 * @param communityCards - Community cards object
 * @returns Set of card keys (e.g., "As", "Kh")
 */
export function getSelectedCards(
  players: Array<{ id: number; card1?: Card | null; card2?: Card | null }>,
  communityCards: CommunityCards
): Set<string> {
  const selected = new Set<string>();

  // Add player cards
  players.forEach(player => {
    if (player.card1?.rank && player.card1?.suit) {
      selected.add(`${player.card1.rank}${player.card1.suit}`);
    }
    if (player.card2?.rank && player.card2?.suit) {
      selected.add(`${player.card2.rank}${player.card2.suit}`);
    }
  });

  // Add flop cards
  if (communityCards.flop.card1?.rank && communityCards.flop.card1?.suit) {
    selected.add(`${communityCards.flop.card1.rank}${communityCards.flop.card1.suit}`);
  }
  if (communityCards.flop.card2?.rank && communityCards.flop.card2?.suit) {
    selected.add(`${communityCards.flop.card2.rank}${communityCards.flop.card2.suit}`);
  }
  if (communityCards.flop.card3?.rank && communityCards.flop.card3?.suit) {
    selected.add(`${communityCards.flop.card3.rank}${communityCards.flop.card3.suit}`);
  }

  // Add turn card
  if (communityCards.turn.card1?.rank && communityCards.turn.card1?.suit) {
    selected.add(`${communityCards.turn.card1.rank}${communityCards.turn.card1.suit}`);
  }

  // Add river card
  if (communityCards.river.card1?.rank && communityCards.river.card1?.suit) {
    selected.add(`${communityCards.river.card1.rank}${communityCards.river.card1.suit}`);
  }

  return selected;
}

/**
 * Check if a card is available for selection
 *
 * A card is available if:
 * - It hasn't been selected by another player or community cards
 * - OR it's the current player's current card selection
 *
 * @param cardKey - Card key (e.g., "As", "Kh")
 * @param selectedCards - Set of currently selected card keys
 * @param currentCard - The current card for this slot (if any)
 * @returns True if card is available
 */
export function isCardAvailable(
  rank: string,
  suit: string,
  selectedCards: Set<string>,
  currentCard?: Card | null
): boolean {
  if (!rank || !suit) {
    return true;
  }

  const cardKey = `${rank}${suit}`;

  if (selectedCards.has(cardKey)) {
    // Card is already selected - only available if it's the current card
    return currentCard?.rank === rank && currentCard?.suit === suit;
  }

  return true;
}

/**
 * Check if all suits are taken for a given rank
 *
 * @param rank - Card rank
 * @param selectedCards - Set of currently selected card keys
 * @param suits - Array of all possible suits
 * @param currentCard - The current card for this slot (if any)
 * @returns True if all suits are taken
 */
export function areAllSuitsTaken(
  rank: string,
  selectedCards: Set<string>,
  suits: string[],
  currentCard?: Card | null
): boolean {
  const availableSuits = suits.filter(suit =>
    isCardAvailable(rank, suit, selectedCards, currentCard)
  );

  return availableSuits.length === 0;
}
