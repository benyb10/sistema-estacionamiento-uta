import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import '../../styles/pages/Parking.css';

const ExitPage = () => {  
  const { user } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState('placa'); // 'placa' o 'ticket'
  const [ingresoActivo, setIngresoActivo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');

  const buscarIngresoActivo = async () => {
    if (!busqueda.trim()) {
      setMensaje('❌ Ingrese una placa o número de ticket');
      setTipoMensaje('error');
      return;
    }

    setIsLoading(true);
    setMensaje('');
    setIngresoActivo(null);

    try {
      let url;
      if (tipoBusqueda === 'placa') {
        url = `${API_BASE_URL}${API_ENDPOINTS.SEARCH_ACTIVE_ENTRY}?placa=${busqueda.toUpperCase()}`;
      } else {
        url = `${API_BASE_URL}${API_ENDPOINTS.SEARCH_ACTIVE_ENTRY}?ticket=${busqueda}`;
      }

      console.log('🔍 Buscando ingreso activo:', url);

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      // El endpoint buscar-activo devuelve UN objeto, no un array
      if (response.ok && data.id) {
        setIngresoActivo(data);
        setMensaje('✅ Vehículo encontrado');
        setTipoMensaje('exito');
        console.log('✅ Ingreso encontrado:', data);
      } else {
        setMensaje('❌ No se encontró un vehículo activo con esos datos');
        setTipoMensaje('error');
      }
    } catch (error) {
      console.error('❌ Error al buscar ingreso:', error);
      setMensaje('❌ Error de conexión. Verifique su conexión a internet.');
      setTipoMensaje('error');
    } finally {
      setIsLoading(false);
    }
  };

  const calcularDuracion = (horaIngreso) => {
    const inicio = new Date(horaIngreso);
    const ahora = new Date();
    const diferencia = ahora - inicio;
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return { horas, minutos, totalMinutos: Math.floor(diferencia / (1000 * 60)) };
  };

  const calcularCosto = (totalMinutos, tarifaPorHora) => {
    if (!tarifaPorHora || tarifaPorHora === 0) return 0;
    const horas = totalMinutos / 60;
    return Math.ceil(horas * tarifaPorHora * 100) / 100; // Redondear hacia arriba
  };

  const procesarSalida = async () => {
    if (!ingresoActivo) return;

    setIsProcessing(true);
    setMensaje('');

    try {
      const datosFinalizacion = {
        metodo_pago: metodoPago,
        observaciones: `Salida registrada el ${new Date().toLocaleString()}`
      };

      console.log('📤 Procesando salida:', datosFinalizacion);

      // Usar la ruta específica de finalización
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.FINALIZE_ENTRY(ingresoActivo.id)}`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(datosFinalizacion)
        }
      );

      const data = await response.json();

      if (response.ok) {
        const duracion = calcularDuracion(ingresoActivo.hora_ingreso);
        const costo = calcularCosto(
          duracion.totalMinutos, 
          ingresoActivo.lugar?.tipo_lugar?.tarifa_por_hora || 0
        );

        setMensaje(
          `✅ ¡Salida registrada exitosamente!\n` +
          `Duración: ${duracion.horas}h ${duracion.minutos}m\n` +
          `Costo total: $${data.costo_total || costo.toFixed(2)}\n` +
          `Método de pago: ${metodoPago}`
        );
        setTipoMensaje('exito');
        
        // Limpiar formulario
        setBusqueda('');
        setIngresoActivo(null);
      } else {
        setMensaje(`❌ ${data.error || 'Error al procesar la salida'}`);
        setTipoMensaje('error');
      }
    } catch (error) {
      console.error('❌ Error al procesar salida:', error);
      setMensaje('❌ Error de conexión. Intente nuevamente.');
      setTipoMensaje('error');
    } finally {
      setIsProcessing(false);
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

  // Limpiar búsqueda al cambiar tipo
  useEffect(() => {
    setBusqueda('');
    setIngresoActivo(null);
    setMensaje('');
  }, [tipoBusqueda]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🚙 Registrar Salida</h1>
        <p className="page-subtitle">Salida de vehículos del campus universitario</p>
      </div>

      <div className="page-content">
        {/* Formulario de búsqueda */}
        <div className="parking-form">
          <h3>🔍 Buscar Vehículo</h3>
          
          <div className="form-group">
            <label>Tipo de búsqueda</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="tipo-busqueda"
                  value="placa"
                  checked={tipoBusqueda === 'placa'}
                  onChange={(e) => setTipoBusqueda(e.target.value)}
                />
                Por placa del vehículo
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="tipo-busqueda"
                  value="ticket"
                  checked={tipoBusqueda === 'ticket'}
                  onChange={(e) => setTipoBusqueda(e.target.value)}
                />
                Por número de ticket
              </label>
            </div>
          </div>

          <div className="search-container">
            <div className="form-group">
              <label htmlFor="busqueda">
                {tipoBusqueda === 'placa' ? 'Placa del vehículo' : 'Número de ticket'}
              </label>
              <input
                type="text"
                id="busqueda"
                placeholder={
                  tipoBusqueda === 'placa' 
                    ? 'Ej: ABC-1234' 
                    : 'Ej: TKT-20250614-001'
                }
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && buscarIngresoActivo()}
              />
            </div>
            
            <button
              type="button"
              className={`btn-search ${isLoading ? 'loading' : ''}`}
              onClick={buscarIngresoActivo}
              disabled={isLoading || !busqueda.trim()}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Buscando...
                </>
              ) : (
                <>
                  🔍 Buscar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Información del vehículo encontrado */}
        {ingresoActivo && (
          <div className="vehicle-info-card">
            <h3>🚗 Información del Vehículo</h3>
            
            <div className="vehicle-details">
              <div className="detail-row">
                <span className="detail-label">Placa:</span>
                <span className="detail-value">{ingresoActivo.vehiculo?.placa}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Vehículo:</span>
                <span className="detail-value">
                  {ingresoActivo.vehiculo?.marca} {ingresoActivo.vehiculo?.modelo} 
                  ({ingresoActivo.vehiculo?.tipo_vehiculo})
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Propietario:</span>
                <span className="detail-value">
                  {ingresoActivo.vehiculo?.usuario?.nombre} {ingresoActivo.vehiculo?.usuario?.apellido}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Lugar:</span>
                <span className="detail-value">
                  Lugar {ingresoActivo.lugar?.numero} - {ingresoActivo.lugar?.tipo_lugar?.nombre}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Hora de ingreso:</span>
                <span className="detail-value">
                  {new Date(ingresoActivo.hora_ingreso).toLocaleString('es-EC')}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Duración actual:</span>
                <span className="detail-value highlight">
                  {(() => {
                    const duracion = calcularDuracion(ingresoActivo.hora_ingreso);
                    return `${duracion.horas}h ${duracion.minutos}m`;
                  })()}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Costo estimado:</span>
                <span className="detail-value highlight">
                  ${(() => {
                    const duracion = calcularDuracion(ingresoActivo.hora_ingreso);
                    const costo = calcularCosto(
                      duracion.totalMinutos,
                      ingresoActivo.lugar?.tipo_lugar?.tarifa_por_hora || 0
                    );
                    return costo.toFixed(2);
                  })()}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Ticket:</span>
                <span className="detail-value">{ingresoActivo.ticket_numero || 'N/A'}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div className="form-group">
              <label htmlFor="metodo-pago">Método de pago</label>
              <select
                id="metodo-pago"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="CREDITO">Crédito Institucional</option>
                <option value="GRATIS">Gratuito</option>
              </select>
            </div>

            {/* Botón para procesar salida */}
            <div className="form-actions">
              <button
                type="button"
                className={`btn-submit danger ${isProcessing ? 'loading' : ''}`}
                onClick={procesarSalida}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="loading-spinner"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    🚙 Registrar Salida
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Mensajes de estado */}
        {mensaje && (
          <div className={`mensaje ${tipoMensaje}`}>
            <pre>{mensaje}</pre>
          </div>
        )}

        {/* Instrucciones */}
        <div className="info-cards">
          <div className="info-card">
            <h3>ℹ️ Instrucciones</h3>
            <div className="info-content">
              <ul>
                <li>Busque el vehículo por placa o número de ticket</li>
                <li>Verifique la información del vehículo y propietario</li>
                <li>Seleccione el método de pago apropiado</li>
                <li>Confirme el registro de salida</li>
                <li>El costo se calcula automáticamente según la tarifa y duración</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitPage;  