# Pending Fixes from Dev_HHTool to HHTool_Modular

This document tracks all bug fixes and improvements from Dev_HHTool that need to be applied to HHTool_Modular when building game view components.

## ✅ COMPLETED FIXES

### 1. Forced All-In Amount Tracking (StackSetupView)
- **Status:** ✅ COMPLETED
- **Location:** `src/components/StackSetupView.tsx` lines 168-239
- **Changes:**
  - Added `forcedAllInAmount` variable tracking
  - Stores the live bet amount when player is forced all-in during blind posting
  - Handles all cases: SB, heads-up dealer, BB with both ante orders

---

## 🔴 CRITICAL FIXES (Must Apply When Building Game Views)

### 2. Auto-Focus for Bet/Raise - 200ms Timeout
- **Status:** ✅ COMPLETED
- **Location:** `src/lib/poker/utils/focusUtils.ts` lines 175-210
- **Change:** Increased timeout from 100ms to **200ms** in focusAmountInput function

```typescript
// When Bet or Raise is clicked
if (actionValue === 'bet' || actionValue === 'raise') {
    setTimeout(() => {
        const inputId = `amount-input-${playerId}${suffix || ''}`;
        const amountInput = document.querySelector(`#${inputId}`) as HTMLInputElement;
        if (amountInput) {
            amountInput.focus();
            amountInput.select();
        }
    }, 200); // Was 100ms, now 200ms
}
```

### 3. AmountInput Component - Three Critical Fixes
- **Status:** ✅ COMPLETED
- **Location:** `src/components/poker/AmountInput.tsx` (created)

#### Fix 3A: Prevent Input Clearing on Re-render
```typescript
// Only update if selectedAmount is truthy
if (selectedAmount !== undefined && selectedAmount !== null && selectedAmount !== '') {
    setLocalAmount(selectedAmount);
} else {
    // Keep current localAmount - don't clear user input
}
```

#### Fix 3B: Tab Key Double-Validation Fix
```typescript
// In onKeyDown handler
if (e.key === 'Tab') {
    validateAndSave();
    e.currentTarget.dataset.skipBlur = 'true'; // Mark to skip blur validation
}

// In onBlur handler
if (e.currentTarget.dataset.skipBlur === 'true') {
    delete e.currentTarget.dataset.skipBlur;
    return; // Skip blur validation
}
```

#### Fix 3C: Unit "None" Handling
```typescript
// When calculating actual amount
if (unit === 'K') {
    actualAmount = enteredValue * 1000;
} else if (unit === 'Mil') {
    actualAmount = enteredValue * 1000000;
} else {
    // Unit is "None" or anything else - use actual value (no multiplier)
    actualAmount = enteredValue;
}
```

### 4. More Action Round Completion Check Before Moving Focus
- **Dev_HHTool Location:** Lines 4963-5104
- **Priority:** 🔴 CRITICAL
- **Apply to:** `src/hooks/useActionHandler.ts`
- **Applied to Actions:** Call, All-in, Fold, Check

```typescript
// After player acts in More Action rounds
if (suffix === '_moreAction' || suffix === '_moreAction2') {
    // Check if round is complete before moving focus
    setTimeout(() => {
        const actionLevel = suffix === '_moreAction' ? 'more' : 'more2';
        const completionCheck = checkBettingRoundComplete(stage, actionLevel, playerData);

        if (!completionCheck.isComplete) {
            moveToNextPlayer(playerId, stage, suffix, actionName);
        } else {
            console.log('Round complete - not moving focus');
        }
    }, 50);
} else {
    // Base round - always move
    moveToNextPlayer(playerId, stage, suffix, actionName);
}
```

### 5. moveToNextPlayer Function - Improved Focus Management
- **Status:** ✅ COMPLETED
- **Location:** `src/lib/poker/utils/focusUtils.ts` (created)

**Key Changes:**
- Fold action gets **650ms delay** (vs 150ms for others)
- Uses `requestAnimationFrame` for better timing
- Forces blur on current element before focusing next
- Retry mechanism: up to 5 attempts with 100ms between retries

```typescript
const moveToNextPlayer = (playerId, stage, suffix, actionName = '') => {
    // Fold has animation, needs longer delay
    const delay = actionName === 'Fold' ? 650 : 150;

    setTimeout(() => {
        // Find next player logic...

        const tryFocus = (attempts = 0) => {
            const nextElement = document.querySelector(selector) as HTMLElement;

            if (nextElement) {
                // Force blur on current element first
                const currentFocused = document.activeElement as HTMLElement;
                if (currentFocused && currentFocused.blur) {
                    currentFocused.blur();
                }

                // Use requestAnimationFrame for better timing
                requestAnimationFrame(() => {
                    nextElement.focus();

                    // Verify focus after 100ms, retry if failed (up to 5 attempts)
                    setTimeout(() => {
                        const focused = document.activeElement;
                        if (focused !== nextElement && attempts < 5) {
                            setTimeout(() => tryFocus(attempts + 1), 100);
                        }
                    }, 100);
                });
            }
        };

        tryFocus();
    }, delay);
};
```

---

## 🟡 MEDIUM PRIORITY FIXES

### 6. checkBettingRoundComplete Function
- **Status:** ✅ COMPLETED
- **Location:** `src/lib/poker/validators/roundCompletionValidator.ts` (created)
- **Description:** Complex logic for determining when More Action rounds are complete
- **Features:**
  - Separate preflop vs postflop logic
  - Call pending resolution
  - Pending player detection
  - All-in detection
  - Contribution matching
  - Exported from validators index

### 7. Ante Exclusion from BB Contribution
- **Dev_HHTool Location:** Lines 1217-1236
- **Priority:** 🟡 MEDIUM
- **Apply to:** `src/lib/poker/engine/potEngine.ts`
- **Description:** Ante is DEAD money and should NOT count toward BB's live contribution that others must match

```typescript
// In pot calculation
if (stage === 'preflop') {
    const bbPlayer = contributions.find(c => c.position?.toLowerCase() === 'bb');
    if (bbPlayer && bbPlayer.postedAnte > 0) {
        // BB's contribution = postedBB + additional actions
        // NOT: (postedBB + postedAnte) + additional actions
        const additionalAction = bbPlayer.totalContribution - bbPlayer.postedBB;
        console.log(`BB Contribution: ${bbPlayer.postedBB} blind + ${additionalAction} action`);
        console.log(`Ante (${bbPlayer.postedAnte}) correctly excluded`);
    }
}
```

---

## 🟢 LOWER PRIORITY FIXES

### 8. Card Validation - Skip for Folded Players
- **Dev_HHTool Location:** Lines 701-747
- **Priority:** 🟢 LOW
- **Apply to:** `src/lib/poker/validators/sectionValidator.ts`

```typescript
// Skip card validation for folded players
if (action === 'fold') {
    console.log('Skipping card validation (folded)');
    return; // Don't validate cards
}
```

### 9. Auto-Calculation Disabled
- **Dev_HHTool Location:** Lines 3947-4236, 4998-5000
- **Priority:** 🟢 LOW
- **Apply to:** All action handlers
- **Description:** Ensure stack calculations only happen on explicit "Process Stack" button click, not automatically on amount input

---

## 📋 NEW FILES TO CREATE

When building game views, create these new files with the fixes applied:

1. **`src/components/poker/AmountInput.tsx`**
   - Apply Fix #3 (all three sub-fixes)

2. **`src/lib/poker/utils/focusUtils.ts`**
   - Apply Fix #5 (moveToNextPlayer function)

3. **`src/lib/poker/validators/roundCompletionValidator.ts`**
   - Apply Fix #6 (checkBettingRoundComplete function)

4. **`src/hooks/useFocusManagement.ts`**
   - Centralized focus management hook
   - Apply Fix #2 and Fix #5

5. **`src/components/poker/ActionButtons.tsx`**
   - Apply Fix #2 (auto-focus with 200ms timeout)
   - Apply Fix #4 (completion check before focus movement)

---

## 🔍 VERIFICATION CHECKLIST

When applying each fix, verify:
- [ ] TypeScript compilation passes (0 errors)
- [ ] Unit tests pass (if applicable)
- [ ] Manual testing confirms fix works
- [ ] Console logs match Dev_HHTool behavior
- [ ] No regressions introduced
- [ ] Update this file to mark fix as ✅ COMPLETED

---

## 📝 NOTES

- All line numbers reference the current Dev_HHTool codebase (c:\Apps\HUDR\Dev_HHTool\src\components\PokerHandCollector.tsx)
- These fixes are proven and tested in production Dev_HHTool
- Apply fixes in order of priority (🔴 → 🟡 → 🟢)
- Update todo list in project management tool as fixes are applied

---

Last Updated: 2025-11-04
Version: 1.0
