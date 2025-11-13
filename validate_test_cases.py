#!/usr/bin/env python3
"""
Validate all 30 test cases for "Raise TO" vs "Raise BY" rule and pot calculations.
"""

import re
from html.parser import HTMLParser

class TestCaseExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.test_cases = []
        self.current_tc = None
        self.in_test_case = False
        self.capture_type = None
        self.capture_buffer = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        # Detect test case start
        if tag == 'div' and attrs_dict.get('class') == 'test-case':
            self.in_test_case = True
            self.current_tc = {
                'id': None,
                'name': None,
                'sb': None,
                'bb': None,
                'ante': None,
                'players': [],
                'actions': [],
                'pot': None,
                'contributions': {}
            }

        # Capture test ID
        if self.in_test_case and tag == 'div' and attrs_dict.get('class') == 'test-id':
            self.capture_type = 'id'

        # Capture blind values
        if self.in_test_case and tag == 'div' and attrs_dict.get('class') == 'value':
            self.capture_type = 'blind_value'

        # Capture actions
        if self.in_test_case and tag == 'div' and attrs_dict.get('class') == 'action-row':
            self.capture_type = 'action'
            self.capture_buffer = []

        # Capture pot summary
        if self.in_test_case and tag == 'div' and attrs_dict.get('class') == 'pot-summary':
            self.capture_type = 'pot'

    def handle_data(self, data):
        data = data.strip()
        if not data or not self.in_test_case:
            return

        if self.capture_type == 'id' and data.startswith('TC-'):
            self.current_tc['id'] = data
            self.capture_type = None

        elif self.capture_type == 'action':
            self.capture_buffer.append(data)

        elif self.capture_type == 'pot' and 'Total Pot:' in data:
            pot_match = re.search(r'Total Pot:\s*([\d,]+)', data)
            if pot_match:
                self.current_tc['pot'] = int(pot_match.group(1).replace(',', ''))
            self.capture_type = None

    def handle_endtag(self, tag):
        if tag == 'div' and self.capture_type == 'action' and self.capture_buffer:
            # Parse action: Player (Position): Action Amount
            text = ' '.join(self.capture_buffer)
            action_match = re.match(r'(.+?)\s*\((.+?)\):\s*(\w+)\s*([\d,]+)?', text)
            if action_match:
                player, position, action_type, amount = action_match.groups()
                self.current_tc['actions'].append({
                    'player': player.strip(),
                    'position': position.strip(),
                    'type': action_type.strip(),
                    'amount': int(amount.replace(',', '')) if amount else None
                })
            self.capture_buffer = []
            self.capture_type = None

        elif tag == 'div' and self.in_test_case and self.current_tc and self.current_tc.get('id'):
            # Check if we've collected enough data for this test case
            if len(self.current_tc['actions']) > 0 and self.current_tc['pot']:
                self.test_cases.append(self.current_tc)
                self.in_test_case = False
                self.current_tc = None

def extract_player_data(html_file):
    """Extract player starting/final stacks and contributions from HTML tables."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    test_cases = {}

    # Find each test case block
    tc_pattern = r'<div class="test-id">(TC-\d+)</div>.*?<table>.*?<tbody>(.*?)</tbody>'
    matches = re.finditer(tc_pattern, content, re.DOTALL)

    for match in matches:
        tc_id = match.group(1)
        tbody = match.group(2)

        # Extract blind structure before this test case
        tc_start = match.start()
        before_tc = content[:tc_start]
        last_blind_section = re.findall(
            r'<div class="blind-item"><label>Small Blind</label><div class="value">([\d,]+)</div>.*?'
            r'<div class="blind-item"><label>Big Blind</label><div class="value">([\d,]+)</div>.*?'
            r'<div class="blind-item"><label>Ante</label><div class="value">([\d,]+)</div>',
            before_tc,
            re.DOTALL
        )

        sb = bb = ante = None
        if last_blind_section:
            sb_str, bb_str, ante_str = last_blind_section[-1]
            sb = int(sb_str.replace(',', ''))
            bb = int(bb_str.replace(',', ''))
            ante = int(ante_str.replace(',', ''))

        # Extract player rows
        players = []
        row_pattern = r'<tr>.*?<td>(.+?)\s*\((.+?)\)</td>.*?<td>([\d,]+)</td>.*?<td>([\d,]+)</td>.*?<td>([\d,]+)</td>'
        rows = re.finditer(row_pattern, tbody, re.DOTALL)

        for row in rows:
            player_name = row.group(1).strip()
            position = row.group(2).strip()
            starting = int(row.group(3).replace(',', ''))
            final = int(row.group(4).replace(',', ''))
            contributed = int(row.group(5).replace(',', ''))

            players.append({
                'name': player_name,
                'position': position,
                'starting': starting,
                'final': final,
                'contributed': contributed
            })

        if players:
            test_cases[tc_id] = {
                'players': players,
                'sb': sb,
                'bb': bb,
                'ante': ante
            }

    return test_cases

def extract_actions(html_file):
    """Extract all actions for each test case."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    test_cases = {}

    # Find each test case block
    tc_pattern = r'<div class="test-id">(TC-\d+)</div>.*?<div class="section-title">Actions</div>.*?<div class="actions-section">(.*?)</div>\s*</div>\s*<div class="section-title">Expected Results'
    matches = re.finditer(tc_pattern, content, re.DOTALL)

    for match in matches:
        tc_id = match.group(1)
        actions_section = match.group(2)

        actions = []
        action_pattern = r'<span class="action-player">(.+?)\s*\((.+?)\):</span>\s*<span class="action-type">(.+?)</span>(?:\s*<span class="action-amount">([\d,]+)</span>)?'
        action_matches = re.finditer(action_pattern, actions_section)

        for action_match in action_matches:
            player = action_match.group(1).strip()
            position = action_match.group(2).strip()
            action_type = action_match.group(3).strip()
            amount_str = action_match.group(4)
            amount = int(amount_str.replace(',', '')) if amount_str else None

            actions.append({
                'player': player,
                'position': position,
                'type': action_type,
                'amount': amount
            })

        test_cases[tc_id] = {'actions': actions}

    return test_cases

def extract_pot_totals(html_file):
    """Extract pot totals for each test case."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    test_cases = {}

    tc_pattern = r'<div class="test-id">(TC-\d+)</div>.*?<div class="pot-summary">Total Pot:\s*([\d,]+)</div>'
    matches = re.finditer(tc_pattern, content, re.DOTALL)

    for match in matches:
        tc_id = match.group(1)
        pot = int(match.group(2).replace(',', ''))
        test_cases[tc_id] = {'pot': pot}

    return test_cases

def validate_test_case(tc_id, player_data, actions, pot, sb, bb, ante):
    """Validate a single test case for Raise TO/BY errors and pot calculation."""
    errors = []

    # Calculate expected contributions based on actions
    player_contributions = {}
    for player_info in player_data:
        player_contributions[player_info['name']] = 0

    # Track current bet level on each street
    current_bet = 0
    street_start = True

    for action in actions:
        player = action['player']
        action_type = action['type']
        amount = action['amount']

        if action_type == 'Raise':
            # Raise should be "Raise TO" not "Raise BY"
            # Expected contribution = amount - current_player_bet_this_street
            expected_contribution = amount

            # For SB/BB, we need to account for their blind
            if action['position'] == 'SB':
                # SB has already posted SB, so if they raise TO X, contribution should be X total
                expected_contribution = amount
            elif action['position'] == 'BB':
                # BB has already posted BB, so if they raise TO X, contribution should be X total
                expected_contribution = amount

            current_bet = amount

        elif action_type == 'Call':
            # Call should match current bet
            if amount and amount != current_bet:
                # This might be wrong - Call should bring total to current_bet
                pass

        elif action_type == 'Bet':
            current_bet = amount

        elif action_type == 'Check':
            pass

    # Validate contribution = starting - final for each player
    for player_info in player_data:
        expected_contribution = player_info['starting'] - player_info['final']
        reported_contribution = player_info['contributed']

        if expected_contribution != reported_contribution:
            errors.append({
                'player': player_info['name'],
                'issue': 'Contribution mismatch',
                'expected': expected_contribution,
                'actual': reported_contribution
            })

    # Validate pot total = sum of contributions
    # NOTE: In BB ante structure, the ante is already included in the BB's contribution
    # The "Contributed" column shows total amount taken from stack, which includes ante
    # So pot should equal sum of contributions (ante is already included)
    total_contributions = sum(p['contributed'] for p in player_data)
    expected_pot = total_contributions

    if pot != expected_pot:
        errors.append({
            'player': 'N/A',
            'issue': 'Pot calculation mismatch',
            'expected': expected_pot,
            'actual': pot,
            'details': f'Sum of contributions: {total_contributions}'
        })

    # Check for raises from SB/BB - most likely to have double-counting errors
    for i, action in enumerate(actions):
        if action['type'] == 'Raise' and action['position'] in ['SB', 'BB']:
            # Find the player data
            player_name = action['player']
            player_info = next((p for p in player_data if p['name'] == player_name), None)

            if player_info:
                # Calculate expected contribution for this raise
                # In preflop, if SB raises to 60000, they should contribute 60000 total (not 60000 + 10000)
                raise_amount = action['amount']

                # Get all actions for this player
                player_actions = [a for a in actions if a['player'] == player_name]

                # Check if this looks like a double-counting situation
                # If the player only has one action (the raise) and their contribution seems too high
                if len(player_actions) == 1:
                    blind_amount = sb if action['position'] == 'SB' else bb
                    if player_info['contributed'] > raise_amount:
                        # This might indicate double-counting
                        potential_error = player_info['contributed'] - raise_amount
                        if potential_error == blind_amount:
                            errors.append({
                                'player': player_name,
                                'issue': f'Potential double-counting of {action["position"]} blind in raise',
                                'expected': raise_amount,
                                'actual': player_info['contributed'],
                                'details': f'{player_name} ({action["position"]}) raises to {raise_amount:,}, but contributed {player_info["contributed"]:,} (blind {blind_amount:,} may be double-counted)'
                            })

    return errors

def main():
    html_file = r'C:\Apps\HUDR\HHTool_Modular\docs\QA\30_TestCases.html'

    print("=" * 80)
    print("VALIDATION REPORT: 30 Test Cases - Raise TO vs Raise BY Rule")
    print("=" * 80)
    print()

    # Extract all data
    player_data_by_tc = extract_player_data(html_file)
    actions_by_tc = extract_actions(html_file)
    pots_by_tc = extract_pot_totals(html_file)

    # Combine data
    all_test_cases = {}
    for tc_id in player_data_by_tc.keys():
        all_test_cases[tc_id] = {
            'players': player_data_by_tc[tc_id]['players'],
            'sb': player_data_by_tc[tc_id]['sb'],
            'bb': player_data_by_tc[tc_id]['bb'],
            'ante': player_data_by_tc[tc_id]['ante'],
            'actions': actions_by_tc.get(tc_id, {}).get('actions', []),
            'pot': pots_by_tc.get(tc_id, {}).get('pot', 0)
        }

    # Validate each test case
    total_errors = 0
    test_cases_with_errors = []
    test_cases_passed = []

    for tc_id in sorted(all_test_cases.keys(), key=lambda x: int(x.split('-')[1])):
        tc_data = all_test_cases[tc_id]
        errors = validate_test_case(
            tc_id,
            tc_data['players'],
            tc_data['actions'],
            tc_data['pot'],
            tc_data['sb'],
            tc_data['bb'],
            tc_data['ante']
        )

        if errors:
            test_cases_with_errors.append(tc_id)
            total_errors += len(errors)
            print(f"\n{tc_id}: ERRORS FOUND ({len(errors)} issue(s))")
            print(f"  Blinds: SB {tc_data['sb']:,} / BB {tc_data['bb']:,} / Ante {tc_data['ante']:,}")
            print(f"  Pot: {tc_data['pot']:,}")

            for error in errors:
                print(f"\n  Error: {error['issue']}")
                print(f"    Player: {error['player']}")
                if 'expected' in error:
                    print(f"    Expected: {error['expected']:,}")
                    print(f"    Actual: {error['actual']:,}")
                if 'details' in error:
                    print(f"    Details: {error['details']}")
        else:
            test_cases_passed.append(tc_id)
            print(f"{tc_id}: PASS")

    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total test cases checked: {len(all_test_cases)}")
    print(f"Test cases PASSED: {len(test_cases_passed)}")
    print(f"Test cases with ERRORS: {len(test_cases_with_errors)}")
    print(f"Total errors found: {total_errors}")

    if test_cases_with_errors:
        print(f"\nTest cases with errors: {', '.join(test_cases_with_errors)}")

    print()

if __name__ == '__main__':
    main()
