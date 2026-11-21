@echo off
cd /d "%~dp0"
echo [CLEANUP] Clearing previous test-results and report artifacts...
if exist "test-results" rmdir /s /q "test-results"
if exist "playwright-report" rmdir /s /q "playwright-report"
echo Launching Playwright UI Mode for Login tests...
npx playwright test tests/auth/login* --ui
