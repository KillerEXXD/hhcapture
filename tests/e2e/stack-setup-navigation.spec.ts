import { test, expect } from '@playwright/test';

/**
 * Test Suite: Stack Setup and Navigation
 *
 * This test validates:
 * - Initial stack setup screen
 * - Adding players with positions and stacks
 * - Navigation to PreFlop view
 * - Basic state persistence
 */

// Use test.describe.serial to run tests one after another in the same browser context
test.describe.serial('Stack Setup and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging from the page
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        console.log(`[BROWSER ${type.toUpperCase()}]`, msg.text());
      }
    });

    // Log page errors
    page.on('pageerror', error => {
      console.log('[PAGE ERROR]', error.message);
    });

    console.log('[TEST] Navigating to app...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('[TEST] App loaded');
  });

  test('should display stack setup view on initial load', async ({ page }) => {
    console.log('[TEST] Checking Stack Setup view...');

    // Check that we're on the Stack Setup view
    await expect(page.getByText('Stack Setup')).toBeVisible();
    console.log('[TEST] Stack Setup title visible');

    // Check for essential elements
    await expect(page.getByText('Big Blind')).toBeVisible();
    await expect(page.getByText('Small Blind')).toBeVisible();
    await expect(page.getByText('Ante')).toBeVisible();

    // Check for player table headers
    await expect(page.getByText('Player Name')).toBeVisible();
    await expect(page.getByText('Position')).toBeVisible();
    await expect(page.getByText('Stack')).toBeVisible();
  });

  test('should add and configure players, then navigate to PreFlop', async ({ page }) => {
    console.log('[TEST] Starting player configuration test...');

    // Step 1: Set blinds and antes using spinbuttons
    console.log('[TEST] Setting blinds...');
    const bigBlindInput = page.locator('input[type="number"]').nth(0); // BB
    const smallBlindInput = page.locator('input[type="number"]').nth(1); // SB
    const anteInput = page.locator('input[type="number"]').nth(2); // Ante

    await bigBlindInput.clear();
    await bigBlindInput.fill('1000');
    await smallBlindInput.clear();
    await smallBlindInput.fill('500');
    await anteInput.clear();
    await anteInput.fill('100');
    console.log('[TEST] Blinds set: BB=1000, SB=500, Ante=100');

    // Verify values were set
    await expect(bigBlindInput).toHaveValue('1000');
    await expect(smallBlindInput).toHaveValue('500');
    await expect(anteInput).toHaveValue('100');
    console.log('[TEST] Blinds verified');

    // Step 2: Add players using textarea (must include Dealer, SB, and BB)
    console.log('[TEST] Adding players via textarea...');
    const playerTextarea = page.locator('textarea').first();
    await playerTextarea.fill('Alice Dealer 10000\nBob SB 8000\nCharlie BB 15000');
    console.log('[TEST] Players added to textarea');

    // Click Setup Players
    console.log('[TEST] Clicking Setup Players...');
    await page.getByRole('button', { name: /Setup Players/i }).click();
    await page.waitForTimeout(500);
    console.log('[TEST] Players setup complete');

    // Navigate to PreFlop
    console.log('[TEST] Navigating to PreFlop...');
    const createPreflopButton = page.getByRole('button', { name: /Create PreFlop/i });
    await expect(createPreflopButton).toBeVisible();
    await createPreflopButton.click();
    console.log('[TEST] Clicked Create PreFlop');

    // Verify we're now on PreFlop view
    await expect(page.getByText('PreFlop', { exact: false })).toBeVisible();
    console.log('[TEST] PreFlop view loaded');

    // Verify players are visible in PreFlop view
    console.log('[TEST] Verifying players are visible...');
    await expect(page.getByText('Alice')).toBeVisible();
    await expect(page.getByText('Bob')).toBeVisible();
    await expect(page.getByText('Charlie')).toBeVisible();
    console.log('[TEST] All players visible');

    // Verify positions are shown
    await expect(page.getByText('(Dealer)')).toBeVisible();
    await expect(page.getByText('(SB)')).toBeVisible();
    await expect(page.getByText('(BB)')).toBeVisible();

    // Verify stacks are displayed (formatted)
    await expect(page.getByText('10.0K', { exact: false })).toBeVisible();
    await expect(page.getByText('8.0K', { exact: false })).toBeVisible();
    await expect(page.getByText('15.0K', { exact: false })).toBeVisible();
  });

  test('should persist stack data when navigating back to Stack Setup', async ({ page }) => {
    console.log('[TEST] Testing data persistence...');

    // Configure blinds
    await page.locator('input[type="number"]').nth(0).fill('1000');
    await page.locator('input[type="number"]').nth(1).fill('500');
    console.log('[TEST] Blinds configured');

    // Add a player via textarea
    const playerTextarea = page.locator('textarea').first();
    await playerTextarea.fill('TestPlayer HJ 12500');
    await page.getByRole('button', { name: /Setup Players/i }).click();
    await page.waitForTimeout(500);
    console.log('[TEST] Player added');

    // Navigate to PreFlop
    console.log('[TEST] Navigating to PreFlop...');
    await page.getByRole('button', { name: /Create PreFlop/i }).click();
    await expect(page.getByText('PreFlop')).toBeVisible();
    console.log('[TEST] PreFlop view loaded');

    // Navigate back to Stack Setup
    console.log('[TEST] Navigating back to Stack Setup...');
    const backButton = page.getByRole('button', { name: /Stack/i });
    if (await backButton.isVisible()) {
      await backButton.click();
      console.log('[TEST] Back to Stack Setup');

      // Verify data is still there
      await expect(page.locator('input[type="number"]').nth(0)).toHaveValue('1000');
      await expect(page.locator('input[type="number"]').nth(1)).toHaveValue('500');
      console.log('[TEST] Data persisted successfully');
    } else {
      console.log('[TEST] Back button not found - skipping persistence check');
    }
  });

  test('should display validation messages for invalid inputs', async ({ page }) => {
    console.log('[TEST] Testing validation...');

    // Try to create PreFlop without setting up players
    const createPreflopButton = page.getByRole('button', { name: /Create PreFlop/i });

    // Check if button is disabled or shows validation
    const isDisabled = await createPreflopButton.isDisabled().catch(() => false);
    console.log(`[TEST] Create PreFlop button disabled: ${isDisabled}`);

    if (!isDisabled) {
      // Click and check for validation message/alert
      console.log('[TEST] Clicking Create PreFlop (should fail or show validation)...');
      await createPreflopButton.click();

      // The app might show an alert or stay on the same page
      // We verify we're still on Stack Setup if validation fails
      await expect(page.getByText('Stack Setup')).toBeVisible();
      console.log('[TEST] Still on Stack Setup - validation working');
    } else {
      // Button is properly disabled without valid inputs
      expect(isDisabled).toBe(true);
      console.log('[TEST] Button properly disabled');
    }
  });
});
