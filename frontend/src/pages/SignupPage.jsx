import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/AuthStyles.css";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Trường nhập lại mật khẩu
  const [gender, setGender] = useState(""); // Trường giới tính
  const [dateOfBirth, setDateOfBirth] = useState(""); // Trường ngày sinh
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const response = await axios.post("http://127.0.0.1:8000/api/auth/register/", {
        username,
        email,
        password,
        gender, // Gửi giới tính
        date_of_birth: dateOfBirth, // Gửi ngày sinh (đổi tên để khớp với backend)
      });
      console.log("Đăng ký thành công:", response.data);
      window.location.href = "/login"; // Chuyển hướng về trang đăng nhập sau khi đăng ký
    } catch (err) {
      setError(err.response?.data?.error || "Đăng ký thất bại");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Đăng ký Spotify</h2>
        {error && <p style={{ color: "red", textAlign: "center", padding: "6px" }}>{error}</p>}
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
              <option value="other">Khác</option>
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
          <button type="submit" className="submit-btn">
            Đăng ký
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