
import React from 'react';
import '../../styles/components/Modal.css';

const ModalVerificacion = ({ 
  mostrar, 
  codigoVerificacion, 
  setCodigoVerificacion, 
  cerrar, 
  verificar,
  correo 
}) => {
  if (!mostrar) return null;

  const handleInputChange = (e) => {
    const valor = e.target.value;
    // Solo permitir números y máximo 6 dígitos
    if (/^\d*$/.test(valor) && valor.length <= 6) {
      setCodigoVerificacion(valor);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (codigoVerificacion.length === 6) {
      verificar();
    }
  };

  return (
    <div className="modal" onClick={cerrar}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
               
        <h3>🔐 Verificación de Código</h3>
        
        <p style={{ 
          fontSize: '0.95rem', 
          color: 'var(--uta-gray-dark)', 
          marginBottom: '1.5rem',
          lineHeight: '1.5'
        }}>
          Se ha enviado un código de verificación de 6 dígitos a:<br />
          <strong style={{ color: 'var(--uta-red-primary)' }}>
            {correo}
          </strong>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ingresa el código de 6 dígitos"
            value={codigoVerificacion}
            onChange={handleInputChange}
            maxLength="6"
            style={{
              textAlign: 'center',
              fontSize: '1.5rem',
              letterSpacing: '0.5rem',
              fontWeight: '700'
            }}
            autoFocus
          />
          
          <button 
            type="submit"
            disabled={codigoVerificacion.length !== 6}
            style={{
              opacity: codigoVerificacion.length !== 6 ? 0.6 : 1,
              cursor: codigoVerificacion.length !== 6 ? 'not-allowed' : 'pointer'
            }}
          >
            ✅ Verificar Código
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(139, 0, 0, 0.05)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'var(--uta-gray-dark)'
        }}>
          <p><strong>💡 Consejos:</strong></p>
          <p>• Revisa tu bandeja de entrada y spam</p>
          <p>• El código expira en 10 minutos</p>
          <p>• Asegúrate de ingresar los 6 dígitos</p>
        </div>
      </div>
    </div>
  );
};

export default ModalVerificacion;