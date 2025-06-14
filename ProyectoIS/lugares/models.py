from django.db import models
from decimal import Decimal

class TipoLugar(models.Model):
    """
    Tipos de lugares de estacionamiento con categorías de usuario permitidas
    """
    CATEGORIAS_PERMITIDAS = [
        ('TODOS', 'Todos los usuarios'),
        ('ESTUDIANTE', 'Solo Estudiantes'),
        ('PROFESOR', 'Solo Profesores'),
        ('PERSONAL', 'Solo Personal Administrativo'),
        ('LIMPIEZA', 'Solo Personal de Limpieza'),
        ('VISITANTE', 'Solo Visitantes'),
        ('ACADEMICO', 'Estudiantes y Profesores'),  # Combinación
        ('INTERNO', 'Personal Interno (No visitantes)'),  # Combinación
    ]
    
    TIPOS_VEHICULO_PERMITIDOS = [
        ('TODOS', 'Todos los vehículos'),
        ('AUTO', 'Solo Automóviles'),
        ('MOTO', 'Solo Motocicletas'),
        ('CAMIONETA', 'Solo Camionetas'),
        ('BICICLETA', 'Solo Bicicletas'),
        ('MOTOR', 'Vehículos a motor (Auto, Moto, Camioneta)'),
    ]
    
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True)
    
    # ✅ NUEVAS FUNCIONALIDADES
    categoria_usuario_permitida = models.CharField(
        max_length=20, 
        choices=CATEGORIAS_PERMITIDAS, 
        default='TODOS',
        help_text="Qué categorías de usuarios pueden usar este tipo de lugar"
    )
    tipo_vehiculo_permitido = models.CharField(
        max_length=20,
        choices=TIPOS_VEHICULO_PERMITIDOS,
        default='TODOS',
        help_text="Qué tipos de vehículos pueden usar este lugar"
    )
    
    # Configuración financiera
    tarifa_por_hora = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tarifa_estudiante = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00,
        help_text="Tarifa especial para estudiantes (0 = usar tarifa normal)"
    )
    
    # Configuración visual
    color_identificacion = models.CharField(max_length=7, default='#FFFFFF')  # Color hex
    icono = models.CharField(max_length=50, default='🅿️', help_text="Emoji o icono para mostrar")
    
    # Control de capacidad
    capacidad_maxima = models.IntegerField(default=0, help_text="0 = sin límite")
    tiempo_maximo_minutos = models.IntegerField(
        default=0, 
        help_text="Tiempo máximo de estacionamiento en minutos (0 = sin límite)"
    )
    
    # Control de disponibilidad
    activo = models.BooleanField(default=True)
    requiere_reserva = models.BooleanField(default=False)
    
    def puede_usar_usuario(self, usuario):
        """Verifica si un usuario puede usar este tipo de lugar"""
        if self.categoria_usuario_permitida == 'TODOS':
            return True
        elif self.categoria_usuario_permitida == 'ACADEMICO':
            return usuario.categoria in ['ESTUDIANTE', 'PROFESOR']
        elif self.categoria_usuario_permitida == 'INTERNO':
            return usuario.categoria != 'VISITANTE'
        else:
            return usuario.categoria == self.categoria_usuario_permitida
    
    def puede_usar_vehiculo(self, vehiculo):
        """Verifica si un vehículo puede usar este tipo de lugar"""
        if self.tipo_vehiculo_permitido == 'TODOS':
            return True
        elif self.tipo_vehiculo_permitido == 'MOTOR':
            return vehiculo.tipo_vehiculo in ['AUTO', 'MOTO', 'CAMIONETA']
        else:
            return vehiculo.tipo_vehiculo == self.tipo_vehiculo_permitido
    
    def get_tarifa_para_usuario(self, usuario):
        """Obtiene la tarifa correcta según el tipo de usuario"""
        if usuario.categoria == 'ESTUDIANTE' and self.tarifa_estudiante > 0:
            return self.tarifa_estudiante
        return self.tarifa_por_hora
    
    def __str__(self):
        categoria = f" ({self.get_categoria_usuario_permitida_display()})" if self.categoria_usuario_permitida != 'TODOS' else ""
        return f"{self.nombre}{categoria}"
    
    class Meta:
        verbose_name = "Tipo de Lugar"
        verbose_name_plural = "Tipos de Lugares"

class Lugar(models.Model):
    """
    Lugar específico de estacionamiento
    """
    ESTADOS = [
        ('DISPONIBLE', 'Disponible'),
        ('OCUPADO', 'Ocupado'),
        ('RESERVADO', 'Reservado'),
        ('FUERA_SERVICIO', 'Fuera de Servicio'),
        ('MANTENIMIENTO', 'En Mantenimiento'),
    ]
    
    numero = models.IntegerField(primary_key=True)
    tipo_lugar = models.ForeignKey(TipoLugar, on_delete=models.CASCADE, related_name='lugares')
    
    # Ubicación física
    piso = models.CharField(max_length=10, default='1')
    seccion = models.CharField(max_length=20, blank=True, help_text="Ej: A, B, Norte, Sur")
    bloque = models.CharField(max_length=20, blank=True, help_text="Ej: Bloque 1, Edificio Principal")
    
    # ✅ OPTIMIZACIÓN: Solo un campo de estado (eliminamos disponible)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='DISPONIBLE')
    
    # Características físicas
    tiene_techo = models.BooleanField(default=False)
    es_accesible = models.BooleanField(default=True, help_text="Accesible para personas con discapacidad")
    ancho_metros = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    largo_metros = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    
    # Control y observaciones
    observaciones = models.TextField(blank=True, null=True)
    fecha_ultimo_mantenimiento = models.DateField(null=True, blank=True)
    
    # Campos de auditoría
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    @property
    def disponible(self):
        """Propiedad calculada para compatibilidad con código existente"""
        return self.estado == 'DISPONIBLE'
    
    @property
    def ubicacion_completa(self):
        """Retorna la ubicación completa del lugar"""
        ubicacion = f"Lugar {self.numero}"
        if self.bloque:
            ubicacion += f" - {self.bloque}"
        if self.seccion:
            ubicacion += f" - Sección {self.seccion}"
        ubicacion += f" - Piso {self.piso}"
        return ubicacion
    
    def puede_ser_usado_por(self, usuario, vehiculo):
        """Verifica si el lugar puede ser usado por un usuario y vehículo específicos"""
        if not self.disponible:
            return False, "El lugar no está disponible"
        
        if not self.tipo_lugar.puede_usar_usuario(usuario):
            return False, f"Este lugar es para {self.tipo_lugar.get_categoria_usuario_permitida_display()}"
        
        if not self.tipo_lugar.puede_usar_vehiculo(vehiculo):
            return False, f"Este lugar es para {self.tipo_lugar.get_tipo_vehiculo_permitido_display()}"
        
        return True, "Lugar disponible"
    
    def marcar_como_ocupado(self):
        """Marca el lugar como ocupado"""
        self.estado = 'OCUPADO'
        self.save()
    
    def marcar_como_disponible(self):
        """Marca el lugar como disponible"""
        self.estado = 'DISPONIBLE'
        self.save()
    
    def reservar(self):
        """Reserva el lugar"""
        if self.disponible:
            self.estado = 'RESERVADO'
            self.save()
            return True
        return False

    def __str__(self):
        estado_emoji = {
            'DISPONIBLE': '✅',
            'OCUPADO': '🚗',
            'RESERVADO': '📅',
            'FUERA_SERVICIO': '🚫',
            'MANTENIMIENTO': '🔧'
        }
        emoji = estado_emoji.get(self.estado, '❓')
        return f"{emoji} Lugar {self.numero} - {self.tipo_lugar.nombre} ({self.get_estado_display()})"

    class Meta:
        verbose_name = "Lugar"
        verbose_name_plural = "Lugares"
        ordering = ['numero']