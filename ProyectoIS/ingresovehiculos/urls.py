
print("🔥 DEBUG: urls.py cargado")

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IngresoVehiculoViewSet,
    LugaresDisponiblesAPIView,
    BuscarIngresoActivoAPIView
)

print(f"🔥 DEBUG: LugaresDisponiblesAPIView importada correctamente")
# Router para el ViewSet principal
router = DefaultRouter()
router.register(r'', IngresoVehiculoViewSet, basename='ingresovehiculo')

urlpatterns = [
    # Rutas del ViewSet principal (CRUD completo)
    path('', include(router.urls)),
    
    # === RUTAS ESPECÍFICAS PARA EL FRONTEND ===
    
    # Entrada de vehículos (usando el ViewSet)
    path('entrada/', IngresoVehiculoViewSet.as_view({
        'post': 'create'
    }), name='registrar-entrada'),
    
    # Salida de vehículos (usando acción personalizada del ViewSet)
    path('salida/<int:pk>/', IngresoVehiculoViewSet.as_view({
        'post': 'finalizar'
    }), name='registrar-salida'),
    
    # Lugares disponibles (usado en EntryPage)
    path('lugares-disponibles/', LugaresDisponiblesAPIView.as_view(), name='lugares-disponibles'),
    
    # Buscar ingreso activo (usado en ExitPage)
    path('buscar-activo/', BuscarIngresoActivoAPIView.as_view(), name='buscar-ingreso-activo'),
    
    # === RUTAS ESPECÍFICAS DEL VIEWSET ===
    
    # Ingresos activos (filtrado por estado EN_CURSO)
    path('activos/', IngresoVehiculoViewSet.as_view({
        'get': 'activos'
    }), name='ingresos-activos'),
    
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
    
    # Estadísticas generales
    path('estadisticas/', IngresoVehiculoViewSet.as_view({
        'get': 'estadisticas'
    }), name='estadisticas-estacionamiento'),
    
    # === ACCIONES ESPECÍFICAS ===
    
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
]

# Documentación de los endpoints:
"""
=== ENDPOINTS DISPONIBLES ===

CRUD BÁSICO (ViewSet):
- GET    /ingresovehiculos/              - Listar todos los ingresos
- POST   /ingresovehiculos/              - Crear nuevo ingreso  
- GET    /ingresovehiculos/{id}/         - Obtener ingreso específico
- PUT    /ingresovehiculos/{id}/         - Actualizar ingreso completo
- PATCH  /ingresovehiculos/{id}/         - Actualizar ingreso parcial
- DELETE /ingresovehiculos/{id}/         - Eliminar ingreso

RUTAS ESPECÍFICAS FRONTEND:
- POST   /ingresovehiculos/entrada/                    - Registrar entrada (EntryPage)
- POST   /ingresovehiculos/salida/                     - Registrar salida (ExitPage)
- GET    /ingresovehiculos/lugares-disponibles/       - Lugares disponibles (EntryPage)
- GET    /ingresovehiculos/buscar-activo/              - Buscar ingreso activo (ExitPage)

CONSULTAS ESPECÍFICAS:
- GET    /ingresovehiculos/activos/                    - Ingresos EN_CURSO
- GET    /ingresovehiculos/vehiculo/{placa}/           - Historial por vehículo
- GET    /ingresovehiculos/usuario/{cedula}/           - Historial por usuario
- GET    /ingresovehiculos/reportes/diario/            - Reporte diario
- GET    /ingresovehiculos/estadisticas/               - Estadísticas generales

ACCIONES ESPECÍFICAS:
- PATCH  /ingresovehiculos/{id}/salida/                - Marcar salida
- GET    /ingresovehiculos/{id}/calcular-costo/        - Calcular costo
- GET    /ingresovehiculos/{id}/ticket/                - Generar ticket

=== PARÁMETROS DE CONSULTA SOPORTADOS ===

Para listado (/ingresovehiculos/):
- ?estado=EN_CURSO               - Filtrar por estado
- ?vehiculo__placa=ABC123        - Filtrar por placa
- ?usuario__cedula=1234567890    - Filtrar por cédula usuario
- ?fecha_desde=2024-01-01        - Filtrar desde fecha
- ?fecha_hasta=2024-12-31        - Filtrar hasta fecha
- ?lugar__numero=101             - Filtrar por número de lugar

Para buscar activo (/ingresovehiculos/buscar-activo/):
- ?placa=ABC123                  - Buscar por placa
- ?ticket=TKT-20241201-001       - Buscar por ticket

=== EJEMPLOS DE USO DESDE EL FRONTEND ===

EntryPage (registrar entrada):
POST /ingresovehiculos/entrada/
{
    "vehiculo_placa": "ABC123",
    "lugar": 101,
    "usuario_registro": "1234567890",
    "observaciones": "Entrada normal"
}

ExitPage (buscar vehículo activo):
GET /ingresovehiculos/buscar-activo/?placa=ABC123

ExitPage (registrar salida):
POST /ingresovehiculos/{id}/salida/
{
    "metodo_pago": "EFECTIVO",
    "observaciones": "Salida normal"
}
"""