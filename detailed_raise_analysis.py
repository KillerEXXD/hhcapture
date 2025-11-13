#!/usr/bin/env python3
"""
Detailed analysis of test cases with raises to verify "Raise TO" vs "Raise BY" rule.
"""

import re

def extract_test_case_details(html_file, tc_ids):
    """Extract detailed information for specific test cases."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    results = {}

    for tc_id in tc_ids:
        # Find this test case block
        tc_pattern = (
            rf'<div class="test-id">{tc_id}</div>.*?'
            r'<div class="blind-item"><label>Small Blind</label><div class="value">([\d,]+)</div>.*?'
            r'<div class="blind-item"><label>Big Blind</label><div class="value">([\d,]+)</div>.*?'
            r'<div class="blind-item"><label>Ante</label><div class="value">([\d,]+)</div>.*?'
            r'<div class="section-title">Actions</div>.*?<div class="actions-section">(.*?)</div>\s*</div>\s*<div class="section-title">Expected Results.*?'
            r'<div class="pot-summary">Total Pot:\s*([\d,]+)</div>.*?'
            r'<table>.*?<tbody>(.*?)</tbody>'
        )

        match = re.search(tc_pattern, content, re.DOTALL)
        if not match:
            continue

        sb = int(match.group(1).replace(',', ''))
        bb = int(match.group(2).replace(',', ''))
        ante = int(match.group(3).replace(',', ''))
        actions_section = match.group(4)
        pot = int(match.group(5).replace(',', ''))
        tbody = match.group(6)

        # Extract actions
        actions = []
        action_pattern = r'<span class="action-player">(.+?)\s*\((.+?)\):</span>\s*<span class="action-type">(.+?)</span>(?:\s*<span class="action-amount">([\d,]+)</span>)?'
        for action_match in re.finditer(action_pattern, actions_section):
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

        # Extract player data
        players = []
        row_pattern = r'<tr>.*?<td>(.+?)\s*\((.+?)\)</td>.*?<td>([-\d,]+)</td>.*?<td>([-\d,]+)</td>.*?<td>([\d,]+)</td>'
        for row in re.finditer(row_pattern, tbody, re.DOTALL):
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

        results[tc_id] = {
            'sb': sb,
            'bb': bb,
            'ante': ante,
            'actions': actions,
            'pot': pot,
            'players': players
        }

    return results

def analyze_raise_actions(tc_data):
    """Analyze each raise action to check for "Raise TO" vs "Raise BY" correctness."""
    sb = tc_data['sb']
    bb = tc_data['bb']
    ante = tc_data['ante']
    actions = tc_data['actions']
    players = tc_data['players']
    pot = tc_data['pot']

    print(f"\n  Blinds: SB {sb:,} / BB {bb:,} / Ante {ante:,}")
    print(f"  Pot: {pot:,}\n")

    # Track each player's cumulative contribution through the hand
    player_contributions = {}
    for player in players:
        player_contributions[player['name']] = {
            'starting': player['starting'],
            'final': player['final'],
            'expected_total': player['starting'] - player['final'],
            'reported_total': player['contributed'],
            'position': player['position'],
            'actions': []
        }

    # Go through actions and calculate expected contributions
    current_bet = 0
    street_bets = {}  # Track each player's bet on current street

    for i, action in enumerate(actions):
        player = action['player']
        position = action['position']
        action_type = action['type']
        amount = action['amount']

        # Initialize street tracking for this player if needed
        if player not in street_bets:
            street_bets[player] = 0

        contribution_this_action = 0

        if action_type == 'Raise':
            # Raise TO X means player's total bet this street becomes X
            # If SB raises TO 60,000, they contribute 60,000 total (including the SB already posted)
            # If BB raises TO 60,000, they contribute 60,000 total (including the BB already posted)

            # For SB/BB on preflop, they've already posted blinds
            # So "Raise TO 60,000" means total contribution = 60,000

            previous_bet_this_street = street_bets[player]
            contribution_this_action = amount - previous_bet_this_street
            street_bets[player] = amount
            current_bet = amount

            player_contributions[player]['actions'].append({
                'type': 'Raise TO',
                'amount': amount,
                'contribution': contribution_this_action,
                'note': f'Total bet this street becomes {amount:,}'
            })

        elif action_type == 'Call':
            # Call means match the current bet
            previous_bet_this_street = street_bets[player]
            contribution_this_action = current_bet - previous_bet_this_street
            street_bets[player] = current_bet

            player_contributions[player]['actions'].append({
                'type': 'Call',
                'amount': current_bet,
                'contribution': contribution_this_action,
                'note': f'Match current bet of {current_bet:,}'
            })

        elif action_type == 'Bet':
            contribution_this_action = amount
            street_bets[player] = amount
            current_bet = amount

            player_contributions[player]['actions'].append({
                'type': 'Bet',
                'amount': amount,
                'contribution': contribution_this_action
            })

    # Check for issues
    issues = []

    for player_name, data in player_contributions.items():
        # Check if final stack calculation is correct
        if data['expected_total'] != data['reported_total']:
            issues.append({
                'type': 'Contribution Mismatch',
                'player': player_name,
                'expected': data['expected_total'],
                'reported': data['reported_total']
            })

        # Check for negative final stack
        if data['final'] < 0:
            issues.append({
                'type': 'CRITICAL: Negative Final Stack',
                'player': player_name,
                'starting': data['starting'],
                'final': data['final'],
                'details': f'{player_name} went all-in but test case shows negative stack'
            })

        # Calculate total from actions
        total_from_actions = sum(a['contribution'] for a in data['actions'])

        # For SB/BB, add their blind/ante
        blind_amount = 0
        if data['position'] == 'SB':
            blind_amount = sb
        elif data['position'] == 'BB':
            blind_amount = bb + ante  # BB posts ante then blind

        expected_with_blinds = total_from_actions + blind_amount

        print(f"  {player_name} ({data['position']}):")
        print(f"    Starting: {data['starting']:,}")
        print(f"    Final: {data['final']:,}")
        print(f"    Reported contribution: {data['reported_total']:,}")
        print(f"    Expected (Start - Final): {data['expected_total']:,}")

        if data['position'] in ['SB', 'BB']:
            print(f"    Blind/Ante posted: {blind_amount:,}")

        print(f"    Actions:")
        for action in data['actions']:
            if action['type'] == 'Raise TO':
                print(f"      - {action['type']} {action['amount']:,} (contribution: {action['contribution']:,})")
                print(f"        Note: {action['note']}")
            else:
                print(f"      - {action['type']} (contribution: {action['contribution']:,})")

        print(f"    Total from actions + blinds: {expected_with_blinds:,}")

        # Check if reported total matches actions + blinds
        if data['reported_total'] != expected_with_blinds:
            print(f"    WARNING MISMATCH: Reported {data['reported_total']:,} != Expected {expected_with_blinds:,}")

            # Check if this could be a "Raise BY" vs "Raise TO" error
            for action in data['actions']:
                if action['type'] == 'Raise TO':
                    # If the contribution was calculated as Raise BY instead of Raise TO
                    # For SB raising TO 60,000, the contribution would be 60,000 (correct)
                    # But if implemented as Raise BY 60,000, it would be 60,000 + 10,000 SB = 70,000 (wrong)
                    pass

        print()

    # Check pot total
    total_contributions = sum(p['reported_total'] for p in player_contributions.values())
    if total_contributions != pot:
        issues.append({
            'type': 'Pot Calculation Mismatch',
            'expected': total_contributions,
            'actual': pot
        })

    return issues

def main():
    html_file = r'C:\Apps\HUDR\HHTool_Modular\docs\QA\30_TestCases.html'

    # Test cases with raises
    tc_with_raises = ['TC-6', 'TC-7', 'TC-8', 'TC-13', 'TC-14', 'TC-15', 'TC-16', 'TC-17']

    print("=" * 80)
    print("DETAILED RAISE ANALYSIS - Raise TO vs Raise BY Validation")
    print("=" * 80)

    test_case_data = extract_test_case_details(html_file, tc_with_raises)

    for tc_id in tc_with_raises:
        if tc_id not in test_case_data:
            print(f"\n{tc_id}: NOT FOUND")
            continue

        print(f"\n{'='*80}")
        print(f"{tc_id}")
        print(f"{'='*80}")

        issues = analyze_raise_actions(test_case_data[tc_id])

        if issues:
            print(f"\n  ISSUES FOUND ({len(issues)}):")
            for issue in issues:
                print(f"\n  - {issue['type']}")
                for key, value in issue.items():
                    if key != 'type':
                        print(f"      {key}: {value:,}" if isinstance(value, int) else f"      {key}: {value}")

if __name__ == '__main__':
    main()
