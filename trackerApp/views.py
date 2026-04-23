import os
import csv
from datetime import datetime
from django.conf import settings
from django.core.files.storage import default_storage
from django.utils import timezone
from rest_framework import viewsets, filters
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from .models import (
    ProjectApplication, Salesperson, Province, CityMunicipality, Barangay,
    ProjectType, ApplicationType, ApplicationStatus, MainComplianceOption, CrlsOption
)
from .serializers import (
    ProjectApplicationSerializer, SalespersonSerializer,
    ProvinceSerializer, CityMunicipalitySerializer, BarangaySerializer,
    ProjectTypeSerializer, ApplicationTypeSerializer, ApplicationStatusSerializer,
    MainComplianceOptionSerializer, CrlsOptionSerializer
)

class ProvinceViewSet(viewsets.ModelViewSet):
    queryset = Province.objects.all().order_by('name')
    serializer_class = ProvinceSerializer
    pagination_class = None

class CityMunicipalityViewSet(viewsets.ModelViewSet):
    queryset = CityMunicipality.objects.all().order_by('name')
    serializer_class = CityMunicipalitySerializer
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        queryset = super().get_queryset()
        province_id = self.request.query_params.get('province')
        if province_id:
            queryset = queryset.filter(province_id=province_id)
        return queryset

class BarangayViewSet(viewsets.ModelViewSet):
    queryset = Barangay.objects.all().order_by('name')
    serializer_class = BarangaySerializer
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        queryset = super().get_queryset()
        city_id = self.request.query_params.get('city')
        if city_id:
            queryset = queryset.filter(city_id=city_id)
        return queryset

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({"success": True, "username": user.username})
    return Response({"error": "Invalid credentials"}, status=401)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def logout_view(request):
    logout(request)
    return Response({"success": True})

class CheckDriveConnectionView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        token_path = os.path.join(settings.BASE_DIR, 'token.pickle')
        return Response({"is_connected": os.path.exists(token_path)})

from .serializers import ProjectApplicationSerializer, SalespersonSerializer
from .drive_service import upload_to_drive, get_connected_account, get_drive_service
from django.http import JsonResponse

@api_view(['POST'])
def bulk_action_projects(request):
    action = request.data.get('action')
    ids = request.data.get('ids', [])
    
    if not ids:
        return Response({'status': 'error', 'message': 'No project IDs provided'}, status=400)
        
    projects = ProjectApplication.objects.filter(id__in=ids)
    
    if action == 'archive' or action == 'delete':
        projects.update(status_of_application='Archived', date_archived=timezone.now())
        return Response({'status': 'success', 'message': f'Archived {projects.count()} projects'})
    elif action == 'restore':
        projects.update(status_of_application='Ongoing', date_archived=None)
        return Response({'status': 'success', 'message': f'Restored {projects.count()} projects'})
        
    return Response({'status': 'error', 'message': 'Invalid action'}, status=400)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
def google_connection_status(request):
    try:
        email = get_connected_account()
        if email:
            return Response({'connected': True, 'email': email})
        return Response({'connected': False})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)

class ProjectApplicationViewSet(viewsets.ModelViewSet):
    queryset = ProjectApplication.objects.all().order_by('-id')
    serializer_class = ProjectApplicationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name_of_proj', 'mun_city', 'prov', 'proj_owner_dev', 'cr_no', 'ls_no']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # 🔓 ALLOW DETAIL FETCH: If we are fetching a specific ID, don't filter out archived
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return queryset

        status = self.request.query_params.get('status_of_application')
        if status:
            queryset = queryset.filter(status_of_application=status)
        else:
            # If no status specified, exclude archived to show active projects by default
            queryset = queryset.exclude(status_of_application='Archived')
        return queryset

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
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
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

@api_view(['GET'])
def dashboard_stats(request):
    today = timezone.now()
    
    # Count active projects (not archived)
    active_projects = ProjectApplication.objects.exclude(status_of_application='Archived')
    total_projects = active_projects.count()
    
    # Breakdown by status
    ongoing_count = active_projects.filter(status_of_application='Ongoing').count()
    approved_count = active_projects.filter(status_of_application='Approved').count()
    endorsed_count = active_projects.filter(status_of_application='Endorsed to HREDRB').count()
    denied_count = active_projects.filter(status_of_application='Denied').count()

    # Count active salespersons (not archived)
    total_salespersons = Salesperson.objects.filter(date_archived__isnull=True).count()
    
    # Count salespersons added this month
    new_salespersons_this_month = Salesperson.objects.filter(
        date_archived__isnull=True, 
        date_filed__year=today.year, 
        date_filed__month=today.month
    ).count()
    
    return Response({
        'total_projects': total_projects,
        'ongoing': ongoing_count,
        'approved': approved_count,
        'endorsed': endorsed_count,
        'denied': denied_count,
        'total_salespersons': total_salespersons,
        'new_salespersons_this_month': new_salespersons_this_month
    })

class SalespersonViewSet(viewsets.ModelViewSet):
    queryset = Salesperson.objects.all()
    serializer_class = SalespersonSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'middle_name', 'prn', 'prc_accre_no', 'broker_first_name', 'broker_last_name']
    ordering_fields = ['last_name', 'date_filed', 'date_of_registration']

    def get_queryset(self):
        queryset = super().get_queryset()
        archived = self.request.query_params.get('archived')
        if archived is not None:
            is_archived = archived.lower() == 'true'
            if is_archived:
                queryset = queryset.filter(date_archived__isnull=False)
        return queryset

class ProjectTypeViewSet(viewsets.ModelViewSet):
    queryset = ProjectType.objects.all().order_by('name')
    serializer_class = ProjectTypeSerializer
    pagination_class = None

class ApplicationTypeViewSet(viewsets.ModelViewSet):
    queryset = ApplicationType.objects.all().order_by('name')
    serializer_class = ApplicationTypeSerializer
    pagination_class = None

class ApplicationStatusViewSet(viewsets.ModelViewSet):
    queryset = ApplicationStatus.objects.all().order_by('name')
    serializer_class = ApplicationStatusSerializer
    pagination_class = None

class MainComplianceOptionViewSet(viewsets.ModelViewSet):
    queryset = MainComplianceOption.objects.all().order_by('name')
    serializer_class = MainComplianceOptionSerializer
    pagination_class = None

class CrlsOptionViewSet(viewsets.ModelViewSet):
    queryset = CrlsOption.objects.all().order_by('name')
    serializer_class = CrlsOptionSerializer
    pagination_class = None

