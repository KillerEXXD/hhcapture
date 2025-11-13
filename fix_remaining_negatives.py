#!/usr/bin/env python3
"""
Fix all remaining negative New Stack values and Next Hand Preview sections.
"""

import re

def read_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(filepath, content):
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def find_all_negative_new_stacks(content):
    """Find all remaining negative New Stack values"""
    # Pattern: last <td> in a row with negative number
    pattern = r'<td>(-\d{1,3}(?:,\d{3})*)</td>\s*</tr>'
    matches = re.finditer(pattern, content)

    negatives = []
    for match in matches:
        value = match.group(1)
        start = match.start()
        # Get some context to identify which test case
        context_start = max(0, start - 500)
        context = content[context_start:start]

        # Find test case ID
        tc_match = re.search(r'<div class="test-id">(TC-\d+)</div>', context)
        if tc_match:
            tc_id = tc_match.group(1)
            negatives.append((tc_id, value, match.start(), match.end()))

    return negatives

def fix_all_negative_new_stacks(content):
    """Replace all negative New Stack values with 0"""
    print("Finding all negative New Stack values...")

    # Pattern: last <td> in table row with negative value
    pattern = r'(<td>)(-\d{1,3}(?:,\d{3})*)(</td>\s*</tr>)'
    matches = list(re.finditer(pattern, content))

    print(f"Found {len(matches)} negative New Stack values")

    # Replace from end to start to maintain positions
    for match in reversed(matches):
        old_value = match.group(2)
        content = content[:match.start()] + match.group(1) + '0' + match.group(3) + content[match.end():]
        print(f"  Fixed: {old_value} -> 0")

    return content

def fix_all_next_hand_negatives(content):
    """Fix negative stack values in Next Hand Preview sections"""
    print("\nFixing negative stacks in Next Hand Previews...")

    # Pattern: PlayerName Position -Stack (with or without position)
    # Example: "Bob SB -10000" or "Alice -100000"
    pattern = r'(\w+ (?:Dealer |SB |BB )?)-(\d{1,3}(?:,?\d{3})*)'

    def replace_negative(match):
        prefix = match.group(1)
        return prefix + '0'

    # Fix in copy buttons
    content = re.sub(r'(onclick="copyPlayerData\(this, `[^`]*?)' + pattern, replace_negative, content)

    # Fix in next-hand-content divs
    content = re.sub(r'(<div class="next-hand-content">.*?)' + pattern, replace_negative, content, flags=re.DOTALL)

    # Fix in compare buttons
    content = re.sub(r'(onclick="compareNextHand\([^`]*`[^`]*?)' + pattern, replace_negative, content)

    print("  Fixed Next Hand Preview sections")

    return content

def main():
    filepath = r'C:\Apps\HUDR\HHTool_Modular\docs\QA\30_TestCases.html'

    print("Reading test cases file...")
    content = read_file(filepath)

    # Fix all negative New Stack values (last column in table)
    content = fix_all_negative_new_stacks(content)

    # Fix all negative values in Next Hand Previews
    content = fix_all_next_hand_negatives(content)

    print("\nWriting updated file...")
    write_file(filepath, content)
    print("Done! All negative values fixed.")

if __name__ == '__main__':
    main()
