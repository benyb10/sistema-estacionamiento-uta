from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count
from .models import Vehiculo

@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    # Campos que se muestran en la lista
    list_display = (
        'placa',
        'vehiculo_info',
        'propietario',
        'tipo_vehiculo',
        'estado',
        'año',
        'fecha_registro',
        'total_ingresos'
    )
    
    # Campos por los que se puede buscar
    search_fields = (
        'placa', 
        'marca', 
        'modelo', 
        'usuario__nombre', 
        'usuario__apellido',
        'usuario__cedula'
    )
    
    # Filtros laterales
    list_filter = (
        'tipo_vehiculo',
        'estado',
        'marca',
        'año',
        'fecha_registro',
        'usuario__categoria'
    )
    
    # Campos editables desde la lista
    list_editable = ('estado',)
    
    # Ordenamiento
    ordering = ('-fecha_registro',)
    
    # Configuración del formulario
    fieldsets = (
        ('Información del Vehículo', {
            'fields': ('placa', 'marca', 'modelo', 'año', 'color', 'tipo_vehiculo')
        }),
        ('Propietario', {
            'fields': ('usuario',)
        }),
        ('Estado y Control', {
            'fields': ('estado', 'observaciones')
        }),
        ('Información de Registro', {
            'fields': ('fecha_registro', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    # Campos de solo lectura
    readonly_fields = ('fecha_registro', 'fecha_actualizacion')
    
    # Configuración para usuarios no superuser
    def get_readonly_fields(self, request, obj=None):
        """Configura campos de solo lectura según el usuario"""
        readonly = list(self.readonly_fields)
        if not request.user.is_superuser and obj:
            # Los usuarios staff no pueden cambiar la placa una vez creado
            readonly.append('placa')
        return readonly
    
    # Acciones personalizadas
    actions = ['activar_vehiculos', 'desactivar_vehiculos', 'bloquear_vehiculos']
    
    def vehiculo_info(self, obj):
        """Muestra información resumida del vehículo"""
        return f"{obj.marca} {obj.modelo} ({obj.año})"
    vehiculo_info.short_description = 'Vehículo'
    vehiculo_info.admin_order_field = 'marca'
    
    def propietario(self, obj):
        """Muestra el propietario con enlace"""
        url = reverse('admin:usuarios_usuario_change', args=[obj.usuario.cedula])
        return format_html(
            '<a href="{}">{} ({})</a>',
            url,
            obj.usuario.get_full_name(),
            obj.usuario.categoria
        )
    propietario.short_description = 'Propietario'
    propietario.admin_order_field = 'usuario__nombre'
    
    def total_ingresos(self, obj):
        """Muestra el total de ingresos al estacionamiento"""
        count = obj.ingresos.count()
        if count > 0:
            url = reverse('admin:ingresovehiculos_ingresovehiculo_changelist') + f'?vehiculo__placa={obj.placa}'
            return format_html('<a href="{}">{} ingresos</a>', url, count)
        return "0 ingresos"
    total_ingresos.short_description = 'Ingresos'
    
    def activar_vehiculos(self, request, queryset):
        """Activa los vehículos seleccionados"""
        count = queryset.update(estado='ACTIVO')
        self.message_user(request, f'{count} vehículos activados exitosamente.')
    activar_vehiculos.short_description = "Activar vehículos seleccionados"
    
    def desactivar_vehiculos(self, request, queryset):
        """Desactiva los vehículos seleccionados"""
        count = queryset.update(estado='INACTIVO')
        self.message_user(request, f'{count} vehículos desactivados.')
    desactivar_vehiculos.short_description = "Desactivar vehículos seleccionados"
    
    def bloquear_vehiculos(self, request, queryset):
        """Bloquea los vehículos seleccionados"""
        count = queryset.update(estado='BLOQUEADO')
        self.message_user(request, f'{count} vehículos bloqueados.')
    bloquear_vehiculos.short_description = "Bloquear vehículos seleccionados"
    
    # Personalización de la consulta
    def get_queryset(self, request):
        """Optimiza las consultas para evitar N+1"""
        return super().get_queryset(request).select_related('usuario').annotate(
            ingresos_count=Count('ingresos')
        )
    
    # Configuración de autocompletado
    autocomplete_fields = ['usuario']