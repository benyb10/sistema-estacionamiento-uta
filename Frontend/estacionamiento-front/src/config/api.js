// Configuración de la API

// URL base de la API
const getApiBaseUrl = () => {
  // Detectar automáticamente la URL del servidor Django
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Para desarrollo
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:8000`;
  }
  
  // Para producción o red local
  return `${protocol}//${hostname}:8000`;
};

export const API_BASE_URL = getApiBaseUrl();

// Endpoints de la API
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
  USER_VEHICLES: (userId) => `/usuarios/${userId}/vehiculos/`,
  
  // Lugares
  PLACES: '/lugares/',
  PLACE_BY_NUMBER: (numero) => `/lugares/${numero}/`,
  AVAILABLE_PLACES: '/lugares/disponibles/',
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

// Configuración de timeouts
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Códigos de estado HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Mensajes de error por defecto
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet.',
  SERVER_ERROR: 'Error del servidor. Intente nuevamente más tarde.',
  TIMEOUT_ERROR: 'La solicitud tardó demasiado. Intente nuevamente.',
  UNAUTHORIZED: 'No está autorizado para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  VALIDATION_ERROR: 'Los datos proporcionados no son válidos.',
};

// Configuración de desarrollo
export const DEV_CONFIG = {
  ENABLE_LOGS: process.env.NODE_ENV === 'development',
  MOCK_DELAY: 500, // Simular delay de red en desarrollo
};

// Función helper para construir URLs
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

// Función helper para logs de desarrollo
export const logApiCall = (method, url, data = null) => {
  if (DEV_CONFIG.ENABLE_LOGS) {
    console.group(`🔗 API Call: ${method.toUpperCase()}`);
    console.log('URL:', url);
    if (data) console.log('Data:', data);
    console.groupEnd();
  }
};