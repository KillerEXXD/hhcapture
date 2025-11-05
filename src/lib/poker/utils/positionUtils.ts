/**
 * Position Utilities
 * Functions for managing player positions at the table
 */

import { Player, Position } from '../../../types/poker';

/**
 * Normalize position string to standard format
 */
export function normalizePosition(position: string): Position {
  const normalized = position.trim().toUpperCase();

  const positionMap: { [key: string]: Position } = {
    'BTN': 'Dealer',
    'BUTTON': 'Dealer',
    'D': 'Dealer',
    'DEALER': 'Dealer',
    'SB': 'SB',
    'SMALL BLIND': 'SB',
    'BB': 'BB',
    'BIG BLIND': 'BB',
    'UTG': 'UTG',
    'UTG+1': 'UTG+1',
    'UTG+2': 'UTG+2',
    'MP': 'MP',
    'MP+1': 'MP+1',
    'MP+2': 'MP+2',
    'CO': 'CO',
    'CUTOFF': 'CO',
    'HJ': 'HJ',
    'HIJACK': 'HJ',
  };

  return positionMap[normalized] || (position as Position);
}

/**
 * Get position order for a given table size
 */
export function getPositionOrder(tableSize: number): Position[] {
  // Standard 9-handed positions
  const fullOrder: Position[] = [
    'Dealer',
    'SB',
    'BB',
    'UTG',
    'UTG+1',
    'UTG+2',
    'MP',
    'CO',
    'HJ'
  ];

  // Adjust for smaller tables
  if (tableSize <= 6) {
    return ['Dealer', 'SB', 'BB', 'UTG', 'MP', 'CO'];
  } else if (tableSize <= 7) {
    return ['Dealer', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'CO'];
  } else if (tableSize <= 8) {
    return ['Dealer', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'CO', 'HJ'];
  }

  return fullOrder;
}

/**
 * Infer player positions based on table size and existing positions
 */
export function inferPlayerPositions(players: Player[]): Player[] {
  const activePlayers = players.filter(p => p.name && p.stack > 0);
  const tableSize = activePlayers.length;

  if (tableSize === 0) {
    return players;
  }

  // Find anchor positions (Dealer, SB, BB)
  const dealerIndex = activePlayers.findIndex(p =>
    p.position.toLowerCase() === 'dealer' ||
    p.position.toLowerCase() === 'btn' ||
    p.position.toLowerCase() === 'd'
  );

  const sbIndex = activePlayers.findIndex(p =>
    p.position.toLowerCase() === 'sb' ||
    p.position.toLowerCase() === 'small blind'
  );

  const bbIndex = activePlayers.findIndex(p =>
    p.position.toLowerCase() === 'bb' ||
    p.position.toLowerCase() === 'big blind'
  );

  // If we have a dealer, use that as anchor
  if (dealerIndex !== -1) {
    const positionOrder = getPositionOrder(tableSize);
    const updatedPlayers = [...players];

    activePlayers.forEach((player, index) => {
      const playerIndexInOriginal = players.findIndex(p => p.id === player.id);
      const relativePosition = (index - dealerIndex + tableSize) % tableSize;
      updatedPlayers[playerIndexInOriginal] = {
        ...player,
        position: positionOrder[relativePosition] || player.position
      };
    });

    return updatedPlayers;
  }

  // If no dealer but have SB/BB, infer from there
  if (sbIndex !== -1 || bbIndex !== -1) {
    const anchorIndex = sbIndex !== -1 ? sbIndex : bbIndex;
    const anchorOffset = sbIndex !== -1 ? 1 : 2; // SB is +1 from Dealer, BB is +2

    const positionOrder = getPositionOrder(tableSize);
    const updatedPlayers = [...players];

    activePlayers.forEach((player, index) => {
      const playerIndexInOriginal = players.findIndex(p => p.id === player.id);
      const relativePosition = (index - anchorIndex + anchorOffset + tableSize) % tableSize;
      updatedPlayers[playerIndexInOriginal] = {
        ...player,
        position: positionOrder[relativePosition] || player.position
      };
    });

    return updatedPlayers;
  }

  // No anchor positions found, assign sequentially
  const positionOrder = getPositionOrder(tableSize);
  const updatedPlayers = [...players];

  activePlayers.forEach((player, index) => {
    const playerIndexInOriginal = players.findIndex(p => p.id === player.id);
    updatedPlayers[playerIndexInOriginal] = {
      ...player,
      position: positionOrder[index] || ''
    };
  });

  return updatedPlayers;
}

/**
 * Get the index of a position in the action order
 */
export function getPositionIndex(position: Position, tableSize: number): number {
  const order = getPositionOrder(tableSize);
  return order.indexOf(position);
}

/**
 * Sort players by position order
 */
export function sortPlayersByPosition(players: Player[]): Player[] {
  const activePlayers = players.filter(p => p.name && p.stack > 0);
  const tableSize = activePlayers.length;
  const order = getPositionOrder(tableSize);

  return [...players].sort((a, b) => {
    const aIndex = order.indexOf(a.position);
    const bIndex = order.indexOf(b.position);

    // If both positions are in the order, sort by order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // Otherwise, maintain original order
    return 0;
  });
}
