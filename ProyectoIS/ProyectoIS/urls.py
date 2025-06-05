"""
URL configuration for ProyectoIS project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
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
from django.http import JsonResponse
from usuarios.views import LoginAPIView, VerificarCodigoAPIView, ping
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

def ping_view(request):
    return JsonResponse({'status': 'ok'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('usuarios/', include("usuarios.urls")),
    path('vehiculos/', include('vehiculos.urls')),
    path('lugares/', include('lugares.urls')),
    path('ingresovehiculos/', include('ingresovehiculos.urls')),
    path('login/', LoginAPIView.as_view(), name='login.urls'),
    path('verificar-codigo/', VerificarCodigoAPIView.as_view(), name='verificar-codigo.urls'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('ping/',  ping, name='ping'),
]
