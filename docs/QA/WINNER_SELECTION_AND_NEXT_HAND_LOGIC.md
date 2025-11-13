# Winner Selection and Next Hand Generation Logic

This document explains how the test case generator calculates new stacks when different players win different pots, and how the next hand is generated.

---

## Overview

The logic is split into 3 main steps:
1. **Calculate Side Pots** - Determine main pot and side pots based on all-in amounts
2. **Winner Selection & Stack Calculation** - Award pots to winner(s) and calculate new stacks
3. **Next Hand Generation** - Rotate button and set up next hand

---

## Step 1: Calculate Side Pots

### Module: `sidepot_calculator.py` → `calculate_side_pots()`

This function calculates the main pot and all side pots based on player contributions and all-in amounts.

### Algorithm:

```python
def calculate_side_pots(players, bb_ante):
    # 1. Calculate live contributions (excluding dead money ante)
    contributions = []
    for player in players:
        live_contrib = player.total_contribution
        if player == BB_player:
            live_contrib -= bb_ante  # Ante is dead money
        contributions.append({'player': player, 'live': live_contrib})

    # 2. Sort by contribution amount
    contributions.sort(by='live')

    # 3. Get unique contribution levels (all-in points)
    unique_levels = [5000, 10000, 20000]  # Example

    # 4. Build pots from smallest to largest
    pots = []
    remaining_players = num_players
    prev_level = 0

    for level in unique_levels:
        # Calculate pot: (level_diff) × (players_contributing)
        pot_amount = (level - prev_level) * remaining_players

        # Add ante to main pot only
        if first_pot:
            pot_amount += bb_ante

        # Eligible: players who contributed at least this level
        eligible = [p for p in players if p.live_contrib >= level]

        pots.append({
            'name': 'Main Pot' or 'Side Pot X',
            'amount': pot_amount,
            'eligible': eligible
        })

        # Remove all-in players from next pot
        remaining_players -= players_at_this_level
        prev_level = level
```

### Example Scenario:

**Players:**
- Alice: Contributed 20,000 (all-in)
- Bob: Contributed 10,000 (all-in)
- Charlie: Contributed 5,000 (folded)
- David: Contributed 20,000 (active)

**BB Ante: 1,000 (dead money)**

**Calculation:**

1. **Live contributions (excluding ante):**
   - Charlie (BB): 5,000 - 1,000 = 4,000 live
   - Bob: 10,000 live
   - Alice: 20,000 live
   - David: 20,000 live

2. **Unique levels:** [4,000, 10,000, 20,000]

3. **Main Pot (Level: 4,000):**
   ```
   Pot = (4,000 - 0) × 4 players + 1,000 ante
   Pot = 16,000 + 1,000 = 17,000
   Eligible: All players (Alice, Bob, Charlie, David)
   ```

4. **Side Pot 1 (Level: 10,000):**
   ```
   Pot = (10,000 - 4,000) × 3 players
   Pot = 6,000 × 3 = 18,000
   Eligible: Alice, Bob, David (Charlie out at 4K)
   ```

5. **Side Pot 2 (Level: 20,000):**
   ```
   Pot = (20,000 - 10,000) × 2 players
   Pot = 10,000 × 2 = 20,000
   Eligible: Alice, David (Bob out at 10K)
   ```

**Result:**
```javascript
pots = [
  {
    name: 'Main Pot',
    amount: 17,000,
    eligible: ['Alice', 'Bob', 'Charlie', 'David']
  },
  {
    name: 'Side Pot 1',
    amount: 18,000,
    eligible: ['Alice', 'Bob', 'David']
  },
  {
    name: 'Side Pot 2',
    amount: 20,000,
    eligible: ['Alice', 'David']
  }
]
total_pot = 55,000
```

---

## Step 2: Winner Selection & Stack Calculation

### Module: `generate_30_progressive.py` → `calculate_pot_and_results()`

This function determines which pots the winner gets and calculates everyone's new stacks.

### Algorithm:

```python
def calculate_pot_and_results():
    # Get pot structure from side pot calculator
    pot_results = calculate_side_pots(players, ante)

    winner = players[winner_idx]

    results = []
    for player in players:
        final_stack = player.current_stack  # Remaining chips
        won_amount = 0

        if player == winner:
            # Winner gets ALL pots they're eligible for
            for pot in pot_results['pots']:
                if player in pot['eligible']:
                    won_amount += pot['amount']

        new_stack = final_stack + won_amount

        results.append({
            'name': player.name,
            'final_stack': final_stack,
            'new_stack': new_stack,
            'won_amount': won_amount
        })

    return results
```

### KEY POINT: Winner Gets ALL Eligible Pots

**Important:** In the current implementation, there is **only ONE winner** selected. This winner gets **ALL pots they're eligible for**.

This means:
- ❌ **NOT SUPPORTED:** Different winners for different pots (e.g., Alice wins Main Pot, Bob wins Side Pot 1)
- ✅ **SUPPORTED:** One winner gets all eligible pots (e.g., Alice wins Main Pot + Side Pot 1 + Side Pot 2)

### Example Calculation:

**Continuing from above example:**

**Scenario A: Alice is selected as winner**

```javascript
// Alice's calculation:
final_stack = 0  // (all-in, contributed 20,000)
won_amount = 17,000 (Main) + 18,000 (Side 1) + 20,000 (Side 2)
won_amount = 55,000
new_stack = 0 + 55,000 = 55,000

// Bob's calculation:
final_stack = 0  // (all-in, contributed 10,000)
won_amount = 0   // (not winner)
new_stack = 0

// Charlie's calculation:
final_stack = 15,000  // (started 20K, contributed 5K)
won_amount = 0
new_stack = 15,000

// David's calculation:
final_stack = 0  // (all-in, contributed 20,000)
won_amount = 0
new_stack = 0
```

**Scenario B: Bob is selected as winner**

```javascript
// Bob's calculation:
final_stack = 0
won_amount = 17,000 (Main) + 18,000 (Side 1)
           // Cannot win Side Pot 2 (not eligible, only went in 10K)
won_amount = 35,000
new_stack = 35,000

// Alice, Charlie, David:
// Same as Scenario A (not winners)
```

---

## Step 3: Next Hand Generation

### Module: `generate_30_progressive.py` → `rotate_button_for_next_hand()`

This function rotates the button clockwise and generates the next hand setup.

### Algorithm:

```python
def rotate_button_for_next_hand():
    # 1. Find current dealer
    dealer_idx = find_player_with_position('Dealer' or 'SB' for 2P)

    # 2. Rotate button clockwise (next player is new dealer)
    next_hand = []
    for i in range(num_players):
        player_idx = (dealer_idx + 1 + i) % num_players
        player = players[player_idx]

        # 3. Calculate new stack for this player
        new_stack = player.starting_stack - player.total_contribution

        # 4. If this player won, add total pot to their stack
        if player_idx == winner_idx:
            total_pot = sum(all_contributions)
            new_stack += total_pot

        # 5. Assign new position
        new_position = POSITIONS[i]  # Based on num_players

        next_hand.append({
            'name': player.name,
            'position': new_position,
            'stack': new_stack
        })

    return next_hand
```

### Example with 4 Players:

**Current Hand:**
```
Alice - Dealer - 50,000
Bob - SB - 40,000
Charlie - BB - 30,000
David - UTG - 80,000
```

**After hand (Alice wins 60,000):**
```
Alice: 50,000 - 20,000 (contrib) + 60,000 (won) = 90,000
Bob: 40,000 - 10,000 = 30,000
Charlie: 30,000 - 15,000 = 15,000
David: 80,000 - 15,000 = 65,000
```

**Next Hand (Button rotates to Bob):**
```
Bob - Dealer - 30,000   // (was SB, now Dealer)
Charlie - SB - 15,000   // (was BB, now SB)
David - BB - 65,000     // (was UTG, now BB)
Alice - UTG - 90,000    // (was Dealer, now UTG)
```

### Position Rotation Logic:

```python
POSITIONS = {
    2: ['SB', 'Dealer'],  # 2-player game (SB is dealer)
    3: ['Dealer', 'SB', 'BB'],
    4: ['Dealer', 'SB', 'BB', 'UTG'],
    5: ['Dealer', 'SB', 'BB', 'UTG', 'CO'],
    # ... etc
}

# Rotation formula:
new_position_index = i
player_index = (current_dealer_index + 1 + i) % num_players
```

---

## Complete Flow Example

Let's trace a complete example from pot calculation to next hand:

### Initial Setup:

**Hand 1:**
```
SB: 500, BB: 1000, Ante: 1000

Alice - Dealer - 50,000
Bob - SB - 40,000
Charlie - BB - 30,000
David - UTG - 80,000
```

### Actions:

```
Preflop:
  David: Raise 5,000
  Alice: Call 5,000
  Bob: Call 5,000
  Charlie: Call 5,000 (ante already posted)

Flop:
  Bob: Bet 10,000
  Charlie: All-in 24,000 (BB paid 1K ante + 1K BB = 28K left)
  David: Call 24,000
  Alice: All-in 44,000

Turn:
  David: Fold

Contributions:
  Charlie: 30,000 (all-in) [29K live + 1K ante]
  Bob: 15,500 (500 SB + 15K action)
  Alice: 50,000 (all-in)
  David: 29,000 (folded)
```

### Step 1: Calculate Pots

**Live contributions:**
- Bob (folded): 15,500
- Charlie (BB, all-in): 30,000 - 1,000 ante = 29,000 live
- David (folded): 29,000
- Alice (all-in): 50,000

**Unique levels:** [15,500, 29,000, 50,000]

**Main Pot (15,500):**
```
= 15,500 × 4 players + 1,000 ante
= 62,000 + 1,000 = 63,000
Eligible: All (Alice, Bob, Charlie, David)
```

**Side Pot 1 (29,000):**
```
= (29,000 - 15,500) × 3 players
= 13,500 × 3 = 40,500
Eligible: Alice, Charlie, David (Bob out at 15.5K)
```

**Side Pot 2 (50,000):**
```
= (50,000 - 29,000) × 1 player
= 21,000 × 1 = 21,000
Eligible: Alice only (Charlie out at 29K, David folded)
```

**Total Pot:** 63,000 + 40,500 + 21,000 = 124,500

### Step 2: Select Winner & Calculate Stacks

**Winner: Alice**

**Final stacks:**
```
Alice:
  final_stack = 0 (all-in)
  won = 63,000 + 40,500 + 21,000 = 124,500
  new_stack = 0 + 124,500 = 124,500

Bob:
  final_stack = 40,000 - 15,500 = 24,500
  won = 0
  new_stack = 24,500

Charlie:
  final_stack = 0 (all-in)
  won = 0
  new_stack = 0

David:
  final_stack = 80,000 - 29,000 = 51,000
  won = 0
  new_stack = 51,000
```

### Step 3: Generate Next Hand

**Current Dealer:** Alice (index 0)

**Next Dealer:** Bob (index 1)

**Next Hand (Hand 2):**
```
SB: 500, BB: 1000, Ante: 1000

Bob - Dealer - 24,500    // index 1 → position 0
Charlie - SB - 0         // index 2 → position 1 (BUSTED)
David - BB - 51,000      // index 3 → position 2
Alice - UTG - 124,500    // index 0 → position 3
```

**Note:** Charlie is busted (0 chips) but still included in next hand display. In a real tournament, they would be eliminated.

---

## Limitations of Current Implementation

### 1. ❌ Single Winner Only

The current system only supports **ONE winner** who gets **ALL eligible pots**.

**Not supported:**
```
Main Pot → Alice wins
Side Pot 1 → Bob wins
Side Pot 2 → Charlie wins
```

**Supported:**
```
All pots → Alice wins (if eligible)
```

### 2. ❌ Split Pots Not Supported

The current system doesn't handle ties/chops where multiple players split a pot.

**Not supported:**
```
Main Pot → Alice and Bob split 50/50
```

### 3. ✅ What IS Supported

- One winner gets all pots they're eligible for
- Proper side pot calculation based on all-in amounts
- Correct eligibility tracking (who can win which pots)
- Button rotation
- Stack calculations for next hand
- Busted players (0 chips) in next hand

---

## How Your App Should Handle Multiple Winners

If your poker app needs to support **different winners for different pots**, you'll need to:

1. **Track Multiple Winners:**
   ```typescript
   winners = {
     mainPot: 'Alice',
     sidePot1: 'Bob',
     sidePot2: 'Charlie'
   }
   ```

2. **Award Each Pot Separately:**
   ```typescript
   for (const pot of pots) {
     const winner = winners[pot.name];
     winner.new_stack += pot.amount;
   }
   ```

3. **Update Test Case Generator:**
   - Modify `calculate_pot_and_results()` to accept multiple winners
   - Update HTML generation to show multiple winner badges

4. **Update Next Hand Logic:**
   - Consider all pot winners when calculating new stacks
   - Handle cases where multiple players won chips

---

## Summary

**Pot Calculation:**
- Uses contribution levels to create main pot + side pots
- Each pot tracks eligible players based on contribution amounts
- Ante is added to main pot as dead money

**Winner Selection:**
- Currently: ONE winner selected
- Winner receives ALL pots they're eligible for
- new_stack = final_stack + won_amount

**Next Hand:**
- Button rotates clockwise (next player becomes dealer)
- Each player's stack = starting_stack - contributions + winnings
- Positions are reassigned based on rotation

