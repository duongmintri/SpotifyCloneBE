import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSpotify } from "react-icons/fa";
import { adminLogin, saveAdminAuthData, isAdminAuthenticated } from "../../services/adminApi";
import "../../styles/AdminStyles.css";

const AdminLoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng đến trang admin
  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate("/admin/dashboard");
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
      console.log("Đang đăng nhập admin với:", { username, password });

      // Gọi API đăng nhập admin
      const data = await adminLogin({ username, password });
      console.log("Đăng nhập admin thành công, nhận được data:", data);

      // Lưu thông tin đăng nhập vào localStorage
      saveAdminAuthData(data);

      // Chuyển hướng đến trang admin
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Lỗi đăng nhập admin:", error);
      setError(error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-form-container">
        <div className="admin-login-header">
          <FaSpotify className="admin-logo" />
          <h1>Spotify Admin</h1>
        </div>

        {error && <div className="admin-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              className="admin-input-field"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="admin-password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="admin-input-field"
              />
              <button
                type="button"
                className="admin-password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="admin-submit-btn" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Chỉ dành cho quản trị viên</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
