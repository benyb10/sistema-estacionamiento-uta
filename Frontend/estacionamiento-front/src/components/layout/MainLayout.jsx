import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Header from '../common/Header';
import Sidebar from './Slidebar';
import Footer from '../common/Footer';
import '../../styles/components/Layout.css';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="main-layout">
      <Header 
        user={user} 
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="layout-content">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default MainLayout;