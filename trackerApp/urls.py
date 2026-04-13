from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectApplicationViewSet, 
    SalespersonViewSet,
    trigger_cloud_backup, 
    reset_google_connection, 
    google_connection_status, 
    connect_google_account, 
    bulk_action_projects
)

router = DefaultRouter()
router.register(r'applications', ProjectApplicationViewSet)
router.register(r'salespersons', SalespersonViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('projects/bulk-action/', bulk_action_projects, name='bulk_action'),
    path('backup/', trigger_cloud_backup, name='trigger_backup'),
    path('reset-google/', reset_google_connection, name='reset_google_connection'),
    path('google-status/', google_connection_status, name='google_connection_status'),
    path('connect-google/', connect_google_account, name='connect_google_account'),
]