from django.db import models
from django.contrib.auth.hashers import make_password
from django.utils.crypto import get_random_string
from django.core.validators import RegexValidator

class Usuario(models.Model):
    CATEGORIAS = [
        ('ESTUDIANTE', 'Estudiante'),
        ('PROFESOR', 'Profesor'),
        ('PERSONAL', 'Personal Administrativo'),
        ('LIMPIEZA', 'Personal de Limpieza'),
        ('VISITANTE', 'Visitante'),  # Nuevo
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
    fecha_nacimiento = models.DateField()  # Removido unique=True (no tiene sentido)
    correo = models.EmailField(unique=True)
    contraseña = models.CharField(max_length=128)
    categoria = models.CharField(max_length=20, choices=CATEGORIAS, default='ESTUDIANTE')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='ACTIVO')  # Nuevo
    telefono = models.CharField(max_length=15, blank=True, null=True)  # Nuevo
    
    # Campos de verificación
    codigo_verificacion = models.CharField(max_length=6, blank=True, null=True)
    codigo_expira = models.DateTimeField(blank=True, null=True)
    
    # Campos de auditoría
    fecha_registro = models.DateTimeField(auto_now_add=True)  # Nuevo
    fecha_actualizacion = models.DateTimeField(auto_now=True)  # Nuevo
    ultimo_acceso = models.DateTimeField(blank=True, null=True)  # Nuevo

    def save(self, *args, **kwargs):
        if not self.contraseña.startswith('pbkdf2_'):
            self.contraseña = make_password(self.contraseña)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.cedula}"

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
