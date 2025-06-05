from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LugarViewSet

router = DefaultRouter()
router.register(r'', LugarViewSet)

urlpatterns = [
    path('', include(router.urls)), # Agregar las rutas de la API
]  

