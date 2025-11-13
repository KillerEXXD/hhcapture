# Pot Display Integration Plan

## Overview

Integrate the existing **PotCalculationDisplay** component (from Pot Demo page) into every street view (Preflop, Flop, Turn, River) to show pot distribution after clicking "Process Stack" when the betting round is complete.

---

## Current Architecture

### Existing Components

1. **`PotCalculationDisplay.tsx`** - Already exists with full pot visualization
   - Location: `src/components/poker/PotCalculationDisplay.tsx`
   - Used in: `src/pages/PotCalculationDemo.tsx`
   - Features:
     - Main pot display with expandable details
     - Side pots (multiple) with calculation formulas
     - Player eligibility indicators
     - Street-by-street contribution breakdown
     - All-in badges and excluded player indicators

2. **Street View Components** - Need integration
   - `PreFlopView.tsx`
   - `FlopView.tsx`
   - `TurnView.tsx`
   - `RiverView.tsx`

3. **Pot Calculation Engine** - Already exists
   - Location: `src/lib/poker/engine/potCalculationEngine.ts`
   - Function: `calculatePotsForBettingRound()`

---

## What Needs to Be Done

### Step 1: Update Pot Calculation Engine

The existing engine (`calculatePotsForBettingRound`) needs to return data in the format expected by `PotCalculationDisplay`.

**Current Return Type** (needs to match `PotInfo` interface):
```typescript
interface PotInfo {
  potType: 'main' | 'side';
  potNumber?: number;
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
```

**Action Required**:
- Enhance `calculatePotsForBettingRound()` to return full `PotInfo` objects
- Add calculation formulas and descriptions
- Track street-by-street contributions
- Identify excluded players with reasons

### Step 2: Add Pot Display State to Each Street

Each street component needs to:
1. Store calculated pot data
2. Show/hide pot display based on "Process Stack" click
3. Only display when betting round is complete

**State to Add** (in each StreetView component):
```typescript
const [potDisplayData, setPotDisplayData] = React.useState<{
  totalPot: number;
  mainPot: PotInfo;
  sidePots: PotInfo[];
  players: Player[];
} | null>(null);

const [showPotDisplay, setShowPotDisplay] = React.useState(false);
```

### Step 3: Modify "Process Stack" Button Handler

When "Process Stack" is clicked AND betting round is complete:

```typescript
const handleProcessStack = () => {
  // Existing process stack logic...
  processStackSynchronous(/* ... */);

  // NEW: Check if betting round is complete
  const isComplete = checkBettingRoundComplete(currentStreet, currentLevel, players, playerData);

  if (isComplete.isComplete) {
    // Calculate pots for this street
    const potData = calculatePotsForBettingRound(
      currentStreet,
      currentLevel,
      players,
      playerData,
      stackData,
      contributedAmounts,
      sectionStacks
    );

    // Store pot data for display
    setPotDisplayData(potData);
    setShowPotDisplay(true);
  } else {
    // Hide pot display if round is not complete
    setShowPotDisplay(false);
  }

  // Update processed state...
  setHasProcessedCurrentState(true);
};
```

### Step 4: Add Pot Display Component to Street Layout

Add the display below the action levels section:

```tsx
{/* Existing action levels... */}
{visibleActionLevels.preflop?.map((level) => (
  <div key={level}>
    {/* Player action rows... */}
  </div>
))}

{/* NEW: Pot Display Section */}
{showPotDisplay && potDisplayData && (
  <div className="mt-8 border-t-4 border-purple-600 pt-6">
    <div className="mb-4">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <span>💰</span>
        <span>Pot Distribution - {currentStreet.toUpperCase()}</span>
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Betting round complete. Current pot breakdown:
      </p>
    </div>

    <PotCalculationDisplay
      totalPot={potDisplayData.totalPot}
      mainPot={potDisplayData.mainPot}
      sidePots={potDisplayData.sidePots}
      players={potDisplayData.players}
    />
  </div>
)}

{/* Buttons section... */}
```

---

## Detailed Implementation Steps

### **1. Enhance Pot Calculation Engine**

**File**: `src/lib/poker/engine/potCalculationEngine.ts`

**Add New Functions**:

```typescript
/**
 * Format pot data for display component
 */
export function formatPotDataForDisplay(
  street: 'preflop' | 'flop' | 'turn' | 'river',
  players: Player[],
  contributedAmounts: Record<number, Record<string, number>>,
  pots: Array<{
    amount: number;
    eligiblePlayerIds: number[];
    level: number;
    type: 'main' | 'side';
  }>
): {
  totalPot: number;
  mainPot: PotInfo;
  sidePots: PotInfo[];
  players: Player[];
} {
  // Calculate total pot
  const totalPot = pots.reduce((sum, pot) => sum + pot.amount, 0);

  // Format main pot
  const mainPotData = pots[0];
  const mainPot: PotInfo = {
    potType: 'main',
    amount: mainPotData.amount,
    eligiblePlayers: players.filter(p => mainPotData.eligiblePlayerIds.includes(p.id)),
    contributions: mainPotData.eligiblePlayerIds.map(playerId => ({
      playerId: playerId,
      amount: calculatePlayerContribution(playerId, street, contributedAmounts),
      isAllIn: checkIfPlayerAllIn(playerId, players),
    })),
    streetBreakdown: buildStreetBreakdown(mainPotData.eligiblePlayerIds, contributedAmounts),
    calculation: generateMainPotCalculation(mainPotData, players),
    description: generateMainPotDescription(mainPotData, players),
  };

  // Format side pots
  const sidePots: PotInfo[] = pots.slice(1).map((pot, index) => ({
    potType: 'side',
    potNumber: index + 1,
    amount: pot.amount,
    eligiblePlayers: players.filter(p => pot.eligiblePlayerIds.includes(p.id)),
    excludedPlayers: buildExcludedPlayersList(pot, players, pots[index]),
    contributions: pot.eligiblePlayerIds.map(playerId => ({
      playerId: playerId,
      amount: calculateSidePotContribution(playerId, pot.level, pots[index].level, contributedAmounts),
    })),
    streetBreakdown: buildStreetBreakdown(pot.eligiblePlayerIds, contributedAmounts),
    calculation: generateSidePotCalculation(pot, pots[index], players),
    description: generateSidePotDescription(pot, players, index + 1),
  }));

  return {
    totalPot,
    mainPot,
    sidePots,
    players,
  };
}

/**
 * Generate calculation formula for main pot
 */
function generateMainPotCalculation(
  pot: { amount: number; level: number; eligiblePlayerIds: number[] },
  players: Player[]
): PotInfo['calculation'] {
  const numPlayers = pot.eligiblePlayerIds.length;
  const perPlayer = pot.level;

  return {
    formula: `Main Pot = Smallest Stack × Active Players\nMain Pot = $${perPlayer.toLocaleString()} × ${numPlayers} players`,
    variables: {
      smallestStack: perPlayer,
      activePlayers: numPlayers,
    },
    result: `= $${pot.amount.toLocaleString()} (capped at smallest contribution)`,
  };
}

/**
 * Build street-by-street contribution breakdown
 */
function buildStreetBreakdown(
  eligiblePlayerIds: number[],
  contributedAmounts: Record<number, Record<string, number>>
): StreetContribution[] {
  const streets: Array<'preflop' | 'flop' | 'turn' | 'river'> = ['preflop', 'flop', 'turn', 'river'];

  return streets.map(street => {
    let amount = 0;
    for (const playerId of eligiblePlayerIds) {
      const contributions = contributedAmounts[playerId] || {};
      // Sum contributions for this street across all action levels
      for (const key in contributions) {
        if (key.startsWith(street)) {
          amount += contributions[key] || 0;
        }
      }
    }

    return {
      street: street,
      amount: amount,
      detail: generateStreetDetail(street, amount, eligiblePlayerIds.length),
    };
  });
}

/**
 * Generate detail text for street contribution
 */
function generateStreetDetail(
  street: string,
  amount: number,
  numPlayers: number
): string {
  if (amount === 0) return 'No contributions';
  return `${numPlayers} player${numPlayers !== 1 ? 's' : ''} contributed`;
}

/**
 * Build excluded players list for side pot
 */
function buildExcludedPlayersList(
  currentPot: { eligiblePlayerIds: number[]; level: number },
  players: Player[],
  previousPot: { level: number }
): Array<{ player: Player; reason: string }> {
  const excluded: Array<{ player: Player; reason: string }> = [];

  for (const player of players) {
    if (!currentPot.eligiblePlayerIds.includes(player.id)) {
      // Player is excluded - determine reason
      const reason = player.stack === 0
        ? `All-in for $${previousPot.level.toLocaleString()}`
        : 'Folded';

      excluded.push({ player, reason });
    }
  }

  return excluded;
}
```

### **2. Update Street View Components**

Apply to all 4 street views: `PreFlopView.tsx`, `FlopView.tsx`, `TurnView.tsx`, `RiverView.tsx`

**Changes Required**:

#### A. Add Import
```typescript
import { PotCalculationDisplay } from '../poker/PotCalculationDisplay';
import type { PotInfo } from '../poker/PotCalculationDisplay';
```

#### B. Add State
```typescript
const [potDisplayData, setPotDisplayData] = React.useState<{
  totalPot: number;
  mainPot: PotInfo;
  sidePots: PotInfo[];
  players: Player[];
} | null>(null);

const [showPotDisplay, setShowPotDisplay] = React.useState(false);
```

#### C. Modify Process Stack Handler
```typescript
const handleProcessStack = () => {
  console.log('🔄 [PreFlopView] Process Stack clicked');

  // Get current action level
  const currentLevels = visibleActionLevels.preflop || ['base'];
  const currentLevel = currentLevels[currentLevels.length - 1];

  // Process stack
  const { validatedData, newSectionStacks, totalContributed } = processStackSynchronous(
    'preflop',
    currentLevel,
    players,
    playerData,
    stackData,
    contributedAmounts,
    sectionStacks
  );

  // Update state
  setPlayerData(validatedData);
  setSectionStacks(newSectionStacks);
  setContributedAmounts(totalContributed);

  // Store hash for change detection
  const currentDataHash = JSON.stringify(
    players.filter(p => p.name).map(p => {
      const data = validatedData[p.id] || {};
      return {
        id: p.id,
        preflopAction: data.preflopAction,
        preflopAmount: data.preflopAmount,
        // ... other fields
      };
    })
  );
  setLastProcessedPlayerDataHash(currentDataHash);

  // Check if betting round is complete
  const isComplete = checkBettingRoundComplete('preflop', currentLevel, players, validatedData);

  console.log(`✅ [PreFlopView] Round complete: ${isComplete.isComplete}, Reason: ${isComplete.reason}`);

  // NEW: Calculate and show pot display if round is complete
  if (isComplete.isComplete) {
    const potData = potCalculation.calculatePotsForDisplay(
      'preflop',
      currentLevel,
      players,
      validatedData,
      stackData,
      totalContributed,
      newSectionStacks
    );

    console.log('💰 [PreFlopView] Pot data calculated:', potData);

    setPotDisplayData(potData);
    setShowPotDisplay(true);
  } else {
    // Hide pot display if round becomes incomplete
    setShowPotDisplay(false);
  }

  // Mark as processed
  setHasProcessedCurrentState(true);

  // Calculate and store pots
  const calculatedPots = calculatePotsForBettingRound(
    'preflop',
    currentLevel,
    players,
    validatedData,
    stackData,
    totalContributed,
    newSectionStacks
  );
  setPotsByStage((prev) => ({
    ...prev,
    preflop: calculatedPots,
  }));

  // Return focus
  setTimeout(() => {
    returnFocusAfterProcessStack('preflop', currentLevel, players);
  }, 100);
};
```

#### D. Add Pot Display to Render

**IMPORTANT**: Pot display should be at the **very bottom** of the page, below ALL action levels (base, more action 1, more action 2) and below all buttons.

```tsx
return (
  <div className="min-h-screen p-4">
    {/* Existing header and player cards... */}

    {/* Action levels: Base, More Action 1, More Action 2 */}
    {visibleActionLevels.preflop?.map((level) => (
      <div key={level}>
        {/* Existing action rows... */}
      </div>
    ))}

    {/* Existing buttons: Process Stack, Add More Action, Create Next Street, etc. */}
    <div className="flex gap-4 mt-6">
      {/* All existing buttons... */}
    </div>

    {/* NEW: Pot Display Section - AT THE VERY BOTTOM */}
    {showPotDisplay && potDisplayData && (
      <div className="mt-8 mb-8">
        {/* Section Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl p-4 border-b-4 border-yellow-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Pot Distribution
                </h2>
                <p className="text-sm text-white/90 mt-1">
                  PREFLOP betting round complete
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPotDisplay(false)}
              className="text-white hover:text-red-200 transition-colors"
              title="Hide pot display"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Pot Display Component */}
        <div className="bg-gray-100 rounded-b-xl p-6">
          <PotCalculationDisplay
            totalPot={potDisplayData.totalPot}
            mainPot={potDisplayData.mainPot}
            sidePots={potDisplayData.sidePots}
            players={potDisplayData.players}
          />
        </div>
      </div>
    )}

    {/* End of page */}
  </div>
);
```

### **3. Update usePotCalculation Hook**

**File**: `src/hooks/usePotCalculation.ts`

Add new method:
```typescript
export interface UsePotCalculationReturn {
  // Existing methods...
  calculatePotsForBettingRound: (/* ... */) => void;

  // NEW: Method for display component
  calculatePotsForDisplay: (
    street: 'preflop' | 'flop' | 'turn' | 'river',
    level: ActionLevel,
    players: Player[],
    playerData: Record<number, PlayerData>,
    stackData: Record<number, number>,
    contributedAmounts: Record<number, Record<string, number>>,
    sectionStacks: Record<string, Record<number, number>>
  ) => {
    totalPot: number;
    mainPot: PotInfo;
    sidePots: PotInfo[];
    players: Player[];
  } | null;
}

// In the hook implementation:
const calculatePotsForDisplay = useCallback((
  street: 'preflop' | 'flop' | 'turn' | 'river',
  level: ActionLevel,
  players: Player[],
  playerData: Record<number, PlayerData>,
  stackData: Record<number, number>,
  contributedAmounts: Record<number, Record<string, number>>,
  sectionStacks: Record<string, Record<number, number>>
) => {
  // Call existing pot calculation
  const pots = calculatePotsForBettingRound(
    street,
    level,
    players,
    playerData,
    stackData,
    contributedAmounts,
    sectionStacks
  );

  if (!pots) return null;

  // Format for display
  return formatPotDataForDisplay(street, players, contributedAmounts, pots);
}, [/* dependencies */]);

return {
  // ... existing return values
  calculatePotsForDisplay,
};
```

---

## Visual Flow

### Before Process Stack:
```
┌─────────────────────────────────────────────┐
│ PREFLOP                                      │
├─────────────────────────────────────────────┤
│ === PREFLOP BASE ===                         │
│ Player 1: [Cards] Raise  $500               │
│ Player 2: [Cards] Call   $500               │
│ Player 3: [Cards] Fold                      │
├─────────────────────────────────────────────┤
│ === PREFLOP MORE ACTION 1 ===                │
│ Player 1: [Cards] Raise  $1000              │
│ Player 2: [Cards] Call   $1000              │
├─────────────────────────────────────────────┤
│ [Process Stack] [Add More Action]           │
│ [Create Next Street: Flop]                  │
└─────────────────────────────────────────────┘
```

### After Process Stack (Round Complete):
```
┌─────────────────────────────────────────────┐
│ PREFLOP                                      │
├─────────────────────────────────────────────┤
│ === PREFLOP BASE ===                         │
│ Player 1: [Cards] Raise  $500               │
│ Player 2: [Cards] Call   $500               │
│ Player 3: [Cards] Fold                      │
├─────────────────────────────────────────────┤
│ === PREFLOP MORE ACTION 1 ===                │
│ Player 1: [Cards] Raise  $1000              │
│ Player 2: [Cards] Call   $1000              │
├─────────────────────────────────────────────┤
│ [Process Stack] [Add More Action]           │
│ [Create Next Street: Flop]                  │
├─────────────────────────────────────────────┤
│                                              │
│ 💰 POT DISTRIBUTION                          │
│ PREFLOP betting round complete               │
├─────────────────────────────────────────────┤
│ ╔════════════════════════════════════════╗  │
│ ║ Total Pot: $2,050                      ║  │
│ ╠════════════════════════════════════════╣  │
│ ║ 🏆 Main Pot: $2,050 (100%)             ║  │
│ ║ Eligible: Player 1, Player 2           ║  │
│ ║ [Click to expand calculation]          ║  │
│ ╚════════════════════════════════════════╝  │
│                                              │
│ (Last section on the page)                  │
└─────────────────────────────────────────────┘
```

### With Side Pots (Expanded):
```
┌──────────────────────────────────────────────┐
│ 💰 POT DISTRIBUTION                           │
│ FLOP betting round complete                   │
├──────────────────────────────────────────────┤
│ ╔═══════════════════════════════════════╗    │
│ ║ Total Pot: $3,500                     ║    │
│ ╠═══════════════════════════════════════╣    │
│ ║ 🏆 Main Pot: $2,000 (57%)   [▼]      ║    │
│ ║ Eligible: P1, P2, P3                  ║    │
│ ║                                       ║    │
│ ║ ┌───────────────────────────────────┐ ║    │
│ ║ │ 📊 How this pot was calculated    │ ║    │
│ ║ │ Main Pot = $500 × 4 players       │ ║    │
│ ║ │ = $2,000                          │ ║    │
│ ║ │                                   │ ║    │
│ ║ │ 📈 Contributions by Street        │ ║    │
│ ║ │ Preflop: $1,200                   │ ║    │
│ ║ │ Flop:    $800                     │ ║    │
│ ║ └───────────────────────────────────┘ ║    │
│ ╚═══════════════════════════════════════╝    │
│                                              │
│ ╔═══════════════════════════════════════╗    │
│ ║ 💼 Side Pot 1: $1,500 (43%)  [▼]     ║    │
│ ║ Eligible: P1, P3                      ║    │
│ ║ Excluded: P2 (All-in for $500)        ║    │
│ ║                                       ║    │
│ ║ ┌───────────────────────────────────┐ ║    │
│ ║ │ Side Pot 1 = ($1,250 - $500) × 2  │ ║    │
│ ║ │ = $750 × 2 = $1,500               │ ║    │
│ ║ └───────────────────────────────────┘ ║    │
│ ╚═══════════════════════════════════════╝    │
└──────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Pot Calculation Engine Enhancement
- [ ] Create `formatPotDataForDisplay()` function
- [ ] Add `generateMainPotCalculation()` helper
- [ ] Add `generateSidePotCalculation()` helper
- [ ] Add `buildStreetBreakdown()` helper
- [ ] Add `buildExcludedPlayersList()` helper
- [ ] Add formula generation for each pot type
- [ ] Add description generation for each pot type

### Phase 2: Hook Updates
- [ ] Add `calculatePotsForDisplay()` to `usePotCalculation` hook
- [ ] Test hook with sample data

### Phase 3: PreFlop Integration
- [ ] Add pot display state to PreFlopView
- [ ] Modify `handleProcessStack` to calculate pot data
- [ ] Add pot display component to render
- [ ] Style pot display section
- [ ] Test with various scenarios (no all-ins, single all-in, multiple all-ins)

### Phase 4: Flop Integration
- [ ] Repeat Phase 3 for FlopView
- [ ] Test cumulative pot calculation (preflop + flop)

### Phase 5: Turn Integration
- [ ] Repeat Phase 3 for TurnView
- [ ] Test cumulative pot calculation (preflop + flop + turn)

### Phase 6: River Integration
- [ ] Repeat Phase 3 for RiverView
- [ ] Test final pot calculation (all streets)

### Phase 7: Testing & Polish
- [ ] Test simple scenario (no all-ins)
- [ ] Test one all-in scenario
- [ ] Test multiple all-ins (2-3 side pots)
- [ ] Test fold scenarios
- [ ] Test all players fold except one
- [ ] Add loading state during calculation
- [ ] Add error handling for invalid data
- [ ] Optimize performance for large player counts

---

## Key Features

### 1. **Conditional Display**
- Only shows when "Process Stack" is clicked
- Only shows when betting round is complete
- Can be hidden by clicking X button

### 2. **Expandable Details**
- Click pot header to expand/collapse
- Shows calculation formula
- Shows street-by-street breakdown
- Shows excluded players with reasons

### 3. **Visual Indicators**
- All-in badges for players
- Excluded player styling (grayed out)
- Color-coded pots (Main = gold, Side 1 = blue, Side 2 = purple)
- Player avatars with first letter

### 4. **Informative**
- Formula shows exact calculation
- Percentages show pot distribution
- Descriptions explain eligibility rules

---

## Benefits

1. **Immediate Feedback**: Players see pot breakdown as soon as round completes
2. **Educational**: Shows how pots are calculated step-by-step
3. **Validation**: Confirms all contributions are accounted for
4. **Debugging**: Helps identify calculation errors
5. **UX**: Maintains context - pot display stays within the street view

---

**END OF PLAN**
