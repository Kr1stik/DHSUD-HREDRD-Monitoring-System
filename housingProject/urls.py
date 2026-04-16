from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView, RedirectView
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

urlpatterns = [
    path('', RedirectView.as_view(url='/HREDRD/dashboard', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/', include('trackerApp.urls')),
    
    # ⚡ FORCE WAITRESS STATIC SYNC
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATICFILES_DIRS[0]}),
    
    # MEDIA FILE SERVING (FOR WAITRESS)
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    
    # REACT CATCH-ALL ROUTE
    re_path(r'^HREDRD/.*$', TemplateView.as_view(template_name='index.html')),
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
