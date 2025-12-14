/**
 * HHTool Modular - Library Exports
 *
 * This file exports all public components, hooks, types, and utilities
 * for use in external applications like TournamentPro.
 *
 * Usage:
 *   import { useGameState, StackSetupView, PreFlopView } from 'hhtool-modular';
 *
 * Note: CSS is imported here to generate the CSS file during build.
 * The consuming app should load it dynamically to avoid conflicts.
 */

// Import CSS so it gets extracted to dist/hhtool-modular.css during build
import './index.css';

// ============================================================================
// HOOKS
// ============================================================================
export { useGameState } from './hooks/useGameState';
export type {
  GameState,
  GameStateActions,
  VisibleActionLevels,
  BettingRoundComplete,
  PotsByStage
} from './hooks/useGameState';

export { usePokerEngine } from './hooks/usePokerEngine';
export type { UsePokerEngineReturn } from './hooks/usePokerEngine';

export { usePotCalculation } from './hooks/usePotCalculation';
export type { UsePotCalculationReturn } from './hooks/usePotCalculation';

export { useCardManagement } from './hooks/useCardManagement';
export type { UseCardManagementReturn } from './hooks/useCardManagement';

export { useActionHandler } from './hooks/useActionHandler';
export type {
  UseActionHandlerReturn,
  PlayerAction,
  ActionValidationResult
} from './hooks/useActionHandler';

// ============================================================================
// COMPONENTS - Main Views
// ============================================================================
export { StackSetupView } from './components/StackSetupView';
export { PreFlopView } from './components/game/PreFlopView';
export { FlopView } from './components/game/FlopView';
export { TurnView } from './components/game/TurnView';
export { RiverView } from './components/game/RiverView';

// ============================================================================
// COMPONENTS - Poker UI
// ============================================================================
export { ActionButtons } from './components/poker/ActionButtons';
export { AmountInput } from './components/poker/AmountInput';
export { CardSelector } from './components/poker/CardSelector';
export { CommunityCardSelector } from './components/poker/CommunityCardSelector';
export { PotCalculationDisplay } from './components/poker/PotCalculationDisplay';
export { WinnerSelectionModal } from './components/poker/WinnerSelectionModal';
export { HandComparisonModal } from './components/poker/HandComparisonModal';

// ============================================================================
// COMPONENTS - UI
// ============================================================================
export { ValidationModal } from './components/ui/ValidationModal';
export { LogRocketControl } from './components/LogRocketControl';

// ============================================================================
// TYPES - Poker
// ============================================================================
export * from './types/poker';

// ============================================================================
// VALIDATORS
// ============================================================================
export {
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
  checkBettingRoundComplete
} from './lib/poker/validators';

export type {
  SectionValidationResult,
  PreflopValidationResult,
  CommunityCards,
  CommunityCardValidationResult,
  RoundCompletionResult
} from './lib/poker/validators';

// ============================================================================
// ENGINES - Pure Logic (no React)
// ============================================================================
export {
  getPreviousSectionAction,
  getActivePlayers,
  calculateCurrentStacksForSection,
  calculateAlreadyContributed,
  processStackSynchronous,
  processStackCascade
} from './lib/poker/engine/gameEngine';

export type {
  ProcessSectionResult,
  ProcessCascadeResult
} from './lib/poker/engine/gameEngine';

export {
  generateDeck,
  shuffleDeck,
  getSelectedCards as getSelectedCardsFromEngine,
  isCardAvailable as isCardAvailableFromEngine,
  getAvailableCardsForPlayer,
  areAllSuitsTaken as areAllSuitsTakenFromEngine,
  assignRandomCardsToPlayer,
  validateCommunityCardsForStage,
  cardToString,
  parseCardString,
  ranks,
  suits
} from './lib/poker/engine/cardEngine';

export {
  gatherContributions,
  calculateDeadMoney,
  createPots,
  calculatePotsForBettingRound,
  checkBettingRoundStatus,
  getPreviousRoundInfo
} from './lib/poker/engine/potCalculationEngine';

export type {
  PlayerContribution as PotPlayerContribution,
  PotInfo
} from './lib/poker/engine/potCalculationEngine';

export {
  formatPotsForDisplay,
  POT_FORMATTER_VERSION
} from './lib/poker/engine/potDisplayFormatter';

export type {
  PlayerContribution as DisplayPlayerContribution,
  StreetContribution,
  DisplayPotInfo,
  DisplayPotData
} from './lib/poker/engine/potDisplayFormatter';

export {
  calculateNewStacks,
  generateNextHand,
  validateButtonRotation,
  validateAllPlayersPresent,
  validateWinnerSelections,
  validateStacksNonNegative,
  validateNextHand,
  processWinnersAndGenerateNextHand
} from './lib/poker/engine/nextHandGenerator';

export type {
  Pot as NextHandPot,
  WinnerSelection,
  NextHandPlayer,
  ValidationResult,
  PlayerContribution as NextHandPlayerContribution
} from './lib/poker/engine/nextHandGenerator';

// ============================================================================
// UTILITIES
// ============================================================================
export {
  formatChips,
  formatStack,
  convertToActualValue,
  convertFromActualValue,
  getAppropriateUnit
} from './lib/poker/utils/formatUtils';

export {
  normalizePosition,
  getPositionOrder,
  inferPlayerPositions,
  getPositionIndex,
  sortPlayersByPosition
} from './lib/poker/utils/positionUtils';

// ============================================================================
// MAIN APP COMPONENT (for standalone usage)
// ============================================================================
export { default as HHToolApp } from './App';
