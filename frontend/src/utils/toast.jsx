import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/modals/ConfirmModal';
import { createRoot } from 'react-dom/client';

// Toast thành công
export const showSuccessToast = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
};

// Toast lỗi
export const showErrorToast = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
};

// Toast thông tin
export const showInfoToast = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
};

// Toast cảnh báo
export const showWarningToast = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
};

// Toast xác nhận (với modal đẹp hơn)
export const showConfirmToast = (message, onConfirm, onCancel) => {
  // Tạo div container cho modal
  const modalContainer = document.createElement('div');
  modalContainer.style.position = 'fixed';
  modalContainer.style.zIndex = '9999';
  modalContainer.style.top = '0';
  modalContainer.style.left = '0';
  modalContainer.style.width = '100%';
  modalContainer.style.height = '100%';
  document.body.appendChild(modalContainer);
  
  // Tạo root một lần
  const root = createRoot(modalContainer);
  
  // Hàm để xóa modal sau khi đóng
  const removeModal = () => {
    root.unmount();
    document.body.removeChild(modalContainer);
  };
  
  // Tạo component modal inline để tránh xung đột CSS
  const ConfirmModalInline = () => {
    const overlayStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    };
    
    const modalStyle = {
      backgroundColor: '#282828',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '400px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
    };
    
    const contentStyle = {
      marginBottom: '20px',
      color: 'white',
      fontSize: '16px'
    };
    
    const actionsStyle = {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px'
    };
    
    const confirmBtnStyle = {
      padding: '8px 16px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: '#1db954',
      color: 'white',
      transition: 'all 0.2s ease'
    };
    
    const cancelBtnStyle = {
      padding: '8px 16px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.2s ease'
    };
    
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>
          <div style={contentStyle}>
            <p>{message}</p>
          </div>
          <div style={actionsStyle}>
            <button 
              style={confirmBtnStyle}
              onClick={() => {
                removeModal();
                onConfirm();
              }}
            >
              Xác nhận
            </button>
            <button 
              style={cancelBtnStyle}
              onClick={() => {
                removeModal();
                if (onCancel) onCancel();
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render modal sử dụng createRoot
  root.render(<ConfirmModalInline />);
};
