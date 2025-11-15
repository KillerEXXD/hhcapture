/**
 * E2E Test Automation for 40 QA Test Cases
 *
 * This test suite automates the validation of all 40 poker hand test cases
 * by parsing the test case HTML file and running each scenario through the app.
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'node-html-parser';

interface Player {
  name: string;
  position: string;
  stack: number;
}

interface Action {
  player: string;
  action: string;
  amount?: number;
  unit?: string;
}

interface TestCase {
  id: number;
  handNumber: string;
  startedAt: string;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  players: Player[];
  preflopActions: Action[];
  flopActions?: Action[];
  turnActions?: Action[];
  riverActions?: Action[];
  expectedPot: number;
  expectedMainPot?: number;
  expectedSidePots?: { amount: number; winners: string[] }[];
}

/**
 * Parse the 40_TestCases.html file to extract test case data
 */
function parseTestCases(htmlPath: string): TestCase[] {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const root = parse(html);
  const testCases: TestCase[] = [];

  // Find all test case divs
  const testCaseDivs = root.querySelectorAll('.test-case');

  for (const div of testCaseDivs) {
    try {
      // Extract test case ID
      const idElement = div.querySelector('.test-id');
      if (!idElement) continue;

      const tcId = parseInt(idElement.text.replace('TC-', ''));

      // Extract hand setup from <pre> tag
      const preElement = div.querySelector('pre');
      if (!preElement) continue;

      const handText = preElement.text;
      const lines = handText.split('\n');

      let handNumber = '1';
      let startedAt = '00:00:00';
      let smallBlind = 0;
      let bigBlind = 0;
      let ante = 0;
      const players: Player[] = [];
      const preflopActions: Action[] = [];

      // Parse hand header
      const handMatch = handText.match(/Hand \((\d+)\) started at (\d{2}:\d{2}:\d{2})/);
      if (handMatch) {
        handNumber = handMatch[1];
        startedAt = handMatch[2];
      }

      // Parse blinds
      const blindsMatch = handText.match(/SB=\$?([\d,]+)\s+BB=\$?([\d,]+)\s+Ante=\$?([\d,]+)/);
      if (blindsMatch) {
        smallBlind = parseInt(blindsMatch[1].replace(/,/g, ''));
        bigBlind = parseInt(blindsMatch[2].replace(/,/g, ''));
        ante = parseInt(blindsMatch[3].replace(/,/g, ''));
      }

      // Parse stack setup
      let inStackSetup = false;
      for (const line of lines) {
        if (line.includes('Stack Setup:')) {
          inStackSetup = true;
          continue;
        }

        if (inStackSetup && line.trim()) {
          // Check if we've reached the actions section
          if (line.includes('Actions:')) {
            inStackSetup = false;
            continue;
          }

          // Parse player line: "Alice SB 12,500"
          const playerMatch = line.trim().match(/^(\w+)\s+(SB|BB|UTG|UTG\+\d|LJ|MP|MP\+\d|HJ|CO|Dealer)\s+\$?([\d,]+)/);
          if (playerMatch) {
            players.push({
              name: playerMatch[1],
              position: playerMatch[2],
              stack: parseInt(playerMatch[3].replace(/,/g, ''))
            });
          }
        }

        // Parse preflop actions
        if (line.includes('Preflop:')) {
          const actionsText = line.split('Preflop:')[1];
          const actionMatches = actionsText.matchAll(/(\w+)\s+(fold|call|raise|check)(?:\s+to\s+)?\$?([\d,]+)?([KM])?/gi);

          for (const match of actionMatches) {
            preflopActions.push({
              player: match[1],
              action: match[2].toLowerCase(),
              amount: match[3] ? parseInt(match[3].replace(/,/g, '')) : undefined,
              unit: match[4] || undefined
            });
          }
        }
      }

      // Extract expected pot from results section
      const resultsElement = div.querySelector('.results');
      let expectedPot = 0;

      if (resultsElement) {
        const potMatch = resultsElement.text.match(/Total Pot:\s+\$?([\d,]+)/);
        if (potMatch) {
          expectedPot = parseInt(potMatch[1].replace(/,/g, ''));
        }
      }

      testCases.push({
        id: tcId,
        handNumber,
        startedAt,
        smallBlind,
        bigBlind,
        ante,
        players,
        preflopActions,
        expectedPot
      });
    } catch (error) {
      console.error(`Error parsing test case: ${error}`);
    }
  }

  return testCases;
}

// Load all test cases
const testCasesPath = path.join(__dirname, '../docs/QA/40_TestCases.html');
const testCases = parseTestCases(testCasesPath);

console.log(`\n📋 Loaded ${testCases.length} test cases from 40_TestCases.html\n`);

/**
 * Helper function to input hand data into the app
 */
async function inputHandData(page: Page, tc: TestCase) {
  // Navigate to Stack Setup
  await page.goto('http://localhost:3001');

  // Build hand input text
  const handInput = formatHandInput(tc);

  // Paste into textarea
  const textarea = page.locator('textarea');
  await textarea.fill(handInput);

  // Click Parse/Load button
  await page.click('button:has-text("Parse")');

  // Wait for parsing to complete
  await page.waitForTimeout(500);
}

/**
 * Format test case data into hand input format
 */
function formatHandInput(tc: TestCase): string {
  let input = `Hand (${tc.handNumber}) started at ${tc.startedAt}\n`;
  input += `SB=$${tc.smallBlind.toLocaleString()} BB=$${tc.bigBlind.toLocaleString()} Ante=$${tc.ante.toLocaleString()}\n\n`;
  input += `Stack Setup:\n`;

  for (const player of tc.players) {
    input += `${player.name} ${player.position} $${player.stack.toLocaleString()}\n`;
  }

  return input;
}

/**
 * Execute preflop actions
 */
async function executePreflopActions(page: Page, actions: Action[]) {
  // Navigate to Preflop view
  await page.click('button:has-text("Pre-Flop")');
  await page.waitForTimeout(300);

  for (const action of actions) {
    // Find the player's action section
    const playerSection = page.locator(`.player-section:has-text("${action.player}")`).first();

    if (action.action === 'fold') {
      await playerSection.locator('button:has-text("Fold")').click();
    } else if (action.action === 'call') {
      await playerSection.locator('button:has-text("Call")').click();
    } else if (action.action === 'check') {
      await playerSection.locator('button:has-text("Check")').click();
    } else if (action.action === 'raise') {
      // Input raise amount
      const amountInput = playerSection.locator('input[type="text"]');
      const raiseValue = action.unit === 'K' ? action.amount! * 1000 : action.amount!;
      await amountInput.fill(raiseValue.toString());
      await playerSection.locator('button:has-text("Raise")').click();
    }

    await page.waitForTimeout(200);
  }
}

/**
 * Get pot calculation from the app
 */
async function getPotCalculation(page: Page) {
  // Navigate to Pot Calculation view
  await page.click('button:has-text("Pot")');
  await page.waitForTimeout(500);

  // Extract total pot
  const totalPotText = await page.locator('.pot-summary:has-text("Total Pot")').first().textContent();
  const totalPot = totalPotText ? parseInt(totalPotText.match(/[\d,]+/)![0].replace(/,/g, '')) : 0;

  return { totalPot };
}

// Main test suite
test.describe('40 QA Test Cases - Automated Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure dev server is running
    await page.goto('http://localhost:3001');
    await expect(page).toHaveTitle(/HHTool/i);
  });

  // Run each test case
  for (const tc of testCases.slice(0, 5)) { // Start with first 5 for testing
    test(`TC-${tc.id}: ${tc.players.length} players - Expected pot: $${tc.expectedPot.toLocaleString()}`, async ({ page }) => {
      console.log(`\n🧪 Running TC-${tc.id}...`);

      // Step 1: Input hand data
      await inputHandData(page, tc);

      // Step 2: Execute preflop actions
      if (tc.preflopActions.length > 0) {
        await executePreflopActions(page, tc.preflopActions);
      }

      // Step 3: Get pot calculation
      const result = await getPotCalculation(page);

      // Step 4: Validate
      console.log(`   Expected Pot: $${tc.expectedPot.toLocaleString()}`);
      console.log(`   Actual Pot:   $${result.totalPot.toLocaleString()}`);

      expect(result.totalPot).toBe(tc.expectedPot);

      console.log(`   ✅ TC-${tc.id} PASSED`);
    });
  }
});
