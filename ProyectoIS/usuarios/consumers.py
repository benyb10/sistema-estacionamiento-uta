from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio

print("🎯 Cargando EstadoConsumer...")

class EstadoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("🔌 Cliente intentando conectar al WebSocket...")
        print(f"🔗 Scope: {self.scope}")
        print(f"🏠 Path: {self.scope.get('path', 'No path')}")
        
        await self.accept()
        print("✅ Cliente conectado al WebSocket exitosamente")
        
        # Enviar mensaje de confirmación
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Conexión establecida correctamente',
            'timestamp': str(asyncio.get_event_loop().time())
        }))
        
        # Enviar ping cada 30 segundos para mantener la conexión
        self.ping_task = asyncio.create_task(self.send_ping())

    async def disconnect(self, close_code):
        print(f"❌ Cliente desconectado. Código: {close_code}")
        if hasattr(self, 'ping_task'):
            self.ping_task.cancel()
            print("🛑 Ping task cancelado")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            print(f"📨 Mensaje recibido: {data}")
            
            # Responder a pings del cliente
            if data.get('type') == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'message': 'Servidor activo',
                    'timestamp': str(asyncio.get_event_loop().time())
                }))
                print("🏓 Pong enviado al cliente")
        except json.JSONDecodeError as e:
            print(f"❌ Error al decodificar mensaje JSON: {e}")

    async def send_ping(self):
        """Envía ping cada 30 segundos para mantener la conexión"""
        try:
            while True:
                await asyncio.sleep(30)
                await self.send(text_data=json.dumps({
                    'type': 'ping',
                    'message': 'Ping del servidor',
                    'timestamp': str(asyncio.get_event_loop().time())
                }))
                print("🏓 Ping enviado al cliente")
        except asyncio.CancelledError:
            print("🛑 Ping task cancelado")
        except Exception as e:
            print(f"❌ Error en ping task: {e}")

print("✅ EstadoConsumer cargado exitosamente")