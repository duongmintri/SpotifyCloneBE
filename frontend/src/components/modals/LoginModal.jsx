import React, { useState, useEffect, useRef } from "react";
import {
  FaFacebook,
  FaGoogle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const modalRef = useRef(null);

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
          <div className="social-login-buttons">
            <button className="social-btn facebook-btn">
              <FaFacebook />
              <span>Tiếp tục với Facebook</span>
            </button>
            <button className="social-btn google-btn">
              <FaGoogle />
              <span>Tiếp tục với Google</span>
            </button>
          </div>

          <div className="divider">
            <span>hoặc</span>
          </div>

          <form className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email hoặc tên người dùng</label>
              <input
                type="text"
                id="email"
                placeholder="Email hoặc tên người dùng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button type="submit" className="submit-btn">
              Đăng nhập
            </button>

            <div className="forgot-password">
              <a href="#">Quên mật khẩu?</a>
            </div>
          </form>

          <div className="modal-footer">
            <p>
              Chưa có tài khoản?{" "}
              <a href="#" onClick={onClose}>
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
