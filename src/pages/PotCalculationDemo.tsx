import React from 'react';

/**
 * Demo page for the Pot Calculation Display component
 *
 * This demo page has been deprecated. The Pot Calculation Display is now
 * integrated directly into the game views (PreFlop, Flop, Turn, River).
 *
 * To test the Pot Calculation Display:
 * 1. Go to Stack Setup and set up a hand
 * 2. Navigate through the game stages
 * 3. The Pot Calculation Display will appear automatically with the Select Winners button
 */
const PotCalculationDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pot Calculation Demo</h1>
        <p className="text-gray-700 mb-4">
          This demo page has been deprecated. The Pot Calculation Display is now integrated
          directly into the game views.
        </p>
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <h2 className="font-bold text-blue-900 mb-2">How to use:</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Go to Stack Setup and set up a hand</li>
            <li>Navigate through the game stages (PreFlop, Flop, Turn, River)</li>
            <li>Click "Show Pot Breakdown" to see the pot calculation</li>
            <li>At River, click "Select Winners" to generate the next hand</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PotCalculationDemo;
