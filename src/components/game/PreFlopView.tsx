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
import { PotCalculationDisplay } from '../poker/PotCalculationDisplay';
import { processStackSynchronous } from '../../lib/poker/engine/processStack';
import { calculatePotsForBettingRound } from '../../lib/poker/engine/potCalculationEngine';
import { checkBettingRoundComplete } from '../../lib/poker/validators/roundCompletionValidator';
import { checkPlayerNeedsToAct } from '../../lib/poker/validators/playerActionStatus';
import { returnFocusAfterProcessStack } from '../../lib/poker/utils/focusManagement';
import { validateRaiseAmount } from '../../lib/poker/validators/raiseValidator';
import { formatPotsForDisplay, type DisplayPotData } from '../../lib/poker/engine/potDisplayFormatter';

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
    contributedAmounts,
    potsByStage
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

  // State for tracking pop-up position (above or below) for each player
  const [popupPositions, setPopupPositions] = React.useState<Record<string, 'above' | 'below' | 'center' | 'left' | 'right' | number>>({});

  // State for disabling "Add More Action" button when betting round is complete
  // Initially disabled until Process Stack is clicked and betting round is incomplete
  const [isAddMoreActionDisabled, setIsAddMoreActionDisabled] = React.useState(true);

  // State for disabling "Create Next Street" button when betting round is incomplete
  const [isCreateNextStreetDisabled, setIsCreateNextStreetDisabled] = React.useState(true);

  // State for tracking if current section has been processed
  const [hasProcessedCurrentState, setHasProcessedCurrentState] = React.useState(false);

  // State for tracking last processed playerData to detect changes
  const [lastProcessedPlayerDataHash, setLastProcessedPlayerDataHash] = React.useState<string>('');

  // State for pot display
  const [potDisplayData, setPotDisplayData] = React.useState<DisplayPotData | null>(null);
  const [showPotDisplay, setShowPotDisplay] = React.useState(false);

  // Detect playerData changes and invalidate processed state
  React.useEffect(() => {
    const currentLevels = visibleActionLevels.preflop || ['base'];

    // Create hash of current preflop playerData to detect changes
    const preflopDataHash = JSON.stringify(
      players
        .filter(p => p.name) // Only include players with names
        .map(p => {
          const data = playerData[p.id] || {};
          return {
            id: p.id,
            preflopAction: data.preflopAction,
            preflopAmount: data.preflopAmount,
            preflopUnit: data.preflopUnit,
            preflop_moreActionAction: data.preflop_moreActionAction,
            preflop_moreActionAmount: data.preflop_moreActionAmount,
            preflop_moreActionUnit: data.preflop_moreActionUnit,
            preflop_moreAction2Action: data.preflop_moreAction2Action,
            preflop_moreAction2Amount: data.preflop_moreAction2Amount,
            preflop_moreAction2Unit: data.preflop_moreAction2Unit,
          };
        })
    );

    // If playerData changed, invalidate processed state
    if (lastProcessedPlayerDataHash && preflopDataHash !== lastProcessedPlayerDataHash) {
      console.log('🔄 [PreFlopView] PlayerData changed, invalidating processed state');
      setHasProcessedCurrentState(false);
    }
  }, [playerData, players, lastProcessedPlayerDataHash]);

  // Update button states when playerData or processed state changes
  React.useEffect(() => {
    const currentLevels = visibleActionLevels.preflop || ['base'];
    const currentLevel = currentLevels[currentLevels.length - 1];
    const isRoundComplete = checkBettingRoundComplete('preflop', currentLevel, players, playerData);

    console.log(`🔄 [PreFlopView useEffect] Current level: ${currentLevel}, Round complete: ${isRoundComplete.isComplete}, Reason: ${isRoundComplete.reason}, Processed: ${hasProcessedCurrentState}`);

    // "Add More Action" is disabled when:
    // 1. Round is complete, OR
    // 2. State hasn't been processed yet (initial load or after reset)
    setIsAddMoreActionDisabled(isRoundComplete.isComplete || !hasProcessedCurrentState);

    // "Create Next Street" is disabled when round is incomplete OR when state hasn't been processed
    setIsCreateNextStreetDisabled(!isRoundComplete.isComplete || !hasProcessedCurrentState);
  }, [playerData, visibleActionLevels.preflop, players, hasProcessedCurrentState]);

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

  // NOTE: We do NOT initialize players with 'fold' in playerData
  // 'Fold' is shown as the default selection in the UI only (see PlayerActionButton logic)
  // This allows getActivePlayers() to correctly identify which players are still active
  // If we stored 'fold' in playerData by default, getActivePlayers() would filter everyone out!

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
    const currentLevel = currentLevels[currentLevels.length - 1]; // Last level

    // Fallback safety check: Is betting round already complete?
    const isComplete = checkBettingRoundComplete('preflop', currentLevel, players, playerData);

    if (isComplete.isComplete) {
      // Block the action
      alert('Betting round complete. Please create Flop instead.');

      // Disable the button to prevent repeated clicks
      setIsAddMoreActionDisabled(true);

      // Focus the Create Flop button
      setTimeout(() => {
        const createFlopButton = document.querySelector('[data-create-flop-focus]') as HTMLElement;
        if (createFlopButton) {
          createFlopButton.focus();
        }
      }, 100);

      return; // Don't create More Action
    }

    // Check if max levels reached
    if (currentLevels.length >= 3) {
      alert('Maximum 3 action levels per street reached');
      return;
    }

    // Determine next level
    const nextLevel: ActionLevel = currentLevels.length === 1 ? 'more' : 'more2';

    // Invalidate processed state since new action level is being added
    setHasProcessedCurrentState(false);
    console.log('🔄 [PreFlopView] Invalidated processed state (adding More Action)');

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

    // FR-14.3 & 14.4: Copy "Now" stacks from previous level
    // For More Action 1: Copy from BASE
    // For More Action 2: Copy from More Action 1
    const previousLevel = nextLevel === 'more' ? 'base' : 'more';
    const previousSectionKey = `preflop_${previousLevel}`;
    const newSectionKey = `preflop_${nextLevel}`;

    const updatedSectionStacks = { ...sectionStacks };

    // Initialize new section with copied "Now" stacks
    updatedSectionStacks[newSectionKey] = {
      initial: {},
      current: {},
      updated: {}
    };

    activePlayers.forEach(player => {
      // Copy "Now" stack (updated value) from previous level to new level's "initial"
      const previousNowStack = sectionStacks[previousSectionKey]?.updated?.[player.id] ?? player.stack;
      updatedSectionStacks[newSectionKey].initial[player.id] = previousNowStack;
      updatedSectionStacks[newSectionKey].current[player.id] = previousNowStack;
      updatedSectionStacks[newSectionKey].updated[player.id] = previousNowStack;
    });

    actions.setSectionStacks(updatedSectionStacks);
    console.log(`✅ Copied "Now" stacks from ${previousSectionKey} to ${newSectionKey}:`, updatedSectionStacks[newSectionKey]);

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

    // FR-14.5: Copy "Now" stacks from preflop's last round to flop_base
    const updatedSectionStacks = { ...sectionStacks };
    updatedSectionStacks['flop_base'] = {
      initial: {},
      current: {},
      updated: {}
    };

    getActivePlayers().forEach(player => {
      // Get the final stack from preflop (check more2 -> more -> base)
      let preflopFinalStack = player.stack;
      if (sectionStacks['preflop_more2']?.updated?.[player.id] !== undefined) {
        preflopFinalStack = sectionStacks['preflop_more2'].updated[player.id];
      } else if (sectionStacks['preflop_more']?.updated?.[player.id] !== undefined) {
        preflopFinalStack = sectionStacks['preflop_more'].updated[player.id];
      } else if (sectionStacks['preflop_base']?.updated?.[player.id] !== undefined) {
        preflopFinalStack = sectionStacks['preflop_base'].updated[player.id];
      }

      updatedSectionStacks['flop_base'].initial[player.id] = player.stack; // Always use original hand starting stack
      updatedSectionStacks['flop_base'].current[player.id] = preflopFinalStack;
      updatedSectionStacks['flop_base'].updated[player.id] = preflopFinalStack;
    });

    actions.setSectionStacks(updatedSectionStacks);
    console.log(`✅ [handleCreateFlop] Copied preflop final stacks to flop_base`);
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

    console.log(`🎯 [getAvailableActionsForPlayer] Called for playerId=${playerId}, suffix="${suffix}", actionLevel="${actionLevel}"`);

    // For BASE level, apply sequential turn-based logic with betting order
    if (actionLevel === 'base') {
      // In BASE level, use TOTAL players at table (not just active), because 'fold' is the default action
      // Players haven't actually folded yet - they just have the default 'fold' selection
      const totalPlayers = players.filter(p => p.name).length;
      const playerCount = totalPlayers;

      console.log(`🎯 [getAvailableActionsForPlayer] Total players at table: ${playerCount}`);

      // Get current player
      const currentPlayer = players.find(p => p.id === playerId);
      if (!currentPlayer) {
        console.log(`❌ [getAvailableActionsForPlayer] Player ${playerId} NOT FOUND - returning []`);
        return [];
      }

      console.log(`🎯 [getAvailableActionsForPlayer] Player ${playerId} is ${currentPlayer.name} (${currentPlayer.position})`);

      // Check if player has 0 starting stack - only enable fold button (keep it enabled even when selected)
      const startingStack = sectionStacks?.['preflop_base']?.initial?.[playerId] || currentPlayer.stack;
      if (startingStack === 0) {
        console.log(`🚫 [getAvailableActionsForPlayer] Player ${currentPlayer.name} has 0 chips - returning ['fold'] only (highlighted but not disabled)`);
        return ['fold']; // Only fold button available and enabled for 0-chip players
      }

      // Check if player has already folded (only disable buttons for players WITH chips who folded)
      const currentAction = playerData[playerId]?.preflopAction;
      if (currentAction === 'fold' && startingStack > 0) {
        console.log(`🚫 [getAvailableActionsForPlayer] Player ${currentPlayer.name} has already folded - returning [] (no actions available)`);
        return []; // No actions available for already-folded players with chips
      }

      // Check if player is already all-in from previous street
      const isAllInFromPrevious = playerData[playerId]?.allInFromPrevious === true;
      if (isAllInFromPrevious) {
        console.log(`🎯 [getAvailableActionsForPlayer] Player ${currentPlayer.name} is all-in from previous street - returning ['all-in']`);
        return ['all-in']; // Show locked all-in button
      }

      // Determine action order based on player count
      let actionOrder: string[];
      if (playerCount === 2) {
        // 2P Preflop: SB/Dealer → BB
        actionOrder = ['SB', 'Dealer', 'BB'];
      } else if (playerCount === 3) {
        // 3P Preflop: Dealer/UTG → SB → BB
        actionOrder = ['Dealer', 'SB', 'BB'];
      } else {
        // 4+ Preflop: UTG → ... → Dealer → SB → BB
        actionOrder = ['UTG', 'UTG+1', 'UTG+2', 'LJ', 'MP', 'MP+1', 'MP+2', 'HJ', 'CO', 'Dealer', 'SB', 'BB'];
      }

      console.log(`🎯 [getAvailableActionsForPlayer] Action order for ${playerCount} players: ${actionOrder.join(' → ')}`);

      // Find current player's position in action order
      const currentPlayerIndex = actionOrder.indexOf(currentPlayer.position);
      console.log(`🎯 [getAvailableActionsForPlayer] ${currentPlayer.name} (${currentPlayer.position}) is at index ${currentPlayerIndex} in action order`);

      if (currentPlayerIndex === -1) {
        console.log(`❌ [getAvailableActionsForPlayer] ${currentPlayer.name} position "${currentPlayer.position}" NOT IN action order - returning []`);
        return []; // Position not in action order
      }

      // Check if all previous players have acted (or are all-in/folded/0-chip)
      // Note: In BASE level, undefined is treated as fold (default action), so it counts as having acted
      // Note: 'fold' is considered a valid action (counts as having acted)
      // Note: Players with 0 starting chips are skipped (they auto-fold)
      for (let i = 0; i < currentPlayerIndex; i++) {
        const prevPosition = actionOrder[i];
        const prevPlayer = players.find(p => p.position === prevPosition && p.name);

        if (prevPlayer) {
          // Skip 0-chip players - they don't block action progression
          const prevStartingStack = sectionStacks?.['preflop_base']?.initial?.[prevPlayer.id] || prevPlayer.stack;
          if (prevStartingStack === 0) {
            console.log(`🔍 [Turn Check] ${currentPlayer.name} (${currentPlayer.position}) skipping 0-chip player ${prevPlayer.name} (${prevPosition})`);
            continue; // Skip to next player
          }

          const prevAction = playerData[prevPlayer.id]?.preflopAction as ActionType | undefined;
          const prevIsAllIn = playerData[prevPlayer.id]?.allInFromPrevious === true;

          console.log(`🔍 [Turn Check] ${currentPlayer.name} (${currentPlayer.position}) checking prev player ${prevPlayer.name} (${prevPosition}): action="${prevAction}", isAllIn=${prevIsAllIn}`);

          // In BASE level, undefined means player has default 'fold', which counts as having acted
          // So we DON'T block on undefined in BASE level

          // If previous player action is 'no action' and not all-in, current player cannot act yet
          if (prevAction === 'no action' && !prevIsAllIn) {
            console.log(`❌ [Turn Check] ${currentPlayer.name} BLOCKED - ${prevPlayer.name} has 'no action'`);
            return []; // Not current player's turn yet
          }
        }
      }

      console.log(`✅ [Turn Check] ${currentPlayer.name} (${currentPlayer.position}) - all previous players have acted, buttons ENABLED`);

      // Now calculate contributions for preflop base
      const contributions = new Map<number, number>();
      for (const player of players) {
        if (!player.name) continue;
        let contribution = 0;

        // Start with blind contributions (use actual blind values from stackData)
        if (player.position === 'SB') contribution = stackData.smallBlind;
        if (player.position === 'BB') contribution = stackData.bigBlind;

        // Add action contribution
        const action = playerData[player.id]?.preflopAction as ActionType | undefined;
        const amount = playerData[player.id]?.preflopAmount as number | undefined;
        const unit = playerData[player.id]?.preflopUnit as string | undefined;
        // Use stackData unit as fallback if player unit is not set
        const effectiveUnit = (unit && unit !== 'undefined') ? unit : stackData.unit;

        console.log(`   🔍 [Contribution Calc] ${player.name} (${player.position}): action="${action}", amount=${amount}, unit="${unit}", effectiveUnit="${effectiveUnit}", blind=${contribution}`);

        // If player has acted (and it's not fold or no action), use the action amount
        // Note: "none" and "no action" are treated the same - player hasn't voluntarily acted yet
        if (action && action !== 'no action' && action !== 'fold' && (action as string) !== 'none' && action !== undefined) {
          // Convert amount based on unit
          let convertedAmount = amount || 0;
          if (effectiveUnit === 'K') {
            convertedAmount = (amount || 0) * 1000;
          } else if (effectiveUnit === 'Mil') {
            convertedAmount = (amount || 0) * 1000000;
          }
          contribution = convertedAmount || contribution;
          console.log(`   → Using action amount: ${amount}${effectiveUnit || ''} = ${contribution}`);
        } else {
          console.log(`   → Using blind: ${contribution}`);
        }

        contributions.set(player.id, contribution);
      }

      const playerContribution = contributions.get(playerId) || 0;
      const maxContribution = Math.max(...contributions.values());

      console.log(`🎯 [getAvailableActionsForPlayer] ${currentPlayer.name} contribution: ${playerContribution}, max contribution: ${maxContribution}`);

      // Available actions based on contribution
      const actions: ActionType[] = [];

      // Check: Only enabled when contribution matches max
      if (playerContribution >= maxContribution) {
        console.log(`✅ [getAvailableActionsForPlayer] ${currentPlayer.name} can CHECK (${playerContribution} >= ${maxContribution})`);
        actions.push('check');
      }

      // Call: Only enabled when facing a bet
      if (playerContribution < maxContribution) {
        console.log(`✅ [getAvailableActionsForPlayer] ${currentPlayer.name} can CALL (${playerContribution} < ${maxContribution})`);
        actions.push('call');
      }

      // Raise: Always available (except when capped)
      actions.push('raise');

      // Fold: ALWAYS enabled in PreFlop BASE (default action)
      actions.push('fold');

      // All-in: Always available
      actions.push('all-in');

      // No action: Always available
      actions.push('no action');

      return actions;
    }

    // For MORE ACTION rounds: Sequential enabling logic
    const activePlayers = getActivePlayers();
    const currentPlayerIndex = activePlayers.findIndex(p => p.id === playerId);

    if (currentPlayerIndex === -1) {
      return []; // Player not found
    }

    // IMPORTANT: Check if player is all-in FIRST (before checking action order)
    // A player who is all-in cannot take any further actions
    const playerStatus = checkPlayerNeedsToAct(playerId, 'preflop', actionLevel, players, playerData);

    if (playerStatus.alreadyAllIn) {
      // Player is all-in from previous round - show locked all-in button
      console.log(`🔒 [getAvailableActionsForPlayer] Player ${playerId} is all-in, showing locked state`);
      return ['all-in']; // Special locked state - will be handled by UI
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
            const playerStatus = checkPlayerNeedsToAct(nextPlayer.id, 'preflop', actionLevel, players, playerData);

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
          // Base level: Use action order to find next active player
          const totalPlayers = players.filter(p => p.name).length;

          // Determine PREFLOP action order based on original player count
          let actionOrder: string[];
          if (totalPlayers === 2) {
            actionOrder = ['SB', 'Dealer', 'BB'];
          } else if (totalPlayers === 3) {
            actionOrder = ['Dealer', 'SB', 'BB'];
          } else {
            actionOrder = ['UTG', 'UTG+1', 'UTG+2', 'LJ', 'MP', 'MP+1', 'MP+2', 'HJ', 'CO', 'Dealer', 'SB', 'BB'];
          }

          // Find current player's position in action order
          const currentPlayer = players.find(p => p.id === currentPlayerId);
          if (!currentPlayer) {
            console.log(`❌ [navigateAfterAction] Current player not found`);
            return;
          }

          const currentPlayerIndex = actionOrder.indexOf(currentPlayer.position);
          console.log(`🔍 [navigateAfterAction] Current player ${currentPlayer.name} (${currentPlayer.position}) at index ${currentPlayerIndex} in action order`);

          // Find next active player in action order (who hasn't folded and has a name)
          let foundNextPlayer = false;
          for (let i = currentPlayerIndex + 1; i < actionOrder.length; i++) {
            const nextPosition = actionOrder[i];
            const nextPlayer = players.find(p => p.position === nextPosition && p.name);

            if (nextPlayer) {
              // In PreFlop BASE, all players with names are active (fold is just a default selection)
              // So we just need to find the next player in action order who has a name
              const selector = `[data-card-focus="${nextPlayer.id}-1-preflop${suffix}"]`;
              console.log(`🎯 [navigateAfterAction] Next player: ${nextPlayer.name} (${nextPlayer.position}), looking for ${selector}`);
              const nextElement = document.querySelector(selector) as HTMLElement;
              if (nextElement) {
                console.log(`✅ [navigateAfterAction] Found next element, focusing on ${nextPlayer.name}`);
                nextElement.focus();
                foundNextPlayer = true;
                break;
              } else {
                console.log(`❌ [navigateAfterAction] Next element not found for ${nextPlayer.name}`);
              }
            }
          }

          if (!foundNextPlayer) {
            // No more players in action order - navigate to Process Stack button
            console.log(`🏁 [navigateAfterAction] No more players in action order, navigating to Process Stack`);
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

    // FR-12 VALIDATION: Comprehensive raise/bet validation
    // Run full FR-12 validation for all players with bet/raise actions
    // ONLY validate sections that haven't been processed yet
    console.log('🔍 [ProcessStack] Running FR-12 validation for all raise/bet amounts...');
    console.log('📋 Current visible levels:', currentLevels);
    console.log('✅ Processed sections:', processedSections);
    const validationErrors: string[] = [];

    currentLevels.forEach((actionLevel) => {
      const sectionKey = `preflop_${actionLevel}`;
      console.log(`\n🔍 Checking section: ${sectionKey}`);
      console.log(`   - Is processed? ${processedSections[sectionKey]}`);

      // Skip validation for sections that are already processed
      if (processedSections[sectionKey]) {
        console.log(`⏭️  Skipping validation for ${sectionKey} (already processed)`);
        return;
      }

      console.log(`✔️  Validating ${sectionKey}...`);

      const suffix = actionLevel === 'base' ? '' : actionLevel === 'more' ? '_moreAction' : '_moreAction2';

      // CRITICAL: Validate players in ACTION ORDER, not player ID order
      // This ensures we validate raises chronologically (UTG → SB → BB)
      // and don't compare early raises against later re-raises
      const totalPlayers = players.filter(p => p.name).length;
      let actionOrder: string[];
      if (totalPlayers === 2) {
        actionOrder = ['SB', 'Dealer', 'BB'];
      } else if (totalPlayers === 3) {
        actionOrder = ['Dealer', 'SB', 'BB'];
      } else {
        actionOrder = ['UTG', 'UTG+1', 'UTG+2', 'LJ', 'MP', 'MP+1', 'MP+2', 'HJ', 'CO', 'Dealer', 'SB', 'BB'];
      }

      const playersInActionOrder = actionOrder.map(pos => players.find(p => p.position === pos)).filter((p): p is Player => p !== undefined);

      // CRITICAL FIX: Validate in action order, calculating max bet only from players who acted BEFORE current player
      // This ensures we validate raises chronologically and don't compare early raises against later re-raises
      playersInActionOrder.forEach((player, currentIndex) => {
        if (!player.name) return;

        const data = playerData[player.id] || {};
        const actionKey = `preflop${suffix}Action` as keyof typeof data;
        const amountKey = `preflop${suffix}Amount` as keyof typeof data;

        const action = data[actionKey] as string;
        const amount = data[amountKey] as string;

        // Only validate if action is bet or raise
        if (action === 'bet' || action === 'raise') {
          const raiseToAmount = parseFloat(amount);

          // Basic validation: check if amount is a valid number > 0
          if (!amount || amount.trim() === '' || isNaN(raiseToAmount) || raiseToAmount <= 0) {
            validationErrors.push(`${player.name} (PreFlop ${actionLevel.toUpperCase()}): Missing or invalid raise amount`);
            return;
          }

          // FR-12 validation: Calculate max bet from players who acted BEFORE this player
          // For MORE ACTION: Need to check cumulative totals (including BASE), not just MORE ACTION amounts
          const playersWhoActedBefore = playersInActionOrder.slice(0, currentIndex);
          let maxBetBeforeThisPlayer = 0;

          if (actionLevel === 'base') {
            // BASE: Compare against previous raises in BASE
            playersWhoActedBefore.forEach(previousPlayer => {
              if (!previousPlayer.name) return;
              const prevData = playerData[previousPlayer.id] || {};
              const prevAction = prevData[actionKey] as string;
              const prevAmount = prevData[amountKey] as string;

              if (prevAction === 'bet' || prevAction === 'raise') {
                const prevRaiseAmount = parseFloat(prevAmount);
                if (!isNaN(prevRaiseAmount)) {
                  maxBetBeforeThisPlayer = Math.max(maxBetBeforeThisPlayer, prevRaiseAmount * 1000);
                }
              }
            });
          } else {
            // MORE ACTION: Must check cumulative totals (BASE + MORE ACTION)
            // Also need to check all players in BASE (not just those who acted before in MORE ACTION)
            playersInActionOrder.forEach(otherPlayer => {
              if (!otherPlayer.name || otherPlayer.id === player.id) return;
              const otherData = playerData[otherPlayer.id] || {};

              // Get BASE amount
              const baseAction = otherData.preflopAction as string;
              const baseAmount = otherData.preflopAmount as string;
              let baseBet = 0;
              if (baseAction === 'bet' || baseAction === 'raise') {
                const baseRaiseAmount = parseFloat(baseAmount);
                if (!isNaN(baseRaiseAmount)) {
                  baseBet = baseRaiseAmount * 1000;
                }
              }

              // Get MORE ACTION amount (cumulative total)
              const moreAction = otherData[actionKey] as string;
              const moreAmount = otherData[amountKey] as string;
              let cumulativeTotal = baseBet;

              if (moreAction === 'bet' || moreAction === 'raise') {
                const moreRaiseAmount = parseFloat(moreAmount);
                if (!isNaN(moreRaiseAmount)) {
                  // MORE ACTION amount is the cumulative total, not incremental
                  cumulativeTotal = moreRaiseAmount * 1000;
                }
              }

              maxBetBeforeThisPlayer = Math.max(maxBetBeforeThisPlayer, cumulativeTotal);
            });
          }

          // Validate: current raise must be > max bet from previous players
          const currentRaiseInChips = raiseToAmount * 1000;
          if (maxBetBeforeThisPlayer > 0 && currentRaiseInChips <= maxBetBeforeThisPlayer) {
            validationErrors.push(
              `${player.name} (PreFlop ${actionLevel.toUpperCase()}): Raise amount (${raiseToAmount}) must be greater than current max bet (${maxBetBeforeThisPlayer / 1000})`
            );
          }
        }
      });
    });

    // If there are validation errors, show them and abort processing
    if (validationErrors.length > 0) {
      alert(
        `Cannot Process Stack - Raise/Bet Validation Failed:\n\n` +
        validationErrors.join('\n\n') +
        `\n\nPlease correct the amounts and try again.`
      );
      console.error('❌ [ProcessStack] FR-12 Validation errors:', validationErrors);
      return;
    }

    console.log('✅ [ProcessStack] All raise/bet amounts passed FR-12 validation');

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

        // Check if all players have folded
        const allFolded = players.filter(p => p.name).every(player => {
          const data = normalizedPlayerData[player.id] || {};
          return data.preflopAction === 'fold';
        });

        if (allFolded) {
          alert('❌ No players to process - all players have folded.');
          console.error('❌ [ProcessStack] All players folded - nothing to process');
          return;
        }
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

      // Set processed state flag and save hash
      const preflopDataHash = JSON.stringify(
        players
          .filter(p => p.name) // Only include players with names
          .map(p => {
            const data = latestPlayerData[p.id] || {};
            return {
              id: p.id,
              preflopAction: data.preflopAction,
              preflopAmount: data.preflopAmount,
              preflopUnit: data.preflopUnit,
              preflop_moreActionAction: data.preflop_moreActionAction,
              preflop_moreActionAmount: data.preflop_moreActionAmount,
              preflop_moreActionUnit: data.preflop_moreActionUnit,
              preflop_moreAction2Action: data.preflop_moreAction2Action,
              preflop_moreAction2Amount: data.preflop_moreAction2Amount,
              preflop_moreAction2Unit: data.preflop_moreAction2Unit,
            };
          })
      );
      setHasProcessedCurrentState(true);
      setLastProcessedPlayerDataHash(preflopDataHash);
      console.log('✅ [PreFlopView] Set hasProcessedCurrentState to true');

      // Check if betting round is complete after processing
      const currentLevel = currentLevels[currentLevels.length - 1]; // Last processed level
      const isRoundComplete = checkBettingRoundComplete(
        'preflop',
        currentLevel,
        players,
        latestPlayerData
      );

      // Format and display pot breakdown if round is complete
      if (isRoundComplete.isComplete && finalPotInfo) {
        console.log('💰 [PreFlopView] latestContributedAmounts:', latestContributedAmounts);
        console.log('💰 [PreFlopView] finalPotInfo:', finalPotInfo);

        const displayData = formatPotsForDisplay(
          finalPotInfo,
          players,
          latestContributedAmounts,
          'preflop',
          {
            sb: stackData.smallBlind || 0,
            bb: stackData.bigBlind || 0,
            ante: stackData.ante || 0
          }
        );
        setPotDisplayData(displayData);
        setShowPotDisplay(true);
        console.log('💰 [PreFlopView] Pot display data prepared:', displayData);
      } else {
        setShowPotDisplay(false);
      }

      // Disable "Add More Action" button if round is complete
      // Note: We just set hasProcessedCurrentState to true above, so use true here instead of old state value
      setIsAddMoreActionDisabled(isRoundComplete.isComplete);
      console.log(`🎯 [PreFlop] Betting round complete: ${isRoundComplete.isComplete}, Add More Action disabled: ${isRoundComplete.isComplete}`);

      // FR-13.4: Return focus after Process Stack completes
      const hasMoreActionButton = (currentLevel === 'base' || currentLevel === 'more') && !isRoundComplete.isComplete;
      const hasCreateNextStreetButton = true; // "Create Flop" button is always available

      returnFocusAfterProcessStack({
        stage: 'preflop',
        actionLevel: currentLevel,
        players,
        playerData: latestPlayerData,
        hasMoreActionButton,
        hasCreateNextStreetButton,
      });

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

  // Determine which streets are available based on potsByStage
  const hasPreflop = potsByStage && Object.keys(potsByStage).some(key => key.startsWith('preflop'));
  const hasFlop = potsByStage && Object.keys(potsByStage).some(key => key.startsWith('flop'));
  const hasTurn = potsByStage && Object.keys(potsByStage).some(key => key.startsWith('turn'));
  const hasRiver = potsByStage && Object.keys(potsByStage).some(key => key.startsWith('river'));

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
          {hasFlop && (
            <button
              onClick={() => setCurrentView('flop')}
              className="px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Flop
            </button>
          )}
          {hasTurn && (
            <button
              onClick={() => setCurrentView('turn')}
              className="px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Turn
            </button>
          )}
          {hasRiver && (
            <button
              onClick={() => setCurrentView('river')}
              className="px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              River
            </button>
          )}
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
        <div className="space-y-4" style={{ overflowX: 'auto', overflowY: 'visible' }}>
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
                const data = playerData[p.id] || {};

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
                  style={{ overflow: 'visible' }}
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

                      // Get the action, default to 'fold' in base level only for DISPLAY (not stored in playerData)
                      let action: ActionType | undefined = (data[actionKey] as ActionType) || undefined;
                      if (!action && actionLevel === 'base') {
                        action = 'fold'; // Default display only - not stored until user acts
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

                              // FR-14.1: Show "Now" stack immediately when initialized, even before processing
                              const currentStack = sectionStacks[sectionKey]?.updated?.[player.id] ??
                                                   (hasProcessedStack ? calculateStartingStack(player, actionLevel) : null);

                              console.log(`🔍 [PreFlopView] Player ${player.id} ${actionLevel}:`, {
                                sectionKey,
                                hasProcessedStack,
                                sectionStacksValue: sectionStacks[sectionKey]?.updated?.[player.id],
                                currentStack
                              });

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
                                          onMouseDown={(e) => {
                                            // Prevent input blur when clicking this button
                                            e.preventDefault();
                                          }}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();

                                            const isExpanding = !isExpanded;
                                            setExpandedStackHistories(prev => ({
                                              ...prev,
                                              [historyKey]: isExpanding
                                            }));

                                            if (isExpanding) {
                                              // Calculate smart positioning based on available viewport space
                                              const buttonElement = e.currentTarget;
                                              const buttonRect = buttonElement.getBoundingClientRect();

                                              // Estimate pop-up dimensions
                                              const estimatedPopupHeight = 600; // Approximate height with all sections
                                              const estimatedPopupWidth = 460; // Max width from style

                                              // Calculate available space above and below
                                              const spaceBelow = window.innerHeight - buttonRect.bottom;
                                              const spaceAbove = buttonRect.top;

                                              // Determine optimal vertical position
                                              const shouldPositionAbove = spaceBelow < estimatedPopupHeight && spaceAbove > spaceBelow;

                                              // Calculate horizontal positioning to prevent cutoff
                                              const buttonCenter = buttonRect.left + (buttonRect.width / 2);
                                              const popupHalfWidth = estimatedPopupWidth / 2;
                                              const spaceLeft = buttonCenter - popupHalfWidth;
                                              const spaceRight = window.innerWidth - (buttonCenter + popupHalfWidth);

                                              // Determine horizontal alignment
                                              let horizontalAlign: 'center' | 'left' | 'right' = 'center';
                                              let leftOffset = 0;

                                              if (spaceLeft < 10) {
                                                // Too close to left edge - align left
                                                horizontalAlign = 'left';
                                                leftOffset = buttonRect.left;
                                              } else if (spaceRight < 10) {
                                                // Too close to right edge - align right
                                                horizontalAlign = 'right';
                                                leftOffset = buttonRect.right;
                                              } else {
                                                // Enough space - center on button
                                                horizontalAlign = 'center';
                                                leftOffset = buttonCenter;
                                              }

                                              setPopupPositions(prev => ({
                                                ...prev,
                                                [historyKey]: shouldPositionAbove ? 'above' : 'below',
                                                [`${historyKey}_horizontal`]: horizontalAlign,
                                                [`${historyKey}_left`]: leftOffset
                                              }));
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
                                  {isExpanded && currentStack !== null && (() => {
                                    const position = popupPositions[historyKey] || 'below';
                                    const horizontalAlign = (popupPositions[`${historyKey}_horizontal`] as 'center' | 'left' | 'right') || 'center';
                                    const leftOffset = (typeof popupPositions[`${historyKey}_left`] === 'number' ? popupPositions[`${historyKey}_left`] : 0) as number;

                                    // Base positioning classes
                                    const verticalClasses = position === 'above'
                                      ? 'absolute z-[100] bottom-full mb-2'
                                      : 'absolute z-[100] mt-2';

                                    // Horizontal positioning transform
                                    let horizontalTransform = '';
                                    if (horizontalAlign === 'center') {
                                      horizontalTransform = 'transform -translate-x-1/2';
                                    } else if (horizontalAlign === 'right') {
                                      horizontalTransform = 'transform -translate-x-full';
                                    }
                                    // left alignment needs no transform

                                    const positionClasses = `${verticalClasses} ${horizontalTransform}`;

                                    return (
                                      <div
                                        data-stack-history-card={historyKey}
                                        className={positionClasses}
                                        style={{
                                          minWidth: '400px',
                                          maxWidth: '460px',
                                          left: `${leftOffset}px`
                                        }}>
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
                                              const totalContribution = baseStackBefore - baseStackAfter;
                                              const isActiveRound = actionLevel === 'base';

                                              // Get posted amounts
                                              const postedSB = data.postedSB || 0;
                                              const postedBB = data.postedBB || 0;
                                              const postedAnte = data.postedAnte || 0;
                                              const totalPosted = postedSB + postedBB + postedAnte;

                                              // Calculate betting contribution (excluding antes)
                                              const bettingContribution = totalContribution - totalPosted;

                                              // Determine if we should show breakdown
                                              const showBreakdown = totalPosted > 0 && (baseAction === 'raise' || baseAction === 'call' || baseAction === 'all-in');

                                              return (
                                                <div className={`rounded-lg p-2 mb-1 border shadow-sm ${isActiveRound ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-white border-gray-200'}`}>
                                                  <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">BASE</span>
                                                    <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-full ${isActiveRound ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                                                      {isActiveRound ? 'Active' : 'Complete'}
                                                    </span>
                                                  </div>

                                                  {showBreakdown ? (
                                                    // Show detailed breakdown for blinds/antes + action
                                                    <div className="space-y-1">
                                                      {/* Ante line (if applicable) */}
                                                      {postedAnte > 0 && (
                                                        <div className="flex items-center justify-between text-xs bg-orange-50 rounded px-2 py-1">
                                                          <div className="flex items-center gap-1">
                                                            <span className="text-gray-600">{formatStack(baseStackBefore)}</span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                            </svg>
                                                            <span className="font-bold text-gray-800">{formatStack(baseStackBefore - postedAnte)}</span>
                                                          </div>
                                                          <div className="flex items-center gap-1">
                                                            <span className="text-orange-600 text-[10px]">-{formatStack(postedAnte)}</span>
                                                            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-orange-100 text-orange-700">ante</span>
                                                          </div>
                                                        </div>
                                                      )}

                                                      {/* Blinds + Action line - show raise/call/all-in */}
                                                      <div className="flex items-center justify-between text-xs bg-purple-50 rounded px-2 py-1">
                                                        <div className="flex items-center gap-1">
                                                          <span className="text-gray-600">{formatStack(baseStackBefore - postedAnte)}</span>
                                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                          </svg>
                                                          <span className="font-bold text-gray-800">{formatStack(baseStackAfter)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                          <span className="text-purple-600 text-[10px]">-{formatStack(postedSB + postedBB + bettingContribution)}</span>
                                                          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${baseAction === 'all-in' ? 'bg-red-600 text-white' : baseAction === 'raise' ? 'bg-purple-100 text-purple-700' : baseAction === 'call' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                            {baseAction}
                                                          </span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    // Original single-line display for no blinds/antes or no action
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
                                                            <span className="text-gray-500 text-[10px]">-{formatStack(totalContribution)}</span>
                                                            <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${baseAction === 'all-in' ? 'bg-red-600 text-white' : baseAction === 'raise' ? 'bg-purple-100 text-purple-700' : baseAction === 'call' ? 'bg-blue-100 text-blue-700' : baseAction === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                              {baseAction}
                                                            </span>
                                                          </>
                                                        ) : (
                                                          <span className="text-gray-400 text-[10px]">no action</span>
                                                        )}
                                                      </div>
                                                    </div>
                                                  )}
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
                                    );
                                  })()}
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
                              selectedAction={action}
                              selectedUnit={unit as ChipUnit}
                              suffix={suffix}
                              // FR-12: Pass validation props
                              stage="preflop"
                              actionLevel={actionLevel}
                              players={players}
                              playerData={playerData}
                              sectionStacks={sectionStacks}
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
            disabled={isAddMoreActionDisabled || (visibleActionLevels.preflop && visibleActionLevels.preflop.length >= 3)}
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
            disabled={isCreateNextStreetDisabled}
            className="px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>→</span>
            Create Flop
          </button>
        </div>

        {/* POT DISPLAY SECTION - SHOWN AT BOTTOM WHEN BETTING ROUND IS COMPLETE */}
        {showPotDisplay && potDisplayData && (
          <div className="mt-8 mb-8">
            {/* Pot Display Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💰</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Pot Distribution</h2>
                    <p className="text-sm text-white/90 mt-1">PREFLOP betting round complete</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPotDisplay(false)}
                  className="text-white/80 hover:text-white text-3xl font-bold leading-none px-2 transition-colors"
                  aria-label="Close pot display"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Pot Display Content */}
            <div className="bg-gray-100 rounded-b-xl p-6 shadow-xl">
              <PotCalculationDisplay
                totalPot={potDisplayData.totalPot}
                mainPot={potDisplayData.mainPot}
                sidePots={potDisplayData.sidePots}
                players={potDisplayData.players}
                currentPlayers={state.players}
                stackData={state.stackData}
                actions={actions}
                contributedAmounts={potDisplayData.contributedAmounts}
                playerData={state.playerData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
