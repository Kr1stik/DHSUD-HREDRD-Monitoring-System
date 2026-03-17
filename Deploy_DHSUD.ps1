# DHSUD Housing Registry - Production Deployment Script
# -------------------------------------------------------------------
# This script ensures the latest React build is correctly served by Django.

echo "--- [1/5] Building Frontend (Vite) ---"
cd frontend
npm run build
if ($LASTEXITCODE -ne 0) { echo "Build failed!"; exit $LASTEXITCODE }
cd ..

echo "--- [2/5] Preparing Django App Folders ---"
if (!(Test-Path "trackerApp/static/trackerApp")) { New-Item -ItemType Directory -Force "trackerApp/static/trackerApp" | Out-Null }
if (!(Test-Path "trackerApp/templates/trackerApp")) { New-Item -ItemType Directory -Force "trackerApp/templates/trackerApp" | Out-Null }

echo "--- [3/5] Cleaning Old Build Files ---"
Remove-Item -Recurse -Force trackerApp/static/trackerApp/* -ErrorAction SilentlyContinue
Remove-Item -Force trackerApp/templates/trackerApp/index.html -ErrorAction SilentlyContinue

echo "--- [4/5] Moving Fresh Build to Django ---"
# Copy all files from dist to trackerApp static folder
Copy-Item -Recurse -Force frontend/dist/* trackerApp/static/trackerApp/
# Move index.html to the templates folder where Django expects it
Move-Item -Force trackerApp/static/trackerApp/index.html trackerApp/templates/trackerApp/index.html

echo "--- [5/5] Flushing Static Assets & Rebuilding Cache ---"
call venv/Scripts/activate
python manage.py collectstatic --noinput --clear

echo "==================================================================="
echo "   DEPLOYMENT COMPLETE: Latest React code is now live!"
echo "   Run Start_DHSUD_System.bat to start the server."
echo "==================================================================="
