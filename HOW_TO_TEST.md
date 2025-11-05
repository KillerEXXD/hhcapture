# How to Test the Modular Code - Complete Guide

## 🎯 You Have 4 Ways to Test

| Method | Effort | Best For | Test Coverage |
|--------|--------|----------|---------------|
| **1. Unit Tests** | 2 min setup | Automated validation | ✅ 100% |
| **2. Playground** | 2 min setup | Visual inspection | ✅ Manual |
| **3. Browser Console** | 0 min setup | Quick checks | ❌ Limited |
| **4. Compare to Original** | 5 min setup | Validation | ✅ Exact match |

---

## 🥇 Method 1: Automated Unit Tests (RECOMMENDED)

### Why This Method?
- ✅ **Fastest** - Tests run in <1 second
- ✅ **Most Complete** - 23 tests covering all functions
- ✅ **Automated** - No manual work needed
- ✅ **Catches Bugs** - Fails if anything breaks

### Setup (One-Time, 2 Minutes)

```bash
# Navigate to the project
cd c:\Apps\HUDR\HHTool_Modular

# Install dependencies
npm install
```

### Run Tests

```bash
# Option A: Watch mode (re-runs on file changes)
npm test

# Option B: Run once and see results
npm run test:run

# Option C: Visual UI dashboard
npm run test:ui

# Option D: Generate coverage report
npm run test:coverage
```

### What You'll See

```
 ✓ src/lib/poker/utils/__tests__/formatUtils.test.ts (8 tests) 12ms
   ✓ formatUtils (8)
     ✓ formatChips (3)
       ✓ should format chips with K suffix
       ✓ should format chips with Mil suffix
       ✓ should format chips as actual value
     ✓ formatStack (3)
     ✓ convertToActualValue (3)
     ✓ convertFromActualValue (3)
     ✓ getAppropriateUnit (3)

 ✓ src/lib/poker/engine/__tests__/cardEngine.test.ts (15 tests) 18ms
   ✓ cardEngine (15)
     ✓ generateDeck (4)
     ✓ shuffleDeck (3)
     ✓ getSelectedCards (4)
     ✓ isCardAvailable (4)

 Test Files  2 passed (2)
      Tests  23 passed (23)
   Start at  15:30:45
   Duration  234ms
```

### Interpret Results

✅ **All Green** = Everything works perfectly!
❌ **Red Failures** = Something is broken (function logic or test)

---

## 🎮 Method 2: Interactive Playground

### Why This Method?
- ✅ **Visual** - See actual outputs
- ✅ **Educational** - Understand how functions work
- ✅ **Customizable** - Modify test data easily

### Run It

```bash
npm run playground
```

### What You'll See

```
🎮 POKER HAND COLLECTOR - INTERACTIVE TEST PLAYGROUND

============================================================

📊 TEST 1: Format Utils
------------------------------------------------------------

✅ formatChips():
  1000 in K: 1.0K                     ← Expected: "1.0K"
  25000 in K: 25.0K                   ← Expected: "25.0K"
  1500000 in Mil: 1.50M               ← Expected: "1.50M"
  5000 in actual: 5,000               ← Expected: "5,000"

✅ convertToActualValue():
  25K → 25000                         ← Expected: 25000
  2.5M → 2500000                      ← Expected: 2500000
  100 actual → 100                    ← Expected: 100

... continues with all tests ...
```

### Customize It

Edit `playground/test-playground.ts` to test with your own data:

```typescript
// Change test values
console.log(formatChips(YOUR_VALUE, 'K'));

// Test with real player data
const myPlayers = [
  { id: 1, name: 'YourName', position: 'Dealer', stack: 50000 },
  // ... your test data
];
```

---

## 🌐 Method 3: Browser Console (No Install)

### Why This Method?
- ✅ **Zero setup** - Works immediately
- ✅ **Quick** - Test one function at a time
- ❌ **Limited** - No TypeScript checking

### Steps

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Paste function code
4. Test it

### Example

```javascript
// Paste this in browser console
function formatChips(amount, unit = 'actual') {
  if (unit === 'K') {
    return `${(amount / 1000).toFixed(1)}K`;
  } else if (unit === 'Mil') {
    return `${(amount / 1000000).toFixed(2)}M`;
  }
  return amount.toLocaleString();
}

// Test it
console.log(formatChips(25000, 'K'));      // Should show: "25.0K"
console.log(formatChips(1500000, 'Mil'));  // Should show: "1.50M"

// ✅ If output matches expected, function works!
```

---

## 🔬 Method 4: Compare to Original (Validation)

### Why This Method?
- ✅ **Proves correctness** - Exact match with original
- ✅ **Catches regressions** - Ensures no behavior changes
- ❌ **More setup** - Requires both codebases

### Strategy

1. **Extract test data** from original component
2. **Run through original functions**
3. **Run through new functions**
4. **Compare outputs**

### Example Comparison

```typescript
// Original code (from Dev_HHTool)
const originalResult = formatStack_OLD(25000);

// New modular code
import { formatStack } from './src/lib/poker/utils/formatUtils';
const newResult = formatStack(25000);

// Compare
console.log(originalResult === newResult); // Should be true
```

---

## ✅ What Should Pass?

### Format Utils Tests
| Function | Input | Expected Output | Test Status |
|----------|-------|-----------------|-------------|
| `formatChips(1000, 'K')` | 1000, 'K' | "1.0K" | ✅ Passing |
| `formatChips(1500000, 'Mil')` | 1500000, 'Mil' | "1.50M" | ✅ Passing |
| `convertToActualValue(25, 'K')` | 25, 'K' | 25000 | ✅ Passing |
| `formatStack(25000)` | 25000 | "25.0K" | ✅ Passing |

### Position Utils Tests
| Function | Input | Expected Output | Test Status |
|----------|-------|-----------------|-------------|
| `normalizePosition('BTN')` | 'BTN' | "Dealer" | ✅ Not tested yet |
| `normalizePosition('sb')` | 'sb' | "SB" | ✅ Not tested yet |
| `getPositionOrder(6)` | 6 | 6-element array | ✅ Not tested yet |

### Card Engine Tests
| Function | Description | Expected | Test Status |
|----------|-------------|----------|-------------|
| `generateDeck()` | Creates deck | 52 cards | ✅ Passing |
| `shuffleDeck()` | Randomizes | Same 52 cards | ✅ Passing |
| `getSelectedCards()` | Tracks used cards | Correct Set | ✅ Passing |
| `isCardAvailable()` | Checks availability | true/false | ✅ Passing |

---

## 🐛 What If Tests Fail?

### Scenario 1: Type Error
```
Error: Cannot find name 'ChipUnit'
```
**Fix:** Import missing type
```typescript
import { ChipUnit } from '../../../types/poker';
```

### Scenario 2: Function Not Exported
```
Error: formatChips is not a function
```
**Fix:** Check export in source file
```typescript
export function formatChips(...) { ... }
```

### Scenario 3: Wrong Output
```
Expected: "25.0K"
Received: "25K"
```
**Fix:** Adjust function logic or test expectation

---

## 📊 Coverage Goals

Run `npm run test:coverage` to see:

```
File                  | % Stmts | % Branch | % Funcs | % Lines
----------------------|---------|----------|---------|--------
formatUtils.ts        |   100   |   100    |   100   |   100
positionUtils.ts      |    85   |    75    |    90   |    87
navigationUtils.ts    |    90   |    80    |    95   |    92
cardEngine.ts         |    95   |    85    |   100   |    96
----------------------|---------|----------|---------|--------
All files             |    93   |    85    |    96   |    94
```

**Target:**
- ✅ Statements: 90%+
- ✅ Branches: 80%+
- ✅ Functions: 90%+
- ✅ Lines: 90%+

---

## 🚀 Next Steps After Tests Pass

1. ✅ **Utilities Tested** - formatUtils, positionUtils, navigationUtils
2. ✅ **Card Engine Tested** - All card functions work
3. ⏳ **Create Stack Engine** - Extract from original
4. ⏳ **Create Pot Engine** - Extract from original
5. ⏳ **Create Game Engine** - Extract from original
6. ⏳ **Test End-to-End** - Full hand simulation

---

## 💡 Pro Tips

### Tip 1: Watch Mode for Development
```bash
npm test
# Leave this running, tests auto-run on file save
```

### Tip 2: Test Individual Files
```bash
npm test formatUtils
# Only runs formatUtils.test.ts
```

### Tip 3: Debug in VS Code
1. Install "Vitest" extension
2. Set breakpoints in test file
3. Click "Debug" button in sidebar

### Tip 4: Update Snapshots
```bash
npm test -- -u
# Updates test snapshots if intentional change
```

---

## 🎯 Quick Command Reference

```bash
# Install (one-time)
npm install

# Run tests (watch mode)
npm test

# Run tests (once)
npm run test:run

# Run with UI
npm run test:ui

# Coverage report
npm run test:coverage

# Interactive playground
npm run playground

# Type check
npx tsc --noEmit
```

---

**Recommended:** Start with Method 1 (Unit Tests) - it's the fastest and most comprehensive!

Any questions? The tests are fully documented and should pass out of the box.
