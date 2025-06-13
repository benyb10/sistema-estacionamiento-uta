import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardStats, setDashboardStats] = useState({
    espaciosDisponibles: 150,
    espaciosOcupados: 350,
    totalEspacios: 500,
    vehiculosHoy: 45
  });

  // Actualizar hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const menuOptions = [
    {
      path: '/parking/entry',
      title: 'Registrar Entrada',
      icon: '🚗',
      description: 'Ingreso de vehículos al campus',
      color: 'success'
    },
    {
      path: '/parking/exit',
      title: 'Registrar Salida',
      icon: '🚙',
      description: 'Salida de vehículos del campus',
      color: 'warning'
    },
    {
      path: '/parking/status',
      title: 'Estado del Parqueadero',
      icon: '📊',
      description: 'Consultar disponibilidad de espacios',
      color: 'info'
    },
    {
      path: '/vehicles/my-vehicles',
      title: 'Mis Vehículos',
      icon: '🚗',
      description: 'Gestionar mis vehículos registrados',
      color: 'primary'
    },
    {
      path: '/parking/reports',
      title: 'Reportes',
      icon: '📈',
      description: 'Informes y estadísticas',
      color: 'info'
    }
  ];

  // Mostrar opciones de admin solo si es administrador
  const adminOptions = [
    {
      path: '/admin/users',
      title: 'Gestión de Usuarios',
      icon: '👥',
      description: 'Administrar usuarios del sistema',
      color: 'admin'
    },
    {
      path: '/admin/vehicles',
      title: 'Gestión de Vehículos',
      icon: '🚐',
      description: 'Administrar vehículos registrados',
      color: 'admin'
    },
    {
      path: '/admin/places',
      title: 'Gestión de Espacios',
      icon: '🅿️',
      description: 'Administrar espacios de estacionamiento',
      color: 'admin'
    }
  ];

  const isAdmin = user?.categoria === 'ADMINISTRADOR' || user?.role === 'admin';
  const allOptions = isAdmin ? [...menuOptions, ...adminOptions] : menuOptions;

  return (
    <div className="dashboard-container">
      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">
            ¡Bienvenido, {user?.nombre || 'Usuario'}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Sistema de Estacionamiento - Universidad Técnica de Ambato
          </p>
        </div>
        
        <div className="time-section">
          <div className="current-time">{formatTime(currentTime)}</div>
          <div className="current-date">{formatDate(currentTime)}</div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="stats-grid">
        <div className="stat-card available">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardStats.espaciosDisponibles}</div>
            <div className="stat-label">Espacios Disponibles</div>
          </div>
        </div>
        
        <div className="stat-card occupied">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardStats.espaciosOcupados}</div>
            <div className="stat-label">Espacios Ocupados</div>
          </div>
        </div>
        
        <div className="stat-card total">
          <div className="stat-icon">🅿️</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardStats.totalEspacios}</div>
            <div className="stat-label">Total de Espacios</div>
          </div>
        </div>
        
        <div className="stat-card today">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardStats.vehiculosHoy}</div>
            <div className="stat-label">Vehículos Hoy</div>
          </div>
        </div>
      </div>

      {/* Opciones del menú */}
      <div className="dashboard-content">
        <h2 className="section-title">Acciones Principales</h2>
        
        <div className="options-grid">
          {allOptions.map((option, index) => (
            <div 
              key={index}
              className={`option-card ${option.color}`}
              onClick={() => navigate(option.path)}
            >
              <div className="option-icon">{option.icon}</div>
              <div className="option-content">
                <h3 className="option-title">{option.title}</h3>
                <p className="option-description">{option.description}</p>
              </div>
              <div className="option-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Información del sistema */}
      <div className="system-info">
        <div className="info-card">
          <h3>📋 Información del Sistema</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>🕒 Horario de Atención:</strong><br />
              Lunes a Viernes: 07:00 - 22:00<br />
              Sábados: 08:00 - 18:00
            </div>
            <div className="info-item">
              <strong>🚗 Capacidad por Categoría:</strong><br />
              Estudiantes: 300 espacios<br />
              Docentes: 150 espacios<br />
              Administrativos: 50 espacios
            </div>
            <div className="info-item">
              <strong>📱 Soporte Técnico:</strong><br />
              📧 soporte.ti@uta.edu.ec<br />
              📞 (03) 2521-081 ext. 123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;