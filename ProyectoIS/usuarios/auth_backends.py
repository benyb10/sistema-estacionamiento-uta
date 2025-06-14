from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import AnonymousUser
from .models import Usuario

class UsuarioAuthBackend(BaseBackend):
    """
    Backend de autenticación personalizado para el modelo Usuario
    Permite que JWT funcione con nuestro modelo Usuario personalizado
    """
    
    def authenticate(self, request, cedula=None, password=None, **kwargs):
        """
        Autentica un usuario basado en cédula y contraseña
        """
        try:
            usuario = Usuario.objects.get(cedula=cedula)
            if usuario.check_password(password):
                return usuario
        except Usuario.DoesNotExist:
            return None
        return None

    def get_user(self, user_id):
        """
        Obtiene un usuario por su ID (cédula en este caso)
        """
        try:
            return Usuario.objects.get(cedula=user_id)
        except Usuario.DoesNotExist:
            return None

# Clase wrapper para hacer compatible Usuario con JWT
class UsuarioJWTWrapper:
    """
    Wrapper para hacer que el modelo Usuario sea compatible con JWT
    """
    
    def __init__(self, usuario):
        self.usuario = usuario
        self.pk = usuario.cedula
        self.id = usuario.cedula
        self.is_active = usuario.estado == 'ACTIVO'
        self.is_authenticated = True
        self.is_anonymous = False
        
    @property
    def username(self):
        return self.usuario.cedula
        
    def __str__(self):
        return f"{self.usuario.nombre} {self.usuario.apellido}"
        
    def get_username(self):
        return self.usuario.cedula
        
    def is_authenticated(self):
        return True