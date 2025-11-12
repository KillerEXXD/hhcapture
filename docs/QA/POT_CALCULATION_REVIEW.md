# Pot Calculation Algorithm Review and Edge Cases

**Date**: 2025-11-12
**Algorithm Location**: `docs/QA/sidepot_calculator.py`
**Test Coverage**: 50 test cases (40 base + 10 extended action cases)

---

## Current Algorithm Overview

### Core Logic (`calculate_side_pots`)

```python
1. Identify BB player (who pays ante as dead money)
2. Calculate live contributions (total - ante for BB)
3. Sort players by live contribution amount
4. Create unique contribution levels (where all-ins occur)
5. Build pots from lowest to highest level:
   - Pot amount = (level - prev_level) × remaining_players
   - Add BB ante to main pot
   - Track eligible players (those contributing >= level)
6. Calculate percentages of total pot
```

### Key Features
- ✅ Handles BB ante as dead money (added only to main pot)
- ✅ Creates multiple side pots based on all-in levels
- ✅ Tracks eligible players for each pot
- ✅ Calculates pot percentages

---

## Validation Results

### Overall Performance
- **40 Base Test Cases**:
  - Side Pot Structure: **100% PASSED** (40/40)
  - Bet Amounts: **77.5% PASSED** (31/40)

- **10 Extended Action Cases**:
  - Side Pot Structure: Not validated yet
  - Bet Amounts: **60% PASSED** (6/10)

---

## Edge Cases Currently Handled ✅

### 1. BB Ante as Dead Money
**Status**: ✅ HANDLED
**Logic**: Lines 23-26 subtract ante from BB's live contribution
```python
if bb_player and p.name == bb_player.name:
    live_contrib -= bb_ante  # Ante is dead money
```

### 2. Multiple All-In Levels
**Status**: ✅ HANDLED
**Logic**: Lines 38-48 create unique contribution levels
```python
unique_levels = sorted(set(c['live'] for c in contributions))
```

### 3. Pot Eligibility
**Status**: ✅ HANDLED
**Logic**: Lines 54-56 track eligible players
```python
eligible = [c['player'] for c in contributions if c['live'] >= level]
```

### 4. Decreasing Player Pool
**Status**: ✅ HANDLED
**Logic**: Lines 72 reduces remaining_players as players go all-in
```python
remaining_players = len([c for c in contributions if c['live'] > level])
```

---

## Edge Cases NOT Fully Handled ❌

### 1. **All-In for Less (Display vs Actual)**
**Status**: ⚠️ PARTIALLY HANDLED
**Issue**: 9 test cases show bet/call amounts exceeding player's remaining stack

**Examples from validation**:
- TC-10: Charlie calls 700,000 but only has 600,000
- TC-11: Bob bets 400,000 but only has 375,000
- TC-33: Bob bets 900,000 but only has 850,000

**Root Cause**: Generator displays intended bet amount, not actual capped amount

**Impact on Pot Calculation**:
- Algorithm correctly calculates pots based on actual contributions
- But HTML displays may confuse users about actual amounts

**Recommendation**:
```python
# Add validation in calculate_side_pots:
def calculate_side_pots(players, bb_ante):
    # ... existing code ...

    # VALIDATE: Ensure no player contributed more than their starting stack
    for p in players:
        if p.total_contribution > p.starting_stack:
            raise ValueError(
                f"{p.name} contributed {p.total_contribution:,} "
                f"but started with {p.starting_stack:,}"
            )
```

### 2. **Empty Pots (All Players Fold)**
**Status**: ❌ NOT HANDLED
**Issue**: What happens if everyone folds preflop?

**Scenario**:
```
Preflop:
- Alice (Dealer) folds
- Bob (SB) folds
- Charlie (BB) wins with blinds only
```

**Current Behavior**: Unclear - may create pot with only blinds/ante

**Recommendation**:
```python
def calculate_side_pots(players, bb_ante):
    # Check if all players folded except one
    active_players = [p for p in players if not p.folded]

    if len(active_players) == 1:
        # Only one player left - they win all contributions
        total_pot = sum(p.total_contribution for p in players)
        winner = active_players[0]

        return {
            'pots': [{
                'type': 'main',
                'name': 'Main Pot',
                'amount': total_pot,
                'eligible': [winner],
                'eligible_names': [winner.name],
                'level': 0
            }],
            'total_pot': total_pot,
            'bb_ante': bb_ante
        }
```

### 3. **Zero Contribution Players**
**Status**: ⚠️ EDGE CASE
**Issue**: Players who fold preflop before acting (e.g., BB who folds when facing raise)

**Scenario**:
```
Preflop:
- Alice raises to 300
- Bob folds (contributed only SB: 50)
- Charlie folds (contributed only BB + Ante: 200)
```

**Current Behavior**: These players are included in contribution sorting with minimal contributions

**Recommendation**:
```python
# Filter out folded players with zero live contribution
contributions = []
for p in players:
    if p.folded and p.total_contribution == 0:
        continue  # Skip players who folded without contributing
    # ... rest of logic
```

### 4. **Rounding Errors with Large Stacks**
**Status**: ⚠️ POTENTIAL ISSUE
**Issue**: Integer overflow or precision loss with very large stacks (millions/billions)

**Examples from test cases**:
- TC-24: Stacks in 14,000,000 range
- TC-37: Stacks in 38,000,000 range
- TC-47 (extended): Stacks up to 100,000,000

**Current Behavior**: Python handles large integers well, but percentages may have rounding

**Recommendation**:
```python
# Add validation for reasonable stack sizes
MAX_STACK_SIZE = 1_000_000_000_000  # 1 trillion chips

def calculate_side_pots(players, bb_ante):
    for p in players:
        if p.starting_stack > MAX_STACK_SIZE:
            raise ValueError(f"{p.name} stack exceeds maximum: {p.starting_stack:,}")

    # ... rest of logic ...

    # For percentages, use Decimal for precision
    from decimal import Decimal
    for pot in pots:
        pot['percentage'] = float(
            Decimal(pot['amount']) / Decimal(total_pot) * 100
        ) if total_pot > 0 else 0
```

### 5. **Dead Small Blind**
**Status**: ❌ NOT HANDLED
**Issue**: When SB folds preflop, their blind is dead money but algorithm only handles BB ante

**Scenario**:
```
Preflop:
- Alice raises
- Bob (SB) folds (SB: 50 is dead)
- Charlie calls
```

**Current Behavior**: SB is treated as live contribution

**Recommendation**:
```python
def calculate_side_pots(players, bb_ante):
    # Find BB and SB players
    bb_player = next((p for p in players if p.position == "BB"), None)
    sb_player = next((p for p in players if p.position == "SB"), None)

    dead_money = bb_ante  # BB ante is always dead

    # If SB folded preflop without completing their bet, SB is dead
    if sb_player and sb_player.folded:
        # Check if SB only posted blind (didn't call or raise)
        if sb_player.total_contribution == sb_player.blind_posted:
            dead_money += sb_player.blind_posted

    contributions = []
    for p in players:
        live_contrib = p.total_contribution

        # Subtract dead money
        if bb_player and p.name == bb_player.name:
            live_contrib -= bb_ante
        if sb_player and p.name == sb_player.name and sb_player.folded:
            if sb_player.total_contribution == sb_player.blind_posted:
                live_contrib = 0  # SB is dead if they only posted blind

    # Add ALL dead money to main pot
    if i == 0:
        pot_amount += dead_money
```

### 6. **Multiple Winners (Split Pots)**
**Status**: ❌ NOT IMPLEMENTED
**Issue**: When multiple players have same hand strength, pot should be split

**Current Behavior**: Algorithm assumes single winner

**Recommendation**:
```python
def calculate_winners(pots, hand_strengths):
    """
    Distribute pots among winners

    Args:
        pots: List of pot dicts from calculate_side_pots
        hand_strengths: Dict mapping player_name to hand_strength (higher = better)

    Returns:
        Dict mapping player_name to amount_won
    """
    winnings = {}

    for pot in pots:
        # Find eligible players for this pot
        eligible_players = pot['eligible_names']

        # Get hand strengths of eligible players
        eligible_strengths = {
            p: hand_strengths.get(p, 0)
            for p in eligible_players
        }

        # Find max strength
        max_strength = max(eligible_strengths.values())

        # Find all players with max strength (ties)
        winners = [p for p, s in eligible_strengths.items() if s == max_strength]

        # Split pot among winners
        split_amount = pot['amount'] // len(winners)
        odd_chips = pot['amount'] % len(winners)

        for i, winner in enumerate(winners):
            amount = split_amount
            if i < odd_chips:  # Distribute odd chips
                amount += 1

            winnings[winner] = winnings.get(winner, 0) + amount

    return winnings
```

### 7. **Uncalled Bet**
**Status**: ❌ NOT HANDLED
**Issue**: When a player bets/raises and everyone folds, the uncalled portion should be returned

**Scenario**:
```
Turn:
- Alice bets 100
- Bob raises to 300
- Alice folds
Result: Bob should get back the uncalled 200 (300 - 100)
```

**Current Behavior**: Full 300 counted in Bob's contribution

**Recommendation**:
```python
def calculate_side_pots_with_uncalled(players, bb_ante, final_street_actions):
    """
    Calculate pots accounting for uncalled bets

    Args:
        players: List of players
        bb_ante: BB ante amount
        final_street_actions: List of final street actions to detect uncalled bet
    """
    # Detect uncalled bet on final street
    last_aggressor = None
    second_highest_bet = 0
    highest_bet = 0

    for action in reversed(final_street_actions):
        if action.action_type in [ActionType.BET, ActionType.RAISE]:
            if not last_aggressor:
                last_aggressor = action.player_name
                highest_bet = action.amount
            else:
                second_highest_bet = action.amount
                break

    # If last aggressor and everyone folded, calculate uncalled amount
    uncalled_amount = 0
    if last_aggressor:
        active_players = [p for p in players if not p.folded]
        if len(active_players) == 1 and active_players[0].name == last_aggressor:
            uncalled_amount = highest_bet - second_highest_bet

            # Adjust last aggressor's contribution
            for p in players:
                if p.name == last_aggressor:
                    p.total_contribution -= uncalled_amount
                    break

    # Now calculate pots with adjusted contributions
    return calculate_side_pots(players, bb_ante)
```

### 8. **Negative Stack Edge Case**
**Status**: ⚠️ POTENTIAL BUG
**Issue**: TC-30 shows "Charlie Call 100,000 but only has 0 remaining"

**This indicates**:
- Player's stack was fully depleted but action still generated
- Could lead to negative stack if not caught

**Recommendation**:
```python
def process_action(player, action_type, amount):
    if player.current_stack == 0:
        raise ValueError(f"{player.name} cannot act with 0 chips remaining")

    # Cap at available stack
    actual_amount = min(amount, player.current_stack)
    player.current_stack -= actual_amount

    if player.current_stack < 0:
        raise ValueError(f"{player.name} stack went negative: {player.current_stack}")

    return actual_amount
```

---

## Extended Action Cases Edge Cases

### 9. **Multiple Raises Capping at Stack**
**Status**: ⚠️ NEEDS VALIDATION
**Issue**: 10_MoreAction_TC has 4 failures (40%) with bet amount issues

**Examples**:
- Multiple raises where intermediate raise is capped at player's stack
- Subsequent callers need to match actual raise, not intended raise

**Current Fix**: `process_action` returns tuple (Action, actual_amount)

**Recommendation**: Validate that all callers use actual_amount:
```python
# In generate methods:
action, actual_raise = self.process_action(raiser, ActionType.RAISE, raise_amount)
current_bet = actual_raise  # MUST use actual, not raise_amount

# For all subsequent callers:
action, _ = self.process_action(player, ActionType.CALL, current_bet)
```

### 10. **Extended Action Street Ordering**
**Status**: ✅ FIXED
**Issue**: Previously 6/10 cases had missing prerequisite streets
**Solution**: All cases now properly generate Preflop → Flop → Turn → River

---

## Recommendations Summary

### HIGH PRIORITY (Affects Correctness)
1. ✅ **Dead Small Blind** - Add support for dead SB when SB folds preflop
2. ✅ **Uncalled Bet** - Return uncalled portion when last aggressor wins
3. ✅ **Negative Stack Prevention** - Add validation to prevent negative stacks
4. ✅ **Empty Pot Handling** - Handle case where all players fold

### MEDIUM PRIORITY (Improves Robustness)
5. ✅ **Zero Contribution Filter** - Filter out players who folded without contributing
6. ✅ **Stack Size Validation** - Add max stack size validation
7. ✅ **Display vs Actual Amounts** - Fix generator to show actual capped amounts

### LOW PRIORITY (Nice to Have)
8. ⚠️ **Multiple Winners** - Add split pot support (requires hand strength comparison)
9. ⚠️ **Rounding Precision** - Use Decimal for percentage calculations with large pots
10. ⚠️ **Pot Description** - Add detailed calculation explanation in HTML

---

## Testing Recommendations

### Add Test Cases For:
1. **All fold except one** - Preflop fold scenario
2. **SB folds preflop** - Dead small blind
3. **Uncalled bet** - Last aggressor wins
4. **Zero stack action** - Player tries to act with 0 chips
5. **Extremely large stacks** - 1 trillion chip scenario
6. **Multiple all-ins same amount** - Ties at contribution level
7. **Split pot** - Two players with same hand strength

### Validation Scripts to Add:
```python
# validate_edge_cases.py
def validate_no_negative_stacks(test_case):
    for player in test_case.players:
        if player.current_stack < 0:
            return f"Negative stack: {player.name} has {player.current_stack}"
    return None

def validate_contributions_match_pot(test_case):
    total_contributed = sum(p.total_contribution for p in test_case.players)
    if total_contributed != test_case.total_pot:
        return f"Contributions ({total_contributed}) != Pot ({test_case.total_pot})"
    return None

def validate_winner_eligibility(test_case):
    for pot in test_case.pots:
        if test_case.winner.name not in pot['eligible_names']:
            return f"Winner {test_case.winner.name} not eligible for {pot['name']}"
    return None
```

---

## Current Algorithm Rating

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Correctness** | 8/10 | Handles most cases correctly |
| **Completeness** | 7/10 | Missing dead SB, uncalled bet, split pots |
| **Robustness** | 6/10 | No validation for negative stacks, empty pots |
| **Edge Case Handling** | 6/10 | 9 test cases fail bet amount validation |
| **Documentation** | 9/10 | Well documented with examples |

**Overall**: 7.2/10 - Good foundation, needs edge case hardening

---

## Next Steps

1. Implement HIGH PRIORITY recommendations (dead SB, uncalled bet, negative stack prevention)
2. Add validation tests for each edge case
3. Fix bet amount display issues in generator (9 failing test cases)
4. Add split pot support (requires hand evaluation module)
5. Create comprehensive edge case test suite

**END OF REVIEW**
