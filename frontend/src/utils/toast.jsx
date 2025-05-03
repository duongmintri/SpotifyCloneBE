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
  document.body.appendChild(modalContainer);
  
  // Tạo root một lần
  const root = createRoot(modalContainer);
  
  // Hàm để xóa modal sau khi đóng
  const removeModal = () => {
    root.unmount();
    document.body.removeChild(modalContainer);
  };
  
  // Render modal sử dụng createRoot
  root.render(
    <ConfirmModal 
      message={message} 
      onConfirm={() => {
        removeModal();
        onConfirm();
      }} 
      onCancel={() => {
        removeModal();
        if (onCancel) onCancel();
      }} 
    />
  );
};
