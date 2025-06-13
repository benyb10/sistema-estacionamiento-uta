import React, { useEffect } from 'react';
import '../../styles/components/Modal.css';

const Modal = ({ show, onClose, title, children, size = 'medium' }) => {
  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    
    if (show) {
      document.addEventListener('keydown', handleEsc, false);
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc, false);
      document.body.style.overflow = 'unset';
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div 
        className={`modal-contenido modal-${size}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
          </div>
        )}
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;