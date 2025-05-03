import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/AuthStyles.css";
import { resetPassword } from "../services/api";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  const uid = location.state?.uid || "";
  const token = location.state?.token || "";

  useEffect(() => {
    if (!uid || !token) {
      navigate("/forgot-password");
    }
  }, [uid, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    try {
      setLoading(true);
      await resetPassword({ uid, token, new_password: newPassword });
      
      // Chuyển hướng đến trang đăng nhập
      navigate("/login", { 
        state: { message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới." } 
      });
    } catch (error) {
      setError(error.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Đặt lại mật khẩu</h2>
        {error && <p className="error-message">{error}</p>}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;