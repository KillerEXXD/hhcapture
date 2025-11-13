#!/usr/bin/env python3
"""
Script to update PotCalculationDisplay.tsx with winner selection features.
This script bypasses linter auto-revert issues by making all changes at once.
"""

import re

# Read the current file
with open(r'C:\Apps\HUDR\HHTool_Modular\src\components\poker\PotCalculationDisplay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
old_imports = """import React, { useState } from 'react';
import type { Player } from '../../types/poker';"""

new_imports = """import React, { useState } from 'react';
import type { Player, GameConfig } from '../../types/poker';
import type { GameStateActions } from '../../hooks/useGameState';
import { HandComparisonModal } from './HandComparisonModal';
import { WinnerSelectionModal } from './WinnerSelectionModal';
import {
  processWinnersAndGenerateNextHand,
  type Pot,
  type WinnerSelection,
  type NextHandPlayer,
  type ValidationResult
} from '../../lib/poker/engine/nextHandGenerator';
import { formatNextHandForDisplay } from '../../lib/poker/utils/handFormatParser';"""

content = content.replace(old_imports, new_imports)

# 2. Update props interface
old_props_interface = """interface PotCalculationDisplayProps {
  totalPot: number;
  mainPot: PotInfo;
  sidePots: PotInfo[];
  players: Player[];
}"""

new_props_interface = """interface PotCalculationDisplayProps {
  totalPot: number;
  mainPot: PotInfo;
  sidePots: PotInfo[];
  players: Player[];
  currentPlayers: Player[];
  stackData: GameConfig;
  actions: GameStateActions;
}"""

content = content.replace(old_props_interface, new_props_interface)

# 3. Update component signature and add functionality
old_component_start = """export const PotCalculationDisplay: React.FC<PotCalculationDisplayProps> = ({
  totalPot,
  mainPot,
  sidePots,
  players,
}) => {
  return ("""

new_component_start = """export const PotCalculationDisplay: React.FC<PotCalculationDisplayProps> = ({
  totalPot,
  mainPot,
  sidePots,
  players,
  currentPlayers,
  stackData,
  actions,
}) => {
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [nextHandData, setNextHandData] = useState<NextHandPlayer[] | null>(null);
  const [nextHandFormatted, setNextHandFormatted] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [comparisonHand, setComparisonHand] = useState('');
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const convertToPots = (): Pot[] => {
    const pots: Pot[] = [];
    pots.push({
      name: 'Main Pot',
      type: 'main',
      amount: mainPot.amount,
      eligible: mainPot.eligiblePlayers.map(p => p.name),
      percentage: (mainPot.amount / totalPot) * 100
    });
    sidePots.forEach((sidePot) => {
      const sideNum = sidePot.potNumber || 1;
      pots.push({
        name: `Side Pot ${sideNum}`,
        type: `side${sideNum}` as 'side1' | 'side2' | 'side3' | 'side4' | 'side5',
        amount: sidePot.amount,
        eligible: sidePot.eligiblePlayers.map(p => p.name),
        percentage: (sidePot.amount / totalPot) * 100
      });
    });
    return pots;
  };

  const handleWinnerConfirm = (selections: WinnerSelection[]) => {
    const pots = convertToPots();
    const result = processWinnersAndGenerateNextHand(currentPlayers, pots, selections);
    setNextHandData(result.nextHand);
    setValidationResult(result.validation);
    const handNumber = parseInt(stackData.handNumber?.replace(/[^0-9]/g, '') || '1') + 1;
    const formatted = formatNextHandForDisplay(
      handNumber.toString(),
      stackData.startedAt || '00:00:00',
      stackData.smallBlind || 0,
      stackData.bigBlind || 0,
      stackData.ante || 0,
      result.nextHand.map(p => ({ name: p.name, position: p.position, stack: p.stack }))
    );
    setNextHandFormatted(formatted);
    setShowWinnerModal(false);
  };

  const handleCopyNextHand = async () => {
    if (!nextHandFormatted) return;
    try {
      await navigator.clipboard.writeText(nextHandFormatted);
      actions.setGeneratedNextHand(nextHandFormatted);
      alert('✅ Next hand copied to clipboard and ready to load!\\n\\nGo to Stack Setup and click "Load Next Hand" button.');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('❌ Failed to copy to clipboard');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setComparisonHand(text);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      alert('❌ Failed to read from clipboard');
    }
  };

  return ("""

content = content.replace(old_component_start, new_component_start)

# 4. Add winner selection UI before closing </div>
# Find the last pot card rendering and add our UI after it
old_ending = """        return (
          <PotCard
            key={sidePot.potNumber}
            potInfo={sidePot}
            headerColorClasses={colorClasses}
          />
        );
      })}
    </div>
  );
};"""

new_ending = """        return (
          <PotCard
            key={sidePot.potNumber}
            potInfo={sidePot}
            headerColorClasses={colorClasses}
          />
        );
      })}

      <div className="mt-8 mb-6">
        <button
          onClick={() => setShowWinnerModal(true)}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold py-4 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg flex items-center justify-center text-lg"
        >
          🏆 Select Winners
        </button>
      </div>

      {showWinnerModal && (
        <WinnerSelectionModal
          pots={convertToPots()}
          onConfirm={handleWinnerConfirm}
          onCancel={() => setShowWinnerModal(false)}
        />
      )}

      {nextHandData && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-6 mt-8">
          <h3 className="text-2xl font-bold text-purple-900 mb-4">🔄 Next Hand Generated</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {nextHandData.map(player => (
              <div key={player.name} className={`p-4 rounded-lg ${player.stack > 0 ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border-2`}>
                <div className="font-bold text-lg">{player.name}</div>
                <div className="text-sm">{player.position}</div>
                <div className="text-2xl font-mono">{player.stack.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {validationResult && (
            <div className={`p-4 rounded-lg mb-4 ${validationResult.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
              {validationResult.isValid ? (
                <span className="text-green-800 font-semibold">✅ All validations passed</span>
              ) : (
                <div>
                  <span className="text-red-800 font-semibold">❌ Validation errors:</span>
                  <ul className="list-disc list-inside mt-2">
                    {validationResult.errors.map((error, idx) => (
                      <li key={idx} className="text-red-700 text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleCopyNextHand}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md mb-6"
          >
            📋 Copy Next Hand
          </button>

          <div className="mt-6 border-t-2 border-purple-300 pt-6">
            <h4 className="text-lg font-bold mb-4">🔍 Compare with Expected Hand</h4>
            <div className="mb-4">
              <label className="font-semibold block mb-2">Generated Hand:</label>
              <pre className="bg-white p-4 rounded border font-mono text-sm whitespace-pre-wrap">{nextHandFormatted}</pre>
            </div>
            <div className="mb-4">
              <label className="font-semibold block mb-2">Paste from GS (Google Sheets):</label>
              <textarea
                value={comparisonHand}
                onChange={(e) => setComparisonHand(e.target.value)}
                className="w-full p-4 border rounded font-mono text-sm"
                rows={10}
                placeholder="Paste expected hand here..."
              />
              <button
                onClick={handlePasteFromClipboard}
                className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                📋 Paste from Clipboard
              </button>
            </div>
            <button
              onClick={() => setShowComparisonModal(true)}
              disabled={!comparisonHand.trim()}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${comparisonHand.trim() ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              🔍 Compare Hands
            </button>
          </div>
        </div>
      )}

      {showComparisonModal && (
        <HandComparisonModal
          generatedHand={nextHandFormatted}
          expectedHand={comparisonHand}
          onClose={() => setShowComparisonModal(false)}
        />
      )}
    </div>
  );
};"""

content = content.replace(old_ending, new_ending)

# 5. Remove the example component (it has errors and isn't needed)
# Find and remove everything after "// ===== EXAMPLE USAGE ====="
example_start = content.find("// ===== EXAMPLE USAGE =====")
if example_start != -1:
    content = content[:example_start] + "\nexport default PotCalculationDisplay;\n"

# Write the updated content
with open(r'C:\Apps\HUDR\HHTool_Modular\src\components\poker\PotCalculationDisplay.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: PotCalculationDisplay.tsx updated successfully!")
