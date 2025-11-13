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
   * Handle winner selection for a pot
   */
  const handleSelectWinner = (potName: string, potType: string, winnerName: string) => {
    setSelections(prev => {
      // Remove any existing selection for this pot
      const filtered = prev.filter(s => s.potName !== potName);

      // Add new selection
      return [...filtered, { potName, potType, winnerName }];
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
   * Get selected winner for a pot
   */
  const getSelectedWinner = (potName: string): string | undefined => {
    return selections.find(s => s.potName === potName)?.winnerName;
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
            Select the winner for each pot. Only eligible players can be selected.
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
            const selectedWinner = getSelectedWinner(pot.name);

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
                      Amount: <span className="font-mono font-semibold">{pot.amount.toLocaleString()}</span>
                      {' '}({pot.percentage.toFixed(1)}%)
                    </p>
                  </div>
                  {selectedWinner && (
                    <div className="text-green-600 font-semibold flex items-center">
                      <span className="mr-2">✓</span>
                      {selectedWinner}
                    </div>
                  )}
                </div>

                {/* Eligible Players */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Select winner (eligible players only):</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {pot.eligible.map((playerName) => {
                      const isSelected = selectedWinner === playerName;

                      return (
                        <button
                          key={playerName}
                          onClick={() => handleSelectWinner(pot.name, pot.type, playerName)}
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
          <div className="space-y-1">
            {pots.map(pot => {
              const selection = selections.find(s => s.potName === pot.name);
              return (
                <div key={pot.name} className="text-sm">
                  <span className="text-blue-800 font-medium">{pot.name}:</span>{' '}
                  {selection ? (
                    <span className="text-blue-900 font-semibold">{selection.winnerName}</span>
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
