# Quick Start Guide - HHTool Modular

## Current Status

**✅ Completion:** ~70%
**✅ Tests:** 183 passing
**✅ Development Server:** Working on port 3000

## Commands

### Development
```bash
npm run dev          # Start Vite dev server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Open Vitest UI
npm run test:coverage # Generate coverage report
```

### Type Checking
```bash
npx tsc --noEmit     # Check TypeScript errors
```

## Project Structure

```
src/
├── types/poker/           # TypeScript type definitions
├── lib/poker/
│   ├── utils/             # Utility functions
│   ├── engine/            # Core business logic engines
│   └── validators/        # Validation functions
├── hooks/                 # React hooks (NEW)
├── main.tsx              # React entry point
└── App.tsx               # Main app component
```

## What's Complete

### ✅ Business Logic (100%)
- Card Engine (24 tests)
- Stack Engine (44 tests)
- Pot Engine (45 tests)
- Game Engine
- Validators (53 tests)

### ✅ React Hooks (100%)
- `useGameState` - Central state management
- `usePokerEngine` - Game processing
- `usePotCalculation` - Pot calculations
- `useCardManagement` - Card handling
- `useActionHandler` - Action validation

### ✅ Development Environment (100%)
- Vite configured
- React installed
- TypeScript configured
- Tests passing

## What's Next

### UI Components (0%)
- StackSetupView
- GameTableView
- PlayerRow
- ActionButtons
- PotDisplay
- CardSelector
- Navigation
- Modals

## Using the Hooks

Example component structure:

```typescript
import { useGameState, usePokerEngine, usePotCalculation } from '@/hooks';

function MyComponent() {
  const [state, actions] = useGameState();
  const engine = usePokerEngine(state, actions);
  const pots = usePotCalculation(state, actions);

  // Use state and methods
  return <div>...</div>;
}
```

## Key Features

### Type Safety
All business logic is fully typed with TypeScript.

### Pure Functions
Core logic has no React dependencies - fully testable.

### Comprehensive Tests
183 tests covering all business logic:
- Format utils: 17 tests
- Card engine: 24 tests
- Stack engine: 44 tests
- Pot engine: 45 tests
- Validators: 53 tests

### Modern Dev Experience
- Hot Module Replacement (HMR)
- Fast builds with Vite
- Path aliases configured

## Development Workflow

1. **Start dev server:** `npm run dev`
2. **Make changes** in `src/`
3. **See changes instantly** (HMR)
4. **Run tests:** `npm test`
5. **Check types:** `npx tsc --noEmit`

## Testing Approach

- **Unit Tests:** Test individual functions
- **Integration Tests:** Test hooks with engines
- **E2E Tests:** (Planned) Test full workflows

## Documentation

- `FINAL_SESSION_SUMMARY.md` - Detailed session summary
- `SESSION_PROGRESS.md` - Progress tracking
- `PROGRESS_UPDATE.md` - Earlier updates
- `README.md` - Project overview

## Need Help?

Check the comprehensive documentation in:
- `FINAL_SESSION_SUMMARY.md` for detailed architecture
- Individual hook files for usage examples
- Test files for implementation examples

---

**Ready to build UI components!** 🚀
