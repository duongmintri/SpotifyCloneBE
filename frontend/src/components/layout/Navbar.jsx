import React from "react";
import { FaSearch, FaUser, FaBell, FaSignOutAlt } from "react-icons/fa"; // Thêm icon user, bell, và sign-out
import { useNavigate } from "react-router-dom"; // Để chuyển hướng sau khi đăng xuất
import spotifyLogo from "../../assets/images/spotify.png";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa token khỏi localStorage
    navigate("/login"); // Chuyển hướng về trang đăng nhập
  };

  return (
    <div className="spotify-navbar">
      <div className="logo-container">
        <img src={spotifyLogo} alt="Spotify Logo" className="spotify-logo" />
      </div>
      <div className="search-container" style={{ flex: 1, marginLeft: "1rem" }}>
        <div style={{ position: "relative", maxWidth: "365px" }}>
          <FaSearch style={{ position: "absolute", left: "10px", top: "10px", color: "#b3b3b3" }} />
          <input
            type="text"
            placeholder="Tìm kiếm theo bài hát, nghệ sĩ hoặc album"
            style={{
              backgroundColor: "white",
              border: "none",
              borderRadius: "23px",
              padding: "10px 10px 10px 35px",
              width: "100%",
              fontSize: "0.875rem",
            }}
          />
        </div>
      </div>
      <div className="user-actions" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <FaBell style={{ color: "#b3b3b3", fontSize: "1.5rem", cursor: "pointer" }} title="Thông báo" />
        <FaUser style={{ color: "#b3b3b3", fontSize: "1.5rem", cursor: "pointer" }} title="Tài khoản" />
        <button className="btn btn-logout" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Navbar;