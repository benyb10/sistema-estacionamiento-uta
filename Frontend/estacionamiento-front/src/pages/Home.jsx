import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/Home.css';
import logoUTA from '../assets/images/UTA.png'; 

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-background">
        <div className="home-content">
          {/* Logo y título principal */}
          <div className="home-header">
            <div className="home-logo">
              <img src={logoUTA} alt="Universidad Técnica de Ambato" />
            </div>
            <h1 className="home-title">
              Sistema de Estacionamiento
            </h1>
            <h2 className="home-subtitle">
              Universidad Técnica de Ambato
            </h2>
            <p className="home-description">
              Gestión inteligente de parqueaderos para la comunidad universitaria
            </p>
          </div>

          {/* Botones de acción */}
          <div className="home-actions">
            <button 
              className="btn-home primary"
              onClick={() => navigate('/login')}
            >
              <span role="img" aria-label="Ingresar">🔐</span>
              Iniciar Sesión
            </button>
            
            <button 
              className="btn-home secondary"
              onClick={() => navigate('/register')}
            >
              <span role="img" aria-label="Registro">👤</span>
              Registrarse
            </button>
          </div>

          {/* Información adicional */}
          <div className="home-info">
            <div className="info-card">
              <span role="img" aria-label="Horario">🕒</span>
              <h3>Horario de Atención</h3>
              <p>Lunes a Viernes: 07:00 - 22:00<br />Sábados: 08:00 - 18:00</p>
            </div>
            
            <div className="info-card">
              <span role="img" aria-label="Capacidad">🚗</span>
              <h3>Capacidad Total</h3>
              <p>750 espacios disponibles<br />Para toda la comunidad UTA</p>
            </div>
            
            <div className="info-card">
              <span role="img" aria-label="Soporte">📞</span>
              <h3>Soporte Técnico</h3>
              <p>(03) 2521-081 ext. 123<br />soporte.ti@uta.edu.ec</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;