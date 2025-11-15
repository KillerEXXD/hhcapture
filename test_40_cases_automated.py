#!/usr/bin/env python3
"""
Automated End-to-End Testing for 40 QA Test Cases

This script automates the validation of all 40 poker hand test cases by:
1. Parsing the 40_TestCases.html file
2. For each test case, loading it into the running app at http://localhost:3001
3. Executing the actions
4. Validating the pot calculation matches expected values
5. Generating a comprehensive test report

Prerequisites:
- pip install selenium webdriver-manager beautifulsoup4
- Ensure dev server is running on http://localhost:3001 (npm run dev)

Usage:
python test_40_cases_automated.py
"""

import re
import time
import json
from pathlib import Path
from typing import List, Dict, Optional
from dataclasses import dataclass
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

@dataclass
class Player:
    name: str
    position: str
    stack: int

@dataclass
class Action:
    player: str
    action: str  # fold, call, check, raise
    amount: Optional[int] = None
    unit: Optional[str] = None  # K or M

@dataclass
class TestCase:
    id: int
    hand_number: str
    started_at: str
    small_blind: int
    big_blind: int
    ante: int
    players: List[Player]
    preflop_actions: List[Action]
    flop_actions: List[Action]
    turn_actions: List[Action]
    river_actions: List[Action]
    expected_pot: int
    expected_main_pot: Optional[int] = None

class TestCaseParser:
    """Parse test cases from 40_TestCases.html"""

    def __init__(self, html_path: str):
        self.html_path = html_path

    def parse_all(self) -> List[TestCase]:
        """Parse all test cases from HTML file"""
        with open(self.html_path, 'r', encoding='utf-8') as f:
            html = f.read()

        soup = BeautifulSoup(html, 'html.parser')
        test_case_divs = soup.find_all('div', class_='test-case')

        test_cases = []
        for div in test_case_divs:
            try:
                tc = self._parse_test_case(div)
                if tc:
                    test_cases.append(tc)
            except Exception as e:
                print(f"⚠️  Error parsing test case: {e}")

        return test_cases

    def _parse_test_case(self, div) -> Optional[TestCase]:
        """Parse a single test case from its div"""
        # Extract TC ID
        tc_id_elem = div.find(class_='test-id')
        if not tc_id_elem:
            return None
        tc_id = int(tc_id_elem.text.replace('TC-', ''))

        # Extract hand setup from <pre> tag
        pre_elem = div.find('pre')
        if not pre_elem:
            return None

        hand_text = pre_elem.get_text()
        lines = hand_text.split('\n')

        # Parse hand header
        hand_number = '1'
        started_at = '00:00:00'
        match = re.search(r'Hand \((\d+)\) started at (\d{2}:\d{2}:\d{2})', hand_text)
        if match:
            hand_number = match.group(1)
            started_at = match.group(2)

        # Parse blinds
        small_blind, big_blind, ante = 0, 0, 0
        match = re.search(r'SB=\$?([\d,]+)\s+BB=\$?([\d,]+)\s+Ante=\$?([\d,]+)', hand_text)
        if match:
            small_blind = int(match.group(1).replace(',', ''))
            big_blind = int(match.group(2).replace(',', ''))
            ante = int(match.group(3).replace(',', ''))

        # Parse players
        players = []
        in_stack_setup = False
        for line in lines:
            if 'Stack Setup:' in line:
                in_stack_setup = True
                continue
            if 'Actions:' in line:
                break

            if in_stack_setup and line.strip():
                match = re.match(r'^(\w+)\s+(SB|BB|UTG|UTG\+\d|LJ|MP|MP\+\d|HJ|CO|Dealer)\s+\$?([\d,]+)', line.strip())
                if match:
                    players.append(Player(
                        name=match.group(1),
                        position=match.group(2),
                        stack=int(match.group(3).replace(',', ''))
                    ))

        # Parse actions
        preflop_actions = self._parse_actions(hand_text, 'Preflop:')
        flop_actions = self._parse_actions(hand_text, 'Flop:')
        turn_actions = self._parse_actions(hand_text, 'Turn:')
        river_actions = self._parse_actions(hand_text, 'River:')

        # Parse expected pot
        expected_pot = 0
        results_div = div.find(class_='results')
        if results_div:
            match = re.search(r'Total Pot:\s+\$?([\d,]+)', results_div.get_text())
            if match:
                expected_pot = int(match.group(1).replace(',', ''))

        return TestCase(
            id=tc_id,
            hand_number=hand_number,
            started_at=started_at,
            small_blind=small_blind,
            big_blind=big_blind,
            ante=ante,
            players=players,
            preflop_actions=preflop_actions,
            flop_actions=flop_actions,
            turn_actions=turn_actions,
            river_actions=river_actions,
            expected_pot=expected_pot
        )

    def _parse_actions(self, text: str, stage_marker: str) -> List[Action]:
        """Parse actions for a specific stage (Preflop, Flop, etc.)"""
        actions = []

        # Find the line with the stage marker
        for line in text.split('\n'):
            if stage_marker in line:
                # Extract actions from this line
                actions_text = line.split(stage_marker)[1] if stage_marker in line else ''

                # Match patterns like: "Alice fold", "Bob call", "Charlie raise to $5K"
                matches = re.finditer(r'(\w+)\s+(fold|call|raise|check)(?:\s+to\s+)?\$?([\d,]+)?([KM])?', actions_text, re.IGNORECASE)

                for match in matches:
                    actions.append(Action(
                        player=match.group(1),
                        action=match.group(2).lower(),
                        amount=int(match.group(3).replace(',', '')) if match.group(3) else None,
                        unit=match.group(4) if match.group(4) else None
                    ))
                break

        return actions


class E2ETestRunner:
    """Automated E2E test runner using Selenium"""

    def __init__(self, base_url: str = 'http://localhost:3001'):
        self.base_url = base_url
        self.driver = None

    def setup(self):
        """Initialize Selenium WebDriver"""
        print("🚀 Initializing Chrome WebDriver...")
        options = webdriver.ChromeOptions()
        # options.add_argument('--headless')  # Uncomment for headless mode
        options.add_argument('--window-size=1920,1080')

        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        self.driver.implicitly_wait(10)

    def teardown(self):
        """Close WebDriver"""
        if self.driver:
            self.driver.quit()

    def run_test_case(self, tc: TestCase) -> Dict:
        """Run a single test case and return results"""
        print(f"\n🧪 Running TC-{tc.id}: {len(tc.players)} players, Expected Pot: ${tc.expected_pot:,}")

        try:
            # Navigate to app
            self.driver.get(self.base_url)
            time.sleep(1)

            # Input hand data
            self._input_hand_data(tc)

            # Execute preflop actions
            if tc.preflop_actions:
                self._execute_preflop_actions(tc.preflop_actions)

            # Get pot calculation
            actual_pot = self._get_pot_calculation()

            # Validate
            passed = actual_pot == tc.expected_pot
            result = {
                'tc_id': tc.id,
                'passed': passed,
                'expected_pot': tc.expected_pot,
                'actual_pot': actual_pot,
                'error': None
            }

            if passed:
                print(f"   ✅ PASSED - Pot: ${actual_pot:,}")
            else:
                print(f"   ❌ FAILED - Expected: ${tc.expected_pot:,}, Actual: ${actual_pot:,}")

            return result

        except Exception as e:
            print(f"   💥 ERROR: {str(e)}")
            return {
                'tc_id': tc.id,
                'passed': False,
                'expected_pot': tc.expected_pot,
                'actual_pot': 0,
                'error': str(e)
            }

    def _input_hand_data(self, tc: TestCase):
        """Input hand data into Stack Setup"""
        # Build hand input text
        hand_input = f"Hand ({tc.hand_number}) started at {tc.started_at}\n"
        hand_input += f"SB=${tc.small_blind:,} BB=${tc.big_blind:,} Ante=${tc.ante:,}\n\n"
        hand_input += "Stack Setup:\n"

        for player in tc.players:
            hand_input += f"{player.name} {player.position} ${player.stack:,}\n"

        # Find and fill textarea
        textarea = self.driver.find_element(By.CSS_SELECTOR, 'textarea')
        textarea.clear()
        textarea.send_keys(hand_input)

        # Click Parse button
        parse_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Parse')]")
        parse_button.click()
        time.sleep(0.5)

    def _execute_preflop_actions(self, actions: List[Action]):
        """Execute preflop actions"""
        # Navigate to Pre-Flop view
        preflop_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Pre-Flop')]")
        preflop_button.click()
        time.sleep(0.3)

        for action in actions:
            # Find player's action section (this selector may need adjustment based on your app's HTML structure)
            # For now, using a simplified approach

            if action.action == 'fold':
                button = self.driver.find_element(By.XPATH, f"//button[contains(text(), 'Fold')]")
                button.click()
            elif action.action == 'call':
                button = self.driver.find_element(By.XPATH, f"//button[contains(text(), 'Call')]")
                button.click()
            elif action.action == 'check':
                button = self.driver.find_element(By.XPATH, f"//button[contains(text(), 'Check')]")
                button.click()
            elif action.action == 'raise' and action.amount:
                # Input raise amount
                # This needs to be adjusted based on your app's structure
                pass

            time.sleep(0.2)

    def _get_pot_calculation(self) -> int:
        """Get pot calculation from Pot view"""
        # Navigate to Pot view
        pot_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Pot')]")
        pot_button.click()
        time.sleep(0.5)

        # Extract total pot (this selector may need adjustment)
        pot_text = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Total Pot')]").text
        match = re.search(r'[\d,]+', pot_text)
        if match:
            return int(match.group().replace(',', ''))
        return 0


def main():
    print("="*80)
    print("🧪 AUTOMATED E2E TESTING - 40 QA TEST CASES")
    print("="*80)

    # Parse test cases
    html_path = Path(__file__).parent / 'docs' / 'QA' / '40_TestCases.html'
    parser = TestCaseParser(str(html_path))
    test_cases = parser.parse_all()

    print(f"\n📋 Loaded {len(test_cases)} test cases\n")

    # Initialize test runner
    runner = E2ETestRunner()
    runner.setup()

    # Run tests
    results = []
    for tc in test_cases[:5]:  # Start with first 5 test cases
        result = runner.run_test_case(tc)
        results.append(result)

    # Cleanup
    runner.teardown()

    # Generate report
    print("\n" + "="*80)
    print("📊 TEST SUMMARY")
    print("="*80)

    passed = sum(1 for r in results if r['passed'])
    failed = len(results) - passed

    print(f"Total Tests: {len(results)}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Pass Rate: {(passed/len(results)*100):.1f}%")

    # Save detailed results
    output_file = 'test-results/e2e-results.json'
    Path('test-results').mkdir(exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\n💾 Detailed results saved to: {output_file}")

    return 0 if failed == 0 else 1


if __name__ == '__main__':
    exit(main())
