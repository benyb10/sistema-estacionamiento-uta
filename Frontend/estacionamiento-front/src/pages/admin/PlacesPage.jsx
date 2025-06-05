import React from 'react';
import '../../styles/pages/Admin.css';

const PlacesPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🅿️ Gestión de Espacios</h1>
        <p className="page-subtitle">Administración de espacios de estacionamiento</p>
      </div>
      <div className="page-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3 className="card-title">Espacios Totales</h3>
            <div className="card-content">
              <p>Configuración de espacios...</p>
            </div>
          </div>
          <div className="dashboard-card">
            <h3 className="card-title">Mantenimiento</h3>
            <div className="card-content">
              <p>Estado de mantenimiento...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacesPage;