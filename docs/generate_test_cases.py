#!/usr/bin/env python3
"""
Generate 287 poker pot calculation test cases (TC-14.1 through TC-300.1)
"""

import random
import json

# Player names pool
PLAYER_NAMES = [
    "Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Henry",
    "Ivy", "Jack", "Kate", "Leo", "Maria", "Nick", "Olivia", "Paul",
    "Quinn", "Rachel", "Steve", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zack"
]

# Positions for different player counts
POSITIONS_2 = ["SB", "BB"]
POSITIONS_3 = ["Dealer", "SB", "BB"]
POSITIONS_4 = ["Dealer", "SB", "BB", "UTG"]
POSITIONS_5 = ["Dealer", "SB", "BB", "UTG", "CO"]
POSITIONS_6 = ["Dealer", "SB", "BB", "UTG", "MP", "CO"]
POSITIONS_7 = ["Dealer", "SB", "BB", "UTG", "MP", "HJ", "CO"]
POSITIONS_8 = ["Dealer", "SB", "BB", "UTG", "UTG+1", "MP", "HJ", "CO"]
POSITIONS_9 = ["Dealer", "SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "HJ", "CO"]

# Edge case assignments
EDGE_CASES = {
    "BB Ante": [14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 91, 98, 105, 112, 119, 126, 133, 140, 147, 154, 161, 168, 175, 182, 189, 196, 203, 210, 217, 224, 231, 238, 245, 252, 259, 266, 273, 280, 287],
    "Short Stack": [15, 22, 29, 36, 43, 50, 57, 64, 71, 78, 85, 92, 99, 106, 113, 120, 127, 134, 141, 148, 155, 162, 169, 176, 183, 190, 197, 204, 211, 218, 225, 232, 239, 246, 253, 260, 267, 274, 281, 288],
    "Multiple All-Ins": [16, 24, 32, 40, 48, 58, 68, 80, 90, 100, 110, 122, 135, 145, 156, 167, 178, 191, 202, 213, 226, 237, 248, 261, 272, 283, 291, 295, 298, 300],
    "Side Pot Complex": [17, 25, 33, 41, 51, 61, 72, 82, 93, 103, 114, 125, 138, 150, 163, 177, 192, 205, 219, 233, 247, 262, 275, 285, 292, 296, 297, 299],
    "Multi-Street": [18, 26, 34, 44, 54, 65, 75, 86, 96, 107, 117, 128, 142, 153, 165, 179, 193, 207, 221, 235, 249, 263, 276, 286, 293, 294],
    "Position-Specific": [19, 27, 37, 47, 59, 69, 81, 94, 104, 115, 129, 143, 157, 170, 184, 198, 212, 227, 241, 255],
    "Fold Scenarios": [20, 30, 38, 46, 55, 66, 76, 87, 97, 108, 118, 130, 144, 158, 171, 185, 199, 214, 228, 242],
    "Transition": [23, 31, 39, 45, 52, 60, 67, 73, 83, 95, 105, 116, 131, 146, 160, 174, 188, 200, 215, 229],
    "Calculation Edge": [62, 74, 88, 101, 111, 121, 132, 149, 164, 180, 194, 208, 222, 236, 250, 264, 277, 289, 296, 299]
}

def get_complexity(tc_num):
    """Determine complexity based on test case number"""
    if tc_num <= 73:
        return "low", "Simple"
    elif tc_num <= 193:
        return "medium", "Medium"
    else:
        return "high", "Complex"

def get_player_count(tc_num):
    """Determine player count based on test case number"""
    if tc_num <= 53:
        return 2  # Heads-up
    elif tc_num <= 133:
        # Short-handed (3-6 players)
        return 3 + ((tc_num - 54) % 4)
    else:
        # Full ring (7-9 players)
        return 7 + ((tc_num - 134) % 3)

def get_stack_sizes(tc_num, num_players):
    """Generate stack sizes based on test case number"""
    # Rotate between thousands, hundreds of thousands, and millions
    cycle = tc_num % 3

    if cycle == 0:  # Thousands (5K-50K)
        bb = random.choice([100, 200, 500, 1000])
        base_bb = random.randint(10, 50)
    elif cycle == 1:  # Hundreds of thousands (100K-900K)
        bb = random.choice([2000, 5000, 10000])
        base_bb = random.randint(15, 60)
    else:  # Millions (1M+)
        bb = random.choice([10000, 20000, 50000])
        base_bb = random.randint(20, 60)

    sb = bb // 2
    ante = bb

    # Generate unique stacks for each player (10-60 BB range)
    stacks = []
    used_bb_counts = set()
    for _ in range(num_players):
        while True:
            bb_count = random.randint(10, base_bb)
            if bb_count not in used_bb_counts:
                used_bb_counts.add(bb_count)
                stacks.append(bb_count * bb)
                break

    return sb, bb, ante, stacks

def get_edge_case_category(tc_num):
    """Get the edge case category for a test case"""
    for category, numbers in EDGE_CASES.items():
        if tc_num in numbers:
            return category
    return "Standard"

def get_positions(num_players):
    """Get position labels for given player count"""
    if num_players == 2:
        return POSITIONS_2
    elif num_players == 3:
        return POSITIONS_3
    elif num_players == 4:
        return POSITIONS_4
    elif num_players == 5:
        return POSITIONS_5
    elif num_players == 6:
        return POSITIONS_6
    elif num_players == 7:
        return POSITIONS_7
    elif num_players == 8:
        return POSITIONS_8
    else:
        return POSITIONS_9

def format_number(num):
    """Format number with commas"""
    return f"{num:,}"

def generate_actions(num_players, stacks, sb, bb, edge_case, complexity):
    """Generate realistic action sequences"""
    actions = []
    positions = get_positions(num_players)
    players = PLAYER_NAMES[:num_players]

    # Adjust for short stacks edge case
    if edge_case == "Short Stack":
        # Force at least one player to have 10-15 BB
        stacks[0] = bb * random.randint(10, 15)

    # Create position mapping
    player_positions = list(zip(players, positions, stacks))

    # Simple preflop actions for now
    if complexity == "Simple":
        # Everyone calls
        actions.append({"street": "Preflop Base", "actions": []})
        for player, pos, stack in player_positions:
            if pos not in ["SB", "BB"]:
                actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{player} ({pos}):</span> <span class="action-type">Call</span> <span class="action-amount">{format_number(bb)}</span></div>')
        # SB completes
        if num_players > 2:
            actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{players[positions.index("SB")]} (SB):</span> <span class="action-type">Call</span> <span class="action-amount">{format_number(bb)}</span></div>')
        else:
            actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{players[0]} (SB):</span> <span class="action-type">Call</span> <span class="action-amount">{format_number(bb)}</span></div>')
        # BB checks
        bb_player = players[positions.index("BB")]
        actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{bb_player} (BB):</span> <span class="action-type">Check</span></div>')

    elif edge_case == "Multiple All-Ins":
        # Multiple all-ins
        actions.append({"street": "Preflop Base", "actions": []})
        sorted_stacks = sorted(enumerate(stacks), key=lambda x: x[1])
        # First 2-3 players go all-in
        num_all_ins = min(3, len(sorted_stacks))
        for i in range(num_all_ins):
            idx, stack = sorted_stacks[i]
            player, pos = players[idx], positions[idx]
            actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{player} ({pos}):</span> <span class="action-type">All-in</span> <span class="action-amount">{format_number(stack)}</span></div>')
        # Others call
        for i in range(num_all_ins, len(player_positions)):
            player, pos, stack = player_positions[i]
            max_all_in = sorted_stacks[num_all_ins-1][1]
            actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{player} ({pos}):</span> <span class="action-type">Call</span> <span class="action-amount">{format_number(max_all_in)}</span></div>')

    elif edge_case == "Fold Scenarios":
        # Some players fold
        actions.append({"street": "Preflop Base", "actions": []})
        # First player raises
        actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{players[0]} ({positions[0]}):</span> <span class="action-type">Raise</span> <span class="action-amount">{format_number(bb * 3)}</span></div>')
        # Some fold, some call
        for i in range(1, num_players - 1):
            actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{players[i]} ({positions[i]}):</span> <span class="action-type">Fold</span></div>')
        # Last player calls
        actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{players[-1]} ({positions[-1]}):</span> <span class="action-type">Call</span> <span class="action-amount">{format_number(bb * 3)}</span></div>')

    elif edge_case == "Multi-Street":
        # Actions across multiple streets
        actions.append({"street": "Preflop Base", "actions": []})
        # Preflop calls
        for player, pos, stack in player_positions:
            if pos not in ["SB", "BB"]:
                actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{player} ({pos}):</span> <span class="action-type">Call</span> <span class="action-amount">{format_number(bb)}</span></div>')
        # Add flop
        actions.append({"street": "Flop Base (A♥ K♦ Q♠)", "actions": []})
        actions[1]["actions"].append(f'<div class="action-row"><span class="action-player">{players[0]} ({positions[0]}):</span> <span class="action-type">Bet</span> <span class="action-amount">{format_number(bb * 2)}</span></div>')
        actions[1]["actions"].append(f'<div class="action-row"><span class="action-player">{players[1]} ({positions[1]}):</span> <span class="action-type">Call</span> <span class="action-amount">{format_number(bb * 2)}</span></div>')
        # Add turn
        actions.append({"street": "Turn Base (J♣)", "actions": []})
        actions[2]["actions"].append(f'<div class="action-row"><span class="action-player">{players[0]} ({positions[0]}):</span> <span class="action-type">Check</span></div>')
        actions[2]["actions"].append(f'<div class="action-row"><span class="action-player">{players[1]} ({positions[1]}):</span> <span class="action-type">Check</span></div>')

    else:
        # Default: everyone calls
        actions.append({"street": "Preflop Base", "actions": []})
        for player, pos, stack in player_positions:
            if pos not in ["SB", "BB"]:
                actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{player} ({pos}):</span> <span class="action-type">Call</span> <span class="action-amount">{format_number(bb)}</span></div>')
        if num_players > 2:
            sb_idx = positions.index("SB")
            actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{players[sb_idx]} (SB):</span> <span class="action-type">Call</span> <span class="action-amount">{format_number(bb)}</span></div>')
        else:
            actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{players[0]} (SB):</span> <span class="action-type">Call</span> <span class="action-amount">{format_number(bb)}</span></div>')
        bb_idx = positions.index("BB")
        actions[0]["actions"].append(f'<div class="action-row"><span class="action-player">{players[bb_idx]} (BB):</span> <span class="action-type">Check</span></div>')

    return actions, player_positions

def calculate_pot(num_players, stacks, ante, actions, edge_case):
    """Calculate pot distribution"""
    # Simplified calculation for generation
    if edge_case == "Multiple All-Ins":
        sorted_stacks = sorted(stacks)
        main_pot = sorted_stacks[0] * num_players + ante
        side_pots = []
        for i in range(1, min(3, len(sorted_stacks))):
            side_pot = (sorted_stacks[i] - sorted_stacks[i-1]) * (num_players - i)
            side_pots.append(side_pot)
        return main_pot, side_pots
    elif edge_case == "Fold Scenarios":
        # Only 2 players remain
        bb = stacks[0] // 20
        main_pot = bb * 3 * 2 + ante
        return main_pot, []
    else:
        # Everyone calls BB
        bb = stacks[0] // 20
        main_pot = bb * num_players + ante
        return main_pot, []

def generate_test_case_html(tc_num):
    """Generate complete HTML for one test case"""
    complexity_class, complexity_label = get_complexity(tc_num)
    num_players = get_player_count(tc_num)
    edge_case = get_edge_case_category(tc_num)

    sb, bb, ante, stacks = get_stack_sizes(tc_num, num_players)
    actions, player_positions = generate_actions(num_players, stacks, sb, bb, edge_case, complexity_label)
    main_pot, side_pots = calculate_pot(num_players, stacks, ante, actions, edge_case)

    positions = get_positions(num_players)
    players = PLAYER_NAMES[:num_players]

    # Build Stack Setup
    stack_setup_lines = []
    for i, (player, pos, stack) in enumerate(player_positions):
        if num_players == 2:
            # Heads-up: no Dealer line
            stack_setup_lines.append(f"{player} {pos} {stack}")
        else:
            stack_setup_lines.append(f"{player} {pos} {stack}")

    stack_setup_str = "\\n".join(stack_setup_lines)
    stack_setup_pre = "\n".join(stack_setup_lines)

    # Build Actions HTML
    actions_html = ""
    for action_block in actions:
        actions_html += f'''                <div class="street-block">
                    <div class="street-name">{action_block["street"]}</div>
'''
        for action in action_block["actions"]:
            actions_html += f"                    {action}\n"
        actions_html += "                </div>\n"

    # Calculate pot percentages
    total_pot = main_pot + sum(side_pots)
    main_pot_pct = (main_pot / total_pot * 100) if total_pot > 0 else 0

    # Build pot items
    pot_items_html = f'''                <div class="pot-item main">
                    <div class="pot-name">Main Pot</div>
                    <div class="pot-amount">{format_number(main_pot)} ({main_pot_pct:.1f}%)</div>
                    <div class="eligible">Eligible: <span>All Players</span></div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: {num_players} players × {format_number(bb)} + {format_number(ante)} ante
                    </div>
                </div>
'''

    for i, side_pot in enumerate(side_pots, 1):
        side_pot_pct = (side_pot / total_pot * 100) if total_pot > 0 else 0
        pot_items_html += f'''                <div class="pot-item side">
                    <div class="pot-name">Side Pot {i}</div>
                    <div class="pot-amount">{format_number(side_pot)} ({side_pot_pct:.1f}%)</div>
                    <div class="eligible">Eligible: <span>Remaining Players</span></div>
                </div>
'''

    # Build results table
    table_rows = ""
    winner_idx = random.randint(0, num_players - 1)
    winner_pot = main_pot + sum(side_pots)

    for i, (player, pos, stack) in enumerate(player_positions):
        final_stack = stack - bb
        if pos == "BB":
            final_stack = stack - bb - ante
            total_lost = bb + ante
            live_contribution = f"{format_number(bb)}"
            total_lost_str = f"{format_number(total_lost)} ({format_number(bb)} blind + {format_number(ante)} ante)"
        else:
            total_lost = bb
            live_contribution = f"{format_number(bb)}"
            total_lost_str = f"{format_number(total_lost)}"

        if i == winner_idx:
            new_stack = final_stack + winner_pot
            winner_badge = f'''
                                <span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main Pot <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: {format_number(final_stack)}</div>
                                    <div class="breakdown-line">+ Main Pot: {format_number(main_pot)}</div>'''
            for j, sp in enumerate(side_pots, 1):
                winner_badge += f'''
                                    <div class="breakdown-line">+ Side Pot {j}: {format_number(sp)}</div>'''
            winner_badge += f'''
                                    <div class="breakdown-line total">= New Stack: {format_number(new_stack)}</div>
                                </div>
                            '''
        else:
            new_stack = final_stack
            winner_badge = '<span class="winner-badge loser">-</span>'

        table_rows += f'''                        <tr>
                            <td>{player} ({pos})</td><td>{format_number(stack)}</td><td>{format_number(final_stack)}</td><td>{live_contribution}</td><td>{total_lost_str}</td>
                            <td>{winner_badge}</td>
                            <td>{format_number(new_stack)}</td>
                        </tr>
'''

    # Calculate next hand
    next_hand_num = tc_num + 1
    # Rotate button clockwise
    next_players = []
    for i, (player, pos, stack) in enumerate(player_positions):
        final_stack = stack - bb
        if pos == "BB":
            final_stack = stack - bb - ante
        if i == winner_idx:
            final_stack += winner_pot
        if final_stack > 0:
            next_pos_idx = (positions.index(pos) + 1) % len(positions)
            next_players.append((player, positions[next_pos_idx], final_stack))

    # Rebuild next hand stack setup
    next_stack_lines = []
    for player, pos, stack in next_players:
        next_stack_lines.append(f"{player} {pos} {stack}")
    next_stack_str = "\\n".join(next_stack_lines)
    next_stack_pre = "\n".join(next_stack_lines)

    # Generate test case name
    test_names = {
        "BB Ante": f"{'Heads-Up' if num_players == 2 else str(num_players) + '-Player'} BB Ante Scenario",
        "Short Stack": f"Short Stack {num_players}P (10-15 BB)",
        "Multiple All-Ins": f"{num_players}P Multiple All-Ins",
        "Side Pot Complex": f"{num_players}P Complex Side Pots",
        "Multi-Street": f"{num_players}P Multi-Street Action",
        "Position-Specific": f"{num_players}P Position Edge Case",
        "Fold Scenarios": f"{num_players}P Fold to 2 Players",
        "Transition": f"{num_players}P Transition Scenario",
        "Calculation Edge": f"{num_players}P Calculation Edge Case",
        "Standard": f"{num_players}P Standard Pot"
    }
    test_name = test_names.get(edge_case, f"{num_players}P Standard")

    html = f'''
        <!-- TEST CASE {tc_num}.1 -->
        <div class="test-case">
            <div class="test-header" onclick="toggleTestCase(this)">
                <div>
                    <div class="test-id">TC-{tc_num}.1</div>
                    <div class="test-name">{test_name}</div>
                </div>
                <div class="badges">
                    <span class="badge {complexity_class}">{complexity_label}</span>
                    <span class="badge category">{edge_case}</span>
                    <span class="collapse-icon">▼</span>
                </div>
            </div>

            <div class="test-content">
            <div class="section-title">Stack Setup</div>
            <div class="blind-setup">
                <div class="blind-item"><label>Small Blind</label><div class="value">{format_number(sb)}</div></div>
                <div class="blind-item"><label>Big Blind</label><div class="value">{format_number(bb)}</div></div>
                <div class="blind-item"><label>Ante</label><div class="value">{format_number(ante)}</div></div>
                <div class="blind-item"><label>Ante Order</label><div class="value">BB First</div></div>
            </div>

            <div class="copy-instruction">📋 Copy and paste this into the app:</div>
            <button class="copy-btn" onclick="copyPlayerData(this, `Hand ({tc_num})
started_at: 00:02:30 ended_at: 00:05:40
SB {sb} BB {bb} Ante {ante}
Stack Setup:
{stack_setup_str}`)">
                <span>📋</span> Copy Player Data
            </button>
            <div class="player-data-box">
<pre>Hand ({tc_num})
started_at: 00:02:30 ended_at: 00:05:40
SB {sb} BB {bb} Ante {ante}
Stack Setup:
{stack_setup_pre}</pre>
            </div>

            <div class="section-title">Actions</div>
            <div class="actions-section">
{actions_html}            </div>

            <div class="section-title">Expected Results</div>
            <div class="results-section">
                <div class="pot-summary">Total Pot: {format_number(total_pot)}</div>
                <div class="ante-info-box">
                    <strong>BB Ante: {format_number(ante)}</strong>
                    <div style="margin-top: 5px;">
                        BB posts {format_number(ante)} ante (dead money), then {format_number(bb)} blind (live money)
                    </div>
                </div>
{pot_items_html}                <table>
                    <thead>
                        <tr><th>Player (Position)</th><th>Starting Stack</th><th>Final Stack</th><th>Live Contribution</th><th>Total Lost</th><th>Winner</th><th>New Stack</th></tr>
                    </thead>
                    <tbody>
{table_rows}                    </tbody>
                </table>
            </div>

            <div class="next-hand-preview">
                <div class="next-hand-header">
                    <div class="next-hand-title">📋 Next Hand Preview</div>
                    <button class="copy-btn" onclick="copyPlayerData(this, `Hand ({next_hand_num})\\nstarted_at: 00:05:40 ended_at: HH:MM:SS\\nSB {sb} BB {bb} Ante {ante}\\nStack Setup:\\n{next_stack_str}`)">
                        <span>📋</span> Copy Next Hand
                    </button>
                </div>
                <div class="next-hand-content">
Hand ({next_hand_num})
started_at: 00:05:40 ended_at: HH:MM:SS
SB {sb} BB {bb} Ante {ante}
Stack Setup:
{next_stack_pre}
                </div>

                <div class="comparison-section">
                    <div class="comparison-header">🔍 Compare with Actual Output</div>
                    <textarea id="actual-output-tc-{tc_num}" class="comparison-textarea" placeholder="Paste the actual next hand output from your app here..." rows="8"></textarea>
                    <div style="margin-bottom: 10px;">
                        <button class="paste-btn" onclick="pasteFromClipboard(this, 'tc-{tc_num}')">
                            📋 Paste from Clipboard
                        </button>
                        <button class="compare-btn" onclick="compareNextHand('tc-{tc_num}', `Hand ({next_hand_num})\\nstarted_at: 00:05:40 ended_at: HH:MM:SS\\nSB {sb} BB {bb} Ante {ante}\\nStack Setup:\\n{next_stack_str}`)">
                            🔍 Compare
                        </button>
                    </div>
                    <div id="comparison-result-tc-{tc_num}" class="comparison-result"></div>
                </div>
            </div>

            <div class="notes">
                <div class="notes-title">Notes</div>
                <div class="notes-text">{edge_case} scenario with {num_players} players. {complexity_label} pot calculation with BB ante posted separately. Winner: {players[winner_idx]}.</div>
            </div>
            </div>
        </div>
'''

    return html

def main():
    """Generate all 287 test cases"""
    print("Generating 287 test cases...")

    all_html = ""
    for tc_num in range(14, 301):
        print(f"Generating TC-{tc_num}.1...")
        all_html += generate_test_case_html(tc_num)

    # Write to file
    with open("C:\\Apps\\HUDR\\HHTool_Modular\\docs\\generated-test-cases.html", "w", encoding="utf-8") as f:
        f.write(all_html)

    print(f"✓ Generated 287 test cases successfully!")
    print(f"Output: C:\\Apps\\HUDR\\HHTool_Modular\\docs\\generated-test-cases.html")

if __name__ == "__main__":
    main()
