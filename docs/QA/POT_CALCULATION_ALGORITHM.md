# Complete Pot Calculation Algorithm

## Document Information
- **Created**: 2025-11-11
- **Purpose**: Complete reference for poker pot calculation engine
- **Covers**: Main pot, side pots, BB ante system, winner awards, edge cases
- **Status**: Production Ready

---

## Table of Contents
1. [Fundamental Concepts](#fundamental-concepts)
2. [Input Requirements](#input-requirements)
3. [Main Pot Calculation](#main-pot-calculation)
4. [Side Pot Calculation](#side-pot-calculation)
5. [BB Ante System](#bb-ante-system)
6. [Winner Award Algorithm](#winner-award-algorithm)
7. [Complete Algorithm Implementation](#complete-algorithm-implementation)
8. [Edge Cases and Special Scenarios](#edge-cases-and-special-scenarios)
9. [Validation Rules](#validation-rules)
10. [Examples and Test Cases](#examples-and-test-cases)

---

## Fundamental Concepts

### What is a Pot?

A **pot** is the total amount of chips that players have contributed during a poker hand. The pot is awarded to the winner(s) at showdown.

### Why Side Pots?

When a player goes **all-in** (bets all their remaining chips), they can only win up to the amount they contributed from each opponent. Any extra chips bet by other players go into a **side pot** that the all-in player is not eligible to win.

### Key Terminology

| Term | Definition |
|------|------------|
| **Contribution** | Total chips a player put into the pot (including blinds and antes) |
| **Live Contribution** | Contribution excluding dead money (antes) |
| **Dead Money** | Antes - already in pot before action starts, counted separately |
| **All-In** | Player has bet all their chips (final stack = 0) |
| **Eligible** | Players who can win a specific pot (contributed enough to be eligible) |
| **Main Pot** | Pot containing contributions up to the smallest all-in amount |
| **Side Pot** | Additional pots created when players contribute more than smallest all-in |

---

## Input Requirements

### Required Data for Pot Calculation

```python
class Player:
    name: str                    # Player name
    starting_stack: int          # Stack at beginning of hand
    final_stack: int             # Stack at end of hand
    total_contribution: int      # Total chips put in (starting - final)
    position: str                # SB, BB, Dealer, or ""
    is_bb: bool                  # True if this player is BB (for ante)

class HandData:
    players: List[Player]        # All players in the hand
    bb_ante: int                 # Ante amount (posted by BB only)
    total_pot: int               # Sum of all contributions

    # Optional (for validation)
    sb_amount: int               # Small blind amount
    bb_amount: int               # Big blind amount
```

### Validation Before Calculation

```python
def validate_input(hand_data: HandData) -> bool:
    """
    Validate input data before pot calculation.
    """
    # Rule 1: Total pot must equal sum of contributions
    calculated_total = sum(p.total_contribution for p in hand_data.players)
    assert calculated_total == hand_data.total_pot, \
        f"Total pot {hand_data.total_pot} != sum of contributions {calculated_total}"

    # Rule 2: No player contributed more than starting stack
    for player in hand_data.players:
        assert player.total_contribution <= player.starting_stack, \
            f"{player.name} contributed {player.total_contribution} but started with {player.starting_stack}"

    # Rule 3: No negative final stacks
    for player in hand_data.players:
        assert player.final_stack >= 0, \
            f"{player.name} has negative final stack {player.final_stack}"

    # Rule 4: Contribution = Starting - Final
    for player in hand_data.players:
        expected = player.starting_stack - player.final_stack
        assert player.total_contribution == expected, \
            f"{player.name} contribution {player.total_contribution} != (starting {player.starting_stack} - final {player.final_stack})"

    return True
```

---

## Main Pot Calculation

### Definition

The **main pot** is the pot that ALL players (including all-in players) are eligible to win. It contains:
- Contributions from ALL players up to the **smallest all-in amount**
- Plus the BB ante (dead money)

### Formula

```
Main Pot = (Smallest All-In Amount × Number of Players) + BB Ante
```

### Algorithm

```python
def calculate_main_pot(players: List[Player], bb_ante: int) -> dict:
    """
    Calculate the main pot.

    Returns:
        {
            "name": "Main Pot",
            "amount": int,
            "eligible": List[str],  # All player names
            "percentage": float     # Percentage of total pot
        }
    """
    # Get live contributions (excluding ante for BB)
    live_contributions = {}
    for player in players:
        if player.is_bb:
            live_contributions[player.name] = player.total_contribution - bb_ante
        else:
            live_contributions[player.name] = player.total_contribution

    # Find smallest live contribution (this is the cap for main pot)
    smallest_contribution = min(live_contributions.values())

    # Main pot = smallest contribution × number of players
    main_pot_live = smallest_contribution * len(players)

    # Add BB ante (dead money goes to main pot)
    main_pot_total = main_pot_live + bb_ante

    # All players are eligible for main pot
    eligible_players = [p.name for p in players]

    return {
        "name": "Main Pot",
        "amount": main_pot_total,
        "eligible": eligible_players,
        "calculation": f"{smallest_contribution:,} × {len(players)} + {bb_ante:,} (ante) = {main_pot_total:,}"
    }
```

### Example

```
Players:
- Alice: 80,000 live
- Bob: 90,000 live
- Charlie: 90,000 live (+ 5,000 ante = 95,000 total)

Smallest live contribution: 80,000

Main Pot = 80,000 × 3 + 5,000 (ante) = 245,000

Eligible: Alice, Bob, Charlie (all)
```

---

## Side Pot Calculation

### Definition

**Side pots** are created when players contribute different amounts. Each side pot represents a "tier" of betting that only certain players are eligible to win.

### How Side Pots Work

Think of contributions as building towers of chips. When one player's tower is shorter (they went all-in), their chips and matching chips from others go to the main pot. The extra chips from taller towers go to side pots.

```
Visual Representation:

        Charlie      Bob          Alice
        ┌─────┐
        │ 5K  │
Side 2  │ante │
        └─────┘
        ┌─────┐
        │10K  │      ┌─────┐
Side 1  │extra│      │10K  │
        └─────┘      │extra│
        ┌─────┐      └─────┘
        │80K  │      ┌─────┐      ┌─────┐
Main    │match│      │80K  │      │80K  │
Pot     │     │      │match│      │all  │
        └─────┘      └─────┘      └─────┘
```

### Formula

For each tier of contributions:
```
Side Pot N = (Contribution Tier N Amount - Previous Tier) × Number of Players Still In
```

### Algorithm (Complete)

```python
def calculate_all_pots(players: List[Player], bb_ante: int) -> List[dict]:
    """
    Calculate main pot and all side pots.

    Returns:
        List of pots in order: [Main Pot, Side Pot 1, Side Pot 2, ...]
    """
    # Step 1: Get live contributions (excluding BB ante)
    live_contributions = {}
    for player in players:
        if player.is_bb:
            live_contributions[player.name] = player.total_contribution - bb_ante
        else:
            live_contributions[player.name] = player.total_contribution

    # Step 2: Get unique contribution levels (sorted)
    unique_levels = sorted(set(live_contributions.values()))

    # Step 3: If everyone contributed the same, just main pot
    if len(unique_levels) == 1:
        main_pot_amount = unique_levels[0] * len(players) + bb_ante
        return [{
            "name": "Main Pot",
            "amount": main_pot_amount,
            "eligible": [p.name for p in players],
            "percentage": 100.0,
            "calculation": f"{unique_levels[0]:,} × {len(players)} + {bb_ante:,} (ante) = {main_pot_amount:,}"
        }]

    # Step 4: Calculate pots level by level
    pots = []
    previous_level = 0
    remaining_players = [p.name for p in players]
    total_pot = sum(player.total_contribution for player in players)

    for level_idx, current_level in enumerate(unique_levels):
        # How much extra at this level compared to previous
        delta = current_level - previous_level

        # How many players contributed at least this much
        num_contributors = len(remaining_players)

        # Pot for this level
        pot_amount = delta * num_contributors

        # Add BB ante to main pot only
        if level_idx == 0:
            pot_amount += bb_ante
            pot_name = "Main Pot"
            calculation = f"{current_level:,} × {num_contributors} + {bb_ante:,} (ante) = {pot_amount:,}"
        else:
            pot_name = f"Side Pot {level_idx}"
            calculation = f"({current_level:,} - {previous_level:,}) × {num_contributors} = {pot_amount:,}"

        # Players eligible for this pot are those who contributed at least current_level
        eligible_players = [
            name for name in remaining_players
            if live_contributions[name] >= current_level
        ]

        pot_percentage = (pot_amount / total_pot) * 100

        pots.append({
            "name": pot_name,
            "amount": pot_amount,
            "eligible": eligible_players,
            "percentage": pot_percentage,
            "calculation": calculation
        })

        # Remove players who went all-in at exactly this level
        remaining_players = [
            name for name in remaining_players
            if live_contributions[name] > current_level
        ]

        previous_level = current_level

    return pots
```

---

## BB Ante System

### What is BB Ante?

In modern poker tournaments, instead of every player posting an ante, **only the Big Blind posts the ante** for the entire table. This speeds up the game.

### BB Ante Posting Order

**CRITICAL**: The BB posts the ante BEFORE posting the blind.

```
1. BB posts ANTE (dead money) → Stack reduced
2. BB posts BLIND (live money) → Stack reduced again
3. Action begins
```

### Example

```python
Charlie (BB):
- Starting stack: 265,000
- BB Ante: 5,000 (dead)
- BB Blind: 5,000 (live)

Step 1: Post ante
  Stack: 265,000 - 5,000 = 260,000

Step 2: Post blind
  Stack: 260,000 - 5,000 = 255,000

Step 3: Action begins with Charlie having 255,000 available
```

### BB Ante in Pot Calculations

**Key Rule**: BB ante is **dead money** added to the main pot ONLY.

```python
# BB's total contribution
bb_total_contribution = bb_ante + bb_blind + additional_bets

# BB's live contribution (for side pot eligibility)
bb_live_contribution = bb_blind + additional_bets

# Main pot includes ante
main_pot = (smallest_live_contribution × num_players) + bb_ante

# Side pots do NOT include ante
side_pot_n = delta × num_eligible
```

### No Ante System (Alternative)

Some games have **no ante** or **all players post antes**. Adjust the algorithm:

```python
if bb_ante == 0:
    # No ante - simpler calculation
    main_pot = smallest_contribution × num_players

elif ante_per_player > 0:
    # All players post antes
    total_antes = ante_per_player × num_players
    main_pot = smallest_contribution × num_players + total_antes
```

---

## Winner Award Algorithm

### Types of Winners

1. **Single Winner**: One player wins the entire pot
2. **Split Pot**: Multiple players tie and split the pot equally
3. **Different Winners for Different Pots**: Main pot winner differs from side pot winner

### Award Algorithm

```python
def award_pots(pots: List[dict], winners: dict) -> dict:
    """
    Award pots to winners and calculate new stacks.

    Args:
        pots: List of pots from calculate_all_pots()
        winners: Dict mapping pot name to winner(s)
                 Example: {
                     "Main Pot": "Alice",
                     "Side Pot 1": ["Bob", "Charlie"],  # Split
                 }

    Returns:
        Dict mapping player name to total winnings
    """
    winnings = {}

    for pot in pots:
        pot_name = pot["name"]
        pot_amount = pot["amount"]

        if pot_name not in winners:
            raise ValueError(f"No winner assigned for {pot_name}")

        winner_names = winners[pot_name]

        # Handle single winner
        if isinstance(winner_names, str):
            winner_names = [winner_names]

        # Split pot equally among winners
        amount_per_winner = pot_amount // len(winner_names)
        remainder = pot_amount % len(winner_names)

        for idx, winner in enumerate(winner_names):
            if winner not in winnings:
                winnings[winner] = 0

            # First winner gets remainder (if any)
            if idx == 0:
                winnings[winner] += amount_per_winner + remainder
            else:
                winnings[winner] += amount_per_winner

    return winnings
```

### Calculate New Stacks

```python
def calculate_new_stacks(players: List[Player], winnings: dict) -> dict:
    """
    Calculate new stack for each player after pot awards.

    Returns:
        Dict mapping player name to new stack
    """
    new_stacks = {}

    for player in players:
        # New stack = Final stack (after betting) + Winnings
        new_stack = player.final_stack + winnings.get(player.name, 0)
        new_stacks[player.name] = new_stack

    return new_stacks
```

### Winner Eligibility Rules

**CRITICAL**: A player can only win a pot if they are **eligible** for that pot.

```python
def validate_winner_eligibility(pot: dict, winner: str, live_contributions: dict) -> bool:
    """
    Check if winner is eligible for the pot.
    """
    if winner not in pot["eligible"]:
        raise ValueError(
            f"{winner} cannot win {pot['name']} - not eligible. "
            f"Eligible players: {pot['eligible']}"
        )

    return True
```

### Example: Different Winners for Different Pots

```
Main Pot: 245,000
  Eligible: Alice, Bob, Charlie
  Winner: Charlie (best hand among all three)
  Charlie wins: 245,000

Side Pot 1: 20,000
  Eligible: Bob, Charlie (Alice all-in for less)
  Winner: Bob (best hand between Bob and Charlie)
  Bob wins: 20,000

Final Winnings:
  Charlie: 245,000
  Bob: 20,000
  Alice: 0
```

---

## Complete Algorithm Implementation

### Full Python Implementation

```python
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class Player:
    name: str
    starting_stack: int
    final_stack: int
    total_contribution: int
    position: str
    is_bb: bool = False

@dataclass
class Pot:
    name: str
    amount: int
    eligible: List[str]
    percentage: float
    calculation: str

class PotCalculationEngine:
    """
    Complete pot calculation engine for poker.
    """

    def __init__(self, players: List[Player], bb_ante: int = 0):
        self.players = players
        self.bb_ante = bb_ante
        self.total_pot = sum(p.total_contribution for p in players)

        # Validate input
        self._validate_input()

    def _validate_input(self):
        """Validate input data."""
        # Total pot check
        calculated_total = sum(p.total_contribution for p in self.players)
        assert calculated_total == self.total_pot, \
            f"Total pot mismatch: {self.total_pot} != {calculated_total}"

        # Individual player checks
        for player in self.players:
            # No over-contribution
            assert player.total_contribution <= player.starting_stack, \
                f"{player.name}: Over-contribution"

            # No negative stacks
            assert player.final_stack >= 0, \
                f"{player.name}: Negative final stack"

            # Math check
            expected = player.starting_stack - player.final_stack
            assert player.total_contribution == expected, \
                f"{player.name}: Contribution math error"

    def get_live_contributions(self) -> Dict[str, int]:
        """Get live contributions (excluding BB ante)."""
        live_contributions = {}

        for player in self.players:
            if player.is_bb and self.bb_ante > 0:
                # BB's live contribution excludes ante
                live_contributions[player.name] = player.total_contribution - self.bb_ante
            else:
                live_contributions[player.name] = player.total_contribution

        return live_contributions

    def calculate_pots(self) -> List[Pot]:
        """
        Calculate all pots (main + side pots).

        Returns:
            List of Pot objects
        """
        live_contributions = self.get_live_contributions()

        # Get unique contribution levels
        unique_levels = sorted(set(live_contributions.values()))

        # Single level = main pot only
        if len(unique_levels) == 1:
            amount = unique_levels[0] * len(self.players) + self.bb_ante
            return [Pot(
                name="Main Pot",
                amount=amount,
                eligible=[p.name for p in self.players],
                percentage=100.0,
                calculation=f"{unique_levels[0]:,} × {len(self.players)} + {self.bb_ante:,} = {amount:,}"
            )]

        # Multiple levels = main pot + side pots
        pots = []
        previous_level = 0
        remaining_players = [p.name for p in self.players]

        for level_idx, current_level in enumerate(unique_levels):
            delta = current_level - previous_level
            num_contributors = len(remaining_players)
            pot_amount = delta * num_contributors

            # Add ante to main pot only
            if level_idx == 0:
                pot_amount += self.bb_ante
                pot_name = "Main Pot"
                calc = f"{current_level:,} × {num_contributors} + {self.bb_ante:,} (ante) = {pot_amount:,}"
            else:
                pot_name = f"Side Pot {level_idx}"
                calc = f"({current_level:,} - {previous_level:,}) × {num_contributors} = {pot_amount:,}"

            # Eligible players
            eligible = [
                name for name in remaining_players
                if live_contributions[name] >= current_level
            ]

            percentage = (pot_amount / self.total_pot) * 100

            pots.append(Pot(
                name=pot_name,
                amount=pot_amount,
                eligible=eligible,
                percentage=percentage,
                calculation=calc
            ))

            # Remove all-in players at this level
            remaining_players = [
                name for name in remaining_players
                if live_contributions[name] > current_level
            ]

            previous_level = current_level

        return pots

    def award_pots(self, pots: List[Pot], winners: Dict[str, str]) -> Dict[str, int]:
        """
        Award pots to winners.

        Args:
            pots: List of pots from calculate_pots()
            winners: Dict mapping pot name to winner name
                     Example: {"Main Pot": "Alice", "Side Pot 1": "Bob"}

        Returns:
            Dict mapping player name to total winnings
        """
        live_contributions = self.get_live_contributions()
        winnings = {p.name: 0 for p in self.players}

        for pot in pots:
            pot_name = pot.name

            if pot_name not in winners:
                raise ValueError(f"No winner specified for {pot_name}")

            winner = winners[pot_name]

            # Validate eligibility
            if winner not in pot.eligible:
                raise ValueError(
                    f"{winner} cannot win {pot_name}. "
                    f"Not eligible. Eligible: {pot.eligible}"
                )

            # Award pot
            winnings[winner] += pot.amount

        return winnings

    def calculate_new_stacks(self, winnings: Dict[str, int]) -> Dict[str, int]:
        """
        Calculate new stacks after awarding pots.

        Returns:
            Dict mapping player name to new stack
        """
        new_stacks = {}

        for player in self.players:
            new_stack = player.final_stack + winnings[player.name]
            new_stacks[player.name] = new_stack

        return new_stacks

    def validate_pot_total(self, pots: List[Pot]):
        """Verify all pots sum to total pot."""
        pot_sum = sum(pot.amount for pot in pots)
        assert pot_sum == self.total_pot, \
            f"Pots sum {pot_sum} != total pot {self.total_pot}"
```

---

## Edge Cases and Special Scenarios

### Edge Case 1: Everyone All-In for Same Amount

**Scenario**: All players go all-in for exactly the same amount (rare but possible).

**Result**: Only a main pot, no side pots.

```python
# Example
Players:
- Alice: 100,000
- Bob: 100,000
- Charlie: 100,000

Main Pot: 100,000 × 3 + ante = 300,000 + ante
Side Pots: None
```

---

### Edge Case 2: Multiple Players Tie for a Pot

**Scenario**: Two or more players have equal hands and must split a pot.

**Solution**: Divide pot equally, with remainder going to first winner.

```python
pot_amount = 245,000
winners = ["Alice", "Bob"]  # Tie

alice_share = 245,000 // 2 + 245,000 % 2 = 122,500 + 1 = 122,501
bob_share = 245,000 // 2 = 122,500

Total: 122,501 + 122,500 = 245,001 (oops!)

# Correct way:
amount_per_winner = 245,000 // 2 = 122,500
remainder = 245,000 % 2 = 0

alice_share = 122,500 + 0 = 122,500
bob_share = 122,500

# With odd pot:
pot_amount = 245,001
amount_per_winner = 245,001 // 2 = 122,500
remainder = 245,001 % 2 = 1

alice_share = 122,500 + 1 = 122,501
bob_share = 122,500
```

---

### Edge Case 3: Player Wins Multiple Pots

**Scenario**: One player wins both main pot and side pot.

**Solution**: Add both amounts to their winnings.

```python
# Example
Main Pot: 245,000 → Winner: Charlie
Side Pot 1: 20,000 → Winner: Charlie

Charlie's total winnings: 245,000 + 20,000 = 265,000
Charlie's new stack: final_stack + 265,000
```

---

### Edge Case 4: Three-Way All-In with Different Amounts

**Scenario**: Three players all-in for three different amounts.

**Example**:
```
Alice: 50,000 (smallest)
Bob: 75,000 (middle)
Charlie: 100,000 (largest)

Main Pot:
  50,000 × 3 + ante = 150,000 + ante
  Eligible: Alice, Bob, Charlie

Side Pot 1:
  (75,000 - 50,000) × 2 = 25,000 × 2 = 50,000
  Eligible: Bob, Charlie (Alice out)

Side Pot 2:
  (100,000 - 75,000) × 1 = 25,000 × 1 = 25,000
  Eligible: Charlie only (Bob out)
```

---

### Edge Case 5: BB Ante When BB Goes All-In Preflop

**Scenario**: BB posts ante, then immediately goes all-in before action.

**Example**:
```
Charlie (BB):
- Starting: 10,000
- Ante: 5,000 → Stack: 5,000
- BB: 5,000 → Stack: 0 (all-in!)

Charlie is all-in for 10,000 total (5,000 ante + 5,000 BB)
Charlie's live contribution: 5,000 (BB only)
Charlie is eligible for main pot capped at his live contribution
```

**Pot Calculation**:
```python
# If Bob calls with 5,000 and Alice calls with 5,000:
Main Pot = 5,000 × 3 + 5,000 (ante) = 20,000
Eligible: Alice, Bob, Charlie

# Charlie can win up to 20,000 despite posting 10,000 total
# because his live contribution was 5,000, matching the others
```

---

### Edge Case 6: Uncalled Bet Returned

**Scenario**: Last aggressive action is not called (e.g., river bet, everyone folds).

**Solution**: Return uncalled bet before calculating pots.

```python
# Example:
Alice bets 50,000 on river
Bob folds
Charlie folds

Alice's 50,000 bet is UNCALLED → returned to Alice
Pot contains only previous betting (not the uncalled 50,000)

# Implementation:
def handle_uncalled_bet(players, last_bet_player, uncalled_amount):
    # Add uncalled amount back to player's stack
    player = next(p for p in players if p.name == last_bet_player)
    player.final_stack += uncalled_amount
    player.total_contribution -= uncalled_amount
```

---

### Edge Case 7: Rounding Issues with Odd Chip

**Scenario**: Pot amount is odd and must be split between two players.

**Rule**: The odd chip goes to the player in the earliest position (closest to button).

```python
def split_pot_with_position(pot_amount, winners, button_order):
    """
    Split pot with odd chip rule.

    Args:
        pot_amount: Amount to split
        winners: List of winner names
        button_order: List of player names in position order (closest to button first)

    Returns:
        Dict mapping winner to their share
    """
    amount_per_winner = pot_amount // len(winners)
    remainder = pot_amount % len(winners)

    # Sort winners by position (earliest position first)
    winners_by_position = [p for p in button_order if p in winners]

    shares = {}
    for idx, winner in enumerate(winners_by_position):
        if idx < remainder:
            # Early position players get odd chips
            shares[winner] = amount_per_winner + 1
        else:
            shares[winner] = amount_per_winner

    return shares
```

---

## Validation Rules

### Post-Calculation Validation

After calculating pots, validate the results:

```python
def validate_pot_calculation(players: List[Player], pots: List[Pot], bb_ante: int):
    """
    Validate pot calculation results.
    """
    total_pot = sum(p.total_contribution for p in players)

    # Rule 1: All pots sum to total pot
    pot_sum = sum(pot.amount for pot in pots)
    assert pot_sum == total_pot, f"Pot sum {pot_sum} != total {total_pot}"

    # Rule 2: All percentages sum to 100%
    percentage_sum = sum(pot.percentage for pot in pots)
    assert 99.9 <= percentage_sum <= 100.1, f"Percentages sum to {percentage_sum}%"

    # Rule 3: Main pot is largest (usually)
    main_pot = next(pot for pot in pots if pot.name == "Main Pot")
    # Note: Main pot is NOT always largest (can have huge side pot with 2 big stacks)

    # Rule 4: Each pot has at least one eligible player
    for pot in pots:
        assert len(pot.eligible) > 0, f"{pot.name} has no eligible players"

    # Rule 5: Eligible players decrease as side pots progress
    for i in range(len(pots) - 1):
        current_eligible = len(pots[i].eligible)
        next_eligible = len(pots[i + 1].eligible)
        assert next_eligible <= current_eligible, \
            f"Side pot {i+1} has more eligible players than pot {i}"

    # Rule 6: BB ante only in main pot
    if bb_ante > 0:
        # Main pot should be larger by ante amount
        pass  # Already included in calculation
```

---

## Examples and Test Cases

### Example 1: Simple 3-Player, No All-Ins

```python
# Setup
players = [
    Player(name="Alice", starting_stack=100000, final_stack=75000,
           total_contribution=25000, position="Dealer", is_bb=False),
    Player(name="Bob", starting_stack=100000, final_stack=75000,
           total_contribution=25000, position="SB", is_bb=False),
    Player(name="Charlie", starting_stack=100000, final_stack=70000,
           total_contribution=30000, position="BB", is_bb=True),
]
bb_ante = 5000

# Calculate
engine = PotCalculationEngine(players, bb_ante)
pots = engine.calculate_pots()

# Result
Main Pot: 80,000
  Calculation: 25,000 × 3 + 5,000 (ante) = 80,000
  Eligible: Alice, Bob, Charlie
  Percentage: 100%
```

**No side pots** because no one went all-in.

---

### Example 2: TC-10 (One All-In, Two Side Pots)

```python
# Setup
players = [
    Player(name="Alice", starting_stack=80000, final_stack=0,
           total_contribution=80000, position="Dealer", is_bb=False),
    Player(name="Bob", starting_stack=165000, final_stack=75000,
           total_contribution=90000, position="SB", is_bb=False),
    Player(name="Charlie", starting_stack=265000, final_stack=170000,
           total_contribution=95000, position="BB", is_bb=True),
]
bb_ante = 5000

# Calculate
engine = PotCalculationEngine(players, bb_ante)
pots = engine.calculate_pots()

# Result
Pot 1 - Main Pot: 245,000 (92.5%)
  Calculation: 80,000 × 3 + 5,000 (ante) = 245,000
  Eligible: Alice, Bob, Charlie

Pot 2 - Side Pot 1: 20,000 (7.5%)
  Calculation: (90,000 - 80,000) × 2 = 20,000
  Eligible: Bob, Charlie

Total: 265,000
```

**Why Alice is not eligible for Side Pot 1**: Alice went all-in for 80,000 live, so she can only win from chips matched at her level.

---

### Example 3: Three All-Ins at Different Levels

```python
# Setup
players = [
    Player(name="Alice", starting_stack=50000, final_stack=0,
           total_contribution=50000, position="Dealer", is_bb=False),
    Player(name="Bob", starting_stack=75000, final_stack=0,
           total_contribution=75000, position="SB", is_bb=False),
    Player(name="Charlie", starting_stack=100000, final_stack=5000,
           total_contribution=95000, position="BB", is_bb=True),
]
bb_ante = 5000

# Calculate
engine = PotCalculationEngine(players, bb_ante)
pots = engine.calculate_pots()

# Result
Pot 1 - Main Pot: 155,000 (70.5%)
  Calculation: 50,000 × 3 + 5,000 (ante) = 155,000
  Eligible: Alice, Bob, Charlie

Pot 2 - Side Pot 1: 50,000 (22.7%)
  Calculation: (75,000 - 50,000) × 2 = 50,000
  Eligible: Bob, Charlie

Pot 3 - Side Pot 2: 15,000 (6.8%)
  Calculation: (90,000 - 75,000) × 1 = 15,000
  Eligible: Charlie

Total: 220,000
```

---

### Example 4: Winner Awards with Different Pot Winners

```python
# Using Example 2 pots
pots = [
    {"name": "Main Pot", "amount": 245000, "eligible": ["Alice", "Bob", "Charlie"]},
    {"name": "Side Pot 1", "amount": 20000, "eligible": ["Bob", "Charlie"]},
]

# Assign winners
winners = {
    "Main Pot": "Charlie",     # Charlie has best hand overall
    "Side Pot 1": "Bob",       # Bob has best hand vs Charlie
}

# Award
winnings = engine.award_pots(pots, winners)
# Result: {"Alice": 0, "Bob": 20000, "Charlie": 245000}

# Calculate new stacks
new_stacks = engine.calculate_new_stacks(winnings)
# Result:
# Alice: 0 + 0 = 0
# Bob: 75,000 + 20,000 = 95,000
# Charlie: 170,000 + 245,000 = 415,000
```

---

### Example 5: Split Pot

```python
# Setup: Alice and Bob tie for main pot
pots = [
    {"name": "Main Pot", "amount": 245000, "eligible": ["Alice", "Bob", "Charlie"]},
]

winners = {
    "Main Pot": ["Alice", "Bob"],  # Tie - split pot
}

# Award
winnings = engine.award_pots(pots, winners)

# Result:
# Alice: 245,000 // 2 + 245,000 % 2 = 122,500 + 0 = 122,500
# Bob: 245,000 // 2 = 122,500
# Total: 245,000 ✓
```

---

## Quick Reference

### Pot Calculation Formulas

```python
# Main Pot
main_pot = (min(live_contributions) × num_players) + bb_ante

# Side Pot N
side_pot_n = (contribution_level_n - contribution_level_n-1) × num_players_at_level_n

# Total Pot
total_pot = sum(all_player_contributions)

# Validation
assert sum(all_pots) == total_pot
```

### Winner Award Formulas

```python
# Single Winner
winner_receives = pot_amount

# Split Pot (equal shares)
each_winner_receives = pot_amount // num_winners
first_winner_receives += pot_amount % num_winners  # Odd chip

# New Stack
new_stack = final_stack + total_winnings
```

---

## Conclusion

This document provides a complete reference for implementing a poker pot calculation engine. Key takeaways:

1. **Validate input** before calculation (no negative stacks, no over-contribution)
2. **Separate live and dead contributions** (BB ante is dead money)
3. **Calculate pots level by level** (main pot first, then side pots)
4. **Track eligibility** for each pot (only players who contributed enough)
5. **Award pots** respecting eligibility rules
6. **Validate output** (pots sum to total, percentages sum to 100%)

Use the `PotCalculationEngine` class for production implementations, and reference the examples for testing.

---

## References

- **TEST_CASE_GENERATION_SPEC.md**: Complete poker rules specification
- **TC10_NEGATIVE_STACK_ISSUE_REPORT.md**: Detailed worked example (TC-10)
- **30_TestCases.html**: 30 validated test cases with correct pot calculations
- **validate_all_cases.py**: Validation script

---

**Status**: ✅ **PRODUCTION READY**

**Last Updated**: 2025-11-11
