# Playwright Tutorial - Learn by Example

This tutorial will teach you Playwright basics using your poker app as an example.

## 1. Basic Test Structure

Every Playwright test has this structure:

```typescript
import { test, expect } from '@playwright/test';

test('test description', async ({ page }) => {
  // Your test code here
});
```

## 2. Simple Example - Test Stack Setup Page

Let's start with a very simple test:

```typescript
import { test, expect } from '@playwright/test';

test('should load the Stack Setup page', async ({ page }) => {
  // Step 1: Navigate to your app
  await page.goto('/');

  // Step 2: Wait for page to load
  await page.waitForLoadState('networkidle');

  // Step 3: Check if title exists
  await expect(page.getByText('Stack Setup')).toBeVisible();

  // Step 4: Check if button exists
  await expect(page.getByRole('button', { name: /Setup Players/i })).toBeVisible();
});
```

## 3. Interacting with Elements

### Finding Elements

Playwright has several ways to find elements (in order of preference):

```typescript
// 1. By Role (BEST - most accessible)
page.getByRole('button', { name: /Setup Players/i })
page.getByRole('textbox', { name: /Big Blind/i })

// 2. By Text
page.getByText('Stack Setup')
page.getByText(/Create PreFlop/i)  // with regex

// 3. By Label
page.getByLabel('Big Blind')

// 4. By Placeholder
page.getByPlaceholder('Enter amount')

// 5. By CSS Selector (last resort)
page.locator('input[type="number"]')
page.locator('.my-class')
```

### Common Actions

```typescript
// Click
await page.getByRole('button', { name: /Setup Players/i }).click();

// Type text
await page.getByLabel('Big Blind').fill('1000');

// Clear and type
await page.locator('input[type="number"]').clear();
await page.locator('input[type="number"]').fill('500');

// Press keyboard keys
await page.keyboard.press('Enter');
await page.keyboard.press('c');  // for check action

// Hover
await page.getByRole('button').hover();

// Check checkbox
await page.getByRole('checkbox').check();
```

### Assertions

```typescript
// Element is visible
await expect(page.getByText('PreFlop')).toBeVisible();

// Element is hidden
await expect(page.getByText('Error')).not.toBeVisible();

// Input has value
await expect(page.locator('input[type="number"]')).toHaveValue('1000');

// Element is disabled
await expect(page.getByRole('button')).toBeDisabled();

// Element has text
await expect(page.getByRole('heading')).toHaveText('Stack Setup');

// Count elements
await expect(page.getByRole('row')).toHaveCount(5);
```

## 4. Complete Example - Add Players and Navigate

Here's a complete working example:

```typescript
import { test, expect } from '@playwright/test';

test('should add players and navigate to PreFlop', async ({ page }) => {
  // 1. Navigate to app
  console.log('Step 1: Loading app...');
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 2. Set blinds
  console.log('Step 2: Setting blinds...');
  await page.locator('input[type="number"]').nth(0).fill('1000');  // BB
  await page.locator('input[type="number"]').nth(1).fill('500');   // SB

  // 3. Add players via textarea
  console.log('Step 3: Adding players...');
  const textarea = page.locator('textarea').first();
  await textarea.fill('Alice Dealer 10000\nBob SB 8000\nCharlie BB 15000');

  // 4. Click Setup Players
  console.log('Step 4: Setting up players...');
  await page.getByRole('button', { name: /Setup Players/i }).click();
  await page.waitForTimeout(500);  // Wait for processing

  // 5. Verify players were added (check for Create PreFlop button)
  console.log('Step 5: Verifying setup...');
  await expect(page.getByRole('button', { name: /Create PreFlop/i })).toBeVisible();

  // 6. Navigate to PreFlop
  console.log('Step 6: Going to PreFlop...');
  await page.getByRole('button', { name: /Create PreFlop/i }).click();

  // 7. Verify we're on PreFlop page
  console.log('Step 7: Verifying PreFlop view...');
  await expect(page.getByText('PreFlop')).toBeVisible();
  await expect(page.getByText('Alice')).toBeVisible();
  await expect(page.getByText('Bob')).toBeVisible();
  await expect(page.getByText('Charlie')).toBeVisible();

  console.log('✅ Test passed!');
});
```

## 5. Debugging Tips

### Visual Mode (See What's Happening)

```bash
# Run with browser visible
npx playwright test --headed

# Run with slow motion (500ms delay between actions)
npx playwright test --headed --debug

# Run specific test file
npx playwright test my-test.spec.ts --headed
```

### Playwright Inspector (Step Through Test)

```bash
npx playwright test --debug
```

This opens a GUI where you can:
- Step through each action
- Pause/resume execution
- Inspect elements
- See screenshots

### Screenshots and Videos

```typescript
// Take screenshot
await page.screenshot({ path: 'screenshot.png' });

// Screenshot of specific element
await page.locator('.my-element').screenshot({ path: 'element.png' });
```

### Console Logging

```typescript
// Log to console
console.log('[TEST] Doing something...');

// Capture browser console
page.on('console', msg => {
  console.log(`[BROWSER] ${msg.text()}`);
});

// Capture errors
page.on('pageerror', error => {
  console.log(`[ERROR] ${error.message}`);
});
```

## 6. Waiting for Things

```typescript
// Wait for element to be visible
await page.waitForSelector('text=PreFlop', { timeout: 5000 });

// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Wait for specific time (use sparingly!)
await page.waitForTimeout(500);

// Wait for element to appear
await page.waitForSelector('.loading-spinner', { state: 'hidden' });

// Wait for navigation
await page.waitForURL('**/preflop');
```

## 7. Advanced: Multiple Elements

```typescript
// Get all matching elements
const buttons = await page.getByRole('button').all();
console.log(`Found ${buttons.length} buttons`);

// Iterate over elements
for (const button of buttons) {
  await button.click();
}

// Count elements
const count = await page.getByRole('row').count();
console.log(`Found ${count} rows`);

// Get specific element by index
await page.locator('input[type="number"]').nth(2).fill('100');  // 3rd input
```

## 8. Handling Dialogs

```typescript
// Accept alert/confirm dialogs
page.on('dialog', async dialog => {
  console.log(`Dialog: ${dialog.message()}`);
  await dialog.accept();
});

// Reject dialog
page.on('dialog', async dialog => {
  await dialog.dismiss();
});
```

## 9. Running Your Tests

```bash
# Run all tests (headless)
npx playwright test

# Run all tests (visible browser)
npx playwright test --headed

# Run specific file
npx playwright test stack-setup.spec.ts

# Run tests matching pattern
npx playwright test -g "should add players"

# Run with UI (best for learning!)
npx playwright test --ui

# View last test report
npx playwright show-report
```

## 10. Your First Exercise

Try creating this simple test yourself:

**File: `tests/e2e/my-first-test.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test('my first playwright test', async ({ page }) => {
  // 1. Go to the app
  await page.goto('/');

  // 2. Check that "Stack Setup" text is visible
  await expect(page.getByText('Stack Setup')).toBeVisible();

  // 3. Check that "Big Blind" text is visible
  await expect(page.getByText('Big Blind')).toBeVisible();

  console.log('✅ My first test passed!');
});
```

**Run it:**
```bash
npx playwright test my-first-test.spec.ts --headed
```

## 11. Common Patterns in Your App

### Pattern 1: Fill a number input
```typescript
await page.locator('input[type="number"]').nth(0).fill('1000');
```

### Pattern 2: Fill textarea with players
```typescript
const textarea = page.locator('textarea').first();
await textarea.fill('Player1 Dealer 10000\nPlayer2 SB 8000');
```

### Pattern 3: Click button and wait
```typescript
await page.getByRole('button', { name: /Setup Players/i }).click();
await page.waitForTimeout(500);
```

### Pattern 4: Navigate between views
```typescript
await page.getByRole('button', { name: /Create PreFlop/i }).click();
await expect(page.getByText('PreFlop')).toBeVisible();
```

## 12. Best Practices

1. **Use data-testid for complex elements**
   ```typescript
   // In your React component:
   <div data-testid="player-card">...</div>

   // In your test:
   await page.getByTestId('player-card').click();
   ```

2. **Use console.log for debugging**
   ```typescript
   console.log('[TEST] About to click button...');
   await button.click();
   console.log('[TEST] Button clicked successfully');
   ```

3. **Add waits for dynamic content**
   ```typescript
   await page.waitForSelector('text=Loading...', { state: 'hidden' });
   ```

4. **Use specific selectors**
   ```typescript
   // ❌ Too generic
   page.locator('button')

   // ✅ More specific
   page.getByRole('button', { name: /Setup Players/i })
   ```

## 13. Next Steps

1. Try running the example tests in this project:
   ```bash
   npx playwright test stack-setup-navigation.spec.ts --headed
   ```

2. Open Playwright UI to explore:
   ```bash
   npx playwright test --ui
   ```

3. Read official docs: https://playwright.dev/docs/intro

4. Practice by writing tests for your poker app!

---

**Need Help?**
- Run with `--headed` to see what's happening
- Run with `--debug` to step through
- Add `console.log()` statements
- Check `playwright-report` folder after test runs
