from django.db import models
from decimal import Decimal

class TipoLugar(models.Model):
    nombre = models.CharField(max_length=50, unique=True)  # Nuevo modelo
    descripcion = models.TextField(blank=True)
    tarifa_por_hora = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    color_identificacion = models.CharField(max_length=7, default='#FFFFFF')  # Color hex
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        verbose_name = "Tipo de Lugar"
        verbose_name_plural = "Tipos de Lugares"

class Lugar(models.Model):
    ESTADOS = [
        ('DISPONIBLE', 'Disponible'),
        ('OCUPADO', 'Ocupado'),
        ('FUERA_SERVICIO', 'Fuera de Servicio'),
        ('RESERVADO', 'Reservado'),
    ]
    
    numero = models.IntegerField(primary_key=True)
    tipo_lugar = models.ForeignKey(TipoLugar, on_delete=models.CASCADE)  # Nuevo
    piso = models.CharField(max_length=10, default='1')  # Nuevo
    seccion = models.CharField(max_length=20, blank=True)  # Nuevo (A, B, C, Norte, Sur, etc.)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='DISPONIBLE')  # Mejorado
    disponible = models.BooleanField(default=True)  # Mantener por compatibilidad
    tiene_techo = models.BooleanField(default=False)  # Nuevo
    observaciones = models.TextField(blank=True, null=True)  # Nuevo
    
    # Campos de auditoría
    fecha_creacion = models.DateTimeField(auto_now_add=True)  # Nuevo
    fecha_actualizacion = models.DateTimeField(auto_now=True)  # Nuevo

    def __str__(self):
        return f"Lugar {self.numero} - Piso {self.piso} ({self.get_estado_display()})"

    class Meta:
        verbose_name = "Lugar"
        verbose_name_plural = "Lugares"
        ordering = ['numero']
