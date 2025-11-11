"""
Fix TC-9: Charlie's contribution calculation error
Charlie started with 470,000
- Posted Ante: 10,000 (stack becomes 460,000)
- Posted BB: 10,000 (stack becomes 450,000)
- Preflop Call 30,000 (stack becomes 420,000)
- Flop Call 50,000 (stack becomes 370,000)
- Turn Call 100,000 (stack becomes 270,000)
- River Check (stack stays 270,000)

Total Contributed: 10K ante + 10K BB + 30K + 50K + 100K = 200,000
Final Stack: 470,000 - 200,000 = 270,000

Total Pot: Alice 180K + Bob 160K + Charlie 200K = 540,000
"""

import re

def fix_tc9():
    filename = 'C:\\Apps\\HUDR\\HHTool_Modular\\docs\\QA\\40_TestCases.html'

    print("=" * 80)
    print("FIXING TC-9: Charlie's contribution and pot calculation")
    print("=" * 80)

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find TC-9 section
    tc9_start = content.find('<!-- TEST CASE 9 -->')
    tc9_end = content.find('<!-- TEST CASE 10 -->')

    if tc9_start == -1:
        print("  [ERROR] Could not find TC-9")
        return

    tc9_section = content[tc9_start:tc9_end]

    # Fix 1: Total Pot (530,000 → 540,000)
    tc9_section = tc9_section.replace(
        '<div class="pot-summary">Total Pot: 530,000</div>',
        '<div class="pot-summary">Total Pot: 540,000</div>'
    )

    # Fix 2: Main Pot amount (530,000 → 540,000)
    old_main_pot = '''                <div class="pot-item main">
                    <div class="pot-name">Main Pot</div>
                    <div class="pot-amount">530,000 (100%)</div>
                    <div class="eligible">Eligible: <span>Alice</span> <span>Bob</span> <span>Charlie</span></div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: 520,000 (live) + 10,000 (BB ante dead) = 530,000
                    </div>
                </div>'''

    new_main_pot = '''                <div class="pot-item main">
                    <div class="pot-name">Main Pot</div>
                    <div class="pot-amount">540,000 (100%)</div>
                    <div class="eligible">Eligible: <span>Alice</span> <span>Bob</span> <span>Charlie</span></div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: 530,000 (live) + 10,000 (BB ante dead) = 540,000
                    </div>
                </div>'''

    tc9_section = tc9_section.replace(old_main_pot, new_main_pot)

    # Fix 3: Charlie's row (Final 280K → 270K, Contributed 190K → 200K, New Stack stays 280K → 270K)
    old_charlie_row = '''                        <tr>
                            <td>Charlie (BB)</td>
                            <td>470,000</td>
                            <td>280,000</td>
                            <td>190,000</td>
                            <td><span class="winner-badge loser">-</span></td>
                            <td>280,000</td>
                        </tr>'''

    new_charlie_row = '''                        <tr>
                            <td>Charlie (BB)</td>
                            <td>470,000</td>
                            <td>270,000</td>
                            <td>200,000</td>
                            <td><span class="winner-badge loser">-</span></td>
                            <td>270,000</td>
                        </tr>'''

    tc9_section = tc9_section.replace(old_charlie_row, new_charlie_row)

    # Fix 4: Alice's winnings (Main Pot 530K → 540K, New Stack 590K → 600K)
    old_alice_row = '''                        <tr>
                            <td>Alice (Dealer)</td>
                            <td>240,000</td>
                            <td>60,000</td>
                            <td>180,000</td>
                            <td><span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main Pot <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: 60,000</div>
                                    <div class="breakdown-line">+ Main Pot: 530,000</div>
                                    <div class="breakdown-line total">= New Stack: 590,000</div>
                                </div></td>
                            <td>590,000</td>
                        </tr>'''

    new_alice_row = '''                        <tr>
                            <td>Alice (Dealer)</td>
                            <td>240,000</td>
                            <td>60,000</td>
                            <td>180,000</td>
                            <td><span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main Pot <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: 60,000</div>
                                    <div class="breakdown-line">+ Main Pot: 540,000</div>
                                    <div class="breakdown-line total">= New Stack: 600,000</div>
                                </div></td>
                            <td>600,000</td>
                        </tr>'''

    tc9_section = tc9_section.replace(old_alice_row, new_alice_row)

    # Fix 5: Next Hand Preview (Charlie 280K → 270K, Alice 590K → 600K)
    old_next_hand_btn = '''                    <button class="copy-btn" onclick="copyPlayerData(this, `Hand (10)\nstarted_at: 00:05:40 ended_at: HH:MM:SS\nSB 5000 BB 10000 Ante 10000\nStack Setup:\nBob Dealer 0\nCharlie SB 280000\nAlice BB 590000`)">'''

    new_next_hand_btn = '''                    <button class="copy-btn" onclick="copyPlayerData(this, `Hand (10)\nstarted_at: 00:05:40 ended_at: HH:MM:SS\nSB 5000 BB 10000 Ante 10000\nStack Setup:\nBob Dealer 0\nCharlie SB 270000\nAlice BB 600000`)">'''

    tc9_section = tc9_section.replace(old_next_hand_btn, new_next_hand_btn)

    # Fix 6: Next Hand Preview visible text
    old_preview = '''Hand (10)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 5000 BB 10000 Ante 10000
Stack Setup:
Bob Dealer 0
Charlie SB 280000
Alice BB 590000'''

    new_preview = '''Hand (10)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 5000 BB 10000 Ante 10000
Stack Setup:
Bob Dealer 0
Charlie SB 270000
Alice BB 600000'''

    tc9_section = tc9_section.replace(old_preview, new_preview)

    # Write back
    content = content[:tc9_start] + tc9_section + content[tc9_end:]

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print("[OK] Fixed TC-9:")
    print("  - Charlie: Final Stack 280K -> 270K, Contributed 190K -> 200K")
    print("  - Total Pot: 530K -> 540K")
    print("  - Main Pot: 530K -> 540K")
    print("  - Alice winnings: 590K -> 600K")
    print("  - Next Hand: Charlie 270K, Alice 600K")
    print()
    print("=" * 80)

if __name__ == '__main__':
    fix_tc9()
