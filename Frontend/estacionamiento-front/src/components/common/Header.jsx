import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/Header.css';

const Header = ({ onToggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
      logout();
      navigate('/login');
    }
  };

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

  return (
    <header className="header-uta">
      {/* Barra decorativa superior */}
      <div className="header-top-bar"></div>
      
      <div className="header-content">
        {/* Sección izquierda */}
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <span className={`hamburger ${sidebarOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          
          <div className="header-brand">
            <div className="brand-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6,8V16H18V8H6M18,6A2,2 0 0,1 20,8V16A2,2 0 0,1 18,18H6A2,2 0 0,1 4,16V8A2,2 0 0,1 6,6H18M12,11A2,2 0 0,1 14,13A2,2 0 0,1 12,15A2,2 0 0,1 10,13A2,2 0 0,1 12,11Z"/>
              </svg>
            </div>
            <div className="brand-text">
              <h1>Sistema de Estacionamiento</h1>
              <p>Universidad Técnica de Ambato</p>
            </div>
          </div>
        </div>

        {/* Sección derecha */}
        <div className="header-right">
          {/* Información de tiempo */}
          <div className="time-info">
            <div className="current-time">{formatTime(currentTime)}</div>
            <div className="current-date">{formatDate(currentTime)}</div>
          </div>

          {/* Información del usuario */}
          <div className="user-section">
            <div className="user-info">
              <div className="user-name">
                👤 {user?.nombre || user?.correo || 'Usuario'}
              </div>
              <div className="user-category">
                {user?.categoria || 'ESTUDIANTE'}
              </div>
            </div>
            
            <div className="user-actions">
              <button 
                className="header-btn"
                onClick={() => navigate('/profile')}
                title="Perfil"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
              </button>
              
              <button 
                className="header-btn"
                onClick={() => navigate('/settings')}
                title="Configuración"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                </svg>
              </button>
              
              <button 
                className="header-btn logout-btn"
                onClick={handleLogout}
                title="Cerrar sesión"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;