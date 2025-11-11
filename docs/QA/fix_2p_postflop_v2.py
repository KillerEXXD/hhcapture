"""Fix 2-player postflop action order by line number replacement"""

def fix_tc(filename, tc_num, flop_lines, turn_lines, river_lines):
    """
    Fix a specific test case by swapping Alice/Bob action lines
    flop_lines, turn_lines, river_lines: tuples of (alice_line, bob_line)
    """
    print(f"Fixing TC-{tc_num}...")

    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    swaps = []
    if flop_lines:
        swaps.append(('Flop', flop_lines))
    if turn_lines:
        swaps.append(('Turn', turn_lines))
    if river_lines:
        swaps.append(('River', river_lines))

    for street, (alice_line, bob_line) in swaps:
        # Line numbers are 1-indexed, list is 0-indexed
        alice_idx = alice_line - 1
        bob_idx = bob_line - 1

        # Swap the lines
        lines[alice_idx], lines[bob_idx] = lines[bob_idx], lines[alice_idx]
        print(f"  [{street}] Swapped lines {alice_line} and {bob_line}")

    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    print(f"  [OK] TC-{tc_num} fixed")

def main():
    filename = '30_base_validated_cases.html'

    print("=" * 80)
    print("FIXING 2-PLAYER POSTFLOP ACTION ORDER - Version 2")
    print("=" * 80)
    print()

    # TC-1: Lines to swap (Alice, Bob)
    fix_tc(filename, 1,
           flop_lines=(530, 531),
           turn_lines=(535, 536),
           river_lines=(540, 541))

    # TC-2
    fix_tc(filename, 2,
           flop_lines=(618, 619),
           turn_lines=(623, 624),
           river_lines=(628, 629))

    # TC-3
    fix_tc(filename, 3,
           flop_lines=(708, 709),
           turn_lines=(713, 714),
           river_lines=(718, 719))

    # TC-4
    fix_tc(filename, 4,
           flop_lines=(799, 800),
           turn_lines=(804, 805),
           river_lines=(809, 810))

    # TC-5
    fix_tc(filename, 5,
           flop_lines=(890, 891),
           turn_lines=(895, 896),
           river_lines=(900, 901))

    # TC-6
    fix_tc(filename, 6,
           flop_lines=(980, 981),
           turn_lines=(985, 986),
           river_lines=(990, 991))

    # TC-7
    fix_tc(filename, 7,
           flop_lines=(1069, 1070),
           turn_lines=(1074, 1075),
           river_lines=(1079, 1080))

    # TC-8
    fix_tc(filename, 8,
           flop_lines=(1159, 1160),
           turn_lines=(1164, 1165),
           river_lines=(1169, 1170))

    # TC-17
    fix_tc(filename, 17,
           flop_lines=(3434, 3435),
           turn_lines=(3439, 3440),
           river_lines=(3444, 3445))

    print()
    print("=" * 80)
    print("[OK] ALL 2-PLAYER POSTFLOP CASES FIXED")
    print("=" * 80)

if __name__ == '__main__':
    main()
