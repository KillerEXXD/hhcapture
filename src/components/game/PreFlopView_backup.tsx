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
import { CardSelector } from '../poker/CardSelector';
import { ActionButtons } from '../poker/ActionButtons';
import { AmountInput } from '../poker/AmountInput';

interface PreFlopViewProps {
  state: GameState;
  actions: GameStateActions;
  formatStack: (amount: number) => string;
  onClearAll: () => void;
  onExport: () => void;
  cardManagement: UseCardManagementReturn;
}

export const PreFlopView: React.FC<PreFlopViewProps> = ({
  state,
  actions,
  formatStack,
  onClearAll,
  onExport,
  cardManagement,
}) => {
  const { players, playerData, currentView, visibleActionLevels, defaultUnit } = state;
  const { setCurrentView, setDefaultUnit } = actions;

  const units: ChipUnit[] = ['actual', 'K', 'Mil'];

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

      return true;
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
  };

  const handleCreateFlop = () => {
    // Validate all players have acted or are folded/all-in
    const activePlayers = getActivePlayers();
    const currentLevels = visibleActionLevels.preflop || ['base'];
    const lastLevel = currentLevels[currentLevels.length - 1];
    const suffix = lastLevel === 'base' ? '' : lastLevel === 'more' ? '_moreAction' : '_moreAction2';

    const playersWithoutAction = activePlayers.filter(player => {
      const data = playerData[player.id];
      const actionKey = `preflop${suffix}Action`;
      const action = data?.[actionKey];
      return !action || action === 'no action';
    });

    if (playersWithoutAction.length > 0) {
      alert(`Cannot create Flop. The following players must act first:\n${playersWithoutAction.map(p => p.name).join('\n')}`);
      return;
    }

    // Transition to flop view
    actions.setCurrentView('flop');

    // Initialize flop action levels if not exists
    if (!visibleActionLevels.flop) {
      actions.setVisibleActionLevels({
        ...visibleActionLevels,
        flop: ['base'],
      });
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

            const playersToShow = actionLevel === 'base'
              ? players.filter((p: Player) => p.name) // Base: all players with names
              : getActivePlayers().filter((p: Player) => {
                  // More actions: only non-folded players
                  const data = playerData[p.id];
                  if (!data) return true;

                  if (actionLevel === 'more') {
                    // For more action 1, exclude players who folded in base
                    return data.preflopAction !== 'fold';
                  }

                  if (actionLevel === 'more2') {
                    // For more action 2, exclude players who folded in base or more action 1
                    return data.preflopAction !== 'fold' &&
                           data.preflop_moreActionAction !== 'fold';
                  }

                  return true;
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

                      const action = (data[actionKey] as ActionType) || '';
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
                            className={`border ${levelBorderColor} px-2 py-2 text-xs`}
                          >
                            <div className="text-gray-600">Starting:</div>
                            <div className="font-bold text-blue-600">{formatStack(player.stack)}</div>
                            <div className="text-gray-600 mt-1">Current:</div>
                            <div className="font-bold">-</div>
                          </td>

                          {/* CARD 1 - Show ONLY in preflop base */}
                          {actionLevel === 'base' && (
                            <td className={`border ${levelBorderColor} px-2 py-1`}>
                              <CardSelector
                                playerId={player.id}
                                cardNumber={1}
                                currentCard={data.card1 || null}
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
                            <ActionButtons
                              playerId={player.id}
                              selectedAction={action}
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
                      {levelIndex === visibleActionLevels.preflop.length - 1 && (
                        <button
                          onClick={handleAddMoreAction}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          Add More Action
                        </button>
                      )}
                      {levelIndex === visibleActionLevels.preflop.length - 1 && (
                        <button
                          onClick={handleCreateFlop}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          Create Flop
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
