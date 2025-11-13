#!/usr/bin/env python3
"""
Comprehensively fix ALL negative Final Stack values in the HTML file.
"""

import re

def read_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(filepath, content):
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_all_negative_final_stacks(content):
    """
    Find and fix all table rows with negative Final Stack values.
    Pattern: <td>PlayerName</td> <td>StartingStack</td> <td>NegativeFinalStack</td> <td>Contribution</td>
    Fix: Set FinalStack=0, Contribution=StartingStack
    """
    print("Finding and fixing all negative Final Stack values...")

    # Pattern to match table rows with negative final stacks
    # Group 1: Everything before the final stack cell
    # Group 2: Player name
    # Group 3: Starting stack
    # Group 4: Negative final stack value
    # Group 5: Contribution value
    # Group 6: Everything after contribution
    pattern = r'(<tr>\s*<td>(\w+) \([^)]+\)</td>\s*<td>)([\d,]+)(</td>\s*<td>)(-[\d,]+)(</td>\s*<td>)([\d,]+)(</td>)'

    matches = list(re.finditer(pattern, content))
    print(f"Found {len(matches)} rows with negative Final Stack values")

    # Replace from end to start to maintain positions
    for match in reversed(matches):
        player = match.group(2)
        starting_stack = match.group(3).replace(',', '')
        negative_final = match.group(5)
        old_contribution = match.group(7)

        # Corrected values
        new_final = '0'
        new_contribution = f"{int(starting_stack):,}"  # Contribution = Starting Stack

        # Build corrected row
        new_row = (match.group(1) + match.group(3) + match.group(4) +
                   new_final + match.group(6) + new_contribution + match.group(8))

        content = content[:match.start()] + new_row + content[match.end():]

        print(f"  Fixed {player}: Final {negative_final} -> 0, Contributed {old_contribution} -> {new_contribution}")

    return content

def fix_winner_breakdowns(content):
    """Fix winner breakdown sections that still reference negative Final Stack values"""
    print("\nFixing winner breakdown sections...")

    # Pattern: <div class="breakdown-line">Final Stack: -XXX</div>
    pattern = r'(<div class="breakdown-line">Final Stack: )(-[\d,]+)(</div>)'

    matches = list(re.finditer(pattern, content))
    print(f"Found {len(matches)} winner breakdowns with negative Final Stack")

    for match in reversed(matches):
        negative_value = match.group(2)
        content = content[:match.start()] + match.group(1) + '0' + match.group(3) + content[match.end():]
        print(f"  Fixed breakdown: {negative_value} -> 0")

    # Also need to recalculate the total in the breakdown
    # Pattern: = New Stack: XXX where we just changed Final Stack to 0
    # New Stack should = 0 + Pot Won
    # Let's update the formula to reflect this

    return content

def recalculate_winner_new_stacks(content):
    """Recalculate New Stack for winners whose Final Stack was negative"""
    print("\nRecalculating New Stack values for fixed winners...")

    # Find patterns like:
    # Final Stack: 0
    # + Main Pot: XXX
    # = New Stack: YYY (where YYY should = 0 + XXX)

    pattern = r'(<div class="breakdown-line">Final Stack: 0</div>\s*' + \
              r'<div class="breakdown-line">\+ (?:Main Pot|Side Pot \d+): )([\d,]+)' + \
              r'(</div>\s*<div class="breakdown-line total">= New Stack: )[\d,]+(</div>)'

    def replace_new_stack(match):
        pot_amount = match.group(2)
        return match.group(1) + pot_amount + match.group(3) + pot_amount + match.group(4)

    content = re.sub(pattern, replace_new_stack, content)

    print("  Recalculated New Stack values for winners")
    return content

def main():
    filepath = r'C:\Apps\HUDR\HHTool_Modular\docs\QA\30_TestCases.html'

    print("Reading test cases file...")
    content = read_file(filepath)

    # Fix all negative Final Stack values
    content = fix_all_negative_final_stacks(content)

    # Fix winner breakdowns
    content = fix_winner_breakdowns(content)

    # Recalculate New Stack for winners
    content = recalculate_winner_new_stacks(content)

    print("\nWriting updated file...")
    write_file(filepath, content)
    print("Done! All negative Final Stack values fixed.")

if __name__ == '__main__':
    main()
