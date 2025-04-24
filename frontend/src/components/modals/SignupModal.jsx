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
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/api";


const SignupModal = ({ isOpen, onClose, switchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState({ day: "", month: "", year: "" });
  const [gender, setGender] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

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

  // Xử lý đăng ký
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra các trường bắt buộc
    if (!username || !email || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Kiểm tra ngày sinh
    if (!birthDate.day || !birthDate.month || !birthDate.year) {
      setError("Vui lòng nhập đầy đủ ngày sinh");
      return;
    }

    try {
      setLoading(true);

      // Định dạng ngày sinh
      const formattedDate = `${birthDate.year}-${birthDate.month.padStart(2, '0')}-${birthDate.day.padStart(2, '0')}`;

      // Chuẩn bị dữ liệu đăng ký
      const userData = {
        username,
        email,
        password,
        gender: gender || 'male', // Mặc định là nam nếu không chọn
        date_of_birth: formattedDate,
        full_name: fullName || username, // Nếu không có full_name thì dùng username
      };

      // Gọi API đăng ký
      await registerUser(userData);

      // Đóng modal
      onClose();

      // Chuyển hướng đến trang đăng nhập
      switchToLogin();
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      setError(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
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
      <div className="modal-container signup-modal" ref={modalRef}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <IoMdClose />
          </button>
          <h2 className="modal-title">Đăng ký để bắt đầu nghe nhạc</h2>
        </div>

        {/* Phần nội dung còn lại giữ nguyên */}
        <div className="modal-content">
          {error && <p style={{ color: "red", textAlign: "center", padding: "5px"}}>{error}</p>}
          <form className="signup-form" onSubmit={handleSignup}>
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
              <label htmlFor="signup-password">Tạo mật khẩu</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="signup-password"
                  placeholder="Tạo mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <label htmlFor="fullName">Họ và tên</label>
              <input
                type="text"
                id="fullName"
                placeholder="Họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Giới tính</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input-field"
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
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
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
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
