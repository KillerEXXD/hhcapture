#!/usr/bin/env python3
"""
Step by step trace of a failing case
"""
import sys
sys.path.insert(0, '.')

from generate_30_progressive import TestCaseGenerator, Player
import random

# Set a seed that causes failure (from previous test, attempt 3)
random.seed(18)  # tc_num 16+2=18

gen = TestCaseGenerator(tc_num=18, num_players=4, complexity='Medium', go_to_river=True)

print("="*80)
print("STEP 1: Create Players")
print("="*80)
gen.players = gen.create_players()

for p in gen.players:
    print(f"{p.name} ({p.position}): {p.starting_stack:,} ({p.starting_stack // gen.bb} BB)")
print()

print(f"Blinds: SB={gen.sb:,} BB={gen.bb:,} Ante={gen.ante:,}")
print()

print("="*80)
print("STEP 2: Post Blinds and Antes")
print("="*80)

# Manually trace through post_blinds_antes
for player in gen.players:
    print(f"\n{player.name} ({player.position}) BEFORE:")
    print(f"  Current Stack: {player.current_stack:,}")
    print(f"  Total Contribution: {player.total_contribution:,}")

    if player.position == "BB":
        print(f"  -> Posting ante: {gen.ante:,}")
        player.ante_posted = gen.ante
        player.current_stack -= gen.ante
        player.total_contribution += gen.ante

        print(f"  -> Posting BB blind: {gen.bb:,}")
        player.blind_posted = gen.bb
        player.current_stack -= gen.bb
        player.street_contribution = gen.bb
        player.total_contribution += gen.bb

    elif player.position == "SB":
        print(f"  -> Posting SB blind: {gen.sb:,}")
        player.blind_posted = gen.sb
        player.current_stack -= gen.sb
        player.street_contribution = gen.sb
        player.total_contribution += gen.sb

    print(f"  AFTER:")
    print(f"    Current Stack: {player.current_stack:,}")
    print(f"    Total Contribution: {player.total_contribution:,}")
    print(f"    Street Contribution: {player.street_contribution:,}")

print()
print("="*80)
print("STEP 3: Generate Preflop with Betting")
print("="*80)

# Manually trace through generate_preflop_with_betting
actions = []
raise_amount = gen.bb * 3

action_order = gen.get_preflop_action_order(gen.players)
print(f"\nAction order: {[p.name for p in action_order]}")
print(f"Raise amount: {raise_amount:,}")
print()

# First player raises
if len(action_order) > 0:
    raiser = action_order[0]
    print(f"{raiser.name} ({raiser.position}) raises to {raise_amount:,}")
    print(f"  BEFORE: current={raiser.current_stack:,}, contributed={raiser.total_contribution:,}, blind_posted={raiser.blind_posted:,}")

    raiser.street_contribution = raise_amount
    amount_to_add = raise_amount - raiser.blind_posted
    print(f"  Amount to add: {raise_amount:,} - {raiser.blind_posted:,} = {amount_to_add:,}")

    raiser.current_stack -= amount_to_add
    raiser.total_contribution += amount_to_add

    print(f"  AFTER: current={raiser.current_stack:,}, contributed={raiser.total_contribution:,}")
    print()

    # Others call
    for player in action_order[1:]:
        print(f"{player.name} ({player.position}) calls {raise_amount:,}")
        print(f"  BEFORE: current={player.current_stack:,}, contributed={player.total_contribution:,}, blind_posted={player.blind_posted:,}")

        player.street_contribution = raise_amount
        amount_to_add = raise_amount - player.blind_posted
        print(f"  Amount to add: {raise_amount:,} - {player.blind_posted:,} = {amount_to_add:,}")

        player.current_stack -= amount_to_add
        player.total_contribution += amount_to_add

        print(f"  AFTER: current={player.current_stack:,}, contributed={player.total_contribution:,}")
        print()

print("="*80)
print("FINAL CHECK")
print("="*80)
for p in gen.players:
    expected = p.starting_stack - p.total_contribution
    status = "[OK]" if p.current_stack == expected else "[ERROR]"

    print(f"{status} {p.name}: Start={p.starting_stack:,}, Current={p.current_stack:,}, Contrib={p.total_contribution:,}, Expected={expected:,}")

    if p.current_stack != expected:
        print(f"     *** OFF BY: {expected - p.current_stack:,}")
