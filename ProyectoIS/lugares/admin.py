from django.contrib import admin
from .models import TipoLugar, Lugar

@admin.register(TipoLugar)
class TipoLugarAdmin(admin.ModelAdmin):
    list_display = (
        'nombre', 
        'categoria_usuario_permitida', 
        'tipo_vehiculo_permitido',
        'tarifa_por_hora', 
        'tarifa_estudiante',
        'activo',
        'total_lugares'
    )
    list_filter = (
        'categoria_usuario_permitida', 
        'tipo_vehiculo_permitido',
        'activo',
        'requiere_reserva'
    )
    search_fields = ('nombre', 'descripcion')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'descripcion', 'activo')
        }),
        ('Permisos y Restricciones', {
            'fields': (
                'categoria_usuario_permitida',
                'tipo_vehiculo_permitido',
                'requiere_reserva'
            )
        }),
        ('Configuración Financiera', {
            'fields': ('tarifa_por_hora', 'tarifa_estudiante')
        }),
        ('Configuración Visual', {
            'fields': ('color_identificacion', 'icono')
        }),
        ('Límites y Capacidad', {
            'fields': ('capacidad_maxima', 'tiempo_maximo_minutos')
        }),
    )
    
    def total_lugares(self, obj):
        """Muestra cuántos lugares hay de este tipo"""
        return obj.lugares.count()
    total_lugares.short_description = 'Total Lugares'

@admin.register(Lugar)
class LugarAdmin(admin.ModelAdmin):
    list_display = (
        'numero', 
        'tipo_lugar', 
        'estado',
        'piso',
        'seccion',
        'bloque',
        'tiene_techo',
        'es_accesible'
    )
    list_filter = (
        'estado', 
        'tipo_lugar',
        'piso',
        'seccion',
        'tiene_techo',
        'es_accesible'
    )
    search_fields = ('numero', 'observaciones', 'bloque', 'seccion')
    ordering = ['numero']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('numero', 'tipo_lugar', 'estado')
        }),
        ('Ubicación', {
            'fields': ('piso', 'seccion', 'bloque')
        }),
        ('Características Físicas', {
            'fields': (
                'tiene_techo',
                'es_accesible',
                'ancho_metros',
                'largo_metros'
            )
        }),
        ('Mantenimiento y Observaciones', {
            'fields': (
                'observaciones',
                'fecha_ultimo_mantenimiento'
            )
        }),
    )
    
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
    
    actions = ['marcar_disponible', 'marcar_fuera_servicio', 'marcar_mantenimiento']
    
    def marcar_disponible(self, request, queryset):
        """Marca los lugares seleccionados como disponibles"""
        count = queryset.update(estado='DISPONIBLE')
        self.message_user(request, f'{count} lugares marcados como disponibles.')
    marcar_disponible.short_description = "Marcar como disponible"
    
    def marcar_fuera_servicio(self, request, queryset):
        """Marca los lugares seleccionados como fuera de servicio"""
        count = queryset.update(estado='FUERA_SERVICIO')
        self.message_user(request, f'{count} lugares marcados como fuera de servicio.')
    marcar_fuera_servicio.short_description = "Marcar como fuera de servicio"
    
    def marcar_mantenimiento(self, request, queryset):
        """Marca los lugares seleccionados como en mantenimiento"""
        count = queryset.update(estado='MANTENIMIENTO')
        self.message_user(request, f'{count} lugares marcados en mantenimiento.')
    marcar_mantenimiento.short_description = "Marcar en mantenimiento"