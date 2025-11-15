@echo off
REM dev-full.cmd - Wrapper for dev-full.ps1 with proper Ctrl+C handling

setlocal enabledelayedexpansion

REM Run PowerShell script and capture exit
powershell -ExecutionPolicy Bypass -NoExit -Command "& '%~dp0dev-full.ps1'; Read-Host 'Press Enter to close this window'"

REM Cleanup on exit
echo.
echo Cleaning up...
powershell -ExecutionPolicy Bypass -File "%~dp0kill-dev-ports.ps1"

endlocal
