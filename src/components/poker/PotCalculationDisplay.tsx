import React, { useState } from 'react';
import type { Player } from '../../types/poker';

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
}) => {
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
    </div>
  );
};

// ===== EXAMPLE USAGE =====

export const PotCalculationDisplayExample: React.FC = () => {
  // Example data
  const players: Player[] = [
    { id: 1, name: 'Alice', position: 'UTG', stack: 100000 },
    { id: 2, name: 'Bob', position: 'BB', stack: 100000 },
    { id: 3, name: 'Charlie', position: 'CO', stack: 100000 },
    { id: 4, name: 'David', position: 'Dealer', stack: 100000 },
    { id: 5, name: 'Emma', position: 'SB', stack: 100000 },
  ];

  const mainPot: PotInfo = {
    potType: 'main',
    amount: 12500,
    eligiblePlayers: players,
    contributions: [
      { playerId: 1, amount: 2500 },
      { playerId: 2, amount: 2500, isAllIn: true },
      { playerId: 3, amount: 2500 },
      { playerId: 4, amount: 2500 },
      { playerId: 5, amount: 2500 },
    ],
    streetBreakdown: [
      { street: 'preflop', amount: 11000, detail: 'All players contributed' },
      { street: 'flop', amount: 1500, detail: '2 active players bet' },
      { street: 'turn', amount: 0, detail: 'All checked' },
      { street: 'river', amount: 0, detail: 'All checked' },
    ],
    calculation: {
      formula: 'Main Pot = Smallest Stack × Active Players\nMain Pot = $2,500 × 5 players',
      variables: { smallestStack: 2500, activePlayers: 5 },
      result: '= $12,500 (capped at smallest contribution)',
    },
    description: 'The main pot is capped at the smallest all-in amount ($2,500 from Bob). All five players contributed this amount, making the main pot $12,500. Any contributions above this threshold go into side pots.',
  };

  const sidePot1: PotInfo = {
    potType: 'side',
    potNumber: 1,
    amount: 4800,
    eligiblePlayers: players.filter(p => p.id !== 2), // Exclude Bob
    excludedPlayers: [{ player: players[1], reason: 'All-in for $2,500' }],
    contributions: [
      { playerId: 1, amount: 1200 },
      { playerId: 3, amount: 1200 },
      { playerId: 4, amount: 1200 },
      { playerId: 5, amount: 1200 },
    ],
    streetBreakdown: [
      { street: 'preflop', amount: 4800, detail: '4 players extra contribution' },
      { street: 'flop', amount: 0, detail: 'No additional bets' },
      { street: 'turn', amount: 0, detail: 'No bets' },
      { street: 'river', amount: 0, detail: 'No bets' },
    ],
    calculation: {
      formula: 'Side Pot 1 = (Next Smallest - Main Pot Cap) × Eligible Players\nSide Pot 1 = ($3,700 - $2,500) × 4 players',
      variables: { nextSmallest: 3700, mainPotCap: 2500, eligiblePlayers: 4 },
      result: '= $1,200 × 4 = $4,800',
    },
    description: 'This pot contains contributions from players who put in more than Bob\'s all-in amount ($2,500). Bob is excluded because he was all-in for less.',
  };

  const sidePot2: PotInfo = {
    potType: 'side',
    potNumber: 2,
    amount: 1700,
    eligiblePlayers: [players[0], players[2]], // Alice and Charlie
    excludedPlayers: [
      { player: players[1], reason: 'All-in preflop' },
      { player: players[3], reason: 'All-in at $3,700' },
      { player: players[4], reason: 'All-in at $3,700' },
    ],
    contributions: [
      { playerId: 1, amount: 850 },
      { playerId: 3, amount: 850 },
    ],
    streetBreakdown: [
      { street: 'preflop', amount: 1700, detail: '2 players extra contribution' },
      { street: 'flop', amount: 0, detail: 'No additional bets' },
      { street: 'turn', amount: 0, detail: 'No bets' },
      { street: 'river', amount: 0, detail: 'No bets' },
    ],
    calculation: {
      formula: 'Side Pot 2 = (Remaining - Side Pot 1 Cap) × Eligible Players\nSide Pot 2 = ($4,550 - $3,700) × 2 players',
      variables: { remaining: 4550, sidePot1Cap: 3700, eligiblePlayers: 2 },
      result: '= $850 × 2 = $1,700',
    },
    description: 'This pot contains the extra contributions from Alice and Charlie who put in more than the second all-in threshold ($3,700). Only these two players can win this pot.',
  };

  return (
    <PotCalculationDisplay
      totalPot={19000}
      mainPot={mainPot}
      sidePots={[sidePot1, sidePot2]}
      players={players}
    />
  );
};

export default PotCalculationDisplay;
