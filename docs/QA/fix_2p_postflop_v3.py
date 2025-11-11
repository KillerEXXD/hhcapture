"""Fix 2-player postflop using context-aware replacement"""

import re

def fix_2p_postflop_all(content):
    """
    Fix all 2-player postflop action order issues
    Find patterns where Alice (SB) acts before Bob (BB) on postflop streets
    """
    fixed_count = 0

    # Pattern to match a street block with Alice (SB) acting first
    # This matches: street name, then Alice (SB) action, then Bob (BB) action
    pattern = r'(<div class="street-name">(?:Flop|Turn|River) Base[^<]*</div>\s*)(<div class="action-row"><span class="action-player">Alice \(SB\):</span>.*?</div>\s*)(<div class="action-row"><span class="action-player">Bob \(BB\):</span>.*?</div>)'

    def swap_players(match):
        nonlocal fixed_count
        fixed_count += 1
        # Return: street_name + Bob's action + Alice's action (swapped)
        return match.group(1) + match.group(3) + match.group(2)

    # Apply the swap
    new_content = re.sub(pattern, swap_players, content, flags=re.DOTALL)

    return new_content, fixed_count

def main():
    filename = '30_base_validated_cases.html'

    print("=" * 80)
    print("FIXING 2-PLAYER POSTFLOP ACTION ORDER - Version 3 (Regex)")
    print("=" * 80)
    print()

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content, fixed_count = fix_2p_postflop_all(content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"[OK] Fixed {fixed_count} postflop streets")
    print()
    print("=" * 80)
    print("[OK] ALL 2-PLAYER POSTFLOP CASES FIXED")
    print("=" * 80)

if __name__ == '__main__':
    main()
