from rest_framework import serializers
from .models import Usuario
from django.contrib.auth.hashers import make_password

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'  # Incluir todos los campos
        extra_kwargs = {
            'contraseña': {'write_only': True}  # para que no se exponga en respuestas
        }
    def create(self, validated_data):
        validated_data['contraseña'] = make_password(validated_data['contraseña'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'contraseña' in validated_data:
            validated_data['contraseña'] = make_password(validated_data['contraseña'])
        return super().update(instance, validated_data)

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['cedula', 'nombre', 'apellido', 'fecha_nacimiento', 'correo', 'contraseña']
        extra_kwargs = {
            'contraseña': {'write_only': True}
        }

    def create(self, validated_data):
        validated_data['contraseña'] = make_password(validated_data['contraseña'])
        return Usuario.objects.create(**validated_data)