/**
 * StackSetupView Component
 *
 * Initial setup view for configuring:
 * - Tournament information (hand number, started time, tournament name/date, YouTube URL)
 * - Blind structure (BB, SB, Ante, Ante Order)
 * - Player data (name, position, stack)
 * - Auto-select cards toggle for testing
 */

import React, { useCallback } from 'react';
import type { Player, ChipUnit, Position, Rank, Suit } from '../types/poker';
import type { GameState, GameStateActions } from '../hooks/useGameState';
import type { UseCardManagementReturn } from '../hooks/useCardManagement';

interface StackSetupViewProps {
  state: GameState;
  actions: GameStateActions;
  cardManagement: UseCardManagementReturn;
  onClearAll: () => void;
  onExport: () => void;
  formatStack: (amount: number) => string;
}

interface ParsedPlayer {
  name: string;
  position: string;
  stack: number;
}

/**
 * Normalize position string to lowercase standard format
 */
function normalizePosition(position: string): string {
  if (!position) return '';
  const pos = position.toLowerCase().trim();
  if (pos === 'dealer' || pos === 'btn' || pos === 'button') return 'dealer';
  if (pos === 'sb' || pos === 'small blind') return 'sb';
  if (pos === 'bb' || pos === 'big blind') return 'bb';
  return position;
}

/**
 * Infer player positions based on dealer, SB, and BB
 */
function inferPlayerPositions(players: Player[]): Player[] {
  const dealerIndex = players.findIndex(p => normalizePosition(p.position) === 'dealer');
  const sbIndex = players.findIndex(p => normalizePosition(p.position) === 'sb');
  const bbIndex = players.findIndex(p => normalizePosition(p.position) === 'bb');

  if (dealerIndex === -1 || sbIndex === -1 || bbIndex === -1) {
    console.error('Missing Dealer, SB, or BB position');
    return players;
  }

  const totalPlayers = players.filter(p => p.name).length;

  // Position names by table size (2-9 players)
  const positionsByTableSize: { [key: number]: string[] } = {
    2: ['SB', 'BB'],
    3: ['Dealer', 'SB', 'BB'],
    4: ['Dealer', 'SB', 'BB', 'UTG'],
    5: ['Dealer', 'SB', 'BB', 'UTG', 'CO'],
    6: ['Dealer', 'SB', 'BB', 'UTG', 'MP', 'CO'],
    7: ['Dealer', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'CO'],
    8: ['Dealer', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP', 'CO'],
    9: ['Dealer', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'LJ', 'HJ', 'CO']
  };

  const positions = positionsByTableSize[totalPlayers] || [];

  // Map positions based on dealer
  const updatedPlayers: Player[] = players.map((player, index) => {
    if (!player.name) return player;

    // Keep explicit positions
    const normalized = normalizePosition(player.position);
    if (normalized === 'dealer' || normalized === 'sb' || normalized === 'bb') {
      return player;
    }

    // Calculate position based on dealer
    const offset = (index - dealerIndex + totalPlayers) % totalPlayers;
    const inferredPosition = positions[offset] || '';

    return {
      ...player,
      position: inferredPosition as Position
    };
  });

  return updatedPlayers;
}

/**
 * StackSetupView Component
 */
export function StackSetupView({
  state,
  actions,
  cardManagement,
  onClearAll,
  onExport,
  formatStack
}: StackSetupViewProps): React.ReactElement {

  /**
   * Setup players from raw input
   */
  const setupPlayers = useCallback(() => {
    try {
      console.log('=== setupPlayers CALLED ===');
      const lines = (state.stackData.rawInput || '').trim().split('\n');
      const parsedPlayers: ParsedPlayer[] = [];

      lines.forEach((line: string) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const parts = trimmedLine.split(/\s+/);
        if (parts.length >= 2) {
          const name = parts[0];
          let position = '';
          let stack = 0;

          if (parts[1] === 'Dealer' || parts[1] === 'SB' || parts[1] === 'BB') {
            position = parts[1];
            stack = parseFloat(parts[2]) || 0;
          } else {
            stack = parseFloat(parts[1]) || 0;
          }

          if (name && stack > 0) {
            parsedPlayers.push({ name, position, stack });
          }
        }
      });

      if (parsedPlayers.length === 0) {
        alert('No valid players found. Please check the format.');
        return;
      }
      if (parsedPlayers.length > 9) {
        alert(`Found ${parsedPlayers.length} players, but maximum is 9. Only the first 9 will be used.`);
      }

      console.log('📋 Parsed players:', parsedPlayers.length);
      parsedPlayers.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} - ${p.position || 'no position'} - ${p.stack}`);
      });

      // Update players array
      const updatedPlayers: Player[] = state.players.map((player, index) => {
        if (index < parsedPlayers.length) {
          return {
            id: player.id,
            name: parsedPlayers[index].name,
            position: parsedPlayers[index].position as Position,
            stack: parsedPlayers[index].stack,
            inputOrder: index
          };
        }
        return { id: player.id, name: '', position: '' as Position, stack: 0, inputOrder: index };
      });

      // Infer positions
      const playersWithInferredPositions = inferPlayerPositions(updatedPlayers);

      // Track posted amounts for sectionStacks initialization
      const postedAmountsMap: Record<number, { postedSB: number; postedBB: number; postedAnte: number; isForcedAllIn: boolean; forcedAllInAmount: number }> = {};

      // Calculate posted blinds/ante for each player
      playersWithInferredPositions.forEach(player => {
        if (!player.name || player.stack === 0) return;

        const normalizedPosition = normalizePosition(player.position);
        let postedSB = 0;
        let postedBB = 0;
        let postedAnte = 0;
        let isForcedAllIn = false;
        let forcedAllInAmount = 0;

        // SB player
        if (normalizedPosition === 'sb') {
          postedSB = Math.min(state.stackData.smallBlind, player.stack);
          if (player.stack <= state.stackData.smallBlind) {
            isForcedAllIn = true;
            forcedAllInAmount = player.stack;
          }
        }

        // Heads up: Dealer posts SB
        if (playersWithInferredPositions.filter(p => p.name).length === 2 && normalizedPosition === 'dealer') {
          postedSB = Math.min(state.stackData.smallBlind, player.stack);
          if (player.stack <= state.stackData.smallBlind) {
            isForcedAllIn = true;
            forcedAllInAmount = player.stack;
          }
        }

        // BB player
        if (normalizedPosition === 'bb') {
          if (state.stackData.anteOrder === 'BB First') {
            // BB First: BB posts BB first, then Ante
            postedBB = Math.min(state.stackData.bigBlind, player.stack);
            const remainingAfterBB = player.stack - postedBB;

            if (player.stack <= state.stackData.bigBlind) {
              isForcedAllIn = true;
              forcedAllInAmount = postedBB;
            } else if (remainingAfterBB > 0) {
              postedAnte = Math.min(state.stackData.ante, remainingAfterBB);
              if (remainingAfterBB <= state.stackData.ante) {
                isForcedAllIn = true;
                forcedAllInAmount = postedBB;
              }
            }
          } else {
            // Ante First: Ante posts first, then BB
            postedAnte = Math.min(state.stackData.ante, player.stack);
            const remainingAfterAnte = player.stack - postedAnte;

            if (player.stack <= state.stackData.ante) {
              isForcedAllIn = true;
              forcedAllInAmount = 0; // All-in with just ante, no live bet
            } else if (remainingAfterAnte > 0) {
              postedBB = Math.min(state.stackData.bigBlind, remainingAfterAnte);
              if (remainingAfterAnte <= state.stackData.bigBlind) {
                isForcedAllIn = true;
                forcedAllInAmount = postedBB;
              }
            }
          }
        }

        // Store posted amounts in map for sectionStacks initialization
        postedAmountsMap[player.id] = {
          postedSB,
          postedBB,
          postedAnte,
          isForcedAllIn,
          forcedAllInAmount
        };

        // Update player data with posted amounts
        actions.updatePlayerData(player.id, 'postedSB', postedSB, '');
        actions.updatePlayerData(player.id, 'postedBB', postedBB, '');
        actions.updatePlayerData(player.id, 'postedAnte', postedAnte, '');
        if (isForcedAllIn) {
          actions.updatePlayerData(player.id, 'isForcedAllInPreflop', true, '');
          actions.updatePlayerData(player.id, 'forcedAllInAmount', forcedAllInAmount, '');
        }
      });

      // Set players
      actions.setPlayers(playersWithInferredPositions);

      // FR-14.1: Initialize "Now" stacks for preflop_base
      // When Setup Players is clicked, set initial "Now" stack = starting stack - posted blinds/antes
      console.log('🔍 [StackSetupView] Initializing sectionStacks for', playersWithInferredPositions.length, 'players');
      const initialSectionStacks: any = {};
      initialSectionStacks['preflop_base'] = {
        initial: {},
        current: {},
        updated: {}
      };

      playersWithInferredPositions.forEach(player => {
        console.log('🔍 [StackSetupView] Player:', player.id, player.name, 'stack:', player.stack);
        if (player.name && player.stack > 0) {
          const posted = postedAmountsMap[player.id] || { postedSB: 0, postedBB: 0, postedAnte: 0, isForcedAllIn: false, forcedAllInAmount: 0 };
          const totalPosted = posted.postedSB + posted.postedBB + posted.postedAnte;

          // Starting stack = player's initial stack (before posting blinds)
          initialSectionStacks['preflop_base'].initial[player.id] = player.stack;

          // Now stack = starting stack MINUS posted blinds/antes
          const nowStack = player.stack - totalPosted;
          initialSectionStacks['preflop_base'].current[player.id] = nowStack;
          initialSectionStacks['preflop_base'].updated[player.id] = nowStack;

          console.log(`   ✅ Player ${player.id} (${player.name}): starting=${player.stack}, posted=${totalPosted} (SB:${posted.postedSB}, BB:${posted.postedBB}, Ante:${posted.postedAnte}), now=${nowStack}, forcedAllIn=${posted.isForcedAllIn}`);
        }
      });

      console.log('🔍 [StackSetupView] Calling setSectionStacks with:', JSON.stringify(initialSectionStacks, null, 2));
      actions.setSectionStacks(initialSectionStacks);
      console.log('✅ [StackSetupView] Initialized "Now" stacks for preflop_base')

      // Auto-select cards if enabled
      if (state.autoSelectCards) {
        console.log('🎴 Auto-selecting cards for all players...');

        // Create a full deck
        const ranks: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
        const suits: Suit[] = ['♠', '♥', '♦', '♣'];
        const fullDeck: Array<{ rank: Rank; suit: Suit }> = [];

        for (const rank of ranks) {
          for (const suit of suits) {
            fullDeck.push({ rank, suit });
          }
        }

        // Shuffle the deck
        for (let i = fullDeck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
        }

        // Assign cards to each player
        let cardIndex = 0;
        playersWithInferredPositions.forEach(player => {
          if (player.name && player.stack > 0) {
            // Assign Card 1
            if (cardIndex < fullDeck.length) {
              const card1 = fullDeck[cardIndex++];
              cardManagement.updatePlayerCard(player.id, 1, card1);
              console.log(`  Player ${player.id} (${player.name}) Card 1: ${card1.rank}${card1.suit}`);
            }

            // Assign Card 2
            if (cardIndex < fullDeck.length) {
              const card2 = fullDeck[cardIndex++];
              cardManagement.updatePlayerCard(player.id, 2, card2);
              console.log(`  Player ${player.id} (${player.name}) Card 2: ${card2.rank}${card2.suit}`);
            }
          }
        });

        console.log('✅ Auto-select cards complete');
      }

      // Switch to preflop view
      actions.setCurrentView('preflop');

      console.log('✅ Players setup complete');
    } catch (error) {
      console.error('Error setting up players:', error);
      alert('Error setting up players. Please check the console for details.');
    }
  }, [state.stackData, state.players, state.autoSelectCards, actions, cardManagement]);

  /**
   * Handle auto-select cards toggle
   */
  const handleAutoSelectCardsToggle = useCallback((checked: boolean) => {
    actions.setAutoSelectCards(checked);
    console.log('Auto-select cards:', checked);
  }, [actions]);

  /**
   * Navigation buttons
   */
  const navigationButtons = (
    <div className="flex flex-wrap gap-1">
      <button className="px-2 py-1 rounded text-xs font-medium bg-purple-600 text-white">
        Stack
      </button>
      <button
        className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        disabled
      >
        Pre-flop
      </button>
      <button
        className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        disabled
      >
        Flop
      </button>
    </div>
  );

  return (
    <div className="p-2 max-w-full mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-3">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-lg font-bold text-gray-800">Stack Setup</h1>
          <div className="flex gap-2">
            <button
              onClick={() => actions.setCurrentView('pot-demo' as any)}
              className="px-2 py-0.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors font-semibold"
              title="View Pot Calculation Display Demo"
            >
              🎰 Pot Demo
            </button>
            <button
              onClick={onClearAll}
              className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onExport}
              className="px-2 py-0.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
            >
              Export
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-3 p-2 bg-gray-100 rounded">
          {navigationButtons}
        </div>

        <div className="space-y-3">
          {/* Tournament Information */}
          <div className="border border-gray-300 rounded p-3 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Tournament Information</h3>
            <div className="space-y-2">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Hand #:</label>
                  <input
                    type="text"
                    value={state.stackData.handNumber || ''}
                    onChange={(e) => actions.setStackData({ ...state.stackData, handNumber: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Started:</label>
                  <input
                    type="text"
                    value={state.stackData.startedAt || ''}
                    onChange={(e) => actions.setStackData({ ...state.stackData, startedAt: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="HH:mm:ss"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Tournament:</label>
                  <input
                    type="text"
                    value={state.stackData.tournamentName || ''}
                    onChange={(e) => actions.setStackData({ ...state.stackData, tournamentName: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Date:</label>
                  <input
                    type="text"
                    value={state.stackData.tournamentDate || ''}
                    onChange={(e) => actions.setStackData({ ...state.stackData, tournamentDate: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="yyyy/mm/dd"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600">YouTube URL:</label>
                <input
                  type="text"
                  value={state.stackData.youtubeUrl || ''}
                  onChange={(e) => actions.setStackData({ ...state.stackData, youtubeUrl: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          {/* Blind Structure */}
          <div className="border border-gray-300 rounded p-3 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Blind Structure</h3>
            <div className="space-y-2">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-600">BB:</label>
                  <input
                    type="number"
                    value={state.stackData.bigBlind}
                    onChange={(e) => actions.setStackData({ ...state.stackData, bigBlind: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600">SB:</label>
                  <input
                    type="number"
                    value={state.stackData.smallBlind}
                    onChange={(e) => actions.setStackData({ ...state.stackData, smallBlind: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Ante:</label>
                  <input
                    type="number"
                    value={state.stackData.ante}
                    onChange={(e) => actions.setStackData({ ...state.stackData, ante: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Ante Order:</label>
                <select
                  value={state.stackData.anteOrder || 'BB First'}
                  onChange={(e) => actions.setStackData({ ...state.stackData, anteOrder: e.target.value as 'BB First' | 'Dealer First' })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="BB First">BB First</option>
                  <option value="Ante First">Ante First</option>
                </select>
              </div>

              {/* Auto-Select Cards Toggle */}
              <div
                style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'white'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 5px 0',
                      fontSize: '18px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>🎴</span>
                      <span>Auto-Select Cards (Testing Mode)</span>
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      opacity: 0.9,
                      lineHeight: '1.4'
                    }}>
                      Automatically populate all player cards and community cards for faster testing
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '60px',
                    height: '34px',
                    marginLeft: '20px',
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={state.autoSelectCards}
                      onChange={(e) => handleAutoSelectCardsToggle(e.target.checked)}
                      style={{
                        opacity: 0,
                        width: 0,
                        height: 0
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: state.autoSelectCards ? '#4ade80' : '#cbd5e1',
                      transition: 'background-color 0.3s',
                      borderRadius: '34px',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <span style={{
                        position: 'absolute',
                        height: '26px',
                        width: '26px',
                        left: state.autoSelectCards ? '30px' : '4px',
                        bottom: '4px',
                        backgroundColor: 'white',
                        transition: 'left 0.3s',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}></span>
                    </span>
                  </label>
                </div>

                {/* Status Indicator */}
                {state.autoSelectCards && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>✅</span>
                    <span>Cards auto-selected! Click Setup Players again to refresh cards</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Player Data Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Player Data (Name Position Stack - one per line)
            </label>
            <textarea
              value={state.stackData.rawInput || ''}
              onChange={(e) => actions.setStackData({ ...state.stackData, rawInput: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
              rows={8}
              placeholder={'Example:\nJohn Dealer 10000\nJane SB 8500\nBob BB 12000'}
            />
            <div className="text-xs text-gray-600 mt-1">
              Format: Name [Position] Stack
              <br />Position: Dealer, SB, or BB (optional for other players)
            </div>
          </div>

          {/* Setup Button */}
          <button
            onClick={setupPlayers}
            className="w-full px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Setup Players
          </button>

          {/* Current Players Display */}
          {state.players.some(p => p.name) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <h3 className="text-sm font-bold text-blue-900 mb-2">Current Players</h3>
              <div className="space-y-1">
                {state.players.filter(p => p.name).map((player, index) => (
                  <div key={player.id} className="text-xs">
                    <span className="font-medium">{index + 1}. {player.name}</span>
                    {player.position && <span className="ml-2 text-blue-600">({player.position})</span>}
                    <span className="ml-2 text-gray-600">Stack: {formatStack(player.stack)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
