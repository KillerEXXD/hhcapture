/**
 * usePokerEngine Hook
 *
 * Wraps the game engine functions and provides state-aware processing.
 * Handles stack cascade processing and section-by-section execution.
 */

import { useCallback } from 'react';
import type { Player, PlayerData, Stage, ActionLevel } from '../types/poker';
import type { GameState, GameStateActions } from './useGameState';
import {
  processStackCascade,
  processStackSynchronous,
  type ProcessCascadeResult,
  type ProcessSectionResult
} from '../lib/poker/engine/gameEngine';

/**
 * Poker engine hook return type
 */
export interface UsePokerEngineReturn {
  /**
   * Process stack cascade from start to target section
   */
  processCascade: (targetStage: Stage, targetLevel: ActionLevel) => ProcessCascadeResult;

  /**
   * Process a single section synchronously
   */
  processSection: (stage: Stage, level: ActionLevel) => ProcessSectionResult | null;

  /**
   * Check if a section has been processed
   */
  isSectionProcessed: (stage: Stage, level: ActionLevel) => boolean;

  /**
   * Mark a section as processed
   */
  markSectionProcessed: (stage: Stage, level: ActionLevel) => void;

  /**
   * Get section key for a stage and level
   */
  getSectionKey: (stage: Stage, level: ActionLevel) => string;
}

/**
 * Poker engine hook
 *
 * Provides methods for processing poker hand sections and cascading through betting rounds.
 *
 * @param state - Game state
 * @param actions - Game state actions
 * @returns Poker engine methods
 */
export function usePokerEngine(
  state: GameState,
  actions: GameStateActions
): UsePokerEngineReturn {
  /**
   * Get section key for a stage and level
   */
  const getSectionKey = useCallback((stage: Stage, level: ActionLevel): string => {
    const levelStr = level === 'base' ? 'base' : level === 'more' ? 'more' : 'more2';
    return `${stage}_${levelStr}`;
  }, []);

  /**
   * Check if a section has been processed
   */
  const isSectionProcessed = useCallback((stage: Stage, level: ActionLevel): boolean => {
    const key = getSectionKey(stage, level);
    return !!state.processedSections[key];
  }, [state.processedSections, getSectionKey]);

  /**
   * Mark a section as processed
   */
  const markSectionProcessed = useCallback((stage: Stage, level: ActionLevel): void => {
    const key = getSectionKey(stage, level);
    actions.setProcessedSections(prev => ({
      ...prev,
      [key]: true
    }));
  }, [actions, getSectionKey]);

  /**
   * Process a single section synchronously
   */
  const processSection = useCallback((
    stage: Stage,
    level: ActionLevel
  ): ProcessSectionResult | null => {
    const key = getSectionKey(stage, level);

    // Set current processing section
    actions.setCurrentProcessingSection(key);

    // Call the pure game engine function
    const result = processStackSynchronous(
      stage,
      level,
      state.players,
      state.sectionStacks,
      state.playerData,
      state.contributedAmounts,
      state.visibleActionLevels,
      state.defaultUnit
    );

    if (!result) {
      actions.setCurrentProcessingSection(null);
      return null;
    }

    // Update state with results
    // Store the updated stacks for this section
    actions.setSectionStacks(prev => ({
      ...prev,
      [key]: {
        initial: result.currentStacks,
        current: result.currentStacks,
        updated: result.updatedStacks
      }
    }));

    // Store contributed amounts for this section
    actions.setContributedAmounts(prev => ({
      ...prev,
      [key]: result.contributedAmounts
    }));

    // Mark as processed
    markSectionProcessed(stage, level);

    // Set as latest section
    actions.setLatestSection(key);

    // Clear current processing section
    actions.setCurrentProcessingSection(null);

    return result;
  }, [
    state.players,
    state.sectionStacks,
    state.playerData,
    state.contributedAmounts,
    state.visibleActionLevels,
    state.defaultUnit,
    actions,
    getSectionKey,
    markSectionProcessed
  ]);

  /**
   * Process stack cascade from start to target section
   */
  const processCascade = useCallback((
    targetStage: Stage,
    targetLevel: ActionLevel
  ): ProcessCascadeResult => {
    // Set processing flag
    actions.setIsProcessing(true);

    // Call the pure game engine function
    const result = processStackCascade(
      targetStage,
      targetLevel,
      state.players,
      state.playerData,
      state.visibleActionLevels,
      state.defaultUnit
    );

    // Update state with all results
    // The cascade result already has the processed data
    actions.setSectionStacks(prev => ({ ...prev, ...result.sectionStacks }));
    actions.setContributedAmounts(prev => ({ ...prev, ...result.contributedAmounts }));
    actions.setProcessedSections(prev => ({ ...prev, ...result.processedSections }));
    actions.setPlayerData(result.playerData);

    // Set latest section if any sections were processed
    if (result.sectionsProcessed.length > 0) {
      const lastSection = result.sectionsProcessed[result.sectionsProcessed.length - 1];
      const lastKey = getSectionKey(lastSection.stage, lastSection.level);
      actions.setLatestSection(lastKey);
    }

    // Clear processing flag
    actions.setIsProcessing(false);

    return result;
  }, [
    state.players,
    state.playerData,
    state.visibleActionLevels,
    state.defaultUnit,
    actions,
    getSectionKey
  ]);

  return {
    processCascade,
    processSection,
    isSectionProcessed,
    markSectionProcessed,
    getSectionKey
  };
}
