# Process Stack Requirement Feature

## Overview

This document describes the implementation of the Process Stack requirement, which ensures users must click "Process Stack" before the "Add More Action" or "Create Next Street" buttons become enabled.

## Feature Requirements

**RULE**: The "Add More Action" and "Create Next Street" buttons should be:
- **DISABLED** until "Process Stack" is clicked for the current state
- **DISABLED AGAIN** if the user changes any playerData after processing
- **ENABLED** only after "Process Stack" is clicked (and round completion rules are satisfied)

This ensures proper workflow and prevents users from advancing without validating and calculating stacks.

## User Workflow

### Normal Flow

1. User enters player actions (bet, call, raise, etc.)
2. Buttons remain **DISABLED** (both "Add More Action" and "Create Next Street")
3. User clicks **"Process Stack"**
   - System validates actions
   - System calculates stacks and pots
   - System saves current state hash
4. Buttons become **ENABLED** (based on round completion status)
5. User can now:
   - Click "Add More Action" (if round incomplete)
   - Click "Create Next Street" (if round complete)

### Change Detection Flow

1. User has already processed current state
2. User changes any player action or amount
3. System detects change via hash comparison
4. Buttons become **DISABLED AGAIN**
5. User must click "Process Stack" to re-enable buttons

## Implementation

### Files Modified

1. **PreFlopView.tsx**
2. **FlopView.tsx**
3. **TurnView.tsx**
4. **RiverView.tsx**

All four view components were updated with identical logic.

### State Management

#### New State Variables

```typescript
// State for tracking if current section has been processed
const [hasProcessedCurrentState, setHasProcessedCurrentState] = useState(false);

// State for tracking last processed playerData to detect changes
const [lastProcessedPlayerDataHash, setLastProcessedPlayerDataHash] = useState<string>('');
```

**Initial Values**:
- `hasProcessedCurrentState`: `false` (buttons start disabled)
- `lastProcessedPlayerDataHash`: `''` (empty string, no hash yet)

#### Hash Calculation

The hash is a JSON stringified version of relevant playerData for the current street:

```typescript
// Example for FlopView
const flopDataHash = JSON.stringify(
  players.map(p => {
    const data = playerData[p.id] || {};
    return {
      id: p.id,
      flopAction: data.flopAction,
      flopAmount: data.flopAmount,
      flopUnit: data.flopUnit,
      flop_moreActionAction: data.flop_moreActionAction,
      flop_moreActionAmount: data.flop_moreActionAmount,
      flop_moreActionUnit: data.flop_moreActionUnit,
      flop_moreAction2Action: data.flop_moreAction2Action,
      flop_moreAction2Amount: data.flop_moreAction2Amount,
      flop_moreAction2Unit: data.flop_moreAction2Unit,
    };
  })
);
```

**Why JSON.stringify?**
- Creates a unique string representation of the current state
- Easy to compare for changes
- Captures all relevant player actions and amounts

### useEffect Hooks

#### Change Detection Hook

Detects when playerData changes and invalidates processed state:

```typescript
React.useEffect(() => {
  const currentLevels = visibleActionLevels.flop || ['base'];

  // Create hash of current playerData
  const flopDataHash = JSON.stringify(...);

  // If playerData changed, invalidate processed state
  if (lastProcessedPlayerDataHash && flopDataHash !== lastProcessedPlayerDataHash) {
    console.log('🔄 [FlopView] PlayerData changed, invalidating processed state');
    setHasProcessedCurrentState(false);
  }
}, [playerData, players, lastProcessedPlayerDataHash]);
```

**Dependencies**: `[playerData, players, lastProcessedPlayerDataHash]`

**Logic**:
- Only invalidates if `lastProcessedPlayerDataHash` is not empty (i.e., was processed before)
- Compares current hash with last processed hash
- Sets `hasProcessedCurrentState = false` if different

#### Button State Update Hook

Updates button disabled states based on processed state and round completion:

```typescript
React.useEffect(() => {
  const currentLevels = visibleActionLevels.flop || ['base'];
  const currentLevel = currentLevels[currentLevels.length - 1];
  const isRoundComplete = checkBettingRoundComplete('flop', currentLevel, players, playerData);

  console.log(`🔄 [FlopView useEffect] Current level: ${currentLevel}, Round complete: ${isRoundComplete.isComplete}, Processed: ${hasProcessedCurrentState}`);

  // "Add More Action" is disabled when round is complete OR when state hasn't been processed
  setIsAddMoreActionDisabled(isRoundComplete.isComplete || !hasProcessedCurrentState);

  // "Create Next Street" is disabled when round is incomplete OR when state hasn't been processed
  setIsCreateNextStreetDisabled(!isRoundComplete.isComplete || !hasProcessedCurrentState);
}, [playerData, visibleActionLevels.flop, players, hasProcessedCurrentState]);
```

**Dependencies**: `[playerData, visibleActionLevels, players, hasProcessedCurrentState]`

**Button Logic**:
- **"Add More Action"**: `disabled = !hasProcessedCurrentState || isRoundComplete`
- **"Create Next Street"**: `disabled = !hasProcessedCurrentState || !isRoundComplete`

### handleProcessStack Updates

Updated to set processed state after successful processing:

```typescript
const handleProcessStack = () => {
  // ... validation and processing logic ...

  try {
    // ... process all levels ...

    console.log(`\n✅ Process Stack Complete - Total Pot: ${finalPotInfo.totalPot}`);

    // Set processed state flag and save hash
    const flopDataHash = JSON.stringify(
      players.map(p => {
        const data = latestPlayerData[p.id] || {};
        return {
          id: p.id,
          flopAction: data.flopAction,
          flopAmount: data.flopAmount,
          flopUnit: data.flopUnit,
          // ... all relevant fields
        };
      })
    );
    setHasProcessedCurrentState(true);
    setLastProcessedPlayerDataHash(flopDataHash);
    console.log('✅ [FlopView] Set hasProcessedCurrentState to true');

    // ... show success alert ...

  } catch (error) {
    // ... error handling ...
  }
};
```

**Key Changes**:
1. Calculate hash after processing completes
2. Set `hasProcessedCurrentState = true`
3. Save hash to `lastProcessedPlayerDataHash`

### handleMoreAction Updates

Updated to invalidate processed state when new action level is added:

```typescript
const handleMoreAction = () => {
  // ... check round completion ...

  if (!currentLevels.includes('more')) {
    addActionLevel('flop', 'more');
    console.log('[FlopView] Added More Action 1');

    // Invalidate processed state since new action level was added
    setHasProcessedCurrentState(false);
    console.log('🔄 [FlopView] Invalidated processed state (added More Action 1)');

    // ... copy stacks and initialize new level ...
  } else if (!currentLevels.includes('more2')) {
    addActionLevel('flop', 'more2');
    console.log('[FlopView] Added More Action 2');

    // Invalidate processed state since new action level was added
    setHasProcessedCurrentState(false);
    console.log('🔄 [FlopView] Invalidated processed state (added More Action 2)');

    // ... copy stacks and initialize new level ...
  }
};
```

**Why Invalidate?**
- New action level adds new player action fields
- Users need to enter actions for the new level
- Must process again before advancing

## Button State Logic

### State Matrix

| Has Processed? | Round Complete? | Add More Action | Create Next Street |
|----------------|-----------------|-----------------|-------------------|
| ❌ No          | ❌ No           | **DISABLED**    | **DISABLED**      |
| ❌ No          | ✅ Yes          | **DISABLED**    | **DISABLED**      |
| ✅ Yes         | ❌ No           | **ENABLED**     | **DISABLED**      |
| ✅ Yes         | ✅ Yes          | **DISABLED**    | **ENABLED**       |

### Logic Explanation

#### "Add More Action" Button

```typescript
disabled = !hasProcessedCurrentState || isRoundComplete
```

**Disabled when**:
- Process Stack not clicked (`!hasProcessedCurrentState`)
- **OR** Round is complete (`isRoundComplete`)

**Enabled when**:
- Process Stack clicked **AND** Round is incomplete

**Reasoning**: Can only add more action if current state is validated AND round isn't finished.

#### "Create Next Street" Button

```typescript
disabled = !hasProcessedCurrentState || !isRoundComplete
```

**Disabled when**:
- Process Stack not clicked (`!hasProcessedCurrentState`)
- **OR** Round is incomplete (`!isRoundComplete`)

**Enabled when**:
- Process Stack clicked **AND** Round is complete

**Reasoning**: Can only advance to next street if current state is validated AND betting round is finished.

## Examples

### Example 1: Initial State (Flop BASE)

**Scenario**: User just navigated to Flop, no actions entered

```typescript
// State:
hasProcessedCurrentState = false  // Not processed yet
isRoundComplete = false          // No actions = incomplete

// Button States:
"Add More Action 1": DISABLED  (!false || false = true || false = true)
"Create Turn": DISABLED  (!false || !false = true || true = true)
```

**User sees**: Both buttons are grayed out ✅

---

### Example 2: Actions Entered, Not Processed

**Scenario**: All players checked, but Process Stack not clicked

```typescript
playerData = {
  1: { flopAction: 'check' },
  2: { flopAction: 'check' },
  3: { flopAction: 'check' }
}

// State:
hasProcessedCurrentState = false  // Not processed yet
isRoundComplete = true           // All checked = complete

// Button States:
"Add More Action 1": DISABLED  (!false || true = true || true = true)
"Create Turn": DISABLED  (!false || !true = true || false = true)
```

**User sees**: Both buttons still grayed out (must click Process Stack) ✅

---

### Example 3: Processed, Round Complete

**Scenario**: All players checked AND Process Stack clicked

```typescript
playerData = {
  1: { flopAction: 'check' },
  2: { flopAction: 'check' },
  3: { flopAction: 'check' }
}

// State AFTER Process Stack:
hasProcessedCurrentState = true   // Just processed
isRoundComplete = true           // All checked = complete

// Button States:
"Add More Action 1": DISABLED  (!true || true = false || true = true)
"Create Turn": ENABLED  (!true || !true = false || false = false)
```

**User sees**: "Create Turn" is clickable, "Add More Action 1" is grayed out ✅

---

### Example 4: Processed, Round Incomplete

**Scenario**: Alice bet, others called, Process Stack clicked

```typescript
playerData = {
  1: { flopAction: 'bet', flopAmount: '5000' },
  2: { flopAction: 'call', flopAmount: '5000' },
  3: { flopAction: 'call', flopAmount: '5000' }
}

// State AFTER Process Stack:
hasProcessedCurrentState = true   // Just processed
isRoundComplete = true           // All called = complete

// Button States:
"Add More Action 1": DISABLED  (!true || true = false || true = true)
"Create Turn": ENABLED  (!true || !true = false || false = false)
```

**Wait, the round IS complete here! Let me recalculate:**

```typescript
// Actually, if all players matched the bet, round is complete:
isRoundComplete = true

// Button States:
"Add More Action 1": DISABLED  (can't add more, round done)
"Create Turn": ENABLED  (can advance)
```

**User sees**: Can click "Create Turn" ✅

---

### Example 5: User Changes Amount After Processing

**Scenario**: Processed, then user changes Alice's bet from 5000 to 8000

```typescript
// Before change:
hasProcessedCurrentState = true
lastProcessedPlayerDataHash = "...[bet: 5000]..."

// User edits Alice's amount to 8000
// useEffect detects change:
newHash = "...[bet: 8000]..."

// Hash comparison:
if (lastProcessedPlayerDataHash && newHash !== lastProcessedPlayerDataHash) {
  setHasProcessedCurrentState(false);  // Invalidate!
}

// New State:
hasProcessedCurrentState = false  // Invalidated by change
isRoundComplete = false          // Round now incomplete (Bob/Charlie need to adjust)

// Button States:
"Add More Action 1": DISABLED  (!false || false = true || false = true)
"Create Turn": DISABLED  (!false || !false = true || true = true)
```

**User sees**: Both buttons become grayed out again (must re-process) ✅

---

### Example 6: Adding More Action Level

**Scenario**: User clicks "Add More Action 1" button

```typescript
// Before clicking (assumed processed and round incomplete):
hasProcessedCurrentState = true
isRoundComplete = false  // That's why button was enabled

// handleMoreAction() is called:
addActionLevel('flop', 'more');
setHasProcessedCurrentState(false);  // Explicitly invalidated

// New State:
hasProcessedCurrentState = false  // Invalidated by adding level
isRoundComplete = false          // New level has no actions

// Button States:
"Add More Action 2": DISABLED  (!false || false = true || false = true)
"Create Turn": DISABLED  (!false || !false = true || true = true)
```

**User sees**: Both buttons grayed out until Process Stack clicked for More Action 1 ✅

## Testing

### Test File

`src/components/game/__tests__/processStackRequirement.test.ts`

### Test Coverage

**16 comprehensive test cases** covering:

1. **Flop BASE (4 tests)**
   - Buttons disabled before Process Stack (incomplete round)
   - Buttons enabled after Process Stack (complete round)
   - Buttons disabled before Process Stack (even when complete)
   - Buttons disabled when playerData changes after Process Stack

2. **Flop More Action 1 (2 tests)**
   - Buttons disabled after adding More Action level
   - "Create Turn" enabled after processing complete More Action 1

3. **Turn BASE (3 tests)**
   - Buttons disabled on initial navigation
   - "Add More Action 1" enabled after processing incomplete round
   - Buttons disabled when amount is changed

4. **River BASE (1 test)**
   - Buttons disabled before Process Stack (all-in scenario)

5. **PreFlop BASE (2 tests)**
   - Buttons disabled before initial Process Stack
   - "Create Flop" enabled after processing complete preflop

6. **Edge Cases (3 tests)**
   - Unit changes detected as playerData changes
   - Multiple More Action levels handled correctly
   - Empty/undefined values handled consistently in hash

7. **Button State Logic (1 test)**
   - Documents all 4 state combinations and expected outcomes

### Running Tests

```bash
# Run Process Stack requirement tests
npm test processStackRequirement

# Run all button tests
npm test "bettingRound|createNextStreet|processStack"

# Watch mode
npm test -- --watch processStackRequirement
```

### Test Results

```
Test Suites: 1 passed, 1 total
Tests:       16 passed, 16 total
```

## User Experience

### Before Implementation

- Users could click "Add More Action" or "Create Next Street" at any time
- No guarantee that stacks were calculated
- Could accidentally advance without processing
- Inconsistent workflow

### After Implementation

- Buttons clearly disabled until Process Stack clicked
- Visual feedback (grayed out buttons, no-cursor)
- Enforces proper workflow: Enter Actions → Process Stack → Advance
- Change detection ensures data integrity
- Consistent across all streets

## Benefits

1. **Data Integrity**: Ensures stacks are always calculated before advancing
2. **Error Prevention**: Users cannot skip processing step
3. **Change Detection**: Invalidates processed state if data changes
4. **Clear Workflow**: Visual cues guide users through correct process
5. **Consistency**: Same logic across all four street views
6. **Testability**: Comprehensive test coverage ensures correctness

## Console Logging

The implementation includes detailed console logging for debugging:

```
🔄 [FlopView] PlayerData changed, invalidating processed state
🔄 [FlopView useEffect] Current level: base, Round complete: true, Processed: false
✅ [FlopView] Set hasProcessedCurrentState to true
```

**Log Markers**:
- `🔄` Change detection or state updates
- `✅` Success (processed state set)
- `🎯` Button state changes

## Future Enhancements

Potential improvements:

1. **Visual Indicator**: Show "Process Stack Required" message when buttons disabled
2. **Tooltip**: Explain why buttons are disabled on hover
3. **Animation**: Subtle pulse on "Process Stack" button when needed
4. **Keyboard Shortcut**: Add keyboard shortcut for Process Stack (e.g., Ctrl+P)
5. **Auto-Process**: Option to auto-process on certain triggers (configurable)
6. **Undo**: Allow undo after processing to make changes easier

## Related Documentation

- [CREATE_NEXT_STREET_FEATURE.md](CREATE_NEXT_STREET_FEATURE.md) - Create Next Street button feature
- [BETTING_ROUND_BUTTON_TESTS.md](BETTING_ROUND_BUTTON_TESTS.md) - Button state testing overview

## Conclusion

The Process Stack requirement feature enforces a proper workflow by requiring users to validate and calculate stacks before advancing. The implementation uses hash-based change detection to ensure data integrity, and comprehensive test coverage ensures the feature works correctly across all scenarios.

This feature significantly improves the user experience by providing clear visual feedback and preventing common errors related to skipping the processing step.
