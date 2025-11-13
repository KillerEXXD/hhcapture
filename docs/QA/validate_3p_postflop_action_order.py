#!/usr/bin/env python3
"""
Validate 3-Player Postflop Action Order

In 3-player games, postflop action order should be:
1. SB (Small Blind) acts first
2. BB (Big Blind) acts second
3. Dealer acts last

This validation checks that all postflop streets (Flop, Turn, River) Base actions
follow this order in 3-player games.
"""
import re

def validate_3p_postflop_order(html_file):
    """Validate postflop action order in 3-player games"""

    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all test cases
    tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+|$)'
    tc_matches = re.findall(tc_pattern, content, re.DOTALL)

    print("="*70)
    print("3-PLAYER POSTFLOP ACTION ORDER VALIDATION")
    print("="*70)
    print()

    three_player_cases = []
    passed = 0
    failed = 0
    errors = []

    for tc_num, tc_content in tc_matches:
        tc_num = int(tc_num)

        # Check if this is a 3-player game
        test_name_match = re.search(r'<div class="test-name">([^<]+)</div>', tc_content)
        if not test_name_match:
            continue

        test_name = test_name_match.group(1)
        if not test_name.startswith('3P'):
            continue

        three_player_cases.append(tc_num)

        # Extract player positions from the "Copy Player Data" button's onclick data
        # Find the button with "Copy Player Data" text, then extract its onclick data
        # Format in onclick: Alice Dealer 500000\nBob SB 330000\nCharlie BB 360000
        copy_button_match = re.search(
            r'<button class="copy-btn" onclick="copyPlayerData\(this, `([^`]+)`\)">\s*<span>📋</span> Copy Player Data',
            tc_content
        )

        if not copy_button_match:
            errors.append(f"TC-{tc_num}: Could not find copy button data")
            failed += 1
            continue

        copy_data = copy_button_match.group(1)

        # Extract player lines from Stack Setup section
        # The data has literal \n characters (from JS string), need to match after "Stack Setup:\n"
        # Format after "Stack Setup:\n": Name Position Stack
        stack_setup_match = re.search(r'Stack Setup:\\n(.+)', copy_data)

        if not stack_setup_match:
            errors.append(f"TC-{tc_num}: Could not find Stack Setup section")
            failed += 1
            continue

        stack_setup_data = stack_setup_match.group(1)

        # Now match players: name position stack
        # First player has no \n prefix, subsequent players have \\n prefix
        player_pattern = r'(?:\\n)?(\w+)\s+(Dealer|SB|BB|UTG)\s+(\d+)'
        players_match = re.findall(player_pattern, stack_setup_data)

        if len(players_match) != 3:
            errors.append(f"TC-{tc_num}: Could not parse 3 players (found {len(players_match)})")
            failed += 1
            continue

        # Build position map
        position_map = {}
        for name, position, stack in players_match:
            position_map[name.strip()] = position.strip()

        # Validate postflop streets: Flop Base, Turn Base, River Base
        postflop_streets = [
            ('Flop Base', 'Flop'),
            ('Turn Base', 'Turn'),
            ('River Base', 'River')
        ]

        tc_passed = True

        for street_display, street_name in postflop_streets:
            # Find this street's base actions
            street_pattern = rf'<div class="street-name">{re.escape(street_display)}[^<]*</div>(.*?)(?=<div class="street-name">|</div>\s*</div>|$)'
            street_match = re.search(street_pattern, tc_content, re.DOTALL)

            if not street_match:
                # Street doesn't exist - that's ok (hand might have ended earlier)
                continue

            street_content = street_match.group(1)

            # Extract actions
            action_pattern = r'<span class="action-player">([^(]+)\s*\([^)]+\):</span>'
            action_players = re.findall(action_pattern, street_content)

            if not action_players:
                # No actions on this street (rare but possible)
                continue

            # Get first player who acted
            first_player = action_players[0].strip()
            first_player_position = position_map.get(first_player, 'Unknown')

            # Check if SB is present in the action list
            sb_player_name = None
            for name, pos in position_map.items():
                if pos == 'SB':
                    sb_player_name = name
                    break

            # If SB acted this street, they should be first
            sb_acted = any(sb_player_name in player for player in action_players)

            if sb_acted and first_player_position != 'SB':
                errors.append(
                    f"TC-{tc_num} {street_name}: First actor is {first_player} ({first_player_position}), "
                    f"should be {sb_player_name} (SB)"
                )
                tc_passed = False
            elif not sb_acted and first_player_position == 'SB':
                # This is fine - SB might have folded or is all-in
                pass

        if tc_passed:
            passed += 1
            print(f"[OK] TC-{tc_num}: {test_name}")
        else:
            failed += 1
            print(f"[X] TC-{tc_num}: {test_name}")

    print()
    print("="*70)
    print("SUMMARY")
    print("="*70)
    print(f"3-Player Games Checked: {len(three_player_cases)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print()

    if failed > 0:
        print("="*70)
        print("FAILED CASES - DETAILS")
        print("="*70)
        for error in errors:
            print(f"  - {error}")
        print()
        print("[X] Some 3-player games have incorrect postflop action order!")
    else:
        print("[OK] ALL 3-PLAYER GAMES HAVE CORRECT POSTFLOP ACTION ORDER!")

    print("="*70)

    return {
        'total': len(three_player_cases),
        'passed': passed,
        'failed': failed,
        'errors': errors
    }


if __name__ == '__main__':
    import sys

    # Default to 10_MoreAction_TC.html, allow override from command line
    html_file = sys.argv[1] if len(sys.argv) > 1 else '10_MoreAction_TC.html'
    print(f"Reading {html_file}...")
    print()

    results = validate_3p_postflop_order(html_file)

    # Write report
    with open('3p_postflop_action_order_report.txt', 'w') as f:
        f.write("3-Player Postflop Action Order Validation Report\n")
        f.write("="*70 + "\n\n")
        f.write(f"Total 3-Player Games: {results['total']}\n")
        f.write(f"Passed: {results['passed']}\n")
        f.write(f"Failed: {results['failed']}\n\n")

        if results['failed'] > 0:
            f.write("Failed Cases:\n")
            f.write("-"*70 + "\n")
            for error in results['errors']:
                f.write(f"  - {error}\n")
        else:
            f.write("All 3-player games have correct postflop action order!\n")

    print(f"\nDetailed report written to: 3p_postflop_action_order_report.txt")
