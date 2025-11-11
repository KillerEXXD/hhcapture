"""
Automated Test Case Fixer
- Fixes default collapsed state
- Fixes 2-player postflop action order
- Fixes 3-player preflop action order
- Fixes negative stack issues
"""

import re
import sys

def fix_collapsed_state(content):
    """Change default expanded state to collapsed"""
    print("Fixing default collapsed state...")

    # Change expanded to collapsed in test-content
    content = re.sub(
        r'<div class="test-content expanded">',
        r'<div class="test-content collapsed">',
        content
    )

    # Change expanded arrow to collapsed arrow
    content = re.sub(
        r'<span class="collapse-icon expanded">▼</span>',
        r'<span class="collapse-icon collapsed">▶</span>',
        content
    )

    print("[OK] Changed all test cases to collapsed by default")
    return content

def read_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(filename, content):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    filename = '30_base_validated_cases.html'

    print("=" * 80)
    print("AUTOMATED TEST CASE FIXER")
    print("=" * 80)
    print()

    # Read file
    print(f"Reading {filename}...")
    content = read_file(filename)

    # Step 1: Fix collapsed state
    content = fix_collapsed_state(content)

    # Write back
    print(f"\nWriting changes to {filename}...")
    write_file(filename, content)

    print()
    print("=" * 80)
    print("[OK] STEP 1 COMPLETE: Default collapsed state fixed")
    print("=" * 80)
    print()
    print("Next: Run validation to confirm, then fix action order issues")

if __name__ == '__main__':
    main()
