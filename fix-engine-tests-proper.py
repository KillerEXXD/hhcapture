import re

def fix_engine_test_file(content):
    """Fix engine test files: change vitest to jest, fix sectionStacks only."""

    # Step 1: Fix import
    content = content.replace(
        "import { describe, it, expect } from 'vitest';",
        "import { describe, it, expect } from '@jest/globals';"
    )

    # Step 2: Fix ONLY sectionStacks (not contributedAmounts)
    # Pattern to match sectionStacks assignment and its nested sections
    # We'll find "const sectionStacks: SectionStacks = {" and then fix sections within it

    def fix_section_stacks_block(match):
        """Fix all flat sections within a sectionStacks block."""
        prefix = match.group(1)
        sections_block = match.group(2)

        # Pattern to match a flat section: 'name': {\n          1: val,\n          2: val\n        }
        section_pattern = r"('[\w_]+'):\s*\{\s*\n(\s+)(\d+):\s*([^,\n]+),?\s*\n\s+(\d+):\s*([^,\n]+),?\s*\n\s*\}"

        def fix_section(section_match):
            name = section_match.group(1)
            indent = section_match.group(2)
            id1 = section_match.group(3)
            val1 = section_match.group(4)
            id2 = section_match.group(5)
            val2 = section_match.group(6)

            players_obj = f"{{ {id1}: {val1}, {id2}: {val2} }}"

            return f"""{name}: {{
{indent}initial: {players_obj},
{indent}current: {players_obj},
{indent}updated: {players_obj}
{indent.rstrip()}}}"""

        fixed_sections = re.sub(section_pattern, fix_section, sections_block, flags=re.MULTILINE)
        return prefix + fixed_sections

    # Match the entire sectionStacks assignment block
    sectionstacks_pattern = r"(const sectionStacks: SectionStacks = \{)(.*?)(\n\s*\};)"
    content = re.sub(
        sectionstacks_pattern,
        fix_section_stacks_block,
        content,
        flags=re.DOTALL | re.MULTILINE
    )

    return content

if __name__ == '__main__':
    files = [
        'src/lib/poker/engine/__tests__/turn.test.ts',
        'src/lib/poker/engine/__tests__/river.test.ts',
        'src/lib/poker/engine/__tests__/flop.test.ts'
    ]

    for filepath in files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = fix_engine_test_file(content)

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Fixed {filepath}")
            else:
                print(f"No changes in {filepath}")
        except FileNotFoundError:
            print(f"Not found: {filepath}")
        except Exception as e:
            print(f"Error in {filepath}: {e}")

    print("Done!")
