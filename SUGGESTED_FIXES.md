# Suggested Fixes for 11 Failing Test Cases

## Overview

All 11 failing test cases have players betting beyond their stack. Each needs to be fixed by:
1. Capping the player's contribution at their starting stack
2. Setting their final stack to 0 (all-in)
3. Creating side pots where appropriate
4. Recalculating pot totals

---

## TC-7: Alice Goes Negative

### Current (WRONG)
- Alice starting: 300,000
- Alice final: **-60,000** ❌
- Alice contributed: 360,000 ❌
- Pot: 740,000 ❌

### Suggested Fix
**Alice should go all-in for 300,000:**

**Actions:**
1. Preflop: Alice raises TO 60,000 (50,000 more) ✅
2. Flop: Alice calls 100,000 ✅
3. Turn: Alice should be all-in for remaining 140,000 (not call 200,000) ⚠️

**Corrected Results:**
- Alice starting: 300,000
- Alice final: **0** (all-in)
- Alice contributed: **300,000**

**Pot Structure:**
- Main Pot: 640,000 (Alice 300,000 + Bob 300,000 + 40,000 ante)
  - Eligible: Alice, Bob
- Side Pot: 80,000 (Bob's extra 80,000)
  - Eligible: Bob only
- Total Pot: 720,000

**Winner Scenarios:**
- If Alice wins: Gets Main Pot (640,000), Bob keeps Side Pot (80,000)
- If Bob wins: Gets both pots (720,000)

---

## TC-14: Charlie Goes Negative

### Current (WRONG)
- Charlie starting: 240,000
- Charlie final: **-40,000** ❌
- Charlie contributed: 280,000 ❌

### Suggested Fix
**Charlie should go all-in for 240,000:**

**Corrected Results:**
- Charlie starting: 240,000
- Charlie final: **0** (all-in)
- Charlie contributed: **240,000**

**Recalculate pot structure with side pots based on Charlie's all-in amount.**

---

## TC-19: Alice Goes Negative

### Current (WRONG)
- Alice starting: 1,400,000
- Alice final: **-100,000** ❌
- Alice contributed: 1,500,000 ❌

### Suggested Fix
**Alice should go all-in for 1,400,000:**

**Corrected Results:**
- Alice starting: 1,400,000
- Alice final: **0** (all-in)
- Alice contributed: **1,400,000**

---

## TC-20: Bob Goes Negative

### Current (WRONG)
- Bob starting: 135,000
- Bob final: **-10,000** ❌
- Bob contributed: 145,000 ❌

### Suggested Fix
**Bob should go all-in for 135,000:**

**Corrected Results:**
- Bob starting: 135,000
- Bob final: **0** (all-in)
- Bob contributed: **135,000**

---

## TC-21: Alice Goes Negative

### Current (WRONG)
- Alice starting: 3,800,000
- Alice final: **-100,000** ❌
- Alice contributed: 3,900,000 ❌

### Suggested Fix
**Alice should go all-in for 3,800,000:**

**Corrected Results:**
- Alice starting: 3,800,000
- Alice final: **0** (all-in)
- Alice contributed: **3,800,000**

---

## TC-23: Eve Goes Negative

### Current (WRONG)
- Eve starting: 3,400,000
- Eve final: **-200,000** ❌
- Eve contributed: 3,600,000 ❌

### Suggested Fix
**Eve should go all-in for 3,400,000:**

**Corrected Results:**
- Eve starting: 3,400,000
- Eve final: **0** (all-in)
- Eve contributed: **3,400,000**

---

## TC-25: Charlie Goes Negative

### Current (WRONG)
- Charlie starting: 3,500,000
- Charlie final: **-200,000** ❌
- Charlie contributed: 3,700,000 ❌

### Suggested Fix
**Charlie should go all-in for 3,500,000:**

**Corrected Results:**
- Charlie starting: 3,500,000
- Charlie final: **0** (all-in)
- Charlie contributed: **3,500,000**

---

## TC-26: Bob Goes Negative

### Current (WRONG)
- Bob starting: 30,000,000
- Bob final: **-40,000,000** ❌
- Bob contributed: 70,000,000 ❌

### Suggested Fix
**Bob should go all-in for 30,000,000:**

**Corrected Results:**
- Bob starting: 30,000,000
- Bob final: **0** (all-in)
- Bob contributed: **30,000,000**

---

## TC-27: Eve Goes Negative

### Current (WRONG)
- Eve starting: 45,000,000
- Eve final: **-6,000,000** ❌
- Eve contributed: 51,000,000 ❌

### Suggested Fix
**Eve should go all-in for 45,000,000:**

**Corrected Results:**
- Eve starting: 45,000,000
- Eve final: **0** (all-in)
- Eve contributed: **45,000,000**

---

## TC-28: Eve Goes Negative

### Current (WRONG)
- Eve starting: 42,000,000
- Eve final: **-5,000,000** ❌
- Eve contributed: 47,000,000 ❌

### Suggested Fix
**Eve should go all-in for 42,000,000:**

**Corrected Results:**
- Eve starting: 42,000,000
- Eve final: **0** (all-in)
- Eve contributed: **42,000,000**

---

## TC-30: Frank Goes Negative

### Current (WRONG)
- Frank starting: 14,000,000
- Frank final: **-12,000,000** ❌
- Frank contributed: 26,000,000 ❌

### Suggested Fix
**Frank should go all-in for 14,000,000:**

**Corrected Results:**
- Frank starting: 14,000,000
- Frank final: **0** (all-in)
- Frank contributed: **14,000,000**

---

## Implementation Guidelines

### For Each Failing Test Case:

1. **Identify the All-In Point**
   - Find the action where the player runs out of chips
   - Calculate remaining stack at that point

2. **Cap the Contribution**
   - Set contribution = starting stack (maximum possible)
   - Set final stack = 0 (all-in)

3. **Recalculate Pot Structure**
   - Determine if side pots are needed
   - Main pot = smallest all-in amount × number of players
   - Side pot(s) = additional contributions from players with more chips

4. **Update Pot Eligibility**
   - Main pot: All players who contributed
   - Side pot(s): Only players who contributed to that specific pot

5. **Verify Totals**
   - Sum of all contributions = Total pot
   - No player has negative final stack
   - Each player's contribution = Starting - Final

### Example: TC-7 Detailed Fix

**Original Actions:**
```
Preflop:
- Alice (SB) raises TO 60,000
- Bob (BB) calls 60,000

Flop:
- Bob bets 100,000
- Alice calls 100,000

Turn:
- Bob bets 200,000
- Alice calls 200,000 ❌ IMPOSSIBLE
```

**Corrected Actions:**
```
Preflop:
- Bob posts ante 20,000 (stack: 860,000)
- Alice posts SB 10,000 (stack: 290,000)
- Bob posts BB 20,000 (stack: 840,000)
- Alice raises TO 60,000 (add 50,000, stack: 240,000)
- Bob calls 60,000 (add 40,000, stack: 800,000)

Flop:
- Bob bets 100,000 (stack: 700,000)
- Alice calls 100,000 (stack: 140,000)

Turn:
- Bob bets 200,000 (stack: 500,000)
- Alice all-in 140,000 ✅ (stack: 0)
- Bob's uncalled bet returned: 60,000 (stack: 560,000)

Final:
- Alice: 0 (contributed 300,000)
- Bob: 560,000 (contributed 320,000)
- Pot: 620,000
```

**If Alice wins:** 0 + 620,000 = 620,000
**If Bob wins:** 560,000 + 620,000 = 1,180,000

---

## Validation Checklist

After fixing each test case, verify:

- [ ] No player has a negative final stack
- [ ] Each player's contribution ≤ starting stack
- [ ] Final stack = Starting stack - Contribution
- [ ] Total pot = Sum of all contributions
- [ ] Side pots are created when needed
- [ ] Pot eligibility is correct for each pot
- [ ] Winner calculations are correct
