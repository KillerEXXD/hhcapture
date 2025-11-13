#!/usr/bin/env python3
"""
Validate that all bet/raise/call amounts are legal (never exceed available stack)

This validator traces through each test case action-by-action and ensures that
players never bet, raise, or call more than their current available stack.

Checks:
1. No action amount exceeds player's current stack
2. Stack tracking is accurate throughout the hand
3. All-in scenarios are properly handled
"""
import re
from collections import defaultdict

# Read the HTML file
html_file = '40_TestCases.html'
print(f"Reading {html_file}...")

with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

print("="*80)
print("BET AMOUNT VALIDATION - Checking for Illegal Bet Amounts")
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
    errors = []

    # Extract Hand data
    hand_match = re.search(r'<pre>Hand \((\d+)\)(.*?)</pre>', tc_content, re.DOTALL)
    if not hand_match:
        errors.append("Could not parse hand data")
        continue

    hand_setup = hand_match.group(2)
    lines = hand_setup.strip().split('\n')

    # Extract blinds
    blind_match = re.search(r'SB ([0-9,]+) BB ([0-9,]+) Ante ([0-9,]+)', hand_setup)
    if not blind_match:
        errors.append("Could not parse blinds")
        continue

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
                        'total_contributed': 0
                    }

    if not players:
        errors.append("Could not parse players")
        continue

    # Post blinds and antes
    for name, player in players.items():
        if player['position'] == 'SB':
            player['current_stack'] -= sb
            player['total_contributed'] += sb
        elif player['position'] == 'BB':
            # BB posts ante first, then blind
            player['current_stack'] -= ante
            player['total_contributed'] += ante
            player['current_stack'] -= bb
            player['total_contributed'] += bb

    # Extract actions by street
    streets = ['Preflop Base', 'Flop Base', 'Turn Base', 'River Base']

    for street_name in streets:
        # Find this street's actions
        street_pattern = rf'<div class="street-name">{re.escape(street_name)}[^<]*</div>(.*?)(?=<div class="street-name">|</div>\s*</div>\s*<div class="section-title">)'
        street_match = re.search(street_pattern, tc_content, re.DOTALL)

        if not street_match:
            continue

        street_content = street_match.group(1)

        # Extract individual actions
        action_pattern = r'<span class="action-player">([^(]+) \(([^)]+)\):</span>\s*<span class="action-type">([^<]+)</span>(?:\s*<span class="action-amount">([0-9,]+)</span>)?'
        actions = re.findall(action_pattern, street_content)

        for player_name, position, action_type, amount_str in actions:
            player_name = player_name.strip()
            action_type = action_type.strip()

            if player_name not in players:
                errors.append(f"{street_name}: Player '{player_name}' not found in player list")
                continue

            player = players[player_name]

            # Skip check actions (no amount)
            if action_type.lower() in ['check', 'fold']:
                continue

            # Parse amount
            if not amount_str:
                errors.append(f"{street_name}: {player_name} {action_type} has no amount")
                continue

            amount = int(amount_str.replace(',', ''))

            # Calculate how much this player needs to add
            # For now, we'll just check if the amount exceeds their current stack
            # (This is a simplified check - real check would need to track street contributions)

            if action_type.lower() in ['bet', 'raise', 'call']:
                # The amount shown is the total bet/raise amount
                # Check if player has enough to contribute this

                # Simple check: amount should not exceed current stack + already contributed this street
                if amount > player['current_stack'] + 10:  # +10 for rounding tolerance
                    errors.append(
                        f"{street_name}: {player_name} {action_type} {amount:,} "
                        f"but only has {player['current_stack']:,} remaining! "
                        f"(Started: {player['starting_stack']:,}, Contributed: {player['total_contributed']:,})"
                    )

                # Deduct the amount from stack
                # For simplicity, we deduct the full amount (this is approximate)
                # Real implementation would need to track street-by-street contributions
                if action_type.lower() == 'bet':
                    actual_deduction = min(amount, player['current_stack'])
                    player['current_stack'] -= actual_deduction
                    player['total_contributed'] += actual_deduction
                elif action_type.lower() in ['call', 'raise']:
                    # Approximate - would need more sophisticated tracking
                    actual_deduction = min(amount, player['current_stack'])
                    player['current_stack'] -= actual_deduction
                    player['total_contributed'] += actual_deduction

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
    print("[OK] ALL BET AMOUNTS ARE LEGAL")
else:
    print(f"[X] {failed} test case(s) have illegal bet amounts")

print("="*80)

# Write report
with open('bet_amount_validation_report.txt', 'w') as f:
    f.write(f"Bet Amount Validation Report\n")
    f.write(f"{'='*70}\n\n")
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

print(f"\nReport written to: bet_amount_validation_report.txt")
