# Pot Calculation Test Cases - Comprehensive Test Suite

## Overview

This document provides detailed test cases for the pot calculation system. Each test case includes:
- **Setup:** Initial conditions (blinds, stacks, positions)
- **Actions:** Step-by-step player actions
- **Expected Results:** Exact pot amounts, eligible players, excluded players
- **Verification Points:** What to validate in the test

---

## Table of Contents

1. [Basic Scenarios (No All-Ins)](#basic-scenarios-no-all-ins)
2. [Single All-In Scenarios](#single-all-in-scenarios)
3. [Multiple All-In Scenarios](#multiple-all-in-scenarios)
4. [Dead Money Scenarios](#dead-money-scenarios)
5. [Multi-Street Pot Accumulation](#multi-street-pot-accumulation)
6. [Edge Cases](#edge-cases)
7. [Complex Real-World Scenarios](#complex-real-world-scenarios)

---

## Basic Scenarios (No All-Ins)

### Test Case 1.1: Simple Preflop - Everyone Calls

**Category:** Basic - No All-Ins
**Complexity:** Low
**Street:** Preflop only

**Setup:**
```
Table: 3 players
SB: $10,000
BB: $10,000
BTN: $10,000
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50 (blind)
2. BB posts $100 (blind)
3. BTN calls $100
4. SB calls $50 (total $100)
5. BB checks
```

**Expected Results:**
```
Total Pot: $300

Main Pot: $300
  - Eligible: SB, BB, BTN (3 players)
  - Excluded: None
  - Percentage: 100%

Side Pots: None

Dead Money: $0
  - Ante: $0
  - Folded Blinds: $0
  - Folded Bets: $0

Player Contributions:
  - SB: $100 total ($50 blind + $50 call)
  - BB: $100 total ($100 blind + $0 check)
  - BTN: $100 total (call)

Player Stacks After:
  - SB: $9,900
  - BB: $9,900
  - BTN: $9,900
```

**Verification Points:**
- [ ] Total pot = $300
- [ ] Main pot = $300
- [ ] No side pots created
- [ ] All 3 players eligible for main pot
- [ ] No dead money
- [ ] Each player contributed exactly $100
- [ ] Each player's stack reduced by $100

---

### Test Case 1.2: Preflop Raise - All Call

**Category:** Basic - No All-Ins
**Complexity:** Low
**Street:** Preflop only

**Setup:**
```
Table: 4 players
SB: $10,000
BB: $10,000
UTG: $10,000
BTN: $10,000
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. UTG raises to $300
4. BTN calls $300
5. SB calls $250 (total $300)
6. BB calls $200 (total $300)
```

**Expected Results:**
```
Total Pot: $1,200

Main Pot: $1,200
  - Eligible: SB, BB, UTG, BTN (4 players)
  - Excluded: None
  - Percentage: 100%

Side Pots: None

Dead Money: $0

Player Contributions:
  - SB: $300 ($50 blind + $250 call)
  - BB: $300 ($100 blind + $200 call)
  - UTG: $300 (raise)
  - BTN: $300 (call)

Player Stacks After:
  - SB: $9,700
  - BB: $9,700
  - UTG: $9,700
  - BTN: $9,700
```

**Verification Points:**
- [ ] Total pot = $1,200
- [ ] Main pot = $1,200
- [ ] All 4 players eligible
- [ ] Each player contributed exactly $300
- [ ] BB's blind counted as part of contribution (not dead)
- [ ] SB's blind counted as part of contribution (not dead)

---

### Test Case 1.3: Preflop with One Fold

**Category:** Basic - No All-Ins
**Complexity:** Low
**Street:** Preflop only

**Setup:**
```
Table: 3 players
SB: $10,000
BB: $10,000
BTN: $10,000
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. BTN folds
4. SB calls $50 (total $100)
5. BB checks
```

**Expected Results:**
```
Total Pot: $200

Main Pot: $200
  - Eligible: SB, BB (2 players)
  - Excluded: BTN (folded)
  - Percentage: 100%

Side Pots: None

Dead Money: $0
  - BTN folded preflop before acting, so no blind to forfeit

Player Contributions:
  - SB: $100 ($50 blind + $50 call)
  - BB: $100 ($100 blind)
  - BTN: $0 (folded, never contributed)

Player Stacks After:
  - SB: $9,900
  - BB: $9,900
  - BTN: $10,000 (unchanged)
```

**Verification Points:**
- [ ] Total pot = $200
- [ ] Only SB and BB eligible
- [ ] BTN excluded (folded)
- [ ] BTN contributed $0
- [ ] BTN's stack unchanged

---

### Test Case 1.4: Preflop Fold with Blind Forfeiture

**Category:** Basic - Dead Money
**Complexity:** Low
**Street:** Preflop only

**Setup:**
```
Table: 3 players
SB: $10,000
BB: $10,000
BTN: $10,000
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. BTN raises to $300
4. SB folds
5. BB calls $200 (total $300)
```

**Expected Results:**
```
Total Pot: $350

Main Pot: $350
  - Eligible: BB, BTN (2 players)
  - Excluded: SB (folded)
  - Percentage: 100%

Side Pots: None

Dead Money: $50
  - Ante: $0
  - Folded Blinds: $50 (SB's blind)
  - Folded Bets: $0

Player Contributions:
  - SB: $50 (posted blind, then folded - becomes dead money)
  - BB: $300 ($100 blind + $200 call)
  - BTN: $300 (raise)

Player Stacks After:
  - SB: $9,950 (lost blind)
  - BB: $9,700
  - BTN: $9,700

Pot Breakdown:
  - Active player contributions: $600 (BB + BTN)
  - Dead money: $50 (SB's forfeited blind)
  - Total: $650... wait, let me recalculate
```

**CORRECTION - Expected Results:**
```
Total Pot: $650

Main Pot: $650
  - Amount: $650
  - Eligible: BB, BTN (2 players)
  - Excluded: SB (folded)

Dead Money: $50
  - Folded Blinds: $50 (SB's blind)

Player Contributions (to pot):
  - SB: $50 (blind only, then folded)
  - BB: $300 total
  - BTN: $300 total

Calculation:
  SB blind: $50 (dead money)
  + BB contribution: $300
  + BTN contribution: $300
  = $650 total pot
```

**Verification Points:**
- [ ] Total pot = $650
- [ ] Main pot = $650
- [ ] Dead money = $50 (SB's forfeited blind)
- [ ] SB excluded from pot
- [ ] Only BB and BTN eligible
- [ ] SB lost $50 from stack

---

## Single All-In Scenarios

### Test Case 2.1: Preflop - One Short Stack All-In, Others Call

**Category:** Single All-In
**Complexity:** Medium
**Street:** Preflop only

**Setup:**
```
Table: 3 players
SB: $10,000
BB: $10,000
BTN: $500 (short stack)
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. BTN all-in $500
4. SB calls $450 (total $500)
5. BB calls $400 (total $500)
```

**Expected Results:**
```
Total Pot: $1,500

Main Pot: $1,500
  - Amount: $1,500
  - Capped at: $500 per player
  - Eligible: SB, BB, BTN (3 players)
  - Excluded: None
  - Percentage: 100%

Side Pots: None
  - Reason: All players contributed the same amount ($500)
  - Even though BTN is all-in, everyone matched their bet

Dead Money: $0

Player Contributions:
  - SB: $500 ($50 blind + $450 call)
  - BB: $500 ($100 blind + $400 call)
  - BTN: $500 (all-in)

Player Stacks After:
  - SB: $9,500
  - BB: $9,500
  - BTN: $0 (all-in)

All-In Status:
  - BTN: All-in at $500
```

**Verification Points:**
- [ ] Total pot = $1,500
- [ ] Main pot = $1,500
- [ ] No side pots (everyone contributed equally)
- [ ] All 3 players eligible for main pot
- [ ] BTN marked as all-in
- [ ] BTN's stack = $0

---

### Test Case 2.2: Preflop - One All-In, Creates Side Pot

**Category:** Single All-In
**Complexity:** Medium
**Street:** Preflop only

**Setup:**
```
Table: 3 players
SB: $10,000
BB: $10,000
BTN: $300 (short stack)
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. BTN all-in $300
4. SB raises to $600
5. BB calls $500 (total $600)
```

**Expected Results:**
```
Total Pot: $1,500

Main Pot: $900
  - Amount: $900
  - Capped at: $300 per player
  - Eligible: SB, BB, BTN (3 players)
  - Excluded: None
  - Percentage: 60.0%
  - Breakdown:
    * SB contributed: $300
    * BB contributed: $300
    * BTN contributed: $300
    * Total: $900

Side Pot 1: $600
  - Amount: $600
  - Capped at: $600 per player
  - Eligible: SB, BB (2 players)
  - Excluded: BTN (all-in at $300, cannot win more)
  - Percentage: 40.0%
  - Breakdown:
    * SB additional: $300 (from $300 → $600)
    * BB additional: $300 (from $300 → $600)
    * Total: $600

Dead Money: $0

Player Contributions:
  - SB: $600 total ($50 blind + $550 raise)
  - BB: $600 total ($100 blind + $500 call)
  - BTN: $300 total (all-in)

Player Stacks After:
  - SB: $9,400
  - BB: $9,400
  - BTN: $0 (all-in)
```

**Verification Points:**
- [ ] Total pot = $1,500
- [ ] Main pot = $900 (60%)
- [ ] Side pot 1 = $600 (40%)
- [ ] Main pot eligible: SB, BB, BTN (3 players)
- [ ] Side pot 1 eligible: SB, BB only (2 players)
- [ ] Side pot 1 excluded: BTN (all-in at $300)
- [ ] BTN can only win up to $900 (main pot)
- [ ] SB and BB can win full $1,500

---

### Test Case 2.3: Multiple Players, One All-In Short Stack

**Category:** Single All-In
**Complexity:** Medium
**Street:** Preflop only

**Setup:**
```
Table: 4 players
SB: $10,000
BB: $10,000
UTG: $10,000
BTN: $250 (short stack)
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. UTG raises to $500
4. BTN all-in $250
5. SB folds
6. BB calls $400 (total $500)
7. UTG calls (already raised to $500)
```

**Expected Results:**
```
Total Pot: $1,300

Main Pot: $800
  - Amount: $800
  - Capped at: $250 per player
  - Eligible: BB, UTG, BTN (3 players)
  - Excluded: SB (folded)
  - Percentage: 61.5%
  - Breakdown:
    * BB: $250
    * UTG: $250
    * BTN: $250
    * Dead money (SB blind): $50
    * Total: $800

Side Pot 1: $500
  - Amount: $500
  - Capped at: $500 per player
  - Eligible: BB, UTG (2 players)
  - Excluded: BTN (all-in at $250), SB (folded)
  - Percentage: 38.5%
  - Breakdown:
    * BB additional: $250 (from $250 → $500)
    * UTG additional: $250 (from $250 → $500)
    * Total: $500

Dead Money: $50
  - Folded Blinds: $50 (SB's blind)

Player Contributions:
  - SB: $50 (blind, then folded)
  - BB: $500 total ($100 blind + $400 call)
  - UTG: $500 total (raise)
  - BTN: $250 (all-in)

Player Stacks After:
  - SB: $9,950 (lost blind)
  - BB: $9,500
  - UTG: $9,500
  - BTN: $0 (all-in)
```

**Verification Points:**
- [ ] Total pot = $1,300
- [ ] Main pot = $800 (includes dead money)
- [ ] Side pot 1 = $500
- [ ] Dead money = $50 added to main pot
- [ ] Main pot eligible: BB, UTG, BTN (3 players)
- [ ] Side pot eligible: BB, UTG only (2 players)
- [ ] SB excluded from all pots (folded)
- [ ] BTN excluded from side pot (all-in at $250)

---

## Multiple All-In Scenarios

### Test Case 3.1: Two All-Ins at Different Amounts

**Category:** Multiple All-Ins
**Complexity:** High
**Street:** Preflop only

**Setup:**
```
Table: 4 players
SB: $10,000
BB: $2,000 (short stack 1)
UTG: $500 (short stack 2)
BTN: $10,000
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. UTG all-in $500
4. BTN raises to $1,000
5. SB calls $950 (total $1,000)
6. BB all-in $2,000
7. BTN calls $1,000 (total $2,000)
8. SB calls $1,000 (total $2,000)
```

**Expected Results:**
```
Total Pot: $5,500

Main Pot (Pot 0): $2,000
  - Amount: $2,000
  - Capped at: $500 per player
  - Eligible: SB, BB, UTG, BTN (4 players)
  - Excluded: None
  - Percentage: 36.4%
  - Breakdown:
    * SB: $500
    * BB: $500
    * UTG: $500 (all-in)
    * BTN: $500
    * Total: $2,000

Side Pot 1 (Pot 1): $4,500
  - Amount: $4,500
  - Capped at: $2,000 per player
  - Eligible: SB, BB, BTN (3 players)
  - Excluded: UTG (all-in at $500)
  - Percentage: 81.8%
  - Breakdown:
    * SB additional: $1,500 (from $500 → $2,000)
    * BB additional: $1,500 (from $500 → $2,000, all-in)
    * BTN additional: $1,500 (from $500 → $2,000)
    * Total: $4,500

Side Pot 2: None
  - Reason: No one bet beyond $2,000

Dead Money: $0

Player Contributions:
  - SB: $2,000 total ($50 blind + $1,950 in raises/calls)
  - BB: $2,000 total ($100 blind + all-in $1,900)
  - UTG: $500 total (all-in)
  - BTN: $2,000 total (raised and called)

Player Stacks After:
  - SB: $8,000
  - BB: $0 (all-in)
  - UTG: $0 (all-in)
  - BTN: $8,000

All-In Players:
  - UTG: All-in at $500 (can win up to $2,000 - Main Pot only)
  - BB: All-in at $2,000 (can win up to $6,500 - Main + Side 1)
```

**Wait, let me recalculate more carefully:**

**CORRECTED Expected Results:**
```
Total Pot: $5,500

Main Pot: $2,000
  - Capped at: $500
  - Eligible: All 4 players
  - Calculation: $500 × 4 = $2,000

Side Pot 1: $3,500
  - Capped at: $2,000 (BB's all-in amount)
  - Eligible: SB, BB, BTN (3 players, UTG excluded)
  - Calculation: ($2,000 - $500) × 3 = $1,500 × 3 = $4,500

Wait, that's $2,000 + $4,500 = $6,500, but contributions total $5,500.
Let me recalculate contributions:
- SB: $2,000
- BB: $2,000
- UTG: $500
- BTN: $2,000
Total: $6,500

So total pot should be $6,500, not $5,500!
```

**FINAL CORRECTED Expected Results:**
```
Total Pot: $6,500

Main Pot: $2,000
  - Amount: $2,000
  - Capped at: $500 per player
  - Eligible: SB, BB, UTG, BTN (4 players)
  - Percentage: 30.8%
  - Calculation: $500 × 4 = $2,000

Side Pot 1: $4,500
  - Amount: $4,500
  - Capped at: $2,000 per player
  - Eligible: SB, BB, BTN (3 players)
  - Excluded: UTG (all-in at $500)
  - Percentage: 69.2%
  - Calculation: ($2,000 - $500) × 3 = $1,500 × 3 = $4,500

Total Pots: $2,000 + $4,500 = $6,500 ✓

Dead Money: $0

Player Contributions:
  - SB: $2,000 ($50 blind + $1,950)
  - BB: $2,000 ($100 blind + $1,900 all-in)
  - UTG: $500 (all-in)
  - BTN: $2,000 (raise + call)

Total Contributions: $2,000 + $2,000 + $500 + $2,000 = $6,500 ✓

Player Stacks After:
  - SB: $8,000
  - BB: $0 (all-in)
  - UTG: $0 (all-in)
  - BTN: $8,000

Pot Eligibility Summary:
  - UTG can win: Main Pot only = $2,000 max
  - BB can win: Main + Side 1 = $6,500 max
  - SB can win: Main + Side 1 = $6,500 max
  - BTN can win: Main + Side 1 = $6,500 max
```

**Verification Points:**
- [ ] Total pot = $6,500
- [ ] Main pot = $2,000 (30.8%)
- [ ] Side pot 1 = $4,500 (69.2%)
- [ ] Main pot: 4 players eligible
- [ ] Side pot 1: 3 players eligible (UTG excluded)
- [ ] UTG can only win $2,000 (main pot)
- [ ] BB can win up to $6,500 (main + side 1)
- [ ] Math validates: $2,000 + $4,500 = $6,500

---

### Test Case 3.2: Three All-Ins - Ascending Order

**Category:** Multiple All-Ins
**Complexity:** Very High
**Street:** Preflop only

**Setup:**
```
Table: 5 players
SB: $10,000 (big stack)
BB: $10,000 (big stack)
UTG: $300 (shortest)
MP: $800 (medium)
BTN: $1,500 (larger short)
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. UTG all-in $300
4. MP all-in $800
5. BTN all-in $1,500
6. SB calls $1,450 (total $1,500)
7. BB calls $1,400 (total $1,500)
```

**Expected Results:**
```
Total Pot: $4,900

Main Pot: $1,500
  - Amount: $1,500
  - Capped at: $300 per player
  - Eligible: All 5 players (SB, BB, UTG, MP, BTN)
  - Excluded: None
  - Percentage: 30.6%
  - Calculation: $300 × 5 = $1,500

Side Pot 1: $2,000
  - Amount: $2,000
  - Capped at: $800 per player
  - Eligible: SB, BB, MP, BTN (4 players)
  - Excluded: UTG (all-in at $300)
  - Percentage: 40.8%
  - Calculation: ($800 - $300) × 4 = $500 × 4 = $2,000

Side Pot 2: $2,800
  - Amount: $2,800
  - Capped at: $1,500 per player
  - Eligible: SB, BB, BTN (3 players)
  - Excluded: UTG (all-in at $300), MP (all-in at $800)
  - Percentage: 57.1%
  - Calculation: ($1,500 - $800) × 4 = $700 × 4 = $2,800

Wait, that gives $1,500 + $2,000 + $2,800 = $6,300
But contributions are:
- SB: $1,500
- BB: $1,500
- UTG: $300
- MP: $800
- BTN: $1,500
Total: $5,600

Let me recalculate Side Pot 2...
```

**CORRECTED Side Pot 2 Calculation:**
```
Side Pot 2:
  - Only SB, BB, BTN can contribute beyond $800
  - SB additional: $1,500 - $800 = $700
  - BB additional: $1,500 - $800 = $700
  - BTN additional: $1,500 - $800 = $700
  - Total: $700 × 3 = $2,100 ✓
```

**FINAL Expected Results:**
```
Total Pot: $5,600

Main Pot: $1,500
  - Amount: $1,500
  - Capped at: $300
  - Eligible: SB, BB, UTG, MP, BTN (5 players)
  - Percentage: 26.8%
  - Formula: $300 × 5 = $1,500

Side Pot 1: $2,000
  - Amount: $2,000
  - Capped at: $800
  - Eligible: SB, BB, MP, BTN (4 players)
  - Excluded: UTG (all-in at $300)
  - Percentage: 35.7%
  - Formula: ($800 - $300) × 4 = $2,000

Side Pot 2: $2,100
  - Amount: $2,100
  - Capped at: $1,500
  - Eligible: SB, BB, BTN (3 players)
  - Excluded: UTG (all-in at $300), MP (all-in at $800)
  - Percentage: 37.5%
  - Formula: ($1,500 - $800) × 3 = $2,100

Total Validation: $1,500 + $2,000 + $2,100 = $5,600 ✓

Dead Money: $0

Player Contributions:
  - SB: $1,500 ($50 blind + $1,450)
  - BB: $1,500 ($100 blind + $1,400)
  - UTG: $300 (all-in)
  - MP: $800 (all-in)
  - BTN: $1,500 (all-in)

Total: $1,500 + $1,500 + $300 + $800 + $1,500 = $5,600 ✓

Player Stacks After:
  - SB: $8,500
  - BB: $8,500
  - UTG: $0 (all-in)
  - MP: $0 (all-in)
  - BTN: $0 (all-in)

Pot Eligibility Summary:
  - UTG can win: Main Pot only = $1,500 max
  - MP can win: Main + Side 1 = $3,500 max
  - BTN can win: Main + Side 1 + Side 2 = $5,600 max (entire pot)
  - SB can win: Main + Side 1 + Side 2 = $5,600 max (entire pot)
  - BB can win: Main + Side 1 + Side 2 = $5,600 max (entire pot)
```

**Verification Points:**
- [ ] Total pot = $5,600
- [ ] Main pot = $1,500 (26.8%)
- [ ] Side pot 1 = $2,000 (35.7%)
- [ ] Side pot 2 = $2,100 (37.5%)
- [ ] Main pot: 5 players eligible
- [ ] Side pot 1: 4 players (UTG excluded)
- [ ] Side pot 2: 3 players (UTG, MP excluded)
- [ ] UTG max win: $1,500
- [ ] MP max win: $3,500
- [ ] BTN/SB/BB max win: $5,600 (full pot)
- [ ] All percentages sum to 100%
- [ ] All pot amounts sum to total pot

---

## Dead Money Scenarios

### Test Case 4.1: Ante - BB Posts Ante

**Category:** Dead Money - Ante
**Complexity:** Medium
**Street:** Preflop only

**Setup:**
```
Table: 3 players
SB: $10,000
BB: $10,000
BTN: $10,000
Blinds: SB = $50, BB = $100
Ante: $25 (BB posts ante)
Ante Order: BB First
```

**Actions:**
```
Preflop Base:
1. BB posts $25 ante
2. SB posts $50 blind
3. BB posts $100 blind (in addition to ante)
4. BTN calls $100
5. SB calls $50 (total $100)
6. BB checks
```

**Expected Results:**
```
Total Pot: $325

Main Pot: $325
  - Amount: $325
  - Eligible: SB, BB, BTN (3 players)
  - Percentage: 100%

Dead Money: $25
  - Ante: $25 (BB's ante is dead)
  - Folded Blinds: $0
  - Folded Bets: $0

Player Contributions (LIVE bets only):
  - SB: $100 ($50 blind + $50 call)
  - BB: $100 ($100 blind, ante NOT counted)
  - BTN: $100 (call)

Total Live Contributions: $300
Total Dead Money: $25
Total Pot: $325 ✓

Player Stacks After:
  - SB: $9,900 (lost $100)
  - BB: $9,875 (lost $125: $100 blind + $25 ante)
  - BTN: $9,900 (lost $100)

Critical Points:
  - BB's ante ($25) is DEAD MONEY - not part of BB's contribution
  - BB must be matched at $100 (blind only), not $125
  - Ante goes into pot but doesn't count toward bet matching
```

**Verification Points:**
- [ ] Total pot = $325
- [ ] Dead money = $25 (ante)
- [ ] BB's contribution = $100 (blind only, NOT including ante)
- [ ] All players matched $100, not $125
- [ ] BB's stack reduced by $125 ($100 blind + $25 ante)
- [ ] SB and BTN stacks reduced by $100 each
- [ ] Ante added to main pot

---

### Test Case 4.2: Multiple Folds with Blinds

**Category:** Dead Money - Folded Blinds
**Complexity:** Medium
**Street:** Preflop only

**Setup:**
```
Table: 4 players
SB: $10,000
BB: $10,000
UTG: $10,000
BTN: $10,000
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. UTG raises to $500
4. BTN folds
5. SB folds
6. BB folds
7. UTG wins (no showdown)
```

**Expected Results:**
```
Total Pot: $150

Main Pot: $150
  - Amount: $150
  - Eligible: UTG only (everyone else folded)
  - Percentage: 100%

Dead Money: $150
  - Ante: $0
  - Folded Blinds: $150 (SB $50 + BB $100)
  - Folded Bets: $0

Player Contributions:
  - SB: $50 (blind, folded)
  - BB: $100 (blind, folded)
  - UTG: $0 (raised but no one called)
  - BTN: $0 (folded before acting)

Player Stacks After:
  - SB: $9,950 (lost blind)
  - BB: $9,900 (lost blind)
  - UTG: $10,000 + $150 = $10,150 (won uncalled pot)
  - BTN: $10,000 (unchanged)

Special Case:
  - UTG's $500 raise was never called
  - UTG didn't put money in pot (uncalled bet returned)
  - Only blinds went into pot
```

**Verification Points:**
- [ ] Total pot = $150 (blinds only)
- [ ] Dead money = $150 (both blinds forfeited)
- [ ] UTG wins without contributing
- [ ] UTG's raise was uncalled (not in pot)
- [ ] Only SB and BB lost chips

---

### Test Case 4.3: Fold After Betting - Dead Bets

**Category:** Dead Money - Folded Bets
**Complexity:** Medium
**Street:** Preflop only

**Setup:**
```
Table: 3 players
SB: $10,000
BB: $10,000
BTN: $10,000
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. BTN raises to $300
4. SB raises to $800
5. BB folds
6. BTN folds
7. SB wins uncalled
```

**Expected Results:**
```
Total Pot: $400

Main Pot: $400
  - Amount: $400
  - Eligible: SB only
  - Percentage: 100%

Dead Money: $400
  - Ante: $0
  - Folded Blinds: $100 (BB's blind)
  - Folded Bets: $300 (BTN's raise)

Player Contributions:
  - SB: $50 (blind, SB's raise to $800 was uncalled)
  - BB: $100 (blind, folded)
  - BTN: $300 (raised to $300, then folded)

Player Stacks After:
  - SB: $9,950 + $400 = $10,350 (won pot)
  - BB: $9,900 (lost blind)
  - BTN: $9,700 (lost $300 raise)

Special Notes:
  - SB's raise to $800 was uncalled (returned)
  - SB only risked $50 blind
  - BTN's $300 became dead money when they folded
```

**Verification Points:**
- [ ] Total pot = $400
- [ ] Dead money = $400 total
- [ ] Folded blinds = $100 (BB)
- [ ] Folded bets = $300 (BTN)
- [ ] SB's uncalled $800 raise returned
- [ ] SB won $400, net gain $350

---

## Multi-Street Pot Accumulation

### Test Case 5.1: Preflop to Flop - Pot Carries Forward

**Category:** Multi-Street
**Complexity:** Medium
**Streets:** Preflop → Flop

**Setup:**
```
Table: 3 players
SB: $10,000
BB: $10,000
BTN: $10,000
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. BTN raises to $300
4. SB calls $250 (total $300)
5. BB calls $200 (total $300)

Flop Base (community cards dealt):
1. SB checks
2. BB bets $500
3. BTN calls $500
4. SB folds
```

**Expected Results:**

**After Preflop:**
```
Preflop Pot: $900
  - SB: $300
  - BB: $300
  - BTN: $300

Main Pot: $900
  - Eligible: SB, BB, BTN (3 players)
```

**After Flop:**
```
Total Pot: $1,900

Main Pot: $1,900
  - Amount: $1,900
  - Eligible: BB, BTN (2 players)
  - Excluded: SB (folded on flop)
  - Percentage: 100%

Pot Accumulation:
  - Preflop pot carried: $900
  - Flop new contributions: $1,000 (BB $500 + BTN $500)
  - Total: $1,900

Dead Money from Flop: $300
  - SB's preflop contribution ($300) became dead when SB folded on flop

Player Total Contributions (Across Both Streets):
  - SB: $300 (preflop only, folded on flop)
  - BB: $800 ($300 preflop + $500 flop)
  - BTN: $800 ($300 preflop + $500 flop)

Player Stacks After Flop:
  - SB: $9,700 (lost $300)
  - BB: $9,200
  - BTN: $9,200
```

**Verification Points:**
- [ ] Preflop pot = $900
- [ ] Flop adds $1,000 in new bets
- [ ] Total pot after flop = $1,900
- [ ] SB's $300 preflop contribution stays in pot (dead money)
- [ ] SB excluded from winning (folded on flop)
- [ ] Only BB and BTN can win the $1,900
- [ ] Pot accumulates correctly across streets

---

### Test Case 5.2: Preflop All-In, Continues to River

**Category:** Multi-Street with All-In
**Complexity:** High
**Streets:** Preflop → Flop → Turn → River

**Setup:**
```
Table: 3 players
SB: $10,000
BB: $5,000 (shorter stack)
BTN: $10,000
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. BTN raises to $500
4. SB calls $450 (total $500)
5. BB all-in $5,000
6. BTN calls $4,500 (total $5,000)
7. SB calls $4,500 (total $5,000)

Flop Base:
1. SB checks
2. BTN bets $2,000
3. SB calls $2,000

Turn Base:
1. SB checks
2. BTN bets $3,000
3. SB raises to $6,000
4. BTN calls $3,000 (total $6,000)

River Base:
1. SB checks
2. BTN checks
```

**Expected Results:**

**After Preflop (BB all-in):**
```
Total Pot: $15,000

Main Pot: $15,000
  - Capped at: $5,000
  - Eligible: SB, BB, BTN (3 players)
  - Calculation: $5,000 × 3 = $15,000

Side Pots: None (no one bet beyond BB's $5,000 yet)

BB is all-in - can only win main pot
SB and BTN continue to flop with side action
```

**After Flop:**
```
Total Pot: $19,000

Main Pot: $15,000
  - Unchanged (BB all-in, no new contributions to main)
  - Eligible: SB, BB, BTN

Side Pot 1: $4,000
  - New side pot created
  - Eligible: SB, BTN (2 players)
  - Excluded: BB (all-in preflop)
  - Calculation: $2,000 × 2 = $4,000
```

**After Turn:**
```
Total Pot: $31,000

Main Pot: $15,000
  - Still unchanged
  - Eligible: SB, BB, BTN

Side Pot 1: $16,000
  - Accumulated from flop + turn
  - Eligible: SB, BTN
  - Calculation:
    * Flop: $2,000 × 2 = $4,000
    * Turn: $6,000 × 2 = $12,000
    * Total: $16,000
```

**After River (Final):**
```
Total Pot: $31,000

Main Pot: $15,000
  - Amount: $15,000
  - Capped at: $5,000 per player
  - Eligible: SB, BB, BTN (3 players)
  - Percentage: 48.4%

Side Pot 1: $16,000
  - Amount: $16,000
  - Eligible: SB, BTN (2 players)
  - Excluded: BB (all-in at $5,000 preflop)
  - Percentage: 51.6%

Player Total Contributions (All Streets):
  - SB: $13,000 ($5,000 preflop + $2,000 flop + $6,000 turn)
  - BB: $5,000 (preflop all-in)
  - BTN: $13,000 ($5,000 preflop + $2,000 flop + $6,000 turn)

Total: $31,000 ✓

Player Stacks After River:
  - SB: $10,000 - $13,000 = -$3,000 (invested $13,000)
  - BB: $0 (all-in)
  - BTN: $10,000 - $13,000 = -$3,000 (invested $13,000)

Winner Scenarios:
  - If BB wins: Gets main pot only = $15,000
  - If SB wins: Gets main + side = $31,000
  - If BTN wins: Gets main + side = $31,000
```

**Verification Points:**
- [ ] Main pot remains $15,000 throughout (BB all-in)
- [ ] Side pot grows: $0 → $4,000 → $16,000 → $16,000
- [ ] Total pot = $31,000
- [ ] BB can only win $15,000 (main pot)
- [ ] SB and BTN can win full $31,000
- [ ] Pot accumulates correctly across 4 streets
- [ ] Side pot only includes SB and BTN contributions after BB's all-in

---

### Test Case 5.3: Multiple All-Ins on Different Streets

**Category:** Multi-Street with Multiple All-Ins
**Complexity:** Very High
**Streets:** Preflop → Flop → Turn

**Setup:**
```
Table: 4 players
SB: $10,000
BB: $10,000
UTG: $2,000 (short)
BTN: $5,000 (medium)
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. UTG all-in $2,000
4. BTN calls $2,000
5. SB calls $1,950 (total $2,000)
6. BB calls $1,900 (total $2,000)

Flop Base:
1. SB checks
2. BB bets $3,000
3. BTN all-in $3,000 (all remaining chips)
4. SB calls $3,000
5. BB is already matched

Turn Base:
1. SB bets $5,000
2. BB calls $5,000
```

**Expected Results:**

**After Preflop:**
```
Total Pot: $8,000

Main Pot: $8,000
  - Eligible: SB, BB, UTG, BTN (4 players)
  - Calculation: $2,000 × 4 = $8,000

UTG all-in at $2,000
```

**After Flop:**
```
Total Pot: $14,000

Main Pot: $8,000
  - Unchanged (UTG all-in preflop)
  - Eligible: SB, BB, UTG, BTN

Side Pot 1: $6,000
  - Capped at: $5,000 (BTN's total)
  - Eligible: SB, BB, BTN (3 players)
  - Excluded: UTG (all-in at $2,000)
  - Calculation: ($5,000 - $2,000) × 3 = $3,000 × 3 = $9,000

Wait, let me recalculate...
After preflop: Everyone contributed $2,000
On flop: BB bets $3,000, BTN calls $3,000 (all-in), SB calls $3,000

BTN's total contribution: $2,000 (preflop) + $3,000 (flop) = $5,000
So BTN is all-in at $5,000 total

Side Pot 1 should be:
  - From preflop to BTN's all-in level ($5,000)
  - Additional per player: $5,000 - $2,000 = $3,000
  - Players: SB, BB, BTN (3 players)
  - Amount: $3,000 × 3 = $9,000

But total pot is $8,000 + $9,000 = $17,000
Contributions: SB ($5,000) + BB ($5,000) + UTG ($2,000) + BTN ($5,000) = $17,000 ✓

Actually that's after flop only, turn hasn't happened yet.
```

**Let me recalculate systematically:**

**After Flop (Corrected):**
```
Contributions after flop:
  - SB: $2,000 (preflop) + $3,000 (flop) = $5,000
  - BB: $2,000 (preflop) + $3,000 (flop) = $5,000
  - UTG: $2,000 (preflop, all-in) = $2,000
  - BTN: $2,000 (preflop) + $3,000 (flop, all-in) = $5,000

Total Pot: $17,000

Main Pot: $8,000
  - Capped at: $2,000 per player
  - Eligible: All 4 players
  - Calculation: $2,000 × 4 = $8,000

Side Pot 1: $9,000
  - Capped at: $5,000 per player
  - Eligible: SB, BB, BTN (3 players)
  - Excluded: UTG (all-in at $2,000)
  - Calculation: ($5,000 - $2,000) × 3 = $9,000

BTN now all-in at $5,000
SB and BB can continue betting on turn
```

**After Turn (Final):**
```
Contributions after turn:
  - SB: $5,000 (through flop) + $5,000 (turn) = $10,000
  - BB: $5,000 (through flop) + $5,000 (turn) = $10,000
  - UTG: $2,000 (all-in preflop)
  - BTN: $5,000 (all-in flop)

Total Pot: $27,000

Main Pot: $8,000
  - Capped at: $2,000
  - Eligible: SB, BB, UTG, BTN (4 players)
  - Percentage: 29.6%

Side Pot 1: $9,000
  - Capped at: $5,000
  - Eligible: SB, BB, BTN (3 players)
  - Excluded: UTG (all-in at $2,000)
  - Percentage: 33.3%

Side Pot 2: $10,000
  - From $5,000 to $10,000
  - Eligible: SB, BB (2 players)
  - Excluded: UTG (all-in at $2,000), BTN (all-in at $5,000)
  - Calculation: ($10,000 - $5,000) × 2 = $10,000
  - Percentage: 37.0%

Total: $8,000 + $9,000 + $10,000 = $27,000 ✓

Player Stacks After:
  - SB: $0 (invested $10,000)
  - BB: $0 (invested $10,000)
  - UTG: $0 (all-in at $2,000)
  - BTN: $0 (all-in at $5,000)

Winner Scenarios:
  - If UTG wins: Gets main pot = $8,000
  - If BTN wins: Gets main + side 1 = $17,000
  - If SB wins: Gets all pots = $27,000
  - If BB wins: Gets all pots = $27,000
```

**Verification Points:**
- [ ] Main pot = $8,000 (4 players)
- [ ] Side pot 1 = $9,000 (3 players, UTG excluded)
- [ ] Side pot 2 = $10,000 (2 players, UTG and BTN excluded)
- [ ] Total pot = $27,000
- [ ] Pots accumulate across 3 streets
- [ ] UTG max win: $8,000
- [ ] BTN max win: $17,000
- [ ] SB/BB max win: $27,000

---

## Edge Cases

### Test Case 6.1: Everyone Folds to Big Blind

**Category:** Edge Case
**Complexity:** Low
**Street:** Preflop only

**Setup:**
```
Table: 3 players
SB: $10,000
BB: $10,000
BTN: $10,000
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. BTN folds
4. SB folds
5. BB wins
```

**Expected Results:**
```
Total Pot: $50

Main Pot: $50
  - Eligible: BB only
  - Percentage: 100%

Dead Money: $50
  - Folded Blinds: $50 (SB's blind)

Player Contributions:
  - SB: $50 (folded blind)
  - BB: $0 (BB's blind returned since unchallenged)
  - BTN: $0

Player Stacks After:
  - SB: $9,950 (lost blind)
  - BB: $10,050 (won SB's blind, kept own blind)
  - BTN: $10,000 (unchanged)

Special Note:
  - BB gets their own blind back
  - BB wins $50 (SB's blind only)
  - BB nets +$50
```

**Verification Points:**
- [ ] BB wins $50
- [ ] SB loses $50
- [ ] BTN unchanged
- [ ] BB's blind not in pot (returned)

---

### Test Case 6.2: All-In for Less Than Big Blind

**Category:** Edge Case
**Complexity:** Medium
**Street:** Preflop only

**Setup:**
```
Table: 3 players
SB: $10,000
BB: $10,000
BTN: $75 (less than BB)
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. BTN all-in $75
4. SB calls $25 (total $75) - can't raise since BTN didn't make full bet
5. BB has option: can call $0 since BTN didn't complete the bet
   BB calls (checking)
```

**Expected Results:**
```
Total Pot: $250

Main Pot: $250
  - Amount: $250
  - Capped at: $75 (BTN's all-in)
  - Eligible: SB, BB, BTN (3 players)
  - Percentage: 100%

Side Pot 1: $0
  - SB and BB didn't bet beyond $75

Wait, let me reconsider the action...
Actually, when BTN goes all-in for $75 (less than BB):
- BB already posted $100
- SB posted $50
- BTN goes all-in $75

The standard rule is:
- BB's $100 blind stands
- SB needs to call to $100 (or fold)
- BTN's $75 all-in creates a side pot

Let me recalculate with standard rules:
```

**CORRECTED Expected Results:**
```
If BTN all-in $75 doesn't reopen betting:

Option A: SB folds
  - Total pot: $175 ($50 SB + $100 BB + $75 BTN - $50 returned to BB)

Option B: SB calls to BB ($100), BB checks

Total Pot: $275

Main Pot: $225
  - Capped at: $75
  - Eligible: SB, BB, BTN (3 players)
  - Calculation: $75 × 3 = $225

Side Pot 1: $50
  - Capped at: $100
  - Eligible: SB, BB (2 players)
  - Excluded: BTN (all-in at $75)
  - Calculation: ($100 - $75) × 2 = $50

Player Contributions:
  - SB: $100 ($50 blind + $50 call to BB)
  - BB: $100 (blind)
  - BTN: $75 (all-in)

Total: $275 ✓

Player Stacks After:
  - SB: $9,900
  - BB: $9,900
  - BTN: $0 (all-in)
```

**Verification Points:**
- [ ] Total pot = $275
- [ ] Main pot = $225 (all 3 players)
- [ ] Side pot = $50 (SB and BB only)
- [ ] BTN all-in for less than BB
- [ ] BTN excluded from side pot
- [ ] BTN can only win $225 max

---

### Test Case 6.3: Player Folds with $0 Stack (Already All-In)

**Category:** Edge Case
**Complexity:** Low
**Street:** Flop

**Setup:**
```
Table: 3 players
SB: $5,000
BB: $5,000
BTN: $0 (already all-in from previous hand - this is invalid but testing edge case)

Actually, this scenario is invalid. If BTN has $0, they can't be in the hand.
Let me create a valid edge case instead:
```

**REVISED Edge Case 6.3: All-In Player Survives to River with No Side Pot Action**

**Setup:**
```
Table: 3 players
SB: $10,000
BB: $10,000
BTN: $500 (short)
Blinds: SB = $50, BB = $100
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $50
2. BB posts $100
3. BTN all-in $500
4. SB calls $450 (total $500)
5. BB calls $400 (total $500)

Flop, Turn, River:
- SB checks
- BB checks
(All streets, both check through)
```

**Expected Results:**
```
Total Pot: $1,500

Main Pot: $1,500
  - Eligible: SB, BB, BTN (3 players)
  - Percentage: 100%

Side Pots: None
  - Reason: No betting after flop

Player Contributions:
  - SB: $500
  - BB: $500
  - BTN: $500

Player Stacks After Showdown:
  - SB: $9,500 (if lose) or $10,000 (if chop) or $11,000 (if win)
  - BB: $9,500 (if lose) or $10,000 (if chop) or $11,000 (if win)
  - BTN: $0 (if lose) or $500 (if chop) or $1,500 (if win)

Special Note:
  - BTN all-in preflop
  - No side pot created because SB and BB didn't bet beyond BTN's amount
  - All 3 players eligible for same pot
  - Checking through doesn't create side pots
```

**Verification Points:**
- [ ] Total pot = $1,500
- [ ] Only main pot exists
- [ ] All 3 players eligible
- [ ] No side pots despite all-in (no additional betting)
- [ ] Checks through all streets don't create side action

---

## Complex Real-World Scenarios

### Test Case 7.1: Tournament Scenario - ICM Implications

**Category:** Complex Real-World
**Complexity:** Very High
**Streets:** Preflop → Flop → Turn → River

**Setup:**
```
Table: 5 players (tournament final table)
SB: $15,000
BB: $12,000
UTG: $3,500
MP: $8,000
BTN: $20,000
Blinds: SB = $500, BB = $1,000
Ante: $100 per player
Ante Order: BB First
```

**Actions:**
```
Preflop Base:
1. Each player posts $100 ante (5 × $100 = $500)
2. SB posts $500 blind
3. BB posts $1,000 blind
4. UTG all-in $3,500
5. MP folds
6. BTN calls $3,500
7. SB folds
8. BB calls $2,500 (total $3,500)

Flop (A♠ K♠ Q♠):
1. BB checks
2. BTN bets $8,000
3. BB all-in $8,500 remaining (total $12,000)
4. BTN calls $500 (total $12,000)

Turn (7♣):
- No action (BB all-in)

River (2♦):
- No action (BB all-in)
```

**Expected Results:**

**After Preflop:**
```
Total Pot: $11,000

Main Pot (Pot 0): $11,000
  - Capped at: $3,500
  - Eligible: BB, UTG, BTN (3 players)
  - Excluded: SB (folded), MP (folded)
  - Calculation: $3,500 × 3 = $10,500 + $500 ante = $11,000

Dead Money in Main Pot: $1,100
  - Ante: $500 (5 players × $100)
  - Folded Blinds: $500 (SB's blind)
  - Folded Bets: $100 (MP's ante)

Wait, let me recalculate antes properly:
- 5 players × $100 = $500 total antes
- SB folded: contributes $100 ante + $500 blind = $600 dead
- MP folded: contributes $100 ante = $100 dead
- Total dead = $700

Main Pot: $11,200
  - UTG: $3,500 (includes $100 ante)
  - BB: $3,500 (includes $100 ante)
  - BTN: $3,500 (includes $100 ante)
  - Dead: $700
  - Total: $11,200
```

Actually, ante handling is complex. Let me clarify:

**CLARIFIED Ante Handling:**
```
Antes collected first: 5 × $100 = $500 (all dead money)
Then blinds: SB $500, BB $1,000
Then action begins

So pot starts at $500 (antes) + $500 (SB) + $1,000 (BB) = $2,000

Preflop action:
- UTG all-in $3,500
- MP folds (already contributed $100 ante)
- BTN calls $3,500
- SB folds (loses $500 blind + $100 ante = $600)
- BB calls $2,500 more (total $3,500 including blind and ante)

Actually, BB already posted $1,000 blind, so to call $3,500:
- BB needs $3,500 total
- BB already in for $100 (ante) + $1,000 (blind) = $1,100
- BB needs $2,400 more to call
```

Let me restart with clearer accounting:

**CORRECTED - After Preflop:**
```
Pre-Action Pot:
  - Antes: $500 (5 × $100, all dead)
  - SB blind: $500
  - BB blind: $1,000
  - Starting pot: $2,000

Action Contributions (beyond antes/blinds):
  - UTG: $3,500 total ($3,400 beyond ante)
  - MP: $0 (folded, forfeits $100 ante)
  - BTN: $3,500 total ($3,400 beyond ante)
  - SB: $0 beyond blind (folded, forfeits $600 total)
  - BB: $3,500 total ($2,400 beyond blind+ante)

Total Pot: $500 (antes) + $500 (SB) + $1,000 (BB) + $3,400 (UTG) + $3,400 (BTN) + $2,400 (BB) = $11,200

Main Pot: $11,200
  - Eligible: UTG, BB, BTN
  - Excluded: SB (folded), MP (folded)

Dead Money: $1,100
  - Antes: $500 (all antes are dead)
  - SB forfeit: $500 (blind)
  - MP forfeit: $100 (ante only, MP contributed ante but folded)

Wait, if antes are all dead, then:
- Total antes: $500 dead
- SB folded blind: $500 dead
- Total dead: $1,000

But MP's ante is already counted in the $500 total antes.

Let me recalculate one more time, clearly:

All 5 players contribute antes FIRST: $500 total (all dead money)
Then blinds: SB $500, BB $1,000
Pot now: $2,000 before any action

Action:
- UTG raises all-in to $3,500 (total including ante)
- MP folds (ante already in pot)
- BTN calls $3,500 (total including ante)
- SB folds (loses $500 blind, ante already in)
- BB calls to $3,500 (total including ante and blind)

Total contributions:
- Antes: $500 (already in)
- SB blind: $500 (forfeit)
- BB: $3,500 total (including ante $100 + blind $1,000 + call $2,400)
- UTG: $3,500 total (including ante)
- BTN: $3,500 total (including ante)

Total pot: $500 + $500 + $3,500 + $3,500 + $3,500 = $11,500

Hmm, I keep getting different numbers. Let me use a different approach:

Player-by-player accounting:
- SB: $100 ante + $500 blind = $600 (folded)
- BB: $100 ante + $1,000 blind + $2,400 call = $3,500
- UTG: $100 ante + $3,400 all-in = $3,500
- MP: $100 ante (folded)
- BTN: $100 ante + $3,400 call = $3,500

Total: $600 + $3,500 + $3,500 + $100 + $3,500 = $11,200 ✓

OK so $11,200 is correct.
```

**FINAL - After Preflop:**
```
Total Pot: $11,200

Main Pot: $11,200
  - Capped at: $3,500 per player
  - Eligible: BB, UTG, BTN (3 players)
  - Excluded: SB (folded), MP (folded)

Dead Money: $700
  - Antes from all players: $500
  - SB folded blind: $500
  - MP folded ante: already in $500 antes
  - Total: $500 (antes) + $500 (SB blind) - $100 (subtract MP's ante since it's already counted) = $900

Wait, that's wrong too. Let me think about dead money differently:

Dead money = money in pot that no remaining player contributed
- All antes: $500 (dead, no one "owns" them, they're just in the pot)
- SB's blind: $500 (SB folded, so this is dead)
- MP's ante: already counted in the $500 total antes

So dead money = $500 (antes) + $500 (SB blind) = $1,000

No wait. Dead money from folded players:
- SB contributed $600 total, folded
- MP contributed $100 total, folded
- Dead money = $700

The remaining players (BB, UTG, BTN) contributed $3,500 + $3,500 + $3,500 = $10,500
Total pot = $10,500 + $700 = $11,200 ✓

Dead money = $700 ✓
```

**After Flop:**
```
Flop contributions:
- BB: $8,500 (all remaining)
- BTN: $8,500 (call)

BB's total: $3,500 (preflop) + $8,500 (flop) = $12,000
BTN's total: $3,500 (preflop) + $8,500 (flop) = $12,000
UTG's total: $3,500 (all-in preflop)

Total Pot: $28,200

Main Pot: $11,200
  - Capped at: $3,500
  - Eligible: BB, UTG, BTN (3 players)
  - Includes: $700 dead money
  - Percentage: 39.7%

Side Pot 1: $17,000
  - Capped at: $12,000
  - Eligible: BB, BTN (2 players)
  - Excluded: UTG (all-in at $3,500)
  - Calculation: ($12,000 - $3,500) × 2 = $17,000
  - Percentage: 60.3%

Total: $11,200 + $17,000 = $28,200 ✓

Player Stacks After:
  - SB: $14,400 ($15,000 - $600)
  - BB: $0 (all-in $12,000)
  - UTG: $0 (all-in $3,500)
  - MP: $7,900 ($8,000 - $100)
  - BTN: $8,000 ($20,000 - $12,000)

Winner Scenarios:
  - If UTG wins: $11,200 (main pot only)
  - If BB wins: $28,200 (main + side pot 1)
  - If BTN wins: $28,200 (main + side pot 1)
```

**Verification Points:**
- [ ] Ante handling: $500 total, all dead
- [ ] Main pot = $11,200 (includes $700 dead money)
- [ ] Side pot 1 = $17,000
- [ ] Total pot = $28,200
- [ ] 3 players eligible for main pot
- [ ] 2 players eligible for side pot
- [ ] UTG max win: $11,200
- [ ] BB/BTN max win: $28,200
- [ ] Dead money calculated correctly ($700)

---

### Test Case 7.2: Cash Game - Deep Stack Complex Action

**Category:** Complex Real-World
**Complexity:** Very High
**Streets:** Preflop → Flop → Turn → River

**Setup:**
```
Table: 6 players (cash game)
SB: $50,000
BB: $45,000
UTG: $25,000
MP: $30,000
CO: $18,000
BTN: $60,000
Blinds: SB = $100, BB = $200
Ante: $0
```

**Actions:**
```
Preflop Base:
1. SB posts $100
2. BB posts $200
3. UTG raises to $800
4. MP folds
5. CO calls $800
6. BTN raises to $2,800
7. SB folds
8. BB folds
9. UTG calls $2,000 (total $2,800)
10. CO calls $2,000 (total $2,800)

Flop (9♣ 9♦ 3♠):
1. UTG checks
2. CO checks
3. BTN bets $4,000
4. UTG calls $4,000
5. CO all-in $15,200 remaining (total $18,000)
6. BTN raises to $30,000
7. UTG calls $18,200 (total $25,000, all-in)
8. BTN has raise to $30,000

Turn (K♥):
1. BTN continues alone (both opponents all-in)

River (2♠):
1. BTN continues alone
```

**Expected Results:**

**After Preflop:**
```
Total Pot: $8,700

Main Pot: $8,700
  - Eligible: UTG, CO, BTN (3 players)
  - Excluded: SB, BB (folded)

Dead Money: $300
  - SB blind: $100
  - BB blind: $200

Player Contributions (Preflop):
  - UTG: $2,800
  - CO: $2,800
  - BTN: $2,800
  - Active: $8,400
  - Dead: $300
  - Total: $8,700 ✓
```

**After Flop:**
```
Flop action:
- UTG checks, then calls $4,000, then calls to $25,000 all-in
  UTG total: $2,800 + $22,200 = $25,000
- CO checks, then all-in $15,200
  CO total: $2,800 + $15,200 = $18,000
- BTN bets $4,000, then raises to $30,000
  BTN total: $2,800 + $27,200 = $30,000

Total Pot: $73,300

Main Pot: $54,300
  - Capped at: $18,000 per player
  - Eligible: UTG, CO, BTN (3 players)
  - Calculation: $18,000 × 3 = $54,000 + $300 dead = $54,300
  - Percentage: 74.1%

Side Pot 1: $14,000
  - Capped at: $25,000 per player
  - Eligible: UTG, BTN (2 players)
  - Excluded: CO (all-in at $18,000)
  - Calculation: ($25,000 - $18,000) × 2 = $14,000
  - Percentage: 19.1%

Side Pot 2: $5,000
  - Capped at: $30,000 per player
  - Eligible: BTN only
  - Excluded: CO (all-in at $18,000), UTG (all-in at $25,000)
  - Calculation: $30,000 - $25,000 = $5,000 (uncalled bet, returned to BTN)
  - Percentage: 6.8%

Wait, uncalled bets should be returned, not in a side pot.

Let me reconsider:
- BTN raised to $30,000
- UTG called all-in to $25,000 (can't call full $30,000)
- CO already all-in at $18,000

So BTN's $30,000 raise was only called to $25,000.
Uncalled $5,000 should be returned to BTN.
```

**CORRECTED After Flop:**
```
Actual contributions after uncalled bet returned:
- UTG: $25,000 total
- CO: $18,000 total
- BTN: $25,000 total (uncalled $5,000 returned)

Total Pot: $68,300

Main Pot: $54,300
  - Capped at: $18,000
  - Eligible: UTG, CO, BTN (3 players)
  - Calculation: $18,000 × 3 = $54,000 + $300 dead = $54,300
  - Percentage: 79.5%

Side Pot 1: $14,000
  - Capped at: $25,000
  - Eligible: UTG, BTN (2 players)
  - Excluded: CO (all-in at $18,000)
  - Calculation: ($25,000 - $18,000) × 2 = $14,000
  - Percentage: 20.5%

Total: $54,300 + $14,000 = $68,300 ✓

Uncalled Bet Returned: $5,000 to BTN

Player Stacks After:
  - SB: $49,900
  - BB: $44,800
  - UTG: $0 (all-in $25,000)
  - MP: $30,000 (no action)
  - CO: $0 (all-in $18,000)
  - BTN: $35,000 ($60,000 - $30,000 + $5,000 uncalled)

Winner Scenarios:
  - If CO wins: $54,300 (main pot only)
  - If UTG wins: $68,300 (main + side 1)
  - If BTN wins: $68,300 (main + side 1)
```

**Verification Points:**
- [ ] Total pot = $68,300 (after uncalled bet returned)
- [ ] Uncalled bet = $5,000 returned to BTN
- [ ] Main pot = $54,300 (includes $300 dead money)
- [ ] Side pot 1 = $14,000
- [ ] CO max win: $54,300
- [ ] UTG max win: $68,300
- [ ] BTN max win: $68,300
- [ ] BTN gets uncalled $5,000 back immediately

---

## Test Data Summary

### Total Test Cases: 21

**By Category:**
- Basic Scenarios (No All-Ins): 4 test cases
- Single All-In Scenarios: 3 test cases
- Multiple All-In Scenarios: 2 test cases
- Dead Money Scenarios: 3 test cases
- Multi-Street Pot Accumulation: 3 test cases
- Edge Cases: 3 test cases
- Complex Real-World Scenarios: 2 test cases

**By Complexity:**
- Low: 8 test cases
- Medium: 8 test cases
- High: 3 test cases
- Very High: 2 test cases

**By Street Coverage:**
- Preflop only: 13 test cases
- Preflop → Flop: 2 test cases
- Preflop → Flop → Turn: 1 test case
- Preflop → Flop → Turn → River: 5 test cases

---

## Playwright Test Structure Recommendations

### Test Organization

```typescript
describe('Pot Calculation Tests', () => {
  describe('Basic Scenarios (No All-Ins)', () => {
    test('TC 1.1: Simple Preflop - Everyone Calls', async ({ page }) => {
      // Setup
      // Actions
      // Assertions
    });
    // ... more tests
  });

  describe('Single All-In Scenarios', () => {
    // ... tests
  });

  // ... more describe blocks
});
```

### Shared Test Utilities

```typescript
// Setup helper
async function setupTable(page, config: {
  players: Array<{ position: string; stack: number }>;
  blinds: { sb: number; bb: number };
  ante?: number;
}) {
  // Implementation
}

// Action helper
async function performAction(page, playerId: string, action: string, amount?: number) {
  // Implementation
}

// Assertion helper
async function verifyPot(page, expected: {
  totalPot: number;
  mainPot: { amount: number; eligiblePlayers: string[] };
  sidePots?: Array<{ amount: number; eligiblePlayers: string[] }>;
  deadMoney: number;
}) {
  // Implementation
}
```

### Key Assertions for Each Test

1. **Total Pot Amount**
2. **Main Pot Details**
   - Amount
   - Eligible players
   - Excluded players
   - Percentage
3. **Side Pot Details** (if any)
   - Amount for each side pot
   - Eligible players
   - Excluded players
   - Percentage
4. **Dead Money Breakdown**
   - Total dead money
   - Ante amount
   - Folded blinds
   - Folded bets
5. **Player Stack Changes**
   - Each player's remaining stack
   - Contribution amounts
6. **All-In Status**
   - Which players are all-in
   - At what amount

---

## Notes for Implementation

### Important Considerations

1. **Floating Point Precision**
   - Use integer chip values (cents) to avoid floating point errors
   - Convert to display format only for UI

2. **Uncalled Bets**
   - Always return uncalled portions of raises
   - Don't include in pot calculations

3. **Ante Handling**
   - All antes are dead money
   - BB's ante does NOT count toward BB's contribution to match

4. **Fold Tracking**
   - Track which street player folded on
   - Folded player contributions stay in pot (dead money)

5. **Multi-Street Accumulation**
   - Pots carry forward across streets
   - Side pots can grow on later streets
   - Main pot amount can't change once all-in player capped

6. **Percentage Validation**
   - All pot percentages should sum to 100%
   - Useful for catching calculation errors

7. **Player Eligibility**
   - Folded players: excluded from all pots
   - All-in players: excluded from pots above their all-in amount
   - Active players: eligible for all pots up to their contribution level

---

## Glossary

- **Main Pot**: The pot that all active (non-folded) players can win
- **Side Pot**: Additional pot(s) created when players are all-in at different amounts
- **Dead Money**: Money in the pot that came from folded players or antes
- **Capped At**: The contribution level that defines pot eligibility
- **Eligible Players**: Players who can win this pot
- **Excluded Players**: Players who cannot win this pot (folded or all-in below cap)
- **Live Contribution**: Bets that count toward matching requirements (not dead money)
- **Uncalled Bet**: Portion of a raise that no one calls (returned to bettor)

---

**Document Version:** 1.0
**Created:** 2025-11-09
**Purpose:** Comprehensive test case documentation for Playwright test implementation
**Coverage:** 21 detailed test cases covering basic to complex pot calculation scenarios
