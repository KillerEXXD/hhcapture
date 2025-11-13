import re

with open('40_TestCases.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find TC-9
tc_match = re.search(r'<!-- TEST CASE 9 -->(.*?)<!-- TEST CASE 10', content, re.DOTALL)
if tc_match:
    tc_content = tc_match.group(1)

    # Find Copy Player Data button
    copy_match = re.search(
        r'<button class="copy-btn" onclick="copyPlayerData\(this, `([^`]+)`\)">\s*<span>📋</span> Copy Player Data',
        tc_content
    )

    if copy_match:
        copy_data = copy_match.group(1)
        print('Copy Data:')
        print(repr(copy_data))
        print()

        # Extract Stack Setup section
        stack_setup_match = re.search(r'Stack Setup:\\n(.+)', copy_data)
        if stack_setup_match:
            stack_data = stack_setup_match.group(1)
            print('Stack Setup Data:')
            print(repr(stack_data))
            print()

            # Try to match players with \n prefix
            player_pattern = r'\\n(\w+)\s+(Dealer|SB|BB|UTG)\s+(\d+)'
            players = re.findall(player_pattern, stack_data)

            print(f'Found {len(players)} players with \\n prefix:')
            for name, pos, stack in players:
                print(f'  {name} {pos} {stack}')

            # Try first player without \n
            first_player_pattern = r'^(\w+)\s+(Dealer|SB|BB|UTG)\s+(\d+)'
            first_player = re.match(first_player_pattern, stack_data)
            if first_player:
                print(f'\\nFirst player (no \\n): {first_player.group(1)} {first_player.group(2)} {first_player.group(3)}')
    else:
        print('Could not find Copy Player Data button')
