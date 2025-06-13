import React from 'react';
import '../../styles/components/VehicleCard.css';

const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
  
  const getVehicleIcon = (tipo_vehiculo) => {
    switch (tipo_vehiculo?.toUpperCase()) {
      case 'AUTO':
      case 'AUTOMOVIL':
        return '🚗';
      case 'MOTO':
      case 'MOTOCICLETA':
        return '🏍️';
      case 'CAMIONETA':
        return '🚙';
      case 'BICICLETA':
        return '🚴';
      default:
        return '🚗';
    }
  };

  const getVehicleColor = (color) => {
    const colorMap = {
      'blanco': '#FFFFFF',
      'negro': '#000000',
      'gris': '#808080',
      'plata': '#C0C0C0',
      'rojo': '#FF0000',
      'azul': '#0000FF',
      'verde': '#008000',
      'amarillo': '#FFFF00',
      'naranja': '#FFA500',
      'café': '#8B4513',
      'cafe': '#8B4513',
      'morado': '#800080',
    };
        
    return colorMap[color?.toLowerCase()] || '#808080';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getStatusBadgeClass = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'ACTIVO':
        return 'status-activo';
      case 'INACTIVO':
        return 'status-inactivo';
      case 'BLOQUEADO':
        return 'status-bloqueado';
      default:
        return 'status-inactivo';
    }
  };

  const getStatusLabel = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'ACTIVO':
        return 'Activo';
      case 'INACTIVO':
        return 'Inactivo';
      case 'BLOQUEADO':
        return 'Bloqueado';
      default:
        return 'Desconocido';
    }
  };

  const getTipoLabel = (tipo_vehiculo) => {
    switch (tipo_vehiculo?.toUpperCase()) {
      case 'AUTO':
        return 'Automóvil';
      case 'MOTO':
        return 'Motocicleta';
      case 'CAMIONETA':
        return 'Camioneta';
      case 'BICICLETA':
        return 'Bicicleta';
      default:
        return tipo_vehiculo || 'No especificado';
    }
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-header">
        <div className="vehicle-icon">
          <span role="img" aria-label={vehicle.tipo_vehiculo}>
            {getVehicleIcon(vehicle.tipo_vehiculo)}
          </span>
        </div>
        <div className="vehicle-actions">
          <button 
            className="btn-action edit"
            onClick={onEdit}
            title="Editar vehículo"
          >
            <span role="img" aria-label="Editar">✏️</span>
          </button>
          <button 
            className="btn-action delete"
            onClick={onDelete}
            title="Eliminar vehículo"
          >
            <span role="img" aria-label="Eliminar">🗑️</span>
          </button>
        </div>
      </div>

      <div className="vehicle-card-body">
        <div className="vehicle-plate">
          {vehicle.placa}
        </div>

        <div className="vehicle-details">
          <div className="detail-row">
            <span className="detail-label">Marca:</span>
            <span className="detail-value">{vehicle.marca || 'No especificada'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Modelo:</span>
            <span className="detail-value">{vehicle.modelo || 'No especificado'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Año:</span>
            <span className="detail-value">{vehicle.año || 'No especificado'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Tipo:</span>
            <span className="detail-value">{getTipoLabel(vehicle.tipo_vehiculo)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Color:</span>
            <span className="detail-value">
              <span
                className="color-indicator"
                style={{ backgroundColor: getVehicleColor(vehicle.color) }}
              ></span>
              {vehicle.color || 'No especificado'}
            </span>
          </div>

          {/* Mostrar observaciones si existen */}
          {vehicle.observaciones && (
            <div className="detail-row">
              <span className="detail-label">Observaciones:</span>
              <span className="detail-value observation-text">
                {vehicle.observaciones}
              </span>
            </div>
          )}

          {/* Mostrar información del usuario si está disponible */}
          {vehicle.usuario_nombre && (
            <div className="detail-row">
              <span className="detail-label">Propietario:</span>
              <span className="detail-value">{vehicle.usuario_nombre}</span>
            </div>
          )}
        </div>
      </div>

      <div className="vehicle-card-footer">
        <div className="vehicle-status">
          <span className="status-label">Estado:</span>
          <span className={`status-badge ${getStatusBadgeClass(vehicle.estado)}`}>
            {getStatusLabel(vehicle.estado)}
          </span>
        </div>

        <div className="vehicle-dates">
          <div className="vehicle-date">
            <small>
              <strong>Registrado:</strong> {formatDate(vehicle.fecha_registro)}
            </small>
          </div>
          {vehicle.fecha_actualizacion && vehicle.fecha_actualizacion !== vehicle.fecha_registro && (
            <div className="vehicle-date">
              <small>
                <strong>Actualizado:</strong> {formatDate(vehicle.fecha_actualizacion)}
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;