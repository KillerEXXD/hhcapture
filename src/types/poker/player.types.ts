/**
 * Player Type Definitions
 * Defines types for players, positions, and player data
 */

import { Card } from './card.types';

export type Position =
  | 'Dealer'
  | 'SB'
  | 'BB'
  | 'UTG'
  | 'UTG+1'
  | 'UTG+2'
  | 'LJ'
  | 'MP'
  | 'MP+1'
  | 'MP+2'
  | 'CO'
  | 'HJ'
  | '';

export type Player = {
  id: number;
  name: string;
  position: Position;
  stack: number;
};

export type PlayerDataEntry = {
  // Allow dynamic keys for stage/action combinations
  [key: string]: string | number | boolean | Card | undefined;

  // Known properties
  card1?: Card;
  card2?: Card;
  postedSB?: number;
  postedBB?: number;
  postedAnte?: number;
  allInFromPrevious?: boolean;
  unit?: string;
  isForcedAllInPreflop?: boolean;
};

export type PlayerData = {
  [playerId: number]: PlayerDataEntry;
};

export type PlayerContribution = {
  playerId: number;
  playerName: string;
  position: string;
  totalContributed: number;
  postedSB: number;
  postedBB: number;
  postedAnte: number;
  isFolded: boolean;
  isAllIn: boolean;
  action?: string;
};
