#!/usr/bin/env python3
"""
Find and trace a failing case
"""
import sys
sys.path.insert(0, '.')

from generate_30_progressive import TestCaseGenerator

# Keep generating until we hit an error
for attempt in range(100):
    gen = TestCaseGenerator(tc_num=16+attempt, num_players=4, complexity='Medium', go_to_river=True)
    html = gen.generate()

    # Check for errors
    has_error = False
    for p in gen.players:
        if p.total_contribution > p.starting_stack or p.current_stack < 0:
            has_error = True
            break

    if has_error:
        print(f"Found failing case at attempt {attempt+1}")
        print("="*80)
        print()

        # Print full trace
        print(f"Blinds: SB={gen.sb:,} BB={gen.bb:,} Ante={gen.ante:,}")
        print()

        print("="*80)
        print("AFTER BLINDS/ANTES")
        print("="*80)
        for p in gen.players:
            print(f"{p.name} ({p.position}):")
            print(f"  Starting: {p.starting_stack:,}")
            print(f"  Ante: {p.ante_posted:,}")
            print(f"  Blind: {p.blind_posted:,}")
            print(f"  Current: {p.current_stack:,}")
            print(f"  Total Contribution: {p.total_contribution:,}")
            print()

        # Print all actions
        for street, actions in gen.actions.items():
            print("="*80)
            print(f"{street}")
            print("="*80)
            for action in actions:
                print(f"  {action.player_name} ({action.position}): {action.action_type.value} {action.amount or ''}")
            print()

        print("="*80)
        print("FINAL STATE")
        print("="*80)
        for p in gen.players:
            expected = p.starting_stack - p.total_contribution
            status = "[OK]" if p.current_stack == expected and p.total_contribution <= p.starting_stack else "[ERROR]"

            print(f"{status} {p.name} ({p.position}):")
            print(f"  Starting: {p.starting_stack:,}")
            print(f"  Current: {p.current_stack:,}")
            print(f"  Total Contribution: {p.total_contribution:,}")
            print(f"  Expected Current: {expected:,}")

            if p.current_stack != expected:
                diff = expected - p.current_stack
                print(f"  *** DIFF: {diff:,} (current is off by this amount)")

            if p.total_contribution > p.starting_stack:
                over = p.total_contribution - p.starting_stack
                print(f"  *** OVER-CONTRIBUTED by: {over:,}")

            print()

        break

if not has_error:
    print("No errors found in 100 attempts")
