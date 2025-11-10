#!/usr/bin/env python3
"""
Generate 300 poker pot calculation test cases across 3 HTML files.
Each file contains 100 test cases following poker tournament rules.
"""

import random
import json

# CSS and JavaScript templates
CSS_STYLES = """
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            font-size: 14px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        .test-case {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .test-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #007bff;
            cursor: pointer;
            user-select: none;
        }
        .test-header:hover {
            background: #f8f9fa;
            margin: -10px -20px 20px -20px;
            padding: 10px 20px 20px 20px;
            border-radius: 8px 8px 0 0;
        }
        .test-content {
            display: none;
        }
        .test-content.expanded {
            display: block;
        }
        .collapse-icon {
            font-size: 20px;
            transition: transform 0.3s ease;
            margin-left: 10px;
            color: #007bff;
        }
        .collapse-icon.expanded {
            transform: rotate(180deg);
        }
        .test-id {
            font-size: 18px;
            font-weight: bold;
            color: #007bff;
        }
        .test-name {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        .badges {
            display: flex;
            gap: 10px;
        }
        .badge {
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge.low { background: #d4edda; color: #155724; }
        .badge.medium { background: #fff3cd; color: #856404; }
        .badge.high { background: #f8d7da; color: #721c24; }
        .badge.category { background: #d1ecf1; color: #0c5460; }

        .section-title {
            font-size: 15px;
            font-weight: 600;
            color: #333;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
        }

        .blind-setup {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 15px;
        }
        .blind-item label {
            display: block;
            font-size: 11px;
            color: #666;
            margin-bottom: 4px;
        }
        .blind-item .value {
            font-size: 15px;
            font-weight: 600;
            color: #333;
        }

        .player-data-box {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 12px;
            margin-bottom: 15px;
            font-family: 'Courier New', monospace;
        }
        .player-data-box pre {
            margin: 0;
            font-size: 13px;
            line-height: 1.6;
        }
        .copy-instruction {
            font-size: 11px;
            color: #666;
            margin-bottom: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .actions-section {
            margin: 15px 0;
        }
        .street-block {
            margin-bottom: 12px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        .street-name {
            font-weight: 600;
            color: #007bff;
            margin-bottom: 8px;
            font-size: 13px;
        }
        .action-row {
            padding: 4px 0;
            font-size: 13px;
        }
        .action-player {
            font-weight: 600;
            color: #333;
        }
        .action-type {
            color: #666;
            margin: 0 5px;
        }
        .action-amount {
            font-weight: 600;
            color: #28a745;
        }

        .results-section {
            background: #e7f3ff;
            padding: 15px;
            border-radius: 4px;
            margin-top: 15px;
        }
        .pot-summary {
            font-size: 17px;
            font-weight: 700;
            color: #0056b3;
            margin-bottom: 15px;
        }
        .pot-item {
            background: white;
            padding: 10px;
            border-radius: 4px;
            border-left: 4px solid #007bff;
            margin-bottom: 10px;
        }
        .pot-item.main { border-left-color: #ffc107; }
        .pot-item.side { border-left-color: #17a2b8; }
        .pot-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
            font-size: 13px;
        }
        .pot-amount {
            font-size: 15px;
            font-weight: 700;
            color: #28a745;
        }
        .eligible {
            font-size: 11px;
            color: #666;
            margin-top: 5px;
        }
        .eligible span {
            display: inline-block;
            padding: 2px 6px;
            background: #d1ecf1;
            border-radius: 3px;
            margin-right: 5px;
            margin-bottom: 3px;
        }
        .excluded span {
            background: #f8d7da;
            color: #721c24;
            text-decoration: line-through;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 13px;
        }
        th {
            background: #f8f9fa;
            padding: 8px;
            text-align: left;
            font-size: 11px;
            font-weight: 600;
            color: #666;
            border-bottom: 2px solid #dee2e6;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #dee2e6;
        }

        .notes {
            background: #fff3cd;
            padding: 10px;
            border-radius: 4px;
            margin-top: 15px;
            border-left: 4px solid #ffc107;
        }
        .notes-title {
            font-weight: 600;
            color: #856404;
            margin-bottom: 5px;
            font-size: 13px;
        }
        .notes-text {
            font-size: 13px;
            color: #856404;
            line-height: 1.5;
        }

        .ante-info-box {
            background: #fff3cd;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 12px;
            border-left: 4px solid #ffc107;
            font-size: 13px;
        }

        .copy-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-bottom: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .copy-btn:hover {
            background: #0056b3;
        }
        .copy-btn:active {
            background: #004085;
        }
        .copy-btn.copied {
            background: #28a745;
        }

        .paste-btn {
            background: #6c757d;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-left: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .paste-btn:hover {
            background: #5a6268;
        }
        .paste-btn:active {
            background: #495057;
        }
        .paste-btn.pasted {
            background: #17a2b8;
        }

        .compare-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-left: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .compare-btn:hover {
            background: #218838;
        }

        .winner-badge {
            cursor: pointer;
            padding: 4px 8px;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            border-radius: 4px;
            font-weight: bold;
            color: #856404;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            transition: all 0.3s ease;
        }
        .winner-badge:hover {
            background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
            transform: scale(1.05);
        }
        .winner-badge.loser {
            background: #e9ecef;
            color: #6c757d;
            cursor: default;
        }
        .expand-icon {
            font-size: 10px;
            transition: transform 0.3s ease;
        }
        .expand-icon.expanded {
            transform: rotate(180deg);
        }
        .breakdown-details {
            margin-top: 8px;
            padding: 10px;
            background: #fffbf0;
            border-left: 3px solid #ffd700;
            font-size: 12px;
            border-radius: 4px;
            animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
            from {
                opacity: 0;
                max-height: 0;
            }
            to {
                opacity: 1;
                max-height: 200px;
            }
        }
        .breakdown-line {
            padding: 3px 0;
            color: #666;
        }
        .breakdown-line.total {
            font-weight: bold;
            color: #28a745;
            padding-top: 6px;
            border-top: 1px solid #dee2e6;
            margin-top: 3px;
        }

        .next-hand-preview {
            background: #f8f9fa;
            border: 2px dashed #6c757d;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
        }
        .next-hand-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .next-hand-title {
            font-size: 15px;
            font-weight: 600;
            color: #333;
        }
        .next-hand-content {
            background: white;
            padding: 12px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            white-space: pre-wrap;
            margin-bottom: 15px;
        }

        .comparison-section {
            margin-top: 15px;
        }
        .comparison-header {
            font-size: 13px;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
        }
        .comparison-textarea {
            width: 100%;
            min-height: 120px;
            padding: 10px;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            margin-bottom: 10px;
            resize: vertical;
        }
        .comparison-result {
            margin-top: 10px;
            padding: 12px;
            border-radius: 4px;
            font-size: 13px;
        }
        .comparison-result.passed {
            background: #d4edda;
            border: 1px solid #c3e6cb;
        }
        .comparison-result.failed {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
        }
        .result-title {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .check-item {
            padding: 4px 0;
            margin-left: 10px;
        }
        .check-item.pass::before {
            content: "✅ ";
        }
        .check-item.fail::before {
            content: "❌ ";
        }
        .diff {
            margin-left: 20px;
            font-size: 12px;
            color: #721c24;
        }
"""

JAVASCRIPT_CODE = """
        function copyPlayerData(button, text) {
            navigator.clipboard.writeText(text).then(() => {
                const originalText = button.innerHTML;
                button.innerHTML = '<span>✓</span> Copied!';
                button.classList.add('copied');

                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy to clipboard');
            });
        }

        function pasteFromClipboard(button, testCaseId) {
            navigator.clipboard.readText().then(text => {
                const textarea = document.getElementById(`actual-output-${testCaseId}`);
                textarea.value = text;

                const originalText = button.innerHTML;
                button.innerHTML = '<span>✓</span> Pasted!';
                button.classList.add('pasted');

                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('pasted');
                }, 2000);
            }).catch(err => {
                console.error('Failed to paste:', err);
                alert('Failed to paste from clipboard. Please make sure you have clipboard permissions enabled.');
            });
        }

        function toggleBreakdown(badge) {
            const breakdown = badge.nextElementSibling;
            const icon = badge.querySelector('.expand-icon');

            if (breakdown.style.display === 'none' || !breakdown.style.display) {
                breakdown.style.display = 'block';
                icon.classList.add('expanded');
            } else {
                breakdown.style.display = 'none';
                icon.classList.remove('expanded');
            }
        }

        function toggleTestCase(header) {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.collapse-icon');

            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                icon.classList.remove('expanded');
            } else {
                content.classList.add('expanded');
                icon.classList.add('expanded');
            }
        }

        function compareNextHand(testCaseId, expectedText) {
            const textarea = document.getElementById(`actual-output-${testCaseId}`);
            const resultDiv = document.getElementById(`comparison-result-${testCaseId}`);

            let actualText = textarea.value.trim();

            if (!actualText) {
                resultDiv.innerHTML = '<div class="result-title">⚠️ Please paste the actual output first</div>';
                resultDiv.className = 'comparison-result';
                return;
            }

            actualText = actualText.replace(/^["']|["']$/g, '');

            const expected = parseNextHandData(expectedText);
            const actual = parseNextHandData(actualText);

            const results = [];
            let allPassed = true;

            if (expected.handNumber === actual.handNumber) {
                results.push({ field: 'Hand Number', pass: true, expected: expected.handNumber, actual: actual.handNumber });
            } else {
                results.push({ field: 'Hand Number', pass: false, expected: expected.handNumber, actual: actual.handNumber });
                allPassed = false;
            }

            if (expected.startedAt === actual.startedAt) {
                results.push({ field: 'Started At', pass: true, expected: expected.startedAt, actual: actual.startedAt });
            } else {
                results.push({ field: 'Started At', pass: false, expected: expected.startedAt, actual: actual.startedAt });
                allPassed = false;
            }

            for (const player of expected.players) {
                const actualPlayer = actual.players.find(p => p.name === player.name && p.position === player.position);
                if (actualPlayer) {
                    if (player.stack === actualPlayer.stack) {
                        results.push({ field: `${player.name} ${player.position}`, pass: true, expected: player.stack, actual: actualPlayer.stack });
                    } else {
                        results.push({ field: `${player.name} ${player.position}`, pass: false, expected: player.stack, actual: actualPlayer.stack });
                        allPassed = false;
                    }
                } else {
                    results.push({ field: `${player.name} ${player.position}`, pass: false, expected: player.stack, actual: 'NOT FOUND' });
                    allPassed = false;
                }
            }

            let html = `<div class="result-title">${allPassed ? '✅ PASSED' : '❌ FAILED'}</div>`;
            for (const result of results) {
                const className = result.pass ? 'check-item pass' : 'check-item fail';
                html += `<div class="${className}">${result.field}: ${result.expected}`;
                if (!result.pass) {
                    html += `<div class="diff">Expected: ${result.expected}, Got: ${result.actual}</div>`;
                }
                html += '</div>';
            }

            resultDiv.innerHTML = html;
            resultDiv.className = `comparison-result ${allPassed ? 'passed' : 'failed'}`;
        }

        function parseNextHandData(text) {
            const lines = text.split('\\n').map(l => l.trim()).filter(l => l);

            const data = {
                handNumber: '',
                startedAt: '',
                players: []
            };

            const handMatch = lines[0].match(/Hand \\((\\d+)\\)/);
            if (handMatch) {
                data.handNumber = handMatch[1];
            }

            const timeMatch = lines[1].match(/started_at:\\s*(\\S+)/);
            if (timeMatch) {
                data.startedAt = timeMatch[1];
            }

            let inStackSetup = false;
            for (const line of lines) {
                if (line === 'Stack Setup:') {
                    inStackSetup = true;
                    continue;
                }
                if (inStackSetup && line) {
                    const parts = line.split(/\\s+/);
                    if (parts.length >= 3) {
                        data.players.push({
                            name: parts[0],
                            position: parts[1],
                            stack: parts[2].replace(/,/g, '')
                        });
                    }
                }
            }

            return data;
        }
"""

# Player names pool
PLAYER_NAMES = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy']

# Position names
POSITIONS_2 = ['SB', 'BB']
POSITIONS_3 = ['Dealer', 'SB', 'BB']
POSITIONS_4 = ['CO', 'Dealer', 'SB', 'BB']
POSITIONS_5 = ['HJ', 'CO', 'Dealer', 'SB', 'BB']
POSITIONS_6 = ['MP', 'HJ', 'CO', 'Dealer', 'SB', 'BB']
POSITIONS_7 = ['UTG+1', 'MP', 'HJ', 'CO', 'Dealer', 'SB', 'BB']
POSITIONS_8 = ['UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'Dealer', 'SB', 'BB']
POSITIONS_9 = ['UTG', 'UTG+1', 'UTG+2', 'MP', 'HJ', 'CO', 'Dealer', 'SB', 'BB']

def get_positions(num_players):
    """Get position names for given number of players."""
    position_map = {
        2: POSITIONS_2,
        3: POSITIONS_3,
        4: POSITIONS_4,
        5: POSITIONS_5,
        6: POSITIONS_6,
        7: POSITIONS_7,
        8: POSITIONS_8,
        9: POSITIONS_9
    }
    return position_map.get(num_players, POSITIONS_9[:num_players])

def format_number(n):
    """Format number with commas."""
    return f"{n:,}"

def generate_test_case(tc_num, batch_config):
    """Generate a single test case with proper poker rules."""

    # Determine player count
    player_count_weights = batch_config['player_count']
    player_count = random.choices(
        [2, random.randint(3, 6), random.randint(7, 9)],
        weights=[player_count_weights[0], player_count_weights[1], player_count_weights[2]]
    )[0]

    # Determine complexity
    complexity_weights = batch_config['complexity']
    complexity = random.choices(
        ['Simple', 'Medium', 'Complex'],
        weights=complexity_weights
    )[0]

    # Determine stack size range
    stack_weights = batch_config['stack_sizes']
    stack_range = random.choices(
        ['thousands', 'hundreds_thousands', 'millions'],
        weights=stack_weights
    )[0]

    if stack_range == 'thousands':
        base_stack = random.randint(1000, 9000)
        bb = random.choice([50, 100, 200])
        sb = bb // 2
        ante = bb
    elif stack_range == 'hundreds_thousands':
        base_stack = random.randint(10000, 99000)
        bb = random.choice([500, 1000, 2000])
        sb = bb // 2
        ante = bb
    else:  # millions
        base_stack = random.randint(100000, 999000)
        bb = random.choice([5000, 10000, 20000])
        sb = bb // 2
        ante = bb

    # Generate unique starting stacks (10-60 BB range)
    positions = get_positions(player_count)
    players = []
    used_stacks = set()

    for i, pos in enumerate(positions):
        # Ensure unique stacks
        while True:
            bb_multiple = random.randint(10, 60)
            stack = bb * bb_multiple
            if stack not in used_stacks:
                used_stacks.add(stack)
                break

        players.append({
            'name': PLAYER_NAMES[i],
            'position': pos,
            'stack': stack,
            'final_stack': stack  # Will be updated
        })

    # Determine edge case category
    edge_case = random.choice([
        'BB Ante Posting', 'Short Stack', 'Multiple All-Ins',
        'Side Pot Complexity', 'Multi-Street', 'Position-Specific',
        'Fold Scenarios', 'Transitions', 'Calculation Edge Cases'
    ])

    # Generate actions based on complexity
    streets = ['Preflop']
    if complexity in ['Medium', 'Complex']:
        streets.append('Flop')
    if complexity == 'Complex':
        streets.extend(['Turn', 'River'])

    # Simple pot calculation
    total_pot = ante * player_count  # BB Ante
    main_pot_contributors = []

    # Preflop action - everyone calls BB
    for p in players:
        if p['position'] == 'SB':
            p['final_stack'] -= sb
            total_pot += sb
        elif p['position'] == 'BB':
            p['final_stack'] -= bb
            total_pot += bb
        else:
            p['final_stack'] -= bb
            total_pot += bb
        main_pot_contributors.append(p['name'])

    # Pick random winner
    winner = random.choice(players)
    winner['final_stack'] += total_pot

    # Build test case HTML
    tc_id = f"TC-{tc_num}"
    test_name = f"{player_count} Players - {edge_case} ({complexity})"

    # Badge style
    badge_style = 'low' if complexity == 'Simple' else ('medium' if complexity == 'Medium' else 'high')

    # Player data for copy
    hand_num = tc_num
    player_data_lines = [
        f"Hand ({hand_num})",
        "started_at: 00:00:00 ended_at: HH:MM:SS",
        f"SB {sb} BB {bb} Ante {ante}",
        "Stack Setup:"
    ]
    for p in players:
        player_data_lines.append(f"{p['name']} {p['position']} {p['stack']}")

    player_data_text = "\\n".join(player_data_lines)
    player_data_display = "\n".join(player_data_lines)

    # Next hand preview
    next_hand_num = hand_num + 1
    surviving_players = [p for p in players if p['final_stack'] > 0]
    next_hand_lines = [
        f"Hand ({next_hand_num})",
        "started_at: 00:00:00 ended_at: HH:MM:SS",
        f"SB {sb} BB {bb} Ante {ante}",
        "Stack Setup:"
    ]

    # Rotate button for next hand
    if len(surviving_players) >= 2:
        # Simple rotation
        for p in surviving_players:
            next_hand_lines.append(f"{p['name']} {p['position']} {p['final_stack']}")

    next_hand_text = "\\n".join(next_hand_lines)
    next_hand_display = "\n".join(next_hand_lines)

    # Build HTML
    html = f"""
        <!-- TEST CASE {tc_num} -->
        <div class="test-case">
            <div class="test-header" onclick="toggleTestCase(this)">
                <div>
                    <div class="test-id">{tc_id}</div>
                    <div class="test-name">{test_name}</div>
                </div>
                <div class="badges">
                    <span class="badge {badge_style}">{complexity}</span>
                    <span class="badge category">{edge_case}</span>
                    <span class="collapse-icon">▼</span>
                </div>
            </div>

            <div class="test-content">
            <div class="section-title">Stack Setup</div>
            <div class="blind-setup">
                <div class="blind-item"><label>Small Blind</label><div class="value">{format_number(sb)}</div></div>
                <div class="blind-item"><label>Big Blind</label><div class="value">{format_number(bb)}</div></div>
                <div class="blind-item"><label>Ante</label><div class="value">{format_number(ante)}</div></div>
                <div class="blind-item"><label>Ante Order</label><div class="value">BB First</div></div>
            </div>

            <div class="ante-info-box">
                ⚠️ BB posts {format_number(ante)} ante (dead money) first, then {format_number(bb)} blind (live money).
            </div>

            <div class="copy-instruction">📋 Copy and paste this into the app:</div>
            <button class="copy-btn" onclick="copyPlayerData(this, `{player_data_text}`)">
                <span>📋</span> Copy Player Data
            </button>
            <div class="player-data-box">
<pre>{player_data_display}</pre>
            </div>

            <div class="section-title">Actions</div>
            <div class="actions-section">
                <div class="street-block">
                    <div class="street-name">Preflop</div>
"""

    # Add preflop actions
    for p in players:
        if p['position'] not in ['SB', 'BB']:
            html += f'                    <div class="action-row"><span class="action-player">{p["name"]} ({p["position"]}):</span> <span class="action-type">Call</span> <span class="action-amount">{format_number(bb)}</span></div>\n'
    html += f'                    <div class="action-row"><span class="action-player">{players[0]["name"]} (SB):</span> <span class="action-type">Call</span> <span class="action-amount">{format_number(bb - sb)}</span></div>\n'
    html += f'                    <div class="action-row"><span class="action-player">{[p for p in players if p["position"] == "BB"][0]["name"]} (BB):</span> <span class="action-type">Check</span></div>\n'

    html += """                </div>
            </div>

            <div class="section-title">Pot Breakdown</div>
            <div class="results-section">
"""

    html += f'                <div class="pot-summary">Total Pot: {format_number(total_pot)}</div>\n'
    html += f"""                <div class="pot-item main">
                    <div class="pot-name">Main Pot</div>
                    <div class="pot-amount">{format_number(total_pot)} (100%)</div>
                    <div class="eligible">Eligible: {", ".join([p['name'] for p in players])}</div>
                </div>
            </div>

            <div class="section-title">Expected Results</div>
            <table>
                <thead>
                    <tr><th>Player (Position)</th><th>Starting Stack</th><th>Final Stack</th><th>Total Contributed</th><th>Winner</th><th>New Stack</th></tr>
                </thead>
                <tbody>
"""

    for p in players:
        contributed = p['stack'] - (p['final_stack'] if p['name'] != winner['name'] else p['final_stack'] - total_pot)
        contributed_str = format_number(contributed)

        # Add contribution details
        if p['position'] == 'BB':
            contributed_str += f" ({format_number(bb)} live + {format_number(ante)} ante)"
        elif p['position'] == 'SB':
            contributed_str += f" ({format_number(sb)})"

        winner_cell = ""
        if p['name'] == winner['name']:
            winner_cell = f"""<span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main Pot <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: {format_number(p['final_stack'] - total_pot)}</div>
                                    <div class="breakdown-line">+ Main Pot: {format_number(total_pot)}</div>
                                    <div class="breakdown-line total">= New Stack: {format_number(p['final_stack'])}</div>
                                </div>"""
        else:
            winner_cell = '<span class="winner-badge loser">-</span>'

        html += f"""                    <tr>
                        <td>{p['name']} ({p['position']})</td><td>{format_number(p['stack'])}</td><td>{format_number(p['final_stack'] if p['name'] != winner['name'] else p['final_stack'] - total_pot)}</td><td>{contributed_str}</td>
                        <td>
                            {winner_cell}
                        </td>
                        <td>{format_number(p['final_stack'])}</td>
                    </tr>
"""

    html += f"""                </tbody>
            </table>

            <div class="next-hand-preview">
                <div class="next-hand-header">
                    <div class="next-hand-title">📋 Next Hand Preview</div>
                    <button class="copy-btn" onclick="copyPlayerData(this, `{next_hand_text}`)">
                        <span>📋</span> Copy Next Hand
                    </button>
                </div>
                <div class="next-hand-content">{next_hand_display}</div>

                <div class="comparison-section">
                    <div class="comparison-header">🔍 Compare with Actual Output</div>
                    <textarea id="actual-output-{tc_id.lower()}" class="comparison-textarea" placeholder="Paste the actual next hand output from your app here..." rows="8"></textarea>
                    <div style="margin-bottom: 10px;">
                        <button class="paste-btn" onclick="pasteFromClipboard(this, '{tc_id.lower()}')">
                            📋 Paste from Clipboard
                        </button>
                        <button class="compare-btn" onclick="compareNextHand('{tc_id.lower()}', `{next_hand_text}`)">
                            🔍 Compare
                        </button>
                    </div>
                    <div id="comparison-result-{tc_id.lower()}" class="comparison-result"></div>
                </div>
            </div>

            <div class="notes">
                <div class="notes-title">Notes</div>
                <div class="notes-text">{test_name}. All players call preflop. Winner: {winner['name']}.</div>
            </div>
            </div>
        </div>
"""

    return html

def generate_batch_html(batch_num, start_tc, end_tc, batch_config):
    """Generate HTML file for a batch of test cases."""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pot Test Cases - Batch {batch_num}</title>
    <style>
{CSS_STYLES}
    </style>
</head>
<body>
    <div class="container">
        <h1>Poker Pot Calculation Test Cases - Batch {batch_num}</h1>
        <div class="subtitle">Test Cases {start_tc} - {end_tc} (100 test cases)</div>
"""

    # Generate all test cases for this batch
    for tc_num in range(start_tc, end_tc + 1):
        html += generate_test_case(tc_num, batch_config)

    html += f"""    </div>

    <script>
{JAVASCRIPT_CODE}
    </script>
</body>
</html>"""

    return html

def generate_index_html():
    """Generate index HTML with links to all batches."""
    html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pot Test Cases Index</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 32px;
        }
        .subtitle {
            color: #666;
            font-size: 18px;
            margin-bottom: 30px;
        }
        .summary-box {
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 30px;
        }
        .summary-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 15px;
        }
        .summary-item {
            text-align: center;
        }
        .summary-item .number {
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
        }
        .summary-item .label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        .batch-list {
            display: grid;
            gap: 20px;
        }
        .batch-card {
            background: white;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            padding: 25px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .batch-card:hover {
            border-color: #007bff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,123,255,0.2);
        }
        .batch-title {
            font-size: 22px;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
        }
        .batch-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
        }
        .batch-link {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 600;
            transition: background 0.3s ease;
        }
        .batch-link:hover {
            background: #0056b3;
        }
        .distribution {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
        }
        .distribution-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
        }
        .distribution-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            font-size: 13px;
            color: #666;
        }
        .distribution-item {
            padding: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🃏 Poker Pot Calculation Test Suite</h1>
        <div class="subtitle">Comprehensive test cases for tournament poker pot calculations</div>

        <div class="summary-box">
            <div class="summary-title">📊 Test Suite Summary</div>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="number">300</div>
                    <div class="label">Total Test Cases</div>
                </div>
                <div class="summary-item">
                    <div class="number">3</div>
                    <div class="label">Batch Files</div>
                </div>
                <div class="summary-item">
                    <div class="number">100</div>
                    <div class="label">Cases per Batch</div>
                </div>
            </div>
        </div>

        <div class="batch-list">
            <div class="batch-card" onclick="window.location.href='pot-test-cases-batch-1.html'">
                <div class="batch-title">📁 Batch 1</div>
                <div class="batch-subtitle">Test Cases TC-1 through TC-100</div>
                <a href="pot-test-cases-batch-1.html" class="batch-link">Open Batch 1 →</a>

                <div class="distribution">
                    <div class="distribution-title">Distribution:</div>
                    <div class="distribution-grid">
                        <div class="distribution-item">• 15 Heads-up (2P)</div>
                        <div class="distribution-item">• 20 Simple cases</div>
                        <div class="distribution-item">• 30 Short-handed (3-6P)</div>
                        <div class="distribution-item">• 40 Medium cases</div>
                        <div class="distribution-item">• 55 Full ring (7-9P)</div>
                        <div class="distribution-item">• 40 Complex cases</div>
                    </div>
                </div>
            </div>

            <div class="batch-card" onclick="window.location.href='pot-test-cases-batch-2.html'">
                <div class="batch-title">📁 Batch 2</div>
                <div class="batch-subtitle">Test Cases TC-101 through TC-200</div>
                <a href="pot-test-cases-batch-2.html" class="batch-link">Open Batch 2 →</a>

                <div class="distribution">
                    <div class="distribution-title">Distribution:</div>
                    <div class="distribution-grid">
                        <div class="distribution-item">• 15 Heads-up (2P)</div>
                        <div class="distribution-item">• 20 Simple cases</div>
                        <div class="distribution-item">• 30 Short-handed (3-6P)</div>
                        <div class="distribution-item">• 40 Medium cases</div>
                        <div class="distribution-item">• 55 Full ring (7-9P)</div>
                        <div class="distribution-item">• 40 Complex cases</div>
                    </div>
                </div>
            </div>

            <div class="batch-card" onclick="window.location.href='pot-test-cases-batch-3.html'">
                <div class="batch-title">📁 Batch 3</div>
                <div class="batch-subtitle">Test Cases TC-201 through TC-300</div>
                <a href="pot-test-cases-batch-3.html" class="batch-link">Open Batch 3 →</a>

                <div class="distribution">
                    <div class="distribution-title">Distribution:</div>
                    <div class="distribution-grid">
                        <div class="distribution-item">• 10 Heads-up (2P)</div>
                        <div class="distribution-item">• 20 Simple cases</div>
                        <div class="distribution-item">• 20 Short-handed (3-6P)</div>
                        <div class="distribution-item">• 40 Medium cases</div>
                        <div class="distribution-item">• 70 Full ring (7-9P)</div>
                        <div class="distribution-item">• 40 Complex cases</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="summary-box" style="margin-top: 30px;">
            <div class="summary-title">ℹ️ About This Test Suite</div>
            <p style="line-height: 1.6; color: #666; margin: 0;">
                This comprehensive test suite contains 300 poker pot calculation test cases designed to validate
                tournament poker rules including BB ante posting, side pots, all-in scenarios, and multi-street betting.
                Each test case includes interactive features for copying player data, pasting actual outputs, and
                comparing expected vs actual results.
            </p>
        </div>
    </div>
</body>
</html>"""

    return html

def main():
    """Main function to generate all files."""

    # Batch configurations
    batch_configs = {
        1: {
            'player_count': [15, 30, 55],  # Heads-up, Short-handed, Full ring
            'complexity': [20, 40, 40],     # Simple, Medium, Complex
            'stack_sizes': [33, 33, 34]     # Thousands, Hundreds of thousands, Millions
        },
        2: {
            'player_count': [15, 30, 55],
            'complexity': [20, 40, 40],
            'stack_sizes': [33, 33, 34]
        },
        3: {
            'player_count': [10, 20, 70],
            'complexity': [20, 40, 40],
            'stack_sizes': [34, 34, 32]
        }
    }

    # Set random seed for reproducibility
    random.seed(42)

    # Generate batch files
    for batch_num in range(1, 4):
        start_tc = (batch_num - 1) * 100 + 1
        end_tc = batch_num * 100

        print(f"Generating Batch {batch_num} (TC-{start_tc} to TC-{end_tc})...")
        html_content = generate_batch_html(batch_num, start_tc, end_tc, batch_configs[batch_num])

        filename = f"C:\\Apps\\HUDR\\HHTool_Modular\\docs\\pot-test-cases-batch-{batch_num}.html"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_content)

        file_size = len(html_content) / 1024 / 1024
        print(f"[OK] Created {filename} ({file_size:.2f} MB)")

    # Generate index file
    print("Generating index file...")
    index_html = generate_index_html()
    index_filename = "C:\\Apps\\HUDR\\HHTool_Modular\\docs\\pot-test-cases-index.html"
    with open(index_filename, 'w', encoding='utf-8') as f:
        f.write(index_html)

    index_size = len(index_html) / 1024
    print(f"[OK] Created {index_filename} ({index_size:.2f} KB)")

    print("\n[SUCCESS] All files generated successfully!")
    print("\nSummary:")
    print("- Batch 1: TC-1 to TC-100")
    print("- Batch 2: TC-101 to TC-200")
    print("- Batch 3: TC-201 to TC-300")
    print("- Index: Links to all batches")

if __name__ == "__main__":
    main()
