/**
 * PreFlop View Component
 *
 * Displays the preflop betting round with player cards, actions, and amounts.
 * Implements the modular game view structure from Dev_HHTool.
 */

import React from 'react';
import type { GameState, GameStateActions } from '../../hooks/useGameState';
import type { Player, PlayerData, ActionLevel, ChipUnit, Card, ActionType } from '../../types/poker';
import type { UseCardManagementReturn } from '../../hooks/useCardManagement';
import type { UsePotCalculationReturn } from '../../hooks/usePotCalculation';
import { CardSelector } from '../poker/CardSelector';
import { ActionButtons } from '../poker/ActionButtons';
import { AmountInput } from '../poker/AmountInput';
import { processStackSynchronous } from '../../lib/poker/engine/processStack';
import { calculatePotsForBettingRound } from '../../lib/poker/engine/potCalculationEngine';
import { checkBettingRoundComplete } from '../../lib/poker/validators/roundCompletionValidator';
import { checkPlayerNeedsToAct } from '../../lib/poker/validators/playerActionStatus';

interface PreFlopViewProps {
  state: GameState;
  actions: GameStateActions;
  formatStack: (amount: number) => string;
  onClearAll: () => void;
  onExport: () => void;
  cardManagement: UseCardManagementReturn;
  potCalculation: UsePotCalculationReturn;
}

export const PreFlopView: React.FC<PreFlopViewProps> = ({
  state,
  actions,
  formatStack,
  onClearAll,
  onExport,
  cardManagement,
  potCalculation,
}) => {
  const {
    players,
    playerData,
    currentView,
    visibleActionLevels,
    defaultUnit,
    stackData,
    processedSections,
    sectionStacks,
    contributedAmounts
  } = state;
  const {
    setCurrentView,
    setDefaultUnit,
    setPlayerData,
    setProcessedSections,
    setSectionStacks,
    setContributedAmounts,
    setPotsByStage
  } = actions;

  const units: ChipUnit[] = ['actual', 'K', 'Mil'];

  // State for tracking expanded stack histories
  const [expandedStackHistories, setExpandedStackHistories] = React.useState<Record<string, boolean>>({});

  // Utility function for suit colors
  const getCardColor = (suit: string | null | undefined) => {
    if (!suit) return 'text-gray-500';
    const colors: Record<string, string> = {
      '♠': 'text-gray-900',
      '♣': 'text-green-700',
      '♥': 'text-red-600',
      '♦': 'text-blue-600',
    };
    return colors[suit] || 'text-gray-500';
  };

  // Utility function for action colors (matches ActionButtons color scheme)
  const getActionColorClass = (action: ActionType | null | undefined): string => {
    if (!action) return 'text-gray-700';
    switch (action) {
      case 'fold':
        return 'text-red-500';
      case 'check':
        return 'text-gray-500';
      case 'call':
        return 'text-blue-500';
      case 'bet':
        return 'text-green-500';
      case 'raise':
        return 'text-purple-500';
      case 'all-in':
        return 'text-red-600'; // Red text for all-in display
      case 'no action':
        return 'text-gray-400';
      default:
        return 'text-gray-700';
    }
  };

  const getViewTitle = () => {
    if (currentView === 'stack') return 'Stack Setup';

    if (currentView.includes('-more2')) {
      return 'Preflop - More Action 2';
    } else if (currentView.includes('-more')) {
      return 'Preflop - More Action 1';
    }

    return 'Preflop';
  };

  const handleDefaultUnitChange = (unit: ChipUnit) => {
    setDefaultUnit(unit);
  };

  const getNavigationButtons = () => {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentView('stack')}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400 transition-colors"
        >
          ← Stack
        </button>
        <button
          disabled
          className="px-3 py-1 bg-gray-200 text-gray-400 rounded text-xs font-medium cursor-not-allowed"
        >
          Flop →
        </button>
      </div>
    );
  };

  // Get players who are still active (not folded), sorted by preflop position order
  const getActivePlayers = (): Player[] => {
    const positionOrder: Record<string, number> = {
      'UTG': 1,
      'UTG+1': 2,
      'UTG+2': 3,
      'LJ': 4,
      'MP': 5,
      'HJ': 6,
      'CO': 7,
      'Dealer': 8,
      'SB': 9,
      'BB': 10,
      '': 999
    };

    return players
      .filter((p: Player) => {
        if (!p.name) return false;
        const data = playerData[p.id];
        if (!data) return true;

        // Check if player folded in preflop
        if (data.preflopAction === 'fold') return false;
        if (data.preflop_moreActionAction === 'fold') return false;
        if (data.preflop_moreAction2Action === 'fold') return false;

        return true;
      })
      .sort((a, b) => {
        const orderA = positionOrder[a.position] || 999;
        const orderB = positionOrder[b.position] || 999;
        return orderA - orderB;
      });
  };

  const getFoldedPlayers = (): Player[] => {
    return players.filter((p: Player) => {
      if (!p.name) return false;
      const data = playerData[p.id];
      if (!data) return false;

      // Check if player folded in preflop
      if (data.preflopAction === 'fold') return true;
      if (data.preflop_moreActionAction === 'fold') return true;
      if (data.preflop_moreAction2Action === 'fold') return true;

      return false;
    });
  };

  const handleAddMoreAction = () => {
    const currentLevels = visibleActionLevels.preflop || ['base'];

    // Check if max levels reached
    if (currentLevels.length >= 3) {
      alert('Maximum 3 action levels per street reached');
      return;
    }

    // Determine next level
    const nextLevel: ActionLevel = currentLevels.length === 1 ? 'more' : 'more2';

    // Add the new level to visible action levels
    actions.setVisibleActionLevels({
      ...visibleActionLevels,
      preflop: [...currentLevels, nextLevel],
    });

    // Initialize player data for new level
    const suffix = nextLevel === 'more' ? '_moreAction' : '_moreAction2';
    const activePlayers = getActivePlayers();

    const updatedPlayerData = { ...playerData };
    activePlayers.forEach(player => {
      updatedPlayerData[player.id] = {
        ...updatedPlayerData[player.id],
        [`preflop${suffix}Action`]: 'no action',
        [`preflop${suffix}Amount`]: '',
        [`preflop${suffix}Unit`]: defaultUnit,
      };
    });

    actions.setPlayerData(updatedPlayerData);

    // Focus on first player's Action field in the new level
    setTimeout(() => {
      if (activePlayers.length > 0) {
        const firstPlayer = activePlayers[0];
        const actionFocusAttr = `${firstPlayer.id}-preflop${suffix}`;
        const actionElement = document.querySelector(`[data-action-focus="${actionFocusAttr}"]`) as HTMLElement;
        if (actionElement) {
          actionElement.focus();
        }
      }
    }, 100);
  };

  const handleCreateFlop = () => {
    // Get current action levels
    const currentLevels = visibleActionLevels.preflop || ['base'];
    const lastLevel = currentLevels[currentLevels.length - 1];

    // Check if the stack has been processed for all levels
    for (const level of currentLevels) {
      const sectionKey = `preflop_${level}`;
      if (!processedSections[sectionKey]) {
        alert(`Cannot create Flop. You must click "Process Stack - Preflop" first to process the ${level === 'base' ? 'base' : level === 'more' ? 'More Action 1' : 'More Action 2'} round.`);
        return; // Exit instead of throwing to avoid uncaught exception
      }
    }

    // Validate betting round is complete using the validator
    const completionCheck = checkBettingRoundComplete('preflop', lastLevel, players, playerData);

    if (!completionCheck.isComplete) {
      // Get list of pending players
      const pendingPlayerNames = completionCheck.pendingPlayers
        ? completionCheck.pendingPlayers
            .map(id => players.find(p => p.id === id)?.name)
            .filter(Boolean)
            .join(', ')
        : 'some players';

      alert(
        `Cannot create Flop. Betting round is not complete.\n\n` +
        `Reason: ${completionCheck.reason}\n` +
        `Pending players: ${pendingPlayerNames}`
      );
      return;
    }

    // All checks passed - Transition to flop view
    actions.setCurrentView('flop');

    // Initialize flop action levels if not exists
    if (!visibleActionLevels.flop) {
      actions.setVisibleActionLevels({
        ...visibleActionLevels,
        flop: ['base'],
      });
    }
  };

  /**
   * Calculate updated stack after all contributions up to current action level
   */
  const calculateUpdatedStack = (player: Player, currentActionLevel: ActionLevel): number => {
    const data = playerData[player.id] || {};
    let totalContributions = 0;

    // Helper to convert amount based on unit
    const convertAmount = (amount: string | undefined, unit: ChipUnit | undefined): number => {
      if (!amount || amount === '') return 0;
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) return 0;

      const effectiveUnit = unit || defaultUnit;
      if (effectiveUnit === 'K') return numAmount * 1000;
      if (effectiveUnit === 'Mil') return numAmount * 1000000;
      return numAmount; // 'actual' or 'None'
    };

    // Add base level contributions
    const baseAction = data.preflopAction as ActionType | undefined;
    if (baseAction && baseAction !== 'fold' && baseAction !== 'check' && baseAction !== 'no action') {
      const baseAmount = convertAmount(data.preflopAmount as string | undefined, data.preflopUnit as ChipUnit | undefined);
      totalContributions += baseAmount;
    }

    // Add more action contributions if we're at that level or beyond
    if (currentActionLevel === 'more' || currentActionLevel === 'more2') {
      const moreAction = data.preflop_moreActionAction as ActionType | undefined;
      if (moreAction && moreAction !== 'fold' && moreAction !== 'check' && moreAction !== 'no action') {
        const moreAmount = convertAmount(data.preflop_moreActionAmount as string | undefined, data.preflop_moreActionUnit as ChipUnit | undefined);
        totalContributions += moreAmount;
      }
    }

    // Add more2 action contributions if we're at that level
    if (currentActionLevel === 'more2') {
      const more2Action = data.preflop_moreAction2Action as ActionType | undefined;
      if (more2Action && more2Action !== 'fold' && more2Action !== 'check' && more2Action !== 'no action') {
        const more2Amount = convertAmount(data.preflop_moreAction2Amount as string | undefined, data.preflop_moreAction2Unit as ChipUnit | undefined);
        totalContributions += more2Amount;
      }
    }

    // Also include posted blinds (ante is DEAD MONEY, not counted as live contribution)
    totalContributions += (data.postedSB || 0) + (data.postedBB || 0);

    return player.stack - totalContributions;
  };

  /**
   * Calculate the starting stack for the current action level
   * - For BASE: Initial stack minus posted blinds/antes
   * - For MORE/MORE2: Stack from previous round's "updated" value
   */
  const calculateStartingStack = (player: Player, currentActionLevel: ActionLevel): number => {
    const data = playerData[player.id] || {};

    if (currentActionLevel === 'base') {
      // For BASE: Start with initial stack, subtract posted blinds/antes
      let stackAfterPosting = player.stack;
      const normalizedPos = player.position.toLowerCase();

      if (normalizedPos === 'sb' && data.postedSB) {
        stackAfterPosting -= data.postedSB as number;
      }
      if (normalizedPos === 'bb') {
        if (data.postedBB) stackAfterPosting -= data.postedBB as number;
        if (data.postedAnte) stackAfterPosting -= data.postedAnte as number;
      }

      return stackAfterPosting;
    } else {
      // For MORE/MORE2: Use the "initial" stack from sectionStacks for this level
      // which was set to the "updated" stack from the previous level
      const sectionKey = `preflop_${currentActionLevel}`;
      const sectionData = sectionStacks[sectionKey];

      if (sectionData && sectionData.initial && sectionData.initial[player.id] !== undefined) {
        return sectionData.initial[player.id];
      }

      // Fallback: calculate from previous round's updated stack
      const prevLevel = currentActionLevel === 'more' ? 'base' : 'more';
      const prevSectionKey = `preflop_${prevLevel}`;
      const prevSectionData = sectionStacks[prevSectionKey];

      if (prevSectionData && prevSectionData.updated && prevSectionData.updated[player.id] !== undefined) {
        return prevSectionData.updated[player.id];
      }

      // Last fallback: use initial stack (shouldn't happen if processStack ran)
      return player.stack;
    }
  };

  /**
   * Get available actions for a player based on action level and previous players' actions
   * For MORE ACTION rounds: Only enable players sequentially (previous player must have acted)
   * For BASE rounds: All players are enabled from the start
   *
   * IMPORTANT: If betting round is complete, disable all remaining players
   */
  const getAvailableActionsForPlayer = (playerId: number, suffix: string): ActionType[] => {
    const actionLevel: ActionLevel =
      suffix === '' ? 'base' :
      suffix === '_moreAction' ? 'more' : 'more2';

    // For BASE level, all actions are available for all players
    if (actionLevel === 'base') {
      return ['fold', 'check', 'call', 'bet', 'raise', 'all-in', 'no action'];
    }

    // For MORE ACTION rounds: Sequential enabling logic
    const activePlayers = getActivePlayers();
    const currentPlayerIndex = activePlayers.findIndex(p => p.id === playerId);

    if (currentPlayerIndex === -1) {
      return []; // Player not found
    }

    // Check if player has already acted
    const actionKey = `preflop${suffix}Action` as keyof PlayerData[number];
    const playerAction = playerData[playerId]?.[actionKey];

    // If player has already acted, allow them to modify their action
    // NOTE: Disable 'raise' in More Action 2 only
    if (playerAction && playerAction !== 'no action') {
      if (actionLevel === 'more2') {
        return ['call', 'all-in', 'fold', 'no action']; // No raise in More Action 2
      }
      return ['call', 'raise', 'all-in', 'fold', 'no action']; // Raise available in More Action 1
    }

    // First player in more action: Enable buttons
    // NOTE: Disable 'raise' in More Action 2 only
    if (currentPlayerIndex === 0) {
      if (actionLevel === 'more2') {
        return ['call', 'all-in', 'fold', 'no action']; // No raise in More Action 2
      }
      return ['call', 'raise', 'all-in', 'fold', 'no action']; // Raise available in More Action 1
    }

    // Subsequent players: Check if previous player has acted
    const previousPlayer = activePlayers[currentPlayerIndex - 1];
    const previousPlayerData = playerData[previousPlayer.id];
    const previousPlayerAction = previousPlayerData?.[actionKey];

    // If previous player hasn't acted yet, disable all buttons
    if (!previousPlayerAction || previousPlayerAction === 'no action') {
      return []; // Disabled
    }

    // NEW LOGIC: Check if THIS SPECIFIC PLAYER needs to act
    // This replaces the checkBettingRoundComplete check with per-player evaluation
    const playerStatus = checkPlayerNeedsToAct(playerId, actionLevel, players, playerData);

    if (playerStatus.alreadyAllIn) {
      // Player is all-in from previous round - show locked all-in button
      console.log(`🔒 [getAvailableActionsForPlayer] Player ${playerId} is all-in, showing locked state`);
      return ['all-in']; // Special locked state - will be handled by UI
    }

    if (playerStatus.alreadyMatchedMaxBet) {
      // Player already matched max bet from previous round - no action required
      console.log(`✅ [getAvailableActionsForPlayer] Player ${playerId} already matched max bet, no action required`);
      return []; // Will show "No action required" in UI
    }

    // Player needs to act
    // NOTE: Disable 'raise' in More Action 2 only
    console.log(`▶️  [getAvailableActionsForPlayer] Player ${playerId} needs to act`);
    if (actionLevel === 'more2') {
      return ['call', 'all-in', 'fold', 'no action']; // No raise in More Action 2
    }
    return ['call', 'raise', 'all-in', 'fold', 'no action']; // Raise available in More Action 1
  };

  /**
   * Helper to navigate after a player acts
   * - For More Action rounds: Find next player who needs to act (auto-skip those who don't)
   * - If all remaining players auto-skipped → Navigate to Process Stack button
   * - If next player needs to act → Navigate to that player's Action column (or Card 1 for base level)
   */
  const navigateAfterAction = (currentPlayerId: number, suffix: string) => {
    // Determine action level from suffix
    const actionLevel: ActionLevel =
      suffix === '' ? 'base' :
      suffix === '_moreAction' ? 'more' : 'more2';

    console.log(`🔍 [navigateAfterAction] Player ${currentPlayerId}, suffix: "${suffix}", actionLevel: ${actionLevel}`);

    // Check if betting round is complete
    const completionCheck = checkBettingRoundComplete('preflop', actionLevel, players, playerData);
    console.log(`🔍 [navigateAfterAction] Betting round complete:`, completionCheck);

    if (completionCheck.isComplete) {
      // Navigate to Process Stack
      console.log(`✅ [navigateAfterAction] Round complete, navigating to Process Stack`);
      setTimeout(() => {
        const processStackButton = document.querySelector('[data-process-stack-focus]') as HTMLElement;
        if (processStackButton) {
          processStackButton.focus();
        }
      }, 100);
    } else {
      // Navigate to next player who needs to act
      console.log(`➡️ [navigateAfterAction] Round not complete, finding next player who needs to act`);
      setTimeout(() => {
        const activePlayers = getActivePlayers();
        const playerIndex = activePlayers.findIndex(p => p.id === currentPlayerId);

        // For More Action rounds: Find next player who actually needs to act
        if (actionLevel === 'more' || actionLevel === 'more2') {
          let foundPlayerWhoNeedsToAct = false;

          // Check each subsequent player
          for (let i = playerIndex + 1; i < activePlayers.length; i++) {
            const nextPlayer = activePlayers[i];
            const playerStatus = checkPlayerNeedsToAct(nextPlayer.id, actionLevel, players, playerData);

            console.log(`🔍 [navigateAfterAction] Checking player ${nextPlayer.name} (${nextPlayer.id}):`, playerStatus);

            if (playerStatus.needsToAct) {
              // Found a player who needs to act - navigate to them
              console.log(`✅ [navigateAfterAction] Found player who needs to act: ${nextPlayer.name}`);
              const selector = `[data-action-focus="${nextPlayer.id}-preflop${suffix}"]`;
              const nextElement = document.querySelector(selector) as HTMLElement;
              if (nextElement) {
                nextElement.focus();
              }
              foundPlayerWhoNeedsToAct = true;
              break;
            } else {
              // Player doesn't need to act (auto-skip)
              if (playerStatus.alreadyAllIn) {
                console.log(`⏭️ [navigateAfterAction] Auto-skip ${nextPlayer.name} (all-in)`);
              } else if (playerStatus.alreadyMatchedMaxBet) {
                console.log(`⏭️ [navigateAfterAction] Auto-skip ${nextPlayer.name} (matched max bet)`);
              }
            }
          }

          // If no player needs to act, navigate to Process Stack
          if (!foundPlayerWhoNeedsToAct) {
            console.log(`🏁 [navigateAfterAction] All remaining players auto-skipped, navigating to Process Stack`);
            const processStackButton = document.querySelector('[data-process-stack-focus]') as HTMLElement;
            if (processStackButton) {
              processStackButton.focus();
            }
          }
        } else {
          // Base level: Simple sequential navigation (original logic)
          const nextPlayerIndex = playerIndex + 1;
          if (nextPlayerIndex < activePlayers.length) {
            const nextPlayer = activePlayers[nextPlayerIndex];
            const selector = `[data-card-focus="${nextPlayer.id}-1-preflop${suffix}"]`;
            console.log(`🎯 [navigateAfterAction] Looking for next element: ${selector}`);
            const nextElement = document.querySelector(selector) as HTMLElement;
            if (nextElement) {
              console.log(`✅ [navigateAfterAction] Found next element, focusing on ${nextPlayer.name}`);
              nextElement.focus();
            } else {
              console.log(`❌ [navigateAfterAction] Next element not found`);
            }
          } else {
            // Last player - navigate to Process Stack button
            console.log(`🏁 [navigateAfterAction] Last player, navigating to Process Stack`);
            const processStackButton = document.querySelector('[data-process-stack-focus]') as HTMLElement;
            if (processStackButton) {
              processStackButton.focus();
            }
          }
        }
      }, 100);
    }
  };

  /**
   * Handle deleting a more action level
   */
  const handleDeleteMoreAction = () => {
    const currentLevels = visibleActionLevels.preflop || ['base'];
    if (currentLevels.length === 1) return; // Can't delete base level

    // Remove the last level
    const updatedLevels = currentLevels.slice(0, -1);
    actions.setVisibleActionLevels({
      ...visibleActionLevels,
      preflop: updatedLevels,
    });
  };

  /**
   * Normalize position to standard format
   */
  const normalizePosition = (pos: string | undefined): string => {
    if (!pos) return '';
    const p = pos.toLowerCase();
    if (p === 'd' || p === 'btn' || p === 'button') return 'dealer';
    if (p === 'u' || p === 'utg') return 'utg';
    return p;
  };

  /**
   * Handle process stack - Calculate pot and update game state
   * Uses the integrated pot calculation engine from processStack.ts and potCalculationEngine.ts
   */
  const handleProcessStack = () => {
    console.log('🔄 Processing Stack - Preflop...');

    // Get all visible action levels for preflop
    const currentLevels = visibleActionLevels.preflop || ['base'];

    try {
      // Normalize playerData: for base level, set undefined actions to 'fold'
      let normalizedPlayerData = { ...playerData };
      if (currentLevels.includes('base')) {
        players.forEach((player) => {
          if (!player.name) return; // Skip empty player slots

          const data = normalizedPlayerData[player.id] || {};
          const actionKey = 'preflopAction';

          // If action is undefined or empty, default to 'fold' for base level
          if (!data[actionKey]) {
            normalizedPlayerData = {
              ...normalizedPlayerData,
              [player.id]: {
                ...data,
                [actionKey]: 'fold'
              }
            };
          }
        });

        // Update state with normalized data
        setPlayerData(normalizedPlayerData);
        console.log('✅ Normalized base level actions (undefined → fold)');
      }

      // Track the latest result across all levels
      let latestPlayerData = normalizedPlayerData;
      let latestContributedAmounts = contributedAmounts;
      let latestProcessedSections = processedSections;
      let latestSectionStacks = sectionStacks;
      let finalPotInfo: any = null;

      // Process each level sequentially using processStackSynchronous
      currentLevels.forEach((level) => {
        const levelName = level === 'base' ? 'base' : level === 'more' ? 'more' : 'more2';
        console.log(`\n📍 Processing level: ${levelName}`);

        // Call processStackSynchronous for this section
        const result = processStackSynchronous(
          'preflop',
          level,
          players,
          latestPlayerData,
          latestContributedAmounts,
          latestProcessedSections,
          latestSectionStacks,
          {
            bigBlind: stackData.bigBlind,
            smallBlind: stackData.smallBlind,
            ante: stackData.ante
          },
          defaultUnit
        );

        // Update local tracking variables
        latestPlayerData = result.updatedPlayerData;
        latestContributedAmounts = result.updatedContributedAmounts;
        latestProcessedSections = result.updatedProcessedSections;
        latestSectionStacks = result.updatedSectionStacks;

        // Update state with results from processing
        setPlayerData(result.updatedPlayerData);
        setContributedAmounts(result.updatedContributedAmounts);
        setProcessedSections(result.updatedProcessedSections);
        setSectionStacks(result.updatedSectionStacks);

        console.log(`✅ Processed ${levelName}: Updated player data and stacks`);

        // Calculate pot for this section
        const sectionKey = `preflop_${levelName}`;
        const potInfo = calculatePotsForBettingRound(
          'preflop',
          level,
          players,
          result.updatedPlayerData,
          result.updatedContributedAmounts,
          result.updatedProcessedSections,
          result.updatedSectionStacks,
          {
            bigBlind: stackData.bigBlind,
            smallBlind: stackData.smallBlind,
            ante: stackData.ante
          },
          0 // previousStreetPot (0 for preflop)
        );

        // Store pot info in state
        setPotsByStage((prev) => ({
          ...prev,
          [sectionKey]: potInfo
        }));

        // Track the final pot info (last iteration)
        finalPotInfo = potInfo;

        console.log(`💰 Calculated pot for ${levelName}:`, potInfo.totalPot);
        console.log(`   Main Pot: ${potInfo.mainPot.amount}`);
        if (potInfo.sidePots.length > 0) {
          potInfo.sidePots.forEach((sp, i) => {
            console.log(`   Side Pot ${i + 1}: ${sp.amount}`);
          });
        }
      });

      // Display final results
      console.log(`\n✅ Process Stack Complete - Total Pot: ${finalPotInfo.totalPot}`);

      // Show alert to user
      alert(
        `Process Stack Complete!\n\n` +
        `Total Pot: ${finalPotInfo.totalPot}\n` +
        `Main Pot: ${finalPotInfo.mainPot.amount}\n` +
        (finalPotInfo.sidePots.length > 0
          ? `Side Pots: ${finalPotInfo.sidePots.length}\n`
          : '') +
        `Dead Money: ${finalPotInfo.deadMoney}\n\n` +
        `Check console for detailed breakdown.`
      );
    } catch (error) {
      console.error('❌ Error processing stack:', error);
      alert(`Error processing stack: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  /**
   * Auto-focus first player's Card 1 on mount (for base level only)
   * Focuses on UTG (first in preflop action order)
   */
  React.useEffect(() => {
    const currentLevels = visibleActionLevels.preflop || ['base'];
    const isBaseLevel = currentLevels.length === 1 && currentLevels[0] === 'base';

    if (isBaseLevel) {
      // Define position order to find UTG (first to act in preflop)
      const positionOrder: Record<string, number> = {
        'UTG': 1,
        'UTG+1': 2,
        'UTG+2': 3,
        'LJ': 4,
        'MP': 5,
        'HJ': 6,
        'CO': 7,
        'Dealer': 8,
        'SB': 9,
        'BB': 10,
        '': 999
      };

      // Get players with names, sorted by position order
      const sortedPlayers = players
        .filter(p => p.name)
        .sort((a, b) => {
          const orderA = positionOrder[a.position] || 999;
          const orderB = positionOrder[b.position] || 999;
          return orderA - orderB;
        });

      // Focus on first player in sorted order (UTG)
      const firstPlayer = sortedPlayers[0];
      if (firstPlayer) {
        // Focus Card 1 of first player after a short delay to ensure DOM is ready
        setTimeout(() => {
          const card1Selector = `[data-card-focus="${firstPlayer.id}-1-preflop"]`;
          const card1Element = document.querySelector(card1Selector) as HTMLElement;
          if (card1Element) {
            card1Element.focus();
          }
        }, 100);
      }
    }
  }, []); // Run only on mount

  /**
   * ActionColumnContainer - Wraps ActionButtons with keyboard shortcuts
   */
  const ActionColumnContainer: React.FC<{
    playerId: number;
    suffix: string;
    children: React.ReactNode;
    action?: ActionType;
    onActionSelect: (action: ActionType) => void;
  }> = ({ playerId, suffix, children, action, onActionSelect }) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Keyboard shortcuts for actions
      const actionMap: Record<string, ActionType> = {
        'f': 'fold',
        'c': 'call',
        'a': 'all-in',
        'x': 'check',
        'b': 'bet',
        'r': 'raise',
        'n': 'no action'
      };

      if (actionMap[key]) {
        e.preventDefault();
        e.stopPropagation();
        const selectedAction = actionMap[key];
        onActionSelect(selectedAction);

        // Auto-focus amount input for bet/raise keyboard shortcuts
        if (selectedAction === 'bet' || selectedAction === 'raise') {
          setTimeout(() => {
            const amountInputId = `amount-input-${playerId}${suffix || ''}`;
            const amountInput = document.querySelector(`#${amountInputId}`) as HTMLInputElement;
            if (amountInput) {
              amountInput.focus();
              amountInput.select();
            }
          }, 100);
        } else {
          // For all other actions, check completion and navigate accordingly
          navigateAfterAction(playerId, suffix);
        }
        return;
      }

      // Tab: Move to Amount input if bet/raise, otherwise next player's Card 1
      if (e.key === 'Tab' && !e.shiftKey) {
        console.log(`➡️ [ActionContainer] Tab pressed for player ${playerId}${suffix}, action: ${action}`);
        e.preventDefault();

        // If action is bet or raise, move to amount input
        if (action === 'bet' || action === 'raise') {
          console.log(`💰 [ActionContainer] Bet/Raise action, focusing amount input`);
          const amountInputId = `amount-input-${playerId}${suffix || ''}`;
          const amountInput = document.querySelector(`#${amountInputId}`) as HTMLInputElement;
          if (amountInput) {
            amountInput.focus();
            amountInput.select();
            return;
          }
        }

        // Check completion and navigate accordingly
        console.log(`🔍 [ActionContainer] Tab from action, checking round completion`);
        navigateAfterAction(playerId, suffix);
        return;
      }

      // Shift+Tab: Move back to Card 2
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        const selector = `[data-card-focus="${playerId}-2-preflop${suffix}"]`;
        const card2Element = document.querySelector(selector) as HTMLElement;
        if (card2Element) {
          card2Element.focus();
        }
        return;
      }
    };

    return (
      <div
        data-action-focus={`${playerId}-preflop${suffix}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`rounded p-2 transition-all outline-none ${
          isFocused
            ? 'border-2 border-blue-400 bg-blue-50 ring-2 ring-blue-500'
            : 'border-2 border-gray-300 bg-gray-50'
        }`}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="p-2 max-w-full mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-3">
        {/* TAB NAVIGATION */}
        <div className="flex gap-2 mb-3 border-b border-gray-200 pb-2">
          <button
            onClick={() => setCurrentView('stack')}
            className="px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Stack
          </button>
          <button
            className="px-4 py-2 rounded-t text-sm font-medium transition-colors bg-blue-600 text-white"
            disabled
          >
            Pre-flop
          </button>
          <button
            onClick={() => setCurrentView('flop')}
            className="px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Flop
          </button>
          <button
            className="px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-100 text-gray-400 cursor-not-allowed"
            disabled
          >
            Turn
          </button>
          <button
            className="px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-100 text-gray-400 cursor-not-allowed"
            disabled
          >
            River
          </button>
        </div>

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-lg font-bold text-gray-800">{getViewTitle()}</h1>

          <div className="flex items-center gap-2">
            {/* Unit Selector */}
            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-gray-700">Unit:</label>
              <div className="flex gap-0.5">
                {units.map(unit => (
                  <button
                    key={unit}
                    onClick={() => handleDefaultUnitChange(unit)}
                    className={`px-1 py-0.5 rounded text-xs font-medium transition-colors ${
                      defaultUnit === unit
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Button */}
            <button
              onClick={onClearAll}
              className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
            >
              Clear
            </button>

            {/* Export Button */}
            <button
              onClick={onExport}
              className="px-2 py-0.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
            >
              Export
            </button>
          </div>
        </div>

        {/* NAVIGATION BAR */}
        <div className="mb-3 p-2 bg-gray-100 rounded">
          <div className="flex justify-between items-center">
            <div>{getNavigationButtons()}</div>
            <div className="flex items-center gap-2">
              {getFoldedPlayers().length > 0 && (
                <div className="text-xs text-gray-600">
                  Folded: {getFoldedPlayers().length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTION LEVELS */}
        <div className="overflow-x-auto space-y-4">
          {visibleActionLevels.preflop?.map((actionLevel: ActionLevel, levelIndex: number) => {
            const suffix =
              actionLevel === 'base'
                ? ''
                : actionLevel === 'more'
                ? '_moreAction'
                : '_moreAction2';
            const levelLabel =
              actionLevel === 'base'
                ? 'BASE ACTIONS'
                : actionLevel === 'more'
                ? 'MORE ACTION 1'
                : 'MORE ACTION 2';
            const levelBgColor =
              actionLevel === 'base'
                ? 'bg-white'
                : actionLevel === 'more'
                ? 'bg-blue-50'
                : 'bg-green-50';
            const levelBorderColor =
              actionLevel === 'base'
                ? 'border-gray-300'
                : actionLevel === 'more'
                ? 'border-blue-300'
                : 'border-green-300';

            // Define position order for preflop (action order)
            // Preflop: UTG acts first, then UTG+1, ..., Dealer, SB, BB
            const positionOrder: Record<string, number> = {
              'UTG': 1,
              'UTG+1': 2,
              'UTG+2': 3,
              'LJ': 4,
              'MP': 5,
              'HJ': 6,
              'CO': 7,
              'Dealer': 8,
              'SB': 9,
              'BB': 10,
              '': 999 // Empty position goes last
            };

            const playersToShow = players
              .filter((p: Player) => {
                // First check: player must have a name
                if (!p.name) return false;

                // For base level, show all players with names
                if (actionLevel === 'base') return true;

                // For more action levels, only show players who haven't folded in previous levels
                const data = playerData[p.id];
                if (!data) return true;

                if (actionLevel === 'more') {
                  // For more action 1, exclude players who folded in base
                  // In preflop base: undefined, 'no action', or 'fold' = player is out
                  const baseAction = data['preflopAction'];
                  console.log(`  ${p.name} base action:`, baseAction);
                  return baseAction && baseAction !== 'fold' && baseAction !== 'no action';
                }

                if (actionLevel === 'more2') {
                  // For more action 2, exclude players who folded in base or more action 1
                  const baseAction = data['preflopAction'];
                  const more1Action = data['preflop_moreActionAction'];
                  console.log(`  ${p.name} base action:`, baseAction, ', more1 action:', more1Action);
                  // Base must have a valid action (not undefined, 'no action', or 'fold')
                  // More1 must not be 'fold' (undefined/'no action' is ok for more actions)
                  return baseAction && baseAction !== 'fold' && baseAction !== 'no action' && more1Action !== 'fold';
                }

                return true;
              })
              .sort((a, b) => {
                // Sort by position order (UTG first, then UTG+1, ..., Dealer, SB, BB)
                const orderA = positionOrder[a.position] || 999;
                const orderB = positionOrder[b.position] || 999;
                return orderA - orderB;
              });

            if (playersToShow.length === 0 && actionLevel !== 'base') {
              return null;
            }

            return (
              <div key={actionLevel} className="mb-6">
                {/* SECTION HEADER */}
                <div
                  className={`${levelBgColor} border-2 ${levelBorderColor} rounded-t-lg px-3 py-2`}
                >
                  <h3 className="text-sm font-bold text-gray-800">
                    {levelLabel} - {getViewTitle()}
                  </h3>
                </div>

                {/* MAIN TABLE */}
                <table
                  className={`w-full border-collapse border-2 ${levelBorderColor}`}
                >
                  {/* TABLE HEADER */}
                  <thead>
                    <tr className={levelBgColor}>
                      <th
                        className={`border ${levelBorderColor} px-3 py-2 text-left text-sm font-medium text-gray-700`}
                      >
                        Player
                      </th>
                      <th
                        className={`border ${levelBorderColor} px-4 py-2 text-center text-sm font-medium text-gray-700 w-40`}
                      >
                        Stack
                      </th>

                      {/* CARD 1 HEADER - Show ONLY in preflop base */}
                      {actionLevel === 'base' && (
                        <th
                          className={`border ${levelBorderColor} px-3 py-2 text-center text-sm font-medium text-gray-700`}
                        >
                          Card 1
                        </th>
                      )}

                      {/* CARD 2 HEADER - Show ONLY in preflop base */}
                      {actionLevel === 'base' && (
                        <th
                          className={`border ${levelBorderColor} px-3 py-2 text-center text-sm font-medium text-gray-700`}
                        >
                          Card 2
                        </th>
                      )}

                      {/* ACTION HEADER */}
                      <th
                        className={`border ${levelBorderColor} px-3 py-2 text-center text-sm font-medium text-gray-700`}
                      >
                        Action
                      </th>

                      {/* AMOUNT/UNIT HEADER */}
                      <th
                        className={`border ${levelBorderColor} px-4 py-2 text-center text-sm font-medium text-gray-700 w-32`}
                      >
                        Amount/Unit
                      </th>
                    </tr>
                  </thead>

                  {/* TABLE BODY */}
                  <tbody>
                    {playersToShow.map((player: Player) => {
                      const data = playerData[player.id] || {};
                      const actionKey = `preflop${suffix}Action`;
                      const amountKey = `preflop${suffix}Amount`;
                      const unitKey = `preflop${suffix}Unit`;

                      // Get the action, default to 'fold' in base level only, undefined otherwise
                      let action: ActionType | undefined = (data[actionKey] as ActionType) || undefined;
                      if (!action && actionLevel === 'base') {
                        action = 'fold';
                      }
                      const amount = (data[amountKey] as string) || '';
                      const unit = (data[unitKey] as ChipUnit) || defaultUnit;

                      return (
                        <tr key={player.id} className={levelBgColor}>
                          {/* PLAYER NAME */}
                          <td
                            className={`border ${levelBorderColor} px-2 py-2 text-sm`}
                          >
                            <div className="font-medium text-gray-800">
                              {player.name}
                              {player.position && (
                                <span className="text-blue-600"> ({player.position})</span>
                              )}
                            </div>
                            {/* Show cards BELOW name only in base level */}
                            {actionLevel === 'base' && data.card1 && data.card2 && (
                              <div className="mt-1 text-lg font-bold">
                                <span className={getCardColor(data.card1.suit)}>
                                  {data.card1.rank}{data.card1.suit}
                                </span>
                                {' '}
                                <span className={getCardColor(data.card2.suit)}>
                                  {data.card2.rank}{data.card2.suit}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* STACK */}
                          <td
                            className={`border ${levelBorderColor} px-2 py-2 text-xs relative`}
                          >
                            {(() => {
                              const historyKey = `${player.id}-${actionLevel}`;
                              const isExpanded = expandedStackHistories[historyKey] || false;
                              const sectionKey = `preflop_${actionLevel}`;
                              const hasProcessedStack = processedSections[sectionKey];
                              const startingStack = player.stack; // Always show hand's initial stack
                              const currentStack = hasProcessedStack
                                ? (sectionStacks[sectionKey]?.updated?.[player.id] ?? calculateStartingStack(player, actionLevel))
                                : null;

                              // Check if player is all-in (currentStack is 0)
                              const isAllIn = currentStack !== null && currentStack === 0;

                              return (
                                <>
                                  {/* Compact Stack Display */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between bg-blue-50 rounded px-2 py-1 border border-blue-200">
                                      <span className="text-[10px] text-blue-600">Start:</span>
                                      <span className="text-xs font-bold text-blue-900">{formatStack(startingStack)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className={`flex-1 flex items-center justify-between rounded px-2 py-1 border ${isAllIn ? 'bg-red-50 border-2 border-red-400' : 'bg-green-50 border-green-200'}`}>
                                        <span className={`text-[10px] ${isAllIn ? 'text-red-700 font-bold' : 'text-green-600'}`}>Now:</span>
                                        {currentStack !== null ? (
                                          <span className={`text-xs font-bold ${isAllIn ? 'text-red-900' : 'text-green-900'}`}>{formatStack(currentStack)}</span>
                                        ) : (
                                          <span className="text-xs font-bold text-gray-400">-</span>
                                        )}
                                      </div>
                                      {currentStack !== null && (
                                        <button
                                          onClick={(e) => {
                                            const isExpanding = !isExpanded;
                                            setExpandedStackHistories(prev => ({
                                              ...prev,
                                              [historyKey]: isExpanding
                                            }));

                                            // Auto-scroll to show the full card when expanding
                                            if (isExpanding) {
                                              console.log('[PreFlopView] ========================================');
                                              console.log('[PreFlopView] History button clicked - expanding stack history card');
                                              console.log('[PreFlopView] Player:', player.name, 'historyKey:', historyKey);
                                              setTimeout(() => {
                                                const buttonElement = e.currentTarget;
                                                const tdElement = buttonElement.closest('td');

                                                console.log('[PreFlopView] Looking for floating card to scroll into view');
                                                console.log('[PreFlopView] tdElement:', tdElement);

                                                if (tdElement) {
                                                  // Try multiple selectors to find the floating card
                                                  let floatingCard = tdElement.querySelector(`[data-stack-history-card="${historyKey}"]`);
                                                  console.log('[PreFlopView] floatingCard by data attribute:', floatingCard);

                                                  if (!floatingCard) {
                                                    floatingCard = tdElement.querySelector('.absolute.z-50');
                                                    console.log('[PreFlopView] floatingCard by class selector:', floatingCard);
                                                  }

                                                  if (floatingCard) {
                                                    // Get card dimensions BEFORE scrolling
                                                    const cardRect = floatingCard.getBoundingClientRect();
                                                    const viewportHeight = window.innerHeight;
                                                    const viewportTop = window.scrollY;
                                                    const viewportBottom = viewportTop + viewportHeight;

                                                    console.log('[PreFlopView] === Card Dimensions ===');
                                                    console.log('[PreFlopView] Card height:', cardRect.height, 'px');
                                                    console.log('[PreFlopView] Card top (viewport):', cardRect.top, 'px');
                                                    console.log('[PreFlopView] Card bottom (viewport):', cardRect.bottom, 'px');
                                                    console.log('[PreFlopView] Card top (absolute):', cardRect.top + window.scrollY, 'px');
                                                    console.log('[PreFlopView] Card bottom (absolute):', cardRect.bottom + window.scrollY, 'px');
                                                    console.log('[PreFlopView] === Viewport Info ===');
                                                    console.log('[PreFlopView] Viewport height:', viewportHeight, 'px');
                                                    console.log('[PreFlopView] Viewport scrollY:', window.scrollY, 'px');
                                                    console.log('[PreFlopView] Viewport top (absolute):', viewportTop, 'px');
                                                    console.log('[PreFlopView] Viewport bottom (absolute):', viewportBottom, 'px');
                                                    console.log('[PreFlopView] === Scroll Needed? ===');
                                                    console.log('[PreFlopView] Card extends above viewport:', cardRect.top < 0);
                                                    console.log('[PreFlopView] Card extends below viewport:', cardRect.bottom > viewportHeight);
                                                    console.log('[PreFlopView] Needs scroll:', cardRect.top < 0 || cardRect.bottom > viewportHeight);

                                                    // Try scrollIntoView with different options
                                                    console.log('[PreFlopView] Attempting scrollIntoView with block: "nearest"');
                                                    (floatingCard as HTMLElement).scrollIntoView({
                                                      behavior: 'smooth',
                                                      block: 'nearest',
                                                      inline: 'nearest'
                                                    });

                                                    // Check after scroll attempt
                                                    setTimeout(() => {
                                                      const newCardRect = floatingCard.getBoundingClientRect();
                                                      console.log('[PreFlopView] === After Scroll Attempt ===');
                                                      console.log('[PreFlopView] New scrollY:', window.scrollY, 'px');
                                                      console.log('[PreFlopView] New card top:', newCardRect.top, 'px');
                                                      console.log('[PreFlopView] New card bottom:', newCardRect.bottom, 'px');
                                                      console.log('[PreFlopView] Still needs scroll:', newCardRect.top < 0 || newCardRect.bottom > viewportHeight);

                                                      // If still not visible, try alternative scroll method
                                                      if (newCardRect.top < 0 || newCardRect.bottom > viewportHeight) {
                                                        console.log('[PreFlopView] scrollIntoView did not work, trying manual scroll');
                                                        const cardAbsoluteTop = newCardRect.top + window.scrollY;
                                                        const targetScrollY = cardAbsoluteTop - 20; // 20px padding from top
                                                        console.log('[PreFlopView] Scrolling to:', targetScrollY, 'px');
                                                        window.scrollTo({
                                                          top: targetScrollY,
                                                          behavior: 'smooth'
                                                        });
                                                      }
                                                      console.log('[PreFlopView] ========================================');
                                                    }, 500); // Wait for smooth scroll to complete
                                                  } else {
                                                    // Fallback: scroll the td element if card not found yet
                                                    console.log('[PreFlopView] Floating card not found after 100ms, scrolling td element instead');
                                                    tdElement.scrollIntoView({
                                                      behavior: 'smooth',
                                                      block: 'nearest',
                                                      inline: 'nearest'
                                                    });
                                                    console.log('[PreFlopView] ========================================');
                                                  }
                                                }
                                              }, 100); // Increased delay to ensure card is rendered
                                            }
                                          }}
                                          className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-[10px] font-semibold rounded shadow-md hover:shadow-lg transition-all duration-200"
                                          title="Show stack history"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Floating Card - Stack History */}
                                  {isExpanded && currentStack !== null && (
                                    <div data-stack-history-card={historyKey} className="absolute z-50 mt-2 left-1/2 transform -translate-x-1/2" style={{ minWidth: '400px', maxWidth: '460px' }}>
                                      <div className={`bg-gradient-to-br rounded-xl shadow-2xl border-2 overflow-hidden ${isAllIn ? 'from-red-50 to-orange-50 border-red-400' : 'from-white to-blue-50 border-blue-300'}`}>
                                        {/* Card Header */}
                                        <div className={`bg-gradient-to-r px-3 py-2 flex items-center justify-between ${isAllIn ? 'from-red-600 to-red-700' : 'from-blue-600 to-blue-700'}`}>
                                          <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            <h3 className="text-white font-bold text-xs">
                                              Stack History - {player.name} {isAllIn && '(ALL-IN)'}
                                            </h3>
                                          </div>
                                          <button
                                            onClick={() => {
                                              setExpandedStackHistories(prev => ({
                                                ...prev,
                                                [historyKey]: false
                                              }));
                                            }}
                                            className={`text-white transition-colors ${isAllIn ? 'hover:text-red-200' : 'hover:text-blue-200'}`}
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        </div>

                                        {/* Card Body - Scrollable */}
                                        <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                                          {/* PREFLOP Section */}
                                          <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                                            <div className="font-bold text-blue-900 text-xs mb-2 pb-1 border-b border-blue-300">
                                              PREFLOP
                                            </div>

                                            {/* BASE Round */}
                                            {(() => {
                                              const baseAction = (typeof data.preflopAction === 'string' ? data.preflopAction : '') as string;
                                              const baseStackBefore = player.stack;
                                              const baseStackAfter = sectionStacks['preflop_base']?.updated?.[player.id] ?? baseStackBefore;
                                              const contribution = baseStackBefore - baseStackAfter;
                                              const isActiveRound = actionLevel === 'base';

                                              return (
                                                <div className={`rounded-lg p-2 mb-1 border shadow-sm ${isActiveRound ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-white border-gray-200'}`}>
                                                  <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">BASE</span>
                                                    <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-full ${isActiveRound ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                                                      {isActiveRound ? 'Active' : 'Complete'}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-gray-600">{formatStack(baseStackBefore)}</span>
                                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                      </svg>
                                                      <span className="font-bold text-gray-800">{formatStack(baseStackAfter)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      {baseAction && baseAction !== 'no action' && baseAction !== 'check' ? (
                                                        <>
                                                          <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${baseAction === 'all-in' ? 'bg-red-600 text-white' : baseAction === 'raise' ? 'bg-purple-100 text-purple-700' : baseAction === 'call' ? 'bg-blue-100 text-blue-700' : baseAction === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {baseAction}
                                                          </span>
                                                        </>
                                                      ) : (
                                                        <span className="text-gray-400 text-[10px]">no action</span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })()}

                                            {/* More Action 1 Round */}
                                            {(actionLevel === 'more' || actionLevel === 'more2') && (() => {
                                              const moreAction = (typeof data.preflop_moreActionAction === 'string' ? data.preflop_moreActionAction : '') as string;
                                              const stackBefore = sectionStacks['preflop_base']?.updated?.[player.id] ?? player.stack;
                                              const stackAfter = sectionStacks['preflop_more']?.updated?.[player.id] ?? stackBefore;
                                              const contribution = stackBefore - stackAfter;
                                              const isActiveRound = actionLevel === 'more';

                                              return (
                                                <div className={`rounded-lg p-2 mb-1 border shadow-sm ${isActiveRound ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-white border-gray-200'}`}>
                                                  <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">More Action 1</span>
                                                    <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-full ${isActiveRound ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                                                      {isActiveRound ? 'Active' : 'Complete'}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-gray-600">{formatStack(stackBefore)}</span>
                                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                      </svg>
                                                      <span className="font-bold text-gray-800">{formatStack(stackAfter)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      {moreAction && moreAction !== 'no action' && moreAction !== 'check' ? (
                                                        <>
                                                          <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${moreAction === 'all-in' ? 'bg-red-600 text-white' : moreAction === 'raise' ? 'bg-purple-100 text-purple-700' : moreAction === 'call' ? 'bg-blue-100 text-blue-700' : moreAction === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {moreAction}
                                                          </span>
                                                        </>
                                                      ) : (
                                                        <span className="text-gray-400 text-[10px]">no action</span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })()}

                                            {/* More Action 2 Round */}
                                            {actionLevel === 'more2' && (() => {
                                              const more2Action = (typeof data.preflop_moreAction2Action === 'string' ? data.preflop_moreAction2Action : '') as string;
                                              const stackBefore = sectionStacks['preflop_more']?.updated?.[player.id] ?? player.stack;
                                              const stackAfter = sectionStacks['preflop_more2']?.updated?.[player.id] ?? stackBefore;
                                              const contribution = stackBefore - stackAfter;
                                              const isActiveRound = true; // Always active when showing more2

                                              return (
                                                <div className="bg-yellow-50 rounded-lg p-2 border-l-4 border-yellow-400 shadow-sm">
                                                  <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wide">More Action 2</span>
                                                    <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-[9px] font-semibold rounded-full">Active</span>
                                                  </div>
                                                  <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-gray-600">{formatStack(stackBefore)}</span>
                                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                      </svg>
                                                      <span className="font-bold text-gray-800">{formatStack(stackAfter)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      {more2Action && more2Action !== 'no action' && more2Action !== 'check' ? (
                                                        <>
                                                          <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${more2Action === 'all-in' ? 'bg-red-600 text-white' : more2Action === 'raise' ? 'bg-purple-100 text-purple-700' : more2Action === 'call' ? 'bg-blue-100 text-blue-700' : more2Action === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {more2Action}
                                                          </span>
                                                        </>
                                                      ) : (
                                                        <span className="text-gray-400 text-[10px]">no action</span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })()}
                                          </div>

                                          {/* Summary Section */}
                                          <div className={`rounded-lg p-3 border-2 shadow-md ${isAllIn ? 'bg-gradient-to-r from-gray-50 to-red-50 border-red-300' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'}`}>
                                            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2 pb-2 border-b-2 border-gray-300 flex items-center gap-1">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                              </svg>
                                              Summary
                                            </div>
                                            <div className="space-y-2">
                                              <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-gray-600">Starting Stack:</span>
                                                <span className="text-xs font-bold text-blue-600">{formatStack(startingStack)}</span>
                                              </div>
                                              <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-gray-600">Total Contributed:</span>
                                                <span className="text-xs font-bold text-red-600">{formatStack(startingStack - currentStack)}</span>
                                              </div>
                                              <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                                                <span className="text-[10px] text-gray-700 font-bold">Remaining Stack:</span>
                                                <span className={`text-sm font-bold ${isAllIn ? 'text-red-600' : 'text-green-600'}`}>{formatStack(currentStack)}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </td>

                          {/* CARD 1 - Show ONLY in preflop base */}
                          {actionLevel === 'base' && (
                            <td className={`border ${levelBorderColor} px-2 py-1`}>
                              <CardSelector
                                playerId={player.id}
                                cardNumber={1}
                                currentCard={data.card1 || null}
                                dataCardFocus={`${player.id}-1-preflop${suffix}`}
                                onCardChange={(playerId, cardNumber, card) => {
                                  cardManagement.updatePlayerCard(playerId, cardNumber, card);
                                }}
                                isCardAvailable={(playerId, cardNumber, rank, suit) => {
                                  const currentCard = playerData[playerId]?.[`card${cardNumber}`] as Card | undefined;
                                  return cardManagement.checkCardAvailable(rank, suit, currentCard);
                                }}
                                areAllSuitsTaken={(playerId, cardNumber, rank) => {
                                  const currentCard = playerData[playerId]?.[`card${cardNumber}`] as Card | undefined;
                                  return cardManagement.checkAllSuitsTaken(rank, currentCard);
                                }}
                              />
                            </td>
                          )}

                          {/* CARD 2 - Show ONLY in preflop base */}
                          {actionLevel === 'base' && (
                            <td className={`border ${levelBorderColor} px-2 py-1`}>
                              <CardSelector
                                playerId={player.id}
                                cardNumber={2}
                                currentCard={data.card2 || null}
                                dataCardFocus={`${player.id}-2-preflop${suffix}`}
                                onCardChange={(playerId, cardNumber, card) => {
                                  cardManagement.updatePlayerCard(playerId, cardNumber, card);
                                }}
                                isCardAvailable={(playerId, cardNumber, rank, suit) => {
                                  const currentCard = playerData[playerId]?.[`card${cardNumber}`] as Card | undefined;
                                  return cardManagement.checkCardAvailable(rank, suit, currentCard);
                                }}
                                areAllSuitsTaken={(playerId, cardNumber, rank) => {
                                  const currentCard = playerData[playerId]?.[`card${cardNumber}`] as Card | undefined;
                                  return cardManagement.checkAllSuitsTaken(rank, currentCard);
                                }}
                              />
                            </td>
                          )}

                          {/* ACTION */}
                          <td className={`border ${levelBorderColor} px-2 py-1`}>
                            {(() => {
                              const availableActions = getAvailableActionsForPlayer(player.id, suffix);
                              const actionLevelForCheck: ActionLevel =
                                suffix === '' ? 'base' :
                                suffix === '_moreAction' ? 'more' : 'more2';

                              // For More Action rounds: Check if player is auto-skipped
                              if ((actionLevelForCheck === 'more' || actionLevelForCheck === 'more2') && availableActions.length === 0) {
                                // No available actions - check if player matched max bet (show text) or is disabled
                                // If no action selected yet, show "No action required"
                                if (!action || action === 'no action') {
                                  return (
                                    <div className="text-xs text-gray-500 text-center py-2">
                                      No action required
                                    </div>
                                  );
                                }
                                // If action already selected, still show text
                                return (
                                  <div className="text-xs text-gray-500 text-center py-2">
                                    No action required
                                  </div>
                                );
                              }

                              // Check if player is all-in (locked state)
                              const isAllInLocked =
                                (actionLevelForCheck === 'more' || actionLevelForCheck === 'more2') &&
                                availableActions.length === 1 &&
                                availableActions[0] === 'all-in';

                              // Render ActionButtons
                              return (
                                <ActionColumnContainer
                                  playerId={player.id}
                                  suffix={suffix}
                                  action={action}
                                  onActionSelect={(selectedAction) => {
                                    // Update player action
                                    actions.setPlayerData({
                                      ...playerData,
                                      [player.id]: {
                                        ...playerData[player.id],
                                        [actionKey]: selectedAction,
                                      },
                                    });
                                  }}
                                >
                                  <ActionButtons
                                    playerId={player.id}
                                    selectedAction={action}
                                    suffix={suffix}
                                    onActionClick={(selectedAction) => {
                                      // Update player action
                                      actions.setPlayerData({
                                        ...playerData,
                                        [player.id]: {
                                          ...playerData[player.id],
                                          [actionKey]: selectedAction,
                                        },
                                      });
                                    }}
                                    onActionComplete={(selectedAction) => {
                                      // Check completion and navigate accordingly
                                      navigateAfterAction(player.id, suffix);
                                    }}
                                    availableActions={availableActions}
                                    isAllInLocked={isAllInLocked}
                                  />
                                </ActionColumnContainer>
                              );
                            })()}
                          </td>

                          {/* AMOUNT/UNIT */}
                          <td className={`border ${levelBorderColor} px-1 py-1`}>
                            <AmountInput
                              playerId={player.id}
                              selectedAmount={amount}
                              selectedUnit={unit as ChipUnit}
                              suffix={suffix}
                              onAmountChange={(playerId, newAmount) => {
                                actions.setPlayerData({
                                  ...playerData,
                                  [playerId]: {
                                    ...playerData[playerId],
                                    [amountKey]: newAmount,
                                  },
                                });
                              }}
                              onUnitChange={(playerId, newUnit) => {
                                actions.setPlayerData({
                                  ...playerData,
                                  [playerId]: {
                                    ...playerData[playerId],
                                    [unitKey]: newUnit,
                                  },
                                });
                              }}
                              onTabComplete={() => {
                                console.log(`🔔 [PreFlopView] onTabComplete called for player ${player.id}${suffix}`);
                                // Check completion and navigate accordingly
                                navigateAfterAction(player.id, suffix);
                              }}
                              isDisabled={!action || action === 'fold' || action === 'check' || action === 'no action'}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* TABLE FOOTER - Player Count */}
                <div
                  className={`${levelBgColor} border-2 border-t-0 ${levelBorderColor} rounded-b-lg px-3 py-2`}
                >
                  <div className="text-xs text-gray-600">
                    {playersToShow.length} player
                    {playersToShow.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="mt-4 flex gap-3 justify-center flex-wrap">
          {/* Process Stack Button */}
          <button
            onClick={handleProcessStack}
            data-process-stack-focus
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                // Navigate to Add More button
                const addMoreButton = document.querySelector('[data-add-more-focus]') as HTMLElement;
                if (addMoreButton) {
                  addMoreButton.focus();
                }
              }
            }}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <span>⚡</span>
            Process Stack - Preflop
          </button>

          {/* Delete More Action Button - Only show if we have more than base level */}
          {visibleActionLevels.preflop && visibleActionLevels.preflop.length > 1 && (
            <button
              onClick={handleDeleteMoreAction}
              className="px-6 py-3 bg-red-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <span>🗑️</span>
              Delete More Action {visibleActionLevels.preflop.length - 1}
            </button>
          )}

          {/* Add More Action Button */}
          <button
            onClick={handleAddMoreAction}
            data-add-more-focus
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                // Navigate to Create Flop button
                const createFlopButton = document.querySelector('[data-create-flop-focus]') as HTMLElement;
                if (createFlopButton) {
                  createFlopButton.focus();
                }
              }
            }}
            disabled={visibleActionLevels.preflop && visibleActionLevels.preflop.length >= 3}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>+</span>
            Add More Action {visibleActionLevels.preflop ? visibleActionLevels.preflop.length : 1}
          </button>

          {/* Create Flop Button */}
          <button
            onClick={handleCreateFlop}
            data-create-flop-focus
            tabIndex={0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>→</span>
            Create Flop
          </button>
        </div>
      </div>
    </div>
  );
};
