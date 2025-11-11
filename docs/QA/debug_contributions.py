#!/usr/bin/env python3
"""
Debug script to trace contribution tracking in a single test case
"""
import sys
sys.path.insert(0, '.')

from generate_30_progressive import TestCaseGenerator, Player

def debug_test_case():
    print("="*80)
    print("DEBUGGING CONTRIBUTION TRACKING")
    print("="*80)
    print()

    # Create a simple 3-player test case
    tc_num = 1
    num_players = 3
    complexity = "Simple"

    # Create generator
    gen = TestCaseGenerator(tc_num, num_players, complexity)

    print(f"Test Case Settings:")
    print(f"  Players: {num_players}")
    print(f"  Complexity: {complexity}")
    print(f"  SB: {gen.sb:,}")
    print(f"  BB: {gen.bb:,}")
    print(f"  Ante: {gen.ante:,}")
    print()

    # Create 3 players with specific stacks
    gen.players = [
        Player("Alice", "Dealer", 200000),
        Player("Bob", "SB", 195000),
        Player("Charlie", "BB", 205000)
    ]

    print("Initial Stacks:")
    for p in gen.players:
        print(f"  {p.name} ({p.position}): {p.starting_stack:,}")
    print()

    # Post blinds and antes
    print("="*80)
    print("STEP 1: Post Blinds and Antes")
    print("="*80)
    gen.post_blinds_antes()

    for p in gen.players:
        print(f"\n{p.name} ({p.position}):")
        print(f"  Starting Stack: {p.starting_stack:,}")
        print(f"  Ante Posted: {p.ante_posted:,}")
        print(f"  Blind Posted: {p.blind_posted:,}")
        print(f"  Current Stack: {p.current_stack:,}")
        print(f"  Total Contribution: {p.total_contribution:,}")
        print(f"  Street Contribution: {p.street_contribution:,}")

        # Verify calculation
        expected_stack = p.starting_stack - p.total_contribution
        if p.current_stack != expected_stack:
            print(f"  ⚠️  ERROR: Stack should be {expected_stack:,}, is {p.current_stack:,}")

    # Generate preflop simple
    print()
    print("="*80)
    print("STEP 2: Preflop Actions")
    print("="*80)
    gen.generate_preflop_simple()

    for action in gen.actions["Preflop Base"]:
        print(f"  {action.player_name} ({action.position}): {action.action_type.value} {action.amount or ''}")

    print()
    print("After Preflop:")
    for p in gen.players:
        print(f"\n{p.name} ({p.position}):")
        print(f"  Starting Stack: {p.starting_stack:,}")
        print(f"  Current Stack: {p.current_stack:,}")
        print(f"  Total Contribution: {p.total_contribution:,}")
        print(f"  Street Contribution: {p.street_contribution:,}")

        # Verify calculation
        expected_stack = p.starting_stack - p.total_contribution
        if p.current_stack != expected_stack:
            print(f"  ⚠️  ERROR: Stack should be {expected_stack:,}, is {p.current_stack:,}")

        # Check for over-contribution
        if p.total_contribution > p.starting_stack:
            print(f"  🚨 OVER-CONTRIBUTION: {p.total_contribution:,} > {p.starting_stack:,}")

    # Generate flop
    print()
    print("="*80)
    print("STEP 3: Flop Actions")
    print("="*80)
    gen.generate_flop_with_bet_call()

    for action in gen.actions["Flop Base (A♠ K♦ Q♣)"]:
        print(f"  {action.player_name} ({action.position}): {action.action_type.value} {action.amount or ''}")

    print()
    print("After Flop:")
    for p in gen.players:
        print(f"\n{p.name} ({p.position}):")
        print(f"  Starting Stack: {p.starting_stack:,}")
        print(f"  Current Stack: {p.current_stack:,}")
        print(f"  Total Contribution: {p.total_contribution:,}")
        print(f"  Street Contribution: {p.street_contribution:,}")

        # Verify calculation
        expected_stack = p.starting_stack - p.total_contribution
        if p.current_stack != expected_stack:
            print(f"  ⚠️  ERROR: Stack should be {expected_stack:,}, is {p.current_stack:,}")

        # Check for over-contribution
        if p.total_contribution > p.starting_stack:
            print(f"  🚨 OVER-CONTRIBUTION: {p.total_contribution:,} > {p.starting_stack:,}")

    # Generate turn
    print()
    print("="*80)
    print("STEP 4: Turn Actions")
    print("="*80)
    gen.generate_turn_with_bet_call()

    for action in gen.actions["Turn Base (7♥)"]:
        print(f"  {action.player_name} ({action.position}): {action.action_type.value} {action.amount or ''}")

    print()
    print("After Turn:")
    for p in gen.players:
        print(f"\n{p.name} ({p.position}):")
        print(f"  Starting Stack: {p.starting_stack:,}")
        print(f"  Current Stack: {p.current_stack:,}")
        print(f"  Total Contribution: {p.total_contribution:,}")
        print(f"  Street Contribution: {p.street_contribution:,}")

        # Verify calculation
        expected_stack = p.starting_stack - p.total_contribution
        if p.current_stack != expected_stack:
            print(f"  ⚠️  ERROR: Stack should be {expected_stack:,}, is {p.current_stack:,}")

        # Check for over-contribution
        if p.total_contribution > p.starting_stack:
            print(f"  🚨 OVER-CONTRIBUTION: {p.total_contribution:,} > {p.starting_stack:,}")

    print()
    print("="*80)
    print("FINAL SUMMARY")
    print("="*80)

    total_pot = sum(p.total_contribution for p in gen.players)
    print(f"\nTotal Pot: {total_pot:,}")
    print()

    all_valid = True
    for p in gen.players:
        final_stack = p.current_stack
        expected_final = p.starting_stack - p.total_contribution
        is_valid = (final_stack == expected_final) and (p.total_contribution <= p.starting_stack)

        status = "✅" if is_valid else "❌"
        print(f"{status} {p.name}: Started {p.starting_stack:,}, Contributed {p.total_contribution:,}, Final {final_stack:,}")

        if not is_valid:
            all_valid = False
            if final_stack != expected_final:
                print(f"   ERROR: Final should be {expected_final:,}")
            if p.total_contribution > p.starting_stack:
                print(f"   ERROR: Over-contributed by {p.total_contribution - p.starting_stack:,}")

    print()
    if all_valid:
        print("✅ All calculations VALID")
    else:
        print("❌ ERRORS FOUND - See above")
    print()

if __name__ == '__main__':
    debug_test_case()
