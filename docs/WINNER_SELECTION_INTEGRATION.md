# Winner Selection Integration Guide

This guide shows how to integrate the winner selection modal and next hand generation into your poker app.

---

## Overview

The integration consists of 3 main parts:

1. **Winner Selection Modal** - UI for selecting winners
2. **Next Hand Generator** - Logic to calculate stacks and rotate button
3. **Integration** - Connect everything together

---

## Step 1: Import the Components

```typescript
import { WinnerSelectionModal } from './components/poker/WinnerSelectionModal';
import {
  processWinnersAndGenerateNextHand,
  type Pot,
  type WinnerSelection,
  type NextHandPlayer
} from './lib/poker/engine/nextHandGenerator';
```

---

## Step 2: Add State to Your Pot View Component

```typescript
const [showWinnerModal, setShowWinnerModal] = useState(false);
const [nextHand, setNextHand] = useState<NextHandPlayer[] | null>(null);
const [validationErrors, setValidationErrors] = useState<string[]>([]);
```

---

## Step 3: Add "Select Winners" Button to Pot View

```tsx
{/* In your pot display at the bottom */}
<div className="pot-view-container">
  {/* Show Main Pot */}
  <div className="pot-item">
    <div className="pot-name">Main Pot</div>
    <div className="pot-amount">{mainPot.amount.toLocaleString()}</div>
    <div className="pot-eligible">
      Eligible: {mainPot.eligible.join(', ')}
    </div>
  </div>

  {/* Show Side Pots */}
  {sidePots.map(pot => (
    <div key={pot.name} className="pot-item">
      <div className="pot-name">{pot.name}</div>
      <div className="pot-amount">{pot.amount.toLocaleString()}</div>
      <div className="pot-eligible">
        Eligible: {pot.eligible.join(', ')}
      </div>
    </div>
  ))}

  {/* SELECT WINNERS BUTTON */}
  <button
    onClick={() => setShowWinnerModal(true)}
    className="select-winners-btn"
  >
    🏆 Select Winners
  </button>
</div>
```

---

## Step 4: Add Winner Selection Modal

```tsx
{/* Render modal when showWinnerModal is true */}
{showWinnerModal && (
  <WinnerSelectionModal
    pots={allPots}  // Array of main pot + side pots
    onConfirm={handleWinnersConfirmed}
    onCancel={() => setShowWinnerModal(false)}
  />
)}
```

---

## Step 5: Handle Winner Confirmation

```typescript
const handleWinnersConfirmed = (selections: WinnerSelection[]) => {
  console.log('Winners selected:', selections);

  // Process winners and generate next hand
  const result = processWinnersAndGenerateNextHand(
    currentPlayers,  // Your current players array
    allPots,         // All pots (main + sides)
    selections       // Winner selections from modal
  );

  // Check validation
  if (!result.validation.isValid) {
    setValidationErrors(result.validation.errors);
    console.error('Validation failed:', result.validation.errors);
    return;
  }

  // Validation passed! Show next hand
  setNextHand(result.nextHand);
  setShowWinnerModal(false);

  console.log('✅ Next hand generated:', result.nextHand);
  console.log('New stacks:', result.newStacks);
};
```

---

## Step 6: Display Next Hand

```tsx
{/* Show next hand after winners are processed */}
{nextHand && (
  <div className="next-hand-display">
    <h3>🔄 Next Hand Setup</h3>
    <div className="next-hand-players">
      {nextHand.map(player => (
        <div key={player.name} className="next-hand-player">
          <span className="player-name">{player.name}</span>
          <span className="player-position">{player.position}</span>
          <span className="player-stack">{player.stack.toLocaleString()}</span>
        </div>
      ))}
    </div>

    {/* Copy button for next hand */}
    <button onClick={() => copyNextHandToClipboard(nextHand)}>
      📋 Copy Next Hand
    </button>
  </div>
)}
```

---

## Complete Example Integration

Here's a complete example showing the entire flow:

```typescript
import React, { useState } from 'react';
import { WinnerSelectionModal } from './components/poker/WinnerSelectionModal';
import {
  processWinnersAndGenerateNextHand,
  type Pot,
  type WinnerSelection,
  type NextHandPlayer
} from './lib/poker/engine/nextHandGenerator';

interface PotViewProps {
  players: Player[];
  pots: Pot[];
}

export const PotView: React.FC<PotViewProps> = ({ players, pots }) => {
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [nextHand, setNextHand] = useState<NextHandPlayer[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSelectWinners = () => {
    setShowWinnerModal(true);
  };

  const handleWinnersConfirmed = (selections: WinnerSelection[]) => {
    // Process winners and generate next hand
    const result = processWinnersAndGenerateNextHand(
      players,
      pots,
      selections
    );

    // Validate
    if (!result.validation.isValid) {
      setValidationErrors(result.validation.errors);
      alert('Validation failed: ' + result.validation.errors.join(', '));
      return;
    }

    // Success!
    setNextHand(result.nextHand);
    setShowWinnerModal(false);
    setValidationErrors([]);

    console.log('✅ Next hand generated successfully');
  };

  const copyNextHandToClipboard = (hand: NextHandPlayer[]) => {
    const text = `Next Hand Setup:\n${hand.map(p =>
      `${p.name} ${p.position} ${p.stack.toLocaleString()}`
    ).join('\n')}`;

    navigator.clipboard.writeText(text);
    alert('Next hand copied to clipboard!');
  };

  return (
    <div className="pot-view-container">
      {/* Display Pots */}
      <div className="pots-section">
        <h3>💰 Pot Breakdown</h3>
        {pots.map(pot => (
          <div key={pot.name} className="pot-card">
            <div className="pot-header">
              <span className="pot-name">{pot.name}</span>
              <span className="pot-amount">{pot.amount.toLocaleString()}</span>
              <span className="pot-percentage">({pot.percentage.toFixed(1)}%)</span>
            </div>
            <div className="pot-eligible">
              Eligible: {pot.eligible.join(', ')}
            </div>
          </div>
        ))}
      </div>

      {/* Select Winners Button */}
      {!nextHand && (
        <button
          onClick={handleSelectWinners}
          className="btn-primary btn-lg"
        >
          🏆 Select Winners
        </button>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="error-box">
          <h4>⚠️ Validation Errors:</h4>
          <ul>
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Hand Display */}
      {nextHand && (
        <div className="next-hand-section">
          <h3>🔄 Next Hand Setup</h3>
          <div className="next-hand-grid">
            {nextHand.map(player => (
              <div key={player.name} className="next-hand-card">
                <div className="player-name">{player.name}</div>
                <div className="player-position">{player.position}</div>
                <div className="player-stack">
                  {player.stack.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => copyNextHandToClipboard(nextHand)}
            className="btn-secondary"
          >
            📋 Copy Next Hand
          </button>

          <button
            onClick={() => {
              // Reset for new hand
              setNextHand(null);
              // You would also reset your game state here
            }}
            className="btn-success"
          >
            ▶️ Start Next Hand
          </button>
        </div>
      )}

      {/* Winner Selection Modal */}
      {showWinnerModal && (
        <WinnerSelectionModal
          pots={pots}
          onConfirm={handleWinnersConfirmed}
          onCancel={() => setShowWinnerModal(false)}
        />
      )}
    </div>
  );
};
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  1. User Clicks "Select Winners"                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  2. WinnerSelectionModal Opens                              │
│     - Shows all pots (Main + Sides)                          │
│     - Shows eligible players for each pot                    │
│     - User clicks on player names to select winners          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  3. User Clicks "Confirm Winners & Generate Next Hand"      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  4. processWinnersAndGenerateNextHand()                     │
│     ├─ calculateNewStacks()                                  │
│     │   └─ Award each pot to its winner                      │
│     ├─ generateNextHand()                                    │
│     │   └─ Rotate button, assign new positions               │
│     └─ validateNextHand()                                    │
│         ├─ validateWinnerSelections()                        │
│         ├─ validateButtonRotation()                          │
│         ├─ validateAllPlayersPresent()                       │
│         └─ validateStacksNonNegative()                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  5. If Valid: Display Next Hand                             │
│     If Invalid: Show Errors                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Validation Rules

The system validates:

### ✅ **Winner Selections**
- All pots have winners selected
- Selected winners are eligible for their pots

### ✅ **Button Rotation**
- **2 Players:** Previous BB becomes new SB, Previous SB becomes new BB
- **3+ Players:** Previous SB becomes new Dealer

### ✅ **Player Presence**
- All players from current hand are in next hand
- Including busted players (0 chips)

### ✅ **Stack Values**
- No negative stacks
- Stacks calculated correctly: `final_stack + won_pots`

---

## Example Scenario

**Current Hand:**
```
Alice (Dealer) - 50,000 remaining
Bob (SB) - 0 (all-in)
Charlie (BB) - 0 (all-in)
David (UTG) - 30,000 remaining
```

**Pots:**
```
Main Pot: 60,000 - Eligible: Alice, Bob, Charlie, David
Side Pot 1: 40,000 - Eligible: Alice, David
```

**User Selects:**
```
Main Pot → Alice wins
Side Pot 1 → David wins
```

**New Stacks:**
```
Alice: 50,000 + 60,000 (Main) = 110,000
Bob: 0 + 0 = 0
Charlie: 0 + 0 = 0
David: 30,000 + 40,000 (Side 1) = 70,000
```

**Next Hand:**
```
Bob (Dealer) - 0
Charlie (SB) - 0
David (BB) - 70,000
Alice (UTG) - 110,000
```

---

## API Reference

### `processWinnersAndGenerateNextHand()`

```typescript
function processWinnersAndGenerateNextHand(
  currentPlayers: Player[],
  pots: Pot[],
  winnerSelections: WinnerSelection[]
): {
  nextHand: NextHandPlayer[];
  validation: ValidationResult;
  newStacks: Record<string, number>;
}
```

**Parameters:**
- `currentPlayers` - Array of current players with their remaining stacks
- `pots` - Array of all pots (main + sides) with eligible players
- `winnerSelections` - Array of winner selections (pot → winner mapping)

**Returns:**
- `nextHand` - Array of players for next hand with new positions and stacks
- `validation` - Validation result (isValid + errors array)
- `newStacks` - Map of player names to their new stack amounts

---

## Testing

You can test the integration with the 40 test cases you already have:

```typescript
// Example test
const pots = [
  { name: 'Main Pot', type: 'main', amount: 60000, eligible: ['Alice', 'Bob'], percentage: 60 },
  { name: 'Side Pot 1', type: 'side1', amount: 40000, eligible: ['Alice'], percentage: 40 }
];

const selections = [
  { potName: 'Main Pot', potType: 'main', winnerName: 'Alice' },
  { potName: 'Side Pot 1', potType: 'side1', winnerName: 'Alice' }
];

const result = processWinnersAndGenerateNextHand(players, pots, selections);

console.log('Next hand:', result.nextHand);
console.log('Validation:', result.validation);
```

---

## Summary

✅ **Winner Selection Modal** - User-friendly UI for selecting winners
✅ **Next Hand Generator** - Complete logic with all validations
✅ **Button Rotation** - Proper clockwise rotation (2P, 3P, 4P+)
✅ **Stack Calculation** - Correct new stacks based on winnings
✅ **Full Validation** - All rules from your test case generators

The system is production-ready and matches the logic from your QA test case generators!

