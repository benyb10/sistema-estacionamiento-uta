import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import VehicleCard from '../../components/vehicles/VehicleCard';
import VehicleForm from '../../components/vehicles/VehicleForm';
import Modal from '../../components/common/Modal';
// 🚀 Importar la configuración centralizada
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders, logApiCall } from '../../config/api';
import '../../styles/pages/MyVehicles.css';

const MyVehiclesPage = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Cargar vehículos del usuario
  useEffect(() => {
    if (user?.cedula) {
      loadUserVehicles();
    }
  }, [user]);

  const loadUserVehicles = async () => {
    try {
      setLoading(true);
      // 🚀 Usar endpoint centralizado
      const endpoint = API_ENDPOINTS.USER_VEHICLES(user.cedula);
      const url = `${API_BASE_URL}${endpoint}`;
      
      console.log('🚗 Cargando vehículos para usuario:', user.cedula);
      logApiCall('GET', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Vehículos cargados:', data);
        setVehicles(data);
      } else {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        showMessage(errorData.error || 'Error al cargar vehículos', 'error');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      showMessage('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 4000);
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowForm(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleDeleteVehicle = async (vehiclePlaca) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este vehículo?')) {
      return;
    }

    try {
      // 🚀 Usar endpoint centralizado
      const endpoint = API_ENDPOINTS.VEHICLE_DETAIL(vehiclePlaca);
      const url = `${API_BASE_URL}${endpoint}`;
      
      logApiCall('DELETE', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok || response.status === 204) {
        showMessage('Vehículo eliminado exitosamente', 'success');
        loadUserVehicles(); // Recargar lista
      } else {
        const errorData = await response.json();
        showMessage(errorData.error || 'Error al eliminar vehículo', 'error');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      showMessage('Error de conexión con el servidor', 'error');
    }
  };

  const handleSaveVehicle = async (vehicleData) => {
    try {
      const isEditing = !!editingVehicle;
      // 🚀 Usar endpoints centralizados
      const endpoint = isEditing 
        ? API_ENDPOINTS.VEHICLE_DETAIL(editingVehicle.placa)
        : API_ENDPOINTS.VEHICLES;
      const url = `${API_BASE_URL}${endpoint}`;
      const method = isEditing ? 'PUT' : 'POST';
      
      // Preparar los datos para enviar
      const dataToSend = {
        ...vehicleData,
        usuario: user.cedula  // Enviar la cédula del usuario
      };

      console.log('📤 Enviando datos:', dataToSend);
      logApiCall(method, url, dataToSend);

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const action = isEditing ? 'actualizado' : 'registrado';
        showMessage(`Vehículo ${action} exitosamente`, 'success');
        setShowForm(false);
        setEditingVehicle(null);
        loadUserVehicles(); // Recargar lista
      } else {
        const errorData = await response.json();
        console.error('❌ Error al guardar:', errorData);
        showMessage(errorData.message || errorData.error || 'Error al guardar vehículo', 'error');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      showMessage('Error de conexión con el servidor', 'error');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando vehículos...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <span role="img" aria-label="Vehículos">🚗</span> Mis Vehículos
        </h1>
        <p className="page-subtitle">Gestiona tus vehículos registrados en el sistema</p>
        
        {/* 🚀 Info de conexión en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <small style={{ color: '#666', display: 'block', marginTop: '8px' }}>
            🔗 Conectado a: {API_BASE_URL}
          </small>
        )}
      </div>

      <div className="page-content">
        {message && (
          <div className={`alert-uta alert-uta-${messageType}`}>
            {message}
          </div>
        )}

        {/* Botón para agregar vehículo */}
        <div className="vehicles-actions">
          <button 
            className="btn-uta btn-uta-primary"
            onClick={handleAddVehicle}
          >
            <span role="img" aria-label="Agregar">➕</span>
            Registrar Nuevo Vehículo
          </button>
          
          {/* Botón de recarga manual */}
          <button 
            className="btn-uta btn-uta-secondary"
            onClick={loadUserVehicles}
            disabled={loading}
          >
            <span role="img" aria-label="Recargar">🔄</span>
            Recargar
          </button>
        </div>

        {/* Lista de vehículos */}
        {vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <span role="img" aria-label="Sin vehículos">🚗</span>
            </div>
            <h3>No tienes vehículos registrados</h3>
            <p>Registra tu primer vehículo para comenzar a usar el sistema de estacionamiento</p>
            <button 
              className="btn-uta btn-uta-primary"
              onClick={handleAddVehicle}
            >
              Registrar Mi Primer Vehículo
            </button>
          </div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.placa}
                vehicle={vehicle}
                onEdit={() => handleEditVehicle(vehicle)}
                onDelete={() => handleDeleteVehicle(vehicle.placa)}
              />
            ))}
          </div>
        )}

        {/* Información adicional */}
        <div className="vehicles-info">
          <div className="info-card">
            <h3>
              <span role="img" aria-label="Información">ℹ️</span> 
              Información Importante
            </h3>
            <ul>
              <li>✅ Puedes registrar hasta 3 vehículos por usuario</li>
              <li>✅ Todos los campos son obligatorios</li>
              <li>✅ La placa debe ser única en el sistema</li>
              <li>✅ Puedes editar la información cuando gustes</li>
              <li>⚠️ Al eliminar un vehículo se perderá su historial</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal para formulario */}
      {showForm && (
        <Modal
          show={showForm}
          onClose={handleCloseForm}
          title={editingVehicle ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}
          size="large"
        >
          <VehicleForm
            vehicle={editingVehicle}
            onSave={handleSaveVehicle}
            onCancel={handleCloseForm}
          />
        </Modal>
      )}
    </div>
  );
};

export default MyVehiclesPage;