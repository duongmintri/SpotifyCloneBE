import React, { useState, useEffect } from "react";
import { FaMusic, FaCompactDisc, FaUserAlt, FaUsers } from "react-icons/fa";
import { getSongs, getAlbums, getArtists, getUsers } from "../../services/adminApi";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    songs: 0,
    albums: 0,
    artists: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Lấy dữ liệu từ các API
        const songs = await getSongs();
        const albums = await getAlbums();
        const artists = await getArtists();
        const users = await getUsers();
        
        // Cập nhật state với số lượng
        setStats({
          songs: songs.length,
          albums: albums.length,
          artists: artists.length,
          users: users.length,
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error);
        setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return <div className="admin-loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header-title">Dashboard</h1>
      </div>
      
      <div className="admin-dashboard-stats">
        <div className="admin-stat-card">
          <FaMusic className="admin-stat-icon" />
          <div className="admin-stat-title">Bài hát</div>
          <div className="admin-stat-value">{stats.songs}</div>
        </div>
        
        <div className="admin-stat-card">
          <FaCompactDisc className="admin-stat-icon" />
          <div className="admin-stat-title">Album</div>
          <div className="admin-stat-value">{stats.albums}</div>
        </div>
        
        <div className="admin-stat-card">
          <FaUserAlt className="admin-stat-icon" />
          <div className="admin-stat-title">Nghệ sĩ</div>
          <div className="admin-stat-value">{stats.artists}</div>
        </div>
        
        <div className="admin-stat-card">
          <FaUsers className="admin-stat-icon" />
          <div className="admin-stat-title">Người dùng</div>
          <div className="admin-stat-value">{stats.users}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
