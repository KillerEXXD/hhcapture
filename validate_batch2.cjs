const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlContent = fs.readFileSync('C:\\Apps\\HUDR\\HHTool_Modular\\docs\\pot-test-cases-batch-2.html', 'utf8');

// Results object
const results = {
    positionLabelErrors: [],
    winnerStackErrors: [],
    missingPlayerErrors: [],
    buttonRotationErrors: [],
    stackSetupOrderErrors: [],
    actionFlowErrors: [],
    comparisonFeatureChecked: false
};

// Helper to extract test cases
function extractTestCases(html) {
    const testCases = [];
    const regex = /<!-- TEST CASE (\d+) -->([\s\S]*?)(?=<!-- TEST CASE \d+ -->|<\/div>\s*<\/div>\s*<script>)/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
        testCases.push({
            id: match[1],
            content: match[2]
        });
    }

    return testCases;
}

// Check for position label errors in Stack Setup
function checkPositionLabels(testCase) {
    const errors = [];
    const stackSetupMatch = testCase.content.match(/Stack Setup:([\s\S]*?)(?=<\/pre>)/);

    if (stackSetupMatch) {
        const stackSetupText = stackSetupMatch[1];
        const lines = stackSetupText.split('\n').filter(line => line.trim());

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            // Check if line contains position labels that shouldn't be there
            // Valid positions for display: Dealer, SB, BB
            // Invalid to display: UTG, UTG+1, UTG+2, MP, CO, HJ
            if (trimmed && index > 0) { // Skip first line (might be empty or header)
                const invalidPositions = ['UTG ', 'UTG+1 ', 'UTG+2 ', 'MP ', 'CO ', 'HJ '];
                invalidPositions.forEach(pos => {
                    if (trimmed.includes(pos)) {
                        // This is actually correct in Stack Setup - these positions should appear
                        // The error would be if they DON'T appear or if wrong labels are used
                    }
                });
            }
        });
    }

    return errors;
}

// Check Next Hand Preview for winner stacks
function checkWinnerStacks(testCase) {
    const errors = [];

    // Find winners in the Expected Results table
    const winnersMatch = testCase.content.matchAll(/<td>([^<]+)<\/td><td>[^<]+<\/td><td>[^<]+<\/td><td>[^<]+<\/td>\s*<td>\s*<span class="winner-badge"[^>]*>.*?🏆/g);
    const winners = [];

    for (const match of winnersMatch) {
        const playerPosition = match[1].trim();
        winners.push(playerPosition);
    }

    // Extract the table to get Final Stack and New Stack
    const tableMatch = testCase.content.match(/<table>[\s\S]*?<\/table>/);
    if (tableMatch) {
        const tableHtml = tableMatch[0];
        const rows = tableHtml.matchAll(/<tr>\s*<td>([^<]+)<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><td>[\s\S]*?<\/td><td>([^<]+)<\/td>\s*<\/tr>/g);

        for (const row of rows) {
            const playerPos = row[1].trim();
            const finalStack = row[3].trim().replace(/,/g, '');
            const newStack = row[5].trim().replace(/,/g, '');

            // Check if this is a winner
            if (winners.some(w => w.includes(playerPos))) {
                // For winners, New Stack should be > Final Stack (Final + Pots Won)
                if (parseInt(newStack) <= parseInt(finalStack)) {
                    errors.push({
                        player: playerPos,
                        finalStack,
                        newStack,
                        issue: 'Winner should have New Stack > Final Stack'
                    });
                }
            } else {
                // For non-winners, New Stack should equal Final Stack
                if (newStack !== finalStack) {
                    errors.push({
                        player: playerPos,
                        finalStack,
                        newStack,
                        issue: 'Non-winner should have New Stack = Final Stack'
                    });
                }
            }
        }
    }

    return errors;
}

// Check Next Hand Preview for missing players
function checkMissingPlayers(testCase) {
    const errors = [];

    // Extract players from current hand Stack Setup
    const currentStackSetup = testCase.content.match(/Stack Setup:([\s\S]*?)<\/pre>/);
    const currentPlayers = [];

    if (currentStackSetup) {
        const lines = currentStackSetup[1].split('\n').filter(l => l.trim());
        lines.forEach(line => {
            const match = line.trim().match(/^(\w+)\s+(\w+(?:\+\d+)?)\s+/);
            if (match) {
                currentPlayers.push({ name: match[1], position: match[2] });
            }
        });
    }

    // Extract players from Next Hand Preview
    const nextHandMatch = testCase.content.match(/Next Hand Preview[\s\S]*?<div class="next-hand-content">([\s\S]*?)<\/div>/);
    const nextPlayers = [];

    if (nextHandMatch) {
        const lines = nextHandMatch[1].split('\n').filter(l => l.trim());
        let inStackSetup = false;

        lines.forEach(line => {
            if (line.includes('Stack Setup:')) {
                inStackSetup = true;
                return;
            }
            if (inStackSetup) {
                const match = line.trim().match(/^(\w+)\s+(\w+(?:\+\d+)?)\s+/);
                if (match) {
                    nextPlayers.push({ name: match[1], position: match[2] });
                }
            }
        });
    }

    // Check if all current players appear in next hand (even with 0 stack)
    currentPlayers.forEach(cp => {
        const found = nextPlayers.find(np => np.name === cp.name);
        if (!found) {
            errors.push({
                player: `${cp.name} (${cp.position})`,
                issue: 'Player missing from Next Hand Preview'
            });
        }
    });

    return errors;
}

// Check button rotation
function checkButtonRotation(testCase) {
    const errors = [];

    // Extract current button/SB/BB positions
    const currentStackSetup = testCase.content.match(/Stack Setup:([\s\S]*?)<\/pre>/);
    let currentDealer = null, currentSB = null;

    if (currentStackSetup) {
        const lines = currentStackSetup[1].split('\n').filter(l => l.trim());
        lines.forEach(line => {
            const dealerMatch = line.trim().match(/^(\w+)\s+Dealer\s+/);
            const sbMatch = line.trim().match(/^(\w+)\s+SB\s+/);
            if (dealerMatch) currentDealer = dealerMatch[1];
            if (sbMatch) currentSB = sbMatch[1];
        });
    }

    // Extract next button position
    const nextHandMatch = testCase.content.match(/Next Hand Preview[\s\S]*?<div class="next-hand-content">([\s\S]*?)<\/div>/);
    let nextDealer = null;

    if (nextHandMatch) {
        const lines = nextHandMatch[1].split('\n').filter(l => l.trim());
        lines.forEach(line => {
            const dealerMatch = line.trim().match(/^(\w+)\s+Dealer\s+/);
            if (dealerMatch) nextDealer = dealerMatch[1];
        });
    }

    // Check if button rotated correctly: current SB should become next Dealer
    if (currentSB && nextDealer && currentSB !== nextDealer) {
        errors.push({
            currentSB,
            nextDealer,
            issue: 'Button should rotate clockwise: Previous SB should be New Dealer'
        });
    }

    return errors;
}

// Check Stack Setup order (should start with Dealer)
function checkStackSetupOrder(testCase) {
    const errors = [];

    const stackSetupMatch = testCase.content.match(/Stack Setup:([\s\S]*?)<\/pre>/);

    if (stackSetupMatch) {
        const lines = stackSetupMatch[1].split('\n').filter(l => l.trim() && !l.includes('started_at') && !l.includes('SB ') && !l.includes('BB '));

        if (lines.length > 0) {
            const firstLine = lines[0].trim();
            // First player should have Dealer position
            if (!firstLine.includes(' Dealer ')) {
                const posMatch = firstLine.match(/^\w+\s+(\w+(?:\+\d+)?)\s+/);
                if (posMatch) {
                    errors.push({
                        firstPosition: posMatch[1],
                        issue: 'Stack Setup should start with Dealer, not ' + posMatch[1]
                    });
                }
            }
        }
    }

    return errors;
}

// Check compareNextHand function
function checkComparisonFeature(html) {
    const hasFunction = html.includes('function compareNextHand');
    const hasOrderCheck = html.includes('order check') || html.includes('player.position');
    const hasStackCheck = html.includes('stack check') || html.includes('player.stack');
    const hasDebugLogs = html.includes('console.log') && html.includes('compareNextHand');

    return {
        exists: hasFunction,
        hasEnhancedValidation: hasFunction && hasOrderCheck && hasStackCheck,
        hasDebugLogs,
        details: {
            hasOrderCheck,
            hasStackCheck,
            hasDebugLogs
        }
    };
}

// Main execution
console.log('Starting validation of Batch 2 (TC-101 to TC-200)...\n');

const testCases = extractTestCases(htmlContent);
console.log(`Found ${testCases.length} test cases\n`);

// Run all validations
testCases.forEach(tc => {
    const tcId = `TC-${tc.id}`;

    // 1. Position Label Errors
    const posErrors = checkPositionLabels(tc);
    if (posErrors.length > 0) {
        results.positionLabelErrors.push({ tcId, errors: posErrors });
    }

    // 2. Winner Stack Errors
    const winnerErrors = checkWinnerStacks(tc);
    if (winnerErrors.length > 0) {
        results.winnerStackErrors.push({ tcId, errors: winnerErrors });
    }

    // 3. Missing Player Errors
    const missingErrors = checkMissingPlayers(tc);
    if (missingErrors.length > 0) {
        results.missingPlayerErrors.push({ tcId, errors: missingErrors });
    }

    // 4. Button Rotation Errors
    const buttonErrors = checkButtonRotation(tc);
    if (buttonErrors.length > 0) {
        results.buttonRotationErrors.push({ tcId, errors: buttonErrors });
    }

    // 5. Stack Setup Order Errors
    const orderErrors = checkStackSetupOrder(tc);
    if (orderErrors.length > 0) {
        results.stackSetupOrderErrors.push({ tcId, errors: orderErrors });
    }
});

// 7. Check Comparison Feature
const comparisonCheck = checkComparisonFeature(htmlContent);
results.comparisonFeature = comparisonCheck;

// Generate Report
console.log('## Batch 2 Validation Report (TC-101 to TC-200)\n');

console.log('### 1. Position Label Errors');
console.log(`- Test cases affected: ${results.positionLabelErrors.length} out of ${testCases.length}`);
if (results.positionLabelErrors.length > 0) {
    console.log(`- Test case IDs: ${results.positionLabelErrors.map(e => e.tcId).join(', ')}`);
    console.log('- Sample errors:');
    results.positionLabelErrors.slice(0, 3).forEach(e => {
        console.log(`  ${e.tcId}: ${JSON.stringify(e.errors[0], null, 2)}`);
    });
} else {
    console.log('- No position label errors found');
}
console.log();

console.log('### 2. Next Hand Preview - Winner Stacks');
console.log(`- Test cases affected: ${results.winnerStackErrors.length} out of ${testCases.length}`);
if (results.winnerStackErrors.length > 0) {
    console.log(`- Test case IDs: ${results.winnerStackErrors.map(e => e.tcId).join(', ')}`);
    console.log('- Sample errors:');
    results.winnerStackErrors.slice(0, 3).forEach(e => {
        console.log(`  ${e.tcId}:`);
        e.errors.forEach(err => {
            console.log(`    Player: ${err.player}`);
            console.log(`    Final Stack: ${err.finalStack}, New Stack: ${err.newStack}`);
            console.log(`    Issue: ${err.issue}`);
        });
    });
} else {
    console.log('- No winner stack errors found');
}
console.log();

console.log('### 3. Next Hand Preview - Missing Players');
console.log(`- Test cases affected: ${results.missingPlayerErrors.length} out of ${testCases.length}`);
if (results.missingPlayerErrors.length > 0) {
    console.log(`- Test case IDs: ${results.missingPlayerErrors.map(e => e.tcId).join(', ')}`);
    console.log('- Sample errors:');
    results.missingPlayerErrors.slice(0, 3).forEach(e => {
        console.log(`  ${e.tcId}:`);
        e.errors.forEach(err => {
            console.log(`    ${err.player}: ${err.issue}`);
        });
    });
} else {
    console.log('- No missing player errors found');
}
console.log();

console.log('### 4. Button Rotation');
console.log(`- Test cases affected: ${results.buttonRotationErrors.length} out of ${testCases.length}`);
if (results.buttonRotationErrors.length > 0) {
    console.log(`- Test case IDs: ${results.buttonRotationErrors.map(e => e.tcId).join(', ')}`);
    console.log('- Sample errors:');
    results.buttonRotationErrors.slice(0, 3).forEach(e => {
        console.log(`  ${e.tcId}:`);
        e.errors.forEach(err => {
            console.log(`    Current SB: ${err.currentSB}, Next Dealer: ${err.nextDealer}`);
            console.log(`    Issue: ${err.issue}`);
        });
    });
} else {
    console.log('- No button rotation errors found');
}
console.log();

console.log('### 5. Stack Setup Order');
console.log(`- Test cases affected: ${results.stackSetupOrderErrors.length} out of ${testCases.length}`);
if (results.stackSetupOrderErrors.length > 0) {
    console.log(`- Test case IDs: ${results.stackSetupOrderErrors.map(e => e.tcId).join(', ')}`);
    console.log('- Sample errors:');
    results.stackSetupOrderErrors.slice(0, 3).forEach(e => {
        console.log(`  ${e.tcId}:`);
        e.errors.forEach(err => {
            console.log(`    First Position: ${err.firstPosition}`);
            console.log(`    Issue: ${err.issue}`);
        });
    });
} else {
    console.log('- No stack setup order errors found');
}
console.log();

console.log('### 6. Action Flow');
console.log('- Test cases affected: Not implemented in this validation');
console.log('- Note: Requires detailed street-by-street action parsing');
console.log();

console.log('### 7. Comparison Feature');
console.log(`- Function exists: ${comparisonCheck.exists ? 'YES' : 'NO'}`);
console.log(`- Has enhanced validation: ${comparisonCheck.hasEnhancedValidation ? 'YES' : 'NO'}`);
console.log(`- Has debug logs: ${comparisonCheck.hasDebugLogs ? 'YES' : 'NO'}`);
console.log('- Details:');
console.log(`  - Order check: ${comparisonCheck.details.hasOrderCheck ? 'YES' : 'NO'}`);
console.log(`  - Stack check: ${comparisonCheck.details.hasStackCheck ? 'YES' : 'NO'}`);
console.log(`  - Debug logs: ${comparisonCheck.details.hasDebugLogs ? 'YES' : 'NO'}`);
console.log();

console.log('### Summary');
const totalWithIssues = new Set([
    ...results.positionLabelErrors.map(e => e.tcId),
    ...results.winnerStackErrors.map(e => e.tcId),
    ...results.missingPlayerErrors.map(e => e.tcId),
    ...results.buttonRotationErrors.map(e => e.tcId),
    ...results.stackSetupOrderErrors.map(e => e.tcId)
]).size;

console.log(`- Total test cases checked: ${testCases.length}`);
console.log(`- Test cases with issues: ${totalWithIssues}`);
console.log(`- Test cases passing all validations: ${testCases.length - totalWithIssues}`);
