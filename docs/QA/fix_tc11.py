"""Fix TC-11: Negative stacks and 3-player preflop order"""

import re

def fix_tc11(content):
    """
    Fix TC-11 issues:
    1. Change preflop order: Dealer -> SB -> BB (currently SB -> BB -> Dealer)
    2. Fix Alice's Turn action from "Call 50,000" to "All-In 35,000"
    3. Fix Alice's Final Stack from -15,000 to 0
    4. Fix Alice's Contributed from 90,000 to 75,000
    5. Recalculate pots (Main Pot + Side Pot)
    6. Fix Next Hand Preview (Alice should be 0, not -15,000)
    """

    print("Fixing TC-11...")

    # Step 1: Fix Preflop Base action order (lines 2291-2294)
    # Change from: Bob -> Charlie -> Alice
    # To: Alice -> Bob -> Charlie
    old_preflop = r'<div class="street-name">Preflop Base</div>\s*' \
                  r'<div class="action-row"><span class="action-player">Bob \(SB\):</span> <span class="action-type">Raise</span> <span class="action-amount">15,000</span></div>\s*' \
                  r'<div class="action-row"><span class="action-player">Charlie \(BB\):</span> <span class="action-type">Call</span> <span class="action-amount">15,000</span></div>\s*' \
                  r'<div class="action-row"><span class="action-player">Alice \(Dealer\):</span> <span class="action-type">Call</span> <span class="action-amount">15,000</span></div>'

    new_preflop = '''<div class="street-name">Preflop Base</div>
                    <div class="action-row"><span class="action-player">Alice (Dealer):</span> <span class="action-type">Call</span> <span class="action-amount">15,000</span></div>
                    <div class="action-row"><span class="action-player">Bob (SB):</span> <span class="action-type">Raise</span> <span class="action-amount">15,000</span></div>
                    <div class="action-row"><span class="action-player">Charlie (BB):</span> <span class="action-type">Call</span> <span class="action-amount">15,000</span></div>'''

    content = re.sub(old_preflop, new_preflop, content, count=1, flags=re.DOTALL)
    print("  [1] Fixed preflop action order")

    # Step 2: Fix Alice's Turn action from "Call 50,000" to "All-In 35,000"
    old_alice_turn = r'(<div class="action-row"><span class="action-player">Alice \(Dealer\):</span> <span class="action-type">)Call(</span> <span class="action-amount">)50,000(</span></div>)'
    new_alice_turn = r'\1All-In\235,000\3'
    content = re.sub(old_alice_turn, new_alice_turn, content, count=1)
    print("  [2] Fixed Alice's Turn action to All-In 35,000")

    # Step 3: Update Expected Results - recalculate pots
    # Alice contributes 75,000 (all-in), Bob contributes 92,500, Charlie contributes 95,000
    # Main Pot: 75,000 × 3 + 5,000 ante = 230,000
    # Side Pot 1: (92,500 - 75,000) + (95,000 - 75,000) = 37,500
    # Total: 267,500

    # Fix Total Pot
    content = re.sub(
        r'<div class="pot-summary">Total Pot: 275,000</div>',
        '<div class="pot-summary">Total Pot: 267,500</div>',
        content, count=1
    )

    # Fix pot calculation text
    old_pot_calc = r'Calculation: 270,000 \(live\) \+ 5,000 \(BB ante dead\) = 275,000'
    new_pot_calc = 'Calculation: 225,000 (live) + 5,000 (BB ante dead) = 230,000'
    content = re.sub(old_pot_calc, new_pot_calc, content, count=1)

    # Change Main Pot to 230,000 and percentage
    old_main_pot = r'<div class="pot-amount">275,000 \(100%\)</div>'
    new_main_pot = '<div class="pot-amount">230,000 (86.0%)</div>'
    content = re.sub(old_main_pot, new_main_pot, content, count=1)

    # Add Side Pot 1 after Main Pot
    old_main_pot_section = r'(<div class="pot-item main">.*?</div>\s*</div>)'
    new_side_pot = '''\\1
                <div class="pot-item side">
                    <div class="pot-name">Side Pot 1</div>
                    <div class="pot-amount">37,500 (14.0%)</div>
                    <div class="eligible">Eligible: <span>Bob</span> <span>Charlie</span></div>
                    <div class="excluded">Excluded: <span class="excluded-player">Alice (capped at 75,000)</span></div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: (92,500 - 75,000) + (95,000 - 75,000) = 37,500
                    </div>
                </div>'''
    content = re.sub(old_main_pot_section, new_side_pot, content, count=1, flags=re.DOTALL)
    print("  [3] Recalculated pots (Main + Side)")

    # Step 4: Fix Alice's row in results table
    old_alice_row = r'<tr>\s*<td>Alice \(Dealer\)</td>\s*<td>75,000</td>\s*<td>-15,000</td>\s*<td>90,000</td>\s*<td><span class="winner-badge loser">-</span></td>\s*<td>-15,000</td>\s*</tr>'
    new_alice_row = '''<tr>
                            <td>Alice (Dealer)</td>
                            <td>75,000</td>
                            <td>0</td>
                            <td>75,000 (all-in)</td>
                            <td><span class="winner-badge loser">-</span></td>
                            <td>0</td>
                        </tr>'''
    content = re.sub(old_alice_row, new_alice_row, content, count=1, flags=re.DOTALL)
    print("  [4] Fixed Alice's final stack to 0")

    # Step 5: Fix Bob's row - recalculate (120,000 - 92,500 = 27,500 final, wins 267,500 = 295,000 new)
    old_bob_row = r'<tr>\s*<td>Bob \(SB\)</td>\s*<td>120,000</td>\s*<td>30,000</td>\s*<td>90,000</td>.*?<td>305,000</td>\s*</tr>'
    new_bob_row = '''<tr>
                            <td>Bob (SB)</td>
                            <td>120,000</td>
                            <td>27,500</td>
                            <td>92,500</td>
                            <td><span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main Pot, Side Pot 1 <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: 27,500</div>
                                    <div class="breakdown-line">+ Main Pot: 230,000</div>
                                    <div class="breakdown-line">+ Side Pot 1: 37,500</div>
                                    <div class="breakdown-line total">= New Stack: 295,000</div>
                                </div></td>
                            <td>295,000</td>
                        </tr>'''
    content = re.sub(old_bob_row, new_bob_row, content, count=1, flags=re.DOTALL)
    print("  [5] Fixed Bob's contributions and winnings")

    # Step 6: Fix Charlie's row - 235,000 - 95,000 = 140,000 final
    old_charlie_row = r'<td>Charlie \(BB\)</td>\s*<td>235,000</td>\s*<td>140,000</td>\s*<td>95,000</td>'
    new_charlie_row = '<td>Charlie (BB)</td>\\n                            <td>235,000</td>\\n                            <td>140,000</td>\\n                            <td>95,000</td>'
    content = re.sub(old_charlie_row, new_charlie_row, content, count=1)
    print("  [6] Charlie's numbers already correct")

    # Step 7: Fix Next Hand Preview - Alice should show 0, not -15,000
    old_next_hand = r"Hand \(12\)\\nstarted_at: 00:05:40 ended_at: HH:MM:SS\\nSB 2500 BB 5000 Ante 5000\\nStack Setup:\\nBob Dealer 305000\\nCharlie SB 140000\\nAlice BB -15000"
    new_next_hand = "Hand (12)\\\\nstarted_at: 00:05:40 ended_at: HH:MM:SS\\\\nSB 2500 BB 5000 Ante 5000\\\\nStack Setup:\\\\nBob Dealer 295000\\\\nCharlie SB 140000\\\\nAlice BB 0"
    content = re.sub(old_next_hand, new_next_hand, content)
    print("  [7] Fixed Next Hand Preview")

    return content

def main():
    filename = '30_base_validated_cases.html'

    print("=" * 80)
    print("FIXING TC-11")
    print("=" * 80)

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    content = fix_tc11(content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print()
    print("=" * 80)
    print("[OK] TC-11 FIXED")
    print("=" * 80)
    print("Next: Run validation on TC-11")

if __name__ == '__main__':
    main()
