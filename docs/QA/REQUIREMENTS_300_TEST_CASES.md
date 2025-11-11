# Requirements for 300 Test Cases Generation

## Document Information
- **Created**: 2025-11-11
- **Purpose**: Complete guide for generating 300 validated poker hand history test cases
- **Status**: Ready for Implementation
- **Output File**: `300_TestCases.html`
- **Lessons Learned From**: 30 base test cases (negative stack issues resolved)

---

## Table of Contents
1. [Required Reference Documents](#required-reference-documents)
2. [Test Case Distribution](#test-case-distribution)
3. [Critical Validation Rules](#critical-validation-rules)
4. [Step-by-Step Generation Workflow](#step-by-step-generation-workflow)
5. [Common Errors to Avoid](#common-errors-to-avoid)
6. [Validation Checkpoints](#validation-checkpoints)
7. [Success Criteria](#success-criteria)

---

## Required Reference Documents

### CRITICAL - Must Read Before Starting

#### 1. TEST_CASE_GENERATION_SPEC.md ⭐⭐⭐
**Location**: `C:\Apps\HUDR\HHTool_Modular\docs\QA\TEST_CASE_GENERATION_SPEC.md`

**Why Critical**: Single source of truth for ALL validation rules

**Key Sections to Follow**:
- **Section 2**: Betting Terminology - "Raise TO" vs "Raise BY" (prevents double-counting blinds)
- **Section 4**: Base vs More Section Assignment (action order)
- **Section 6**: Button Rotation (clockwise progression)
- **Section 7**: BB Ante Posting Order (ante first, then blind)
- **Section 7 (NEW)**: No Negative Stacks Rule (CRITICAL - prevents biggest issue)

**What It Prevents**:
- ❌ Players contributing more than starting stack
- ❌ Negative final stacks
- ❌ Double-counting blinds in raises
- ❌ Wrong action order
- ❌ Incorrect button rotation

---

#### 2. validate_all_cases.py ⭐⭐⭐
**Location**: `C:\Apps\HUDR\HHTool_Modular\docs\QA\validate_all_cases.py`

**Why Critical**: This script caught ALL negative stack errors in 30 test cases

**What It Validates**:
```python
# Line 61-64: Negative stacks in Stack Setup (Next Hand Preview)
if player['stack'] < 0:
    errors.append(f"[NEGATIVE STACK] {player['name']} has stack {player['stack']}")

# Line 131-133: Negative final stacks in Expected Results table
if final < 0:
    errors.append(f"[NEGATIVE FINAL] {player['name']} final stack is {final:,}")

# Line 135-137: Over-contribution detection
if contributed > starting:
    errors.append(f"[OVER-CONTRIBUTION] {player['name']} contributed {contributed:,} but only started with {starting:,}")

# Line 139-142: Calculation accuracy
expected_final = starting - contributed
if final != expected_final:
    errors.append(f"[CALCULATION ERROR] {player['name']} final should be {expected_final:,}")

# Line 159-164: Negative stacks in Next Hand Preview
if next_stack < 0:
    errors.append(f"[NEXT HAND NEGATIVE] {parts[0]} shows stack {next_stack}")
```

**How to Use**:
```bash
cd C:\Apps\HUDR\HHTool_Modular\docs\QA
python validate_all_cases.py
```

**Expected Output**:
```
Total Test Cases: 300
Passed: 300 (100.0%)
Failed: 0 (0.0%)
```

---

#### 3. validate_action_order.py ⭐⭐⭐ (NEW!)
**Location**: `C:\Apps\HUDR\HHTool_Modular\docs\QA\validate_action_order.py`

**Why Critical**: Validates correct action order for preflop and postflop - 50% of 30 test cases failed this!

**What It Validates**:
- **2-player (Heads-Up) preflop**: SB acts first, BB acts last
- **2-player (Heads-Up) postflop**: BB acts first, SB/Dealer acts last
- **3-player preflop**: Dealer → SB → BB
- **3-player postflop**: SB → BB → Dealer
- **4+ player preflop**: UTG (no position label) → others → Dealer → SB → BB
- **4+ player postflop**: SB → BB → UTG → others → Dealer

**How to Use**:
```bash
cd C:\Apps\HUDR\HHTool_Modular\docs\QA
python validate_action_order.py
```

**Expected Output**:
```
Total test cases: 300
Passed: 300
Failed: 0
```

**Common Errors This Catches**:
- ❌ SB acting first in 4+ player preflop (should be UTG)
- ❌ SB acting first in heads-up postflop (should be BB)
- ❌ Wrong position acting first on any street

**See Also**: [ACTION_ORDER_VALIDATION_SUMMARY.md](ACTION_ORDER_VALIDATION_SUMMARY.md) for complete rules

---

#### 4. TC10_NEGATIVE_STACK_ISSUE_REPORT.md ⭐⭐
**Location**: `C:\Apps\HUDR\HHTool_Modular\docs\QA\TC10_NEGATIVE_STACK_ISSUE_REPORT.md`

**Why Important**: Documents the exact error pattern we encountered and fixed

**Key Lesson**:
```
WRONG:
Alice has 40,000 remaining
Action: "Call 50,000" ❌
Result: Final stack = -10,000 ❌

CORRECT:
Alice has 40,000 remaining
Action: "All-In 40,000" ✅
Result: Final stack = 0 ✅
```

**Rule to Remember**:
> "Before allowing ANY action, check if player has sufficient chips. If action > remaining stack, AUTO-CONVERT to All-In for exact remaining amount."

---

#### 4. 30_TestCases.html (Golden Reference) ⭐⭐
**Location**: `C:\Apps\HUDR\HHTool_Modular\docs\QA\30_TestCases.html`

**Why Important**: 100% validated reference (30/30 pass rate)

**Use As Template For**:
- HTML structure and CSS styling
- Pot calculation formatting
- Winner badge implementation
- Copy/paste button functionality
- Collapsed state implementation
- Next Hand Preview format

**Verification**:
```bash
cd C:\Apps\HUDR\HHTool_Modular\docs\QA
sed 's/30_base_validated_cases.html/30_TestCases.html/' validate_all_cases.py > temp_validate.py
python temp_validate.py
# Should show: Passed: 30 (100.0%)
```

---

#### 5. REQUIREMENTS_30_BASE_TEST_CASES.md ⭐
**Location**: `C:\Apps\HUDR\HHTool_Modular\docs\QA\REQUIREMENTS_30_BASE_TEST_CASES.md`

**Why Important**: Contains all feature requirements

**Key Requirements to Scale Up**:
- Stack size ranges (10-60 BB)
- Blind structures (hundreds to millions)
- Different stacks per player
- Copy/paste functionality
- Default collapsed state
- Google Sheets compatibility

---

## Test Case Distribution (300 Total)

### Complexity Levels

**Simple (100 test cases) - TC-1 to TC-100**
- Player count: 2-3 players
- Streets: Preflop to Flop (max)
- Action: Straightforward betting, minimal raises
- Side pots: 0-1 side pots
- Stack depth: 20-40 BB

**Medium (120 test cases) - TC-101 to TC-220**
- Player count: 4-6 players
- Streets: Preflop to Turn/River
- Action: Multiple raises, re-raises
- Side pots: 1-2 side pots
- Stack depth: 10-30 BB (shorter stacks, more all-ins)

**Complex (80 test cases) - TC-221 to TC-300**
- Player count: 7-9 players
- Streets: All streets with heavy action
- Action: Multi-way pots, aggressive betting
- Side pots: 2-4 side pots
- Stack depth: Mix of 10-60 BB

---

### Player Count Distribution

| Player Count | Number of Test Cases | TC Range |
|--------------|---------------------|----------|
| 2 players (Heads-up) | 40 | TC-1 to TC-40 |
| 3 players | 60 | TC-41 to TC-100 |
| 4 players | 40 | TC-101 to TC-140 |
| 5 players | 40 | TC-141 to TC-180 |
| 6 players | 40 | TC-181 to TC-220 |
| 7 players | 30 | TC-221 to TC-250 |
| 8 players | 30 | TC-251 to TC-280 |
| 9 players | 20 | TC-281 to TC-300 |

---

### Blind Structure Distribution

**REQUIREMENT**: All numeric values (no abbreviations like "K" or "M")

| Range | SB/BB/Ante Examples | Number of Cases |
|-------|---------------------|-----------------|
| Hundreds | 50/100/100, 250/500/500 | 30 |
| Thousands | 500/1,000/1,000, 2,500/5,000/5,000 | 60 |
| Tens of Thousands | 5,000/10,000/10,000, 25,000/50,000/50,000 | 60 |
| Hundreds of Thousands | 50,000/100,000/100,000, 250,000/500,000/500,000 | 90 |
| Millions | 500,000/1,000,000/1,000,000, 2,500,000/5,000,000/5,000,000 | 60 |

**Format**: Always use comma formatting: `1,000,000` not `1M`

---

### Stack Size Requirements

**CRITICAL RULE**: Each player MUST have a different starting stack

**Stack Range**: 10 BB to 60+ BB

**Distribution Per Test Case**:
- Short stacks (10-20 BB): At least 1 player
- Medium stacks (21-40 BB): At least 1 player
- Deep stacks (41-60+ BB): At least 1 player

**Example for 6-player test case with BB = 100,000**:
```
Alice Dealer: 51,000,000  (51 BB) ✅ Deep
Bob SB: 15,000,000        (15 BB) ✅ Short
Charlie BB: 36,000,000    (36 BB) ✅ Medium
David: 33,000,000         (33 BB) ✅ Medium
Eve: 49,000,000           (49 BB) ✅ Deep
Frank: 60,000,000         (60 BB) ✅ Deep
```

**WRONG Example**:
```
Alice: 50,000,000
Bob: 50,000,000  ❌ Duplicate stack size!
```

---

## Critical Validation Rules

### Rule 1: No Negative Final Stacks (MOST CRITICAL)

**From TEST_CASE_GENERATION_SPEC.md Section 7**

**The Rule**:
```
A player's Final Stack can NEVER be negative.
In poker, you cannot lose more chips than you possess.
```

**Validation Formula**:
```python
Total Contribution = Starting Stack - Final Stack

# For every player:
assert contributed <= starting_stack, "Player cannot contribute more than they have"
assert final_stack >= 0, "Final stack cannot be negative"
assert contributed == (starting_stack - final_stack), "Math must match"
```

**Example - WRONG**:
```
Bob (SB):
- Starting: 15,000,000
- Preflop: Raise 3,000,000
- Flop: Bet 5,000,000
- Turn: Bet 10,000,000 ❌ (only has 7,000,000 left!)
- Total: 18,000,000 ❌ (exceeds starting stack)
- Final: -3,000,000 ❌ IMPOSSIBLE!
```

**Example - CORRECT**:
```
Bob (SB):
- Starting: 15,000,000
- Preflop: Raise 3,000,000 → Stack: 12,000,000
- Flop: Bet 5,000,000 → Stack: 7,000,000
- Turn: All-In 7,000,000 ✅ → Stack: 0
- Total: 15,000,000 ✅
- Final: 0 ✅ CORRECT!
```

**How to Prevent**:
```python
def validate_action_before_executing(player, action_amount):
    remaining_stack = player.starting_stack - player.contributed_so_far

    if action_amount > remaining_stack:
        # AUTO-CONVERT to all-in
        action_amount = remaining_stack
        action_type = "All-In"

    return action_amount, action_type
```

---

### Rule 2: Action Order Must Be Correct (NEW - CRITICAL!)

**From TEST_CASE_GENERATION_SPEC.md Section "Action Order"**

**The Problem**: 50% of 30 test cases had wrong action order (SB acting first in 4+ player preflop instead of UTG)

**The Rules**:

#### 2-Player (Heads-Up)
```
Preflop:  SB acts first → BB acts last (SB is also Dealer)
Postflop: BB acts first → SB/Dealer acts last (Button acts last postflop!)
```

#### 3-Player
```
Preflop:  Dealer → SB → BB
Postflop: SB → BB → Dealer
```

#### 4+ Players
```
Preflop:  UTG (no position label) → others → Dealer → SB → BB
Postflop: SB → BB → UTG → others → Dealer
```

**Example - 4 Players WRONG**:
```
Preflop Actions:
1. Bob (SB): Raise 30,000      ❌ SB acting first (only correct for heads-up!)
2. Charlie (BB): Call 30,000
3. David (UTG): Call 30,000
4. Alice (Dealer): Call 30,000
```

**Example - 4 Players CORRECT**:
```
Preflop Actions:
1. David (UTG): Raise 30,000   ✅ UTG acts first (left of BB)
2. Alice (Dealer): Call 30,000
3. Bob (SB): Call 30,000
4. Charlie (BB): Call 30,000   ✅ BB acts last
```

**Critical Points**:
- Preflop first actor (UTG in 4+ players) can: **Call BB, Raise, or Fold**
- Postflop first actor can: **Check, Bet, or Fold** (CANNOT Call - nothing to call!)
- In heads-up: SB is also the Dealer/Button
- Postflop in heads-up: BB acts first because button acts last

**Validation**:
```python
python validate_action_order.py
```

**See Also**:
- [ACTION_ORDER_VALIDATION_SUMMARY.md](ACTION_ORDER_VALIDATION_SUMMARY.md)
- [FIX_PLAN_ACTION_ORDER.md](FIX_PLAN_ACTION_ORDER.md)

---

### Rule 3: "Raise TO" Not "Raise BY"

**From TEST_CASE_GENERATION_SPEC.md Section 2**

**The Rule**:
```
"Raise TO X" = Player's TOTAL bet becomes X (includes blinds already posted)
"Raise BY X" = Player adds X MORE to their current bet
```

**Example - WRONG Calculation**:
```
Bob (SB):
- Posts SB: 2,500 → stack: 162,500
- Raises TO 15,000

WRONG calculation:
Contribution = 2,500 (SB) + 15,000 (raise) = 17,500 ❌

Bob would need: 162,500 - 17,500 = 145,000 remaining
But this is WRONG!
```

**Example - CORRECT Calculation**:
```
Bob (SB):
- Posts SB: 2,500 → stack: 162,500
- Raises TO 15,000

CORRECT calculation:
"Raise TO 15,000" means TOTAL bet = 15,000 (includes the 2,500 SB)
Additional amount: 15,000 - 2,500 = 12,500
Contribution = 15,000 total ✅

Bob's stack: 165,000 - 15,000 = 150,000 ✅
```

**Validation**:
```python
# For SB/BB raises, the blind is INCLUDED in the raise amount
if position == "SB":
    total_contribution = raise_to_amount  # NOT (sb + raise_to_amount)
    additional_amount = raise_to_amount - sb_amount

if position == "BB":
    total_contribution = raise_to_amount  # NOT (bb + raise_to_amount)
    additional_amount = raise_to_amount - bb_amount
```

---

### Rule 3: BB Ante Posting Order

**The Rule**:
```
1. BB posts ANTE FIRST (dead money)
2. BB posts BLIND SECOND (live money)
3. BB's available stack = Starting Stack - Ante - Blind
```

**Example**:
```
Charlie (BB):
- Starting: 265,000
- Posts Ante: 5,000 (dead) → stack: 260,000
- Posts BB: 5,000 (live) → stack: 255,000
- Available for betting: 255,000 ✅

Charlie's contributions:
- Total: 10,000 (5,000 ante + 5,000 BB)
- Live: 5,000 (BB only, for pot eligibility)
- Dead: 5,000 (ante, already in pot)
```

---

### Rule 4: Contribution = Starting - Final

**The Rule**:
```python
For EVERY player in EVERY test case:
player.contributed == (player.starting_stack - player.final_stack)
```

**If this formula doesn't match, you have a calculation error.**

**Example Validation**:
```
Alice:
- Starting: 80,000
- Final: 0
- Contributed: Must be 80,000 ✅

Bob:
- Starting: 165,000
- Final: 75,000
- Contributed: Must be 90,000 ✅

Charlie:
- Starting: 265,000
- Final: 170,000
- Contributed: Must be 95,000 ✅
```

---

### Rule 5: Total Pot = Sum of All Contributions

**The Rule**:
```python
total_pot = sum(player.contributed for all players)
```

**Example**:
```
Alice contributed: 80,000
Bob contributed: 90,000
Charlie contributed: 95,000 (includes 5,000 ante)

Total pot = 80,000 + 90,000 + 95,000 = 265,000 ✅
```

**Note**: The BB ante is included in the BB's total contribution, so you don't add it separately.

---

### Rule 6: All Players in Next Hand Preview

**The Rule**:
```
ALL players must appear in Next Hand Preview, including eliminated players with 0 stack.
```

**Example**:
```
Hand (11)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 2500 BB 5000 Ante 5000
Stack Setup:
Bob Dealer 75000      ✅ Winner, shows new stack
Charlie SB 435000     ✅ Winner, shows new stack
Alice BB 0            ✅ Eliminated, but MUST appear with 0
```

**WRONG**:
```
Hand (11)
Bob Dealer 75000
Charlie SB 435000
# Alice missing! ❌
```

---

### Rule 7: Button Rotation

**The Rule**:
```
3+ players: Previous SB → New Dealer (clockwise)
2 players: Players swap positions each hand
```

**Example (3+ players)**:
```
Hand 10:
Alice Dealer
Bob SB
Charlie BB

Hand 11 (Next Hand):
Bob Dealer      ✅ Previous SB becomes new Dealer
Charlie SB      ✅ Previous BB becomes new SB
Alice BB        ✅ Previous Dealer becomes new BB
```

**Example (2 players - Heads-up)**:
```
Hand 10:
Alice SB
Bob BB

Hand 11 (Next Hand):
Bob SB          ✅ Players swap
Alice BB        ✅ Players swap
```

---

### Rule 8: Position Labels

**The Rule**:
```
ONLY show position labels for: Dealer, SB, BB
DO NOT show: UTG, MP, CO, HJ
```

**CORRECT**:
```
Stack Setup:
Alice Dealer 51000000  ✅
Bob SB 15000000        ✅
Charlie BB 36000000    ✅
David 33000000         ✅ No position label
Eve 49000000           ✅ No position label
Frank 60000000         ✅ No position label
```

**WRONG**:
```
Stack Setup:
Alice Dealer 51000000
Bob SB 15000000
Charlie BB 36000000
David UTG 33000000     ❌ Don't show UTG
Eve MP 49000000        ❌ Don't show MP
Frank CO 60000000      ❌ Don't show CO
```

---

### Rule 9: Stack Setup Order

**The Rule**:
```
3+ players: Start with Dealer, then SB, BB, then others
2 players: Start with SB, then BB (no Dealer position)
```

**CORRECT (3+ players)**:
```
Stack Setup:
Alice Dealer 51000000  ✅ First
Bob SB 15000000        ✅ Second
Charlie BB 36000000    ✅ Third
David 33000000         ✅ Fourth
```

**WRONG (3+ players)**:
```
Stack Setup:
Bob SB 15000000        ❌ SB first (should be Dealer first)
Charlie BB 36000000
Alice Dealer 51000000
```

**CORRECT (2 players)**:
```
Stack Setup:
Alice SB 6000          ✅ No Dealer position in heads-up
Bob BB 4000            ✅
```

---

## Step-by-Step Generation Workflow

### Phase 1: Setup (Before Starting)

**Step 1.1: Load All Reference Documents**
```
✅ Read TEST_CASE_GENERATION_SPEC.md (entire file)
✅ Read TC10_NEGATIVE_STACK_ISSUE_REPORT.md (understand common errors)
✅ Read validate_all_cases.py (understand validation logic)
✅ Open 30_TestCases.html (reference for HTML structure)
✅ Read REQUIREMENTS_30_BASE_TEST_CASES.md (understand features)
```

**Step 1.2: Create Output File**
```
File: C:\Apps\HUDR\HHTool_Modular\docs\QA\300_TestCases.html
Based on: 30_TestCases.html (copy HTML structure, CSS, JavaScript)
```

**Step 1.3: Create Generation Plan**
```
Total: 300 test cases
Batch size: 10 test cases at a time
Validation: After EACH test case
Checkpoints: Every 10, 50, 100, 150, 200, 250 test cases
```

---

### Phase 2: Generate ONE Test Case (Repeat 300 Times)

**Step 2.1: Determine Test Case Parameters**

```python
# Example for TC-145 (medium complexity, 5 players)
tc_id = "TC-145"
player_count = 5
complexity = "Medium"
sb = 10000
bb = 20000
ante = 20000

# Assign different starting stacks (10-60 BB range)
players = [
    {"name": "Alice", "position": "Dealer", "stack": 1100000},  # 55 BB
    {"name": "Bob", "position": "SB", "stack": 250000},         # 12.5 BB (short)
    {"name": "Charlie", "position": "BB", "stack": 620000},     # 31 BB (medium)
    {"name": "David", "position": "", "stack": 480000},         # 24 BB (medium)
    {"name": "Eve", "position": "", "stack": 950000}            # 47.5 BB (deep)
]

# Verify: All stacks are different ✅
# Verify: Mix of short, medium, deep ✅
```

---

**Step 2.2: Design Action Sequence (CRITICAL - Prevent Negative Stacks)**

```python
def design_actions(players, sb, bb, ante):
    """
    Design action sequence ensuring NO player contributes more than starting stack.
    """

    # Track each player's remaining stack
    remaining_stacks = {p["name"]: p["stack"] for p in players}

    # Charlie posts BB ante first
    remaining_stacks["Charlie"] -= ante  # Charlie now has 600,000
    remaining_stacks["Charlie"] -= bb    # Charlie now has 580,000

    # Bob posts SB
    remaining_stacks["Bob"] -= sb        # Bob now has 240,000

    actions = []

    # Preflop Base
    # David (first to act after BB) - Check available stack before action
    david_stack = remaining_stacks["David"]  # 480,000
    action_amount = 60000  # David wants to raise to 60,000
    if action_amount <= david_stack:
        actions.append({"player": "David", "action": "Raise", "amount": 60000})
        remaining_stacks["David"] -= 60000  # Now has 420,000
    else:
        # If not enough, auto all-in
        actions.append({"player": "David", "action": "All-In", "amount": david_stack})
        remaining_stacks["David"] = 0

    # Continue for each player...
    # ALWAYS check remaining_stacks[player] before allowing action

    return actions, remaining_stacks
```

**CRITICAL CHECK After Each Action**:
```python
def validate_action(player_name, action_amount, remaining_stacks):
    """
    Validate action is possible before executing.
    """
    available = remaining_stacks[player_name]

    if action_amount > available:
        # AUTO-CONVERT to all-in
        print(f"WARNING: {player_name} tried to bet {action_amount:,} but only has {available:,}")
        print(f"AUTO-CONVERTING to All-In {available:,}")
        return "All-In", available

    return "Bet/Call/Raise", action_amount
```

---

**Step 2.3: Calculate Contributions**

```python
def calculate_contributions(players, actions, ante_player):
    """
    Calculate each player's total contribution.
    """
    contributions = {}

    for player in players:
        name = player["name"]
        starting = player["stack"]

        # Sum all actions for this player
        total_from_actions = 0
        for action in actions:
            if action["player"] == name:
                total_from_actions += action["amount"]

        # Add ante if this is the BB
        if name == ante_player:
            total_from_actions += ante

        contributions[name] = total_from_actions

    return contributions
```

---

**Step 2.4: Calculate Final Stacks**

```python
def calculate_final_stacks(players, contributions):
    """
    Calculate final stack for each player.
    """
    final_stacks = {}

    for player in players:
        name = player["name"]
        starting = player["stack"]
        contributed = contributions[name]

        # CRITICAL FORMULA
        final = starting - contributed

        # VALIDATION CHECK
        if final < 0:
            raise ValueError(f"ERROR: {name} has negative final stack {final:,}!")

        if contributed > starting:
            raise ValueError(f"ERROR: {name} contributed {contributed:,} but only started with {starting:,}!")

        final_stacks[name] = final

    return final_stacks
```

---

**Step 2.5: Calculate Pots**

```python
def calculate_pots(players, contributions, final_stacks):
    """
    Calculate main pot and side pots.
    """
    # Total pot
    total_pot = sum(contributions.values())

    # Find all-in players (final stack = 0)
    all_in_amounts = []
    for player in players:
        name = player["name"]
        if final_stacks[name] == 0:
            all_in_amounts.append(contributions[name])

    # Sort all-in amounts
    all_in_amounts = sorted(set(all_in_amounts))

    pots = []

    if len(all_in_amounts) == 0:
        # No all-ins, just main pot
        pots.append({
            "name": "Main Pot",
            "amount": total_pot,
            "eligible": [p["name"] for p in players]
        })
    else:
        # Calculate main pot (smallest all-in)
        smallest_all_in = all_in_amounts[0]
        num_players = len(players)
        main_pot = smallest_all_in * num_players

        pots.append({
            "name": "Main Pot",
            "amount": main_pot,
            "eligible": [p["name"] for p in players]
        })

        # Calculate side pots
        # (implementation details...)

    return pots, total_pot
```

---

**Step 2.6: Determine Winners and New Stacks**

```python
def determine_winners(players, pots, final_stacks):
    """
    Assign pot winners and calculate new stacks.
    """
    # Assign winners (can be manual or random for test purposes)
    winners = {
        "Main Pot": "Alice",
        "Side Pot 1": "Bob"
    }

    new_stacks = {}

    for player in players:
        name = player["name"]
        final = final_stacks[name]

        # Add winnings
        winnings = 0
        for pot in pots:
            if pot.get("winner") == name:
                winnings += pot["amount"]

        new_stacks[name] = final + winnings

    return winners, new_stacks
```

---

**Step 2.7: Generate Next Hand Preview**

```python
def generate_next_hand_preview(players, new_stacks, current_hand_num, sb, bb, ante):
    """
    Generate Next Hand Preview with button rotation.
    """
    next_hand_num = current_hand_num + 1

    # Button rotation
    if len(players) >= 3:
        # Previous SB → New Dealer
        prev_sb_idx = next(i for i, p in enumerate(players) if p["position"] == "SB")
        new_dealer_idx = prev_sb_idx
        new_sb_idx = (new_dealer_idx + 1) % len(players)
        new_bb_idx = (new_dealer_idx + 2) % len(players)
    else:
        # Heads-up: swap positions
        new_dealer_idx = None  # No dealer in heads-up
        # Swap SB and BB
        prev_sb_idx = next(i for i, p in enumerate(players) if p["position"] == "SB")
        prev_bb_idx = next(i for i, p in enumerate(players) if p["position"] == "BB")
        new_sb_idx = prev_bb_idx
        new_bb_idx = prev_sb_idx

    # Build next hand preview
    next_hand = f"Hand ({next_hand_num})\n"
    next_hand += f"started_at: 00:05:40 ended_at: HH:MM:SS\n"
    next_hand += f"SB {sb} BB {bb} Ante {ante}\n"
    next_hand += f"Stack Setup:\n"

    # Order: Dealer (if 3+), SB, BB, others
    if len(players) >= 3:
        next_hand += f"{players[new_dealer_idx]['name']} Dealer {new_stacks[players[new_dealer_idx]['name']]}\n"

    next_hand += f"{players[new_sb_idx]['name']} SB {new_stacks[players[new_sb_idx]['name']]}\n"
    next_hand += f"{players[new_bb_idx]['name']} BB {new_stacks[players[new_bb_idx]['name']]}\n"

    # Other players (without position labels)
    for i, player in enumerate(players):
        if i not in [new_dealer_idx, new_sb_idx, new_bb_idx]:
            next_hand += f"{player['name']} {new_stacks[player['name']]}\n"

    return next_hand
```

---

**Step 2.8: Generate HTML for Test Case**

```python
def generate_html_test_case(tc_id, players, actions, pots, contributions,
                            final_stacks, winners, new_stacks, next_hand_preview,
                            sb, bb, ante):
    """
    Generate HTML for one test case.
    Use 30_TestCases.html as template.
    """

    html = f"""
    <!-- TEST CASE {tc_id.split('-')[1]} -->
    <div class="test-case">
        <div class="test-header" onclick="toggleTestCase(this)">
            <div>
                <div class="test-id">{tc_id}</div>
                <div class="test-name">{player_count}P {complexity} - Description</div>
            </div>
            <div class="badges">
                <span class="badge {complexity.lower()}">{complexity}</span>
                <span class="collapse-icon collapsed">▶</span>
            </div>
        </div>

        <div class="test-content collapsed">
        <div style="background: #e8f5e9; border: 2px solid #4caf50; padding: 10px; margin: 10px 0; border-radius: 4px;">
<strong style="color: #2e7d32;">✅ ALL VALIDATIONS PASSED</strong>
</div>

        <!-- Stack Setup section -->
        <!-- Actions section -->
        <!-- Expected Results section -->
        <!-- Next Hand Preview section -->

        </div>
    </div>
    """

    return html
```

---

### Phase 3: Validate IMMEDIATELY After Generating

**Step 3.1: Save Test Case to HTML File**

```python
# Append test case to 300_TestCases.html
with open("300_TestCases.html", "a", encoding="utf-8") as f:
    f.write(html_test_case)
```

---

**Step 3.2: Run Validation Scripts**

**Run BOTH validation scripts for each test case:**

```bash
cd C:\Apps\HUDR\HHTool_Modular\docs\QA

# Validation 1: Stack calculations, negative checks, pot totals
python validate_all_cases.py

# Validation 2: Action order (NEW!)
python validate_action_order.py
```

**Expected Output for Single Test Case**:

**validate_all_cases.py**:
```
================================================================================
VALIDATION REPORT - 300 Base Test Cases
================================================================================

[No errors should be printed if test case is valid]

================================================================================
SUMMARY
================================================================================
Total Test Cases: 1 (or current count)
Passed: 1 (100.0%)
Failed: 0 (0.0%)
```

**validate_action_order.py**:
```
================================================================================
ACTION ORDER VALIDATION REPORT
================================================================================

Found 1 test cases

[No errors should be printed if action order is correct]

================================================================================
SUMMARY
================================================================================
Total test cases: 1
Passed: 1
Failed: 0
```

---

**Step 3.3: Handle Validation Failures**

**IF validation fails**:

```
TC-145 (Hand 145): 5 players - FAIL
  [NEGATIVE FINAL] Bob final stack is -10,000 (must be >= 0)
  [OVER-CONTRIBUTION] Bob contributed 260,000 but only started with 250,000
```

**STOP IMMEDIATELY**:
1. ❌ DO NOT proceed to TC-146
2. ❌ DO NOT generate more test cases
3. ✅ FIX TC-145 first
4. ✅ Re-validate TC-145
5. ✅ Only proceed when TC-145 passes

**How to Fix**:
```python
# Find where Bob over-contributed
# Example: Bob tried to call 60,000 when only had 50,000 left

# BEFORE (WRONG):
actions.append({"player": "Bob", "action": "Call", "amount": 60000})

# AFTER (CORRECT):
bob_remaining = 50000
actions.append({"player": "Bob", "action": "All-In", "amount": bob_remaining})
```

---

**Step 3.4: Only Proceed When Validation Passes**

```
✅ TC-145 passes validation
✅ Move to TC-146
```

---

### Phase 4: Batch Validation at Checkpoints

**Every 10 test cases (TC-10, TC-20, TC-30, ..., TC-300)**:

```bash
cd C:\Apps\HUDR\HHTool_Modular\docs\QA
python validate_all_cases.py | tee validation_checkpoint_$(date +%Y%m%d_%H%M%S).txt
```

**Check summary**:
```
Total Test Cases: 10
Passed: 10 (100.0%)
Failed: 0 (0.0%)
```

**If any failures**:
- Fix immediately
- Do not proceed until 100% pass rate

---

**Every 50 test cases (TC-50, TC-100, TC-150, TC-200, TC-250, TC-300)**:

```bash
# Full validation with detailed report
cd C:\Apps\HUDR\HHTool_Modular\docs\QA
python validate_all_cases.py > validation_checkpoint_50.txt
cat validation_checkpoint_50.txt

# Check for any error patterns
grep "FAIL" validation_checkpoint_50.txt
grep "NEGATIVE" validation_checkpoint_50.txt
grep "OVER-CONTRIBUTION" validation_checkpoint_50.txt
```

---

### Phase 5: Final Validation (After All 300 Complete)

**Step 5.1: Run Complete Validation**

```bash
cd C:\Apps\HUDR\HHTool_Modular\docs\QA
python validate_all_cases.py | tee final_validation_report.txt
```

**Expected Output**:
```
================================================================================
VALIDATION REPORT - 300 Test Cases
================================================================================

================================================================================
SUMMARY
================================================================================
Total Test Cases: 300
Passed: 300 (100.0%)
Failed: 0 (0.0%)

================================================================================
```

---

**Step 5.2: Verify Distribution**

```python
# Check blind structure distribution
blind_structures = {
    "hundreds": 0,
    "thousands": 0,
    "tens_of_thousands": 0,
    "hundreds_of_thousands": 0,
    "millions": 0
}

# Check player count distribution
player_counts = {2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0}

# Check complexity distribution
complexity_levels = {"Simple": 0, "Medium": 0, "Complex": 0}

# Verify all are within expected ranges
```

---

**Step 5.3: Manual Spot Check**

Manually review these test cases in browser:
- TC-1 (first test case)
- TC-150 (middle test case)
- TC-300 (last test case)
- Any random 5 test cases

**Check**:
- ✅ All collapsed by default
- ✅ Copy buttons work
- ✅ Paste from clipboard works
- ✅ Compare function works
- ✅ Winner badges display correctly
- ✅ No negative stacks visible
- ✅ Next Hand Preview correct

---

## Common Errors to Avoid

### Error 1: Over-Contribution (Leads to Negative Stacks)

**Symptom**:
```
[OVER-CONTRIBUTION] Eve contributed 18,000,000 but only started with 17,000,000
[NEGATIVE FINAL] Eve final stack is -1,000,000
```

**Cause**:
```python
# Player allowed to bet more than they have
eve_remaining = 5000000
action = {"player": "Eve", "action": "Call", "amount": 6000000}  # ❌ Too much!
```

**Fix**:
```python
# Always check before action
eve_remaining = 5000000
action_amount = 6000000

if action_amount > eve_remaining:
    # Auto-convert to all-in
    action = {"player": "Eve", "action": "All-In", "amount": eve_remaining}
```

**Prevention**:
```python
# Track remaining stack for each player throughout action sequence
remaining_stacks = {p["name"]: p["stack"] for p in players}

# After each action, update remaining
remaining_stacks[player_name] -= action_amount

# Before next action, check remaining
if next_action_amount > remaining_stacks[player_name]:
    # Auto all-in
    next_action_amount = remaining_stacks[player_name]
```

---

### Error 2: Double-Counting Blinds

**Symptom**:
```
Bob (SB) contributed 92,500 instead of 90,000
Total pot is 275,000 instead of 265,000
```

**Cause**:
```python
# WRONG: Treating "Raise TO 15,000" as "Raise BY 15,000"
bob_contribution = sb_amount + raise_amount  # ❌
bob_contribution = 2500 + 15000 = 17500  # ❌ WRONG!
```

**Fix**:
```python
# CORRECT: "Raise TO 15,000" means TOTAL bet = 15,000
bob_contribution = raise_to_amount  # ✅
bob_contribution = 15000  # ✅ CORRECT! (includes the 2,500 SB)
```

**Remember**:
- "Raise TO X" = total becomes X (includes blind)
- "Raise BY X" = add X more to current bet
- Test cases use "Raise TO" syntax

---

### Error 3: Missing Players in Next Hand Preview

**Symptom**:
```
[ALL PLAYERS] Player Alice missing from Next Hand Preview
```

**Cause**:
```python
# Only including non-eliminated players
for player in players:
    if new_stacks[player["name"]] > 0:  # ❌ WRONG!
        next_hand += f"{player['name']} {new_stacks[player['name']]}\n"
```

**Fix**:
```python
# Include ALL players, even eliminated
for player in players:
    stack = new_stacks[player["name"]]
    next_hand += f"{player['name']} {stack}\n"  # ✅ Even if stack = 0
```

---

### Error 4: Incorrect Button Rotation

**Symptom**:
```
[BUTTON ROTATION] Previous SB (Bob) should be New Dealer, but New Dealer is Alice
```

**Cause**:
```python
# Wrong rotation logic
new_dealer = previous_dealer + 1  # ❌ WRONG!
```

**Fix**:
```python
# Correct rotation: Previous SB → New Dealer
prev_sb_idx = next(i for i, p in enumerate(players) if p["position"] == "SB")
new_dealer_idx = prev_sb_idx  # ✅ CORRECT!
new_sb_idx = (new_dealer_idx + 1) % len(players)
new_bb_idx = (new_dealer_idx + 2) % len(players)
```

---

### Error 5: Showing UTG/MP/CO/HJ Positions

**Symptom**:
```
[INVALID POSITION] David has 'UTG' (only Dealer, SB, BB allowed)
```

**Cause**:
```python
# Showing positions for all players
next_hand += f"David UTG 33000000\n"  # ❌ WRONG!
```

**Fix**:
```python
# Only show positions for Dealer, SB, BB
if player_idx == dealer_idx:
    next_hand += f"{player['name']} Dealer {stack}\n"
elif player_idx == sb_idx:
    next_hand += f"{player['name']} SB {stack}\n"
elif player_idx == bb_idx:
    next_hand += f"{player['name']} BB {stack}\n"
else:
    next_hand += f"{player['name']} {stack}\n"  # ✅ No position
```

---

### Error 6: Duplicate Stack Sizes

**Symptom**:
```
[DUPLICATE STACKS] 2 players have stack 50,000,000 (all players must have different stacks)
```

**Cause**:
```python
# Using same stack size for multiple players
stacks = [50000000, 50000000, 40000000]  # ❌ DUPLICATE!
```

**Fix**:
```python
# Ensure all stacks are unique
stacks = [51000000, 49000000, 40000000]  # ✅ All different

# Validation
assert len(stacks) == len(set(stacks)), "All stacks must be unique"
```

---

### Error 7: Wrong Stack Setup Order

**Symptom**:
```
[WRONG ORDER] First player is Bob SB (must start with Dealer)
```

**Cause**:
```python
# Starting with SB instead of Dealer (for 3+ players)
next_hand += f"Bob SB 75000\n"  # ❌ SB first
next_hand += f"Charlie BB 435000\n"
next_hand += f"Alice Dealer 0\n"
```

**Fix**:
```python
# Start with Dealer (for 3+ players)
next_hand += f"Alice Dealer 0\n"  # ✅ Dealer first
next_hand += f"Bob SB 75000\n"
next_hand += f"Charlie BB 435000\n"
```

**Note**: For 2 players (heads-up), start with SB (no Dealer position exists).

---

## Validation Checkpoints

### Checkpoint 1: Every 10 Test Cases

**When**: After TC-10, TC-20, TC-30, ..., TC-300

**Actions**:
```bash
# Run BOTH validation scripts
python validate_all_cases.py
python validate_action_order.py
```

**Success Criteria**:
- ✅ 100% pass rate on both scripts
- ✅ No negative stacks
- ✅ No over-contributions
- ✅ No calculation errors
- ✅ Correct action order (UTG first in 4+ player preflop, BB first in heads-up postflop)

---

### Checkpoint 2: Every 50 Test Cases

**When**: After TC-50, TC-100, TC-150, TC-200, TC-250, TC-300

**Actions**:
```bash
# Full validation with reports
python validate_all_cases.py > checkpoint_stacks_$(date +%Y%m%d_%H%M%S).txt
python validate_action_order.py > checkpoint_actions_$(date +%Y%m%d_%H%M%S).txt

# Check distribution
python check_distribution.py  # If you have this script
```

**Success Criteria**:
- ✅ 100% pass rate on both validation scripts
- ✅ Blind structure distribution on track
- ✅ Player count distribution on track
- ✅ Complexity distribution on track
- ✅ Action order correct for all player counts

---

### Checkpoint 3: Manual Browser Test

**When**: After TC-50, TC-100, TC-150, TC-200, TC-250, TC-300

**Actions**:
1. Open `300_TestCases.html` in browser
2. Verify all test cases collapsed by default
3. Expand random test case
4. Test copy buttons
5. Test paste from clipboard
6. Test compare function

**Success Criteria**:
- ✅ All UI elements functional
- ✅ No console errors
- ✅ Copy/paste works
- ✅ Compare works

---

### Final Checkpoint: After All 300 Complete

**Actions**:
```bash
# Full validation
python validate_all_cases.py > final_validation_report.txt

# Review report
cat final_validation_report.txt

# Check for failures
grep "FAIL" final_validation_report.txt
grep "Failed: 0" final_validation_report.txt  # Should match

# Distribution check
python check_distribution.py
```

**Success Criteria**:
- ✅ **300/300 test cases pass (100%)**
- ✅ **0 failures**
- ✅ Blind structure distribution correct
- ✅ Player count distribution correct
- ✅ Complexity distribution correct
- ✅ Stack size ranges correct (10-60 BB)
- ✅ All stacks unique per test case
- ✅ All features working (copy/paste, compare, collapsed state)

---

## Success Criteria

### Must Have (All Required)

✅ **300 test cases generated** (100 Simple + 120 Medium + 80 Complex)

✅ **100% pass rate on validation** (300/300)

✅ **0 negative final stacks** (critical rule)

✅ **0 over-contributions** (no player contributes more than starting stack)

✅ **All calculations correct** (Final = Starting - Contributed for every player)

✅ **Different stack sizes per player** (10 BB to 60+ BB range, all unique)

✅ **Varied blind structures** (hundreds to millions, all numeric)

✅ **Proper button rotation** (Previous SB → New Dealer)

✅ **All players in Next Hand Preview** (including eliminated with 0 stack)

✅ **Position labels correct** (only Dealer, SB, BB shown)

✅ **Stack Setup order correct** (Dealer first for 3+, SB first for 2)

✅ **BB Ante posting order correct** (ante first, then blind)

✅ **No double-counting blinds** ("Raise TO" not "Raise BY")

✅ **Complete HTML output** with copy/paste and comparison features

✅ **Default collapsed state** for all test cases

✅ **Google Sheets compatibility** (single-cell paste, no formula errors)

---

### Distribution Targets

**Player Count**:
- 2 players: 40 cases (13.3%)
- 3 players: 60 cases (20%)
- 4 players: 40 cases (13.3%)
- 5 players: 40 cases (13.3%)
- 6 players: 40 cases (13.3%)
- 7 players: 30 cases (10%)
- 8 players: 30 cases (10%)
- 9 players: 20 cases (6.7%)

**Blind Structures**:
- Hundreds: 30 cases (10%)
- Thousands: 60 cases (20%)
- Tens of Thousands: 60 cases (20%)
- Hundreds of Thousands: 90 cases (30%)
- Millions: 60 cases (20%)

**Complexity**:
- Simple: 100 cases (33.3%)
- Medium: 120 cases (40%)
- Complex: 80 cases (26.7%)

---

## Deliverables

### Primary Files

1. **300_TestCases.html** (~60,000 lines)
   - All 300 test cases with correct action order
   - Default collapsed state for clean initial view
   - Ready for browser testing
   - Copy/paste functionality with Google Sheets compatibility
   - Comparison features

2. **final_validation_report.txt**
   - Complete validation results
   - 300/300 pass confirmation
   - 0 failures confirmation

3. **distribution_analysis.txt**
   - Player count distribution breakdown
   - Blind structure distribution breakdown
   - Complexity distribution breakdown
   - Stack size analysis

4. **generation_log.txt** (optional)
   - Timestamp for each test case generated
   - Any issues encountered and fixed
   - Checkpoint validation results

---

### Reference Files (Already Exist)

- **TEST_CASE_GENERATION_SPEC.md**: Complete specification
- **validate_all_cases.py**: Validation script
- **TC10_NEGATIVE_STACK_ISSUE_REPORT.md**: Issue documentation
- **30_TestCases.html**: Golden reference (30/30 pass)

---

## Usage Instructions

### To Generate 300 Test Cases:

**Option 1: Manual Generation (Recommended for Quality)**

```bash
# Follow this document step by step
# Generate one test case at a time
# Validate immediately after each test case
# Fix any issues before proceeding
```

**Option 2: Automated Generation (If Script Available)**

```bash
cd C:\Apps\HUDR\HHTool_Modular\docs\QA
python generate_300_progressive.py
```

---

### To Validate Test Cases:

```bash
cd C:\Apps\HUDR\HHTool_Modular\docs\QA
python validate_all_cases.py
```

**Expected Output**:
```
================================================================================
VALIDATION REPORT - 300 Test Cases
================================================================================

================================================================================
SUMMARY
================================================================================
Total Test Cases: 300
Passed: 300 (100.0%)
Failed: 0 (0.0%)
```

---

### To Use Test Cases:

1. Open `300_TestCases.html` in browser
2. Expand any test case (click header)
3. Click "Copy Player Data" button
4. Paste into your poker hand history application
5. Run the hand through your app
6. Copy the "Next Hand" output from your app
7. Click "Paste from Clipboard" in the comparison section
8. Click "Compare" to validate results
9. Click "Copy Result" to copy comparison results for Google Sheets

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-11 | 1.0 | Initial requirements for 300 test cases based on 30 test cases lessons learned |

---

## Notes

- All requirements learned from 30 test cases validation
- Negative stack prevention is the #1 priority
- Progressive validation ensures quality
- Reference TEST_CASE_GENERATION_SPEC.md for all rules
- Use validate_all_cases.py for validation (proven to catch all errors)
- Target: 100% pass rate (300/300 test cases)

---

**Status**: ✅ **READY FOR IMPLEMENTATION**

---

## Quick Reference: Critical Validation Formulas

```python
# Formula 1: No Negative Stacks
assert final_stack >= 0, "Final stack cannot be negative"

# Formula 2: No Over-Contribution
assert contributed <= starting_stack, "Cannot contribute more than you have"

# Formula 3: Calculation Accuracy
assert contributed == (starting_stack - final_stack), "Math must match"

# Formula 4: Total Pot
assert total_pot == sum(all_contributions), "Pot must equal contributions"

# Formula 5: Pre-Action Validation
if action_amount > remaining_stack:
    action_amount = remaining_stack  # Auto all-in
    action_type = "All-In"
```

---

## Contact / Questions

If you encounter any issues during generation:
1. Check TEST_CASE_GENERATION_SPEC.md for the rule
2. Check TC10_NEGATIVE_STACK_ISSUE_REPORT.md for similar issues
3. Run validate_all_cases.py to identify the exact error
4. Fix the error before proceeding

**Do NOT proceed with more test cases if validation fails!**

---

**END OF DOCUMENT**
