import React, { useState, useEffect } from 'react';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import '../../styles/Notification.css';

// Component thông báo xác nhận
export const ConfirmNotification = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="notification-overlay">
      <div className="notification-container">
        <div className="notification-header warning">
          <span>
            <FaExclamationTriangle className="notification-icon" />
            {title || 'Xác nhận'}
          </span>
        </div>
        <div className="notification-body">
          {message}
        </div>
        <div className="notification-footer">
          <button className="notification-btn notification-btn-cancel" onClick={onCancel}>
            Hủy
          </button>
          <button className="notification-btn notification-btn-confirm" onClick={onConfirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// Component thông báo thành công
export const SuccessNotification = ({ message, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="toast-notification">
      <FaCheck className="toast-icon" />
      <div className="toast-message">{message}</div>
    </div>
  );
};

// Component thông báo lỗi
export const ErrorNotification = ({ message, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="toast-notification error">
      <FaTimes className="toast-icon" />
      <div className="toast-message">{message}</div>
    </div>
  );
};

// Component thông báo cảnh báo
export const WarningNotification = ({ message, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="toast-notification warning">
      <FaExclamationTriangle className="toast-icon" />
      <div className="toast-message">{message}</div>
    </div>
  );
};

// Component thông báo thông tin
export const InfoNotification = ({ message, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="toast-notification info">
      <FaInfoCircle className="toast-icon" />
      <div className="toast-message">{message}</div>
    </div>
  );
};

// Không cần hàm showNotification vì chúng ta sẽ sử dụng NotificationContext

// Không cần các hàm tiện ích này vì chúng ta sẽ sử dụng NotificationContext
