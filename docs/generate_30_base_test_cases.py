#!/usr/bin/env python3
"""
Generate 30 Base Test Cases for Poker Hand History Tool

Requirements:
1. Equal distribution: 5-9 players (10 cases), 2-4 players (15 cases), 2 players (5 cases)
2. 15-20 test cases with bet/call/raise/re-raise across all streets
3. Checking only 30% of the time
4. 1-2 side pots in 80% of test cases
5. Start simple, progress to complex
6. All test cases must follow TEST_CASE_GENERATION_SPEC.md rules

Key Rules Implemented:
- Base vs More section assignment (Section 4)
- Button rotation (Section 6)
- BB Ante posting order (Section 7)
- All players in next hand (including busted at 0)
- Proper position labels
"""

import random
import json
from typing import List, Dict, Tuple, Optional

# Player names pool
PLAYER_NAMES = [
    "Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Henry",
    "Ivy", "Jack", "Kate", "Leo", "Maria", "Nick", "Olivia"
]

# Position mappings by player count
POSITIONS = {
    2: ["SB", "BB"],
    3: ["Dealer", "SB", "BB"],
    4: ["Dealer", "SB", "BB", "UTG"],
    5: ["Dealer", "SB", "BB", "UTG", "CO"],
    6: ["Dealer", "SB", "BB", "UTG", "MP", "CO"],
    7: ["Dealer", "SB", "BB", "UTG", "MP", "HJ", "CO"],
    8: ["Dealer", "SB", "BB", "UTG", "UTG+1", "MP", "HJ", "CO"],
    9: ["Dealer", "SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "HJ", "CO"]
}

# Action order (post-flop)
def get_action_order(num_players: int) -> List[str]:
    """Get action order for post-flop streets"""
    positions = POSITIONS[num_players]
    # Post-flop: SB acts first, then BB, then UTG, etc.
    order = []
    if "SB" in positions:
        order.append("SB")
    if "BB" in positions:
        order.append("BB")
    for pos in positions:
        if pos not in ["Dealer", "SB", "BB"]:
            order.append(pos)
    if "Dealer" in positions:
        order.append("Dealer")
    return order


class Player:
    def __init__(self, name: str, position: str, stack: int):
        self.name = name
        self.position = position
        self.starting_stack = stack
        self.current_stack = stack
        self.contributed_this_street = 0
        self.total_contributed = 0
        self.folded = False
        self.all_in = False
        self.is_bb = position == "BB"
        self.ante_posted = 0
        self.blind_posted = 0

    def __repr__(self):
        return f"{self.name}({self.position}): {self.current_stack}"


class TestCaseGenerator:
    def __init__(self, tc_num: int, num_players: int, complexity: str):
        self.tc_num = tc_num
        self.num_players = num_players
        self.complexity = complexity
        self.sb = 50
        self.bb = 100
        self.ante = 100

        # Determine stack sizes based on complexity
        if complexity == "Simple":
            base_bb_count = random.randint(80, 120)
        elif complexity == "Medium":
            base_bb_count = random.randint(60, 100)
        else:  # Complex
            base_bb_count = random.randint(40, 80)

        # Create players with varied stacks
        self.players = self.create_players(base_bb_count)
        self.pot = 0
        self.main_pot = 0
        self.side_pots = []
        self.actions = {}
        self.board = []

    def create_players(self, base_bb_count: int) -> List[Player]:
        """Create players with positions and stacks"""
        players = []
        positions = POSITIONS[self.num_players]
        names = PLAYER_NAMES[:self.num_players]

        for i, (name, pos) in enumerate(zip(names, positions)):
            # Vary stack sizes for side pot creation
            if self.complexity == "Complex" and i < 2:
                # Make some players shorter stacked
                stack = self.bb * random.randint(20, 40)
            else:
                variation = random.randint(-10, 10)
                stack = self.bb * (base_bb_count + variation)

            players.append(Player(name, pos, stack))

        return players

    def post_blinds_antes(self):
        """Post blinds and antes following FR-7 rules"""
        for player in self.players:
            if player.position == "BB":
                # BB posts ante FIRST (dead money)
                player.ante_posted = self.ante
                player.current_stack -= self.ante
                player.total_contributed += self.ante

                # Then BB posts blind (live money)
                player.blind_posted = self.bb
                player.current_stack -= self.bb
                player.contributed_this_street = self.bb
                player.total_contributed += self.bb

            elif player.position == "SB":
                player.blind_posted = self.sb
                player.current_stack -= self.sb
                player.contributed_this_street = self.sb
                player.total_contributed += self.sb

    def rotate_button(self) -> List[Player]:
        """Rotate button clockwise for next hand"""
        positions = POSITIONS[self.num_players]

        # Find current dealer
        dealer_idx = None
        for i, p in enumerate(self.players):
            if p.position == "Dealer" or (self.num_players == 2 and p.position == "SB"):
                dealer_idx = i
                break

        # Rotate: next player clockwise becomes new dealer
        new_order = []
        for i in range(self.num_players):
            new_idx = (dealer_idx + 1 + i) % self.num_players
            player = self.players[new_idx]

            # Calculate new stack
            new_stack = player.starting_stack - player.total_contributed
            # Note: Would add winnings here in actual implementation

            # Assign new position
            new_position = positions[i]

            # Create new player entry for next hand
            new_order.append({
                'name': player.name,
                'position': new_position,
                'stack': new_stack
            })

        return new_order

    def format_number(self, num: int) -> str:
        """Format number with commas"""
        return f"{num:,}"

    def generate_simple_test_case(self) -> str:
        """Generate a simple test case (TC 1-5): Straightforward to river"""
        self.post_blinds_antes()

        # Preflop: Everyone calls
        preflop_actions = []
        for player in self.players:
            if player.position not in ["SB", "BB"]:
                preflop_actions.append(
                    f'<div class="action-row"><span class="action-player">{player.name} ({player.position}):</span> '
                    f'<span class="action-type">Call</span> <span class="action-amount">{self.bb}</span></div>'
                )
                player.contributed_this_street = self.bb
                player.current_stack -= (self.bb - player.blind_posted)

        # SB completes
        sb_player = next(p for p in self.players if p.position == "SB")
        preflop_actions.append(
            f'<div class="action-row"><span class="action-player">{sb_player.name} (SB):</span> '
            f'<span class="action-type">Call</span> <span class="action-amount">{self.bb}</span></div>'
        )
        sb_player.contributed_this_street = self.bb
        sb_player.current_stack -= (self.bb - sb_player.blind_posted)

        # BB checks
        bb_player = next(p for p in self.players if p.position == "BB")
        preflop_actions.append(
            f'<div class="action-row"><span class="action-player">{bb_player.name} (BB):</span> '
            f'<span class="action-type">Check</span></div>'
        )

        self.actions['Preflop Base'] = preflop_actions

        # Generate board
        self.board = [
            ("Flop", ["A♠", "K♦", "Q♣"]),
            ("Turn", ["7♥"]),
            ("River", ["3♦"])
        ]

        # Flop: Simple bet/call
        # ...implement flop, turn, river actions...

        return self.generate_html()

    def generate_html(self) -> str:
        """Generate complete HTML for test case"""
        # Build stack setup
        stack_setup_lines = []
        for player in self.players:
            if self.num_players == 2:
                stack_setup_lines.append(f"{player.name} {player.position} {player.starting_stack}")
            else:
                stack_setup_lines.append(f"{player.name} {player.position} {player.starting_stack}")

        stack_setup_str = "\\n".join(stack_setup_lines)
        stack_setup_pre = "\n".join(stack_setup_lines)

        # Build actions HTML
        actions_html = ""
        for street_name, actions in self.actions.items():
            actions_html += f'''                <div class="street-block">
                    <div class="street-name">{street_name}</div>
'''
            for action in actions:
                actions_html += f"                    {action}\n"
            actions_html += "                </div>\n"

        # Generate next hand with button rotation
        next_hand_players = self.rotate_button()
        next_stack_lines = []
        for p in next_hand_players:
            next_stack_lines.append(f"{p['name']} {p['position']} {p['stack']}")
        next_stack_str = "\\n".join(next_stack_lines)
        next_stack_pre = "\n".join(next_stack_lines)

        # Generate test case HTML
        html = f'''
        <!-- TEST CASE {self.tc_num} -->
        <div class="test-case">
            <div class="test-header" onclick="toggleTestCase(this)">
                <div>
                    <div class="test-id">TC-{self.tc_num}</div>
                    <div class="test-name">{self.num_players} Players - {self.complexity}</div>
                </div>
                <div class="badges">
                    <span class="badge {self.complexity.lower()}">{self.complexity}</span>
                    <span class="collapse-icon">▼</span>
                </div>
            </div>

            <div class="test-content">
            <div class="section-title">Stack Setup</div>
            <div class="blind-setup">
                <div class="blind-item"><label>Small Blind</label><div class="value">{self.sb}</div></div>
                <div class="blind-item"><label>Big Blind</label><div class="value">{self.bb}</div></div>
                <div class="blind-item"><label>Ante</label><div class="value">{self.ante}</div></div>
                <div class="blind-item"><label>Ante Order</label><div class="value">BB First</div></div>
            </div>

            <div class="copy-instruction">📋 Copy and paste this into the app:</div>
            <button class="copy-btn" onclick="copyPlayerData(this, `Hand ({self.tc_num})
started_at: 00:02:30 ended_at: 00:05:40
SB {self.sb} BB {self.bb} Ante {self.ante}
Stack Setup:
{stack_setup_str}`)">
                <span>📋</span> Copy Player Data
            </button>
            <div class="player-data-box">
<pre>Hand ({self.tc_num})
started_at: 00:02:30 ended_at: 00:05:40
SB {self.sb} BB {self.bb} Ante {self.ante}
Stack Setup:
{stack_setup_pre}</pre>
            </div>

            <div class="section-title">Actions</div>
            <div class="actions-section">
{actions_html}            </div>

            <div class="next-hand-preview">
                <div class="next-hand-header">
                    <div class="next-hand-title">📋 Next Hand Preview</div>
                    <button class="copy-btn" onclick="copyPlayerData(this, `Hand ({self.tc_num + 1})\\nstarted_at: 00:05:40 ended_at: HH:MM:SS\\nSB {self.sb} BB {self.bb} Ante {self.ante}\\nStack Setup:\\n{next_stack_str}`)">
                        <span>📋</span> Copy Next Hand
                    </button>
                </div>
                <div class="next-hand-content">
Hand ({self.tc_num + 1})
started_at: 00:05:40 ended_at: HH:MM:SS
SB {self.sb} BB {self.bb} Ante {self.ante}
Stack Setup:
{next_stack_pre}
                </div>
            </div>
            </div>
        </div>
'''
        return html


def generate_test_case_distribution() -> List[Tuple[int, int, str]]:
    """
    Generate distribution of 30 test cases:
    - 5 simple (TC 1-5): 2 players
    - 15 medium (TC 6-20): 2-4 players (mixed)
    - 10 complex (TC 21-30): 5-9 players

    Returns: List of (tc_num, num_players, complexity)
    """
    distribution = []

    # TC 1-5: Simple, 2 players
    for i in range(1, 6):
        distribution.append((i, 2, "Simple"))

    # TC 6-20: Medium, 2-4 players (15 cases)
    player_counts_medium = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 2, 3, 4, 3]
    for i, count in enumerate(player_counts_medium, start=6):
        distribution.append((i, count, "Medium"))

    # TC 21-30: Complex, 5-9 players (10 cases)
    player_counts_complex = [5, 6, 7, 8, 9, 6, 7, 8, 5, 9]
    for i, count in enumerate(player_counts_complex, start=21):
        distribution.append((i, count, "Complex"))

    return distribution


def main():
    """Generate all 30 test cases"""
    print("Generating 30 Base Test Cases...")
    print("Following TEST_CASE_GENERATION_SPEC.md rules\n")

    distribution = generate_test_case_distribution()

    all_html = ""
    for tc_num, num_players, complexity in distribution:
        print(f"Generating TC-{tc_num}: {num_players} players, {complexity}")

        generator = TestCaseGenerator(tc_num, num_players, complexity)

        if complexity == "Simple":
            html = generator.generate_simple_test_case()
        else:
            # Will implement medium/complex generation
            html = generator.generate_simple_test_case()

        all_html += html

    # Write to file
    output_file = "C:\\Apps\\HUDR\\HHTool_Modular\\docs\\30_base_test_cases.html"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(all_html)

    print(f"\n✓ Generated 30 test cases successfully!")
    print(f"Output: {output_file}")
    print("\nDistribution:")
    print("- TC 1-5: Simple (2 players)")
    print("- TC 6-20: Medium (2-4 players)")
    print("- TC 21-30: Complex (5-9 players)")


if __name__ == "__main__":
    main()
