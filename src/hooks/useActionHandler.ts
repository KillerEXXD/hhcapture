/**
 * useActionHandler Hook
 *
 * Handles player actions (bet, raise, call, fold, check, all-in).
 * Validates actions and updates state accordingly.
 */

import { useCallback } from 'react';
import type { Stage, ActionLevel } from '../types/poker';
import type { GameState, GameStateActions } from './useGameState';
import {
  validateSectionBeforeProcessing,
  validatePreFlopBase,
  autoFoldNoActionPlayersInPreflopBase,
  validateCommunityCards
} from '../lib/poker/validators';

/**
 * Player action types
 */
export type PlayerAction = 'bet' | 'raise' | 'call' | 'fold' | 'check' | 'all-in' | 'no action';

/**
 * Action validation result
 */
export interface ActionValidationResult {
  isValid: boolean;
  errors: string[];
  autoFoldedPlayers?: string[];
}

/**
 * Action handler hook return type
 */
export interface UseActionHandlerReturn {
  /**
   * Set a player's action
   */
  setPlayerAction: (
    playerId: number,
    action: PlayerAction,
    stage: Stage,
    level: ActionLevel
  ) => void;

  /**
   * Set a player's bet/raise amount
   */
  setPlayerAmount: (
    playerId: number,
    amount: string | number,
    stage: Stage,
    level: ActionLevel
  ) => void;

  /**
   * Set a player's unit (K, Mil, etc.)
   */
  setPlayerUnit: (
    playerId: number,
    unit: string,
    stage: Stage,
    level: ActionLevel
  ) => void;

  /**
   * Validate a section before processing
   */
  validateSection: (stage: Stage, level: ActionLevel) => ActionValidationResult;

  /**
   * Validate preflop base section
   */
  validatePreflop: () => ActionValidationResult;

  /**
   * Validate community cards before proceeding to a stage
   */
  validateCommunityCardsForStage: (targetStage: Stage) => ActionValidationResult;

  /**
   * Auto-fold players with no action in preflop
   */
  autoFoldNoAction: () => { playersToFold: string[]; count: number };

  /**
   * Get player's action for a section
   */
  getPlayerAction: (playerId: number, stage: Stage, level: ActionLevel) => PlayerAction;

  /**
   * Get player's amount for a section
   */
  getPlayerAmount: (playerId: number, stage: Stage, level: ActionLevel) => string | number;

  /**
   * Get player's unit for a section
   */
  getPlayerUnit: (playerId: number, stage: Stage, level: ActionLevel) => string;

  /**
   * Check if a player has acted in a section
   */
  hasPlayerActed: (playerId: number, stage: Stage, level: ActionLevel) => boolean;
}

/**
 * Action handler hook
 *
 * Provides methods for handling player actions and validation.
 *
 * @param state - Game state
 * @param actions - Game state actions
 * @returns Action handler methods
 */
export function useActionHandler(
  state: GameState,
  actions: GameStateActions
): UseActionHandlerReturn {
  /**
   * Get field suffix for a stage and level
   */
  const getFieldSuffix = useCallback((stage: Stage, level: ActionLevel): string => {
    const prefix = stage;
    const suffix = level === 'base' ? '' : level === 'more' ? '_moreAction' : '_moreAction2';
    return `${prefix}${suffix}`;
  }, []);

  /**
   * Set a player's action
   */
  const setPlayerAction = useCallback((
    playerId: number,
    action: PlayerAction,
    stage: Stage,
    level: ActionLevel
  ): void => {
    const suffix = getFieldSuffix(stage, level);
    actions.updatePlayerData(playerId, `${suffix}_action`, action, '');
  }, [actions, getFieldSuffix]);

  /**
   * Set a player's bet/raise amount
   */
  const setPlayerAmount = useCallback((
    playerId: number,
    amount: string | number,
    stage: Stage,
    level: ActionLevel
  ): void => {
    const suffix = getFieldSuffix(stage, level);
    actions.updatePlayerData(playerId, `${suffix}_amount`, amount, '');
  }, [actions, getFieldSuffix]);

  /**
   * Set a player's unit
   */
  const setPlayerUnit = useCallback((
    playerId: number,
    unit: string,
    stage: Stage,
    level: ActionLevel
  ): void => {
    const suffix = getFieldSuffix(stage, level);
    actions.updatePlayerData(playerId, `${suffix}_unit`, unit, '');
  }, [actions, getFieldSuffix]);

  /**
   * Validate a section before processing
   */
  const validateSection = useCallback((
    stage: Stage,
    level: ActionLevel
  ): ActionValidationResult => {
    const result = validateSectionBeforeProcessing(
      stage,
      level,
      state.players,
      state.playerData,
      state.defaultUnit
    );

    // Apply auto-fold updates if any
    if (Object.keys(result.updatedData).length > 0) {
      Object.entries(result.updatedData).forEach(([playerId, data]) => {
        Object.entries(data).forEach(([field, value]) => {
          actions.updatePlayerData(parseInt(playerId), field, value, '');
        });
      });
    }

    return {
      isValid: result.errors.length === 0,
      errors: result.errors,
      autoFoldedPlayers: result.autoFoldedPlayers
    };
  }, [state.players, state.playerData, state.defaultUnit, actions]);

  /**
   * Validate preflop base section
   */
  const validatePreflop = useCallback((): ActionValidationResult => {
    const result = validatePreFlopBase(state.players, state.playerData);

    // Apply auto-folds if any
    if (result.playersToFold.length > 0) {
      result.playersToFold.forEach(player => {
        actions.updatePlayerData(player.id, 'preflop_action', 'fold', '');
      });
    }

    return {
      isValid: result.isValid,
      errors: result.errors,
      autoFoldedPlayers: result.autoFoldedPlayerNames
    };
  }, [state.players, state.playerData, actions]);

  /**
   * Validate community cards before proceeding to a stage
   */
  const validateCommunityCardsForStage = useCallback((
    targetStage: Stage
  ): ActionValidationResult => {
    const result = validateCommunityCards(targetStage, state.communityCards);

    return {
      isValid: result.isValid,
      errors: result.errorMessage ? [result.errorMessage] : []
    };
  }, [state.communityCards]);

  /**
   * Auto-fold players with no action in preflop
   */
  const autoFoldNoAction = useCallback((): { playersToFold: string[]; count: number } => {
    const result = autoFoldNoActionPlayersInPreflopBase(
      state.players,
      state.playerData
    );

    // Apply auto-folds
    result.playersToFold.forEach(player => {
      actions.updatePlayerData(player.id, 'preflop_action', 'fold', '');

      // Add to folding animation set
      actions.setFoldingPlayers(prev => new Set(prev).add(player.id));

      // Remove from folding animation after 500ms
      setTimeout(() => {
        actions.setFoldingPlayers(prev => {
          const newSet = new Set(prev);
          newSet.delete(player.id);
          return newSet;
        });
      }, 500);
    });

    return {
      playersToFold: result.autoFoldedPlayerNames,
      count: result.playersToFold.length
    };
  }, [state.players, state.playerData, actions]);

  /**
   * Get player's action for a section
   */
  const getPlayerAction = useCallback((
    playerId: number,
    stage: Stage,
    level: ActionLevel
  ): PlayerAction => {
    const suffix = getFieldSuffix(stage, level);
    const data = state.playerData[playerId] || {};
    return (data[`${suffix}_action`] as PlayerAction) || 'no action';
  }, [state.playerData, getFieldSuffix]);

  /**
   * Get player's amount for a section
   */
  const getPlayerAmount = useCallback((
    playerId: number,
    stage: Stage,
    level: ActionLevel
  ): string | number => {
    const suffix = getFieldSuffix(stage, level);
    const data = state.playerData[playerId] || {};
    const value = data[`${suffix}_amount`];
    return (typeof value === 'string' || typeof value === 'number') ? value : '';
  }, [state.playerData, getFieldSuffix]);

  /**
   * Get player's unit for a section
   */
  const getPlayerUnit = useCallback((
    playerId: number,
    stage: Stage,
    level: ActionLevel
  ): string => {
    const suffix = getFieldSuffix(stage, level);
    const data = state.playerData[playerId] || {};
    return (data[`${suffix}_unit`] as string) || data.unit || state.defaultUnit;
  }, [state.playerData, state.defaultUnit, getFieldSuffix]);

  /**
   * Check if a player has acted in a section
   */
  const hasPlayerActed = useCallback((
    playerId: number,
    stage: Stage,
    level: ActionLevel
  ): boolean => {
    const action = getPlayerAction(playerId, stage, level);
    return action !== 'no action' && action !== undefined;
  }, [getPlayerAction]);

  return {
    setPlayerAction,
    setPlayerAmount,
    setPlayerUnit,
    validateSection,
    validatePreflop,
    validateCommunityCardsForStage,
    autoFoldNoAction,
    getPlayerAction,
    getPlayerAmount,
    getPlayerUnit,
    hasPlayerActed
  };
}
