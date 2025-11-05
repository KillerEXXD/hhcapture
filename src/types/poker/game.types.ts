/**
 * Game Type Definitions
 * Defines types for game configuration, stages, and levels
 */

export type Stage = 'stack' | 'preflop' | 'flop' | 'turn' | 'river';
export type ActionLevel = 'base' | 'more' | 'more2';
export type ActionSuffix = '' | '_moreAction' | '_moreAction2';

export type SectionKey = `${Stage}_${ActionLevel}`;

export type ChipUnit = 'K' | 'Mil' | 'actual';

export type GameConfig = {
  handNumber?: string;
  startedAt?: string;
  tournamentName?: string;
  tournamentDate?: string;
  youtubeUrl?: string;
  bigBlind: number;
  smallBlind: number;
  ante: number;
  anteOrder?: 'BB First' | 'Dealer First';
  rawInput?: string;
  unit?: ChipUnit;
};

export type StackData = GameConfig;

export type VisibleActionLevels = {
  [stage in Stage]?: ActionLevel[];
};

export type ProcessedSections = {
  [key: string]: boolean;
};

export type CompletedSections = {
  [key: string]: boolean;
};

export type SectionStacks = {
  [sectionKey: string]: {
    initial: { [playerId: number]: number };
    current: { [playerId: number]: number };
    updated: { [playerId: number]: number };
  };
};

export type BettingRoundStatus = {
  show: boolean;
  currentStage: Stage;
  currentLevel: ActionLevel;
  nextStage: Stage;
  nextLevel: ActionLevel;
  highestBet: number;
  totalPot: number;
  activePlayers: string[];
  completionReason: 'matched' | 'all-in' | 'one-remaining' | '';
};
