from django.shortcuts import render
from rest_framework import viewsets
# Create your views here.
from .models import IngresoVehiculo
from .serializers import IngresoVehiculoSerializer

class IngresoVehiculoViewSet(viewsets.ModelViewSet):
    queryset = IngresoVehiculo.objects.all()
    serializer_class = IngresoVehiculoSerializer