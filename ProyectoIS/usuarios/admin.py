from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    # Campos que se muestran en la lista
    list_display = (
        'cedula', 
        'nombre_completo',
        'correo', 
        'categoria',
        'estado',
        'is_active',
        'fecha_registro',
        'ultimo_acceso',
        'total_vehiculos'
    )
    
    # Campos por los que se puede buscar
    search_fields = ('cedula', 'nombre', 'apellido', 'correo')
    
    # Filtros laterales
    list_filter = (
        'categoria', 
        'estado',
        'is_active',
        'is_staff',
        'is_superuser',
        'fecha_registro'
    )
    
    # Campos que se pueden editar directamente desde la lista
    list_editable = ('estado', 'categoria')
    
    # Ordenamiento por defecto
    ordering = ('-fecha_registro',)
    
    # Configuración de formularios
    fieldsets = (
        ('Información Personal', {
            'fields': ('cedula', 'nombre', 'apellido', 'fecha_nacimiento', 'telefono')
        }),
        ('Información de Cuenta', {
            'fields': ('correo', 'contraseña', 'categoria', 'estado')
        }),
        ('Permisos de Sistema', {
            'fields': ('is_active', 'is_staff', 'is_superuser'),
            'classes': ('collapse',)
        }),
        ('Fechas Importantes', {
            'fields': ('fecha_registro', 'fecha_actualizacion', 'ultimo_acceso'),
            'classes': ('collapse',)
        }),
    )
    
    # Campos de solo lectura
    readonly_fields = ('fecha_registro', 'fecha_actualizacion', 'ultimo_acceso')
    
    # Configuración para agregar nuevo usuario
    add_fieldsets = (
        ('Información Básica', {
            'classes': ('wide',),
            'fields': ('cedula', 'nombre', 'apellido', 'correo', 'contraseña', 'categoria')
        }),
        ('Información Adicional', {
            'fields': ('fecha_nacimiento', 'telefono')
        }),
    )
    
    # Acciones personalizadas
    actions = ['activar_usuarios', 'desactivar_usuarios', 'marcar_como_estudiante']
    
    def nombre_completo(self, obj):
        """Muestra el nombre completo del usuario"""
        return f"{obj.nombre} {obj.apellido}"
    nombre_completo.short_description = 'Nombre Completo'
    nombre_completo.admin_order_field = 'nombre'
    
    def total_vehiculos(self, obj):
        """Muestra el total de vehículos del usuario"""
        count = obj.vehiculos.count()
        if count > 0:
            url = reverse('admin:vehiculos_vehiculo_changelist') + f'?usuario__cedula={obj.cedula}'
            return format_html('<a href="{}">{} vehículos</a>', url, count)
        return "0 vehículos"
    total_vehiculos.short_description = 'Vehículos'
    
    def activar_usuarios(self, request, queryset):
        """Activa los usuarios seleccionados"""
        count = queryset.update(estado='ACTIVO', is_active=True)
        self.message_user(request, f'{count} usuarios activados exitosamente.')
    activar_usuarios.short_description = "Activar usuarios seleccionados"
    
    def desactivar_usuarios(self, request, queryset):
        """Desactiva los usuarios seleccionados"""
        count = queryset.update(estado='INACTIVO', is_active=False)
        self.message_user(request, f'{count} usuarios desactivados.')
    desactivar_usuarios.short_description = "Desactivar usuarios seleccionados"
    
    def marcar_como_estudiante(self, request, queryset):
        """Marca los usuarios seleccionados como estudiantes"""
        count = queryset.update(categoria='ESTUDIANTE')
        self.message_user(request, f'{count} usuarios marcados como estudiantes.')
    marcar_como_estudiante.short_description = "Marcar como estudiantes"
    
    # Personalización adicional
    def get_form(self, request, obj=None, **kwargs):
        """Personaliza el formulario según el contexto"""
        form = super().get_form(request, obj, **kwargs)
        if not request.user.is_superuser:
            # Los usuarios staff no pueden cambiar permisos de superusuario
            if 'is_superuser' in form.base_fields:
                form.base_fields['is_superuser'].disabled = True
        return form