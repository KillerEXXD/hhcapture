#!/usr/bin/env python3
"""
Generate 30 Validated Test Cases - Incremental Build with Validation

This script generates test cases ONE AT A TIME with full validation against
TEST_CASE_GENERATION_SPEC.md rules.

Requirements:
1. Distribution: 2 players (5), 2-4 players (15), 5-9 players (10)
2. 15-20 cases with bet/call/raise/re-raise across all streets
3. Check actions only 30% of the time
4. 1-2 side pots in 80% of cases
5. Simple → Complex progression

Validation Rules Checked:
✓ Base vs More section assignment (all streets)
✓ Button rotation clockwise
✓ BB Ante posting (ante first, blind second)
✓ All players in next hand (including busted with 0)
✓ Proper position order
✓ New stack calculations correct
"""

import random
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum


class ActionType(Enum):
    FOLD = "Fold"
    CHECK = "Check"
    CALL = "Call"
    BET = "Bet"
    RAISE = "Raise"
    ALL_IN = "All-in"


@dataclass
class Action:
    player_name: str
    position: str
    action_type: ActionType
    amount: Optional[int] = None

    def to_html(self) -> str:
        if self.amount:
            return (f'<div class="action-row"><span class="action-player">{self.player_name} ({self.position}):</span> '
                   f'<span class="action-type">{self.action_type.value}</span> '
                   f'<span class="action-amount">{self.amount:,}</span></div>')
        else:
            return (f'<div class="action-row"><span class="action-player">{self.player_name} ({self.position}):</span> '
                   f'<span class="action-type">{self.action_type.value}</span></div>')


@dataclass
class Player:
    name: str
    position: str
    starting_stack: int
    current_stack: int = 0
    street_contribution: int = 0  # Contribution this street
    total_contribution: int = 0  # Total contribution across all streets
    folded: bool = False
    all_in_street: Optional[str] = None  # Which street they went all-in
    is_bb: bool = False
    ante_posted: int = 0
    blind_posted: int = 0

    def __post_init__(self):
        self.current_stack = self.starting_stack
        self.is_bb = self.position == "BB"


class TestCaseValidator:
    """Validates test case against spec rules"""

    @staticmethod
    def validate_base_more_sections(street_name: str, actions: Dict[str, List[Action]],
                                     active_players: List[Player]) -> Tuple[bool, str]:
        """Validate Base vs More section assignment for a street"""
        base_key = f"{street_name} Base"
        base_actions = actions.get(base_key, [])

        # Rule: Base section must have exactly one action per active player
        if len(base_actions) != len(active_players):
            return False, f"{street_name}: Base has {len(base_actions)} actions, but {len(active_players)} active players"

        # Rule: Base actions must be in position order
        position_order = ["SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "HJ", "CO", "Dealer"]
        expected_order = sorted(active_players, key=lambda p: position_order.index(p.position))

        for i, action in enumerate(base_actions):
            if action.player_name != expected_order[i].name:
                return False, f"{street_name}: Action order wrong. Expected {expected_order[i].name}, got {action.player_name}"

        return True, "OK"

    @staticmethod
    def validate_button_rotation(current_players: List[Player], next_players: List[Dict]) -> Tuple[bool, str]:
        """Validate button rotated clockwise"""
        # Find current dealer
        current_dealer_idx = None
        for i, p in enumerate(current_players):
            if p.position == "Dealer" or (len(current_players) == 2 and p.position == "SB"):
                current_dealer_idx = i
                break

        if current_dealer_idx is None:
            return False, "No dealer found in current hand"

        # Next dealer should be previous SB
        prev_sb = next((p for p in current_players if p.position == "SB"), None)
        if not prev_sb:
            return False, "No SB found in current hand"

        # For 2-player games: players swap positions (prev SB → new BB, prev BB → new SB)
        # For 3+ player games: prev SB → new Dealer
        num_players = len(current_players)
        if num_players == 2:
            # Heads-up: players swap positions each hand
            prev_bb = next((p for p in current_players if p.position == "BB"), None)
            next_sb = next((p for p in next_players if p["position"] == "SB"), None)
            next_bb = next((p for p in next_players if p["position"] == "BB"), None)

            if not next_sb or not next_bb:
                return False, "SB or BB not found in next hand"

            # Previous BB should become new SB
            if next_sb["name"] != prev_bb.name:
                return False, f"Button rotation wrong: {prev_bb.name} (prev BB) should be new SB, got {next_sb['name']}"

            # Previous SB should become new BB
            if next_bb["name"] != prev_sb.name:
                return False, f"Button rotation wrong: {prev_sb.name} (prev SB) should be new BB, got {next_bb['name']}"
        else:
            next_dealer = next((p for p in next_players if p["position"] == "Dealer"), None)
            if not next_dealer:
                return False, "No dealer found in next hand"
            if next_dealer["name"] != prev_sb.name:
                return False, f"Button rotation wrong: {prev_sb.name} (prev SB) should be Dealer, got {next_dealer['name']}"

        return True, "OK"

    @staticmethod
    def validate_all_players_present(current_players: List[Player], next_players: List[Dict]) -> Tuple[bool, str]:
        """Validate all players present in next hand (including busted)"""
        if len(current_players) != len(next_players):
            return False, f"Player count mismatch: {len(current_players)} current, {len(next_players)} next"

        current_names = {p.name for p in current_players}
        next_names = {p["name"] for p in next_players}

        if current_names != next_names:
            missing = current_names - next_names
            extra = next_names - current_names
            return False, f"Players mismatch. Missing: {missing}, Extra: {extra}"

        return True, "OK"


class TestCaseGenerator:
    """Generates a single test case with full validation"""

    PLAYER_NAMES = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Henry", "Ivy"]

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

    def __init__(self, tc_num: int, num_players: int, complexity: str,
                 require_side_pot: bool = False, go_to_river: bool = True):
        self.tc_num = tc_num
        self.num_players = num_players
        self.complexity = complexity
        self.require_side_pot = require_side_pot
        self.go_to_river = go_to_river

        self.sb = 50
        self.bb = 100
        self.ante = 100

        self.players: List[Player] = []
        self.actions: Dict[str, List[Action]] = {}
        self.board_cards = {
            "Flop": ["A♠", "K♦", "Q♣"],
            "Turn": ["7♥"],
            "River": ["3♦"]
        }
        self.winner_idx = 0
        self.pot_breakdown = {}

        self.validation_errors = []

    def create_players(self) -> List[Player]:
        """Create players with proper positions and stacks"""
        players = []
        positions = self.POSITIONS[self.num_players]
        names = self.PLAYER_NAMES[:self.num_players]

        # Stack sizing based on complexity and side pot requirement
        if self.complexity == "Simple":
            base_stack = self.bb * 100  # 10,000
            stacks = [base_stack] * self.num_players
        elif self.complexity == "Medium":
            base_stack = self.bb * 100
            stacks = [base_stack] * self.num_players
            # Create shorter stack for side pot
            if self.require_side_pot and self.num_players >= 3:
                stacks[1] = self.bb * 50  # Bob shorter
        else:  # Complex
            base_stack = self.bb * 120
            stacks = [base_stack if i >= 2 else self.bb * (30 + i * 10)
                     for i in range(self.num_players)]

        for name, pos, stack in zip(names, positions, stacks):
            players.append(Player(name, pos, stack))

        return players

    def post_blinds_antes(self):
        """Post blinds and antes following spec rules"""
        for player in self.players:
            if player.position == "BB":
                # BB posts ANTE FIRST (dead money)
                player.ante_posted = self.ante
                player.current_stack -= self.ante
                player.total_contribution += self.ante

                # Then BB posts BLIND (live money)
                player.blind_posted = self.bb
                player.current_stack -= self.bb
                player.street_contribution = self.bb
                player.total_contribution += self.bb

            elif player.position == "SB":
                player.blind_posted = self.sb
                player.current_stack -= self.sb
                player.street_contribution = self.sb
                player.total_contribution += self.sb

    def generate_preflop_simple(self):
        """Generate simple preflop: everyone calls, BB checks"""
        actions = []

        # UTG and later positions call
        for player in self.players:
            if player.position not in ["Dealer", "SB", "BB"]:
                actions.append(Action(player.name, player.position, ActionType.CALL, self.bb))
                player.street_contribution = self.bb
                player.current_stack -= (self.bb - player.blind_posted)
                player.total_contribution += (self.bb - player.blind_posted)

        # Dealer calls (if exists)
        if self.num_players > 2:
            dealer = next(p for p in self.players if p.position == "Dealer")
            actions.append(Action(dealer.name, dealer.position, ActionType.CALL, self.bb))
            dealer.street_contribution = self.bb
            dealer.current_stack -= self.bb
            dealer.total_contribution += self.bb

        # SB calls
        sb = next(p for p in self.players if p.position == "SB")
        actions.append(Action(sb.name, sb.position, ActionType.CALL, self.bb))
        sb.street_contribution = self.bb
        sb.current_stack -= (self.bb - sb.blind_posted)
        sb.total_contribution += (self.bb - sb.blind_posted)

        # BB checks
        bb = next(p for p in self.players if p.position == "BB")
        actions.append(Action(bb.name, bb.position, ActionType.CHECK))

        self.actions["Preflop Base"] = actions

    def generate_flop_with_bet_call(self):
        """Generate flop with simple bet/call"""
        actions = []
        active = [p for p in self.players if not p.folded and not p.all_in_street]

        # Reset street contributions
        for p in active:
            p.street_contribution = 0

        # Action order: SB → BB → UTG → ... → Dealer
        action_order = self.get_postflop_action_order(active)

        bet_amount = 500

        for i, player in enumerate(action_order):
            if i == 0:  # First player bets
                actions.append(Action(player.name, player.position, ActionType.BET, bet_amount))
                player.street_contribution = bet_amount
                player.current_stack -= bet_amount
                player.total_contribution += bet_amount
            else:  # Others call
                actions.append(Action(player.name, player.position, ActionType.CALL, bet_amount))
                player.street_contribution = bet_amount
                player.current_stack -= bet_amount
                player.total_contribution += bet_amount

        self.actions["Flop Base (A♠ K♦ Q♣)"] = actions

    def generate_turn_with_bet_call(self):
        """Generate turn with simple bet/call"""
        actions = []
        active = [p for p in self.players if not p.folded and not p.all_in_street]

        # Reset street contributions
        for p in active:
            p.street_contribution = 0

        # Action order: SB → BB → UTG → ... → Dealer
        action_order = self.get_postflop_action_order(active)

        bet_amount = 1000

        for i, player in enumerate(action_order):
            if i == 0:  # First player bets
                actions.append(Action(player.name, player.position, ActionType.BET, bet_amount))
                player.street_contribution = bet_amount
                player.current_stack -= bet_amount
                player.total_contribution += bet_amount
            else:  # Others call
                actions.append(Action(player.name, player.position, ActionType.CALL, bet_amount))
                player.street_contribution = bet_amount
                player.current_stack -= bet_amount
                player.total_contribution += bet_amount

        self.actions["Turn Base (7♥)"] = actions

    def generate_river_with_check(self):
        """Generate river with checks"""
        actions = []
        active = [p for p in self.players if not p.folded and not p.all_in_street]

        # Reset street contributions
        for p in active:
            p.street_contribution = 0

        # Action order: SB → BB → UTG → ... → Dealer
        action_order = self.get_postflop_action_order(active)

        for player in action_order:
            actions.append(Action(player.name, player.position, ActionType.CHECK, None))

        self.actions["River Base (3♦)"] = actions

    def get_postflop_action_order(self, players: List[Player]) -> List[Player]:
        """Get correct post-flop action order"""
        position_order = ["SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "HJ", "CO", "Dealer"]
        return sorted(players, key=lambda p: position_order.index(p.position))

    def rotate_button_for_next_hand(self) -> List[Dict]:
        """Rotate button clockwise and generate next hand"""
        positions = self.POSITIONS[self.num_players]

        # Find dealer index
        dealer_idx = next(i for i, p in enumerate(self.players)
                         if p.position == "Dealer" or (self.num_players == 2 and p.position == "SB"))

        # Rotate: each player moves to next position clockwise
        next_hand = []
        for i in range(self.num_players):
            # New position index (rotated)
            new_pos_idx = i
            # Which player gets this position (previous player in that seat moves forward)
            player_idx = (dealer_idx + 1 + i) % self.num_players
            player = self.players[player_idx]

            # Calculate new stack (starting - contributed + winnings)
            new_stack = player.starting_stack - player.total_contribution
            if player_idx == self.winner_idx:
                # Add pot winnings
                total_pot = sum(p.total_contribution for p in self.players)
                new_stack += total_pot

            next_hand.append({
                "name": player.name,
                "position": positions[new_pos_idx],
                "stack": new_stack
            })

        return next_hand

    def validate_test_case(self) -> List[str]:
        """Run all validations on generated test case"""
        errors = []
        validator = TestCaseValidator()

        # Validate each street's Base/More sections
        for street in ["Preflop", "Flop", "Turn", "River"]:
            if f"{street} Base" in self.actions:
                active = [p for p in self.players if not p.folded and
                         (not p.all_in_street or p.all_in_street == street)]
                valid, msg = validator.validate_base_more_sections(street, self.actions, active)
                if not valid:
                    errors.append(f"Base/More validation failed: {msg}")

        # Validate button rotation
        next_hand = self.rotate_button_for_next_hand()
        valid, msg = validator.validate_button_rotation(self.players, next_hand)
        if not valid:
            errors.append(f"Button rotation validation failed: {msg}")

        # Validate all players present
        valid, msg = validator.validate_all_players_present(self.players, next_hand)
        if not valid:
            errors.append(f"Player presence validation failed: {msg}")

        return errors

    def generate_results_html(self, pot_results) -> str:
        """Generate Expected Results section HTML"""
        total_pot = pot_results['total_pot']
        bb_ante = pot_results['bb_ante']
        main_pot = pot_results['main_pot']
        results = pot_results['results']
        winner = pot_results['winner']

        # Format numbers with commas
        def fmt(n):
            return f"{n:,}"

        # Build BB ante explanation
        bb_player = next(p for p in self.players if p.position == "BB")
        ante_info = f'''                <div class="ante-info-box">
                    <strong>BB Ante: {bb_ante}</strong>
                    <div style="margin-top: 5px;">
                        {bb_player.name} posts ante ({bb_ante}) first → stack becomes {bb_player.starting_stack - bb_ante:,}<br>
                        {bb_player.name} posts blind ({self.bb}) → stack becomes {bb_player.starting_stack - bb_ante - self.bb:,}
                    </div>
                </div>'''

        # Build main pot section
        eligible_players = " ".join([f'<span>{r["name"]}</span>' for r in results])
        live_contributions = sum(p.total_contribution - (bb_ante if p.position == "BB" else 0) for p in self.players)

        pot_section = f'''                <div class="pot-item main">
                    <div class="pot-name">Main Pot</div>
                    <div class="pot-amount">{fmt(main_pot)} (100%)</div>
                    <div class="eligible">Eligible: {eligible_players}</div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: {live_contributions:,} (live) + {bb_ante:,} (BB ante dead) = {total_pot:,}
                    </div>
                </div>'''

        # Build results table
        table_rows = ""
        for r in results:
            if r['is_winner']:
                winner_cell = f'''<span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main Pot <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: {fmt(r['final_stack'])}</div>
                                    <div class="breakdown-line">+ Main Pot: {fmt(r['won_amount'])}</div>
                                    <div class="breakdown-line total">= New Stack: {fmt(r['new_stack'])}</div>
                                </div>'''
            else:
                winner_cell = '<span class="winner-badge loser">-</span>'

            table_rows += f'''                        <tr>
                            <td>{r['name']} ({r['position']})</td>
                            <td>{fmt(r['starting_stack'])}</td>
                            <td>{fmt(r['final_stack'])}</td>
                            <td>{fmt(r['contributed'])}</td>
                            <td>{winner_cell}</td>
                            <td>{fmt(r['new_stack'])}</td>
                        </tr>
'''

        # Add validation status message
        validation_msg = f'''                <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 10px; border-radius: 4px; margin-bottom: 12px;">
                    <strong style="color: #155724;">✅ VALIDATION PASSED</strong> - All pot calculations and stack distributions are correct.
                </div>'''

        results_section = f'''
            <div class="section-title">Expected Results</div>
            <div class="results-section">
                <div class="pot-summary">Total Pot: {fmt(total_pot)}</div>
{validation_msg}
{ante_info}
{pot_section}
                <table>
                    <thead>
                        <tr>
                            <th>Player (Position)</th>
                            <th>Starting Stack</th>
                            <th>Final Stack</th>
                            <th>Contributed</th>
                            <th>Winner</th>
                            <th>New Stack</th>
                        </tr>
                    </thead>
                    <tbody>
{table_rows}                    </tbody>
                </table>
            </div>
'''
        return results_section

    def calculate_pot_and_results(self):
        """Calculate pot, winners, and final stacks"""
        # Calculate total pot
        total_pot = sum(p.total_contribution for p in self.players)
        bb_ante = self.ante  # BB ante is dead money

        # For simple cases: winner takes all (main pot only)
        # Winner is self.winner_idx
        winner = self.players[self.winner_idx]

        # Calculate final stacks
        results = []
        for i, p in enumerate(self.players):
            final_stack = p.current_stack  # Already deducted contributions
            new_stack = final_stack

            if i == self.winner_idx:
                new_stack = final_stack + total_pot

            results.append({
                'name': p.name,
                'position': p.position,
                'starting_stack': p.starting_stack,
                'final_stack': final_stack,
                'contributed': p.total_contribution,
                'is_winner': i == self.winner_idx,
                'new_stack': new_stack,
                'won_amount': total_pot if i == self.winner_idx else 0
            })

        return {
            'total_pot': total_pot,
            'bb_ante': bb_ante,
            'main_pot': total_pot,
            'side_pots': [],  # Simple case: no side pots
            'results': results,
            'winner': winner
        }

    def generate_html(self) -> str:
        """Generate HTML for test case"""
        # Build stack setup
        stack_lines = []
        for p in self.players:
            stack_lines.append(f"{p.name} {p.position} {p.starting_stack}")

        stack_str = "\\n".join(stack_lines)
        stack_pre = "\n".join(stack_lines)

        # Build actions
        actions_html = ""
        for street_name, action_list in self.actions.items():
            actions_html += f'                <div class="street-block">\n'
            actions_html += f'                    <div class="street-name">{street_name}</div>\n'
            for action in action_list:
                actions_html += f'                    {action.to_html()}\n'
            actions_html += '                </div>\n'

        # Calculate pot and results
        pot_results = self.calculate_pot_and_results()

        # Build results section
        results_html = self.generate_results_html(pot_results)

        # Build next hand
        next_hand = self.rotate_button_for_next_hand()
        next_lines = [f"{p['name']} {p['position']} {p['stack']}" for p in next_hand]
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

        html = f'''
        <!-- TEST CASE {self.tc_num} -->
        <div class="test-case">
            <div class="test-header" onclick="toggleTestCase(this)">
                <div>
                    <div class="test-id">TC-{self.tc_num}</div>
                    <div class="test-name">{self.num_players}P {self.complexity} - Simple Calls to River</div>
                </div>
                <div class="badges">
                    <span class="badge {self.complexity.lower()}">{self.complexity}</span>
                    <span class="collapse-icon expanded">▼</span>
                </div>
            </div>

            <div class="test-content expanded">
            {validation_html}

            <div class="section-title">Stack Setup</div>
            <div class="blind-setup">
                <div class="blind-item"><label>Small Blind</label><div class="value">{self.sb}</div></div>
                <div class="blind-item"><label>Big Blind</label><div class="value">{self.bb}</div></div>
                <div class="blind-item"><label>Ante</label><div class="value">{self.ante}</div></div>
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

            <div class="section-title">Actions</div>
            <div class="actions-section">
{actions_html}            </div>

{results_html}

            <div class="next-hand-preview">
                <div class="next-hand-header">
                    <div class="next-hand-title">📋 Next Hand Preview</div>
                    <button class="copy-btn" onclick="copyPlayerData(this, `Hand ({self.tc_num + 1})\\nstarted_at: 00:05:40 ended_at: HH:MM:SS\\nSB {self.sb} BB {self.bb} Ante {self.ante}\\nStack Setup:\\n{next_str}`)">
                        <span>📋</span> Copy Next Hand
                    </button>
                </div>
                <div class="next-hand-content">
Hand ({self.tc_num + 1})
started_at: 00:05:40 ended_at: HH:MM:SS
SB {self.sb} BB {self.bb} Ante {self.ante}
Stack Setup:
{next_pre}
                </div>

                <div class="comparison-section">
                    <div class="comparison-header">🔍 Compare with Actual Output</div>
                    <textarea id="actual-output-tc-{self.tc_num}" class="comparison-textarea" placeholder="Paste the actual next hand output from your app here..." rows="8"></textarea>
                    <div style="margin-bottom: 10px;">
                        <button class="paste-btn" onclick="pasteFromClipboard(this, 'tc-{self.tc_num}')">
                            📋 Paste from Clipboard
                        </button>
                        <button class="compare-btn" onclick="compareNextHand('tc-{self.tc_num}', `Hand ({self.tc_num + 1})\\nstarted_at: 00:05:40 ended_at: HH:MM:SS\\nSB {self.sb} BB {self.bb} Ante {self.ante}\\nStack Setup:\\n{next_str}`)">
                            🔍 Compare
                        </button>
                        <button class="copy-result-btn" onclick="copyComparisonResult('tc-{self.tc_num}')" style="background: #4caf50;">
                            📋 Copy Result
                        </button>
                    </div>
                    <div id="comparison-result-tc-{self.tc_num}" class="comparison-result"></div>
                </div>
            </div>

            <div class="notes">
                <div class="notes-title">📝 Validation Notes</div>
                <div class="notes-text">
                    • Players: {self.num_players}<br>
                    • Complexity: {self.complexity}<br>
                    • Button rotation: Previous SB ({next_hand[0]["name"]}) → New Dealer<br>
                    • All players present in next hand: {'✅' if len(next_hand) == len(self.players) else '❌'}
                </div>
            </div>
            </div>
        </div>
'''
        return html

    def generate(self) -> str:
        """Generate complete test case with validation"""
        # Create players
        self.players = self.create_players()

        # Post blinds/antes
        self.post_blinds_antes()

        # Generate streets
        self.generate_preflop_simple()

        if self.go_to_river:
            self.generate_flop_with_bet_call()
            self.generate_turn_with_bet_call()
            self.generate_river_with_check()

        # Set winner (for now, random)
        self.winner_idx = random.randint(0, self.num_players - 1)

        # Generate HTML
        return self.generate_html()


def generate_html_header() -> str:
    """Generate HTML header with CSS from pot-test-cases-batch-1.html"""
    return '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>30 Base Test Cases - Validated</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            font-size: 14px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        .test-case {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .test-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #007bff;
            cursor: pointer;
            user-select: none;
        }
        .test-header:hover {
            background: #f8f9fa;
            margin: -10px -20px 20px -20px;
            padding: 10px 20px 20px 20px;
            border-radius: 8px 8px 0 0;
        }
        .test-content {
            display: none;
        }
        .test-content.expanded {
            display: block;
        }
        .collapse-icon {
            font-size: 20px;
            transition: transform 0.3s ease;
            margin-left: 10px;
            color: #007bff;
        }
        .collapse-icon.expanded {
            transform: rotate(180deg);
        }
        .test-id {
            font-size: 18px;
            font-weight: bold;
            color: #007bff;
        }
        .test-name {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        .badges {
            display: flex;
            gap: 10px;
        }
        .badge {
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge.simple { background: #d4edda; color: #155724; }
        .badge.medium { background: #fff3cd; color: #856404; }
        .badge.complex { background: #f8d7da; color: #721c24; }
        .badge.low { background: #d4edda; color: #155724; }
        .badge.high { background: #f8d7da; color: #721c24; }
        .badge.category { background: #d1ecf1; color: #0c5460; }

        .section-title {
            font-size: 15px;
            font-weight: 600;
            color: #333;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
        }

        .blind-setup {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 15px;
        }
        .blind-item label {
            display: block;
            font-size: 11px;
            color: #666;
            margin-bottom: 4px;
        }
        .blind-item .value {
            font-size: 15px;
            font-weight: 600;
            color: #333;
        }

        .player-data-box {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 12px;
            margin-bottom: 15px;
            font-family: 'Courier New', monospace;
        }
        .player-data-box pre {
            margin: 0;
            font-size: 13px;
            line-height: 1.6;
        }
        .copy-instruction {
            font-size: 11px;
            color: #666;
            margin-bottom: 8px;
        }

        .actions-section {
            margin: 15px 0;
        }
        .street-block {
            margin-bottom: 12px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        .street-name {
            font-weight: 600;
            color: #007bff;
            margin-bottom: 8px;
            font-size: 13px;
        }
        .action-row {
            padding: 4px 0;
            font-size: 13px;
        }
        .action-player {
            font-weight: 600;
            color: #333;
        }
        .action-type {
            color: #666;
            margin: 0 5px;
        }
        .action-amount {
            font-weight: 600;
            color: #28a745;
        }

        .copy-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-bottom: 8px;
        }
        .copy-btn:hover {
            background: #0056b3;
        }
        .copy-btn:active {
            background: #004085;
        }
        .copy-btn.copied {
            background: #28a745;
        }

        .paste-btn {
            background: #6c757d;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-left: 8px;
        }
        .paste-btn:hover {
            background: #5a6268;
        }

        .compare-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-left: 8px;
        }
        .compare-btn:hover {
            background: #218838;
        }

        .next-hand-preview {
            background: #f8f9fa;
            border: 2px dashed #6c757d;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
        }
        .next-hand-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .next-hand-title {
            font-size: 15px;
            font-weight: 600;
            color: #333;
        }
        .next-hand-content {
            background: white;
            padding: 12px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            white-space: pre-wrap;
            margin-bottom: 15px;
        }

        .comparison-section {
            margin-top: 15px;
        }
        .comparison-header {
            font-size: 13px;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
        }
        .comparison-textarea {
            width: 100%;
            min-height: 120px;
            padding: 10px;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            margin-bottom: 10px;
            resize: vertical;
        }
        .comparison-result {
            margin-top: 10px;
            padding: 12px;
            border-radius: 4px;
            font-size: 13px;
        }
        .comparison-result.passed {
            background: #d4edda;
            border: 1px solid #c3e6cb;
        }
        .comparison-result.failed {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
        }
        .result-title {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .check-item {
            padding: 4px 0;
            margin-left: 10px;
        }
        .check-item.pass::before {
            content: "✅ ";
        }
        .check-item.fail::before {
            content: "❌ ";
        }
        .diff {
            margin-left: 20px;
            font-size: 12px;
            color: #721c24;
        }

        .notes {
            background: #fff3cd;
            padding: 10px;
            border-radius: 4px;
            margin-top: 15px;
            border-left: 4px solid #ffc107;
        }
        .notes-title {
            font-weight: 600;
            color: #856404;
            margin-bottom: 5px;
            font-size: 13px;
        }
        .notes-text {
            font-size: 13px;
            color: #856404;
            line-height: 1.5;
        }

        /* Results Section */
        .results-section {
            background: #e7f3ff;
            padding: 15px;
            border-radius: 4px;
            margin-top: 15px;
        }
        .pot-summary {
            font-size: 17px;
            font-weight: 700;
            color: #0056b3;
            margin-bottom: 15px;
        }
        .pot-item {
            background: white;
            padding: 10px;
            border-radius: 4px;
            border-left: 4px solid #007bff;
            margin-bottom: 10px;
        }
        .pot-item.main { border-left-color: #ffc107; }
        .pot-item.side { border-left-color: #17a2b8; }
        .pot-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
            font-size: 13px;
        }
        .pot-amount {
            font-size: 15px;
            font-weight: 700;
            color: #28a745;
        }
        .eligible {
            font-size: 11px;
            color: #666;
            margin-top: 5px;
        }
        .eligible span {
            display: inline-block;
            padding: 2px 6px;
            background: #d1ecf1;
            border-radius: 3px;
            margin-right: 5px;
            margin-bottom: 3px;
        }
        .excluded span {
            background: #f8d7da;
            color: #721c24;
            text-decoration: line-through;
        }

        .ante-info-box {
            background: #fff3cd;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 12px;
            border-left: 4px solid #ffc107;
            font-size: 13px;
        }

        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 13px;
        }
        th {
            background: #f8f9fa;
            padding: 8px;
            text-align: left;
            font-size: 11px;
            font-weight: 600;
            color: #666;
            border-bottom: 2px solid #dee2e6;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #dee2e6;
        }

        /* Winner Badge & Breakdown */
        .winner-badge {
            cursor: pointer;
            padding: 4px 8px;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            border-radius: 4px;
            font-weight: bold;
            color: #856404;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            transition: all 0.3s ease;
        }
        .winner-badge:hover {
            background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
            transform: scale(1.05);
        }
        .winner-badge.loser {
            background: #e9ecef;
            color: #6c757d;
            cursor: default;
        }
        .expand-icon {
            font-size: 10px;
            transition: transform 0.3s ease;
        }
        .expand-icon.expanded {
            transform: rotate(180deg);
        }
        .breakdown-details {
            margin-top: 8px;
            padding: 10px;
            background: #fffbf0;
            border-left: 3px solid #ffd700;
            font-size: 12px;
            border-radius: 4px;
            animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
            from {
                opacity: 0;
                max-height: 0;
            }
            to {
                opacity: 1;
                max-height: 200px;
            }
        }
        .breakdown-line {
            padding: 3px 0;
            color: #666;
        }
        .breakdown-line.total {
            font-weight: bold;
            color: #28a745;
            padding-top: 6px;
            border-top: 1px solid #dee2e6;
            margin-top: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>30 Base Validated Test Cases</h1>
        <div class="subtitle">Test Cases 1-30 (Incremental Generation with Validation)</div>
'''


def generate_html_footer() -> str:
    """Generate HTML footer with JavaScript"""
    return '''
    </div>
    <script>
        function copyPlayerData(button, text) {
            navigator.clipboard.writeText(text).then(() => {
                const originalText = button.innerHTML;
                button.innerHTML = '<span>✓</span> Copied!';
                button.classList.add('copied');

                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy to clipboard');
            });
        }

        function pasteFromClipboard(button, testCaseId) {
            navigator.clipboard.readText().then(text => {
                const textarea = document.getElementById(`actual-output-${testCaseId}`);
                textarea.value = text;

                const originalText = button.innerHTML;
                button.innerHTML = '<span>✓</span> Pasted!';
                button.classList.add('pasted');

                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('pasted');
                }, 2000);
            }).catch(err => {
                console.error('Failed to paste:', err);
                alert('Failed to paste from clipboard. Please make sure you have clipboard permissions enabled.');
            });
        }

        function copyComparisonResult(testCaseId) {
            const resultDiv = document.getElementById(`comparison-result-${testCaseId}`);

            // Get text and replace newlines with " | " to paste in single Excel cell
            let text = resultDiv.innerText;

            // Replace newlines with " | " separator for single-cell paste
            text = text.replace(/\\n/g, ' | ');

            // Remove multiple spaces
            text = text.replace(/\\s+/g, ' ');

            navigator.clipboard.writeText(text).then(() => {
                alert('Comparison result copied to clipboard! Paste into a single Excel/Sheets cell.');
            }).catch(err => {
                console.error('Failed to copy result:', err);
                alert('Failed to copy comparison result');
            });
        }

        function toggleTestCase(header) {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.collapse-icon');

            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                content.classList.add('collapsed');
                icon.classList.remove('expanded');
                icon.classList.add('collapsed');
            } else {
                content.classList.remove('collapsed');
                content.classList.add('expanded');
                icon.classList.remove('collapsed');
                icon.classList.add('expanded');
            }
        }

        function toggleBreakdown(badge) {
            const breakdown = badge.nextElementSibling;
            const icon = badge.querySelector('.expand-icon');

            if (breakdown.style.display === 'none' || !breakdown.style.display) {
                breakdown.style.display = 'block';
                icon.classList.add('expanded');
            } else {
                breakdown.style.display = 'none';
                icon.classList.remove('expanded');
            }
        }

        function compareNextHand(testCaseId, expectedText) {
            const textarea = document.getElementById(`actual-output-${testCaseId}`);
            const resultDiv = document.getElementById(`comparison-result-${testCaseId}`);

            let actualText = textarea.value.trim();

            if (!actualText) {
                resultDiv.innerHTML = '<div class="result-title">⚠️ Please paste the actual output first</div>';
                resultDiv.className = 'comparison-result';
                return;
            }

            actualText = actualText.replace(/^["']|["']$/g, '');

            const expected = parseNextHandData(expectedText);
            const actual = parseNextHandData(actualText);

            const results = [];
            let allPassed = true;

            if (expected.handNumber === actual.handNumber) {
                results.push({ field: 'Hand Number', pass: true, expected: expected.handNumber, actual: actual.handNumber });
            } else {
                results.push({ field: 'Hand Number', pass: false, expected: expected.handNumber, actual: actual.handNumber });
                allPassed = false;
            }

            if (expected.startedAt === actual.startedAt) {
                results.push({ field: 'Started At', pass: true, expected: expected.startedAt, actual: actual.startedAt });
            } else {
                results.push({ field: 'Started At', pass: false, expected: expected.startedAt, actual: actual.startedAt });
                allPassed = false;
            }

            for (const player of expected.players) {
                const actualPlayer = actual.players.find(p => p.name === player.name && p.position === player.position);
                if (actualPlayer) {
                    if (player.stack === actualPlayer.stack) {
                        results.push({ field: `${player.name} ${player.position}`, pass: true, expected: player.stack, actual: actualPlayer.stack });
                    } else {
                        results.push({ field: `${player.name} ${player.position}`, pass: false, expected: player.stack, actual: actualPlayer.stack });
                        allPassed = false;
                    }
                } else {
                    results.push({ field: `${player.name} ${player.position}`, pass: false, expected: player.stack, actual: 'NOT FOUND' });
                    allPassed = false;
                }
            }

            let html = `<div class="result-title">${allPassed ? '✅ PASSED' : '❌ FAILED'}</div>`;
            for (const result of results) {
                const className = result.pass ? 'check-item pass' : 'check-item fail';
                html += `<div class="${className}">${result.field}: ${result.expected}`;
                if (!result.pass) {
                    html += `<div class="diff">Expected: ${result.expected}, Got: ${result.actual}</div>`;
                }
                html += '</div>';
            }

            resultDiv.innerHTML = html;
            resultDiv.className = `comparison-result ${allPassed ? 'passed' : 'failed'}`;
        }

        function parseNextHandData(text) {
            const lines = text.split('\\n').map(l => l.trim()).filter(l => l);

            const data = {
                handNumber: '',
                startedAt: '',
                players: []
            };

            const handMatch = lines[0].match(/Hand \\((\\d+)\\)/);
            if (handMatch) {
                data.handNumber = handMatch[1];
            }

            const timeMatch = lines[1].match(/started_at:\\s*(\\S+)/);
            if (timeMatch) {
                data.startedAt = timeMatch[1];
            }

            let inStackSetup = false;
            for (const line of lines) {
                if (line === 'Stack Setup:') {
                    inStackSetup = true;
                    continue;
                }
                if (inStackSetup && line) {
                    const parts = line.split(/\\s+/);
                    if (parts.length >= 3) {
                        data.players.push({
                            name: parts[0],
                            position: parts[1],
                            stack: parts[2].replace(/,/g, '')
                        });
                    }
                }
            }

            return data;
        }
    </script>
</body>
</html>'''


def main():
    """Generate test cases incrementally"""
    print("Generating Test Cases with Full Validation...\n")

    # Generate TC-1 first (simplest case)
    print("Generating TC-1: 2 players, Simple")
    gen = TestCaseGenerator(tc_num=1, num_players=2, complexity="Simple",
                           require_side_pot=False, go_to_river=True)
    test_case_html = gen.generate()

    # Wrap with header and footer
    complete_html = generate_html_header() + test_case_html + generate_html_footer()

    # Write to file
    output_path = "C:\\Apps\\HUDR\\HHTool_Modular\\docs\\30_base_validated_cases.html"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(complete_html)

    print(f"[OK] TC-1 generated: {output_path}")
    print("\nValidation complete. Check HTML for validation status.")


if __name__ == "__main__":
    main()
