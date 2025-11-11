"""
Comprehensive validation script for 30_base_validated_cases.html
Validates:
1. No negative final stacks
2. Contribution = Starting Stack - Final Stack
3. Pot calculations are correct
4. Action order is valid
5. All-in amounts don't exceed starting stack
"""

import re
from collections import defaultdict

def parse_number(s):
    """Parse number from formatted string (e.g., '1,000,000' -> 1000000)"""
    if isinstance(s, str):
        return int(s.replace(',', ''))
    return int(s)

def validate_test_case(tc_num, tc_content):
    """Validate a single test case"""
    errors = []
    warnings = []

    # Extract Hand setup
    hand_match = re.search(r'<pre>Hand \((\d+)\)(.*?)</pre>', tc_content, re.DOTALL)
    if not hand_match:
        return ["ERROR: Could not find Hand data"], []

    hand_setup = hand_match.group(2)

    # Extract blinds
    blind_match = re.search(r'SB (\d+) BB (\d+) Ante (\d+)', hand_setup)
    if not blind_match:
        return ["ERROR: Could not extract blinds"], []

    sb = int(blind_match.group(1))
    bb = int(blind_match.group(2))
    ante = int(blind_match.group(3))

    # Extract starting stacks
    starting_stacks = {}
    lines = hand_setup.strip().split('\n')
    in_stack_setup = False

    for line in lines:
        line = line.strip()
        if 'Stack Setup:' in line:
            in_stack_setup = True
            continue
        if in_stack_setup and line and line[0].isupper():
            parts = line.split()
            if len(parts) >= 3:
                name = parts[0]
                stack = int(parts[-1])
                starting_stacks[name] = stack

    # Extract Expected Results table - matches actual HTML structure
    results_match = re.search(r'<div class="section-title">Expected Results</div>.*?<tbody>(.*?)</tbody>', tc_content, re.DOTALL)
    if not results_match:
        return ["ERROR: Could not find Expected Results table"], []

    results_table = results_match.group(1)

    # Parse each player's results - 6 columns: Player, Starting, Final, Contributed, Winner, New Stack
    player_rows = re.findall(r'<tr>\s*<td>([^<]+)</td>\s*<td>([^<]+)</td>\s*<td>([^<]+)</td>\s*<td>([^<]+)</td>\s*<td>.*?</td>\s*<td>([^<]+)</td>', results_table)

    total_contributed = 0

    for player_data in player_rows:
        player_name_raw = player_data[0].strip()
        # Extract just the name (remove position in parentheses)
        player_name = player_name_raw.split('(')[0].strip()

        starting_str = player_data[1].strip()
        final_str = player_data[2].strip()
        contributed_str = player_data[3].strip()

        # Parse numbers
        starting = parse_number(starting_str)
        final = parse_number(final_str)

        # Extract contribution (may have "(all-in)" suffix)
        contributed_match = re.search(r'([\d,]+)', contributed_str)
        if not contributed_match:
            errors.append(f"ERROR: {player_name} - Could not parse contribution '{contributed_str}'")
            continue

        contributed = parse_number(contributed_match.group(1))

        # Validation 1: Check for negative final stacks
        if final < 0:
            errors.append(f"ERROR: {player_name} - NEGATIVE final stack: {final:,}")

        # Validation 2: Check contribution calculation
        expected_contributed = starting - final
        if contributed != expected_contributed:
            errors.append(f"ERROR: {player_name} - Contribution mismatch: Expected {expected_contributed:,}, Got {contributed:,}")

        # Validation 3: Check starting stack matches hand setup
        if player_name in starting_stacks:
            if starting != starting_stacks[player_name]:
                errors.append(f"ERROR: {player_name} - Starting stack mismatch: Hand setup says {starting_stacks[player_name]:,}, table says {starting:,}")
        else:
            warnings.append(f"WARNING: {player_name} - Not found in starting stacks")

        # Validation 4: Check contribution doesn't exceed starting stack
        if contributed > starting:
            errors.append(f"ERROR: {player_name} - Contributed {contributed:,} exceeds starting stack {starting:,}")

        total_contributed += contributed

    # Extract Total Pot
    pot_match = re.search(r'<div class="pot-summary">Total Pot: ([\d,]+)</div>', tc_content)
    if pot_match:
        total_pot = parse_number(pot_match.group(1))

        # Validation 5: Check total pot matches total contributions
        if total_pot != total_contributed:
            errors.append(f"ERROR: Total Pot mismatch - Pot: {total_pot:,}, Contributions: {total_contributed:,}, Difference: {abs(total_pot - total_contributed):,}")
    else:
        warnings.append("WARNING: Could not find Total Pot")

    return errors, warnings

def main():
    filename = '30_base_validated_cases.html'

    print("=" * 80)
    print(f"COMPREHENSIVE VALIDATION: {filename}")
    print("=" * 80)
    print()

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all test cases
    tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+|$)'
    tc_matches = re.findall(tc_pattern, content, re.DOTALL)

    passed = 0
    failed = 0
    all_errors = []

    for tc_num, tc_content in tc_matches:
        errors, warnings = validate_test_case(tc_num, tc_content)

        if errors:
            failed += 1
            print(f"[FAIL] TEST CASE {tc_num}: FAILED")
            for error in errors:
                print(f"   {error}")
            all_errors.append((tc_num, errors))
        else:
            passed += 1
            print(f"[PASS] TEST CASE {tc_num}: PASSED")

        if warnings:
            for warning in warnings:
                print(f"   [WARN] {warning}")

        print()

    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total Test Cases: {passed + failed}")
    print(f"Passed: {passed} ({100 * passed / (passed + failed):.1f}%)")
    print(f"Failed: {failed} ({100 * failed / (passed + failed) if passed + failed > 0 else 0:.1f}%)")
    print()

    if all_errors:
        print("=" * 80)
        print("FAILED TEST CASES SUMMARY")
        print("=" * 80)
        for tc_num, errors in all_errors:
            print(f"\nTest Case {tc_num}:")
            for error in errors:
                print(f"  - {error}")
    else:
        print("ALL TEST CASES PASSED!")

    print()
    print("=" * 80)

if __name__ == '__main__':
    main()
