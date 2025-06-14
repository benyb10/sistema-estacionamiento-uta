import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/globals/Loading.css';

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

// ✅ Componente mejorado para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  console.log('🛡️ ProtectedRoute check:', { 
    user: !!user, 
    loading, 
    isAuthenticated,
    userDetails: user?.nombre || user?.correo 
  });
  
  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <div className="loading-container" style={loadingStyles}>
        <div className="loading-spinner" style={spinnerStyles}></div>
        <p className="loading-text">Verificando sesión...</p>
      </div>
    );
  }
  
  // ✅ Verificar tanto user como isAuthenticated
  if (!user || !isAuthenticated) {
    console.log('❌ Acceso denegado - Redirigiendo a login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ Acceso permitido para:', user.nombre || user.correo);
  return children;
};

// ✅ Componente mejorado para rutas públicas (solo si NO está autenticado)
const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  console.log('🌐 PublicRoute check:', { 
    user: !!user, 
    loading, 
    isAuthenticated 
  });
  
  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <div className="loading-container" style={loadingStyles}>
        <div className="loading-spinner" style={spinnerStyles}></div>
        <p className="loading-text">Cargando...</p>
      </div>
    );
  }
  
  // Si ya está autenticado, redirigir al dashboard
  if (user && isAuthenticated) {
    console.log('✅ Usuario autenticado - Redirigiendo a dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('✅ Acceso a ruta pública permitido');
  return children;
};

// ✅ Estilos para el loading
const loadingStyles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: 'var(--uta-white, #ffffff)',
  fontFamily: 'var(--font-family-base, Arial, sans-serif)'
};

const spinnerStyles = {
  width: '40px',
  height: '40px',
  border: '4px solid #f3f3f3',
  borderTop: '4px solid var(--uta-red-primary, #8B0000)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '20px'
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <div className="App">
            <Routes>
              {/* Rutas públicas */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <Home />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />

              {/* Rutas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Rutas de estacionamiento */}
              <Route 
                path="/parking/entry" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <EntryPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/parking/exit" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ExitPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/parking/status" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <StatusPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/parking/reports" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ReportsPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Rutas de administración */}
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <UsersPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/vehicles" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <VehiclesPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/places" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PlacesPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Rutas de perfil */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ProfilePage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <SettingsPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Rutas de vehículos */}
              <Route 
                path="/vehicles/my-vehicles" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MyVehiclesPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;