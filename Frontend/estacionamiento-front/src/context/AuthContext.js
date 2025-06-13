import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api/authService';

// Estado inicial
const initialState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false
};

// Tipos de acciones
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer para manejar el estado de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        loading: false,
        error: null,
        isAuthenticated: true
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        loading: false,
        error: action.payload.error,
        isAuthenticated: false
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
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

    default:
      return state;
  }
};

// Crear el contexto
const AuthContext = createContext();

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar si hay un token guardado al iniciar la aplicación
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');
        
        if (savedUser && token) {
          const userData = JSON.parse(savedUser);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: userData }
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        // Token inválido o expirado
        console.error('Error al inicializar autenticación:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // Función para hacer login
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        const userData = {
          cedula: credentials.cedula,
          correo: credentials.correo,
          nombre: response.user?.nombre || 'Usuario',
          categoria: response.user?.categoria || 'ESTUDIANTE',
          fechaLogin: new Date().toISOString()
        };
        
        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: userData }
        });

        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Error de autenticación');
      }
    } catch (error) {
      const errorMessage = error.message || 'Error al iniciar sesión';
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
          type: AUTH_ACTIONS.SET_LOADING,
          payload: false
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

  // Función para hacer logout
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Función para actualizar datos del usuario
  const updateUser = (userData) => {
    const newUserData = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(newUserData));
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    });
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
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto (versión original)
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Hook personalizado alternativo (para compatibilidad)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};