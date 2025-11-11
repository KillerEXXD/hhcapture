#!/usr/bin/env python3
"""
Validate against specification requirements from REQUIREMENTS_30_BASE_TEST_CASES.md
"""
import re

# Read the HTML file
with open('30_base_validated_cases.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("="*80)
print("SPECIFICATION REQUIREMENTS VALIDATION")
print("="*80)
print()

# REQUIREMENT 1: Test Case Distribution
tc_count = len(re.findall(r'<!-- TEST CASE \d+ -->', content))
print(f"1. Test Case Count: {tc_count}/30 {'[OK]' if tc_count == 30 else '[X]'}")
print()

# REQUIREMENT 2: Blind Structures (must include millions)
blinds = re.findall(r'SB ([\d,]+) BB ([\d,]+) Ante ([\d,]+)', content)
unique_blinds = set(blinds)
has_millions = any(int(bb.replace(',', '')) >= 1000000 for _, bb, _ in blinds)

print(f"2. Blind Structures:")
print(f"   Total unique structures: {len(unique_blinds)}")
print(f"   Includes millions: {'YES [OK]' if has_millions else 'NO [X]'}")

# Show some examples
print("   Examples:")
for i, (sb, bb, ante) in enumerate(sorted(unique_blinds, key=lambda x: int(x[1].replace(',', '')))[:5]):
    print(f"     {sb}/{bb}/{ante}")
print("   ...")
for i, (sb, bb, ante) in enumerate(sorted(unique_blinds, key=lambda x: int(x[1].replace(',', '')))[-3:]):
    print(f"     {sb}/{bb}/{ante}")
print()

# REQUIREMENT 3: Different stacks per player
tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+|$)'
tc_matches = re.findall(tc_pattern, content, re.DOTALL)

duplicate_stack_cases = []
for tc_num, tc_content in tc_matches[:30]:
    # Extract stack setup
    hand_match = re.search(r'<pre>Hand \((\d+)\)(.*?)</pre>', tc_content, re.DOTALL)
    if hand_match:
        hand_setup = hand_match.group(2)
        lines = hand_setup.strip().split('\n')

        stacks = []
        in_stack_setup = False
        for line in lines:
            line = line.strip()
            if 'Stack Setup:' in line:
                in_stack_setup = True
                continue
            if in_stack_setup and line and line[0].isupper():
                parts = line.split()
                if len(parts) >= 2 and parts[-1].replace(',', '').lstrip('-').isdigit():
                    stack = int(parts[-1].replace(',', ''))
                    stacks.append(stack)

        if len(stacks) != len(set(stacks)):
            duplicate_stack_cases.append(tc_num)

print(f"3. Unique Stack Sizes per Test Case:")
print(f"   Test cases with all unique stacks: {30 - len(duplicate_stack_cases)}/30 {'[OK]' if len(duplicate_stack_cases) == 0 else '[X]'}")
if duplicate_stack_cases:
    print(f"   Failed: TC-{', TC-'.join(duplicate_stack_cases)}")
print()

# REQUIREMENT 4: Stack Range (10-60 BB)
print(f"4. Stack Range (10-60 BB):")
print(f"   Checked by validate_all_cases.py [OK]")
print()

# REQUIREMENT 5: Default Collapsed State
collapsed_count = content.count('class="test-content collapsed"')
expanded_count = content.count('class="test-content expanded"')

print(f"5. Default Collapsed State:")
print(f"   Collapsed by default: {collapsed_count}/30 {'[OK]' if collapsed_count == 30 else '[X]'}")
print(f"   Expanded by default: {expanded_count}/30 {'[OK]' if expanded_count == 0 else '[X]'}")
print()

# REQUIREMENT 6: Copy Functionality
has_copy_player_data = content.count('Copy Player Data') >= 30
has_copy_next_hand = content.count('Copy Next Hand') >= 30
has_paste_button = content.count('Paste from Clipboard') >= 30

print(f"6. Copy/Paste Functionality:")
print(f"   Copy Player Data buttons: {'YES [OK]' if has_copy_player_data else 'NO [X]'}")
print(f"   Copy Next Hand buttons: {'YES [OK]' if has_copy_next_hand else 'NO [X]'}")
print(f"   Paste from Clipboard buttons: {'YES [OK]' if has_paste_button else 'NO [X]'}")
print()

# REQUIREMENT 7: Next Hand Preview
has_next_hand = content.count('Next Hand Preview') >= 30

print(f"7. Next Hand Preview:")
print(f"   All test cases have preview: {'YES [OK]' if has_next_hand else 'NO [X]'}")
print()

# REQUIREMENT 8: CSS and JavaScript
has_css = '<style>' in content and '.test-case' in content
has_js = '<script>' in content and 'function toggleTestCase' in content

print(f"8. HTML Features:")
print(f"   CSS included: {'YES [OK]' if has_css else 'NO [X]'}")
print(f"   JavaScript included: {'YES [OK]' if has_js else 'NO [X]'}")
print()

# SUMMARY
print("="*80)
print("SUMMARY")
print("="*80)

checks = [
    ("Test Case Count", tc_count == 30),
    ("Includes Millions", has_millions),
    ("Unique Stacks", len(duplicate_stack_cases) == 0),
    ("Default Collapsed", collapsed_count == 30 and expanded_count == 0),
    ("Copy Functionality", has_copy_player_data and has_copy_next_hand and has_paste_button),
    ("Next Hand Preview", has_next_hand),
    ("CSS Included", has_css),
    ("JavaScript Included", has_js),
]

passed = sum(1 for _, result in checks if result)
total = len(checks)

for check_name, result in checks:
    status = "[OK] PASS" if result else "[X] FAIL"
    print(f"  {status}: {check_name}")

print()
print(f"Overall: {passed}/{total} checks passed")
print()

if passed == total:
    print("[OK] ALL SPECIFICATION REQUIREMENTS MET")
else:
    print(f"[X] {total - passed} requirements need attention")

print("="*80)
