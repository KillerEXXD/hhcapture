import re

def fix_sectionstacks_in_file(filepath):
    """Fix flat sectionStacks to nested structure in engine test files."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match a single flat section entry within sectionStacks
    # Matches: 'section_name': {\n          1: value,\n          2: value\n        }
    def fix_section(match):
        indent = match.group(1)
        section_name = match.group(2)
        entries_str = match.group(3)

        # Parse the entries
        entries = []
        for line in entries_str.strip().split('\n'):
            line = line.strip()
            if line and line != '}':
                # Remove trailing comma
                line = line.rstrip(',')
                entries.append(line)

        if not entries:
            return match.group(0)

        # Build the players object
        players_obj = '{ ' + ', '.join(entries) + ' }'

        # Return nested structure
        return f"""{indent}{section_name}: {{
{indent}  initial: {players_obj},
{indent}  current: {players_obj},
{indent}  updated: {players_obj}
{indent}}}"""

    # Pattern to match section entries that are flat (not already nested)
    # Look for sections that have direct number keys (not initial/current/updated)
    pattern = r"([ \t]+)('[^']+'):\s*\{([^}]*\d+:\s*\d+[^}]*)\}"

    # Keep replacing until no more matches (handles all sections)
    prev_content = None
    while prev_content != content:
        prev_content = content
        content = re.sub(pattern, fix_section, content, flags=re.MULTILINE)

    return content

# Fix the three engine test files
files = [
    'src/lib/poker/engine/__tests__/turn.test.ts',
    'src/lib/poker/engine/__tests__/river.test.ts',
    'src/lib/poker/engine/__tests__/flop.test.ts'
]

for filepath in files:
    try:
        original = open(filepath, 'r', encoding='utf-8').read()
        fixed = fix_sectionstacks_in_file(filepath)

        if fixed != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print(f"Fixed {filepath}")
        else:
            print(f"No changes in {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

print("Done!")
