/**
 * Action Type Definitions
 * Defines types for player actions and betting
 */

export type ActionType =
  | 'fold'
  | 'check'
  | 'call'
  | 'bet'
  | 'raise'
  | 'all-in'
  | 'no action'
  | '';

export type PlayerAction = {
  playerId: number;
  stage: string;
  level: string;
  action: ActionType;
  amount?: number;
  unit?: string;
  actualAmount?: number;
};

export type ValidationError = {
  playerId: number;
  playerName: string;
  message: string;
  field: 'action' | 'amount' | 'cards';
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  autoFoldCandidates?: Array<{
    playerId: number;
    playerName: string;
    reason: string;
  }>;
  firstMissingInput?: {
    playerId: number;
    field: 'action' | 'amount';
  };
};

export type BettingRoundCompletionStatus = {
  isComplete: boolean;
  reason: 'matched' | 'all-in' | 'one-remaining' | 'not-more-action' | 'incomplete';
  details: {
    highestBet?: number;
    activePlayers?: Array<{ id: number; name: string; contribution: number }>;
    allInPlayers?: string[];
    oneRemainingPlayer?: string;
  };
};
