#!/usr/bin/env python3
"""
Debug script to trace TC-9 generation step by step
"""
import sys
import random

# Set seed to get consistent TC-9 (this is speculative - may need to adjust)
random.seed(42)

# Import the generator
from generate_30_progressive import TestCaseGenerator

# Create TC-9: 3P Medium
tc_num = 9
num_players = 3
complexity = "Medium"

generator = TestCaseGenerator(tc_num, num_players, complexity)

# Generate players
generator.players = generator.create_players()

print("=== TC-9 GENERATION TRACE ===")
print(f"\nStarting Stacks:")
for p in generator.players:
    print(f"  {p.name} ({p.position}): {p.current_stack:,}")

# Post blinds
generator.post_blinds_antes()

print(f"\nAfter Blinds/Antes:")
for p in generator.players:
    print(f"  {p.name} ({p.position}): Stack={p.current_stack:,}, Contributed={p.total_contribution:,}")

# Generate preflop
generator.generate_preflop_with_betting()

print(f"\nAfter Preflop:")
for p in generator.players:
    print(f"  {p.name} ({p.position}): Stack={p.current_stack:,}, Contributed={p.total_contribution:,}, All-in={p.all_in_street}")

# Generate flop
generator.generate_flop_with_bet_call()

print(f"\nAfter Flop:")
for p in generator.players:
    print(f"  {p.name} ({p.position}): Stack={p.current_stack:,}, Contributed={p.total_contribution:,}, All-in={p.all_in_street}")

# Now check Turn generation
print(f"\nBefore Turn Generation:")
active = [p for p in generator.players if not p.folded and not p.all_in_street]
print(f"Active players: {[p.name for p in active]}")
for p in active:
    print(f"  {p.name}: current_stack={p.current_stack:,}")

action_order = generator.get_postflop_action_order(active)
bet_amount = generator.bb * 10

print(f"\nTurn bet_amount (BB*10): {bet_amount:,}")
print(f"Action order: {[p.name for p in action_order]}")

for i, player in enumerate(action_order):
    amount_to_add = min(bet_amount, player.current_stack)
    print(f"\n  {player.name} (action {i}):")
    print(f"    current_stack: {player.current_stack:,}")
    print(f"    bet_amount: {bet_amount:,}")
    print(f"    amount_to_add: {amount_to_add:,}")
    print(f"    Is all-in? {amount_to_add < bet_amount}")
