import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import '../../styles/pages/Parking.css';

const EntryPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    placa: '',
    lugar: '',
    observaciones: ''
  });
  const [vehiculos, setVehiculos] = useState([]);
  const [lugaresDisponibles, setLugaresDisponibles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [placaManual, setPlacaManual] = useState(false);

  // Cargar vehículos del usuario al montar el componente
  useEffect(() => {
    cargarVehiculosUsuario();
    cargarLugaresDisponibles();
  }, []);

  const cargarVehiculosUsuario = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.USER_VEHICLES(user.cedula)}`,
        {
          headers: getAuthHeaders()
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVehiculos(data);
        console.log('✅ Vehículos cargados:', data);
      } else {
        console.error('❌ Error cargando vehículos');
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  const cargarLugaresDisponibles = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.AVAILABLE_PLACES}`,  // ← CORREGIDO: Usar AVAILABLE_PLACES no SEARCH_ACTIVE_ENTRY
        {
          headers: getAuthHeaders()
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLugaresDisponibles(data);
        console.log('✅ Lugares disponibles cargados:', data);
      } else {
        console.error('❌ Error cargando lugares disponibles');
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  const manejarCambio = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const validarFormulario = () => {
    if (!formData.placa.trim()) {
      setMensaje('❌ Debe seleccionar o ingresar una placa');
      setTipoMensaje('error');
      return false;
    }

    if (!formData.lugar) {
      setMensaje('❌ Debe seleccionar un lugar de estacionamiento');
      setTipoMensaje('error');
      return false;
    }

    return true;
  };

  const registrarEntrada = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setIsLoading(true);
    setMensaje('');

    try {
      const datosIngreso = {
        vehiculo: formData.placa,  // ← CAMBIO: usar 'vehiculo' no 'vehiculo_placa'
        lugar: parseInt(formData.lugar),
        usuario_registro: user.cedula,
        observaciones: formData.observaciones
      };

      console.log('📤 Enviando datos de ingreso:', datosIngreso);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PARKING_ENTRIES}`,  // ← Esto apunta a /ingresovehiculos/entrada/
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(datosIngreso)
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMensaje(`✅ ¡Entrada registrada exitosamente! Ticket: ${data.ticket_numero || 'N/A'}`);
        setTipoMensaje('exito');
        
        // Limpiar formulario
        setFormData({
          placa: '',
          lugar: '',
          observaciones: ''
        });
        
        // Recargar lugares disponibles
        cargarLugaresDisponibles();
      } else {
        setMensaje(`❌ ${data.error || 'Error al registrar la entrada'}`);
        setTipoMensaje('error');
      }
    } catch (error) {
      console.error('❌ Error al registrar entrada:', error);
      setMensaje('❌ Error de conexión. Verifique su conexión a internet.');
      setTipoMensaje('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        setMensaje('');
        setTipoMensaje('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🚗 Registrar Entrada</h1>
        <p className="page-subtitle">Ingreso de vehículos al campus universitario</p>
      </div>

      <div className="page-content">
        <div className="parking-form">
          <form onSubmit={registrarEntrada}>
            <div className="form-grid">
              
              {/* Selección de Vehículo */}
              <div className="form-group">
                <label htmlFor="vehiculo">Vehículo</label>
                <div className="vehiculo-selection">
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="vehiculo-tipo"
                        checked={!placaManual}
                        onChange={() => setPlacaManual(false)}
                      />
                      Mis vehículos registrados
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="vehiculo-tipo"
                        checked={placaManual}
                        onChange={() => setPlacaManual(true)}
                      />
                      Ingresar placa manualmente
                    </label>
                  </div>

                  {!placaManual ? (
                    <select
                      value={formData.placa}
                      onChange={(e) => manejarCambio('placa', e.target.value)}
                      required
                    >
                      <option value="">Seleccione un vehículo</option>
                      {vehiculos.map(vehiculo => (
                        <option key={vehiculo.placa} value={vehiculo.placa}>
                          {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo} ({vehiculo.tipo_vehiculo})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Ej: ABC-1234"
                      value={formData.placa}
                      onChange={(e) => manejarCambio('placa', e.target.value.toUpperCase())}
                      pattern="^[A-Z]{2,3}-\d{3,4}$"
                      title="Formato: ABC-1234 o AB-1234"
                      required
                    />
                  )}
                </div>
              </div>

              {/* Selección de Lugar */}
              <div className="form-group">
                <label htmlFor="lugar">Lugar de Estacionamiento</label>
                <select
                  value={formData.lugar}
                  onChange={(e) => manejarCambio('lugar', e.target.value)}
                  required
                >
                  <option value="">Seleccione un lugar disponible</option>
                  {lugaresDisponibles.map(lugar => (
                    <option key={lugar.numero} value={lugar.numero}>
                      Lugar {lugar.numero} - {lugar.tipo_lugar?.nombre || 'General'} 
                      {lugar.piso && ` (Piso ${lugar.piso})`}
                      {lugar.seccion && ` - ${lugar.seccion}`}
                    </option>
                  ))}
                </select>
                <small className="form-help">
                  {lugaresDisponibles.length} lugares disponibles
                </small>
              </div>

              {/* Observaciones */}
              <div className="form-group full-width">
                <label htmlFor="observaciones">Observaciones (Opcional)</label>
                <textarea
                  placeholder="Notas adicionales sobre el ingreso..."
                  value={formData.observaciones}
                  onChange={(e) => manejarCambio('observaciones', e.target.value)}
                  rows="3"
                  maxLength="500"
                />
                <small className="form-help">
                  {formData.observaciones.length}/500 caracteres
                </small>
              </div>
            </div>

            {/* Botón de envío */}
            <div className="form-actions">
              <button
                type="submit"
                className={`btn-submit ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Registrando...
                  </>
                ) : (
                  <>
                    🚗 Registrar Entrada
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Mensajes de estado */}
          {mensaje && (
            <div className={`mensaje ${tipoMensaje}`}>
              <p>{mensaje}</p>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="info-cards">
          <div className="info-card">
            <h3>📊 Información del Sistema</h3>
            <div className="info-content">
              <div className="info-item">
                <span className="info-label">Lugares disponibles:</span>
                <span className="info-value">{lugaresDisponibles.length}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Mis vehículos:</span>
                <span className="info-value">{vehiculos.length}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Usuario:</span>
                <span className="info-value">{user?.nombre} ({user?.categoria})</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3>ℹ️ Instrucciones</h3>
            <div className="info-content">
              <ul>
                <li>Seleccione su vehículo de la lista o ingrese la placa manualmente</li>
                <li>Elija un lugar disponible según su categoría de usuario</li>
                <li>Las observaciones son opcionales pero útiles para referencias</li>
                <li>El ticket se generará automáticamente tras el registro</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryPage;