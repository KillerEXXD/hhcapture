# TC-1 Test Explanation

## Overview
This document explains how the Playwright test for TC-1 works, step by step.

---

## Test Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  TEST START: TC-1 - 2P Simple With Betting                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: SETUP INITIAL STACKS                                   │
│  ────────────────────────────────────────────────────────       │
│  • Navigate to http://localhost:5173                            │
│  • Input SB: 500, BB: 1000, Ante: 1000                          │
│  • Input Alice (SB): 47,000                                      │
│  • Input Bob (BB): 38,000                                        │
│                                                                  │
│  What the test does:                                             │
│    await page.goto('http://localhost:5173');                    │
│    // Fill in blinds and player stacks                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: PREFLOP ACTIONS                                        │
│  ────────────────────────────────────────────────────────       │
│  Actions:                                                        │
│    1. Alice (SB): Call 1,000                                     │
│    2. Bob (BB): Check                                            │
│                                                                  │
│  What the test does:                                             │
│    await inputAction(page, 'preflop', {                         │
│      player: 'Alice', action: 'call', amount: 1000              │
│    });                                                           │
│    await inputAction(page, 'preflop', {                         │
│      player: 'Bob', action: 'check'                             │
│    });                                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: FLOP ACTIONS (A♠ K♦ Q♣)                                │
│  ────────────────────────────────────────────────────────       │
│  Actions:                                                        │
│    1. Bob (BB): Bet 5,000                                        │
│    2. Alice (SB): Call 5,000                                     │
│                                                                  │
│  What the test does:                                             │
│    await inputAction(page, 'flop', {                            │
│      player: 'Bob', action: 'bet', amount: 5000                 │
│    });                                                           │
│    await inputAction(page, 'flop', {                            │
│      player: 'Alice', action: 'call', amount: 5000              │
│    });                                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: TURN ACTIONS (7♥)                                      │
│  ────────────────────────────────────────────────────────       │
│  Actions:                                                        │
│    1. Bob (BB): Bet 10,000                                       │
│    2. Alice (SB): Call 10,000                                    │
│                                                                  │
│  What the test does:                                             │
│    await inputAction(page, 'turn', {                            │
│      player: 'Bob', action: 'bet', amount: 10000                │
│    });                                                           │
│    await inputAction(page, 'turn', {                            │
│      player: 'Alice', action: 'call', amount: 10000             │
│    });                                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: RIVER ACTIONS (3♦)                                     │
│  ────────────────────────────────────────────────────────       │
│  Actions:                                                        │
│    1. Bob (BB): Check                                            │
│    2. Alice (SB): Check                                          │
│                                                                  │
│  What the test does:                                             │
│    await inputAction(page, 'river', {                           │
│      player: 'Bob', action: 'check'                             │
│    });                                                           │
│    await inputAction(page, 'river', {                           │
│      player: 'Alice', action: 'check'                           │
│    });                                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: PROCESS STACK                                          │
│  ────────────────────────────────────────────────────────       │
│  • Click "Process Stack" button                                  │
│  • Wait for pot calculations                                     │
│                                                                  │
│  What the test does:                                             │
│    await page.click('[data-process-stack-focus]');              │
│    await page.waitForTimeout(1000);                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: VERIFY POT CALCULATIONS                                │
│  ────────────────────────────────────────────────────────       │
│  Expected:                                                       │
│    • Total Pot: 33,000                                           │
│    • Main Pot: 33,000 (100%)                                     │
│    • Eligible: Alice, Bob                                        │
│                                                                  │
│  What the test does:                                             │
│    const totalPot = await page.textContent('.pot-summary');     │
│    expect(totalPot).toContain('33,000');                        │
│                                                                  │
│    const mainPot = await page.textContent('[data-pot="main"]'); │
│    expect(mainPot).toContain('33,000');                         │
│                                                                  │
│  ✅ If pot calculations match → Test continues                  │
│  ❌ If pot calculations don't match → Test FAILS                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 8: SELECT WINNER                                          │
│  ────────────────────────────────────────────────────────       │
│  • Select Alice as winner                                        │
│  • Main Pot (33,000) goes to Alice                               │
│                                                                  │
│  What the test does:                                             │
│    await page.click('[data-winner="Alice"]');                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 9: VERIFY FINAL STACKS                                    │
│  ────────────────────────────────────────────────────────       │
│  Expected Final Stacks:                                          │
│    • Alice: 64,000  (31,000 final + 33,000 won)                 │
│    • Bob: 21,000    (38,000 - 17,000 contributed)               │
│                                                                  │
│  What the test does:                                             │
│    const aliceStack = await page.textContent(                   │
│      '[data-player="Alice"] .final-stack'                       │
│    );                                                            │
│    expect(aliceStack).toContain('64,000');                      │
│                                                                  │
│    const bobStack = await page.textContent(                     │
│      '[data-player="Bob"] .final-stack'                         │
│    );                                                            │
│    expect(bobStack).toContain('21,000');                        │
│                                                                  │
│  ✅ If final stacks match → Test PASSES                         │
│  ❌ If final stacks don't match → Test FAILS                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  TEST END: ✅ PASS or ❌ FAIL                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Components Explained

### 1. Test Data Structure
```typescript
const TC1_DATA = {
  setup: { /* blinds, players, stacks */ },
  actions: { /* preflop, flop, turn, river */ },
  expected: { /* pots, winner, final stacks */ }
};
```
**Why?** Separates data from logic. Easy to read, maintain, and duplicate for other test cases.

### 2. Helper Functions
```typescript
async function setupStacks(page, setup) { /* ... */ }
async function inputAction(page, street, action) { /* ... */ }
async function verifyPots(page, expectedPots) { /* ... */ }
```
**Why?** Reusable code. Each function does ONE thing well. Easy to debug.

### 3. The Test
```typescript
test('TC-1: 2P Simple - With Betting', async ({ page }) => {
  await setupStacks(page, TC1_DATA.setup);
  await inputStreetActions(page, 'preflop', TC1_DATA.actions.preflop);
  // ... more steps ...
});
```
**Why?** Reads like a story. Anyone can understand what the test does.

---

## How to Run This Test

### Option 1: Run with headed browser (see what's happening)
```bash
npx playwright test tc1-example.spec.ts --headed
```
This opens a browser window and you can watch the test execute!

### Option 2: Run headless (faster, no UI)
```bash
npx playwright test tc1-example.spec.ts
```

### Option 3: Run with debug mode (step through)
```bash
npx playwright test tc1-example.spec.ts --debug
```

---

## What Happens When Test Runs

### Console Output You'll See:
```
================================================================================
🧪 RUNNING TC-1: 2P Simple - With Betting
================================================================================

📝 Setting up stack configuration...
  • SB: 500
  • BB: 1000
  • Ante: 1000
  • Players: Alice (SB): 47000, Bob (BB): 38000

🃏 PREFLOP:
  → Alice: call 1000
  → Bob: check

🃏 FLOP:
  → Bob: bet 5000
  → Alice: call 5000

🃏 TURN:
  → Bob: bet 10000
  → Alice: call 10000

🃏 RIVER:
  → Bob: check
  → Alice: check

🔄 Processing stack...

💰 Verifying pot calculations...
  • Main Pot: 33,000
    Eligible: Alice, Bob

💵 Total Pot: 33,000

🏆 Selecting winner: Alice

📊 Verifying final stacks:
  • Alice: 64,000
  • Bob: 21,000

================================================================================
✅ TC-1 COMPLETED SUCCESSFULLY
================================================================================
```

---

## Next Steps

To make this test work with your actual app:

1. **Update Selectors**: Replace placeholders with actual CSS selectors from your app
   - Example: `'[data-process-stack-focus]'` → Your actual button selector

2. **Add Navigation**: If your app has multiple screens, add navigation between them
   - Example: `await page.click('[data-next-street]');`

3. **Test It**: Run the test and see what breaks
   - Use `--headed` mode to watch what happens
   - Use `--debug` mode to step through

4. **Duplicate for Other TCs**: Once TC-1 works, copy the pattern for TC-2, TC-3, etc.

---

## Benefits of This Approach

✅ **Automated** - No manual clicking needed
✅ **Fast** - Runs in ~10-30 seconds
✅ **Reliable** - Same result every time
✅ **Catch Bugs** - If something breaks, test fails immediately
✅ **Documentation** - Test IS the documentation
✅ **Confidence** - Know your app works before deploying

---

## Questions?

- How do I find selectors? → Use browser DevTools (F12), inspect element
- What if my app is slow? → Increase `waitForTimeout` values
- Can I run all 40 tests? → Yes! Just create 40 test data objects
- How do I debug failures? → Use `--headed` and `--debug` flags

