# Pot Calculation Engine - Complete Specification

**Purpose**: Calculate main pot and side pots dynamically as actions are processed in each street
**Location**: To be implemented in the main application
**Reference**: Based on `docs/QA/sidepot_calculator.py`

---

## Table of Contents
1. [Core Concepts](#core-concepts)
2. [Input Data Required](#input-data-required)
3. [Step-by-Step Calculation Logic](#step-by-step-calculation-logic)
4. [Edge Cases to Handle](#edge-cases-to-handle)
5. [Implementation Algorithm](#implementation-algorithm)
6. [Data Structures](#data-structures)
7. [Testing Scenarios](#testing-scenarios)

---

## Core Concepts

### What is a Pot?
A **pot** is the total amount of chips that players can win in a poker hand.

### Main Pot vs Side Pots
- **Main Pot**: The pot that all active players are eligible to win
- **Side Pot(s)**: Created when one or more players go all-in with different stack sizes

### Dead Money
Money that goes into the pot but is not part of "live" betting action:
- **BB Ante**: The ante posted by the Big Blind position (always dead money)
- **Small Blind** (when SB folds preflop without completing bet)

### Live Contribution
The amount a player contributed that can be matched by other players:
```
Live Contribution = Total Contribution - Dead Money
```

For BB: `Live Contribution = (BB + Ante) - Ante = BB only`

---

## Input Data Required

### For Each Player
```typescript
interface Player {
  name: string;
  position: string;  // "SB", "BB", "Dealer", "UTG", etc.
  starting_stack: number;
  current_stack: number;
  total_contribution: number;  // Cumulative across all streets
  street_contribution: number; // Current street only
  blind_posted: number;        // SB or BB amount posted
  folded: boolean;
  all_in_street: string | null; // Which street they went all-in
}
```

### Hand Setup
```typescript
interface HandSetup {
  sb: number;           // Small blind amount
  bb: number;           // Big blind amount
  ante: number;         // Ante amount
  ante_order: string;   // "BB First" or "Ante First"
  current_street: string; // "preflop", "flop", "turn", "river"
}
```

### Actions Processed So Far
```typescript
interface Action {
  player_name: string;
  action_type: "fold" | "check" | "call" | "bet" | "raise";
  amount?: number;      // For bet/call/raise
  street: string;
}
```

---

## Step-by-Step Calculation Logic

### Step 1: Identify Dead Money

#### BB Ante (Always Dead)
```typescript
function getDeadMoney(players: Player[], ante: number): number {
  const bb_player = players.find(p => p.position === "BB");
  let dead_money = ante; // BB ante is always dead

  return dead_money;
}
```

#### Optional: Dead Small Blind
If SB folded preflop without completing their bet:
```typescript
const sb_player = players.find(p => p.position === "SB");
if (sb_player?.folded && sb_player.total_contribution === sb_player.blind_posted) {
  dead_money += sb_player.blind_posted;
}
```

### Step 2: Calculate Live Contributions

For each player, determine how much they contributed that other players can match:

```typescript
interface Contribution {
  player: Player;
  live: number;    // Amount that can be matched
  total: number;   // Total amount including dead money
}

function calculateLiveContributions(
  players: Player[],
  bb_ante: number
): Contribution[] {
  const bb_player = players.find(p => p.position === "BB");

  const contributions: Contribution[] = players.map(p => {
    let live_contrib = p.total_contribution;

    // Subtract ante from BB's contribution (it's dead money)
    if (bb_player && p.name === bb_player.name) {
      live_contrib -= bb_ante;
    }

    return {
      player: p,
      live: live_contrib,
      total: p.total_contribution
    };
  });

  // Sort by live contribution (lowest to highest)
  contributions.sort((a, b) => a.live - b.live);

  return contributions;
}
```

### Step 3: Identify Contribution Levels

Each unique live contribution amount represents a "level" where a pot is created:

```typescript
function getContributionLevels(contributions: Contribution[]): number[] {
  const levels = [...new Set(contributions.map(c => c.live))];
  return levels.sort((a, b) => a - b);
}
```

**Example**:
- Alice contributed 1000 (live)
- Bob contributed 500 (live, all-in)
- Charlie contributed 1000 (live)

Levels: `[500, 1000]`

### Step 4: Build Pots from Levels

For each level, create a pot:

```typescript
interface Pot {
  type: string;           // "main" or "side1", "side2", etc.
  name: string;           // "Main Pot", "Side Pot 1", etc.
  amount: number;
  eligible: Player[];
  eligible_names: string[];
  level: number;
  percentage: number;     // % of total pot
}

function buildPots(
  contributions: Contribution[],
  levels: number[],
  bb_ante: number
): Pot[] {
  const pots: Pot[] = [];
  let remaining_players = contributions.length;
  let prev_level = 0;

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];

    if (remaining_players > 0) {
      // Calculate pot amount
      // Formula: (current_level - previous_level) × remaining_players
      let pot_amount = (level - prev_level) * remaining_players;

      // Add dead money to main pot only
      if (i === 0) {
        pot_amount += bb_ante;
      }

      // Determine eligible players
      // Players are eligible if their live contribution >= this level
      const eligible = contributions
        .filter(c => c.live >= level)
        .map(c => c.player);

      const eligible_names = eligible.map(p => p.name);

      // Create pot object
      const pot_type = i === 0 ? 'main' : `side${i}`;
      const pot_name = i === 0 ? 'Main Pot' : `Side Pot ${i}`;

      pots.push({
        type: pot_type,
        name: pot_name,
        amount: pot_amount,
        eligible: eligible,
        eligible_names: eligible_names,
        level: level,
        percentage: 0 // Calculate later
      });

      // Update remaining players
      // Only players who contributed MORE than this level remain
      remaining_players = contributions.filter(c => c.live > level).length;
      prev_level = level;
    }
  }

  return pots;
}
```

### Step 5: Calculate Pot Percentages

```typescript
function calculatePercentages(pots: Pot[]): void {
  const total_pot = pots.reduce((sum, pot) => sum + pot.amount, 0);

  for (const pot of pots) {
    pot.percentage = total_pot > 0 ? (pot.amount / total_pot * 100) : 0;
  }
}
```

### Step 6: Return Result

```typescript
interface PotCalculationResult {
  pots: Pot[];
  total_pot: number;
  bb_ante: number;
  breakdown: string; // Human-readable explanation
}

function calculatePots(
  players: Player[],
  bb_ante: number
): PotCalculationResult {
  // Execute all steps
  const contributions = calculateLiveContributions(players, bb_ante);
  const levels = getContributionLevels(contributions);
  const pots = buildPots(contributions, levels, bb_ante);
  calculatePercentages(pots);

  const total_pot = pots.reduce((sum, pot) => sum + pot.amount, 0);

  return {
    pots: pots,
    total_pot: total_pot,
    bb_ante: bb_ante,
    breakdown: generateBreakdown(pots, contributions, bb_ante)
  };
}
```

---

## Edge Cases to Handle

### 1. All Players Fold Except One

**Scenario**: Everyone folds, one player wins without showdown

**Logic**:
```typescript
const active_players = players.filter(p => !p.folded);

if (active_players.length === 1) {
  const winner = active_players[0];
  const total_pot = players.reduce((sum, p) => sum + p.total_contribution, 0);

  return {
    pots: [{
      type: 'main',
      name: 'Main Pot',
      amount: total_pot,
      eligible: [winner],
      eligible_names: [winner.name],
      level: 0,
      percentage: 100
    }],
    total_pot: total_pot,
    bb_ante: bb_ante,
    breakdown: `${winner.name} wins ${formatChips(total_pot)} (everyone folded)`
  };
}
```

### 2. No All-Ins (Single Main Pot)

**Scenario**: All active players contributed the same amount

**Result**: Only one pot (main pot) with all active players eligible

### 3. Multiple Players All-In at Same Level

**Scenario**:
- Alice contributes 1000
- Bob goes all-in for 500
- Charlie goes all-in for 500

**Result**:
- Main pot: 500 × 3 = 1500 (Bob, Charlie, Alice eligible)
- Side pot: 500 × 1 = 500 (Alice only)

### 4. Uncalled Bet

**Scenario**: Player bets, everyone folds → uncalled portion returned

**Logic**:
```typescript
// After final action on last street
const last_action = actions[actions.length - 1];
const last_aggressor = players.find(p => p.name === last_action.player_name);

if (last_action.action_type === 'bet' || last_action.action_type === 'raise') {
  const active_players = players.filter(p => !p.folded);

  if (active_players.length === 1 && active_players[0].name === last_aggressor?.name) {
    // Find uncalled amount (difference between last bet and second highest)
    const sorted_contributions = contributions
      .map(c => c.total)
      .sort((a, b) => b - a);

    const uncalled = sorted_contributions[0] - sorted_contributions[1];

    // Refund uncalled amount
    last_aggressor.total_contribution -= uncalled;
    last_aggressor.current_stack += uncalled;
  }
}
```

### 5. Zero Contribution Players

**Scenario**: Player folds before posting anything (rare)

**Logic**: Exclude from pot calculations
```typescript
const contributions = players
  .filter(p => p.total_contribution > 0)
  .map(p => /* ... */);
```

### 6. Split Pots (Multiple Winners)

**Scenario**: Two or more players have identical hand strength

**Logic**:
```typescript
function distributePot(
  pot: Pot,
  winners: Player[]
): Map<string, number> {
  const winnings = new Map<string, number>();

  const split_amount = Math.floor(pot.amount / winners.length);
  const odd_chips = pot.amount % winners.length;

  // Distribute split amount to all winners
  for (let i = 0; i < winners.length; i++) {
    let amount = split_amount;

    // Give odd chips to first N winners
    if (i < odd_chips) {
      amount += 1;
    }

    winnings.set(winners[i].name, amount);
  }

  return winnings;
}
```

### 7. Dead Small Blind

**Scenario**: SB folds preflop without completing bet

**Logic**: Add SB to dead money
```typescript
const sb_player = players.find(p => p.position === "SB");
if (sb_player?.folded && sb_player.total_contribution === sb_player.blind_posted) {
  dead_money += sb_player.blind_posted;
  // SB's live contribution becomes 0
}
```

### 8. Validation: Stack Overflow

**Check**: No player can contribute more than their starting stack

```typescript
for (const player of players) {
  if (player.total_contribution > player.starting_stack) {
    throw new Error(
      `${player.name} contributed ${player.total_contribution} ` +
      `but started with ${player.starting_stack}`
    );
  }
}
```

### 9. Validation: Pot Conservation

**Check**: Sum of all contributions equals sum of all pots

```typescript
const total_contributed = players.reduce((sum, p) => sum + p.total_contribution, 0);
const total_in_pots = pots.reduce((sum, pot) => sum + pot.amount, 0);

if (total_contributed !== total_in_pots) {
  throw new Error(
    `Pot mismatch: ${total_contributed} contributed, ` +
    `${total_in_pots} in pots`
  );
}
```

---

## Implementation Algorithm

### Complete Function

```typescript
function calculateSidePots(
  players: Player[],
  hand_setup: HandSetup
): PotCalculationResult {
  const bb_ante = hand_setup.ante;

  // STEP 1: Validate inputs
  validatePlayerStacks(players);

  // STEP 2: Handle special case - all fold
  const active_players = players.filter(p => !p.folded);
  if (active_players.length === 1) {
    return createSingleWinnerPot(active_players[0], players, bb_ante);
  }

  // STEP 3: Calculate dead money
  const dead_money = calculateDeadMoney(players, bb_ante, hand_setup.sb);

  // STEP 4: Calculate live contributions
  const contributions = calculateLiveContributions(players, bb_ante);

  // STEP 5: Get contribution levels
  const levels = getContributionLevels(contributions);

  // STEP 6: Build pots
  const pots = buildPots(contributions, levels, bb_ante);

  // STEP 7: Calculate percentages
  calculatePercentages(pots);

  // STEP 8: Validate pot conservation
  validatePotConservation(players, pots);

  // STEP 9: Generate breakdown
  const breakdown = generateBreakdown(pots, contributions, bb_ante);

  const total_pot = pots.reduce((sum, pot) => sum + pot.amount, 0);

  return {
    pots: pots,
    total_pot: total_pot,
    bb_ante: bb_ante,
    breakdown: breakdown
  };
}
```

---

## Data Structures

### Player State Tracking

```typescript
class PlayerState {
  name: string;
  position: string;
  starting_stack: number;
  current_stack: number;

  // Contributions
  total_contribution: number = 0;
  street_contribution: number = 0;
  blind_posted: number = 0;

  // Status
  folded: boolean = false;
  all_in_street: string | null = null;

  // Update methods
  postBlind(amount: number): void {
    this.current_stack -= amount;
    this.total_contribution += amount;
    this.blind_posted = amount;
  }

  processAction(action_type: string, amount: number): void {
    if (action_type === 'fold') {
      this.folded = true;
      return;
    }

    const to_add = amount - this.street_contribution;

    if (to_add >= this.current_stack) {
      // All-in
      const actual_add = this.current_stack;
      this.current_stack = 0;
      this.total_contribution += actual_add;
      this.street_contribution = this.total_contribution;
      this.all_in_street = 'current'; // Set to actual street name
    } else {
      this.current_stack -= to_add;
      this.total_contribution += to_add;
      this.street_contribution = amount;
    }
  }

  resetStreetContribution(): void {
    this.street_contribution = 0;
  }
}
```

---

## Testing Scenarios

### Test 1: Simple - No All-Ins
```
Players: Alice (500), Bob (500), Charlie (500)
Blinds: SB 25, BB 50, Ante 50

Preflop:
- Alice calls 50
- Bob calls 50
- Charlie checks

Result:
- Main Pot: 200 (50×3 + 50 ante)
- Eligible: Alice, Bob, Charlie
```

### Test 2: One All-In
```
Players: Alice (1000), Bob (300), Charlie (1000)
Blinds: SB 25, BB 50, Ante 50

Preflop:
- Alice raises 100
- Bob all-in 300
- Charlie calls 300
- Alice calls 300

Result:
- Main Pot: 950 (300×3 + 50 ante) - Alice, Bob, Charlie eligible
- Side Pot: 0 (no one contributed more)
```

### Test 3: Multiple All-Ins
```
Players: Alice (1000), Bob (300), Charlie (500)
Blinds: SB 25, BB 50, Ante 50

Actions:
- Alice raises 500
- Bob all-in 300
- Charlie all-in 500
- Alice calls 500

Contributions:
- Alice: 500 (live 500)
- Bob: 300 (live 250 = 300 - 50 ante)
- Charlie: 500 (live 500)

Levels: [250, 500]

Pots:
1. Main Pot: 250×3 + 50 = 800
   Eligible: Alice, Bob, Charlie

2. Side Pot 1: (500-250)×2 = 500
   Eligible: Alice, Charlie

Total: 1300
```

### Test 4: Three-Way All-In (Different Stacks)
```
Players: Alice (1500), Bob (300), Charlie (800)
Blinds: SB 50, BB 100, Ante 100

Actions:
- Alice raises 1000
- Bob all-in 300
- Charlie all-in 800
- Alice calls 1000

Contributions:
- Alice: 1000 (live 1000)
- Bob: 300 (live 200 = 300 - 100 ante)
- Charlie: 800 (live 800)

Levels: [200, 800, 1000]

Pots:
1. Main Pot: 200×3 + 100 = 700
   Eligible: Alice, Bob, Charlie

2. Side Pot 1: (800-200)×2 = 1200
   Eligible: Alice, Charlie

3. Side Pot 2: (1000-800)×1 = 200
   Eligible: Alice only

Total: 2100
```

### Test 5: Everyone Folds
```
Players: Alice (1000), Bob (500), Charlie (500)
Blinds: SB 50, BB 100, Ante 100

Preflop:
- Alice raises 300
- Bob folds
- Charlie folds

Result:
- Main Pot: 250 (50 SB + 100 BB + 100 Ante)
- Alice gets back uncalled: 300 - 100 = 200
- Alice wins: 250
```

---

## Formula Summary

### Basic Formulas

1. **Live Contribution**:
   ```
   Live = Total - Dead Money
   For BB: Live = (BB + Ante) - Ante = BB
   ```

2. **Pot Amount at Each Level**:
   ```
   Pot[i] = (Level[i] - Level[i-1]) × RemainingPlayers[i]
   Add Ante to Pot[0] (main pot only)
   ```

3. **Remaining Players**:
   ```
   RemainingPlayers[i] = Count(players where Live > Level[i])
   ```

4. **Pot Eligibility**:
   ```
   Eligible[pot] = All players where Live >= pot.level
   ```

5. **Pot Percentage**:
   ```
   Percentage = (Pot.amount / TotalPot) × 100
   ```

---

## Display Format

### Pot Summary Display
```
Total Pot: 1,300

Main Pot: 800 (61.5%)
  Eligible: Alice, Bob, Charlie
  Calculation: 250×3 + 50 (ante) = 800

Side Pot 1: 500 (38.5%)
  Eligible: Alice, Charlie
  Calculation: (500-250)×2 = 500
```

### Detailed Breakdown
```
Contributions:
  Alice: 500 (live 500)
  Bob: 300 (live 250, ante 50 dead)
  Charlie: 500 (live 500)

Contribution Levels: [250, 500]

Pot Building:
  Level 250: 3 players × 250 = 750 + 50 ante = 800
  Level 500: 2 players × (500-250) = 500

Total: 1,300
```

---

## Implementation Checklist

- [ ] Create PlayerState class with contribution tracking
- [ ] Implement calculateLiveContributions()
- [ ] Implement getContributionLevels()
- [ ] Implement buildPots()
- [ ] Handle edge case: all players fold
- [ ] Handle edge case: no all-ins (single pot)
- [ ] Handle edge case: multiple all-ins same level
- [ ] Handle edge case: uncalled bet
- [ ] Handle edge case: dead small blind
- [ ] Add validation: stack overflow check
- [ ] Add validation: pot conservation check
- [ ] Implement split pot logic (multiple winners)
- [ ] Create pot display UI component
- [ ] Add "Process Stack" button to each street
- [ ] Display pot calculation breakdown
- [ ] Write unit tests for each scenario

---

## References

- **Algorithm Source**: `docs/QA/sidepot_calculator.py`
- **Validation Results**: `docs/QA/POT_CALCULATION_REVIEW.md`
- **Test Cases**: `docs/QA/40_TestCases.html` (100% pass on side pot structure)

---

**END OF SPECIFICATION**
