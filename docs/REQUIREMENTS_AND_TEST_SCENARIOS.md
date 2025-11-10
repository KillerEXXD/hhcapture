# HHTool Modular - Requirements & Test Scenarios

**Project:** Poker Hand History Collector
**Version:** 1.0
**Last Updated:** 2025-01-06
**Status:** In Development

---

## Table of Contents

1. [Overview](#overview)
2. [Feature Requirements](#feature-requirements)
3. [Test Scenarios](#test-scenarios)
4. [Unit Test Requirements](#unit-test-requirements)
5. [Validation Rules](#validation-rules)
6. [State Management](#state-management)
7. [Edge Cases](#edge-cases)

---

## Overview

This document contains all requirements, test scenarios, and validation rules for the HHTool Modular poker hand history collector. It should be reviewed at the start of each development session to ensure continuity and accuracy.

### Purpose
- Single source of truth for all feature requirements
- Comprehensive test scenarios for all user interactions
- Unit test specifications for each feature
- Edge case documentation
- Session continuity reference

---

## Feature Requirements

### FR-1: Sequential Player Enabling/Disabling

**Description:** Players are enabled one at a time in sequential order. Once a player acts, the next player becomes enabled.

**Requirements:**
1. First player is always enabled at the start of any betting round
2. Subsequent players are enabled only after the previous player acts
3. Players who have already acted keep their buttons enabled (can modify action before Process Stack)
4. Skip all-in players when determining "previous player"
5. If a player has acted, their buttons remain enabled even if round is marked complete

**Applies To:**
- PreFlop BASE, More Action 1, More Action 2
- Flop BASE, More Action 1, More Action 2
- Turn BASE, More Action 1, More Action 2
- River BASE, More Action 1, More Action 2

**Key Code Locations:**
- `getAvailableActionsForPlayer` function
- `moveToNextPlayer` function
- `handleActionClick` function

---

### FR-2: First Player Button States (Post-Flop BASE)

**Description:** First player at Flop/Turn/River BASE rounds has specific button restrictions.

**Requirements:**
1. First player cannot 'call' (nothing to call yet)
2. First player CAN: check, bet, raise, all-in, fold, no action
3. **Special case:** If first player is all-in from previous street:
   - Only "all-in" button is enabled
   - All other buttons disabled
   - Second player becomes the "acting first player"
   - Second player also has 'call' disabled (no bet to respond to)

**Available Actions:**
- PreFlop BASE first player: `['check', 'call', 'bet', 'raise', 'all-in', 'fold', 'no action']`
- Post-Flop BASE first player: `['check', 'bet', 'raise', 'all-in', 'fold', 'no action']` (no 'call')

---

### FR-3: Pot Calculation Cascade Across Streets

**Description:** Pots (main pot and side pots) carry forward from one street to the next.

**Requirements:**
1. PreFlop ending stacks → Flop starting stacks
2. Flop ending stacks → Turn starting stacks
3. Turn ending stacks → River starting stacks
4. Main pot accumulates across streets
5. Side pots are calculated based on all-in players and carry forward
6. Each street adds contributions to the existing pot structure

**Processing Order:**
```
preflop_base → preflop_more → preflop_more2 →
flop_base → flop_more → flop_more2 →
turn_base → turn_more → turn_more2 →
river_base → river_more → river_more2
```

**Key Function:** `processStackCascade`

---

### FR-4: Stack History Card Display

**Description:** Each player has a stack history card showing all actions from all streets and sections.

**Requirements:**
1. **PreFlop View:** Shows PreFlop BASE, More Action 1, More Action 2
2. **Flop View:** Shows PreFlop (all levels) + Flop (all levels)
3. **Turn View:** Shows PreFlop + Flop + Turn (all levels)
4. **River View:** Shows PreFlop + Flop + Turn + River (all levels)
5. Each section displays: `Start Stack → Now Stack` with action badge
6. Summary section shows: Starting Stack, Total Contributed, Remaining Stack
7. Auto-scroll to latest section when card opens
8. Expandable/collapsible behavior

**Display Format:**
```
┌─────────────────────────────────────┐
│ PREFLOP BASE                        │
│ 10.0K → 8.0K  (bet 2.0K)           │
├─────────────────────────────────────┤
│ MORE ACTION 1                       │
│ 8.0K → 5.0K   (raise 5.0K)         │
├─────────────────────────────────────┤
│ FLOP BASE                           │
│ 5.0K → 4.0K   (bet 1.0K)           │
├─────────────────────────────────────┤
│ SUMMARY                             │
│ Starting: 10.0K                     │
│ Contributed: 6.0K                   │
│ Remaining: 4.0K                     │
└─────────────────────────────────────┘
```

---

### FR-5: Process Stack Button Behavior

**Description:** "Process Stack" button validates all actions, calculates stacks, and updates state.

**Requirements:**
1. Forces blur on all amount inputs to save pending values
2. Validates all required amounts are entered
3. Validates raise amounts against available stacks
4. Processes sections synchronously in order
5. Updates React state atomically
6. Retains action status (players can see what happened)
7. Calculates "Now" stacks for each section
8. Updates history cards

**Validation Performed:**
- All bet/raise actions have amounts entered
- Raise amounts don't exceed available stacks
- Raise amounts meet minimum increment requirements
- All-in amounts are calculated correctly

**Key Function:** `processStackCascade`, `processStackSynchronous`

---

### FR-6: Street Navigation

**Description:** Navigation between streets and sections.

**Requirements:**
1. Top tabs: Stack | Pre-flop | Flop | Turn | River
2. Bottom navigation buttons:
   - PreFlop BASE: `← Stack` | `Create Flop →`
   - Flop BASE: `← Preflop` | `Create Turn →`
   - Turn BASE: `← Flop` | `Create River →`
   - River BASE: `← Turn` | (no next street)
3. Navigation preserves all state
4. Can navigate back to previous streets to view/edit

---

### FR-7: MaxBet Reset Per Street

**Description:** MaxBet tracking resets at the start of each street BASE round.

**Requirements:**
1. **PreFlop BASE:** MaxBet starts at BB amount
2. **PreFlop More Actions:** MaxBet carries over from BASE
3. **Flop BASE:** MaxBet resets to 0 (NEW betting round)
4. **Flop More Actions:** MaxBet carries over from Flop BASE
5. **Turn BASE:** MaxBet resets to 0
6. **River BASE:** MaxBet resets to 0

**Betting Groups:**
- Group 1: PreFlop BASE + More1 + More2 (maxBet carries within group)
- Group 2: Flop BASE + More1 + More2 (maxBet carries within group)
- Group 3: Turn BASE + More1 + More2 (maxBet carries within group)
- Group 4: River BASE + More1 + More2 (maxBet carries within group)

**Display Bug Fix:**
- History must show bet SIZE (2k), not additional contribution (1k)
- Example: If player bets 2000, display "bet 2.0K" not "bet 1.0K"

---

### FR-8: Process Stack Button Position

**Description:** Consistent positioning of Process Stack button across all views.

**Requirements:**
1. Position below "Add More Action" and "Create [Next Street]" buttons
2. Same layout in PreFlop, Flop, Turn, River
3. Clear visual hierarchy

---

### FR-9: More Action Enabling Logic

**Description:** Specific logic for enabling players in More Action rounds.

**Requirements:**

#### **9.1: Purpose of More Actions**
More Actions exist ONLY when a player raises, requiring previous actors to respond.

**Example:**
```
PreFlop BASE:
  Alice bets 50
  Bob calls 50
  Charlie RAISES to 150  ← Triggers More Action 1

More Action 1:
  Alice must respond (acted before raise)
  Bob must respond (acted before raise)
  Charlie doesn't act (made the raise)
```

#### **9.2: Available Actions in More Actions**
**Enabled:** `['call', 'raise', 'all-in', 'fold']`
**Disabled:** `['check', 'bet', 'no action']`

**Why disabled:**
- `check`: Can't check when there's a bet to respond to
- `bet`: There's already a bet; must use 'raise'
- `no action`: Must respond to the raise (optional: may allow for edge cases)

#### **9.3: Sequential Enabling Without Premature Completion Checks**

**CRITICAL RULE:** After a RAISE, enable next player WITHOUT checking completion.

**After a CALL:**
```typescript
Player calls
  ↓
  CHECK if betting round is complete
  ↓
  If complete → Don't enable next player
  If NOT complete → Enable next player
```

**After a RAISE:**
```typescript
Player raises
  ↓
  NO completion check needed
  ↓
  Enable next player immediately (we KNOW they must respond)
```

**Example:**
```
More Action 1:
  Alice calls → Check completion → NOT complete → Enable Bob
  Bob calls → Check completion → NOT complete → Enable Charlie
  Charlie RAISES → NO check needed → Enable next player (triggers More Action 2)
```

#### **9.4: When to Check Completion**

**Check completion ONLY after:**
- CALL
- CHECK
- FOLD

**DO NOT check completion after:**
- RAISE
- BET
- ALL-IN (if all-in amount > current max bet, acts like raise)

**Completion Scenarios:**
- All players checked → Complete
- One player bets, all others folded → Complete
- All active players matched the max bet → Complete
- All players all-in → Complete

---

### FR-10: Main Pot + Side Pot Display

**Description:** Modal/popup showing pot structure with main pot and side pots.

**Requirements:**
1. Display main pot size
2. Display each side pot with:
   - Side pot number (1, 2, 3...)
   - Amount
   - Eligible players (optional but helpful)
3. Clear formatting

**Example Display:**
```
┌─────────────────────────────────────┐
│ POT BREAKDOWN                       │
├─────────────────────────────────────┤
│ Main Pot: 5.0K                      │
│                                     │
│ Side Pot 1: 2.0K                    │
│   Eligible: Alice, Bob              │
│                                     │
│ Side Pot 2: 1.5K                    │
│   Eligible: Alice                   │
│                                     │
│ TOTAL: 8.5K                         │
└─────────────────────────────────────┘
```

**Data Source:** `potsByStage` state

---

### FR-11: All-In Status Carryover

**Description:** Players who go all-in in earlier streets show locked all-in status in later streets.

**Requirements:**
1. If player all-in in PreFlop → Show locked all-in in Flop/Turn/River
2. Locked all-in display:
   - Only "all-in" button enabled (shown as selected)
   - All other buttons disabled (grayed out)
   - Button is not clickable (returns early on click)
3. Other players proceed normally
4. If first player is all-in from previous street:
   - Second player becomes "acting first player"
   - Second player follows first player rules

**Implementation:**
- `isAllInLocked` flag combines `isForcedAllIn` and `allInFromPrevious`
- Button disabled state: `disabled={!isAvailable || (isAllInLocked && action !== 'all-in')}`

---

### FR-12: Raise Amount Validation

**Description:** Comprehensive validation of raise amounts against available stacks and poker rules.

**Requirements:**

#### **12.1: Validation Rule - Cannot Exceed "Now" Stack**

**Logic:**
```typescript
const playerNowStack = getNowStack(playerId, stage, actionLevel);
const alreadyContributed = getAlreadyContributed(playerId);
const raiseToAmount = userInput;
const additionalNeeded = raiseToAmount - alreadyContributed;

if (additionalNeeded > playerNowStack) {
  ERROR: "Cannot raise to {raiseToAmount}. Your current stack is {playerNowStack}. Maximum raise is {alreadyContributed + playerNowStack}."
}
```

**Example:**
```
PreFlop BASE processed:
  Alice starting: 10K
  Alice bet: 2K
  Alice "Now": 8K

More Action 1:
  Alice tries to raise to 12K total
  Additional needed: 12K - 2K = 10K
  Alice "Now": 8K
  Validation: 10K > 8K ❌ INVALID
```

#### **12.2: Validation Rule - Must Exceed Current Max Bet**

**Logic:**
```typescript
const currentMaxBet = getMaxBet(stage, actionLevel);
const raiseToAmount = userInput;

if (raiseToAmount <= currentMaxBet) {
  ERROR: "Raise amount ({raiseToAmount}) must be greater than current max bet ({currentMaxBet})."
}
```

#### **12.3: Validation Rule - Minimum Raise Increment**

**Logic:**
```typescript
const previousBet = getPreviousBet(stage, actionLevel);
const currentMaxBet = getMaxBet(stage, actionLevel);
const raiseIncrement = currentMaxBet - previousBet;
const minValidRaise = currentMaxBet + raiseIncrement;

if (raiseToAmount < minValidRaise) {
  ERROR: "Minimum raise is {minValidRaise}. Previous raise increment was {raiseIncrement}."
}
```

**Example:**
```
Alice bets 1K
Bob raises to 3K (raise increment: 2K)
Charlie must raise to at least 5K (3K + 2K increment)
```

#### **12.4: Validation Rule - Cannot Exceed Starting Stack (PreFlop BASE Only)**

**Logic:**
```typescript
if (stage === 'preflop' && actionLevel === 'base') {
  const startingStack = getStartingStack(playerId);
  if (raiseToAmount > startingStack) {
    ERROR: "Cannot raise to {raiseToAmount}. Your starting stack is {startingStack}."
  }
}
```

#### **12.5: Error Handling**

**On validation error:**
1. Show clear error message with details
2. Explain why the raise is invalid
3. Show maximum allowed amount
4. Set focus back to amount input
5. Prevent action from proceeding (don't update state)

---

### FR-13: Keyboard Navigation and Tabbing Behavior

**Description:** Consistent keyboard navigation and tabbing behavior across all streets (PreFlop, Flop, Turn, River) and action levels (BASE, More Action 1, More Action 2).

**Requirements:**

#### **13.1: Card Selection to Action Tabbing**
When user tabs from card selection inputs:
- Focus moves to the "Action" section of the first player
- Tab follows the same pattern as implemented in PreFlop BASE More Action 1

#### **13.2: Action Section Tabbing Flow**
Within each player's action section:
1. **If player is all-in:** Skip to next player's action
2. **If action is Check/Call/Fold/No Action:** Tab to next player's action
3. **If action is Bet/Raise:** Tab to amount input field
4. **From amount input:** Tab to next player's action

#### **13.3: Navigation Pattern (Applies to all streets)**
```
Card Selector → First Player Action →
  ├─ If Check/Call/Fold → Next Player Action
  ├─ If Bet/Raise → Amount Input → Next Player Action
  └─ If All-in → Next Player Action
```

#### **13.4: Round Completion Tabbing**
After last player acts:
- Tab moves to "Process Stack" button
- After processing, focus returns to appropriate field based on completion state

#### **13.5: Applies To All Streets**
This tabbing behavior is implemented consistently in:
- **PreFlop:** BASE, More Action 1, More Action 2
- **Flop:** BASE, More Action 1, More Action 2
- **Turn:** BASE, More Action 1, More Action 2
- **River:** BASE, More Action 1, More Action 2

#### **13.6: Technical Implementation**
- Uses `data-action-focus` attribute on action selector wrapper
- Uses `data-amount-focus` attribute on amount input fields
- Uses `onKeyDown` handler to intercept Tab key
- Uses `navigateAfterAction` function for automatic progression
- All raise validations apply throughout the application when entering amounts

**Key Code Locations:**
- `navigateAfterAction` function in street views
- `PlayerActionSelector` wrapper component with focus management
- Amount input fields with focus attributes

---

### FR-14: State Copying Between Sections

**Description:** When adding More Actions or creating new streets, state is copied forward.

**Requirements:**

#### **14.1: Setup Stack (Initial State)**
```
Player state initialized:
  - Starting Stack: 10K (user input)
  - Now Stack: 10K (same as starting)
  - History Card: "No action occurred" or "Waiting for actions"
```

#### **14.2: After Process Stack in BASE**
```
Actions entered and processed:
  - Starting Stack: 10K (unchanged)
  - Now Stack: 8K (calculated from actions)
  - History Card: Updated with BASE round actions
```

#### **14.3: Add More Action 1**

**When "Add More Action 1" clicked:**
```
Copy from BASE:
  - Starting Stack: 10K (original, for reference)
  - Now Stack: 8K (COPIED from BASE "Now")
  - History Card: BASE history copied
  - Actions: Empty (ready for new input)

This allows validation against 8K (Now), not 10K (Starting)
```

#### **14.4: Add More Action 2**

**When "Add More Action 2" clicked:**
```
Copy from More Action 1:
  - Starting Stack: 10K (original, for reference)
  - Now Stack: 5K (COPIED from More Action 1 "Now")
  - History Card: BASE + More Action 1 history copied
  - Actions: Empty
```

#### **14.5: Create Next Street**

**When "Create Flop" clicked:**
```
Find LAST section of PreFlop (could be BASE, More1, or More2)

Copy from PreFlop LAST section:
  - Starting Stack: 5K (PreFlop ending "Now" becomes Flop starting)
  - Now Stack: 5K (same initially)
  - History Card: All PreFlop history copied
  - Actions: Empty

Same logic for Turn (from Flop) and River (from Turn)
```

#### **14.6: Data Structure**

```typescript
interface SectionState {
  stacks: {
    [playerId: number]: {
      starting: number;  // Starting stack for THIS section
      now: number;       // Current stack after Process Stack
    }
  };

  actions: {
    [playerId: number]: {
      action: ActionType;
      amount?: number;
      unit?: ChipUnit;
    }
  };

  historyCard: {
    sections: Array<{
      name: string;  // "PreFlop BASE", "More Action 1", etc.
      stacks: {
        [playerId: number]: {
          start: number;
          end: number;
          action: string;
          amount: number;
        }
      }
    }>
  };

  isProcessed: boolean;
}
```

---

## Test Scenarios

### TS-1: Sequential Enabling - Basic Flow

**Setup:**
- 3 players: Alice, Bob, Charlie
- PreFlop BASE round

**Steps:**
1. Start PreFlop BASE
2. Verify Alice (first player) has all buttons enabled
3. Verify Bob and Charlie have NO buttons enabled
4. Alice selects "bet" and enters amount
5. Verify Bob buttons become enabled
6. Verify Charlie still has NO buttons enabled
7. Bob selects "call"
8. Verify Charlie buttons become enabled
9. Charlie selects "call"
10. All players have acted

**Expected Results:**
- Players enabled one at a time
- Previous player must act before next player enabled
- All actions recorded correctly

---

### TS-2: Sequential Enabling - Skip All-In Player

**Setup:**
- 3 players: Alice, Bob, Charlie
- More Action 1

**Steps:**
1. Alice calls (enabled first)
2. Bob goes all-in
3. Verify Charlie becomes enabled (skips all-in Bob)
4. Charlie calls
5. Round completes

**Expected Results:**
- Charlie enabled after Bob's all-in
- All-in player skipped in sequential logic
- Round completion detected correctly

---

### TS-3: First Player Post-Flop - No Call Button

**Setup:**
- Flop BASE round
- Alice is first player

**Steps:**
1. Navigate to Flop BASE
2. Check Alice's available actions
3. Verify 'call' button is disabled/not shown
4. Verify other buttons available: check, bet, raise, all-in, fold

**Expected Results:**
- 'call' button disabled for first player in post-flop BASE
- All other actions available

---

### TS-4: First Player All-In From Previous Street

**Setup:**
- Alice went all-in in PreFlop
- Navigate to Flop BASE

**Steps:**
1. Check Alice's buttons in Flop BASE
2. Verify only "all-in" button is enabled (shown as selected)
3. Verify all other buttons disabled
4. Verify Alice's all-in button is not clickable
5. Check Bob's buttons (now acting as first player)
6. Verify Bob has no 'call' button (still first acting player)

**Expected Results:**
- Alice locked to all-in status
- Bob becomes acting first player with appropriate buttons

---

### TS-5: Raise Triggers More Action 1

**Setup:**
- PreFlop BASE
- Alice bets 50, Bob calls 50, Charlie raises to 150

**Steps:**
1. Alice bets 50
2. Bob calls 50
3. Charlie raises to 150
4. Verify "Add More Action 1" button appears or More Action 1 auto-triggered
5. Navigate to More Action 1
6. Verify Alice is first player in More Action 1
7. Verify available actions: call, raise, all-in, fold (NO check, bet, no action)
8. Alice calls 150
9. Bob calls 150
10. Round completes (Charlie doesn't act - he made the raise)

**Expected Results:**
- More Action 1 triggered by Charlie's raise
- Only Alice and Bob act in More Action 1
- Correct available actions in More Action

---

### TS-6: Call Requires Completion Check

**Setup:**
- More Action 1
- 3 players: Alice, Bob, Charlie

**Steps:**
1. Alice calls
2. System checks if round is complete
3. Result: Not complete (Bob and Charlie haven't acted)
4. Bob enabled
5. Bob calls
6. System checks if round is complete
7. Result: Not complete (Charlie hasn't acted)
8. Charlie enabled
9. Charlie calls
10. System checks if round is complete
11. Result: Complete (all players matched)
12. No more players enabled

**Expected Results:**
- Completion check after each call
- Next player enabled only if round not complete
- Round completes after all players match

---

### TS-7: Raise Does NOT Require Completion Check

**Setup:**
- More Action 1
- 3 players: Alice, Bob, Charlie

**Steps:**
1. Alice calls
2. Bob calls
3. Charlie raises
4. System should NOT check completion (we know Alice must respond)
5. Verify Alice is enabled in More Action 2 immediately
6. NO completion check performed

**Expected Results:**
- After Charlie's raise, Alice enabled immediately
- No completion check after raise
- More Action 2 triggered

---

### TS-8: Pot Cascade - PreFlop to Flop

**Setup:**
- PreFlop BASE: Alice bets 2K, Bob calls 2K, Charlie calls 2K
- Pot = 6K

**Steps:**
1. Process PreFlop BASE
2. Navigate to Flop BASE
3. Verify Flop starts with existing pot of 6K
4. Alice bets 1K, Bob calls 1K, Charlie calls 1K
5. Process Flop BASE
6. Verify pot = 9K (6K from PreFlop + 3K from Flop)

**Expected Results:**
- Pot carries forward from PreFlop
- Flop contributions added to existing pot
- Correct pot calculation

---

### TS-9: Side Pot Calculation

**Setup:**
- 3 players: Alice (10K), Bob (5K), Charlie (15K)
- Alice bets 10K (all-in), Bob calls 5K (all-in), Charlie calls 10K

**Steps:**
1. Process actions
2. Calculate pots:
   - Main pot: 15K (3 players × 5K, Bob's max)
   - Side pot 1: 10K (Alice and Charlie × 5K more)
3. Verify pot display shows both pots correctly

**Expected Results:**
- Main pot: 15K (all players eligible)
- Side pot 1: 10K (Alice and Charlie eligible)
- Total: 25K

---

### TS-10: Stack History Card - Multi-Street

**Setup:**
- Complete PreFlop BASE, More Action 1
- Navigate to Flop

**Steps:**
1. Open Alice's stack history card in Flop view
2. Verify sections shown:
   - PreFlop BASE
   - PreFlop More Action 1
   - Flop BASE (current)
3. Verify each section shows Start → Now
4. Verify summary shows correct totals

**Expected Results:**
- All previous sections visible
- Correct stack progression shown
- Summary matches actual state

---

### TS-11: Raise Validation - Exceeds Now Stack

**Setup:**
- PreFlop BASE processed: Alice bet 2K, now stack = 8K
- More Action 1: Alice wants to raise

**Steps:**
1. Alice tries to raise to 12K total
2. Additional needed: 12K - 2K = 10K
3. Alice's now stack: 8K
4. System validates: 10K > 8K
5. Show error: "Cannot raise to 12K. Your current stack is 8K. Maximum raise is 10K."
6. Focus returns to amount input
7. Action NOT recorded

**Expected Results:**
- Validation catches invalid raise
- Clear error message shown
- Focus returns to input
- State not updated

---

### TS-12: Raise Validation - Below Minimum Increment

**Setup:**
- Alice bets 1K
- Bob raises to 3K (increment of 2K)
- Charlie wants to raise

**Steps:**
1. Charlie tries to raise to 4K
2. Increment would be: 4K - 3K = 1K
3. Minimum increment: 2K
4. Minimum valid raise: 3K + 2K = 5K
5. System validates: 4K < 5K
6. Show error: "Minimum raise is 5K. Previous raise increment was 2K."
7. Focus returns to amount input

**Expected Results:**
- Validation enforces minimum increment
- Clear error with explanation
- Action prevented

---

### TS-13: State Copying - Add More Action 1

**Setup:**
- PreFlop BASE processed
- Alice: Starting 10K, Now 8K (bet 2K)

**Steps:**
1. Click "Add More Action 1"
2. Verify More Action 1 state:
   - Starting: 10K (original)
   - Now: 8K (copied from BASE)
   - History: Shows PreFlop BASE
3. Alice tries to raise to 9K
4. Additional needed: 9K - 2K = 7K
5. Alice's now: 8K
6. Validation: 7K ≤ 8K ✅ VALID

**Expected Results:**
- Now stack correctly copied
- Validation uses copied Now stack
- History preserved

---

### TS-14: State Copying - Create Flop

**Setup:**
- PreFlop More Action 2 is last section
- Alice: Now 3K (after More Action 2)

**Steps:**
1. Click "Create Flop"
2. Verify Flop BASE state:
   - Starting: 3K (from PreFlop More Action 2 Now)
   - Now: 3K (initially same)
   - History: All PreFlop sections shown
3. Alice tries to bet 5K
4. Validation: 5K > 3K ❌ INVALID

**Expected Results:**
- Flop starting stack equals PreFlop ending stack
- Validation uses correct starting stack
- All history preserved

---

### TS-15: MaxBet Reset - Flop BASE

**Setup:**
- PreFlop ends with maxBet = 5K
- Navigate to Flop BASE

**Steps:**
1. Verify Flop BASE maxBet = 0 (reset, not 5K)
2. Alice bets 1K
3. Verify maxBet = 1K (not 6K)
4. Bob calls 1K
5. Display shows Bob "called 1K" (not "called 6K")

**Expected Results:**
- MaxBet resets to 0 at each street BASE
- Display shows correct bet sizes
- No carryover from previous street

---

### TS-16: History Display - Bet SIZE vs Contribution

**Setup:**
- Flop BASE: Alice bets 2K

**Steps:**
1. Process Flop BASE
2. Check history card
3. Verify display shows: "bet 2.0K" (SIZE)
4. NOT: "bet 1.0K" (contribution from stack)

**Expected Results:**
- History shows bet SIZE (total bet amount)
- Not contribution amount (stack decrease)

---

### TS-17: More Action Available Actions

**Setup:**
- More Action 1 active

**Steps:**
1. Check Alice's available actions
2. Verify enabled: call, raise, all-in, fold
3. Verify disabled: check, bet, no action
4. Try to click disabled buttons
5. Verify they don't respond

**Expected Results:**
- Only 4 actions available in More Actions
- Check/bet/no action disabled
- Disabled buttons not clickable

---

### TS-18: Process Stack - Save Pending Inputs

**Setup:**
- Alice has entered amount but not blurred input
- Amount not yet saved to state

**Steps:**
1. Type amount in Alice's input field
2. Immediately click "Process Stack" (without clicking away)
3. Verify system forces blur on all inputs
4. Verify Alice's amount is captured
5. Process continues with Alice's amount included

**Expected Results:**
- All pending inputs saved before processing
- No data loss
- Processing includes all amounts

---

### TS-19: Navigation - Street Buttons

**Setup:**
- Currently on Flop BASE

**Steps:**
1. Check bottom navigation buttons
2. Verify "← Preflop" button present
3. Verify "Create Turn →" button present
4. Click "← Preflop"
5. Verify navigated to PreFlop view
6. Click "Create Turn"
7. Verify Turn view created with Flop ending stacks

**Expected Results:**
- Navigation buttons present and functional
- State preserved during navigation
- Create button initializes next street correctly

---

### TS-20: Pot Display Modal

**Setup:**
- Main pot: 6K
- Side pot 1: 3K (Alice, Bob)
- Side pot 2: 1K (Alice only)

**Steps:**
1. Click pot display button/icon
2. Verify modal opens
3. Verify shows:
   - Main Pot: 6K
   - Side Pot 1: 3K (eligible: Alice, Bob)
   - Side Pot 2: 1K (eligible: Alice)
   - Total: 10K
4. Close modal
5. Verify modal closes properly

**Expected Results:**
- Modal displays all pot information
- Clear formatting
- Eligible players shown
- Total calculated correctly

---

### TS-21: Keyboard Navigation - Flop/Turn/River Tabbing

**Setup:**
- 3 players: Alice, Bob, Charlie
- Flop BASE round (applies to Turn/River BASE and all More Actions)

**Steps:**
1. Enter all 3 flop cards (Card 1, Card 2, Card 3)
2. Press Tab from Card 3 input
3. Verify focus moves to Alice's Action section
4. Alice selects "bet" action
5. Verify focus moves to Alice's amount input (bet requires amount)
6. Enter bet amount
7. Press Tab from amount input
8. Verify focus moves to Bob's Action section
9. Bob selects "call" action
10. Verify focus moves directly to Charlie's Action section (call doesn't need new amount)
11. Charlie selects "fold"
12. Press Tab
13. Verify focus moves to "Process Stack" button (round complete)

**Expected Results:**
- Tab flows from cards → action → amount (if bet/raise) → next action
- Skip amount input for check/call/fold/no action
- Skip all-in players automatically
- Navigate to Process Stack button after last player acts
- Same behavior in all streets and action levels

---

### TS-22: Keyboard Navigation - Skip All-In Player

**Setup:**
- 3 players: Alice, Bob, Charlie
- Turn More Action 1
- Bob is all-in from previous action

**Steps:**
1. Focus on Alice's Action section
2. Alice selects "call"
3. Press Tab from Alice's action
4. Verify focus skips Bob (who is all-in) and goes directly to Charlie's Action section
5. Charlie selects "raise"
6. Verify focus moves to Charlie's amount input
7. Enter raise amount and press Tab
8. Verify focus moves to Alice's Action section (next active player)

**Expected Results:**
- All-in players are skipped in tab order
- Tab proceeds to next active player who needs to act
- Proper circular navigation when raise triggers more action

---

### TS-23: Keyboard Navigation - Multiple Bet/Raise in Sequence

**Setup:**
- 3 players: Alice, Bob, Charlie
- River BASE round

**Steps:**
1. Alice selects "bet" action
2. Verify focus moves to amount input
3. Enter amount and Tab to Bob
4. Bob selects "raise" action
5. Verify focus moves to Bob's amount input
6. Enter raise amount and Tab
7. Verify focus moves to Charlie's Action section
8. Charlie selects "raise" action
9. Verify focus moves to Charlie's amount input
10. Enter raise amount and Tab
11. Verify "Add More Action 1" appears or More Action 1 auto-created
12. Verify focus moves to Alice's Action in More Action 1

**Expected Results:**
- Each bet/raise properly routes to amount input
- Tab from amount goes to next player
- Raise triggers More Action and focus moves appropriately
- All raise validations apply (minimum increment, stack limits, etc.)

---

## Unit Test Requirements

### UT-1: getAvailableActionsForPlayer

**Test Cases:**

```typescript
describe('getAvailableActionsForPlayer', () => {

  test('First player in BASE round gets all actions', () => {
    const actions = getAvailableActionsForPlayer(1, 'preflop', 'base');
    expect(actions).toContain('check');
    expect(actions).toContain('call');
    expect(actions).toContain('bet');
    expect(actions).toContain('raise');
    expect(actions).toContain('all-in');
    expect(actions).toContain('fold');
  });

  test('First player in post-flop BASE has no call', () => {
    const actions = getAvailableActionsForPlayer(1, 'flop', 'base');
    expect(actions).not.toContain('call');
    expect(actions).toContain('check');
  });

  test('Second player not enabled if first hasnt acted', () => {
    // First player hasn't acted yet
    const actions = getAvailableActionsForPlayer(2, 'preflop', 'base');
    expect(actions).toEqual([]);
  });

  test('Player who already acted keeps buttons enabled', () => {
    // Set player 1 action to 'bet'
    setPlayerAction(1, 'bet');
    const actions = getAvailableActionsForPlayer(1, 'preflop', 'more');
    expect(actions.length).toBeGreaterThan(0);
  });

  test('More Action only has 4 actions', () => {
    const actions = getAvailableActionsForPlayer(1, 'preflop', 'more');
    expect(actions).toContain('call');
    expect(actions).toContain('raise');
    expect(actions).toContain('all-in');
    expect(actions).toContain('fold');
    expect(actions).not.toContain('check');
    expect(actions).not.toContain('bet');
  });

  test('All-in player from previous street locked', () => {
    setPlayerAllIn(1, true);
    const actions = getAvailableActionsForPlayer(1, 'flop', 'base');
    expect(actions).toEqual(['all-in']);
  });
});
```

---

### UT-2: checkBettingRoundComplete

**Test Cases:**

```typescript
describe('checkBettingRoundComplete', () => {

  test('All players folded - round complete', () => {
    setPlayerAction(1, 'fold');
    setPlayerAction(2, 'fold');
    const result = checkBettingRoundComplete('preflop', 'base');
    expect(result.isComplete).toBe(true);
    expect(result.reason).toBe('all-folded');
  });

  test('Only one player remains - round complete', () => {
    setPlayerAction(1, 'bet');
    setPlayerAction(2, 'fold');
    setPlayerAction(3, 'fold');
    const result = checkBettingRoundComplete('preflop', 'base');
    expect(result.isComplete).toBe(true);
    expect(result.reason).toBe('one-remaining');
  });

  test('All players matched - round complete', () => {
    setPlayerAction(1, 'bet', 100);
    setPlayerAction(2, 'call', 100);
    setPlayerAction(3, 'call', 100);
    const result = checkBettingRoundComplete('preflop', 'base');
    expect(result.isComplete).toBe(true);
    expect(result.reason).toBe('matched-up');
  });

  test('Not all players acted - round not complete', () => {
    setPlayerAction(1, 'bet', 100);
    setPlayerAction(2, 'call', 100);
    // Player 3 hasn't acted
    const result = checkBettingRoundComplete('preflop', 'base');
    expect(result.isComplete).toBe(false);
  });

  test('Raise happened - round not complete', () => {
    setPlayerAction(1, 'bet', 100);
    setPlayerAction(2, 'raise', 200);
    // Player 1 hasn't responded to raise
    const result = checkBettingRoundComplete('preflop', 'base');
    expect(result.isComplete).toBe(false);
  });
});
```

---

### UT-3: validateRaiseAmount

**Test Cases:**

```typescript
describe('validateRaiseAmount', () => {

  test('Raise exceeds now stack - invalid', () => {
    setPlayerStack(1, { now: 8000 });
    setPlayerContribution(1, 2000);
    const result = validateRaiseAmount(1, 12000, 'preflop', 'more');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('current stack is');
  });

  test('Raise within now stack - valid', () => {
    setPlayerStack(1, { now: 8000 });
    setPlayerContribution(1, 2000);
    const result = validateRaiseAmount(1, 9000, 'preflop', 'more');
    expect(result.valid).toBe(true);
  });

  test('Raise below max bet - invalid', () => {
    setMaxBet('preflop', 'base', 5000);
    const result = validateRaiseAmount(1, 3000, 'preflop', 'base');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be greater than current max bet');
  });

  test('Raise below minimum increment - invalid', () => {
    // Alice bet 1K, Bob raised to 3K (increment 2K)
    setPreviousBet('preflop', 'base', 1000);
    setMaxBet('preflop', 'base', 3000);
    // Charlie tries to raise to 4K (increment 1K)
    const result = validateRaiseAmount(3, 4000, 'preflop', 'base');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Minimum raise is');
  });

  test('PreFlop BASE - raise exceeds starting stack - invalid', () => {
    setPlayerStack(1, { starting: 10000 });
    const result = validateRaiseAmount(1, 12000, 'preflop', 'base');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('starting stack');
  });
});
```

---

### UT-4: processStackSynchronous

**Test Cases:**

```typescript
describe('processStackSynchronous', () => {

  test('Calculate stacks after bets', () => {
    setPlayerAction(1, 'bet', 2000);
    setPlayerAction(2, 'call', 2000);
    const result = processStackSynchronous('preflop', 'base', {1: 10000, 2: 10000});
    expect(result.updatedStacks[1]).toBe(8000);
    expect(result.updatedStacks[2]).toBe(8000);
  });

  test('MaxBet tracking after raise', () => {
    setPlayerAction(1, 'bet', 1000);
    setPlayerAction(2, 'raise', 3000);
    const result = processStackSynchronous('preflop', 'base', {1: 10000, 2: 10000});
    expect(result.maxBet).toBe(3000);
  });

  test('Auto-convert insufficient call to all-in', () => {
    setPlayerAction(1, 'bet', 5000);
    setPlayerAction(2, 'call', 5000);  // But player 2 only has 3000
    const result = processStackSynchronous('preflop', 'base', {1: 10000, 2: 3000});
    expect(result.updatedPlayerData[2].action).toBe('all-in');
    expect(result.updatedStacks[2]).toBe(0);
  });

  test('Contribution amounts tracked correctly', () => {
    setPlayerAction(1, 'bet', 2000);
    const result = processStackSynchronous('preflop', 'base', {1: 10000});
    expect(result.contributedAmounts[1]).toBe(2000);
  });

  test('More Action uses cumulative contributions', () => {
    // BASE: Alice bet 2K
    const alreadyContributed = { 1: 2000 };
    // More Action: Alice raises to 5K (additional 3K)
    setPlayerAction(1, 'raise', 5000);
    const result = processStackSynchronous(
      'preflop', 'more',
      {1: 8000},  // After BASE
      playerData,
      alreadyContributed
    );
    expect(result.contributedAmounts[1]).toBe(3000);  // Additional only
  });
});
```

---

### UT-5: copyStateToNewSection

**Test Cases:**

```typescript
describe('copyStateToNewSection', () => {

  test('Add More Action 1 copies Now stack', () => {
    const baseState = {
      stacks: { 1: { starting: 10000, now: 8000 } }
    };
    const more1State = copyStateToNewSection(baseState, 'more');
    expect(more1State.stacks[1].starting).toBe(10000);
    expect(more1State.stacks[1].now).toBe(8000);
  });

  test('Create Flop copies last PreFlop section', () => {
    const preflopMore2State = {
      stacks: { 1: { starting: 10000, now: 3000 } }
    };
    const flopState = copyStateToNewStreet(preflopMore2State, 'flop');
    expect(flopState.stacks[1].starting).toBe(3000);  // PreFlop ending
    expect(flopState.stacks[1].now).toBe(3000);
  });

  test('History copied to new section', () => {
    const baseState = {
      historyCard: { sections: [{ name: 'PreFlop BASE', ... }] }
    };
    const more1State = copyStateToNewSection(baseState, 'more');
    expect(more1State.historyCard.sections.length).toBe(1);
  });
});
```

---

### UT-6: calculatePotsForBettingRound

**Test Cases:**

```typescript
describe('calculatePotsForBettingRound', () => {

  test('Simple pot - all players equal', () => {
    const contributions = { 1: 2000, 2: 2000, 3: 2000 };
    const pots = calculatePotsForBettingRound(contributions);
    expect(pots.mainPot).toBe(6000);
    expect(pots.sidePots.length).toBe(0);
  });

  test('Side pot - one all-in player', () => {
    const contributions = { 1: 10000, 2: 5000, 3: 10000 };
    const pots = calculatePotsForBettingRound(contributions);
    expect(pots.mainPot).toBe(15000);  // 3 × 5000
    expect(pots.sidePots.length).toBe(1);
    expect(pots.sidePots[0].amount).toBe(10000);  // 2 × 5000
  });

  test('Multiple side pots', () => {
    const contributions = { 1: 10000, 2: 5000, 3: 15000 };
    const pots = calculatePotsForBettingRound(contributions);
    expect(pots.mainPot).toBe(15000);  // 3 × 5000
    expect(pots.sidePots.length).toBe(2);
    expect(pots.sidePots[0].amount).toBe(10000);  // Alice and Charlie × 5000
    expect(pots.sidePots[1].amount).toBe(5000);   // Charlie only × 5000
  });

  test('Pot cascade across streets', () => {
    const preflopPots = { mainPot: 6000, sidePots: [] };
    const flopContributions = { 1: 1000, 2: 1000, 3: 1000 };
    const totalPots = cascadePots(preflopPots, flopContributions);
    expect(totalPots.mainPot).toBe(9000);
  });
});
```

---

## Validation Rules

### VR-1: Raise Amount Validation

| Rule | Condition | Error Message |
|------|-----------|---------------|
| VR-1.1 | `additionalNeeded > nowStack` | "Cannot raise to {amount}. Your current stack is {nowStack}. Maximum raise is {max}." |
| VR-1.2 | `raiseAmount <= currentMaxBet` | "Raise amount ({amount}) must be greater than current max bet ({maxBet})." |
| VR-1.3 | `raiseAmount < minValidRaise` | "Minimum raise is {minValidRaise}. Previous raise increment was {increment}." |
| VR-1.4 | `raiseAmount > startingStack` (PreFlop BASE only) | "Cannot raise to {amount}. Your starting stack is {startingStack}." |

### VR-2: Action Validation

| Rule | Condition | Error Message |
|------|-----------|---------------|
| VR-2.1 | Bet/Raise without amount | "Amount Required! {player} has action '{action}' but no amount entered." |
| VR-2.2 | Check when bet exists (More Action) | Button disabled |
| VR-2.3 | Bet when bet exists (More Action) | Button disabled |

### VR-3: Round Completion

| Condition | Result |
|-----------|--------|
| All players folded | Round complete |
| Only one player remains | Round complete |
| All active players matched max bet | Round complete |
| Player hasn't responded to raise | Round NOT complete |

---

## State Management

### SM-1: Stack State Lifecycle

```
Setup Stack
  ↓ Starting = Now = initial
Process BASE
  ↓ Now updated
Add More Action 1
  ↓ Copy Now to More1.Starting and More1.Now
Process More Action 1
  ↓ More1.Now updated
Add More Action 2
  ↓ Copy More1.Now to More2.Starting and More2.Now
Process More Action 2
  ↓ More2.Now updated
Create Flop
  ↓ Copy last section Now to Flop.Starting and Flop.Now
```

### SM-2: State Keys

```typescript
// Section states stored with keys:
'preflop_base'
'preflop_more'
'preflop_more2'
'flop_base'
'flop_more'
'flop_more2'
'turn_base'
'turn_more'
'turn_more2'
'river_base'
'river_more'
'river_more2'
```

### SM-3: Player Data Keys

```typescript
// Action keys:
'preflop_action'
'preflop_moreAction_action'
'preflop_moreAction2_action'
// ... same pattern for flop, turn, river

// Amount keys:
'preflop_amount'
'preflop_moreAction_amount'
// ... same pattern

// Unit keys:
'preflop_unit'
'preflop_moreAction_unit'
// ... same pattern
```

---

## Edge Cases

### EC-1: All Players All-In

**Scenario:** All active players go all-in at different amounts

**Expected Behavior:**
- Multiple side pots created
- Round marked complete
- No more actions possible
- All side pots calculated correctly

### EC-2: Last Player Folds

**Scenario:** Only two players left, one folds

**Expected Behavior:**
- Round immediately complete
- Remaining player wins
- Pot awarded
- No more actions needed

### EC-3: First Player All-In, Second Player Also All-In

**Scenario:** First player all-in from previous street, second player goes all-in in current street

**Expected Behavior:**
- First player locked to all-in
- Second player can select all-in
- Third player becomes next to act
- Side pots calculated correctly

### EC-4: Raise in More Action 2 with Insufficient Funds

**Scenario:** Player tries to raise in More Action 2 but doesn't have enough chips

**Expected Behavior:**
- Validation catches insufficient funds
- Error message shows maximum possible
- Action not recorded
- Focus returns to input

### EC-5: Navigation Between Streets with Pending Changes

**Scenario:** User enters actions in Flop, navigates to PreFlop without processing

**Expected Behavior:**
- Pending changes preserved or discarded (TBD)
- Warning shown if changes not processed (TBD)
- State consistency maintained

### EC-6: Process Stack with Empty Actions

**Scenario:** User clicks Process Stack when no players have acted

**Expected Behavior:**
- Validation prevents processing or
- Processes with no changes (stacks unchanged)
- Clear feedback to user

### EC-7: All-In Less Than Current Bet

**Scenario:** Player goes all-in for amount less than current max bet

**Expected Behavior:**
- All-in accepted (player can't bet more)
- Acts like a call (doesn't reopen action)
- Side pot created
- Next player enabled based on completion check

### EC-8: Minimum Raise with Decimal Values

**Scenario:** Bets involve decimal amounts, minimum raise calculation

**Expected Behavior:**
- Decimal math handled correctly
- No floating-point errors
- Display formats decimals consistently

### EC-9: Create Street from BASE When More Actions Exist

**Scenario:** More Action 1 exists but user tries to create next street from BASE

**Expected Behavior:**
- System uses LAST section (More Action 1, not BASE)
- Warning shown or
- Prevent creation until More Actions processed

### EC-10: Pot Display with Many Side Pots

**Scenario:** 6+ players, multiple all-ins, 4+ side pots

**Expected Behavior:**
- Modal displays all pots clearly
- Scrollable if necessary
- Each pot labeled correctly
- Total calculated correctly

---

## Development Workflow

### When Starting a New Session:

1. **Read this document thoroughly**
2. **Review current todo list**
3. **Identify which feature/test scenario to implement**
4. **Write unit tests first** (TDD approach)
5. **Implement feature**
6. **Run unit tests**
7. **Perform manual testing** using test scenarios
8. **Update this document** if requirements change
9. **Commit changes** with reference to test scenario

### When Implementing a Feature:

1. **Reference FR (Feature Requirement) number** in code comments
2. **Reference TS (Test Scenario) number** in test files
3. **Reference VR (Validation Rule) number** in validation code
4. **Write unit tests** before implementation
5. **Test manually** using defined test scenarios
6. **Document edge cases** encountered
7. **Update test scenarios** if needed

### When a Bug is Found:

1. **Create new test scenario** that reproduces bug
2. **Add unit test** that fails with bug
3. **Fix bug**
4. **Verify unit test passes**
5. **Verify test scenario passes**
6. **Document in edge cases** section if applicable

---

## Review Checklist

At the start of each session, verify understanding of:

- [ ] Sequential enabling logic (FR-1, TS-1, TS-2)
- [ ] First player button states (FR-2, TS-3, TS-4)
- [ ] More Action purpose and behavior (FR-9, TS-5, TS-6, TS-7)
- [ ] Call vs Raise completion check logic (FR-9.3, TS-6, TS-7)
- [ ] Raise validation rules (FR-12, VR-1, TS-11, TS-12)
- [ ] Keyboard navigation and tabbing behavior (FR-13, TS-21, TS-22, TS-23)
- [ ] State copying between sections (FR-14, TS-13, TS-14)
- [ ] MaxBet reset per street (FR-7, TS-15)
- [ ] Pot calculation cascade (FR-3, TS-8, TS-9)
- [ ] History card display (FR-4, TS-10, TS-16)

---

## Glossary

| Term | Definition |
|------|------------|
| **BASE** | The initial betting round for each street (PreFlop BASE, Flop BASE, etc.) |
| **More Action 1** | Secondary betting round triggered when a player raises in BASE |
| **More Action 2** | Tertiary betting round triggered when a player raises in More Action 1 |
| **Starting Stack** | Player's chips at the beginning of a section (copied from previous section's Now) |
| **Now Stack** | Player's current chips after processing actions in a section |
| **MaxBet** | Highest bet amount in current betting round |
| **Contribution** | Amount taken from player's stack for current action |
| **Total Bet** | Cumulative amount player has put into pot for current street |
| **Raise Increment** | Difference between current max bet and previous bet |
| **Side Pot** | Secondary pot created when a player goes all-in for less than max bet |
| **Section** | A specific betting round (e.g., preflop_base, flop_more, etc.) |
| **Street** | A game phase (PreFlop, Flop, Turn, River) |

---

## Document History

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-06 | 1.0 | Initial document creation with all discussed requirements |
| 2025-01-06 | 1.1 | Added FR-13: Keyboard Navigation and Tabbing Behavior requirement for Flop/Turn/River. Added test scenarios TS-21, TS-22, TS-23. Updated FR numbering (old FR-13 → FR-14). |

---

**END OF DOCUMENT**
