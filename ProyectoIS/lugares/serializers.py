from rest_framework import serializers
from .models import Lugar

class LugarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lugar
        fields = '__all__'  # Incluir todos los campos