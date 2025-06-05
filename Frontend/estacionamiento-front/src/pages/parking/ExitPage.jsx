import React from 'react';
import '../../styles/pages/Parking.css';

const ExitPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🚙 Registrar Salida</h1>
        <p className="page-subtitle">Salida de vehículos del campus universitario</p>
      </div>
      <div className="page-content">
        <div className="dashboard-card">
          <h3 className="card-title">Formulario de Salida</h3>
          <div className="card-content">
            <p>Aquí irá el formulario para registrar la salida de vehículos...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitPage;