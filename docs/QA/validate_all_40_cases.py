#!/usr/bin/env python3
"""
Comprehensive Validation Suite for 40 Test Cases

Runs all validations:
1. Stack calculations (validate_40_all_cases.py logic)
2. Action order (validate_40_action_order.py logic)
3. Bet amounts (validate_bet_amounts_v2.py logic)
"""
import subprocess
import sys

print("="*80)
print("COMPREHENSIVE VALIDATION SUITE - 40 TEST CASES")
print("="*80)
print()

# Run all three validations
validations = [
    ("Stack Calculations", "validate_40_all_cases.py"),
    ("Action Order", "validate_40_action_order.py"),
    ("Bet Amounts", "validate_bet_amounts_v2.py"),
]

results = {}

for name, script in validations:
    print(f"Running {name} validation...")
    print("-" * 80)
    try:
        result = subprocess.run(
            [sys.executable, script],
            capture_output=True,
            text=True,
            timeout=60
        )

        # Parse output for pass/fail counts
        output = result.stdout

        # Look for "Passed: X" and "Failed: Y" in output
        import re
        passed_match = re.search(r'Passed: (\d+)', output)
        failed_match = re.search(r'Failed: (\d+)', output)

        if passed_match and failed_match:
            passed = int(passed_match.group(1))
            failed = int(failed_match.group(1))
            results[name] = {
                'passed': passed,
                'failed': failed,
                'total': passed + failed
            }
            print(f"  Passed: {passed}/{passed+failed}")
            print(f"  Failed: {failed}/{passed+failed}")
        else:
            results[name] = {'error': 'Could not parse results'}
            print(f"  Error: Could not parse validation results")

    except subprocess.TimeoutExpired:
        results[name] = {'error': 'Timeout'}
        print(f"  Error: Validation timed out")
    except Exception as e:
        results[name] = {'error': str(e)}
        print(f"  Error: {e}")

    print()

# Summary
print("="*80)
print("OVERALL SUMMARY")
print("="*80)
print()

all_passed = True
for name, result in results.items():
    if 'error' in result:
        print(f"[X] {name}: {result['error']}")
        all_passed = False
    elif result['failed'] > 0:
        print(f"[X] {name}: {result['failed']}/{result['total']} FAILED")
        all_passed = False
    else:
        print(f"[OK] {name}: {result['passed']}/{result['total']} PASSED")

print()
if all_passed:
    print("[OK] ALL VALIDATIONS PASSED!")
else:
    print("[X] SOME VALIDATIONS FAILED - See details above")

print("="*80)
