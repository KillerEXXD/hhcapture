import re
from collections import defaultdict

# Read the HTML file
with open('30_base_validated_cases.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all test cases
tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+|$)'
tc_matches = re.findall(tc_pattern, content, re.DOTALL)

validation_results = []
failed_cases = []

print('=' * 80)
print('ACTION ORDER VALIDATION - 2-Player and 3-Player Rules')
print('=' * 80)
print()

for tc_num, tc_content in tc_matches[:30]:
    errors = []
    warnings = []

    # Extract Hand number and player setup
    hand_match = re.search(r'<pre>Hand \((\d+)\)(.*?)</pre>', tc_content, re.DOTALL)
    if not hand_match:
        continue

    hand_num = hand_match.group(1)
    hand_setup = hand_match.group(2)

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
            parts = line.split()
            if len(parts) >= 2 and parts[-1].lstrip('-').isdigit():
                name = parts[0]
                stack = int(parts[-1])
                position = ' '.join(parts[1:-1]) if len(parts) > 2 else ''
                players.append({'name': name, 'position': position, 'stack': stack})

    player_count = len(players)

    # Extract actions
    actions_match = re.search(r'<div class="section-title">Actions</div>(.*?)<div class="section-title">', tc_content, re.DOTALL)
    if not actions_match:
        continue

    actions_section = actions_match.group(1)

    # Extract Preflop Base actions
    preflop_match = re.search(r'Preflop Base</div>(.*?)(?:</div>\s*<div class="street-block">|</div>\s*</div>)', actions_section, re.DOTALL)
    if preflop_match:
        preflop_actions = preflop_match.group(1)
        action_pattern = r'<span class="action-player">(.*?)\((\w+)\):</span>'
        preflop_players = re.findall(action_pattern, preflop_actions)

        if preflop_players:
            # Get first player to act preflop
            first_player_name = preflop_players[0][0].strip()
            first_player_pos = preflop_players[0][1].strip()

            # VALIDATION RULE: Preflop Action Order
            if player_count == 2:
                # 2-handed (heads-up): Dealer/SB acts first, BB acts second
                # Find who is SB
                sb_player = next((p for p in players if 'SB' in p['position']), None)
                if sb_player and first_player_name != sb_player['name']:
                    errors.append(f"[2P PREFLOP ORDER] First to act is {first_player_name} ({first_player_pos}), should be {sb_player['name']} (SB/Dealer)")

            elif player_count == 3:
                # 3-handed: Dealer acts FIRST preflop, then SB, then BB
                dealer_player = next((p for p in players if 'Dealer' in p['position']), None)
                if dealer_player and first_player_name != dealer_player['name']:
                    errors.append(f"[3P PREFLOP ORDER] First to act is {first_player_name} ({first_player_pos}), should be {dealer_player['name']} (Dealer)")

                # Check full order: Dealer -> SB -> BB
                if len(preflop_players) >= 3:
                    expected_order = ['Dealer', 'SB', 'BB']
                    actual_order = [p[1].strip() for p in preflop_players[:3]]
                    if actual_order != expected_order:
                        errors.append(f"[3P PREFLOP SEQUENCE] Order is {' -> '.join(actual_order)}, should be Dealer -> SB -> BB")

    # Extract Flop Base actions (postflop)
    flop_match = re.search(r'Flop Base[^>]*</div>(.*?)(?:</div>\s*<div class="street-block">|</div>\s*</div>)', actions_section, re.DOTALL)
    if flop_match:
        flop_actions = flop_match.group(1)
        action_pattern = r'<span class="action-player">(.*?)\((\w+)\):</span>'
        flop_players = re.findall(action_pattern, flop_actions)

        if flop_players:
            first_player_name = flop_players[0][0].strip()
            first_player_pos = flop_players[0][1].strip()

            # VALIDATION RULE: Postflop Action Order
            if player_count == 2:
                # 2-handed postflop: BB acts FIRST, Dealer/SB acts second
                bb_player = next((p for p in players if 'BB' in p['position']), None)
                if bb_player and first_player_name != bb_player['name']:
                    errors.append(f"[2P POSTFLOP ORDER] First to act is {first_player_name} ({first_player_pos}), should be {bb_player['name']} (BB)")

            elif player_count == 3:
                # 3-handed postflop: SB acts FIRST, then BB, then Dealer
                sb_player = next((p for p in players if 'SB' in p['position']), None)
                if sb_player and first_player_name != sb_player['name']:
                    errors.append(f"[3P POSTFLOP ORDER] First to act is {first_player_name} ({first_player_pos}), should be {sb_player['name']} (SB)")

                # Check full order: SB -> BB -> Dealer
                if len(flop_players) >= 3:
                    expected_order = ['SB', 'BB', 'Dealer']
                    actual_order = [p[1].strip() for p in flop_players[:3]]
                    if actual_order != expected_order:
                        errors.append(f"[3P POSTFLOP SEQUENCE] Order is {' -> '.join(actual_order)}, should be SB -> BB -> Dealer")

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
print('SUMMARY - Action Order Validation')
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

# Write detailed report
with open('action_order_validation.txt', 'w', encoding='utf-8') as f:
    f.write('ACTION ORDER VALIDATION REPORT\n')
    f.write('=' * 80 + '\n\n')

    f.write('RULES CHECKED:\n')
    f.write('1. 2-Player Preflop: SB/Dealer acts first, BB acts second\n')
    f.write('2. 2-Player Postflop: BB acts first, SB/Dealer acts second\n')
    f.write('3. 3-Player Preflop: Dealer -> SB -> BB\n')
    f.write('4. 3-Player Postflop: SB -> BB -> Dealer\n\n')
    f.write('=' * 80 + '\n\n')

    for result in validation_results:
        if result['errors']:
            f.write(f"TC-{result['tc']} (Hand {result['hand']}): {result['players']} players - {result['status']}\n")
            for error in result['errors']:
                f.write(f"  {error}\n")
            f.write('\n')

print('\nDetailed report written to: action_order_validation.txt')
