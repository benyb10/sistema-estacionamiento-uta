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