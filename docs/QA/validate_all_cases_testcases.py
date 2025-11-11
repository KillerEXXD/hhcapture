import re
from collections import defaultdict

# Read the HTML file
with open('30_TestCases.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all test cases with full details
tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+|$)'
tc_matches = re.findall(tc_pattern, content, re.DOTALL)

validation_results = []
failed_cases = []

print('=' * 80)
print('VALIDATION REPORT - 30 Base Test Cases')
print('=' * 80)
print()

for tc_num, tc_content in tc_matches[:30]:
    errors = []
    warnings = []

    # Extract Hand number
    hand_match = re.search(r'<pre>Hand \((\d+)\)(.*?)</pre>', tc_content, re.DOTALL)
    if not hand_match:
        errors.append("Could not find Hand data")
        continue

    hand_num = hand_match.group(1)
    hand_setup = hand_match.group(2)

    # Extract blinds
    blind_match = re.search(r'SB (\d+) BB (\d+) Ante (\d+)', hand_setup)
    if blind_match:
        sb = int(blind_match.group(1))
        bb = int(blind_match.group(2))
        ante = int(blind_match.group(3))

    # Extract players
    lines = hand_setup.strip().split('\n')
    players = []
    in_stack_setup = False

    for line in lines:
        line = line.strip()
        if 'Stack Setup:' in line:
            in_stack_setup = True
            continue
        if in_stack_setup and line and line[0].isupper():
            # Parse player line: "Alice Dealer 80000" or "Alice SB 165000"
            parts = line.split()
            if len(parts) >= 2 and parts[-1].lstrip('-').isdigit():
                name = parts[0]
                stack = int(parts[-1])
                position = ' '.join(parts[1:-1]) if len(parts) > 2 else ''
                players.append({'name': name, 'position': position, 'stack': stack})

    player_count = len(players)

    # VALIDATION RULE 1: Negative Stacks (NEW RULE)
    for player in players:
        if player['stack'] < 0:
            errors.append(f"[NEGATIVE STACK] {player['name']} has stack {player['stack']} (must be >= 0)")

    # VALIDATION RULE 2: Stack Size Requirements (10-60 BB)
    if bb > 0:
        for player in players:
            if player['stack'] != 0:  # Ignore eliminated players
                bb_count = player['stack'] / bb
                if bb_count < 10:
                    warnings.append(f"[SHORT STACK] {player['name']} has {bb_count:.1f} BB (minimum should be 10 BB)")
                elif bb_count > 60:
                    warnings.append(f"[DEEP STACK] {player['name']} has {bb_count:.1f} BB (maximum should be 60 BB)")

    # VALIDATION RULE 3: Duplicate Stacks
    stack_counts = defaultdict(int)
    for player in players:
        if player['stack'] > 0:  # Don't count eliminated players
            stack_counts[player['stack']] += 1

    for stack, count in stack_counts.items():
        if count > 1:
            errors.append(f"[DUPLICATE STACKS] {count} players have stack {stack:,} (all players must have different stacks)")

    # VALIDATION RULE 4: Position Labels (only Dealer, SB, BB)
    invalid_positions = ['UTG', 'MP', 'CO', 'HJ']
    for player in players:
        for invalid_pos in invalid_positions:
            if invalid_pos in player['position']:
                errors.append(f"[INVALID POSITION] {player['name']} has '{player['position']}' (only Dealer, SB, BB allowed)")

    # VALIDATION RULE 5: Stack Setup Order (must start with Dealer)
    if player_count >= 3:  # 3+ players must have Dealer first
        if players[0]['position'] != 'Dealer':
            errors.append(f"[WRONG ORDER] First player is {players[0]['name']} {players[0]['position']} (must start with Dealer)")
    elif player_count == 2:  # Heads-up: must be SB, BB (no Dealer)
        if 'Dealer' in players[0]['position'] or 'Dealer' in players[1]['position']:
            errors.append(f"[HEADS-UP ERROR] 2-player hand has Dealer (should only have SB and BB)")

    # VALIDATION RULE 6: Extract Expected Results
    results_match = re.search(r'<tbody>(.*?)</tbody>', tc_content, re.DOTALL)
    if results_match:
        results_table = results_match.group(1)

        # Extract final stacks and contributions
        for player in players:
            # Look for player's row in results table - more flexible pattern
            player_pattern = rf'<tr>.*?{player["name"]}.*?</tr>'
            player_row_match = re.search(player_pattern, results_table, re.DOTALL)

            if player_row_match:
                player_row = player_row_match.group(0)
                # Extract all numbers from td cells (including cells with text like "75,000 (all-in)")
                numbers = re.findall(r'<td[^>]*>([\d,\-]+(?:\s*\([^)]+\))?)</td>', player_row)

                if len(numbers) >= 3:
                    starting = int(numbers[0].replace(',', ''))
                    final = int(numbers[1].replace(',', '').replace('-', '-'))  # Handle negative
                    contributed_raw = numbers[2].replace(',', '')

                    # Handle all-in notation like "5,000 (all-in)" - extract just the number part
                    contributed_match = re.search(r'([\d-]+)', contributed_raw)
                    contributed = int(contributed_match.group(1)) if contributed_match else 0

                    # RULE 7: Final Stack cannot be negative
                    if final < 0:
                        errors.append(f"[NEGATIVE FINAL] {player['name']} final stack is {final:,} (must be >= 0)")

                    # RULE 8: Contribution cannot exceed starting stack
                    if contributed > starting:
                        errors.append(f"[OVER-CONTRIBUTION] {player['name']} contributed {contributed:,} but only started with {starting:,}")

                    # RULE 9: Final Stack = Starting Stack - Contributed
                    expected_final = starting - contributed
                    if final != expected_final and abs(final - expected_final) > 1:  # Allow 1 chip rounding error
                        errors.append(f"[CALCULATION ERROR] {player['name']} final should be {expected_final:,} but shows {final:,}")

    # VALIDATION RULE 10: Next Hand Preview - Check for negative stacks
    next_hand_pattern = r'onclick="copyPlayerData\(this, `Hand \((\d+)\)([^`]+)`\)".*?Next Hand'
    next_hand_match = re.search(next_hand_pattern, tc_content, re.DOTALL)

    if next_hand_match:
        next_hand_num = next_hand_match.group(1)
        next_hand_setup = next_hand_match.group(2)
        next_hand_lines = [line.strip() for line in next_hand_setup.split('\\n') if line.strip()]

        for line in next_hand_lines:
            if line and len(line) > 0 and line[0].isupper() and any(c.isdigit() or c == '-' for c in line):
                parts = line.split()
                if len(parts) >= 2:
                    next_stack_str = parts[-1]
                    # Check if it's a negative number
                    if '-' in next_stack_str:
                        try:
                            next_stack = int(next_stack_str)
                            if next_stack < 0:
                                errors.append(f"[NEXT HAND NEGATIVE] {parts[0]} shows stack {next_stack} in Hand {next_hand_num} preview")
                        except:
                            pass

    # Compile results
    status = "PASS" if len(errors) == 0 else "FAIL"

    if errors or warnings:
        print(f'TC-{tc_num} (Hand {hand_num}): {player_count} players - {status}')
        if errors:
            for error in errors:
                print(f'  {error}')
        if warnings:
            for warning in warnings:
                print(f'  {warning}')
        print()

    validation_results.append({
        'tc': tc_num,
        'hand': hand_num,
        'players': player_count,
        'errors': errors,
        'warnings': warnings,
        'status': 'PASS' if len(errors) == 0 else 'FAIL'
    })

    if errors:
        failed_cases.append(tc_num)

# Summary
print('=' * 80)
print('SUMMARY')
print('=' * 80)

passed = sum(1 for r in validation_results if r['status'] == 'PASS')
failed = sum(1 for r in validation_results if r['status'] == 'FAIL')

print(f'Total Test Cases: {len(validation_results)}')
print(f'Passed: {passed} ({passed/len(validation_results)*100:.1f}%)')
print(f'Failed: {failed} ({failed/len(validation_results)*100:.1f}%)')
print()

if failed_cases:
    print(f'Failed Test Cases: TC-{", TC-".join(failed_cases)}')
    print()

    # Error breakdown
    error_types = defaultdict(int)
    for result in validation_results:
        for error in result['errors']:
            error_type = error.split(']')[0] + ']'
            error_types[error_type] += 1

    print('Error Breakdown:')
    for error_type, count in sorted(error_types.items(), key=lambda x: x[1], reverse=True):
        print(f'  {error_type}: {count} occurrences')

print('=' * 80)

# Write detailed report to file
with open('validation_report.txt', 'w', encoding='utf-8') as f:
    f.write('DETAILED VALIDATION REPORT\n')
    f.write('=' * 80 + '\n\n')

    for result in validation_results:
        if result['errors']:
            f.write(f"TC-{result['tc']} (Hand {result['hand']}): {result['players']} players - {result['status']}\n")
            for error in result['errors']:
                f.write(f"  {error}\n")
            f.write('\n')

print('\nDetailed report written to: validation_report.txt')
