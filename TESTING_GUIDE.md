# Testing Guide for HHTool Modular

This guide explains how to test the new modular structure to ensure all features work correctly.

## 🎯 Testing Approaches

We'll use **3 complementary testing strategies**:

1. **Unit Tests** - Test individual functions in isolation
2. **Integration Tests** - Test how functions work together
3. **Interactive Playground** - Manual testing in a browser/console

---

## 1️⃣ Unit Testing with Jest/Vitest

### Setup (Choose one)

#### Option A: Using Vitest (Recommended for Vite projects)
```bash
cd c:\Apps\HUDR\HHTool_Modular
npm init -y
npm install --save-dev vitest @vitest/ui
npm install --save-dev @types/node
```

#### Option B: Using Jest
```bash
cd c:\Apps\HUDR\HHTool_Modular
npm init -y
npm install --save-dev jest ts-jest @types/jest
npm install --save-dev typescript
```

### Example Unit Test Structure

Create test files alongside the source:

```
src/lib/poker/utils/
├── formatUtils.ts
├── formatUtils.test.ts      # Unit tests
├── positionUtils.ts
├── positionUtils.test.ts    # Unit tests
└── ...
```

### Running Tests

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

Then run:
```bash
npm test                  # Run all tests
npm run test:ui           # Open UI dashboard
npm run test:coverage     # Check code coverage
```

---

## 2️⃣ Interactive Playground (Browser/Node)

### Setup Node.js Playground

I'll create a simple Node.js script that lets you test functions interactively.

**Location:** `playground/test-playground.js`

Run with:
```bash
node playground/test-playground.js
```

### Setup Browser Playground

I'll create an HTML page where you can test functions visually in the browser.

**Location:** `playground/index.html`

Open in browser to interact with functions.

---

## 3️⃣ Comparison Testing (Old vs New)

Test that new modular functions produce the **exact same results** as the original code.

### Strategy:
1. Extract sample data from original component
2. Run through old functions
3. Run through new functions
4. Compare outputs

I'll create a comparison test harness.

---

## 📋 What Should You Test?

### Format Utils
- ✅ Chip formatting (1000 → "1.0K", 1000000 → "1.00M")
- ✅ Unit conversion (25K → 25000, 2.5M → 2500000)
- ✅ Appropriate unit selection

### Position Utils
- ✅ Position normalization ("BTN" → "Dealer", "sb" → "SB")
- ✅ Position order for different table sizes
- ✅ Auto-inference of positions
- ✅ Sorting players by position

### Navigation Utils
- ✅ Stage/level conversions
- ✅ Section key creation/parsing
- ✅ Navigation (next/previous stage/level)
- ✅ Display names

### Card Engine
- ✅ Deck generation (52 cards, no duplicates)
- ✅ Deck shuffling (randomness)
- ✅ Card availability checking
- ✅ Getting available cards for player
- ✅ Random card assignment
- ✅ Community card validation

---

## 🔍 Test Coverage Goals

| Module | Target Coverage |
|--------|----------------|
| Utilities | 90%+ |
| Card Engine | 85%+ |
| Stack Engine | 80%+ |
| Pot Engine | 80%+ |
| Game Engine | 75%+ |
| Validators | 85%+ |

---

## 🚀 Quick Start Testing

I'll create ready-to-run test files for you:

1. **Unit tests** - Automated testing
2. **Playground** - Interactive testing
3. **Comparison tests** - Verify against original

Choose your preferred method and I'll set it up!

---

## 📝 Testing Checklist

Before considering a module "complete":

- [ ] All functions have unit tests
- [ ] Edge cases are covered
- [ ] Error handling is tested
- [ ] TypeScript types are correct
- [ ] Functions work with real data from original component
- [ ] Performance is acceptable
- [ ] Documentation is clear

---

## 🎨 Visual Testing (For UI Components)

When we get to UI components, we'll add:

- **Storybook** - Component visual testing
- **React Testing Library** - Component behavior testing
- **Cypress/Playwright** - End-to-end testing

---

**Next:** Choose your testing approach and I'll set it up for you!
