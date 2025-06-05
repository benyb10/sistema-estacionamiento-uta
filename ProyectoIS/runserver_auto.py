import socket
import os

# Obtiene la IP local de forma automática
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    s.connect(('10.255.255.255', 1))
    ip = s.getsockname()[0]
except Exception:
    ip = '127.0.0.1'
finally:
    s.close()

print(f"Ejecutando Django en {ip}:8000")
os.system(f"python manage.py runserver {ip}:8000")