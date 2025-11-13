#!/usr/bin/env python3
"""
Regenerate only TC-48 with the fixes applied
"""
import random
from generate_10_extended_actions import ExtendedActionGenerator

# Set seed for reproducibility
random.seed(48)

# TC-48 configuration
config = {
    'tc_num': 48,
    'num_players': 4,
    'complexity': 'Complex',
    'extended_streets': ['preflop', 'flop', 'turn', 'river'],
    'go_to_river': True
}

print("=" * 80)
print(f"REGENERATING TC-{config['tc_num']}: {config['num_players']}P {config['complexity']} - Extended on {', '.join(config['extended_streets'])}")
print("=" * 80)

# Generate the test case
gen = ExtendedActionGenerator(**config)
html = gen.generate()

# Write to file
with open('tc48_new.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("\n" + "=" * 80)
print(f"✅ TC-{config['tc_num']} REGENERATED SUCCESSFULLY")
print(f"Output written to: tc48_new.html")
print("=" * 80)
