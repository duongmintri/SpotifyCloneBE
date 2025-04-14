import React from 'react';
import { FaTimes, FaPlay, FaEllipsisH } from 'react-icons/fa';

const PlaylistPopup = ({ isOpen, onClose }) => {
  // Dữ liệu playlist mẫu
  const playlist = [
    { id: 1, title: 'Inner Light', artist: 'Shocking Lemon', duration: '3:45', current: true },
    { id: 2, title: 'Blue Bird', artist: 'Ikimono Gakari', duration: '3:38', current: false },
    { id: 3, title: 'Sign', artist: 'FLOW', duration: '4:01', current: false },
    { id: 4, title: 'Silhouette', artist: 'KANA-BOON', duration: '4:23', current: false },
    { id: 5, title: 'Haruka Kanata', artist: 'ASIAN KUNG-FU GENERATION', duration: '3:40', current: false },
    { id: 6, title: 'GO!!!', artist: 'FLOW', duration: '4:05', current: false },
    { id: 7, title: 'Diver', artist: 'NICO Touches the Walls', duration: '3:51', current: false },
  ];

  if (!isOpen) return null;

  return (
    <div className="playlist-popup-container">
      <div className="playlist-popup-header">
        <h2>Danh sách phát hiện tại</h2>
        <button
          className="playlist-popup-close-btn"
          onClick={onClose}
          aria-label="Đóng"
        >
          <FaTimes />
        </button>
      </div>
      <div className="playlist-popup-content">
        <div className="playlist-info">
          <div className="playlist-cover">
            <img src="/src/assets/images/cover-images/3.jpg" alt="Playlist Cover" />
            <div className="playlist-play-btn">
              <FaPlay />
            </div>
          </div>
          <div className="playlist-details">
            <h3 className="playlist-title">Anime Hits</h3>
            <p className="playlist-subtitle">7 bài hát • 27 phút</p>
          </div>
        </div>
        <div className="playlist-tracks">
          <div className="playlist-table-header">
            <div className="track-number">#</div>
            <div className="track-info">Tiêu đề</div>
            <div className="track-duration">Thời lượng</div>
            <div className="track-actions"></div>
          </div>
          <div className="playlist-tracks-list">
            {playlist.map((track, index) => (
              <div
                key={track.id}
                className={`playlist-track ${track.current ? 'current-track' : ''}`}
              >
                <div className="track-number">{index + 1}</div>
                <div className="track-info">
                  <div className="track-title">{track.title}</div>
                  <div className="track-artist">{track.artist}</div>
                </div>
                <div className="track-duration">{track.duration}</div>
                <div className="track-actions">
                  <button className="track-action-btn">
                    <FaEllipsisH />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPopup;