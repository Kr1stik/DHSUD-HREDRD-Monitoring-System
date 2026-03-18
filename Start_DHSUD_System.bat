@echo off
setlocal enabledelayedexpansion

:: --- [PHASE 1] AUTO-ADMIN TRIGGER ---
:: This ensures the script has permission to start the PostgreSQL service.
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"
:: --- END AUTO-ADMIN TRIGGER ---

:: --- [PHASE 2] DATABASE & SYSTEM CONFIG ---
:: 1. Wake up the PostgreSQL Service (Ensure version 18 matches your 'Services' app)
net start postgresql-x64-18

:: 2. Configuration
set DB_NAME=dhsud_db
set DB_USER=postgres
set DB_PASS=Wrfb052304
set BACKUP_DIR=Local_Backups
:: Verify this path exists in your File Explorer
set PG_PATH="C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"

:: 3. Detect IPv4 Address automatically for LAN access
set MY_IP=127.0.0.1
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "temp_ip=%%a"
    set "MY_IP=!temp_ip:~1!"
)

:: 4. Robust Timestamp Generation (ISO-like YYYY-MM-DD_HH-MM)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%

echo ===================================================================
echo   DHSUD HOUSING REGISTRY SYSTEM - PRODUCTION STARTUP (LAN MODE)
echo ===================================================================

:: --- [PHASE 3] BACKUP & PREPARATION ---
:: 5. Create backup directory if it doesn't exist [cite: 2]
if not exist "%BACKUP_DIR%" (
    echo [ACTION] Creating Local_Backups folder...
    mkdir "%BACKUP_DIR%"
)

:: 6. Run pg_dump before starting server [cite: 3]
echo [1/3] Creating automated database backup...
set PGPASSWORD=%DB_PASS%
%PG_PATH% -U %DB_USER% -h localhost %DB_NAME% > "%BACKUP_DIR%\backup_%TIMESTAMP%.sql"
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Backup failed! Check PostgreSQL path: %PG_PATH%
) else (
    echo [SUCCESS] Backup saved to %BACKUP_DIR%\backup_%TIMESTAMP%.sql
)

:: 7. Activate virtual environment and check logs folder
if not exist logs mkdir logs
echo [2/3] Checking dependencies and collecting static files...
if not exist venv (
    echo [ERROR] Virtual environment 'venv' not found!
    pause
    exit /b
)
call venv\Scripts\activate
pip install -r requirements.txt --quiet
python manage.py collectstatic --noinput

:: --- [PHASE 4] LIVE SERVER ---
:: 8. Start Waitress Server with Multi-User Performance [cite: 4]
echo [3/3] Starting DHSUD Waitress Server (LAN Mode)...
echo [INFO] Multiple DHSUD employees can now connect to this server simultaneously. [cite: 4]
echo [INFO] Performance configured for 16 simultaneous threads. [cite: 4]
echo -------------------------------------------------------------------
echo  SERVER IS LIVE AT: http://%MY_IP%:8000
echo  (Local Backup Access): http://localhost:8000
echo -------------------------------------------------------------------
:: Binding to 0.0.0.0 allows access from any network interface (WiFi/Ethernet)
waitress-serve --listen=0.0.0.0:8000 --threads=16 housingProject.wsgi:application

pause