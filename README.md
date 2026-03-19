# 🏛️ DHSUD HREDRD Monitoring System

![System Status](https://img.shields.io/badge/Status-Production-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Platform](https://img.shields.io/badge/Platform-Windows_LAN-lightgrey)

A localized, offline-first project monitoring system developed for the **Department of Human Settlements and Urban Development (DHSUD) Negros Island Region**. This system streamlines the tracking of housing project applications, Certificates of Registration (CR), and Licenses to Sell (LS) through a secure, high-performance Local Area Network (LAN) environment.

## 🚀 Key Features

* **Multi-User LAN Architecture:** Powered by `waitress` with multi-threading, allowing 16+ government staff members to access and modify the database simultaneously over the office network without internet reliance.
* **Dual-Layer Data Resilience:**
    * *Local Snapshots:* Automated PostgreSQL `pg_dump` backups generated every time the server boots.
    * *Cloud Sync:* Seamless, one-click CSV data export to Google Drive via the Google Drive API.
* **Zero-Config Account Switching:** Integrated Google OAuth 2.0 flow with offline access (refresh tokens) that allows staff to securely disconnect and switch Google Drive backup accounts without touching the codebase.
* **Interactive Analytics:** Real-time dashboards built with Recharts to visualize application statuses, project types, and regional compliance.
* **Industrial-Grade Deployment:** Custom `.ps1` (PowerShell) and `.bat` scripts that handle automated frontend building, static file collection, service wake-ups, and UAC Administrator elevation.

## 🛠️ Tech Stack

**Frontend:**
* React 18 (TypeScript)
* Vite
* Tailwind CSS
* Recharts & SheetJS (Data Export)

**Backend:**
* Django (Python)
* PostgreSQL
* Waitress (WSGI Server for Windows)
* Google API Client (Drive v3)

## 📂 System Architecture

The system bridges a modern React Single Page Application (SPA) with a robust Django backend, optimized specifically for a Windows-based government office environment. 

1.  **Deployment (`Deploy_DHSUD.ps1`):** Compiles the Vite frontend and dynamically moves the `dist` assets into the Django `static` and `templates` directories. It automatically verifies `.env` configurations and system health logging directories.
2.  **Runtime (`Start_DHSUD_System.bat`):** Elevates to Administrator, verifies/starts the PostgreSQL Windows service, creates a daily `.sql` database backup, and serves the application to the local IPv4 address for office-wide access.

## ⚙️ Local Setup & Installation

If you are cloning this repository for further development:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/DHSUD-HREDRD-Monitoring-System.git](https://github.com/YOUR_USERNAME/DHSUD-HREDRD-Monitoring-System.git)
   cd DHSUD-HREDRD-Monitoring-System

   Environment Configuration:
Create a .env file in the root directory:

Code snippet
GOOGLE_DRIVE_PORT=8088
CLIENT_SECRET_FILE=client_secret.json
Note: You must provide your own client_secret.json from the Google Cloud Console.

Install Dependencies:

Bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd frontend && npm install
Deploy & Run:
Run the deployment script, followed by the startup script.

PowerShell
./Deploy_DHSUD.ps1
./Start_DHSUD_System.bat
👨‍💻 Author
Wenard Roy F. Barrera * Role: Lead Developer / Software Engineering Intern

Institution: STI West Negros University (BS Computer Science)

Portfolio: kr1stik.cosedevs.com

Developed during an official internship with the Administrative and Finance Division of DHSUD Negros Occidental (2026).


***

### How to add this to your GitHub right now:
1. Save the text above into a file named `README.md` in your main `DHSUD` folder.
2. Open your terminal in that folder.

**Would you like me to provide the quick 3-line Git command sequence to push this new REA