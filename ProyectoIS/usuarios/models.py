from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.utils.crypto import get_random_string
from django.core.validators import RegexValidator
from django.utils import timezone

class Usuario(models.Model):
    CATEGORIAS = [
        ('ESTUDIANTE', 'Estudiante'),
        ('PROFESOR', 'Profesor'),
        ('PERSONAL', 'Personal Administrativo'),
        ('LIMPIEZA', 'Personal de Limpieza'),
        ('VISITANTE', 'Visitante'),
    ]
    
    ESTADOS = [
        ('ACTIVO', 'Activo'),
        ('INACTIVO', 'Inactivo'),
        ('SUSPENDIDO', 'Suspendido'),
    ]
    
    cedula_validator = RegexValidator(
        regex=r'^\d{10}$',
        message='La cédula debe tener exactamente 10 dígitos'
    )
    
    cedula = models.CharField(
        max_length=10, 
        primary_key=True, 
        validators=[cedula_validator]
    )
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField()
    correo = models.EmailField(unique=True)
    contraseña = models.CharField(max_length=128)
    categoria = models.CharField(max_length=20, choices=CATEGORIAS, default='ESTUDIANTE')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='ACTIVO')
    telefono = models.CharField(max_length=15, blank=True, null=True)
    
    # Campos de verificación
    codigo_verificacion = models.CharField(max_length=6, blank=True, null=True)
    codigo_expira = models.DateTimeField(blank=True, null=True)
    
    # Campos de auditoría
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    ultimo_acceso = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # Solo hashear la contraseña si no está ya hasheada
        if not self.contraseña.startswith('pbkdf2_'):
            self.contraseña = make_password(self.contraseña)
        super().save(*args, **kwargs)

    # ✅ NUEVO: Métodos necesarios para compatibilidad con JWT
    def check_password(self, raw_password):
        """
        Verifica si la contraseña proporcionada coincide con la almacenada
        """
        return check_password(raw_password, self.contraseña)

    @property
    def is_active(self):
        """
        Propiedad necesaria para JWT - verifica si el usuario está activo
        """
        return self.estado == 'ACTIVO'

    @property
    def is_authenticated(self):
        """
        Propiedad necesaria para JWT - siempre True para usuarios válidos
        """
        return True

    @property
    def is_anonymous(self):
        """
        Propiedad necesaria para JWT - siempre False para usuarios válidos
        """
        return False

    @property
    def username(self):
        """
        Propiedad necesaria para JWT - usar cédula como username
        """
        return self.cedula

    def get_username(self):
        """
        Método necesario para JWT - retorna el username (cédula)
        """
        return self.cedula

    # ✅ NUEVO: Método necesario para RefreshToken.for_user()
    @property
    def pk(self):
        """
        Propiedad necesaria para JWT - retorna la clave primaria
        """
        return self.cedula

    @property
    def id(self):
        """
        Propiedad necesaria para JWT - alias de pk
        """
        return self.cedula

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.cedula}"

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"