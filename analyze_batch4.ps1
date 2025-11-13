# Script to analyze pot-test-cases-batch-4.html for validation errors
$filePath = "C:\Apps\HUDR\HHTool_Modular\docs\pot-test-cases-batch-4.html"
$content = Get-Content $filePath -Raw

# Extract all test cases
$testCasePattern = '<div class="test-case">.*?(?=<div class="test-case">|</div>\s*</div>\s*</body>)'
$testCases = [regex]::Matches($content, $testCasePattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)

Write-Host "Total test cases found: $($testCases.Count)"
Write-Host "`n=== VALIDATION 1: Position Label Errors ===" -ForegroundColor Yellow

$positionErrors = @()
foreach ($tc in $testCases) {
    $tcContent = $tc.Value

    # Extract TC ID
    if ($tcContent -match 'class="test-id">([^<]+)<') {
        $tcId = $matches[1]

        # Check for position labels in Stack Setup (in copyPlayerData button)
        if ($tcContent -match 'copyPlayerData\(this, `([^`]+)`\)') {
            $stackData = $matches[1]

            # Check if Stack Setup contains invalid position labels
            if ($stackData -match 'Stack Setup:' -and
                $stackData -match '\b(UTG\+1|UTG\+2|MP|CO|HJ)\b') {
                $positionErrors += $tcId
            }
        }
    }
}

Write-Host "Test cases with position label errors: $($positionErrors.Count)"
Write-Host "Test case IDs: $($positionErrors -join ', ')"

Write-Host "`n=== VALIDATION 2: Winner Stack Errors ===" -ForegroundColor Yellow
$winnerStackErrors = @()
foreach ($tc in $testCases) {
    $tcContent = $tc.Value

    if ($tcContent -match 'class="test-id">([^<]+)<') {
        $tcId = $matches[1]

        # Check if winners show incorrect stacks in Next Hand Preview
        # Look for winner badges
        if ($tcContent -match 'winner-badge.*?🏆') {
            # Extract the breakdown details
            if ($tcContent -match 'breakdown-line total">= New Stack: (\d+,?\d*)') {
                $newStack = $matches[1]

                # Check if Next Hand Preview uses this new stack
                if ($tcContent -match 'Next Hand Preview.*?Stack Setup:(.*?)</div>' -and
                    $matches[1] -notmatch $newStack.Replace(',', '')) {
                    # This might be an error - winner's new stack not reflected
                    $winnerStackErrors += $tcId
                }
            }
        }
    }
}

Write-Host "Test cases with potential winner stack errors: $($winnerStackErrors.Count)"
Write-Host "Test case IDs: $($winnerStackErrors -join ', ')"

Write-Host "`n=== VALIDATION 3: Button Rotation ===" -ForegroundColor Yellow
$buttonErrors = @()
foreach ($tc in $testCases) {
    $tcContent = $tc.Value

    if ($tcContent -match 'class="test-id">([^<]+)<') {
        $tcId = $matches[1]

        # Extract current SB from Expected Results table
        # Then check if Next Hand shows that player as Dealer
        # This is complex pattern matching, simplified version:
        if ($tcContent -match 'Next Hand Preview') {
            # Check if button rotation looks correct
            # This would need more detailed parsing
        }
    }
}

Write-Host "Button rotation check requires manual validation"

Write-Host "`n=== VALIDATION 4: Stack Setup Order ===" -ForegroundColor Yellow
$orderErrors = @()
foreach ($tc in $testCases) {
    $tcContent = $tc.Value

    if ($tcContent -match 'class="test-id">([^<]+)<') {
        $tcId = $matches[1]

        # Check if Stack Setup starts with Dealer
        if ($tcContent -match 'copyPlayerData\(this, `([^`]+)`\)') {
            $stackData = $matches[1]

            # Extract first player line after "Stack Setup:"
            if ($stackData -match 'Stack Setup:\s*\n([^\n]+)') {
                $firstLine = $matches[1].Trim()

                # Check if it contains "Dealer"
                if ($firstLine -notmatch 'Dealer') {
                    # First player is not Dealer - might be an error
                    if ($firstLine -match 'SB') {
                        $orderErrors += $tcId
                    }
                }
            }
        }
    }
}

Write-Host "Test cases with Stack Setup order issues: $($orderErrors.Count)"
Write-Host "Test case IDs: $($orderErrors -join ', ')"

Write-Host "`n=== VALIDATION 7: compareNextHand Function ===" -ForegroundColor Yellow
if ($content -match 'function compareNextHand') {
    Write-Host "compareNextHand function EXISTS"

    # Check for enhanced validation
    if ($content -match 'compareNextHand.*?debug.*?order.*?stack' -or
        $content -match 'compareNextHand.*?console\.log') {
        Write-Host "Function appears to have enhanced validation logic"
    } else {
        Write-Host "Function may not have enhanced validation logic"
    }
} else {
    Write-Host "compareNextHand function NOT FOUND"
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Total test cases: $($testCases.Count)"
Write-Host "Position label errors: $($positionErrors.Count)"
Write-Host "Winner stack errors: $($winnerStackErrors.Count)"
Write-Host "Stack Setup order issues: $($orderErrors.Count)"
