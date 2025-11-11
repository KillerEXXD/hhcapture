"""
Fix all test cases that need side pots
Reads from sidepot_analysis_report.txt and fixes all issues
"""
import re
import json

def parse_number(s):
    """Parse number from formatted string"""
    if isinstance(s, str):
        return int(s.replace(',', ''))
    return int(s)

def format_number(n):
    """Format number with commas"""
    return f"{n:,}"

def calculate_side_pots(players_data, bb_ante, bb_player_name):
    """
    Calculate correct pot structure with side pots

    Args:
        players_data: List of dicts with {name, starting, final, contributed, is_allin}
        bb_ante: BB ante amount
        bb_player_name: Name of BB player who paid ante

    Returns:
        List of pot dicts with {type, amount, eligible, percentage}
    """
    # Calculate live contributions (excluding ante)
    contributions = []
    for p in players_data:
        live_contrib = p['contributed']
        if p['name'] == bb_player_name:
            live_contrib -= bb_ante  # Remove ante from BB's live contribution

        contributions.append({
            'name': p['name'],
            'live': live_contrib,
            'total': p['contributed']
        })

    # Sort by live contribution
    contributions.sort(key=lambda x: x['live'])

    # Get unique contribution levels
    unique_levels = sorted(set(c['live'] for c in contributions))

    # Calculate pots
    pots = []
    remaining_players = len(contributions)
    prev_level = 0

    for i, level in enumerate(unique_levels):
        if remaining_players > 0:
            pot_amount = (level - prev_level) * remaining_players

            # Add ante to first (main) pot
            if i == 0:
                pot_amount += bb_ante

            # Eligible players: those who contributed at least to this level
            eligible = [c['name'] for c in contributions if c['live'] >= level]

            pot_type = 'Main Pot' if i == 0 else f'Side Pot {i}'

            pots.append({
                'type': pot_type,
                'amount': pot_amount,
                'eligible': eligible
            })

            # Remove players at this level from next pot calculation
            remaining_players = len([c for c in contributions if c['live'] > level])
            prev_level = level

    # Calculate percentages
    total_pot = sum(p['amount'] for p in pots)
    for pot in pots:
        pot['percentage'] = (pot['amount'] / total_pot * 100) if total_pot > 0 else 0

    return pots, total_pot

def fix_test_case(tc_num, tc_content):
    """Fix a single test case by adding side pots"""

    print(f"  Fixing TC-{tc_num}...")

    # Extract Expected Results table
    results_match = re.search(r'<div class="section-title">Expected Results</div>.*?<tbody>(.*?)</tbody>', tc_content, re.DOTALL)
    if not results_match:
        print(f"    [ERROR] Could not find Expected Results table")
        return tc_content, False

    # Parse player data
    results_table = results_match.group(1)
    player_rows = re.findall(r'<tr>\s*<td>([^<]+)</td>\s*<td>([^<]+)</td>\s*<td>([^<]+)</td>\s*<td>([^<]+)</td>\s*<td>(.*?)</td>\s*<td>([^<]+)</td>', results_table, re.DOTALL)

    players_data = []
    for row in player_rows:
        name_raw = row[0].strip()
        name = name_raw.split('(')[0].strip()
        position = re.search(r'\(([^)]+)\)', name_raw).group(1) if '(' in name_raw else ''

        starting = parse_number(row[1].strip())
        final = parse_number(row[2].strip())

        contrib_match = re.search(r'([\d,]+)', row[3].strip())
        if not contrib_match:
            continue

        contributed = parse_number(contrib_match.group(1))
        is_allin = 'all-in' in row[3].lower()

        winner_cell = row[4].strip()
        is_winner = 'winner-badge' in winner_cell and 'loser' not in winner_cell

        new_stack = parse_number(row[5].strip())

        players_data.append({
            'name': name,
            'position': position,
            'name_with_pos': name_raw,
            'starting': starting,
            'final': final,
            'contributed': contributed,
            'is_allin': is_allin,
            'is_winner': is_winner,
            'new_stack': new_stack,
            'winner_cell': winner_cell
        })

    if len(players_data) < 2:
        print(f"    [ERROR] Need at least 2 players")
        return tc_content, False

    # Extract ante info
    ante_match = re.search(r'<strong>BB Ante: ([\d,]+)</strong>', tc_content)
    bb_ante = parse_number(ante_match.group(1)) if ante_match else 0

    # Find BB player
    bb_player_name = None
    for p in players_data:
        if '(BB)' in p['name_with_pos']:
            bb_player_name = p['name']
            break

    # Calculate correct pot structure
    pots, total_pot = calculate_side_pots(players_data, bb_ante, bb_player_name)

    # Find winner
    winner = next((p for p in players_data if p['is_winner']), None)
    if not winner:
        print(f"    [ERROR] No winner found")
        return tc_content, False

    # Build new pot HTML
    live_contributions = sum(p['contributed'] - (bb_ante if p['name'] == bb_player_name else 0) for p in players_data)

    # Generate pot HTML
    pot_html_parts = []
    for pot in pots:
        eligible_html = ' '.join([f'<span>{name}</span>' for name in pot['eligible']])

        if pot['type'] == 'Main Pot':
            calc_text = f"Calculation: {format_number(live_contributions)} (live) + {format_number(bb_ante)} (BB ante dead) = {format_number(total_pot)}"
        else:
            # Calculate what went into this side pot
            pot_num = int(pot['type'].split()[-1])
            prev_level = pots[pot_num - 1]['amount'] if pot_num > 1 else 0
            calc_text = f"Calculation: Excess from {len(pot['eligible'])} players at this level"

        pot_html = f'''                <div class="pot-item {'main' if pot['type'] == 'Main Pot' else 'side'}">
                    <div class="pot-name">{pot['type']}</div>
                    <div class="pot-amount">{format_number(pot['amount'])} ({pot['percentage']:.1f}%)</div>
                    <div class="eligible">Eligible: {eligible_html}</div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        {calc_text}
                    </div>
                </div>'''
        pot_html_parts.append(pot_html)

    new_pot_section = '\n'.join(pot_html_parts)

    # Replace old pot section (find single main pot and replace with new structure)
    old_pot_pattern = r'(<div class="pot-item main">.*?</div>\s*</div>)'

    match = re.search(old_pot_pattern, tc_content, re.DOTALL)
    if match:
        tc_content = tc_content.replace(match.group(1), new_pot_section)
    else:
        print(f"    [ERROR] Could not find pot section to replace")
        return tc_content, False

    # Update winner's cell if needed (to show multiple pots won)
    if len(pots) > 1:
        # Build winner breakdown showing all pots won
        breakdown_lines = [f'<div class="breakdown-line">Final Stack: {format_number(winner["final"])}</div>']

        for pot in pots:
            if winner['name'] in pot['eligible']:
                breakdown_lines.append(f'<div class="breakdown-line">+ {pot["type"]}: {format_number(pot["amount"])}</div>')

        breakdown_lines.append(f'<div class="breakdown-line total">= New Stack: {format_number(winner["new_stack"])}</div>')

        new_winner_cell = f'''<span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 {' + '.join([p['type'] for p in pots if winner['name'] in p['eligible']])} <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    {chr(10).join(' ' * 36 + line for line in breakdown_lines)}
                                </div>'''

        # Find and replace winner's cell in table
        old_winner_row_pattern = rf'<tr>\s*<td>{re.escape(winner["name_with_pos"])}</td>\s*<td>{format_number(winner["starting"])}</td>\s*<td>{format_number(winner["final"])}</td>\s*<td>{format_number(winner["contributed"])}</td>\s*<td>.*?</td>\s*<td>{format_number(winner["new_stack"])}</td>\s*</tr>'

        # This is complex, let's try a simpler approach - find the winner's row and rebuild it
        table_start = tc_content.find('<tbody>')
        table_end = tc_content.find('</tbody>', table_start)
        table_section = tc_content[table_start:table_end]

        # Build new table with updated winner row
        new_rows = []
        for p in players_data:
            contrib_display = f'{format_number(p["contributed"])} (all-in)' if p['is_allin'] else format_number(p['contributed'])

            if p['name'] == winner['name']:
                winner_cell_html = new_winner_cell
            else:
                winner_cell_html = '<span class="winner-badge loser">-</span>'

            row_html = f'''                        <tr>
                            <td>{p['name_with_pos']}</td>
                            <td>{format_number(p['starting'])}</td>
                            <td>{format_number(p['final'])}</td>
                            <td>{contrib_display}</td>
                            <td>{winner_cell_html}</td>
                            <td>{format_number(p['new_stack'])}</td>
                        </tr>'''
            new_rows.append(row_html)

        new_table_body = '<tbody>\n' + '\n'.join(new_rows) + '\n                    </tbody>'
        tc_content = tc_content[:table_start] + new_table_body + tc_content[table_end + len('</tbody>'):]

    print(f"    [OK] Added {len(pots)} pot(s): {', '.join([p['type'] for p in pots])}")
    return tc_content, True

def main():
    input_file = 'C:\\Apps\\HUDR\\HHTool_Modular\\docs\\QA\\40_TestCases.html'
    output_file = 'C:\\Apps\\HUDR\\HHTool_Modular\\docs\\QA\\40_TestCases_v2.html'

    # List of TCs that need fixing (from analysis)
    tcs_to_fix = [7, 14, 16, 19, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 33, 36, 38, 39]

    print("=" * 80)
    print("FIXING ALL SIDE POT ERRORS")
    print("=" * 80)
    print(f"Test cases to fix: {len(tcs_to_fix)}")
    print()

    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all test cases
    tc_pattern = r'(<!-- TEST CASE (\d+) -->)(.*?)(?=<!-- TEST CASE \d+|$)'

    fixed_count = 0
    failed_count = 0

    def replace_tc(match):
        nonlocal fixed_count, failed_count
        tc_comment = match.group(1)
        tc_num = int(match.group(2))
        tc_content = match.group(3)

        if tc_num in tcs_to_fix:
            fixed_content, success = fix_test_case(tc_num, tc_content)
            if success:
                fixed_count += 1
                return tc_comment + fixed_content
            else:
                failed_count += 1
                return match.group(0)  # Return original
        else:
            return match.group(0)  # Return original

    new_content = re.sub(tc_pattern, replace_tc, content, flags=re.DOTALL)

    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print()
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Test cases fixed: {fixed_count}/{len(tcs_to_fix)}")
    print(f"Failed: {failed_count}")
    print(f"Output: {output_file}")
    print("=" * 80)

if __name__ == '__main__':
    main()
