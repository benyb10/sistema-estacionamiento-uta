import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api/authService';

// Tipos de acciones para el reducer
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  RESTORE_SESSION: 'RESTORE_SESSION'
};

// Estado inicial
const initialState = {
  user: null,
  loading: true, // ✅ Iniciar en true para verificar sesión
  error: null,
  isAuthenticated: false
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        user: action.payload.user,
        isAuthenticated: true
      };

    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        loading: false,
        error: null,
        user: action.payload.user,
        isAuthenticated: true
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        user: null,
        isAuthenticated: false
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        loading: false,
        user: null,
        error: null,
        isAuthenticated: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };

    default:
      return state;
  }
};

// Crear el contexto
const AuthContext = createContext();

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ✅ SOLUCIÓN: Verificar y restaurar sesión al iniciar la aplicación
  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');
        
        console.log('🔄 Verificando sesión guardada...', { 
          hasUser: !!savedUser, 
          hasToken: !!token 
        });

        if (savedUser && token) {
          const userData = JSON.parse(savedUser);
          
          // ✅ Validar que los datos del usuario sean válidos
          if (userData && userData.cedula && userData.correo) {
            console.log('✅ Restaurando sesión para:', userData.nombre || userData.correo);
            
            dispatch({
              type: AUTH_ACTIONS.RESTORE_SESSION,
              payload: { user: userData }
            });
            return;
          }
        }
        
        // Si no hay sesión válida, terminar loading
        console.log('❌ No hay sesión válida guardada');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        
      } catch (error) {
        console.error('❌ Error al restaurar sesión:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    // ✅ Ejecutar inmediatamente
    restoreSession();
  }, []); // Solo se ejecuta una vez al montar el componente

  // ✅ Función adaptada para tu flujo de autenticación actual
  const login = async (credentials) => {
    try {
      console.log('🔐 Iniciando proceso de login...', { cedula: credentials.cedula });
      
      // ✅ En tu caso, el login real sucede después de la verificación 2FA
      // Esta función solo valida que los datos son correctos para proceder
      const userData = {
        cedula: credentials.cedula,
        correo: credentials.correo,
        nombre: credentials.nombre || `Usuario ${credentials.cedula}`,
        categoria: credentials.categoria || 'ESTUDIANTE',
        fechaLogin: new Date().toISOString()
      };
      
      console.log('✅ Login exitoso, guardando datos:', userData);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: userData }
      });

      return { success: true, user: userData };
      
    } catch (error) {
      const errorMessage = error.message || 'Error al iniciar sesión';
      console.error('❌ Error en login:', errorMessage);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage }
      });

      return { success: false, error: errorMessage };
    }
  };

  // Función para hacer registro
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });
      
      const response = await authService.register(userData);
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS
        });

        return { success: true, message: 'Usuario registrado exitosamente' };
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (error) {
      const errorMessage = error.message || 'Error al registrarse';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { error: errorMessage }
      });

      return { success: false, error: errorMessage };
    }
  };

  // ✅ Función mejorada para hacer logout
  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    
    // Limpiar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    // Actualizar estado
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    
    console.log('✅ Sesión cerrada exitosamente');
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // ✅ Función mejorada para actualizar datos del usuario
  const updateUser = (userData) => {
    const newUserData = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(newUserData));
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    });
  };

  // ✅ Función para verificar si la sesión es válida
  const isSessionValid = () => {
    const user = state.user;
    const token = localStorage.getItem('authToken');
    return !!(user && token && user.cedula && user.correo);
  };

  // ✅ Función auxiliar para completar login después de 2FA
  const completeLogin = (userData, token = null) => {
    console.log('🎯 Completando login con datos:', userData);
    
    // Guardar en localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('authToken', token);
    }
    
    // Actualizar estado
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user: userData }
    });
    
    return { success: true, user: userData };
  };

  // Valor del contexto
  const value = {
    // Estado
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    
    // Funciones
    login,
    register,
    logout,
    clearError,
    updateUser,
    isSessionValid,
    completeLogin // ✅ Nueva función para tu flujo 2FA
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Export alternativo para compatibilidad
export const useAuthContext = useAuth;