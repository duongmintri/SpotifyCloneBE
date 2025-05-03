import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/AuthStyles.css";
import { registerUser, isAuthenticated } from "../services/api";
import { showSuccessToast, showErrorToast } from "../utils/toast.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng đến trang chính
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/home");
    }
  }, [navigate]);

  // Kiểm tra email hợp lệ
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Kiểm tra mật khẩu mạnh
  const isStrongPassword = (password) => {
    return password.length >= 8;
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
    
    // Kiểm tra xác nhận mật khẩu
    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu và xác nhận mật khẩu không khớp";
    }
    
    // Kiểm tra giới tính
    if (!gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }
    
    // Kiểm tra ngày sinh
    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Vui lòng nhập ngày sinh";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form trước khi submit
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // Chuẩn bị dữ liệu đăng ký
      const userData = {
        username,
        email,
        password,
        gender,
        date_of_birth: dateOfBirth,
        full_name: fullName || username, // Nếu không có full_name thì dùng username
      };

      // Gọi API đăng ký
      await registerUser(userData);
      
      // Hiển thị thông báo thành công
      showSuccessToast("Đăng ký tài khoản thành công! Chuyển hướng đến trang đăng nhập...");
      
      // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công (sau 2 giây)
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
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
          apiErrors.dateOfBirth = errorData.date_of_birth[0];
        }
        if (errorData.gender) {
          apiErrors.gender = errorData.gender[0];
        }
        
        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
        } else if (errorData.detail) {
          setErrors({ general: errorData.detail });
          showErrorToast(errorData.detail);
        } else {
          setErrors({ general: "Đăng ký thất bại. Vui lòng thử lại." });
          showErrorToast("Đăng ký thất bại. Vui lòng thử lại.");
        }
      } else {
        setErrors({ general: error.message || "Đăng ký thất bại. Vui lòng thử lại." });
        showErrorToast(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="spotify-signup-container">
        <h2 className="spotify-signup-title">Đăng ký Spotify</h2>
        {errors.general && <p className="spotify-signup-error-message">{errors.general}</p>}
        
        <form className="spotify-signup-form" onSubmit={handleSubmit}>
          <div className="spotify-signup-columns">
            <div className="spotify-signup-column">
              <div className="spotify-signup-group">
                <label htmlFor="username">Tên người dùng</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Tên người dùng"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) {
                      setErrors({...errors, username: ""});
                    }
                  }}
                  className={`spotify-signup-input ${errors.username ? 'spotify-signup-error-input' : ''}`}
                />
                {errors.username && <p className="spotify-signup-field-error">{errors.username}</p>}
              </div>
              
              <div className="spotify-signup-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors({...errors, email: ""});
                    }
                  }}
                  className={`spotify-signup-input ${errors.email ? 'spotify-signup-error-input' : ''}`}
                />
                {errors.email && <p className="spotify-signup-field-error">{errors.email}</p>}
              </div>
              
              <div className="spotify-signup-group">
                <label htmlFor="password">Mật khẩu</label>
                <div className="spotify-signup-password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors({...errors, password: ""});
                      }
                    }}
                    className={`spotify-signup-input ${errors.password ? 'spotify-signup-error-input' : ''}`}
                  />
                  <button
                    type="button"
                    className="spotify-signup-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="spotify-signup-field-error">{errors.password}</p>}
              </div>
            </div>
            
            <div className="spotify-signup-column">
              <div className="spotify-signup-group">
                <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
                <div className="spotify-signup-password-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors({...errors, confirmPassword: ""});
                      }
                    }}
                    className={`spotify-signup-input ${errors.confirmPassword ? 'spotify-signup-error-input' : ''}`}
                  />
                  <button
                    type="button"
                    className="spotify-signup-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="spotify-signup-field-error">{errors.confirmPassword}</p>}
              </div>
              
              <div className="spotify-signup-group">
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
                  className={`spotify-signup-input ${errors.gender ? 'spotify-signup-error-input' : ''}`}
                >
                  <option value="" disabled>Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
                {errors.gender && <p className="spotify-signup-field-error">{errors.gender}</p>}
              </div>
              
              <div className="spotify-signup-group">
                <label htmlFor="dateOfBirth">Ngày sinh</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);
                    if (errors.dateOfBirth) {
                      setErrors({...errors, dateOfBirth: ""});
                    }
                  }}
                  className={`spotify-signup-input ${errors.dateOfBirth ? 'spotify-signup-error-input' : ''}`}
                />
                {errors.dateOfBirth && <p className="spotify-signup-field-error">{errors.dateOfBirth}</p>}
              </div>
              
              <div className="spotify-signup-group">
                <label htmlFor="fullName">Họ và tên</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="spotify-signup-input"
                />
              </div>
            </div>
          </div>
          
          <button type="submit" className="spotify-signup-submit-btn" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <div className="spotify-signup-footer">
          <p>
            Đã có tài khoản? <Link to="/login" className="spotify-signup-link">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
