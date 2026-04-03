@echo off
REM ============================================================
REM BWF Project Startup Script (Batch / CMD version)
REM Double-click to run in DEV mode
REM ============================================================

title BWF Startup

echo.
echo   BWF Portal Startup
echo.

REM Check for -prod argument
set MODE=dev
if /I "%1"=="prod" set MODE=prod

echo   Mode: %MODE%
echo.

REM ── 1. MongoDB ──────────────────────────────────────────────
echo [1/4] Starting MongoDB...
start "MongoDB" powershell -NoExit -Command "Write-Host 'MongoDB running...' -ForegroundColor Cyan; F:\mongoFIles\bin\mongod.exe --dbpath F:\mongoFIles\data\db"
timeout /t 2 /nobreak >nul

REM ── 2. Backend API ──────────────────────────────────────────
echo [2/4] Starting Backend API (port 5000)...
start "BWF Backend" powershell -NoExit -Command "Write-Host 'BWF Backend - port 5000' -ForegroundColor Green; cd F:\BWF\BWF-Backend; node index.js"
timeout /t 2 /nobreak >nul

REM ── 3. Admin Dashboard ──────────────────────────────────────
if /I "%MODE%"=="prod" (
    echo [3/4] Building Admin Dashboard for PRODUCTION...
    start "Admin Dashboard PROD" powershell -NoExit -Command "Write-Host 'Admin Dashboard - PRODUCTION' -ForegroundColor Magenta; cd F:\BWF\BWF-Web-Dashboard; npm run build; npm run start"
) else (
    echo [3/4] Starting Admin Dashboard in DEV mode...
    start "Admin Dashboard DEV" powershell -NoExit -Command "Write-Host 'Admin Dashboard - DEV' -ForegroundColor Magenta; cd F:\BWF\BWF-Web-Dashboard; npm run dev"
)
timeout /t 1 /nobreak >nul

REM ── 4. Student Dashboard ────────────────────────────────────
if /I "%MODE%"=="prod" (
    echo [4/4] Building Student Dashboard for PRODUCTION...
    start "Student Dashboard PROD" powershell -NoExit -Command "Write-Host 'Student Dashboard - PRODUCTION' -ForegroundColor Blue; cd F:\BWF\BWF-student-dashboard; npm run build; npx next start -p 3001"
) else (
    echo [4/4] Starting Student Dashboard in DEV mode...
    start "Student Dashboard DEV" powershell -NoExit -Command "Write-Host 'Student Dashboard - DEV' -ForegroundColor Blue; cd F:\BWF\BWF-student-dashboard; npm run dev -- -p 3001"
)

echo.
echo   All services launching in separate windows.
echo.
echo   URLs:
echo     Backend API    -^>  http://localhost:5000
echo     Admin Portal   -^>  http://localhost:3000/admin/login
echo     Student Portal -^>  http://localhost:3001
echo.
echo   Admin login: admin@bwf.org / admin123
echo.

if /I "%MODE%"=="prod" (
    echo   PRODUCTION MODE: No page compile lag. All pages pre-built.
) else (
    echo   DEV MODE: First visit to each page triggers a short compile.
    echo   For zero-lag mode: start-bwf.bat prod
)
echo.
pause
