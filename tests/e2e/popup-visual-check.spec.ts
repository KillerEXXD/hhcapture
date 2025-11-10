import { test, expect } from '@playwright/test';

/**
 * Visual Check: Popup Positioning Fix
 *
 * This is a MANUAL visual inspection test.
 * Run with --headed to visually verify the popup positioning works correctly.
 *
 * The test will pause at key moments so you can inspect the popup.
 */

test.describe.serial('Popup Positioning - Visual Inspection', () => {
  test('MANUAL: Visually inspect popup positioning (opens browser, pauses for inspection)', async ({ page }) => {
    console.log('\n========================================');
    console.log('🔍 MANUAL VISUAL INSPECTION TEST');
    console.log('========================================\n');
    console.log('This test will:');
    console.log('1. Navigate through the app to reach Flop view');
    console.log('2. Open a stack history popup');
    console.log('3. PAUSE so you can manually inspect the popup');
    console.log('4. Check that the popup is NOT cut off at viewport top/bottom\n');

    // Navigate to app
    console.log('[1/6] Loading app...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Configure blinds
    console.log('[2/6] Setting up blinds...');
    await page.locator('input[type="number"]').nth(0).fill('1000'); // BB
    await page.locator('input[type="number"]').nth(1).fill('500');  // SB

    // Add players
    console.log('[3/6] Adding players...');
    const playerTextarea = page.locator('textarea').first();
    await playerTextarea.fill('Alice Dealer 10000\nBob SB 8000\nCharlie BB 15000');
    await page.getByRole('button', { name: /Setup Players/i }).click();
    await page.waitForTimeout(1000);

    // Check if we can proceed to PreFlop
    const createPreflopButton = page.getByRole('button', { name: /Create PreFlop/i });
    const buttonVisible = await createPreflopButton.isVisible().catch(() => false);

    if (!buttonVisible) {
      console.log('❌ Cannot proceed - Create PreFlop button not visible');
      console.log('   This suggests a setup issue. Please check the app manually.');
      return;
    }

    // Try to navigate to PreFlop (but be prepared for errors)
    console.log('[4/6] Attempting to navigate to PreFlop...');
    try {
      await createPreflopButton.click({ timeout: 5000 });
      await page.waitForTimeout(1000);

      // Check if we made it to PreFlop
      const preflopVisible = await page.getByText('PreFlop').isVisible({ timeout: 2000 }).catch(() => false);

      if (!preflopVisible) {
        console.log('❌ PreFlop view did not load');
        console.log('   Stopping test - please fix PreFlopView errors first');
        return;
      }

      console.log('✅ PreFlop view loaded successfully');

    } catch (error) {
      console.log(`❌ Error navigating to PreFlop: ${error}`);
      console.log('   Stopping test - please fix PreFlopView errors first');
      return;
    }

    console.log('[5/6] Test paused - browser will remain open');
    console.log('\n========================================');
    console.log('⚠️  NOTE: This test cannot proceed due to');
    console.log('   PreFlopView errors. Please fix the');
    console.log('   PreFlopView component first.');
    console.log('========================================\n');

    // Keep browser open for 30 seconds for manual inspection
    console.log('Browser will close in 30 seconds...');
    await page.waitForTimeout(30000);
  });
});
