# Error Summary - 30 Test Cases Validation

## Quick Reference Table

| TC ID | Status | Error Type | Player | Starting Stack | Final Stack | Contributed | Issue |
|-------|--------|------------|--------|----------------|-------------|-------------|-------|
| TC-1 | ✅ PASS | - | - | - | - | - | - |
| TC-2 | ✅ PASS | - | - | - | - | - | - |
| TC-3 | ✅ PASS | - | - | - | - | - | - |
| TC-4 | ✅ PASS | - | - | - | - | - | - |
| TC-5 | ✅ PASS | - | - | - | - | - | - |
| TC-6 | ✅ PASS | - | - | - | - | - | - |
| TC-7 | ❌ FAIL | Negative Stack | Alice | 300,000 | **-60,000** | 360,000 | Bet 60k beyond stack |
| TC-8 | ✅ PASS | - | - | - | - | - | - |
| TC-9 | ✅ PASS | - | - | - | - | - | - |
| TC-10 | ✅ PASS | - | - | - | - | - | - |
| TC-11 | ✅ PASS | - | - | - | - | - | - |
| TC-12 | ✅ PASS | - | - | - | - | - | - |
| TC-13 | ✅ PASS | - | - | - | - | - | - |
| TC-14 | ❌ FAIL | Negative Stack | Charlie | 240,000 | **-40,000** | 280,000 | Bet 40k beyond stack |
| TC-15 | ✅ PASS | - | - | - | - | - | - |
| TC-16 | ✅ PASS | - | - | - | - | - | - |
| TC-17 | ✅ PASS | - | - | - | - | - | - |
| TC-18 | ✅ PASS | - | - | - | - | - | - |
| TC-19 | ❌ FAIL | Negative Stack | Alice | 1,400,000 | **-100,000** | 1,500,000 | Bet 100k beyond stack |
| TC-20 | ❌ FAIL | Negative Stack | Bob | 135,000 | **-10,000** | 145,000 | Bet 10k beyond stack |
| TC-21 | ❌ FAIL | Negative Stack | Alice | 3,800,000 | **-100,000** | 3,900,000 | Bet 100k beyond stack |
| TC-22 | ✅ PASS | - | - | - | - | - | - |
| TC-23 | ❌ FAIL | Negative Stack | Eve | 3,400,000 | **-200,000** | 3,600,000 | Bet 200k beyond stack |
| TC-24 | ✅ PASS | - | - | - | - | - | - |
| TC-25 | ❌ FAIL | Negative Stack | Charlie | 3,500,000 | **-200,000** | 3,700,000 | Bet 200k beyond stack |
| TC-26 | ❌ FAIL | Negative Stack | Bob | 30,000,000 | **-40,000,000** | 70,000,000 | Bet 40M beyond stack |
| TC-27 | ❌ FAIL | Negative Stack | Eve | 45,000,000 | **-6,000,000** | 51,000,000 | Bet 6M beyond stack |
| TC-28 | ❌ FAIL | Negative Stack | Eve | 42,000,000 | **-5,000,000** | 47,000,000 | Bet 5M beyond stack |
| TC-29 | ✅ PASS | - | - | - | - | - | - |
| TC-30 | ❌ FAIL | Negative Stack | Frank | 14,000,000 | **-12,000,000** | 26,000,000 | Bet 12M beyond stack |

## Statistics

- **Total Test Cases:** 30
- **Passed:** 19 (63.3%)
- **Failed:** 11 (36.7%)
- **Error Type:** All failures are due to negative final stacks (impossible in poker)

## Critical Finding: "Raise TO" vs "Raise BY" Rule

**✅ ALL TEST CASES CORRECTLY IMPLEMENT "RAISE TO" SEMANTICS**

No test cases show evidence of double-counting blinds in raises. The "Raise TO" vs "Raise BY" rule is being followed correctly throughout all 30 test cases.

**Example Verification (TC-6):**
- Alice (SB) posts 10,000
- Alice raises TO 60,000
- Alice's total contribution for the raise: 60,000 (not 70,000)
- This is CORRECT ✅

## Root Cause of All Failures

**All 11 failing test cases have the same root cause:**

Players are allowed to bet beyond their available stack, resulting in negative "Final Stack" values. This violates the fundamental poker rule that a player cannot bet more chips than they possess.

**Required Fix:**
1. Detect when a player's remaining stack is less than the required bet
2. Mark the player as "All-In" for their remaining chips
3. Create side pots as needed
4. Ensure Final Stack = 0 (never negative)

## Pot Calculation Errors (Secondary)

All 11 failing test cases also have pot calculation mismatches, but these are **consequences** of the negative stack error, not independent issues.

Once the negative stack errors are fixed by capping contributions at starting stacks and creating proper side pots, the pot calculations will also be correct.
