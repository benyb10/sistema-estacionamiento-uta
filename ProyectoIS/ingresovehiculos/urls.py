from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IngresoVehiculoViewSet

router = DefaultRouter()
router.register(r'', IngresoVehiculoViewSet)

urlpatterns = [
    path('', include(router.urls)), # Agregar las rutas de la API
]  

