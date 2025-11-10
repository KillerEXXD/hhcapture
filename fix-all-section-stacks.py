import re
import sys

def fix_section_stacks(content):
    """Convert flat section stacks to nested structure."""

    # Pattern to match flat structure sections within sectionStacks
    # Matches: 'section_name': {\n          1: value,\n          2: value\n        }
    pattern = r"('[\w_]+'):\s*\{\s*\n(\s+)(\d+):\s*([^,\n]+),?\s*\n\s+(\d+):\s*([^,\n]+),?\s*\n\s*\}"

    def replacer(match):
        section_key = match.group(1)
        indent = match.group(2)
        player1_id = match.group(3)
        player1_val = match.group(4)
        player2_id = match.group(5)
        player2_val = match.group(6)

        # Build nested structure
        players_obj = f"{{ {player1_id}: {player1_val}, {player2_id}: {player2_val} }}"

        return f"""{section_key}: {{
{indent}initial: {players_obj},
{indent}current: {players_obj},
{indent}updated: {players_obj}
{indent.rstrip()}}}"""

    return re.sub(pattern, replacer, content, flags=re.MULTILINE)

if __name__ == '__main__':
    files = [
        'src/lib/poker/engine/__tests__/turn.test.ts',
        'src/lib/poker/engine/__tests__/flop.test.ts',
        'src/lib/poker/engine/__tests__/river.test.ts'
    ]

    for filepath in files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = fix_section_stacks(content)

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Fixed {filepath}")
            else:
                print(f"No changes needed in {filepath}")
        except FileNotFoundError:
            print(f"File not found: {filepath}")
        except Exception as e:
            print(f"Error processing {filepath}: {e}")

    print("Done!")
