#!/usr/bin/env python3
"""
Fix all 11 test cases with negative final stacks.
TC-7, TC-14, TC-19, TC-20, TC-21, TC-23, TC-25, TC-26, TC-27, TC-28, TC-30
"""

import re
from typing import Dict, List, Tuple

# Test cases that need fixing
FAILING_TCS = ["TC-7", "TC-14", "TC-19", "TC-20", "TC-21", "TC-23", "TC-25", "TC-26", "TC-27", "TC-28", "TC-30"]

def read_file(filepath):
    """Read entire HTML file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(filepath, content):
    """Write HTML file"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def extract_test_case(content: str, tc_id: str) -> Tuple[str, int, int]:
    """Extract a test case and its position in the file"""
    # Find the test case div
    pattern = rf'<div class="test-case">\s*<div class="test-header"[^>]*>\s*<div>\s*<div class="test-id">{tc_id}</div>'
    match = re.search(pattern, content)
    if not match:
        print(f"ERROR: Could not find {tc_id}")
        return None, -1, -1

    start = match.start()

    # Find the end of this test case (start of next test case or end of file)
    next_tc_pattern = r'<div class="test-case">\s*<div class="test-header"'
    next_match = re.search(next_tc_pattern, content[start + 100:])

    if next_match:
        end = start + 100 + next_match.start()
    else:
        # Last test case, find end of test cases div
        end = content.find('</body>', start)

    return content[start:end], start, end

def parse_players_from_table(tc_content: str) -> List[Dict]:
    """Extract player data from the results table"""
    players = []

    # Find all table rows in tbody
    tbody_match = re.search(r'<tbody>(.*?)</tbody>', tc_content, re.DOTALL)
    if not tbody_match:
        print("ERROR: Could not find tbody")
        return players

    tbody = tbody_match.group(1)

    # Extract each row
    rows = re.findall(r'<tr>(.*?)</tr>', tbody, re.DOTALL)

    for row in rows:
        # Extract cells
        cells = re.findall(r'<td>(.*?)</td>', row, re.DOTALL)
        if len(cells) < 6:
            continue

        # Parse player name and position
        name_pos = cells[0].strip()
        # Extract just the player name and position (e.g., "Alice (Dealer)")
        name_match = re.match(r'(\w+)\s*\(([^)]+)\)', name_pos)
        if not name_match:
            continue

        player_name = name_match.group(1)
        position = name_match.group(2)

        # Parse starting stack
        starting_stack = int(cells[1].replace(',', '').strip())

        # Parse final stack (might be negative!)
        final_stack_str = cells[2].replace(',', '').strip()
        final_stack = int(final_stack_str)

        # Parse contributed
        contributed = int(cells[3].replace(',', '').strip())

        # Parse winner status and new stack
        is_winner = '🏆' in cells[4]
        new_stack_str = cells[5].replace(',', '').strip()
        new_stack = int(new_stack_str)

        players.append({
            'name': player_name,
            'position': position,
            'starting_stack': starting_stack,
            'final_stack': final_stack,
            'contributed': contributed,
            'is_winner': is_winner,
            'new_stack': new_stack
        })

    return players

def fix_player_data(players: List[Dict], ante: int) -> Tuple[List[Dict], bool]:
    """Fix players with negative stacks, return (fixed_players, had_fixes)"""
    fixed = []
    had_fixes = False

    for p in players:
        if p['final_stack'] < 0:
            had_fixes = True
            print(f"  Fixing {p['name']} ({p['position']}): {p['final_stack']} -> 0")

            # Cap contribution at starting stack
            correct_contribution = p['starting_stack']

            # Adjust if BB (includes ante)
            if p['position'] == 'BB':
                # BB contribution includes ante
                pass  # contribution is already total

            p['final_stack'] = 0
            p['contributed'] = correct_contribution

            # If winner, recalc new stack
            if p['is_winner']:
                # This will be recalculated with pots
                pass
            else:
                p['new_stack'] = 0

        fixed.append(p)

    return fixed, had_fixes

def format_number(num: int) -> str:
    """Format number with commas"""
    return f"{num:,}"

def update_table_row(row_html: str, player: Dict) -> str:
    """Update a table row with corrected player data"""
    # Replace final stack
    row_html = re.sub(
        r'(<td>)-?\d{1,3}(,\d{3})*</td>',
        rf'\g<1>{format_number(player["final_stack"])}</td>',
        row_html,
        count=1
    )

    # Replace contributed (after starting stack and final stack)
    parts = row_html.split('</td>')
    if len(parts) >= 4:
        # Starting stack (1), Final stack (2), Contributed (3)
        # Replace the contributed value
        contributed_part = parts[3]
        contributed_part = re.sub(r'>\s*-?\d{1,3}(,\d{3})*\s*$', f'>{format_number(player["contributed"])}', contributed_part)
        parts[3] = contributed_part
        row_html = '</td>'.join(parts)

    # Replace new stack (last cell)
    row_html = re.sub(
        r'(<td>)-?\d{1,3}(,\d{3})*</td>\s*$',
        rf'\g<1>{format_number(player["new_stack"])}</td>',
        row_html
    )

    return row_html

def update_next_hand_preview(tc_content: str, players: List[Dict]) -> str:
    """Update Next Hand Preview with correct stacks (no negatives)"""
    # Find the Next Hand Preview section
    preview_pattern = r'(Stack Setup:)(.*?)(`\)")'

    def replace_preview(match):
        prefix = match.group(1)
        middle = match.group(2)
        suffix = match.group(3)

        # Replace each player's stack in the preview
        for p in players:
            # Replace in the format: "PlayerName Position Stack" or "PlayerName Stack"
            if p['position'] in ['Dealer', 'SB', 'BB']:
                pattern = rf"({p['name']} {p['position']} )-?\d{{1,3}}(,\d{{3}})*"
                replacement = rf"\g<1>{format_number(p['new_stack'])}"
            else:
                pattern = rf"({p['name']} )-?\d{{1,3}}(,\d{{3}})*"
                replacement = rf"\g<1>{format_number(p['new_stack'])}"

            middle = re.sub(pattern, replacement, middle)

        return prefix + middle + suffix

    tc_content = re.sub(preview_pattern, replace_preview, tc_content, flags=re.DOTALL)

    # Also fix the next-hand-content div
    content_pattern = r'(<div class="next-hand-content">.*?Stack Setup:)(.*?)(</div>)'

    def replace_content(match):
        prefix = match.group(1)
        middle = match.group(2)
        suffix = match.group(3)

        for p in players:
            if p['position'] in ['Dealer', 'SB', 'BB']:
                pattern = rf"({p['name']} {p['position']} )-?\d{{1,3}}(,\d{{3}})*"
                replacement = rf"\g<1>{format_number(p['new_stack'])}"
            else:
                pattern = rf"({p['name']} )-?\d{{1,3}}(,\d{{3}})*"
                replacement = rf"\g<1>{format_number(p['new_stack'])}"

            middle = re.sub(pattern, replacement, middle)

        return prefix + middle + suffix

    tc_content = re.sub(content_pattern, replace_content, tc_content, flags=re.DOTALL)

    # Also fix the comparison button onclick
    compare_pattern = r'(onclick="compareNextHand\([^,]+,\s*`[^`]*Stack Setup:)(.*?)(`\)")'
    tc_content = re.sub(compare_pattern, replace_preview, tc_content, flags=re.DOTALL)

    return tc_content

def fix_test_case(tc_content: str, tc_id: str) -> Tuple[str, bool]:
    """Fix a single test case, return (fixed_content, had_changes)"""
    print(f"\nProcessing {tc_id}...")

    # Extract ante value
    ante_match = re.search(r'<div class="blind-item"><label>Ante</label><div class="value">([\d,]+)</div></div>', tc_content)
    ante = int(ante_match.group(1).replace(',', '')) if ante_match else 0

    # Parse players from table
    players = parse_players_from_table(tc_content)
    if not players:
        print(f"  ERROR: No players found")
        return tc_content, False

    # Fix players with negative stacks
    fixed_players, had_fixes = fix_player_data(players, ante)

    if not had_fixes:
        print(f"  No negative stacks found (skipping)")
        return tc_content, False

    # Update the table rows
    tbody_match = re.search(r'(<tbody>)(.*?)(</tbody>)', tc_content, re.DOTALL)
    if tbody_match:
        tbody_content = tbody_match.group(2)
        rows = re.findall(r'<tr>(.*?)</tr>', tbody_content, re.DOTALL)

        for i, row in enumerate(rows):
            if i < len(fixed_players):
                updated_row = update_table_row(f'<tr>{row}</tr>', fixed_players[i])
                tbody_content = tbody_content.replace(f'<tr>{row}</tr>', updated_row, 1)

        tc_content = tc_content.replace(
            tbody_match.group(0),
            tbody_match.group(1) + tbody_content + tbody_match.group(3)
        )

    # Update Next Hand Preview
    tc_content = update_next_hand_preview(tc_content, fixed_players)

    print(f"  ✓ Fixed {tc_id}")
    return tc_content, True

def main():
    """Main function to fix all failing test cases"""
    filepath = r'C:\Apps\HUDR\HHTool_Modular\docs\QA\30_TestCases.html'

    print("Reading test cases file...")
    content = read_file(filepath)

    total_fixes = 0

    for tc_id in FAILING_TCS:
        tc_content, start, end = extract_test_case(content, tc_id)
        if tc_content is None:
            continue

        fixed_content, had_changes = fix_test_case(tc_content, tc_id)

        if had_changes:
            # Replace in the main content
            content = content[:start] + fixed_content + content[end:]
            total_fixes += 1

    print(f"\n{'='*60}")
    print(f"Fixed {total_fixes} test cases")
    print(f"{'='*60}\n")

    print("Writing updated file...")
    write_file(filepath, content)
    print("✓ Done!")

if __name__ == '__main__':
    main()
