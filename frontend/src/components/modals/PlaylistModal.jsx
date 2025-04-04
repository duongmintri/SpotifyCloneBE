import React from 'react';
import { FaTimes } from 'react-icons/fa';

const PlaylistModal = ({ isOpen, onClose }) => {
  // Dữ liệu tạm thời cho playlist
  const currentPlaylist = [
    { title: 'Inner Light', artist: 'Shocking Lemon', duration: '3:45' },
    { title: 'Starlight', artist: 'Another Artist', duration: '4:12' },
    { title: 'Purple Sunset', artist: 'Jazz Combo', duration: '3:30' },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target.classList.contains('modal-overlay')) {
          onClose();
        }
      }}
    >
      <div className="modal-container playlist-modal">
        <div className="modal-header">
          <h2 className="modal-title">Playlist hiện tại</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-content">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {currentPlaylist.map((song, index) => (
              <li
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px',
                  borderBottom: '1px solid #ccc',
                }}
              >
                <span>{song.title} - {song.artist}</span>
                <span>{song.duration}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;