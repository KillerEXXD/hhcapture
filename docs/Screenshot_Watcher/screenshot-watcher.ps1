# screenshot-watcher.ps1
# Watches screenshots folder and keeps only latest screenshot

param(
    [string]$WatchPath = ".\screenshots",
    [int]$MaxScreenshots = 5,
    [switch]$KeepHistory
)

$ErrorActionPreference = "SilentlyContinue"

# Ensure directory exists
if (-not (Test-Path $WatchPath)) {
    New-Item -ItemType Directory -Path $WatchPath -Force | Out-Null
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📸 Screenshot Watcher for Claude Code" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Watching: $WatchPath" -ForegroundColor Green
Write-Host "Keep History: $KeepHistory" -ForegroundColor Green
Write-Host "Max Screenshots: $MaxScreenshots" -ForegroundColor Green
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
    
    # Ignore if it's latest.png itself
    if ($fileName -eq "latest.png") {
        return
    }
    
    # Wait a moment for file to finish writing
    Start-Sleep -Milliseconds 500
    
    if ($changeType -eq "Created") {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timestamp] New screenshot detected: $fileName" -ForegroundColor Green
        
        # Copy to latest.png
        $latestPath = Join-Path $WatchPath "latest.png"
        try {
            Copy-Item $path $latestPath -Force
            Write-Host "  ✓ Saved as latest.png" -ForegroundColor Cyan
            
            # Archive or delete old screenshots
            if ($using:KeepHistory) {
                # Keep last N screenshots
                $screenshots = Get-ChildItem $WatchPath -Filter "*.png" | 
                               Where-Object { $_.Name -ne "latest.png" } |
                               Sort-Object CreationTime -Descending
                
                if ($screenshots.Count -gt $using:MaxScreenshots) {
                    $toDelete = $screenshots | Select-Object -Skip $using:MaxScreenshots
                    foreach ($old in $toDelete) {
                        Remove-Item $old.FullPath -Force
                        Write-Host "  ✓ Deleted old: $($old.Name)" -ForegroundColor Gray
                    }
                }
            } else {
                # Delete all old screenshots except latest.png
                Get-ChildItem $WatchPath -Filter "*.png" | 
                    Where-Object { $_.Name -ne "latest.png" } |
                    Remove-Item -Force
                Write-Host "  ✓ Cleaned up old screenshots" -ForegroundColor Gray
            }
            
            # Create a marker file for Claude Code
            $markerPath = Join-Path $WatchPath "new-screenshot.txt"
            Get-Date -Format "yyyy-MM-dd HH:mm:ss" | Out-File $markerPath -Force
            
            Write-Host "  ✓ Claude Code can now see: screenshots/latest.png" -ForegroundColor Green
            Write-Host ""
            
        } catch {
            Write-Host "  ✗ Error: $_" -ForegroundColor Red
        }
    }
}

# Register events
Register-ObjectEvent $watcher "Created" -Action $action | Out-Null

Write-Host "Watcher started. Waiting for screenshots..." -ForegroundColor Cyan
Write-Host ""

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Cleanup on exit
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host "`n✓ Screenshot watcher stopped" -ForegroundColor Yellow
}
