import React, { useEffect } from "react";
import { FaHome, FaPlus, FaHeart, FaCompactDisc } from "react-icons/fa";
import { Link } from "react-router-dom";
import usePlaylistStore from "../../store/playlistStore";
import { getPlaylistCoverImage } from "../../utils/imageUtils"; // Import hàm tiện ích

const LeftSidebar = () => {
  const { playlists, loading, error, fetchPlaylists } = usePlaylistStore();

  useEffect(() => {
    console.log("LeftSidebar: Fetching playlists");
    fetchPlaylists();
  }, [fetchPlaylists]);

  // Log khi playlists thay đổi
  useEffect(() => {
    console.log("LeftSidebar: Playlists updated", playlists);
  }, [playlists]);

  return (
    <div className="left-sidebar">
      <div className="library-section">
        <ul className="nav-menu">
        </ul>
      </div>

      <ul className="nav-menu">
        <li>
          <Link to="/home">
            <FaHome />
            <span>Trang chủ</span>
          </Link>
        </li>
        <li>
          <Link to="/albums">
            <FaCompactDisc
              style={{
                backgroundColor: "#b3b3b3",
                color: "black",
                padding: "5px",
                borderRadius: "2px",
                fontSize: "1.2rem",
              }}
            />
            <span>Albums</span>
          </Link>
        </li>
        <li>
          <Link to="/favorites">
            <FaHeart
              style={{
                background: "linear-gradient(135deg, #450af5, #c4efd9)",
                padding: "5px",
                borderRadius: "2px",
                fontSize: "1.2rem",
              }}
            />
            <span>Bài hát yêu thích</span>
          </Link>
        </li>
        <li>
          <Link to="/playlists/create" className="nav-link">
            <FaPlus />
            <span>Tạo Playlist</span>
          </Link>
        </li>
      </ul>

      <div className="playlists-section">
        <h2>Playlists</h2>
        <div className="playlist-card-container">
          {loading ? (
            <div className="loading-playlists">Đang tải...</div>
          ) : error ? (
            <div className="error-playlists">{error}</div>
          ) : playlists.length === 0 ? (
            <div className="empty-playlists">Chưa có playlist nào</div>
          ) : (
            playlists.map((playlist) => (
              <Link to={`/playlists/${playlist.id}`} key={playlist.id} className="playlist-link">
                <div className="playlist-card">
                  <div className="playlist-card-img-container">
                    <img
                      src={getPlaylistCoverImage(playlist)}
                      alt={playlist.name}
                      className="playlist-card-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/src/assets/images/cover-images/11.jpg";
                      }}
                    />
                  </div>
                  <div className="playlist-card-title">{playlist.name}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
