import os
import csv
from datetime import datetime
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ProjectApplication
from .serializers import ProjectApplicationSerializer
from .drive_service import upload_to_drive, get_connected_account, get_drive_service
from django.http import JsonResponse

@api_view(['POST'])
def connect_google_account(request):
    try:
        # Calling get_drive_service() will trigger InstalledAppFlow if token.pickle is missing
        get_drive_service()
        email = get_connected_account()
        return Response({'status': 'success', 'message': 'Account connected successfully!', 'email': email})
    except Exception as e:
        # Catch the exception (happens when user closes auth window or declines)
        return Response({'status': 'warning', 'message': 'Google login was canceled or failed. Please try again.'}, status=400)

@api_view(['GET'])
def google_connection_status(request):
    try:
        email = get_connected_account()
        if email:
            return Response({'connected': True, 'email': email})
        return Response({'connected': False})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)

class ProjectApplicationViewSet(viewsets.ModelViewSet):
    queryset = ProjectApplication.objects.all()
    serializer_class = ProjectApplicationSerializer

    def handle_drive_upload(self, instance, request):
        upload_file = request.FILES.get('drive_file')
        if not upload_file:
            return

        full_temp_path = None
        try:
            # 1. Save file temporarily
            temp_path = default_storage.save(f"tmp/{upload_file.name}", upload_file)
            full_temp_path = default_storage.path(temp_path)

            # 2. Upload to Drive using our service
            folder_name = instance.status_of_application or "Uncategorized"
            drive_link = upload_to_drive(full_temp_path, folder_name)

            # 3. Update DB
            if drive_link:
                instance.drive_link = drive_link
                instance.save()
        finally:
            # 4. Cleanup (Always runs)
            if full_temp_path and os.path.exists(full_temp_path):
                os.remove(full_temp_path)

    def perform_create(self, serializer):
        instance = serializer.save()
        self.handle_drive_upload(instance, self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        self.handle_drive_upload(instance, self.request)

def get_csv_export_config():
    """Centralized config for export columns to ensure scalability."""
    return {
        'headers': ['Project ID', 'Project Name', 'Owner/Developer', 'Status', 'Type', 'CR No', 'LS No', 'Category', 'Date Filed', 'Province', 'City', 'Barangay'],
        'fields': ['id', 'name_of_proj', 'proj_owner_dev', 'status_of_application', 'proj_type', 'cr_no', 'ls_no', 'main_or_compliance', 'date_filed', 'prov', 'mun_city', 'street_brgy']
    }

@api_view(['POST'])
def trigger_cloud_backup(request):
    raw_folder_name = request.data.get('folder_name', 'Automated_Backups')
    # SECURITY: Sanitize folder name to prevent injection or invalid characters
    folder_name = "".join(c for c in raw_folder_name if c.isalnum() or c in (' ', '_', '-')).strip()
    if not folder_name:
        folder_name = "Manual_Backups"

    date_str = datetime.now().strftime("%Y_%m_%d_%H%M")
    filename = f"HREDRD_Backup_{date_str}.csv"

    tmp_dir = os.path.join(settings.BASE_DIR, 'tmp')
    os.makedirs(tmp_dir, exist_ok=True)
    filepath = os.path.join(tmp_dir, filename)

    try:
        config = get_csv_export_config()
        # PERFORMANCE: Only fetch required fields
        projects = ProjectApplication.objects.all().only(*config['fields'])

        with open(filepath, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(config['headers'])
            for p in projects:
                writer.writerow([getattr(p, field) for field in config['fields']])

        drive_link = upload_to_drive(filepath, folder_name)

        if drive_link:
            from django.utils import timezone
            from .models import SystemSettings
            settings_obj, _ = SystemSettings.objects.get_or_create(id=1)
            settings_obj.last_cloud_sync = timezone.now()
            settings_obj.save()
            return Response({"status": "success", "link": drive_link, "message": f"Backup saved to Drive folder: {folder_name}"})
        
        # FIX: Provide a clean error message instead of letting the view potentially crash or return a generic 500
        return Response({
            "status": "error", 
            "message": "Cloud sync failed after maximum retries. Please check your internet connection and Google Drive quota."
        }, status=503) # 503 Service Unavailable is more accurate for network/API failures
    except Exception as e:
        return Response({
            "status": "error",
            "message": f"Internal system error during backup: {str(e)}"
        }, status=500)
    finally:
        # RESILIENCE: Cleanup local file even if upload fails
        if os.path.exists(filepath):
            os.remove(filepath)

@api_view(['POST'])
def reset_google_connection(request):
    try:
        # Resolve the full path correctly
        token_path = os.path.join(settings.BASE_DIR, 'token.pickle')
        if os.path.exists(token_path):
            os.remove(token_path)
            return Response({'status': 'success', 'message': 'Connection reset. Next sync will ask for a new login.'})
        return Response({'status': 'info', 'message': 'No active connection found.'})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)