from django.shortcuts import render
from rest_framework.views import APIView
# Create your views here.
from rest_framework import viewsets
from .models import Usuario
from .serializers import UsuarioSerializer
from rest_framework import generics
from .serializers import RegistroUsuarioSerializer
from rest_framework.response import Response
from rest_framework import status
from .models import Usuario
from django.contrib.auth.hashers import check_password

import random
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@csrf_exempt
@require_http_methods(["GET"])
def ping(request):
    """Endpoint para verificar si el servidor está activo"""
    return JsonResponse({
        'status': 'ok',
        'message': 'Servidor activo'
    })


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class RegistroUsuarioView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = RegistroUsuarioSerializer
    
def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    self.perform_create(serializer)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

class LoginAPIView(APIView):
    def post(self, request):
        cedula = request.data.get('cedula')
        correo = request.data.get('correo')
        contraseña = request.data.get('contraseña')

        try:
            usuario = Usuario.objects.get(cedula=cedula, correo=correo)
            if check_password(contraseña, usuario.contraseña):
                codigo = str(random.randint(100000, 999999))
                usuario.codigo_verificacion = codigo
                usuario.codigo_expira = timezone.now() + timedelta(minutes=5)
                usuario.save()
                send_mail(
                    'Código de verificación',
                    f'Tu código es: {codigo}',
                    'no-reply@tuapp.com',
                    [usuario.correo],
                    fail_silently=False,
                )
                return Response({'mensaje': 'Login correcto'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Contraseña incorrecta'}, status=status.HTTP_401_UNAUTHORIZED)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        

class VerificarCodigoAPIView(APIView):
    def post(self, request):
        correo = request.data.get('correo')
        codigo = request.data.get('codigo')

        if not correo or not codigo:
            return Response({'error': 'Correo y código son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            return Response({'error': 'Correo no registrado.'}, status=status.HTTP_404_NOT_FOUND)

        if usuario.codigo_verificacion != codigo:
            return Response({'error': 'Código incorrecto.'}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() > usuario.codigo_expira:
            return Response({'error': 'El código ha expirado.'}, status=status.HTTP_400_BAD_REQUEST)

        # Si pasa la verificación
        usuario.codigo_verificacion = None  # Opcional: borrar código una vez verificado
        usuario.codigo_expira = None
        usuario.save()

        return Response({'mensaje': 'Inicio de sesión exitoso'}, status=status.HTTP_200_OK)