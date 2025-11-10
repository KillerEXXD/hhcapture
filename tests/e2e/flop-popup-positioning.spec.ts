import { test, expect } from '@playwright/test';

/**
 * Test Suite: Flop View Smart Popup Positioning
 *
 * This test validates:
 * - Stack history popup positioning (the fix we just implemented)
 * - Popup visibility without cutoff at top/bottom of viewport
 * - Smart positioning above/below based on available space
 * - Popup content scrollability
 */

// Use test.describe.serial to run tests one after another in the same browser context
test.describe.serial('Flop View - Smart Popup Positioning', () => {
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

    // Quick setup: Configure stack and players
    console.log('[TEST] Configuring blinds...');
    await page.locator('input[type="number"]').nth(0).fill('1000'); // BB
    await page.locator('input[type="number"]').nth(1).fill('500');  // SB
    console.log('[TEST] Blinds configured');

    // Add players using textarea (must include Dealer, SB, and BB)
    console.log('[TEST] Adding players via textarea...');
    const playerTextarea = page.locator('textarea').first();
    await playerTextarea.fill('Alice Dealer 10000\nBob SB 8000\nCharlie BB 15000');
    console.log('[TEST] Players added to textarea');

    // Click Setup Players button
    console.log('[TEST] Clicking Setup Players button...');
    await page.getByRole('button', { name: /Setup Players/i }).click();
    await page.waitForTimeout(500); // Wait for players to be processed
    console.log('[TEST] Players setup complete');

    // Navigate to PreFlop
    console.log('[TEST] Navigating to PreFlop...');
    await page.getByRole('button', { name: /Create PreFlop/i }).click();
    await expect(page.getByText('PreFlop')).toBeVisible();
    console.log('[TEST] PreFlop view loaded');

    // Select some actions in PreFlop (so we have stack data)
    console.log('[TEST] Selecting PreFlop actions...');
    const players = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' }
    ];

    for (const player of players) {
      const actionContainer = page.locator(`[data-action-focus="${player.id}-preflop"]`).first();
      const isVisible = await actionContainer.isVisible().catch(() => false);
      console.log(`[TEST] ${player.name} action container visible: ${isVisible}`);

      if (isVisible) {
        await actionContainer.focus();
        await page.keyboard.press('c'); // check
        console.log(`[TEST] ${player.name} checked`);
      }
    }

    // Handle dialog before clicking Process Stack
    page.on('dialog', async dialog => {
      console.log(`[TEST] Dialog appeared: ${dialog.message()}`);
      await dialog.accept();
    });

    // Process stack
    console.log('[TEST] Processing stack...');
    const processStackButton = page.getByRole('button', { name: /Process Stack/i }).first();
    const processVisible = await processStackButton.isVisible().catch(() => false);
    console.log(`[TEST] Process Stack button visible: ${processVisible}`);

    if (processVisible) {
      await processStackButton.click();
      await page.waitForTimeout(500);
      console.log('[TEST] Stack processed');
    }

    // Navigate to Flop
    console.log('[TEST] Navigating to Flop...');
    const createFlopButton = page.getByRole('button', { name: /Create Flop/i });
    const flopVisible = await createFlopButton.isVisible().catch(() => false);
    console.log(`[TEST] Create Flop button visible: ${flopVisible}`);

    if (flopVisible) {
      await createFlopButton.click();
      await expect(page.getByText('Flop Community Cards')).toBeVisible();
      console.log('[TEST] Flop view loaded - Setup complete!');
    }
  });

  test('should open stack history popup without getting cut off at viewport top', async ({ page }) => {
    console.log('[TEST] Starting popup positioning test...');

    // Wait for Flop view to be ready
    await page.waitForSelector('text=Flop Community Cards', { timeout: 5000 });
    console.log('[TEST] Flop view ready');

    // Find the first stack history button (info icon)
    const historyButton = page.locator('button[title="Show stack history"]').first();
    const buttonExists = await historyButton.count();
    console.log(`[TEST] Found ${buttonExists} history button(s)`);

    // Scroll to make sure button is near the top of viewport
    await historyButton.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 100)); // Scroll down a bit to position button near top

    // Get button position before opening
    const buttonBox = await historyButton.boundingBox();
    expect(buttonBox).not.toBeNull();

    // Click the history button to open popup
    await historyButton.click();

    // Wait for popup to appear
    const popup = page.locator('[data-stack-history-card]').first();
    await expect(popup).toBeVisible({ timeout: 2000 });

    // Get popup position
    const popupBox = await popup.boundingBox();
    expect(popupBox).not.toBeNull();

    if (popupBox) {
      // Verify popup is not cut off at top (should have at least 10px margin)
      expect(popupBox.y).toBeGreaterThanOrEqual(10);

      // Verify popup is fully within viewport
      const viewportSize = page.viewportSize();
      expect(viewportSize).not.toBeNull();

      if (viewportSize) {
        // Popup should not extend beyond viewport bottom
        expect(popupBox.y + popupBox.height).toBeLessThanOrEqual(viewportSize.height);

        // Popup should be horizontally centered (approximately)
        const centerX = viewportSize.width / 2;
        const popupCenterX = popupBox.x + popupBox.width / 2;
        // Allow some tolerance for centering (within 50px)
        expect(Math.abs(popupCenterX - centerX)).toBeLessThan(50);
      }
    }

    // Verify popup has proper z-index (should be on top)
    const zIndex = await popup.evaluate(el => window.getComputedStyle(el).zIndex);
    expect(parseInt(zIndex)).toBeGreaterThanOrEqual(9999);
  });

  test('should position popup below button when there is enough space', async ({ page }) => {
    // Wait for Flop view
    await page.waitForSelector('text=Flop Community Cards', { timeout: 5000 });

    // Scroll to top to ensure there's space below
    await page.evaluate(() => window.scrollTo(0, 0));

    // Find a history button
    const historyButton = page.locator('button[title="Show stack history"]').first();
    await historyButton.scrollIntoViewIfNeeded();

    // Get button position
    const buttonBoxBefore = await historyButton.boundingBox();
    expect(buttonBoxBefore).not.toBeNull();

    // Click to open popup
    await historyButton.click();

    // Wait for popup
    const popup = page.locator('[data-stack-history-card]').first();
    await expect(popup).toBeVisible({ timeout: 2000 });

    // Get popup position
    const popupBox = await popup.boundingBox();
    const buttonBoxAfter = await historyButton.boundingBox();

    if (popupBox && buttonBoxAfter) {
      // When positioned below, popup top should be below button bottom
      // (with ~8px margin as per our implementation)
      const expectedMinTop = buttonBoxAfter.y + buttonBoxAfter.height;
      expect(popupBox.y).toBeGreaterThanOrEqual(expectedMinTop);
    }
  });

  test('should allow scrolling when popup content exceeds viewport height', async ({ page }) => {
    // Wait for Flop view
    await page.waitForSelector('text=Flop Community Cards', { timeout: 5000 });

    // Open a history popup
    const historyButton = page.locator('button[title="Show stack history"]').first();
    await historyButton.click();

    // Wait for popup
    const popup = page.locator('[data-stack-history-card]').first();
    await expect(popup).toBeVisible({ timeout: 2000 });

    // Check if popup has scrolling capability
    const hasOverflow = await popup.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.overflowY === 'auto' || style.overflowY === 'scroll';
    });

    // Popup should have overflow-y: auto (as per our implementation)
    expect(hasOverflow).toBe(true);

    // Verify max-height is set to prevent viewport overflow
    const maxHeight = await popup.evaluate(el => {
      return window.getComputedStyle(el).maxHeight;
    });

    // Should be calc(100vh - 20px) or similar
    expect(maxHeight).toContain('vh');
  });

  test('should close popup when clicking close button', async ({ page }) => {
    // Wait for Flop view
    await page.waitForSelector('text=Flop Community Cards', { timeout: 5000 });

    // Open popup
    const historyButton = page.locator('button[title="Show stack history"]').first();
    await historyButton.click();

    // Wait for popup to appear
    const popup = page.locator('[data-stack-history-card]').first();
    await expect(popup).toBeVisible({ timeout: 2000 });

    // Find and click the close button (X icon in header)
    const closeButton = popup.locator('button').first(); // First button in popup should be close
    await closeButton.click();

    // Popup should disappear
    await expect(popup).not.toBeVisible({ timeout: 1000 });
  });

  test('should display stack history content correctly', async ({ page }) => {
    // Wait for Flop view
    await page.waitForSelector('text=Flop Community Cards', { timeout: 5000 });

    // Open first player's history popup
    const historyButton = page.locator('button[title="Show stack history"]').first();
    await historyButton.click();

    // Wait for popup
    const popup = page.locator('[data-stack-history-card]').first();
    await expect(popup).toBeVisible({ timeout: 2000 });

    // Verify popup header exists
    await expect(popup.getByText(/Stack History/i)).toBeVisible();

    // Verify sections are visible
    await expect(popup.getByText('PreFlop BASE')).toBeVisible();
    await expect(popup.getByText('FLOP BASE')).toBeVisible();

    // Verify summary section
    await expect(popup.getByText('Summary')).toBeVisible();
    await expect(popup.getByText('Starting Stack:')).toBeVisible();
    await expect(popup.getByText('Total Contributed:')).toBeVisible();
    await expect(popup.getByText('Remaining Stack:')).toBeVisible();
  });

  test('should use fixed positioning for popup (not absolute)', async ({ page }) => {
    // Wait for Flop view
    await page.waitForSelector('text=Flop Community Cards', { timeout: 5000 });

    // Open popup
    const historyButton = page.locator('button[title="Show stack history"]').first();
    await historyButton.click();

    // Wait for popup
    const popup = page.locator('[data-stack-history-card]').first();
    await expect(popup).toBeVisible({ timeout: 2000 });

    // Verify popup uses fixed positioning (not absolute)
    const position = await popup.evaluate(el => window.getComputedStyle(el).position);
    expect(position).toBe('fixed');

    // Scroll the page
    await page.evaluate(() => window.scrollBy(0, 200));

    // Popup should still be visible and in the same viewport position
    // (because it's fixed, not absolute)
    await expect(popup).toBeVisible();

    // Get new position after scroll
    const boxAfterScroll = await popup.boundingBox();
    expect(boxAfterScroll).not.toBeNull();

    // Popup should maintain its position relative to viewport despite page scroll
    if (boxAfterScroll) {
      // The popup's viewport position should remain stable
      expect(boxAfterScroll.y).toBeGreaterThanOrEqual(0);
    }
  });
});
