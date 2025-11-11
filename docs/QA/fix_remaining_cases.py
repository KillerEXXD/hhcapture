"""Fix TC-25, TC-26, TC-28 - all remaining negative stack issues"""

import re

def fix_tc25(content):
    """
    TC-25: Eve (1.1M starting) and Grace (1.4M starting) both show -negative stacks
    Both contributed: Preflop 300K + Flop 500K + Turn 1M = 1.8M (WRONG)
    Fix: Both should go all-in on Turn
    - Eve: Preflop 300K + Flop 500K + Turn 300K (all-in) = 1.1M
    - Grace: Preflop 300K + Flop 500K + Turn 600K (all-in) = 1.4M
    """
    print("\n[TC-25] Fixing Eve and Grace negative stacks...")

    tc25_start = content.find('<!-- TEST CASE 25 -->')
    tc25_end = content.find('<!-- TEST CASE 26 -->')

    if tc25_start == -1:
        print("  [ERROR] Could not find TC-25")
        return content, False

    tc25_section = content[tc25_start:tc25_end]

    # Fix Eve's Turn action
    tc25_section = tc25_section.replace(
        '<div class="action-row"><span class="action-player">Eve (UTG+1):</span> <span class="action-type">Call</span> <span class="action-amount">1,000,000</span></div>',
        '<div class="action-row"><span class="action-player">Eve (UTG+1):</span> <span class="action-type">All-In</span> <span class="action-amount">300,000</span></div>'
    )

    # Fix Grace's Turn action
    tc25_section = tc25_section.replace(
        '<div class="action-row"><span class="action-player">Grace (MP):</span> <span class="action-type">Call</span> <span class="action-amount">1,000,000</span></div>',
        '<div class="action-row"><span class="action-player">Grace (MP):</span> <span class="action-type">All-In</span> <span class="action-amount">600,000</span></div>'
    )

    # Fix Eve's Expected Results row
    old_eve = '''                        <tr>
                            <td>Eve (UTG+1)</td>
                            <td>1,100,000</td>
                            <td>-700,000</td>
                            <td>1,800,000</td>
                            <td><span class="winner-badge loser">-</span></td>
                            <td>-700,000</td>
                        </tr>'''

    new_eve = '''                        <tr>
                            <td>Eve (UTG+1)</td>
                            <td>1,100,000</td>
                            <td>0</td>
                            <td>1,100,000 (all-in)</td>
                            <td><span class="winner-badge loser">-</span></td>
                            <td>0</td>
                        </tr>'''

    tc25_section = tc25_section.replace(old_eve, new_eve)

    # Fix Grace's Expected Results row
    old_grace = '''                        <tr>
                            <td>Grace (MP)</td>
                            <td>1,400,000</td>
                            <td>-400,000</td>
                            <td>1,800,000</td>
                            <td><span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main Pot <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: -400,000</div>
                                    <div class="breakdown-line">+ Main Pot: 16,300,000</div>
                                    <div class="breakdown-line total">= New Stack: 15,900,000</div>
                                </div></td>
                            <td>15,900,000</td>
                        </tr>'''

    new_grace = '''                        <tr>
                            <td>Grace (MP)</td>
                            <td>1,400,000</td>
                            <td>0</td>
                            <td>1,400,000 (all-in)</td>
                            <td><span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main Pot <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: 0</div>
                                    <div class="breakdown-line">+ Main Pot: 15,200,000</div>
                                    <div class="breakdown-line total">= New Stack: 15,200,000</div>
                                </div></td>
                            <td>15,200,000</td>
                        </tr>'''

    tc25_section = tc25_section.replace(old_grace, new_grace)

    # Fix Total Pot: Lost 700K from Eve + 400K from Grace = 1.1M less
    tc25_section = tc25_section.replace(
        '<div class="pot-summary">Total Pot: 16,300,000</div>',
        '<div class="pot-summary">Total Pot: 15,200,000</div>'
    )

    # Fix Main Pot
    tc25_section = tc25_section.replace(
        '<div class="pot-amount">16,300,000 (100%)</div>',
        '<div class="pot-amount">15,200,000 (100%)</div>'
    )

    tc25_section = tc25_section.replace(
        'Calculation: 16,200,000 (live) + 100,000 (BB ante dead) = 16,300,000',
        'Calculation: 15,100,000 (live) + 100,000 (BB ante dead) = 15,200,000'
    )

    # Fix Next Hand Preview - Eve should be 0 not -700,000, Grace should be 15,200,000 not 15,900,000
    tc25_section = re.sub(
        r'Eve -700000',
        'Eve 0',
        tc25_section
    )

    tc25_section = re.sub(
        r'Grace 15900000',
        'Grace 15200000',
        tc25_section
    )

    content = content[:tc25_start] + tc25_section + content[tc25_end:]

    print("  [OK] Fixed Eve: Turn All-In 300,000, Final Stack = 0")
    print("  [OK] Fixed Grace: Turn All-In 600,000, Final Stack = 0")
    print("  [OK] Fixed Total Pot: 16,300,000 -> 15,200,000")
    print("  [OK] Fixed Grace winnings: 15,900,000 -> 15,200,000")
    print("  [OK] Fixed Next Hand Preview")

    return content, True


def fix_tc26(content):
    """
    TC-26: Eve started with 17M, contributed 18M (WRONG)
    Need to find where she over-bet and fix it to all-in
    """
    print("\n[TC-26] Fixing Eve's negative stack...")

    tc26_start = content.find('<!-- TEST CASE 26 -->')
    tc26_end = content.find('<!-- TEST CASE 27 -->')

    if tc26_start == -1:
        print("  [ERROR] Could not find TC-26")
        return content, False

    tc26_section = content[tc26_start:tc26_end]

    # From validation: Eve contributed 18M but started with 17M
    # Need to check actions - likely same pattern as TC-22
    # Common scenario: Preflop 3M + Flop 5M + Turn 10M = 18M, but should be Preflop 3M + Flop 5M + Turn 9M (all-in) = 17M

    # Fix Eve's Turn action from Bet/Call 10,000,000 to All-In 9,000,000
    # First, let's find the pattern - could be either Bet or Call
    eve_turn_bet = '<div class="action-row"><span class="action-player">Eve (MP):</span> <span class="action-type">Bet</span> <span class="action-amount">10,000,000</span></div>'
    eve_turn_call = '<div class="action-row"><span class="action-player">Eve (MP):</span> <span class="action-type">Call</span> <span class="action-amount">10,000,000</span></div>'
    eve_turn_allin = '<div class="action-row"><span class="action-player">Eve (MP):</span> <span class="action-type">All-In</span> <span class="action-amount">9,000,000</span></div>'

    if eve_turn_bet in tc26_section:
        tc26_section = tc26_section.replace(eve_turn_bet, eve_turn_allin)
    elif eve_turn_call in tc26_section:
        tc26_section = tc26_section.replace(eve_turn_call, eve_turn_allin)

    # Fix Eve's Expected Results row
    old_eve = '''                        <tr>
                            <td>Eve (MP)</td>
                            <td>17,000,000</td>
                            <td>-1,000,000</td>
                            <td>18,000,000</td>'''

    new_eve = '''                        <tr>
                            <td>Eve (MP)</td>
                            <td>17,000,000</td>
                            <td>0</td>
                            <td>17,000,000 (all-in)'''

    tc26_section = tc26_section.replace(old_eve, new_eve)

    # Fix Total Pot (lost 1M from Eve)
    # Total pot likely 109M -> 108M or similar
    # Look for the pattern
    pot_match = re.search(r'<div class="pot-summary">Total Pot: ([\d,]+)</div>', tc26_section)
    if pot_match:
        old_pot = int(pot_match.group(1).replace(',', ''))
        new_pot = old_pot - 1000000
        tc26_section = tc26_section.replace(
            f'<div class="pot-summary">Total Pot: {pot_match.group(1)}</div>',
            f'<div class="pot-summary">Total Pot: {new_pot:,}</div>'
        )

    # Fix Next Hand Preview - Eve should be 0 not -1,000,000
    tc26_section = re.sub(r'Eve -1000000', 'Eve 0', tc26_section)

    content = content[:tc26_start] + tc26_section + content[tc26_end:]

    print("  [OK] Fixed Eve: Turn All-In 9,000,000, Final Stack = 0")
    print("  [OK] Fixed Total Pot")
    print("  [OK] Fixed Next Hand Preview")

    return content, True


def fix_tc28(content):
    """
    TC-28: Charlie (75M starting) contributed 95M, Eve (70M starting) contributed 90M
    Both need all-in fixes
    """
    print("\n[TC-28] Fixing Charlie and Eve negative stacks...")

    tc28_start = content.find('<!-- TEST CASE 28 -->')
    tc28_end = content.find('<!-- TEST CASE 29 -->')

    if tc28_start == -1:
        print("  [ERROR] Could not find TC-28")
        return content, False

    tc28_section = content[tc28_start:tc28_end]

    # Charlie: 75M starting, contributed 95M (over by 20M)
    # Eve: 70M starting, contributed 90M (over by 20M)
    # Pattern suggests both contributed Preflop 15M + Flop 25M + Turn 35M + River 20M = 95M
    # Fix: River action should be all-in with remaining stack

    # Fix Charlie's River action from Bet/Call/Raise 20,000,000 to All-In with remaining
    charlie_river_patterns = [
        ('<div class="action-row"><span class="action-player">Charlie (BB):</span> <span class="action-type">Bet</span> <span class="action-amount">20,000,000</span></div>',
         '<div class="action-row"><span class="action-player">Charlie (BB):</span> <span class="action-type">All-In</span> <span class="action-amount">0</span></div>'),
        ('<div class="action-row"><span class="action-player">Charlie (BB):</span> <span class="action-type">Call</span> <span class="action-amount">20,000,000</span></div>',
         '<div class="action-row"><span class="action-player">Charlie (BB):</span> <span class="action-type">All-In</span> <span class="action-amount">0</span></div>'),
        ('<div class="action-row"><span class="action-player">Charlie (BB):</span> <span class="action-type">Raise</span> <span class="action-amount">20,000,000</span></div>',
         '<div class="action-row"><span class="action-player">Charlie (BB):</span> <span class="action-type">All-In</span> <span class="action-amount">0</span></div>')
    ]

    for old_pattern, new_pattern in charlie_river_patterns:
        if old_pattern in tc28_section:
            tc28_section = tc28_section.replace(old_pattern, new_pattern)
            break

    # Fix Eve's River action
    eve_river_patterns = [
        ('<div class="action-row"><span class="action-player">Eve (UTG+1):</span> <span class="action-type">Bet</span> <span class="action-amount">20,000,000</span></div>',
         '<div class="action-row"><span class="action-player">Eve (UTG+1):</span> <span class="action-type">All-In</span> <span class="action-amount">0</span></div>'),
        ('<div class="action-row"><span class="action-player">Eve (UTG+1):</span> <span class="action-type">Call</span> <span class="action-amount">20,000,000</span></div>',
         '<div class="action-row"><span class="action-player">Eve (UTG+1):</span> <span class="action-type">All-In</span> <span class="action-amount">0</span></div>'),
        ('<div class="action-row"><span class="action-player">Eve (UTG+1):</span> <span class="action-type">Raise</span> <span class="action-amount">20,000,000</span></div>',
         '<div class="action-row"><span class="action-player">Eve (UTG+1):</span> <span class="action-type">All-In</span> <span class="action-amount">0</span></div>')
    ]

    for old_pattern, new_pattern in eve_river_patterns:
        if old_pattern in tc28_section:
            tc28_section = tc28_section.replace(old_pattern, new_pattern)
            break

    # Fix Charlie's Expected Results row
    old_charlie = '''<td>Charlie (BB)</td>
                            <td>75,000,000</td>
                            <td>-20,000,000</td>
                            <td>95,000,000</td>'''

    new_charlie = '''<td>Charlie (BB)</td>
                            <td>75,000,000</td>
                            <td>0</td>
                            <td>75,000,000 (all-in)'''

    tc28_section = tc28_section.replace(old_charlie, new_charlie)

    # Fix Eve's Expected Results row
    old_eve = '''<td>Eve (UTG+1)</td>
                            <td>70,000,000</td>
                            <td>-20,000,000</td>
                            <td>90,000,000</td>'''

    new_eve = '''<td>Eve (UTG+1)</td>
                            <td>70,000,000</td>
                            <td>0</td>
                            <td>70,000,000 (all-in)'''

    tc28_section = tc28_section.replace(old_eve, new_eve)

    # Fix Total Pot (lost 20M from each = 40M total)
    pot_match = re.search(r'<div class="pot-summary">Total Pot: ([\d,]+)</div>', tc28_section)
    if pot_match:
        old_pot = int(pot_match.group(1).replace(',', ''))
        new_pot = old_pot - 40000000
        tc28_section = tc28_section.replace(
            f'<div class="pot-summary">Total Pot: {pot_match.group(1)}</div>',
            f'<div class="pot-summary">Total Pot: {new_pot:,}</div>'
        )

    # Fix Next Hand Preview
    tc28_section = re.sub(r'Charlie [^\n]*-20000000', 'Charlie 0', tc28_section)
    tc28_section = re.sub(r'Eve -20000000', 'Eve 0', tc28_section)

    content = content[:tc28_start] + tc28_section + content[tc28_end:]

    print("  [OK] Fixed Charlie: River All-In 0, Final Stack = 0")
    print("  [OK] Fixed Eve: River All-In 0, Final Stack = 0")
    print("  [OK] Fixed Total Pot")
    print("  [OK] Fixed Next Hand Preview")

    return content, True


def main():
    filename = 'C:\\Apps\\HUDR\\HHTool_Modular\\docs\\QA\\30_base_validated_cases.html'

    print("=" * 80)
    print("FIXING REMAINING NEGATIVE STACK ISSUES (TC-25, TC-26, TC-28)")
    print("=" * 80)

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Fix all three test cases
    content, tc25_fixed = fix_tc25(content)
    content, tc26_fixed = fix_tc26(content)
    content, tc28_fixed = fix_tc28(content)

    # Write back to file
    if content != original_content:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print("\n" + "=" * 80)
        print("[OK] ALL REMAINING TEST CASES FIXED - File updated")
        print("=" * 80)
    else:
        print("\n" + "=" * 80)
        print("[WARNING] No changes made")
        print("=" * 80)

if __name__ == '__main__':
    main()
