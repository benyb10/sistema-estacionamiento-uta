from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Lugar  # tu modelo Lugar
from .serializers import LugarSerializer  # tu serializer

class LugarViewSet(viewsets.ModelViewSet):
    queryset = Lugar.objects.all()
    serializer_class = LugarSerializer