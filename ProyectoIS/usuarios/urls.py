from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet
from .views import RegistroUsuarioView
from .views import LoginAPIView, VerificarCodigoAPIView

router = DefaultRouter()
router.register(r'', UsuarioViewSet)

urlpatterns = [
    path('', include(router.urls)),  # Agregar las rutas de la API
    path('registro/', RegistroUsuarioView.as_view(), name='registro-usuario'),
    path('verificar-codigo/', VerificarCodigoAPIView.as_view(), name='verificar-codigo'),
]
