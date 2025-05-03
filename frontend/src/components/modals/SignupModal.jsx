import React, { useState, useEffect, useRef } from "react";
import {
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/api";
import "./SignupModal.css"; // Đảm bảo CSS được import đúng cách

const SignupModal = ({ isOpen, onClose, switchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState({ day: "", month: "", year: "" });
  const [gender, setGender] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
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
      document.body.style.overflow = "hidden";
      if (modalRef.current) {
        modalRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Kiểm tra email hợp lệ
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Kiểm tra mật khẩu mạnh
  const isStrongPassword = (password) => {
    return password.length >= 8;
  };

  // Kiểm tra ngày sinh hợp lệ
  const isValidDate = (day, month, year) => {
    if (!day || !month || !year) return false;
    
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === parseInt(year) &&
      date.getMonth() === parseInt(month) - 1 &&
      date.getDate() === parseInt(day)
    );
  };

  // Kiểm tra tuổi tối thiểu (13 tuổi)
  const isMinimumAge = (day, month, year) => {
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 13;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Kiểm tra username
    if (!username) {
      newErrors.username = "Vui lòng nhập tên người dùng";
    } else if (username.length < 3) {
      newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
    }
    
    // Kiểm tra email
    if (!email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    // Kiểm tra mật khẩu
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (!isStrongPassword(password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }
    
    // Kiểm tra ngày sinh
    if (!birthDate.day || !birthDate.month || !birthDate.year) {
      newErrors.birthDate = "Vui lòng nhập đầy đủ ngày sinh";
    } else if (!isValidDate(birthDate.day, birthDate.month, birthDate.year)) {
      newErrors.birthDate = "Ngày sinh không hợp lệ";
    } else if (!isMinimumAge(birthDate.day, birthDate.month, birthDate.year)) {
      newErrors.birthDate = "Bạn phải đủ 13 tuổi để đăng ký";
    }
    
    // Kiểm tra giới tính
    if (!gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý đăng ký
  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Validate form trước khi submit
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Định dạng ngày sinh
      const formattedDate = `${birthDate.year}-${String(birthDate.month).padStart(2, '0')}-${String(birthDate.day).padStart(2, '0')}`;

      // Chuẩn bị dữ liệu đăng ký
      const userData = {
        username,
        email,
        password,
        gender: gender || 'male',
        date_of_birth: formattedDate,
        full_name: fullName || username,
      };

      // Gọi API đăng ký
      await registerUser(userData);

      // Đóng modal
      onClose();

      // Chuyển hướng đến trang đăng nhập
      switchToLogin();
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      
      // Xử lý lỗi từ API
      if (error.response && error.response.data) {
        const apiErrors = {};
        const errorData = error.response.data;
        
        if (errorData.username) {
          apiErrors.username = errorData.username[0];
        }
        if (errorData.email) {
          apiErrors.email = errorData.email[0];
        }
        if (errorData.password) {
          apiErrors.password = errorData.password[0];
        }
        if (errorData.date_of_birth) {
          apiErrors.birthDate = errorData.date_of_birth[0];
        }
        if (errorData.gender) {
          apiErrors.gender = errorData.gender[0];
        }
        
        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
        } else if (errorData.detail) {
          setErrors({ general: errorData.detail });
        } else {
          setErrors({ general: "Đăng ký thất bại. Vui lòng thử lại." });
        }
      } else {
        setErrors({ general: error.message || "Đăng ký thất bại. Vui lòng thử lại." });
      }
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
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-container signup-modal" ref={modalRef}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <IoMdClose />
          </button>
          <div className="modal-logo">
            <img src="/logo.png" alt="Spotify Logo" />
          </div>
          <h2 className="modal-title">Đăng ký Spotify</h2>
        </div>

        <div className="modal-content">
          <form className="signup-form" onSubmit={handleSignup}>
            {errors.general && <p className="signup-field-error general-error">{errors.general}</p>}
            
            <div className="signup-form-columns">
              <div className="signup-form-column">
                <div className="form-group">
                  <label htmlFor="email">Email của bạn là gì?</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors({...errors, email: ""});
                      }
                    }}
                    className={`input-field ${errors.email ? 'signup-error-field' : ''}`}
                  />
                  {errors.email && <p className="signup-field-error">{errors.email}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="signup-password">Tạo mật khẩu</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="signup-password"
                      placeholder="Tạo mật khẩu (ít nhất 8 ký tự)"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                          setErrors({...errors, password: ""});
                        }
                      }}
                      className={`input-field ${errors.password ? 'signup-error-field' : ''}`}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <p className="signup-field-error">{errors.password}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="username">Tên người dùng</label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Tên người dùng (ít nhất 3 ký tự)"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) {
                        setErrors({...errors, username: ""});
                      }
                    }}
                    className={`input-field ${errors.username ? 'signup-error-field' : ''}`}
                  />
                  {errors.username && <p className="signup-field-error">{errors.username}</p>}
                </div>
              </div>

              <div className="signup-form-column">
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
                    onChange={(e) => {
                      setGender(e.target.value);
                      if (errors.gender) {
                        setErrors({...errors, gender: ""});
                      }
                    }}
                    className={`input-field ${errors.gender ? 'signup-error-field' : ''}`}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                  {errors.gender && <p className="signup-field-error">{errors.gender}</p>}
                </div>

                <div className="form-group">
                  <label>Ngày sinh</label>
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
                        onChange={(e) => {
                          setBirthDate({ ...birthDate, day: e.target.value });
                          if (errors.birthDate) {
                            setErrors({...errors, birthDate: ""});
                          }
                        }}
                        className={errors.birthDate ? "signup-error-field" : ""}
                      />
                    </div>
                    <div className="birth-date-select">
                      <label htmlFor="birth-month">Tháng</label>
                      <select
                        id="birth-month"
                        value={birthDate.month}
                        onChange={(e) => {
                          setBirthDate({ ...birthDate, month: e.target.value });
                          if (errors.birthDate) {
                            setErrors({...errors, birthDate: ""});
                          }
                        }}
                        className={errors.birthDate ? "signup-error-field" : ""}
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
                        onChange={(e) => {
                          setBirthDate({ ...birthDate, year: e.target.value });
                          if (errors.birthDate) {
                            setErrors({...errors, birthDate: ""});
                          }
                        }}
                        className={errors.birthDate ? "signup-error-field" : ""}
                      />
                    </div>
                  </div>
                  {errors.birthDate && <p className="signup-field-error birth-date-error">{errors.birthDate}</p>}
                </div>
              </div>
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
            
            <div className="login-link">
              <p>
                Đã có tài khoản?{" "}
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  switchToLogin();
                }}>
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
