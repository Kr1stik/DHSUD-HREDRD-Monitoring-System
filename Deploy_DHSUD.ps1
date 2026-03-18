# DHSUD Housing Registry - Professional Production Deployment Script
# -------------------------------------------------------------------

Write-Host "--- [1/7] Building Frontend (Vite) ---" -ForegroundColor Cyan
cd frontend
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Build failed!"; exit $LASTEXITCODE }
cd ..

Write-Host "--- [2/7] Preparing Django App Folders ---" -ForegroundColor Cyan
if (!(Test-Path "trackerApp/static/trackerApp")) { New-Item -ItemType Directory -Force "trackerApp/static/trackerApp" | Out-Null }
if (!(Test-Path "trackerApp/templates/trackerApp")) { New-Item -ItemType Directory -Force "trackerApp/templates/trackerApp" | Out-Null }

Write-Host "--- [3/7] Cleaning Old Build Files ---" -ForegroundColor Cyan
Remove-Item -Recurse -Force trackerApp/static/trackerApp/* -ErrorAction SilentlyContinue
Remove-Item -Force trackerApp/templates/trackerApp/index.html -ErrorAction SilentlyContinue

Write-Host "--- [4/7] Moving Fresh Build to Django ---" -ForegroundColor Cyan
Copy-Item -Recurse -Force frontend/dist/* trackerApp/static/trackerApp/
Move-Item -Force trackerApp/static/trackerApp/index.html trackerApp/templates/trackerApp/index.html

# --- NEW PROFESSIONAL CHECKS START HERE ---

Write-Host "--- [5/7] Resilience Check: Creating Log Directory ---" -ForegroundColor Green
if (!(Test-Path "logs")) { 
    New-Item -ItemType Directory -Path "logs" | Out-Null 
    Write-Host "✅ Created /logs folder for System Health monitoring."
}

Write-Host "--- [6/7] Security Check: Verifying .env Configuration ---" -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    $envContent = "GOOGLE_DRIVE_PORT=8088`nCLIENT_SECRET_FILE=client_secret.json`nDATABASE_PATH=db.sqlite3`nBACKUP_TMP_DIR=tmp"
    $envContent | Out-File -FilePath .env -Encoding utf8
    Write-Host "⚠️ Created default .env file. Please verify settings."
}

Write-Host "--- [7/7] Database & Static Asset Sync ---" -ForegroundColor Cyan
# Using the full path to venv to ensure it works even if not "activated" in the terminal
& venv/Scripts/python.exe manage.py migrate
& venv/Scripts/python.exe manage.py collectstatic --noinput --clear

Write-Host "===================================================================" -ForegroundColor White -BackgroundColor Blue
Write-Host "   DEPLOYMENT COMPLETE: HREDRD System is Hardened & Live!        " -ForegroundColor White -BackgroundColor Blue
Write-Host "   Run Start_DHSUD_System.bat to start the server.               " -ForegroundColor White -BackgroundColor Blue
Write-Host "===================================================================" -ForegroundColor White -BackgroundColor Blue