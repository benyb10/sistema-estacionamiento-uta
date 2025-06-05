import React from 'react';
import '../../styles/pages/Parking.css';

const EntryPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🚗 Registrar Entrada</h1>
        <p className="page-subtitle">Ingreso de vehículos al campus universitario</p>
      </div>
      <div className="page-content">
        <div className="dashboard-card">
          <h3 className="card-title">Formulario de Entrada</h3>
          <div className="card-content">
            <p>Aquí irá el formulario para registrar el ingreso de vehículos...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryPage;