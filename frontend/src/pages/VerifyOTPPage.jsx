import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/AuthStyles.css";
import { verifyOTP } from "../services/api";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("Vui lòng nhập mã OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOTP({ email, otp });
      
      // Chuyển hướng đến trang đặt lại mật khẩu với uid và token
      navigate("/reset-password", { 
        state: { 
          uid: response.uid, 
          token: response.token 
        } 
      });
    } catch (error) {
      setError(error.message || "Mã OTP không hợp lệ hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Xác thực OTP</h2>
        {error && <p className="error-message">{error}</p>}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp">Mã OTP</label>
            <input
              type="text"
              id="otp"
              placeholder="Nhập mã OTP từ email"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input-field"
              maxLength={6}
            />
            <small>Mã OTP đã được gửi đến email: {email}</small>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Đang xác thực..." : "Xác thực"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link to="/forgot-password">Gửi lại mã OTP</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;