from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from decimal import Decimal

from .models import IngresoVehiculo
from .serializers import IngresoVehiculoSerializer
from vehiculos.models import Vehiculo
from lugares.models import Lugar
from usuarios.models import Usuario

class IngresoVehiculoViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para el manejo de ingresos de vehículos
    """
    queryset = IngresoVehiculo.objects.all()
    serializer_class = IngresoVehiculoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Optimizar consultas con select_related"""
        return IngresoVehiculo.objects.select_related(
            'vehiculo__usuario',
            'lugar__tipo_lugar',
            'usuario_registro'
        ).order_by('-hora_ingreso')
    
    def perform_create(self, serializer):
        """Personalizar la creación de ingresos"""
        # Verificar que el lugar esté disponible
        lugar = serializer.validated_data['lugar']
        if not lugar.disponible:
            raise serializers.ValidationError("El lugar seleccionado no está disponible")
        
        # Verificar que el vehículo no tenga un ingreso activo
        vehiculo = serializer.validated_data['vehiculo']
        ingreso_activo = IngresoVehiculo.objects.filter(
            vehiculo=vehiculo,
            estado='EN_CURSO'
        ).first()
        
        if ingreso_activo:
            raise serializers.ValidationError(
                f"El vehículo {vehiculo.placa} ya tiene un ingreso activo"
            )
        
        # Generar número de ticket
        fecha_hoy = timezone.now().strftime('%Y%m%d')
        ultimo_ticket = IngresoVehiculo.objects.filter(
            fecha_registro__date=timezone.now().date()
        ).count()
        ticket_numero = f"TKT-{fecha_hoy}-{ultimo_ticket + 1:03d}"
        
        # Establecer tarifa según el usuario y tipo de lugar
        tarifa = lugar.tipo_lugar.get_tarifa_para_usuario(vehiculo.usuario)
        
        # Guardar el ingreso
        ingreso = serializer.save(
            ticket_numero=ticket_numero,
            tarifa_aplicada=tarifa,
            estado='EN_CURSO'
        )
        
        # Marcar el lugar como ocupado
        lugar.marcar_como_ocupado()
        
        print(f"✅ Ingreso creado: {ingreso.ticket_numero} - {vehiculo.placa}")
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """Obtener todos los ingresos activos"""
        queryset = self.get_queryset().filter(estado='EN_CURSO')
        
        # Filtros opcionales
        placa = request.query_params.get('vehiculo__placa', None)
        ticket = request.query_params.get('ticket_numero', None)
        
        if placa:
            queryset = queryset.filter(vehiculo__placa__icontains=placa)
        
        if ticket:
            queryset = queryset.filter(ticket_numero__icontains=ticket)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        """Finalizar un ingreso específico"""
        ingreso = self.get_object()
        
        if ingreso.estado != 'EN_CURSO':
            return Response(
                {'error': 'Este ingreso ya fue finalizado o cancelado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Datos de finalización
        hora_salida = timezone.now()
        metodo_pago = request.data.get('metodo_pago', 'EFECTIVO')
        observaciones_salida = request.data.get('observaciones', '')
        
        # Calcular duración
        duracion = hora_salida - ingreso.hora_ingreso
        duracion_minutos = int(duracion.total_seconds() / 60)
        
        # Calcular costo
        if duracion_minutos > 0 and ingreso.tarifa_aplicada > 0:
            horas = duracion_minutos / 60
            costo_total = round(horas * float(ingreso.tarifa_aplicada), 2)
        else:
            costo_total = 0.00
        
        # Actualizar ingreso
        ingreso.hora_salida = hora_salida
        ingreso.duracion_minutos = duracion_minutos
        ingreso.costo_total = costo_total
        ingreso.metodo_pago = metodo_pago
        ingreso.estado = 'FINALIZADO'
        ingreso.pagado = metodo_pago != 'CREDITO'
        
        if observaciones_salida:
            observaciones_actual = ingreso.observaciones or ''
            ingreso.observaciones = f"{observaciones_actual}\nSalida: {observaciones_salida}".strip()
        
        ingreso.save()
        
        # Liberar el lugar
        ingreso.lugar.marcar_como_disponible()
        
        serializer = self.get_serializer(ingreso)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Obtener estadísticas de ingresos"""
        hoy = timezone.now().date()
        
        stats = {
            'ingresos_hoy': IngresoVehiculo.objects.filter(
                hora_ingreso__date=hoy
            ).count(),
            'ingresos_activos': IngresoVehiculo.objects.filter(
                estado='EN_CURSO'
            ).count(),
            'ingresos_finalizados_hoy': IngresoVehiculo.objects.filter(
                hora_salida__date=hoy,
                estado='FINALIZADO'
            ).count(),
            'recaudacion_hoy': float(
                IngresoVehiculo.objects.filter(
                    hora_salida__date=hoy,
                    estado='FINALIZADO',
                    pagado=True
                ).aggregate(
                    total=models.Sum('costo_total')
                )['total'] or 0
            )
        }
        
        return Response(stats)

class LugaresDisponiblesAPIView(APIView):
    """
    Vista para obtener lugares disponibles
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Obtener lugares disponibles según la categoría del usuario"""
        try:
            # Obtener el usuario autenticado
            usuario = request.user
            
            # Filtrar lugares disponibles
            lugares_disponibles = Lugar.objects.filter(
                estado='DISPONIBLE'
            ).select_related('tipo_lugar')
            
            # Filtrar según la categoría del usuario si es necesario
            categoria_usuario = getattr(usuario, 'categoria', 'TODOS')
            
            lugares_filtrados = []
            for lugar in lugares_disponibles:
                if lugar.tipo_lugar.puede_usar_usuario(usuario):
                    lugares_filtrados.append({
                        'numero': lugar.numero,
                        'piso': lugar.piso,
                        'seccion': lugar.seccion,
                        'bloque': lugar.bloque,
                        'tipo_lugar': {
                            'nombre': lugar.tipo_lugar.nombre,
                            'categoria_permitida': lugar.tipo_lugar.categoria_usuario_permitida,
                            'tarifa_por_hora': float(lugar.tipo_lugar.tarifa_por_hora),
                            'tarifa_estudiante': float(lugar.tipo_lugar.tarifa_estudiante)
                        },
                        'tiene_techo': lugar.tiene_techo,
                        'es_accesible': lugar.es_accesible
                    })
            
            return Response(lugares_filtrados, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"❌ Error obteniendo lugares disponibles: {e}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BuscarIngresoActivoAPIView(APIView):
    """
    Vista para buscar un ingreso activo por placa o ticket
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Buscar ingreso activo"""
        placa = request.query_params.get('placa', '').upper()
        ticket = request.query_params.get('ticket', '')
        
        if not placa and not ticket:
            return Response(
                {'error': 'Debe proporcionar una placa o número de ticket'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            queryset = IngresoVehiculo.objects.filter(estado='EN_CURSO').select_related(
                'vehiculo__usuario',
                'lugar__tipo_lugar',
                'usuario_registro'
            )
            
            if placa:
                ingreso = queryset.filter(vehiculo__placa=placa).first()
            else:
                ingreso = queryset.filter(ticket_numero=ticket).first()
            
            if not ingreso:
                return Response(
                    {'error': 'No se encontró un ingreso activo con esos datos'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Serializar con información completa
            data = {
                'id': ingreso.id,
                'ticket_numero': ingreso.ticket_numero,
                'hora_ingreso': ingreso.hora_ingreso,
                'estado': ingreso.estado,
                'observaciones': ingreso.observaciones,
                'vehiculo': {
                    'placa': ingreso.vehiculo.placa,
                    'marca': ingreso.vehiculo.marca,
                    'modelo': ingreso.vehiculo.modelo,
                    'tipo_vehiculo': ingreso.vehiculo.tipo_vehiculo,
                    'usuario': {
                        'cedula': ingreso.vehiculo.usuario.cedula,
                        'nombre': ingreso.vehiculo.usuario.nombre,
                        'apellido': ingreso.vehiculo.usuario.apellido,
                        'categoria': ingreso.vehiculo.usuario.categoria
                    }
                },
                'lugar': {
                    'numero': ingreso.lugar.numero,
                    'piso': ingreso.lugar.piso,
                    'seccion': ingreso.lugar.seccion,
                    'tipo_lugar': {
                        'nombre': ingreso.lugar.tipo_lugar.nombre,
                        'tarifa_por_hora': float(ingreso.lugar.tipo_lugar.tarifa_por_hora)
                    }
                },
                'usuario_registro': {
                    'cedula': ingreso.usuario_registro.cedula,
                    'nombre': ingreso.usuario_registro.get_full_name()
                }
            }
            
            return Response(data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"❌ Error buscando ingreso: {e}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )