import React from 'react';
import '../../styles/pages/Parking.css';

const ReportsPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📈 Reportes y Estadísticas</h1>
        <p className="page-subtitle">Informes de uso y ocupación del estacionamiento</p>
      </div>
      <div className="page-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3 className="card-title">Reporte Diario</h3>
            <div className="card-content">
              <p>Estadísticas del día actual...</p>
            </div>
          </div>
          <div className="dashboard-card">
            <h3 className="card-title">Reporte Mensual</h3>
            <div className="card-content">
              <p>Estadísticas del mes...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;