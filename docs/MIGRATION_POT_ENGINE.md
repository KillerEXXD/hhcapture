# Migration Plan: Deprecate potEngine.ts

## Executive Summary

Consolidate pot calculation logic by deprecating `potEngine.ts` in favor of `potCalculationEngine.ts`.

**Current Status:**
- ✅ `potCalculationEngine.ts` is the primary engine used throughout the codebase
- ⚠️ `potEngine.ts` exists but is only used by `usePotCalculation` hook
- ⚠️ `usePotCalculation` hook is NOT actually used anywhere (prop drilling but no method calls)

## Analysis

### Files Using potCalculationEngine.ts ✅
- `src/lib/poker/engine/processStack.ts` - Main processing logic
- `src/components/game/PreFlopView.tsx` - Direct import
- `src/components/game/FlopView.tsx` - Direct import
- `src/components/game/TurnView.tsx` - Direct import
- `src/components/game/RiverView.tsx` - Direct import
- `src/lib/poker/engine/potDisplayFormatter.ts` - Display formatting

### Files Using potEngine.ts ⚠️
- `src/hooks/usePotCalculation.ts` - **ONLY** usage
  - Hook is instantiated in App.tsx
  - Hook is passed to all game views as `potCalculation` prop
  - **BUT: No methods from the hook are actually called!**

### Unique Functions in potEngine.ts

These functions need to be preserved or relocated:

1. **`getLastActionInBettingRound()`** - Get player's last action in a betting round
2. **`hasPlayerFolded()`** - Check if player folded in current or previous stages
3. **`getPreviousRoundInfo()`** - Get previous round information for UI display
4. **`checkBettingRoundStatus()`** - Check if betting round is complete

## Migration Steps

### Phase 1: Preserve Useful Functions ✅

1. **Create `src/lib/poker/utils/playerActionUtils.ts`**
   - Move: `getLastActionInBettingRound()`
   - Move: `hasPlayerFolded()`
   - These are general player action utilities, not pot-specific

2. **Keep `checkBettingRoundStatus()` in potCalculationEngine.ts**
   - This is pot-related logic
   - Add it to potCalculationEngine.ts if not already there

3. **Keep `getPreviousRoundInfo()` in potCalculationEngine.ts**
   - This is pot display logic
   - Add it to potCalculationEngine.ts if not already there

### Phase 2: Update usePotCalculation Hook ✅

1. **Update imports in `src/hooks/usePotCalculation.ts`**
   ```typescript
   // OLD
   import { ... } from '../lib/poker/engine/potEngine';

   // NEW
   import { ... } from '../lib/poker/engine/potCalculationEngine';
   import { hasPlayerFolded } from '../lib/poker/utils/playerActionUtils';
   ```

2. **Test the hook** (even though it's not used)

### Phase 3: Remove Unused Code ✅

Since `usePotCalculation` hook is not actually used:

**Option A: Remove the hook entirely**
- Remove `src/hooks/usePotCalculation.ts`
- Remove from `src/hooks/index.ts`
- Remove `potCalculation` prop from all game views
- Remove from `App.tsx`

**Option B: Keep the hook for future use**
- Update it to use `potCalculationEngine.ts`
- Document it for future reference
- But remove the unused prop drilling

**Recommendation: Option A** - Remove unused code

### Phase 4: Deprecate potEngine.ts ✅

1. **Add deprecation notice to top of file**
   ```typescript
   /**
    * @deprecated This file is deprecated. Use potCalculationEngine.ts instead.
    *
    * This file will be removed in a future version.
    * All new code should use potCalculationEngine.ts.
    *
    * Migration date: 2025-11-14
    * Target removal: Next major version
    */
   ```

2. **Create a redirect/re-export** (temporary)
   ```typescript
   // Re-export from new location for backwards compatibility
   export * from './potCalculationEngine';
   ```

### Phase 5: Final Cleanup ✅

1. **Remove potEngine.ts completely**
2. **Update tests** to use potCalculationEngine.ts
3. **Update documentation**

## Benefits

1. **Reduced codebase**: -814 lines of duplicate code
2. **Single source of truth**: One pot calculation engine
3. **Easier maintenance**: Only one file to fix when bugs occur
4. **Clearer architecture**: Obvious where pot logic lives
5. **Better performance**: No duplicate function definitions

## Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing functionality | Low | High | Comprehensive testing before removal |
| Third-party dependencies | None | N/A | No external packages use this |
| Future use of hook | Low | Low | Hook can be recreated if needed |

## Timeline

1. **Week 1**: Move helper functions, update hook
2. **Week 2**: Remove unused prop drilling, add deprecation notice
3. **Week 3**: Testing and verification
4. **Week 4**: Remove potEngine.ts completely

## Testing Checklist

- [ ] All pot calculations work correctly
- [ ] No TypeScript errors
- [ ] All game views render correctly
- [ ] Process Stack button works
- [ ] Winner selection works
- [ ] Next hand generation works
- [ ] All unit tests pass
- [ ] No console errors

## Files to Modify

1. ✅ Create `src/lib/poker/utils/playerActionUtils.ts`
2. ✅ Update `src/lib/poker/engine/potCalculationEngine.ts` (add missing functions)
3. ✅ Update `src/hooks/usePotCalculation.ts` (change imports)
4. ⚠️ Remove `src/hooks/usePotCalculation.ts` (if Option A)
5. ✅ Update `src/hooks/index.ts`
6. ✅ Update `src/App.tsx` (remove hook instantiation)
7. ✅ Update `src/components/game/PreFlopView.tsx` (remove prop)
8. ✅ Update `src/components/game/FlopView.tsx` (remove prop)
9. ✅ Update `src/components/game/TurnView.tsx` (remove prop)
10. ✅ Update `src/components/game/RiverView.tsx` (remove prop)
11. ✅ Add deprecation notice to `src/lib/poker/engine/potEngine.ts`
12. ✅ Update tests

## Rollback Plan

If issues arise:
1. Revert to using potEngine.ts in usePotCalculation hook
2. Keep both files until issues resolved
3. Re-test thoroughly before attempting migration again

## Approval Required

- [ ] Technical Lead Review
- [ ] QA Testing Complete
- [ ] Documentation Updated

---

**Created**: 2025-11-14
**Author**: Migration Assistant
**Status**: Draft
