"""
Find test cases with RE-RAISES (Raise -> Raise sequences)
This creates extended actions where original raisers need to act again
"""
import re

def analyze_reraises(tc_num, tc_content):
    """Find streets with raise -> raise sequences"""

    # Find all street blocks
    street_pattern = r'<div class="street-name">([^<]+)</div>(.*?)(?=<div class="street-name">|</div>\s*</div>\s*<div class="section-title">)'
    streets = re.findall(street_pattern, tc_content, re.DOTALL)

    results = {}

    for street_name, actions_html in streets:
        # Parse actions
        action_pattern = r'<span class="action-player">([^<]+):</span>\s*<span class="action-type">([^<]+)</span>(?:\s*<span class="action-amount">([^<]+)</span>)?'
        actions = re.findall(action_pattern, actions_html)

        # Get action types
        action_types = [action[1] for action in actions]

        # Look for Raise followed by another Raise
        has_reraise = False
        reraise_sequence = []

        for i, action_type in enumerate(action_types):
            if action_type == 'Raise':
                # Check if there's another Raise after this one
                remaining_actions = action_types[i+1:]
                if 'Raise' in remaining_actions:
                    has_reraise = True
                    # Get the full sequence
                    reraise_idx = i + 1 + remaining_actions.index('Raise')
                    reraise_sequence = actions[:reraise_idx+1]
                    break

        if has_reraise:
            results[street_name.strip()] = {
                'has_reraise': True,
                'all_actions': actions,
                'reraise_sequence': reraise_sequence
            }

    return results

def main():
    filename = 'C:\\Apps\\HUDR\\HHTool_Modular\\docs\\QA\\40_TestCases_v2.html'

    print("=" * 80)
    print("SEARCHING FOR RE-RAISE SEQUENCES")
    print("=" * 80)
    print()
    print("Re-raise = Raise -> Raise pattern on same street")
    print("This forces original raiser to act again (extended action)")
    print()
    print("=" * 80)
    print()

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all test cases
    tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+|$)'
    tc_matches = re.findall(tc_pattern, content, re.DOTALL)

    reraise_cases = {
        'Preflop': [],
        'Flop': [],
        'Turn': [],
        'River': []
    }

    for tc_num, tc_content in tc_matches:
        street_analysis = analyze_reraises(tc_num, tc_content)

        for street_name, data in street_analysis.items():
            # Determine base street name
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

            reraise_cases[base_street].append({
                'tc': tc_num,
                'street_full': street_name,
                'all_actions': data['all_actions'],
                'reraise_sequence': data['reraise_sequence']
            })

    # Report findings
    for street in ['Preflop', 'Flop', 'Turn', 'River']:
        print(f"\n{street.upper()} RE-RAISES:")
        print("-" * 80)

        if not reraise_cases[street]:
            print(f"  No re-raises found on {street}")
        else:
            print(f"  Found {len(reraise_cases[street])} test case(s) with re-raises:\n")

            for case in reraise_cases[street]:
                print(f"  TC-{case['tc']} - {case['street_full']}")
                print(f"    Full action sequence:")
                for player, action_type, amount in case['all_actions']:
                    amt_str = f" {amount}" if amount else ""
                    print(f"      {player.strip()}: {action_type}{amt_str}")
                print()

    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)

    for street in ['Preflop', 'Flop', 'Turn', 'River']:
        count = len(reraise_cases[street])
        status = "YES" if count > 0 else "NO"
        print(f"{street}: {status} - {count} test case(s) with re-raises")

    total_reraises = sum(len(reraise_cases[street]) for street in ['Preflop', 'Flop', 'Turn', 'River'])

    print()
    print(f"TOTAL: {total_reraises} test case(s) with re-raise sequences")
    print("=" * 80)

if __name__ == '__main__':
    main()
