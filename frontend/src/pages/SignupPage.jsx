import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/AuthStyles.css";
import { registerUser, isAuthenticated } from "../services/api";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [fullName, setFullName] = useState("");
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

    // Kiểm tra mật khẩu và nhập lại mật khẩu có khớp không
    if (password !== confirmPassword) {
      setError("Mật khẩu và nhập lại mật khẩu không khớp");
      return;
    }

    // Kiểm tra các trường bắt buộc
    if (!username || !email || !password || !gender || !dateOfBirth) {
      setError("Vui lòng điền đầy đủ thông tin");
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

      // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
      navigate("/login");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      setError(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Đăng ký Spotify</h2>
        {error && <p style={{ color: "red", textAlign: "center", padding: "5px" }}>{error}</p>}
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
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <label htmlFor="dateOfBirth">Ngày sinh</label>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;