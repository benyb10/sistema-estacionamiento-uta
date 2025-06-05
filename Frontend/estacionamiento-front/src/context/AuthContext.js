import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay usuario guardado al cargar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');
        
        if (savedUser && token) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          // Opcional: Verificar token válido con el servidor
          // await authService.verifyToken(token);
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        logout(); // Limpiar datos inválidos
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        const userData = {
          cedula: credentials.cedula,
          correo: credentials.correo,
          nombre: response.user?.nombre || 'Usuario',
          categoria: response.user?.categoria || 'ESTUDIANTE',
          fechaLogin: new Date().toISOString()
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Error de autenticación');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      if (response.success) {
        return { success: true, message: 'Usuario registrado exitosamente' };
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};