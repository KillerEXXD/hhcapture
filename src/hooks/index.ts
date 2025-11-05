/**
 * Hooks Module
 *
 * Exports all custom React hooks for poker hand collector state management.
 */

export { useGameState } from './useGameState';
export type {
  GameState,
  GameStateActions,
  VisibleActionLevels,
  BettingRoundComplete,
  PotsByStage
} from './useGameState';

export { usePokerEngine } from './usePokerEngine';
export type { UsePokerEngineReturn } from './usePokerEngine';

export { usePotCalculation } from './usePotCalculation';
export type { UsePotCalculationReturn } from './usePotCalculation';

export { useCardManagement } from './useCardManagement';
export type { UseCardManagementReturn } from './useCardManagement';

export { useActionHandler } from './useActionHandler';
export type {
  UseActionHandlerReturn,
  PlayerAction,
  ActionValidationResult
} from './useActionHandler';
