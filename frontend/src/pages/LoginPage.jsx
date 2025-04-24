import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/AuthStyles.css";
import { loginUser, saveAuthData, isAuthenticated } from "../services/api";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng đến trang chính
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/home");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra các trường bắt buộc
    if (!username || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      console.log("Đang đăng nhập với:", { username, password });

      // Gọi API đăng nhập
      const data = await loginUser({ username, password });
      console.log("Đăng nhập thành công, nhận được data:", data);

      // Lưu thông tin đăng nhập vào localStorage
      saveAuthData(data);

      // Chuyển hướng đến trang chính
      navigate("/home");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setError(error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Đăng nhập vào Spotify</h2>
        {error && <p style={{ color: "red", textAlign: "center", padding: "5px"}}>{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
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

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="forgot-password">
            <Link to="#">Quên mật khẩu?</Link>
          </div>
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