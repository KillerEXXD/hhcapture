# HHTool Modular - Refactored Poker Hand Collector

This is a refactored, modular version of the PokerHandCollector component, designed for better maintainability, testability, and reusability.

## 🏗️ Project Structure

```
src/
├── types/poker/              # TypeScript type definitions
│   ├── card.types.ts         # Card, Deck, Suit, Rank types
│   ├── player.types.ts       # Player, Position, PlayerData types
│   ├── game.types.ts         # Game configuration and state types
│   ├── action.types.ts       # Action and validation types
│   ├── pot.types.ts          # Pot calculation types
│   └── index.ts              # Central export
│
├── lib/poker/                # Pure business logic (no React)
│   ├── engine/               # Core game engines
│   │   ├── cardEngine.ts     # Card management logic
│   │   ├── stackEngine.ts    # Stack calculation logic (TODO)
│   │   ├── potEngine.ts      # Pot calculation logic (TODO)
│   │   └── gameEngine.ts     # Game flow logic (TODO)
│   │
│   ├── validators/           # Validation functions (TODO)
│   │   ├── sectionValidator.ts
│   │   ├── preflopValidator.ts
│   │   └── communityCardValidator.ts
│   │
│   └── utils/                # Utility functions
│       ├── formatUtils.ts    # Chip formatting and display
│       ├── positionUtils.ts  # Position inference and ordering
│       └── navigationUtils.ts # Stage/level navigation helpers
│
├── hooks/poker/              # React hooks (TODO)
│   ├── useGameState.ts       # Central game state management
│   ├── usePokerEngine.ts     # Game engine wrapper
│   ├── usePotCalculation.ts  # Pot calculation wrapper
│   ├── useCardManagement.ts  # Card management wrapper
│   ├── useActionHandler.ts   # Action handling
│   └── useViewNavigation.ts  # Navigation logic
│
└── components/poker/         # React UI components (TODO)
    ├── PokerHandCollector/   # Main orchestrator
    ├── GameSetup/            # Setup screens
    ├── GameTable/            # Game table components
    ├── Cards/                # Card UI components
    ├── Actions/              # Action buttons
    ├── Navigation/           # Navigation panel
    ├── Modals/               # Modal dialogs
    └── Pots/                 # Pot display
```

## ✅ Completed

### Phase 1: Type System Foundation
- ✅ `card.types.ts` - Complete card type definitions
- ✅ `player.types.ts` - Player and position types
- ✅ `game.types.ts` - Game configuration and state
- ✅ `action.types.ts` - Action and validation types
- ✅ `pot.types.ts` - Pot calculation types

### Phase 2: Pure Business Logic (Partial)
- ✅ `formatUtils.ts` - Chip formatting functions
- ✅ `positionUtils.ts` - Position management
- ✅ `navigationUtils.ts` - Navigation helpers
- ✅ `cardEngine.ts` - Card management logic

## 🚧 In Progress

### Phase 2: Pure Business Logic (Remaining)
- ⏳ `stackEngine.ts` - Stack calculation logic
- ⏳ `potEngine.ts` - Pot calculation logic
- ⏳ `gameEngine.ts` - Game flow and processing
- ⏳ Validators (section, preflop, community cards)

## 📋 TODO

### Phase 3: Custom Hooks
- [ ] `useGameState.ts` - State management hook
- [ ] `usePokerEngine.ts` - Engine wrapper hook
- [ ] `usePotCalculation.ts` - Pot calculation hook
- [ ] `useCardManagement.ts` - Card management hook
- [ ] `useActionHandler.ts` - Action handling hook
- [ ] `useViewNavigation.ts` - Navigation hook

### Phase 4: UI Components
- [ ] `PokerHandCollector.tsx` - Main orchestrator (~300 lines)
- [ ] `StackSetupView.tsx` - Setup screen
- [ ] `GameTableView.tsx` - Game table layout
- [ ] `ActionRow.tsx` - Player action row
- [ ] `CardSelector.tsx` - Card selection UI
- [ ] `ActionButtons.tsx` - Action buttons
- [ ] Navigation, Modals, and other components

### Phase 5: Testing
- [ ] Unit tests for engines
- [ ] Unit tests for validators
- [ ] Unit tests for utilities
- [ ] Hook tests
- [ ] Component tests
- [ ] Integration tests

## 🎯 Key Design Principles

1. **Separation of Concerns**
   - Types are separated from logic
   - Logic is separated from UI
   - Pure functions are testable in isolation

2. **Pure Functions**
   - All engine and utility functions are pure (no side effects)
   - State is passed as parameters, never accessed directly
   - Enables easy unit testing

3. **Type Safety**
   - Comprehensive TypeScript types
   - Strict type checking enabled
   - Clear interfaces between layers

4. **Testability**
   - Pure functions are trivially testable
   - No React dependencies in business logic
   - Hooks can be tested with React testing library

5. **Reusability**
   - Engine logic can be used in other projects
   - UI components can be restyled
   - Hooks can be composed differently

## 📖 Usage Examples

### Using Card Engine

```typescript
import { generateDeck, shuffleDeck, getSelectedCards } from './lib/poker/engine/cardEngine';
import { Player, PlayerData, CommunityCards } from './types/poker';

// Generate and shuffle a deck
const deck = generateDeck();
const shuffled = shuffleDeck(deck);

// Check what cards are already selected
const selected = getSelectedCards(players, playerData, communityCards);

// Check if a card is available
const isAvailable = isCardAvailable('A', '♠', playerId, 1, players, playerData, communityCards, true);
```

### Using Format Utilities

```typescript
import { formatChips, convertToActualValue } from './lib/poker/utils/formatUtils';

// Format chip amounts
const display = formatChips(25000, 'K'); // "25.0K"

// Convert units to actual chips
const actual = convertToActualValue(25, 'K'); // 25000
```

### Using Position Utilities

```typescript
import { inferPlayerPositions, sortPlayersByPosition } from './lib/poker/utils/positionUtils';

// Auto-assign positions based on table size
const playersWithPositions = inferPlayerPositions(players);

// Sort players by position order
const sorted = sortPlayersByPosition(players);
```

## 🔄 Migration Path

This is a **parallel development** approach:
- Original code remains in `Dev_HHTool/` unchanged
- New modular code is developed in `HHTool_Modular/`
- Once complete, we can:
  - Replace the original with the new version
  - Or keep both for comparison
  - Or gradually merge pieces back

## 📝 Notes

- All engine functions are **pure** - no React hooks or side effects
- All functions have explicit TypeScript types
- Code is organized by **feature/domain** not by technical layer
- Each file has a clear, single responsibility

## 🚀 Next Steps

1. Complete stack engine (`stackEngine.ts`)
2. Complete pot engine (`potEngine.ts`)
3. Complete game engine (`gameEngine.ts`)
4. Add validators
5. Create custom hooks
6. Build UI components
7. Add comprehensive tests

---

**Status:** Phase 2 in progress (Pure Business Logic Extraction)
**Last Updated:** 2025
