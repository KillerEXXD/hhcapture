/**
 * Flop View Component
 *
 * Displays the flop betting round with community cards, actions, and amounts.
 * Implements Start/Now stack display, stack history, and More Action functionality.
 */

import React, { useEffect, useRef, useState } from 'react';
import type { GameState, GameStateActions } from '../../hooks/useGameState';
import type { Player, PlayerData, ActionLevel, ChipUnit, ActionType } from '../../types/poker';
import type { UseCardManagementReturn } from '../../hooks/useCardManagement';
import type { UsePotCalculationReturn } from '../../hooks/usePotCalculation';
import { ActionButtons } from '../poker/ActionButtons';
import { AmountInput } from '../poker/AmountInput';
import { CommunityCardSelector } from '../poker/CommunityCardSelector';
import { processStackSynchronous } from '../../lib/poker/engine/processStack';
import { calculatePotsForBettingRound } from '../../lib/poker/engine/potCalculationEngine';
import { checkBettingRoundComplete } from '../../lib/poker/validators/roundCompletionValidator';
import { checkPlayerNeedsToAct } from '../../lib/poker/validators/playerActionStatus';
import { returnFocusAfterProcessStack } from '../../lib/poker/utils/focusManagement';
import { validateRaiseAmount } from '../../lib/poker/validators/raiseValidator';

interface FlopViewProps {
  state: GameState;
  actions: GameStateActions;
  formatStack: (amount: number) => string;
  onClearAll: () => void;
  onExport: () => void;
  cardManagement: UseCardManagementReturn;
  potCalculation: UsePotCalculationReturn;
}

export const FlopView: React.FC<FlopViewProps> = ({
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
    potsByStage,
    communityCards,
    autoSelectCards
  } = state;
  const {
    setCurrentView,
    setDefaultUnit,
    setPlayerData,
    setProcessedSections,
    setSectionStacks,
    setContributedAmounts,
    setPotsByStage,
    addActionLevel,
    removeActionLevel
  } = actions;

  const units: ChipUnit[] = ['actual', 'K', 'Mil'];

  // Refs for card selectors
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  // State for tracking expanded stack histories
  const [expandedStackHistories, setExpandedStackHistories] = useState<Record<string, boolean>>({});

  // State for tracking pop-up position (above or below) for each player
  const [popupPositions, setPopupPositions] = useState<Record<string, 'above' | 'below'>>({});

  // State for disabling "Add More Action" button when betting round is complete
  const [isAddMoreActionDisabled, setIsAddMoreActionDisabled] = useState(false);

  // State for disabling "Create Next Street" button when betting round is incomplete
  const [isCreateNextStreetDisabled, setIsCreateNextStreetDisabled] = useState(true);

  // State for tracking if current section has been processed
  const [hasProcessedCurrentState, setHasProcessedCurrentState] = useState(false);

  // State for tracking last processed playerData to detect changes
  const [lastProcessedPlayerDataHash, setLastProcessedPlayerDataHash] = useState<string>('');

  // Detect playerData changes and invalidate processed state
  React.useEffect(() => {
    const currentLevels = visibleActionLevels.flop || ['base'];

    // Create hash of current flop playerData to detect changes
    const flopDataHash = JSON.stringify(
      players.map(p => {
        const data = playerData[p.id] || {};
        return {
          id: p.id,
          flopAction: data.flopAction,
          flopAmount: data.flopAmount,
          flopUnit: data.flopUnit,
          flop_moreActionAction: data.flop_moreActionAction,
          flop_moreActionAmount: data.flop_moreActionAmount,
          flop_moreActionUnit: data.flop_moreActionUnit,
          flop_moreAction2Action: data.flop_moreAction2Action,
          flop_moreAction2Amount: data.flop_moreAction2Amount,
          flop_moreAction2Unit: data.flop_moreAction2Unit,
        };
      })
    );

    // If playerData changed, invalidate processed state
    if (lastProcessedPlayerDataHash && flopDataHash !== lastProcessedPlayerDataHash) {
      console.log('🔄 [FlopView] PlayerData changed, invalidating processed state');
      setHasProcessedCurrentState(false);
    }
  }, [playerData, players, lastProcessedPlayerDataHash]);

  // Update button states when playerData or processed state changes
  React.useEffect(() => {
    const currentLevels = visibleActionLevels.flop || ['base'];
    const currentLevel = currentLevels[currentLevels.length - 1];
    const isRoundComplete = checkBettingRoundComplete('flop', currentLevel, players, playerData);

    console.log(`🔄 [FlopView useEffect] Current level: ${currentLevel}, Round complete: ${isRoundComplete.isComplete}, Reason: ${isRoundComplete.reason}, Processed: ${hasProcessedCurrentState}`);

    // "Add More Action" is disabled when round is complete OR when state hasn't been processed
    setIsAddMoreActionDisabled(isRoundComplete.isComplete || !hasProcessedCurrentState);

    // "Create Next Street" is disabled when round is incomplete OR when state hasn't been processed
    setIsCreateNextStreetDisabled(!isRoundComplete.isComplete || !hasProcessedCurrentState);
  }, [playerData, visibleActionLevels.flop, players, hasProcessedCurrentState]);

  // Auto-select community cards on mount if enabled
  useEffect(() => {
    const hasNoFlopCards = !communityCards.flop.card1 && !communityCards.flop.card2 && !communityCards.flop.card3;
    if (autoSelectCards && hasNoFlopCards) {
      cardManagement.autoSelectCommunityCards('flop');
    }
  }, []);

  // Set focus to first card selector on mount
  useEffect(() => {
    console.log('[FlopView] Setting initial focus to first card selector');
    if (card1Ref.current) {
      card1Ref.current.focus();
    }
  }, []);

  // Utility function for suit colors
  const suitColors: Record<string, string> = {
    '♠': 'text-gray-900',
    '♣': 'text-green-700',
    '♥': 'text-red-600',
    '♦': 'text-blue-600',
  };

  // Utility function for action colors
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
        return 'text-red-600';
      case 'no action':
        return 'text-gray-400';
      default:
        return 'text-gray-700';
    }
  };

  /**
   * Calculate the starting stack for the current action level
   * - For BASE: Stack from preflop's final round (more2 -> more -> base)
   * - For MORE/MORE2: Stack from previous flop round's "updated" value
   */
  const calculateStartingStack = (player: Player, currentActionLevel: ActionLevel): number => {
    if (currentActionLevel === 'base') {
      // For BASE: Get the final stack from preflop
      // Check preflop rounds in reverse order: more2 -> more -> base
      if (sectionStacks['preflop_more2']?.updated?.[player.id] !== undefined) {
        return sectionStacks['preflop_more2'].updated[player.id];
      }
      if (sectionStacks['preflop_more']?.updated?.[player.id] !== undefined) {
        return sectionStacks['preflop_more'].updated[player.id];
      }
      if (sectionStacks['preflop_base']?.updated?.[player.id] !== undefined) {
        return sectionStacks['preflop_base'].updated[player.id];
      }
      // Fallback to initial stack
      return player.stack;
    } else {
      // For MORE/MORE2: Use the "initial" stack from sectionStacks for this level
      const sectionKey = `flop_${currentActionLevel}`;
      const sectionData = sectionStacks[sectionKey];

      if (sectionData && sectionData.initial && sectionData.initial[player.id] !== undefined) {
        return sectionData.initial[player.id];
      }

      // Fallback: calculate from previous round's updated stack
      const prevLevel = currentActionLevel === 'more' ? 'base' : 'more';
      const prevSectionKey = `flop_${prevLevel}`;
      const prevSectionData = sectionStacks[prevSectionKey];

      if (prevSectionData && prevSectionData.updated && prevSectionData.updated[player.id] !== undefined) {
        return prevSectionData.updated[player.id];
      }

      // Last fallback: use preflop's final stack
      return calculateStartingStack(player, 'base');
    }
  };

  const getViewTitle = () => {
    if (currentView.includes('-more2')) {
      return 'Flop - More Action 2';
    } else if (currentView.includes('-more')) {
      return 'Flop - More Action 1';
    }
    return 'Flop';
  };

  const handleDefaultUnitChange = (unit: ChipUnit) => {
    setDefaultUnit(unit);
  };

  const getNavigationButtons = () => {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentView('preflop')}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400 transition-colors"
        >
          ← Preflop
        </button>
        <button
          onClick={handleCreateTurn}
          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          Create Turn →
        </button>
      </div>
    );
  };

  // Get players who are still active (not folded in previous streets)
  // NOTE: Players who fold in current street (flop) BASE should still be shown in BASE view
  // They will be filtered out in More Action views by the playersToShow filter
  const getActivePlayers = (): Player[] => {
    return players
      .filter((p: Player) => {
        if (!p.name) return false;
        const data = playerData[p.id];
        if (!data) return true;

        // Check if player folded in preflop (previous street)
        if (data.preflopAction === 'fold') return false;
        if (data.preflop_moreActionAction === 'fold') return false;
        if (data.preflop_moreAction2Action === 'fold') return false;

        // DO NOT filter out players who folded in flop BASE
        // They should remain visible in BASE view with fold button highlighted
        // Only filter them out in More Action views (handled by playersToShow filter below)

        return true;
      })
      .sort((a, b) => {
        const orderA = positionOrder[a.position] || 999;
        const orderB = positionOrder[b.position] || 999;
        return orderA - orderB;
      });
  };

  // Get players who folded in previous streets (preflop)
  // This is used for display purposes to show who folded before flop
  const getFoldedPlayers = (): Player[] => {
    return players.filter((p: Player) => {
      if (!p.name) return false;
      const data = playerData[p.id];
      if (!data) return false;

      // Check if player folded in preflop (previous street)
      if (data.preflopAction === 'fold') return true;
      if (data.preflop_moreActionAction === 'fold') return true;
      if (data.preflop_moreAction2Action === 'fold') return true;

      // Don't include players who folded in current street (flop)
      // They are still active in BASE view
      return false;
    });
  };

  /**
   * Calculate previous street pot from preflop
   */
  const getPreviousStreetPot = (): number => {
    if (potsByStage?.preflop_more2) {
      return potsByStage.preflop_more2.totalPot;
    }
    if (potsByStage?.preflop_more) {
      return potsByStage.preflop_more.totalPot;
    }
    if (potsByStage?.preflop_base) {
      return potsByStage.preflop_base.totalPot;
    }
    return 0;
  };

  /**
   * Handle process stack - Calculate pot and update game state for flop
   */
  const handleProcessStack = () => {
    console.log('🔄 Processing Stack - Flop...');

    const currentLevels = visibleActionLevels.flop || ['base'];
    const previousStreetPot = getPreviousStreetPot();
    console.log(`💰 Previous street pot (from preflop): ${previousStreetPot}`);

    // FR-12 VALIDATION: Comprehensive raise/bet validation
    // Run full FR-12 validation for all players with bet/raise actions
    console.log('🔍 [ProcessStack] Running FR-12 validation for all raise/bet amounts...');
    const validationErrors: string[] = [];

    currentLevels.forEach((actionLevel) => {
      const suffix = actionLevel === 'base' ? '' : actionLevel === 'more' ? '_moreAction' : '_moreAction2';

      players.forEach((player) => {
        if (!player.name) return;

        const data = playerData[player.id] || {};
        const actionKey = `flop${suffix}Action` as keyof typeof data;
        const amountKey = `flop${suffix}Amount` as keyof typeof data;
        const unitKey = `flop${suffix}Unit` as keyof typeof data;

        const action = data[actionKey] as string;
        const amount = data[amountKey] as string;
        const unit = data[unitKey] as ChipUnit;

        // Only validate if action is bet or raise
        if (action === 'bet' || action === 'raise') {
          const raiseToAmount = parseFloat(amount);

          // Basic validation: check if amount is a valid number > 0
          if (!amount || amount.trim() === '' || isNaN(raiseToAmount) || raiseToAmount <= 0) {
            validationErrors.push(`${player.name} (Flop ${actionLevel.toUpperCase()}): Missing or invalid raise amount`);
            return; // Skip FR-12 validation if basic validation fails
          }

          // Run FR-12 validation
          const validationResult = validateRaiseAmount(
            player.id,
            raiseToAmount,
            'flop',
            actionLevel,
            players,
            playerData,
            sectionStacks,
            unit || defaultUnit
          );

          if (!validationResult.isValid) {
            validationErrors.push(
              `${player.name} (Flop ${actionLevel.toUpperCase()}): ${validationResult.errorMessage}`
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
      // Normalize playerData for base level
      let normalizedPlayerData = { ...playerData };
      if (currentLevels.includes('base')) {
        players.forEach((player) => {
          if (!player.name) return;
          const data = normalizedPlayerData[player.id] || {};
          const actionKey = 'flopAction';
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
        setPlayerData(normalizedPlayerData);
      }

      let latestPlayerData = normalizedPlayerData;
      let latestContributedAmounts = contributedAmounts;
      let latestProcessedSections = processedSections;
      let latestSectionStacks = sectionStacks;
      let finalPotInfo: any = null;

      // Process each level sequentially
      currentLevels.forEach((level) => {
        const levelName = level === 'base' ? 'base' : level === 'more' ? 'more' : 'more2';
        console.log(`\n📍 Processing level: ${levelName}`);

        const result = processStackSynchronous(
          'flop',
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

        latestPlayerData = result.updatedPlayerData;
        latestContributedAmounts = result.updatedContributedAmounts;
        latestProcessedSections = result.updatedProcessedSections;
        latestSectionStacks = result.updatedSectionStacks;

        setPlayerData(result.updatedPlayerData);
        setContributedAmounts(result.updatedContributedAmounts);
        setProcessedSections(result.updatedProcessedSections);
        setSectionStacks(result.updatedSectionStacks);

        const sectionKey = `flop_${levelName}`;
        const potInfo = calculatePotsForBettingRound(
          'flop',
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
          previousStreetPot
        );

        setPotsByStage((prev) => ({
          ...prev,
          [sectionKey]: potInfo
        }));

        finalPotInfo = potInfo;

        console.log(`💰 Calculated pot for ${levelName}:`, potInfo.totalPot);
      });

      console.log(`\n✅ Process Stack Complete - Total Pot: ${finalPotInfo.totalPot}`);

      // Set processed state flag and save hash
      const flopDataHash = JSON.stringify(
        players.map(p => {
          const data = latestPlayerData[p.id] || {};
          return {
            id: p.id,
            flopAction: data.flopAction,
            flopAmount: data.flopAmount,
            flopUnit: data.flopUnit,
            flop_moreActionAction: data.flop_moreActionAction,
            flop_moreActionAmount: data.flop_moreActionAmount,
            flop_moreActionUnit: data.flop_moreActionUnit,
            flop_moreAction2Action: data.flop_moreAction2Action,
            flop_moreAction2Amount: data.flop_moreAction2Amount,
            flop_moreAction2Unit: data.flop_moreAction2Unit,
          };
        })
      );
      setHasProcessedCurrentState(true);
      setLastProcessedPlayerDataHash(flopDataHash);
      console.log('✅ [FlopView] Set hasProcessedCurrentState to true');

      alert(
        `Process Stack Complete!\n\n` +
        `Total Pot: ${finalPotInfo.totalPot}\n` +
        `Main Pot: ${finalPotInfo.mainPot.amount}\n` +
        `Side Pots: ${finalPotInfo.sidePots.length}\n` +
        `Dead Money: ${finalPotInfo.deadMoney}\n` +
        `Previous Street Pot: ${previousStreetPot}`
      );

      // Check if betting round is complete after processing
      const currentLevel = currentLevels[currentLevels.length - 1]; // Last processed level
      const isRoundComplete = checkBettingRoundComplete(
        'flop',
        currentLevel,
        players,
        latestPlayerData
      );

      // Disable "Add More Action" button if round is complete
      console.log(`🎯 [Flop handleProcessStack] Current level: ${currentLevel}, Round complete: ${isRoundComplete.isComplete}, Reason: ${isRoundComplete.reason}`);
      setIsAddMoreActionDisabled(isRoundComplete.isComplete || !hasProcessedCurrentState);
      console.log(`🎯 [Flop handleProcessStack] Set isAddMoreActionDisabled to: ${isRoundComplete.isComplete || !hasProcessedCurrentState}`);

      // FR-13.4: Return focus after Process Stack completes
      const hasMoreActionButton = (currentLevel === 'base' || currentLevel === 'more') && !isRoundComplete.isComplete;
      const hasCreateNextStreetButton = true; // "Create Turn" button is always available

      returnFocusAfterProcessStack({
        stage: 'flop',
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
   * Handle More Action button click
   */
  /**
   * Handle Create Turn button click - FR-14.5
   * Copy "Now" stacks from flop's last round to turn_base
   */
  const handleCreateTurn = () => {
    actions.setCurrentView('turn');

    // Initialize turn action levels if not exists
    if (!visibleActionLevels.turn) {
      actions.setVisibleActionLevels({
        ...visibleActionLevels,
        turn: ['base'],
      });
    }

    // FR-14.5: Copy "Now" stacks from flop's last round to turn_base
    const updatedSectionStacks = { ...sectionStacks };
    updatedSectionStacks['turn_base'] = {
      initial: {},
      current: {},
      updated: {}
    };

    getActivePlayers().forEach(player => {
      // Get the final stack from flop (check more2 -> more -> base)
      let flopFinalStack = player.stack;
      if (sectionStacks['flop_more2']?.updated?.[player.id] !== undefined) {
        flopFinalStack = sectionStacks['flop_more2'].updated[player.id];
      } else if (sectionStacks['flop_more']?.updated?.[player.id] !== undefined) {
        flopFinalStack = sectionStacks['flop_more'].updated[player.id];
      } else if (sectionStacks['flop_base']?.updated?.[player.id] !== undefined) {
        flopFinalStack = sectionStacks['flop_base'].updated[player.id];
      }

      updatedSectionStacks['turn_base'].initial[player.id] = player.stack; // Always use original hand starting stack
      updatedSectionStacks['turn_base'].current[player.id] = flopFinalStack;
      updatedSectionStacks['turn_base'].updated[player.id] = flopFinalStack;
    });

    actions.setSectionStacks(updatedSectionStacks);
    console.log(`✅ [handleCreateTurn] Copied flop final stacks to turn_base`);
  };

  const handleMoreAction = () => {
    const currentLevels = visibleActionLevels.flop || ['base'];
    const currentLevel = currentLevels[currentLevels.length - 1]; // Last level

    // Fallback safety check: Is betting round already complete?
    const isComplete = checkBettingRoundComplete('flop', currentLevel, players, playerData);

    if (isComplete.isComplete) {
      // Block the action
      alert('Betting round complete. Please create Turn instead.');

      // Disable the button to prevent repeated clicks
      setIsAddMoreActionDisabled(true);

      // Focus the Create Turn button
      setTimeout(() => {
        const createTurnButton = document.querySelector('[data-create-turn-focus]') as HTMLElement;
        if (createTurnButton) {
          createTurnButton.focus();
        }
      }, 100);

      return; // Don't create More Action
    }

    if (!currentLevels.includes('more')) {
      addActionLevel('flop', 'more');
      console.log('[FlopView] Added More Action 1');

      // Invalidate processed state since new action level was added
      setHasProcessedCurrentState(false);
      console.log('🔄 [FlopView] Invalidated processed state (added More Action 1)');

      // FR-14.3: Copy "Now" stacks from BASE to More Action 1
      const previousSectionKey = 'flop_base';
      const newSectionKey = 'flop_more';
      const updatedSectionStacks = { ...sectionStacks };
      updatedSectionStacks[newSectionKey] = {
        initial: {},
        current: {},
        updated: {}
      };

      getActivePlayers().forEach(player => {
        const previousNowStack = sectionStacks[previousSectionKey]?.updated?.[player.id] ?? player.stack;
        updatedSectionStacks[newSectionKey].initial[player.id] = player.stack; // Always use original hand starting stack
        updatedSectionStacks[newSectionKey].current[player.id] = previousNowStack;
        updatedSectionStacks[newSectionKey].updated[player.id] = previousNowStack;
      });

      setSectionStacks(updatedSectionStacks);
      console.log(`✅ Copied "Now" stacks from ${previousSectionKey} to ${newSectionKey}`);

    } else if (!currentLevels.includes('more2')) {
      addActionLevel('flop', 'more2');
      console.log('[FlopView] Added More Action 2');

      // Invalidate processed state since new action level was added
      setHasProcessedCurrentState(false);
      console.log('🔄 [FlopView] Invalidated processed state (added More Action 2)');

      // FR-14.4: Copy "Now" stacks from More Action 1 to More Action 2
      const previousSectionKey = 'flop_more';
      const newSectionKey = 'flop_more2';
      const updatedSectionStacks = { ...sectionStacks };
      updatedSectionStacks[newSectionKey] = {
        initial: {},
        current: {},
        updated: {}
      };

      getActivePlayers().forEach(player => {
        const previousNowStack = sectionStacks[previousSectionKey]?.updated?.[player.id] ?? player.stack;
        updatedSectionStacks[newSectionKey].initial[player.id] = player.stack; // Always use original hand starting stack
        updatedSectionStacks[newSectionKey].current[player.id] = previousNowStack;
        updatedSectionStacks[newSectionKey].updated[player.id] = previousNowStack;
      });

      setSectionStacks(updatedSectionStacks);
      console.log(`✅ Copied "Now" stacks from ${previousSectionKey} to ${newSectionKey}`);

    } else {
      alert('Maximum action levels reached (BASE + More Action 1 + More Action 2)');
    }
  };

  // Define position order for postflop (action order)
  const positionOrder: Record<string, number> = {
    'SB': 1,
    'BB': 2,
    'UTG': 3,
    'UTG+1': 4,
    'UTG+2': 5,
    'MP': 6,
    'HJ': 7,
    'MP+1': 8,
    'MP+2': 9,
    'CO': 10,
    'Dealer': 11,
    '': 999
  };

  /**
   * Get available actions for a player based on action level and previous players' actions
   * Implements FR-1 (Sequential Player Enabling) and FR-9 (More Action Enabling Logic)
   *
   * For BASE rounds: All players enabled (but first player has no 'call' - FR-2)
   * For MORE ACTION rounds: Sequential enabling - previous player must act first
   */
  const getAvailableActionsForPlayer = (playerId: number, suffix: string): ActionType[] => {
    const actionLevel: ActionLevel =
      suffix === '' ? 'base' :
      suffix === '_moreAction' ? 'more' : 'more2';

    // For BASE level: All players enabled, but first player has no 'call' (FR-2)
    if (actionLevel === 'base') {
      const activePlayers = getActivePlayers();
      const isFirstPlayer = activePlayers.length > 0 && activePlayers[0].id === playerId;

      // Check if player is all-in from previous rounds
      const playerStatus = checkPlayerNeedsToAct(playerId, 'flop', actionLevel, players, playerData);

      if (playerStatus.alreadyAllIn) {
        // Player is all-in from previous round - skip this player
        console.log(`🔒 [getAvailableActionsForPlayer-BASE] Player ${playerId} is all-in, showing locked state`);
        return ['all-in']; // Special locked state
      }

      if (isFirstPlayer) {
        // FR-2: First player in post-flop BASE cannot call/fold/no action
        return ['check', 'bet', 'raise', 'all-in'];
      }

      // All other players have full actions in BASE
      return ['fold', 'check', 'call', 'bet', 'raise', 'all-in', 'no action'];
    }

    // For MORE ACTION rounds: Sequential enabling logic (FR-1, FR-9)
    const activePlayers = getActivePlayers();
    const currentPlayerIndex = activePlayers.findIndex(p => p.id === playerId);

    if (currentPlayerIndex === -1) {
      return []; // Player not found
    }

    // Check if player has already acted
    const actionKey = `flop${suffix}Action` as keyof PlayerData[number];
    const playerAction = playerData[playerId]?.[actionKey];

    // If player has already acted, allow them to modify their action (FR-1.3)
    if (playerAction && playerAction !== 'no action') {
      return ['call', 'raise', 'all-in', 'fold']; // FR-9.2: No check/bet/no action in More Actions
    }

    // First player in more action: Enable buttons
    if (currentPlayerIndex === 0) {
      return ['call', 'raise', 'all-in', 'fold']; // FR-9.2
    }

    // Subsequent players: Check if previous player has acted (FR-1.2)
    const previousPlayer = activePlayers[currentPlayerIndex - 1];
    const previousPlayerData = playerData[previousPlayer.id];
    const previousPlayerAction = previousPlayerData?.[actionKey];

    // If previous player hasn't acted yet, disable all buttons
    if (!previousPlayerAction || previousPlayerAction === 'no action') {
      return []; // Disabled - sequential enabling
    }

    // Check if THIS SPECIFIC PLAYER needs to act (using FR-9 logic)
    const playerStatus = checkPlayerNeedsToAct(playerId, 'flop', actionLevel, players, playerData);

    if (playerStatus.alreadyAllIn) {
      // Player is all-in from previous round - show locked all-in button (FR-11)
      console.log(`🔒 [getAvailableActionsForPlayer] Player ${playerId} is all-in, showing locked state`);
      return ['all-in']; // Special locked state
    }

    if (playerStatus.alreadyMatchedMaxBet) {
      // Player already matched max bet from previous round - no action required
      console.log(`✅ [getAvailableActionsForPlayer] Player ${playerId} already matched max bet, no action required`);
      return []; // Will show "No action required" in UI
    }

    // Player needs to act - FR-9.2: Only call, raise, all-in, fold in More Actions
    console.log(`▶️  [getAvailableActionsForPlayer] Player ${playerId} needs to act`);
    return ['call', 'raise', 'all-in', 'fold'];
  };

  /**
   * Navigate after an action is selected - handles keyboard navigation flow
   */
  const navigateAfterAction = (currentPlayerId: number, suffix: string) => {
    // Determine action level from suffix
    const actionLevel: ActionLevel =
      suffix === '' ? 'base' :
      suffix === '_moreAction' ? 'more' : 'more2';

    console.log(`🔍 [navigateAfterAction] Player ${currentPlayerId}, suffix: "${suffix}", actionLevel: ${actionLevel}`);

    // Check if betting round is complete
    const completionCheck = checkBettingRoundComplete('flop', actionLevel, players, playerData);
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
            const playerStatus = checkPlayerNeedsToAct(nextPlayer.id, 'flop', actionLevel, players, playerData);

            console.log(`🔍 [navigateAfterAction] Checking player ${nextPlayer.name} (${nextPlayer.id}):`, playerStatus);

            if (playerStatus.needsToAct) {
              // Found a player who needs to act - navigate to them
              console.log(`✅ [navigateAfterAction] Found player who needs to act: ${nextPlayer.name}`);
              const selector = `[data-action-focus="${nextPlayer.id}-flop${suffix}"]`;
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
          // Base level: Simple sequential navigation
          const nextPlayerIndex = playerIndex + 1;
          if (nextPlayerIndex < activePlayers.length) {
            const nextPlayer = activePlayers[nextPlayerIndex];
            const selector = `[data-action-focus="${nextPlayer.id}-flop${suffix}"]`;
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
   * Player Action Selector Wrapper with Keyboard Navigation
   */
  const PlayerActionSelector: React.FC<{ playerId: number; suffix: string; action: ActionType | null | undefined; children: React.ReactNode }> = ({ playerId, suffix, action, children }) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Handle action selection via keyboard shortcuts
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const key = e.key.toLowerCase();
        const shortcutMap: Record<string, ActionType> = {
          'f': 'fold',
          'c': action === 'bet' || action === 'raise' ? 'call' : 'check',
          'k': 'check',
          'b': 'bet',
          'r': 'raise',
          'a': 'all-in',
          'n': 'no action',
        };

        const selectedAction = shortcutMap[key];
        if (selectedAction) {
          e.preventDefault();
          // Update action in state
          const actionKey = suffix === '' ? 'flopAction' : suffix === '_moreAction' ? 'flop_moreActionAction' : 'flop_moreAction2Action';
          actions.setPlayerData({
            ...playerData,
            [playerId]: {
              ...playerData[playerId],
              [actionKey]: selectedAction,
            },
          });

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
      }

      // Tab: Move to Amount input if bet/raise, otherwise next player's Action
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
    };

    return (
      <div
        data-action-focus={`${playerId}-flop${suffix}`}
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

        {/* COMMUNITY CARDS SECTION */}
        <div className="mb-3 p-3 bg-green-100 border-2 border-green-300 rounded">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-800">Flop Community Cards</div>
            {autoSelectCards && (
              <button
                onClick={() => cardManagement.autoSelectCommunityCards('flop')}
                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
              >
                Auto-Select Cards
              </button>
            )}
          </div>

          {/* Visual Card Display */}
          <div className="flex gap-3 mb-3 justify-center">
            {[1, 2, 3].map((cardNum) => {
              const card = communityCards.flop[`card${cardNum}` as 'card1' | 'card2' | 'card3'];
              return (
                <div key={cardNum} className="flex flex-col items-center">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Flop {cardNum}</div>
                  <div className={`w-20 h-28 rounded-lg border-2 shadow-md flex flex-col items-center justify-center transition-all ${
                    card ? 'bg-white border-green-500' : 'bg-gray-50 border-gray-300'
                  }`}>
                    {card ? (
                      <>
                        <div className="text-4xl font-bold text-gray-900">
                          {card.rank === 'T' ? '10' : card.rank}
                        </div>
                        <div className={`text-4xl ${suitColors[card.suit]}`}>
                          {card.suit}
                        </div>
                      </>
                    ) : (
                      <div className="text-4xl font-bold text-gray-300">?</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Button Selectors */}
          <div className="flex gap-3 items-center justify-center">
            <CommunityCardSelector
              ref={card1Ref}
              stage="flop"
              cardNumber={1}
              label="Flop 1"
              currentCard={communityCards.flop.card1}
              onCardChange={cardManagement.updateCommunityCard}
              isCardAvailable={(rank, suit) => cardManagement.checkCardAvailable(rank, suit, communityCards.flop.card1)}
              autoSelect={autoSelectCards}
            />
            <CommunityCardSelector
              ref={card2Ref}
              stage="flop"
              cardNumber={2}
              label="Flop 2"
              currentCard={communityCards.flop.card2}
              onCardChange={cardManagement.updateCommunityCard}
              isCardAvailable={(rank, suit) => cardManagement.checkCardAvailable(rank, suit, communityCards.flop.card2)}
              autoSelect={autoSelectCards}
            />
            <CommunityCardSelector
              ref={card3Ref}
              stage="flop"
              cardNumber={3}
              label="Flop 3"
              currentCard={communityCards.flop.card3}
              onCardChange={cardManagement.updateCommunityCard}
              isCardAvailable={(rank, suit) => cardManagement.checkCardAvailable(rank, suit, communityCards.flop.card3)}
              autoSelect={autoSelectCards}
            />
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
          {visibleActionLevels.flop?.map((actionLevel: ActionLevel) => {
            const suffix =
              actionLevel === 'base' ? '' :
              actionLevel === 'more' ? '_moreAction' : '_moreAction2';
            const levelLabel =
              actionLevel === 'base' ? 'BASE ACTIONS' :
              actionLevel === 'more' ? 'MORE ACTION 1' : 'MORE ACTION 2';
            const levelBgColor =
              actionLevel === 'base' ? 'bg-white' :
              actionLevel === 'more' ? 'bg-blue-50' : 'bg-green-50';
            const levelBorderColor =
              actionLevel === 'base' ? 'border-gray-300' :
              actionLevel === 'more' ? 'border-blue-300' : 'border-green-300';

            const playersToShow = getActivePlayers()
              .filter((p: Player) => {
                if (actionLevel === 'base') return true;
                const data = playerData[p.id];
                if (!data) return true;

                if (actionLevel === 'more') {
                  return data.flopAction !== 'fold';
                }
                if (actionLevel === 'more2') {
                  return (
                    data.flopAction !== 'fold' &&
                    data.flop_moreActionAction !== 'fold'
                  );
                }
                return true;
              })
              .sort((a, b) => {
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
                <div className={`${levelBgColor} border-2 ${levelBorderColor} rounded-t-lg px-3 py-2`}>
                  <h3 className="text-sm font-bold text-gray-800">
                    {levelLabel} - {getViewTitle()}
                  </h3>
                </div>

                {/* MAIN TABLE */}
                <table className={`w-full border-collapse border-2 ${levelBorderColor}`} style={{ overflow: 'visible' }}>
                  <thead>
                    <tr className={levelBgColor}>
                      <th className={`border ${levelBorderColor} px-3 py-2 text-left text-sm font-medium text-gray-700`}>
                        Player
                      </th>
                      <th className={`border ${levelBorderColor} px-4 py-2 text-center text-sm font-medium text-gray-700 w-32`}>
                        Stack
                      </th>
                      <th className={`border ${levelBorderColor} px-3 py-2 text-center text-sm font-medium text-gray-700`}>
                        Action
                      </th>
                      <th className={`border ${levelBorderColor} px-4 py-2 text-center text-sm font-medium text-gray-700 w-32`}>
                        Amount/Unit
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {playersToShow.map((player: Player, playerIndex: number) => {
                      const data = playerData[player.id] || {};
                      const actionKey = `flop${suffix}Action`;
                      const amountKey = `flop${suffix}Amount`;
                      const unitKey = `flop${suffix}Unit`;

                      const action = (data[actionKey] as ActionType) || '';
                      const amount = (data[amountKey] as string) || '';
                      const unit = (data[unitKey] as ChipUnit) || defaultUnit;

                      // Check if this is the first player to act (opening action)
                      const isFirstToAct = playerIndex === 0;

                      // Stack display logic
                      const historyKey = `${player.id}-flop-${actionLevel}`;
                      const isExpanded = expandedStackHistories[historyKey] || false;
                      const sectionKey = `flop_${actionLevel}`;
                      const hasProcessedStack = processedSections[sectionKey];
                      const startingStack = player.stack; // Always show hand's initial stack

                      // FR-14.1: Show "Now" stack immediately when initialized, even before processing
                      const currentStack = sectionStacks[sectionKey]?.updated?.[player.id] ??
                                           (hasProcessedStack ? startingStack : null);
                      const isAllIn = currentStack !== null && currentStack === 0;

                      return (
                        <tr key={player.id} className={levelBgColor}>
                          {/* PLAYER NAME */}
                          <td className={`border ${levelBorderColor} px-3 py-2 text-sm font-medium text-gray-800`}>
                            {player.name}
                            {player.position && (
                              <span className="ml-2 text-xs text-blue-600">
                                ({player.position})
                              </span>
                            )}
                          </td>

                          {/* STACK - Start/Now Display */}
                          <td className={`border ${levelBorderColor} px-2 py-2 text-center relative`} style={{ overflow: 'visible' }}>
                            <div className="space-y-1">
                              {/* Start Stack */}
                              <div className="flex items-center justify-between bg-blue-50 rounded px-2 py-1 border border-blue-200">
                                <span className="text-[10px] text-blue-600">Start:</span>
                                <span className="text-xs font-bold text-blue-900">{formatStack(startingStack)}</span>
                              </div>

                              {/* Now Stack */}
                              <div className="flex items-center gap-1">
                                <div className={`flex-1 flex items-center justify-between rounded px-2 py-1 border ${isAllIn ? 'bg-red-50 border-2 border-red-400' : 'bg-green-50 border-green-200'}`}>
                                  <span className={`text-[10px] ${isAllIn ? 'text-red-700 font-bold' : 'text-green-600'}`}>Now:</span>
                                  {currentStack !== null ? (
                                    <span className={`text-xs font-bold ${isAllIn ? 'text-red-900' : 'text-green-900'}`}>{formatStack(currentStack)}</span>
                                  ) : (
                                    <span className="text-xs font-bold text-gray-400">-</span>
                                  )}
                                </div>

                                {/* History Button */}
                                {currentStack !== null && (
                                  <button
                                    onMouseDown={(e) => {
                                      // Prevent input blur when clicking this button
                                      console.log('[FlopView] History button mousedown - preventing default to avoid blur');
                                      e.preventDefault();
                                    }}
                                    onClick={(e) => {
                                      console.log('[FlopView] History button clicked');
                                      console.log('[FlopView] e.preventDefault() called');
                                      e.preventDefault();
                                      console.log('[FlopView] e.stopPropagation() called');
                                      e.stopPropagation();
                                      console.log('[FlopView] Event propagation stopped');

                                      const isExpanding = !isExpanded;
                                      console.log('[FlopView] isExpanding:', isExpanding);
                                      setExpandedStackHistories(prev => ({
                                        ...prev,
                                        [historyKey]: isExpanding
                                      }));

                                      if (isExpanding) {
                                        // Calculate smart positioning based on available viewport space
                                        const buttonElement = e.currentTarget;
                                        const buttonRect = buttonElement.getBoundingClientRect();

                                        console.log('[FlopView] Button position:', {
                                          top: buttonRect.top,
                                          bottom: buttonRect.bottom,
                                          left: buttonRect.left,
                                          right: buttonRect.right
                                        });

                                        // Estimate pop-up height (can be adjusted based on content)
                                        const estimatedPopupHeight = 600; // Approximate height with all sections

                                        // Calculate available space above and below
                                        const spaceBelow = window.innerHeight - buttonRect.bottom;
                                        const spaceAbove = buttonRect.top;

                                        console.log('[FlopView] Space calculation:', {
                                          viewportHeight: window.innerHeight,
                                          spaceBelow,
                                          spaceAbove,
                                          estimatedPopupHeight
                                        });

                                        // Determine optimal position
                                        const shouldPositionAbove = spaceBelow < estimatedPopupHeight && spaceAbove > spaceBelow;

                                        console.log('[FlopView] Positioning decision:', {
                                          shouldPositionAbove,
                                          finalPosition: shouldPositionAbove ? 'above' : 'below'
                                        });

                                        setPopupPositions(prev => ({
                                          ...prev,
                                          [historyKey]: shouldPositionAbove ? 'above' : 'below'
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
                              const positionClasses = position === 'above'
                                ? 'absolute z-[100] bottom-full mb-2 left-1/2 transform -translate-x-1/2'
                                : 'absolute z-[100] mt-2 left-1/2 transform -translate-x-1/2';

                              return (
                                <div data-stack-history-card={historyKey} className={positionClasses} style={{ minWidth: '400px', maxWidth: '460px' }}>
                                  <div className={`bg-gradient-to-br rounded-xl shadow-2xl border-2 overflow-hidden ${isAllIn ? 'from-red-50 to-orange-50 border-red-400' : 'from-white to-blue-50 border-blue-300'}`}>
                                  {/* Card Header */}
                                  <div className={`bg-gradient-to-r px-3 py-2 flex items-center justify-between ${isAllIn ? 'from-red-600 to-red-700' : 'from-blue-600 to-blue-700'}`}>
                                    <div className="flex items-center gap-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                      </svg>
                                      <h3 className="text-white font-bold text-xs">
                                        {player.name} - Stack History (Flop {actionLevel.toUpperCase()})
                                      </h3>
                                    </div>
                                    <button
                                      onClick={() => setExpandedStackHistories(prev => ({
                                        ...prev,
                                        [historyKey]: false
                                      }))}
                                      className="text-white hover:text-gray-200 transition-colors"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>

                                  {/* Card Body */}
                                  <div className="p-3 space-y-2">
                                    {/* PreFlop BASE Round */}
                                    {(() => {
                                      const preflopAction = (typeof data.preflopAction === 'string' ? data.preflopAction : '') as string;
                                      const preflopInitialStack = player.stack - (data.postedSB || 0) - (data.postedBB || 0);
                                      const stackBefore = preflopInitialStack;
                                      const stackAfter = sectionStacks['preflop_base']?.updated?.[player.id] ?? stackBefore;
                                      const contribution = stackBefore - stackAfter;

                                      return (
                                        <div className="bg-indigo-50 rounded-lg p-2 border-l-4 border-indigo-400 shadow-sm">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide">PreFlop BASE</span>
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
                                              {preflopAction && preflopAction !== 'no action' && preflopAction !== 'check' ? (
                                                <>
                                                  <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                  <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${preflopAction === 'all-in' ? 'bg-red-600 text-white' : preflopAction === 'raise' ? 'bg-purple-100 text-purple-700' : preflopAction === 'call' ? 'bg-blue-100 text-blue-700' : preflopAction === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {preflopAction}
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

                                    {/* PreFlop MORE Action 1 Round */}
                                    {sectionStacks['preflop_more'] && (() => {
                                      const preflopMoreAction = (typeof data.preflop_moreActionAction === 'string' ? data.preflop_moreActionAction : '') as string;
                                      const stackBefore = sectionStacks['preflop_base']?.updated?.[player.id] ?? player.stack;
                                      const stackAfter = sectionStacks['preflop_more']?.updated?.[player.id] ?? stackBefore;
                                      const contribution = stackBefore - stackAfter;

                                      return (
                                        <div className="bg-teal-50 rounded-lg p-2 border-l-4 border-teal-400 shadow-sm">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wide">PreFlop MA1</span>
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
                                              {preflopMoreAction && preflopMoreAction !== 'no action' && preflopMoreAction !== 'check' ? (
                                                <>
                                                  <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                  <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${preflopMoreAction === 'all-in' ? 'bg-red-600 text-white' : preflopMoreAction === 'raise' ? 'bg-purple-100 text-purple-700' : preflopMoreAction === 'call' ? 'bg-blue-100 text-blue-700' : preflopMoreAction === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {preflopMoreAction}
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

                                    {/* PreFlop MORE Action 2 Round */}
                                    {sectionStacks['preflop_more2'] && (() => {
                                      const preflopMore2Action = (typeof data.preflop_moreAction2Action === 'string' ? data.preflop_moreAction2Action : '') as string;
                                      const stackBefore = sectionStacks['preflop_more']?.updated?.[player.id] ?? player.stack;
                                      const stackAfter = sectionStacks['preflop_more2']?.updated?.[player.id] ?? stackBefore;
                                      const contribution = stackBefore - stackAfter;

                                      return (
                                        <div className="bg-cyan-50 rounded-lg p-2 border-l-4 border-cyan-400 shadow-sm">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wide">PreFlop MA2</span>
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
                                              {preflopMore2Action && preflopMore2Action !== 'no action' && preflopMore2Action !== 'check' ? (
                                                <>
                                                  <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                  <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${preflopMore2Action === 'all-in' ? 'bg-red-600 text-white' : preflopMore2Action === 'raise' ? 'bg-purple-100 text-purple-700' : preflopMore2Action === 'call' ? 'bg-blue-100 text-blue-700' : preflopMore2Action === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {preflopMore2Action}
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

                                    {/* FLOP BASE Round */}
                                    {(() => {
                                      const baseAction = (typeof data.flopAction === 'string' ? data.flopAction : '') as string;
                                      const stackBefore = calculateStartingStack(player, 'base');
                                      const stackAfter = sectionStacks['flop_base']?.updated?.[player.id] ?? stackBefore;
                                      const contribution = stackBefore - stackAfter;

                                      return (
                                        <div className="bg-gray-50 rounded-lg p-2 border-l-4 border-gray-400 shadow-sm">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wide">FLOP BASE</span>
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

                                    {/* MORE Action 1 Round */}
                                    {visibleActionLevels.flop.includes('more') && (() => {
                                      const moreAction = (typeof data.flop_moreActionAction === 'string' ? data.flop_moreActionAction : '') as string;
                                      const stackBefore = sectionStacks['flop_base']?.updated?.[player.id] ?? calculateStartingStack(player, 'base');
                                      const stackAfter = sectionStacks['flop_more']?.updated?.[player.id] ?? stackBefore;
                                      const contribution = stackBefore - stackAfter;

                                      return (
                                        <div className="bg-purple-50 rounded-lg p-2 border-l-4 border-purple-400 shadow-sm">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wide">More Action 1</span>
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

                                    {/* MORE Action 2 Round */}
                                    {visibleActionLevels.flop.includes('more2') && (() => {
                                      const more2Action = (typeof data.flop_moreAction2Action === 'string' ? data.flop_moreAction2Action : '') as string;
                                      const stackBefore = sectionStacks['flop_more']?.updated?.[player.id] ?? player.stack;
                                      const stackAfter = sectionStacks['flop_more2']?.updated?.[player.id] ?? stackBefore;
                                      const contribution = stackBefore - stackAfter;

                                      return (
                                        <div className="bg-yellow-50 rounded-lg p-2 border-l-4 border-yellow-400 shadow-sm">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wide">More Action 2</span>
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
                          </td>

                          {/* ACTION */}
                          <td className={`border ${levelBorderColor} px-2 py-1`}>
                            <PlayerActionSelector playerId={player.id} suffix={suffix} action={action}>
                              <ActionButtons
                                playerId={player.id}
                                selectedAction={action}
                                suffix={suffix}
                                onActionClick={(selectedAction) => {
                                  actions.setPlayerData({
                                    ...playerData,
                                    [player.id]: {
                                      ...playerData[player.id],
                                      [actionKey]: selectedAction,
                                    },
                                  });
                                  // Navigate after action selection
                                  navigateAfterAction(player.id, suffix);
                                }}
                                availableActions={getAvailableActionsForPlayer(player.id, suffix)}
                              />
                            </PlayerActionSelector>
                          </td>

                          {/* AMOUNT/UNIT */}
                          <td className={`border ${levelBorderColor} px-1 py-1`}>
                            <AmountInput
                              playerId={player.id}
                              selectedAmount={amount}
                              selectedUnit={unit as ChipUnit}
                              selectedAction={action}
                              suffix={suffix}
                              // FR-12: Pass validation props
                              stage="flop"
                              actionLevel={actionLevel}
                              players={players}
                              playerData={playerData}
                              sectionStacks={sectionStacks}
                              onAmountChange={(playerId, newAmount) => {
                                console.log(`💰 [FlopView] Amount changed for player ${playerId}: ${newAmount}`);
                                actions.setPlayerData({
                                  ...playerData,
                                  [playerId]: {
                                    ...playerData[playerId],
                                    [amountKey]: newAmount,
                                  },
                                });
                              }}
                              onUnitChange={(playerId, newUnit) => {
                                console.log(`🔢 [FlopView] Unit changed for player ${playerId}: ${newUnit}`);
                                actions.setPlayerData({
                                  ...playerData,
                                  [playerId]: {
                                    ...playerData[playerId],
                                    [unitKey]: newUnit,
                                  },
                                });
                              }}
                              onTabComplete={() => {
                                console.log(`🔄 [FlopView] onTabComplete called for player ${player.id}${suffix}`);
                                console.log(`📍 [FlopView] Calling navigateAfterAction(${player.id}, "${suffix}")`);
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

                {/* ACTION BUTTONS */}
                <div className={`${levelBgColor} border-2 border-t-0 ${levelBorderColor} rounded-b-lg px-3 py-2`}>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-600">
                      {playersToShow.length} player{playersToShow.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-2">
                      {actionLevel === visibleActionLevels.flop[visibleActionLevels.flop.length - 1] && (() => {
                        const isMaxLevels = visibleActionLevels.flop && visibleActionLevels.flop.length >= 3;
                        const isDisabled = isAddMoreActionDisabled || isMaxLevels;
                        console.log(`🔘 [FlopView Button Render] actionLevel: ${actionLevel}, isAddMoreActionDisabled: ${isAddMoreActionDisabled}, isMaxLevels: ${isMaxLevels}, Final disabled: ${isDisabled}`);
                        return (
                          <button
                            onClick={handleMoreAction}
                            data-add-more-focus
                            disabled={isDisabled}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span>+</span>
                            Add More Action {visibleActionLevels.flop ? visibleActionLevels.flop.length : 1}
                          </button>
                        );
                      })()}
                      <button
                        onClick={handleCreateTurn}
                        disabled={isCreateNextStreetDisabled}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>→</span>
                        Create Turn
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="mt-4 flex gap-3 justify-center flex-wrap">
          <button
            data-process-stack-focus
            onClick={handleProcessStack}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <span>⚡</span>
            Process Stack - Flop
          </button>
        </div>
      </div>
    </div>
  );
};
