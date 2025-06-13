from rest_framework import serializers
from .models import Vehiculo
from usuarios.models import Usuario

class VehiculoSerializer(serializers.ModelSerializer):
    # Campos adicionales para mostrar información del usuario
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True)
    usuario_correo = serializers.CharField(source='usuario.correo', read_only=True)
    
    class Meta:
        model = Vehiculo
        fields = '__all__'
        
    def validate_placa(self, value):
        """
        Validar que la placa sea única
        """
        # Si estamos actualizando, excluir el vehículo actual de la validación
        if self.instance:
            if Vehiculo.objects.filter(placa=value).exclude(placa=self.instance.placa).exists():
                raise serializers.ValidationError("Ya existe un vehículo con esta placa.")
        else:
            if Vehiculo.objects.filter(placa=value).exists():
                raise serializers.ValidationError("Ya existe un vehículo con esta placa.")
        return value
    
    def validate_usuario(self, value):
        """
        Validar que el usuario existe
        """
        if not isinstance(value, Usuario):
            try:
                value = Usuario.objects.get(cedula=value)
            except Usuario.DoesNotExist:
                raise serializers.ValidationError("El usuario no existe.")
        return value
    
    def validate(self, data):
        """
        Validaciones adicionales
        """
        # Validar que un usuario no tenga más de 3 vehículos
        if not self.instance:  # Solo en creación
            usuario = data.get('usuario')
            if usuario:
                if isinstance(usuario, str):
                    # Si es una cédula, convertir a objeto Usuario
                    try:
                        usuario = Usuario.objects.get(cedula=usuario)
                    except Usuario.DoesNotExist:
                        raise serializers.ValidationError("El usuario no existe.")
                
                vehiculos_count = Vehiculo.objects.filter(usuario=usuario).count()
                if vehiculos_count >= 3:
                    raise serializers.ValidationError("Un usuario no puede tener más de 3 vehículos registrados.")
        
        return data