from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectApplicationViewSet, 
    SalespersonViewSet,
    ProvinceViewSet,
    CityMunicipalityViewSet,
    BarangayViewSet,
    ProjectTypeViewSet,
    ApplicationTypeViewSet,
    ApplicationStatusViewSet,
    MainComplianceOptionViewSet,
    CrlsOptionViewSet,
    trigger_cloud_backup, 
    reset_google_connection, 
    google_connection_status, 
    connect_google_account, 
    bulk_action_projects,
    dashboard_stats,
    login_view,
    logout_view,
    CheckDriveConnectionView
)

router = DefaultRouter()
router.register(r'applications', ProjectApplicationViewSet)
router.register(r'salespersons', SalespersonViewSet)
router.register(r'provinces', ProvinceViewSet)
router.register(r'cities', CityMunicipalityViewSet)
router.register(r'barangays', BarangayViewSet)
router.register(r'project-types', ProjectTypeViewSet)
router.register(r'application-types', ApplicationTypeViewSet)
router.register(r'application-statuses', ApplicationStatusViewSet)
router.register(r'main-compliance-options', MainComplianceOptionViewSet)
router.register(r'crls-options', CrlsOptionViewSet)

urlpatterns = [
    path('auth/login/', login_view, name='api_login'),
    path('auth/logout/', logout_view, name='api_logout'),
    path('dashboard-stats/', dashboard_stats, name='dashboard-stats'),
    path('', include(router.urls)),
    path('projects/bulk-action/', bulk_action_projects, name='bulk_action'),
    path('backup/', trigger_cloud_backup, name='trigger_backup'),
    path('reset-google/', reset_google_connection, name='reset_google_connection'),
    path('google-status/', google_connection_status, name='google_connection_status'),
    path('connect-google/', connect_google_account, name='connect_google_account'),
    path('drive-status/', CheckDriveConnectionView.as_view(), name='drive-status'),
]