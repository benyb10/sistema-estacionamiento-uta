import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Configurar Django ANTES de importar los routing
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ProyectoIS.settings')
django.setup()

# Importar DESPUÉS de django.setup()
from usuarios.routing import websocket_urlpatterns

print("🚀 ASGI: Cargando configuración...")
print(f"🔗 WebSocket URLs: {websocket_urlpatterns}")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})

print("✅ ASGI: Configuración cargada exitosamente")