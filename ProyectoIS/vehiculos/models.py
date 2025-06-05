from django.db import models
from usuarios.models import Usuario
from django.core.validators import RegexValidator

class Vehiculo(models.Model):
    TIPOS_VEHICULO = [
        ('AUTO', 'Automóvil'),
        ('MOTO', 'Motocicleta'),
        ('CAMIONETA', 'Camioneta'),
        ('BICICLETA', 'Bicicleta'),
    ]
    
    ESTADOS = [
        ('ACTIVO', 'Activo'),
        ('INACTIVO', 'Inactivo'),
        ('BLOQUEADO', 'Bloqueado'),
    ]
    
    placa_validator = RegexValidator(
        regex=r'^[A-Z]{3}-\d{3,4}$|^[A-Z]{2}-\d{4}$',
        message='Formato de placa inválido (ej: ABC-1234 o AB-1234)'
    )
    
    placa = models.CharField(
        max_length=10, 
        primary_key=True,
        validators=[placa_validator]
    )
    marca = models.CharField(max_length=50)  # Nuevo
    modelo = models.CharField(max_length=100)
    año = models.IntegerField()  # Nuevo
    color = models.CharField(max_length=30)  # Nuevo
    tipo_vehiculo = models.CharField(max_length=20, choices=TIPOS_VEHICULO, default='AUTO')  # Nuevo
    estado = models.CharField(max_length=20, choices=ESTADOS, default='ACTIVO')  # Nuevo
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='vehiculos')
    
    # Campos de auditoría
    fecha_registro = models.DateTimeField(auto_now_add=True)  # Nuevo
    fecha_actualizacion = models.DateTimeField(auto_now=True)  # Nuevo
    observaciones = models.TextField(blank=True, null=True)  # Nuevo

    def __str__(self):
        return f"{self.placa} - {self.marca} {self.modelo}"

    class Meta:
        verbose_name = "Vehículo"
        verbose_name_plural = "Vehículos"