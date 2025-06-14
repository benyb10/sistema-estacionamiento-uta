from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils.crypto import get_random_string
from django.core.validators import RegexValidator
from django.utils import timezone

class UsuarioManager(BaseUserManager):
    """
    Manager personalizado para el modelo Usuario
    """
    def create_user(self, cedula, correo, password=None, **extra_fields):
        """
        Crea y guarda un usuario regular
        """
        if not cedula:
            raise ValueError('La cédula es obligatoria')
        if not correo:
            raise ValueError('El correo es obligatorio')
        
        correo = self.normalize_email(correo)
        user = self.model(cedula=cedula, correo=correo, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, cedula, correo, password=None, **extra_fields):
        """
        Crea y guarda un superusuario
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('estado', 'ACTIVO')
        extra_fields.setdefault('categoria', 'PERSONAL')  # Superusuarios como personal
        
        # Si no se proporciona fecha_nacimiento, usar una por defecto
        if 'fecha_nacimiento' not in extra_fields:
            from datetime import date
            extra_fields['fecha_nacimiento'] = date(1990, 1, 1)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')
        
        return self.create_user(cedula, correo, password, **extra_fields)

class Usuario(AbstractBaseUser):
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
    fecha_nacimiento = models.DateField(null=True, blank=True)  # ✅ Permitir null para superusuarios
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
    
    # ✅ CAMPOS REQUERIDOS POR DJANGO AUTH
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    # ✅ CONFIGURACIÓN REQUERIDA POR DJANGO
    USERNAME_FIELD = 'cedula'  # Campo que se usa como username
    EMAIL_FIELD = 'correo'     # Campo que contiene el email
    REQUIRED_FIELDS = ['correo', 'nombre', 'apellido']  # Campos requeridos además del USERNAME_FIELD
    
    objects = UsuarioManager()

    def save(self, *args, **kwargs):
        # Solo hashear la contraseña si no está ya hasheada
        if self.contraseña and not self.contraseña.startswith('pbkdf2_'):
            self.contraseña = make_password(self.contraseña)
        super().save(*args, **kwargs)

    def set_password(self, raw_password):
        """
        Método requerido por Django para establecer contraseña
        """
        self.contraseña = make_password(raw_password)

    def check_password(self, raw_password):
        """
        Verifica si la contraseña proporcionada coincide con la almacenada
        """
        return check_password(raw_password, self.contraseña)

    # ✅ PROPIEDADES REQUERIDAS POR DJANGO AUTH
    @property
    def is_authenticated(self):
        """
        Siempre True para usuarios válidos
        """
        return True

    @property
    def is_anonymous(self):
        """
        Siempre False para usuarios válidos
        """
        return False

    def has_perm(self, perm, obj=None):
        """
        Retorna True si el usuario tiene el permiso especificado
        """
        return self.is_superuser

    def has_module_perms(self, app_label):
        """
        Retorna True si el usuario tiene permisos para ver la app
        """
        return self.is_superuser

    @property
    def username(self):
        """
        Propiedad para compatibilidad - usar cédula como username
        """
        return self.cedula

    def get_username(self):
        """
        Método requerido por Django - retorna el username (cédula)
        """
        return self.cedula

    def get_full_name(self):
        """
        Retorna el nombre completo del usuario
        """
        return f"{self.nombre} {self.apellido}"

    def get_short_name(self):
        """
        Retorna el nombre corto del usuario
        """
        return self.nombre

    # ✅ MÉTODOS ADICIONALES PARA JWT
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