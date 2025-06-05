import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/pages/Profile.css';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">⚙️ Configuración</h1>
        <p className="page-subtitle">Preferencias y configuración del sistema</p>
      </div>
      <div className="page-content">
        <div className="dashboard-card">
          <h3 className="card-title">Preferencias</h3>
          <div className="card-content">
            <div className="setting-item">
              <label>
                <strong>Tema:</strong>
                <button 
                  className="btn-uta-secondary"
                  onClick={toggleTheme}
                  style={{ marginLeft: '10px' }}
                >
                  {theme === 'light' ? '🌙 Cambiar a Oscuro' : '☀️ Cambiar a Claro'}
                </button>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;