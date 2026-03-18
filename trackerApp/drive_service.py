import os
import pickle
import time
from datetime import datetime
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

load_dotenv()

def log_event(msg, level="info"):
    print(f"[{level.upper()}] {msg}")
    try:
        log_dir = os.path.join(os.getcwd(), 'logs')
        os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(log_dir, 'system_health.log')
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} [{level.upper()}] {msg}\n")
    except Exception as e:
        print(f"[ERROR] Could not write to log file: {e}")

# Principal of Least Privilege: only access files created by this app
SCOPES = ['https://www.googleapis.com/auth/drive.file']
TOKEN_PATH = os.getenv('GOOGLE_DRIVE_TOKEN_PATH', 'token.pickle')
CREDENTIALS_PATH = os.getenv('GOOGLE_DRIVE_CREDENTIALS_PATH', 'client_secret.json')

def get_drive_service():
    creds = None
    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH, 'rb') as token:
            creds = pickle.load(token)
            
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            port = int(os.getenv('GOOGLE_DRIVE_PORT', 8088))
            # prompt='select_account' ensures the user is asked to choose an account
            # access_type='offline' ensures we get a refresh token
            creds = flow.run_local_server(port=port, prompt='select_account', access_type='offline')
        with open(TOKEN_PATH, 'wb') as token:
            pickle.dump(creds, token)

    return build('drive', 'v3', credentials=creds)

def get_or_create_folder(folder_name):
    service = get_drive_service()
    safe_name = folder_name.replace("'", "\\'")
    query = f"name = '{safe_name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    results = service.files().list(q=query, fields="files(id, name)").execute()
    items = results.get('files', [])

    if items:
        return items[0]['id']
    else:
        folder_metadata = {'name': folder_name, 'mimeType': 'application/vnd.google-apps.folder'}
        folder = service.files().create(body=folder_metadata, fields='id').execute()
        return folder.get('id')

def upload_to_drive(file_path, folder_name, retries=3):
    """
    Uploads a file with an Exponential Backoff Retry Mechanism.
    """
    attempt = 0
    filename = os.path.basename(file_path)
    
    while attempt < retries:
        try:
            log_event(f"Starting cloud sync for {filename} (Attempt {attempt + 1})", "info")
            service = get_drive_service()
            folder_id = get_or_create_folder(folder_name)

            file_metadata = {'name': filename, 'parents': [folder_id]}
            media = MediaFileUpload(file_path, resumable=True)
            
            # CRITICAL FIX: Properly assign the response to 'drive_file' object
            drive_file = service.files().create(
                body=file_metadata, 
                media_body=media, 
                fields='id, webViewLink'
            ).execute()
            
            link = drive_file.get('webViewLink')
            log_event(f"Successfully synced {filename} to Cloud. Link: {link}", "success")
            return link
            
        except HttpError as error:
            attempt += 1
            if error.resp.status in [403, 429]: # Quota Exceeded or Rate Limited
                log_event(f"Quota exceeded or rate limited. Aborting sync for {filename}. API Response: {error._get_reason()}", "error")
                break # Break out of the loop, don't retry quota errors endlessly
            
            wait_time = 2 ** attempt
            log_event(f"Sync Attempt {attempt} failed for {filename} (HttpError): {error._get_reason()}", "warning")
            if attempt < retries:
                time.sleep(wait_time)
        except Exception as e:
            attempt += 1
            wait_time = 2 ** attempt
            log_event(f"Sync Attempt {attempt} failed for {filename}: {str(e)}", "warning")
            if attempt < retries:
                time.sleep(wait_time)
            
    log_event(f"CRITICAL: Cloud Sync failed after {attempt} attempts for {filename}", "error")
    return None
