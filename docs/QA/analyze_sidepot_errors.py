"""
Analyze all 40 test cases to identify which ones need side pots
"""
import re

def parse_number(s):
    """Parse number from formatted string"""
    if isinstance(s, str):
        return int(s.replace(',', ''))
    return int(s)

def analyze_test_case(tc_num, tc_content):
    """Check if test case should have side pots"""

    # Extract Expected Results table
    results_match = re.search(r'<div class="section-title">Expected Results</div>.*?<tbody>(.*?)</tbody>', tc_content, re.DOTALL)
    if not results_match:
        return None

    results_table = results_match.group(1)

    # Parse player contributions
    player_rows = re.findall(r'<tr>\s*<td>([^<]+)</td>\s*<td>([^<]+)</td>\s*<td>([^<]+)</td>\s*<td>([^<]+)</td>', results_table)

    if not player_rows:
        return None

    players = []
    for row in player_rows:
        name = row[0].strip().split('(')[0].strip()
        starting = parse_number(row[1].strip())
        final = parse_number(row[2].strip())

        # Extract contribution (may have "(all-in)" suffix)
        contrib_match = re.search(r'([\d,]+)', row[3].strip())
        if contrib_match:
            contributed = parse_number(contrib_match.group(1))
            is_allin = 'all-in' in row[3].lower()

            players.append({
                'name': name,
                'starting': starting,
                'final': final,
                'contributed': contributed,
                'is_allin': is_allin
            })

    if len(players) < 2:
        return None

    # Extract ante info
    ante_match = re.search(r'<strong>BB Ante: ([\d,]+)</strong>', tc_content)
    bb_ante = parse_number(ante_match.group(1)) if ante_match else 0

    # Find BB player (who paid ante)
    bb_player = None
    for row in player_rows:
        if '(BB)' in row[0]:
            bb_player = row[0].strip().split('(')[0].strip()
            break

    # Calculate live contributions (excluding ante)
    contributions = []
    for p in players:
        live_contrib = p['contributed']
        if bb_player and p['name'] == bb_player:
            live_contrib -= bb_ante  # Remove ante from BB's live contribution
        contributions.append({
            'name': p['name'],
            'live': live_contrib,
            'total': p['contributed'],
            'is_allin': p['is_allin']
        })

    # Sort by contribution amount
    contributions.sort(key=lambda x: x['live'])

    # Check if side pots needed (different contribution levels)
    unique_levels = list(set(c['live'] for c in contributions))
    unique_levels.sort()

    needs_sidepot = len(unique_levels) > 1 and len(players) > 1

    # Check if HTML already has side pots
    has_sidepot = bool(re.search(r'<div class="pot-name">Side Pot', tc_content))

    if needs_sidepot:
        # Calculate correct pot structure
        pots = []
        remaining_players = len(contributions)
        prev_level = 0

        for i, level in enumerate(unique_levels):
            if remaining_players > 0:
                pot_amount = (level - prev_level) * remaining_players

                # Add ante to first (main) pot
                if i == 0:
                    pot_amount += bb_ante

                eligible = [c['name'] for c in contributions if c['live'] >= level]

                pots.append({
                    'type': 'Main Pot' if i == 0 else f'Side Pot {i}',
                    'amount': pot_amount,
                    'eligible': eligible
                })

                # Remove players at this level from next pot
                remaining_players = len([c for c in contributions if c['live'] > level])
                prev_level = level

        return {
            'tc_num': tc_num,
            'needs_sidepot': True,
            'has_sidepot': has_sidepot,
            'players': players,
            'contributions': contributions,
            'pots': pots,
            'bb_ante': bb_ante,
            'status': 'OK' if has_sidepot else 'MISSING_SIDEPOT'
        }

    return {
        'tc_num': tc_num,
        'needs_sidepot': False,
        'has_sidepot': has_sidepot,
        'status': 'OK'
    }

def main():
    filename = 'C:\\Apps\\HUDR\\HHTool_Modular\\docs\\QA\\40_TestCases.html'

    print("=" * 80)
    print("ANALYZING ALL 40 TEST CASES FOR SIDE POT ERRORS")
    print("=" * 80)
    print()

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all test cases
    tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+|$)'
    tc_matches = re.findall(tc_pattern, content, re.DOTALL)

    issues = []
    correct = []

    for tc_num, tc_content in tc_matches:
        result = analyze_test_case(tc_num, tc_content)

        if result:
            if result['status'] == 'MISSING_SIDEPOT':
                issues.append(result)
                print(f"[ISSUE] TC-{tc_num}: Needs side pot but has single pot")
                print(f"  Players: {len(result['players'])}")
                print(f"  Contribution levels: {sorted(set(c['live'] for c in result['contributions']))}")
                print(f"  Should have {len(result['pots'])} pot(s):")
                for pot in result['pots']:
                    print(f"    - {pot['type']}: {pot['amount']:,} (eligible: {', '.join(pot['eligible'])})")
                print()
            else:
                correct.append(result)
                status = "[+] Has side pot" if result['has_sidepot'] else "[+] No side pot needed"
                print(f"[OK] TC-{tc_num}: {status}")

    print()
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total Test Cases: {len(tc_matches)}")
    print(f"Correct: {len(correct)}")
    print(f"Issues Found: {len(issues)}")
    print()

    if issues:
        print("Test Cases Needing Side Pots:")
        for issue in issues:
            print(f"  - TC-{issue['tc_num']}")

    print()
    print("=" * 80)

    # Write detailed report
    report_file = 'C:\\Apps\\HUDR\\HHTool_Modular\\docs\\QA\\sidepot_analysis_report.txt'
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("SIDE POT ANALYSIS REPORT\n")
        f.write("=" * 80 + "\n\n")

        f.write(f"Total Test Cases: {len(tc_matches)}\n")
        f.write(f"Issues Found: {len(issues)}\n")
        f.write(f"Correct: {len(correct)}\n\n")

        if issues:
            f.write("ISSUES FOUND:\n")
            f.write("-" * 80 + "\n\n")

            for issue in issues:
                f.write(f"TEST CASE {issue['tc_num']}\n")
                f.write(f"Status: MISSING SIDE POT\n")
                f.write(f"Players: {len(issue['players'])}\n")
                f.write(f"BB Ante: {issue['bb_ante']:,}\n\n")

                f.write("Contributions:\n")
                for c in issue['contributions']:
                    allin = " (ALL-IN)" if c['is_allin'] else ""
                    f.write(f"  {c['name']}: Total {c['total']:,}, Live {c['live']:,}{allin}\n")

                f.write(f"\nCorrect Pot Structure ({len(issue['pots'])} pots):\n")
                for pot in issue['pots']:
                    f.write(f"  {pot['type']}: {pot['amount']:,}\n")
                    f.write(f"    Eligible: {', '.join(pot['eligible'])}\n")

                f.write("\n" + "-" * 80 + "\n\n")

    print(f"Detailed report saved to: {report_file}")
    print()

if __name__ == '__main__':
    main()
