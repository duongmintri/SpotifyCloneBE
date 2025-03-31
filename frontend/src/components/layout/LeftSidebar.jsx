import React from "react";
import { FaHome, FaSearch, FaBook, FaPlus, FaHeart } from "react-icons/fa";

const LeftSidebar = () => {
  return (
    <>
      <ul className="nav-menu">
        <li className="active">
          <FaHome />
          <span>Home</span>
        </li>
        <li>
          <FaSearch />
          <span>Search</span>
        </li>
        <li>
          <FaBook />
          <span>Your Library</span>
        </li>
      </ul>
      
      <ul className="nav-menu">
        <li>
          <FaPlus style={{ backgroundColor: '#b3b3b3', color: 'black', padding: '5px', borderRadius: '2px', fontSize: '1.2rem' }} />
          <span>Create Playlist</span>
        </li>
        <li>
          <FaHeart style={{ background: 'linear-gradient(135deg, #450af5, #c4efd9)', padding: '5px', borderRadius: '2px', fontSize: '1.2rem' }} />
          <span>Liked Songs</span>
        </li>
      </ul>
      
      <div className="playlists-section">
        <h2>Playlists</h2>
        <ul
          className="playlist-list"
          style={{
            maxHeight: '400px', // Giới hạn chiều cao danh sách playlist
            overflowY: 'auto',  // Bật cuộn dọc
          }}
        >
          <li>🎵 Urban Nights</li>
          <li>🎶 Coastal Dreaming</li>
          <li>💿 Eastern Dreams</li>
          <li>🔥 Test Album</li>
          <li>⚡ House Party Mix</li>
          <li>🎹 Piano Classics</li>
          <li>🎸 Rock Anthems</li>
          <li>🎧 Lo-Fi Beats</li>
          <li>🏝️ Summer Hits</li>
        </ul>
      </div>
    </>
  );
};

export default LeftSidebar;