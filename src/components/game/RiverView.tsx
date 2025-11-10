/**
 * River View Component
 *
 * Displays the river betting round with community cards, actions, and amounts.
 * Simplified version without player card selectors.
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

interface RiverViewProps {
  state: GameState;
  actions: GameStateActions;
  formatStack: (amount: number) => string;
  onClearAll: () => void;
  onExport: () => void;
  cardManagement: UseCardManagementReturn;
  potCalculation: UsePotCalculationReturn;
}

export const RiverView: React.FC<RiverViewProps> = ({
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
    addActionLevel
  } = actions;

  const units: ChipUnit[] = ['actual', 'K', 'Mil'];

  // State for stack history expansion
  const [expandedStackHistories, setExpandedStackHistories] = useState<Record<string, boolean>>({});

  // State for tracking pop-up position (above or below) for each player
  const [popupPositions, setPopupPositions] = useState<Record<string, 'above' | 'below' | number>>({});

  // State for disabling "Add More Action" button when betting round is complete
  const [isAddMoreActionDisabled, setIsAddMoreActionDisabled] = useState(false);

  // State for tracking if current section has been processed
  const [hasProcessedCurrentState, setHasProcessedCurrentState] = useState(false);

  // State for tracking last processed playerData to detect changes
  const [lastProcessedPlayerDataHash, setLastProcessedPlayerDataHash] = useState<string>('');

  // Detect playerData changes and invalidate processed state
  React.useEffect(() => {
    const currentLevels = visibleActionLevels.river || ['base'];

    // Create hash of current river playerData to detect changes
    const riverDataHash = JSON.stringify(
      players.map(p => {
        const data = playerData[p.id] || {};
        return {
          id: p.id,
          riverAction: data.riverAction,
          riverAmount: data.riverAmount,
          riverUnit: data.riverUnit,
          river_moreActionAction: data.river_moreActionAction,
          river_moreActionAmount: data.river_moreActionAmount,
          river_moreActionUnit: data.river_moreActionUnit,
          river_moreAction2Action: data.river_moreAction2Action,
          river_moreAction2Amount: data.river_moreAction2Amount,
          river_moreAction2Unit: data.river_moreAction2Unit,
        };
      })
    );

    // If playerData changed, invalidate processed state
    if (lastProcessedPlayerDataHash && riverDataHash !== lastProcessedPlayerDataHash) {
      console.log('🔄 [RiverView] PlayerData changed, invalidating processed state');
      setHasProcessedCurrentState(false);
    }
  }, [playerData, players, lastProcessedPlayerDataHash]);

  // Update button states when playerData or processed state changes
  React.useEffect(() => {
    const currentLevels = visibleActionLevels.river || ['base'];
    const currentLevel = currentLevels[currentLevels.length - 1];
    const isRoundComplete = checkBettingRoundComplete('river', currentLevel, players, playerData);

    console.log(`🔄 [RiverView useEffect] Current level: ${currentLevel}, Round complete: ${isRoundComplete.isComplete}, Reason: ${isRoundComplete.reason}, Processed: ${hasProcessedCurrentState}`);

    // "Add More Action" is disabled when round is complete OR when state hasn't been processed
    setIsAddMoreActionDisabled(isRoundComplete.isComplete || !hasProcessedCurrentState);
  }, [playerData, visibleActionLevels.river, players, hasProcessedCurrentState]);

  // Refs for card selectors
  const card5Ref = useRef<HTMLDivElement>(null);

  // Utility function for suit colors
  const suitColors: Record<string, string> = {
    '♠': 'text-gray-900',
    '♣': 'text-green-700',
    '♥': 'text-red-600',
    '♦': 'text-blue-600',
  };

  // Auto-select river card on mount if enabled
  useEffect(() => {
    const hasNoRiverCard = !communityCards.river.card1;
    if (autoSelectCards && hasNoRiverCard) {
      cardManagement.autoSelectCommunityCards('river');
    }
  }, []);

  // Set focus to river card selector on mount
  useEffect(() => {
    console.log('[RiverView] Setting initial focus to river card selector');
    if (card5Ref.current) {
      card5Ref.current.focus();
    }
  }, []);

  const getViewTitle = () => {
    if (currentView.includes('-more2')) {
      return 'River - More Action 2';
    } else if (currentView.includes('-more')) {
      return 'River - More Action 1';
    }

    return 'River';
  };

  const handleDefaultUnitChange = (unit: ChipUnit) => {
    setDefaultUnit(unit);
  };

  const getNavigationButtons = () => {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentView('turn')}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400 transition-colors"
        >
          ← Turn
        </button>
      </div>
    );
  };

  // Define position order for postflop (action order)
  // Postflop: SB acts first, then BB, then UTG, etc.
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

  // Get players who are still active (not folded in previous streets)
  // NOTE: Players who fold in current street (river) BASE should still be shown in BASE view
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

        // Check if player folded in flop (previous street)
        if (data.flopAction === 'fold') return false;
        if (data.flop_moreActionAction === 'fold') return false;
        if (data.flop_moreAction2Action === 'fold') return false;

        // Check if player folded in turn (previous street)
        if (data.turnAction === 'fold') return false;
        if (data.turn_moreActionAction === 'fold') return false;
        if (data.turn_moreAction2Action === 'fold') return false;

        // DO NOT filter out players who folded in river BASE
        // They should remain visible in BASE view with fold button highlighted
        // Only filter them out in More Action views (handled by playersToShow filter)

        return true;
      })
      .sort((a, b) => {
        const orderA = positionOrder[a.position] || 999;
        const orderB = positionOrder[b.position] || 999;
        return orderA - orderB;
      });
  };

  // Get players who folded in previous streets (preflop, flop, turn)
  // This is used for display purposes to show who folded before river
  const getFoldedPlayers = (): Player[] => {
    return players.filter((p: Player) => {
      if (!p.name) return false;
      const data = playerData[p.id];
      if (!data) return false;

      // Check if player folded in preflop (previous street)
      if (data.preflopAction === 'fold') return true;
      if (data.preflop_moreActionAction === 'fold') return true;
      if (data.preflop_moreAction2Action === 'fold') return true;

      // Check if player folded in flop (previous street)
      if (data.flopAction === 'fold') return true;
      if (data.flop_moreActionAction === 'fold') return true;
      if (data.flop_moreAction2Action === 'fold') return true;

      // Check if player folded in turn (previous street)
      if (data.turnAction === 'fold') return true;
      if (data.turn_moreActionAction === 'fold') return true;
      if (data.turn_moreAction2Action === 'fold') return true;

      // Don't include players who folded in current street (river)
      // They are still active in BASE view
      return false;
    });
  };

  /**
   * Calculate the starting stack for the current action level
   * - For BASE: Stack from turn's final round (more2 -> more -> base)
   * - For MORE/MORE2: Stack from previous river round's "updated" value
   */
  const calculateStartingStack = (player: Player, currentActionLevel: ActionLevel): number => {
    if (currentActionLevel === 'base') {
      // For BASE: Get the final stack from turn
      // Check turn rounds in reverse order: more2 -> more -> base
      if (sectionStacks['turn_more2']?.updated?.[player.id] !== undefined) {
        return sectionStacks['turn_more2'].updated[player.id];
      }
      if (sectionStacks['turn_more']?.updated?.[player.id] !== undefined) {
        return sectionStacks['turn_more'].updated[player.id];
      }
      if (sectionStacks['turn_base']?.updated?.[player.id] !== undefined) {
        return sectionStacks['turn_base'].updated[player.id];
      }
      // Fallback to initial stack minus posted blinds/antes
      return player.stack - (playerData[player.id]?.postedSB || 0) - (playerData[player.id]?.postedBB || 0) - (playerData[player.id]?.postedAnte || 0);
    } else if (currentActionLevel === 'more') {
      // For MORE: Start from river BASE's updated value
      return sectionStacks['river_base']?.updated?.[player.id] ?? player.stack;
    } else {
      // For MORE2: Start from river MORE's updated value
      return sectionStacks['river_more']?.updated?.[player.id] ?? player.stack;
    }
  };

  /**
   * Calculate previous street pot from turn
   * Returns the total pot from the last action level of turn
   */
  const getPreviousStreetPot = (): number => {
    // Check turn levels in order: more2 -> more -> base
    if (potsByStage?.turn_more2) {
      return potsByStage.turn_more2.totalPot;
    }
    if (potsByStage?.turn_more) {
      return potsByStage.turn_more.totalPot;
    }
    if (potsByStage?.turn_base) {
      return potsByStage.turn_base.totalPot;
    }
    return 0;
  };

  /**
   * Handle process stack - Calculate pot and update game state for river
   * Uses the integrated pot calculation engine from processStack.ts and potCalculationEngine.ts
   */
  const handleProcessStack = () => {
    console.log('🔄 Processing Stack - River...');

    // Get all visible action levels for river
    const currentLevels = visibleActionLevels.river || ['base'];

    // Calculate previousStreetPot from turn
    const previousStreetPot = getPreviousStreetPot();
    console.log(`💰 Previous street pot (from turn): ${previousStreetPot}`);

    // FR-12 VALIDATION: Comprehensive raise/bet validation
    // Run full FR-12 validation for all players with bet/raise actions
    // ONLY validate sections that haven't been processed yet
    console.log('🔍 [ProcessStack] Running FR-12 validation for all raise/bet amounts...');
    console.log('📋 Current visible levels:', currentLevels);
    console.log('✅ Processed sections:', processedSections);
    const validationErrors: string[] = [];

    currentLevels.forEach((actionLevel) => {
      const sectionKey = `river_${actionLevel}`;
      console.log(`\n🔍 Checking section: ${sectionKey}`);
      console.log(`   - Is processed? ${processedSections[sectionKey]}`);

      // Skip validation for sections that are already processed
      if (processedSections[sectionKey]) {
        console.log(`⏭️  Skipping validation for ${sectionKey} (already processed)`);
        return;
      }

      console.log(`✔️  Validating ${sectionKey}...`);

      const suffix = actionLevel === 'base' ? '' : actionLevel === 'more' ? '_moreAction' : '_moreAction2';

      players.forEach((player) => {
        if (!player.name) return;

        const data = playerData[player.id] || {};
        const actionKey = `river${suffix}Action` as keyof typeof data;
        const amountKey = `river${suffix}Amount` as keyof typeof data;
        const unitKey = `river${suffix}Unit` as keyof typeof data;

        const action = data[actionKey] as string;
        const amount = data[amountKey] as string;
        const unit = data[unitKey] as ChipUnit;

        // Only validate if action is bet or raise
        if (action === 'bet' || action === 'raise') {
          const raiseToAmount = parseFloat(amount);

          // Basic validation: check if amount is a valid number > 0
          if (!amount || amount.trim() === '' || isNaN(raiseToAmount) || raiseToAmount <= 0) {
            validationErrors.push(`${player.name} (River ${actionLevel.toUpperCase()}): Missing or invalid raise amount`);
            return; // Skip FR-12 validation if basic validation fails
          }

          // Run FR-12 validation (order-aware: only consider raises from players who acted before this player)
          const validationResult = validateRaiseAmount(
            player.id,
            raiseToAmount,
            'river',
            actionLevel,
            players,
            playerData,
            sectionStacks,
            unit || defaultUnit,
            player.id // Only consider raises from players with ID <= this player's ID
          );

          if (!validationResult.isValid) {
            validationErrors.push(
              `${player.name} (River ${actionLevel.toUpperCase()}): ${validationResult.errorMessage}`
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
          const actionKey = 'riverAction';

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
          'river',
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
        const sectionKey = `river_${levelName}`;
        const potInfo = calculatePotsForBettingRound(
          'river',
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
          previousStreetPot // Carry forward from turn
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
      const riverDataHash = JSON.stringify(
        players.map(p => {
          const data = latestPlayerData[p.id] || {};
          return {
            id: p.id,
            riverAction: data.riverAction,
            riverAmount: data.riverAmount,
            riverUnit: data.riverUnit,
            river_moreActionAction: data.river_moreActionAction,
            river_moreActionAmount: data.river_moreActionAmount,
            river_moreActionUnit: data.river_moreActionUnit,
            river_moreAction2Action: data.river_moreAction2Action,
            river_moreAction2Amount: data.river_moreAction2Amount,
            river_moreAction2Unit: data.river_moreAction2Unit,
          };
        })
      );
      setHasProcessedCurrentState(true);
      setLastProcessedPlayerDataHash(riverDataHash);
      console.log('✅ [RiverView] Set hasProcessedCurrentState to true');

      // Show alert to user
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
        'river',
        currentLevel,
        players,
        latestPlayerData
      );

      // Disable "Add More Action" button if round is complete
      setIsAddMoreActionDisabled(isRoundComplete.isComplete || !hasProcessedCurrentState);
      console.log(`🎯 [River] Betting round complete: ${isRoundComplete.isComplete}, Add More Action disabled: ${isRoundComplete.isComplete || !hasProcessedCurrentState}`);

      // FR-13.4: Return focus after Process Stack completes
      const hasMoreActionButton = (currentLevel === 'base' || currentLevel === 'more') && !isRoundComplete.isComplete;
      const hasCreateNextStreetButton = false; // River is the last street, no next street button

      returnFocusAfterProcessStack({
        stage: 'river',
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
   * Handle More Action button click - FR-14.3 & 14.4
   */
  const handleMoreAction = () => {
    const currentLevels = visibleActionLevels.river || ['base'];
    const currentLevel = currentLevels[currentLevels.length - 1]; // Last level

    // Fallback safety check: Is betting round already complete?
    const isComplete = checkBettingRoundComplete('river', currentLevel, players, playerData);

    if (isComplete.isComplete) {
      // Block the action
      alert('Betting round complete. River is the final street - no more actions needed.');

      // Disable the button to prevent repeated clicks
      setIsAddMoreActionDisabled(true);

      return; // Don't create More Action
    }

    if (!currentLevels.includes('more')) {
      addActionLevel('river', 'more');
      console.log('[RiverView] Added More Action 1');

      // Invalidate processed state since new action level was added
      setHasProcessedCurrentState(false);
      console.log('🔄 [RiverView] Invalidated processed state (added More Action 1)');

      // FR-14.3: Copy "Now" stacks from BASE to More Action 1
      const previousSectionKey = 'river_base';
      const newSectionKey = 'river_more';
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
      addActionLevel('river', 'more2');
      console.log('[RiverView] Added More Action 2');

      // Invalidate processed state since new action level was added
      setHasProcessedCurrentState(false);
      console.log('🔄 [RiverView] Invalidated processed state (added More Action 2)');

      // FR-14.4: Copy "Now" stacks from More Action 1 to More Action 2
      const previousSectionKey = 'river_more';
      const newSectionKey = 'river_more2';
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
      const playerStatus = checkPlayerNeedsToAct(playerId, 'river', actionLevel, players, playerData);

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
    const actionKey = `river${suffix}Action` as keyof PlayerData[number];
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
    const playerStatus = checkPlayerNeedsToAct(playerId, 'river', actionLevel, players, playerData);

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
   * Helper to navigate after a player acts
   * - For More Action rounds: Find next player who needs to act (auto-skip those who don't)
   * - If all remaining players auto-skipped → Navigate to Process Stack button
   * - If next player needs to act → Navigate to that player's Action column
   */
  const navigateAfterAction = (currentPlayerId: number, suffix: string) => {
    const actionLevel: ActionLevel =
      suffix === '' ? 'base' :
      suffix === '_moreAction' ? 'more' : 'more2';

    const completionCheck = checkBettingRoundComplete('river', actionLevel, players, playerData);

    if (completionCheck.isComplete) {
      // Navigate to Process Stack button
      setTimeout(() => {
        const processStackButton = document.querySelector('[data-process-stack-focus]') as HTMLElement;
        if (processStackButton) {
          processStackButton.focus();
        }
      }, 100);
    } else {
      // Find next player who needs to act
      setTimeout(() => {
        const activePlayers = getActivePlayers();
        const playerIndex = activePlayers.findIndex(p => p.id === currentPlayerId);

        // For More Action rounds, check if players need to act
        if (actionLevel === 'more' || actionLevel === 'more2') {
          let foundPlayerWhoNeedsToAct = false;

          // Check remaining players after current one
          for (let i = playerIndex + 1; i < activePlayers.length; i++) {
            const nextPlayer = activePlayers[i];
            const playerStatus = checkPlayerNeedsToAct(nextPlayer.id, 'river', actionLevel, players, playerData);

            if (playerStatus.needsToAct) {
              const selector = `[data-action-focus="${nextPlayer.id}-river${suffix}"]`;
              const nextElement = document.querySelector(selector) as HTMLElement;
              if (nextElement) {
                nextElement.focus();
              }
              foundPlayerWhoNeedsToAct = true;
              break;
            }
          }

          // If no players need to act, go to Process Stack
          if (!foundPlayerWhoNeedsToAct) {
            const processStackButton = document.querySelector('[data-process-stack-focus]') as HTMLElement;
            if (processStackButton) {
              processStackButton.focus();
            }
          }
        } else {
          // BASE round - navigate to next player sequentially
          const nextPlayerIndex = playerIndex + 1;
          if (nextPlayerIndex < activePlayers.length) {
            const nextPlayer = activePlayers[nextPlayerIndex];
            const selector = `[data-action-focus="${nextPlayer.id}-river${suffix}"]`;
            const nextElement = document.querySelector(selector) as HTMLElement;
            if (nextElement) {
              nextElement.focus();
            }
          } else {
            // Last player, go to Process Stack
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
          const actionKey = suffix === '' ? 'riverAction' : suffix === '_moreAction' ? 'river_moreActionAction' : 'river_moreAction2Action';
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
        e.preventDefault();

        // If action is bet or raise, move to amount input
        if (action === 'bet' || action === 'raise') {
          const amountInputId = `amount-input-${playerId}${suffix || ''}`;
          const amountInput = document.querySelector(`#${amountInputId}`) as HTMLInputElement;
          if (amountInput) {
            amountInput.focus();
            amountInput.select();
            return;
          }
        }

        // Check completion and navigate accordingly
        navigateAfterAction(playerId, suffix);
        return;
      }
    };

    return (
      <div
        data-action-focus={`${playerId}-river${suffix}`}
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
        <div className="mb-3 p-3 bg-purple-100 border-2 border-purple-300 rounded">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-800">River Community Cards</div>
            {autoSelectCards && (
              <button
                onClick={() => cardManagement.autoSelectCommunityCards('river')}
                className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
              >
                Auto-Select River Card
              </button>
            )}
          </div>

          {/* Visual Card Display */}
          <div className="flex gap-3 mb-3 justify-center items-center">
            {/* Previous Cards (Flop + Turn, Read-only, grayed out) */}
            <div className="flex gap-2 opacity-60">
              {/* Flop Cards */}
              {[1, 2, 3].map((cardNum) => {
                const card = communityCards.flop[`card${cardNum}` as 'card1' | 'card2' | 'card3'];
                return (
                  <div key={`flop-${cardNum}`} className="flex flex-col items-center">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Flop {cardNum}</div>
                    <div className={`w-16 h-24 rounded-lg border-2 shadow-sm flex flex-col items-center justify-center ${
                      card ? 'bg-gray-50 border-gray-300' : 'bg-gray-100 border-gray-300'
                    }`}>
                      {card ? (
                        <>
                          <div className="text-3xl font-bold text-gray-900">
                            {card.rank === 'T' ? '10' : card.rank}
                          </div>
                          <div className={`text-3xl ${suitColors[card.suit]}`}>
                            {card.suit}
                          </div>
                        </>
                      ) : (
                        <div className="text-3xl font-bold text-gray-300">?</div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Turn Card */}
              <div className="flex flex-col items-center">
                <div className="text-xs font-semibold text-gray-600 mb-1">Turn</div>
                <div className={`w-16 h-24 rounded-lg border-2 shadow-sm flex flex-col items-center justify-center ${
                  communityCards.turn.card1 ? 'bg-gray-50 border-gray-300' : 'bg-gray-100 border-gray-300'
                }`}>
                  {communityCards.turn.card1 ? (
                    <>
                      <div className="text-3xl font-bold text-gray-900">
                        {communityCards.turn.card1.rank === 'T' ? '10' : communityCards.turn.card1.rank}
                      </div>
                      <div className={`text-3xl ${suitColors[communityCards.turn.card1.suit]}`}>
                        {communityCards.turn.card1.suit}
                      </div>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-gray-300">?</div>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-24 bg-purple-300"></div>

            {/* River Card (Active, highlighted) */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-semibold text-purple-700 mb-1">River</div>
              <div className={`w-20 h-28 rounded-lg border-2 shadow-md flex flex-col items-center justify-center transition-all ${
                communityCards.river.card1 ? 'bg-white border-purple-500 ring-2 ring-purple-300' : 'bg-gray-50 border-gray-300'
              }`}>
                {communityCards.river.card1 ? (
                  <>
                    <div className="text-4xl font-bold text-gray-900">
                      {communityCards.river.card1.rank === 'T' ? '10' : communityCards.river.card1.rank}
                    </div>
                    <div className={`text-4xl ${suitColors[communityCards.river.card1.suit]}`}>
                      {communityCards.river.card1.suit}
                    </div>
                  </>
                ) : (
                  <div className="text-4xl font-bold text-gray-300">?</div>
                )}
              </div>
            </div>
          </div>

          {/* Button Selector for River Card */}
          <div className="flex gap-3 items-center justify-center">
            <CommunityCardSelector
              ref={card5Ref}
              stage="river"
              cardNumber={1}
              label="River Card"
              currentCard={communityCards.river.card1}
              onCardChange={cardManagement.updateCommunityCard}
              isCardAvailable={(rank, suit) => cardManagement.checkCardAvailable(rank, suit, communityCards.river.card1)}
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
          {visibleActionLevels.river?.map((actionLevel: ActionLevel) => {
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

            const playersToShow = getActivePlayers()
              .filter((p: Player) => {
                // For base level, show all active players
                if (actionLevel === 'base') return true;

                // For more action levels, only show players who didn't fold in previous levels
                const data = playerData[p.id];
                if (!data) return true;

                if (actionLevel === 'more') {
                  return data.riverAction !== 'fold';
                }

                if (actionLevel === 'more2') {
                  return (
                    data.riverAction !== 'fold' &&
                    data.river_moreActionAction !== 'fold'
                  );
                }

                return true;
              })
              .sort((a, b) => {
                // Sort by position order (SB first, then BB, then UTG, etc.)
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
                        className={`border ${levelBorderColor} px-4 py-2 text-center text-sm font-medium text-gray-700 w-32`}
                      >
                        Stack
                      </th>

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
                      const actionKey = `river${suffix}Action`;
                      const amountKey = `river${suffix}Amount`;
                      const unitKey = `river${suffix}Unit`;

                      const action = (data[actionKey] as ActionType) || '';
                      const amount = (data[amountKey] as string) || '';
                      const unit = (data[unitKey] as ChipUnit) || defaultUnit;

                      return (
                        <tr key={player.id} className={levelBgColor}>
                          {/* PLAYER NAME */}
                          <td
                            className={`border ${levelBorderColor} px-3 py-2 text-sm font-medium text-gray-800`}
                          >
                            {player.name}
                            {player.position && (
                              <span className="ml-2 text-xs text-blue-600">
                                ({player.position})
                              </span>
                            )}
                          </td>

                          {/* STACK - Start/Now Display */}
                          <td className={`border ${levelBorderColor} px-2 py-2 text-center relative`} style={{ overflow: 'visible' }}>
                            {(() => {
                              // Stack display logic
                              const historyKey = `${player.id}-river-${actionLevel}`;
                              const isExpanded = expandedStackHistories[historyKey] || false;
                              const sectionKey = `river_${actionLevel}`;
                              const hasProcessedStack = processedSections[sectionKey];
                              const startingStack = player.stack; // Always show hand's initial stack

                              // FR-14.1: Show "Now" stack immediately when initialized, even before processing
                              const currentStack = sectionStacks[sectionKey]?.updated?.[player.id] ??
                                                   (hasProcessedStack ? startingStack : null);
                              const isAllIn = currentStack !== null && currentStack === 0;

                              return (
                                <>
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

                                              // Estimate pop-up height (can be adjusted based on content)
                                              const estimatedPopupHeight = 600; // Approximate height with all sections

                                              // Calculate available space above and below
                                              const spaceBelow = window.innerHeight - buttonRect.bottom;
                                              const spaceAbove = buttonRect.top;

                                              // Determine optimal position
                                              const shouldPositionAbove = spaceBelow < estimatedPopupHeight && spaceAbove > spaceBelow;

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
                                              {player.name} - Stack History (River {actionLevel.toUpperCase()}) {isAllIn && '(ALL-IN)'}
                                            </h3>
                                          </div>
                                          <button
                                            onClick={() => setExpandedStackHistories(prev => ({
                                              ...prev,
                                              [historyKey]: false
                                            }))}
                                            className={`text-white transition-colors ${isAllIn ? 'hover:text-red-200' : 'hover:text-blue-200'}`}
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
                                          {sectionStacks['flop_base'] && (() => {
                                            const flopBaseAction = (typeof data.flopAction === 'string' ? data.flopAction : '') as string;
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
                                                    {flopBaseAction && flopBaseAction !== 'no action' && flopBaseAction !== 'check' ? (
                                                      <>
                                                        <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${flopBaseAction === 'all-in' ? 'bg-red-600 text-white' : flopBaseAction === 'raise' ? 'bg-purple-100 text-purple-700' : flopBaseAction === 'call' ? 'bg-blue-100 text-blue-700' : flopBaseAction === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                          {flopBaseAction}
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

                                          {/* FLOP MA1 Round */}
                                          {sectionStacks['flop_more'] && (() => {
                                            const flopMA1Action = (typeof data.flop_moreActionAction === 'string' ? data.flop_moreActionAction : '') as string;
                                            const stackBefore = sectionStacks['flop_base']?.updated?.[player.id] ?? player.stack;
                                            const stackAfter = sectionStacks['flop_more']?.updated?.[player.id] ?? stackBefore;
                                            const contribution = stackBefore - stackAfter;

                                            return (
                                              <div className="bg-purple-50 rounded-lg p-2 border-l-4 border-purple-400 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wide">FLOP MA1</span>
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
                                                    {flopMA1Action && flopMA1Action !== 'no action' && flopMA1Action !== 'check' ? (
                                                      <>
                                                        <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${flopMA1Action === 'all-in' ? 'bg-red-600 text-white' : flopMA1Action === 'raise' ? 'bg-purple-100 text-purple-700' : flopMA1Action === 'call' ? 'bg-blue-100 text-blue-700' : flopMA1Action === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                          {flopMA1Action}
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

                                          {/* FLOP MA2 Round */}
                                          {sectionStacks['flop_more2'] && (() => {
                                            const flopMA2Action = (typeof data.flop_moreAction2Action === 'string' ? data.flop_moreAction2Action : '') as string;
                                            const stackBefore = sectionStacks['flop_more']?.updated?.[player.id] ?? player.stack;
                                            const stackAfter = sectionStacks['flop_more2']?.updated?.[player.id] ?? stackBefore;
                                            const contribution = stackBefore - stackAfter;

                                            return (
                                              <div className="bg-yellow-50 rounded-lg p-2 border-l-4 border-yellow-400 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wide">FLOP MA2</span>
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
                                                    {flopMA2Action && flopMA2Action !== 'no action' && flopMA2Action !== 'check' ? (
                                                      <>
                                                        <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${flopMA2Action === 'all-in' ? 'bg-red-600 text-white' : flopMA2Action === 'raise' ? 'bg-purple-100 text-purple-700' : flopMA2Action === 'call' ? 'bg-blue-100 text-blue-700' : flopMA2Action === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                          {flopMA2Action}
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

                                          {/* TURN BASE Round */}
                                          {sectionStacks['turn_base'] && (() => {
                                            const turnBaseAction = (typeof data.turnAction === 'string' ? data.turnAction : '') as string;
                                            const stackBefore = calculateStartingStack(player, 'base');
                                            const stackAfter = sectionStacks['turn_base']?.updated?.[player.id] ?? stackBefore;
                                            const contribution = stackBefore - stackAfter;

                                            return (
                                              <div className="bg-orange-50 rounded-lg p-2 border-l-4 border-orange-400 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wide">TURN BASE</span>
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
                                                    {turnBaseAction && turnBaseAction !== 'no action' && turnBaseAction !== 'check' ? (
                                                      <>
                                                        <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${turnBaseAction === 'all-in' ? 'bg-red-600 text-white' : turnBaseAction === 'raise' ? 'bg-purple-100 text-purple-700' : turnBaseAction === 'call' ? 'bg-blue-100 text-blue-700' : turnBaseAction === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                          {turnBaseAction}
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

                                          {/* TURN MA1 Round */}
                                          {sectionStacks['turn_more'] && (() => {
                                            const turnMA1Action = (typeof data.turn_moreActionAction === 'string' ? data.turn_moreActionAction : '') as string;
                                            const stackBefore = sectionStacks['turn_base']?.updated?.[player.id] ?? player.stack;
                                            const stackAfter = sectionStacks['turn_more']?.updated?.[player.id] ?? stackBefore;
                                            const contribution = stackBefore - stackAfter;

                                            return (
                                              <div className="bg-pink-50 rounded-lg p-2 border-l-4 border-pink-400 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[10px] font-bold text-pink-800 uppercase tracking-wide">TURN MA1</span>
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
                                                    {turnMA1Action && turnMA1Action !== 'no action' && turnMA1Action !== 'check' ? (
                                                      <>
                                                        <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${turnMA1Action === 'all-in' ? 'bg-red-600 text-white' : turnMA1Action === 'raise' ? 'bg-purple-100 text-purple-700' : turnMA1Action === 'call' ? 'bg-blue-100 text-blue-700' : turnMA1Action === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                          {turnMA1Action}
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

                                          {/* TURN MA2 Round */}
                                          {sectionStacks['turn_more2'] && (() => {
                                            const turnMA2Action = (typeof data.turn_moreAction2Action === 'string' ? data.turn_moreAction2Action : '') as string;
                                            const stackBefore = sectionStacks['turn_more']?.updated?.[player.id] ?? player.stack;
                                            const stackAfter = sectionStacks['turn_more2']?.updated?.[player.id] ?? stackBefore;
                                            const contribution = stackBefore - stackAfter;

                                            return (
                                              <div className="bg-lime-50 rounded-lg p-2 border-l-4 border-lime-400 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[10px] font-bold text-lime-800 uppercase tracking-wide">TURN MA2</span>
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
                                                    {turnMA2Action && turnMA2Action !== 'no action' && turnMA2Action !== 'check' ? (
                                                      <>
                                                        <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${turnMA2Action === 'all-in' ? 'bg-red-600 text-white' : turnMA2Action === 'raise' ? 'bg-purple-100 text-purple-700' : turnMA2Action === 'call' ? 'bg-blue-100 text-blue-700' : turnMA2Action === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                          {turnMA2Action}
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

                                          {/* RIVER BASE Round */}
                                          {(() => {
                                            const riverBaseAction = (typeof data.riverAction === 'string' ? data.riverAction : '') as string;
                                            const stackBefore = calculateStartingStack(player, 'base');
                                            const stackAfter = sectionStacks['river_base']?.updated?.[player.id] ?? stackBefore;
                                            const contribution = stackBefore - stackAfter;

                                            return (
                                              <div className="bg-emerald-50 rounded-lg p-2 border-l-4 border-emerald-400 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">RIVER BASE</span>
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
                                                    {riverBaseAction && riverBaseAction !== 'no action' && riverBaseAction !== 'check' ? (
                                                      <>
                                                        <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${riverBaseAction === 'all-in' ? 'bg-red-600 text-white' : riverBaseAction === 'raise' ? 'bg-purple-100 text-purple-700' : riverBaseAction === 'call' ? 'bg-blue-100 text-blue-700' : riverBaseAction === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                          {riverBaseAction}
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

                                          {/* RIVER MA1 Round */}
                                          {visibleActionLevels.river.includes('more') && (() => {
                                            const riverMA1Action = (typeof data.river_moreActionAction === 'string' ? data.river_moreActionAction : '') as string;
                                            const stackBefore = sectionStacks['river_base']?.updated?.[player.id] ?? player.stack;
                                            const stackAfter = sectionStacks['river_more']?.updated?.[player.id] ?? stackBefore;
                                            const contribution = stackBefore - stackAfter;

                                            return (
                                              <div className="bg-sky-50 rounded-lg p-2 border-l-4 border-sky-400 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wide">RIVER MA1</span>
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
                                                    {riverMA1Action && riverMA1Action !== 'no action' && riverMA1Action !== 'check' ? (
                                                      <>
                                                        <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${riverMA1Action === 'all-in' ? 'bg-red-600 text-white' : riverMA1Action === 'raise' ? 'bg-purple-100 text-purple-700' : riverMA1Action === 'call' ? 'bg-blue-100 text-blue-700' : riverMA1Action === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                          {riverMA1Action}
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

                                          {/* RIVER MA2 Round */}
                                          {visibleActionLevels.river.includes('more2') && (() => {
                                            const riverMA2Action = (typeof data.river_moreAction2Action === 'string' ? data.river_moreAction2Action : '') as string;
                                            const stackBefore = sectionStacks['river_more']?.updated?.[player.id] ?? player.stack;
                                            const stackAfter = sectionStacks['river_more2']?.updated?.[player.id] ?? stackBefore;
                                            const contribution = stackBefore - stackAfter;

                                            return (
                                              <div className="bg-violet-50 rounded-lg p-2 border-l-4 border-violet-400 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[10px] font-bold text-violet-800 uppercase tracking-wide">RIVER MA2</span>
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
                                                    {riverMA2Action && riverMA2Action !== 'no action' && riverMA2Action !== 'check' ? (
                                                      <>
                                                        <span className="text-gray-500 text-[10px]">-{formatStack(contribution)}</span>
                                                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${riverMA2Action === 'all-in' ? 'bg-red-600 text-white' : riverMA2Action === 'raise' ? 'bg-purple-100 text-purple-700' : riverMA2Action === 'call' ? 'bg-blue-100 text-blue-700' : riverMA2Action === 'bet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                          {riverMA2Action}
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
                                </>
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
                                  // Update player action
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
                              selectedAction={action}
                              selectedUnit={unit as ChipUnit}
                              suffix={suffix}
                              // FR-12: Pass validation props
                              stage="river"
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
                                console.log(`🔔 [RiverView] onTabComplete called for player ${player.id}`);
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
                <div
                  className={`${levelBgColor} border-2 border-t-0 ${levelBorderColor} rounded-b-lg px-3 py-2`}
                >
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-600">
                      {playersToShow.length} player
                      {playersToShow.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-2">
                      {actionLevel === visibleActionLevels.river[visibleActionLevels.river.length - 1] && (
                        <button
                          onClick={handleMoreAction}
                          data-add-more-focus
                          disabled={isAddMoreActionDisabled || (visibleActionLevels.river && visibleActionLevels.river.length >= 3)}
                          className="px-6 py-3 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>+</span>
                          Add More Action {visibleActionLevels.river ? visibleActionLevels.river.length : 1}
                        </button>
                      )}
                    </div>
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
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <span>⚡</span>
            Process Stack - River
          </button>
        </div>
      </div>
    </div>
  );
};
