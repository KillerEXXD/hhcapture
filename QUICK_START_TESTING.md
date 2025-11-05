# Quick Start: Testing the Modular Code

## 🚀 Option 1: Run Unit Tests (Recommended)

### Step 1: Install Dependencies
```bash
cd c:\Apps\HUDR\HHTool_Modular
npm install
```

### Step 2: Run Tests
```bash
# Run all tests (watch mode)
npm test

# Run tests once and exit
npm run test:run

# Run with UI dashboard
npm run test:ui

# Run with coverage report
npm run test:coverage
```

### What You'll See:
```
✓ formatUtils (8 tests)
  ✓ formatChips
    ✓ should format chips with K suffix
    ✓ should format chips with Mil suffix
    ✓ should format chips as actual value
  ✓ formatStack
    ✓ should auto-select K for thousands
    ✓ should auto-select Mil for millions
  ... and more

✓ cardEngine (15 tests)
  ✓ generateDeck
    ✓ should generate a 52-card deck
    ✓ should have no duplicate cards
  ✓ shuffleDeck
    ✓ should return a deck of same size
  ... and more

Test Files  2 passed (2)
     Tests  23 passed (23)
```

---

## 🎮 Option 2: Interactive Playground

### Step 1: Install Dependencies (if not done)
```bash
cd c:\Apps\HUDR\HHTool_Modular
npm install
```

### Step 2: Run Playground
```bash
npm run playground
```

### What You'll See:
```
🎮 POKER HAND COLLECTOR - INTERACTIVE TEST PLAYGROUND

============================================================

📊 TEST 1: Format Utils
------------------------------------------------------------

✅ formatChips():
  1000 in K: 1.0K
  25000 in K: 25.0K
  1500000 in Mil: 1.50M
  5000 in actual: 5,000

✅ convertToActualValue():
  25K → 25000
  2.5M → 2500000
  ... and more

🎲 TEST 2: Position Utils
------------------------------------------------------------
... all tests with visual output
```

---

## 🔍 Option 3: Manual Testing (No Install)

### Test in Node.js REPL

1. Open Node.js:
```bash
node
```

2. Copy and paste this code:
```javascript
// Manually copy the functions from formatUtils.ts
function formatChips(amount, unit = 'actual') {
  if (unit === 'K') {
    return `${(amount / 1000).toFixed(1)}K`;
  } else if (unit === 'Mil') {
    return `${(amount / 1000000).toFixed(2)}M`;
  }
  return amount.toLocaleString();
}

// Test it
console.log(formatChips(25000, 'K'));  // Should output: "25.0K"
console.log(formatChips(1500000, 'Mil'));  // Should output: "1.50M"
```

---

## 📊 Option 4: VS Code Testing Extension

### Step 1: Install VS Code Extension
- Open VS Code
- Install "Vitest" extension by ZixuanChen

### Step 2: See Tests in Sidebar
- Tests appear in the Testing sidebar
- Click ▶️ to run individual tests
- See results inline in code

---

## ✅ What to Test

### Format Utils
- ✅ Does `formatChips(25000, 'K')` return `"25.0K"`?
- ✅ Does `convertToActualValue(25, 'K')` return `25000`?
- ✅ Does `formatStack(1500000)` return `"1.50M"`?

### Position Utils
- ✅ Does `normalizePosition('BTN')` return `"Dealer"`?
- ✅ Does `inferPlayerPositions()` assign correct positions?
- ✅ Does `sortPlayersByPosition()` order correctly?

### Navigation Utils
- ✅ Does `getNextStage('preflop')` return `"flop"`?
- ✅ Does `getLevelSuffix('more')` return `"_moreAction"`?
- ✅ Does `createSectionKey('flop', 'base')` return `"flop_base"`?

### Card Engine
- ✅ Does `generateDeck()` create 52 unique cards?
- ✅ Does `shuffleDeck()` randomize the order?
- ✅ Does `getSelectedCards()` track all used cards?
- ✅ Does `isCardAvailable()` prevent duplicates?
- ✅ Does `getAvailableCardsForPlayer()` exclude used cards?

---

## 🎯 Expected Results

All tests should **PASS** ✅

If you see failures, it means:
1. The function has a bug
2. The test expectation is wrong
3. TypeScript types need adjustment

---

## 🐛 Troubleshooting

### "Cannot find module 'vitest'"
```bash
npm install
```

### "ts-node: command not found"
```bash
npm install -g ts-node
# OR
npx ts-node playground/test-playground.ts
```

### Tests fail with type errors
```bash
# Make sure TypeScript compiles
npx tsc --noEmit
```

---

## 📈 Coverage Report

After running `npm run test:coverage`, open:
```
coverage/index.html
```

You'll see:
- **Lines covered**: Should be 90%+
- **Functions covered**: Should be 85%+
- **Branches covered**: Should be 80%+

---

## 🎬 Next Steps

Once all tests pass:
1. ✅ **Format Utils** - Working correctly
2. ✅ **Position Utils** - Working correctly
3. ✅ **Navigation Utils** - Working correctly
4. ✅ **Card Engine** - Working correctly
5. ⏳ **Stack Engine** - TODO (extract from original)
6. ⏳ **Pot Engine** - TODO (extract from original)
7. ⏳ **Game Engine** - TODO (extract from original)

Then we can:
- Extract remaining business logic
- Create React hooks
- Build UI components
- Test full integration

---

**Recommended:** Start with **Option 1** (Unit Tests) for automated validation!
