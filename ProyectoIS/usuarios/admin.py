from django.contrib import admin

# Register your models here.
from .models import Usuario

class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('cedula', 'nombre', 'apellido', 'fecha_nacimiento', 'correo', 'contraseña')  # Campos visibles en la lista
    search_fields = ('cedula', 'nombre', 'apellido', 'correo', 'contraseña')  # Campos por los que se puede buscar
    list_filter = ('fecha_nacimiento',)  # Filtros laterales por fecha de nacimiento

admin.site.register(Usuario, UsuarioAdmin)
