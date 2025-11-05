/**
 * River View Component
 *
 * Displays the river betting round with community cards, actions, and amounts.
 * Simplified version without player card selectors.
 */

import React from 'react';
import type { GameState, GameStateActions } from '../../hooks/useGameState';
import type { Player, PlayerData, ActionLevel, ChipUnit, ActionType } from '../../types/poker';
import type { UseCardManagementReturn } from '../../hooks/useCardManagement';
import type { UsePotCalculationReturn } from '../../hooks/usePotCalculation';
import { ActionButtons } from '../poker/ActionButtons';
import { AmountInput } from '../poker/AmountInput';
import { processStackSynchronous } from '../../lib/poker/engine/processStack';
import { calculatePotsForBettingRound } from '../../lib/poker/engine/potCalculationEngine';

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

  // Get players who are still active (not folded)
  const getActivePlayers = (): Player[] => {
    return players.filter((p: Player) => {
      if (!p.name) return false;
      const data = playerData[p.id];
      if (!data) return true;

      // Check if player folded in preflop
      if (data.preflopAction === 'fold') return false;
      if (data.preflop_moreActionAction === 'fold') return false;
      if (data.preflop_moreAction2Action === 'fold') return false;

      // Check if player folded in flop
      if (data.flopAction === 'fold') return false;
      if (data.flop_moreActionAction === 'fold') return false;
      if (data.flop_moreAction2Action === 'fold') return false;

      // Check if player folded in turn
      if (data.turnAction === 'fold') return false;
      if (data.turn_moreActionAction === 'fold') return false;
      if (data.turn_moreAction2Action === 'fold') return false;

      // Check if player folded in river
      if (data.riverAction === 'fold') return false;
      if (data.river_moreActionAction === 'fold') return false;
      if (data.river_moreAction2Action === 'fold') return false;

      return true;
    });
  };

  const getFoldedPlayers = (): Player[] => {
    return players.filter((p: Player) => {
      if (!p.name) return false;
      const data = playerData[p.id];
      if (!data) return false;

      // Check if player folded in preflop or flop
      if (data.preflopAction === 'fold') return true;
      if (data.preflop_moreActionAction === 'fold') return true;
      if (data.preflop_moreAction2Action === 'fold') return true;
      if (data.flopAction === 'fold') return true;
      if (data.flop_moreActionAction === 'fold') return true;
      if (data.flop_moreAction2Action === 'fold') return true;

      // Check if player folded in turn
      if (data.turnAction === 'fold') return true;
      if (data.turn_moreActionAction === 'fold') return true;
      if (data.turn_moreAction2Action === 'fold') return true;

      // Check if player folded in river
      if (data.riverAction === 'fold') return true;
      if (data.river_moreActionAction === 'fold') return true;
      if (data.river_moreAction2Action === 'fold') return true;

      return false;
    });
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

      // Show alert to user
      alert(
        `Process Stack Complete!\n\n` +
        `Total Pot: ${finalPotInfo.totalPot}\n` +
        `Main Pot: ${finalPotInfo.mainPot.amount}\n` +
        `Side Pots: ${finalPotInfo.sidePots.length}\n` +
        `Dead Money: ${finalPotInfo.deadMoney}\n` +
        `Previous Street Pot: ${previousStreetPot}`
      );

    } catch (error) {
      console.error('❌ Error processing stack:', error);
      alert(`Error processing stack: ${error instanceof Error ? error.message : String(error)}`);
    }
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
          <div className="text-sm font-bold text-gray-800 mb-1">Community Cards</div>
          <div className="text-sm text-gray-600">
            Flop: Card 1, Card 2, Card 3 | Turn: Card 4 | River: Card 5
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
              '': 999 // Empty position goes last
            };

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

                          {/* STACK */}
                          <td
                            className={`border ${levelBorderColor} px-4 py-2 text-center text-sm text-gray-700`}
                          >
                            {formatStack(player.stack)}
                          </td>

                          {/* ACTION */}
                          <td className={`border ${levelBorderColor} px-2 py-1`}>
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
                              availableActions={['fold', 'check', 'call', 'bet', 'raise', 'all-in', 'no action']}
                            />
                          </td>

                          {/* AMOUNT/UNIT */}
                          <td className={`border ${levelBorderColor} px-1 py-1`}>
                            <AmountInput
                              playerId={player.id}
                              selectedAmount={amount}
                              selectedUnit={unit as ChipUnit}
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
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        Add More Action
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
          {/* Process Stack Button */}
          <button
            onClick={handleProcessStack}
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
