import React, { useState, useRef, useEffect } from "react";
import { createPortal } from 'react-dom'; // Import createPortal
import { FaSearch, FaUser, FaUserPlus, FaMoneyBill, FaBell, FaSignOutAlt, FaCog, FaUserEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import spotifyLogo from "../../assets/images/spotify.png";
import { clearAuthData, getUser } from "../../services/api";
import UserProfileModal from "../modals/UserProfileModal";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); // State cho modal
  const user = getUser();
  const profileMenuRef = useRef(null);

  const handleLogout = () => {
    setLoading(true);
    clearAuthData();
    navigate("/login");
    setLoading(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const openProfileModal = () => {
    setShowProfileModal(true);
    setShowProfileMenu(false); // Đóng menu khi mở modal
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
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
          
          <div className="profile-container" ref={profileMenuRef}>
            <div 
              className="profile-trigger" 
              onClick={toggleProfileMenu}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "5px", 
                cursor: "pointer",
                padding: "5px 10px",
                borderRadius: "20px",
                backgroundColor: showProfileMenu ? "rgba(255, 255, 255, 0.1)" : "transparent",
                transition: "background-color 0.2s"
              }}
            >
              <FaUser style={{ color: "#b3b3b3", fontSize: "1.5rem" }} title="Tài khoản" />
              <span style={{ color: "white" }}>{user?.username || 'Người dùng'}</span>
            </div>
            
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <FaUser size={40} />
                  </div>
                  <div className="profile-info">
                    <h3>{user?.username || 'Người dùng'}</h3>
                    <p>{user?.email || 'email@example.com'}</p>
                  </div>
                </div>
                
                <div className="profile-menu-items">
                  <button className="profile-menu-item" onClick={openProfileModal}>
                    <FaUserEdit />
                    <span>Thông tin người dùng</span>
                  </button>
                  
                  <button className="profile-menu-item" onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/settings");
                  }}>
                    <FaUserPlus />
                    <span>Bạn bè</span>
                  </button>
                  
                  <button className="profile-menu-item" onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/settings");
                  }}>
                    <FaMoneyBill />
                    <span>Nâng cấp tài khoản</span>
                  </button>
                  <div className="profile-divider"></div>
                  
                  <button className="profile-menu-item logout-item" onClick={handleLogout} disabled={loading}>
                    <FaSignOutAlt />
                    <span>{loading ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sử dụng React Portal để render modal vào body */}
      {showProfileModal && createPortal(
        <UserProfileModal 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)} 
          user={user}
        />,
        document.body
      )}
    </>
  );
};

export default Navbar;
