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
          onClick={() => setCurrentView('turn')}
          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          Create Turn →
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

  /**
   * Handle More Action button click
   */
  const handleMoreAction = () => {
    const currentLevels = visibleActionLevels.flop || ['base'];

    if (!currentLevels.includes('more')) {
      addActionLevel('flop', 'more');
      console.log('[FlopView] Added More Action 1');
    } else if (!currentLevels.includes('more2')) {
      addActionLevel('flop', 'more2');
      console.log('[FlopView] Added More Action 2');
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
        <div className="overflow-x-auto space-y-4">
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
                <table className={`w-full border-collapse border-2 ${levelBorderColor}`}>
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
                      const startingStack = player.stack; // Hand's initial stack
                      const currentStack = hasProcessedStack
                        ? (sectionStacks[sectionKey]?.updated?.[player.id] ?? calculateStartingStack(player, actionLevel))
                        : null;
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
                          <td className={`border ${levelBorderColor} px-2 py-2 text-center relative`}>
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
                                    onClick={(e) => {
                                      const isExpanding = !isExpanded;
                                      setExpandedStackHistories(prev => ({
                                        ...prev,
                                        [historyKey]: isExpanding
                                      }));

                                      if (isExpanding) {
                                        setTimeout(() => {
                                          const buttonElement = e.currentTarget;
                                          const tdElement = buttonElement.closest('td');
                                          if (tdElement) {
                                            let floatingCard = tdElement.querySelector(`[data-stack-history-card="${historyKey}"]`);
                                            if (!floatingCard) {
                                              floatingCard = tdElement.querySelector('.absolute.z-50');
                                            }
                                            if (floatingCard) {
                                              (floatingCard as HTMLElement).scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'nearest',
                                                inline: 'nearest'
                                              });
                                            }
                                          }
                                        }, 100);
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
                                      const preflopAction = data.preflopAction;
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
                                      const preflopMoreAction = data.preflop_moreActionAction;
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
                                      const preflopMore2Action = data.preflop_moreAction2Action;
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
                                      const baseAction = data.flopAction;
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
                                      const moreAction = data.flop_moreActionAction;
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
                                      const more2Action = data.flop_moreAction2Action;
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
                            )}
                          </td>

                          {/* ACTION */}
                          <td className={`border ${levelBorderColor} px-2 py-1`}>
                            <ActionButtons
                              playerId={player.id}
                              selectedAction={action}
                              suffix={suffix}
                              dataActionFocus={`${player.id}-flop${suffix}`}
                              onActionClick={(selectedAction) => {
                                actions.setPlayerData({
                                  ...playerData,
                                  [player.id]: {
                                    ...playerData[player.id],
                                    [actionKey]: selectedAction,
                                  },
                                });
                              }}
                              availableActions={isFirstToAct
                                ? ['fold', 'check', 'bet', 'all-in']
                                : ['fold', 'check', 'call', 'bet', 'raise', 'all-in', 'no action']}
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
                <div className={`${levelBgColor} border-2 border-t-0 ${levelBorderColor} rounded-b-lg px-3 py-2`}>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-600">
                      {playersToShow.length} player{playersToShow.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-2">
                      {actionLevel === visibleActionLevels.flop[visibleActionLevels.flop.length - 1] && (
                        <button
                          onClick={handleMoreAction}
                          disabled={visibleActionLevels.flop && visibleActionLevels.flop.length >= 3}
                          className="px-6 py-3 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>+</span>
                          Add More Action {visibleActionLevels.flop ? visibleActionLevels.flop.length : 1}
                        </button>
                      )}
                      <button
                        onClick={() => setCurrentView('turn')}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-colors flex items-center gap-2"
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
