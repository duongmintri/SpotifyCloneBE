import React, { useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { FaSpotify, FaHome, FaMusic, FaCompactDisc, FaUserAlt, FaSignOutAlt } from "react-icons/fa";
import { clearAdminAuthData, isAdminAuthenticated } from "../../services/adminApi";
import "../../styles/AdminStyles.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Kiểm tra xem người dùng đã đăng nhập admin chưa
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    clearAdminAuthData();
    navigate("/admin/login");
  };

  // Kiểm tra đường dẫn hiện tại để highlight menu item
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <FaSpotify className="admin-sidebar-logo" />
          <div className="admin-sidebar-title">Spotify Admin</div>
        </div>

        <ul className="admin-sidebar-menu">
          <Link
            to="/admin/dashboard"
            className={`admin-sidebar-menu-item ${isActive("/admin/dashboard") ? "active" : ""}`}
          >
            <FaHome className="admin-sidebar-menu-item-icon" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/songs"
            className={`admin-sidebar-menu-item ${isActive("/admin/songs") ? "active" : ""}`}
          >
            <FaMusic className="admin-sidebar-menu-item-icon" />
            <span>Bài hát</span>
          </Link>

          <Link
            to="/admin/albums"
            className={`admin-sidebar-menu-item ${isActive("/admin/albums") ? "active" : ""}`}
          >
            <FaCompactDisc className="admin-sidebar-menu-item-icon" />
            <span>Album</span>
          </Link>

          <Link
            to="/admin/artists"
            className={`admin-sidebar-menu-item ${isActive("/admin/artists") ? "active" : ""}`}
          >
            <FaUserAlt className="admin-sidebar-menu-item-icon" />
            <span>Nghệ sĩ</span>
          </Link>
        </ul>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="admin-logout-icon" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
