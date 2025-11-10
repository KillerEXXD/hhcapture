# screenshot-watcher.ps1
# Watches screenshots folder and keeps only latest screenshot

param(
    [string]$WatchPath = ".\screenshots"
)

$ErrorActionPreference = "SilentlyContinue"

# Ensure directory exists
if (-not (Test-Path $WatchPath)) {
    New-Item -ItemType Directory -Path $WatchPath -Force | Out-Null
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Screenshot Watcher for Claude Code" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Watching: $WatchPath" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Create file system watcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $WatchPath
$watcher.Filter = "*.png"
$watcher.IncludeSubdirectories = $false
$watcher.EnableRaisingEvents = $true

# Define the action
$action = {
    $path = $Event.SourceEventArgs.FullPath
    $fileName = $Event.SourceEventArgs.Name
    $changeType = $Event.SourceEventArgs.ChangeType
    $watchPath = $Event.MessageData.WatchPath

    # Ignore if latest.png
    if ($fileName -eq "latest.png") {
        return
    }

    # Wait for file write
    Start-Sleep -Milliseconds 500

    if ($changeType -eq "Created") {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timestamp] New screenshot: $fileName" -ForegroundColor Green

        # Copy to latest.png
        $latestPath = Join-Path $watchPath "latest.png"
        try {
            Copy-Item $path $latestPath -Force
            Write-Host "  Saved as latest.png" -ForegroundColor Cyan

            # Delete old screenshots
            Get-ChildItem $watchPath -Filter "*.png" | Where-Object { $_.Name -ne "latest.png" } | Remove-Item -Force
            Write-Host "  Cleaned up old screenshots" -ForegroundColor Gray

            # Marker file
            $markerPath = Join-Path $watchPath "new-screenshot.txt"
            Get-Date -Format "yyyy-MM-dd HH:mm:ss" | Out-File $markerPath -Force

            Write-Host "  Claude Code can see: screenshots/latest.png" -ForegroundColor Green
            Write-Host ""

        } catch {
            Write-Host "  Error: $_" -ForegroundColor Red
        }
    }
}

# Register event
$messageData = @{
    WatchPath = $WatchPath
}
Register-ObjectEvent $watcher "Created" -Action $action -MessageData $messageData | Out-Null

Write-Host "Watcher started. Waiting for screenshots..." -ForegroundColor Cyan
Write-Host ""

# Keep running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host "`nScreenshot watcher stopped" -ForegroundColor Yellow
}
