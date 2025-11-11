#!/usr/bin/env python3
"""
Validate 40 test cases (30 base + 10 side pot cases)
Checks stack calculations, negative stacks, over-contributions
"""
import re

# Read the HTML file
with open('40_TestCases.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("="*80)
print("VALIDATING 40 TEST CASES - STACK CALCULATIONS")
print("="*80)
print()

# Extract all test cases
tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+|$)'
tc_matches = re.findall(tc_pattern, content, re.DOTALL)

print(f"Total Test Cases Found: {len(tc_matches)}")
print()

passed = 0
failed = 0
errors_by_tc = {}

for tc_num, tc_content in tc_matches:
    tc_num = int(tc_num)

    # Extract Hand setup section
    hand_match = re.search(r'<pre>Hand \((\d+)\)(.*?)</pre>', tc_content, re.DOTALL)
    if not hand_match:
        print(f"[TC-{tc_num}] [X] Could not parse hand setup")
        failed += 1
        continue

    hand_setup = hand_match.group(2)
    lines = hand_setup.strip().split('\n')

    # Parse stack setup
    players = []
    in_stack_setup = False

    for line in lines:
        line = line.strip()

        if 'Stack Setup:' in line:
            in_stack_setup = True
            continue

        if in_stack_setup and line and line[0].isupper():
            # Parse player line: "Alice SB 12,500"
            parts = line.split()
            if len(parts) >= 2:
                name = parts[0]
                # Stack is last part
                stack_str = parts[-1]
                if stack_str.replace(',', '').lstrip('-').isdigit():
                    stack = int(stack_str.replace(',', ''))
                    players.append({'name': name, 'starting': stack})

    # Parse contributions and final stacks from results section
    results_match = re.search(r'Results:(.*?)(?=Next Hand Preview|$)', tc_content, re.DOTALL)
    if results_match:
        results_section = results_match.group(1)

        # Extract contribution and final stack for each player
        for player in players:
            name = player['name']

            # Look for "Alice: Contributed 5,000 → Final Stack: 7,500"
            contrib_match = re.search(
                rf'{name}:.*?Contributed ([\\d,]+).*?Final Stack: ([\\d,]+|-[\\d,]+)',
                results_section
            )

            if contrib_match:
                player['contributed'] = int(contrib_match.group(1).replace(',', ''))
                player['final'] = int(contrib_match.group(2).replace(',', ''))

    # Validate
    tc_errors = []

    for player in players:
        name = player.get('name', 'Unknown')
        starting = player.get('starting', 0)
        contributed = player.get('contributed', 0)
        final = player.get('final', 0)

        # Check for negative starting stack
        if starting < 0:
            tc_errors.append(f"{name}: Negative starting stack ({starting})")

        # Check for negative final stack
        if final < 0:
            tc_errors.append(f"{name}: Negative final stack ({final})")

        # Check for over-contribution
        if contributed > starting:
            tc_errors.append(f"{name}: Over-contribution (contributed {contributed} > starting {starting})")

        # Check calculation
        expected_final = starting - contributed
        if final != expected_final:
            tc_errors.append(
                f"{name}: Calculation error (final {final} != starting {starting} - contributed {contributed} = {expected_final})"
            )

    if tc_errors:
        print(f"[TC-{tc_num}] [X] FAILED - {len(tc_errors)} error(s)")
        errors_by_tc[tc_num] = tc_errors
        failed += 1
    else:
        print(f"[TC-{tc_num}] [OK] PASSED")
        passed += 1

print()
print("="*80)
print("SUMMARY")
print("="*80)
print(f"Total Test Cases: {len(tc_matches)}")
print(f"Passed: {passed} ({100*passed/len(tc_matches):.1f}%)")
print(f"Failed: {failed} ({100*failed/len(tc_matches):.1f}%)")
print()

if failed > 0:
    print("="*80)
    print("FAILED TEST CASES - DETAILS")
    print("="*80)
    for tc_num, errors in sorted(errors_by_tc.items()):
        print(f"\nTC-{tc_num}:")
        for error in errors:
            print(f"  - {error}")

print()
if failed == 0:
    print("[OK] ALL VALIDATIONS PASSED")
else:
    print(f"[X] {failed} test case(s) need attention")

print("="*80)

# Write report
with open('validation_40_cases_report.txt', 'w') as f:
    f.write(f"40 Test Cases Validation Report\n")
    f.write(f"={'='*70}\n\n")
    f.write(f"Total: {len(tc_matches)}\n")
    f.write(f"Passed: {passed} ({100*passed/len(tc_matches):.1f}%)\n")
    f.write(f"Failed: {failed} ({100*failed/len(tc_matches):.1f}%)\n\n")

    if failed > 0:
        f.write("Failed Test Cases:\n")
        f.write("-"*70 + "\n\n")
        for tc_num, errors in sorted(errors_by_tc.items()):
            f.write(f"TC-{tc_num}:\n")
            for error in errors:
                f.write(f"  - {error}\n")
            f.write("\n")

print(f"\nReport written to: validation_40_cases_report.txt")
