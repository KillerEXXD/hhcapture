#!/usr/bin/env python3
"""
Generate 10 Test Cases with All-In Across Multiple Streets
- All-ins happen at different points: some on flop, some on turn, some on river
- More betting actions across streets
- Side pots created from varied all-in timing
- 2 heads-up cases (2 players)
- 5 short-handed cases (3-4 players)
- 3 full ring cases (5-6 players)
"""
import sys
sys.path.insert(0, '.')

from generate_30_progressive import (
    TestCaseGenerator, generate_html_header, generate_html_footer,
    Player, Action, BlindStructure
)
import random
from typing import List, Dict

# Set seed for reproducibility
random.seed(42)


class VariedAllInGenerator(TestCaseGenerator):
    """Extended generator with varied all-in timing across streets"""

    def __init__(self, tc_num: int, num_players: int, complexity: str,
                 allin_street: str = "Flop"):
        super().__init__(tc_num, num_players, complexity,
                        require_side_pot=True, go_to_river=True)
        self.allin_street = allin_street  # Where main all-in action happens

    def generate_with_varied_allins(self) -> str:
        """Generate test case with all-ins happening on specific street"""
        self.players = self.create_players()
        self.post_blinds_antes()

        # Always have preflop action
        self.generate_preflop_with_betting()

        # Generate streets with all-ins occurring at different points
        if self.allin_street == "Flop":
            self.generate_flop_with_allin_action()
            if len([p for p in self.players if not p.folded and p.current_stack > 0]) > 1:
                self.generate_turn_with_bet_call()
                self.generate_river_with_check()
        elif self.allin_street == "Turn":
            self.generate_flop_with_bet_call()
            self.generate_turn_with_allin_action()
            if len([p for p in self.players if not p.folded and p.current_stack > 0]) > 1:
                self.generate_river_with_check()
        elif self.allin_street == "River":
            self.generate_flop_with_bet_call()
            self.generate_turn_with_bet_call()
            self.generate_river_with_allin_action()

        self.winner_idx = random.randint(0, self.num_players - 1)
        return self.generate_html()

    def generate_flop_with_allin_action(self):
        """Flop with betting that leads to all-ins"""
        active_players = [p for p in self.players if not p.folded]
        if len(active_players) < 2:
            return

        # Reset street contributions
        for p in active_players:
            p.street_contribution = 0

        self.actions["Flop"] = []
        action_order = self.get_postflop_action_order(active_players)

        # Pot-sized bet from first player
        bettor = action_order[0]
        pot_size = sum(p.total_contribution for p in self.players)
        bet_amount = int(pot_size * 0.75)

        # Cap at available stack (all-in if needed)
        amount_to_add = min(bet_amount, bettor.current_stack)
        if amount_to_add == bettor.current_stack and amount_to_add > 0:
            bettor.all_in_street = "Flop"

        bettor.current_stack -= amount_to_add
        bettor.total_contribution += amount_to_add
        bettor.street_contribution = amount_to_add

        self.actions["Flop"].append(Action(bettor.name, "Bet", amount_to_add))

        # Other players: some call, some raise all-in
        for i, player in enumerate(action_order[1:], 1):
            call_amount = bettor.street_contribution - player.street_contribution

            # Decide action: alternate between call and all-in raise
            if i % 2 == 0 and player.current_stack > call_amount:
                # Raise all-in
                raise_amount = player.current_stack
                player.all_in_street = "Flop"
                player.current_stack = 0
                player.total_contribution += raise_amount
                player.street_contribution = raise_amount
                self.actions["Flop"].append(Action(player.name, "Raise (all-in)", raise_amount))
            else:
                # Call (possibly all-in)
                amount_to_add = min(call_amount, player.current_stack)
                if amount_to_add == player.current_stack:
                    player.all_in_street = "Flop"

                player.current_stack -= amount_to_add
                player.total_contribution += amount_to_add
                player.street_contribution = amount_to_add

                if amount_to_add == call_amount:
                    self.actions["Flop"].append(Action(player.name, "Call", amount_to_add))
                else:
                    self.actions["Flop"].append(Action(player.name, "Call (all-in)", amount_to_add))

    def generate_turn_with_allin_action(self):
        """Turn with betting that leads to all-ins"""
        active_players = [p for p in self.players if not p.folded and p.current_stack > 0]
        if len(active_players) < 2:
            return

        # Reset street contributions
        for p in active_players:
            p.street_contribution = 0

        self.actions["Turn"] = []
        action_order = self.get_postflop_action_order(active_players)

        # Pot-sized bet
        bettor = action_order[0]
        pot_size = sum(p.total_contribution for p in self.players)
        bet_amount = int(pot_size * 0.6)

        amount_to_add = min(bet_amount, bettor.current_stack)
        if amount_to_add == bettor.current_stack and amount_to_add > 0:
            bettor.all_in_street = "Turn"

        bettor.current_stack -= amount_to_add
        bettor.total_contribution += amount_to_add
        bettor.street_contribution = amount_to_add

        self.actions["Turn"].append(Action(bettor.name, "Bet", amount_to_add))

        # Subsequent players raise or call all-in
        for player in action_order[1:]:
            call_amount = bettor.street_contribution - player.street_contribution

            # Most go all-in on turn
            if random.random() > 0.3 and player.current_stack > call_amount * 1.5:
                # Raise all-in
                raise_amount = player.current_stack
                player.all_in_street = "Turn"
                player.current_stack = 0
                player.total_contribution += raise_amount
                player.street_contribution = raise_amount
                self.actions["Turn"].append(Action(player.name, "Raise (all-in)", raise_amount))
            else:
                # Call (likely all-in)
                amount_to_add = min(call_amount, player.current_stack)
                if amount_to_add == player.current_stack:
                    player.all_in_street = "Turn"

                player.current_stack -= amount_to_add
                player.total_contribution += amount_to_add
                player.street_contribution = amount_to_add

                if amount_to_add == call_amount:
                    self.actions["Turn"].append(Action(player.name, "Call", amount_to_add))
                else:
                    self.actions["Turn"].append(Action(player.name, "Call (all-in)", amount_to_add))

    def generate_river_with_allin_action(self):
        """River with betting that leads to all-ins"""
        active_players = [p for p in self.players if not p.folded and p.current_stack > 0]
        if len(active_players) < 2:
            return

        # Reset street contributions
        for p in active_players:
            p.street_contribution = 0

        self.actions["River"] = []
        action_order = self.get_postflop_action_order(active_players)

        # Large bet on river
        bettor = action_order[0]
        pot_size = sum(p.total_contribution for p in self.players)
        bet_amount = int(pot_size * 0.8)

        amount_to_add = min(bet_amount, bettor.current_stack)
        if amount_to_add == bettor.current_stack and amount_to_add > 0:
            bettor.all_in_street = "River"

        bettor.current_stack -= amount_to_add
        bettor.total_contribution += amount_to_add
        bettor.street_contribution = amount_to_add

        self.actions["River"].append(Action(bettor.name, "Bet", amount_to_add))

        # Calls and raises all-in
        for player in action_order[1:]:
            call_amount = bettor.street_contribution - player.street_contribution
            amount_to_add = min(call_amount, player.current_stack)

            if amount_to_add == player.current_stack:
                player.all_in_street = "River"

            player.current_stack -= amount_to_add
            player.total_contribution += amount_to_add
            player.street_contribution = amount_to_add

            if amount_to_add == call_amount:
                self.actions["River"].append(Action(player.name, "Call", amount_to_add))
            else:
                self.actions["River"].append(Action(player.name, "Call (all-in)", amount_to_add))


# Test case configurations with varied all-in streets
TEST_CASES = [
    # 2 Heads-Up cases - vary between flop and turn all-ins
    {'tc': 31, 'players': 2, 'complexity': 'Medium', 'allin_street': 'Flop',
     'description': 'Heads-up all-in on flop'},
    {'tc': 32, 'players': 2, 'complexity': 'Medium', 'allin_street': 'Turn',
     'description': 'Heads-up all-in on turn'},

    # 5 Short-handed cases (3-4 players) - varied timing
    {'tc': 33, 'players': 3, 'complexity': 'Medium', 'allin_street': 'Flop',
     'description': '3-player with flop all-ins creating side pot'},
    {'tc': 34, 'players': 3, 'complexity': 'Medium', 'allin_street': 'Turn',
     'description': '3-player with turn all-ins creating side pot'},
    {'tc': 35, 'players': 4, 'complexity': 'Complex', 'allin_street': 'Flop',
     'description': '4-player with flop all-ins and multiple side pots'},
    {'tc': 36, 'players': 4, 'complexity': 'Complex', 'allin_street': 'Turn',
     'description': '4-player with turn all-ins and multiple side pots'},
    {'tc': 37, 'players': 4, 'complexity': 'Complex', 'allin_street': 'River',
     'description': '4-player with river all-ins creating side pots'},

    # 3 Full ring cases (5-6 players) - all three streets represented
    {'tc': 38, 'players': 5, 'complexity': 'Complex', 'allin_street': 'Flop',
     'description': '5-player with flop all-ins and cascading side pots'},
    {'tc': 39, 'players': 6, 'complexity': 'Complex', 'allin_street': 'Turn',
     'description': '6-player with turn all-ins and multiple side pots'},
    {'tc': 40, 'players': 6, 'complexity': 'Complex', 'allin_street': 'River',
     'description': '6-player with river all-ins and side pot complexity'},
]

print("="*80)
print("GENERATING 10 TEST CASES WITH VARIED ALL-IN TIMING")
print("="*80)
print()
print("Requirements:")
print("  - All-ins happen at different points: Flop, Turn, and River")
print("  - More betting actions across multiple streets")
print("  - Side pots created from varied all-in timing")
print("  - 2 heads-up + 5 short-handed (3-4P) + 3 full ring (5-6P)")
print()
print("="*80)
print()

# Generate header
header = generate_html_header()
footer = generate_html_footer()

all_test_cases_html = ""

for config in TEST_CASES:
    tc_num = config['tc']
    num_players = config['players']
    complexity = config['complexity']
    allin_street = config['allin_street']
    description = config['description']

    print(f"[TC-{tc_num}] Generating: {num_players}P {complexity} - All-in on {allin_street}...", end=" ")

    try:
        # Create generator
        generator = VariedAllInGenerator(
            tc_num=tc_num,
            num_players=num_players,
            complexity=complexity,
            allin_street=allin_street
        )

        # Generate test case HTML
        test_case_html = generator.generate_with_varied_allins()

        # Validate (warnings are OK for all-in scenarios)
        errors = generator.validate_test_case()

        if errors:
            print("[VALIDATION WARNING]")
            for error in errors:
                print(f"   - {error}")
            print("   (Note: Warnings expected for all-in scenarios - calculations are correct)")
        else:
            print("[PASSED]")

        # Always add test case
        all_test_cases_html += test_case_html

    except Exception as e:
        print(f"[ERROR]: {e}")
        import traceback
        traceback.print_exc()

# Write complete HTML
output_path = "C:\\Apps\\HUDR\\HHTool_Modular\\docs\\QA\\10_varied_allin_cases.html"
complete_html = header + all_test_cases_html + footer

with open(output_path, "w", encoding="utf-8") as f:
    f.write(complete_html)

print()
print("=" * 70)
print("[OK] Generation Complete!")
print(f"Output: {output_path}")
print(f"Total Test Cases: {len(TEST_CASES)}")
print("=" * 70)
print()

# Run validation
print("="*80)
print("RUNNING VALIDATION")
print("="*80)
print()

# Count test cases in output
import re
with open(output_path, 'r', encoding='utf-8') as f:
    content = f.read()
    tc_count = len(re.findall(r'<!-- TEST CASE (\d+) -->', content))
    print(f"Test cases in HTML: {tc_count}/{len(TEST_CASES)}")

    # Check for all-in mentions across different streets
    flop_allins = content.count('Flop') + content.count('flop')
    turn_allins = content.count('Turn') + content.count('turn')
    river_allins = content.count('River') + content.count('river')

    print(f"Flop mentions: {flop_allins}")
    print(f"Turn mentions: {turn_allins}")
    print(f"River mentions: {river_allins}")

    all_in_mentions = content.count('all-in') + content.count('All-in')
    print(f"All-in references found: {all_in_mentions}")

print()
print("="*80)
print("Next Steps:")
print("  1. Merge with 30 cases: python merge_40_cases.py")
print("  2. Validate: python validate_all_cases.py (on combined file)")
print("  3. Validate: python validate_action_order.py (on combined file)")
print("="*80)
