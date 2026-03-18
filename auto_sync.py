import sqlite3
import csv
import os
from datetime import datetime
from drive_service import upload_to_drive
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
DB_PATH = os.getenv('DB_PATH', 'db.sqlite3')
BACKUP_FOLDER = os.getenv('BACKUP_FOLDER', 'DAILY_AUTOMATED_BACKUPS')

def run_backup():
    filename = None
    conn = None
    try:
        # 1. Connect to your database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # 2. Get the project data
        cursor.execute("SELECT * FROM trackerApp_projectapplication")
        rows = cursor.fetchall()
        column_names = [description[0] for description in cursor.description]

        # 3. Create the CSV file
        date_str = datetime.now().strftime("%Y_%m_%d")
        filename = f"AUTO_DHSUD_Backup_{date_str}.csv"

        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(column_names)
            writer.writerows(rows)

        # 4. Upload to Google Drive
        print(f"Uploading {filename} to Google Drive...")
        drive_link = upload_to_drive(filename, BACKUP_FOLDER)

        if drive_link:
            print(f"Success! Backup available at: {drive_link}")

            # --- UPDATE: Update Dashboard Timestamp via SQL ---
            sync_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("INSERT OR REPLACE INTO trackerApp_systemsettings (id, last_cloud_sync) VALUES (1, ?)", (sync_time,))
            conn.commit()
            print("Dashboard timestamp updated.")
        else:
            print("Upload failed.")

    except Exception:
        # SECURITY: Avoid printing raw exception 'e' to logs as it might contain sensitive file paths
        print("CRITICAL: Automated backup failed. Check system logs or database connection.")
    finally:
        # 5. Cleanup local file (RESILIENCE)
        if filename and os.path.exists(filename):
            os.remove(filename)
        # 6. Close connection
        if conn:
            conn.close()

if __name__ == "__main__":
    run_backup()