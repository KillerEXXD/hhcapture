import React, { useState } from 'react';
import type { Player, GameConfig } from '../../types/poker';
import type { GameStateActions } from '../../hooks/useGameState';
import { WinnerSelectionModal } from './WinnerSelectionModal';
import {
  processWinnersAndGenerateNextHand,
  type Pot,
  type WinnerSelection,
  type NextHandPlayer,
  type ValidationResult,
  type PlayerContribution as NextHandPlayerContribution
} from '../../lib/poker/engine/nextHandGenerator';
import { formatNextHandForDisplay, parseHandFormat } from '../../lib/poker/utils/handFormatParser';

// ===== TYPE DEFINITIONS =====

interface PlayerContribution {
  playerId: number;
  amount: number;
  isAllIn?: boolean;
  isExcluded?: boolean;
  exclusionReason?: string;
}

interface StreetContribution {
  street: 'preflop' | 'flop' | 'turn' | 'river';
  amount: number;
  detail: string;
}

interface PotInfo {
  potType: 'main' | 'side';
  potNumber?: number; // For side pots: 1, 2, 3, etc.
  amount: number;
  eligiblePlayers: Player[];
  excludedPlayers?: Array<{ player: Player; reason: string }>;
  contributions: PlayerContribution[];
  streetBreakdown: StreetContribution[];
  calculation: {
    formula: string;
    variables: Record<string, string | number>;
    result: string;
  };
  description: string;
}

interface PotCalculationDisplayProps {
  totalPot: number;
  mainPot: PotInfo;
  sidePots: PotInfo[];
  players: Player[];
  currentPlayers: Player[];
  stackData: GameConfig;
  actions: GameStateActions;
}

// ===== COMPONENTS =====

const PlayerChip: React.FC<{
  player: Player;
  isAllIn?: boolean;
  isExcluded?: boolean;
}> = ({ player, isAllIn, isExcluded }) => {
  const baseClasses = "inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm transition-all hover:shadow-md";

  const variantClasses = isExcluded
    ? "bg-gray-100 text-gray-400 opacity-70"
    : isAllIn
    ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-500 text-gray-900"
    : "bg-white text-gray-900 shadow-sm hover:-translate-y-0.5";

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {player.name[0]}
      </div>
      <span className="text-sm">{player.name}</span>
      {isAllIn && !isExcluded && (
        <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-extrabold tracking-wide">
          ALL-IN
        </span>
      )}
      {isExcluded && (
        <span className="text-xs">(excluded)</span>
      )}
    </div>
  );
};

const PotHeader: React.FC<{
  potInfo: PotInfo;
  isExpanded: boolean;
  onToggle: () => void;
  headerColorClasses: string;
}> = ({ potInfo, isExpanded, onToggle, headerColorClasses }) => {
  const icon = potInfo.potType === 'main' ? '🏆' : potInfo.potNumber === 1 ? '💼' : '💎';
  const title = potInfo.potType === 'main'
    ? 'Main Pot'
    : `Side Pot ${potInfo.potNumber}`;
  const subtitle = potInfo.potType === 'main'
    ? 'All active players eligible'
    : `Players above ${potInfo.potNumber === 1 ? '1st' : '2nd'} all-in`;

  const eligiblePlayers = potInfo.eligiblePlayers;
  const excludedPlayers = potInfo.excludedPlayers || [];

  return (
    <div
      className={`${headerColorClasses} p-5 cursor-pointer transition-opacity hover:opacity-95`}
      onClick={onToggle}
    >
      {/* Top Section: Title, Amount, Expand Icon */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="text-3xl drop-shadow-md">{icon}</div>
          <div>
            <h3 className="text-2xl font-extrabold text-white drop-shadow-md mb-1">
              {title}
            </h3>
            <div className="text-sm text-white/95 font-semibold">
              {subtitle}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-black text-white drop-shadow-lg">
              ${potInfo.amount.toLocaleString()}
            </div>
            <div className="text-xs text-white/90 font-semibold">
              {eligiblePlayers.length} player{eligiblePlayers.length !== 1 ? 's' : ''}
            </div>
          </div>
          <svg
            className={`w-6 h-6 text-white transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Player List */}
      <div className="flex items-center gap-3 flex-wrap p-3 bg-white/15 rounded-lg backdrop-blur-sm">
        <span className="text-xs font-bold text-white/95 uppercase tracking-wide">
          Eligible:
        </span>
        <div className="flex gap-2 flex-wrap flex-1">
          {eligiblePlayers.map((player) => {
            const contribution = potInfo.contributions.find(c => c.playerId === player.id);
            return (
              <PlayerChip
                key={player.id}
                player={player}
                isAllIn={contribution?.isAllIn}
              />
            );
          })}
          {excludedPlayers.map(({ player }) => (
            <PlayerChip
              key={player.id}
              player={player}
              isExcluded={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const CalculationExplanation: React.FC<{
  calculation: PotInfo['calculation'];
}> = ({ calculation }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3 text-blue-900 font-bold text-base">
        <span>📊</span>
        <span>How this pot was calculated</span>
      </div>
      <div className="bg-white font-mono text-sm p-3 rounded-lg mb-3 text-gray-900">
        {calculation.formula.split('\n').map((line, index) => (
          <div key={index} className="leading-relaxed">
            {line.split(/(\$[\d,]+|\d+|[+\-×÷=]|\w+\s+\w+)/).map((part, i) => {
              if (part.match(/\$[\d,]+|\d+/)) {
                return <span key={i} className="text-red-600 font-bold">{part}</span>;
              } else if (part.match(/[+\-×÷=]/)) {
                return <span key={i} className="text-green-600 font-bold">{part}</span>;
              }
              return <span key={i}>{part}</span>;
            })}
          </div>
        ))}
      </div>
      <div className="bg-white text-blue-900 font-semibold text-sm px-3 py-2 rounded-md">
        {calculation.result}
      </div>
    </div>
  );
};

const StreetBreakdown: React.FC<{
  streets: StreetContribution[];
}> = ({ streets }) => {
  const streetStyles = {
    preflop: { border: 'border-l-4 border-purple-600', name: 'Preflop' },
    flop: { border: 'border-l-4 border-blue-600', name: 'Flop' },
    turn: { border: 'border-l-4 border-red-600', name: 'Turn' },
    river: { border: 'border-l-4 border-green-600', name: 'River' },
  };

  return (
    <div className="border-t-2 border-gray-200 pt-5 mt-5">
      <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span>📈</span>
        <span>Contributions by Street</span>
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {streets.map((street) => {
          const style = streetStyles[street.street];
          return (
            <div
              key={street.street}
              className={`bg-white border-2 border-gray-200 ${style.border} rounded-lg p-3.5 transition-all hover:border-purple-600 hover:shadow-md`}
            >
              <div className="text-sm font-bold text-gray-900 mb-2">
                {style.name}
              </div>
              <div className="text-xl font-extrabold text-green-600">
                ${street.amount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {street.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InfoBox: React.FC<{
  title: string;
  content: string;
}> = ({ title, content }) => {
  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3.5 mt-4">
      <div className="flex items-center gap-2 text-sm font-bold text-yellow-900 mb-2">
        <span>ℹ️</span>
        <span>{title}</span>
      </div>
      <div className="text-xs text-yellow-900 leading-relaxed">
        {content}
      </div>
    </div>
  );
};

const PotCard: React.FC<{
  potInfo: PotInfo;
  headerColorClasses: string;
}> = ({ potInfo, headerColorClasses }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl mb-5 transition-all hover:shadow-3xl hover:-translate-y-0.5">
      <PotHeader
        potInfo={potInfo}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        headerColorClasses={headerColorClasses}
      />

      {/* Expandable Body */}
      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          isExpanded ? 'max-h-[3000px]' : 'max-h-0'
        }`}
      >
        <div className="p-6 bg-gray-50">
          <CalculationExplanation calculation={potInfo.calculation} />
          <StreetBreakdown streets={potInfo.streetBreakdown} />
          <InfoBox
            title={`About ${potInfo.potType === 'main' ? 'Main Pot' : `Side Pot ${potInfo.potNumber}`}`}
            content={potInfo.description}
          />
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====

export const PotCalculationDisplay: React.FC<PotCalculationDisplayProps> = ({
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
  const [comparisonResults, setComparisonResults] = useState<Array<{
    field: string;
    expected: string;
    actual: string;
    match: boolean;
  }>>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [pastedExpectedHand, setPastedExpectedHand] = useState('');
  const [isNextHandExpanded, setIsNextHandExpanded] = useState(false);

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

  const calculatePlayerBreakdown = (
    player: NextHandPlayer,
    selections: WinnerSelection[],
    pots: Pot[],
    contributionsMap: Map<string, number>
  ) => {
    const ante = stackData.ante || 0;
    const sb = stackData.smallBlind || 0;
    const bb = stackData.bigBlind || 0;

    // Determine if this player is SB or BB
    const isSB = player.position === 'SB';
    const isBB = player.position === 'BB';

    // Blind contribution
    const blindContribution = isSB ? sb : isBB ? bb : 0;

    // Total contribution from pot
    const totalContribution = contributionsMap.get(player.name) || 0;

    // Action contribution = total - blind
    const actionContribution = totalContribution - blindContribution;

    // Calculate pot winnings
    let potWinnings = 0;
    selections.forEach(selection => {
      if (selection.winnerNames.includes(player.name)) {
        const pot = pots.find(p => p.name === selection.potName);
        if (pot) {
          potWinnings += pot.amount / selection.winnerNames.length;
        }
      }
    });

    return {
      anteContribution: isBB ? ante : 0, // Only BB posts ante
      blindContribution,
      actionContribution,
      totalContribution,
      potWinnings,
      isBlindPosition: isSB || isBB,
      blindType: isSB ? 'SB' as const : isBB ? 'BB' as const : undefined
    };
  };

  const handleWinnerConfirm = (selections: WinnerSelection[]) => {
    console.log('🏆 [WinnerConfirm] Winner selections:', selections);
    console.log('🏆 [WinnerConfirm] Current players:', currentPlayers);

    const pots = convertToPots();
    console.log('🏆 [WinnerConfirm] Converted pots:', pots);

    // Aggregate player contributions from all pots
    const contributionsMap = new Map<string, number>();

    // Add main pot contributions
    mainPot.contributions.forEach(contrib => {
      const player = currentPlayers.find(p => p.id === contrib.playerId);
      if (player) {
        contributionsMap.set(player.name, (contributionsMap.get(player.name) || 0) + contrib.amount);
      }
    });

    // Add side pot contributions
    sidePots.forEach(sidePot => {
      sidePot.contributions.forEach(contrib => {
        const player = currentPlayers.find(p => p.id === contrib.playerId);
        if (player) {
          contributionsMap.set(player.name, (contributionsMap.get(player.name) || 0) + contrib.amount);
        }
      });
    });

    // Add blinds/antes for folded players (dead money)
    const ante = stackData.ante || 0;
    const sb = stackData.smallBlind || 0;
    const bb = stackData.bigBlind || 0;

    currentPlayers.forEach(player => {
      const currentContribution = contributionsMap.get(player.name) || 0;

      // Check if player folded (has no contribution in any pot)
      const playerInMainPot = mainPot.contributions.some(c => c.playerId === player.id);
      const playerInSidePots = sidePots.some(sp => sp.contributions.some(c => c.playerId === player.id));
      const playerFolded = !playerInMainPot && !playerInSidePots;

      if (playerFolded) {
        // Add posted blinds/antes as dead money
        if (player.position === 'SB') {
          contributionsMap.set(player.name, currentContribution + sb);
          console.log(`💀 [Contribution] ${player.name} (SB) folded: Adding ${sb} SB as dead money`);
        } else if (player.position === 'BB') {
          contributionsMap.set(player.name, currentContribution + bb + ante);
          console.log(`💀 [Contribution] ${player.name} (BB) folded: Adding ${bb} BB + ${ante} Ante = ${bb + ante} as dead money`);
        }
      } else {
        // Player stayed - ante for BB is dead money (separate from contribution)
        // but needs to be tracked for stack deduction
        if (player.position === 'BB') {
          contributionsMap.set(player.name, currentContribution + ante);
          console.log(`💰 [Contribution] ${player.name} (BB) stayed: Adding ${ante} Ante as dead money for stack deduction`);
        }
      }
    });

    // Convert to array format expected by next hand generator
    const playerContributions = Array.from(contributionsMap.entries()).map(([playerName, amount]) => ({
      playerName,
      amount
    }));

    console.log('🏆 [WinnerConfirm] Player contributions:', playerContributions);

    const result = processWinnersAndGenerateNextHand(currentPlayers, pots, selections, playerContributions);
    console.log('🏆 [WinnerConfirm] Next hand result:', result.nextHand);
    console.log('🏆 [WinnerConfirm] Validation:', result.validation);

    // Add breakdown to each player
    const nextHandWithBreakdown = result.nextHand.map(player => ({
      ...player,
      breakdown: calculatePlayerBreakdown(player, selections, pots, contributionsMap)
    }));

    setNextHandData(nextHandWithBreakdown);
    setValidationResult(result.validation);
    const handNumber = parseInt(stackData.handNumber?.replace(/[^0-9]/g, '') || '1') + 1;

    const playerData = result.nextHand.map(p => ({ name: p.name, position: p.position, stack: p.stack }));
    console.log('🏆 [WinnerConfirm] Player data for formatting:', playerData);

    const formatted = formatNextHandForDisplay(
      handNumber.toString(),
      stackData.startedAt || '00:00:00',
      stackData.smallBlind || 0,
      stackData.bigBlind || 0,
      stackData.ante || 0,
      playerData
    );
    console.log('🏆 [WinnerConfirm] Formatted hand:', formatted);

    setNextHandFormatted(formatted);
    setShowWinnerModal(false);
  };

  const handleCopyNextHand = async () => {
    if (!nextHandFormatted) return;
    try {
      console.log('📋 [CopyNextHand] Copying next hand to clipboard...');
      console.log('📋 [CopyNextHand] nextHandFormatted:', nextHandFormatted);
      console.log('📋 [CopyNextHand] Type:', typeof nextHandFormatted);
      console.log('📋 [CopyNextHand] Length:', nextHandFormatted.length);

      await navigator.clipboard.writeText(nextHandFormatted);

      console.log('💾 [CopyNextHand] Storing in state.generatedNextHand...');
      actions.setGeneratedNextHand(nextHandFormatted);
      console.log('✅ [CopyNextHand] Stored successfully');

      alert('✅ Next hand copied to clipboard and ready to load!\n\nGo to Stack Setup and click "Load Next Hand" button.');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('❌ Failed to copy to clipboard');
    }
  };

  const handleLoadNextHand = async () => {
    if (!nextHandFormatted) return;
    try {
      console.log('🔄 [LoadNextHand] Loading next hand...');

      // Copy to clipboard
      await navigator.clipboard.writeText(nextHandFormatted);

      // Store in state
      console.log('💾 [LoadNextHand] Storing in state.generatedNextHand...');
      actions.setGeneratedNextHand(nextHandFormatted);

      // Also update the raw input in stackData so it auto-loads
      actions.setStackData({ ...stackData, rawInput: nextHandFormatted });
      console.log('✅ [LoadNextHand] Stored in stackData.rawInput');

      // Navigate to stack setup
      actions.setCurrentView('stack');
      console.log('✅ [LoadNextHand] Navigated to Stack Setup');

    } catch (error) {
      console.error('Failed to load next hand:', error);
      alert('❌ Failed to load next hand');
    }
  };

  const handleLoadGSHand = async () => {
    if (!pastedExpectedHand) return;
    try {
      console.log('🔄 [LoadGSHand] Loading GS hand...');

      // Copy to clipboard
      await navigator.clipboard.writeText(pastedExpectedHand);

      // Update the raw input in stackData so it auto-loads
      actions.setStackData({ ...stackData, rawInput: pastedExpectedHand });
      console.log('✅ [LoadGSHand] Stored GS hand in stackData.rawInput');

      // Navigate to stack setup
      actions.setCurrentView('stack');
      console.log('✅ [LoadGSHand] Navigated to Stack Setup');

      alert('✅ GS hand loaded in Stack Setup!');
    } catch (error) {
      console.error('Failed to load GS hand:', error);
      alert('❌ Failed to load GS hand');
    }
  };

  const handlePasteAndCompare = async () => {
    try {
      // Read from clipboard
      const expectedHand = await navigator.clipboard.readText();

      if (!expectedHand.trim()) {
        alert('❌ Clipboard is empty');
        return;
      }

      // Store pasted data so user can see it
      setPastedExpectedHand(expectedHand);

      // Parse both hands
      const generated = parseHandFormat(nextHandFormatted);
      const expected = parseHandFormat(expectedHand);

      if (!generated || !expected) {
        alert('❌ Failed to parse one or both hands. Please check the format.');
        return;
      }

      // Compare hands
      const results: Array<{
        field: string;
        expected: string;
        actual: string;
        match: boolean;
      }> = [];

      // Compare hand number
      results.push({
        field: 'Hand Number',
        expected: expected.header.handNumber,
        actual: generated.header.handNumber,
        match: expected.header.handNumber === generated.header.handNumber
      });

      // Compare SB
      results.push({
        field: 'Small Blind',
        expected: expected.header.sb.toString(),
        actual: generated.header.sb.toString(),
        match: expected.header.sb === generated.header.sb
      });

      // Compare BB
      results.push({
        field: 'Big Blind',
        expected: expected.header.bb.toString(),
        actual: generated.header.bb.toString(),
        match: expected.header.bb === generated.header.bb
      });

      // Compare Ante
      results.push({
        field: 'Ante',
        expected: expected.header.ante.toString(),
        actual: generated.header.ante.toString(),
        match: expected.header.ante === generated.header.ante
      });

      // Compare player count
      results.push({
        field: 'Player Count',
        expected: expected.players.length.toString(),
        actual: generated.players.length.toString(),
        match: expected.players.length === generated.players.length
      });

      // Compare each player
      const maxPlayers = Math.max(expected.players.length, generated.players.length);
      for (let i = 0; i < maxPlayers; i++) {
        const expPlayer = expected.players[i];
        const actPlayer = generated.players[i];

        if (expPlayer && actPlayer) {
          // Compare name
          results.push({
            field: `Player ${i + 1} Name`,
            expected: expPlayer.name,
            actual: actPlayer.name,
            match: expPlayer.name === actPlayer.name
          });

          // Compare position ONLY for Dealer, SB, BB
          const expPos = expPlayer.position?.toLowerCase();
          const actPos = actPlayer.position?.toLowerCase();
          const isButtonPosition = (pos: string | undefined) => {
            if (!pos) return false;
            return pos === 'dealer' || pos === 'sb' || pos === 'bb';
          };

          if (isButtonPosition(expPos) || isButtonPosition(actPos)) {
            results.push({
              field: `Player ${i + 1} Position`,
              expected: expPlayer.position || '(none)',
              actual: actPlayer.position || '(none)',
              match: expPlayer.position === actPlayer.position
            });
          }

          // Compare stack
          results.push({
            field: `Player ${i + 1} Stack`,
            expected: expPlayer.stack.toLocaleString(),
            actual: actPlayer.stack.toLocaleString(),
            match: expPlayer.stack === actPlayer.stack
          });
        } else if (expPlayer) {
          results.push({
            field: `Player ${i + 1}`,
            expected: `${expPlayer.name} (${expPlayer.position || 'no pos'}) ${expPlayer.stack}`,
            actual: '(missing)',
            match: false
          });
        } else if (actPlayer) {
          results.push({
            field: `Player ${i + 1}`,
            expected: '(missing)',
            actual: `${actPlayer.name} (${actPlayer.position || 'no pos'}) ${actPlayer.stack}`,
            match: false
          });
        }
      }

      setComparisonResults(results);
      setShowComparison(true);
    } catch (error) {
      console.error('Failed to paste and compare:', error);
      alert('❌ Failed to read from clipboard or compare hands');
    }
  };

  const handleCopyFailures = async () => {
    const failures = comparisonResults.filter(r => !r.match);
    if (failures.length === 0) {
      alert('✅ No failures to copy - all fields match!');
      return;
    }

    const failureText = failures
      .map(f => `${f.field}: Expected "${f.expected}" but got "${f.actual}"`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(failureText);
      alert(`✅ Copied ${failures.length} failure(s) to clipboard!`);
    } catch (error) {
      console.error('Failed to copy failures:', error);
      alert('❌ Failed to copy to clipboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-8 mb-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          💰 Pot Calculation Display
        </h1>
        <p className="text-gray-600">
          Clear breakdown of main pot and side pots
        </p>
      </div>

      {/* Total Pot Summary */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 mb-6 text-white shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold opacity-90">Total Pot</div>
          <div className="text-5xl font-black drop-shadow-lg">
            ${totalPot.toLocaleString()}
          </div>
        </div>
        <div className="pt-4 border-t border-white/20 text-sm opacity-95">
          Main Pot: ${mainPot.amount.toLocaleString()}
          {sidePots.map((pot, index) => (
            <span key={index}>
              {' | '}Side Pot {pot.potNumber}: ${pot.amount.toLocaleString()}
            </span>
          ))}
        </div>
      </div>

      {/* Main Pot */}
      <PotCard
        potInfo={mainPot}
        headerColorClasses="bg-gradient-to-br from-yellow-400 to-yellow-500"
      />

      {/* Side Pots */}
      {sidePots.map((sidePot, index) => {
        const colorClasses = index === 0
          ? "bg-gradient-to-br from-blue-400 to-blue-500"
          : "bg-gradient-to-br from-purple-400 to-purple-500";

        return (
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
          <div
            className="flex justify-between items-center cursor-pointer mb-4"
            onClick={() => setIsNextHandExpanded(!isNextHandExpanded)}
          >
            <h3 className="text-2xl font-bold text-purple-900">🔄 Next Hand Generated</h3>
            <svg
              className={`w-6 h-6 text-purple-900 transition-transform duration-300 ${
                isNextHandExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Formatted Hand Display (Always Visible) */}
          <div className="mb-6 bg-white rounded-lg border-2 border-gray-300 p-4">
            <h4 className="text-lg font-bold mb-2 text-gray-700">📋 Formatted Next Hand:</h4>
            <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-gray-900">
              {nextHandFormatted}
            </pre>
          </div>

          {/* Collapsible Player Details */}
          {isNextHandExpanded && (
            <div className="transition-all duration-300 ease-in-out">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {nextHandData.map(player => {
                const breakdown = player.breakdown;
                if (!breakdown) return null;

                return (
                  <div key={player.name} className={`p-4 rounded-lg ${player.stack > 0 ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border-2`}>
                    <div className="font-bold text-lg">{player.name}</div>
                    <div className="text-sm text-gray-600 mb-3">{player.position}</div>

                    {/* Detailed Calculation */}
                    <div className="bg-white rounded-lg p-3 mb-2 text-xs font-mono">
                      <div className="font-bold text-gray-700 mb-2">Stack Calculation:</div>

                      {/* Starting Stack */}
                      <div className="text-gray-900">
                        Starting: <span className="font-bold">{player.previousStack.toLocaleString()}</span>
                      </div>

                      {/* Ante */}
                      {breakdown.anteContribution > 0 && (
                        <div className="text-red-600">
                          - {breakdown.anteContribution.toLocaleString()} (Ante)
                        </div>
                      )}

                      {/* Blind */}
                      {breakdown.blindContribution > 0 && (
                        <div className="text-red-600">
                          - {breakdown.blindContribution.toLocaleString()} ({breakdown.blindType})
                        </div>
                      )}

                      {/* Action */}
                      {breakdown.actionContribution > 0 && (
                        <div className="text-red-600">
                          - {breakdown.actionContribution.toLocaleString()} (Action)
                        </div>
                      )}

                      {/* After Contributions */}
                      <div className="border-t border-gray-300 mt-1 pt-1 text-gray-700">
                        = {(player.previousStack - breakdown.anteContribution - breakdown.totalContribution).toLocaleString()}
                      </div>

                      {/* Winnings */}
                      {breakdown.potWinnings > 0 && (
                        <>
                          <div className="text-green-600 font-bold mt-1">
                            + {breakdown.potWinnings.toLocaleString()} (Won)
                          </div>
                          <div className="border-t-2 border-gray-400 mt-1 pt-1 text-gray-900 font-bold">
                            = {player.stack.toLocaleString()}
                          </div>
                        </>
                      )}

                      {breakdown.potWinnings === 0 && (
                        <div className="border-t-2 border-gray-400 mt-1 pt-1 text-gray-900 font-bold">
                          Final: {player.stack.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Net Change Summary */}
                    <div className={`text-center text-sm font-semibold ${player.netChange > 0 ? 'text-green-700' : player.netChange < 0 ? 'text-red-700' : 'text-gray-600'}`}>
                      Net: {player.netChange > 0 ? '+' : ''}{player.netChange.toLocaleString()}
                    </div>
                  </div>
                );
              })}
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
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleCopyNextHand}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
            >
              📋 Copy Next Hand
            </button>
            <button
              onClick={handleLoadNextHand}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
            >
              🔄 Load Next Hand
            </button>
          </div>

          <div className="mt-6 border-t-2 border-purple-300 pt-6">
            <h4 className="text-lg font-bold mb-4">🔍 Compare with Expected Hand</h4>

            <button
              onClick={handlePasteAndCompare}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md mb-4"
            >
              📋 Paste & Compare
            </button>

            {pastedExpectedHand && (
              <div className="mb-4">
                <label className="font-semibold block mb-2 text-gray-700">Pasted Expected Hand from GS Tool:</label>
                <pre className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {pastedExpectedHand}
                </pre>
                <button
                  onClick={handleLoadGSHand}
                  className="mt-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-md"
                >
                  🔄 Load GS as Next Hand
                </button>
              </div>
            )}

            {showComparison && comparisonResults.length > 0 && (
              <div className="mt-6">
                {/* Summary */}
                <div className={`p-4 rounded-lg mb-4 ${comparisonResults.every(r => r.match) ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{comparisonResults.every(r => r.match) ? '✅' : '❌'}</span>
                      <div>
                        <h3 className="text-lg font-bold">
                          {comparisonResults.every(r => r.match) ? 'Perfect Match!' : 'Differences Found'}
                        </h3>
                        <p className="text-sm">
                          {comparisonResults.filter(r => r.match).length} of {comparisonResults.length} fields match
                          ({Math.round((comparisonResults.filter(r => r.match).length / comparisonResults.length) * 100)}%)
                        </p>
                      </div>
                    </div>
                    {!comparisonResults.every(r => r.match) && (
                      <button
                        onClick={handleCopyFailures}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md whitespace-nowrap"
                      >
                        📋 Copy Failures
                      </button>
                    )}
                  </div>
                </div>

                {/* Detailed Results Table */}
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left font-bold">Field</th>
                        <th className="px-4 py-2 text-left font-bold">Expected</th>
                        <th className="px-4 py-2 text-left font-bold">Actual</th>
                        <th className="px-4 py-2 text-center font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonResults.map((result, index) => (
                        <tr
                          key={index}
                          className={`${result.match ? 'bg-green-50' : 'bg-red-50'} border-t border-gray-300`}
                        >
                          <td className="px-4 py-2 font-medium">{result.field}</td>
                          <td className="px-4 py-2 font-mono">{result.expected}</td>
                          <td className="px-4 py-2 font-mono">{result.actual}</td>
                          <td className="px-4 py-2 text-center">
                            <span className="text-xl">{result.match ? '✅' : '❌'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default PotCalculationDisplay;
