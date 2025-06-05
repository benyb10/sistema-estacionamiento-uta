import React from 'react';
import '../../styles/pages/Parking.css';

const StatusPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📊 Estado del Parqueadero</h1>
        <p className="page-subtitle">Consultar disponibilidad de espacios</p>
      </div>
      <div className="page-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3 className="card-title">Espacios Disponibles</h3>
            <div className="card-content">
              <p>Información sobre espacios disponibles...</p>
            </div>
          </div>
          <div className="dashboard-card">
            <h3 className="card-title">Ocupación Actual</h3>
            <div className="card-content">
              <p>Estadísticas de ocupación actual...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;