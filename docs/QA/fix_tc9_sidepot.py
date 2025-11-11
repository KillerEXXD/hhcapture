"""
Fix TC-9: Add side pot structure and revert to correct values

Correct values:
- Alice: Starting 240K, Contributed 180K, Final 60K
- Bob: Starting 160K, Contributed 160K (all-in), Final 0
- Charlie: Starting 470K, Contributed 190K, Final 280K

Pot Structure:
- Main Pot: 490,000 (160K × 3 + 10K ante)
- Side Pot 1: 40,000 (20K from Alice + 30K from Charlie)
- Total: 530,000

Winner: Alice wins both pots
- Final 60K + Main Pot 490K + Side Pot 40K = 590K
"""

import re

def fix_tc9_sidepot():
    filename = 'C:\\Apps\\HUDR\\HHTool_Modular\\docs\\QA\\40_TestCases.html'

    print("=" * 80)
    print("FIXING TC-9: Adding side pot structure and reverting to correct values")
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

    # Fix 1: Revert Total Pot (540,000 → 530,000)
    tc9_section = tc9_section.replace(
        '<div class="pot-summary">Total Pot: 540,000</div>',
        '<div class="pot-summary">Total Pot: 530,000</div>'
    )

    # Fix 2: Replace single pot with Main Pot + Side Pot structure
    old_pot_structure = '''                <div class="pot-item main">
                    <div class="pot-name">Main Pot</div>
                    <div class="pot-amount">540,000 (100%)</div>
                    <div class="eligible">Eligible: <span>Alice</span> <span>Bob</span> <span>Charlie</span></div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: 530,000 (live) + 10,000 (BB ante dead) = 540,000
                    </div>
                </div>'''

    new_pot_structure = '''                <div class="pot-item main">
                    <div class="pot-name">Main Pot</div>
                    <div class="pot-amount">490,000 (92.5%)</div>
                    <div class="eligible">Eligible: <span>Alice</span> <span>Bob</span> <span>Charlie</span></div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: 160,000 × 3 + 10,000 (BB ante dead) = 490,000
                    </div>
                </div>
                <div class="pot-item side">
                    <div class="pot-name">Side Pot 1</div>
                    <div class="pot-amount">40,000 (7.5%)</div>
                    <div class="eligible">Eligible: <span>Alice</span> <span>Charlie</span></div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: (180,000 - 160,000) + (190,000 - 160,000) = 40,000
                    </div>
                </div>'''

    tc9_section = tc9_section.replace(old_pot_structure, new_pot_structure)

    # Fix 3: Revert Charlie's row (Final 270K → 280K, Contributed 200K → 190K)
    old_charlie_row = '''                        <tr>
                            <td>Charlie (BB)</td>
                            <td>470,000</td>
                            <td>270,000</td>
                            <td>200,000</td>
                            <td><span class="winner-badge loser">-</span></td>
                            <td>270,000</td>
                        </tr>'''

    new_charlie_row = '''                        <tr>
                            <td>Charlie (BB)</td>
                            <td>470,000</td>
                            <td>280,000</td>
                            <td>190,000</td>
                            <td><span class="winner-badge loser">-</span></td>
                            <td>280,000</td>
                        </tr>'''

    tc9_section = tc9_section.replace(old_charlie_row, new_charlie_row)

    # Fix 4: Revert Alice's winnings (Main Pot 540K → 490K + Side Pot 40K, New Stack 600K → 590K)
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
                                    <div class="breakdown-line">+ Main Pot: 540,000</div>
                                    <div class="breakdown-line total">= New Stack: 600,000</div>
                                </div></td>
                            <td>600,000</td>
                        </tr>'''

    new_alice_row = '''                        <tr>
                            <td>Alice (Dealer)</td>
                            <td>240,000</td>
                            <td>60,000</td>
                            <td>180,000</td>
                            <td><span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main + Side <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: 60,000</div>
                                    <div class="breakdown-line">+ Main Pot: 490,000</div>
                                    <div class="breakdown-line">+ Side Pot 1: 40,000</div>
                                    <div class="breakdown-line total">= New Stack: 590,000</div>
                                </div></td>
                            <td>590,000</td>
                        </tr>'''

    tc9_section = tc9_section.replace(old_alice_row, new_alice_row)

    # Fix 5: Revert Next Hand Preview button data (Charlie 270K → 280K, Alice 600K → 590K)
    old_next_hand_btn = '''                    <button class="copy-btn" onclick="copyPlayerData(this, `Hand (10)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 5000 BB 10000 Ante 10000
Stack Setup:
Bob Dealer 0
Charlie SB 270000
Alice BB 600000`)">'''

    new_next_hand_btn = '''                    <button class="copy-btn" onclick="copyPlayerData(this, `Hand (10)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 5000 BB 10000 Ante 10000
Stack Setup:
Bob Dealer 0
Charlie SB 280000
Alice BB 590000`)">'''

    tc9_section = tc9_section.replace(old_next_hand_btn, new_next_hand_btn)

    # Fix 6: Revert Next Hand Preview visible text
    old_preview = '''Hand (10)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 5000 BB 10000 Ante 10000
Stack Setup:
Bob Dealer 0
Charlie SB 270000
Alice BB 600000'''

    new_preview = '''Hand (10)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 5000 BB 10000 Ante 10000
Stack Setup:
Bob Dealer 0
Charlie SB 280000
Alice BB 590000'''

    tc9_section = tc9_section.replace(old_preview, new_preview)

    # Write back
    content = content[:tc9_start] + tc9_section + content[tc9_end:]

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print("[OK] Fixed TC-9:")
    print("  - Reverted Charlie: Final Stack 270K → 280K, Contributed 200K → 190K")
    print("  - Reverted Alice: New Stack 600K → 590K")
    print("  - Total Pot: 540K → 530K")
    print("  - Added Side Pot structure:")
    print("    • Main Pot: 490K (Alice, Bob, Charlie eligible)")
    print("    • Side Pot 1: 40K (Alice, Charlie eligible)")
    print("  - Alice wins both pots: 60K + 490K + 40K = 590K")
    print("  - Next Hand: Bob 0 (eliminated), Charlie 280K, Alice 590K")
    print()
    print("=" * 80)

if __name__ == '__main__':
    fix_tc9_sidepot()
