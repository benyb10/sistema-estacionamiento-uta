import '../styles/pages/Login.css';
import React, { useState, useEffect } from 'react';
import logoUTA from '../assets/images/UTA.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ModalVerificacion from '../components/common/ModalVerificacion';
// 🚀 Importar la configuración centralizada
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_HEADERS, logApiCall } from '../config/api';

function Login() {
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState(''); // 'exito' o 'error'
  const [contraseña, setContraseña] = useState('');
  const [mostrarModalCodigo, setMostrarModalCodigo] = useState(false);
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validFields, setValidFields] = useState({});
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const { completeLogin } = useAuth(); // ✅ Usar la nueva función

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        setMensaje('');
        setTipoMensaje('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // Validación en tiempo real
  const validarCampo = (campo, valor) => {
    const nuevosErrors = { ...errors };
    const nuevosValidos = { ...validFields };

    switch (campo) {
      case 'cedula':
        if (valor.length === 10 && /^\d+$/.test(valor)) {
          delete nuevosErrors.cedula;
          nuevosValidos.cedula = true;
        } else {
          nuevosErrors.cedula = 'Cédula debe tener 10 dígitos';
          delete nuevosValidos.cedula;
        }
        break;
      case 'correo':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(valor)) {
          delete nuevosErrors.correo;
          nuevosValidos.correo = true;
        } else {
          nuevosErrors.correo = 'Formato de correo inválido';
          delete nuevosValidos.correo;
        }
        break;
      case 'contraseña':
        if (valor.length >= 1) {
          delete nuevosErrors.contraseña;
          nuevosValidos.contraseña = true;
        } else {
          nuevosErrors.contraseña = 'Contraseña muy corta';
          delete nuevosValidos.contraseña;
        }
        break;
      default:
        break;
    }

    setErrors(nuevosErrors);
    setValidFields(nuevosValidos);
  };

  const manejarCambio = (campo, valor) => {
    switch (campo) {
      case 'cedula':
        // Solo permitir números y máximo 10 dígitos
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
      default:
        break;
    }
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje('');

    // Validación final
    if (Object.keys(errors).length > 0) {
      setMensaje('❌ Por favor corrige los errores en el formulario');
      setTipoMensaje('error');
      setIsLoading(false);
      return;
    }

    try {
      // 🚀 Usar la URL centralizada
      const url = `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`;
      
      // 🚀 Log para desarrollo
      logApiCall('POST', url, { cedula, correo, contraseña: '***' });

      const response = await fetch(url, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ cedula, correo, contraseña }),
      });

      if (response.ok) {
        setMostrarModalCodigo(true);
        setMensaje('✅ Credenciales correctas. Se ha enviado un código a su correo.');
        setTipoMensaje('exito');
      } else {
        const errorData = await response.json();
        setMensaje(`❌ ${errorData.error || 'Credenciales incorrectas. Verifique sus datos.'}`);
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

  // ✅ Función actualizada para verificar código
  const verificarCodigo = async () => {
    if (!codigoVerificacion || codigoVerificacion.length !== 6) {
      setMensaje('❌ El código debe tener 6 dígitos');
      setTipoMensaje('error');
      return;
    }

    try {
      // 🚀 Usar la URL centralizada
      const url = `${API_BASE_URL}${API_ENDPOINTS.VERIFY_CODE}`;
      
      // 🚀 Log para desarrollo
      logApiCall('POST', url, { correo, codigo: codigoVerificacion });

      const response = await fetch(url, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ correo, codigo: codigoVerificacion }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje('✅ ¡Bienvenido! Redirigiendo al sistema...');
        setTipoMensaje('exito');
        setMostrarModalCodigo(false);
        
        // ✅ Crear objeto usuario completo
        const userData = { 
          cedula, 
          correo,
          nombre: data.user?.nombre || `Usuario ${cedula}`,
          categoria: data.user?.categoria || 'ESTUDIANTE',
          fechaLogin: new Date().toISOString()
        };
        
        // ✅ Usar la nueva función completeLogin del AuthContext
        const loginResult = completeLogin(userData, data.token);

        if (loginResult.success) {
          console.log('✅ Login completado exitosamente');
          
          // Redireccionar al dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          setMensaje('❌ Error al inicializar sesión. Intente nuevamente.');
          setTipoMensaje('error');
        }
      } else {
        setMensaje(`❌ ${data.error || 'Código incorrecto o expirado. Intente nuevamente.'}`);
        setTipoMensaje('error');
      }
    } catch (error) {
      console.error('❌ Error en verificación de código:', error);
      setMensaje('❌ Error al verificar el código. Intente nuevamente.');
      setTipoMensaje('error');
    }
  };

  const redirigirRegistro = () => {
    navigate('/');
  };

  const volverHome = () => {
    navigate('/');
  };

  const limpiarFormulario = () => {
    setCedula('');
    setCorreo('');
    setContraseña('');
    setMensaje('');
    setTipoMensaje('');
    setErrors({});
    setValidFields({});
  };

  return (
    <>
      <ModalVerificacion
        mostrar={mostrarModalCodigo}
        codigoVerificacion={codigoVerificacion}
        setCodigoVerificacion={setCodigoVerificacion}
        cerrar={() => {
          setMostrarModalCodigo(false);
          setCodigoVerificacion('');
        }}
        verificar={verificarCodigo}
        correo={correo}
      />
      
      <div className="login-fondo">
        <div className="login-container">
          <div className="login-box">
            <div className="login-logo">
              <img src={logoUTA} alt="Universidad Técnica de Ambato" />
              <h2>Sistema de Estacionamiento</h2>
              <p>Universidad Técnica de Ambato<br />Facultad de Ingeniería en Sistemas</p>
              
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

            <form className="login-form" onSubmit={manejarLogin}>
              <div className="input-group">
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

              <div className="input-group">
                <input
                  type="email"
                  placeholder="Correo electrónico institucional"
                  value={correo}
                  onChange={(e) => manejarCambio('correo', e.target.value)}
                  className={errors.correo ? 'invalid' : validFields.correo ? 'valid' : ''}
                  required
                />
                {errors.correo && <small className="error-text">{errors.correo}</small>}
              </div>

              <div className="input-group">
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={contraseña}
                  onChange={(e) => manejarCambio('contraseña', e.target.value)}
                  className={errors.contraseña ? 'invalid' : validFields.contraseña ? 'valid' : ''}
                  required
                />
                {errors.contraseña && <small className="error-text">{errors.contraseña}</small>}
              </div>

              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading || Object.keys(errors).length > 0}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Verificando...
                  </>
                ) : (
                  '🔐 Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Mensajes de estado */}
            {mensaje && (
              <div className={`mensaje ${tipoMensaje}`}>
                <p>{mensaje}</p>
              </div>
            )}

            <div className="login-links">
              <button type="button" className="link-button" onClick={redirigirRegistro}>
                📝 ¿No tienes cuenta? Regístrate
              </button>
              <button type="button" className="link-button" onClick={volverHome}>
                🏠 Volver al inicio
              </button>
              <button type="button" className="link-button secondary" onClick={limpiarFormulario}>
                🧹 Limpiar formulario
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;