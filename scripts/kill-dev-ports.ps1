# Kill processes on ports 3001 and 3002 before starting dev server

Write-Host "Checking for processes on ports 3001 and 3002..." -ForegroundColor Cyan

# Find and kill processes on port 3001
$port3001 = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
if ($port3001) {
    $port3001 | ForEach-Object {
        $processId = $_.OwningProcess
        Write-Host "Killing process $processId on port 3001..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
}

# Find and kill processes on port 3002
$port3002 = Get-NetTCPConnection -LocalPort 3002 -State Listen -ErrorAction SilentlyContinue
if ($port3002) {
    $port3002 | ForEach-Object {
        $processId = $_.OwningProcess
        Write-Host "Killing process $processId on port 3002..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
}

# Kill any PowerShell screenshot watchers (except this script)
$currentPID = $PID
Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $currentPID } | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "Ports 3001 and 3002 are now free." -ForegroundColor Green
Write-Host ""
