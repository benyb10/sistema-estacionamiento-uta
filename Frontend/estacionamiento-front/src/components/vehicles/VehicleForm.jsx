import React, { useState, useEffect } from 'react';
import '../../styles/components/VehicleForm.css';

const VehicleForm = ({ vehicle, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    tipo_vehiculo: 'AUTO', // Usar el valor exacto del modelo
    color: '',
    estado: 'ACTIVO', // Usar el valor exacto del modelo
    observaciones: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Llenar formulario si estamos editando
  useEffect(() => {
    if (vehicle) {
      setFormData({
        placa: vehicle.placa || '',
        marca: vehicle.marca || '',
        modelo: vehicle.modelo || '',
        año: vehicle.año || new Date().getFullYear(),
        tipo_vehiculo: vehicle.tipo_vehiculo || 'AUTO',
        color: vehicle.color || '',
        estado: vehicle.estado || 'ACTIVO',
        observaciones: vehicle.observaciones || ''
      });
    }
  }, [vehicle]);

  // Opciones exactas del modelo Django
  const vehicleTypes = [
    { value: 'AUTO', label: 'Automóvil' },
    { value: 'MOTO', label: 'Motocicleta' },
    { value: 'CAMIONETA', label: 'Camioneta' },
    { value: 'BICICLETA', label: 'Bicicleta' }
  ];

  const vehicleStates = [
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'INACTIVO', label: 'Inactivo' },
    { value: 'BLOQUEADO', label: 'Bloqueado' }
  ];

  const vehicleColors = [
    'Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 
    'Azul', 'Verde', 'Amarillo', 'Naranja', 'Café', 'Morado'
  ];

  const validateForm = () => {
    const newErrors = {};

    // Validar placa - Usar el regex exacto del modelo Django
    if (!formData.placa.trim()) {
      newErrors.placa = 'La placa es obligatoria';
    } else if (!/^[A-Z]{3}-\d{3,4}$|^[A-Z]{2}-\d{4}$/.test(formData.placa.toUpperCase())) {
      newErrors.placa = 'Formato inválido. Use: ABC-123, ABC-1234 o AB-1234';
    }

    // Validar marca
    if (!formData.marca.trim()) {
      newErrors.marca = 'La marca es obligatoria';
    } else if (formData.marca.trim().length < 2) {
      newErrors.marca = 'La marca debe tener al menos 2 caracteres';
    }

    // Validar modelo
    if (!formData.modelo.trim()) {
      newErrors.modelo = 'El modelo es obligatorio';
    } else if (formData.modelo.trim().length < 2) {
      newErrors.modelo = 'El modelo debe tener al menos 2 caracteres';
    }

    // Validar año
    const currentYear = new Date().getFullYear();
    if (!formData.año) {
      newErrors.año = 'El año es obligatorio';
    } else if (formData.año < 1950 || formData.año > currentYear + 1) {
      newErrors.año = `El año debe estar entre 1950 y ${currentYear + 1}`;
    }

    // Validar color
    if (!formData.color.trim()) {
      newErrors.color = 'El color es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePlacaChange = (value) => {
    // Formatear placa automáticamente para los formatos ecuatorianos
    let formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (formatted.length > 2) {
      // Formato ABC-123 o AB-1234
      if (formatted.length <= 6) {
        formatted = formatted.slice(0, 2) + '-' + formatted.slice(2, 6);
      } else {
        formatted = formatted.slice(0, 3) + '-' + formatted.slice(3, 7);
      }
    }
    
    handleChange('placa', formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Preparar datos exactamente como los espera el backend
      const dataToSave = {
        placa: formData.placa,
        marca: formData.marca,
        modelo: formData.modelo,
        año: parseInt(formData.año),
        tipo_vehiculo: formData.tipo_vehiculo,
        color: formData.color,
        estado: formData.estado,
        observaciones: formData.observaciones || ''
      };
      
      await onSave(dataToSave);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="vehicle-form">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Placa */}
          <div className="form-group">
            <label htmlFor="placa" className="form-label">
              <span role="img" aria-label="Placa">🏷️</span> Placa *
            </label>
            <input
              type="text"
              id="placa"
              className={`form-input ${errors.placa ? 'error' : ''}`}
              value={formData.placa}
              onChange={(e) => handlePlacaChange(e.target.value)}
              placeholder="ABC-123 o AB-1234"
              maxLength="8"
              disabled={vehicle && vehicle.placa} // No permitir editar placa si ya existe
            />
            {errors.placa && <span className="error-text">{errors.placa}</span>}
            <small className="form-help">Formato Ecuador: ABC-123, ABC-1234 o AB-1234</small>
          </div>

          {/* Marca */}
          <div className="form-group">
            <label htmlFor="marca" className="form-label">
              <span role="img" aria-label="Marca">🏭</span> Marca *
            </label>
            <input
              type="text"
              id="marca"
              className={`form-input ${errors.marca ? 'error' : ''}`}
              value={formData.marca}
              onChange={(e) => handleChange('marca', e.target.value)}
              placeholder="Toyota, Honda, Chevrolet, etc."
              maxLength="50"
            />
            {errors.marca && <span className="error-text">{errors.marca}</span>}
          </div>

          {/* Modelo */}
          <div className="form-group">
            <label htmlFor="modelo" className="form-label">
              <span role="img" aria-label="Modelo">🚗</span> Modelo *
            </label>
            <input
              type="text"
              id="modelo"
              className={`form-input ${errors.modelo ? 'error' : ''}`}
              value={formData.modelo}
              onChange={(e) => handleChange('modelo', e.target.value)}
              placeholder="Corolla, Civic, Aveo, etc."
              maxLength="100"
            />
            {errors.modelo && <span className="error-text">{errors.modelo}</span>}
          </div>

          {/* Año */}
          <div className="form-group">
            <label htmlFor="año" className="form-label">
              <span role="img" aria-label="Año">📅</span> Año *
            </label>
            <input
              type="number"
              id="año"
              className={`form-input ${errors.año ? 'error' : ''}`}
              value={formData.año}
              onChange={(e) => handleChange('año', parseInt(e.target.value))}
              min="1950"
              max={new Date().getFullYear() + 1}
            />
            {errors.año && <span className="error-text">{errors.año}</span>}
          </div>

          {/* Tipo de Vehículo */}
          <div className="form-group">
            <label htmlFor="tipo_vehiculo" className="form-label">
              <span role="img" aria-label="Tipo">🚙</span> Tipo de Vehículo *
            </label>
            <select
              id="tipo_vehiculo"
              className="form-input"
              value={formData.tipo_vehiculo}
              onChange={(e) => handleChange('tipo_vehiculo', e.target.value)}
            >
              {vehicleTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div className="form-group">
            <label htmlFor="color" className="form-label">
              <span role="img" aria-label="Color">🎨</span> Color *
            </label>
            <select
              id="color"
              className={`form-input ${errors.color ? 'error' : ''}`}
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
            >
              <option value="">Seleccionar color</option>
              {vehicleColors.map(color => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
            {errors.color && <span className="error-text">{errors.color}</span>}
          </div>

          {/* Estado */}
          <div className="form-group">
            <label htmlFor="estado" className="form-label">
              <span role="img" aria-label="Estado">📊</span> Estado
            </label>
            <select
              id="estado"
              className="form-input"
              value={formData.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
            >
              {vehicleStates.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          {/* Observaciones */}
          <div className="form-group full-width">
            <label htmlFor="observaciones" className="form-label">
              <span role="img" aria-label="Observaciones">📝</span> Observaciones (opcional)
            </label>
            <textarea
              id="observaciones"
              className="form-input"
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              placeholder="Comentarios adicionales sobre el vehículo..."
              rows="3"
              maxLength="500"
            />
            <small className="form-help">
              {formData.observaciones.length}/500 caracteres
            </small>
          </div>
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-uta btn-uta-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="btn-uta btn-uta-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner-small"></div>
                Guardando...
              </>
            ) : (
              <>
                <span role="img" aria-label="Guardar">💾</span>
                {vehicle ? 'Actualizar' : 'Registrar'} Vehículo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;