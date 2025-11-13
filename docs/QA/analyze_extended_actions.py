"""
Analyze test cases for extended actions on each street
Extended action = when someone raises and others need to respond (multiple betting rounds on same street)
"""
import re

def analyze_street_actions(tc_num, tc_content):
    """Extract and analyze actions for each street"""

    # Find all street blocks
    street_pattern = r'<div class="street-name">([^<]+)</div>(.*?)(?=<div class="street-name">|</div>\s*</div>\s*<div class="section-title">)'
    streets = re.findall(street_pattern, tc_content, re.DOTALL)

    results = {}

    for street_name, actions_html in streets:
        # Parse actions
        action_pattern = r'<span class="action-player">([^<]+):</span>\s*<span class="action-type">([^<]+)</span>'
        actions = re.findall(action_pattern, actions_html)

        # Determine if extended (more than one round of betting)
        action_types = [action[1] for action in actions]

        # Extended action indicators:
        # - Multiple bets/raises (more than one bet/raise on same street)
        # - A raise after a bet (someone bets, someone raises, original bettor needs to respond)

        bet_count = action_types.count('Bet')
        raise_count = action_types.count('Raise')
        call_count = action_types.count('Call')
        check_count = action_types.count('Check')
        fold_count = action_types.count('Fold')

        is_extended = False
        reason = ""

        # If there's a raise, and then more actions after it
        if 'Raise' in action_types:
            raise_idx = action_types.index('Raise')
            actions_after_raise = action_types[raise_idx + 1:]
            if len(actions_after_raise) > 0:
                # Check if there are calls/raises/folds after the raise
                if any(a in ['Call', 'Raise', 'Fold'] for a in actions_after_raise):
                    is_extended = True
                    reason = "Raise followed by responses"

        # If there's a bet, then a raise, then more actions
        if 'Bet' in action_types and 'Raise' in action_types:
            bet_idx = action_types.index('Bet')
            raise_idx = action_types.index('Raise')
            if raise_idx > bet_idx:
                actions_after_raise = action_types[raise_idx + 1:]
                if len(actions_after_raise) > 0:
                    is_extended = True
                    reason = "Bet -> Raise -> More actions"

        # Multiple raises = definitely extended
        if raise_count > 1:
            is_extended = True
            reason = f"Multiple raises ({raise_count})"

        results[street_name.strip()] = {
            'actions': actions,
            'action_types': action_types,
            'count': len(actions),
            'bet_count': bet_count,
            'raise_count': raise_count,
            'call_count': call_count,
            'is_extended': is_extended,
            'reason': reason
        }

    return results

def main():
    filename = 'C:\\Apps\\HUDR\\HHTool_Modular\\docs\\QA\\40_TestCases_v2.html'

    print("=" * 80)
    print("ANALYZING EXTENDED ACTIONS IN TEST CASES")
    print("=" * 80)
    print()
    print("Extended Action = Multiple betting rounds on same street")
    print("  (e.g., Bet -> Raise -> Call/Fold/Re-raise)")
    print()
    print("=" * 80)
    print()

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all test cases
    tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+|$)'
    tc_matches = re.findall(tc_pattern, content, re.DOTALL)

    extended_cases = {
        'Preflop': [],
        'Flop': [],
        'Turn': [],
        'River': []
    }

    for tc_num, tc_content in tc_matches:
        street_analysis = analyze_street_actions(tc_num, tc_content)

        for street_name, data in street_analysis.items():
            # Determine base street name (remove "Base" or "More" suffix)
            if 'Preflop' in street_name:
                base_street = 'Preflop'
            elif 'Flop' in street_name:
                base_street = 'Flop'
            elif 'Turn' in street_name:
                base_street = 'Turn'
            elif 'River' in street_name:
                base_street = 'River'
            else:
                continue

            if data['is_extended']:
                extended_cases[base_street].append({
                    'tc': tc_num,
                    'street_full': street_name,
                    'actions': data['actions'],
                    'action_types': data['action_types'],
                    'reason': data['reason']
                })

    # Report findings
    for street in ['Preflop', 'Flop', 'Turn', 'River']:
        print(f"\n{street.upper()} EXTENDED ACTIONS:")
        print("-" * 80)

        if not extended_cases[street]:
            print(f"  No extended actions found on {street}")
        else:
            print(f"  Found {len(extended_cases[street])} test case(s) with extended actions:\n")

            for case in extended_cases[street]:
                print(f"  TC-{case['tc']} - {case['street_full']}")
                print(f"    Reason: {case['reason']}")
                print(f"    Action sequence: {' -> '.join(case['action_types'])}")
                print(f"    Players:")
                for player, action_type in case['actions']:
                    print(f"      {player.strip()}: {action_type}")
                print()

    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)

    for street in ['Preflop', 'Flop', 'Turn', 'River']:
        count = len(extended_cases[street])
        print(f"{street}: {count} test case(s) with extended actions")

    print("\n" + "=" * 80)

if __name__ == '__main__':
    main()
