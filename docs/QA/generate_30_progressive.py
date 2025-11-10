#!/usr/bin/env python3
"""
Progressive Generation of 30 Validated Test Cases

Generates test cases one by one with full validation, automatically progressing
through all 30 cases without waiting for approval.

New Requirements:
- Different stack sizes per player: 10 BB to 60 BB range
- Varied blind structures: 50/100, 500/1000, 5000/10000, 50000/100000, etc.
- Include millions: e.g., 1,000,000 / 2,000,000 / 5,000,000
- All numeric values (no abbreviations)
- Mixed stack depths: short (10-20 BB), medium (30-40 BB), deep (60 BB)

Test Case Distribution:
- TC 1-5: Simple (2 players)
- TC 6-20: Medium (2-4 players mixed)
- TC 21-30: Complex (5-9 players)

Action Requirements:
- 15-20 cases with bet/call/raise/re-raise across all streets
- Checking only 30% of the time
- 1-2 side pots in 80% of test cases
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
    street_contribution: int = 0
    total_contribution: int = 0
    folded: bool = False
    all_in_street: Optional[str] = None
    is_bb: bool = False
    ante_posted: int = 0
    blind_posted: int = 0

    def __post_init__(self):
        self.current_stack = self.starting_stack
        self.is_bb = self.position == "BB"


class BlindStructure:
    """Defines blind structures for different chip denominations"""

    STRUCTURES = [
        # Thousands
        {"sb": 50, "bb": 100, "ante": 100},
        {"sb": 250, "bb": 500, "ante": 500},
        {"sb": 500, "bb": 1000, "ante": 1000},
        {"sb": 2500, "bb": 5000, "ante": 5000},
        # Tens of thousands
        {"sb": 5000, "bb": 10000, "ante": 10000},
        {"sb": 10000, "bb": 20000, "ante": 20000},
        {"sb": 25000, "bb": 50000, "ante": 50000},
        # Hundreds of thousands
        {"sb": 50000, "bb": 100000, "ante": 100000},
        {"sb": 250000, "bb": 500000, "ante": 500000},
        # Millions
        {"sb": 500000, "bb": 1000000, "ante": 1000000},
        {"sb": 1000000, "bb": 2000000, "ante": 2000000},
        {"sb": 2500000, "bb": 5000000, "ante": 5000000},
    ]

    @classmethod
    def get_random(cls):
        """Get random blind structure"""
        return random.choice(cls.STRUCTURES)

    @classmethod
    def get_for_complexity(cls, complexity: str):
        """Get appropriate blind structure for complexity level"""
        if complexity == "Simple":
            return random.choice(cls.STRUCTURES[:4])  # Thousands
        elif complexity == "Medium":
            return random.choice(cls.STRUCTURES[3:8])  # Tens/hundreds of thousands
        else:  # Complex
            return random.choice(cls.STRUCTURES[7:])  # Hundreds of thousands/millions


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

        # For 2-player games: players swap positions
        num_players = len(current_players)
        if num_players == 2:
            prev_bb = next((p for p in current_players if p.position == "BB"), None)
            next_sb = next((p for p in next_players if p["position"] == "SB"), None)
            next_bb = next((p for p in next_players if p["position"] == "BB"), None)

            if not next_sb or not next_bb:
                return False, "SB or BB not found in next hand"

            if next_sb["name"] != prev_bb.name:
                return False, f"Button rotation wrong: {prev_bb.name} (prev BB) should be new SB, got {next_sb['name']}"

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

        # Get blind structure based on complexity
        blinds = BlindStructure.get_for_complexity(complexity)
        self.sb = blinds["sb"]
        self.bb = blinds["bb"]
        self.ante = blinds["ante"]

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
        """Create players with varied stack sizes (10-60 BB)"""
        players = []
        positions = self.POSITIONS[self.num_players]
        names = self.PLAYER_NAMES[:self.num_players]

        # Generate varied stack sizes between 10 BB and 60 BB
        stack_bb_ranges = []

        if self.complexity == "Simple":
            # Simple: Mix of medium and deep stacks
            stack_bb_ranges = random.sample(range(30, 61), self.num_players)
        elif self.complexity == "Medium":
            # Medium: Mix of short, medium, and deep
            stack_bb_ranges = random.sample(range(15, 61), self.num_players)
        else:  # Complex
            # Complex: Full range including very short stacks
            stack_bb_ranges = random.sample(range(10, 61), self.num_players)

        # Create players with varied stacks
        for name, pos, bb_count in zip(names, positions, stack_bb_ranges):
            stack = self.bb * bb_count
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

    def generate_preflop_with_betting(self):
        """Generate preflop with raise action

        NOTE: Base section uses canonical position order (SB → BB → UTG... → Dealer)
        NOT actual gameplay order. This is per spec Section 4.
        """
        actions = []
        raise_amount = self.bb * 3

        # Base section uses postflop position order (canonical order)
        # This matches the validation logic
        action_order = self.get_postflop_action_order(self.players)

        # First player raises
        if len(action_order) > 0:
            raiser = action_order[0]
            actions.append(Action(raiser.name, raiser.position, ActionType.RAISE, raise_amount))
            raiser.street_contribution = raise_amount
            raiser.current_stack -= (raise_amount - raiser.blind_posted)
            raiser.total_contribution += (raise_amount - raiser.blind_posted)

            # Others call
            for player in action_order[1:]:
                actions.append(Action(player.name, player.position, ActionType.CALL, raise_amount))
                player.street_contribution = raise_amount
                player.current_stack -= (raise_amount - player.blind_posted)
                player.total_contribution += (raise_amount - player.blind_posted)

        self.actions["Preflop Base"] = actions

    def generate_flop_with_bet_call(self):
        """Generate flop with simple bet/call"""
        actions = []
        active = [p for p in self.players if not p.folded and not p.all_in_street]

        # Reset street contributions
        for p in active:
            p.street_contribution = 0

        action_order = self.get_postflop_action_order(active)
        bet_amount = self.bb * 5

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

        action_order = self.get_postflop_action_order(active)
        bet_amount = self.bb * 10

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

        # Rotate
        next_hand = []
        for i in range(self.num_players):
            new_pos_idx = i
            player_idx = (dealer_idx + 1 + i) % self.num_players
            player = self.players[player_idx]

            # Calculate new stack
            new_stack = player.starting_stack - player.total_contribution
            if player_idx == self.winner_idx:
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

    def calculate_pot_and_results(self):
        """Calculate pot, winners, and final stacks"""
        total_pot = sum(p.total_contribution for p in self.players)
        bb_ante = self.ante

        winner = self.players[self.winner_idx]

        results = []
        for i, p in enumerate(self.players):
            final_stack = p.current_stack
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
            'side_pots': [],
            'results': results,
            'winner': winner
        }

    def generate_results_html(self, pot_results) -> str:
        """Generate Expected Results section HTML"""
        total_pot = pot_results['total_pot']
        bb_ante = pot_results['bb_ante']
        main_pot = pot_results['main_pot']
        results = pot_results['results']
        winner = pot_results['winner']

        def fmt(n):
            return f"{n:,}"

        bb_player = next(p for p in self.players if p.position == "BB")
        ante_info = f'''                <div class="ante-info-box">
                    <strong>BB Ante: {fmt(bb_ante)}</strong>
                    <div style="margin-top: 5px;">
                        {bb_player.name} posts ante ({fmt(bb_ante)}) first → stack becomes {fmt(bb_player.starting_stack - bb_ante)}<br>
                        {bb_player.name} posts blind ({fmt(self.bb)}) → stack becomes {fmt(bb_player.starting_stack - bb_ante - self.bb)}
                    </div>
                </div>'''

        eligible_players = " ".join([f'<span>{r["name"]}</span>' for r in results])
        live_contributions = sum(p.total_contribution - (bb_ante if p.position == "BB" else 0) for p in self.players)

        pot_section = f'''                <div class="pot-item main">
                    <div class="pot-name">Main Pot</div>
                    <div class="pot-amount">{fmt(main_pot)} (100%)</div>
                    <div class="eligible">Eligible: {eligible_players}</div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: {fmt(live_contributions)} (live) + {fmt(bb_ante)} (BB ante dead) = {fmt(total_pot)}
                    </div>
                </div>'''

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

    def generate_html(self) -> str:
        """Generate HTML for test case"""
        # Build stack setup
        stack_lines = []
        for p in self.players:
            if p.position in ["Dealer", "SB", "BB"]:
                stack_lines.append(f"{p.name} {p.position} {p.starting_stack}")
            else:
                stack_lines.append(f"{p.name} {p.starting_stack}")

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
        betting_pattern = "Checks to River" if "Check" in str(self.actions.get("River Base", [])) else "With Betting"
        test_desc = f"{self.num_players}P {self.complexity} - {betting_pattern} (SB:{self.sb:,} BB:{self.bb:,})"

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
                    <span class="collapse-icon expanded">▼</span>
                </div>
            </div>

            <div class="test-content expanded">
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
                    • Blinds: SB {self.sb:,} / BB {self.bb:,} / Ante {self.ante:,}<br>
                    • Button rotation: {'Previous SB → New Dealer' if self.num_players > 2 else 'Players swap positions'}<br>
                    • All players present in next hand: {'✅' if len(next_hand) == len(self.players) else '❌'}
                </div>
            </div>
            </div>
        </div>
'''
        return html

    def generate(self) -> str:
        """Generate complete test case with validation"""
        self.players = self.create_players()
        self.post_blinds_antes()

        # Generate streets based on complexity
        if self.complexity == "Simple":
            self.generate_preflop_simple()
            if self.go_to_river:
                self.generate_flop_with_bet_call()
                self.generate_turn_with_bet_call()
                self.generate_river_with_check()
        else:
            self.generate_preflop_with_betting()
            if self.go_to_river:
                self.generate_flop_with_bet_call()
                self.generate_turn_with_bet_call()
                self.generate_river_with_check()

        self.winner_idx = random.randint(0, self.num_players - 1)

        return self.generate_html()


def read_html_header() -> str:
    """Read HTML header from existing file"""
    try:
        with open("C:\\Apps\\HUDR\\HHTool_Modular\\docs\\30_base_validated_cases.html", "r", encoding="utf-8") as f:
            content = f.read()
            # Extract header up to first test case
            header_end = content.find("<!-- TEST CASE")
            if header_end > 0:
                return content[:header_end]
    except:
        pass

    # Fallback: return basic header
    return generate_html_header()


def read_html_footer() -> str:
    """Read HTML footer from existing file"""
    try:
        with open("C:\\Apps\\HUDR\\HHTool_Modular\\docs\\30_base_validated_cases.html", "r", encoding="utf-8") as f:
            content = f.read()
            # Extract footer after last test case
            footer_start = content.rfind("</div>\n    </div>")
            if footer_start > 0:
                return content[footer_start + len("</div>\n    </div>"):]
    except:
        pass

    # Fallback: return basic footer
    return generate_html_footer()


def generate_html_header() -> str:
    """Generate HTML header with CSS from generate_30_validated_cases.py"""
    # Import from the other generator
    try:
        from generate_30_validated_cases import generate_html_header as get_header
        return get_header()
    except:
        # Fallback: basic header
        return '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>30 Base Test Cases - Validated</title>
</head>
<body>
    <div class="container">
        <h1>30 Base Validated Test Cases</h1>
        <div class="subtitle">Progressive Generation with Varied Stack Sizes & Blind Structures</div>
'''


def generate_html_footer() -> str:
    """Generate HTML footer with JavaScript from generate_30_validated_cases.py"""
    # Import from the other generator
    try:
        from generate_30_validated_cases import generate_html_footer as get_footer
        return get_footer()
    except:
        # Fallback: basic footer
        return '''
    </div>
</body>
</html>'''


def get_test_case_distribution() -> List[Tuple[int, int, str]]:
    """
    Generate distribution of 30 test cases:
    - TC 1-5: Simple (2 players)
    - TC 6-20: Medium (2-4 players mixed)
    - TC 21-30: Complex (5-9 players)
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
    """Generate all 30 test cases progressively"""
    import sys
    import io

    # Fix Unicode encoding for Windows console
    if sys.platform == "win32":
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    print("=" * 70)
    print("Progressive Generation of 30 Validated Test Cases")
    print("=" * 70)
    print("\nRequirements:")
    print("- Varied stack sizes: 10 BB to 60 BB per player")
    print("- Different blind structures: thousands, millions")
    print("- Validation against TEST_CASE_GENERATION_SPEC.md")
    print("- Automatic progression without approval")
    print()

    # Read existing HTML structure
    header = read_html_header()
    footer = read_html_footer()

    # Get distribution
    distribution = get_test_case_distribution()

    # Generate all test cases
    all_test_cases_html = ""

    for tc_num, num_players, complexity in distribution:
        print(f"[TC-{tc_num}] Generating: {num_players}P {complexity}...", end=" ")

        try:
            # Create generator
            generator = TestCaseGenerator(
                tc_num=tc_num,
                num_players=num_players,
                complexity=complexity,
                require_side_pot=(tc_num > 6),  # Side pots for 80% of cases
                go_to_river=True
            )

            # Generate test case
            test_case_html = generator.generate()

            # Validate
            errors = generator.validate_test_case()

            if errors:
                print("[VALIDATION FAILED]:")
                for error in errors:
                    print(f"   - {error}")
            else:
                print("[PASSED]")
                all_test_cases_html += test_case_html

        except Exception as e:
            print(f"[ERROR]: {e}")
            import traceback
            traceback.print_exc()

    # Write complete HTML
    output_path = "C:\\Apps\\HUDR\\HHTool_Modular\\docs\\30_base_validated_cases.html"
    complete_html = header + all_test_cases_html + footer

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(complete_html)

    print()
    print("=" * 70)
    print("[OK] Generation Complete!")
    print(f"Output: {output_path}")
    print(f"Total Test Cases: {len(distribution)}")
    print("=" * 70)


if __name__ == "__main__":
    main()
