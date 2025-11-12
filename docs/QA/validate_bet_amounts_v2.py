#!/usr/bin/env python3
"""
Accurate Bet Amount Validation - Tracks stack street-by-street

This validator accurately traces through each action and tracks:
1. Current stack after each action
2. Street contributions (reset each street)
3. Total contributions (cumulative)
4. Validates that displayed bet/call amounts are achievable

Key: The displayed amount in the HTML is the TOTAL bet amount for that street,
not necessarily what the player adds. We need to calculate what they actually add.
"""
import re

def parse_test_case(tc_num, tc_content):
    """Parse a single test case and validate all bet amounts"""
    errors = []

    # Extract Hand data
    hand_match = re.search(r'<pre>Hand \((\d+)\)(.*?)</pre>', tc_content, re.DOTALL)
    if not hand_match:
        return ["Could not parse hand data"]

    hand_setup = hand_match.group(2)
    lines = hand_setup.strip().split('\n')

    # Extract blinds
    blind_match = re.search(r'SB ([0-9,]+) BB ([0-9,]+) Ante ([0-9,]+)', hand_setup)
    if not blind_match:
        return ["Could not parse blinds"]

    sb = int(blind_match.group(1).replace(',', ''))
    bb = int(blind_match.group(2).replace(',', ''))
    ante = int(blind_match.group(3).replace(',', ''))

    # Parse players and starting stacks
    players = {}
    in_stack_setup = False

    for line in lines:
        line = line.strip()
        if 'Stack Setup:' in line:
            in_stack_setup = True
            continue
        if in_stack_setup and line and line[0].isupper():
            parts = line.split()
            if len(parts) >= 2:
                name = parts[0]
                position = parts[1] if len(parts) > 2 else parts[1]
                stack_str = parts[-1]
                if stack_str.replace(',', '').lstrip('-').isdigit():
                    stack = int(stack_str.replace(',', ''))
                    players[name] = {
                        'position': position,
                        'starting_stack': stack,
                        'current_stack': stack,
                        'total_contributed': 0,
                        'street_contributed': 0
                    }

    if not players:
        return ["Could not parse players"]

    # Post blinds and antes
    for name, player in players.items():
        if player['position'] == 'SB':
            player['current_stack'] -= sb
            player['total_contributed'] += sb
            player['street_contributed'] = sb
        elif player['position'] == 'BB':
            # BB posts ante first, then blind
            player['current_stack'] -= ante
            player['total_contributed'] += ante
            player['current_stack'] -= bb
            player['total_contributed'] += bb
            player['street_contributed'] = bb  # Only blind counts as street contribution

    # Process each street
    streets = [
        ('Preflop Base', 'Preflop'),
        ('Flop Base', 'Flop'),
        ('Turn Base', 'Turn'),
        ('River Base', 'River')
    ]

    for street_display, street_name in streets:
        # Reset street contributions at start of each street
        for player in players.values():
            player['street_contributed'] = 0

        # Find this street's actions
        street_pattern = rf'<div class="street-name">{re.escape(street_display)}[^<]*</div>(.*?)(?=<div class="street-name">|</div>\s*</div>\s*<div class="section-title">)'
        street_match = re.search(street_pattern, tc_content, re.DOTALL)

        if not street_match:
            continue

        street_content = street_match.group(1)

        # Extract individual actions
        action_pattern = r'<span class="action-player">([^(]+) \(([^)]+)\):</span>\s*<span class="action-type">([^<]+)</span>(?:\s*<span class="action-amount">([0-9,]+)</span>)?'
        actions = re.findall(action_pattern, street_content)

        # Track the current bet amount this street (for calculating calls)
        current_bet = 0

        for player_name, position, action_type, amount_str in actions:
            player_name = player_name.strip()
            action_type = action_type.strip()

            if player_name not in players:
                errors.append(f"{street_name}: Player '{player_name}' not found")
                continue

            player = players[player_name]

            # Skip check and fold
            if action_type.lower() in ['check', 'fold']:
                continue

            # Parse amount
            if not amount_str:
                continue

            total_amount = int(amount_str.replace(',', ''))

            # Calculate how much this player actually needs to add
            if action_type.lower() in ['bet', 'raise']:
                # For bet/raise, the total_amount is the new bet level
                amount_to_add = total_amount - player['street_contributed']
                current_bet = total_amount
            elif action_type.lower() == 'call':
                # For call, the total_amount is what they're calling to
                amount_to_add = total_amount - player['street_contributed']
            else:
                continue

            # Check if player has enough
            if amount_to_add > player['current_stack']:
                # Player doesn't have enough - this should be marked as all-in
                # But the displayed amount shows the full bet/call amount
                errors.append(
                    f"{street_name}: {player_name} {action_type} {total_amount:,} "
                    f"but only has {player['current_stack']:,} remaining "
                    f"(needs to add {amount_to_add:,}, already contributed {player['street_contributed']:,} this street). "
                    f"[Stack: {player['starting_stack']:,} - {player['total_contributed']:,} = {player['current_stack']:,}]"
                )
                # Cap the actual contribution
                amount_to_add = player['current_stack']

            # Update player's stack and contributions
            player['current_stack'] -= amount_to_add
            player['total_contributed'] += amount_to_add
            player['street_contributed'] += amount_to_add

    return errors


# Main validation
html_file = '40_TestCases.html'
print(f"Reading {html_file}...")

with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

print("="*80)
print("BET AMOUNT VALIDATION V2 - Accurate Street-by-Street Tracking")
print("="*80)
print()

# Extract all test cases
tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+|$)'
tc_matches = re.findall(tc_pattern, content, re.DOTALL)

total_cases = len(tc_matches)
passed = 0
failed = 0
errors_by_tc = {}

for tc_num, tc_content in tc_matches:
    tc_num = int(tc_num)
    errors = parse_test_case(tc_num, tc_content)

    if errors:
        failed += 1
        errors_by_tc[tc_num] = errors
        print(f"[TC-{tc_num}] [X] FAILED - {len(errors)} error(s)")
    else:
        passed += 1
        print(f"[TC-{tc_num}] [OK] PASSED")

print()
print("="*80)
print("SUMMARY")
print("="*80)
print(f"Total Test Cases: {total_cases}")
print(f"Passed: {passed} ({100*passed/total_cases:.1f}%)")
print(f"Failed: {failed} ({100*failed/total_cases:.1f}%)")
print()

if failed > 0:
    print("="*80)
    print("FAILED TEST CASES - DETAILS")
    print("="*80)
    for tc_num, error_list in sorted(errors_by_tc.items()):
        print(f"\nTC-{tc_num}:")
        for error in error_list:
            print(f"  - {error}")

print()
if failed == 0:
    print("[OK] ALL BET AMOUNTS ARE LEGAL - No player bets more than they have!")
else:
    print(f"[X] {failed} test case(s) have illegal bet amounts")
    print()
    print("NOTE: These errors indicate that the DISPLAYED bet/call amount exceeds")
    print("what the player can actually contribute. The player should either:")
    print("1. Go all-in for their remaining stack, OR")
    print("2. The displayed amount should match their actual contribution")

print("="*80)

# Write detailed report
with open('bet_amount_validation_v2_report.txt', 'w') as f:
    f.write("Bet Amount Validation Report (V2 - Accurate Tracking)\n")
    f.write("="*70 + "\n\n")
    f.write(f"Total: {total_cases}\n")
    f.write(f"Passed: {passed} ({100*passed/total_cases:.1f}%)\n")
    f.write(f"Failed: {failed} ({100*failed/total_cases:.1f}%)\n\n")

    if failed > 0:
        f.write("Failed Test Cases:\n")
        f.write("-"*70 + "\n\n")
        for tc_num, error_list in sorted(errors_by_tc.items()):
            f.write(f"TC-{tc_num}:\n")
            for error in error_list:
                f.write(f"  - {error}\n")
            f.write("\n")
    else:
        f.write("All test cases passed! No illegal bet amounts detected.\n")

print(f"\nDetailed report written to: bet_amount_validation_v2_report.txt")
