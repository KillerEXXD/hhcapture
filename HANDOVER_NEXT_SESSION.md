# 🔄 HANDOVER DOCUMENT - Next Session Continuation

**Created:** 2025-11-03
**Status:** Refactoring 25% Complete - Ready for Next Phase
**Current Working Directory:** `c:\Apps\HUDR\HHTool_Modular\`

---

## 📊 Current Progress Summary

### ✅ COMPLETED (25% of total work)

#### 1. Type System Foundation (100% Complete)
**Location:** `src/types/poker/`

All TypeScript types defined:
- `card.types.ts` - Card, Rank, Suit, Deck, CommunityCards
- `player.types.ts` - Player, Position, PlayerData
- `game.types.ts` - Stage, ActionLevel, SectionKey, GameConfig
- `action.types.ts` - ActionType, PlayerAction, ValidationResult
- `pot.types.ts` - Pot, PotPlayer, DeadMoney, PotStructure
- `index.ts` - Central export

**Files:** 6 files, ~350 lines total

---

#### 2. Utility Functions (100% Complete)
**Location:** `src/lib/poker/utils/`

- **formatUtils.ts** (76 lines) - Chip formatting, unit conversions
  - `formatChips()`, `formatStack()`, `convertToActualValue()`, etc.
  - **Tests:** 17 tests passing ✅

- **positionUtils.ts** (198 lines) - Position handling
  - `normalizePosition()`, `inferPlayerPositions()`, `sortPlayersByPosition()`
  - **Tests:** Manual validation (not yet unit tested)

- **navigationUtils.ts** (190 lines) - Stage/level navigation
  - `getLevelSuffix()`, `getNextStage()`, `createSectionKey()`, etc.
  - **Tests:** Manual validation (not yet unit tested)

---

#### 3. Card Engine (100% Complete)
**Location:** `src/lib/poker/engine/cardEngine.ts` (217 lines)

Functions:
- `generateDeck()` - Create 52-card deck
- `shuffleDeck()` - Fisher-Yates shuffle
- `getSelectedCards()` - Track all used cards
- `isCardAvailable()` - Check card availability
- `assignRandomCardsToPlayer()` - Auto-assign cards
- `cardToString()`, `parseCardString()` - Serialization

**Tests:** 24 tests passing ✅

---

#### 4. Stack Engine (100% Complete) 🆕
**Location:** `src/lib/poker/engine/stackEngine.ts` (449 lines)

Functions:
- `calculateCurrentStack()` - Current stack at any section
- `calculateStackAtSectionStart()` - Historical stack lookup
- `getAlreadyContributed()` - Contribution tracking
- `getPayoffAmount()` - Amount to subtract from stack
- `hasPlayerFolded()` - Check fold status
- `getActivePlayersForSection()` - Filter active players
- Helper functions: `getLevelSuffix()`, `getSuffixLevel()`, `normalizePosition()`

**Tests:** 44 tests passing ✅

---

#### 5. Testing Infrastructure (100% Complete)

**CLI Testing:**
- Vitest setup complete
- 85 total tests passing (17 + 24 + 44)
- Coverage reporting available
- Commands: `npm test`, `npm run test:run`, `npm run test:coverage`

**Browser Testing:**
- Visual test dashboard at `playground/browser/index.html`
- 35 browser tests running
- Interactive testing playground
- No installation required (just double-click HTML)

**Test Files Created:**
- `formatUtils.test.ts` - 17 tests
- `cardEngine.test.ts` - 24 tests
- `stackEngine.test.ts` - 44 tests

---

### ❌ REMAINING WORK (75% of total)

This is what needs to be completed in the next session:

---

## 🎯 PHASE 1: Extract Pot Engine

**Priority:** CRITICAL (blocks game engine)
**Estimated Effort:** 3-4 hours
**Complexity:** HIGH (complex pot splitting logic)

### Files to Create:

#### 1. `src/lib/poker/engine/potEngine.ts` (~600 lines)

**Source:** Lines 1003-1800 of `c:\Apps\HUDR\Dev_HHTool\src\components\PokerHandCollector.tsx`

**Functions to Extract:**

```typescript
export function gatherContributions(
  players: Player[],
  playerData: PlayerData,
  stage: Stage,
  level: ActionLevel,
  contributedAmounts: ContributedAmounts,
  processedSections: ProcessedSections,
  sectionStacks: SectionStacks,
  stackData: StackData,
  onlyCurrentSection: boolean = false
): Contribution[]

export function calculateDeadMoney(
  stage: Stage,
  contributions: Contribution[]
): DeadMoneyResult

export function createPots(
  contributions: Contribution[],
  deadMoney: DeadMoneyResult,
  previousStreetPot: number,
  stage: Stage,
  level: ActionLevel
): PotInfo

export function calculatePotsForBettingRound(
  stage: Stage,
  level: ActionLevel,
  players: Player[],
  playerData: PlayerData,
  contributedAmounts: ContributedAmounts,
  processedSections: ProcessedSections,
  sectionStacks: SectionStacks,
  stackData: StackData,
  previousStreetPot: number
): PotInfo

export function getPreviousRoundInfo(
  playerId: number,
  playerData: PlayerData,
  currentStage: Stage,
  currentLevel: ActionLevel,
  defaultUnit: ChipUnit
): PreviousRoundInfo | null
```

**Key Complexity Points:**
- Blind/ante handling in preflop
- Side pot creation based on all-in players
- Contribution tracking across multiple action levels
- Dead money calculation (folded blinds, folded bets, antes)
- Previous round info for UI display

**Types Needed (add to types/poker/pot.types.ts):**
```typescript
export type Contribution = {
  playerId: number;
  playerName: string;
  position: Position;
  totalContributed: number;
  contributions: {
    base: number;
    more: number;
    more2: number;
  };
  postedSB: number;
  postedBB: number;
  postedAnte: number;
  isFolded: boolean;
  isAllIn: boolean;
  currentStack: number;
};

export type DeadMoneyResult = {
  total: number;
  ante: number;
  foldedBlinds: number;
  foldedBets: number;
};

export type PotInfo = {
  mainPot: Pot;
  sidePots: Pot[];
  totalPot: number;
  deadMoney: number;
  deadMoneyBreakdown: DeadMoneyResult;
  hasZeroContributor: boolean;
  zeroContributors: Array<{ id: number; name: string; position: Position }>;
  bettingRoundStatus?: BettingRoundStatus;
};

export type PreviousRoundInfo = {
  stageName: string;
  levelName: string;
  action: string;
  amount: number;
  sectionKey: string;
};

export type ContributedAmounts = {
  [sectionKey: string]: {
    [playerId: number]: number;
  };
};

export type ProcessedSections = {
  [sectionKey: string]: boolean;
};

export type BettingRoundStatus = {
  complete: boolean;
  reason?: string;
  details?: any;
};
```

#### 2. `src/lib/poker/engine/__tests__/potEngine.test.ts` (~500 lines)

**Test Cases to Write:**

```typescript
describe('potEngine', () => {
  describe('gatherContributions', () => {
    it('should gather preflop base contributions including blinds')
    it('should gather contributions up to specified level')
    it('should handle onlyCurrentSection flag correctly')
    it('should mark folded players correctly')
    it('should mark all-in players correctly')
    it('should exclude ante from BB contribution')
  });

  describe('calculateDeadMoney', () => {
    it('should calculate ante as dead money')
    it('should calculate folded blinds as dead')
    it('should calculate folded bets as dead')
    it('should handle preflop folded SB/BB correctly')
  });

  describe('createPots', () => {
    it('should create single main pot when no all-ins')
    it('should create side pots for all-in players')
    it('should add dead money to main pot')
    it('should carry forward previous street pot')
    it('should calculate pot percentages correctly')
    it('should handle multiple all-ins at different levels')
    it('should exclude lower contributors from higher pots')
  });

  describe('calculatePotsForBettingRound', () => {
    it('should orchestrate full pot calculation pipeline')
    it('should handle working copies correctly')
    it('should return complete pot info structure')
  });

  describe('getPreviousRoundInfo', () => {
    it('should find most recent action from previous rounds')
    it('should return null for first section')
    it('should skip "no action" entries')
  });
});
```

**Minimum:** 30 tests
**Target:** 50+ tests for comprehensive coverage

---

## 🎯 PHASE 2: Extract Game Engine

**Priority:** CRITICAL (core orchestration logic)
**Estimated Effort:** 4-5 hours
**Complexity:** VERY HIGH (orchestrates entire game flow)

### Files to Create:

#### 1. `src/lib/poker/engine/gameEngine.ts` (~800 lines)

**Source:** Lines 2000-3200 of `c:\Apps\HUDR\Dev_HHTool\src\components\PokerHandCollector.tsx`

**Functions to Extract:**

```typescript
export function processStackSynchronous(
  sectionKey: SectionKey,
  players: Player[],
  playerData: PlayerData,
  stackData: StackData,
  contributedAmounts: ContributedAmounts,
  processedSections: ProcessedSections,
  sectionStacks: SectionStacks
): ProcessStackResult

export function processStackCascade(
  startingSection: SectionKey,
  players: Player[],
  playerData: PlayerData,
  stackData: StackData
): CascadeResult

export function checkBettingRoundStatus(
  contributions: Contribution[]
): BettingRoundStatus

export function checkBettingRoundComplete(
  stage: Stage,
  level: ActionLevel,
  players: Player[],
  playerData: PlayerData
): BettingRoundCompletionStatus
```

**Key Complexity Points:**
- Stack cascade processing (processes all sections in order)
- Contribution calculation per section
- Integration with stackEngine
- Working copy management (avoids React state updates mid-calculation)
- Section dependency handling (base → more → more2)

**Types Needed (add to types/poker/game.types.ts):**
```typescript
export type ProcessStackResult = {
  sectionKey: SectionKey;
  current: { [playerId: number]: number };
  updated: { [playerId: number]: number };
  contributions: { [playerId: number]: number };
  success: boolean;
};

export type CascadeResult = {
  sectionStacks: SectionStacks;
  contributedAmounts: ContributedAmounts;
  processedSections: ProcessedSections;
  processedCount: number;
  success: boolean;
};

export type StackData = {
  anteOrder: 'BB First' | 'Ante First';
  bigBlind: number;
  smallBlind: number;
  ante: number;
};
```

#### 2. `src/lib/poker/engine/__tests__/gameEngine.test.ts` (~600 lines)

**Test Cases to Write:**

```typescript
describe('gameEngine', () => {
  describe('processStackSynchronous', () => {
    it('should process single section stack calculation')
    it('should handle preflop base with blinds')
    it('should handle all-in players')
    it('should calculate contributions correctly')
    it('should update sectionStacks structure')
  });

  describe('processStackCascade', () => {
    it('should process sections in order')
    it('should handle dependencies between sections')
    it('should return working copies')
    it('should not mutate input data')
  });

  describe('checkBettingRoundStatus', () => {
    it('should detect complete betting round')
    it('should detect incomplete betting round')
    it('should handle all-folded scenario')
  });

  describe('checkBettingRoundComplete', () => {
    it('should validate betting round completion')
    it('should check all players have acted')
    it('should handle more action levels')
  });
});
```

**Minimum:** 25 tests
**Target:** 40+ tests

---

## 🎯 PHASE 3: Extract Validators

**Priority:** HIGH (validation logic scattered throughout)
**Estimated Effort:** 2-3 hours
**Complexity:** MEDIUM

### Files to Create:

#### 1. `src/lib/poker/validators/sectionValidator.ts` (~200 lines)

**Source:** Lines 690-890 of original

```typescript
export function validateSectionBeforeProcessing(
  sectionKey: SectionKey,
  players: Player[],
  playerData: PlayerData
): ValidationResult

export function validatePlayerActions(
  playerId: number,
  playerData: PlayerData,
  stage: Stage,
  suffix: ActionSuffix
): ValidationResult

export function validateAmounts(
  playerId: number,
  playerData: PlayerData,
  stage: Stage,
  suffix: ActionSuffix
): ValidationResult
```

#### 2. `src/lib/poker/validators/preflopValidator.ts` (~150 lines)

**Source:** Lines 7025-7082 of original

```typescript
export function validatePreFlopBase(
  players: Player[],
  playerData: PlayerData
): ValidationResult

export function validatePlayerCards(
  playerId: number,
  playerData: PlayerData
): ValidationResult

export function autoFoldNoActionPlayers(
  players: Player[],
  playerData: PlayerData
): number[] // Returns array of folded player IDs
```

#### 3. `src/lib/poker/validators/communityCardValidator.ts` (~100 lines)

**Source:** Already partially in cardEngine.ts

```typescript
export function validateCommunityCards(
  stage: Stage,
  communityCards: CommunityCards
): ValidationResult

export function validateCommunityCardsForStage(
  stage: Stage,
  communityCards: CommunityCards
): boolean
```

#### 4. `src/lib/poker/validators/__tests__/` (~300 lines total)

Tests for all validators.

---

## 🎯 PHASE 4: Set Up Vite + React App

**Priority:** CRITICAL (need working app)
**Estimated Effort:** 2-3 hours
**Complexity:** MEDIUM

### Steps:

1. **Initialize Vite React App**
```bash
cd c:\Apps\HUDR\HHTool_Modular
npm install vite @vitejs/plugin-react react react-dom --save-dev
npm install --save-dev @types/react @types/react-dom
```

2. **Create Vite Config**
Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
});
```

3. **Update package.json scripts**
Add to existing scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    // ... keep existing test scripts
  }
}
```

4. **Create index.html**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Poker Hand Collector - Modular</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

5. **Create src/main.tsx**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

6. **Create src/App.tsx** (minimal)
```typescript
import React from 'react';
import { PokerHandCollector } from './components/PokerHandCollector';

function App() {
  return (
    <div className="App">
      <PokerHandCollector />
    </div>
  );
}

export default App;
```

---

## 🎯 PHASE 5: Create React Hooks

**Priority:** HIGH (state management layer)
**Estimated Effort:** 3-4 hours
**Complexity:** MEDIUM-HIGH

### Files to Create:

#### 1. `src/hooks/useGameState.ts` (~200 lines)

Consolidates all useState calls from original component:

```typescript
export function useGameState() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerData, setPlayerData] = useState<PlayerData>({});
  const [stackData, setStackData] = useState<StackData>({...});
  const [communityCards, setCommunityCards] = useState<CommunityCards>({...});
  const [currentView, setCurrentView] = useState<string>('stack');
  const [sectionStacks, setSectionStacks] = useState<SectionStacks>({});
  const [contributedAmounts, setContributedAmounts] = useState<ContributedAmounts>({});
  const [processedSections, setProcessedSections] = useState<ProcessedSections>({});
  const [potsByStage, setPotsByStage] = useState<any>({});
  // ... all other state

  return {
    // State
    players,
    playerData,
    stackData,
    communityCards,
    currentView,
    sectionStacks,
    contributedAmounts,
    processedSections,
    potsByStage,
    // Setters
    setPlayers,
    setPlayerData,
    // ... etc
  };
}
```

#### 2. `src/hooks/usePokerEngine.ts` (~150 lines)

Wraps game engine logic:

```typescript
export function usePokerEngine(
  players: Player[],
  playerData: PlayerData,
  stackData: StackData
) {
  const processSection = useCallback((sectionKey: SectionKey) => {
    return processStackSynchronous(
      sectionKey,
      players,
      playerData,
      stackData,
      // ... other params
    );
  }, [players, playerData, stackData]);

  const processCascade = useCallback((startingSection: SectionKey) => {
    return processStackCascade(
      startingSection,
      players,
      playerData,
      stackData
    );
  }, [players, playerData, stackData]);

  return {
    processSection,
    processCascade,
  };
}
```

#### 3. `src/hooks/usePotCalculation.ts` (~100 lines)

Wraps pot engine:

```typescript
export function usePotCalculation(
  players: Player[],
  playerData: PlayerData,
  contributedAmounts: ContributedAmounts,
  processedSections: ProcessedSections,
  sectionStacks: SectionStacks,
  stackData: StackData
) {
  const calculatePots = useCallback((
    stage: Stage,
    level: ActionLevel,
    previousStreetPot: number = 0
  ) => {
    return calculatePotsForBettingRound(
      stage,
      level,
      players,
      playerData,
      contributedAmounts,
      processedSections,
      sectionStacks,
      stackData,
      previousStreetPot
    );
  }, [players, playerData, contributedAmounts, processedSections, sectionStacks, stackData]);

  return { calculatePots };
}
```

#### 4. `src/hooks/useCardManagement.ts` (~150 lines)

Wraps card engine:

```typescript
export function useCardManagement(
  players: Player[],
  playerData: PlayerData,
  communityCards: CommunityCards
) {
  const deck = useMemo(() => generateDeck(), []);
  const shuffledDeck = useMemo(() => shuffleDeck(deck), [deck]);

  const selectedCards = useMemo(() => {
    return getSelectedCards(players, playerData, communityCards);
  }, [players, playerData, communityCards]);

  const checkCardAvailable = useCallback((
    rank: Rank,
    suit: Suit,
    playerId: number,
    cardNumber: number,
    isPlayerCard: boolean
  ) => {
    return isCardAvailable(
      rank,
      suit,
      playerId,
      cardNumber,
      players,
      playerData,
      communityCards,
      isPlayerCard
    );
  }, [players, playerData, communityCards]);

  return {
    deck,
    shuffledDeck,
    selectedCards,
    checkCardAvailable,
  };
}
```

#### 5. `src/hooks/useActionHandler.ts` (~200 lines)

Handles player action updates:

```typescript
export function useActionHandler(
  playerData: PlayerData,
  setPlayerData: (data: PlayerData) => void
) {
  const updatePlayerAction = useCallback((
    playerId: number,
    stage: Stage,
    suffix: ActionSuffix,
    action: ActionType,
    amount?: number,
    unit?: ChipUnit
  ) => {
    setPlayerData({
      ...playerData,
      [playerId]: {
        ...playerData[playerId],
        [`${stage}${suffix}_action`]: action,
        [`${stage}${suffix}_amount`]: amount?.toString(),
        [`${stage}${suffix}_unit`]: unit,
      },
    });
  }, [playerData, setPlayerData]);

  return { updatePlayerAction };
}
```

---

## 🎯 PHASE 6: Create UI Components

**Priority:** CRITICAL (user interface)
**Estimated Effort:** 5-6 hours
**Complexity:** HIGH

### Component Structure:

```
src/components/
├── PokerHandCollector/
│   ├── index.tsx              (Main container - 200 lines)
│   ├── StackSetupView.tsx     (Stack setup - 300 lines)
│   ├── GameTableView.tsx      (Game table - 400 lines)
│   └── PotDisplay.tsx         (Refactored PotCalculationUnifiedView - 400 lines)
├── Player/
│   ├── PlayerRow.tsx          (Single player row - 150 lines)
│   ├── ActionRow.tsx          (Action inputs - 200 lines)
│   └── PlayerCard.tsx         (Card selector - 100 lines)
├── Cards/
│   ├── CardSelector.tsx       (Card dropdown - 150 lines)
│   ├── CommunityCards.tsx     (Community card display - 200 lines)
│   └── CardDisplay.tsx        (Single card - 50 lines)
├── Navigation/
│   ├── StageNavigation.tsx    (Stage tabs - 100 lines)
│   └── MoreActionButtons.tsx  (More action controls - 100 lines)
└── Shared/
    ├── Button.tsx             (Reusable button - 50 lines)
    ├── Input.tsx              (Reusable input - 50 lines)
    └── Dropdown.tsx           (Reusable dropdown - 50 lines)
```

### Priority Order:

1. **PokerHandCollector/index.tsx** - Main container (wire hooks together)
2. **StackSetupView.tsx** - Stack setup screen
3. **GameTableView.tsx** - Main game view
4. **PotDisplay.tsx** - Refactored pot display
5. All other components as needed

---

## 🎯 PHASE 7: PotCalculationUnifiedView Refactor

**Priority:** HIGH (complex component)
**Estimated Effort:** 2-3 hours
**Complexity:** MEDIUM

### Source File:
`c:\Apps\HUDR\Dev_HHTool\src\components\PotCalculationUnifiedView.jsx` (564 lines)

### Refactoring Steps:

1. **Convert to TypeScript**
   - Rename to `.tsx`
   - Add proper types for all props
   - Add types for state

2. **Extract Logic to Hooks**
   - Section expansion logic → custom hook
   - Pot display logic → custom hook

3. **Break into Smaller Components**
   ```
   PotDisplay/
   ├── index.tsx              (Container)
   ├── SectionHeader.tsx      (Collapsible section header)
   ├── PotSummary.tsx         (Main/side pot display)
   ├── PlayerContribution.tsx (Individual player info)
   └── BettingHistory.tsx     (Previous round info)
   ```

4. **Use Pot Engine Functions**
   - Remove duplicate pot calculation logic
   - Use potEngine functions instead
   - Purely display-focused

---

## 📁 File Organization Reference

### Current Structure:
```
c:\Apps\HUDR\HHTool_Modular\
├── src/
│   ├── types/poker/          ✅ COMPLETE
│   ├── lib/poker/
│   │   ├── utils/            ✅ COMPLETE
│   │   └── engine/
│   │       ├── cardEngine.ts       ✅ COMPLETE
│   │       ├── stackEngine.ts      ✅ COMPLETE
│   │       ├── potEngine.ts        ❌ TODO (PHASE 1)
│   │       └── gameEngine.ts       ❌ TODO (PHASE 2)
│   ├── validators/           ❌ TODO (PHASE 3)
│   ├── hooks/                ❌ TODO (PHASE 5)
│   ├── components/           ❌ TODO (PHASE 6)
│   ├── App.tsx               ❌ TODO (PHASE 4)
│   └── main.tsx              ❌ TODO (PHASE 4)
├── playground/
│   ├── browser/              ✅ COMPLETE (35 tests)
│   └── test-playground.ts    ✅ COMPLETE
├── package.json              ✅ COMPLETE (needs Vite deps)
├── tsconfig.json             ✅ COMPLETE
├── vitest.config.ts          ✅ COMPLETE
├── vite.config.ts            ❌ TODO (PHASE 4)
└── index.html                ❌ TODO (PHASE 4)
```

---

## 🧪 Testing Strategy

### Test Coverage Goals:

| Module | Unit Tests | Integration Tests | Total Target |
|--------|-----------|-------------------|--------------|
| Format Utils | 17 ✅ | - | 17 ✅ |
| Card Engine | 24 ✅ | - | 24 ✅ |
| Stack Engine | 44 ✅ | - | 44 ✅ |
| **Pot Engine** | 30+ ❌ | 10+ ❌ | **40+** |
| **Game Engine** | 25+ ❌ | 15+ ❌ | **40+** |
| **Validators** | 20+ ❌ | 5+ ❌ | **25+** |
| **Hooks** | 15+ ❌ | 10+ ❌ | **25+** |
| **Components** | 20+ ❌ | 20+ ❌ | **40+** |
| **E2E** | - | 10+ ❌ | **10+** |
| **TOTAL** | **85 ✅ + 110+ ❌** | **70+ ❌** | **265+** |

### Test Execution Order:

1. Run existing tests: `npm run test:run` (should show 85 passing)
2. Add pot engine tests after extraction
3. Add game engine tests after extraction
4. Add validator tests
5. Add hook tests (may need @testing-library/react-hooks)
6. Add component tests (@testing-library/react)
7. Add integration tests
8. Add E2E tests (optional, using Playwright or Cypress)

---

## 🔧 Development Workflow

### Recommended Session Flow:

```bash
# 1. Start fresh session
cd c:\Apps\HUDR\HHTool_Modular

# 2. Verify current tests still pass
npm run test:run
# Should show: 85 tests passing ✅

# 3. Work on Phase 1 (Pot Engine)
# - Create potEngine.ts
# - Create potEngine.test.ts
# - Run tests: npm run test:run

# 4. Work on Phase 2 (Game Engine)
# - Create gameEngine.ts
# - Create gameEngine.test.ts
# - Run tests: npm run test:run

# 5. Work on Phase 3 (Validators)
# - Create validator files
# - Create validator tests
# - Run tests: npm run test:run

# 6. Work on Phase 4 (Vite Setup)
# - Install Vite dependencies
# - Create vite.config.ts
# - Create index.html, main.tsx, App.tsx
# - Test: npm run dev

# 7. Work on Phase 5 (Hooks)
# - Create hooks
# - Create hook tests
# - Run tests: npm run test:run

# 8. Work on Phase 6 (Components)
# - Create components
# - Create component tests
# - Test in browser: npm run dev

# 9. Final validation
npm run test:run    # All tests passing
npm run dev         # App works in browser
```

---

## 🚨 Critical Notes

### DO NOT MODIFY:
- ❌ `c:\Apps\HUDR\Dev_HHTool\` - Original app stays untouched
- ❌ Existing test files (formatUtils.test.ts, cardEngine.test.ts, stackEngine.test.ts)
- ❌ Type definitions (unless adding new types)

### SAFE TO MODIFY:
- ✅ `c:\Apps\HUDR\HHTool_Modular\` - All files here
- ✅ package.json (add dependencies as needed)
- ✅ Documentation files (*.md)

### Key Dependencies to Install:

```bash
# React + Vite (for PHASE 4)
npm install vite @vitejs/plugin-react react react-dom
npm install --save-dev @types/react @types/react-dom

# Testing libraries (if not already installed)
npm install --save-dev @testing-library/react @testing-library/react-hooks
npm install --save-dev @testing-library/jest-dom @testing-library/user-event

# Optional: E2E testing
npm install --save-dev playwright
# or
npm install --save-dev cypress
```

---

## 📊 Progress Tracking

### Checklist for Next Session:

- [ ] **PHASE 1:** Pot Engine extraction + tests (40+ tests)
- [ ] **PHASE 2:** Game Engine extraction + tests (40+ tests)
- [ ] **PHASE 3:** Validators extraction + tests (25+ tests)
- [ ] **PHASE 4:** Vite + React setup (`npm run dev` works)
- [ ] **PHASE 5:** React hooks creation + tests (25+ tests)
- [ ] **PHASE 6:** UI components creation + tests (40+ tests)
- [ ] **PHASE 7:** PotCalculationUnifiedView refactor
- [ ] **PHASE 8:** Final integration + E2E tests (10+ tests)
- [ ] **PHASE 9:** Documentation updates
- [ ] **PHASE 10:** Verify `npm run dev` shows working poker app

### Success Criteria:

1. ✅ All tests passing (target: 265+ tests)
2. ✅ `npm run dev` launches working app
3. ✅ App has feature parity with original
4. ✅ All business logic extracted to engines
5. ✅ Clean component architecture
6. ✅ Type-safe throughout
7. ✅ Well-documented code

---

## 🎯 Immediate Next Steps (Priority Order)

When you start the next session, execute in this exact order:

### Step 1: Verify Current State (5 minutes)
```bash
cd c:\Apps\HUDR\HHTool_Modular
npm run test:run
# Confirm: 85 tests passing ✅
```

### Step 2: Extract Pot Engine (3-4 hours)
1. Read lines 1003-1800 of PokerHandCollector.tsx
2. Create `src/lib/poker/engine/potEngine.ts`
3. Add needed types to `src/types/poker/pot.types.ts`
4. Create `src/lib/poker/engine/__tests__/potEngine.test.ts`
5. Write 40+ tests
6. Run: `npm run test:run` (should show 125+ tests passing)

### Step 3: Extract Game Engine (4-5 hours)
1. Read lines 2000-3200 of PokerHandCollector.tsx
2. Create `src/lib/poker/engine/gameEngine.ts`
3. Add needed types to `src/types/poker/game.types.ts`
4. Create `src/lib/poker/engine/__tests__/gameEngine.test.ts`
5. Write 40+ tests
6. Run: `npm run test:run` (should show 165+ tests passing)

### Step 4: Extract Validators (2-3 hours)
1. Create validator files
2. Write validator tests (25+ tests)
3. Run: `npm run test:run` (should show 190+ tests passing)

### Step 5: Set Up Vite React (2-3 hours)
1. Install dependencies
2. Create config files
3. Create basic App structure
4. Run: `npm run dev` (should launch app)

### Step 6: Create Hooks (3-4 hours)
1. Create all hooks
2. Write hook tests (25+ tests)
3. Run: `npm run test:run` (should show 215+ tests passing)

### Step 7: Create Components (5-6 hours)
1. Create UI components
2. Write component tests (40+ tests)
3. Run: `npm run test:run` (should show 255+ tests passing)
4. Test in browser: `npm run dev`

### Step 8: Final Integration (2-3 hours)
1. Wire everything together
2. E2E tests (10+ tests)
3. Final validation
4. Run: `npm run test:run` (should show 265+ tests passing)
5. Run: `npm run dev` (fully functional app)

---

## 📞 Contact Information

**Original Component Location:**
- Path: `c:\Apps\HUDR\Dev_HHTool\src\components\PokerHandCollector.tsx`
- Lines: 8601 total
- Status: DO NOT MODIFY ❌

**Modular Project Location:**
- Path: `c:\Apps\HUDR\HHTool_Modular\`
- Status: Work in progress (25% complete)
- Safe to modify: ✅

**Key Line Numbers in Original:**
- Pot calculation: 1003-1800
- Game engine: 2000-3200
- Validators: 690-890, 7025-7082
- Stack calculation: 3889-4500 (✅ Already extracted)

---

## 💡 Tips for Success

1. **Work incrementally** - Complete one phase before moving to next
2. **Test continuously** - Run `npm run test:run` after each module
3. **Follow the types** - TypeScript will guide you
4. **Reference original** - Keep PokerHandCollector.tsx open for reference
5. **Document as you go** - Update REFACTORING_STATUS.md
6. **Commit frequently** - Git commit after each completed phase
7. **Don't skip tests** - Tests are crucial for correctness
8. **Ask questions** - If logic is unclear, check console logs in original

---

## 🎉 End Goal

A fully functional, modular poker hand collector that:
- ✅ Launches with `npm run dev`
- ✅ Has identical functionality to original
- ✅ Clean, testable architecture
- ✅ 265+ tests all passing
- ✅ Type-safe TypeScript throughout
- ✅ Well-documented codebase
- ✅ Easy to maintain and extend

---

**Session Status:** READY FOR CONTINUATION
**Next Session Start:** PHASE 1 - Pot Engine Extraction
**Estimated Time to Completion:** 20-25 hours of focused work

Good luck! 🚀
