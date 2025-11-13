# Winner Selection & Next Hand Generation - Complete Implementation Plan

## Overview

This document outlines the complete implementation of winner selection and next hand generation features for the poker hand history tool.

---

## Requirements Summary

### 1. **Select Winners Button**
- Display below the pot calculation display (Main Pot and Side Pots)
- Opens winner selection modal when clicked

### 2. **Winner Selection Modal**
- Based on the prototype in `public/winner-selection-demo.html`
- Load Main Pot and Side Pot data from pot calculation
- Display eligible players for each pot
- Allow selection of one winner per pot
- Show selection summary
- Validate all pots have winners before proceeding

### 3. **Next Hand Generation**
- Use existing `processWinnersAndGenerateNextHand()` function from `nextHandGenerator.ts`
- Apply ALL validations from QA specs:
  - ✅ All pots have winners
  - ✅ Winners are eligible for their pots
  - ✅ Button rotation is correct (2P vs 3P+ rules)
  - ✅ All players present (including busted players)
  - ✅ No negative stacks
- **Position Rules**: Only show positions for Dealer, SB, BB (not UTG, CO, etc.)
- **Button Rotation**: Follow spec rules for 2P vs 3P+
- **Stack Calculation**: new_stack = final_stack + won_pots

### 4. **Next Hand Display**
- Show generated next hand in 4-line header format:
  ```
  Hand (2)
  started_at: 00:05:40 ended_at: HH:MM:SS
  SB 500 BB 1000 Ante 1000
  Stack Setup:
  Bob Dealer 24,500
  Charlie SB 0
  David BB 51,000
  Alice 124,500
  ```
- Include busted players (stack = 0)
- Use commas for number formatting

### 5. **Copy Next Hand Button**
- Copy formatted next hand to clipboard
- Store in `state.generatedNextHand` for "Load Next Hand" button

### 6. **Hand Comparison Feature**
- Add textarea labeled "Paste from GS" (Google Sheets)
- "Paste from Clipboard" button that reads clipboard
- Trim quotes from start/end if present
- **Compare Button** that compares:
  - Hand number
  - Start time
  - End time
  - SB, BB, Ante
  - Player names
  - Player positions
  - Player stacks
- Display comparison results in a table below:
  - Field name
  - Expected value
  - Actual value
  - Match status (✅ or ❌)
  - Overall match percentage

---

## Architecture

### Component Structure

```
RiverView.tsx
  └─> PotCalculationDisplay.tsx (ENHANCED)
        ├─> Display Main Pot & Side Pots
        ├─> "🏆 Select Winners" Button
        ├─> WinnerSelectionModal (when button clicked)
        │     ├─> Pot selection cards (Main, Side 1, Side 2...)
        │     ├─> Player buttons (only eligible players)
        │     ├─> Selection summary
        │     └─> "Confirm Winners & Generate Next Hand" Button
        │
        └─> Next Hand Display (after generation)
              ├─> Player cards with new stacks
              ├─> Validation status
              ├─> "📋 Copy Next Hand" Button
              ├─> Hand Comparison Section
              │     ├─> Generated hand display (read-only)
              │     ├─> "Paste from GS" textarea
              │     ├─> "📋 Paste from Clipboard" Button
              │     ├─> "🔍 Compare Hands" Button
              │     └─> Comparison results table
              └─> Integration with state.generatedNextHand
```

### Data Flow

```
1. User clicks "Select Winners"
   → Opens WinnerSelectionModal
   → Loads pots from pot calculation

2. User selects winner for each pot
   → Updates selection state
   → Shows real-time summary

3. User clicks "Confirm Winners & Generate Next Hand"
   → Validates all pots have winners
   → Calls processWinnersAndGenerateNextHand()
   → Generates next hand with validations
   → Closes modal
   → Shows next hand display

4. User clicks "Copy Next Hand"
   → Formats next hand in 4-line format
   → Copies to clipboard
   → Stores in state.generatedNextHand

5. User navigates to Stack Setup → clicks "Load Next Hand"
   → Checks state.generatedNextHand
   → Loads automatically (no clipboard needed)
   → Auto-fills SB, BB, Ante from line 3
```

---

## Implementation Details

### 1. Enhance PotCalculationDisplay Component

**File**: `src/components/poker/PotCalculationDisplay.tsx`

**Add Props**:
```typescript
interface PotCalculationDisplayProps {
  totalPot: number;
  mainPot: PotInfo;
  sidePots: PotInfo[];
  players: Player[];

  // NEW: Add state management props
  currentPlayers: Player[];  // For next hand generation
  stackData: GameConfig;     // For hand number, SB, BB, Ante
  actions: GameStateActions; // For setGeneratedNextHand
}
```

**Add State**:
```typescript
const [showWinnerModal, setShowWinnerModal] = useState(false);
const [winnerSelections, setWinnerSelections] = useState<WinnerSelection[]>([]);
const [nextHandData, setNextHandData] = useState<NextHandPlayer[] | null>(null);
const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
const [comparisonHand, setComparisonHand] = useState('');
const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
```

**Add UI Sections**:
1. "Select Winners" button after pot display
2. WinnerSelectionModal integration
3. Next hand display section
4. Hand comparison section

### 2. Integrate WinnerSelectionModal

**File**: `src/components/poker/WinnerSelectionModal.tsx` (already exists)

**Required Changes**:
- Accept pots as props (Main Pot + Side Pots)
- Dynamically generate eligible player buttons per pot
- Track selections per pot
- Validate before confirming
- Pass selections back via onConfirm callback

### 3. Next Hand Generation Logic

**Use Existing**: `src/lib/poker/engine/nextHandGenerator.ts`

**Function Call**:
```typescript
const { nextHand, validation, newStacks } = processWinnersAndGenerateNextHand(
  currentPlayers,
  pots,
  winnerSelections
);
```

**Format Output Using**:
```typescript
import { formatNextHandOutput } from '../../lib/poker/utils/handFormatParser';

const handNumber = parseInt(state.stackData.handNumber?.replace(/[^0-9]/g, '') || '1') + 1;
const nextHandFormatted = formatNextHandOutput(
  nextHand,
  handNumber,
  state.stackData.startedAt || '00:00:00',
  state.stackData.smallBlind,
  state.stackData.bigBlind,
  state.stackData.ante
);
```

**Position Filtering**:
The `formatNextHandOutput` function already handles this - it only outputs positions for Dealer, SB, BB (see lines 190-198 in handFormatParser.ts)

### 4. Copy to Clipboard & State Integration

```typescript
const handleCopyNextHand = () => {
  if (!nextHandData) return;

  // Format next hand
  const formatted = formatNextHandOutput(...);

  // Copy to clipboard
  navigator.clipboard.writeText(formatted);

  // Store in global state for "Load Next Hand" button
  actions.setGeneratedNextHand(formatted);

  alert('✅ Next hand copied to clipboard and ready to load!');
};
```

### 5. Hand Comparison Implementation

**Compare Function**:
```typescript
const compareHands = () => {
  const generated = parseHandFormat(generatedNextHandFormatted);
  const expected = parseHandFormat(comparisonHand.replace(/^["']|["']$/g, '')); // Trim quotes

  const results: ComparisonResult[] = [];

  // Compare hand number
  results.push({
    field: 'Hand Number',
    expected: expected.header.handNumber,
    actual: generated.header.handNumber,
    match: expected.header.handNumber === generated.header.handNumber
  });

  // Compare start time, end time, SB, BB, Ante
  // ... (similar to HandComparisonModal.tsx)

  // Compare each player name, position, stack
  // ...

  setComparisonResults(results);
};
```

**Display Results**:
- Table with columns: Field | Expected | Actual | Status
- Green rows for matches, red for mismatches
- Summary card showing X of Y fields match (percentage)

---

## UI Design

### Select Winners Button
```tsx
<button
  onClick={() => setShowWinnerModal(true)}
  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold py-4 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg flex items-center justify-center text-lg"
>
  🏆 Select Winners
</button>
```

### Next Hand Display
```tsx
{nextHandData && (
  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-6">
    <h3 className="text-2xl font-bold text-purple-900 mb-4">
      🔄 Next Hand Generated
    </h3>

    {/* Player cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {nextHandData.map(player => (
        <div className={`p-4 rounded-lg ${player.stack > 0 ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border-2`}>
          <div className="font-bold text-lg">{player.name}</div>
          <div className="text-sm">{player.position}</div>
          <div className="text-2xl font-mono">{player.stack.toLocaleString()}</div>
        </div>
      ))}
    </div>

    {/* Validation status */}
    {validationResult && (
      <div className={`p-4 rounded-lg mb-4 ${validationResult.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
        {validationResult.isValid ? '✅ All validations passed' : '❌ Validation errors'}
      </div>
    )}

    {/* Copy button */}
    <button onClick={handleCopyNextHand}>
      📋 Copy Next Hand
    </button>

    {/* Comparison section */}
    <div className="mt-6 border-t-2 border-purple-300 pt-6">
      <h4 className="text-lg font-bold mb-4">🔍 Compare with Expected Hand</h4>

      {/* Generated hand (read-only) */}
      <div className="mb-4">
        <label className="font-semibold">Generated Hand:</label>
        <pre className="bg-white p-4 rounded border">{nextHandFormatted}</pre>
      </div>

      {/* Paste from GS */}
      <div className="mb-4">
        <label className="font-semibold">Paste from GS (Google Sheets):</label>
        <textarea
          value={comparisonHand}
          onChange={(e) => setComparisonHand(e.target.value)}
          className="w-full p-4 border rounded font-mono"
          rows={10}
          placeholder="Paste expected hand here..."
        />
        <button onClick={handlePasteFromClipboard}>
          📋 Paste from Clipboard
        </button>
      </div>

      {/* Compare button */}
      <button onClick={compareHands}>
        🔍 Compare Hands
      </button>

      {/* Results table */}
      {comparisonResults.length > 0 && (
        <table className="w-full mt-4 border">
          <thead>
            <tr className="bg-gray-200">
              <th>Field</th>
              <th>Expected</th>
              <th>Actual</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {comparisonResults.map((result, idx) => (
              <tr key={idx} className={result.match ? 'bg-green-50' : 'bg-red-50'}>
                <td>{result.field}</td>
                <td>{result.expected}</td>
                <td>{result.actual}</td>
                <td>{result.match ? '✅' : '❌'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
)}
```

---

## Testing Checklist

### Winner Selection
- [ ] Button appears below pot display
- [ ] Modal opens with correct pots
- [ ] Only eligible players shown per pot
- [ ] Selection updates summary in real-time
- [ ] Validation prevents confirming without all winners selected
- [ ] Validation prevents selecting ineligible winners

### Next Hand Generation
- [ ] Correct button rotation (2P vs 3P+)
- [ ] Only Dealer/SB/BB positions shown
- [ ] Busted players (0 chips) included
- [ ] Stack calculations correct
- [ ] All validations pass

### Copy & Load
- [ ] Copy button copies formatted hand
- [ ] Stores in state.generatedNextHand
- [ ] "Load Next Hand" button finds it
- [ ] Auto-fills SB, BB, Ante from line 3

### Hand Comparison
- [ ] Paste from clipboard works
- [ ] Trims quotes from pasted data
- [ ] Compares all fields correctly
- [ ] Shows green/red visual indicators
- [ ] Match percentage calculates correctly

---

## Integration Points

### RiverView.tsx
Pass additional props to PotCalculationDisplay:
```typescript
<PotCalculationDisplay
  totalPot={potDisplayData.totalPot}
  mainPot={potDisplayData.mainPot}
  sidePots={potDisplayData.sidePots}
  players={potDisplayData.players}
  currentPlayers={state.players}  // NEW
  stackData={state.stackData}     // NEW
  actions={actions}               // NEW
/>
```

### StackSetupView.tsx
Already has the smart "Load Next Hand" button that checks `state.generatedNextHand` first!

---

## File Changes Summary

### Files to Modify
1. **src/components/poker/PotCalculationDisplay.tsx**
   - Add winner selection button
   - Integrate WinnerSelectionModal
   - Add next hand display
   - Add hand comparison section
   - Connect to state.generatedNextHand

2. **src/components/poker/WinnerSelectionModal.tsx**
   - Update to accept dynamic pots
   - Generate eligible player buttons dynamically

3. **src/components/game/RiverView.tsx**
   - Pass additional props to PotCalculationDisplay

### Files Already Complete
- ✅ `src/lib/poker/engine/nextHandGenerator.ts` - All logic exists
- ✅ `src/lib/poker/utils/handFormatParser.ts` - Position filtering done
- ✅ `src/hooks/useGameState.ts` - generatedNextHand state added
- ✅ `src/components/StackSetupView.tsx` - Load Next Hand button ready
- ✅ `src/components/poker/HandComparisonModal.tsx` - Can reuse comparison logic

---

## Summary

This implementation brings together:
1. ✅ **Prototype UI** from `winner-selection-demo.html`
2. ✅ **Business logic** from `nextHandGenerator.ts`
3. ✅ **Specifications** from QA docs
4. ✅ **State management** from `useGameState.ts`
5. ✅ **Parser utilities** from `handFormatParser.ts`

The result will be a complete, validated, production-ready winner selection and next hand generation system that matches all QA test requirements.
