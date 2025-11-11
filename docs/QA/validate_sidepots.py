"""
Side Pot Validation Tool
Validates that test cases have correct side pot structure
"""
import re

def parse_number(s):
    """Parse number from formatted string"""
    if isinstance(s, str):
        return int(s.replace(',', ''))
    return int(s)

def validate_sidepot_structure(tc_num, tc_content):
    """
    Validate side pot structure for a test case

    Returns:
        (is_valid, errors_list, warnings_list)
    """
    errors = []
    warnings = []

    # Extract Expected Results table
    results_match = re.search(r'<div class="section-title">Expected Results</div>.*?<tbody>(.*?)</tbody>', tc_content, re.DOTALL)
    if not results_match:
        return False, ["Could not find Expected Results table"], []

    results_table = results_match.group(1)

    # Parse player contributions
    player_rows = re.findall(r'<tr>\s*<td>([^<]+)</td>\s*<td>([^<]+)</td>\s*<td>([^<]+)</td>\s*<td>([^<]+)</td>', results_table)

    players = []
    for row in player_rows:
        name = row[0].strip().split('(')[0].strip()
        starting = parse_number(row[1].strip())
        final = parse_number(row[2].strip())

        contrib_match = re.search(r'([\d,]+)', row[3].strip())
        if contrib_match:
            contributed = parse_number(contrib_match.group(1))
            players.append({
                'name': name,
                'starting': starting,
                'final': final,
                'contributed': contributed
            })

    if len(players) < 2:
        return True, [], []  # Single player or no players, no validation needed

    # Extract ante
    ante_match = re.search(r'<strong>BB Ante: ([\d,]+)</strong>', tc_content)
    bb_ante = parse_number(ante_match.group(1)) if ante_match else 0

    # Find BB player
    bb_player = None
    for row in player_rows:
        if '(BB)' in row[0]:
            bb_player = row[0].strip().split('(')[0].strip()
            break

    # Calculate live contributions
    contributions = []
    for p in players:
        live = p['contributed']
        if p['name'] == bb_player:
            live -= bb_ante
        contributions.append({'name': p['name'], 'live': live, 'total': p['contributed']})

    # Check if side pots are needed
    unique_levels = sorted(set(c['live'] for c in contributions))
    needs_sidepot = len(unique_levels) > 1

    # Extract pot structure from HTML
    pot_items = re.findall(r'<div class="pot-item (main|side)">(.*?)</div>\s*</div>', tc_content, re.DOTALL)

    has_main_pot = False
    has_side_pot = False
    pot_count = 0

    for pot_type, pot_content in pot_items:
        pot_count += 1
        if pot_type == 'main':
            has_main_pot = True
        else:
            has_side_pot = True

    # Validation 1: Must have at least one main pot
    if not has_main_pot:
        errors.append("Missing main pot")

    # Validation 2: If contributions differ, must have side pots
    if needs_sidepot and not has_side_pot:
        errors.append(f"Players have different contribution levels ({unique_levels}) but no side pots found")

    # Validation 3: If no contribution difference, should not have side pots
    if not needs_sidepot and has_side_pot:
        warnings.append("Has side pots but all players contributed same amount")

    # Validation 4: Extract and verify pot amounts
    total_pot_match = re.search(r'<div class="pot-summary">Total Pot: ([\d,]+)</div>', tc_content)
    if total_pot_match:
        total_pot_html = parse_number(total_pot_match.group(1))
        total_contributed = sum(p['contributed'] for p in players)

        if total_pot_html != total_contributed:
            errors.append(f"Total pot mismatch: HTML shows {total_pot_html:,}, but contributions = {total_contributed:,}")

    # Validation 5: Verify pot amounts sum to total
    pot_amounts = []
    for pot_type, pot_content in pot_items:
        amount_match = re.search(r'<div class="pot-amount">([\\d,]+)', pot_content)
        if amount_match:
            pot_amounts.append(parse_number(amount_match.group(1)))

    if pot_amounts:
        pot_sum = sum(pot_amounts)
        total_contributed = sum(p['contributed'] for p in players)

        if pot_sum != total_contributed:
            errors.append(f"Pot amounts don't sum correctly: {pot_sum:,} != {total_contributed:,}")

    # Validation 6: Check pot eligibility
    for i, (pot_type, pot_content) in enumerate(pot_items):
        # Extract eligible players
        eligible_match = re.search(r'<div class="eligible">Eligible: (.*?)</div>', pot_content, re.DOTALL)
        if eligible_match:
            eligible_html = eligible_match.group(1)
            eligible_names = re.findall(r'<span>([^<]+)</span>', eligible_html)

            # For main pot, all players should be eligible
            if pot_type == 'main' and len(eligible_names) != len(players):
                warnings.append(f"Main pot eligible count ({len(eligible_names)}) != player count ({len(players)})")

            # For side pots, should have fewer eligible players than main pot
            if pot_type == 'side' and len(eligible_names) >= len(players):
                warnings.append(f"Side pot {i} has all players eligible (should be subset)")

    is_valid = len(errors) == 0
    return is_valid, errors, warnings


def main():
    import sys

    if len(sys.argv) > 1:
        filename = sys.argv[1]
    else:
        filename = 'C:\\Apps\\HUDR\\HHTool_Modular\\docs\\QA\\40_TestCases_v2.html'

    print("=" * 80)
    print(f"VALIDATING SIDE POT STRUCTURE: {filename}")
    print("=" * 80)
    print()

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all test cases
    tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+|$)'
    tc_matches = re.findall(tc_pattern, content, re.DOTALL)

    passed = 0
    failed = 0
    warnings_count = 0

    for tc_num, tc_content in tc_matches:
        is_valid, errors, warnings = validate_sidepot_structure(tc_num, tc_content)

        if is_valid:
            passed += 1
            if warnings:
                print(f"[PASS] TC-{tc_num}: Valid (with {len(warnings)} warnings)")
                for warning in warnings:
                    print(f"   [WARN] {warning}")
                warnings_count += len(warnings)
            else:
                print(f"[PASS] TC-{tc_num}: Valid")
        else:
            failed += 1
            print(f"[FAIL] TC-{tc_num}: Invalid")
            for error in errors:
                print(f"   [ERROR] {error}")
            if warnings:
                for warning in warnings:
                    print(f"   [WARN] {warning}")

    print()
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total Test Cases: {passed + failed}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Warnings: {warnings_count}")
    print()

    if failed == 0:
        print("ALL TEST CASES PASSED SIDE POT VALIDATION!")
    else:
        print(f"{failed} test case(s) need fixes")

    print("=" * 80)

    return 0 if failed == 0 else 1


if __name__ == '__main__':
    exit(main())
