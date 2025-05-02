import React, { useState, useRef, useEffect } from "react";
import { createPortal } from 'react-dom';
import { FaSearch, FaUser, FaUserPlus, FaMoneyBill, FaBell, FaSignOutAlt, FaCog, FaUserEdit, FaCrown } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import spotifyLogo from "../../assets/images/spotify.png";
import { clearAuthData, getUser, fetchWithAuth, checkPremiumStatus, updateUserInfo } from "../../services/api";
import UserProfileModal from "../modals/UserProfileModal";
import PremiumModal from "../modals/PremiumModal";
import "./Navbar.css";

// Import API_URL from services/api.js
const API_URL = 'http://localhost:8000';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremiumLoading, setIsPremiumLoading] = useState(false);
  const [user, setUser] = useState(getUser());
  const [isPremium, setIsPremium] = useState(user?.is_premium || false);
  const [searchTerm, setSearchTerm] = useState('');
  const profileMenuRef = useRef(null);

  // Cập nhật thông tin người dùng khi component mount
  useEffect(() => {
    const refreshUserInfo = async () => {
      try {
        console.log('Đang refresh thông tin người dùng...');
        // Debug: Kiểm tra dữ liệu trong localStorage
        console.log('Raw user data from localStorage:', localStorage.getItem('user'));

        // Kiểm tra trạng thái premium
        const premiumStatus = await checkPremiumStatus();
        console.log('Trạng thái premium từ API:', premiumStatus);

        // Lấy thông tin user mới nhất từ localStorage
        const updatedUser = getUser();
        console.log('Thông tin user sau khi cập nhật:', updatedUser);

        if (updatedUser) {
          setUser(updatedUser);
          setIsPremium(updatedUser.is_premium || false);
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật thông tin người dùng:', error);
      }
    };

    refreshUserInfo();
  }, []);

  // Cập nhật user state khi localStorage thay đổi
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = getUser();
      if (updatedUser) {
        setUser(updatedUser);
        setIsPremium(updatedUser.is_premium || false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
    setShowProfileMenu(false);
  };

  const handlePremiumAction = () => {
    setShowPremiumModal(true);
    setShowProfileMenu(false);
  };

  const togglePremiumStatus = async () => {
    try {
      setIsPremiumLoading(true);
      console.log('Calling toggle premium endpoint...');

      // Gọi API để thay đổi trạng thái premium
      const response = await fetchWithAuth(`${API_URL}/api/accounts/toggle-premium/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Empty body but still valid JSON
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Toggle premium response:', data);

        // Cập nhật thông tin user trong state và localStorage
        const currentUser = getUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            is_premium: data.is_premium
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          setIsPremium(updatedUser.is_premium);
        }

        // Đóng modal
        setShowPremiumModal(false);

        // Hiển thị thông báo thành công
        alert(data.is_premium ? 'Đã nâng cấp lên tài khoản Premium!' : 'Đã hủy gói Premium!');
      } else {
        console.error('Error response status:', response.status);
        alert('Không thể thay đổi trạng thái Premium. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái premium:', error);
      alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    } finally {
      setIsPremiumLoading(false);
    }
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

  // Xử lý khi submit form tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();

    if (searchTerm.trim().length >= 1) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Xử lý khi nhấn Enter trong input tìm kiếm
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <>
      <div className="spotify-navbar">
        <div className="logo-container">
          <img src={spotifyLogo} alt="Spotify Logo" className="spotify-logo" />
        </div>
        <div className="search-container" style={{ flex: 1, marginLeft: "1rem" }}>
          <form onSubmit={handleSearch}>
            <div style={{ position: "relative", maxWidth: "365px" }}>
              <FaSearch style={{ position: "absolute", left: "10px", top: "10px", color: "#b3b3b3" }} />
              <input
                type="text"
                placeholder="Tìm kiếm theo bài hát, nghệ sĩ hoặc album"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
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
          </form>
        </div>
        <div className="user-actions" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Nút debug - xóa sau khi debug xong */}
          {/* Hiển thị badge premium nếu user là premium */}
          {user?.is_premium && (
            <div className="premium-badge">
              <FaCrown style={{ color: "#FFD700" }} />
              <span>Premium</span>
            </div>
          )}

          {/* Nếu không phải premium, hiển thị nút nâng cấp */}
          {!user?.is_premium && (
            <button
              className="upgrade-premium-btn"
              onClick={handlePremiumAction}
              title="Nâng cấp lên Premium"
            >
              <FaCrown style={{ color: "#FFD700", marginRight: "5px" }} />
              <span>Nâng cấp</span>
            </button>
          )}

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
              {user?.is_premium && <FaCrown style={{ color: "#FFD700", fontSize: "0.8rem", marginLeft: "5px" }} />}
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
                    {user?.is_premium && (
                      <span className="premium-tag">Premium</span>
                    )}
                  </div>
                </div>

                <div className="profile-menu-items">
                  <button className="profile-menu-item" onClick={openProfileModal}>
                    <FaUserEdit />
                    <span>Thông tin người dùng</span>
                  </button>

                  <button className="profile-menu-item" onClick={handlePremiumAction}>
                    {user?.is_premium ? (
                      <>
                        <FaMoneyBill style={{ color: "#FFD700" }} />
                        <span>Hủy gói Premium</span>
                      </>
                    ) : (
                      <>
                        <FaMoneyBill />
                        <span>Nâng cấp tài khoản</span>
                      </>
                    )}
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

      {/* User Profile Modal */}
      {showProfileModal && createPortal(
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
        />,
        document.body
      )}

      {/* Premium Modal */}
      {showPremiumModal && createPortal(
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          isPremium={user?.is_premium}
          onTogglePremium={togglePremiumStatus}
          isLoading={isPremiumLoading}
        />,
        document.body
      )}
    </>
  );
};

export default Navbar;
