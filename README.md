# Sistema de Estacionamiento UTA

Sistema de gestión de estacionamiento para la Universidad Técnica de Ambato desarrollado con React y Django.

## Características

- Autenticación con 2FA
- Gestión de usuarios y vehículos
- Control de entrada y salida
- Reportes y estadísticas
- Interfaz responsive
- Tiempo real con WebSockets

## Tecnologías

### Frontend
- React 18
- React Router
- CSS3 con variables

### Backend
- Django
- PostgreSQL/SQLite
- Django REST Framework

## Instalación

### Frontend
```bash
cd Frontend/estacionamiento-front
npm install
npm start
```

### Backend
```bash
cd Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Autor
Bryan Viteri - @benyb10
