# Pot Calculation Testing Strategy

## Overview

This document outlines how to test the pot calculation implementation using the 40 base test cases and 10 extended action test cases in the QA folder.

## Test Case Structure

### Available Test Files:
1. **40_TestCases.html** - 40 comprehensive base scenarios
2. **10_MoreAction_TC.html** - 10 extended action scenarios (multiple betting rounds)

### Test Case Format:
Each test case includes:
- **Hand Setup**: Players, positions, starting stacks, blinds, ante
- **Actions**: Complete action sequence (preflop, flop, turn, river)
- **Expected Results**: Final stacks, contributions, pot distribution
- **Next Hand Preview**: Starting stacks for next hand

## Testing Approach

### Phase 1: Manual Testing (Recommended Start)

#### Step 1: Test Simple Cases (TC-1 through TC-10)
These are fundamental scenarios to verify core pot calculation:

**Test Cases to Start With:**
- **TC-1**: Simple heads-up all-in preflop
- **TC-2**: 3-player preflop fold scenario
- **TC-3**: Basic call/fold situation
- **TC-5**: Simple raise and call

**Testing Process:**
1. Open your app at http://localhost:3004
2. Click "Setup Players" to configure the hand
3. For each test case:
   - Copy player data from "Copy Player Data" button in test case HTML
   - Paste into your app (or manually enter)
   - Enter actions exactly as shown in test case
   - Click "Process Stack" after each street
   - **Verify pot display appears when betting round is complete**
   - **Compare displayed pots with "Expected Results" table in test case**

**What to Verify:**
- ✅ Pot display appears at bottom of page
- ✅ Total pot matches expected
- ✅ Main pot amount is correct
- ✅ Eligible players list is accurate
- ✅ Side pots (if any) match expected
- ✅ Per-player contributions are correct
- ✅ Street-by-street breakdown is accurate
- ✅ Calculation formulas make sense

---

### Phase 2: Side Pot Testing (TC-11 through TC-20)

These test cases involve multiple all-ins creating side pots:

**Key Test Cases:**
- **TC-11**: Two all-ins at different amounts
- **TC-15**: Three-way all-in with varying stacks
- **TC-18**: Complex multi-street side pot evolution

**What to Verify:**
- ✅ Multiple side pots are created correctly
- ✅ Each pot shows correct eligible players
- ✅ Excluded players have correct reasons ("All-in for $X" or "Folded")
- ✅ Pot amounts add up to total pot
- ✅ Capping logic works correctly (smallest all-in determines pot cap)

---

### Phase 3: Multi-Street Testing (TC-21 through TC-30)

Test cases that span multiple streets (preflop → flop → turn → river):

**Key Test Cases:**
- **TC-21**: Preflop raise, flop continuation
- **TC-25**: Multi-street all-ins
- **TC-28**: River betting after flop/turn checks

**What to Verify:**
- ✅ Pot carries forward correctly between streets
- ✅ Previous street pot is included in next street calculation
- ✅ Street breakdown shows contributions from all streets
- ✅ "Process Stack" button works on each street
- ✅ Pot display updates correctly on each street

---

### Phase 4: Extended Actions (10_MoreAction_TC.html)

Test cases with "More Action" levels (multiple betting rounds within a street):

**Key Test Cases:**
- **TC-41**: Preflop: raise → re-raise → call
- **TC-44**: Three-way preflop action with re-raises
- **TC-47**: Postflop multi-level betting

**What to Verify:**
- ✅ "More Action" levels aggregate correctly
- ✅ Pot calculation considers all action levels
- ✅ Contributions from "base", "more action 1", "more action 2" sum correctly
- ✅ Pot display appears only after final action level is processed

---

### Phase 5: Edge Cases (TC-31 through TC-40)

Complex scenarios testing edge cases:

**Key Test Cases:**
- **TC-32**: Uncalled bet (player bets, everyone folds)
- **TC-35**: All-in for less than blind
- **TC-38**: Split pot scenario
- **TC-40**: Maximum complexity (multiple side pots + multi-street)

**What to Verify:**
- ✅ Uncalled bets are returned properly
- ✅ Dead money (ante, folded SB) handled correctly
- ✅ All-in for less than blind works
- ✅ Split pots show multiple eligible winners

---

## Automated Testing Strategy

### Option 1: Create Playwright E2E Tests

Create automated tests that:
1. Load test case data
2. Enter players and actions programmatically
3. Click "Process Stack"
4. Verify pot display appears with correct values

**Example Test Structure:**
```typescript
// tests/pot-calculation.spec.ts
import { test, expect } from '@playwright/test';
import testCases from '../docs/QA/test-cases-data.json';

test.describe('Pot Calculation Tests', () => {
  test('TC-1: Simple heads-up all-in', async ({ page }) => {
    await page.goto('http://localhost:3004');

    // Setup players
    await setupPlayers(page, testCases.tc1.players);

    // Enter actions
    await enterActions(page, 'preflop', testCases.tc1.actions.preflop);

    // Process stack
    await page.click('[data-process-stack-focus]');

    // Verify pot display
    const potDisplay = page.locator('.bg-gradient-to-r.from-purple-600');
    await expect(potDisplay).toBeVisible();

    // Verify total pot
    const totalPot = await potDisplay.locator('text=/Total Pot:/').textContent();
    expect(totalPot).toContain(testCases.tc1.expected.totalPot);

    // Verify main pot
    const mainPot = await potDisplay.locator('text=/Main Pot:/').textContent();
    expect(mainPot).toContain(testCases.tc1.expected.mainPot);
  });
});
```

---

### Option 2: Parse Test Cases and Create Test Data

Create a script to extract test case data:

```python
# tests/extract-test-data.py
import re
import json

def extract_test_cases(html_file):
    """Extract test case data from HTML files"""
    with open(html_file, 'r') as f:
        content = f.read()

    test_cases = []
    tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+|$)'
    tc_matches = re.findall(tc_pattern, content, re.DOTALL)

    for tc_num, tc_content in tc_matches:
        # Extract players
        players = extract_players(tc_content)

        # Extract actions by street
        actions = extract_actions(tc_content)

        # Extract expected results
        expected = extract_expected_results(tc_content)

        test_cases.append({
            'id': f'TC-{tc_num}',
            'players': players,
            'actions': actions,
            'expected': expected
        })

    return test_cases

# Generate JSON for automated tests
test_data = extract_test_cases('docs/QA/40_TestCases.html')
with open('tests/test-cases-data.json', 'w') as f:
    json.dump(test_data, f, indent=2)
```

---

### Option 3: Unit Tests for Pot Calculation Engine

Test the core logic directly:

```typescript
// src/lib/poker/engine/__tests__/potCalculation.test.ts
import { calculatePotsForBettingRound } from '../potCalculationEngine';

describe('Pot Calculation Engine', () => {
  it('TC-1: Heads-up all-in preflop', () => {
    const players = [
      { id: 1, name: 'Alice', position: 'SB', stack: 0 },
      { id: 2, name: 'Bob', position: 'BB', stack: 0 }
    ];

    const contributedAmounts = {
      1: { preflop: 50000 },
      2: { preflop: 50000 }
    };

    const result = calculatePotsForBettingRound(
      'preflop',
      players,
      contributedAmounts,
      { ante: 0, bb: 1000 },
      0 // previousStreetPot
    );

    expect(result.totalPot).toBe(100000);
    expect(result.mainPot.amount).toBe(100000);
    expect(result.sidePots).toHaveLength(0);
    expect(result.mainPot.eligiblePlayers).toHaveLength(2);
  });

  it('TC-11: Two all-ins creating side pot', () => {
    const players = [
      { id: 1, name: 'Alice', position: 'Dealer', stack: 0 },
      { id: 2, name: 'Bob', position: 'SB', stack: 0 },
      { id: 3, name: 'Charlie', position: 'BB', stack: 25000 }
    ];

    const contributedAmounts = {
      1: { preflop: 10000 },  // All-in for 10k
      2: { preflop: 25000 },  // All-in for 25k
      3: { preflop: 25000 }   // Call 25k
    };

    const result = calculatePotsForBettingRound(
      'preflop',
      players,
      contributedAmounts,
      { ante: 0, bb: 2000 },
      0
    );

    expect(result.totalPot).toBe(60000);
    expect(result.mainPot.amount).toBe(30000); // 10k × 3 players
    expect(result.sidePots).toHaveLength(1);
    expect(result.sidePots[0].amount).toBe(30000); // (25k - 10k) × 2 players

    // Main pot: All 3 players eligible
    expect(result.mainPot.eligiblePlayers).toHaveLength(3);

    // Side pot: Only Bob and Charlie eligible
    expect(result.sidePots[0].eligiblePlayers).toHaveLength(2);
    expect(result.sidePots[0].excludedPlayers).toHaveLength(1);
  });
});
```

---

## Testing Checklist

### Core Functionality
- [ ] Pot display appears when betting round complete
- [ ] Pot display positioned at bottom of page (below all buttons)
- [ ] Total pot matches expected
- [ ] Main pot amount is correct
- [ ] Main pot eligible players are correct
- [ ] Close button (×) works

### Side Pots
- [ ] Side pots created when multiple all-ins
- [ ] Side pot amounts are correct
- [ ] Eligible players list for each pot is correct
- [ ] Excluded players show correct reason
- [ ] Pot amounts sum to total pot

### Contributions
- [ ] Per-player contributions are accurate
- [ ] Street breakdown shows correct amounts
- [ ] All streets (preflop, flop, turn, river) tracked
- [ ] Dead money (ante, folded SB) included correctly

### Calculation Formulas
- [ ] Main pot formula displayed correctly
- [ ] Side pot formulas displayed correctly
- [ ] Variables shown match actual values
- [ ] Result line shows correct amount

### Multi-Street
- [ ] Pot carries forward between streets
- [ ] Previous street pot included in calculations
- [ ] Street breakdown accumulates correctly
- [ ] Pot display updates on each street

### Edge Cases
- [ ] Uncalled bet returned properly
- [ ] All-in for less than blind handled
- [ ] Fold scenarios work correctly
- [ ] Split pot scenarios (if implemented)
- [ ] More Action levels aggregate correctly

---

## Quick Test Script

Here's a quick manual test script for the 5 most important scenarios:

### Test 1: Simple All-In (TC-1)
```
Players: Alice (SB, 50,000), Bob (BB, 50,000)
Blinds: SB 500, BB 1,000, Ante 0

Preflop:
- Alice: All-in 50,000
- Bob: Call 50,000

Expected:
✅ Total Pot: 100,000
✅ Main Pot: 100,000 (Alice, Bob eligible)
✅ Side Pots: None
```

### Test 2: Side Pot Creation (TC-11)
```
Players:
- Alice (Dealer, 10,000)
- Bob (SB, 25,000)
- Charlie (BB, 30,000)
Blinds: SB 500, BB 1,000, Ante 0

Preflop:
- Alice: All-in 10,000
- Bob: All-in 25,000
- Charlie: Call 25,000

Expected:
✅ Total Pot: 60,000
✅ Main Pot: 30,000 (3 players × 10,000)
   - Eligible: Alice, Bob, Charlie
✅ Side Pot 1: 30,000 (2 players × 15,000)
   - Eligible: Bob, Charlie
   - Excluded: Alice (All-in for $10,000)
```

### Test 3: Multi-Street (TC-21)
```
Players: Alice (Dealer, 50,000), Bob (SB, 50,000)
Blinds: SB 500, BB 1,000, Ante 0

Preflop:
- Alice: Raise 3,000
- Bob: Call 3,000

Flop:
- Bob: Check
- Alice: Bet 5,000
- Bob: Call 5,000

Expected (after flop):
✅ Total Pot: 16,000
✅ Main Pot: 16,000
✅ Street Breakdown:
   - Preflop: 6,000
   - Flop: 10,000
```

### Test 4: More Action (TC-41)
```
Players: Alice (Dealer, 80,000), Bob (SB, 80,000)
Blinds: SB 500, BB 1,000, Ante 0

Preflop Base:
- Alice: Raise 3,000
- Bob: Raise 9,000

Preflop More Action 1:
- Alice: Raise 27,000
- Bob: Call 27,000

Expected:
✅ Total Pot: 54,000
✅ Main Pot: 54,000
✅ Contributions aggregate from all action levels
```

### Test 5: Uncalled Bet (TC-32)
```
Players: Alice (Dealer, 50,000), Bob (SB, 50,000), Charlie (BB, 50,000)
Blinds: SB 500, BB 1,000, Ante 0

Preflop:
- Alice: Fold
- Bob: Raise 5,000
- Charlie: Fold

Expected:
✅ Total Pot: 5,500
✅ Bob wins 5,500 (includes blinds)
✅ Uncalled bet: None (Bob's raise was not called)
```

---

## Debugging Tips

### If Pot Display Doesn't Appear:
1. Check console for errors
2. Verify betting round is actually complete (all players acted or all-in)
3. Check `isRoundComplete.isComplete` is `true` in console logs
4. Verify `finalPotInfo` exists in handleProcessStack

### If Pot Amounts Are Wrong:
1. Check `contributedAmounts` state in React DevTools
2. Verify all action levels are included (base, more action 1, more action 2)
3. Check console logs for pot calculation details
4. Compare with test case "Expected Results" table

### If Side Pots Are Missing:
1. Verify multiple all-ins occurred at different amounts
2. Check `potCalculationEngine.ts` logs for pot creation
3. Verify eligible/excluded player logic
4. Check if smallest all-in is being used as cap

### If Street Breakdown Is Wrong:
1. Check `contributedAmounts` includes all streets
2. Verify `currentStreet` parameter is correct
3. Check `buildStreetBreakdown` function in `potDisplayFormatter.ts`

---

## Success Criteria

Your pot calculation implementation is successful when:

✅ **All 40 base test cases** display correct pot information
✅ **All 10 extended action test cases** handle More Action correctly
✅ **Pot display appears automatically** when betting round completes
✅ **All pot amounts match** expected results from test cases
✅ **Side pots are created correctly** in multi-all-in scenarios
✅ **Street-by-street breakdown** is accurate across all streets
✅ **User can close pot display** with × button
✅ **No console errors** during pot calculation
✅ **Performance is acceptable** (pot calculation < 100ms)

---

## Next Steps

1. **Start with TC-1** (simplest case)
2. **Work through TC-1 to TC-10** (fundamental scenarios)
3. **Test side pots** (TC-11 to TC-20)
4. **Test multi-street** (TC-21 to TC-30)
5. **Test extended actions** (10_MoreAction_TC.html)
6. **Test edge cases** (TC-31 to TC-40)
7. **Create automated tests** for regression prevention
8. **Document any discrepancies** between expected and actual results

Good luck with testing! 🎉
