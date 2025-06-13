from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehiculoViewSet, VehiculosUsuarioView, VehiculoDetailView

router = DefaultRouter()
router.register(r'', VehiculoViewSet)

urlpatterns = [
    path('', include(router.urls)), 
    path('usuario/<str:cedula>/', VehiculosUsuarioView.as_view(), name='vehiculos_usuario'),
    path('<int:pk>/', VehiculoDetailView.as_view(), name='vehiculo_detail'),
]  

