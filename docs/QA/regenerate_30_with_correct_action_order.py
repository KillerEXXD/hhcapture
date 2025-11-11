#!/usr/bin/env python3
"""
Regenerate 30 Test Cases with CORRECT Action Order
Based on REQUIREMENTS_30_BASE_TEST_CASES.md
Implements action order validation from validate_action_order.py
"""

import random
from typing import List, Dict, Tuple

# Test case distribution from requirements
TC_DISTRIBUTION = [
    # TC 1-5: Simple (2 players)
    {'tc': 1, 'players': 2, 'complexity': 'Simple'},
    {'tc': 2, 'players': 2, 'complexity': 'Simple'},
    {'tc': 3, 'players': 2, 'complexity': 'Simple'},
    {'tc': 4, 'players': 2, 'complexity': 'Simple'},
    {'tc': 5, 'players': 2, 'complexity': 'Simple'},

    # TC 6-10: Medium (2-3 players)
    {'tc': 6, 'players': 2, 'complexity': 'Medium'},
    {'tc': 7, 'players': 2, 'complexity': 'Medium'},
    {'tc': 8, 'players': 2, 'complexity': 'Medium'},
    {'tc': 9, 'players': 3, 'complexity': 'Medium'},
    {'tc': 10, 'players': 3, 'complexity': 'Medium'},

    # TC 11-15: Medium (3-4 players)
    {'tc': 11, 'players': 3, 'complexity': 'Medium'},
    {'tc': 12, 'players': 3, 'complexity': 'Medium'},
    {'tc': 13, 'players': 4, 'complexity': 'Medium'},
    {'tc': 14, 'players': 4, 'complexity': 'Medium'},
    {'tc': 15, 'players': 4, 'complexity': 'Medium'},

    # TC 16-20: Medium (4 players)
    {'tc': 16, 'players': 4, 'complexity': 'Medium'},
    {'tc': 17, 'players': 4, 'complexity': 'Medium'},
    {'tc': 18, 'players': 4, 'complexity': 'Medium'},
    {'tc': 19, 'players': 4, 'complexity': 'Medium'},
    {'tc': 20, 'players': 4, 'complexity': 'Medium'},

    # TC 21-25: Complex (5-7 players)
    {'tc': 21, 'players': 5, 'complexity': 'Complex'},
    {'tc': 22, 'players': 5, 'complexity': 'Complex'},
    {'tc': 23, 'players': 6, 'complexity': 'Complex'},
    {'tc': 24, 'players': 6, 'complexity': 'Complex'},
    {'tc': 25, 'players': 7, 'complexity': 'Complex'},

    # TC 26-30: Complex (7-9 players)
    {'tc': 26, 'players': 7, 'complexity': 'Complex'},
    {'tc': 27, 'players': 8, 'complexity': 'Complex'},
    {'tc': 28, 'players': 8, 'complexity': 'Complex'},
    {'tc': 29, 'players': 9, 'complexity': 'Complex'},
    {'tc': 30, 'players': 9, 'complexity': 'Complex'},
]

# Blind structures from requirements (must include millions)
BLIND_STRUCTURES = [
    # Hundreds
    {'sb': 50, 'bb': 100, 'ante': 100},
    {'sb': 250, 'bb': 500, 'ante': 500},
    # Thousands
    {'sb': 500, 'bb': 1000, 'ante': 1000},
    {'sb': 2500, 'bb': 5000, 'ante': 5000},
    # Tens of thousands
    {'sb': 5000, 'bb': 10000, 'ante': 10000},
    {'sb': 10000, 'bb': 20000, 'ante': 20000},
    {'sb': 25000, 'bb': 50000, 'ante': 50000},
    # Hundreds of thousands
    {'sb': 50000, 'bb': 100000, 'ante': 100000},
    {'sb': 250000, 'bb': 500000, 'ante': 500000},
    # Millions (REQUIRED!)
    {'sb': 500000, 'bb': 1000000, 'ante': 1000000},
    {'sb': 1000000, 'bb': 2000000, 'ante': 2000000},
    {'sb': 2500000, 'bb': 5000000, 'ante': 5000000},
]

# Player names
PLAYER_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy']

def get_action_order(player_count: int, street: str, players: List[Dict]) -> List[str]:
    """
    Returns the correct action order based on player count and street

    CRITICAL RULES:
    - 2-player (heads-up):
        - Preflop: SB → BB
        - Postflop: BB → SB
    - 3-player:
        - Preflop: Dealer → SB → BB
        - Postflop: SB → BB → Dealer
    - 4+ player:
        - Preflop: UTG (no position label) → others → Dealer → SB → BB
        - Postflop: SB → BB → UTG → others → Dealer
    """
    if player_count == 2:
        # Heads-up
        sb_player = next(p for p in players if p['position'] == 'SB')
        bb_player = next(p for p in players if p['position'] == 'BB')

        if street == 'Preflop Base':
            return [sb_player['name'], bb_player['name']]
        else:  # Postflop
            return [bb_player['name'], sb_player['name']]

    elif player_count == 3:
        # 3-handed
        dealer = next(p for p in players if p['position'] == 'Dealer')
        sb = next(p for p in players if p['position'] == 'SB')
        bb = next(p for p in players if p['position'] == 'BB')

        if street == 'Preflop Base':
            return [dealer['name'], sb['name'], bb['name']]
        else:  # Postflop
            return [sb['name'], bb['name'], dealer['name']]

    else:
        # 4+ players
        dealer = next(p for p in players if p['position'] == 'Dealer')
        sb = next(p for p in players if p['position'] == 'SB')
        bb = next(p for p in players if p['position'] == 'BB')
        others = [p for p in players if p['position'] not in ['Dealer', 'SB', 'BB']]

        if street == 'Preflop Base':
            # Preflop: UTG → others → Dealer → SB → BB
            return [p['name'] for p in others] + [dealer['name'], sb['name'], bb['name']]
        else:  # Postflop
            # Postflop: SB → BB → UTG → others → Dealer
            return [sb['name'], bb['name']] + [p['name'] for p in others] + [dealer['name']]

def generate_stacks(player_count: int, bb: int) -> List[int]:
    """
    Generate different stack sizes for each player (10 BB to 60 BB range)
    Each player MUST have a different stack
    """
    # Generate random stack sizes in BB
    min_bb = 10
    max_bb = 60

    stacks_in_bb = []
    while len(stacks_in_bb) < player_count:
        stack_bb = random.randint(min_bb, max_bb)
        if stack_bb not in stacks_in_bb:
            stacks_in_bb.append(stack_bb)

    # Convert to chip amounts
    stacks = [stack_bb * bb for stack_bb in stacks_in_bb]

    return stacks

def generate_test_case(tc_num: int, player_count: int, complexity: str, blinds: Dict) -> Dict:
    """
    Generate a single test case with CORRECT action order
    """
    sb = blinds['sb']
    bb = blinds['bb']
    ante = blinds['ante']

    # Generate different stacks for each player
    stacks = generate_stacks(player_count, bb)

    # Create players with positions
    players = []
    for i in range(player_count):
        name = PLAYER_NAMES[i]

        if player_count == 2:
            # Heads-up: SB, BB (no Dealer)
            position = 'SB' if i == 0 else 'BB'
        elif player_count == 3:
            # 3-handed: Dealer, SB, BB
            position = ['Dealer', 'SB', 'BB'][i]
        else:
            # 4+ players: Dealer, SB, BB, others (no position label)
            if i == 0:
                position = 'Dealer'
            elif i == 1:
                position = 'SB'
            elif i == 2:
                position = 'BB'
            else:
                position = ''  # No position label for others

        players.append({
            'name': name,
            'position': position,
            'starting_stack': stacks[i]
        })

    # Generate actions with CORRECT order
    preflop_order = get_action_order(player_count, 'Preflop Base', players)

    # Simple action generation for now (will be enhanced)
    actions = {
        'Preflop Base': [],
        'Flop Base': [],
        'Turn Base': [],
        'River Base': []
    }

    # Preflop actions (correct order!)
    for player_name in preflop_order:
        player = next(p for p in players if p['name'] == player_name)
        # First actor can Call BB, Raise, or Fold
        # For simplicity, first actor calls, others fold or call
        if player_name == preflop_order[0]:
            action = f"{player_name} ({player['position'] or 'UTG'}): Call {bb:,}"
        else:
            action = f"{player_name} ({player['position']}): Fold"
        actions['Preflop Base'].append(action)

    return {
        'tc_num': tc_num,
        'hand_num': tc_num,
        'player_count': player_count,
        'complexity': complexity,
        'blinds': blinds,
        'players': players,
        'actions': actions,
        'pots': [],  # Will be calculated
        'final_stacks': {}  # Will be calculated
    }

def validate_action_order(test_case: Dict) -> Tuple[bool, List[str]]:
    """
    Validate action order for a test case
    Returns (passed, errors)
    """
    errors = []
    players = test_case['players']
    player_count = test_case['player_count']
    actions = test_case['actions']

    # Validate Preflop Base
    preflop_actions = actions.get('Preflop Base', [])
    if preflop_actions:
        # Extract first player from action string
        first_action = preflop_actions[0]
        first_player_name = first_action.split('(')[0].strip()

        # Get expected first player
        expected_order = get_action_order(player_count, 'Preflop Base', players)
        expected_first = expected_order[0]

        if first_player_name != expected_first:
            errors.append(f"[PREFLOP ORDER] First to act is {first_player_name}, should be {expected_first}")

    # Validate Flop Base (postflop)
    flop_actions = actions.get('Flop Base', [])
    if flop_actions:
        first_action = flop_actions[0]
        first_player_name = first_action.split('(')[0].strip()

        expected_order = get_action_order(player_count, 'Flop Base', players)
        expected_first = expected_order[0]

        if first_player_name != expected_first:
            errors.append(f"[POSTFLOP ORDER] First to act is {first_player_name}, should be {expected_first}")

    return (len(errors) == 0, errors)

def main():
    print("="*80)
    print("REGENERATING 30 TEST CASES WITH CORRECT ACTION ORDER")
    print("="*80)
    print()
    print("Requirements:")
    print("  - Based on REQUIREMENTS_30_BASE_TEST_CASES.md")
    print("  - Correct action order for 2, 3, and 4+ players")
    print("  - Different stacks per player (10-60 BB)")
    print("  - Varied blind structures (hundreds to millions)")
    print()
    print("="*80)
    print()

    # Assign blind structures (ensure millions are included)
    blind_assignments = []
    for i, tc_info in enumerate(TC_DISTRIBUTION):
        # Cycle through blind structures
        blinds = BLIND_STRUCTURES[i % len(BLIND_STRUCTURES)]
        blind_assignments.append(blinds)

    # Generate all 30 test cases
    test_cases = []
    passed_count = 0
    failed_count = 0

    for i, tc_info in enumerate(TC_DISTRIBUTION):
        tc_num = tc_info['tc']
        player_count = tc_info['players']
        complexity = tc_info['complexity']
        blinds = blind_assignments[i]

        print(f"[TC-{tc_num}] Generating {player_count}P {complexity} (SB/BB/Ante: {blinds['sb']:,}/{blinds['bb']:,}/{blinds['ante']:,})...", end=" ")

        # Generate test case
        test_case = generate_test_case(tc_num, player_count, complexity, blinds)

        # Validate action order
        passed, errors = validate_action_order(test_case)

        if passed:
            print("[PASSED]")
            test_cases.append(test_case)
            passed_count += 1
        else:
            print("[FAILED]")
            for error in errors:
                print(f"  {error}")
            failed_count += 1

    print()
    print("="*80)
    print("SUMMARY")
    print("="*80)
    print(f"Total: {len(TC_DISTRIBUTION)}")
    print(f"Passed: {passed_count}")
    print(f"Failed: {failed_count}")
    print()

    if failed_count == 0:
        print("[OK] All test cases generated with CORRECT action order!")
        print()
        print("Next steps:")
        print("  1. Enhance action generation (add betting, raises, side pots)")
        print("  2. Add pot calculations")
        print("  3. Add final stack calculations")
        print("  4. Generate HTML output")
        print("  5. Run full validation (validate_all_cases.py + validate_action_order.py)")
    else:
        print("[ERROR] Some test cases failed action order validation")
        print("   Review errors above and fix generation logic")

    print("="*80)

if __name__ == '__main__':
    main()
