/**
 * Winner Selection Modal
 *
 * Allows users to select winners for Main Pot and Side Pots
 * Shows eligible players for each pot
 * Validates selections before processing
 */

import React, { useState } from 'react';
import type { Pot, WinnerSelection } from '../../lib/poker/engine/nextHandGenerator';

interface WinnerSelectionModalProps {
  pots: Pot[];
  onConfirm: (selections: WinnerSelection[]) => void;
  onCancel: () => void;
}

export const WinnerSelectionModal: React.FC<WinnerSelectionModalProps> = ({
  pots,
  onConfirm,
  onCancel
}) => {
  const [selections, setSelections] = useState<WinnerSelection[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * Handle winner selection/toggle for a pot (supports multiple winners)
   */
  const handleToggleWinner = (potName: string, potType: string, winnerName: string) => {
    setSelections(prev => {
      // Find existing selection for this pot
      const existingSelection = prev.find(s => s.potName === potName);

      if (existingSelection) {
        // Toggle winner in the existing selection
        const isAlreadySelected = existingSelection.winnerNames.includes(winnerName);

        if (isAlreadySelected) {
          // Remove this winner
          const updatedWinners = existingSelection.winnerNames.filter(w => w !== winnerName);

          if (updatedWinners.length === 0) {
            // If no winners left, remove the selection entirely
            return prev.filter(s => s.potName !== potName);
          } else {
            // Update with remaining winners
            return prev.map(s =>
              s.potName === potName
                ? { ...s, winnerNames: updatedWinners }
                : s
            );
          }
        } else {
          // Add this winner
          return prev.map(s =>
            s.potName === potName
              ? { ...s, winnerNames: [...s.winnerNames, winnerName] }
              : s
          );
        }
      } else {
        // No existing selection, create new one
        return [...prev, { potName, potType, winnerNames: [winnerName] }];
      }
    });

    // Clear errors when user makes a selection
    setErrors([]);
  };

  /**
   * Validate and confirm selections
   */
  const handleConfirm = () => {
    const validationErrors: string[] = [];

    // Check all pots have winners
    pots.forEach(pot => {
      const selection = selections.find(s => s.potName === pot.name);
      if (!selection) {
        validationErrors.push(`Please select a winner for ${pot.name}`);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // All valid, proceed
    onConfirm(selections);
  };

  /**
   * Get selected winners for a pot
   */
  const getSelectedWinners = (potName: string): string[] => {
    return selections.find(s => s.potName === potName)?.winnerNames || [];
  };

  /**
   * Check if a player is selected as winner for a pot
   */
  const isWinnerSelected = (potName: string, playerName: string): boolean => {
    return getSelectedWinners(potName).includes(playerName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🏆 Select Winners
          </h2>
          <p className="text-gray-600">
            Select winner(s) for each pot. Click multiple players to split the pot equally. Only eligible players can be selected.
          </p>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">⚠️ Please fix the following:</h3>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, idx) => (
                <li key={idx} className="text-red-700 text-sm">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Pot Selection Cards */}
        <div className="space-y-6 mb-6">
          {pots.map((pot) => {
            const selectedWinners = getSelectedWinners(pot.name);
            const splitAmount = selectedWinners.length > 0 ? pot.amount / selectedWinners.length : 0;

            return (
              <div
                key={pot.name}
                className="border border-gray-300 rounded-lg p-4 bg-gray-50"
              >
                {/* Pot Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {pot.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Total: <span className="font-mono font-semibold">{pot.amount.toLocaleString()}</span>
                      {' '}({pot.percentage.toFixed(1)}%)
                    </p>
                    {selectedWinners.length > 1 && (
                      <p className="text-sm text-blue-600 font-semibold mt-1">
                        Split {selectedWinners.length} ways: {splitAmount.toLocaleString()} each
                      </p>
                    )}
                  </div>
                  {selectedWinners.length > 0 && (
                    <div className="text-green-600 font-semibold flex items-center">
                      <span className="mr-2">✓</span>
                      {selectedWinners.length} winner{selectedWinners.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Selected Winners Display */}
                {selectedWinners.length > 0 && (
                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-semibold mb-1">Selected:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedWinners.map(winner => (
                        <span key={winner} className="px-2 py-1 bg-green-600 text-white text-sm rounded-md">
                          {winner}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eligible Players */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedWinners.length === 0 ? 'Select winner(s):' : 'Click to add/remove winners:'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {pot.eligible.map((playerName) => {
                      const isSelected = isWinnerSelected(pot.name, playerName);

                      return (
                        <button
                          key={playerName}
                          onClick={() => handleToggleWinner(pot.name, pot.type, playerName)}
                          className={`
                            px-4 py-2 rounded-lg font-medium transition-all
                            ${isSelected
                              ? 'bg-green-600 text-white shadow-md scale-105'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                            }
                          `}
                        >
                          {playerName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-blue-900 font-semibold mb-2">📊 Selection Summary</h3>
          <div className="space-y-2">
            {pots.map(pot => {
              const selection = selections.find(s => s.potName === pot.name);
              const splitAmount = selection && selection.winnerNames.length > 0
                ? pot.amount / selection.winnerNames.length
                : 0;

              return (
                <div key={pot.name} className="text-sm">
                  <span className="text-blue-800 font-medium">{pot.name}:</span>{' '}
                  {selection && selection.winnerNames.length > 0 ? (
                    <div className="ml-4 mt-1">
                      {selection.winnerNames.map((winner, idx) => (
                        <div key={winner} className="text-blue-900">
                          <span className="font-semibold">{winner}</span>
                          {selection.winnerNames.length > 1 && (
                            <span className="text-blue-700 ml-2">
                              ({splitAmount.toLocaleString()})
                            </span>
                          )}
                        </div>
                      ))}
                      {selection.winnerNames.length > 1 && (
                        <div className="text-blue-600 text-xs italic mt-1">
                          Split {selection.winnerNames.length} ways
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-blue-600 italic">Not selected</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
          >
            Confirm Winners & Generate Next Hand
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerSelectionModal;
