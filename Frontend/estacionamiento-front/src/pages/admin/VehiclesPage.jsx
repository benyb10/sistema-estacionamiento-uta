import React from 'react';
import '../../styles/pages/Admin.css';

const VehiclesPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🚐 Gestión de Vehículos</h1>
        <p className="page-subtitle">Administración de vehículos registrados</p>
      </div>
      <div className="page-content">
        <div className="dashboard-card">
          <h3 className="card-title">Vehículos Registrados</h3>
          <div className="card-content">
            <p>Aquí irá la tabla de vehículos...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclesPage;