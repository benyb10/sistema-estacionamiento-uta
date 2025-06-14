from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IngresoVehiculoViewSet,
    LugaresDisponiblesAPIView,
    BuscarIngresoActivoAPIView
)

# Router para el ViewSet principal
router = DefaultRouter()
router.register(r'', IngresoVehiculoViewSet, basename='ingresovehiculo')

urlpatterns = [
    # === RUTAS ESPECÍFICAS PRIMERO (ANTES DEL ROUTER) ===
    
    # Entrada de vehículos (usando el ViewSet)
    path('entrada/', IngresoVehiculoViewSet.as_view({
        'post': 'create'
    }), name='registrar-entrada'),
    
    # Lugares disponibles (usado en EntryPage)
    path('lugares-disponibles/', LugaresDisponiblesAPIView.as_view(), name='lugares-disponibles'),
    
    # Buscar ingreso activo (usado en ExitPage)
    path('buscar-activo/', BuscarIngresoActivoAPIView.as_view(), name='buscar-ingreso-activo'),
    
    # Ingresos activos (filtrado por estado EN_CURSO)
    path('activos/', IngresoVehiculoViewSet.as_view({
        'get': 'activos'
    }), name='ingresos-activos'),
    
    # Estadísticas generales
    path('estadisticas/', IngresoVehiculoViewSet.as_view({
        'get': 'estadisticas'
    }), name='estadisticas-estacionamiento'),
    
    # === RUTAS CON PARÁMETROS ===
    
    # Salida de vehículos (usando acción personalizada del ViewSet)
    path('salida/<int:pk>/', IngresoVehiculoViewSet.as_view({
        'post': 'finalizar'
    }), name='registrar-salida'),
    
    # Marcar salida de un ingreso específico
    path('<int:pk>/salida/', IngresoVehiculoViewSet.as_view({
        'post': 'finalizar'
    }), name='marcar-salida'),
    
    # Calcular costo de un ingreso
    path('<int:pk>/calcular-costo/', IngresoVehiculoViewSet.as_view({
        'get': 'calcular_costo'
    }), name='calcular-costo'),
    
    # Generar ticket de un ingreso
    path('<int:pk>/ticket/', IngresoVehiculoViewSet.as_view({
        'get': 'generar_ticket'
    }), name='generar-ticket'),
    
    # Historial de un vehículo específico
    path('vehiculo/<str:placa>/', IngresoVehiculoViewSet.as_view({
        'get': 'por_vehiculo'
    }), name='ingresos-por-vehiculo'),
    
    # Historial de un usuario específico
    path('usuario/<str:cedula>/', IngresoVehiculoViewSet.as_view({
        'get': 'por_usuario'
    }), name='ingresos-por-usuario'),
    
    # Reportes diarios
    path('reportes/diario/', IngresoVehiculoViewSet.as_view({
        'get': 'reporte_diario'
    }), name='reporte-diario'),

    # === ROUTER AL FINAL (CRUD BÁSICO) ===
    # Rutas del ViewSet principal (CRUD completo) - DEBE IR AL FINAL
    path('', include(router.urls)),
]