import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/components/Slidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      section: 'Principal',
      items: [
        {
          path: '/dashboard',
          label: 'Dashboard',
          icon: '🏠',
          description: 'Panel principal del sistema'
        }
      ]
    },
    {
      section: 'Estacionamiento',
      items: [
        {
          path: '/parking/entry',
          label: 'Registrar Entrada',
          icon: '🚗',
          description: 'Ingreso de vehículos'
        },
        {
          path: '/parking/exit',
          label: 'Registrar Salida',
          icon: '🚙',
          description: 'Salida de vehículos'
        },
        {
          path: '/parking/status',
          label: 'Estado del Parqueadero',
          icon: '📊',
          description: 'Consultar disponibilidad'
        },
        {
          path: '/parking/reports',
          label: 'Reportes',
          icon: '📈',
          description: 'Informes y estadísticas'
        }
      ]
    },
    {
      section: 'Mis Vehículos',
      items: [
        {
          path: '/vehicles/my-vehicles',
          label: 'Gestionar Vehículos',
          icon: '🚗',
          description: 'Mis vehículos registrados'
        }
      ]
    },
    {
      section: 'Administración',
      items: [
        {
          path: '/admin/users',
          label: 'Gestión de Usuarios',
          icon: '👥',
          description: 'Administrar usuarios del sistema',
          adminOnly: true
        },
        {
          path: '/admin/vehicles',
          label: 'Gestión de Vehículos',
          icon: '🚐',
          description: 'Administrar vehículos registrados',
          adminOnly: true
        },
        {
          path: '/admin/places',
          label: 'Gestión de Espacios',
          icon: '🅿️',
          description: 'Administrar espacios de estacionamiento',
          adminOnly: true
        }
      ]
    },
    {
      section: 'Perfil',
      items: [
        {
          path: '/profile',
          label: 'Mi Perfil',
          icon: '👤',
          description: 'Información personal'
        },
        {
          path: '/settings',
          label: 'Configuración',
          icon: '⚙️',
          description: 'Preferencias del sistema'
        }
      ]
    }
  ];

  // Filtrar elementos según permisos del usuario
  const filteredMenuItems = menuItems.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.adminOnly) {
        return user?.categoria === 'ADMINISTRADOR' || user?.role === 'admin';
      }
      return true;
    })
  })).filter(section => section.items.length > 0);

  return (
    <>
      {/* Overlay para cerrar sidebar en móvil */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Header del sidebar */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">🎓</div>
            <div className="logo-text">
              <span className="logo-title">UTA</span>
              <span className="logo-subtitle">Estacionamiento</span>
            </div>
          </div>
          
          <button className="sidebar-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>

        {/* Información del usuario */}
        <div className="sidebar-user">
          <div className="user-avatar">
            <span>{user?.nombre?.charAt(0) || user?.correo?.charAt(0) || 'U'}</span>
          </div>
          <div className="user-details">
            <div className="user-name">{user?.nombre || 'Usuario'}</div>
            <div className="user-role">{user?.categoria || 'ESTUDIANTE'}</div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav">
          {filteredMenuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              <div className="nav-section-title">{section.section}</div>
              
              <ul className="nav-list">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="nav-item">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => 
                        `nav-link ${isActive ? 'nav-link-active' : ''}`
                      }
                      onClick={onClose}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <div className="nav-content">
                        <span className="nav-label">{item.label}</span>
                        <span className="nav-description">{item.description}</span>
                      </div>
                      {location.pathname === item.path && (
                        <div className="nav-indicator"></div>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="sidebar-footer">
          <div className="footer-info">
            <div className="footer-title">Sistema UTA</div>
            <div className="footer-version">v2.0.0</div>
          </div>
          
          <div className="footer-links">
            <button 
              className="footer-link"
              onClick={() => alert('🆘 Centro de Ayuda\n\nPara soporte técnico:\n📧 soporte.ti@uta.edu.ec\n📞 (03) 2521-081 ext. 123')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z"/>
              </svg>
              Ayuda
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;