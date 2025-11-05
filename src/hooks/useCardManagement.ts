/**
 * useCardManagement Hook
 *
 * Manages player cards and community cards.
 * Handles card selection, availability checking, and duplicate detection.
 */

import { useCallback, useMemo } from 'react';
import type { Card, Stage } from '../types/poker';
import type { GameState, GameStateActions } from './useGameState';
import {
  getSelectedCards,
  isCardAvailable,
  areAllSuitsTaken
} from '../lib/poker/validators';
import { ranks, suits } from '../lib/poker/engine/cardEngine';

/**
 * Card management hook return type
 */
export interface UseCardManagementReturn {
  /**
   * Get all selected cards (player + community)
   */
  selectedCards: Set<string>;

  /**
   * Check if a card is available for selection
   */
  checkCardAvailable: (rank: string, suit: string, currentCard?: Card | null) => boolean;

  /**
   * Check if all suits are taken for a rank
   */
  checkAllSuitsTaken: (rank: string, currentCard?: Card | null) => boolean;

  /**
   * Update a player's card
   */
  updatePlayerCard: (playerId: number, cardNumber: 1 | 2, card: Card | null) => void;

  /**
   * Update a community card
   */
  updateCommunityCard: (stage: Stage, cardNumber: number, card: Card | null) => void;

  /**
   * Auto-select community cards for a stage
   */
  autoSelectCommunityCards: (stage: Stage) => void;

  /**
   * Get player's cards
   */
  getPlayerCards: (playerId: number) => { card1: Card | null; card2: Card | null };

  /**
   * Get community cards for a stage
   */
  getCommunityCards: (stage: Stage) => { [key: string]: Card | null };

  /**
   * Clear all cards
   */
  clearAllCards: () => void;

  /**
   * Available ranks and suits
   */
  availableRanks: string[];
  availableSuits: string[];
}

/**
 * Card management hook
 *
 * Provides methods for managing player and community cards.
 *
 * @param state - Game state
 * @param actions - Game state actions
 * @returns Card management methods
 */
export function useCardManagement(
  state: GameState,
  actions: GameStateActions
): UseCardManagementReturn {
  /**
   * Get all selected cards (memoized)
   */
  const selectedCards = useMemo((): Set<string> => {
    // Map players to the format expected by getSelectedCards
    const playerCards = state.players.map(player => {
      const data = state.playerData[player.id] || {};
      return {
        id: player.id,
        card1: data.card1 || null,
        card2: data.card2 || null
      };
    });

    return getSelectedCards(playerCards, state.communityCards);
  }, [state.players, state.playerData, state.communityCards]);

  /**
   * Check if a card is available for selection
   */
  const checkCardAvailable = useCallback((
    rank: string,
    suit: string,
    currentCard?: Card | null
  ): boolean => {
    return isCardAvailable(rank, suit, selectedCards, currentCard);
  }, [selectedCards]);

  /**
   * Check if all suits are taken for a rank
   */
  const checkAllSuitsTaken = useCallback((
    rank: string,
    currentCard?: Card | null
  ): boolean => {
    return areAllSuitsTaken(rank, selectedCards, suits, currentCard);
  }, [selectedCards]);

  /**
   * Update a player's card
   */
  const updatePlayerCard = useCallback((
    playerId: number,
    cardNumber: 1 | 2,
    card: Card | null
  ): void => {
    const fieldName = `card${cardNumber}` as 'card1' | 'card2';
    actions.updatePlayerData(playerId, fieldName, card, '');
  }, [actions]);

  /**
   * Update a community card
   */
  const updateCommunityCard = useCallback((
    stage: Stage,
    cardNumber: number,
    card: Card | null
  ): void => {
    actions.updateCommunityCard(stage, cardNumber, card);
  }, [actions]);

  /**
   * Get player's cards
   */
  const getPlayerCards = useCallback((playerId: number): { card1: Card | null; card2: Card | null } => {
    const data = state.playerData[playerId] || {};
    return {
      card1: data.card1 || null,
      card2: data.card2 || null
    };
  }, [state.playerData]);

  /**
   * Get community cards for a stage
   */
  const getCommunityCards = useCallback((stage: Stage): { [key: string]: Card | null } => {
    // Type-safe access to community cards
    if (stage === 'flop') {
      return state.communityCards.flop;
    } else if (stage === 'turn') {
      return state.communityCards.turn;
    } else if (stage === 'river') {
      return state.communityCards.river;
    }
    return {};
  }, [state.communityCards]);

  /**
   * Auto-select community cards for a stage
   */
  const autoSelectCommunityCards = useCallback((stage: Stage): void => {
    const numCards = stage === 'flop' ? 3 : 1;
    const availableCards: Card[] = [];

    // Build list of available cards
    for (const rank of ranks) {
      for (const suit of suits) {
        if (isCardAvailable(rank, suit, selectedCards)) {
          availableCards.push({ rank, suit });
        }
      }
    }

    // Shuffle available cards
    for (let i = availableCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableCards[i], availableCards[j]] = [availableCards[j], availableCards[i]];
    }

    // Select the first numCards cards
    for (let i = 0; i < numCards && i < availableCards.length; i++) {
      actions.updateCommunityCard(stage, i + 1, availableCards[i]);
    }
  }, [selectedCards, actions]);

  /**
   * Clear all cards
   */
  const clearAllCards = useCallback((): void => {
    // Clear player cards
    state.players.forEach(player => {
      if (player.name) {
        actions.updatePlayerData(player.id, 'card1', null, '');
        actions.updatePlayerData(player.id, 'card2', null, '');
      }
    });

    // Clear community cards
    actions.setCommunityCards({
      flop: { card1: null, card2: null, card3: null },
      turn: { card1: null },
      river: { card1: null }
    });
  }, [state.players, actions]);

  return {
    selectedCards,
    checkCardAvailable,
    checkAllSuitsTaken,
    updatePlayerCard,
    updateCommunityCard,
    autoSelectCommunityCards,
    getPlayerCards,
    getCommunityCards,
    clearAllCards,
    availableRanks: ranks,
    availableSuits: suits
  };
}
