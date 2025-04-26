import { toast } from 'react-toastify';

// Thông báo thành công
export const showSuccessToast = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Thông báo lỗi
export const showErrorToast = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Thông báo cảnh báo
export const showWarningToast = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Thông báo thông tin
export const showInfoToast = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Thông báo xác nhận
export const showConfirmToast = (message, onConfirm, onCancel) => {
  const toastId = toast.info(
    <div>
      <div className="toast-message">{message}</div>
      <div className="toast-actions">
        <button 
          onClick={() => {
            toast.dismiss(toastId);
            onConfirm();
          }}
          className="toast-confirm-btn"
        >
          Xác nhận
        </button>
        <button 
          onClick={() => {
            toast.dismiss(toastId);
            if (onCancel) onCancel();
          }}
          className="toast-cancel-btn"
        >
          Hủy
        </button>
      </div>
    </div>,
    {
      position: "top-center",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      closeButton: false,
    }
  );
  
  return toastId;
};
