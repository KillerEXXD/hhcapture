import React from 'react';
import { PotCalculationDisplayExample } from '../components/poker/PotCalculationDisplay';

/**
 * Demo page for the Pot Calculation Display component
 *
 * To view this page, add it to your router or navigate to it directly.
 *
 * Example route setup in App.tsx:
 * <Route path="/pot-demo" element={<PotCalculationDemo />} />
 */
const PotCalculationDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 py-10">
      <PotCalculationDisplayExample />
    </div>
  );
};

export default PotCalculationDemo;
