# Validation Issues Found - November 2025

## Summary

During comprehensive validation of 30 poker test cases, we discovered that automated validation scripts reported "100% PASS" but manual verification found **5 test cases with negative stack issues** still remaining.

## Issue Details

### Files Affected
- **30_base_validated_cases.html**: Contains 5 test cases with negative Final Stack values
- **30_TestCases.html**: Fully validated (actual 100% pass rate)

### Test Cases with Negative Final Stacks

| Test Case | Player(s) | Final Stack (Incorrect) | Status |
|-----------|-----------|------------------------|--------|
| TC-22 | Bob (SB) | -3,000,000 | ❌ Needs Fix |
| TC-23 | Eve (MP) | -2,000,000 | ❌ Needs Fix |
| TC-25 | Eve (UTG+1) | -700,000 | ❌ Needs Fix |
| TC-25 | Grace (MP) | -400,000 | ❌ Needs Fix |
| TC-26 | Eve (MP) | -1,000,000 | ❌ Needs Fix |
| TC-28 | Charlie (BB) | -20,000,000 | ❌ Needs Fix |
| TC-28 | Eve (UTG+1) | -20,000,000 | ❌ Needs Fix |

**Total affected:** 5 test cases, 7 player instances with negative stacks

## Root Cause Analysis

### Why Validation Script Failed to Detect Issues

**Problem:** The `validate_all_cases.py` script uses this regex pattern:
```python
player_pattern = rf'<tr>.*?{player["name"]}.*?</tr>'
player_row_match = re.search(player_pattern, results_table, re.DOTALL)
```

**Bug:** With `re.DOTALL` flag, the `.*?` pattern matches across newlines, causing the regex to match from the FIRST `<tr>` containing the player's name all the way to a closing `</tr>` tag, potentially spanning multiple table rows.

**Example from TC-23:**
```html
<tr>
    <td>Alice (Dealer)</td>
    <td>7,500,000</td>
    <td>0</td>  <!-- Script checks THIS (index 1) -->
    ...
</tr>
<tr>
    <td>Bob (SB)</td>
    ...
</tr>
<!-- More rows -->
<tr>
    <td>Eve (MP)</td>
    <td>7,000,000</td>
    <td>-2,000,000</td>  <!-- Actual negative value at index 17 -->
    ...
</tr>
```

When searching for "Eve", the regex matches from Alice's row to Eve's row, extracting ALL numbers from ALL intervening rows. The script then checks `numbers[1]` which is Alice's final stack (0), not Eve's final stack (-2,000,000).

**Result:** Script reports PASS even though Eve has a negative stack.

### Actions vs Expected Results Mismatch

**Discovery:** When investigating TC-23, we found:
- ✅ Actions section was CORRECT: Eve shows "All-In 3,000,000" on Turn
- ❌ Expected Results table was WRONG: Eve shows Final Stack = -2,000,000

**This indicates:** Some previous fix attempt updated the Actions but didn't update the Expected Results table to match.

## Lessons Learned

### 1. **Never Trust Validation Scripts 100%**
- Automated validation is helpful but not infallible
- Always perform manual spot checks
- Use multiple verification methods

### 2. **Regex Patterns Need Careful Testing**
- `.*?` with `re.DOTALL` can have unexpected behavior in HTML
- Use more specific patterns: `<tr>\s*<td>PlayerName</td>.*?</tr>` (without DOTALL)
- Or use non-greedy matching with newline restrictions

### 3. **Full Fix Requires Both Actions AND Results**
- Fixing actions alone is insufficient
- Must also update:
  - Expected Results table (all columns)
  - Pot breakdown (Main Pot + Side Pots)
  - Next Hand Preview
  - Any calculated values

### 4. **Manual Verification Commands**

```bash
# Find all negative stacks in Expected Results
grep -B 5 "<td>-" 30_base_validated_cases.html | grep -E "(TEST CASE|Final Stack)"

# Check specific test case
sed -n '4638,4830p' 30_base_validated_cases.html | grep -E "(Eve|Final Stack)"

# Verify action order issues
python validate_action_order.py

# Count test cases
grep -c "<!-- TEST CASE" 30_base_validated_cases.html
```

## Recommended Fixes

### Immediate Actions

1. **Fix validation script regex:**
```python
# OLD (BUGGY):
player_pattern = rf'<tr>.*?{player["name"]}.*?</tr>'
player_row_match = re.search(player_pattern, results_table, re.DOTALL)

# NEW (CORRECT):
player_pattern = rf'<tr[^>]*>\s*<td[^>]*>{player["name"]}\s*\([^)]+\)</td>.*?</tr>'
player_row_match = re.search(player_pattern, results_table)  # No DOTALL
```

2. **Fix remaining test cases:**
   - TC-22: Recalculate Bob's contributions and final stack
   - TC-23: Update Eve's Expected Results (actions already fixed)
   - TC-25: Fix Eve and Grace
   - TC-26: Fix Eve
   - TC-28: Fix Charlie and Eve

3. **Add validation step to generation workflow:**
   - After generating test case
   - Run automated validation
   - Perform manual grep check
   - Visually inspect in browser
   - Only then mark as complete

### Long-term Improvements

1. **Enhanced Validation Script:**
   - Fix regex pattern bugs
   - Add more specific error messages
   - Include line numbers in error reports
   - Add visual diff mode for debugging

2. **Test Case Generation:**
   - Build validation INTO generation script
   - Don't write to file until validation passes
   - Include self-test mode

3. **Documentation:**
   - ✅ Update TEST_CASE_GENERATION_SPEC.md (DONE)
   - Document validation workflow
   - Create troubleshooting guide

## Validation Status by File

### 30_base_validated_cases.html
- Negative Stack Validation: ❌ 5 test cases failing (TC-22, TC-23, TC-25, TC-26, TC-28)
- Action Order Validation: ✅ 30/30 PASS
- **Overall: 83.3% pass rate (25/30)**

### 30_TestCases.html
- Negative Stack Validation: ✅ 30/30 PASS
- Action Order Validation: ✅ 30/30 PASS
- **Overall: 100% pass rate (30/30)**

## Next Steps

1. ✅ Update spec document with validation requirements (COMPLETED)
2. ⏳ Fix validation script regex bug
3. ⏳ Fix remaining 5 test cases in 30_base_validated_cases.html
4. ⏳ Sync both HTML files
5. ⏳ Create comprehensive validation test suite
6. ⏳ Add CI/CD validation checks

## References

- Validation scripts: `validate_all_cases.py`, `validate_action_order.py`
- Spec document: `TEST_CASE_GENERATION_SPEC.md`
- Test files: `30_base_validated_cases.html`, `30_TestCases.html`
- Fix scripts created: `fix_2p_postflop_v3.py`, `fix_3p_preflop.py`

---

**Date:** November 11, 2025
**Severity:** Medium (Validation passes but data incorrect)
**Impact:** 5 test cases unusable until Expected Results fixed
**Status:** Documented, Spec Updated, Fixes Pending
