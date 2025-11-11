"""Fix 3-player preflop action order: Dealer -> SB -> BB"""

import re

def fix_3p_preflop_all(content):
    """
    Fix all 3-player preflop action order issues
    Find patterns where order is SB -> BB -> Dealer (WRONG)
    Change to: Dealer -> SB -> BB (CORRECT)
    """
    fixed_count = 0

    # Pattern to match preflop with wrong order: SB, then BB, then Dealer
    # Captures the three action rows
    pattern = r'(<div class="street-name">Preflop Base</div>\s*)' \
              r'(<div class="action-row"><span class="action-player">(?:Alice|Bob|Charlie) \(SB\):</span>.*?</div>\s*)' \
              r'(<div class="action-row"><span class="action-player">(?:Alice|Bob|Charlie) \(BB\):</span>.*?</div>\s*)' \
              r'(<div class="action-row"><span class="action-player">(?:Alice|Bob|Charlie) \(Dealer\):</span>.*?</div>)'

    def reorder_actions(match):
        nonlocal fixed_count

        street_name = match.group(1)
        sb_action = match.group(2)
        bb_action = match.group(3)
        dealer_action = match.group(4)

        # Check if it's actually in wrong order (SB first)
        # Extract position from SB action
        if '(SB)' in sb_action:
            fixed_count += 1
            # Return correct order: street_name + Dealer + SB + BB
            return street_name + dealer_action + sb_action + bb_action
        else:
            # Already in correct order, don't change
            return match.group(0)

    # Apply the reorder
    new_content = re.sub(pattern, reorder_actions, content, flags=re.DOTALL)

    return new_content, fixed_count

def main():
    filename = '30_base_validated_cases.html'

    print("=" * 80)
    print("FIXING 3-PLAYER PREFLOP ACTION ORDER")
    print("=" * 80)
    print()

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content, fixed_count = fix_3p_preflop_all(content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"[OK] Fixed {fixed_count} preflop streets")
    print()
    print("=" * 80)
    print("[OK] ALL 3-PLAYER PREFLOP CASES FIXED")
    print("=" * 80)
    print()
    print("Run validation: python validate_action_order.py")

if __name__ == '__main__':
    main()
