# dev-full.ps1
# Runs all dev services with proper Ctrl+C handling on Windows

$ErrorActionPreference = "Continue"

# Get the project root directory
$projectRoot = Split-Path -Parent $PSScriptRoot

# Cleanup function
function Cleanup-Processes {
    param($processList)

    Write-Host "`nStopping all services..." -ForegroundColor Yellow

    # Stop all tracked processes
    if ($processList) {
        $processList | Where-Object { $_ -and -not $_.HasExited } | ForEach-Object {
            try {
                Write-Host "Stopping PID $($_.Id)..." -ForegroundColor Gray
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            } catch {
                # Ignore errors
            }
        }
    }

    # Wait a moment then clean up ports
    Start-Sleep -Milliseconds 500
    Write-Host "Cleaning up ports..." -ForegroundColor Cyan
    & "$PSScriptRoot\kill-dev-ports.ps1"

    Write-Host "All services stopped.`n" -ForegroundColor Green
}

# Kill ports first
Write-Host "Cleaning up ports..." -ForegroundColor Cyan
& "$PSScriptRoot\kill-dev-ports.ps1"

Write-Host "`nStarting all development services..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop all services`n" -ForegroundColor Yellow

# Track process IDs
$processes = @()

try {
    # Start Vite dev server
    Write-Host "[APP] Starting Vite dev server..." -ForegroundColor Cyan
    $viteProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm", "run", "dev" -WorkingDirectory $projectRoot -PassThru -NoNewWindow
    $processes += $viteProcess
    Write-Host "[APP] Started (PID: $($viteProcess.Id))" -ForegroundColor Cyan

    # Start log server
    Write-Host "[LOGS] Starting log server..." -ForegroundColor Green
    $logProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm", "run", "log-server" -WorkingDirectory $projectRoot -PassThru -NoNewWindow
    $processes += $logProcess
    Write-Host "[LOGS] Started (PID: $($logProcess.Id))" -ForegroundColor Green

    Write-Host "`nAll services are running!" -ForegroundColor Green
    Write-Host "Waiting for dev server to be ready..." -ForegroundColor Yellow

    # Wait for Vite to start
    Start-Sleep -Seconds 3

    # Launch Chrome browser
    Write-Host "Opening Chrome browser..." -ForegroundColor Cyan
    $chromeExe = "C:\Program Files\Google\Chrome\Application\chrome.exe"
    if (Test-Path $chromeExe) {
        Start-Process $chromeExe -ArgumentList "http://127.0.0.1:3001" -ErrorAction SilentlyContinue
        Write-Host "Chrome launched!" -ForegroundColor Green
    } else {
        # Try alternate Chrome location (x86)
        $chromeExe = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
        if (Test-Path $chromeExe) {
            Start-Process $chromeExe -ArgumentList "http://127.0.0.1:3001" -ErrorAction SilentlyContinue
            Write-Host "Chrome launched!" -ForegroundColor Green
        } else {
            Write-Host "Chrome not found. Please open http://127.0.0.1:3001 manually." -ForegroundColor Yellow
        }
    }

    Write-Host "`nServices running. Press Ctrl+C to stop...`n" -ForegroundColor Yellow

    # Monitor processes - infinite loop until Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1
    }

} catch {
    # Ctrl+C or other interruption
    Write-Host "`n" # New line for clean output
} finally {
    # Always run cleanup
    Cleanup-Processes -processList $processes
}
