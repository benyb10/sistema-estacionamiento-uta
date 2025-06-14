from django.db import models
from vehiculos.models import Vehiculo
from lugares.models import Lugar
from usuarios.models import Usuario
from decimal import Decimal
from django.utils import timezone

class IngresoVehiculo(models.Model):
    ESTADOS = [
        ('EN_CURSO', 'En Curso'),
        ('FINALIZADO', 'Finalizado'),
        ('CANCELADO', 'Cancelado'),
    ]
    
    METODOS_PAGO = [
        ('EFECTIVO', 'Efectivo'),
        ('TARJETA', 'Tarjeta'),
        ('TRANSFERENCIA', 'Transferencia'),
        ('CREDITO', 'Crédito Institucional'),
        ('GRATIS', 'Gratuito'),
    ]
    
    # Relaciones principales
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE, related_name='ingresos')
    lugar = models.ForeignKey(Lugar, on_delete=models.CASCADE, related_name='ingresos')
    usuario_registro = models.ForeignKey(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name='registros_realizados'
    )  # Nuevo
    
    # Tiempos
    hora_ingreso = models.DateTimeField(default=timezone.now)
    hora_salida = models.DateTimeField(null=True, blank=True)
    duracion_minutos = models.IntegerField(null=True, blank=True)  # Nuevo - calculado automáticamente
    
    # Estado y control
    estado = models.CharField(max_length=20, choices=ESTADOS, default='EN_CURSO')  # Nuevo
    
    # Información financiera
    tarifa_aplicada = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Nuevo
    costo_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Nuevo
    metodo_pago = models.CharField(max_length=20, choices=METODOS_PAGO, default='EFECTIVO')  # Nuevo
    pagado = models.BooleanField(default=False)  # Nuevo
    
    # Información adicional
    observaciones = models.TextField(blank=True, null=True)  # Nuevo
    ticket_numero = models.CharField(max_length=20, unique=True, blank=True)  # Nuevo
    
    # Campos de auditoría
    fecha_registro = models.DateTimeField(auto_now_add=True)  # Nuevo
    fecha_actualizacion = models.DateTimeField(auto_now=True)  # Nuevo

    def save(self, *args, **kwargs):
        # Generar número de ticket si no existe
        if not self.ticket_numero:
            self.ticket_numero = f"TKT-{timezone.now().strftime('%Y%m%d')}-{self.pk or '000'}"
        
        # Calcular duración si hay hora de salida
        if self.hora_salida and self.hora_ingreso:
            duracion = self.hora_salida - self.hora_ingreso
            self.duracion_minutos = int(duracion.total_seconds() / 60)
            
            # Calcular costo total basado en la tarifa y duración
            if self.duracion_minutos > 0 and self.tarifa_aplicada > 0:
                horas = self.duracion_minutos / 60
                self.costo_total = Decimal(str(horas)) * self.tarifa_aplicada
        
        # Actualizar estado del lugar
        if self.estado == 'EN_CURSO':
            self.lugar.estado = 'OCUPADO'
            self.lugar.disponible = False
        elif self.estado in ['FINALIZADO', 'CANCELADO']:
            self.lugar.estado = 'DISPONIBLE'
            self.lugar.disponible = True
        
        self.lugar.save()
        super().save(*args, **kwargs)

    def calcular_costo(self):
        """Calcula el costo basado en la duración y tarifa del tipo de lugar"""
        if self.duracion_minutos and self.lugar.tipo_lugar.tarifa_por_hora > 0:
            horas = Decimal(str(self.duracion_minutos / 60))
            return horas * self.lugar.tipo_lugar.tarifa_por_hora
        return Decimal('0.00')

    def __str__(self):
        estado = f" ({self.get_estado_display()})" if self.estado != 'EN_CURSO' else ""
        return f"{self.vehiculo.placa} - Lugar {self.lugar.numero} - {self.hora_ingreso.strftime('%d/%m/%Y %H:%M')}{estado}"

    class Meta:
        verbose_name = "Ingreso de Vehículo"
        verbose_name_plural = "Ingresos de Vehículos"
        ordering = ['-hora_ingreso']


class ReporteEstacionamiento(models.Model):
    """Modelo para generar reportes consolidados"""
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    periodo_inicio = models.DateField()
    periodo_fin = models.DateField()
    total_estacionamientos = models.IntegerField(default=0)
    total_tiempo_minutos = models.IntegerField(default=0)
    total_costo = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    vehiculos_utilizados = models.JSONField(default=list)  # Lista de placas
    lugares_utilizados = models.JSONField(default=list)  # Lista de números de lugar
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Reporte {self.usuario.get_full_name()} ({self.periodo_inicio} - {self.periodo_fin})"
    
    class Meta:
        verbose_name = "Reporte de Estacionamiento"
        verbose_name_plural = "Reportes de Estacionamiento"

