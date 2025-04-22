"""
URL configuration for GeneSweeper project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from apps.api import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/upload-csv/', views.upload_csv, name='upload_csv'),
    path('api/export-csv/', views.export_csv, name='export_csv'),
    path('api/', include('apps.api.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', views.register_user, name='register_user'),
    path('api/sweeps/', views.user_sweeps, name='user_sweeps'),
    path('api/save-sweep/', views.save_sweep, name='save_sweep'),
    path('api/sweeps/<int:sweep_id>/delete/', views.delete_sweep, name='delete_sweep'),
    path('api/upload-and-scrape/', views.upload_and_scrape, name='upload_and_scrape'),
    path('api/external-credentials/', views.get_external_credentials, name='get_external_credentials'),
    path('api/abort-scrape/', views.abort_scraper, name='abort_scraper'),

]
