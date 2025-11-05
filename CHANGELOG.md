# Changelog

All notable changes to the HHTool Modular project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-11-05

#### Community Card Selection System
- **Button-based card selector** ([CommunityCardSelector.tsx](src/components/poker/CommunityCardSelector.tsx))
  - Rank buttons (A, 2-9, 10, J, Q, K) matching player hole card design
  - Suit buttons (♠, ♥, ♦, ♣) with color-coded display
  - Keyboard shortcuts: a-k for ranks, s/h/d/c for suits
  - Auto-focus navigation: Card 1 → Card 2 → Card 3 → First player action
  - Card availability validation to prevent duplicates
  - Pending rank state for two-step card selection
  - Auto-select functionality when enabled in settings

#### Complete FlopView Implementation
- **Start/Now Stack Display** ([FlopView.tsx:640-656](src/components/game/FlopView.tsx#L640-L656))
  - "Start": Shows hand's initial stack (never changes)
  - "Now": Shows current stack after processing
  - Green background for normal stacks, red for all-in players
  - Visual distinction between processed and unprocessed rounds

- **Comprehensive Stack History** ([FlopView.tsx:728-941](src/components/game/FlopView.tsx#L728-L941))
  - Floating card with collapsible history (click History button)
  - **PreFlop rounds included**:
    - PreFlop BASE (Indigo theme)
    - PreFlop More Action 1 (Teal theme)
    - PreFlop More Action 2 (Cyan theme)
  - **Flop rounds**:
    - Flop BASE (Gray theme)
    - Flop More Action 1 (Purple theme)
    - Flop More Action 2 (Yellow theme)
  - Each round shows:
    - Stack before → Stack after with arrow
    - Action taken (fold/check/call/bet/raise/all-in)
    - Contribution amount
  - Summary section with total contributed and remaining stack
  - Auto-scroll functionality for better visibility
  - All-in highlighting with red theme

- **First Player Action Logic** ([FlopView.tsx:615-616, 884-886](src/components/game/FlopView.tsx#L615-L616))
  - First player (opening action) limited to: fold, check, bet, all-in
  - Subsequent players have full action set: fold, check, call, bet, raise, all-in, no action
  - Proper postflop action order (SB first, then BB, UTG, etc.)

- **Button Styling Matching PreFlopView** ([FlopView.tsx:929-944](src/components/game/FlopView.tsx#L929-L944))
  - Orange "Add More Action" button with + icon
  - Green "Create Turn" button with → icon
  - Larger size (px-6 py-3) with shadow-md
  - Disabled state styling for max action levels
  - Display current action level count

#### Pot Cascading System
- **getPreviousStreetPot Function** ([FlopView.tsx:238-249](src/components/game/FlopView.tsx#L238-L249))
  - Correctly retrieves pot from PreFlop (more2 → more → base)
  - Passes to `calculatePotsForBettingRound` engine
  - Ensures Flop betting adds to PreFlop pot structure
  - Maintains main pot and side pot integrity across streets

#### Navigation & UX
- **Tab Navigation** ([CommunityCardSelector.tsx:39-64](src/components/poker/CommunityCardSelector.tsx#L39-L64))
  - Seamless flow from 3rd community card to first player action
  - Uses `data-community-card` and `data-action-focus` attributes
  - Automatic focus management with DOM querying
- **Visual Focus Indicators**
  - Blue ring on focused card selectors
  - Highlighted borders on active elements
  - Clear TAB navigation hints

### Changed - 2025-11-05
- **FlopView.tsx** - Complete rewrite from 964 to 1073 lines
  - Integrated Start/Now stack display logic
  - Added comprehensive stack history with PreFlop rounds
  - Updated button styling to match PreFlopView
  - Implemented first player action filtering

### Fixed - 2025-11-05
- **Tab Navigation** ([CommunityCardSelector.tsx:50-62](src/components/poker/CommunityCardSelector.tsx#L50-L62))
  - Fixed focus transition from 3rd community card to first player action
  - Proper `data-action-focus` attribute querying
- **First Player Actions** ([FlopView.tsx:884-886](src/components/game/FlopView.tsx#L884-L886))
  - Corrected action buttons for first player (opening action)
  - Removed call, raise, and no action options for first player
- **Stack History Completeness** ([FlopView.tsx:728-838](src/components/game/FlopView.tsx#L728-L838))
  - Added missing PreFlop BASE, More Action 1, More Action 2 rounds
  - Complete hand history now visible in floating card
- **Betting Round Validation** ([roundCompletionValidator.ts:131-208](src/lib/poker/validators/roundCompletionValidator.ts#L131-L208))
  - Fixed contribution calculation fallback logic
  - Proper unit conversion (K, Mil, actual)
  - More Action 2 now checks More Action 1 then BASE

## Technical Details

### Architecture
- **Component Pattern**: Button-based selectors for consistency
- **State Management**: `useGameState` hook with centralized state
- **Focus Management**: DOM queries with `data-*` attributes
- **Stack Cascade**: Each street BASE inherits from previous street's final stack
- **Pot Engine Integration**: `processStackSynchronous` + `calculatePotsForBettingRound`

### Section Keys Pattern
```
preflop_base, preflop_more, preflop_more2
flop_base, flop_more, flop_more2
turn_base, turn_more, turn_more2
river_base, river_more, river_more2
```

### Color Themes by Round Type
- PreFlop BASE: Indigo (`bg-indigo-50`, `border-indigo-400`)
- PreFlop MA1: Teal (`bg-teal-50`, `border-teal-400`)
- PreFlop MA2: Cyan (`bg-cyan-50`, `border-cyan-400`)
- Flop BASE: Gray (`bg-gray-50`, `border-gray-400`)
- Flop MA1: Purple (`bg-purple-50`, `border-purple-400`)
- Flop MA2: Yellow (`bg-yellow-50`, `border-yellow-400`)

## Upcoming Features

### In Progress
- Turn View component with same pattern as FlopView
- River View component with same pattern as FlopView
- End-to-end testing of stack processing across all streets

### Planned
- Complete pot calculation validation across all streets
- Export functionality for hand history
- Import functionality for existing hand histories

## Development Notes

### Files Modified in Last Session
1. **FlopView.tsx** - Major implementation (1073 lines)
2. **CommunityCardSelector.tsx** - Tab navigation updates (304 lines)
3. **roundCompletionValidator.ts** - Bug fixes for More Action rounds

### Testing Checklist
- [ ] Community card selection with keyboard shortcuts
- [ ] Tab navigation from cards to actions
- [ ] Stack history displays all PreFlop + Flop rounds
- [ ] First player action buttons limited correctly
- [ ] Pot cascading from PreFlop to Flop
- [ ] More Action buttons styled correctly
- [ ] All-in players highlighted in red
- [ ] Stack processing across multiple action levels

---

**Note**: This changelog was created on 2025-11-05 to track development progress. All previous changes before this date are documented above.
