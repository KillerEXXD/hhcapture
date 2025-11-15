@echo off
REM Quick start script for running E2E tests on Windows

echo ================================================================================
echo  Automated E2E Testing for 40 QA Test Cases
echo ================================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo [1/4] Checking Python dependencies...
pip show selenium >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Python dependencies...
    pip install selenium webdriver-manager beautifulsoup4
)

echo [2/4] Checking if dev server is running on port 3001...
netstat -an | find "3001" | find "LISTENING" >nul
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Dev server is not running on port 3001
    echo Please start it in another terminal: npm run dev
    echo.
    pause
    exit /b 1
)

echo [3/4] Dev server is running!

echo [4/4] Running automated E2E tests...
echo.

python test_40_cases_automated.py

echo.
echo ================================================================================
echo Tests complete! Check test-results/e2e-results.json for detailed results
echo ================================================================================
pause
