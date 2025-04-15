import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaFacebook,
  FaGoogle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import axios from "axios";
import "../styles/AuthStyles.css"; // Tái sử dụng style từ ModalStyles.css

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/login/", {
        email,
        password,
      });
      console.log("Đăng nhập thành công:", response.data);
      localStorage.setItem("token", response.data.token); // Lưu token nếu backend trả về
      navigate("/"); // Chuyển hướng về trang chủ sau khi đăng nhập
    } catch (err) {
      setError(err.response?.data?.error || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Đăng nhập vào Spotify</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Tên người dùng</label>
            <input
              type="text"
              id="email"
              placeholder="Tên người dùng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <button type="submit" className="submit-btn">
            Đăng nhập
          </button>

          {/* <div className="forgot-password">
            <Link to="#">Quên mật khẩu?</Link>
          </div> */}
        </form>

        <div className="auth-footer">
          <p>
            Chưa có tài khoản? <Link to="/signup">Đăng ký Spotify</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;