@echo off
REM dev-full.cmd - Starts dev servers with proper cleanup on Ctrl+C

setlocal enabledelayedexpansion

echo Starting development environment...
echo.

REM Change to project directory
cd /d "%~dp0.."

REM Kill existing processes on ports
call npm run kill-ports

REM Start Vite dev server in new window
echo [APP] Starting Vite dev server...
start "Vite Dev Server" /MIN cmd /c "npm run dev"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start log server in new window
echo [LOGS] Starting log server...
start "Log Server" /MIN cmd /c "npm run log-server"

REM Wait for servers to initialize
timeout /t 3 /nobreak >nul

REM Launch Chrome
echo.
echo Opening Chrome browser...
set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
if exist "%CHROME_PATH%" (
    start "" "%CHROME_PATH%" "http://127.0.0.1:3001"
    echo Chrome launched!
) else (
    set CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
    if exist "!CHROME_PATH!" (
        start "" "!CHROME_PATH!" "http://127.0.0.1:3001"
        echo Chrome launched!
    ) else (
        echo Chrome not found. Please open http://127.0.0.1:3001 manually.
    )
)

echo.
echo ========================================
echo Development servers are running!
echo ========================================
echo Vite dev server: http://127.0.0.1:3001
echo Log server: http://127.0.0.1:3002
echo.
echo Press Ctrl+C to stop all services...
echo ========================================
echo.

REM Wait indefinitely - Ctrl+C will break this
:WAIT_LOOP
timeout /t 60 /nobreak >nul
goto WAIT_LOOP

REM This section runs when Ctrl+C is pressed
:CLEANUP
echo.
echo.
echo Stopping all services...
call npm run kill-ports
echo.
echo All services stopped.
echo.
pause
endlocal
exit /b
