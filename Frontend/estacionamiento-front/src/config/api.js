// CONFIGURACIÓN DE API - CENTRALIZADA


// 🔧 CONFIGURACIÓN PRINCIPAL - CAMBIA AQUÍ LA IP DEL BACKEND
const API_CONFIG_MAIN = {
  // Cambiar esta IP por la IP de la PC donde está el backend
  BACKEND_IP: 'localhost', // CAMBIAR AQUÍ IP
  BACKEND_PORT: 8000,
  USE_HTTPS: false, // true para HTTPS, false para HTTP
  
  // Configuración adicional
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// ================================
// FUNCIÓN PARA OBTENER URL BASE
// ================================
const getApiBaseUrl = () => {
  const { BACKEND_IP, BACKEND_PORT, USE_HTTPS } = API_CONFIG_MAIN;
  const protocol = USE_HTTPS ? 'https' : 'http';
  
  // Si es localhost o 127.0.0.1, usar tal como está
  if (BACKEND_IP === 'localhost' || BACKEND_IP === '127.0.0.1') {
    return `${protocol}://${BACKEND_IP}:${BACKEND_PORT}`;
  }
  
  // Para IPs de red local o externa
  return `${protocol}://${BACKEND_IP}:${BACKEND_PORT}`;
};

// URL base para todas las peticiones
export const API_BASE_URL = getApiBaseUrl();

// Función para obtener URL del WebSocket
const getWebSocketUrl = () => {
  const { BACKEND_IP, BACKEND_PORT, USE_HTTPS } = API_CONFIG_MAIN;
  const protocol = USE_HTTPS ? 'wss' : 'ws';
  
  if (BACKEND_IP === 'localhost' || BACKEND_IP === '127.0.0.1') {
    return `${protocol}://${BACKEND_IP}:${BACKEND_PORT}`;
  }
  
  return `${protocol}://${BACKEND_IP}:${BACKEND_PORT}`;
};

export const WEBSOCKET_BASE_URL = getWebSocketUrl();

// ================================
// ENDPOINTS DE LA API
// ================================
export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: '/login/',
  REGISTER: '/usuarios/',
  VERIFY_CODE: '/verificar-codigo/',
  LOGOUT: '/logout/',
  VERIFY_TOKEN: '/verify-token/',
  REFRESH_TOKEN: '/refresh-token/',
  
  // Usuarios
  USERS: '/usuarios/',
  USER_PROFILE: '/usuarios/profile/',
  USER_BY_ID: (id) => `/usuarios/${id}/`,
  
  // Vehículos
  VEHICLES: '/vehiculos/',
  VEHICLE_BY_PLACA: (placa) => `/vehiculos/${placa}/`,
  USER_VEHICLES: (cedula) => `/vehiculos/usuario/${cedula}/`, // Corregido
  VEHICLE_DETAIL: (placa) => `/vehiculos/${placa}/`,
  
  // Lugares
  PLACES: '/lugares/',
  PLACE_BY_NUMBER: (numero) => `/lugares/${numero}/`,
  AVAILABLE_PLACES: '/ingresovehiculos/lugares-disponibles/',
  PLACE_TYPES: '/lugares/tipos/',
  
  // Ingresos de vehículos
  PARKING_ENTRIES: '/ingresovehiculos/',
  ENTRY_BY_ID: (id) => `/ingresovehiculos/${id}/`,
  ACTIVE_ENTRIES: '/ingresovehiculos/activos/',
  USER_ENTRIES: (userId) => `/usuarios/${userId}/ingresos/`,
  VEHICLE_ENTRIES: (placa) => `/vehiculos/${placa}/ingresos/`,
  
  
  // Reportes
  REPORTS: '/reportes/',
  USER_REPORT: (userId) => `/reportes/usuario/${userId}/`,
  PARKING_STATS: '/reportes/estadisticas/',
  DAILY_REPORT: '/reportes/diario/',
  MONTHLY_REPORT: '/reportes/mensual/',
  
  // WebSocket
  WS_STATUS: '/ws/estado/',
  
  // Utilidades
  PING: '/ping/',
  HEALTH: '/health/',
};

// ================================
// CONFIGURACIONES ADICIONALES
// ================================
export const API_CONFIG = {
  TIMEOUT: API_CONFIG_MAIN.TIMEOUT,
  RETRY_ATTEMPTS: API_CONFIG_MAIN.RETRY_ATTEMPTS,
  RETRY_DELAY: API_CONFIG_MAIN.RETRY_DELAY,
};

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Headers con autenticación
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    ...DEFAULT_HEADERS,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ================================
// CÓDIGOS DE ESTADO HTTP
// ================================
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// ================================
// MENSAJES DE ERROR
// ================================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet.',
  SERVER_ERROR: 'Error del servidor. Intente nuevamente más tarde.',
  TIMEOUT_ERROR: 'La solicitud tardó demasiado. Intente nuevamente.',
  UNAUTHORIZED: 'No está autorizado para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  VALIDATION_ERROR: 'Los datos proporcionados no son válidos.',
};

// ================================
// CONFIGURACIÓN DE DESARROLLO
// ================================
export const DEV_CONFIG = {
  ENABLE_LOGS: process.env.NODE_ENV === 'development',
  MOCK_DELAY: 500, // Simular delay de red en desarrollo
};

// ================================
// FUNCIONES HELPER
// ================================

// Construir URLs completas
export const buildUrl = (endpoint, params = {}) => {
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Agregar parámetros de consulta si existen
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
};

// Logs para desarrollo
export const logApiCall = (method, url, data = null) => {
  if (DEV_CONFIG.ENABLE_LOGS) {
    console.group(`🔗 API Call: ${method.toUpperCase()}`);
    console.log('🌐 URL:', url);
    console.log('🏠 Base URL:', API_BASE_URL);
    if (data) console.log('📦 Data:', data);
    console.groupEnd();
  }
};

// Función para hacer peticiones HTTP con configuración centralizada
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: options.requiresAuth ? getAuthHeaders() : DEFAULT_HEADERS,
    timeout: API_CONFIG.TIMEOUT,
    ...options,
  };

  logApiCall(config.method || 'GET', url, config.body);

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('❌ Error en petición API:', error);
    throw error;
  }
};

// ================================
// INFORMACIÓN DE CONFIGURACIÓN
// ================================
export const getConfigInfo = () => {
  return {
    API_BASE_URL,
    WEBSOCKET_BASE_URL,
    BACKEND_IP: API_CONFIG_MAIN.BACKEND_IP,
    BACKEND_PORT: API_CONFIG_MAIN.BACKEND_PORT,
    USE_HTTPS: API_CONFIG_MAIN.USE_HTTPS,
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  };
};

// Log de configuración al cargar
if (DEV_CONFIG.ENABLE_LOGS) {
  console.group('🔧 Configuración de API cargada');
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('📡 WebSocket URL:', WEBSOCKET_BASE_URL);
  console.log('🖥️ Backend IP:', API_CONFIG_MAIN.BACKEND_IP);
  console.log('🔌 Puerto:', API_CONFIG_MAIN.BACKEND_PORT);
  console.log('🔒 HTTPS:', API_CONFIG_MAIN.USE_HTTPS ? 'Sí' : 'No');
  console.groupEnd();
}