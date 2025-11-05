# More Action Player Enablement Logic

**Document Version:** 1.0
**Date:** 2025-11-05
**Project:** HHTool Modular - Poker Hand History Tool

---

## Overview

This document defines the sequential player enablement logic for More Action rounds (More Action 1 and More Action 2) in the preflop betting phase. The logic ensures that players are evaluated and enabled one at a time, in position order, with automatic skipping for players who don't need to act.

---

## Core Principles

### 1. Sequential Evaluation
- Only **ONE** player is evaluated at a time (the next player in position order)
- Never evaluate multiple players simultaneously
- Never use bulk checking to disable all remaining players

### 2. One-at-a-Time Enabling
- Only evaluate Player N+1 **AFTER** Player N has acted (or been auto-skipped)
- Stop the evaluation chain when a player needs to act
- Wait for user input before continuing to next player

### 3. Auto-Skip Conditions
Players can be automatically skipped (no user action required) when:
- **Already matched max bet**: Player's cumulative contribution from previous rounds already equals the current maximum bet
- **Already all-in**: Player went all-in in a previous round and cannot act further

### 4. Previous Round Context
- **More Action 1**: Check BASE round for all-in status and max bet matching
- **More Action 2**: Check BASE + More Action 1 rounds for all-in status and max bet matching

---

## Sequential Evaluation Flow

### Step 1: Player 1 (First Player in More Action)
```
Player 1: Always enabled with full action buttons
User acts → Trigger evaluation of Player 2
```

**Available Actions:** call, raise, fold, all-in, no action

---

### Step 2: After Player 1 Acts → Evaluate Player 2

**Check Player 2's Status:**

#### Case A: Already Matched Max Bet from Previous Round
- **Example**: In More Action 1, Player 2 raised to 5K in BASE, current max is still 5K
- **UI Display**: Remove all action buttons, show text "No action required"
- **Styling**: Subtle gray text, small font, centered in action column
- **Behavior**: AUTO-SKIP to Player 3 evaluation immediately (no user input needed)

#### Case B: Already All-In from Previous Round
- **Example**: In More Action 1, Player 2 went all-in during BASE round
- **UI Display**: Show ONLY the all-in button as selected/highlighted, all other buttons disabled or hidden
- **Styling**: All-in button with orange background and ring highlight, other buttons grayed out
- **Behavior**: AUTO-SKIP to Player 3 evaluation immediately (visual confirmation only)

#### Case C: Needs to Act
- **Condition**: Player 2 has NOT matched the current max bet AND is NOT all-in
- **UI Display**: Enable all required action buttons
- **Available Actions**: call, raise, fold, all-in, no action
- **Behavior**: STOP evaluation chain, wait for Player 2 to act

---

### Step 3: After Player 2 Acts (or Auto-Skips) → Evaluate Player 3

**Check Player 3's Status:**

#### Case A: Already Matched Max Bet
- **UI**: "No action required" text
- **Behavior**: AUTO-SKIP to Player 4

#### Case B: Already All-In
- **UI**: All-in button selected, other buttons disabled
- **Behavior**: AUTO-SKIP to Player 4

#### Case C: Needs to Act
- **UI**: Enable action buttons
- **Behavior**: STOP evaluation, wait for Player 3 to act

---

### Step 4+: Continue Pattern Through All Players

Repeat the same evaluation logic for Player 4, Player 5, etc., until:
- All players have acted or been auto-skipped
- Round is complete → Focus on "Process Stack" button

---

## Visual States

### State 1: Enabled Player (Needs to Act)
**Action Buttons:**
- All enabled: call, raise, fold, all-in, no action
- Normal button colors (blue, purple, red, orange, gray)
- Hover effects active

**Appearance:**
- Buttons have full opacity
- Click handlers active
- Keyboard shortcuts functional

---

### State 2: Auto-Skip - Max Bet Matched
**Action Buttons:**
- Completely removed from UI
- No button elements rendered

**Display Instead:**
```html
<div class="text-xs text-gray-500 text-center py-2">
  No action required
</div>
```

**Styling:**
- Gray text (#6B7280)
- Small font (text-xs)
- Centered alignment
- Subtle, clean appearance
- Minimal padding

---

### State 3: Auto-Skip - All-In
**Action Buttons:**
- Only all-in button visible
- All-in button shown as selected (orange background, ring highlight)
- Other buttons hidden or disabled (grayed out, opacity 50%)

**Appearance:**
```
All-in button: bg-orange-500, ring-2, ring-blue-400
Other buttons: bg-gray-100, opacity-50, cursor-not-allowed
```

**Purpose:**
- Visual confirmation that player is all-in
- No user interaction possible (buttons locked)

---

## Implementation Requirements

### Function: `getAvailableActionsForPlayer(playerId, suffix)`

**Current Behavior (INCORRECT):**
```typescript
// WRONG: Checks if entire round is complete
const completionCheck = checkBettingRoundComplete('preflop', actionLevel, players, playerData);
if (completionCheck.isComplete) {
  return []; // Disables ALL remaining players at once
}
```

**Required Behavior (CORRECT):**
```typescript
// RIGHT: Check if THIS SPECIFIC PLAYER needs to act
const playerStatus = checkPlayerNeedsToAct(playerId, actionLevel, playerData);

if (playerStatus.alreadyMatchedMaxBet) {
  // Case A: Player already matched max bet
  return ['no-action-required']; // Special flag for UI to show "No action required"
}

if (playerStatus.alreadyAllIn) {
  // Case B: Player is all-in from previous round
  return ['all-in-locked']; // Special flag for UI to show locked all-in button
}

// Case C: Player needs to act
return ['call', 'raise', 'all-in', 'fold', 'no action'];
```

---

### Function: `checkPlayerNeedsToAct(playerId, actionLevel, playerData)`

**Purpose:** Determine if a specific player needs to act in the current More Action round

**Return Type:**
```typescript
interface PlayerActionStatus {
  needsToAct: boolean;
  alreadyMatchedMaxBet: boolean;
  alreadyAllIn: boolean;
  cumulativeContribution: number;
  maxContribution: number;
}
```

**Logic:**

1. **Calculate player's cumulative contribution from previous rounds:**
   - For More Action 1: Posted blinds/antes + BASE action amount
   - For More Action 2: Posted blinds/antes + BASE action amount + More Action 1 amount

2. **Calculate current maximum contribution:**
   - Find the highest cumulative contribution among all active players
   - Include contributions from BASE + current More Action round

3. **Check if player is all-in:**
   - For More Action 1: Check if player went all-in in BASE
   - For More Action 2: Check if player went all-in in BASE or More Action 1

4. **Determine status:**
   ```typescript
   if (player is all-in from previous round) {
     return { needsToAct: false, alreadyAllIn: true };
   }

   if (player's cumulative contribution >= max contribution) {
     return { needsToAct: false, alreadyMatchedMaxBet: true };
   }

   return { needsToAct: true };
   ```

---

## Navigation Flow

### After Player Acts or Auto-Skips

**Function: `navigateAfterAction(currentPlayerId, suffix)`**

**Logic:**
```
1. Get activePlayers (not folded, sorted by position)
2. Find current player index
3. Calculate next player index (currentIndex + 1)

4. If next player exists:
   a. Evaluate next player's status
   b. If next player needs to act:
      - Focus on next player's Action column
      - STOP evaluation chain
   c. If next player auto-skipped:
      - Continue to player after that (recursively)

5. If no more players:
   - Focus on "Process Stack" button
```

**Key Difference from Current Implementation:**
- Don't just focus on next player blindly
- Evaluate next player's status FIRST
- If auto-skip, continue to player after that
- Only stop when finding a player who needs to act

---

## Example Scenario

### Scenario: 4 Players in More Action 1

**BASE Round Results:**
- Alice (UTG): Called 1K
- Charlie (UTG+1): Raised 3K
- David (UTG+2): All-in 2K (forced all-in, ran out of chips)
- Bob (BB): Called 3K

**More Action 1 Begins:**

**Step 1: Alice Enabled**
- Alice is first player
- Buttons enabled: call, raise, fold, all-in, no action
- Alice clicks "call"

**Step 2: Evaluate Charlie**
- Check Charlie's status:
  - Cumulative contribution from BASE: 3K (raised to 3K)
  - Current max: 3K (no new bets in More Action 1 yet)
  - Already matched? YES
- UI: Show "No action required"
- AUTO-SKIP to David

**Step 3: Evaluate David**
- Check David's status:
  - Already all-in in BASE? YES
- UI: Show all-in button selected, others disabled
- AUTO-SKIP to Bob

**Step 4: Evaluate Bob**
- Check Bob's status:
  - Cumulative contribution from BASE: 3K (called 3K)
  - Current max: 3K
  - Already matched? YES
- UI: Show "No action required"
- No more players → Focus on "Process Stack" button

**Result:**
- Alice acted (called)
- Charlie auto-skipped (already matched)
- David auto-skipped (all-in)
- Bob auto-skipped (already matched)
- Round complete → Ready to process stack

---

## Edge Cases

### Edge Case 1: Player Raises in More Action

**Scenario:**
- Alice calls in More Action 1
- Charlie (who raised 3K in BASE) raises to 5K in More Action 1

**Result:**
- David (all-in) auto-skipped
- Bob now NEEDS to act (contribution 3K < max 5K)
- Bob enabled with full action buttons

### Edge Case 2: All Players Auto-Skipped After First Player

**Scenario:**
- All players called the same amount in BASE
- First player (Alice) calls in More Action 1
- All other players already matched max bet

**Result:**
- Charlie auto-skipped
- David auto-skipped
- Bob auto-skipped
- Focus immediately on "Process Stack" button

### Edge Case 3: Multiple All-Ins

**Scenario:**
- Alice all-in 1K in BASE
- Charlie all-in 2K in BASE
- David raised 5K in BASE
- Bob called 5K in BASE

**More Action 1:**
- Alice: auto-skipped (all-in)
- Charlie: auto-skipped (all-in)
- David: enabled first (first non-all-in player)
- David acts
- Bob: evaluate based on David's action

---

## Testing Requirements

### Test Case 1: Sequential Enabling
- First player enabled
- Second player disabled until first acts
- Third player disabled until second acts

### Test Case 2: Auto-Skip - Max Bet Matched
- Player who raised in BASE is auto-skipped in More Action 1
- UI shows "No action required"

### Test Case 3: Auto-Skip - All-In
- Player who went all-in in BASE is auto-skipped in More Action 1
- UI shows all-in button locked

### Test Case 4: Raise in More Action
- Player raises in More Action 1
- Subsequent players who already matched in BASE now need to act

### Test Case 5: All Players Auto-Skipped
- First player acts
- All remaining players auto-skipped
- Focus moves to "Process Stack" button

---

## Key Differences from Current Implementation

| Current (WRONG) | Required (CORRECT) |
|----------------|-------------------|
| Uses `checkBettingRoundComplete()` to disable all remaining players | Evaluates each player individually |
| Checks round completion as a whole | Checks if specific player needs to act |
| Enables next player without checking status | Evaluates next player before enabling |
| No auto-skip logic | Auto-skip players who don't need to act |
| No "No action required" state | Shows "No action required" for matched players |
| No locked all-in state | Shows locked all-in button for all-in players |

---

## File Locations

### Files to Modify
1. `src/components/game/PreFlopView.tsx`
   - Function: `getAvailableActionsForPlayer()`
   - Function: `navigateAfterAction()`

2. `src/lib/poker/validators/roundCompletionValidator.ts`
   - Add new function: `checkPlayerNeedsToAct()`

3. `src/components/poker/ActionButtons.tsx`
   - Handle new states: 'no-action-required', 'all-in-locked'

### New Files to Create
1. `src/lib/poker/validators/playerActionStatus.ts`
   - Contains `checkPlayerNeedsToAct()` function
   - Contains helper functions for contribution calculation

---

## Summary

The More Action player enablement logic must:
1. Enable players **sequentially**, one at a time
2. Evaluate each player's status before enabling
3. Auto-skip players who don't need to act
4. Show clear visual states for each scenario
5. Only stop evaluation when a player needs to act
6. Never bulk-disable multiple players at once

This ensures a smooth, intuitive user experience where players are only prompted to act when necessary.

---

**End of Document**
