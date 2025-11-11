"""Fix 2-player postflop action order: BB acts first, then SB"""

import re

def fix_2p_postflop(content, tc_num):
    """
    Fix postflop action order for 2-player test cases
    Rule: BB acts FIRST postflop, then SB/Dealer
    """
    print(f"Fixing TC-{tc_num}...")

    # Find TC section
    tc_pattern = rf'<!-- TEST CASE {tc_num} -->(.*?)(?=<!-- TEST CASE \d+|$)'
    tc_match = re.search(tc_pattern, content, re.DOTALL)

    if not tc_match:
        print(f"  [ERROR] Could not find TC-{tc_num}")
        return content

    tc_content = tc_match.group(1)

    # Check if it's a 2-player game
    if 'Alice SB' not in tc_content or 'Bob BB' not in tc_content:
        print(f"  [SKIP] Not a 2-player game")
        return content

    # Extract all postflop streets (Flop, Turn, River)
    streets = ['Flop', 'Turn', 'River']

    for street in streets:
        # Find street block
        street_pattern = rf'<div class="street-name">{street} Base[^<]*</div>\s*(<div class="action-row">.*?)</div>\s*</div>'
        street_matches = list(re.finditer(street_pattern, tc_content, re.DOTALL))

        for street_match in street_matches:
            actions_section = street_match.group(1)

            # Extract action rows
            action_pattern = r'<div class="action-row"><span class="action-player">([^<]+)\(([^)]+)\):</span>.*?</div>'
            actions = re.findall(action_pattern, actions_section, re.DOTALL)

            if len(actions) >= 2:
                first_player = actions[0][0].strip()
                first_pos = actions[0][1].strip()

                # Check if SB acts first (WRONG for postflop)
                if first_pos == 'SB':
                    print(f"  [{street}] Swapping action order: SB -> BB to BB -> SB")

                    # Extract individual action rows
                    action_rows = re.findall(r'(<div class="action-row">.*?</div>)', actions_section, re.DOTALL)

                    if len(action_rows) >= 2:
                        # Swap first two actions (SB and BB)
                        action_rows[0], action_rows[1] = action_rows[1], action_rows[0]

                        # Rebuild actions section
                        new_actions = '\n                    '.join(action_rows)

                        # Replace in content
                        old_full = street_match.group(0)
                        new_full = old_full.replace(actions_section, '\n                    ' + new_actions + '\n                ')

                        content = content.replace(old_full, new_full)
                        tc_content = content  # Update tc_content for next iteration

    print(f"  [OK] TC-{tc_num} fixed")
    return content

def main():
    filename = '30_base_validated_cases.html'

    print("=" * 80)
    print("FIXING 2-PLAYER POSTFLOP ACTION ORDER")
    print("=" * 80)
    print()

    # Read file
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix TC-1 through TC-8, TC-17
    test_cases = [1, 2, 3, 4, 5, 6, 7, 8, 17]

    for tc in test_cases:
        content = fix_2p_postflop(content, tc)

    # Write back
    print()
    print("Writing changes...")
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print()
    print("=" * 80)
    print("[OK] ALL 2-PLAYER POSTFLOP CASES FIXED")
    print("=" * 80)
    print()
    print("Run validation: python validate_action_order.py")

if __name__ == '__main__':
    main()
