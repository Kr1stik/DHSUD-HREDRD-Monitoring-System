from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectApplicationViewSet

router = DefaultRouter()
router.register(r'applications', ProjectApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
