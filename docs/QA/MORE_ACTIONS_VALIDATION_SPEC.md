# More Actions Validation Specification

## Purpose

This document defines the validation rules for "More Action" (extended betting rounds) test cases.
Use this spec when:
1. Manually creating More Action test cases
2. Validating existing test cases
3. Building automated validation scripts

---

## Core Concept: When Does "More Action" Occur?

A "More Action" round occurs when a **legal raise** reopens betting for players who have already acted.

### Terminology

| Term | Definition |
|------|------------|
| **Base Action** | Initial betting round on a street |
| **More Action 1** | Second betting round (triggered by a raise) |
| **More Action 2** | Third betting round (triggered by another raise in More Action 1) |
| **Last Aggressor** | Player who made the most recent raise |
| **Full Raise** | A raise that meets or exceeds the minimum raise increment |
| **All-in for Less** | An all-in that is less than a full raise |

---

## Rule 1: Full Raise Reopens Betting

**Definition:** A raise that meets the minimum raise increment reopens betting.

**Minimum Raise Calculation:**
```
Minimum Raise Amount = Previous Bet + (Previous Bet - Bet Before That)

Example:
- Player A bets 10K
- Player B raises to 25K (raise increment = 15K)
- Minimum re-raise = 25K + 15K = 40K
```

**Validation Check:**
- [ ] If a player raises to X, verify X >= (previous bet + raise increment)
- [ ] If it's a full raise, betting reopens for all players who acted before

---

## Rule 2: All-In for Less Does NOT Reopen Betting (CRITICAL)

**Definition:** When a player goes all-in for an amount LESS than a full raise, it does NOT reopen betting for the last aggressor.

**Example Scenario:**
```
Turn:
- Alice bets 20K
- Bob raises to 50K (raise increment = 30K, so min re-raise = 80K)
- Charlie goes all-in for 65K (only 15K more than Bob's 50K)
- Alice calls 50K

Question: Does Bob get to act again?
Answer: NO - Charlie's all-in (65K) is less than a full raise (80K)
        Bob was the last aggressor, Alice called him
        Betting round is COMPLETE
```

**Validation Checks:**
- [ ] Calculate the minimum raise amount for each raise
- [ ] If all-in amount < minimum raise, it's "all-in for less"
- [ ] If all-in for less occurs, the last aggressor does NOT get another action
- [ ] There is NO "More Action 2" if More Action 1 contains only an all-in for less

---

## Rule 3: More Action 2 Requirements

**More Action 2 occurs ONLY when:**
1. More Action 1 contains a **FULL RAISE** (not just an all-in for less)
2. The full raise is made by someone OTHER than the last aggressor from Base
3. Players who acted before the raise get a chance to respond

**More Action 2 does NOT occur when:**
- More Action 1 contains only calls and/or all-ins for less
- The last aggressor from Base is simply called (even with intervening all-ins for less)

---

## Validation Checklist for Test Cases

### For Each Street with More Actions:

#### Step 1: Identify the Last Aggressor
- [ ] Who made the last FULL raise?
- [ ] Record their bet amount and the raise increment

#### Step 2: Check Each Subsequent Action
For each action after the last aggressor:

- [ ] Is it a CALL? → Does not reopen betting
- [ ] Is it a FOLD? → Does not reopen betting
- [ ] Is it an ALL-IN?
  - Calculate: Is the all-in amount >= (last bet + raise increment)?
  - If YES → Full raise, DOES reopen betting
  - If NO → All-in for less, does NOT reopen betting

#### Step 3: Determine if More Action 2 is Needed
- [ ] Was there a FULL raise in More Action 1? → YES = More Action 2 needed
- [ ] Were there only calls/folds/all-ins-for-less? → NO More Action 2

---

## Test Case Validation Examples

### Example 1: NO More Action 2 (All-in for Less)

```
Flop:
- Base: Charlie bets 10K, David raises to 20K, Alice calls 20K
- More 1: Bob folds, Charlie raises to 30K, David all-in 28K, Alice calls 30K

Analysis:
- Charlie's raise to 30K in More 1 → raise increment = 10K (30K - 20K)
- David's all-in of 28K < 30K → Does NOT meet minimum call even
- Wait, David's all-in is his TOTAL contribution, not additional
- If David already put in 20K and goes all-in for 28K total, that's only 8K more
- 8K < 10K raise increment = ALL-IN FOR LESS
- Charlie was last aggressor (30K), Alice called 30K
- Charlie does NOT get another action

Result: NO More Action 2
```

### Example 2: YES More Action 2 (Full Re-raise)

```
Preflop:
- Base: Alice raises to 3K, Bob re-raises to 9K, Charlie calls 9K
- More 1: Alice re-raises to 25K, Bob calls 25K, Charlie calls 25K

Analysis:
- Alice's re-raise to 25K → increment = 16K (25K - 9K)
- This is a FULL raise (16K > 6K min increment of 9K-3K)
- Bob and Charlie need to act again

Result: YES More Action 2
- More 2: Bob and Charlie can call/fold (no more raises allowed per TDA rules)
```

---

## Specific Validation Rules by Street

### Preflop

1. Action starts UTG (or SB in heads-up)
2. BB has option if everyone limps
3. Raise reopening follows standard rules

### Postflop (Flop/Turn/River)

1. Action starts with first active player after button
2. Check is allowed if no bet
3. Raise reopening follows standard rules

---

## Common Mistakes to Catch

### Mistake 1: Adding More Action 2 When It Shouldn't Exist

**Wrong:**
```
More Action 1: Bob raises 55K, Charlie all-in 17K, Alice calls 55K
More Action 2: Bob calls (NO - this is wrong!)
```

**Correct:**
```
More Action 1: Bob raises 55K, Charlie all-in 17K, Alice calls 55K
(NO More Action 2 - Charlie's 17K < minimum raise, Bob was called by Alice)
```

### Mistake 2: Missing More Action 2 When It Should Exist

**Wrong:**
```
More Action 1: Bob re-raises to 100K, Charlie calls 100K
(Missing More Action 2 for original raiser)
```

**Correct:**
```
More Action 1: Bob re-raises to 100K, Charlie calls 100K
More Action 2: Alice (original raiser) calls/folds
```

---

## Validation Script Requirements

When implementing automated validation:

```python
def validate_more_actions(street_actions):
    """
    Validate More Action assignments for a street.

    Returns:
        - errors: List of validation errors
        - warnings: List of potential issues
    """

    # Track state
    current_bet = 0
    last_raise_increment = 0  # For calculating min raise
    last_aggressor = None
    players_who_acted = set()

    for action in street_actions:
        if action.type == 'RAISE':
            raise_to = action.amount
            raise_increment = raise_to - current_bet

            # Check if it's a full raise
            min_raise = current_bet + last_raise_increment
            if raise_to >= min_raise or last_raise_increment == 0:
                # Full raise - reopens betting
                last_aggressor = action.player
                last_raise_increment = raise_increment
                current_bet = raise_to
                players_who_acted = {action.player}
            else:
                # All-in for less - does NOT reopen betting
                pass  # Don't change last_aggressor

        elif action.type == 'CALL':
            players_who_acted.add(action.player)

        elif action.type == 'ALL_IN':
            allin_amount = action.amount
            min_raise = current_bet + last_raise_increment

            if allin_amount >= min_raise:
                # Full raise all-in - reopens betting
                last_aggressor = action.player
                # ... update state
            else:
                # All-in for less - does NOT reopen betting
                # DO NOT update last_aggressor
                pass
```

---

## Summary: The Golden Rule

**"An all-in for less than a full raise does NOT reopen betting for the last aggressor."**

This means:
1. Calculate the minimum raise amount
2. If all-in < minimum raise → It's "all-in for less"
3. If all-in for less → Last aggressor doesn't act again
4. If last aggressor was called → Betting round is complete
5. NO More Action 2 in this case

---

## Document Version

- Version: 1.0
- Created: 2025-12-23
- Based on: TDA Rules for All-in Below Minimum Raise
