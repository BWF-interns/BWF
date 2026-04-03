# ============================================================
# BWF Project Startup Script
# Usage: Right-click > "Run with PowerShell"
#        OR from terminal: .\start-bwf.ps1
#        OR production mode: .\start-bwf.ps1 -Mode prod
# ============================================================

param(
    [ValidateSet("dev","prod")]
    [string]$Mode = "dev"
)

Write-Host ""
Write-Host "  BWF Portal Startup" -ForegroundColor Cyan
Write-Host "  Mode: $($Mode.ToUpper())" -ForegroundColor Yellow
Write-Host ""

# ── 1. MongoDB ───────────────────────────────────────────────
Write-Host "[1/4] Starting MongoDB..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'MongoDB' -ForegroundColor Cyan; F:\mongoFIles\bin\mongod.exe --dbpath F:\mongoFIles\data\db"
)
Start-Sleep -Seconds 2

# ── 2. Backend API ───────────────────────────────────────────
Write-Host "[2/4] Starting Backend API (port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'BWF Backend - port 5000' -ForegroundColor Green; Set-Location 'F:\BWF\BWF-Backend'; node index.js"
)
Start-Sleep -Seconds 2

# ── 3. Admin Dashboard ───────────────────────────────────────
if ($Mode -eq "prod") {
    Write-Host "[3/4] Building and starting Admin Dashboard (PRODUCTION)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Write-Host 'Admin Dashboard - PRODUCTION - port 3000' -ForegroundColor Magenta; Set-Location 'F:\BWF\BWF-Web-Dashboard'; npm run build; npm run start"
    )
} else {
    Write-Host "[3/4] Starting Admin Dashboard (DEV, port 3000)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Write-Host 'Admin Dashboard - DEV - port 3000' -ForegroundColor Magenta; Set-Location 'F:\BWF\BWF-Web-Dashboard'; npm run dev"
    )
}
Start-Sleep -Seconds 1

# ── 4. Student Dashboard ─────────────────────────────────────
if ($Mode -eq "prod") {
    Write-Host "[4/4] Building and starting Student Dashboard (PRODUCTION)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Write-Host 'Student Dashboard - PRODUCTION - port 3001' -ForegroundColor Blue; Set-Location 'F:\BWF\BWF-student-dashboard'; npm run build; npx next start -p 3001"
    )
} else {
    Write-Host "[4/4] Starting Student Dashboard (DEV, port 3001)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Write-Host 'Student Dashboard - DEV - port 3001' -ForegroundColor Blue; Set-Location 'F:\BWF\BWF-student-dashboard'; npm run dev -- -p 3001"
    )
}

Write-Host ""
Write-Host "  All services launching in separate windows." -ForegroundColor Cyan
Write-Host ""
Write-Host "  URLs:" -ForegroundColor White
Write-Host "    Backend API    ->  http://localhost:5000" -ForegroundColor Gray
Write-Host "    Admin Portal   ->  http://localhost:3000/admin/login" -ForegroundColor Gray
Write-Host "    Student Portal ->  http://localhost:3001" -ForegroundColor Gray
Write-Host ""
Write-Host "  Admin login:  admin@bwf.org / admin123" -ForegroundColor DarkGray
Write-Host ""

if ($Mode -eq "prod") {
    Write-Host "  PRODUCTION MODE: No compile lag. All pages pre-built." -ForegroundColor Yellow
} else {
    Write-Host "  DEV MODE: First visit to each page triggers a compile (~2-5s)." -ForegroundColor DarkYellow
    Write-Host "  Run '.\start-bwf.ps1 -Mode prod' for zero-lag production mode." -ForegroundColor DarkGray
}
Write-Host ""
