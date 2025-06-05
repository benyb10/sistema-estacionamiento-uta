from django.contrib import admin

# Register your models here.
from .models import Vehiculo

class VehiculoAdmin(admin.ModelAdmin):
    list_display = ('placa', 'modelo', 'usuario')  # Campos visibles en la lista
    search_fields = ('placa', 'modelo')  # Campos por los que se puede buscar
    list_filter = ('modelo',)  # Filtro por modelo

admin.site.register(Vehiculo, VehiculoAdmin)