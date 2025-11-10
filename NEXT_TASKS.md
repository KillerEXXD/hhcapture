# Next Tasks for HHTool_Modular

## ✅ Recently Completed
- **FR-13: Keyboard Navigation and Tabbing Behavior** - Implemented for Flop/Turn/River ✓
- Created 26 automated tests covering keyboard navigation scenarios ✓
- Updated requirements documentation (version 1.1) ✓

---

## 🎯 Priority Tasks (From Requirements Review)

### **HIGH PRIORITY**

#### **1. Turn and River View UI Completion**
**Status:** Incomplete
**Issue:** TurnView.tsx and RiverView.tsx have navigation functions but no ActionButtons rendering
**Tasks:**
- Complete Turn view UI with ActionButtons integration
- Complete River view UI with ActionButtons integration
- Wrap ActionButtons with PlayerActionSelector in both views
- Add data-process-stack-focus to Process Stack buttons
- Test keyboard navigation in Turn and River views

**Files:**
- `src/components/game/TurnView.tsx` (partial - needs UI completion)
- `src/components/game/RiverView.tsx` (needs implementation)

**Test Scenarios:** TS-21, TS-22, TS-23 (manual testing in Turn/River)

---

#### **2. Fix Pre-existing Test Failures**
**Status:** 7 test failures in playerActionStatus.test.ts
**Issue:** More Action player status detection has edge case issues
**Tests Failing:**
- Case 1: Player Already Matched Max Bet from BASE
- Case 3: Player Needs to Act
- Case 2: Cumulative Contributions from BASE + More Action 1 (2 tests)

**Tasks:**
- Review and fix `checkPlayerNeedsToAct` function
- Update cumulative contribution calculation logic
- Ensure max bet tracking works correctly across More Actions
- Verify all 29 tests in playerActionStatus.test.ts pass

**Files:**
- `src/lib/poker/validators/playerActionStatus.ts`
- `src/lib/poker/validators/__tests__/playerActionStatus.test.ts`

---

### **MEDIUM PRIORITY**

#### **3. Community Card Navigation Enhancement**
**Status:** Not implemented
**From:** FR-13.1 - Card Selection to Action Tabbing
**Tasks:**
- Implement Tab key handling in CommunityCardSelector components
- Tab from last card (Card 3 in Flop, Card 4 in Turn, Card 5 in River) → First player action
- Test card-to-action navigation flow

**Files:**
- `src/components/poker/CommunityCardSelector.tsx`
- `src/components/poker/CardSelector.tsx` (if needed)

**Test Scenarios:** TS-21 step 2-3

---

#### **4. Amount Input Focus Management**
**Status:** Partially implemented
**Tasks:**
- Add `data-amount-focus` attributes to amount input fields
- Implement Tab from amount input → next player action navigation
- Handle Enter key to trigger navigation from amount input
- Add visual focus indicators for amount inputs

**Files:**
- `src/components/poker/AmountInput.tsx`

**Test Scenarios:** TS-21 steps 5-7

---

#### **5. Process Stack Focus Return Logic**
**Status:** Not implemented
**From:** FR-13.4 - Round Completion Tabbing
**Tasks:**
- After Process Stack is clicked, determine appropriate focus return point
- If more actions needed → focus first player who needs to act
- If round complete → focus "Add More Action" or "Create Next Street" button
- Implement focus restoration logic

**Files:**
- `src/components/game/FlopView.tsx` (handleProcessStack)
- `src/components/game/TurnView.tsx` (handleProcessStack)
- `src/components/game/RiverView.tsx` (handleProcessStack)

---

### **LOW PRIORITY**

#### **6. Keyboard Shortcut Documentation**
**Status:** Not documented
**Tasks:**
- Create in-app help modal showing keyboard shortcuts
- Add keyboard shortcut hints to action buttons (tooltips)
- Document shortcuts in user guide

**Shortcuts to Document:**
- F: Fold
- C/K: Check/Call
- B: Bet
- R: Raise
- A: All-in
- N: No action
- Tab: Navigate forward
- Shift+Tab: Navigate backward (if implemented)

---

#### **7. Accessibility Improvements**
**Status:** Basic keyboard navigation implemented
**Tasks:**
- Add ARIA labels to focusable elements
- Implement screen reader announcements for action changes
- Test with screen readers
- Ensure keyboard-only navigation works throughout app

**Files:**
- All view components
- ActionButtons component
- AmountInput component

---

## 📋 Known Issues to Address

### **Issue 1: More Action Test Failures**
**Severity:** Medium
**Impact:** Navigation logic in complex More Action scenarios may have edge cases
**Related Tests:**
- keyboardNavigation.test.ts: 7 failures
- playerActionStatus.test.ts: 4 failures

**Resolution Steps:**
1. Review More Action cumulative contribution calculation
2. Fix maxBet tracking across action levels
3. Update test expectations or fix implementation
4. Verify all navigation scenarios work correctly

---

### **Issue 2: TurnView and RiverView Incomplete**
**Severity:** High
**Impact:** Keyboard navigation not functional in Turn/River views
**Resolution Steps:**
1. Check if Turn/River views are placeholder files
2. If complete UI exists elsewhere, integrate navigation code
3. If UI needs to be built, copy pattern from FlopView
4. Add comprehensive tests

---

## 🔄 Continuous Improvement

### **Code Quality**
- [ ] Add JSDoc comments to navigation functions
- [ ] Extract common navigation logic to shared utility
- [ ] Reduce code duplication between FlopView, TurnView, RiverView
- [ ] Add TypeScript strict mode compliance

### **Testing**
- [ ] Add React Testing Library for component-level tests
- [ ] Add E2E tests with Playwright/Cypress for full navigation flows
- [ ] Increase test coverage to 80%+
- [ ] Add visual regression tests

### **Performance**
- [ ] Optimize focus management (reduce setTimeout usage)
- [ ] Debounce keyboard events if needed
- [ ] Profile navigation performance with many players

---

## 📖 Documentation Needs

1. **User Guide:**
   - Keyboard navigation tutorial
   - Best practices for data entry workflow
   - Troubleshooting common issues

2. **Developer Guide:**
   - Navigation architecture explanation
   - How to add keyboard navigation to new views
   - Testing strategy for navigation features

3. **API Documentation:**
   - navigateAfterAction function
   - PlayerActionSelector component
   - Focus management utilities

---

## 🎯 Next Immediate Steps

**Recommended order:**

1. **Complete Turn and River View UI** (1-2 hours)
   - Critical for feature completeness
   - Enables full keyboard navigation testing

2. **Fix Pre-existing Test Failures** (1-2 hours)
   - Ensures code quality
   - Validates More Action logic

3. **Community Card Navigation** (30 minutes)
   - Completes FR-13.1 requirement
   - Improves user experience

4. **Amount Input Focus Management** (30 minutes)
   - Completes FR-13.2 requirement
   - Critical for smooth navigation flow

5. **Process Stack Focus Return** (1 hour)
   - Completes FR-13.4 requirement
   - Enhances workflow efficiency

---

## 📊 Progress Tracking

**Feature Requirements Status:**
- ✅ FR-1: Sequential Player Enabling/Disabling
- ✅ FR-2: First Player Button States (Post-Flop BASE)
- ✅ FR-3: Pot Calculation Cascade Across Streets
- ✅ FR-4: Stack History Card Display
- ✅ FR-5: Process Stack Button Behavior
- ✅ FR-6: Street Navigation
- ✅ FR-7: MaxBet Reset Per Street
- ✅ FR-8: Process Stack Button Position
- ✅ FR-9: More Action Enabling Logic
- ✅ FR-10: Main Pot + Side Pot Display
- ✅ FR-11: All-In Status Carryover
- ✅ FR-12: Raise Amount Validation
- 🟡 **FR-13: Keyboard Navigation** (Partially Complete - PreFlop & Flop done, Turn/River pending)
- ✅ FR-14: State Copying Between Sections

**Test Scenarios Status:**
- ✅ TS-1 through TS-20 (Pre-existing)
- 🟡 **TS-21:** Keyboard Navigation - Flop/Turn/River Tabbing (Automated tests created, 73% pass rate)
- 🟡 **TS-22:** Keyboard Navigation - Skip All-In Player (Edge cases need fixes)
- 🟡 **TS-23:** Keyboard Navigation - Multiple Bet/Raise (More Action logic needs review)

---

**Last Updated:** 2025-01-06
**Status:** Development In Progress
**Current Sprint:** Keyboard Navigation & UI Completion
