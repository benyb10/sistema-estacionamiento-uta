import React from 'react';
import '../../styles/pages/Admin.css';

const UsersPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">👥 Gestión de Usuarios</h1>
        <p className="page-subtitle">Administración de usuarios del sistema</p>
      </div>
      <div className="page-content">
        <div className="dashboard-card">
          <h3 className="card-title">Lista de Usuarios</h3>
          <div className="card-content">
            <p>Aquí irá la tabla de usuarios registrados...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
