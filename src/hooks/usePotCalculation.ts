/**
 * usePotCalculation Hook
 *
 * Wraps the pot engine and provides state-aware pot calculations.
 * Calculates main pot, side pots, and betting round status.
 */

import { useCallback, useMemo } from 'react';
import type { Player, PlayerData, Stage, ActionLevel } from '../types/poker';
import type { GameState, GameStateActions } from './useGameState';
import type { PotStructure, BettingRoundStatus } from '../types/poker/pot.types';
import {
  calculatePotsForBettingRound,
  checkBettingRoundStatus,
  gatherContributions
} from '../lib/poker/engine/potCalculationEngine';

/**
 * Pot calculation hook return type
 */
export interface UsePotCalculationReturn {
  /**
   * Calculate pots for a betting round
   */
  calculatePots: (
    stage: Stage,
    level: ActionLevel,
    previousStreetPot?: number
  ) => PotStructure | null;

  /**
   * Get calculated pots for a section
   */
  getPotsForSection: (stage: Stage, level: ActionLevel) => PotStructure | null;

  /**
   * Check if a betting round is complete
   */
  checkBettingComplete: (stage: Stage, level: ActionLevel) => BettingRoundStatus;

  /**
   * Update pots for a section
   */
  updatePotsForSection: (stage: Stage, level: ActionLevel, pots: PotStructure) => void;

  /**
   * Get total pot across all sections
   */
  getTotalPot: () => number;

  /**
   * Get pots for display (most recent section)
   */
  getCurrentPots: () => PotStructure | null;
}

/**
 * Pot calculation hook
 *
 * Provides methods for calculating pots and managing pot state.
 *
 * @param state - Game state
 * @param actions - Game state actions
 * @returns Pot calculation methods
 */
export function usePotCalculation(
  state: GameState,
  actions: GameStateActions
): UsePotCalculationReturn {
  /**
   * Get section key for a stage and level
   */
  const getSectionKey = useCallback((stage: Stage, level: ActionLevel): string => {
    const levelStr = level === 'base' ? 'base' : level === 'more' ? 'more' : 'more2';
    return `${stage}_${levelStr}`;
  }, []);

  /**
   * Calculate pots for a betting round
   */
  const calculatePots = useCallback((
    stage: Stage,
    level: ActionLevel,
    previousStreetPot: number = 0
  ): PotStructure | null => {
    const result = calculatePotsForBettingRound(
      stage,
      level,
      state.players,
      state.playerData,
      state.contributedAmounts,
      state.processedSections,
      state.sectionStacks,
      state.stackData,
      previousStreetPot
    );

    return result;
  }, [
    state.players,
    state.playerData,
    state.contributedAmounts,
    state.processedSections,
    state.sectionStacks,
    state.stackData
  ]);

  /**
   * Get calculated pots for a section
   */
  const getPotsForSection = useCallback((
    stage: Stage,
    level: ActionLevel
  ): PotStructure | null => {
    const key = getSectionKey(stage, level);
    return state.potsByStage[key] || null;
  }, [state.potsByStage, getSectionKey]);

  /**
   * Check if a betting round is complete
   */
  const checkBettingComplete = useCallback((
    stage: Stage,
    level: ActionLevel
  ): BettingRoundStatus => {
    // First gather contributions for the betting round
    const contributions = gatherContributions(
      stage,
      level,
      state.players,
      state.playerData,
      state.contributedAmounts,
      state.processedSections,
      state.sectionStacks,
      state.stackData,
      false
    );

    // Then check betting round status
    const result = checkBettingRoundStatus(contributions);

    return result;
  }, [
    state.players,
    state.playerData,
    state.contributedAmounts,
    state.processedSections,
    state.sectionStacks,
    state.stackData
  ]);

  /**
   * Update pots for a section
   */
  const updatePotsForSection = useCallback((
    stage: Stage,
    level: ActionLevel,
    pots: PotStructure
  ): void => {
    const key = getSectionKey(stage, level);
    actions.setPotsByStage(prev => ({
      ...prev,
      [key]: pots
    }));

    // Also update betting round complete status
    actions.setBettingRoundComplete(prev => ({
      ...prev,
      [key]: {
        isComplete: pots.bettingRoundStatus.complete,
        reason: pots.bettingRoundStatus.reason,
        pendingPlayers: pots.bettingRoundStatus.pendingPlayers || []
      }
    }));
  }, [actions, getSectionKey]);

  /**
   * Get total pot across all sections
   */
  const getTotalPot = useCallback((): number => {
    let total = 0;

    Object.values(state.potsByStage).forEach((potStructure: PotStructure) => {
      if (potStructure && potStructure.totalPot) {
        total = Math.max(total, potStructure.totalPot);
      }
    });

    return total;
  }, [state.potsByStage]);

  /**
   * Get pots for display (most recent section)
   */
  const getCurrentPots = useCallback((): PotStructure | null => {
    if (!state.latestSection) {
      return null;
    }

    return state.potsByStage[state.latestSection] || null;
  }, [state.latestSection, state.potsByStage]);

  return {
    calculatePots,
    getPotsForSection,
    checkBettingComplete,
    updatePotsForSection,
    getTotalPot,
    getCurrentPots
  };
}
