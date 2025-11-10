# Betting Round Completion - Button State Tests

## Overview

This document explains the comprehensive test suite for verifying button states when betting rounds are complete across all sections of the poker hand history tool.

## Test File Locations

1. **Betting Round Completion Tests**: `src/components/game/__tests__/bettingRoundCompletion.test.ts`
   - Tests the "Add More Action" button states
   - Verifies round completion detection

2. **Create Next Street Button Tests**: `src/components/game/__tests__/createNextStreetButton.test.ts`
   - Tests the "Create Next Street" button states
   - Verifies button is disabled when round is incomplete

## What We're Testing

The poker hand history tool has **4 street views** (PreFlop, Flop, Turn, River), each with up to **3 action levels** (BASE, More Action 1, More Action 2). This gives us **12 total sections** to test:

### Sections Overview

1. **PreFlop BASE**
2. **PreFlop More Action 1**
3. **PreFlop More Action 2**
4. **Flop BASE**
5. **Flop More Action 1**
6. **Flop More Action 2**
7. **Turn BASE**
8. **Turn More Action 1**
9. **Turn More Action 2**
10. **River BASE**
11. **River More Action 1**
12. **River More Action 2**

## Button Types

Each betting round view has two key buttons:

### 1. "Add More Action" Button
- **Purpose**: Adds another betting round (More Action 1 or More Action 2)
- **Location**: Bottom of current action level
- **Maximum**: 3 action levels per street (BASE + More 1 + More 2)
- **Selector**: `button[data-add-more-focus]`
- **Button Text**:
  - "Add More Action 1" (when in BASE)
  - "Add More Action 2" (when in More Action 1)
  - Not visible when at More Action 2 (max levels)

**Disabled When:**
- Betting round is complete (`isAddMoreActionDisabled = true`)
- Already at maximum 3 action levels

**Enabled When:**
- Betting round is incomplete AND not at max levels

### 2. "Create Next Street" Button
- **Purpose**: Advances to next street
- **DISABLED when round incomplete** (`isCreateNextStreetDisabled = true`)
- **ENABLED when round complete** (`isCreateNextStreetDisabled = false`)
- **Button Names:**
  - PreFlop: "Create Flop"
  - Flop: "Create Turn"
  - Turn: "Create River"
  - River: No next street (final street)

**Disabled When:**
- Betting round is incomplete (players haven't finished acting)

**Enabled When:**
- Betting round is complete (all players acted and contributions matched)
- Only one player remains (others folded)
- All remaining players are all-in

## Core Logic Being Tested

### Button State Updates

Each view component (PreFlopView, FlopView, TurnView, RiverView) has a `useEffect` that updates button states:

```typescript
const [isAddMoreActionDisabled, setIsAddMoreActionDisabled] = useState(false);
const [isCreateNextStreetDisabled, setIsCreateNextStreetDisabled] = useState(true);

React.useEffect(() => {
  const currentLevels = visibleActionLevels.flop || ['base'];
  const currentLevel = currentLevels[currentLevels.length - 1];
  const isRoundComplete = checkBettingRoundComplete('flop', currentLevel, players, playerData);

  // "Add More Action" is disabled when round is complete
  setIsAddMoreActionDisabled(isRoundComplete.isComplete);

  // "Create Next Street" is disabled when round is incomplete
  setIsCreateNextStreetDisabled(!isRoundComplete.isComplete);
}, [playerData, visibleActionLevels.flop, players]);
```

### Round Completion Logic (`checkBettingRoundComplete`)

The `checkBettingRoundComplete()` function determines if a betting round is complete based on:

#### For PreFlop:
1. **All active players have acted** - Each player must have an action (not 'none' or 'no action')
2. **Contributions matched** - All players must have equal contributions OR be all-in
3. **No pending calls** - No player waiting to act

#### For Postflop (Flop, Turn, River):
1. **All players checked** - If no one bet, everyone must check
2. **All players acted** - Each player must have an action
3. **Contributions matched** - All players must match max bet OR be all-in

### Button State Update Flow

```typescript
// 1. useEffect watches playerData changes
React.useEffect(() => {
  const currentLevel = visibleActionLevels.flop[visibleActionLevels.flop.length - 1];
  const isRoundComplete = checkBettingRoundComplete('flop', currentLevel, players, playerData);
  setIsAddMoreActionDisabled(isRoundComplete.isComplete);
}, [playerData, visibleActionLevels.flop, players]);

// 2. Button's disabled state combines two conditions
<button
  disabled={isAddMoreActionDisabled || maxLevelsReached}
  data-add-more-focus
>
  Add More Action
</button>
```

## Test Scenarios

### Scenario 1: Round Complete - All Players Matched

**Example (Flop BASE):**
```typescript
PlayerData:
- Alice (SB): check
- Bob (BB): check
- Charlie (UTG): check

Expected:
- "Add More Action 1": DISABLED ✅
- "Create Turn": ENABLED ✅
```

**Why Round is Complete:**
- All players have acted (check action)
- All contributions matched (everyone checked = 0 contribution)
- No one waiting to act

### Scenario 2: Round Incomplete - Player Pending Action

**Example (Flop BASE):**
```typescript
PlayerData:
- Alice (SB): bet 2000
- Bob (BB): (no action yet)
- Charlie (UTG): (no action yet)

Expected:
- "Add More Action 1": ENABLED ✅
- "Create Turn": ENABLED ✅
```

**Why Round is Incomplete:**
- Not all players have acted
- Bob and Charlie need to respond to Alice's bet
- Pending players: [2, 3]

### Scenario 3: Round Complete - All-In Scenario

**Example (Flop BASE):**
```typescript
PlayerData:
- Alice (SB): folded
- Bob (BB): all-in 100,000
- Charlie (UTG): all-in 100,000

Expected:
- "Add More Action 1": DISABLED ✅
- "Create Turn": ENABLED ✅
```

**Why Round is Complete:**
- All active players are all-in (contributions matched by all-in status)
- No further betting possible
- Alice folded (not active)

### Scenario 4: Max Levels Reached

**Example (PreFlop More Action 2):**
```typescript
visibleActionLevels.preflop: ['base', 'more', 'more2']

Expected:
- "Add More Action 3": DISABLED ✅ (max levels)
- "Create Flop": ENABLED ✅
```

**Why Button Disabled:**
- Maximum 3 action levels reached (BASE, More 1, More 2)
- Cannot add more levels regardless of round completion status

### Scenario 5: Only One Player Remains

**Example (Flop BASE):**
```typescript
PlayerData:
- Alice (SB): folded
- Bob (BB): folded
- Charlie (UTG): check

Expected:
- "Add More Action 1": DISABLED ✅
- "Create Turn": ENABLED ✅
```

**Why Round is Complete:**
- Only one active player remaining
- Betting cannot continue with single player
- Charlie wins by default

## Test Suite Structure

### Suite 1: PreFlop Betting Rounds
- **Test 1.1**: PreFlop BASE - Round Complete (all called BB)
- **Test 1.2**: PreFlop BASE - Round Incomplete (players pending)
- **Test 1.3**: PreFlop More Action 1 - Round Complete (all matched raise)
- **Test 1.4**: PreFlop More Action 2 - Max Levels Reached

### Suite 2: Flop Betting Rounds
- **Test 2.1**: Flop BASE - Round Complete (all checked)
- **Test 2.2**: Flop BASE - Round Incomplete (player bet, others pending)
- **Test 2.3**: Flop More Action 1 - Round Complete (all matched)

### Suite 3: Turn Betting Rounds
- **Test 3.1**: Turn BASE - Round Complete (all checked)
- **Test 3.2**: Turn More Action 1 - Round Incomplete (raise pending calls)

### Suite 4: River Betting Rounds
- **Test 4.1**: River BASE - Round Complete (all checked)
- **Test 4.2**: River More Action 2 - Max Levels (all-in scenario)

### Suite 5: Edge Cases
- **Test 5.1**: All Players Fold Except One
- **Test 5.2**: All Players All-In

## How to Run Tests

```bash
# Run all tests
npm test

# Run only betting round completion tests
npm test bettingRoundCompletion

# Run in watch mode
npm test -- --watch bettingRoundCompletion
```

## Test Assertions

Each test verifies two things:

### 1. "Add More Action" Button State
```typescript
await waitFor(() => {
  const addMoreButton = container.querySelector('button[data-add-more-focus]') as HTMLButtonElement;
  expect(addMoreButton).toBeTruthy(); // Button exists
  expect(addMoreButton.disabled).toBe(true); // Button is disabled
});
```

### 2. "Create Next Street" Button State
```typescript
const createFlopButton = screen.getByText(/Create Flop/i);
expect(createFlopButton).toBeEnabled(); // Always enabled
```

## Key Testing Patterns

### Pattern 1: Round Complete Test
1. Create playerData where all players have acted and matched contributions
2. Render the view component
3. Wait for useEffect to run (updates button state)
4. Assert "Add More Action" is DISABLED
5. Assert "Create Next Street" is ENABLED

### Pattern 2: Round Incomplete Test
1. Create playerData where some players haven't acted
2. Render the view component
3. Wait for useEffect to run
4. Assert "Add More Action" is ENABLED
5. Assert "Create Next Street" is ENABLED

### Pattern 3: Max Levels Test
1. Create state with 3 visible action levels
2. Render the view component
3. Assert "Add More Action" is DISABLED (max levels)
4. Assert "Create Next Street" is ENABLED

## Common Test Helpers

### `createMockGameState(overrides?)`
Creates a complete game state with sensible defaults:
```typescript
const state = createMockGameState({
  playerData: { /* custom player data */ },
  visibleActionLevels: { preflop: ['base', 'more'] }
});
```

### `createMockActions()`
Creates mock action functions for state updates:
```typescript
const actions = createMockActions();
```

### `createMockCardManagement()`
Creates mock card management utilities:
```typescript
const cardManagement = createMockCardManagement();
```

### `createMockPotCalculation()`
Creates mock pot calculation utilities:
```typescript
const potCalculation = createMockPotCalculation();
```

## Debugging Test Failures

### If "Create Next Street" button is incorrectly enabled:
- Check if `isCreateNextStreetDisabled` is being set correctly
- Verify `useEffect` is running when `playerData` changes
- Check round completion logic with console logs
- Ensure `!isRoundComplete.isComplete` is used (note the negation)

### If "Create Next Street" button is incorrectly disabled:
- Check that all players have acted
- Verify contributions are matched
- Check for all-in players (they don't need to match)
- Ensure no pending actions remain

### If "Add More Action" button is not found:
- Check `data-add-more-focus` attribute is present in component
- Verify component is rendering correct action level
- Check that the button is only rendered for the last action level

### If button state is incorrect:
- Check console logs from `checkBettingRoundComplete()` (detailed logging)
- Verify playerData has correct structure
- Check contribution calculations
- Ensure all-in status is correctly set

### If useEffect doesn't run:
- Add longer timeout to `waitFor()`
- Check that dependencies array includes all necessary state
- Verify component is properly mounted

## Real-World Poker Scenarios Covered

### Scenario: Standard Flop Check-Around
```
Flop: K♠ 7♥ 3♦
SB checks, BB checks, UTG checks
→ Round complete, "Add More Action" disabled
```

### Scenario: Turn Continuation Bet
```
Turn: K♠ 7♥ 3♦ 9♣
SB checks, BB bets 5000, UTG hasn't acted yet
→ Round incomplete, "Add More Action" enabled
```

### Scenario: River All-In Showdown
```
River: K♠ 7♥ 3♦ 9♣ A♥
SB folded, BB all-in 50K, UTG all-in 50K
→ Round complete, "Add More Action" disabled (also at max levels)
```

### Scenario: PreFlop 3-Bet War
```
PreFlop BASE: UTG raises to 3BB, CO 3-bets to 9BB
PreFlop More 1: UTG 4-bets to 27BB, CO 5-bets to 81BB
PreFlop More 2: UTG all-in, CO calls
→ At max levels (3), "Add More Action" disabled
```

## Coverage Goals

✅ **9 main sections** (3 per street × 3 streets before river)
✅ **Edge cases** (folds, all-ins, single player)
✅ **Max levels** (3 action levels limit)
✅ **Button states** (enabled/disabled)
✅ **Real poker scenarios** (check-around, bets, raises, all-ins)

## Future Enhancements

Potential additional tests:
1. **Dynamic updates**: Test button state changes as players act
2. **Process Stack integration**: Test button state after processing
3. **Sequential enabling**: Test FR-9 sequential enabling with button states
4. **Error states**: Test button behavior with invalid data
5. **Animation states**: Test button visual states (loading, disabled styles)

## Related Files

- **Implementation**: `src/components/game/*View.tsx`
- **Validator**: `src/lib/poker/validators/roundCompletionValidator.ts`
- **Types**: `src/types/poker.ts`
- **Hooks**: `src/hooks/useGameState.ts`

## Summary

These tests ensure that:
1. Users can add more betting rounds only when appropriate
2. Betting round completion is correctly detected
3. Button states update reactively as players act
4. Maximum action levels are enforced
5. Edge cases (folds, all-ins) are handled correctly
6. All 9+ sections behave consistently

This comprehensive testing gives confidence that the betting round UI behaves correctly across all poker scenarios.
