#!/usr/bin/env python3
"""
Generate 10 Test Cases with Extended Actions (Raise/Re-raise sequences)

Extends generate_30_progressive.py with minimal changes
Adds support for Extended Action 1 and Extended Action 2 per street

Extended Action Rules:
- Base Action: Initial betting round
- Extended Action 1: Second betting round (can raise/call/fold)
- Extended Action 2: Third betting round (ONLY call/fold, no raises)
- Maximum 2 extended actions per street
"""

import sys
import os

# Import all classes from existing generator
from generate_30_progressive import (
    Player, Action, ActionType, TestCaseGenerator,
    BlindStructure, random
)


class ExtendedActionGenerator(TestCaseGenerator):
    """
    Extends TestCaseGenerator to support Extended Actions
    Inherits all existing logic, adds extended action support
    """

    def __init__(self, tc_num: int, num_players: int, complexity: str,
                 extended_streets: list = None, **kwargs):
        """
        extended_streets: List of streets that should have extended actions
                         e.g., ['preflop'], ['flop'], ['preflop', 'flop']
        """
        super().__init__(tc_num, num_players, complexity, **kwargs)

        # Track which streets have extended actions
        self.extended_streets = extended_streets or []

        # Track extended action rounds for each street
        self.street_actions = {
            'preflop': {'base': [], 'more1': [], 'more2': []},
            'flop': {'base': [], 'more1': [], 'more2': []},
            'turn': {'base': [], 'more1': [], 'more2': []},
            'river': {'base': [], 'more1': [], 'more2': []}
        }

    def process_action(self, player, action_type, amount=None):
        """Process an action and update player stacks

        Returns: tuple (Action, actual_amount)
            - Action: the action object
            - actual_amount: the actual amount after capping at player's stack
        """
        if action_type == ActionType.FOLD:
            player.folded = True
            return Action(player.name, player.position, ActionType.FOLD), 0

        elif action_type == ActionType.CHECK:
            return Action(player.name, player.position, ActionType.CHECK), 0

        elif action_type in [ActionType.CALL, ActionType.RAISE, ActionType.BET]:
            # Calculate additional amount needed
            additional = amount - player.street_contribution

            # Check if all-in
            if additional >= player.current_stack:
                additional = player.current_stack
                amount = player.street_contribution + additional
                player.all_in_street = "current"

            # Update stacks
            player.current_stack -= additional
            player.street_contribution = amount
            player.total_contribution += additional

            return Action(player.name, player.position, action_type, amount), amount

    def generate_preflop_simple(self):
        """Override parent's generate_preflop_simple to use street_actions structure"""
        actions = []

        # Get correct preflop action order
        action_order = self.get_preflop_action_order(self.players)

        # Everyone calls except last player (BB)
        for i, player in enumerate(action_order):
            if i < len(action_order) - 1:
                # Not BB - call
                call_amount = self.bb - player.blind_posted
                if call_amount > 0:
                    action, _ = self.process_action(player, ActionType.CALL, self.bb)
                    actions.append(action)
            else:
                # BB checks
                action, _ = self.process_action(player, ActionType.CHECK)
                actions.append(action)

        self.street_actions['preflop']['base'] = actions
        self.street_actions['preflop']['more1'] = []
        self.street_actions['preflop']['more2'] = []

        # Reset street contributions for next street
        for p in self.players:
            p.street_contribution = 0

    def generate_preflop_with_extended(self):
        """Generate preflop with extended actions"""
        actions_base = []
        actions_more1 = []
        actions_more2 = []

        # Get action order
        action_order = self.get_preflop_action_order(self.players)

        # BASE ROUND: Initial raise and responses
        current_bet = self.bb

        # First player raises
        raiser = action_order[0]
        raise_amount = self.bb * random.randint(3, 5)  # 3-5 BB
        action, actual_raise = self.process_action(raiser, ActionType.RAISE, raise_amount)
        actions_base.append(action)
        current_bet = actual_raise  # Use actual amount

        # Second player re-raises
        reraiser = action_order[1]
        reraise_amount = current_bet + (self.bb * random.randint(3, 6))
        action, actual_reraise = self.process_action(reraiser, ActionType.RAISE, reraise_amount)
        actions_base.append(action)
        current_bet = actual_reraise  # Use actual amount

        # Remaining players call or fold
        for player in action_order[2:]:
            if random.random() < 0.7:  # 70% call
                action, _ = self.process_action(player, ActionType.CALL, current_bet)
            else:
                action, _ = self.process_action(player, ActionType.FOLD)
            actions_base.append(action)

        # EXTENDED ACTION 1: Original raiser responds
        # Find first player who needs to act (original raiser)
        active_players = [p for p in self.players if not p.folded]

        if len(active_players) >= 2:
            # Original raiser (first to act) responds
            if random.random() < 0.5:  # 50% re-raise again
                new_raise = current_bet + (self.bb * random.randint(3, 6))
                action, actual_new_raise = self.process_action(raiser, ActionType.RAISE, new_raise)
                actions_more1.append(action)
                current_bet = actual_new_raise  # Use actual amount

                # Other players respond
                for player in active_players[1:]:
                    if player.name == raiser.name:
                        continue
                    if random.random() < 0.6:  # 60% call
                        action, _ = self.process_action(player, ActionType.CALL, current_bet)
                    else:
                        action, _ = self.process_action(player, ActionType.FOLD)
                    actions_more1.append(action)

                # EXTENDED ACTION 2: Only call/fold allowed
                active_players = [p for p in self.players if not p.folded]
                if len(active_players) >= 2:
                    # First player to act can only call or fold
                    responder = active_players[0]
                    if random.random() < 0.8:  # 80% call
                        action, _ = self.process_action(responder, ActionType.CALL, current_bet)
                    else:
                        action, _ = self.process_action(responder, ActionType.FOLD)
                    actions_more2.append(action)

                    # Other players respond (call/fold only)
                    for player in active_players[1:]:
                        if player.name == responder.name:
                            continue
                        # Skip last aggressor
                        if player.street_contribution == current_bet:
                            continue
                        if random.random() < 0.7:  # 70% call
                            action, _ = self.process_action(player, ActionType.CALL, current_bet)
                        else:
                            action, _ = self.process_action(player, ActionType.FOLD)
                        actions_more2.append(action)
            else:
                # Original raiser just calls
                action, _ = self.process_action(raiser, ActionType.CALL, current_bet)
                actions_more1.append(action)

        self.street_actions['preflop']['base'] = actions_base
        self.street_actions['preflop']['more1'] = actions_more1
        self.street_actions['preflop']['more2'] = actions_more2

        # Reset street contributions for next street
        for p in self.players:
            p.street_contribution = 0

    def generate_postflop_with_extended(self, street_name):
        """Generate postflop street (flop/turn/river) with extended actions"""
        actions_base = []
        actions_more1 = []
        actions_more2 = []

        active_players = [p for p in self.players if not p.folded and p.current_stack > 0]
        if len(active_players) < 2:
            return  # Hand over

        # Get correct postflop action order
        action_order = self.get_postflop_action_order(active_players)

        # BASE ROUND: Bet and raise
        # First player bets
        bettor = action_order[0]
        bet_amount = int(self.bb * random.randint(5, 10))
        action, actual_bet = self.process_action(bettor, ActionType.BET, bet_amount)
        actions_base.append(action)
        current_bet = actual_bet  # Use actual amount

        # Second player raises (or calls if can't raise properly)
        raiser = action_order[1]
        raise_amount = current_bet + int(self.bb * random.randint(5, 10))

        # Check if player has enough to raise properly
        additional_needed = raise_amount - raiser.street_contribution
        if additional_needed > raiser.current_stack:
            # Player doesn't have enough to raise - check if they can at least call
            call_additional = current_bet - raiser.street_contribution
            if call_additional < raiser.current_stack:
                # Can call
                action, actual_amount = self.process_action(raiser, ActionType.CALL, current_bet)
            else:
                # All-in for less than call (will be handled by process_action)
                action, actual_amount = self.process_action(raiser, ActionType.CALL, current_bet)
            actions_base.append(action)
            # current_bet stays the same
        else:
            # Can raise properly
            action, actual_raise = self.process_action(raiser, ActionType.RAISE, raise_amount)
            actions_base.append(action)
            current_bet = actual_raise  # Update current_bet

        # Other players respond (in correct action order)
        for player in action_order[2:]:
            if random.random() < 0.6:  # 60% call
                action, _ = self.process_action(player, ActionType.CALL, current_bet)
            else:
                action, _ = self.process_action(player, ActionType.FOLD)
            actions_base.append(action)

        # EXTENDED ACTION 1: Original bettor responds
        active_players = [p for p in self.players if not p.folded and p.current_stack > 0]

        if len(active_players) >= 2:
            if random.random() < 0.4:  # 40% re-raise
                new_raise = current_bet + int(self.bb * random.randint(5, 10))
                action, actual_new_raise = self.process_action(bettor, ActionType.RAISE, new_raise)
                actions_more1.append(action)
                current_bet = actual_new_raise  # Use actual amount

                # Other players respond
                for player in active_players[1:]:
                    if player.name == bettor.name:
                        continue
                    if random.random() < 0.6:  # 60% call
                        action, _ = self.process_action(player, ActionType.CALL, current_bet)
                    else:
                        action, _ = self.process_action(player, ActionType.FOLD)
                    actions_more1.append(action)

                # EXTENDED ACTION 2: Only call/fold
                active_players = [p for p in self.players if not p.folded and p.current_stack > 0]
                if len(active_players) >= 2:
                    # Get correct action order for extended action 2
                    action_order_ext2 = self.get_postflop_action_order(active_players)
                    responder = action_order_ext2[0]
                    if random.random() < 0.7:  # 70% call
                        action, _ = self.process_action(responder, ActionType.CALL, current_bet)
                    else:
                        action, _ = self.process_action(responder, ActionType.FOLD)
                    actions_more2.append(action)
            else:
                # Original bettor calls
                action, _ = self.process_action(bettor, ActionType.CALL, current_bet)
                actions_more1.append(action)

        self.street_actions[street_name]['base'] = actions_base
        self.street_actions[street_name]['more1'] = actions_more1
        self.street_actions[street_name]['more2'] = actions_more2

        # Reset street contributions
        for p in self.players:
            p.street_contribution = 0

    def generate_postflop_simple(self, street_name):
        """Generate simple postflop street (bet/call, no extended actions)"""
        actions_base = []

        active_players = [p for p in self.players if not p.folded and p.current_stack > 0]
        if len(active_players) < 2:
            return  # Hand over

        # Simple bet/call sequence
        action_order = self.get_postflop_action_order(active_players)

        # First player bets
        bettor = action_order[0]
        bet_amount = int(self.bb * random.randint(4, 8))
        action, actual_bet = self.process_action(bettor, ActionType.BET, bet_amount)
        actions_base.append(action)
        current_bet = actual_bet

        # Everyone else calls or folds
        for player in action_order[1:]:
            if random.random() < 0.8:  # 80% call
                action, _ = self.process_action(player, ActionType.CALL, current_bet)
            else:
                action, _ = self.process_action(player, ActionType.FOLD)
            actions_base.append(action)

        self.street_actions[street_name]['base'] = actions_base
        self.street_actions[street_name]['more1'] = []
        self.street_actions[street_name]['more2'] = []

        # Reset street contributions
        for p in self.players:
            p.street_contribution = 0

    def generate_actions_html_with_extended(self) -> str:
        """Generate actions HTML with Base/More1/More2 sections"""
        html = '            <div class="section-title">Actions</div>\n'
        html += '            <div class="actions-section">\n'

        # Preflop
        html += self.generate_street_html_extended('preflop')

        # Flop
        if len([p for p in self.players if not p.folded]) >= 2:
            cards = ' '.join(self.board_cards['Flop'])
            html += self.generate_street_html_extended('flop', cards)

        # Turn
        if self.go_to_river and len([p for p in self.players if not p.folded]) >= 2:
            cards = self.board_cards['Turn'][0]
            html += self.generate_street_html_extended('turn', cards)

        # River
        if self.go_to_river and len([p for p in self.players if not p.folded]) >= 2:
            cards = self.board_cards['River'][0]
            html += self.generate_street_html_extended('river', cards)

        html += '            </div>\n\n'
        return html

    def generate_street_html_extended(self, street_name, cards=None):
        """Generate HTML for one street with Base/More1/More2 sections"""
        html = ""

        # Base section
        if self.street_actions[street_name]['base']:
            html += '                <div class="street-block">\n'
            html += f'                    <div class="street-name">{street_name.title()} Base'
            if cards:
                html += f' ({cards})'
            html += '</div>\n'

            for action in self.street_actions[street_name]['base']:
                html += f'                    {action.to_html()}\n'

            html += '                </div>\n'

        # More 1 section
        if self.street_actions[street_name]['more1']:
            html += '                <div class="street-block">\n'
            html += f'                    <div class="street-name">{street_name.title()} More 1</div>\n'

            for action in self.street_actions[street_name]['more1']:
                html += f'                    {action.to_html()}\n'

            html += '                </div>\n'

        # More 2 section
        if self.street_actions[street_name]['more2']:
            html += '                <div class="street-block">\n'
            html += f'                    <div class="street-name">{street_name.title()} More 2</div>\n'

            for action in self.street_actions[street_name]['more2']:
                html += f'                    {action.to_html()}\n'

            html += '                </div>\n'

        return html

    def generate_html(self) -> str:
        """Override parent's generate_html to use extended action sections"""
        # Build stack setup
        stack_lines = []
        for p in self.players:
            if p.position in ["Dealer", "SB", "BB"]:
                stack_lines.append(f"{p.name} {p.position} {p.starting_stack}")
            else:
                stack_lines.append(f"{p.name} {p.starting_stack}")

        stack_str = "\\n".join(stack_lines)
        stack_pre = "\n".join(stack_lines)

        # Build actions using extended format (Base/More1/More2 sections)
        actions_html = self.generate_actions_html_with_extended()

        # Calculate pot and results
        pot_results = self.calculate_pot_and_results()
        results_html = self.generate_results_html(pot_results)

        # Build next hand
        next_hand = self.rotate_button_for_next_hand()
        next_lines = []
        for p in next_hand:
            if p['position'] in ["Dealer", "SB", "BB"]:
                next_lines.append(f"{p['name']} {p['position']} {p['stack']}")
            else:
                next_lines.append(f"{p['name']} {p['stack']}")

        next_str = "\\n".join(next_lines)
        next_pre = "\n".join(next_lines)

        # Validation status
        validation_errors = self.validate_test_case()
        validation_html = ""
        if validation_errors:
            validation_html = '<div style="background: #ffebee; border: 2px solid #f44336; padding: 10px; margin: 10px 0; border-radius: 4px;">\n'
            validation_html += '<strong style="color: #c62828;">❌ VALIDATION ERRORS:</strong><ul>\n'
            for error in validation_errors:
                validation_html += f'<li style="color: #c62828;">{error}</li>\n'
            validation_html += '</ul></div>\n'
        else:
            validation_html = '<div style="background: #e8f5e9; border: 2px solid #4caf50; padding: 10px; margin: 10px 0; border-radius: 4px;">\n'
            validation_html += '<strong style="color: #2e7d32;">✅ ALL VALIDATIONS PASSED</strong>\n'
            validation_html += '</div>\n'

        # Determine test case description
        test_desc = f"{self.num_players}P {self.complexity} - Extended Actions (SB:{self.sb:,} BB:{self.bb:,})"

        html = f'''
        <!-- TEST CASE {self.tc_num} -->
        <div class="test-case">
            <div class="test-header" onclick="toggleTestCase(this)">
                <div>
                    <div class="test-id">TC-{self.tc_num}</div>
                    <div class="test-name">{test_desc}</div>
                </div>
                <div class="badges">
                    <span class="badge {self.complexity.lower()}">{self.complexity}</span>
                    <span class="collapse-icon collapsed">▶</span>
                </div>
            </div>

            <div class="test-content collapsed">
            {validation_html}

            <div class="section-title">Stack Setup</div>
            <div class="blind-setup">
                <div class="blind-item"><label>Small Blind</label><div class="value">{self.sb:,}</div></div>
                <div class="blind-item"><label>Big Blind</label><div class="value">{self.bb:,}</div></div>
                <div class="blind-item"><label>Ante</label><div class="value">{self.ante:,}</div></div>
                <div class="blind-item"><label>Ante Order</label><div class="value">BB First</div></div>
            </div>

            <div class="copy-instruction">📋 Copy and paste this into the app:</div>
            <button class="copy-btn" onclick="copyPlayerData(this, `Hand ({self.tc_num})\\nstarted_at: 00:02:30 ended_at: 00:05:40\\nSB {self.sb} BB {self.bb} Ante {self.ante}\\nStack Setup:\\n{stack_str}`)">
                <span>📋</span> Copy Player Data
            </button>
            <div class="player-data-box">
<pre>Hand ({self.tc_num})
started_at: 00:02:30 ended_at: 00:05:40
SB {self.sb} BB {self.bb} Ante {self.ante}
Stack Setup:
{stack_pre}</pre>
            </div>

{actions_html}

{results_html}

            <div class="next-hand-preview">
                <div class="next-hand-title">🔄 Next Hand Setup:</div>
                <button class="copy-btn" onclick="copyPlayerData(this, `Hand ({self.tc_num + 1})\\nstarted_at: 00:05:40 ended_at: 00:08:50\\nSB {self.sb} BB {self.bb} Ante {self.ante}\\nStack Setup:\\n{next_str}`)">
                    <span>📋</span> Copy Next Hand
                </button>
                <div class="player-data-box">
<pre>Hand ({self.tc_num + 1})
started_at: 00:05:40 ended_at: 00:08:50
SB {self.sb} BB {self.bb} Ante {self.ante}
Stack Setup:
{next_pre}</pre>
                </div>
            </div>
            </div>
        </div>
        '''
        return html

    def generate(self) -> str:
        """Generate complete test case with extended actions"""
        # Create players
        self.players = self.create_players()

        # Post blinds and antes
        self.post_blinds_antes()

        # ALWAYS generate Preflop (required)
        if 'preflop' in self.extended_streets:
            self.generate_preflop_with_extended()
        else:
            self.generate_preflop_simple()

        # Postflop streets - generate ALL streets in order, not just extended ones
        # Streets must follow proper order: Preflop → Flop → Turn → River
        streets_to_generate = []

        # Determine which streets to generate based on extended_streets and go_to_river
        if any(s in self.extended_streets for s in ['flop', 'turn', 'river']):
            # Find the highest street we need
            max_street_idx = -1
            street_order = ['flop', 'turn', 'river']
            for i, street in enumerate(street_order):
                if street in self.extended_streets:
                    max_street_idx = i

            # Generate all streets up to and including the highest extended street
            if max_street_idx >= 0:
                streets_to_generate = street_order[:max_street_idx + 1]

        # If go_to_river is True, generate all streets
        if self.go_to_river:
            streets_to_generate = ['flop', 'turn', 'river']

        # Generate each street (with extended or simple actions)
        for street in streets_to_generate:
            if street in self.extended_streets:
                self.generate_postflop_with_extended(street)
            else:
                # Generate simple version of this street
                self.generate_postflop_simple(street)

        # Determine winner (player with most chips remaining)
        active_players = [p for p in self.players if not p.folded]
        if active_players:
            self.winner_idx = self.players.index(max(active_players, key=lambda p: p.current_stack))

        # Call generate_html which now uses extended format
        html = self.generate_html()

        return html


# Test case configurations
EXTENDED_TEST_CASES = [
    # TC-41: Preflop extended actions
    {
        'tc_num': 41,
        'num_players': 3,
        'complexity': 'Simple',
        'extended_streets': ['preflop'],
        'go_to_river': False
    },
    # TC-42: Flop extended actions
    {
        'tc_num': 42,
        'num_players': 3,
        'complexity': 'Simple',
        'extended_streets': ['flop'],
        'go_to_river': False
    },
    # TC-43: Turn extended actions
    {
        'tc_num': 43,
        'num_players': 3,
        'complexity': 'Medium',
        'extended_streets': ['turn'],
        'go_to_river': True
    },
    # TC-44: River extended actions
    {
        'tc_num': 44,
        'num_players': 3,
        'complexity': 'Medium',
        'extended_streets': ['river'],
        'go_to_river': True
    },
    # TC-45: Preflop + Flop extended actions
    {
        'tc_num': 45,
        'num_players': 4,
        'complexity': 'Medium',
        'extended_streets': ['preflop', 'flop'],
        'go_to_river': False
    },
    # TC-46: Preflop + Turn extended actions
    {
        'tc_num': 46,
        'num_players': 4,
        'complexity': 'Medium',
        'extended_streets': ['preflop', 'turn'],
        'go_to_river': True
    },
    # TC-47: Flop + River extended actions
    {
        'tc_num': 47,
        'num_players': 3,
        'complexity': 'Complex',
        'extended_streets': ['flop', 'river'],
        'go_to_river': True
    },
    # TC-48: All streets with extended actions
    {
        'tc_num': 48,
        'num_players': 4,
        'complexity': 'Complex',
        'extended_streets': ['preflop', 'flop', 'turn', 'river'],
        'go_to_river': True
    },
    # TC-49: Preflop extended with 4 players
    {
        'tc_num': 49,
        'num_players': 4,
        'complexity': 'Simple',
        'extended_streets': ['preflop'],
        'go_to_river': False
    },
    # TC-50: Turn extended with side pots
    {
        'tc_num': 50,
        'num_players': 3,
        'complexity': 'Complex',
        'extended_streets': ['turn'],
        'go_to_river': True,
        'require_side_pot': True
    }
]


def main():
    print("=" * 80)
    print("GENERATING 10 TEST CASES WITH EXTENDED ACTIONS")
    print("=" * 80)
    print()

    all_html = []

    for tc_config in EXTENDED_TEST_CASES:
        print(f"Generating TC-{tc_config['tc_num']}: {tc_config['num_players']}P {tc_config['complexity']} - Extended on {', '.join(tc_config['extended_streets'])}")

        gen = ExtendedActionGenerator(**tc_config)
        html = gen.generate()
        all_html.append(html)

        print(f"  [OK] Generated TC-{tc_config['tc_num']}")
        print()

    # Write to file
    output_file = 'C:\\Apps\\HUDR\\HHTool_Modular\\docs\\QA\\10_Extended_Action_TestCases.html'

    # Combine all test cases
    full_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>10 Extended Action Test Cases</title>
    <!-- Include same CSS as 40_TestCases_v2.html -->
</head>
<body>
    <div class="container">
        <h1>10 Extended Action Test Cases</h1>
        <div class="subtitle">Test cases with raise/re-raise sequences (Extended Actions)</div>
"""

    full_html += '\n'.join(all_html)

    full_html += """
    </div>
</body>
</html>"""

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(full_html)

    print("=" * 80)
    print(f"Generated {len(EXTENDED_TEST_CASES)} test cases")
    print(f"Output: {output_file}")
    print("=" * 80)


if __name__ == '__main__':
    main()
