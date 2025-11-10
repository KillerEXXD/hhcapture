# Vitest Test Infrastructure Issue

**Date:** 2025-11-06
**Status:** BLOCKING - All unit tests failing to run

## Problem Description

All vitest unit tests (13 test files) are failing with the error:
```
Error: No test suite found in file [filename]
```

This prevents running or debugging any of the 100+ unit tests in the project.

## Symptoms

1. **Primary Error:** `No test suite found in file`
2. **Secondary Error (when importing manually):** `Cannot read properties of undefined (reading 'test')`
3. **Vitest Output:** Shows "0 tests" for all test files
4. **Collect Phase:** Completes (100-200ms) but finds no test suites

## What Was Tried

### Configuration Changes
- ✓ Updated `vitest.config.ts` with/without React plugin
- ✓ Added/removed path aliases
- ✓ Tried different pool options (threads, singleThread)
- ✓ Reverted to original commit configuration
- ✓ Updated `tsconfig.json` to include/exclude test files
- ✓ Restored original tsconfig settings

### Cache & Reinstalls
- ✓ Cleared `.vite` and `.vitest` cache directories
- ✓ Ran `npm cache clean --force`
- ✓ Reinstalled vitest with `--force` flag
- ✓ Verified vitest version (1.6.1)

### Code Verification
- ✓ Verified test file structure (proper `describe`, `it`, `expect` usage)
- ✓ Checked imports (all resolve correctly)
- ✓ Confirmed TypeScript compilation (no errors)
- ✓ Verified source files exist and are importable

## Evidence

### Historical Context
- **NEXT_TASKS.md** mentions "7 test failures in playerActionStatus.test.ts"
- This proves tests WERE running previously
- Something changed in the environment/configuration

### Manual Import Test
```bash
npx tsx --eval "import('./src/lib/poker/engine/__tests__/stackEngine.test.ts')"
```
**Result:**
```
Error: Vitest failed to access its internal state.
Cannot read properties of undefined (reading 'test')
```

This indicates vitest runtime isn't initializing properly.

## Root Cause Hypothesis

Vitest's internal state management is failing during the "collect" phase. The global test functions (`describe`, `it`, `expect`) are not being properly injected into the test file context, despite `globals: true` being set in the config.

Possible causes:
1. **Windows Path Issues:** Vitest may have issues with Windows backslash paths
2. **ES Module Configuration:** The `"type": "module"` in package.json may conflict with vitest's loader
3. **Node.js Version:** Running Node v24.6.0, which is very new and may have compatibility issues
4. **Vitest Bug:** This could be a known issue in vitest 1.6.1

## Current Workaround

**NONE** - Tests are completely broken and cannot be run.

## Impact

- Cannot run unit tests
- Cannot verify bug fixes
- Cannot implement test-driven development
- 7 known failing tests in `playerActionStatus.test.ts` cannot be debugged or fixed

## Recommended Next Steps

1. **Check Node.js Version:**
   ```bash
   node --version  # Currently v24.6.0
   nvm use 20      # Try LTS version
   ```

2. **Try Older Vitest Version:**
   ```bash
   npm install vitest@1.0.0 --save-dev
   ```

3. **Alternative: Use tsx Directly:**
   ```bash
   npx tsx --test src/lib/**/*.test.ts
   ```

4. **Check Vitest GitHub Issues:**
   - Search for "No test suite found" + Windows
   - Search for Node v24 compatibility

5. **Create Minimal Reproduction:**
   - Create new project with same setup
   - Isolate the issue

## Files Modified During Investigation

- `vitest.config.ts` - Multiple iterations trying different configs
- `tsconfig.json` - Temporarily removed test exclusions (reverted)

## Related Files

- All test files in `src/**/__tests__/**/*.test.ts`
- `src/lib/poker/validators/__tests__/playerActionStatus.test.ts` (7 known failures)
- `NEXT_TASKS.md` (documents test status)
- `package.json` (vitest configuration)

---

**Note:** This issue should be resolved before attempting to fix the 7 failing tests mentioned in NEXT_TASKS.md.
