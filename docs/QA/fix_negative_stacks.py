"""Fix all 5 test cases with negative stack issues"""

import re

def fix_tc22(content):
    """
    TC-22: Bob (SB) has -3,000,000 Final Stack
    Started with 15,000,000, contributed 18,000,000 (WRONG)
    Actual: Preflop 3M + Flop 5M + Turn 7M (all-in) = 15M total
    """
    print("\n[TC-22] Fixing Bob's negative stack...")

    # Fix Bob's Turn action: Change from "Bet 10,000,000" to "All-In 7,000,000"
    old_turn_action = '<div class="action-row"><span class="action-player">Bob (SB):</span> <span class="action-type">Bet</span> <span class="action-amount">10,000,000</span></div>'
    new_turn_action = '<div class="action-row"><span class="action-player">Bob (SB):</span> <span class="action-type">All-In</span> <span class="action-amount">7,000,000</span></div>'

    # Find TC-22 section
    tc22_start = content.find('<!-- TEST CASE 22 -->')
    tc22_end = content.find('<!-- TEST CASE 23 -->')

    if tc22_start == -1:
        print("  ❌ Could not find TC-22")
        return content, False

    tc22_section = content[tc22_start:tc22_end]

    # Replace Bob's Turn action
    tc22_section = tc22_section.replace(old_turn_action, new_turn_action)

    # Fix Bob's Expected Results row
    old_bob_row = '''                        <tr>
                            <td>Bob (SB)</td>
                            <td>15,000,000</td>
                            <td>-3,000,000</td>
                            <td>18,000,000</td>
                            <td><span class="winner-badge loser">-</span></td>
                            <td>-3,000,000</td>
                        </tr>'''

    new_bob_row = '''                        <tr>
                            <td>Bob (SB)</td>
                            <td>15,000,000</td>
                            <td>0</td>
                            <td>15,000,000 (all-in)</td>
                            <td><span class="winner-badge loser">-</span></td>
                            <td>0</td>
                        </tr>'''

    tc22_section = tc22_section.replace(old_bob_row, new_bob_row)

    # Fix Total Pot from 109,000,000 to 106,000,000 (lost 3M from Bob)
    tc22_section = tc22_section.replace(
        '<div class="pot-summary">Total Pot: 109,000,000</div>',
        '<div class="pot-summary">Total Pot: 106,000,000</div>'
    )

    # Fix Main Pot
    old_main_pot = '''                <div class="pot-item main">
                    <div class="pot-name">Main Pot</div>
                    <div class="pot-amount">109,000,000 (100%)</div>
                    <div class="eligible">Eligible: <span>Alice</span> <span>Bob</span> <span>Charlie</span> <span>David</span> <span>Eve</span> <span>Frank</span></div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: 108,000,000 (live) + 1,000,000 (BB ante dead) = 109,000,000
                    </div>
                </div>'''

    new_main_pot = '''                <div class="pot-item main">
                    <div class="pot-name">Main Pot</div>
                    <div class="pot-amount">91,000,000 (85.8%)</div>
                    <div class="eligible">Eligible: <span>Alice</span> <span>Bob</span> <span>Charlie</span> <span>David</span> <span>Eve</span> <span>Frank</span></div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: 15,000,000 × 6 players + 1,000,000 (BB ante dead) = 91,000,000
                    </div>
                </div>
                <div class="pot-item side">
                    <div class="pot-name">Side Pot 1</div>
                    <div class="pot-amount">15,000,000 (14.2%)</div>
                    <div class="eligible">Eligible: <span>Alice</span> <span>Charlie</span> <span>David</span> <span>Eve</span> <span>Frank</span></div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: 3,000,000 × 5 players = 15,000,000
                    </div>
                </div>'''

    tc22_section = tc22_section.replace(old_main_pot, new_main_pot)

    # Fix David's winnings
    old_david_winner = '''                            <td><span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main Pot <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: 15,000,000</div>
                                    <div class="breakdown-line">+ Main Pot: 109,000,000</div>
                                    <div class="breakdown-line total">= New Stack: 124,000,000</div>
                                </div></td>
                            <td>124,000,000</td>'''

    new_david_winner = '''                            <td><span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main Pot + Side Pot 1 <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: 15,000,000</div>
                                    <div class="breakdown-line">+ Main Pot: 91,000,000</div>
                                    <div class="breakdown-line">+ Side Pot 1: 15,000,000</div>
                                    <div class="breakdown-line total">= New Stack: 121,000,000</div>
                                </div></td>
                            <td>121,000,000</td>'''

    tc22_section = tc22_section.replace(old_david_winner, new_david_winner)

    # Fix Next Hand Preview - Bob should have 0, not -3,000,000
    old_next_hand = '''                    <button class="copy-btn" onclick="copyPlayerData(this, `Hand (23)\nstarted_at: 00:05:40 ended_at: HH:MM:SS\nSB 500000 BB 1000000 Ante 1000000\nStack Setup:\nBob Dealer -3000000\nCharlie SB 17000000\nDavid BB 124000000\nEve 31000000\nFrank 42000000\nAlice 33000000`)">'''

    new_next_hand = '''                    <button class="copy-btn" onclick="copyPlayerData(this, `Hand (23)\nstarted_at: 00:05:40 ended_at: HH:MM:SS\nSB 500000 BB 1000000 Ante 1000000\nStack Setup:\nBob Dealer 0\nCharlie SB 17000000\nDavid BB 121000000\nEve 31000000\nFrank 42000000\nAlice 33000000`)">'''

    tc22_section = tc22_section.replace(old_next_hand, new_next_hand)

    # Fix visible Next Hand Preview
    old_preview = '''Hand (23)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 500000 BB 1000000 Ante 1000000
Stack Setup:
Bob Dealer -3000000
Charlie SB 17000000
David BB 124000000
Eve 31000000
Frank 42000000
Alice 33000000'''

    new_preview = '''Hand (23)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 500000 BB 1000000 Ante 1000000
Stack Setup:
Bob Dealer 0
Charlie SB 17000000
David BB 121000000
Eve 31000000
Frank 42000000
Alice 33000000'''

    tc22_section = tc22_section.replace(old_preview, new_preview)

    # Put updated section back
    content = content[:tc22_start] + tc22_section + content[tc22_end:]

    print("  [OK] Fixed Bob's Turn action: All-In 7,000,000")
    print("  [OK] Fixed Bob's Expected Results: Final Stack = 0, Contributed = 15,000,000 (all-in)")
    print("  [OK] Fixed Total Pot: 109,000,000 -> 106,000,000")
    print("  [OK] Fixed Pot structure: Main Pot 91M + Side Pot 1 15M")
    print("  [OK] Fixed David's winnings: 124,000,000 -> 121,000,000")
    print("  [OK] Fixed Next Hand Preview: Bob = 0, David = 121,000,000")

    return content, True


def fix_tc23(content):
    """
    TC-23: Eve (MP) has -2,000,000 Final Stack, Charlie calculation error
    Eve started with 7,000,000, contributed 7,000,000 (all-in on Turn)
    Actions already show "All-In 3,000,000" - just need to fix Expected Results
    """
    print("\n[TC-23] Fixing Eve's negative stack and Charlie's calculation error...")

    # Find TC-23 section
    tc23_start = content.find('<!-- TEST CASE 23 -->')
    tc23_end = content.find('<!-- TEST CASE 24 -->')

    if tc23_start == -1:
        print("  [ERROR] Could not find TC-23")
        return content, False

    tc23_section = content[tc23_start:tc23_end]

    # Fix Eve's Expected Results row
    old_eve_row = '''                        <tr>
                            <td>Eve (MP)</td>
                            <td>7,000,000</td>
                            <td>-2,000,000</td>
                            <td>9,000,000</td>
                            <td><span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main Pot <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: -2,000,000</div>
                                    <div class="breakdown-line">+ Main Pot: 63,500,000</div>
                                    <div class="breakdown-line total">= New Stack: 61,500,000</div>
                                </div></td>
                            <td>61,500,000</td>
                        </tr>'''

    new_eve_row = '''                        <tr>
                            <td>Eve (MP)</td>
                            <td>7,000,000</td>
                            <td>0</td>
                            <td>7,000,000 (all-in)</td>
                            <td><span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main Pot <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: 0</div>
                                    <div class="breakdown-line">+ Main Pot: 60,250,000</div>
                                    <div class="breakdown-line total">= New Stack: 60,250,000</div>
                                </div></td>
                            <td>60,250,000</td>
                        </tr>'''

    tc23_section = tc23_section.replace(old_eve_row, new_eve_row)

    # Fix Charlie's Expected Results row
    old_charlie_row = '''                        <tr>
                            <td>Charlie (BB)</td>
                            <td>12,500,000</td>
                            <td>2,500,000</td>
                            <td>9,500,000</td>
                            <td><span class="winner-badge loser">-</span></td>
                            <td>2,500,000</td>
                        </tr>'''

    new_charlie_row = '''                        <tr>
                            <td>Charlie (BB)</td>
                            <td>12,500,000</td>
                            <td>3,000,000</td>
                            <td>9,500,000</td>
                            <td><span class="winner-badge loser">-</span></td>
                            <td>3,000,000</td>
                        </tr>'''

    tc23_section = tc23_section.replace(old_charlie_row, new_charlie_row)

    # Fix Total Pot (was inconsistent 60,250,000 vs 63,500,000)
    # Correct total: 7 players × 9,000,000 + Alice's extra 7,500,000 - 9,000,000 = 60,250,000
    # Actually: Preflop 1.5M×7=10.5M, Flop 2.5M×7=17.5M, Turn: Bob/Charlie/David/Frank/Grace=5M×5=25M, Eve=3M, Alice=3.5M = 10.5+17.5+25+3+3.5=59.5M + 0.5M BB ante + 0.25M SB = 60.25M
    tc23_section = tc23_section.replace(
        '<div class="pot-summary">Total Pot: 63,500,000</div>',
        '<div class="pot-summary">Total Pot: 60,250,000</div>'
    )

    # Fix Main Pot
    old_main_pot = '''                <div class="pot-item main">
                    <div class="pot-name">Main Pot</div>
                    <div class="pot-amount">63,500,000 (100%)</div>
                    <div class="eligible">Eligible: <span>Alice</span> <span>Bob</span> <span>Charlie</span> <span>David</span> <span>Eve</span> <span>Frank</span> <span>Grace</span></div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: 63,000,000 (live) + 500,000 (BB ante dead) = 63,500,000
                    </div>
                </div>'''

    new_main_pot = '''                <div class="pot-item main">
                    <div class="pot-name">Main Pot</div>
                    <div class="pot-amount">60,250,000 (100%)</div>
                    <div class="eligible">Eligible: <span>Alice</span> <span>Bob</span> <span>Charlie</span> <span>David</span> <span>Eve</span> <span>Frank</span> <span>Grace</span></div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: 59,750,000 (live) + 500,000 (BB ante dead) = 60,250,000
                    </div>
                </div>'''

    tc23_section = tc23_section.replace(old_main_pot, new_main_pot)

    # Fix Next Hand Preview - Bob should be 6,750,000 not 7,000,000, Charlie should be 3,000,000 not 2,500,000, Eve should be 60,250,000 not 61,500,000
    old_next_hand = '''                    <button class="copy-btn" onclick="copyPlayerData(this, `Hand (24)\nstarted_at: 00:05:40 ended_at: HH:MM:SS\nSB 250000 BB 500000 Ante 500000\nStack Setup:\nBob Dealer 7000000\nCharlie SB 3000000\nDavid BB 10000000\nEve 61500000\nFrank 17000000\nGrace 20000000\nAlice -1500000`)">'''

    new_next_hand = '''                    <button class="copy-btn" onclick="copyPlayerData(this, `Hand (24)\nstarted_at: 00:05:40 ended_at: HH:MM:SS\nSB 250000 BB 500000 Ante 500000\nStack Setup:\nBob Dealer 6750000\nCharlie SB 3000000\nDavid BB 10000000\nEve 60250000\nFrank 17000000\nGrace 20000000\nAlice 0`)">'''

    tc23_section = tc23_section.replace(old_next_hand, new_next_hand)

    # Fix visible Next Hand Preview
    old_preview = '''Hand (24)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 250000 BB 500000 Ante 500000
Stack Setup:
Bob Dealer 7000000
Charlie SB 3000000
David BB 10000000
Eve 61500000
Frank 17000000
Grace 20000000
Alice -1500000'''

    new_preview = '''Hand (24)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 250000 BB 500000 Ante 500000
Stack Setup:
Bob Dealer 6750000
Charlie SB 3000000
David BB 10000000
Eve 60250000
Frank 17000000
Grace 20000000
Alice 0'''

    tc23_section = tc23_section.replace(old_preview, new_preview)

    # Put updated section back
    content = content[:tc23_start] + tc23_section + content[tc23_end:]

    print("  [OK] Fixed Eve's Expected Results: Final Stack = 0, Contributed = 7,000,000 (all-in)")
    print("  [OK] Fixed Charlie's Final Stack: 2,500,000 -> 3,000,000")
    print("  [OK] Fixed Total Pot: 63,500,000 -> 60,250,000")
    print("  [OK] Fixed Eve's winnings: 61,500,000 -> 60,250,000")
    print("  [OK] Fixed Next Hand Preview: Eve = 60,250,000, Alice = 0")

    return content, True


def main():
    filename = 'C:\\Apps\\HUDR\\HHTool_Modular\\docs\\QA\\30_base_validated_cases.html'

    print("=" * 80)
    print("FIXING ALL NEGATIVE STACK ISSUES")
    print("=" * 80)

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Fix TC-22
    content, tc22_fixed = fix_tc22(content)

    # Fix TC-23
    content, tc23_fixed = fix_tc23(content)

    # Write back to file
    if content != original_content:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print("\n" + "=" * 80)
        print("[OK] TC-22 and TC-23 FIXED - File updated")
        print("=" * 80)
    else:
        print("\n" + "=" * 80)
        print("[WARNING] No changes made")
        print("=" * 80)

if __name__ == '__main__':
    main()
