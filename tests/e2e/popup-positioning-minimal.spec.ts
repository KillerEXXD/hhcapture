import { test, expect } from '@playwright/test';

/**
 * Minimal Test Suite: Popup Positioning Fix Validation
 *
 * This is a streamlined test with just the essential validation:
 * - Stack history popup opens without viewport cutoff
 * - Fixed positioning works correctly
 */

test.describe.serial('Popup Positioning - Essential Tests Only', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        console.log(`[BROWSER ${type.toUpperCase()}]`, msg.text());
      }
    });

    page.on('pageerror', error => {
      console.log('[PAGE ERROR]', error.message);
    });

    console.log('[TEST] Setting up test environment...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Quick setup
    await page.locator('input[type="number"]').nth(0).fill('1000'); // BB
    await page.locator('input[type="number"]').nth(1).fill('500');  // SB

    const playerTextarea = page.locator('textarea').first();
    await playerTextarea.fill('Alice Dealer 10000\nBob SB 8000\nCharlie BB 15000');
    await page.getByRole('button', { name: /Setup Players/i }).click();
    await page.waitForTimeout(500);

    // Navigate to PreFlop
    await page.getByRole('button', { name: /Create PreFlop/i }).click();
    await expect(page.getByText('PreFlop')).toBeVisible();

    // Select actions
    const players = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' }
    ];

    for (const player of players) {
      const actionContainer = page.locator(`[data-action-focus="${player.id}-preflop"]`).first();
      const isVisible = await actionContainer.isVisible().catch(() => false);
      if (isVisible) {
        await actionContainer.focus();
        await page.keyboard.press('c');
      }
    }

    // Handle dialog
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Process stack
    const processStackButton = page.getByRole('button', { name: /Process Stack/i }).first();
    const processVisible = await processStackButton.isVisible().catch(() => false);
    if (processVisible) {
      await processStackButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to Flop
    const createFlopButton = page.getByRole('button', { name: /Create Flop/i });
    const flopVisible = await createFlopButton.isVisible().catch(() => false);
    if (flopVisible) {
      await createFlopButton.click();
      await expect(page.getByText('Flop Community Cards')).toBeVisible();
    }

    console.log('[TEST] Setup complete!');
  });

  test('should open popup with correct positioning (no viewport cutoff)', async ({ page }) => {
    console.log('[TEST] Testing popup positioning fix...');

    // Wait for Flop view
    await page.waitForSelector('text=Flop Community Cards', { timeout: 5000 });

    // Find history button
    const historyButton = page.locator('button[title="Show stack history"]').first();
    await historyButton.scrollIntoViewIfNeeded();

    // Open popup
    await historyButton.click();

    // Wait for popup
    const popup = page.locator('[data-stack-history-card]').first();
    await expect(popup).toBeVisible({ timeout: 2000 });

    // Verify positioning
    const popupBox = await popup.boundingBox();
    expect(popupBox).not.toBeNull();

    if (popupBox) {
      // Main validation: popup should not be cut off at top
      expect(popupBox.y).toBeGreaterThanOrEqual(10);
      console.log(`[TEST] ✅ Popup top position: ${popupBox.y}px (should be >= 10px)`);

      // Verify it's within viewport
      const viewportSize = page.viewportSize();
      if (viewportSize) {
        expect(popupBox.y + popupBox.height).toBeLessThanOrEqual(viewportSize.height);
        console.log(`[TEST] ✅ Popup bottom: ${popupBox.y + popupBox.height}px, Viewport height: ${viewportSize.height}px`);
      }

      // Verify fixed positioning
      const position = await popup.evaluate(el => window.getComputedStyle(el).position);
      expect(position).toBe('fixed');
      console.log(`[TEST] ✅ Popup uses fixed positioning`);

      // Verify z-index
      const zIndex = await popup.evaluate(el => window.getComputedStyle(el).zIndex);
      expect(parseInt(zIndex)).toBeGreaterThanOrEqual(9999);
      console.log(`[TEST] ✅ Popup z-index: ${zIndex}`);
    }

    console.log('[TEST] ✅ All positioning checks passed!');
  });
});
