# Test Case Generation Specification

## Project Context
This document defines the complete specification for generating poker hand history pot calculation test cases for a tournament poker hand collector application.

## 🚨 VALIDATION REQUIREMENTS - MUST CHECK BEFORE ACCEPTING TEST CASES

**CRITICAL:** All test cases MUST pass these validations before being considered complete:

### Automated Validation Scripts

1. **`validate_all_cases.py`** - Checks for:
   - ❌ Negative final stacks (Final Stack < 0)
   - ❌ Over-contributions (Contributed > Starting Stack)
   - ❌ Calculation errors (Final ≠ Starting - Contributed)
   - ❌ Negative stacks in Next Hand Preview

2. **`validate_action_order.py`** - Checks for:
   - ❌ 2-player preflop: SB must act first, BB second
   - ❌ 2-player postflop: BB must act first, SB second
   - ❌ 3-player preflop: Dealer → SB → BB
   - ❌ 3-player postflop: SB → BB → Dealer

### Known Validation Script Bugs

⚠️ **IMPORTANT:** `validate_all_cases.py` has a regex bug that can cause false positives:

**Bug:** The pattern `<tr>.*?PlayerName.*?</tr>` with `re.DOTALL` can match across multiple table rows, extracting numbers from multiple players instead of just the target player.

**Result:** The script may report "PASS" even when negative stacks exist in the Expected Results table.

**Workaround:** Always manually verify Expected Results tables by checking:
```bash
# Manual verification for each test case
grep -A 50 "Expected Results" 30_base_validated_cases.html | grep "Final Stack"
```

Look for any negative values (numbers with minus sign) in the Final Stack column.

### Manual Verification Checklist

For EVERY test case, manually verify:

- [ ] **Actions section:** Any player going all-in must show "All-In X" (not "Call X" or "Bet X")
- [ ] **Expected Results table:**
  - [ ] All Final Stack values ≥ 0 (no negative numbers)
  - [ ] All Contributed values ≤ Starting Stack
  - [ ] Calculation: Final Stack = Starting Stack - Contributed (for each player)
  - [ ] Players who went all-in show "(all-in)" notation in Contributed column
- [ ] **Pot calculations:**
  - [ ] Main Pot correctly calculated with all-in caps
  - [ ] Side Pots created when players go all-in for different amounts
  - [ ] Total Pot = Sum of all contributions
- [ ] **Next Hand Preview:**
  - [ ] All players present (including eliminated players with stack 0)
  - [ ] Winners show New Stack (Final + Pots Won), not Final Stack
  - [ ] Non-winners show Final Stack
  - [ ] No negative stack values

### Common Issues Found During Validation (Nov 2025)

**Issue 1: Expected Results Not Updated After Action Fixes**
- Actions were corrected to show "All-In" instead of "Call/Bet"
- BUT Expected Results table still showed old negative values
- **Solution:** After fixing actions, ALWAYS recalculate and update Expected Results table

**Issue 2: Validation Script False Positives**
- Script reported "30/30 PASS" but manual check found 5 test cases with negative stacks
- **Root cause:** Regex pattern matching across multiple table rows
- **Affected test cases:** TC-22, TC-23, TC-25, TC-26, TC-28
- **Solution:** Always do manual verification in addition to automated validation

**Issue 3: Multiple Files Out of Sync**
- `30_base_validated_cases.html` had issues
- `30_TestCases.html` was clean
- **Solution:** Keep files in sync or clearly document which is the source of truth

### Validation Workflow

```bash
# Step 1: Run automated validation
cd docs/QA
python validate_all_cases.py
python validate_action_order.py

# Step 2: Manual spot check (even if scripts say PASS)
# Check for negative stacks in Expected Results
grep -B 5 "<td>-" 30_base_validated_cases.html | grep -E "(TEST CASE|Final Stack)"

# Step 3: Verify specific test cases manually
# Open HTML file and visually inspect Expected Results tables
# Look for any negative numbers in Final Stack column

# Step 4: If issues found, fix systematically:
# - Fix actions (change to All-In where needed)
# - Recalculate contributions
# - Update Final Stack values
# - Recalculate pots (Main + Side)
# - Update Next Hand Preview
# - Re-validate
```

---

## ⚠️ CRITICAL ERRORS TO AVOID (Updated from TC-1.1 to TC-13.1 Fixes)

### 1. Next Hand Preview - Winners Must Show NEW Stack (NOT Final Stack)

**CRITICAL ERROR:** Winners showing Final Stack instead of New Stack in Next Hand Preview

**Rule:**
```
New Stack = Final Stack + Total Pots Won
```

**Example:**
```
Charlie (Dealer):
- Starting Stack: 10,000
- Final Stack: 9,900 (after contributing 100)
- Wins Main Pot: 400
- New Stack for Next Hand: 9,900 + 400 = 10,300 ✅

WRONG: Charlie BB 9900 ❌
RIGHT: Charlie BB 10300 ✅
```

**What to do:**
- For each winner in Expected Results table, identify pots won
- Calculate: New Stack = Final Stack + Sum of All Pots Won
- Use NEW Stack in Next Hand Preview (3 locations: copy button, content div, compare button)

---

### 2. Next Hand Preview - ALL Players Must Appear (Including Eliminated)

**CRITICAL ERROR:** Missing players from Next Hand Preview

**Rule:** ALL players must appear in Next Hand Preview, including:
- ✅ Winners (show New Stack = Final + Won)
- ✅ Active players (show Final Stack)
- ✅ Eliminated players (show 0, NOT omitted)

**Example:**
```
After Hand 6:
- Frank: Final 0, Won 22,450 → Next Hand: Frank HJ 22450 ✅
- Charlie: Final 0, Won 0 → Next Hand: Charlie BB 0 ✅ (NOT omitted!)

WRONG: Omit Frank and Charlie from Next Hand ❌
RIGHT: Include both with correct stacks ✅
```

**What to do:**
- Check Expected Results table for ALL players
- Winners going all-in: Include with New Stack (Final + Won)
- Eliminated players (Final = 0, Won = 0): Include with stack = 0
- NEVER say "Tournament Complete" unless it's the final hand of a tournament

---

### 3. Stack Setup - Position Labels ONLY for Dealer, SB, BB

**CRITICAL ERROR:** Showing position labels (UTG, UTG+1, MP, CO, HJ) for non-button players

**Rule:**
```
✅ SHOW positions for: Dealer, SB, BB
❌ DO NOT show positions for: UTG, UTG+1, UTG+2, MP, CO, HJ

Stack Setup format:
PlayerName Dealer Stack
PlayerName SB Stack
PlayerName BB Stack
PlayerName Stack  ← NO POSITION LABEL
PlayerName Stack  ← NO POSITION LABEL
```

**Example:**
```
WRONG:
Henry Dealer 10000
Alice SB 10000
Bob BB 10000
Charlie UTG 10000 ❌
David UTG+1 10000 ❌
Eve MP 10000 ❌

RIGHT:
Henry Dealer 10000
Alice SB 10000
Bob BB 10000
Charlie 10000 ✅
David 10000 ✅
Eve 10000 ✅
```

**What to do:**
- Stack Setup: Only show Dealer, SB, BB positions
- Next Hand Preview: Only show Dealer, SB, BB positions
- All other players: Just "PlayerName Stack" (no position)
- This applies to BOTH current hand AND next hand preview

---

### 4. Action Flow - "Base" vs "More" Section Assignment

**CRITICAL ERROR:** Placing first-time actions in "More" sections instead of "Base"

**APPLIES TO ALL STREETS:** This rule is universal for Preflop, Flop, Turn, and River

**Rule:**
```
Each street has ONE "Base" section and optionally "More" sections.

BASE SECTION:
- Contains EVERY player's FIRST action on that street
- Players act in position order:
  * PREFLOP 2-handed (heads-up): Dealer/SB → BB (Dealer and SB are same position, Dealer acts first)
  * PREFLOP 3-handed: Dealer → SB → BB
  * PREFLOP 4+ players: SB → BB → UTG → MP → HJ → CO → Dealer
  * POSTFLOP 2-handed (heads-up): BB → Dealer/SB (BB acts first, Dealer acts last)
  * POSTFLOP 3+ players: SB → BB → UTG → MP → HJ → CO → Dealer
- All active players MUST act once, even if someone raises
- Base section ends when EVERYONE has acted once
- Active players = not folded AND not all-in from previous street

MORE SECTIONS:
- Only used when action needs to circle back due to a raise
- Contains actions from players who need to respond to new bets/raises
- Players who already matched the current bet do NOT act again
- All-in players from previous streets do NOT appear in later Base sections
- More 1 = responses to first raise
- More 2 = responses to second raise (re-raise)
```

**Example - CORRECT:**
```
Turn Base (7♦):
1. Alice (SB): Bet 2000          ← First to act
2. Bob (BB): Raise 5000          ← Raises
3. Charlie (UTG): Call 5000      ← First action, matches raise
4. David (MP): Fold              ← First action
5. Frank (Dealer): Call 5000     ← First action, matches raise

Turn More 1:
6. Alice (SB): Call 5000         ← Needs to match Bob's raise (only had 2000 in)

✅ All 5 players acted for the FIRST TIME in Base
✅ Only Alice needs to act again in More 1
```

**Example - WRONG:**
```
Turn Base (7♦):
1. Alice (SB): Bet 2000
2. Bob (BB): Raise 5000

Turn More 1:
3. Charlie (UTG): Call 5000      ❌ First action should be in Base
4. David (MP): Fold              ❌ First action should be in Base
5. Frank (Dealer): Call 5000     ❌ First action should be in Base
6. Alice (SB): Call 5000
```

**Example - 3-Handed Preflop (CORRECT):**
```
Preflop Base:
1. Alice (Dealer): Raise 15,000   ← Dealer acts FIRST in 3-handed preflop
2. Bob (SB): Call 15,000          ← SB acts second
3. Charlie (BB): Call 15,000      ← BB acts third (last)

✅ Correct order for 3-handed preflop: Dealer → SB → BB
```

**Example - 3-Handed Postflop (CORRECT):**
```
Flop Base (A♥ K♦ 7♣):
1. Bob (SB): Check                ← SB acts FIRST in postflop
2. Charlie (BB): Bet 5,000        ← BB acts second
3. Alice (Dealer): Call 5,000     ← Dealer acts third (last)

✅ Correct order for postflop (all player counts): SB → BB → Dealer
```

**Example - 2-Handed Preflop (CORRECT):**
```
Preflop Base:
1. Alice (SB): Raise 3,000       ← Dealer/SB acts FIRST in 2-handed preflop
2. Bob (BB): Call 3,000          ← BB acts second (last)

✅ Correct order for 2-handed preflop: Dealer/SB → BB
✅ In heads-up, Dealer and SB are the SAME position
```

**Example - 2-Handed Postflop (CORRECT):**
```
Flop Base (A♥ K♦ 7♣):
1. Bob (BB): Bet 2,000           ← BB acts FIRST in postflop
2. Alice (SB): Call 2,000        ← Dealer/SB acts second (last)

✅ Correct order for 2-handed postflop: BB → Dealer/SB
```

**Validation Checklist:**

For each street (Preflop/Flop/Turn/River):

- [ ] **Step 1:** Count active players (not folded, not all-in from previous street)
- [ ] **Step 2:** Base section has exactly ONE action per active player
- [ ] **Step 3:** Base actions are in correct position order:
  - Preflop 2-handed: Dealer/SB → BB
  - Preflop 3-handed: Dealer → SB → BB
  - Preflop 4+ players: SB → BB → UTG → MP → HJ → CO → Dealer
  - Postflop 2-handed: BB → Dealer/SB
  - Postflop 3+ players: SB → BB → UTG → MP → HJ → CO → Dealer
- [ ] **Step 4:** More sections only exist if there was a raise in Base or previous More section
- [ ] **Step 5:** More sections only include players who need to match new bet amount
- [ ] **Step 6:** Players who already matched highest bet don't appear in More sections

**Example Validation:**
```
Turn active players: Alice (SB), Bob (BB), Charlie (UTG), David (MP), Frank (Dealer) = 5 players
Turn Base actions: 5 ✅
Turn Base order: SB → BB → UTG → MP → Dealer ✅
Bob raised to 5000 in Base → More 1 needed ✅
Charlie matched 5000 in Base → Skip More 1 ✅
David folded in Base → Skip More 1 ✅
Frank matched 5000 in Base → Skip More 1 ✅
Alice only has 2000 in → Must act in More 1 ✅
```

**What to do:**
1. Identify all active players at start of street
2. Ensure Base section contains exactly that many actions
3. Verify position order is correct
4. Only use More sections after all players acted once
5. Track who needs to act again (didn't match current bet)

**IMPORTANT:** Apply this validation to **EVERY street** (Preflop, Flop, Turn, River). The number of active players decreases as players fold or go all-in, but the Base/More logic remains the same.

---

### 5. Stack Setup Position Order - Must Start with Dealer

**CRITICAL ERROR:** Stack Setup starting with SB or BB instead of Dealer

**Rule:**
```
Stack Setup Order (Clockwise from Dealer):
Dealer → SB → BB → Player1 → Player2 → ...

NEVER start with SB or BB
ALWAYS start with Dealer
```

**Example:**
```
WRONG:
Alice SB 10000 ❌ (starts with SB)
Bob BB 10000
Charlie 10000
Henry Dealer 10000

RIGHT:
Henry Dealer 10000 ✅ (starts with Dealer)
Alice SB 10000
Bob BB 10000
Charlie 10000
```

**Exception:** Heads-up (2 players) has NO Dealer line, only SB and BB

**What to do:**
- Always list Dealer first in Stack Setup
- Then SB, then BB, then remaining players clockwise
- Verify stack setup order matches specification

---

### 6. Next Hand Preview - Button Rotation (Dealer Position)

**CRITICAL ERROR:** Button not rotating clockwise for next hand

**Rule:**
```
Previous SB → New Dealer
Previous BB → New SB
Previous Dealer → New BB (or next active player clockwise if Dealer was eliminated)
```

**Example:**
```
Hand 2:
Charlie Dealer 300
Alice SB 10000
Bob BB 10000

Hand 3 (WRONG):
Charlie Dealer 1000  ❌ Button didn't rotate!
Alice SB 10000
Bob BB 9300

Hand 3 (CORRECT):
Alice Dealer 10000  ✅ Previous SB becomes Dealer
Bob SB 9300         ✅ Previous BB becomes SB
Charlie BB 1000     ✅ Previous Dealer becomes BB
```

**What to do:**
1. Identify current hand positions: Who is Dealer, SB, BB
2. Apply rotation:
   - Previous **SB** → New **Dealer**
   - Previous **BB** → New **SB**
   - Previous **Dealer** → New **BB**
3. Update all 3 locations (copy button, content div, compare button)
4. Skip eliminated players (button moves to next active player)

**Heads-Up Special Case:**
```
Hand 1: Alice SB, Bob BB
Hand 2: Bob SB, Alice BB  ✅ Players swap positions each hand
```

---

### 7. Negative Stacks - Players Cannot Go Below Zero

**CRITICAL ERROR:** Players showing negative stack values when going all-in

**Rule:**
```
A player can NEVER have a negative stack in poker.
When a player goes all-in, their Final Stack = 0 (not negative)
Maximum contribution = Starting Stack (all chips the player has)
```

**Example - TC-10 Error Found:**
```
WRONG:
Alice Starting Stack: 80,000
Alice Contributed: 90,000 ❌ (impossible - she doesn't have 90,000!)
Alice Final Stack: -10,000 ❌ (negative stack is impossible)

RIGHT:
Alice Starting Stack: 80,000
Alice went ALL-IN on Turn: 40,000 (her last chips after Preflop 15k + Flop 25k)
Alice Total Contributed: 80,000 ✅ (15,000 + 25,000 + 40,000 all-in)
Alice Final Stack: 0 ✅ (not negative!)
```

**Why this matters:**
When a player contributes more than their starting stack, it means:
1. The player went ALL-IN at some point
2. Their contribution should be capped at their starting stack
3. This creates a SIDE POT for players who contributed more
4. Final stack must be 0, never negative

**Validation Checklist:**
- [ ] **Check:** For each player, verify Contributed ≤ Starting Stack
- [ ] **Check:** If Contributed > Starting Stack, flag as error
- [ ] **Check:** No player has Final Stack < 0
- [ ] **Check:** If player went all-in, ensure action shows "All-In" (not "Call" or "Bet")
- [ ] **Check:** All-in players create side pots if others contribute more

**Side Pot Creation:**
When one player goes all-in for less than others bet:
```
Example (from TC-10 fix):
Alice contributes: 80,000 (all-in)
Bob contributes: 92,500
Charlie contributes: 95,000

Main Pot: 80,000 × 3 + BB ante = 245,000 (Alice, Bob, Charlie eligible)
Side Pot: (92,500 - 80,000) + (95,000 - 80,000) = 30,000 (Bob, Charlie only)
Total Pot: 275,000 ✅
```

**What to do when fixing negative stack errors:**
1. Review the action sequence - where did the player go all-in?
2. Recalculate contributions:
   - Preflop: X
   - Flop: Y
   - Turn: Z (all-in)
   - Total = X + Y + Z = Starting Stack
3. Change action from "Call" or "Bet" to "All-In" with correct amount
4. Set Final Stack to 0 (not negative)
5. Recalculate pots - create Main Pot + Side Pot(s) if needed
6. Update Next Hand Preview to show stack = 0 for eliminated player

**Real Example from TC-10:**
```
BEFORE (WRONG):
Turn Base (7♥):
- Bob (SB): Bet 50,000
- Charlie (BB): Call 50,000
- Alice (Dealer): Call 50,000 ❌ (she only has 40,000 left!)

Expected Results:
- Alice: Final -10,000 ❌

Next Hand:
- Alice BB -10,000 ❌

AFTER (CORRECT):
Turn Base (7♥):
- Bob (SB): Bet 50,000
- Charlie (BB): Call 50,000
- Alice (Dealer): All-In 40,000 ✅

Expected Results:
- Alice: Final 0 ✅
- Main Pot: 245,000 (all 3 eligible)
- Side Pot 1: 30,000 (Bob and Charlie only)

Next Hand:
- Alice BB 0 ✅
```

---

## Critical Calculation Rules

### 1. BB Ante Posting Order
**MOST IMPORTANT RULE:**
- BB posts ANTE FIRST (deducted from stack as dead money)
- Then BB posts BLIND (counts as live contribution)
- BB's available stack = Starting Stack - Ante - BB Blind
- When BB goes "all-in", maximum contribution = Available Stack + BB Blind already posted
- BB can NEVER contribute more live chips than their available stack

**Example:**
```
Bob (BB) starts with 5,000 chips
Ante: 100, BB Blind: 100

Step 1: Bob posts ante (100) → Stack becomes 4,900
Step 2: Bob posts BB blind (100) → Stack becomes 4,800
Step 3: If Bob goes all-in, maximum live contribution = 100 (blind) + 4,800 (remaining) = 4,900
Step 4: Bob's total pot contribution = 4,900 (live) + 100 (ante as dead money) = 5,000
```

### 2. Short Stack Posting Logic

**CRITICAL: When BB doesn't have enough chips for both ante and blind**

#### Posting Order: "Ante First" (Default in most tournaments)
When ante is posted before blind:

**Case 1: BB has less than Ante value**
```
Example: BB has 80 chips, Ante = 100, BB Blind = 100
- BB posts 80 as Ante → Stack becomes 0
- BB posts 0 as Blind → Stack remains 0
- BB can only win the Main Pot (ante money only)
- Other players match 0 LIVE (just their antes go to pot)
- Main Pot = Sum of all antes only
```

**Case 2: BB has enough for Ante but less than Ante + Blind**
```
Example: BB has 150 chips, Ante = 100, BB Blind = 100
- BB posts 100 as Ante → Stack becomes 50
- BB posts 50 as Blind (partial) → Stack becomes 0
- BB's LIVE contribution = 50
- Other players match 50 LIVE
- Main Pot = (# players × 50) + Sum of all antes
```

#### Posting Order: "BB First" (Alternative rule in some games)
When blind is posted before ante:

**Case 1: BB has less than BB Blind value**
```
Example: BB has 80 chips, BB Blind = 100, Ante = 100
- BB posts 80 as Blind → Stack becomes 0
- BB posts 0 as Ante → Stack remains 0
- BB's LIVE contribution = 80
- Other players match 80 LIVE
- Main Pot = (# players × 80) + Other players' antes (BB contributed 0 ante)
```

**Case 2: BB has enough for Blind but less than Blind + Ante**
```
Example: BB has 150 chips, BB Blind = 100, Ante = 100
- BB posts 100 as Blind → Stack becomes 50
- BB posts 50 as Ante (partial) → Stack becomes 0
- BB's LIVE contribution = 100
- Other players match 100 LIVE
- Main Pot = (# players × 100) + Other players' antes + 50 (BB's partial ante)
```

**Important Notes for Short Stack Scenarios:**
- BB can only win pots up to their contribution level
- If BB posts 0 LIVE (only ante), they can only win the ante pot
- Other players still post full antes and match whatever LIVE amount BB posted
- These scenarios are CRITICAL for proper pot calculation testing

### 2. Betting Terminology and Contribution Calculation

**CRITICAL: Understanding "Raise TO" vs "Raise BY"**

**Rule:**
```
"Raise TO X" = Player's TOTAL bet becomes X (includes all previous bets)
"Raise BY X" = Player adds X MORE to their current bet

In poker notation:
- "Raise 15,000" typically means "Raise TO 15,000" (total bet)
- NOT "Raise BY 15,000" (additional amount)
```

**Common Mistakes in Contribution Calculation:**

#### Mistake 1: Double-counting blinds in raises

**WRONG:**
```
Bob (SB):
- Posts SB: 2,500
- Raises to 15,000
- Contribution: 2,500 + 15,000 = 17,500 ❌
```

**CORRECT:**
```
Bob (SB):
- Posts SB: 2,500 (already in pot)
- Raises TO 15,000 (total bet = 15,000, INCLUDES the 2,500 SB)
- Additional amount: 15,000 - 2,500 = 12,500
- Total contribution: 15,000 ✅
```

#### Mistake 2: Double-counting BB blind in calls

**WRONG:**
```
Charlie (BB):
- Posts BB: 5,000
- Calls 15,000 (to match raise)
- Contribution: 5,000 + 15,000 = 20,000 ❌
```

**CORRECT:**
```
Charlie (BB):
- Posts BB: 5,000 (already in pot)
- Calls TO 15,000 (total bet = 15,000, INCLUDES the 5,000 BB)
- Additional amount: 15,000 - 5,000 = 10,000
- Total contribution: 15,000 ✅
```

#### Mistake 3: Confusing ante with blind contributions

**WRONG:**
```
Charlie (BB) with ante:
- Posts Ante: 5,000 (dead)
- Posts BB: 5,000 (live)
- Calls preflop to 15,000
- Live contribution: 5,000 + 5,000 + 15,000 = 25,000 ❌
```

**CORRECT:**
```
Charlie (BB) with ante:
- Posts Ante: 5,000 (dead, counted separately)
- Posts BB: 5,000 (live, already in pot)
- Calls TO 15,000 (total preflop = 15,000, INCLUDES the BB)
- Live contribution: 15,000 ✅
- Total contribution: 15,000 (live) + 5,000 (ante) = 20,000
```

**Validation Formula:**
```
Player's Total Contribution = Starting Stack - Final Stack

If calculated contribution doesn't match this formula,
there's an error in the action sequence or math.
```

**Example from TC-10 (CORRECT):**
```
Alice (Dealer):
- Starting: 80,000
- Preflop: Call 15,000 → Stack: 65,000
- Flop: Call 25,000 → Stack: 40,000
- Turn: All-In 40,000 → Stack: 0
- Total contribution: 80,000 - 0 = 80,000 ✅

Bob (SB):
- Starting: 165,000
- SB: 2,500 → Stack: 162,500
- Preflop: Raise TO 15,000 (adds 12,500) → Stack: 150,000
- Flop: Bet 25,000 → Stack: 125,000
- Turn: Bet 50,000 → Stack: 75,000
- Total contribution: 165,000 - 75,000 = 90,000 ✅
- Breakdown: 2,500 (SB) + 12,500 (preflop) + 25,000 (flop) + 50,000 (turn) = 90,000 ✅

Charlie (BB):
- Starting: 265,000
- Ante: 5,000 (dead) → Stack: 260,000
- BB: 5,000 (live) → Stack: 255,000
- Preflop: Call TO 15,000 (adds 10,000) → Stack: 245,000
- Flop: Call 25,000 → Stack: 220,000
- Turn: Call 50,000 → Stack: 170,000
- Total contribution: 265,000 - 170,000 = 95,000 ✅
- Live breakdown: 5,000 (BB) + 10,000 (preflop) + 25,000 (flop) + 50,000 (turn) = 90,000 ✅
- Plus ante (dead): 5,000
- Total: 90,000 (live) + 5,000 (ante) = 95,000 ✅
```

**Pot Calculation (CORRECT):**
```
Live contributions:
- Alice: 80,000
- Bob: 90,000
- Charlie: 90,000
Total live: 260,000

Dead money:
- Charlie's ante: 5,000

Total Pot: 260,000 + 5,000 = 265,000 ✅

Main Pot: 80,000 × 3 + 5,000 (ante) = 245,000
Side Pot 1: (90,000 - 80,000) × 2 = 20,000
Total: 245,000 + 20,000 = 265,000 ✅
```

**Validation Checklist:**
- [ ] For each "Raise TO X" - verify X includes all previous bets from that player
- [ ] For each "Call TO X" - verify X includes blinds/antes already posted
- [ ] Total contribution = Starting Stack - Final Stack (must match exactly)
- [ ] Live contributions (excluding antes) calculated correctly
- [ ] Antes counted separately as dead money (only once in pot)
- [ ] Final pot = Sum of all live contributions + BB ante

---

### 3. Pot Calculation Formula
```
Total Pot = Sum of all live contributions + BB Ante (dead money)
```

### 4. Final Stack Verification
```
Final Stack = Starting Stack - Total Contribution
Total Contribution = Live Contribution + Ante (if BB)
Final Stack can NEVER be negative
```

### 5. Side Pot Creation Rules
- Sort all-in amounts in ascending order
- Main pot = smallest all-in × number of players contributing to it + dead money
- Side pots created for each increasing all-in level
- Players who fold are excluded from winning but their contributions remain in pot

## Test Case Structure

### Player Count Scenarios
1. **Heads-Up (2 players)**: Only SB and BB, no Dealer button
2. **3-6 players**: Short-handed tables
3. **7-9 players**: Full ring tables

### Stack Size Categories
1. **Thousands**: 5,000 - 50,000 chips
   - SB/BB/Ante proportional: e.g., 50/100/100, 250/500/500
2. **Hundreds of Thousands**: 100,000 - 900,000 chips
   - SB/BB/Ante: 1,000/2,000/2,000, 5,000/10,000/10,000
3. **Millions**: 1,000,000+ chips (represented as full numbers like "1600000")
   - SB/BB/Ante: 25,000/50,000/50,000, 50,000/100,000/100,000

### Variable Player Stack Sizes
**CRITICAL REQUIREMENT:**
- Each player in a test case MUST have a different starting stack
- Stack sizes range from **10 BB to 60 BB** (where BB = Big Blind value)
- "X BB" means X times the BB value
- Never use identical starting stacks for multiple players

**Examples:**
```
If BB = 100:
- 10 BB = 1,000 chips
- 20 BB = 2,000 chips
- 30 BB = 3,000 chips
- 60 BB = 6,000 chips

If BB = 50,000:
- 10 BB = 500,000 chips
- 20 BB = 1,000,000 chips
- 30 BB = 1,500,000 chips
- 60 BB = 3,000,000 chips
```

**Stack Distribution Guidelines:**
- Mix short stacks (10-20 BB), medium stacks (21-40 BB), and deep stacks (41-60 BB)
- Ensure variety across positions (not all short stacks in early position)
- Consider that shorter stacks are more likely to go all-in
- Create realistic tournament scenarios with varying stack depths

### Action Complexity Levels
1. **Simple**: Preflop only, minimal raises
2. **Medium**: Multi-street, 1-2 all-ins, 1-2 side pots
3. **Complex**: Multi-street, 3+ all-ins, 3+ side pots, multiple raises/re-raises

### Required Test Case Coverage

#### Heads-Up Scenarios (2 players)
- SB vs BB only
- Various stack sizes (thousands, hundreds of thousands, millions)
- All-in scenarios
- Multi-street betting

#### Side Pot Scenarios
- 2 side pots minimum
- 3+ side pots preferred
- Mix of all-in players at different levels
- Players folding at different streets

#### Multi-Street Action
- Preflop: Base, More 1, More 2 sections with raises/re-raises
- Flop: Betting, raising, all-ins
- Turn: Continued action or all-ins
- River: Final betting or showdown

## Test Case Format

### Header Structure
```
Hand (X)  // X = incremental hand number starting from 1
started_at: 00:02:30 ended_at: 00:05:40  // Hardcoded timestamps
SB {value} BB {value} Ante {value}  // Actual values for this hand
Stack Setup:
PlayerName Position StackAmount
...
```

### Heads-Up Format
```
Hand (11)
started_at: 00:02:30 ended_at: 00:05:40
SB 50 BB 100 Ante 100
Stack Setup:
Alice SB 6000
Bob BB 2500
```

**Note:** In heads-up, there is NO Dealer line - only SB and BB.

### 3-Player Format
```
Hand (12)
started_at: 00:02:30 ended_at: 00:05:40
SB 5000 BB 10000 Ante 10000
Stack Setup:
Charlie Dealer 500000
Alice SB 600000
Bob BB 350000
```

**Note:** Stack Setup lists players in clockwise seat order starting from Dealer.

### Full Table Format (8 players)
```
Hand (13)
started_at: 00:02:30 ended_at: 00:05:40
SB 25000 BB 50000 Ante 50000
Stack Setup:
Henry Dealer 1400000
Alice SB 3000000
Bob BB 1800000
Charlie UTG 750000
David UTG+1 2100000
Eve MP 1600000
Frank CO 950000
Grace HJ 2500000
```

**Critical:** Stack Setup order follows **clockwise seating from Dealer button**:
- Dealer → SB → BB → UTG → UTG+1 → UTG+2 → MP → CO → HJ

This is DIFFERENT from action order!

## Position Ordering Rules

### Stack Setup Order (Seat Positions)
**ALWAYS list players clockwise from Dealer button:**

**9-handed:** Dealer → SB → BB → UTG → UTG+1 → UTG+2 → MP → CO → HJ
**8-handed:** Dealer → SB → BB → UTG → UTG+1 → MP → CO → HJ
**7-handed:** Dealer → SB → BB → UTG → UTG+1 → MP → CO
**6-handed:** Dealer → SB → BB → UTG → MP → CO
**3-handed:** Dealer → SB → BB
**Heads-up:** SB → BB (NO Dealer line)

### Action Order (Different!)
**Preflop:** UTG acts first → ... → Dealer → SB → BB acts last
**Postflop:** SB acts first → BB → UTG → ... → Dealer acts last

**Example - 3 players:**
```
Stack Setup Order:    Michael Dealer → Brendon SB → Lamborenzo BB
Preflop Action Order: Michael Dealer → Brendon SB → Lamborenzo BB (last)
Postflop Action Order: Brendon SB → Lamborenzo BB → Michael Dealer (last)
```

## Action Flow Rules

### Preflop Action Order
1. First to act: UTG (or Dealer in 3-handed, SB in heads-up)
2. Last to act preflop: BB

### Postflop Action Order (Flop/Turn/River)
1. First to act: SB (or first active player left of button)
2. Last to act: Dealer (or last active player)

### Action Sections
- **Base**: Initial betting round
- **More 1**: After first raise/all-in
- **More 2**: After second raise/re-raise
- Each raise creates a new "More" section

## Expected Results Format

### Pot Summary
```
Final Total Pot: {amount}
BB Ante: {ante_amount}
  Folded: {player} {amount} + {player} {amount}...
```

### Pot Items
```
Main Pot
  Amount ({percentage}%)
  Eligible: Players who can win
  Excluded: Players who folded or were capped
  Calculation: X players × Y amount + Z dead money

Side Pot 1
  Amount ({percentage}%)
  Eligible: Players who can win
  Excluded: Players capped at lower level
  Calculation: X players × Y additional amount
```

### Final Stacks Table
| Player (Position) | Starting Stack | Final Stack | Total Contributed | Max Win |
|-------------------|----------------|-------------|-------------------|---------|
| Alice (SB) | 10,000 | 9,500 | 500 | 1,200 |
| Bob (BB) | 5,000 | 0 | 5,000 (all-in) | 15,100 |

**Column Definitions:**
- **Starting Stack**: Chips before hand starts
- **Final Stack**: Chips after hand ends (must be ≥ 0)
- **Total Contributed**: Live contribution + Ante (if BB)
- **Max Win**: Maximum pot amount player can win based on contribution level

### Next Hand Preview Section

**CRITICAL:** This section shows the starting stacks for the next hand.

**Format:**
```
Hand (X+1)
started_at: HH:MM:SS ended_at: HH:MM:SS
SB {value} BB {value} Ante {value}
Stack Setup:
PlayerName Dealer NewStack
PlayerName SB NewStack
PlayerName BB NewStack
PlayerName NewStack
...
```

**New Stack Calculation Rules:**

1. **For Winners (players who won pots):**
   ```
   New Stack = Final Stack + Total Pots Won
   ```
   Example: Final 9,900 + Won 400 = New Stack 10,300

2. **For Active Players (didn't win, didn't bust):**
   ```
   New Stack = Final Stack
   ```
   Example: Final 9,950 = New Stack 9,950

3. **For Eliminated Players (busted, stack = 0):**
   ```
   New Stack = 0
   ```
   **CRITICAL:** Do NOT omit eliminated players! Show them with stack = 0

**Button Rotation:**
- Button moves clockwise to next active player each hand
- Position labels updated accordingly
- **CRITICAL:** Button rotation formula:
  ```
  Current Hand:      PlayerA Dealer, PlayerB SB, PlayerC BB
  Next Hand:         PlayerB Dealer, PlayerC SB, PlayerA BB

  Rule: Previous SB becomes new Dealer
        Previous BB becomes new SB
        Previous Dealer becomes new BB (or next in clockwise order)
  ```

**Button Rotation Examples:**

**3-Player Example:**
```
Hand 2: Charlie Dealer, Alice SB, Bob BB
Hand 3: Alice Dealer, Bob SB, Charlie BB  ✅ (Button rotated clockwise)

WRONG: Charlie Dealer, Alice SB, Bob BB  ❌ (Button didn't rotate)
```

**Heads-Up (2 Players):**
```
Hand 1: Alice SB, Bob BB
Hand 2: Bob SB, Alice BB  ✅ (Players swap positions)
```

**With Eliminated Players:**
```
Hand 5: Alice Dealer 9700, Bob SB 11100, Charlie BB 9200
(Bob eliminated in Hand 5)
Hand 6: Alice Dealer 9700, Charlie SB 9200  ❌ WRONG - Button didn't rotate

CORRECT Hand 6: Charlie Dealer 9200, Alice SB 9700  ✅
(Button skips eliminated Bob, rotates to next active player)
```

**3 Locations to Update:**
1. Copy button `onclick` attribute
2. `next-hand-content` div
3. Compare button `onclick` attribute

**Example:**
```
Current Hand Result:
- Alice (SB): Final 9,900, Won 0 → Next Hand: Alice Dealer 9,900
- Bob (BB): Final 9,800, Won 0 → Next Hand: Bob SB 9,800
- Charlie (Dealer): Final 9,900, Won Main Pot 400 → Next Hand: Charlie BB 10,300

Next Hand Preview:
Hand (2)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 50 BB 100 Ante 100
Stack Setup:
Alice Dealer 9900
Bob SB 9800
Charlie BB 10300  ← Final 9,900 + Won 400 = 10,300
```

## Comparison Validation Feature

### Enhanced Comparison Functionality

Each test case includes an interactive comparison feature that validates actual poker application output against expected output.

**Validation Categories:**

1. **Order Validation** - Checks if player sequence matches exactly:
   - Validates player count matches
   - Checks each position (name + position label) in sequence
   - Reports specific position mismatches

2. **Stack Validation** - Checks if stack amounts match for each player:
   - Compares each player's stack amount
   - Reports specific discrepancies per player

3. **Hand Number Validation** - Ensures hand numbers match

4. **Blinds & Ante Validation** - Checks SB, BB, and Ante values match

**Output Format:**

When Compare button is clicked, the result shows:
```
✅ ALL CHECKS PASSED  or  ❌ VALIDATION FAILED

✓ Order is correct  or  ✗ Order is correct
   (with detailed error messages if failed)

✓ Stacks are correct  or  ✗ Stacks are correct
   (with specific player discrepancies if failed)

✓ Hand number is correct  or  ✗ Hand number is correct

✓ Blinds and ante are correct  or  ✗ Blinds and ante are correct

[Copy Debug Logs Button]
```

**Debug Logs Include:**
- Test case ID and timestamp
- Hand number check results
- Blinds & ante check results
- Player order comparison (expected vs actual)
- Stack validation results for each player
- Summary section with overall results

**Important:** Actual output from the poker application is treated as the **source of truth** for comparison purposes.

## Validation Checklist

For EACH test case, verify:

### ⚠️ CRITICAL ERRORS (See Top Section for Details)
- [ ] **Next Hand Preview**: Winners show NEW Stack (Final + Pots Won), NOT just Final Stack
- [ ] **Next Hand Preview**: ALL players appear (including eliminated players with 0 stack)
- [ ] **Next Hand Preview**: Button rotates clockwise (Previous SB → New Dealer)
- [ ] **Stack Setup**: Position labels ONLY for Dealer, SB, BB (NO UTG, MP, CO, HJ, etc.)
- [ ] **Action Flow**: Players in correct "More" sections based on raise count
- [ ] **Stack Setup Order**: Must start with Dealer (not SB or BB)
- [ ] **Comparison Feature**: Validates order, stacks, hand number, and blinds/ante with detailed error reporting

### Position and Format
- [ ] Stack Setup lists players in clockwise order: Dealer → SB → BB → Player1 → Player2 → etc.
- [ ] Stack Setup shows positions ONLY for Dealer, SB, BB (all others have no position label)
- [ ] Heads-up hands only have SB and BB (no Dealer line)
- [ ] Action order respects preflop (UTG first, BB last) and postflop (SB first, Dealer last)
- [ ] Action flow follows Base → More 1 → More 2 pattern for raises

### BB Ante Rules
- [ ] BB's starting stack - ante - blind = available stack
- [ ] BB's maximum contribution = available stack + blind
- [ ] BB ante is included in pot calculations as dead money

### Action Flow Rules for BB All-In
- [ ] **CRITICAL**: When BB goes all-in after posting blind, the action amount shown should be the LIVE betting amount
  - **BB posts in order**: Ante first (dead money) → Blind second (live money)
  - **Example**: BB with 8,000 posts 500 ante → 7,500 left, posts 500 blind → 7,000 left
  - **When BB goes all-in**: They're betting 500 (blind already posted) + 7,000 (remaining) = 7,500 LIVE
  - **Action display**: "All-in 7500" (NOT "All-in 8000")
  - **Other players**: "Call 7500" (NOT "Call 8000")
  - **This is the amount others must match** - the LIVE contribution, not the total starting stack

### Stack Requirements
- [ ] All players have DIFFERENT starting stacks (no duplicates)
- [ ] All player stacks are between 10 BB and 60 BB
- [ ] All players' final stacks ≥ 0
- [ ] Final Stack = Starting Stack - Total Contributed (for each player)

### Pot Calculations
- [ ] Sum of all contributions = Total Pot
- [ ] **CRITICAL**: Main pot = (# players × smallest LIVE all-in) + BB Ante
  - **Players match LIVE contributions only, NOT including ante**
  - **Example**: If BB all-ins for 7,500 live (after posting 500 ante + 500 blind from 8,000 stack), others match 7,500, NOT 8,000
  - **Main Pot**: (3 players × 7,500) + 500 ante = 23,000
- [ ] Side pots calculated from differences between all-in levels (use LIVE amounts)
- [ ] Percentage of each pot adds up to 100%
- [ ] All-in players marked with "(all-in)" notation
- [ ] Folded player contributions remain in pot as dead money
- [ ] Each player's Max Win matches their contribution level eligibility

## Test Case Distribution Plan (300 Total)

### Comprehensive End-to-End Testing Coverage

**Goal**: Cover all edge cases broadly to ensure production-ready pot calculation system

### By Player Count:
- 40 Heads-up (2 players)
- 80 Short-handed (3-6 players)
- 180 Full ring (7-9 players)

### By Stack Size:
- 100 Thousands (5K-50K stacks)
- 100 Hundreds of Thousands (100K-900K stacks)
- 100 Millions (1M+ stacks)

### By Complexity:
- 60 Simple (preflop heavy, 0-1 side pots)
- 120 Medium (multi-street, 1-2 side pots)
- 120 Complex (multi-street, 3+ side pots, heavy action)

### By Edge Case Categories:
- 40 BB Ante Posting Variations (Ante First vs BB First, short stacks)
- 40 Short Stack Scenarios (10-15 BB critical situations)
- 30 Multiple All-In Combinations (2-4+ all-ins)
- 30 Side Pot Complexity (0-5 side pots)
- 30 Multi-Street Actions (preflop through river)
- 20 Position-Specific Edge Cases (SB/BB/Dealer all-ins)
- 20 Fold Scenarios (dead money calculations)
- 20 Transition Scenarios (eliminations, heads-up transitions)
- 20 Calculation Edge Cases (rounding, percentages)
- 50 Mixed Complexity Scenarios

### Existing Test Cases (13):
- TC-1.1 through TC-13.1 (already created with all features)
- ✅ Collapsible UI
- ✅ Winner badges with expandable breakdowns
- ✅ Next Hand Preview sections
- ✅ Comparison sections with paste buttons

### New Test Cases to Create (287):
- TC-14.1 through TC-300.1

## Common Pitfalls to Avoid

1. **Wrong Stack Setup Order**: Stack Setup must list Dealer first, then SB, then BB, then UTG, etc. (clockwise seating)
2. **BB Over-Contributing**: Never let BB contribute more than starting stack - ante - blind
3. **Forgetting BB Ante in Pot**: BB ante must be added to main pot as dead money
4. **Negative Stacks**: Never show negative final stacks
5. **Duplicate Stack Sizes**: Never give multiple players the same starting stack
6. **Stack Size Range**: All stacks must be between 10 BB and 60 BB
7. **Pot Mismatch**: Sum of contributions must equal total pot
8. **Action Order vs Seat Order**: Don't confuse Stack Setup order (seats) with Action order (betting)
9. **Side Pot Calculation Errors**: Use differences between all-in levels, not absolute amounts
10. **Percentage Errors**: All pot percentages must sum to 100%
11. **All-in Notation**: Players with 0 final stack must show "(all-in)"
12. **Heads-up Position**: In heads-up, only SB and BB exist (no Dealer line)
13. **Folded Player Dead Money**: Don't remove folded players' contributions from pot
14. **Multi-Street Tracking**: Track contributions separately per street, then sum for total

## Pot Calculation Methodology

### Step-by-Step Pot Calculation Process

**1. Track All Contributions Across All Streets**
- Preflop: blinds, antes, raises, calls, all-ins
- Flop: bets, raises, calls, all-ins
- Turn: bets, raises, calls, all-ins
- River: bets, raises, calls, all-ins

**2. Calculate Each Player's Total Contribution**
```
Total Contribution = Live Chips + Ante (if BB)
```

**Example:**
- Alice (SB): 500 PF + 1000 Flop + 2000 Turn = 3,500 total
- Bob (BB): 500 PF + 1000 Flop + 100 ante = 1,600 total
- Charlie (Dealer): 500 PF + 1000 Flop + 2000 Turn = 3,500 total

**3. Identify All-In Levels (Sort Ascending)**
```
Player contributions sorted:
Bob: 1,600 (all-in)
Alice: 3,500
Charlie: 3,500
```

**4. Calculate Main Pot**
```
Main Pot = (Number of players × Smallest LIVE all-in amount) + BB Ante

CRITICAL: Use LIVE contributions only (excluding ante)

Example:
Bob (BB) LIVE contribution: 1,500 (not 1,600 total)
Main Pot = (3 players × 1,500) + 100 (ante) = 4,600
```

**Why LIVE amount matters:**
- If BB starts with 1,600, posts 100 ante → 1,500 left
- BB posts 100 blind → 1,400 left
- BB goes all-in → contributes 100 (blind) + 1,400 = 1,500 LIVE
- Other players match 1,500 LIVE, NOT 1,600 total
- Main Pot = (3 × 1,500) + 100 ante = 4,600

**5. Calculate Side Pots**
```
For each increasing all-in level:
Side Pot = (Number of remaining players) × (Difference from previous level)

Example:
Side Pot 1 = 2 players × (3,500 - 1,600) = 2 × 1,900 = 3,800
```

**6. Verify Total Pot**
```
Total Pot = Sum of all player contributions
Main Pot + All Side Pots = Total Pot

Example:
4,900 + 3,800 = 8,700 ✓
Verify: 1,600 + 3,500 + 3,500 = 8,600 ✗ (Error! Recheck calculations)
```

**7. Calculate Pot Percentages**
```
Pot Percentage = (Pot Amount / Total Pot) × 100%

Example:
Main Pot: (4,900 / 8,700) × 100% = 56.3%
Side Pot 1: (3,800 / 8,700) × 100% = 43.7%
Total: 100% ✓
```

### Multi-Street Pot Accumulation

**Track pot growth across streets:**

**After Preflop:**
```
Pot = All preflop contributions + BB Ante
Example: 3 × 500 + 100 = 1,600
```

**After Flop:**
```
Pot = Preflop Pot + Flop contributions
Example: 1,600 + (3 × 1,000) = 4,600
```

**After Turn:**
```
Pot = Flop Pot + Turn contributions
Example: 4,600 + (2 × 2,000) = 8,600 (if one player folded)
```

**After River:**
```
Final Pot = Turn Pot + River contributions
```

### Side Pot Creation with Multiple All-Ins

**Example: 4 players, 3 all-ins at different amounts**

**Contributions:**
- Alice (SB): 10,000 (all-in)
- Bob (BB): 5,000 (all-in)
- Charlie (UTG): 2,000 (all-in)
- David (Dealer): 10,000 (all-in)

**Pot Calculation:**

**Main Pot (all 4 players eligible):**
```
Smallest all-in = 2,000 (Charlie)
Main Pot = (4 × 2,000) + 100 (ante) = 8,100
Eligible: Alice, Bob, Charlie, David
```

**Side Pot 1 (3 players eligible):**
```
Next all-in level = 5,000 (Bob)
Difference = 5,000 - 2,000 = 3,000
Side Pot 1 = 3 × 3,000 = 9,000
Eligible: Alice, Bob, David
Excluded: Charlie (capped at 2,000)
```

**Side Pot 2 (2 players eligible):**
```
Highest all-in level = 10,000 (Alice, David)
Difference = 10,000 - 5,000 = 5,000
Side Pot 2 = 2 × 5,000 = 10,000
Eligible: Alice, David
Excluded: Bob (capped at 5,000), Charlie (capped at 2,000)
```

**Total Pot:**
```
8,100 + 9,000 + 10,000 = 27,100
Verify: 10,000 + 5,000 + 2,000 + 10,000 + 100 = 27,100 ✓
```

### Folded Player Contributions

**Important:** When players fold, their contributions REMAIN in the pot as dead money.

**Example:**
```
Preflop: Alice 500, Bob 500, Charlie 500 (pot = 1,600 with ante)
Flop: Alice bets 1,000, Bob calls 1,000, Charlie folds
Final pot = 1,600 + 2,000 = 3,600

Charlie's 500 stays in pot (dead money)
Eligible: Alice, Bob
Excluded: Charlie (folded)
```

## Example: Correct BB Ante Calculation

### Scenario: TC-5.2 (CORRECTED)
```
Bob (BB) Starting Stack: 5,000
Ante: 100, BB Blind: 100

Calculation:
1. Bob posts ante: 5,000 - 100 = 4,900 remaining
2. Bob posts blind: 4,900 - 100 = 4,800 remaining
3. Bob goes all-in preflop: Can contribute 100 (blind) + 4,800 = 4,900 live chips
4. Bob's total contribution to pot: 4,900 (live) + 100 (ante) = 5,000

Main Pot: 3 players × 4,900 + 100 (ante) = 14,800
Side Pot: Accumulated from Alice and Charlie on flop/turn (they each had 5,000 to start)
```

## Implementation Notes

- All test cases stored in: `C:\Apps\HUDR\HHTool_Modular\docs\pot-test-cases-final.html`
- Use incremental Hand (X) numbers
- Maintain consistent formatting and structure
- Include copy button for each test case
- Show Starting Stack column in results table
- All calculations must be verifiable by hand
- Document any complex scenarios in Notes section

## Next Steps

1. Review and fix existing TC-1.1 through TC-10.1 for BB ante errors
2. Generate TC-11.1 through TC-75.1 following this specification
3. Validate each test case against the checklist
4. Ensure diverse coverage across all categories
5. Test with actual application for verification
