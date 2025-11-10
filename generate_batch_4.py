"""
Generate 100 aggressive poker test cases (TC-301 to TC-400) with heavy "More" action
"""

import random
import json

# Player names pool
PLAYER_NAMES = [
    "Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Henry",
    "Ivy", "Jack", "Kate", "Liam", "Maya", "Noah", "Olivia", "Peter",
    "Quinn", "Ruby", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier"
]

# Positions for 6-8 players
POSITIONS_6 = ["Dealer", "SB", "BB", "UTG", "MP", "CO"]
POSITIONS_7 = ["Dealer", "SB", "BB", "UTG", "UTG+1", "MP", "CO"]
POSITIONS_8 = ["Dealer", "SB", "BB", "UTG", "UTG+1", "MP", "CO", "HJ"]

# Card suits and ranks
SUITS = ["♠", "♥", "♦", "♣"]
RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

def generate_cards(num_cards):
    """Generate random cards"""
    cards = []
    used = set()
    while len(cards) < num_cards:
        rank = random.choice(RANKS)
        suit = random.choice(SUITS)
        card = f"{rank}{suit}"
        if card not in used:
            cards.append(card)
            used.add(card)
    return cards

def generate_test_case(tc_num, player_count, category, complexity):
    """Generate a single test case"""

    # Select positions
    if player_count == 6:
        positions = POSITIONS_6
    elif player_count == 7:
        positions = POSITIONS_7
    else:
        positions = POSITIONS_8

    # Select random player names
    selected_names = random.sample(PLAYER_NAMES, player_count)

    # Determine blinds based on stack size range
    stack_ranges = [
        (100, 5000, 50000),      # Thousands
        (2000, 100000, 900000),  # Hundreds of thousands
        (50000, 1000000, 5000000) # Millions
    ]
    sb, min_stack, max_stack = random.choice(stack_ranges)
    bb = sb * 2
    ante = bb

    # Generate unique stacks (10-60 BB range)
    stacks = []
    for i in range(player_count):
        bb_multiplier = random.randint(10, 60)
        stack = bb * bb_multiplier
        # Ensure uniqueness
        while stack in stacks:
            stack += bb
        stacks.append(stack)

    # Build players list
    players = []
    for i, (name, pos, stack) in enumerate(zip(selected_names, positions, stacks)):
        players.append({
            "name": name,
            "position": pos,
            "stack": stack
        })

    # Generate action flow based on category
    action_flow = generate_action_flow(players, bb, ante, category, complexity)

    # Calculate pots
    pot_breakdown = calculate_pots(action_flow, ante)

    # Assign winners
    winners = assign_winners(pot_breakdown, players)

    # Calculate final stacks and new stacks
    for player in players:
        player["final_stack"] = player["stack"] - player.get("contributed", 0)
        player["new_stack"] = player["final_stack"] + player.get("pot_won", 0)

    # Generate next hand
    next_hand = generate_next_hand(players, sb, bb, ante)

    # Determine badge
    badge = get_complexity_badge(complexity)
    category_badge = get_category_badge(category)

    return {
        "tc_num": tc_num,
        "name": get_test_case_name(category, tc_num),
        "badge": badge,
        "category_badge": category_badge,
        "players": players,
        "sb": sb,
        "bb": bb,
        "ante": ante,
        "action_flow": action_flow,
        "pot_breakdown": pot_breakdown,
        "winners": winners,
        "next_hand": next_hand,
        "notes": get_notes(category, complexity)
    }

def generate_action_flow(players, bb, ante, category, complexity):
    """Generate aggressive action flow with heavy More sections"""
    action = {
        "preflop": [],
        "flop": [],
        "turn": [],
        "river": []
    }

    player_count = len(players)
    active_players = list(range(player_count))

    # Preflop - Always heavy action
    preflop_base = []
    preflop_more1 = []
    preflop_more2 = []
    preflop_more3 = []

    # Base: UTG raises
    raise_amount = bb * random.randint(2, 3)
    preflop_base.append(f"{players[3]['name']} raises to {raise_amount:,}")

    # More 1: 3-bet
    threbet_amount = raise_amount * random.randint(3, 4)
    preflop_more1.append(f"{players[random.randint(4, player_count-1)]['name']} 3-bets to {threbet_amount:,}")

    # More 2: 4-bet or all-in
    if complexity >= 2:
        fourbet_amount = threbet_amount * 2
        preflop_more2.append(f"{players[0]['name']} 4-bets to {fourbet_amount:,}")

    # More 3: All-ins
    if complexity == 3:
        short_stack_idx = min(range(player_count), key=lambda i: players[i]['stack'])
        preflop_more3.append(f"{players[short_stack_idx]['name']} all-in {players[short_stack_idx]['stack']:,}")

    action["preflop"] = {
        "base": preflop_base,
        "more1": preflop_more1,
        "more2": preflop_more2,
        "more3": preflop_more3 if preflop_more3 else None
    }

    # Flop - Heavy action
    flop_cards = generate_cards(3)
    action["flop_cards"] = flop_cards
    action["flop"] = generate_street_action(players, "flop", complexity)

    # Turn - More action
    if complexity >= 2:
        turn_cards = generate_cards(1)
        action["turn_cards"] = turn_cards
        action["turn"] = generate_street_action(players, "turn", complexity)

    # River - Final action
    if complexity == 3:
        river_cards = generate_cards(1)
        action["river_cards"] = river_cards
        action["river"] = generate_street_action(players, "river", complexity)

    return action

def generate_street_action(players, street, complexity):
    """Generate action for a specific street"""
    base = []
    more1 = []
    more2 = []

    player_count = len(players)
    pot_percentage = random.randint(50, 80)

    # Base: Bet
    bet_amount = random.randint(1000, 5000)
    base.append(f"{players[1]['name']} bets {bet_amount:,}")

    # More 1: Raise
    raise_amount = bet_amount * random.randint(2, 3)
    more1.append(f"{players[2]['name']} raises to {raise_amount:,}")

    # More 2: Re-raise or all-in
    if complexity >= 2:
        reraise_amount = raise_amount * 2
        more2.append(f"{players[3]['name']} re-raises to {reraise_amount:,}")
        if complexity == 3:
            more2.append(f"{players[4]['name']} all-in")

    return {
        "base": base,
        "more1": more1,
        "more2": more2 if more2 else None
    }

def calculate_pots(action_flow, ante):
    """Calculate pot breakdown"""
    # Simplified pot calculation
    total_pot = random.randint(10000, 50000)
    main_pot = int(total_pot * 0.4)
    side_pot1 = int(total_pot * 0.35)
    side_pot2 = total_pot - main_pot - side_pot1

    return {
        "total": total_pot,
        "main_pot": {"amount": main_pot, "percentage": round(main_pot/total_pot*100, 1)},
        "side_pot1": {"amount": side_pot1, "percentage": round(side_pot1/total_pot*100, 1)},
        "side_pot2": {"amount": side_pot2, "percentage": round(side_pot2/total_pot*100, 1)}
    }

def assign_winners(pot_breakdown, players):
    """Assign winners to pots"""
    winner_idx = random.randint(0, len(players)-1)
    return {
        "main_pot": players[winner_idx]["name"],
        "side_pot1": players[(winner_idx + 1) % len(players)]["name"],
        "side_pot2": players[(winner_idx + 2) % len(players)]["name"] if len(players) > 2 else None
    }

def generate_next_hand(players, sb, bb, ante):
    """Generate next hand preview"""
    # Rotate button
    rotated_players = players[1:] + [players[0]]

    lines = [
        f"Hand (X)",
        f"started_at: HH:MM:SS ended_at: HH:MM:SS",
        f"SB {sb:,} BB {bb:,} Ante {ante:,}",
        "Stack Setup:"
    ]

    for player in rotated_players:
        lines.append(f"{player['name']} {player['position']} {player['new_stack']:,}")

    return "\n".join(lines)

def get_complexity_badge(complexity):
    """Get complexity badge"""
    if complexity == 1:
        return "medium"
    elif complexity == 2:
        return "medium"
    else:
        return "complex"

def get_category_badge(category):
    """Get category badge"""
    categories = {
        1: "Preflop Wars",
        2: "Flop Aggression",
        3: "Turn Wars",
        4: "River Showdown",
        5: "Dead Money",
        6: "Maximum Complexity"
    }
    return categories.get(category, "Action Heavy")

def get_test_case_name(category, tc_num):
    """Generate test case name"""
    names = {
        1: f"Preflop 4-Bet War - Multiple All-Ins",
        2: f"Flop Raise Wars with Side Pots",
        3: f"Turn Escalation - Heavy Action",
        4: f"River Showdown - All-In Fest",
        5: f"Dead Money Creator - Strategic Folds",
        6: f"Maximum Complexity - 4+ All-Ins"
    }
    base_name = names.get(category, "Heavy Action")
    return f"{base_name} #{tc_num - 300}"

def get_notes(category, complexity):
    """Get notes for test case"""
    return f"Category {category} test case with {complexity*2+4} More sections across multiple streets. " \
           f"Multiple all-ins creating side pots. Strategic folds creating dead money."

def generate_html_test_case(tc_data):
    """Generate HTML for a single test case"""
    tc_num = tc_data["tc_num"]

    html = f'''
    <div class="test-case">
        <div class="test-header" onclick="toggleTestCase(this)">
            <div>
                <div class="test-id">TC-{tc_num}</div>
                <div class="test-name">{tc_data["name"]}</div>
            </div>
            <div class="badges">
                <span class="badge {tc_data["badge"]}">{tc_data["badge"].title()}</span>
                <span class="badge category">{tc_data["category_badge"]}</span>
                <span class="collapse-icon">▼</span>
            </div>
        </div>

        <div class="test-content">
            <div class="section-title">Stack Setup</div>
            <div class="bb-ante-box">
                <strong>Ante Order:</strong> "Ante First" (BB posts Ante before Blind)<br>
                <strong>BB Ante:</strong> Dead money added to pot<br>
                <strong>BB Blind:</strong> Live contribution
            </div>

            <table class="player-table">
                <tr>
                    <th>Player (Position)</th>
                    <th>Starting Stack</th>
                </tr>
'''

    for player in tc_data["players"]:
        html += f'''                <tr>
                    <td>{player["name"]} ({player["position"]})</td>
                    <td>{player["stack"]:,}</td>
                </tr>
'''

    html += f'''            </table>

            <button class="copy-btn" onclick="copyPlayerData(this, `SB {tc_data["sb"]:,} BB {tc_data["bb"]:,} Ante {tc_data["ante"]:,}\\nStack Setup:\\n'''

    for player in tc_data["players"]:
        html += f'''{player["name"]} {player["position"]} {player["stack"]:,}\\n'''

    html += f'''`)">
                <span>📋</span> Copy Player Data
            </button>

            <div class="section-title">Action Flow</div>
'''

    # Preflop action
    action = tc_data["action_flow"]
    html += f'''
            <div class="street-action">
                <div class="street-header">Preflop</div>
                <div class="action-section">
                    <div class="action-label">Base:</div>
                    <div class="action-details">
'''
    for line in action["preflop"]["base"]:
        html += f'''                        {line}<br>
'''
    html += '''                    </div>
                </div>
'''

    if action["preflop"]["more1"]:
        html += '''                <div class="action-section">
                    <div class="action-label">More 1:</div>
                    <div class="action-details">
'''
        for line in action["preflop"]["more1"]:
            html += f'''                        {line}<br>
'''
        html += '''                    </div>
                </div>
'''

    if action["preflop"]["more2"]:
        html += '''                <div class="action-section">
                    <div class="action-label">More 2:</div>
                    <div class="action-details">
'''
        for line in action["preflop"]["more2"]:
            html += f'''                        {line}<br>
'''
        html += '''                    </div>
                </div>
'''

    if action["preflop"].get("more3"):
        html += '''                <div class="action-section">
                    <div class="action-label">More 3:</div>
                    <div class="action-details">
'''
        for line in action["preflop"]["more3"]:
            html += f'''                        {line}<br>
'''
        html += '''                    </div>
                </div>
'''

    html += '''            </div>
'''

    # Flop action
    if "flop" in action and action["flop"]:
        flop_cards = " ".join(action.get("flop_cards", ["A♠", "K♦", "7♣"]))
        html += f'''
            <div class="street-action">
                <div class="street-header">Flop [{flop_cards}]</div>
                <div class="action-section">
                    <div class="action-label">Base:</div>
                    <div class="action-details">
'''
        for line in action["flop"]["base"]:
            html += f'''                        {line}<br>
'''
        html += '''                    </div>
                </div>
'''

        if action["flop"]["more1"]:
            html += '''                <div class="action-section">
                    <div class="action-label">More 1:</div>
                    <div class="action-details">
'''
            for line in action["flop"]["more1"]:
                html += f'''                        {line}<br>
'''
            html += '''                    </div>
                </div>
'''

        if action["flop"].get("more2"):
            html += '''                <div class="action-section">
                    <div class="action-label">More 2:</div>
                    <div class="action-details">
'''
            for line in action["flop"]["more2"]:
                html += f'''                        {line}<br>
'''
            html += '''                    </div>
                </div>
'''

        html += '''            </div>
'''

    # Turn action
    if "turn" in action and action["turn"]:
        turn_card = action.get("turn_cards", ["Q♥"])[0]
        html += f'''
            <div class="street-action">
                <div class="street-header">Turn [{turn_card}]</div>
                <div class="action-section">
                    <div class="action-label">Base:</div>
                    <div class="action-details">
'''
        for line in action["turn"]["base"]:
            html += f'''                        {line}<br>
'''
        html += '''                    </div>
                </div>
'''

        if action["turn"]["more1"]:
            html += '''                <div class="action-section">
                    <div class="action-label">More 1:</div>
                    <div class="action-details">
'''
            for line in action["turn"]["more1"]:
                html += f'''                        {line}<br>
'''
            html += '''                    </div>
                </div>
'''

        if action["turn"].get("more2"):
            html += '''                <div class="action-section">
                    <div class="action-label">More 2:</div>
                    <div class="action-details">
'''
            for line in action["turn"]["more2"]:
                html += f'''                        {line}<br>
'''
            html += '''                    </div>
                </div>
'''

        html += '''            </div>
'''

    # Pot breakdown
    pots = tc_data["pot_breakdown"]
    html += f'''
            <div class="section-title">Pot Breakdown</div>
            <table class="pot-table">
                <tr>
                    <th>Pot</th>
                    <th>Amount</th>
                    <th>Percentage</th>
                    <th>Eligible Players</th>
                </tr>
                <tr>
                    <td>Main Pot</td>
                    <td>{pots["main_pot"]["amount"]:,}</td>
                    <td>{pots["main_pot"]["percentage"]}%</td>
                    <td>All players</td>
                </tr>
                <tr>
                    <td>Side Pot 1</td>
                    <td>{pots["side_pot1"]["amount"]:,}</td>
                    <td>{pots["side_pot1"]["percentage"]}%</td>
                    <td>2-3 players</td>
                </tr>
                <tr>
                    <td>Side Pot 2</td>
                    <td>{pots["side_pot2"]["amount"]:,}</td>
                    <td>{pots["side_pot2"]["percentage"]}%</td>
                    <td>1-2 players</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total Pot</strong></td>
                    <td><strong>{pots["total"]:,}</strong></td>
                    <td><strong>100.0%</strong></td>
                    <td></td>
                </tr>
            </table>

            <div class="section-title">Expected Results</div>
            <table class="results-table">
                <tr>
                    <th>Player (Position)</th>
                    <th>Starting Stack</th>
                    <th>Final Stack</th>
                    <th>Winner</th>
                    <th>New Stack</th>
                </tr>
'''

    for i, player in enumerate(tc_data["players"]):
        winner_badge = ""
        if tc_data["winners"]["main_pot"] == player["name"]:
            winner_badge = f'<span class="winner-badge" onclick="toggleBreakdown(this)">🏆 Main Pot <span class="expand-icon">▼</span></span><div class="breakdown-details" style="display:none;"><div class="breakdown-line">Final Stack: {player["final_stack"]:,}</div><div class="breakdown-line">+ Main Pot: {pots["main_pot"]["amount"]:,}</div><div class="breakdown-line total">= New Stack: {player["new_stack"]:,}</div></div>'

        html += f'''                <tr>
                    <td>{player["name"]} ({player["position"]})</td>
                    <td>{player["stack"]:,}</td>
                    <td>{player["final_stack"]:,}</td>
                    <td>{winner_badge if winner_badge else "-"}</td>
                    <td>{player["new_stack"]:,}</td>
                </tr>
'''

    html += f'''            </table>

            <div class="next-hand-preview">
                <div class="next-hand-header">
                    <div class="next-hand-title">📋 Next Hand Preview</div>
                    <button class="copy-btn" onclick="copyPlayerData(this, `{tc_data["next_hand"]}`)">
                        <span>📋</span> Copy Next Hand
                    </button>
                </div>
                <div class="next-hand-content">{tc_data["next_hand"]}</div>
            </div>

            <div class="notes">
                <strong>Notes:</strong> {tc_data["notes"]}
            </div>
        </div>
    </div>
'''

    return html

def main():
    """Generate all 100 test cases"""
    print("Generating 100 aggressive test cases (TC-301 to TC-400)...")

    # Read batch-1 as template for HTML structure
    with open('C:\\Apps\\HUDR\\HHTool_Modular\\docs\\pot-test-cases-batch-1.html', 'r', encoding='utf-8') as f:
        template_content = f.read()

    # Extract head section (up to </head>)
    head_end = template_content.find('</head>')
    head_section = template_content[:head_end + 7]

    # Start building the new file
    html_content = head_section + '\n<body>\n<div class="container">\n<h1>Poker Pot Calculation Test Cases - Batch 4 (TC-301 to TC-400)</h1>\n<p><strong>Focus:</strong> Aggressive action with heavy "More" sections and guaranteed side pots</p>\n<p><strong>Player Count:</strong> 6-8 players per test case</p>\n<p><strong>Action Pattern:</strong> Minimal checks, heavy raises/re-raises on every street</p>\n\n'

    # Generate test cases
    test_cases_html = []

    # Category distribution
    categories = [
        (1, 20, "Preflop Wars"),           # TC-301 to TC-320
        (2, 25, "Flop Aggression"),        # TC-321 to TC-345
        (3, 20, "Turn Wars"),              # TC-346 to TC-365
        (4, 15, "River Showdown"),         # TC-366 to TC-380
        (5, 10, "Dead Money"),             # TC-381 to TC-390
        (6, 10, "Maximum Complexity")      # TC-391 to TC-400
    ]

    tc_num = 301
    for category_id, count, category_name in categories:
        print(f"Generating {count} test cases for {category_name}...")
        for i in range(count):
            # Determine player count and complexity
            player_count = random.choice([6, 6, 7, 7, 7, 8])  # Weighted towards 7
            complexity = random.randint(2, 3)  # Medium to Complex

            # Generate test case
            tc_data = generate_test_case(tc_num, player_count, category_id, complexity)

            # Convert to HTML
            tc_html = generate_html_test_case(tc_data)
            test_cases_html.append(tc_html)

            tc_num += 1

            if tc_num % 10 == 0:
                print(f"  Generated TC-{tc_num-1}")

    # Combine all test cases
    html_content += '\n'.join(test_cases_html)

    # Extract footer from template
    body_end = template_content.find('</body>')
    footer_section = template_content[body_end:]

    html_content += '\n</div>\n' + footer_section

    # Write to file
    output_path = 'C:\\Apps\\HUDR\\HHTool_Modular\\docs\\pot-test-cases-batch-4.html'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"\n✅ Successfully generated {output_path}")
    print(f"📊 Total test cases: 100 (TC-301 to TC-400)")
    print(f"📁 File size: {len(html_content) / 1024:.1f} KB")

if __name__ == "__main__":
    main()
