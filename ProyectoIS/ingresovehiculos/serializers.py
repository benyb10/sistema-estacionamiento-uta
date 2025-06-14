from rest_framework import serializers
from .models import IngresoVehiculo, ReporteEstacionamiento
from vehiculos.models import Vehiculo
from lugares.models import Lugar
from usuarios.models import Usuario

class IngresoVehiculoSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para mostrar información detallada
    vehiculo_info = serializers.SerializerMethodField()
    lugar_info = serializers.SerializerMethodField()
    usuario_info = serializers.SerializerMethodField()
    duracion_formateada = serializers.SerializerMethodField()
    
    # Campos para escribir (recibir placa en lugar de objeto completo)
    vehiculo_placa = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = IngresoVehiculo
        fields = [
            'id',
            'vehiculo',
            'vehiculo_placa',  # Para escribir
            'vehiculo_info',   # Para leer
            'lugar',
            'lugar_info',      # Para leer
            'usuario_registro',
            'usuario_info',    # Para leer
            'hora_ingreso',
            'hora_salida',
            'duracion_minutos',
            'duracion_formateada',  # Para leer
            'estado',
            'tarifa_aplicada',
            'costo_total',
            'metodo_pago',
            'pagado',
            'observaciones',
            'ticket_numero',
            'fecha_registro',
            'fecha_actualizacion'
        ]
        read_only_fields = [
            'id',
            'ticket_numero',
            'duracion_minutos',
            'fecha_registro',
            'fecha_actualizacion'
        ]
    
    def get_vehiculo_info(self, obj):
        """Información detallada del vehículo"""
        if obj.vehiculo:
            return {
                'placa': obj.vehiculo.placa,
                'marca': obj.vehiculo.marca,
                'modelo': obj.vehiculo.modelo,
                'tipo_vehiculo': obj.vehiculo.tipo_vehiculo,
                'propietario': {
                    'cedula': obj.vehiculo.usuario.cedula,
                    'nombre': obj.vehiculo.usuario.get_full_name(),
                    'categoria': obj.vehiculo.usuario.categoria
                }
            }
        return None
    
    def get_lugar_info(self, obj):
        """Información detallada del lugar"""
        if obj.lugar:
            return {
                'numero': obj.lugar.numero,
                'piso': obj.lugar.piso,
                'seccion': obj.lugar.seccion,
                'bloque': obj.lugar.bloque,
                'tipo_lugar': {
                    'nombre': obj.lugar.tipo_lugar.nombre,
                    'categoria_permitida': obj.lugar.tipo_lugar.categoria_usuario_permitida,
                    'tarifa_por_hora': float(obj.lugar.tipo_lugar.tarifa_por_hora)
                },
                'ubicacion_completa': obj.lugar.ubicacion_completa
            }
        return None
    
    def get_usuario_info(self, obj):
        """Información del usuario que registró el ingreso"""
        if obj.usuario_registro:
            return {
                'cedula': obj.usuario_registro.cedula,
                'nombre': obj.usuario_registro.get_full_name(),
                'categoria': obj.usuario_registro.categoria
            }
        return None
    
    def get_duracion_formateada(self, obj):
        """Duración en formato legible"""
        if obj.duracion_minutos:
            horas = obj.duracion_minutos // 60
            minutos = obj.duracion_minutos % 60
            if horas > 0:
                return f"{horas}h {minutos}m"
            return f"{minutos}m"
        elif obj.estado == 'EN_CURSO':
            # Calcular duración actual
            from django.utils import timezone
            duracion = timezone.now() - obj.hora_ingreso
            minutos_totales = int(duracion.total_seconds() / 60)
            horas = minutos_totales // 60
            minutos = minutos_totales % 60
            return f"{horas}h {minutos}m (en curso)"
        return None
    
    def validate(self, data):
        """Validaciones personalizadas"""
        # Si se proporciona vehiculo_placa, buscar el vehículo
        if 'vehiculo_placa' in data:
            try:
                vehiculo = Vehiculo.objects.get(placa=data['vehiculo_placa'])
                data['vehiculo'] = vehiculo
            except Vehiculo.DoesNotExist:
                raise serializers.ValidationError({
                    'vehiculo_placa': f"No existe un vehículo con la placa {data['vehiculo_placa']}"
                })
        
        # Validar que el lugar esté disponible
        if 'lugar' in data:
            lugar = data['lugar']
            if not lugar.disponible:
                raise serializers.ValidationError({
                    'lugar': f"El lugar {lugar.numero} no está disponible"
                })
        
        # Validar que el vehículo no tenga un ingreso activo
        if 'vehiculo' in data:
            vehiculo = data['vehiculo']
            ingreso_activo = IngresoVehiculo.objects.filter(
                vehiculo=vehiculo,
                estado='EN_CURSO'
            ).exclude(id=self.instance.id if self.instance else None).first()
            
            if ingreso_activo:
                raise serializers.ValidationError({
                    'vehiculo': f"El vehículo {vehiculo.placa} ya tiene un ingreso activo (Ticket: {ingreso_activo.ticket_numero})"
                })
        
        return data
    
    def create(self, validated_data):
        """Crear un nuevo ingreso"""
        # Remover campos que no van al modelo
        validated_data.pop('vehiculo_placa', None)
        
        # Crear el ingreso
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Actualizar un ingreso existente"""
        # Remover campos que no van al modelo
        validated_data.pop('vehiculo_placa', None)
        
        return super().update(instance, validated_data)

class IngresoVehiculoCreateSerializer(serializers.ModelSerializer):
    """Serializer simplificado para crear ingresos desde el frontend"""
    vehiculo = serializers.CharField()  # Recibir solo la placa
    
    class Meta:
        model = IngresoVehiculo
        fields = [
            'vehiculo',
            'lugar',
            'usuario_registro',
            'observaciones'
        ]
    
    def validate_vehiculo(self, value):
        """Validar que el vehículo existe"""
        try:
            return Vehiculo.objects.get(placa=value.upper())
        except Vehiculo.DoesNotExist:
            raise serializers.ValidationError(f"No existe un vehículo con la placa {value}")
    
    def validate_lugar(self, value):
        """Validar que el lugar esté disponible"""
        if not value.disponible:
            raise serializers.ValidationError(f"El lugar {value.numero} no está disponible")
        return value
    
    def validate(self, data):
        """Validaciones adicionales"""
        vehiculo = data.get('vehiculo')
        
        # Verificar que el vehículo no tenga un ingreso activo
        if vehiculo:
            ingreso_activo = IngresoVehiculo.objects.filter(
                vehiculo=vehiculo,
                estado='EN_CURSO'
            ).first()
            
            if ingreso_activo:
                raise serializers.ValidationError(
                    f"El vehículo {vehiculo.placa} ya tiene un ingreso activo"
                )
        
        return data

class ReporteEstacionamientoSerializer(serializers.ModelSerializer):
    """Serializer para reportes de estacionamiento"""
    usuario_info = serializers.SerializerMethodField()
    
    class Meta:
        model = ReporteEstacionamiento
        fields = [
            'id',
            'usuario',
            'usuario_info',
            'periodo_inicio',
            'periodo_fin',
            'total_estacionamientos',
            'total_tiempo_minutos',
            'total_costo',
            'vehiculos_utilizados',
            'lugares_utilizados',
            'fecha_generacion'
        ]
        read_only_fields = ['fecha_generacion']
    
    def get_usuario_info(self, obj):
        """Información del usuario del reporte"""
        return {
            'cedula': obj.usuario.cedula,
            'nombre': obj.usuario.get_full_name(),
            'categoria': obj.usuario.categoria
        }