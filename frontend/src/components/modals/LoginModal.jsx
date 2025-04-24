import React, { useState, useEffect, useRef } from "react";
import {
  FaFacebook,
  FaGoogle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { loginUser, saveAuthData } from "../../services/api";

const LoginModal = ({ isOpen, onClose, switchToSignup}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  // Khi modal mở, vô hiệu hóa cuộn trang
  useEffect(() => {
    if (isOpen) {
      // Vô hiệu hóa cuộn trên body
      document.body.style.overflow = "hidden";

      // Cuộn modal lên đầu khi mở
      if (modalRef.current) {
        modalRef.current.scrollTop = 0;
      }
    } else {
      // Khôi phục cuộn khi đóng modal
      document.body.style.overflow = "auto";
    }

    // Cleanup khi component unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra các trường bắt buộc
    if (!username || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      // Gọi API đăng nhập
      const data = await loginUser({ username, password });

      // Lưu thông tin đăng nhập vào localStorage
      saveAuthData(data);

      // Đóng modal
      onClose();

      // Chuyển hướng đến trang chính
      navigate("/home");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setError(error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý sự kiện click bên ngoài modal để đóng
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container login-modal" ref={modalRef}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <IoMdClose />
          </button>
          <h2 className="modal-title">Đăng nhập vào Spotify</h2>
        </div>

        {/* Phần còn lại của modal giữ nguyên */}
        <div className="modal-content">

          {error && <p style={{ color: "red", textAlign: "center", padding: "5px"}}>{error}</p>}
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Tên người dùng</label>
              <input
                type="text"
                id="username"
                placeholder="Tên người dùng"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="password-input-container">
              <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
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

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember-me">Ghi nhớ đăng nhập</label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="forgot-password">
              <a href="#">Quên mật khẩu?</a>
            </div>
          </form>

          <div className="modal-footer">
            <p>
              Chưa có tài khoản?{" "}
              <a href="#" onClick={switchToSignup}>
                Đăng ký Spotify
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
