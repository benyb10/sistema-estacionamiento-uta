from django.urls import re_path
from . import consumers

print("🔗 Cargando WebSocket routing...")

websocket_urlpatterns = [
    re_path(r'ws/estado/$', consumers.EstadoConsumer.as_asgi()),
]

print(f"✅ WebSocket patterns cargados: {websocket_urlpatterns}")