from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Vehiculo  # tu modelo Vehiculo
from .serializers import VehiculoSerializer  # tu serializer

class VehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer