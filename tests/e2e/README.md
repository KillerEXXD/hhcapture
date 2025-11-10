# E2E Tests with Playwright

## 🎬 Visual Testing - Watch Tests Run!

This folder contains end-to-end tests that you can **watch visually** in a real browser, just like in Playwright demos.

## 🚀 Quick Start

### Option 1: UI Mode (RECOMMENDED - Interactive Visual Interface)
```bash
npm run test:e2e:ui
```

This opens an interactive browser where you can:
- ✅ Click tests to run them
- ✅ Watch them execute in real-time
- ✅ Step through each action
- ✅ See console logs
- ✅ Pause and inspect

### Option 2: Headed Mode with Slow Motion
```bash
npm run test:e2e:headed
```

This runs tests in a visible browser window with 1-second delays between actions so you can watch everything happen.

### Option 3: Debug Mode (Step-by-Step)
```bash
npm run test:e2e:debug
```

Opens Playwright Inspector where you can:
- Step through each action one-by-one
- Inspect the page at any point
- Edit selectors and rerun

### Option 4: Headless (CI Mode)
```bash
npm run test:e2e
```

Runs tests in the background (no visual). Good for CI/CD.

## 📁 Test Files

### `folded-player-visibility.spec.ts`
Tests the fix for folded player visibility:
- ✅ **Test 1**: Folded player remains visible in Flop BASE with fold button highlighted
- ✅ **Test 2**: Folded player is hidden when moving to More Action 1
- ✅ **Test 3**: Visual keyboard navigation flow (watch cards being entered, actions clicked, etc.)

## 🎯 Watching Tests Visually

The tests are designed to be **watched**. Here's what you'll see:

1. **Browser opens** and navigates to your app
2. **"Create Flop" button clicks** - you'll see the UI change
3. **Cards get selected** - watch as Ace of Spades, King of Hearts, Queen of Diamonds are entered
4. **Tab key presses** - see focus move from card to card, then to player actions
5. **Fold button clicks** - watch the button get clicked
6. **Player stays visible** - verify the fix worked
7. **Screenshots are taken** automatically and saved to `tests/e2e/screenshots/`

## 📸 Screenshots

Tests automatically capture screenshots at key moments. Find them in:
```
tests/e2e/screenshots/
├── folded-player-in-flop-base.png
├── folded-player-hidden-in-more-action.png
└── keyboard-navigation-flow.png
```

## 🛠️ Configuration

See `playwright.config.ts` in the root directory for configuration options:
- Timeouts
- Browser settings
- Video recording
- Screenshot settings
- Dev server auto-start

## 🔧 Troubleshooting

### Dev server not starting?
The tests automatically start `npm run dev` before running. If you get errors:
1. Make sure port 3001 is available
2. Or start the dev server manually in another terminal:
   ```bash
   npm run dev
   ```

### Tests failing?
Run with debug mode to step through:
```bash
npm run test:e2e:debug
```

### Can't see what's happening?
Use headed mode with slow motion:
```bash
npm run test:e2e:headed
```

Or adjust `slowmo` in the command:
```bash
npx playwright test --headed --slowmo=2000  # 2 seconds between actions
```

## 📚 Learn More

- [Playwright Documentation](https://playwright.dev)
- [Playwright UI Mode](https://playwright.dev/docs/test-ui-mode)
- [Playwright Inspector](https://playwright.dev/docs/debug)
