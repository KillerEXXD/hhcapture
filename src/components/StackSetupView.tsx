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
import { parseHandFormat } from '../lib/poker/utils/handFormatParser';

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
    // Show confirmation dialog
    const hasExistingData = state.players.some(p => p.name) ||
                           Object.keys(state.playerData).length > 0 ||
                           state.currentView !== 'stack';

    if (hasExistingData) {
      const confirmed = window.confirm(
        '⚠️ WARNING: This will clear all entered data and start fresh!\n\n' +
        'All player data, cards, actions, and progress will be lost.\n\n' +
        'Do you want to continue?'
      );

      if (!confirmed) {
        return; // User cancelled
      }
    }

    try {
      console.log('=== setupPlayers CALLED ===');

      // COMPLETE RESET: Clear all game state before loading new hand
      console.log('🔄 Resetting all game state...');

      // Reset player data (actions, amounts, cards, etc.)
      actions.setPlayerData({});

      // Reset all contributions
      actions.setContributedAmounts({});

      // Reset processed sections
      actions.setProcessedSections({});

      // Reset all pots
      actions.setPotsByStage({});

      // Reset visible action levels (remove MORE action sections)
      actions.setVisibleActionLevels({ preflop: ['base'], flop: ['base'], turn: ['base'], river: ['base'] });

      // Reset section stacks (will be reinitialized)
      actions.setSectionStacks({});

      // Reset community cards (all null for fresh start)
      actions.setCommunityCards({
        flop: { card1: null, card2: null, card3: null },
        turn: { card1: null },
        river: { card1: null }
      });

      // Reset view to stack
      actions.setCurrentView('stack');

      console.log('✅ Complete reset done, loading new hand...');

      const rawInput = (state.stackData.rawInput || '').trim();

      // Try to parse as 4-line header format first
      const handFormatData = parseHandFormat(rawInput);
      let parsedPlayers: ParsedPlayer[] = [];

      // Capture blind values to use immediately (state.stackData will be stale after setStackData)
      let smallBlindValue = state.stackData.smallBlind;
      let bigBlindValue = state.stackData.bigBlind;
      let anteValue = state.stackData.ante;
      let anteOrderValue = state.stackData.anteOrder;

      console.log('🔍 [setupPlayers] Initial blind values from state.stackData:', {
        smallBlind: smallBlindValue,
        bigBlind: bigBlindValue,
        ante: anteValue,
        anteOrder: anteOrderValue
      });

      if (handFormatData) {
        console.log('✅ Parsed 4-line header format');
        console.log('  Hand Number:', handFormatData.header.handNumber);
        console.log('  Started At:', handFormatData.header.startedAt);
        console.log('  SB:', handFormatData.header.sb, 'BB:', handFormatData.header.bb, 'Ante:', handFormatData.header.ante);

        // ALWAYS use values from textarea (parsed values are the source of truth)
        smallBlindValue = handFormatData.header.sb;
        bigBlindValue = handFormatData.header.bb;
        anteValue = handFormatData.header.ante;

        console.log('📝 Using parsed blind values from textarea:', {
          smallBlind: smallBlindValue,
          bigBlind: bigBlindValue,
          ante: anteValue
        });

        // Auto-populate input fields AND update the values used for calculation
        actions.setStackData({
          ...state.stackData,
          handNumber: handFormatData.header.handNumber,
          startedAt: handFormatData.header.startedAt,
          smallBlind: smallBlindValue,
          bigBlind: bigBlindValue,
          ante: anteValue
        });

        console.log('✅ stackData updated, blind input fields auto-populated with parsed values');

        // Use parsed players
        parsedPlayers = handFormatData.players;
        console.log('📋 Parsed', parsedPlayers.length, 'players from 4-line format');
      } else {
        // Fall back to simple format parsing (just player lines)
        console.log('ℹ️ Using simple format (no header)');
        const lines = rawInput.split('\n');

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
              stack = parseFloat(parts[2]?.replace(/,/g, '') || '0') || 0;
            } else {
              stack = parseFloat(parts[1]?.replace(/,/g, '') || '0') || 0;
            }

            if (name && stack >= 0) { // Allow 0 stacks
              parsedPlayers.push({ name, position, stack });
            }
          }
        });
      }

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
        if (!player.name) return;

        const normalizedPosition = normalizePosition(player.position);
        let postedSB = 0;
        let postedBB = 0;
        let postedAnte = 0;
        let isForcedAllIn = false;
        let forcedAllInAmount = 0;

        // Handle players with 0 chips - they post nothing, fold button pre-selected and highlighted
        if (player.stack === 0) {
          // 0-chip players: posted amounts = 0, fold button pre-selected (highlighted)
          postedAmountsMap[player.id] = {
            postedSB: 0,
            postedBB: 0,
            postedAnte: 0,
            isForcedAllIn: false,
            forcedAllInAmount: 0
          };

          // Pre-select fold action (this highlights the fold button in red)
          // User can still see the highlighted fold button, only fold is enabled
          actions.updatePlayerData(player.id, 'preflopAction', 'fold', '');
          actions.updatePlayerData(player.id, 'postedSB', 0, '');
          actions.updatePlayerData(player.id, 'postedBB', 0, '');
          actions.updatePlayerData(player.id, 'postedAnte', 0, '');

          console.log(`   🚫 Player ${player.id} (${player.name}) has 0 chips - posted=0, fold button highlighted`);
          return; // Skip further processing for 0-chip players
        }

        // SB player (with chips)
        if (normalizedPosition === 'sb') {
          console.log(`🔍 [setupPlayers] SB player ${player.name} posting SB:`, {
            smallBlindValue,
            playerStack: player.stack,
            willPost: Math.min(smallBlindValue, player.stack)
          });
          postedSB = Math.min(smallBlindValue, player.stack);
          if (player.stack <= smallBlindValue) {
            isForcedAllIn = true;
            forcedAllInAmount = player.stack;
          }
        }

        // Heads up: Dealer posts SB (with chips)
        if (playersWithInferredPositions.filter(p => p.name).length === 2 && normalizedPosition === 'dealer') {
          postedSB = Math.min(smallBlindValue, player.stack);
          if (player.stack <= smallBlindValue) {
            isForcedAllIn = true;
            forcedAllInAmount = player.stack;
          }
        }

        // BB player
        if (normalizedPosition === 'bb') {
          if (anteOrderValue === 'BB First') {
            // BB First: BB posts BB first, then Ante
            postedBB = Math.min(bigBlindValue, player.stack);
            const remainingAfterBB = player.stack - postedBB;

            if (player.stack <= bigBlindValue) {
              isForcedAllIn = true;
              forcedAllInAmount = postedBB;
            } else if (remainingAfterBB > 0) {
              postedAnte = Math.min(anteValue, remainingAfterBB);
              if (remainingAfterBB <= anteValue) {
                isForcedAllIn = true;
                forcedAllInAmount = postedBB;
              }
            }
          } else {
            // Ante First: Ante posts first, then BB
            postedAnte = Math.min(anteValue, player.stack);
            const remainingAfterAnte = player.stack - postedAnte;

            if (player.stack <= anteValue) {
              isForcedAllIn = true;
              forcedAllInAmount = 0; // All-in with just ante, no live bet
            } else if (remainingAfterAnte > 0) {
              postedBB = Math.min(bigBlindValue, remainingAfterAnte);
              if (remainingAfterAnte <= bigBlindValue) {
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
        if (player.name) {
          const posted = postedAmountsMap[player.id] || { postedSB: 0, postedBB: 0, postedAnte: 0, isForcedAllIn: false, forcedAllInAmount: 0 };
          const totalPosted = posted.postedSB + posted.postedBB + posted.postedAnte;

          // Starting stack = player's initial stack (before posting blinds)
          initialSectionStacks['preflop_base'].initial[player.id] = player.stack;

          // Now stack = starting stack MINUS posted blinds/antes
          const nowStack = player.stack - totalPosted;
          initialSectionStacks['preflop_base'].current[player.id] = nowStack;
          initialSectionStacks['preflop_base'].updated[player.id] = nowStack;

          if (player.stack === 0) {
            console.log(`   🚫 Player ${player.id} (${player.name}): starting=0, posted=0, now=0, FOLDED (0 chips)`);
          } else {
            console.log(`   ✅ Player ${player.id} (${player.name}): starting=${player.stack}, posted=${totalPosted} (SB:${posted.postedSB}, BB:${posted.postedBB}, Ante:${posted.postedAnte}), now=${nowStack}, forcedAllIn=${posted.isForcedAllIn}`);
          }
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

        // Assign cards to each player (skip 0-chip players)
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
          } else if (player.name && player.stack === 0) {
            console.log(`  Player ${player.id} (${player.name}) - No cards (0 chips, folded)`);
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
   * Load Next Hand - either from generated next hand or clipboard
   */
  const loadNextHandFromClipboard = useCallback(async () => {
    try {
      // First, check if there's a generated next hand
      console.log('🔍 [LoadNextHand] Checking for generated next hand...');
      console.log('🔍 [LoadNextHand] state.generatedNextHand:', state.generatedNextHand);
      console.log('🔍 [LoadNextHand] Type:', typeof state.generatedNextHand);
      console.log('🔍 [LoadNextHand] Length:', state.generatedNextHand?.length);

      if (state.generatedNextHand) {
        console.log('✅ [LoadNextHand] Loading generated next hand:', state.generatedNextHand);
        actions.setStackData({ ...state.stackData, rawInput: state.generatedNextHand });
        alert('✅ Next hand loaded from generation!\n\nClick "Setup Players" to start the new hand.');
        // Clear the generated next hand after loading
        actions.setGeneratedNextHand(null);
        return;
      }

      // If no generated hand, try clipboard
      const clipboardText = await navigator.clipboard.readText();

      if (!clipboardText.trim()) {
        alert('❌ No next hand available!\n\nThe next hand has not been generated yet.\nPlease complete the current hand and generate the next hand first.');
        return;
      }

      // Clear the textarea and paste from clipboard
      actions.setStackData({ ...state.stackData, rawInput: clipboardText });
      alert('✅ Next hand loaded from clipboard!\n\nClick "Setup Players" to start the new hand.');
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      alert('Failed to read from clipboard. Please make sure you have granted clipboard permissions.');
    }
  }, [state.stackData, state.generatedNextHand, actions]);

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
  // Determine which streets are available based on potsByStage
  const hasPreflop = state.potsByStage && Object.keys(state.potsByStage).some(key => key.startsWith('preflop'));
  const hasFlop = state.potsByStage && Object.keys(state.potsByStage).some(key => key.startsWith('flop'));
  const hasTurn = state.potsByStage && Object.keys(state.potsByStage).some(key => key.startsWith('turn'));
  const hasRiver = state.potsByStage && Object.keys(state.potsByStage).some(key => key.startsWith('river'));

  const navigationButtons = (
    <div className="flex flex-wrap gap-1">
      <button className="px-2 py-1 rounded text-xs font-medium bg-purple-600 text-white">
        Stack
      </button>
      {hasPreflop && (
        <button
          onClick={() => actions.setCurrentView('preflop')}
          className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Pre-flop
        </button>
      )}
      {hasFlop && (
        <button
          onClick={() => actions.setCurrentView('flop')}
          className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Flop
        </button>
      )}
      {hasTurn && (
        <button
          onClick={() => actions.setCurrentView('turn')}
          className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Turn
        </button>
      )}
      {hasRiver && (
        <button
          onClick={() => actions.setCurrentView('river')}
          className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          River
        </button>
      )}
    </div>
  );

  return (
    <div className="p-2 max-w-full mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-3">
        {/* BACK TO HAND HISTORY */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
          <button
            onClick={() => window.open('/tpro.html', '_blank')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Hand History</span>
          </button>
        </div>

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
                  <label className="text-xs text-gray-600">SB:</label>
                  <input
                    type="number"
                    value={state.stackData.smallBlind}
                    onChange={(e) => actions.setStackData({ ...state.stackData, smallBlind: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
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
              Player Data (with 4-line header)
            </label>
            <textarea
              value={state.stackData.rawInput || ''}
              onChange={(e) => actions.setStackData({ ...state.stackData, rawInput: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
              rows={15}
              placeholder={'Hand (1)\nstarted_at: 00:05:40 ended_at: HH:MM:SS\nSB 500 BB 1000 Ante 1000\nStack Setup:\nJohn Dealer 10000\nJane SB 8500\nBob BB 12000\nAlice 9500\nCharlie 11000\nDavid 7500\nEmma 15000\nFrank 9000\nGrace 13000'}
            />
            <div className="text-xs text-gray-600 mt-1">
              <strong>Format:</strong> Line 1: Hand (number) | Line 2: started_at: HH:MM:SS ended_at: HH:MM:SS | Line 3: SB value BB value Ante value | Line 4: Stack Setup: | Lines 5+: Player lines
              <br />
              <strong>Player format:</strong> Name [Position] Stack - Position only for Dealer, SB, BB
              <br />
              <strong>Note:</strong> SB, BB, Ante values from Line 3 will be auto-filled when you click Setup Players.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={setupPlayers}
              className="w-full px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Setup Players
            </button>
          </div>

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
