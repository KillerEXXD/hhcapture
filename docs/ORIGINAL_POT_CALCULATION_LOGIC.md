# Original Pot Calculation Logic - Dev_HHTool Analysis

## Overview

This document provides a complete breakdown of the pot calculation logic from the **original Dev_HHTool** (PokerHandCollector.tsx), triggered when the "Process Stack" button is clicked.

## Table of Contents

1. [High-Level Flow](#high-level-flow)
2. [Step-by-Step Breakdown](#step-by-step-breakdown)
3. [Key Data Structures](#key-data-structures)
4. [Pot Calculation Functions](#pot-calculation-functions)
5. [Critical Implementation Details](#critical-implementation-details)

---

## High-Level Flow

When "Process Stack" is clicked, the system:

```
1. CLEAR all React state (sectionStacks, contributedAmounts, processedSections)
2. SAVE any pending input amounts (blur all input fields)
3. PROCESS each betting section in order (preflop_base → preflop_more → ... → river_more2)
4. For each section:
   a. Calculate stack changes (processStackSynchronous)
   b. Track contributions from each player
   c. Mark all-in players
5. CALCULATE POTS for each processed section
   a. Gather contributions (gatherContributions)
   b. Calculate dead money (calculateDeadMoney)
   c. Create main pot + side pots (createPots)
6. ACCUMULATE pots across streets (preflop → flop → turn → river)
7. UPDATE React state with final results
```

---

## Step-by-Step Breakdown

### Phase 1: Initialization and State Clearing

**Location:** `processStackCascade()` function (lines 1826-1862)

```javascript
const processStackCascade = (targetStage, targetLevel) => {
  // 1. Set current processing section (for UI highlighting)
  const currentSectionKey = `${targetStage}_${targetLevel}`;
  setCurrentProcessingSection(currentSectionKey);

  // 2. Set processing flag (prevents stale data usage)
  setIsProcessing(true);

  // 3. IMMEDIATE STATE CLEAR - Critical for fresh calculation
  setSectionStacks({});
  setContributedAmounts({});
  setProcessedSections({});

  // 4. SAVE PENDING INPUTS - Blur all amount input fields
  //    This ensures unsaved amounts are captured
  const allAmountInputs = document.querySelectorAll('[id^="amount-input-"]');
  allAmountInputs.forEach((input) => {
    if (document.activeElement === input) {
      input.blur(); // Triggers handleBlur → validateAndSave
    }
  });
```

**Why this matters:**
- **Fresh start:** Every "Process Stack" click recalculates from scratch
- **No stale data:** Previous calculations don't contaminate new ones
- **Pending inputs saved:** User doesn't lose typed but unsaved amounts

---

### Phase 2: Build Section Processing Queue

**Location:** Lines 1882-1917

```javascript
const stageOrder = ['preflop', 'flop', 'turn', 'river'];
const levelOrder = ['base', 'more', 'more2'];

// Find target position
const targetStageIndex = stageOrder.indexOf(targetStage);
const targetLevelIndex = levelOrder.indexOf(targetLevel);

// Build list of sections to process
const sectionsToProcess = [];

for (let stageIdx = 0; stageIdx <= targetStageIndex; stageIdx++) {
  const stage = stageOrder[stageIdx];
  const maxLevel = stageIdx === targetStageIndex ? targetLevelIndex : 2;

  for (let levelIdx = 0; levelIdx <= maxLevel; levelIdx++) {
    const level = levelOrder[levelIdx];

    // Check if this section has data
    const suffix = level === 'base' ? '' :
                   level === 'more' ? '_moreAction' : '_moreAction2';
    const hasData = players.some(p => {
      const data = playerData[p.id] || {};
      const actionKey = `${stage}${suffix}_action`;
      return data[actionKey] !== undefined && data[actionKey] !== '';
    });

    // Always include preflop_base (blinds/ante), otherwise check for data
    if (hasData || (stage === 'preflop' && level === 'base')) {
      sectionsToProcess.push({ stage, level });
    }
  }
}
```

**Example queue:**
```
If user clicks "Process Stack" on flop_more:
  sectionsToProcess = [
    { stage: 'preflop', level: 'base' },
    { stage: 'preflop', level: 'more' },
    { stage: 'preflop', level: 'more2' },
    { stage: 'flop', level: 'base' },
    { stage: 'flop', level: 'more' }
  ]
```

---

### Phase 3: Initialize Working Copies

**Location:** Lines 1919-1957

```javascript
// Start with EMPTY working copies (critical for fresh calculation)
const workingSectionStacks = {};       // Tracks stack changes per section
let workingPlayerData = { ...playerData }; // Keeps user input
const workingContributedAmounts = {};  // Tracks contributions per section
const workingProcessedSections = {};   // Tracks which sections are done

// Clean up auto-calculated forced all-ins from previous runs
Object.keys(workingPlayerData).forEach(playerId => {
  const data = workingPlayerData[playerId] || {};

  ['preflop', 'preflop_moreAction', 'preflop_moreAction2',
   'flop', 'flop_moreAction', 'flop_moreAction2',
   'turn', 'turn_moreAction', 'turn_moreAction2',
   'river', 'river_moreAction', 'river_moreAction2'].forEach(key => {
    const actionKey = `${key}_action`;
    const forcedKey = `${key}_forcedAllIn`;

    // Remove forced all-ins (auto-calculated, not user-selected)
    if (data[forcedKey]) {
      delete workingPlayerData[playerId][actionKey];
      delete workingPlayerData[playerId][amountKey];
      delete workingPlayerData[playerId][forcedKey];
    }
  });
});
```

**Why working copies?**
- React state updates are asynchronous
- Need immediate access to calculated values
- Prevents race conditions and stale data issues

---

### Phase 4: Process Each Section

**Location:** Lines 1962-1995

```javascript
const allAllInPlayers = []; // Track all-in players globally

sectionsToProcess.forEach((section, index) => {
  const result = processStackSynchronous(
    section.stage,
    section.level,
    workingSectionStacks,
    workingPlayerData,
    workingContributedAmounts
  );

  // Update working copies with results
  if (result) {
    // Store stack snapshots (current → updated)
    workingSectionStacks[`${section.stage}_${section.level}`] = {
      current: result.currentStacks,
      updated: result.updatedStacks
    };

    // Update player data (may include forced all-ins)
    workingPlayerData = result.updatedPlayerData;

    // Store contributions for this section
    workingContributedAmounts[`${section.stage}_${section.level}`] =
      result.contributedAmounts;

    // Mark section as processed
    workingProcessedSections[`${section.stage}_${section.level}`] = true;

    // Collect all-in players
    if (result.allInPlayers && result.allInPlayers.length > 0) {
      result.allInPlayers.forEach(player => {
        allAllInPlayers.push({
          ...player,
          section: `${section.stage}_${section.level}`
        });
      });
    }
  }
});
```

**What `processStackSynchronous` does:**
- Calculates stack changes for each player action
- Determines contributions from each player
- Detects all-in situations
- Updates player data (forced all-ins, calculated amounts)

---

### Phase 5: Calculate Pots with Accumulation

**Location:** Lines 2018-2109

```javascript
const newPotsByStage = {};
let accumulatedPots = null; // Track pots across streets
let lastStage = null;

processedKeys.forEach(sectionKey => {
  const [stage, level] = sectionKey.split('_');

  // 🔥 CRITICAL: Carry over pots from previous sections
  let previousStreetPot = 0;

  if (accumulatedPots) {
    if (lastStage !== stage) {
      // NEW STREET: Carry over full pot from last street
      previousStreetPot = accumulatedPots.totalPot;
      console.log(`🎰 NEW STREET: Carrying over ${previousStreetPot}
                   from ${lastStage} → ${stage}`);
    } else {
      // SAME STREET, DIFFERENT LEVEL: Carry forward accumulated pot
      previousStreetPot = accumulatedPots.totalPot;
      console.log(`🎰 SAME STREET: Carrying over ${previousStreetPot}
                   within ${stage} (${level})`);
    }
  }

  // Calculate pots for this section
  const potInfo = calculatePotsForBettingRound(
    stage,
    level,
    workingContributedAmounts,  // Working copy
    workingProcessedSections,   // Working copy
    workingSectionStacks,       // Working copy
    previousStreetPot           // Accumulated pot
  );

  if (potInfo) {
    newPotsByStage[sectionKey] = potInfo;
    accumulatedPots = potInfo; // Store for next iteration
    lastStage = stage;
  }
});

// Update React state
setPotsByStage(newPotsByStage);
```

**Pot Accumulation Logic:**

```
Example flow with $100 pot after preflop:

1. preflop_base → Total pot: $100
   ↓ (carry forward $100)

2. flop_base → New contributions: $50
   → Total pot: $100 + $50 = $150
   ↓ (carry forward $150)

3. flop_more → New contributions: $30
   → Total pot: $150 + $30 = $180
   ↓ (carry forward $180)

4. turn_base → New contributions: $20
   → Total pot: $180 + $20 = $200
```

---

## Pot Calculation Functions

### 1. `gatherContributions(stage, level, ...)`

**Purpose:** Collect all player contributions for a betting round

**Location:** Lines 1003-1275

**Logic:**

```javascript
const gatherContributions = (stage, level,
                            overrideContributedAmounts,
                            overrideProcessedSections,
                            overrideSectionStacks,
                            onlyCurrentSection = false) => {

  const contributions = [];

  // Section keys for this betting round
  const baseSectionKey = `${stage}_base`;
  const more1SectionKey = `${stage}_more`;
  const more2SectionKey = `${stage}_more2`;

  // Determine which sections to include based on level
  const includeSections = onlyCurrentSection
    ? {
        base: level === 'base',
        more: level === 'more',
        more2: level === 'more2'
      }
    : {
        base: level === 'base' || level === 'more' || level === 'more2',
        more: level === 'more' || level === 'more2',
        more2: level === 'more2'
      };

  players.forEach(player => {
    if (!player.name) return; // Skip empty slots

    const data = playerData[player.id] || {};
    const position = player.position.toLowerCase();

    let totalContributed = 0;
    let postedSB = 0;
    let postedBB = 0;
    let postedAnte = 0;

    // For preflop, handle posted amounts (blinds/ante)
    if (stage === 'preflop' && includeSections.base) {
      if (position === 'sb') {
        postedSB = data.postedSB || 0;
        totalContributed += postedSB;
      }

      if (position === 'bb') {
        postedAnte = data.postedAnte || 0;
        postedBB = data.postedBB || 0;
        totalContributed += postedBB; // ✅ BB only, NOT ante
      }
    }

    // Add contributions from base section
    if (includeSections.base && processedSections[baseSectionKey]) {
      const baseContrib = contributedAmounts[baseSectionKey]?.[player.id] || 0;
      totalContributed += baseContrib;
    }

    // Add contributions from more action 1
    if (includeSections.more && processedSections[more1SectionKey]) {
      const more1Contrib = contributedAmounts[more1SectionKey]?.[player.id] || 0;
      totalContributed += more1Contrib;
    }

    // Add contributions from more action 2
    if (includeSections.more2 && processedSections[more2SectionKey]) {
      const more2Contrib = contributedAmounts[more2SectionKey]?.[player.id] || 0;
      totalContributed += more2Contrib;
    }

    // Check if player folded
    const isFolded = isPlayerFolded(player.id, stage);

    // Get current stack from latest processed section
    let currentStack = player.stack;
    const sectionKeys = [baseSectionKey, more1SectionKey, more2SectionKey];
    for (let i = sectionKeys.length - 1; i >= 0; i--) {
      if (processedSections[sectionKeys[i]] &&
          sectionStacks[sectionKeys[i]]) {
        const stackInfo = sectionStacks[sectionKeys[i]].updated?.[player.id];
        if (stackInfo !== undefined) {
          currentStack = stackInfo;
          break;
        }
      }
    }

    const isAllIn = currentStack <= 0;

    contributions.push({
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      totalContributed: totalContributed,
      contributions: {
        base: contributedAmounts[baseSectionKey]?.[player.id] || 0,
        more: contributedAmounts[more1SectionKey]?.[player.id] || 0,
        more2: contributedAmounts[more2SectionKey]?.[player.id] || 0
      },
      postedSB: postedSB,
      postedBB: postedBB,
      postedAnte: postedAnte,
      isFolded: isFolded,
      isAllIn: isAllIn,
      currentStack: Math.max(0, currentStack)
    });
  });

  return contributions;
};
```

**Key Points:**

1. **BB Ante Handling:** BB's ante is EXCLUDED from contribution (it's dead money)
2. **Cumulative Contributions:** Adds up base + more + more2 based on level
3. **Fold Detection:** Checks if player folded in current or previous stage
4. **All-In Detection:** Checks if stack is 0 (player is all-in)
5. **Only Current Section Mode:** When `previousStreetPot > 0`, only gathers contributions from CURRENT section to avoid double-counting

---

### 2. `calculateDeadMoney(stage, contributions)`

**Purpose:** Calculate money that goes into pot but can't be won (ante, folded blinds/bets)

**Location:** Lines 1280-1344

**Logic:**

```javascript
const calculateDeadMoney = (stage, contributions) => {
  let anteAmount = 0;
  let foldedBlinds = 0;
  let foldedBets = 0;

  contributions.forEach((c) => {
    // Ante is always dead (for BB player in preflop)
    if (stage === 'preflop') {
      anteAmount += c.postedAnte;

      // If SB or BB folded, their blind becomes dead
      if (c.isFolded) {
        const position = c.position.toLowerCase();
        if (position === 'sb') {
          foldedBlinds += c.postedSB;
        }
        if (position === 'bb') {
          foldedBlinds += c.postedBB;
        }
      }
    }

    // Any bets from folded players are dead
    if (c.isFolded && c.totalContributed > 0) {
      if (stage === 'preflop') {
        const position = c.position.toLowerCase();
        let alreadyCounted = c.postedAnte; // Ante already counted

        if (position === 'sb') alreadyCounted += c.postedSB;
        if (position === 'bb') alreadyCounted += c.postedBB;

        const additionalBets = Math.max(0, c.totalContributed - alreadyCounted);
        if (additionalBets > 0) {
          foldedBets += additionalBets;
        }
      } else {
        foldedBets += c.totalContributed;
      }
    }
  });

  const total = anteAmount + foldedBlinds + foldedBets;

  return {
    total: total,
    ante: anteAmount,
    foldedBlinds: foldedBlinds,
    foldedBets: foldedBets
  };
};
```

**Dead Money Categories:**

1. **Ante:** BB's ante (separate from BB blind)
2. **Folded Blinds:** SB/BB folded without additional action
3. **Folded Bets:** Any additional bets from folded players

**Example:**

```
Setup: SB = $50, BB = $100, Ante = $25
- BB posts $25 ante + $100 BB
- SB posts $50, then folds
- UTG raises to $300, BB calls

Dead Money Breakdown:
- Ante: $25 (BB's ante)
- Folded Blinds: $50 (SB's blind)
- Folded Bets: $0 (SB didn't bet beyond blind)
→ Total Dead Money: $75
```

---

### 3. `createPots(contributions, deadMoney, previousStreetPot, stage, level)`

**Purpose:** Create main pot and side pots based on all-in situations

**Location:** Lines 1350-1662

**Logic:**

```javascript
const createPots = (contributions, deadMoney, previousStreetPot = 0) => {
  // Filter to active players only (not folded)
  const activePlayers = contributions.filter(c => !c.isFolded);

  if (activePlayers.length === 0) {
    // Everyone folded - only dead money
    return {
      mainPot: {
        amount: deadMoney.total,
        eligiblePlayers: [],
        excludedPlayers: []
      },
      sidePots: [],
      totalPot: deadMoney.total
    };
  }

  // Sort by contribution (ascending)
  const sortedPlayers = [...activePlayers].sort((a, b) =>
    a.totalContributed - b.totalContributed
  );

  const pots = [];
  let previousCap = 0;

  // Find all all-in players
  const allInPlayers = sortedPlayers.filter(p => p.isAllIn);

  if (allInPlayers.length === 0) {
    // NO ALL-INS: Everything goes to main pot
    const totalContributions = sortedPlayers.reduce(
      (sum, p) => sum + p.totalContributed, 0
    );

    pots.push({
      potNumber: 0,
      amount: totalContributions,
      cappedAt: Math.max(...sortedPlayers.map(p => p.totalContributed)),
      eligiblePlayers: sortedPlayers.map(p => ({
        id: p.playerId,
        name: p.playerName,
        position: p.position,
        contribution: p.totalContributed,
        isAllIn: p.isAllIn
      })),
      excludedPlayers: []
    });

  } else {
    // HAS ALL-INS: Create pots at each all-in level

    sortedPlayers.forEach((player, index) => {
      const currentCap = player.totalContributed;

      // Skip if same as previous (already in same pot) AND not all-in
      if (currentCap === previousCap && index > 0) {
        return;
      }

      // Create a new pot if:
      // 1. This is the first player (main pot), OR
      // 2. This player's contribution is DIFFERENT from previous cap
      const isFirstPlayer = index === 0;
      const hasLevelChange = currentCap > previousCap;

      const shouldCreatePot = isFirstPlayer || hasLevelChange;

      if (shouldCreatePot) {
        // Players at this level and above
        const playersAtThisLevel = sortedPlayers.slice(index);

        // Amount per player for this pot level
        const contributionPerPlayer = currentCap - previousCap;
        const potAmount = contributionPerPlayer * playersAtThisLevel.length;

        // Determine excluded players (below this level)
        const excludedPlayers = sortedPlayers.slice(0, index).map(p => ({
          id: p.playerId,
          name: p.playerName,
          position: p.position,
          contribution: p.totalContributed,
          reason: p.isAllIn
            ? `All-in at ${p.totalContributed}`
            : `Contributed only ${p.totalContributed}`
        }));

        pots.push({
          potNumber: pots.length,
          amount: potAmount,
          cappedAt: currentCap,
          eligiblePlayers: playersAtThisLevel.map(p => ({
            id: p.playerId,
            name: p.playerName,
            position: p.position,
            contribution: contributionPerPlayer, // Contribution to THIS pot
            totalContribution: p.totalContributed, // Total for the round
            isAllIn: p.isAllIn
          })),
          excludedPlayers: excludedPlayers
        });
      }

      previousCap = currentCap;
    });
  }

  // Add dead money to main pot (index 0)
  if (pots.length > 0) {
    pots[0].amount += deadMoney.total;

    // Add previous street pot
    if (previousStreetPot > 0) {
      pots[0].amount += previousStreetPot;
    }
  }

  // Calculate total pot
  const totalContributions = sortedPlayers.reduce(
    (sum, p) => sum + p.totalContributed, 0
  );
  const totalPot = totalContributions + deadMoney.total + previousStreetPot;

  // Calculate percentages
  pots.forEach(pot => {
    pot.percentage = totalPot > 0 ? (pot.amount / totalPot) * 100 : 0;
  });

  // Main pot is first, side pots are rest
  const mainPot = pots[0];
  const sidePots = pots.slice(1);

  return {
    mainPot: mainPot,
    sidePots: sidePots,
    totalPot: totalPot,
    deadMoney: deadMoney.total,
    deadMoneyBreakdown: deadMoney
  };
};
```

**Side Pot Creation Example:**

```
Scenario:
- Alice: $10,000 (all-in)
- Bob: $5,000 (all-in)
- Charlie: $10,000
- Dead money: $500

Step 1: Sort by contribution
  Bob: $5,000 (all-in)
  Alice: $10,000 (all-in)
  Charlie: $10,000

Step 2: Create pots

POT 0 (Main Pot):
  - Cap: $5,000 (Bob's contribution)
  - Contribution per player: $5,000
  - Eligible: Bob, Alice, Charlie (3 players)
  - Amount: $5,000 × 3 = $15,000
  - + Dead money: $500
  → Main Pot: $15,500

POT 1 (Side Pot 1):
  - Cap: $10,000 (Alice's contribution)
  - Contribution per player: $10,000 - $5,000 = $5,000
  - Eligible: Alice, Charlie (2 players)
  - Excluded: Bob (all-in at $5,000)
  - Amount: $5,000 × 2 = $10,000
  → Side Pot 1: $10,000

Total Pot: $15,500 + $10,000 = $25,500
```

---

## Key Data Structures

### 1. `playerData`

Stores all player actions and amounts across all betting rounds.

```javascript
playerData = {
  [playerId]: {
    // Blinds and Ante
    postedSB: 50,
    postedBB: 100,
    postedAnte: 25,

    // Preflop Base
    preflop_action: 'raise',
    preflop_amount: 300,
    preflop_unit: 'actual',

    // Preflop More Action
    preflop_moreAction_action: 'call',
    preflop_moreAction_amount: 600,
    preflop_moreAction_unit: 'actual',

    // Flop Base
    flop_action: 'bet',
    flop_amount: 500,
    flop_unit: 'actual',

    // ... and so on for turn, river
  }
}
```

### 2. `sectionStacks`

Tracks stack snapshots before and after each section is processed.

```javascript
sectionStacks = {
  'preflop_base': {
    current: { 1: 10000, 2: 8000, 3: 12000 }, // Before processing
    updated: { 1: 9700, 2: 7900, 3: 11900 }   // After processing
  },
  'preflop_more': {
    current: { 1: 9700, 2: 7900, 3: 11900 },  // Inherited from preflop_base
    updated: { 1: 9400, 2: 7900, 3: 11600 }   // After more action
  }
}
```

### 3. `contributedAmounts`

Tracks how much each player contributed in each section.

```javascript
contributedAmounts = {
  'preflop_base': {
    1: 300,  // Player 1 contributed $300 in preflop base
    2: 100,  // Player 2 contributed $100 (BB)
    3: 100   // Player 3 called $100
  },
  'preflop_more': {
    1: 300,  // Player 1 raised additional $300
    2: 0,    // Player 2 folded (no additional)
    3: 300   // Player 3 called the raise
  }
}
```

### 4. `processedSections`

Boolean flags indicating which sections have been processed.

```javascript
processedSections = {
  'preflop_base': true,
  'preflop_more': true,
  'flop_base': true,
  'flop_more': false, // Not processed yet
}
```

### 5. `potsByStage`

Final pot information for each processed section.

```javascript
potsByStage = {
  'preflop_base': {
    mainPot: { amount: 700, eligiblePlayers: [...], ... },
    sidePots: [],
    totalPot: 700,
    deadMoney: 25,
    deadMoneyBreakdown: { ante: 25, foldedBlinds: 0, foldedBets: 0 }
  },
  'flop_base': {
    mainPot: { amount: 1500, eligiblePlayers: [...], ... },
    sidePots: [{ amount: 400, eligiblePlayers: [...], ... }],
    totalPot: 1900,
    deadMoney: 25
  }
}
```

---

## Critical Implementation Details

### 1. Working Copies vs React State

**Problem:** React state updates are asynchronous. Reading state immediately after `setState()` gives stale data.

**Solution:** Use working copies for synchronous processing:

```javascript
// ❌ BAD: Using React state directly
setSectionStacks(newStacks);
const stack = sectionStacks['preflop_base']; // ⚠️ STALE DATA!

// ✅ GOOD: Using working copies
const workingSectionStacks = { ...sectionStacks };
workingSectionStacks['preflop_base'] = newStacks;
const stack = workingSectionStacks['preflop_base']; // ✅ Fresh data
setSectionStacks(workingSectionStacks); // Update React later
```

### 2. Contribution Tracking

**Key concept:** Contributions are tracked PER SECTION, not cumulative.

```javascript
// Example: Player raises from $100 to $300, then calls $200 more

// preflop_base
contributedAmounts['preflop_base'][playerId] = 200; // Additional $200 to reach $300

// preflop_more
contributedAmounts['preflop_more'][playerId] = 200; // Additional $200 to call

// When gathering contributions for preflop:
totalContributed = postedBB (100)
                 + contributedAmounts['preflop_base'] (200)
                 + contributedAmounts['preflop_more'] (200)
                 = 500 total
```

### 3. BB Ante Handling

**Critical:** BB's ante is DEAD MONEY, not part of BB's contribution.

```javascript
// ❌ WRONG:
totalContributed = postedBB + postedAnte; // Double counts ante

// ✅ CORRECT:
totalContributed = postedBB; // Ante counted separately in dead money
```

### 4. Pot Accumulation Across Streets

**Key concept:** Pots carry forward from one street to the next.

```javascript
// Preflop ends with $1000 pot
// Flop base: Players bet $200 each (3 players = $600)

// ❌ WRONG:
flopPot = 600; // Missing preflop pot!

// ✅ CORRECT:
flopPot = previousStreetPot (1000) + newContributions (600) = 1600;
```

### 5. Only Current Section Mode

**Purpose:** When carrying forward pots, avoid double-counting contributions.

```javascript
// Preflop base already processed: $1000 pot
// Preflop more: Players bet additional $500

// ❌ WRONG: Gather ALL preflop contributions
contributions = gatherContributions('preflop', 'more', false);
// → Would include base + more = $1500
// → Total pot = $1000 (carried) + $1500 = $2500 ❌ DOUBLE COUNTED BASE!

// ✅ CORRECT: Only gather MORE contributions
contributions = gatherContributions('preflop', 'more', true); // onlyCurrentSection=true
// → Only includes more = $500
// → Total pot = $1000 (carried) + $500 = $1500 ✅
```

### 6. All-In Detection

**Two sources:**

1. **User-selected:** Player explicitly selected "all-in" action
2. **Forced all-in:** Player tried to call/raise but didn't have enough chips

```javascript
// Forced all-in example:
if (action === 'call') {
  const amountToCall = 1000;
  const alreadyContributed = 500;
  const additionalNeeded = 500;
  const currentStack = 300; // ⚠️ Not enough!

  if (currentStack < additionalNeeded) {
    // Force all-in
    updatedPlayerData[playerId][actionKey] = 'all-in';
    updatedPlayerData[playerId][forcedKey] = true; // Mark as forced
    actualAmount = currentStack; // All remaining chips
  }
}
```

---

## Summary of Three-Step Pot Calculation

```
STEP 1: gatherContributions()
→ Collects how much each player contributed
→ Tracks folded/all-in status
→ Handles blinds/ante for preflop
→ Accumulates contributions from base/more/more2

STEP 2: calculateDeadMoney()
→ Identifies money that goes into pot but can't be won
→ Categories: Ante, folded blinds, folded bets
→ Prevents double-counting

STEP 3: createPots()
→ Sorts players by contribution (ascending)
→ Creates main pot for lowest contribution level
→ Creates side pots for each all-in level
→ Adds dead money and previous street pot to main pot
→ Calculates percentages
```

**Final Output:**

```javascript
{
  mainPot: {
    potNumber: 0,
    amount: 15500,
    cappedAt: 5000,
    percentage: 62.0,
    eligiblePlayers: [
      { id: 1, name: 'Bob', contribution: 5000, isAllIn: true },
      { id: 2, name: 'Alice', contribution: 5000, isAllIn: true },
      { id: 3, name: 'Charlie', contribution: 5000, isAllIn: false }
    ],
    excludedPlayers: []
  },
  sidePots: [
    {
      potNumber: 1,
      amount: 10000,
      cappedAt: 10000,
      percentage: 38.0,
      eligiblePlayers: [
        { id: 2, name: 'Alice', contribution: 5000, isAllIn: true },
        { id: 3, name: 'Charlie', contribution: 5000, isAllIn: false }
      ],
      excludedPlayers: [
        { id: 1, name: 'Bob', reason: 'All-in at $5,000' }
      ]
    }
  ],
  totalPot: 25500,
  deadMoney: 500,
  deadMoneyBreakdown: {
    total: 500,
    ante: 500,
    foldedBlinds: 0,
    foldedBets: 0
  }
}
```

---

## Conclusion

The original pot calculation logic is a sophisticated three-step system that:

1. **Tracks contributions** accurately across multiple betting rounds and levels
2. **Handles dead money** correctly (ante, folded blinds, folded bets)
3. **Creates side pots** automatically based on all-in situations
4. **Accumulates pots** across streets (preflop → flop → turn → river)
5. **Uses working copies** to avoid React state timing issues
6. **Recalculates from scratch** on every "Process Stack" click for accuracy

The key insight is that pot calculation happens in **two dimensions**:

- **Horizontal:** Sections within a betting round (base → more → more2)
- **Vertical:** Betting rounds across streets (preflop → flop → turn → river)

Both dimensions require careful contribution tracking and pot accumulation to ensure accurate results.

---

**Document created:** 2025-11-09
**Source:** Dev_HHTool/src/components/PokerHandCollector.tsx
**Lines analyzed:** 1000-2700
