# dev-full.ps1
# Runs all dev services with proper Ctrl+C handling on Windows

$ErrorActionPreference = "Continue"

# Track process IDs for cleanup
$script:processes = @()
$script:projectRoot = Split-Path -Parent $PSScriptRoot

# Cleanup function
function Cleanup {
    Write-Host "`n`nStopping all services..." -ForegroundColor Yellow

    # Stop all processes
    $script:processes | Where-Object { -not $_.HasExited } | ForEach-Object {
        try {
            Write-Host "Stopping PID $($_.Id)..." -ForegroundColor Gray
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        } catch {
            # Ignore errors
        }
    }

    # Kill any remaining node/npm processes on these ports
    Start-Sleep -Milliseconds 500
    Write-Host "`nCleaning up ports..." -ForegroundColor Cyan
    & "$PSScriptRoot\kill-dev-ports.ps1"

    Write-Host "`nAll services stopped." -ForegroundColor Green
}

# Register cleanup on script exit
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Cleanup
}

# Kill ports first
Write-Host "Cleaning up ports..." -ForegroundColor Cyan
& "$PSScriptRoot\kill-dev-ports.ps1"

Write-Host "`nStarting all development services..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop all services`n" -ForegroundColor Yellow

try {
    # Start Vite dev server
    Write-Host "[APP] Starting Vite dev server..." -ForegroundColor Cyan
    $viteProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm", "run", "dev" -WorkingDirectory $script:projectRoot -PassThru -NoNewWindow
    $script:processes += $viteProcess
    Write-Host "[APP] Started (PID: $($viteProcess.Id))" -ForegroundColor Cyan

    # Start log server
    Write-Host "[LOGS] Starting log server..." -ForegroundColor Green
    $logProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm", "run", "log-server" -WorkingDirectory $script:projectRoot -PassThru -NoNewWindow
    $script:processes += $logProcess
    Write-Host "[LOGS] Started (PID: $($logProcess.Id))" -ForegroundColor Green

    # Start screenshot watcher
    Write-Host "[SHOTS] Starting screenshot watcher..." -ForegroundColor Magenta
    $screenshotProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm", "run", "screenshot-watcher" -WorkingDirectory $script:projectRoot -PassThru -NoNewWindow
    $script:processes += $screenshotProcess
    Write-Host "[SHOTS] Started (PID: $($screenshotProcess.Id))" -ForegroundColor Magenta

    Write-Host "`nAll services are running!" -ForegroundColor Green
    Write-Host "Waiting for dev server to be ready..." -ForegroundColor Yellow

    # Wait for Vite to start
    Start-Sleep -Seconds 3

    # Launch Chrome browser
    Write-Host "Opening Chrome browser..." -ForegroundColor Cyan
    $chromeExe = "C:\Program Files\Google\Chrome\Application\chrome.exe"
    if (Test-Path $chromeExe) {
        Start-Process $chromeExe -ArgumentList "http://127.0.0.1:3001" -ErrorAction SilentlyContinue
    } else {
        # Try alternate Chrome location (x86)
        $chromeExe = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
        if (Test-Path $chromeExe) {
            Start-Process $chromeExe -ArgumentList "http://127.0.0.1:3001" -ErrorAction SilentlyContinue
        } else {
            Write-Host "Chrome not found. Please open http://127.0.0.1:3001 manually." -ForegroundColor Yellow
        }
    }

    Write-Host "Press Ctrl+C to stop all services`n" -ForegroundColor Yellow

    # Monitor processes
    while ($true) {
        # Check if any critical process has exited
        $exitedProcesses = $script:processes | Where-Object { $_.HasExited }
        if ($exitedProcesses) {
            Write-Host "`nWarning: Some processes have exited:" -ForegroundColor Red
            $exitedProcesses | ForEach-Object {
                Write-Host "  PID $($_.Id) exited with code $($_.ExitCode)" -ForegroundColor Red
            }
            break
        }

        Start-Sleep -Seconds 1
    }

} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
} finally {
    Cleanup
}
