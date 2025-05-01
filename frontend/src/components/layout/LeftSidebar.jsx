import React from "react";
import { FaHome, FaPlus, FaHeart, FaCompactDisc } from "react-icons/fa";
import { Link } from "react-router-dom";

const playlists = [
  { name: "Urban Nights", image: "./src/assets/images/cover-images/5.jpg" },
  { name: "Coastal Dreaming", image: "./src/assets/images/cover-images/5.jpg" },
];

const LeftSidebar = () => {
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
          {playlists.map((playlist, index) => (
            <div className="playlist-card" key={index}>
              <div className="playlist-card-img-container">
                <img
                  src={playlist.image}
                  alt={playlist.name}
                  className="playlist-card-img"
                />
                <div className="play-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="playlist-card-title">{playlist.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
