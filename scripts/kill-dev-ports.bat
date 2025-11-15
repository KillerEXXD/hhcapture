@echo off
REM Kill processes on ports 3001 and 3002 before starting dev server

echo Checking for processes on ports 3001 and 3002...

REM Find and kill process on port 3001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001.*LISTENING"') do (
    echo Killing process %%a on port 3001...
    taskkill //F //PID %%a >nul 2>&1
)

REM Find and kill process on port 3002
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002.*LISTENING"') do (
    echo Killing process %%a on port 3002...
    taskkill //F //PID %%a >nul 2>&1
)

REM Kill any PowerShell screenshot watchers
for /f "tokens=2" %%a in ('tasklist ^| findstr "powershell.exe"') do (
    taskkill //F //PID %%a >nul 2>&1
)

echo Ports 3001 and 3002 are now free.
