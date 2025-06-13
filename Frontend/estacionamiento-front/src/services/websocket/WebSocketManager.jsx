import React, { useEffect, useRef, useState } from 'react';
// 🚀 Importar la configuración centralizada
import { API_BASE_URL, API_ENDPOINTS, logApiCall } from '../../config/api';
import '../../styles/components/Modal.css';

const WebSocketManager = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(true);
  const [intentos, setIntentos] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [lastError, setLastError] = useState('');
  const reconnectTimeoutRef = useRef(null);
  const initialCheckRef = useRef(true);

  useEffect(() => {
    console.log("🚀 Iniciando WebSocketManager...");
    checkServerAndConnect();

    return () => {
      console.log("🧹 Limpiando WebSocketManager...");
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Efecto para controlar la visualización del modal
  useEffect(() => {
    const shouldShow = !serverAvailable && !connected && !initialCheckRef.current;
    console.log(`📱 Modal state: serverAvailable=${serverAvailable}, connected=${connected}, initialCheck=${initialCheckRef.current}, shouldShow=${shouldShow}`);
    
    if (shouldShow && !showModal) {
      console.log("📱 Mostrando modal de conexión perdida");
      setShowModal(true);
    } else if (serverAvailable && connected && showModal) {
      console.log("📱 Ocultando modal - conexión restaurada");
      setShowModal(false);
      setIntentos(0);
    }
  }, [serverAvailable, connected, showModal]);

  const checkServerAndConnect = async () => {
    try {
      // 🚀 Usar la URL centralizada para el ping
      const pingUrl = `${API_BASE_URL}${API_ENDPOINTS.PING}`;
      
      console.log(`🔍 Verificando servidor en: ${pingUrl}`);
      logApiCall('GET', pingUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Más tiempo para conexiones lentas
      
      const response = await fetch(pingUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);

      console.log(`📡 Respuesta del servidor: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Servidor disponible:", data);
        setServerAvailable(true);
        setLastError('');
        
        // Dar un momento antes de conectar WebSocket
        setTimeout(() => {
          conectarWebSocket();
        }, 100);
        
        initialCheckRef.current = false;
      } else {
        throw new Error(`Servidor respondió con: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log("❌ Servidor no disponible:", error.message);
      setLastError(error.message);
      
      if (error.name === 'AbortError') {
        console.log("⏰ Timeout: El servidor tardó más de 8 segundos en responder");
        setLastError('Timeout de conexión');
      }
      
      setServerAvailable(false);
      setConnected(false);
      initialCheckRef.current = false;
      
      // Esperar un poco antes de programar reconexión para que se vea el modal
      setTimeout(() => {
        scheduleReconnect();
      }, 1000);
    }
  };

  const conectarWebSocket = () => {
    try {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        console.log("🔗 WebSocket ya está conectado");
        setConnected(true);
        return;
      }

      // 🚀 Construir URL de WebSocket usando la configuración centralizada
      // Extraer host y puerto de API_BASE_URL y convertir a WS
      const apiUrl = new URL(API_BASE_URL);
      const protocolo = apiUrl.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${protocolo}://${apiUrl.host}/ws/estado/`;
      
      console.log(`🔌 Conectando WebSocket a: ${wsUrl}`);
      
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("✅ Conectado al servidor WebSocket");
        setConnected(true);
        setServerAvailable(true);
        setIntentos(0);
        setLastError('');
        
        // Enviar ping inicial
        socket.send(JSON.stringify({
          type: 'ping',
          message: 'Cliente conectado',
          timestamp: Date.now()
        }));
      };

      socket.onclose = (event) => {
        console.log(`❌ WebSocket desconectado. Código: ${event.code}, Razón: ${event.reason}`);
        setConnected(false);
        
        // Si no fue un cierre limpio, marcar servidor como no disponible
        if (event.code !== 1000) {
          setServerAvailable(false);
          setLastError(`Conexión cerrada: ${event.code}`);
          scheduleReconnect();
        }
      };

      socket.onerror = (error) => {
        console.log("❌ Error en WebSocket:", error);
        setConnected(false);
        setServerAvailable(false);
        setLastError('Error de WebSocket');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 Mensaje WebSocket:", data);
          
          // Responder a pings del servidor
          if (data.type === 'ping') {
            socket.send(JSON.stringify({
              type: 'pong',
              message: 'Cliente activo',
              timestamp: Date.now()
            }));
            console.log("🏓 Pong enviado al servidor");
          }
        } catch (error) {
          console.log("❌ Error procesando mensaje:", error);
        }
      };

      socketRef.current = socket;
    } catch (error) {
      console.log("❌ Error creando WebSocket:", error);
      setConnected(false);
      setServerAvailable(false);
      setLastError(`Error creando WebSocket: ${error.message}`);
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Aumentar el delay para que el modal sea visible
    const delay = Math.min(15000, 3000 + (2000 * intentos)); // Mínimo 3s, máximo 15s
    console.log(`🔄 Reintentando en ${Math.round(delay/1000)}s... Intento #${intentos + 1}`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setIntentos(prev => prev + 1);
      checkServerAndConnect();
    }, delay);
  };

  // Mostrar modal solo si hay problemas reales de conexión
  const shouldShowModal = showModal && !serverAvailable && !connected;

  return (
    <>
      {shouldShowModal && (
        <div className="modal-conexion">
          <div className="modal-contenido-conexion">
            <h3>
              <span className="status-indicator"></span>
              Conexión perdida
            </h3>
            <p><strong>El servidor no está disponible</strong></p>
            <p>Reintentando conexión automáticamente...</p>
            <p>Intento #{intentos} de reconexión</p>
            {lastError && (
              <p style={{fontSize: '0.9rem', opacity: 0.8}}>
                Error: {lastError}
              </p>
            )}
            
            {/* 🚀 Mostrar URL de conexión en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <small style={{ 
                display: 'block', 
                marginTop: '8px', 
                color: '#666', 
                fontSize: '0.8rem' 
              }}>
                🔗 Intentando conectar a: {API_BASE_URL}
              </small>
            )}
            
            <div className="loading-spinner"></div>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default WebSocketManager;