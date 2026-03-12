import React, { useEffect } from 'react';
import { FaExclamationCircle, FaTimes } from 'react-icons/fa';
import '../../styles/Popup.css';

const Popup = ({ message, type = 'error', onClose, duration = 3000 }) => {
  useEffect(() => {
    // Auto close after duration
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`popup-overlay ${type}`} onClick={onClose}>
      <div className="popup-container" onClick={e => e.stopPropagation()}>
        <div className="popup-content">
          <div className="popup-icon">
            <FaExclamationCircle />
          </div>
          <div className="popup-message">
            <h4>Validation Error</h4>
            <p>{message}</p>
          </div>
          <button className="popup-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="popup-progress-bar">
          <div className="progress" style={{ animationDuration: `${duration}ms` }}></div>
        </div>
      </div>
    </div>
  );
};

export default Popup;