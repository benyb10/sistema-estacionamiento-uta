import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import WebSocketManager from './services/websocket/WebSocketManager';

// Páginas principales
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Páginas de estacionamiento
import EntryPage from './pages/parking/EntryPage';
import ExitPage from './pages/parking/ExitPage';
import StatusPage from './pages/parking/StatusPage';
import ReportsPage from './pages/parking/ReportsPage';

// Páginas de administración
import UsersPage from './pages/admin/UsersPage';
import VehiclesPage from './pages/admin/VehiclesPage';
import PlacesPage from './pages/admin/PlacesPage';

// Páginas de perfil
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/profile/SettingsPage';

// Páginas de vehículos
import MyVehiclesPage from './pages/vehicles/MyVehiclesPage';

// Layout principal
import MainLayout from './components/layout/MainLayout';

// Hooks
import { useAuth } from './hooks/useAuth';

// Estilos globales
import './styles/globals/reset.css';
import './styles/globals/variables.css';
import './styles/globals/typography.css';
import './styles/themes/uta-theme.css';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando...</p>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Componente para rutas públicas (solo si NO está autenticado)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando...</p>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <WebSocketManager>
            <div className="app">
              <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={
                  <PublicRoute>
                    <Home />
                  </PublicRoute>
                } />
                
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />

                {/* Rutas protegidas con layout */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } />

                {/* Páginas de estacionamiento */}
                <Route path="/parking/entry" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <EntryPage />
                    </MainLayout>
                  </ProtectedRoute>
                } />

                <Route path="/parking/exit" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ExitPage />
                    </MainLayout>
                  </ProtectedRoute>
                } />

                <Route path="/parking/status" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <StatusPage />
                    </MainLayout>
                  </ProtectedRoute>
                } />

                <Route path="/parking/reports" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ReportsPage />
                    </MainLayout>
                  </ProtectedRoute>
                } />

                {/* Páginas de administración */}
                <Route path="/admin/users" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <UsersPage />
                    </MainLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/vehicles" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <VehiclesPage />
                    </MainLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/places" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PlacesPage />
                    </MainLayout>
                  </ProtectedRoute>
                } />

                {/* Páginas de perfil */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ProfilePage />
                    </MainLayout>
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <SettingsPage />
                    </MainLayout>
                  </ProtectedRoute>
                } />

                {/* Páginas de vehículos */}
                <Route path="/vehicles/my-vehicles" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MyVehiclesPage />
                    </MainLayout>
                  </ProtectedRoute>
                } />

                {/* Ruta 404 */}
                <Route path="*" element={
                  <div className="not-found">
                    <h1>404 - Página no encontrada</h1>
                    <Link to="/dashboard">Volver al inicio</Link>
                  </div>
                } />
              </Routes>
            </div>
          </WebSocketManager>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;