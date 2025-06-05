import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/pages/Profile.css';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">👤 Mi Perfil</h1>
        <p className="page-subtitle">Información personal y configuración de cuenta</p>
      </div>
      <div className="page-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3 className="card-title">Información Personal</h3>
            <div className="card-content">
              <div className="profile-info">
                <div className="info-item">
                  <strong>Nombre:</strong> {user?.nombre || 'No disponible'}
                </div>
                <div className="info-item">
                  <strong>Correo:</strong> {user?.correo || 'No disponible'}
                </div>
                <div className="info-item">
                  <strong>Cédula:</strong> {user?.cedula || 'No disponible'}
                </div>
                <div className="info-item">
                  <strong>Categoría:</strong> {user?.categoria || 'ESTUDIANTE'}
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <h3 className="card-title">Estadísticas</h3>
            <div className="card-content">
              <p>Información sobre uso del estacionamiento...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;