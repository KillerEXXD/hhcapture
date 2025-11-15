# Automated E2E Testing for 40 QA Test Cases

This document explains how to run automated end-to-end tests for all 40 QA test cases.

## Overview

The test automation system validates your poker hand calculator app by:
1. Parsing test cases from `docs/QA/40_TestCases.html`
2. Loading each hand into the running app at http://localhost:3001
3. Executing player actions (fold, call, raise, check)
4. Validating pot calculations match expected values
5. Generating comprehensive test reports

## Prerequisites

### Option 1: Python + Selenium (Recommended - Simpler Setup)

```bash
# Install Python dependencies
pip install selenium webdriver-manager beautifulsoup4

# Ensure dev server is running
npm run dev
```

### Option 2: Playwright (More Advanced)

```bash
# Install Playwright
npx playwright install

# Ensure dev server is running
npm run dev
```

## Running Tests

### Method 1: Python Selenium Tests (Easiest)

```bash
# Run automated E2E tests for first 5 test cases
python test_40_cases_automated.py
```

The script will:
- Open Chrome browser
- Load each test case
- Execute actions
- Validate pot calculations
- Generate `test-results/e2e-results.json` report

To test all 40 cases, edit `test_40_cases_automated.py` line 288:
```python
for tc in test_cases:  # Remove [:5] to test all
```

### Method 2: Playwright Tests

```bash
# Run tests with UI (watch tests execute)
npx playwright test --ui

# Run tests headless (faster)
npx playwright test

# Run specific test
npx playwright test --grep "TC-1"

# View HTML report
npx playwright show-report
```

## Test Reports

After running tests, you'll find:

- **Python/Selenium**: `test-results/e2e-results.json`
- **Playwright**: `playwright-report/index.html`

### Sample Report Output

```
================================================================================
🧪 AUTOMATED E2E TESTING - 40 QA TEST CASES
================================================================================

📋 Loaded 40 test cases

🧪 Running TC-1: 3 players, Expected Pot: $6,000
   ✅ PASSED - Pot: $6,000

🧪 Running TC-2: 4 players, Expected Pot: $12,000
   ✅ PASSED - Pot: $12,000

================================================================================
📊 TEST SUMMARY
================================================================================
Total Tests: 40
✅ Passed: 38
❌ Failed: 2
Pass Rate: 95.0%
```

## Debugging Failed Tests

If a test fails:

1. **Check the error message** in the console output
2. **Run in headed mode** to see what's happening:
   ```python
   # In test_40_cases_automated.py, comment out line 186:
   # options.add_argument('--headless')
   ```
3. **Add breakpoints** or `time.sleep()` to pause execution
4. **Check browser console** for JavaScript errors

## Customizing Tests

### Test Specific Cases

Edit `test_40_cases_automated.py`:

```python
# Test only TC-5, TC-10, TC-15
for tc in [tc for tc in test_cases if tc.id in [5, 10, 15]]:
    result = runner.run_test_case(tc)
    results.append(result)
```

### Adjust Timeouts

```python
# Increase wait time if your app is slow
time.sleep(1)  # Increase to 2 or 3 seconds
```

### Test Different Browsers

For Playwright, edit `playwright.config.ts`:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
],
```

## Continuous Integration (CI)

To run tests in CI/CD pipelines:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run dev &
      - run: npx playwright test
```

## Troubleshooting

### "Element not found" errors

- **Cause**: App UI structure changed
- **Fix**: Update selectors in `_execute_preflop_actions()` and `_get_pot_calculation()`

### Tests timing out

- **Cause**: App loading slowly
- **Fix**: Increase timeouts in test configuration

### Chrome driver issues

- **Fix**: Update webdriver-manager:
  ```bash
  pip install --upgrade webdriver-manager
  ```

### Port 3001 already in use

- **Fix**: Kill existing dev server:
  ```bash
  # Windows
  netstat -ano | findstr :3001
  taskkill /PID <PID> /F

  # Mac/Linux
  lsof -i :3001
  kill -9 <PID>
  ```

## Next Steps

1. **Run first 5 tests** to verify setup
2. **Fix any failing tests** by checking selectors
3. **Run all 40 tests** once first 5 pass
4. **Set up CI/CD** to run tests automatically
5. **Add more test coverage** (flop, turn, river actions)

## Support

For issues or questions:
1. Check the error messages and logs
2. Review `test_40_cases_automated.py` comments
3. Check browser console for JavaScript errors
