import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Realizar login del usuario
   */
  async login(credentials) {
    try {
      const { cedula, correo, contraseña } = credentials;

      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula, correo, contraseña }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Login exitoso',
          requiresVerification: true,
          user: data.user || null
        };
      } else {
        return {
          success: false,
          message: data.error || 'Credenciales incorrectas'
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error de conexión. Verifique su conexión a internet.'
      };
    }
  }

  /**
   * Verificar código de 2FA
   */
  async verifyCode(correo, codigo) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.VERIFY_CODE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, codigo }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Código verificado exitosamente',
          token: data.token || null,
          user: data.user || null
        };
      } else {
        return {
          success: false,
          message: data.error || 'Código incorrecto o expirado'
        };
      }
    } catch (error) {
      console.error('Error en verificación:', error);
      return {
        success: false,
        message: 'Error al verificar el código'
      };
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Usuario registrado exitosamente',
          user: data
        };
      } else {
        return {
          success: false,
          message: data.error || 'Error al registrar usuario'
        };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: 'Error de conexión. Verifique su conexión a internet.'
      };
    }
  }

  /**
   * Verificar si el token es válido
   */
  async verifyToken(token) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.VERIFY_TOKEN}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }

  /**
   * Refrescar token de autenticación
   */
  async refreshToken(refreshToken) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          token: data.access_token,
          refreshToken: data.refresh_token
        };
      } else {
        return {
          success: false,
          message: 'Error al refrescar token'
        };
      }
    } catch (error) {
      console.error('Error refrescando token:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Logout del usuario
   */
  async logout() {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        await fetch(`${this.baseURL}${API_ENDPOINTS.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Limpiar datos locales
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');

      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      // Aun así limpiar datos locales
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      return { success: true }; // No importa si falla el servidor
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    const user = this.getCurrentUser();
    const token = localStorage.getItem('authToken');
    return !!(user && token);
  }

  /**
   * Obtener headers con autorización
   */
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
}

export const authService = new AuthService();