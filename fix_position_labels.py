#!/usr/bin/env python3
"""
Fix position label errors in all pot test case batch files.

This script removes extra position labels (UTG, UTG+1, UTG+2, MP, HJ, CO)
from Stack Setup sections while keeping only Dealer, SB, and BB labels.

Fixes applied to:
- pot-test-cases-batch-1.html
- pot-test-cases-batch-2.html
- pot-test-cases-batch-3.html
- pot-test-cases-batch-4.html
"""

import re
import os
from pathlib import Path

# Position labels to remove (keep only Dealer, SB, BB)
POSITIONS_TO_REMOVE = ['UTG', 'UTG+1', 'UTG+2', 'MP', 'HJ', 'CO']

def fix_position_labels(content):
    """
    Remove extra position labels from Stack Setup sections.

    Pattern matches:
    PlayerName POSITION Stack

    Where POSITION is one of: UTG, UTG+1, UTG+2, MP, HJ, CO

    Replaces with:
    PlayerName Stack
    """
    fixed_content = content
    total_fixes = 0

    # Create pattern for each position to remove
    for position in POSITIONS_TO_REMOVE:
        # Escape special characters in position (e.g., UTG+1 -> UTG\+1)
        escaped_position = re.escape(position)

        # Pattern: PlayerName POSITION Stack
        # Match: word characters (player name), space, position, space, digits (stack)
        # Replace: PlayerName Stack (remove position)
        pattern = r'(\w+)\s+' + escaped_position + r'\s+(\d+)'
        replacement = r'\1 \2'

        # Count replacements
        matches = re.findall(pattern, fixed_content)
        total_fixes += len(matches)

        # Apply replacement
        fixed_content = re.sub(pattern, replacement, fixed_content)

    return fixed_content, total_fixes

def process_file(filepath):
    """Process a single HTML file to remove position labels."""
    print(f"\n{'='*60}")
    print(f"Processing: {filepath.name}")
    print(f"{'='*60}")

    # Read file
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix position labels
    fixed_content, fixes_count = fix_position_labels(content)

    # Write back to file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(fixed_content)

    print(f"✓ Fixed {fixes_count} position label errors")
    print(f"✓ File updated: {filepath}")

    return fixes_count

def main():
    """Main function to process all batch files."""
    print("\n" + "="*60)
    print("POSITION LABEL FIX SCRIPT")
    print("="*60)
    print("\nRemoving extra position labels (UTG, MP, HJ, CO, etc.)")
    print("Keeping only: Dealer, SB, BB\n")

    # Define batch files
    docs_dir = Path(__file__).parent / 'docs'
    batch_files = [
        docs_dir / 'pot-test-cases-batch-1.html',
        docs_dir / 'pot-test-cases-batch-2.html',
        docs_dir / 'pot-test-cases-batch-3.html',
        docs_dir / 'pot-test-cases-batch-4.html',
    ]

    total_fixes = 0

    # Process each file
    for filepath in batch_files:
        if filepath.exists():
            fixes = process_file(filepath)
            total_fixes += fixes
        else:
            print(f"⚠ File not found: {filepath}")

    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total files processed: {len(batch_files)}")
    print(f"Total position labels removed: {total_fixes}")
    print("\n✓ All batch files updated successfully!")
    print("="*60 + "\n")

if __name__ == '__main__':
    main()
