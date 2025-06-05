from django.contrib import admin

# Register your models here.
from .models import Lugar

class LugarAdmin(admin.ModelAdmin):
    list_display = ('numero', 'disponible')  # Campos visibles en la lista
    search_fields = ('numero',)  # Campos por los que se puede buscar
    list_filter = ('disponible',)  # Filtro por disponibilidad

admin.site.register(Lugar, LugarAdmin)