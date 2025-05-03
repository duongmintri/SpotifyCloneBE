import React from 'react';
import ReactDOM from 'react-dom';
import '../../styles/ConfirmModal.css';

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return ReactDOM.createPortal(
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-modal-content">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-actions">
          <button 
            className="confirm-modal-btn confirm-btn"
            onClick={onConfirm}
          >
            Xác nhận
          </button>
          <button 
            className="confirm-modal-btn cancel-btn"
            onClick={onCancel}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;