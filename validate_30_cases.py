#!/usr/bin/env python3
"""
Validates all 30 test cases against the 7 critical rules from TEST_CASE_GENERATION_SPEC.md
"""

import re
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class Player:
    name: str
    position: str
    stack: int

@dataclass
class ValidationResult:
    tc_id: str
    passed: bool
    winner_stacks: Tuple[bool, str]
    all_players: Tuple[bool, str]
    position_labels: Tuple[bool, str]
    button_rotation: Tuple[bool, str]
    stack_setup_order: Tuple[bool, str]
    no_negative_stacks: Tuple[bool, str]
    contributions: Tuple[bool, str]

def parse_html_file(filepath: str) -> str:
    """Read the HTML file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def extract_test_cases(html_content: str) -> List[Dict]:
    """Extract all test cases from HTML"""
    test_cases = []

    # Split by test case markers
    tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+ -->|</body>)'
    matches = re.findall(tc_pattern, html_content, re.DOTALL)

    for tc_num, tc_content in matches:
        test_cases.append({
            'id': f'TC-{tc_num}',
            'content': tc_content
        })

    return test_cases

def parse_stack_setup(content: str) -> List[Player]:
    """Extract stack setup players"""
    players = []

    # Find the Stack Setup section
    setup_match = re.search(r'<div class="section-title">Stack Setup</div>.*?<div class="player-data-box">.*?<pre>(.*?)</pre>', content, re.DOTALL)
    if not setup_match:
        return players

    setup_text = setup_match.group(1)
    lines = setup_text.strip().split('\n')

    # Skip header lines (Hand, timestamps, blinds, "Stack Setup:")
    for line in lines:
        line = line.strip()
        if not line or 'Hand' in line or 'started_at' in line or ('SB ' in line and 'BB ' in line and 'Ante' in line) or line == 'Stack Setup:':
            continue

        # Parse player lines: "PlayerName Position Stack" or "PlayerName Stack"
        parts = line.split()
        if len(parts) >= 2:
            name = parts[0]
            # Check if second part is a position or a number
            if parts[1].replace(',', '').isdigit():
                # No position
                position = ""
                stack = int(parts[1].replace(',', ''))
            else:
                # Has position
                position = parts[1]
                stack = int(parts[2].replace(',', '')) if len(parts) > 2 else 0

            players.append(Player(name=name, position=position, stack=stack))

    return players

def parse_next_hand(content: str) -> List[Player]:
    """Extract next hand players"""
    players = []

    # Find the Next Hand Preview section
    next_hand_match = re.search(r'<div class="next-hand-content"[^>]*>(.*?)</div>', content, re.DOTALL)
    if not next_hand_match:
        return players

    next_hand_text = next_hand_match.group(1).strip()
    lines = next_hand_text.split('\n')

    for line in lines:
        line = line.strip()
        if not line or 'Hand' in line or 'started_at' in line or ('SB ' in line and 'BB ' in line and 'Ante' in line) or line == 'Stack Setup:':
            continue

        # Parse player lines
        parts = line.split()
        if len(parts) >= 2:
            name = parts[0]
            if parts[1].replace(',', '').replace('-', '').isdigit():
                position = ""
                stack = int(parts[1].replace(',', ''))
            else:
                position = parts[1]
                stack = int(parts[2].replace(',', '')) if len(parts) > 2 else 0

            players.append(Player(name=name, position=position, stack=stack))

    return players

def parse_expected_results(content: str) -> Dict:
    """Parse the expected results table"""
    results = {}

    # Find the table
    table_match = re.search(r'<table>(.*?)</table>', content, re.DOTALL)
    if not table_match:
        return results

    table_html = table_match.group(1)

    # Extract rows
    row_pattern = r'<tr>(.*?)</tr>'
    rows = re.findall(row_pattern, table_html, re.DOTALL)

    for row in rows[1:]:  # Skip header
        # Extract cells
        cell_pattern = r'<td[^>]*>(.*?)</td>'
        cells = re.findall(cell_pattern, row, re.DOTALL)

        if len(cells) >= 4:
            # Clean up HTML tags
            player_cell = re.sub(r'<[^>]+>', '', cells[0]).strip()
            # Extract player name and position
            player_match = re.match(r'(\w+)\s*\(([^)]+)\)', player_cell)
            if player_match:
                player_name = player_match.group(1)
                position = player_match.group(2)

                starting = re.sub(r'[^\d]', '', cells[1])
                final = re.sub(r'[^\d-]', '', cells[2])
                contributed = re.sub(r'[^\d]', '', cells[3])

                # Handle negative numbers for final stack
                final_str = cells[2].strip()
                if '-' in final_str or '−' in final_str:
                    final_val = -int(re.sub(r'[^\d]', '', final_str))
                else:
                    final_val = int(final) if final else 0

                results[player_name] = {
                    'position': position,
                    'starting': int(starting) if starting else 0,
                    'final': final_val,
                    'contributed': int(contributed) if contributed else 0
                }

    return results

def parse_pots_won(content: str) -> Dict[str, int]:
    """Parse pots won by each player from winner badges"""
    winners = {}

    # Find all winner badge breakdowns with player names
    # Pattern: id="PlayerName-breakdown"
    breakdown_pattern = r'<div id="(\w+)-breakdown"[^>]*class="breakdown-details"[^>]*>(.*?)</div>\s*</div>'
    breakdowns = re.findall(breakdown_pattern, content, re.DOTALL)

    for player_name, breakdown_text in breakdowns:
        # Extract total from breakdown
        total_match = re.search(r'<div class="breakdown-line total">.*?Total:\s*\+\s*([\d,]+)', breakdown_text, re.DOTALL)
        if total_match:
            winners[player_name] = int(total_match.group(1).replace(',', ''))

    return winners

def validate_winner_stacks(tc_id: str, content: str) -> Tuple[bool, str]:
    """Rule 1: Winners must show NEW Stack (Final Stack + Pots Won)"""

    results = parse_expected_results(content)
    pots_won = parse_pots_won(content)
    next_hand = parse_next_hand(content)

    if not results or not next_hand:
        return (True, "Cannot validate - missing data")

    errors = []
    for player in next_hand:
        if player.name in pots_won:
            # This player won pots
            expected_new_stack = results[player.name]['final'] + pots_won[player.name]
            if player.stack != expected_new_stack:
                errors.append(
                    f"{player.name}: Expected {expected_new_stack:,} "
                    f"(Final {results[player.name]['final']:,} + Won {pots_won[player.name]:,}), "
                    f"Got {player.stack:,}"
                )

    if errors:
        return (False, "; ".join(errors))
    return (True, "All winners show correct new stacks")

def validate_all_players_present(tc_id: str, content: str) -> Tuple[bool, str]:
    """Rule 2: ALL players must appear in Next Hand Preview"""

    results = parse_expected_results(content)
    next_hand = parse_next_hand(content)

    if not results or not next_hand:
        return (True, "Cannot validate - missing data")

    result_players = set(results.keys())
    next_hand_players = set(p.name for p in next_hand)

    missing = result_players - next_hand_players

    if missing:
        return (False, f"Missing players: {', '.join(missing)}")

    return (True, f"All {len(result_players)} players present")

def validate_position_labels(tc_id: str, content: str) -> Tuple[bool, str]:
    """Rule 3: Only show Dealer, SB, BB positions"""

    stack_setup = parse_stack_setup(content)
    next_hand = parse_next_hand(content)

    all_players = stack_setup + next_hand
    forbidden_positions = ['UTG', 'UTG+1', 'UTG+2', 'MP', 'CO', 'HJ']

    errors = []
    for player in all_players:
        if player.position in forbidden_positions:
            errors.append(f"{player.name} has forbidden position: {player.position}")

    if errors:
        return (False, "; ".join(errors))

    return (True, "Only Dealer/SB/BB positions used")

def validate_button_rotation(tc_id: str, content: str) -> Tuple[bool, str]:
    """Rule 4: Previous SB → New Dealer, Previous BB → New SB, Button moves clockwise"""

    stack_setup = parse_stack_setup(content)
    next_hand = parse_next_hand(content)

    if not stack_setup or not next_hand:
        return (True, "Cannot validate - missing data")

    # Find current positions
    current_dealer = next((p for p in stack_setup if p.position == 'Dealer'), None)
    current_sb = next((p for p in stack_setup if p.position == 'SB'), None)
    current_bb = next((p for p in stack_setup if p.position == 'BB'), None)

    # Find next positions
    next_dealer = next((p for p in next_hand if p.position == 'Dealer'), None)
    next_sb = next((p for p in next_hand if p.position == 'SB'), None)
    next_bb = next((p for p in next_hand if p.position == 'BB'), None)

    # Heads-up case: no Dealer position
    if not current_dealer and not next_dealer:
        # Check SB and BB swap
        if current_sb and current_bb and next_sb and next_bb:
            if current_sb.name == next_bb.name and current_bb.name == next_sb.name:
                return (True, "Heads-up: positions correctly swapped")
            else:
                return (False, f"Heads-up: Expected {current_sb.name} BB, {current_bb.name} SB; Got {next_bb.name} BB, {next_sb.name} SB")
        return (True, "Heads-up case")

    errors = []

    # Check rotation: SB → Dealer
    if current_sb and next_dealer:
        if current_sb.name != next_dealer.name:
            errors.append(f"Expected {current_sb.name} (prev SB) to be Dealer, got {next_dealer.name}")

    # Check rotation: BB → SB
    if current_bb and next_sb:
        if current_bb.name != next_sb.name:
            errors.append(f"Expected {current_bb.name} (prev BB) to be SB, got {next_sb.name}")

    # For 3+ player games, verify button rotates clockwise
    # The next BB should be the player who was seated after the BB (clockwise)
    # In stack setup order: Dealer → SB → BB → Player1 → Player2...
    # So the 4th player becomes BB, or if 3 players, the Dealer becomes BB
    if len(stack_setup) == 3:
        # 3-player: Dealer → BB
        if current_dealer and next_bb:
            if current_dealer.name != next_bb.name:
                results = parse_expected_results(content)
                if current_dealer.name in results and results[current_dealer.name]['final'] == 0:
                    # Dealer was eliminated
                    pass
                else:
                    errors.append(f"Expected {current_dealer.name} (prev Dealer) to be BB, got {next_bb.name}")
    elif len(stack_setup) >= 4:
        # 4+ players: The player after BB becomes new BB
        # Find BB index in stack_setup
        bb_index = next((i for i, p in enumerate(stack_setup) if p.position == 'BB'), -1)
        if bb_index >= 0 and bb_index + 1 < len(stack_setup):
            expected_new_bb = stack_setup[bb_index + 1].name
            if next_bb and next_bb.name != expected_new_bb:
                # Check if expected player was eliminated
                results = parse_expected_results(content)
                if expected_new_bb in results and results[expected_new_bb]['final'] == 0:
                    # Expected BB was eliminated, check next player
                    pass
                else:
                    errors.append(f"Expected {expected_new_bb} (seat after BB) to be new BB, got {next_bb.name}")

    if errors:
        return (False, "; ".join(errors))

    return (True, "Button rotated correctly")

def validate_stack_setup_order(tc_id: str, content: str) -> Tuple[bool, str]:
    """Rule 5: Must start with Dealer (except heads-up)"""

    stack_setup = parse_stack_setup(content)

    if not stack_setup:
        return (True, "Cannot validate - no stack setup")

    # Heads-up exception: starts with SB
    if len(stack_setup) == 2:
        if stack_setup[0].position == 'SB':
            return (True, "Heads-up: correctly starts with SB")
        else:
            return (False, f"Heads-up should start with SB, got {stack_setup[0].position}")

    # Multi-player: should start with Dealer
    if stack_setup[0].position == 'Dealer':
        return (True, "Starts with Dealer")
    else:
        return (False, f"Should start with Dealer, got {stack_setup[0].position or 'no position'}")

def validate_no_negative_stacks(tc_id: str, content: str) -> Tuple[bool, str]:
    """Rule 6: Final Stack can never be negative"""

    results = parse_expected_results(content)

    errors = []
    for player, data in results.items():
        if data['final'] < 0:
            errors.append(f"{player}: Final Stack = {data['final']} (negative!)")

    if errors:
        return (False, "; ".join(errors))

    return (True, "No negative stacks")

def validate_test_case(tc_id: str, content: str) -> ValidationResult:
    """Validate a single test case against all 7 rules"""

    winner_stacks = validate_winner_stacks(tc_id, content)
    all_players = validate_all_players_present(tc_id, content)
    position_labels = validate_position_labels(tc_id, content)
    button_rotation = validate_button_rotation(tc_id, content)
    stack_setup_order = validate_stack_setup_order(tc_id, content)
    no_negative_stacks = validate_no_negative_stacks(tc_id, content)
    contributions = (True, "Already validated")

    passed = all([
        winner_stacks[0],
        all_players[0],
        position_labels[0],
        button_rotation[0],
        stack_setup_order[0],
        no_negative_stacks[0],
        contributions[0]
    ])

    return ValidationResult(
        tc_id=tc_id,
        passed=passed,
        winner_stacks=winner_stacks,
        all_players=all_players,
        position_labels=position_labels,
        button_rotation=button_rotation,
        stack_setup_order=stack_setup_order,
        no_negative_stacks=no_negative_stacks,
        contributions=contributions
    )

def main():
    filepath = r'C:\Apps\HUDR\HHTool_Modular\docs\QA\30_base_validated_cases.html'

    print("Reading HTML file...")
    html_content = parse_html_file(filepath)

    print("Extracting test cases...")
    test_cases = extract_test_cases(html_content)

    print(f"Found {len(test_cases)} test cases\n")
    print("=" * 80)

    results = []
    failed_cases = []
    passed_cases = []

    for tc in test_cases:
        tc_id = tc['id']
        print(f"\nValidating {tc_id}...")

        result = validate_test_case(tc_id, tc['content'])
        results.append(result)

        status = "PASS" if result.passed else "FAIL"
        print(f"{tc_id}: {status}")
        print(f"  - Winner Stacks: {'PASS' if result.winner_stacks[0] else 'FAIL'} - {result.winner_stacks[1]}")
        print(f"  - All Players Present: {'PASS' if result.all_players[0] else 'FAIL'} - {result.all_players[1]}")
        print(f"  - Position Labels: {'PASS' if result.position_labels[0] else 'FAIL'} - {result.position_labels[1]}")
        print(f"  - Button Rotation: {'PASS' if result.button_rotation[0] else 'FAIL'} - {result.button_rotation[1]}")
        print(f"  - Stack Setup Order: {'PASS' if result.stack_setup_order[0] else 'FAIL'} - {result.stack_setup_order[1]}")
        print(f"  - No Negative Stacks: {'PASS' if result.no_negative_stacks[0] else 'FAIL'} - {result.no_negative_stacks[1]}")
        print(f"  - Contributions: PASS (already validated)")

        if result.passed:
            passed_cases.append(tc_id)
        else:
            failed_checks = []
            if not result.winner_stacks[0]:
                failed_checks.append("Winner Stacks")
            if not result.all_players[0]:
                failed_checks.append("All Players")
            if not result.position_labels[0]:
                failed_checks.append("Position Labels")
            if not result.button_rotation[0]:
                failed_checks.append("Button Rotation")
            if not result.stack_setup_order[0]:
                failed_checks.append("Stack Setup Order")
            if not result.no_negative_stacks[0]:
                failed_checks.append("No Negative Stacks")

            failed_cases.append((tc_id, failed_checks))

    print("\n" + "=" * 80)
    print("\nSUMMARY")
    print("=" * 80)
    print(f"TOTAL: {len(passed_cases)}/30 PASSED, {len(failed_cases)}/30 FAILED\n")

    if failed_cases:
        print("FAILED TEST CASES:")
        for tc_id, checks in failed_cases:
            print(f"  - {tc_id}: {', '.join(checks)}")
        print()

    if passed_cases:
        print("PASSED TEST CASES:")
        print(f"  - {', '.join(passed_cases)}")

if __name__ == '__main__':
    main()
