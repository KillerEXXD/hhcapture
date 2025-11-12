#!/usr/bin/env python3
"""
Test to verify the call amount validation works correctly.

This creates a mock test case with the TC-33 bug (Alice calling 1M instead of 900k)
and verifies that the validator catches it.
"""

# Create a mock HTML snippet simulating the BUG (before fix)
mock_html_with_bug = """
<!-- TEST CASE 999 -->
<div class="test-case">
    <pre>Hand (999)
started_at: 00:02:30 ended_at: 00:05:40
SB 50000 BB 100000 Ante 100000
Stack Setup:
Alice Dealer 4200000
Bob SB 1700000
Charlie BB 1600000
    </pre>

    <div class="street-name">Turn Base (7♥)</div>
    <div class="action-row"><span class="action-player">Bob (SB):</span> <span class="action-type">Bet</span> <span class="action-amount">900,000</span></div>
    <div class="action-row"><span class="action-player">Charlie (BB):</span> <span class="action-type">Call</span> <span class="action-amount">700,000</span></div>
    <div class="action-row"><span class="action-player">Alice (Dealer):</span> <span class="action-type">Call</span> <span class="action-amount">1,000,000</span></div>
</div>
"""

# Create a mock HTML snippet simulating the FIX (after fix)
mock_html_fixed = """
<!-- TEST CASE 999 -->
<div class="test-case">
    <pre>Hand (999)
started_at: 00:02:30 ended_at: 00:05:40
SB 50000 BB 100000 Ante 100000
Stack Setup:
Alice Dealer 4200000
Bob SB 1700000
Charlie BB 1600000
    </pre>

    <div class="street-name">Turn Base (7♥)</div>
    <div class="action-row"><span class="action-player">Bob (SB):</span> <span class="action-type">Bet</span> <span class="action-amount">900,000</span></div>
    <div class="action-row"><span class="action-player">Charlie (BB):</span> <span class="action-type">Call</span> <span class="action-amount">700,000</span></div>
    <div class="action-row"><span class="action-player">Alice (Dealer):</span> <span class="action-type">Call</span> <span class="action-amount">900,000</span></div>
</div>
"""

# Import the validation function
from validate_bet_amounts_v2 import parse_test_case

print("="*70)
print("TESTING CALL AMOUNT VALIDATION")
print("="*70)
print()

# Test 1: With bug (Alice calls 1M instead of 900k)
print("Test 1: HTML with BUG (Alice calls 1,000,000 when Bob bet 900,000)")
print("-"*70)
errors = parse_test_case(999, mock_html_with_bug)
if errors:
    print("[OK] VALIDATOR CAUGHT THE BUG!")
    for error in errors:
        print(f"  - {error}")
else:
    print("[X] VALIDATOR MISSED THE BUG!")
print()

# Test 2: Fixed (Alice calls 900k correctly)
print("Test 2: HTML FIXED (Alice calls 900,000 matching Bob's bet)")
print("-"*70)
errors = parse_test_case(999, mock_html_fixed)
if errors:
    print("[X] VALIDATOR INCORRECTLY FLAGGED THE FIX!")
    for error in errors:
        print(f"  - {error}")
else:
    print("[OK] VALIDATOR CORRECTLY PASSED!")
print()

print("="*70)
print("CONCLUSION:")
print("="*70)
print("The validator now detects when players call to incorrect amounts")
print("(calling to theoretical bet_amount instead of actual bet).")
print()
print("This prevents bugs like TC-33 where Alice was calling 1,000,000")
print("when Bob only bet 900,000.")
print("="*70)
