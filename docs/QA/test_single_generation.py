#!/usr/bin/env python3
"""
Test generation of a single test case to identify bugs
"""
import sys
sys.path.insert(0, '.')

from generate_30_progressive import TestCaseGenerator

# Try generating TC-16 (4 players, Medium complexity)
print("="*80)
print("Generating TC-16 (4 players, Medium complexity)")
print("="*80)
print()

gen = TestCaseGenerator(tc_num=16, num_players=4, complexity="Medium", go_to_river=True)
html = gen.generate()

print(f"Generated HTML length: {len(html)}")
print()

# Check contributions
total_pot = sum(p.total_contribution for p in gen.players)
print(f"Total Pot: {total_pot:,}")
print()

errors = []
for p in gen.players:
    print(f"{p.name} ({p.position}):")
    print(f"  Starting: {p.starting_stack:,}")
    print(f"  Current: {p.current_stack:,}")
    print(f"  Contributed: {p.total_contribution:,}")

    # Check calculation
    expected_current = p.starting_stack - p.total_contribution
    if p.current_stack != expected_current:
        error = f"  [ERROR] Current should be {expected_current:,}, is {p.current_stack:,}"
        print(error)
        errors.append(error)

    # Check over-contribution
    if p.total_contribution > p.starting_stack:
        error = f"  [OVER-CONTRIBUTION] {p.total_contribution:,} > {p.starting_stack:,}"
        print(error)
        errors.append(error)

    # Check negative
    if p.current_stack < 0:
        error = f"  [NEGATIVE] Current stack is {p.current_stack:,}"
        print(error)
        errors.append(error)

    if not errors:
        print(f"  [OK] Valid")
    print()

if errors:
    print("="*80)
    print(f"FOUND {len(errors)} ERRORS")
    print("="*80)
else:
    print("="*80)
    print("ALL VALID - NO ERRORS")
    print("="*80)
