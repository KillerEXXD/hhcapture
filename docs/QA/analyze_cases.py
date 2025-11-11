import re

# Read the HTML file
with open('30_base_validated_cases.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all TC sections and their player data from <pre> tags
pre_pattern = r'<pre>Hand \((\d+)\)(.*?)</pre>'
matches = re.findall(pre_pattern, content, re.DOTALL)

player_counts = {}
hand_details = []

for hand_num, setup in matches[:30]:  # Only first 30 hands
    # Count players in Stack Setup section
    lines = setup.strip().split('\n')

    player_lines = []
    in_stack_setup = False

    for line in lines:
        line = line.strip()

        # Detect Stack Setup section
        if 'Stack Setup:' in line:
            in_stack_setup = True
            continue

        # Once in Stack Setup, count player lines
        if in_stack_setup:
            # Player lines start with a name (capital letter) followed by position or stack
            # Examples: "Alice Dealer 80000", "Bob SB 165000", "Alice SB 31000"
            if line and line[0].isupper() and any(c.isdigit() for c in line):
                player_lines.append(line)

    player_count = len(player_lines)

    if player_count > 0:
        if player_count not in player_counts:
            player_counts[player_count] = []
        player_counts[player_count].append(hand_num)
        hand_details.append((hand_num, player_count, player_lines))

# Show Hand 10 specifically
print('Hand 10 Details:')
print('=' * 60)
for hand_num, pcount, players in hand_details:
    if hand_num == '10':
        print(f'Hand Number: {hand_num}')
        print(f'Player Count: {pcount}')
        print('Players:')
        for p in players:
            print(f'  {p}')
        print()

print('\nPlayer Distribution in 30 Test Cases:')
print('=' * 60)
total_hands = 0
for count in sorted(player_counts.keys()):
    hand_list = player_counts[count]
    total_hands += len(hand_list)
    print(f'{count} players: {len(hand_list)} hands ({len(hand_list)/30*100:.1f}%)')
    # Show first 10 hand numbers
    if len(hand_list) <= 10:
        print(f'  Hands: {", ".join(hand_list)}')
    else:
        print(f'  Hands: {", ".join(hand_list[:10])}...')
print('=' * 60)
print(f'Total: {total_hands} test cases\n')

# Show progression pattern (first 15 test cases)
print('\nProgression Pattern (First 15 Hands):')
print('=' * 60)
for hand_num, pcount, players in hand_details[:15]:
    print(f'Hand {hand_num}: {pcount} players')
print()

# Breakdown by complexity
print('\nComplexity Breakdown Based on Player Count:')
print('=' * 60)
simple = sum(len(v) for k, v in player_counts.items() if k == 2)
medium = sum(len(v) for k, v in player_counts.items() if k in [3, 4])
complex_count = sum(len(v) for k, v in player_counts.items() if k >= 5)
print(f'Simple (2 players):   {simple} hands')
print(f'Medium (3-4 players): {medium} hands')
print(f'Complex (5+ players): {complex_count} hands')
print('=' * 60)
