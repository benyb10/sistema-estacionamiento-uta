import React, { useState, useEffect } from 'react';
import '../styles/pages/Register.css'; 
import logoUTA from '../assets/images/UTA.png'; 
import { useNavigate } from 'react-router-dom';
// 🚀 Importar la configuración centralizada
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_HEADERS, logApiCall } from '../config/api';

function Registro() {
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState(''); // 'exito' o 'error'
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fecha_nacimiento, setFecha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [validFields, setValidFields] = useState({});
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        setMensaje('');
        setTipoMensaje('');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // Validación de fortaleza de contraseña
  const evaluarFortalezaContraseña = (password) => {
    if (password.length >= 8 && 
        /[A-Z]/.test(password) && 
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) && 
        /[^A-Za-z0-9]/.test(password)) {
      return 'strong';
    } else if (password.length >= 6 && 
               /[A-Z]/.test(password) && 
               /[0-9]/.test(password)) {
      return 'medium';
    }
    return 'weak';
  };

  // Validación en tiempo real
  const validarCampo = (campo, valor) => {
    const nuevosErrors = { ...errors };
    const nuevosValidos = { ...validFields };

    switch (campo) {
      case 'nombre':
        if (valor.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
          delete nuevosErrors.nombre;
          nuevosValidos.nombre = true;
        } else {
          nuevosErrors.nombre = 'Nombre debe tener al menos 2 caracteres y solo letras';
          delete nuevosValidos.nombre;
        }
        break;
      
      case 'apellido':
        if (valor.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
          delete nuevosErrors.apellido;
          nuevosValidos.apellido = true;
        } else {
          nuevosErrors.apellido = 'Apellido debe tener al menos 2 caracteres y solo letras';
          delete nuevosValidos.apellido;
        }
        break;

      case 'cedula':
        if (valor.length === 10 && /^\d+$/.test(valor) && validarCedulaEcuatoriana(valor)) {
          delete nuevosErrors.cedula;
          nuevosValidos.cedula = true;
        } else {
          nuevosErrors.cedula = 'Cédula ecuatoriana inválida (10 dígitos)';
          delete nuevosValidos.cedula;
        }
        break;

      case 'correo':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(valor)) {
          delete nuevosErrors.correo;
          nuevosValidos.correo = true;
        } else {
          nuevosErrors.correo = 'Formato de correo electrónico inválido';
          delete nuevosValidos.correo;
        }
        break;

      case 'contraseña':
        const strength = evaluarFortalezaContraseña(valor);
        setPasswordStrength(strength);
        
        if (valor.length >= 8) {
          delete nuevosErrors.contraseña;
          nuevosValidos.contraseña = true;
        } else {
          nuevosErrors.contraseña = 'Contraseña debe tener al menos 8 caracteres';
          delete nuevosValidos.contraseña;
        }
        
        // Revalidar confirmación si existe
        if (confirmarContraseña) {
          validarCampo('confirmarContraseña', confirmarContraseña);
        }
        break;

      case 'confirmarContraseña':
        if (valor === contraseña && valor.length > 0) {
          delete nuevosErrors.confirmarContraseña;
          nuevosValidos.confirmarContraseña = true;
        } else {
          nuevosErrors.confirmarContraseña = 'Las contraseñas no coinciden';
          delete nuevosValidos.confirmarContraseña;
        }
        break;

      case 'fecha_nacimiento':
        const fechaNac = new Date(valor);
        const hoy = new Date();
        const edad = Math.floor((hoy - fechaNac) / (365.25 * 24 * 60 * 60 * 1000));
        
        if (edad >= 16 && edad <= 100) {
          delete nuevosErrors.fecha_nacimiento;
          nuevosValidos.fecha_nacimiento = true;
        } else {
          nuevosErrors.fecha_nacimiento = 'Debe ser mayor de 16 años';
          delete nuevosValidos.fecha_nacimiento;
        }
        break;

      default:
        break;
    }

    setErrors(nuevosErrors);
    setValidFields(nuevosValidos);
  };

  // Validador de cédula ecuatoriana
  const validarCedulaEcuatoriana = (cedula) => {
    if (cedula.length !== 10) return false;
    
    const digitos = cedula.split('').map(Number);
    const verificador = digitos[9];
    const provincia = parseInt(cedula.substring(0, 2));
    
    if (provincia < 1 || provincia > 24) return false;
    
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let digito = digitos[i];
      if (i % 2 === 0) {
        digito *= 2;
        if (digito > 9) digito -= 9;
      }
      suma += digito;
    }
    
    const digitoCalculado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
    return digitoCalculado === verificador;
  };

  const manejarCambio = (campo, valor) => {
    switch (campo) {
      case 'nombre':
        // Solo letras y espacios
        if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(valor)) {
          setNombre(valor);
          validarCampo('nombre', valor);
        }
        break;
      
      case 'apellido':
        // Solo letras y espacios
        if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(valor)) {
          setApellido(valor);
          validarCampo('apellido', valor);
        }
        break;

      case 'cedula':
        // Solo números y máximo 10 dígitos
        if (/^\d*$/.test(valor) && valor.length <= 10) {
          setCedula(valor);
          validarCampo('cedula', valor);
        }
        break;

      case 'correo':
        setCorreo(valor);
        validarCampo('correo', valor);
        break;

      case 'contraseña':
        setContraseña(valor);
        validarCampo('contraseña', valor);
        break;

      case 'confirmarContraseña':
        setConfirmarContraseña(valor);
        validarCampo('confirmarContraseña', valor);
        break;

      case 'fecha_nacimiento':
        setFecha(valor);
        validarCampo('fecha_nacimiento', valor);
        break;

      default:
        break;
    }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje('');

    // Validación final
    if (Object.keys(errors).length > 0) {
      setMensaje('❌ Por favor corrige todos los errores antes de continuar');
      setTipoMensaje('error');
      setIsLoading(false);
      return;
    }

    if (contraseña !== confirmarContraseña) {
      setMensaje('❌ Las contraseñas no coinciden');
      setTipoMensaje('error');
      setIsLoading(false);
      return;
    }

    const datosUsuario = {
      cedula: cedula.trim(),
      correo: correo.trim().toLowerCase(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      fecha_nacimiento,
      contraseña,
    };

    try {
      // 🚀 Usar la URL centralizada
      const url = `${API_BASE_URL}${API_ENDPOINTS.REGISTER}`;
      
      // 🚀 Log para desarrollo
      logApiCall('POST', url, { ...datosUsuario, contraseña: '***' });

      const response = await fetch(url, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(datosUsuario),
      });

      if (response.ok) {
        setMensaje('✅ ¡Registro exitoso! Ya puedes iniciar sesión con tus credenciales.');
        setTipoMensaje('exito');
        
        // Limpiar formulario después del éxito
        setTimeout(() => {
          limpiarFormulario();
          // Opcional: redirigir al login después del registro exitoso
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }, 3000);
        
      } else {
        const errorData = await response.json();
        setMensaje(`❌ Error: ${errorData.message || 'No se pudo completar el registro'}`);
        setTipoMensaje('error');
      }
    } catch (error) {
      console.error('❌ Error al conectar con el servidor:', error);
      setMensaje('❌ Error de conexión. Verifique su conexión a internet.');
      setTipoMensaje('error');
    } finally {
      setIsLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setCedula('');
    setCorreo('');
    setContraseña('');
    setConfirmarContraseña('');
    setNombre('');
    setApellido('');
    setFecha('');
    setMensaje('');
    setTipoMensaje('');
    setPasswordStrength('weak');
    setErrors({});
    setValidFields({});
  };

  const volverAlLogin = () => {
    navigate('/');
  };

  return (
    <div className="registro-fondo">
      <div className="registro-container">
        <div className="registro-box">
          <div className='registro-logo'>
            <img src={logoUTA} alt="Universidad Técnica de Ambato" />
            <h2>Registro de Usuario</h2>
            <p>Sistema de Estacionamiento - Universidad Técnica de Ambato</p>
            
            {/* 🚀 Mostrar URL de conexión en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <small style={{ 
                display: 'block', 
                marginTop: '8px', 
                color: '#666', 
                fontSize: '0.8rem' 
              }}>
                🔗 Conectando a: {API_BASE_URL}
              </small>
            )}
          </div>

          <form className="registro-form" onSubmit={manejarRegistro}>
            {/* Fila 1: Nombres y Apellidos */}
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nombres"
                  value={nombre}
                  onChange={(e) => manejarCambio('nombre', e.target.value)}
                  className={errors.nombre ? 'invalid' : validFields.nombre ? 'valid' : ''}
                  required
                />
                {errors.nombre && <small className="error-text">{errors.nombre}</small>}
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Apellidos"
                  value={apellido}
                  onChange={(e) => manejarCambio('apellido', e.target.value)}
                  className={errors.apellido ? 'invalid' : validFields.apellido ? 'valid' : ''}
                  required
                />
                {errors.apellido && <small className="error-text">{errors.apellido}</small>}
              </div>
            </div>

            {/* Fila 2: Cédula y Correo */}
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Cédula de identidad"
                  value={cedula}
                  onChange={(e) => manejarCambio('cedula', e.target.value)}
                  className={errors.cedula ? 'invalid' : validFields.cedula ? 'valid' : ''}
                  required
                  maxLength="10"
                />
                {errors.cedula && <small className="error-text">{errors.cedula}</small>}
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={correo}
                  onChange={(e) => manejarCambio('correo', e.target.value)}
                  className={errors.correo ? 'invalid' : validFields.correo ? 'valid' : ''}
                  required
                />
                {errors.correo && <small className="error-text">{errors.correo}</small>}
              </div>
            </div>

            {/* Fecha de nacimiento */}
            <div className="form-group full-width">
              <input
                type="date"
                placeholder="Fecha de nacimiento"
                value={fecha_nacimiento}
                onChange={(e) => manejarCambio('fecha_nacimiento', e.target.value)}
                className={errors.fecha_nacimiento ? 'invalid' : validFields.fecha_nacimiento ? 'valid' : ''}
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
              />
              {errors.fecha_nacimiento && <small className="error-text">{errors.fecha_nacimiento}</small>}
            </div>

            {/* Contraseña */}
            <div className="form-group full-width">
              <input
                type="password"
                placeholder="Contraseña"
                value={contraseña}
                onChange={(e) => manejarCambio('contraseña', e.target.value)}
                className={errors.contraseña ? 'invalid' : validFields.contraseña ? 'valid' : ''}
                required
                minLength="8"
              />
              {contraseña && (
                <div className="password-strength">
                  <div className={`password-strength-bar ${passwordStrength}`}></div>
                </div>
              )}
              {errors.contraseña && <small className="error-text">{errors.contraseña}</small>}
            </div>

            {/* Confirmar contraseña */}
            <div className="form-group full-width">
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmarContraseña}
                onChange={(e) => manejarCambio('confirmarContraseña', e.target.value)}
                className={errors.confirmarContraseña ? 'invalid' : validFields.confirmarContraseña ? 'valid' : ''}
                required
                minLength="8"
              />
              {errors.confirmarContraseña && <small className="error-text">{errors.confirmarContraseña}</small>}
            </div>

            <button 
              type="submit" 
              className={isLoading ? 'loading' : ''}
              disabled={isLoading || Object.keys(errors).length > 0}
            >
              {isLoading ? '' : '✅ Crear Cuenta'}
            </button>

            <button 
              type="button" 
              className="btn-volver-login"
              onClick={volverAlLogin}
              disabled={isLoading}
            >
              ← Volver
            </button>

            {mensaje && (
              <div className={`registro-mensaje ${tipoMensaje}`}>
                {mensaje}
              </div>
            )}
          </form>

          <div className="registro-info">
            <h4>📋 Requisitos de registro:</h4>
            <ul>
              <li>✓ Cédula ecuatoriana válida (10 dígitos)</li>
              <li>✓ Correo electrónico válido</li>
              <li>✓ Contraseña de al menos 8 caracteres</li>
              <li>✓ Ser mayor de 16 años</li>
              <li>✓ Datos personales completos y correctos</li>
            </ul>
          </div>

          {/* Botón de desarrollo para limpiar formulario */}
          {process.env.NODE_ENV === 'development' && (
            <button 
              type="button" 
              onClick={limpiarFormulario}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.8rem'
              }}
            >
              🧹 Limpiar Formulario (Dev)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Registro;