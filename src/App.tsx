import React, { useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { usePokerEngine } from './hooks/usePokerEngine';
import { usePotCalculation } from './hooks/usePotCalculation';
import { useCardManagement } from './hooks/useCardManagement';
import { useActionHandler } from './hooks/useActionHandler';
import { StackSetupView } from './components/StackSetupView';
import { PreFlopView } from './components/game/PreFlopView';
import { FlopView } from './components/game/FlopView';
import { TurnView } from './components/game/TurnView';
import { RiverView } from './components/game/RiverView';
import PotCalculationDemo from './pages/PotCalculationDemo';
import { LogRocketControl } from './components/LogRocketControl';

function App() {
  // Initialize game state
  const [state, actions] = useGameState();

  // Initialize engine hooks
  const pokerEngine = usePokerEngine(state, actions);
  const potCalculation = usePotCalculation(state, actions);
  const cardManagement = useCardManagement(state, actions);
  const actionHandler = useActionHandler(state, actions);

  /**
   * Format stack amount based on default unit
   */
  const formatStack = useCallback((amount: number): string => {
    const unit = state.defaultUnit;
    if (unit === 'K') {
      return `${(amount / 1000).toFixed(1)}K`;
    } else if (unit === 'Mil') {
      return `${(amount / 1000000).toFixed(2)}M`;
    }
    return amount.toString();
  }, [state.defaultUnit]);

  /**
   * Clear all data
   */
  const handleClearAll = useCallback(() => {
    if (confirm('Are you sure you want to clear all data?')) {
      // Reset to initial state
      actions.setPlayers(
        Array.from({ length: 9 }, (_, i) => ({
          id: i + 1,
          name: '',
          position: '' as any,
          stack: 0,
          inputOrder: i
        }))
      );
      actions.setPlayerData({});
      actions.setStackData({
        bigBlind: 0,
        smallBlind: 0,
        ante: 0,
        anteOrder: 'BB First'
      });
      actions.setCommunityCards({
        flop: { card1: null, card2: null, card3: null },
        turn: { card1: null },
        river: { card1: null }
      });
      actions.setCurrentView('stack');
      console.log('✅ All data cleared');
    }
  }, [actions]);

  /**
   * Export data (placeholder)
   */
  const handleExport = useCallback(() => {
    console.log('Export data:', { state });
    alert('Export functionality coming soon!');
  }, [state]);

  // Render Pot Calculation Demo
  if (state.currentView === 'pot-demo') {
    return (
      <>
        <PotCalculationDemo />
        <LogRocketControl state={state} actions={actions} />
      </>
    );
  }

  // Render current view
  if (state.currentView === 'stack') {
    return (
      <>
        <StackSetupView
          state={state}
          actions={actions}
          cardManagement={cardManagement}
          onClearAll={handleClearAll}
          onExport={handleExport}
          formatStack={formatStack}
        />
        <LogRocketControl state={state} actions={actions} />
      </>
    );
  }

  // Render PreFlop view
  if (state.currentView === 'preflop' || state.currentView === 'preflop-more' || state.currentView === 'preflop-more2') {
    return (
      <>
        <PreFlopView
          state={state}
          actions={actions}
          cardManagement={cardManagement}
          potCalculation={potCalculation}
          onClearAll={handleClearAll}
          onExport={handleExport}
          formatStack={formatStack}
        />
        <LogRocketControl state={state} actions={actions} />
      </>
    );
  }

  // Render Flop view
  if (state.currentView === 'flop' || state.currentView === 'flop-more' || state.currentView === 'flop-more2') {
    return (
      <>
        <FlopView
          state={state}
          actions={actions}
          cardManagement={cardManagement}
          potCalculation={potCalculation}
          onClearAll={handleClearAll}
          onExport={handleExport}
          formatStack={formatStack}
        />
        <LogRocketControl state={state} actions={actions} />
      </>
    );
  }

  // Render Turn view
  if (state.currentView === 'turn' || state.currentView === 'turn-more' || state.currentView === 'turn-more2') {
    return (
      <>
        <TurnView
          state={state}
          actions={actions}
          cardManagement={cardManagement}
          potCalculation={potCalculation}
          onClearAll={handleClearAll}
          onExport={handleExport}
          formatStack={formatStack}
        />
        <LogRocketControl state={state} actions={actions} />
      </>
    );
  }

  // Render River view
  if (state.currentView === 'river' || state.currentView === 'river-more' || state.currentView === 'river-more2') {
    return (
      <>
        <RiverView
          state={state}
          actions={actions}
          cardManagement={cardManagement}
          potCalculation={potCalculation}
          onClearAll={handleClearAll}
          onExport={handleExport}
          formatStack={formatStack}
        />
        <LogRocketControl state={state} actions={actions} />
      </>
    );
  }

  // Placeholder for unknown views
  return (
    <>
      <div className="p-2 max-w-full mx-auto bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-3">
          <h1 className="text-lg font-bold text-gray-800">Game View</h1>
          <p className="text-sm text-gray-600">Current view: {state.currentView}</p>
          <button
            onClick={() => actions.setCurrentView('stack')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Stack Setup
          </button>
        </div>
      </div>
      <LogRocketControl state={state} actions={actions} />
    </>
  );
}

export default App;
