#!/usr/bin/env python3
"""
Merge 30_base_validated_cases.html with 10_sidepot_cases.html to create 40_TestCases.html
"""
import re

# Read the 30 test case file
with open('30_base_validated_cases.html', 'r', encoding='utf-8') as f:
    base_content = f.read()

# Read the 10 test case file
with open('10_sidepot_cases.html', 'r', encoding='utf-8') as f:
    new_content = f.read()

# Extract just the test case sections from the new file (TC-31 through TC-40)
# Pattern: <!-- TEST CASE XX --> through the next test case or end
test_case_pattern = r'(<!-- TEST CASE \d+ -->.*?)(?=<!-- TEST CASE \d+ -->|</body>)'
new_test_cases = re.findall(test_case_pattern, new_content, re.DOTALL)

print(f"Found {len(new_test_cases)} test cases in new file")

# Find where to insert in base file (before closing body tag)
# The base file ends with </body></html>
insertion_point = base_content.rfind('</body>')

if insertion_point == -1:
    print("[ERROR] Could not find </body> tag in base file")
    exit(1)

# Insert the new test cases before </body>
merged_content = (
    base_content[:insertion_point] +
    '\n'.join(new_test_cases) +
    '\n' +
    base_content[insertion_point:]
)

# Update title if present
merged_content = merged_content.replace(
    '<title>30 Poker Hand History Test Cases</title>',
    '<title>40 Poker Hand History Test Cases</title>'
)

# Write merged file
output_path = '40_TestCases.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(merged_content)

# Verify
with open(output_path, 'r', encoding='utf-8') as f:
    verify_content = f.read()
    tc_count = len(re.findall(r'<!-- TEST CASE (\d+) -->', verify_content))
    print(f"\n[OK] Created {output_path}")
    print(f"[OK] Total test cases: {tc_count}")

# Also copy to main docs folder
import shutil
shutil.copy(output_path, '../40_TestCases.html')
print(f"[OK] Copied to ../40_TestCases.html")
