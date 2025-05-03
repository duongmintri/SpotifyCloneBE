import React, { useState } from "react";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { changePassword } from "../../services/api";
import { showSuccessToast, showErrorToast } from "../../utils/toast.jsx";
import "./ChangePasswordModal.css";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    // Kiểm tra các trường bắt buộc
    if (!oldPassword) {
      newErrors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
    }
    
    if (!newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu mới và xác nhận mật khẩu không khớp";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // Gọi API đổi mật khẩu
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      showSuccessToast("Đổi mật khẩu thành công");
      
      // Reset form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      
      // Đóng modal
      onClose();
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      
      // Xử lý lỗi từ API
      if (error.response && error.response.data) {
        const apiErrors = error.response.data;
        
        if (apiErrors.old_password) {
          setErrors(prev => ({...prev, oldPassword: apiErrors.old_password[0]}));
        } else if (apiErrors.new_password) {
          setErrors(prev => ({...prev, newPassword: apiErrors.new_password[0]}));
        } else if (apiErrors.confirm_password) {
          setErrors(prev => ({...prev, confirmPassword: apiErrors.confirm_password[0]}));
        } else if (apiErrors.detail) {
          showErrorToast(apiErrors.detail);
        } else {
          showErrorToast("Đổi mật khẩu thất bại. Vui lòng thử lại.");
        }
      } else {
        showErrorToast(error.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-container change-password-modal">
        <div className="modal-header">
          <h2 className="modal-title">Đổi mật khẩu</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit} className="password-change-form">
            <div className="form-group password-form-group">
              <label htmlFor="old-password">Mật khẩu hiện tại</label>
              <div className="password-input-container">
                <input
                  type={showOldPassword ? "text" : "password"}
                  id="old-password"
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    // Xóa lỗi khi người dùng bắt đầu nhập lại
                    if (errors.oldPassword) {
                      setErrors({...errors, oldPassword: ""});
                    }
                  }}
                  placeholder="Nhập mật khẩu hiện tại"
                  className={`input-field password-input ${errors.oldPassword ? 'error' : ''}`}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.oldPassword && <p className="password-error-text">{errors.oldPassword}</p>}
            </div>

            <div className="form-group password-form-group">
              <label htmlFor="new-password">Mật khẩu mới</label>
              <div className="password-input-container">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    // Xóa lỗi khi người dùng bắt đầu nhập lại
                    if (errors.newPassword) {
                      setErrors({...errors, newPassword: ""});
                    }
                  }}
                  placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                  className={`input-field password-input ${errors.newPassword ? 'error' : ''}`}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.newPassword && <p className="password-error-text">{errors.newPassword}</p>}
            </div>

            <div className="form-group password-form-group">
              <label htmlFor="confirm-password">Xác nhận mật khẩu mới</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    // Xóa lỗi khi người dùng bắt đầu nhập lại
                    if (errors.confirmPassword) {
                      setErrors({...errors, confirmPassword: ""});
                    }
                  }}
                  placeholder="Nhập lại mật khẩu mới"
                  className={`input-field password-input ${errors.confirmPassword ? 'error' : ''}`}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <p className="password-error-text">{errors.confirmPassword}</p>}
            </div>

            <div className="form-actions password-form-actions">
              <button 
                type="button" 
                className="cancel-btn password-cancel-btn" 
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="save-btn password-save-btn" 
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
