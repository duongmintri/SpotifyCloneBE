import React, { createContext, useState, useContext } from 'react';
import {
  SuccessNotification,
  ErrorNotification,
  WarningNotification,
  InfoNotification,
  ConfirmNotification
} from '../components/notifications/Notification';

// Tạo context
const NotificationContext = createContext();

// Hook để sử dụng context
export const useNotification = () => useContext(NotificationContext);

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Thêm thông báo mới
  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);

    // Tự động xóa thông báo sau một khoảng thời gian (trừ thông báo xác nhận)
    if (notification.type !== 'confirm') {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 3000);
    }

    return id;
  };

  // Xóa thông báo
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Các hàm tiện ích
  const showSuccess = (message, options = {}) => {
    return addNotification({ type: 'success', message, ...options });
  };

  const showError = (message, options = {}) => {
    return addNotification({ type: 'error', message, ...options });
  };

  const showWarning = (message, options = {}) => {
    return addNotification({ type: 'warning', message, ...options });
  };

  const showInfo = (message, options = {}) => {
    return addNotification({ type: 'info', message, ...options });
  };

  const showConfirm = (message, onConfirm, onCancel, options = {}) => {
    const id = Date.now();
    const notification = {
      id,
      type: 'confirm',
      message,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        removeNotification(id);
      },
      onCancel: () => {
        if (onCancel) onCancel();
        removeNotification(id);
      },
      ...options
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  };

  // Render các thông báo
  const renderNotifications = () => {
    return notifications.map(notification => {
      const { id, type, message, title, onConfirm, onCancel } = notification;

      switch (type) {
        case 'success':
          return <SuccessNotification key={id} message={message} />;
        case 'error':
          return <ErrorNotification key={id} message={message} />;
        case 'warning':
          return <WarningNotification key={id} message={message} />;
        case 'info':
          return <InfoNotification key={id} message={message} />;
        case 'confirm':
          return (
            <ConfirmNotification
              key={id}
              title={title}
              message={message}
              onConfirm={onConfirm}
              onCancel={onCancel}
            />
          );
        default:
          return null;
      }
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        removeNotification
      }}
    >
      {children}
      {renderNotifications()}
    </NotificationContext.Provider>
  );
};
