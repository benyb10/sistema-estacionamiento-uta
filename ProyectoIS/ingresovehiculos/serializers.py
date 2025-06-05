from rest_framework import serializers
from .models import IngresoVehiculo

class IngresoVehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngresoVehiculo
        fields = '__all__'