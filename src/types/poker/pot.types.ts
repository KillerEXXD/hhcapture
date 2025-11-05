/**
 * Pot Type Definitions
 * Defines types for pot calculations and structures
 */

import type { Stage, ActionLevel, ProcessedSections, SectionStacks } from './game.types';
import type { PlayerData, Player } from './player.types';
import type { GameConfig } from './game.types';

/**
 * Previous round information for a player
 * Used to display betting history in UI
 */
export type PreviousRoundInfo = {
  stageName: string;
  levelName: string;
  action: string;
  amount: number;
  sectionKey: string;
} | null;

/**
 * Player in a pot with contribution information
 */
export type PotPlayer = {
  id: number;
  name: string;
  position: string;
  contribution: number;
  totalContribution: number;
  isAllIn?: boolean;
  previousRound?: PreviousRoundInfo;
  reason?: string; // For excluded players
};

/**
 * Individual pot (main or side)
 */
export type Pot = {
  potNumber: number;
  amount: number;
  percentage: number;
  cappedAt: number;
  eligiblePlayers: PotPlayer[];
  excludedPlayers: PotPlayer[];
};

/**
 * Dead money breakdown
 */
export type DeadMoney = {
  total: number;
  ante: number;
  foldedBlinds: number;
  foldedBets: number;
};

/**
 * Player contribution for a betting round
 */
export type Contribution = {
  playerId: number;
  playerName: string;
  position: string;
  totalContributed: number;
  contributions: {
    base: number;
    more: number;
    more2: number;
  };
  postedSB: number;
  postedBB: number;
  postedAnte: number;
  isFolded: boolean;
  isAllIn: boolean;
  currentStack: number;
};

/**
 * Betting round completion status
 */
export type BettingRoundStatus = {
  complete: boolean;
  reason: string;
  pendingPlayers?: string[];
};

/**
 * Complete pot structure for a betting round
 */
export type PotStructure = {
  mainPot: Pot;
  sidePots: Pot[];
  totalPot: number;
  deadMoney: number;
  deadMoneyBreakdown: DeadMoney;
  hasZeroContributor: boolean;
  zeroContributors: PotPlayer[];
  bettingRoundStatus: BettingRoundStatus;
};

/**
 * Previous street pot to carry forward
 */
export type PreviousStreetPot = {
  amount: number;
  stage: string;
};

/**
 * Contributed amounts by section and player
 * Key format: "${stage}_${level}" -> playerId -> amount
 */
export type ContributedAmounts = {
  [sectionKey: string]: {
    [playerId: number]: number;
  };
};
