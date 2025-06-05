import React from 'react';
import '../../styles/components/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-uta">
      <div className="footer-decorative-line"></div>
      
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-section">
            <h4>Universidad Técnica de Ambato</h4>
            <p>Sistema de Gestión de Estacionamiento</p>
            <p>Dirección de Tecnologías de la Información y Comunicación</p>
          </div>
          
          <div className="footer-section">
            <h4>Contacto</h4>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span>Av. Los Chasquis y Río Payamino - Campus Huachi</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <span>(03) 2521-081</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <span>soporte.estacionamiento@uta.edu.ec</span>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Soporte Técnico</h4>
            <div className="contact-item">
              <span className="contact-icon">🕒</span>
              <span>Lunes a Viernes: 8:00 - 17:00</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <span>Ext. 123 - Mesa de Ayuda</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🌐</span>
              <span>www.uta.edu.ec</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-legal">
            <p>© {currentYear} Universidad Técnica de Ambato. Todos los derechos reservados.</p>
            <p>Ambato - Ecuador | Sistema desarrollado por DTIC</p>
          </div>
          
          <div className="footer-links">
            <button 
              className="footer-link"
              onClick={() => alert('📋 Términos de Uso\n\nEste sistema está destinado exclusivamente para el uso de la comunidad universitaria de la UTA. El uso indebido puede resultar en la suspensión del acceso.')}
            >
              Términos de Uso
            </button>
            <button 
              className="footer-link"
              onClick={() => alert('🔒 Política de Privacidad\n\nLa información personal es tratada de acuerdo a la Ley Orgánica de Protección de Datos Personales del Ecuador.')}
            >
              Privacidad
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;