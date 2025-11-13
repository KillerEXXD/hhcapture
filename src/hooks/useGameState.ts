/**
 * useGameState Hook
 *
 * Central state management for the poker hand collector.
 * Consolidates all game-related state including players, cards, actions, and UI state.
 */

import { useState, useCallback } from 'react';
import type {
  Player,
  PlayerData,
  Card,
  Stage,
  ActionLevel,
  GameConfig,
  SectionStacks,
  ProcessedSections,
  CompletedSections,
  ChipUnit
} from '../types/poker';
import type { CommunityCards } from '../lib/poker/validators';
import type { ContributedAmounts } from '../types/poker/pot.types';

/**
 * Visible action levels per stage
 */
export type VisibleActionLevels = {
  [stage: string]: ActionLevel[];
};

/**
 * Betting round completion status
 */
export type BettingRoundComplete = {
  [sectionKey: string]: {
    isComplete: boolean;
    reason: string;
    pendingPlayers: string[];
  };
};

/**
 * Pots by stage
 */
export type PotsByStage = {
  [sectionKey: string]: any; // Will be PotStructure from pot engine
};

/**
 * Game state interface
 */
export interface GameState {
  // Player state
  players: Player[];
  playerData: PlayerData;

  // Game configuration
  defaultUnit: ChipUnit;
  stackData: GameConfig;
  autoSelectCards: boolean;

  // View state
  currentView: string;
  showFoldedPlayers: boolean;

  // Community cards
  communityCards: CommunityCards;

  // Action levels
  visibleActionLevels: VisibleActionLevels;

  // Processing state
  isProcessing: boolean;
  processedSections: ProcessedSections;
  sectionStacks: SectionStacks;
  contributedAmounts: ContributedAmounts;
  currentProcessingSection: string | null;
  latestSection: string | null;

  // Betting round state
  bettingRoundComplete: BettingRoundComplete;
  completedSections: CompletedSections;

  // Pot state
  potsByStage: PotsByStage;

  // UI state
  foldingPlayers: Set<number>;
  stackAnimating: Set<string>;

  // Confirmation dialog
  showConfirmDialog: boolean;
  pendingAction: any;
  confirmMessage: string;

  // Focus management
  elementToRefocus: {
    type: 'card' | 'action';
    playerId: number;
    cardNumber?: number;
  } | null;

  // Next hand generation
  generatedNextHand: string | null;
}

/**
 * Game state actions
 */
export interface GameStateActions {
  // Player actions
  setPlayers: (players: Player[]) => void;
  updatePlayerData: (playerId: number, field: string, value: any, suffix?: string) => void;
  setPlayerData: React.Dispatch<React.SetStateAction<PlayerData>>;

  // Configuration actions
  setDefaultUnit: (unit: ChipUnit) => void;
  setStackData: (data: GameConfig) => void;
  setAutoSelectCards: (value: boolean) => void;

  // View actions
  setCurrentView: (view: string) => void;
  setShowFoldedPlayers: (show: boolean) => void;

  // Community card actions
  setCommunityCards: React.Dispatch<React.SetStateAction<CommunityCards>>;
  updateCommunityCard: (stage: Stage, cardNumber: number, card: Card | null) => void;

  // Action level actions
  setVisibleActionLevels: React.Dispatch<React.SetStateAction<VisibleActionLevels>>;
  addActionLevel: (stage: Stage, level: ActionLevel) => void;
  removeActionLevel: (stage: Stage, level: ActionLevel) => void;

  // Processing actions
  setIsProcessing: (processing: boolean) => void;
  setProcessedSections: React.Dispatch<React.SetStateAction<ProcessedSections>>;
  setSectionStacks: React.Dispatch<React.SetStateAction<SectionStacks>>;
  setContributedAmounts: React.Dispatch<React.SetStateAction<ContributedAmounts>>;
  setCurrentProcessingSection: (section: string | null) => void;
  setLatestSection: (section: string | null) => void;

  // Betting round actions
  setBettingRoundComplete: React.Dispatch<React.SetStateAction<BettingRoundComplete>>;
  setCompletedSections: React.Dispatch<React.SetStateAction<CompletedSections>>;

  // Pot actions
  setPotsByStage: React.Dispatch<React.SetStateAction<PotsByStage>>;

  // UI actions
  setFoldingPlayers: React.Dispatch<React.SetStateAction<Set<number>>>;
  setStackAnimating: React.Dispatch<React.SetStateAction<Set<string>>>;

  // Confirmation dialog actions
  setShowConfirmDialog: (show: boolean) => void;
  setPendingAction: (action: any) => void;
  setConfirmMessage: (message: string) => void;

  // Focus management
  setElementToRefocus: (element: GameState['elementToRefocus']) => void;

  // Next hand generation
  setGeneratedNextHand: (hand: string | null) => void;

  // Reset actions
  resetGameState: () => void;
}

/**
 * Initial game state
 */
const createInitialState = (): GameState => ({
  // Player state
  players: Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    name: '',
    position: '',
    stack: 0
  })),
  playerData: {},

  // Game configuration
  defaultUnit: 'K',
  stackData: {
    smallBlind: 0,
    bigBlind: 0,
    ante: 0,
    unit: 'K'
  },
  autoSelectCards: true,

  // View state
  currentView: 'stack',
  showFoldedPlayers: false,

  // Community cards
  communityCards: {
    flop: { card1: null, card2: null, card3: null },
    turn: { card1: null },
    river: { card1: null }
  },

  // Action levels
  visibleActionLevels: {
    preflop: ['base'],
    flop: ['base'],
    turn: ['base'],
    river: ['base']
  },

  // Processing state
  isProcessing: false,
  processedSections: {},
  sectionStacks: {},
  contributedAmounts: {},
  currentProcessingSection: null,
  latestSection: null,

  // Betting round state
  bettingRoundComplete: {},
  completedSections: {},

  // Pot state
  potsByStage: {},

  // UI state
  foldingPlayers: new Set(),
  stackAnimating: new Set(),

  // Confirmation dialog
  showConfirmDialog: false,
  pendingAction: null,
  confirmMessage: '',

  // Focus management
  elementToRefocus: null,

  // Next hand generation
  generatedNextHand: null
});

/**
 * Main game state hook
 *
 * Provides centralized state management for the entire poker hand collector.
 * Returns state object and actions object.
 *
 * @returns [state, actions] tuple
 */
export function useGameState(): [GameState, GameStateActions] {
  // Player state
  const [players, setPlayers] = useState<Player[]>(createInitialState().players);
  const [playerData, setPlayerData] = useState<PlayerData>({});

  // Game configuration
  const [defaultUnit, setDefaultUnit] = useState<ChipUnit>('K');
  const [stackData, setStackData] = useState<GameConfig>({
    handNumber: '#123456',
    startedAt: '14:30:45',
    tournamentName: 'Sunday Million',
    tournamentDate: '2024/03/15',
    youtubeUrl: '',
    bigBlind: 1000,
    smallBlind: 500,
    ante: 1000,
    anteOrder: 'BB First',
    rawInput: 'Hand (1)\nstarted_at: 00:05:40 ended_at: HH:MM:SS\nSB 500 BB 1000 Ante 1000\nStack Setup:\nJohn Dealer 10000\nJane SB 8500\nBob BB 12000\nAlice 9500\nCharlie 11000\nDavid 7500\nEmma 15000\nFrank 9000\nGrace 13000',
    unit: 'K'
  });
  const [autoSelectCards, setAutoSelectCards] = useState<boolean>(true);

  // View state
  const [currentView, setCurrentView] = useState<string>('stack');
  const [showFoldedPlayers, setShowFoldedPlayers] = useState<boolean>(false);

  // Community cards
  const [communityCards, setCommunityCards] = useState<CommunityCards>({
    flop: { card1: null, card2: null, card3: null },
    turn: { card1: null },
    river: { card1: null }
  });

  // Action levels
  const [visibleActionLevels, setVisibleActionLevels] = useState<VisibleActionLevels>({
    preflop: ['base'],
    flop: ['base'],
    turn: ['base'],
    river: ['base']
  });

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedSections, setProcessedSections] = useState<ProcessedSections>({});
  const [sectionStacks, setSectionStacks] = useState<SectionStacks>({});
  const [contributedAmounts, setContributedAmounts] = useState<ContributedAmounts>({});
  const [currentProcessingSection, setCurrentProcessingSection] = useState<string | null>(null);
  const [latestSection, setLatestSection] = useState<string | null>(null);

  // Betting round state
  const [bettingRoundComplete, setBettingRoundComplete] = useState<BettingRoundComplete>({});
  const [completedSections, setCompletedSections] = useState<CompletedSections>({});

  // Pot state
  const [potsByStage, setPotsByStage] = useState<PotsByStage>({});

  // UI state
  const [foldingPlayers, setFoldingPlayers] = useState<Set<number>>(new Set());
  const [stackAnimating, setStackAnimating] = useState<Set<string>>(new Set());

  // Confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>('');

  // Focus management
  const [elementToRefocus, setElementToRefocus] = useState<GameState['elementToRefocus']>(null);

  // Next hand generation
  const [generatedNextHand, setGeneratedNextHand] = useState<string | null>(null);

  // Helper: Update player data
  const updatePlayerData = useCallback((
    playerId: number,
    field: string,
    value: any,
    suffix: string = ''
  ) => {
    setPlayerData(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [`${field}${suffix}`]: value
      }
    }));
  }, []);

  // Helper: Update community card
  const updateCommunityCard = useCallback((
    stage: Stage,
    cardNumber: number,
    card: Card | null
  ) => {
    setCommunityCards(prev => {
      // Type-safe way to update community cards based on stage
      if (stage === 'flop') {
        return {
          ...prev,
          flop: {
            ...prev.flop,
            [`card${cardNumber}`]: card
          }
        };
      } else if (stage === 'turn') {
        return {
          ...prev,
          turn: {
            ...prev.turn,
            card1: card
          }
        };
      } else if (stage === 'river') {
        return {
          ...prev,
          river: {
            ...prev.river,
            card1: card
          }
        };
      }
      return prev;
    });
  }, []);

  // Helper: Add action level
  const addActionLevel = useCallback((stage: Stage, level: ActionLevel) => {
    setVisibleActionLevels(prev => ({
      ...prev,
      [stage]: [...(prev[stage] || []), level]
    }));
  }, []);

  // Helper: Remove action level
  const removeActionLevel = useCallback((stage: Stage, level: ActionLevel) => {
    setVisibleActionLevels(prev => ({
      ...prev,
      [stage]: (prev[stage] || []).filter(l => l !== level)
    }));
  }, []);

  // Helper: Reset game state
  const resetGameState = useCallback(() => {
    const initial = createInitialState();
    setPlayers(initial.players);
    setPlayerData(initial.playerData);
    setDefaultUnit(initial.defaultUnit);
    setStackData(initial.stackData);
    setAutoSelectCards(initial.autoSelectCards);
    setCurrentView(initial.currentView);
    setShowFoldedPlayers(initial.showFoldedPlayers);
    setCommunityCards(initial.communityCards);
    setVisibleActionLevels(initial.visibleActionLevels);
    setIsProcessing(initial.isProcessing);
    setProcessedSections(initial.processedSections);
    setSectionStacks(initial.sectionStacks);
    setContributedAmounts(initial.contributedAmounts);
    setCurrentProcessingSection(initial.currentProcessingSection);
    setLatestSection(initial.latestSection);
    setBettingRoundComplete(initial.bettingRoundComplete);
    setCompletedSections(initial.completedSections);
    setPotsByStage(initial.potsByStage);
    setFoldingPlayers(initial.foldingPlayers);
    setStackAnimating(initial.stackAnimating);
    setShowConfirmDialog(initial.showConfirmDialog);
    setPendingAction(initial.pendingAction);
    setConfirmMessage(initial.confirmMessage);
    setElementToRefocus(initial.elementToRefocus);
    setGeneratedNextHand(initial.generatedNextHand);
  }, []);

  // Build state object
  const state: GameState = {
    players,
    playerData,
    defaultUnit,
    stackData,
    autoSelectCards,
    currentView,
    showFoldedPlayers,
    communityCards,
    visibleActionLevels,
    isProcessing,
    processedSections,
    sectionStacks,
    contributedAmounts,
    currentProcessingSection,
    latestSection,
    bettingRoundComplete,
    completedSections,
    potsByStage,
    foldingPlayers,
    stackAnimating,
    showConfirmDialog,
    pendingAction,
    confirmMessage,
    elementToRefocus,
    generatedNextHand
  };

  // Build actions object
  const actions: GameStateActions = {
    setPlayers,
    updatePlayerData,
    setPlayerData,
    setDefaultUnit,
    setStackData,
    setAutoSelectCards,
    setCurrentView,
    setShowFoldedPlayers,
    setCommunityCards,
    updateCommunityCard,
    setVisibleActionLevels,
    addActionLevel,
    removeActionLevel,
    setIsProcessing,
    setProcessedSections,
    setSectionStacks,
    setContributedAmounts,
    setCurrentProcessingSection,
    setLatestSection,
    setBettingRoundComplete,
    setCompletedSections,
    setPotsByStage,
    setFoldingPlayers,
    setStackAnimating,
    setShowConfirmDialog,
    setPendingAction,
    setConfirmMessage,
    setElementToRefocus,
    setGeneratedNextHand,
    resetGameState
  };

  return [state, actions];
}
