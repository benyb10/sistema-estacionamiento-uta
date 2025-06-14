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

# ✅ NUEVO: Importar JWT
from rest_framework_simplejwt.tokens import RefreshToken

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
                # Generar código de verificación
                codigo = str(random.randint(100000, 999999))
                usuario.codigo_verificacion = codigo
                usuario.codigo_expira = timezone.now() + timedelta(minutes=5)
                usuario.save()
                
                # Enviar código por correo
                try:
                    send_mail(
                        'Código de verificación - Sistema de Estacionamiento UTA',
                        f'Tu código de verificación es: {codigo}\n\nEste código expira en 5 minutos.',
                        'no-reply@tuapp.com',
                        [usuario.correo],
                        fail_silently=False,
                    )
                    print(f"✅ Código enviado a {usuario.correo}: {codigo}")  # Para debug
                except Exception as e:
                    print(f"❌ Error enviando correo: {e}")
                    # Continuar incluso si falla el envío del correo
                
                return Response({
                    'mensaje': 'Login correcto',
                    'codigo_enviado': True
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Contraseña incorrecta'}, status=status.HTTP_401_UNAUTHORIZED)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"❌ Error en login: {e}")
            return Response({'error': 'Error interno del servidor'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ✅ SOLUCIÓN: Función auxiliar para generar tokens
def get_tokens_for_user(user):
    """
    Genera tokens JWT para un usuario específico
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class VerificarCodigoAPIView(APIView):
    def post(self, request):
        correo = request.data.get('correo')
        codigo = request.data.get('codigo')

        if not correo or not codigo:
            return Response({
                'error': 'Correo y código son obligatorios.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            return Response({
                'error': 'Correo no registrado.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Verificar código
        if usuario.codigo_verificacion != codigo:
            return Response({
                'error': 'Código incorrecto.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si el código ha expirado
        if timezone.now() > usuario.codigo_expira:
            return Response({
                'error': 'El código ha expirado.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # ✅ SOLUCIÓN: Si pasa la verificación, generar tokens
        try:
            # Limpiar código una vez verificado
            usuario.codigo_verificacion = None
            usuario.codigo_expira = None
            usuario.ultimo_acceso = timezone.now()  # Actualizar último acceso
            usuario.save()

            # ✅ Generar tokens JWT
            tokens = get_tokens_for_user(usuario)
            
            # ✅ Preparar datos del usuario para el frontend
            user_data = {
                'cedula': usuario.cedula,
                'nombre': usuario.nombre,
                'apellido': usuario.apellido,
                'correo': usuario.correo,
                'categoria': usuario.categoria,
                'estado': usuario.estado,
                'fecha_registro': usuario.fecha_registro.isoformat() if usuario.fecha_registro else None,
                'ultimo_acceso': usuario.ultimo_acceso.isoformat() if usuario.ultimo_acceso else None,
            }

            print(f"✅ Login exitoso para: {usuario.nombre} {usuario.apellido} ({usuario.correo})")

            # ✅ Respuesta completa con token y datos del usuario
            return Response({
                'mensaje': 'Inicio de sesión exitoso',
                'token': tokens['access'],  #  ESTO ES LO QUE FALTABA
                'refresh_token': tokens['refresh'],
                'user': user_data,
                'expires_in': 1800  # 30 minutos en segundos
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ Error generando tokens: {e}")
            return Response({
                'error': 'Error interno del servidor'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)