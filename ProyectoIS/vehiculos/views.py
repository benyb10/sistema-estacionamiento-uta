from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Vehiculo
from .serializers import VehiculoSerializer
from usuarios.models import Usuario

class VehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    # permission_classes = [IsAuthenticated]  # Descomenta si tienes autenticación JWT

class VehiculosUsuarioView(APIView):
    """
    Vista para obtener todos los vehículos de un usuario específico
    """
    # permission_classes = [IsAuthenticated]  # Descomenta si tienes autenticación JWT
    
    def get(self, request, cedula):
        try:
            # Verificar que el usuario existe
            usuario_obj = get_object_or_404(Usuario, cedula=cedula)
            
            # Obtener todos los vehículos del usuario usando la ForeignKey
            vehiculos = Vehiculo.objects.filter(usuario=usuario_obj)
            
            # Serializar los datos
            serializer = VehiculoSerializer(vehiculos, many=True)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Usuario.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error interno del servidor: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VehiculoDetailView(APIView):
    """
    Vista para obtener, actualizar o eliminar un vehículo específico
    """
    # permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        vehiculo = get_object_or_404(Vehiculo, pk=pk)
        serializer = VehiculoSerializer(vehiculo)
        return Response(serializer.data)
    
    def put(self, request, pk):
        vehiculo = get_object_or_404(Vehiculo, pk=pk)
        serializer = VehiculoSerializer(vehiculo, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        vehiculo = get_object_or_404(Vehiculo, pk=pk)
        vehiculo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)