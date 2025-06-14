from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from django.db.models import Sum, Count, Q
from .models import IngresoVehiculo, ReporteEstacionamiento

@admin.register(IngresoVehiculo)
class IngresoVehiculoAdmin(admin.ModelAdmin):
    # Campos que se muestran en la lista
    list_display = (
        'ticket_numero',
        'vehiculo_info',
        'lugar_info',
        'usuario_info',
        'estado',
        'hora_ingreso',
        'duracion_formateada',
        'costo_total',
        'metodo_pago',  # ✅ Agregado aquí
        'pagado'
    )
    
    # Campos por los que se puede buscar
    search_fields = (
        'ticket_numero',
        'vehiculo__placa',
        'vehiculo__usuario__nombre',
        'vehiculo__usuario__apellido',
        'vehiculo__usuario__cedula',
        'lugar__numero',
        'usuario_registro__nombre'
    )
    
    # Filtros laterales
    list_filter = (
        'estado',
        'metodo_pago',
        'pagado',
        'hora_ingreso',
        'vehiculo__tipo_vehiculo',
        'vehiculo__usuario__categoria',
        'lugar__tipo_lugar'
    )
    
    # Campos editables desde la lista
    list_editable = ('estado', 'pagado', 'metodo_pago')
    
    # Ordenamiento
    ordering = ('-hora_ingreso',)
    
    # Configuración del formulario
    fieldsets = (
        ('Información del Ingreso', {
            'fields': ('vehiculo', 'lugar', 'usuario_registro', 'estado')
        }),
        ('Tiempos', {
            'fields': ('hora_ingreso', 'hora_salida', 'duracion_minutos')
        }),
        ('Información Financiera', {
            'fields': ('tarifa_aplicada', 'costo_total', 'metodo_pago', 'pagado')
        }),
        ('Información Adicional', {
            'fields': ('ticket_numero', 'observaciones'),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('fecha_registro', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    # Campos de solo lectura
    readonly_fields = ('fecha_registro', 'fecha_actualizacion', 'duracion_minutos')
    
    # Acciones personalizadas
    actions = [
        'finalizar_ingresos',
        'marcar_como_pagado',
        'calcular_costos',
        'generar_reporte_seleccionados'
    ]
    
    def vehiculo_info(self, obj):
        """Muestra información del vehículo con enlace"""
        url = reverse('admin:vehiculos_vehiculo_change', args=[obj.vehiculo.placa])
        return format_html(
            '<a href="{}">{}</a><br><small>{} {}</small>',
            url,
            obj.vehiculo.placa,
            obj.vehiculo.marca,
            obj.vehiculo.modelo
        )
    vehiculo_info.short_description = 'Vehículo'
    vehiculo_info.admin_order_field = 'vehiculo__placa'
    
    def lugar_info(self, obj):
        """Muestra información del lugar"""
        return format_html(
            'Lugar {}<br><small>{}</small>',
            obj.lugar.numero,
            obj.lugar.tipo_lugar.nombre
        )
    lugar_info.short_description = 'Lugar'
    lugar_info.admin_order_field = 'lugar__numero'
    
    def usuario_info(self, obj):
        """Muestra información del usuario propietario"""
        usuario = obj.vehiculo.usuario
        url = reverse('admin:usuarios_usuario_change', args=[usuario.cedula])
        return format_html(
            '<a href="{}">{}</a><br><small>{}</small>',
            url,
            usuario.get_full_name(),
            usuario.categoria
        )
    usuario_info.short_description = 'Propietario'
    usuario_info.admin_order_field = 'vehiculo__usuario__nombre'
    
    def duracion_formateada(self, obj):
        """Muestra la duración en formato legible"""
        if obj.duracion_minutos:
            horas = obj.duracion_minutos // 60
            minutos = obj.duracion_minutos % 60
            if horas > 0:
                return f"{horas}h {minutos}m"
            return f"{minutos}m"
        elif obj.estado == 'EN_CURSO':
            # Calcular duración actual
            duracion = timezone.now() - obj.hora_ingreso
            minutos_totales = int(duracion.total_seconds() / 60)
            horas = minutos_totales // 60
            minutos = minutos_totales % 60
            return format_html('<span style="color: green;">{}h {}m (en curso)</span>', horas, minutos)
        return "-"
    duracion_formateada.short_description = 'Duración'
    
    def finalizar_ingresos(self, request, queryset):
        """Finaliza los ingresos seleccionados"""
        ingresos_finalizados = 0
        for ingreso in queryset.filter(estado='EN_CURSO'):
            ingreso.hora_salida = timezone.now()
            ingreso.estado = 'FINALIZADO'
            # Calcular duración
            duracion = ingreso.hora_salida - ingreso.hora_ingreso
            ingreso.duracion_minutos = int(duracion.total_seconds() / 60)
            # Calcular costo
            if ingreso.duracion_minutos > 0 and ingreso.lugar.tipo_lugar.tarifa_por_hora > 0:
                horas = ingreso.duracion_minutos / 60
                tarifa = ingreso.lugar.tipo_lugar.get_tarifa_para_usuario(ingreso.vehiculo.usuario)
                ingreso.tarifa_aplicada = tarifa
                ingreso.costo_total = round(horas * float(tarifa), 2)
            ingreso.save()
            ingresos_finalizados += 1
        
        self.message_user(request, f'{ingresos_finalizados} ingresos finalizados exitosamente.')
    finalizar_ingresos.short_description = "Finalizar ingresos seleccionados"
    
    def marcar_como_pagado(self, request, queryset):
        """Marca los ingresos como pagados"""
        count = queryset.update(pagado=True)
        self.message_user(request, f'{count} ingresos marcados como pagados.')
    marcar_como_pagado.short_description = "Marcar como pagado"
    
    def calcular_costos(self, request, queryset):
        """Recalcula los costos de los ingresos seleccionados"""
        ingresos_actualizados = 0
        for ingreso in queryset.filter(duracion_minutos__gt=0):
            if ingreso.lugar.tipo_lugar.tarifa_por_hora > 0:
                horas = ingreso.duracion_minutos / 60
                tarifa = ingreso.lugar.tipo_lugar.get_tarifa_para_usuario(ingreso.vehiculo.usuario)
                ingreso.tarifa_aplicada = tarifa
                ingreso.costo_total = round(horas * float(tarifa), 2)
                ingreso.save()
                ingresos_actualizados += 1
        
        self.message_user(request, f'{ingresos_actualizados} costos recalculados.')
    calcular_costos.short_description = "Recalcular costos"
    
    def generar_reporte_seleccionados(self, request, queryset):
        """Genera un reporte de los ingresos seleccionados"""
        total_ingresos = queryset.count()
        total_pagados = queryset.filter(pagado=True).count()
        total_dinero = queryset.aggregate(total=Sum('costo_total'))['total'] or 0
        tiempo_total = queryset.aggregate(total=Sum('duracion_minutos'))['total'] or 0
        
        mensaje = f"""
        Reporte generado:
        - Total ingresos: {total_ingresos}
        - Pagados: {total_pagados} ({round(total_pagados/total_ingresos*100, 1)}%)
        - Dinero total: ${total_dinero:.2f}
        - Tiempo total: {tiempo_total//60}h {tiempo_total%60}m
        """
        
        self.message_user(request, mensaje)
    generar_reporte_seleccionados.short_description = "Generar reporte de seleccionados"
    
    # Personalización de la consulta
    def get_queryset(self, request):
        """Optimiza las consultas"""
        return super().get_queryset(request).select_related(
            'vehiculo__usuario',
            'lugar__tipo_lugar',
            'usuario_registro'
        )
    
    # Configuración de autocompletado
    autocomplete_fields = ['vehiculo', 'lugar', 'usuario_registro']
    
    # Filtros personalizados en el sidebar
    def changelist_view(self, request, extra_context=None):
        """Agrega estadísticas al panel de administración"""
        extra_context = extra_context or {}
        
        # Estadísticas rápidas
        queryset = self.get_queryset(request)
        extra_context['total_ingresos'] = queryset.count()
        extra_context['ingresos_activos'] = queryset.filter(estado='EN_CURSO').count()
        extra_context['ingresos_hoy'] = queryset.filter(hora_ingreso__date=timezone.now().date()).count()
        
        return super().changelist_view(request, extra_context)

@admin.register(ReporteEstacionamiento)
class ReporteEstacionamientoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'periodo_inicio', 'periodo_fin', 'total_estacionamientos', 'total_costo', 'fecha_generacion')
    list_filter = ('periodo_inicio', 'periodo_fin', 'fecha_generacion', 'usuario__categoria')
    search_fields = ('usuario__nombre', 'usuario__apellido', 'usuario__cedula')
    readonly_fields = ('fecha_generacion',)
    autocomplete_fields = ['usuario']