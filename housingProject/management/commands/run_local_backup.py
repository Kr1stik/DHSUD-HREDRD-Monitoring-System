import os
import subprocess
import datetime
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Runs a secure local backup of the PostgreSQL database'

    def handle(self, *args, **kwargs):
        try:
            # 1. Create the safe backup folder in Windows Documents
            backup_dir = os.path.join(os.path.expanduser('~'), 'Documents', 'DHSUD_System_Backups')
            os.makedirs(backup_dir, exist_ok=True)

            # 2. Generate the timestamped filename
            timestamp = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
            filename = f"backup_{timestamp}.sql"
            filepath = os.path.join(backup_dir, filename)

            # 3. Extract PostgreSQL credentials
            db = settings.DATABASES['default']
            db_name = db['NAME']
            db_user = db['USER']
            db_password = db['PASSWORD']
            db_host = db.get('HOST', 'localhost')
            db_port = str(db.get('PORT', '5432'))

            # 4. Inject password into environment securely
            env = os.environ.copy()
            env['PGPASSWORD'] = db_password

            self.stdout.write(f"Starting database dump for {db_name}...")

            subprocess.run([
                r'C:\Program Files\PostgreSQL\18\bin\pg_dump.exe', # <-- ADDED \bin\pg_dump.exe HERE
                '-U', db_user, 
                '-h', db_host, 
                '-p', db_port, 
                '-F', 'c',  # Custom compressed format (best for restoring)
                '-f', filepath, 
                db_name
            ], env=env, check=True)

            self.stdout.write(self.style.SUCCESS(f"SUCCESS! Database backed up to: {filepath}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"BACKUP FAILED: {str(e)}"))