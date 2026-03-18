from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectApplicationViewSet, trigger_cloud_backup, reset_google_connection

router = DefaultRouter()
router.register(r'applications', ProjectApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('backup/', trigger_cloud_backup, name='trigger_backup'),
    path('reset-google/', reset_google_connection, name='reset_google_connection'),
]