"""Find all test cases with validation errors"""
import re

with open('40_TestCases_v2.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all test cases
tc_pattern = r'<!-- TEST CASE (\d+) -->(.*?)(?=<!-- TEST CASE \d+|$)'
tc_matches = re.findall(tc_pattern, content, re.DOTALL)

print("=" * 80)
print("TEST CASES WITH VALIDATION ERRORS")
print("=" * 80)
print()

for tc_num, tc_content in tc_matches:
    if 'VALIDATION ERRORS' in tc_content:
        # Extract the error message
        error_match = re.search(r'<li style="color: #c62828;">(.*?)</li>', tc_content, re.DOTALL)
        if error_match:
            error_msg = error_match.group(1).strip()
            print(f"TC-{tc_num}: {error_msg}")
        else:
            print(f"TC-{tc_num}: Has validation error (message not found)")

print()
print("=" * 80)
