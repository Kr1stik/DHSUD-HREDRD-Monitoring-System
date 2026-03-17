@echo off
setlocal enabledelayedexpansion

:: DHSUD Housing Registry System - LAN Optimization Script
:: -------------------------------------------------------------------
:: TASK 1: NETWORK BROADCAST & IP DETECTION
:: TASK 2: ARCHIVE SYSTEM BACKUP (pg_dump)
:: TASK 4: MULTI-USER PERFORMANCE (waitress --threads=16)

:: 1. Database Configuration
set DB_NAME=dhsud_db
set DB_USER=postgres
set DB_PASS=Wrfb052304
set BACKUP_DIR=Local_Backups
set PG_PATH="C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"

:: Detect IPv4 Address automatically
set MY_IP=127.0.0.1
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set temp_ip=%%a
    set MY_IP=!temp_ip:~1!
)

:: Robust Timestamp Generation (ISO-like YYYY-MM-DD_HH-MM)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%

echo ===================================================================
echo   DHSUD HOUSING REGISTRY SYSTEM - PRODUCTION STARTUP (LAN MODE)
echo ===================================================================

:: 2. Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" (
    echo [ACTION] Creating Local_Backups folder...
    mkdir "%BACKUP_DIR%"
)

:: 3. Run pg_dump before starting server
echo [1/3] Creating automated database backup...
set PGPASSWORD=%DB_PASS%
%PG_PATH% -U %DB_USER% -h localhost %DB_NAME% > "%BACKUP_DIR%\backup_%TIMESTAMP%.sql"
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Backup failed! Check PostgreSQL path: %PG_PATH%
) else (
    echo [SUCCESS] Backup saved to %BACKUP_DIR%\backup_%TIMESTAMP%.sql
)

:: 4. Activate virtual environment and ensure requirements are installed
echo [2/3] Checking dependencies and collecting static files...
if not exist venv (
    echo [ERROR] Virtual environment 'venv' not found!
    pause
    exit /b
)
call venv\Scripts\activate
pip install -r requirements.txt --quiet
python manage.py collectstatic --noinput

:: 5. Start Waitress Server with Multi-User Performance & LAN Broadcast
echo [3/3] Starting DHSUD Waitress Server (LAN Mode)...
echo [INFO] Multiple DHSUD employees can now connect to this server simultaneously.
echo [INFO] Performance configured for 16 simultaneous threads.
echo -------------------------------------------------------------------
echo  SERVER IS LIVE AT: http://%MY_IP%:8000
echo  (Local Backup Access): http://localhost:8000
echo -------------------------------------------------------------------
:: Binding to 0.0.0.0 allows access from any network interface (WiFi/Ethernet)
waitress-serve --listen=0.0.0.0:8000 --threads=16 housingProject.wsgi:application

pause
