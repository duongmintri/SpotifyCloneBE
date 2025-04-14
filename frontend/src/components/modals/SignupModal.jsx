import React, { useState, useEffect, useRef } from "react";
import {
  FaApple,
  FaFacebook,
  FaGoogle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Form, Button, InputGroup } from "react-bootstrap";


const SignupModal = ({ isOpen, onClose, switchToLogin }) => {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState({ day: "", month: "", year: "" });
  const [gender, setGender] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const modalRef = useRef(null);

  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

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
      <div className="modal-container signup-modal" ref={modalRef}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <IoMdClose />
          </button>
          <h2 className="modal-title">Đăng ký để bắt đầu nghe nhạc</h2>
        </div>

        {/* Phần nội dung còn lại giữ nguyên */}
        <div className="modal-content">
          <form className="signup-form">
            <div className="form-group">
              <label htmlFor="email">Email của bạn là gì?</label>
              <input
                type="email"
                id="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-email">Xác nhận email của bạn</label>
              <input
                type="email"
                id="confirm-email"
                placeholder="Nhập lại email của bạn"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Tạo mật khẩu</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="signup-password"
                  placeholder="Tạo mật khẩu"
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

            <div className="form-group">
              <label htmlFor="username">Tên hiển thị</label>
              <input
                type="text"
                id="username"
                placeholder="Tên hiển thị"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <span className="form-hint">
                Tên này sẽ xuất hiện trên hồ sơ của bạn
              </span>
            </div>

            <div className="form-group">
              <label>Ngày sinh của bạn là khi nào?</label>
              <div className="birth-date-inputs">
                <div className="birth-date-select">
                  <label htmlFor="birth-day">Ngày</label>
                  <input
                    type="number"
                    id="birth-day"
                    placeholder="Ngày"
                    min="1"
                    max="31"
                    value={birthDate.day}
                    onChange={(e) =>
                      setBirthDate({ ...birthDate, day: e.target.value })
                    }
                  />
                </div>

                <div className="birth-date-select">
                  <label htmlFor="birth-month">Tháng</label>
                  <select
                    id="birth-month"
                    value={birthDate.month}
                    onChange={(e) =>
                      setBirthDate({ ...birthDate, month: e.target.value })
                    }
                  >
                    <option value="">Tháng</option>
                    {months.map((month, index) => (
                      <option key={index} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="birth-date-select">
                  <label htmlFor="birth-year">Năm</label>
                  <input
                    type="number"
                    id="birth-year"
                    placeholder="Năm"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={birthDate.year}
                    onChange={(e) =>
                      setBirthDate({ ...birthDate, year: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="submit-btn">
              Đăng ký
            </button>

            <div className="login-link">
              <p>
                Đã có tài khoản?{" "}
                <a href="#" onClick={switchToLogin}>
                  Đăng nhập
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
