import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import { getPlaylists, addSongToPlaylist } from '../../services/musicApi';
import { showSuccessToast, showErrorToast } from '../../utils/toast.jsx';
import { getPlaylistCoverImage } from '../../utils/imageUtils';
import './AddToPlaylistModal.css';

const AddToPlaylistModal = ({ isOpen, onClose, songId }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);

  // Lấy danh sách playlist khi modal được mở
  useEffect(() => {
    if (isOpen && songId) {
      fetchPlaylists();
    }
  }, [isOpen, songId]);

  // Lấy danh sách playlist
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const data = await getPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách playlist:', error);
      showErrorToast('Không thể tải danh sách playlist. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi thêm bài hát vào playlist
  const handleAddToPlaylist = async (playlistId) => {
    if (!songId) return;

    try {
      setAddingToPlaylist(playlistId);
      await addSongToPlaylist(playlistId, songId);
      showSuccessToast('Đã thêm bài hát vào playlist thành công!');
    } catch (error) {
      console.error('Lỗi khi thêm bài hát vào playlist:', error);
      showErrorToast('Không thể thêm bài hát vào playlist. Vui lòng thử lại sau.');
    } finally {
      setAddingToPlaylist(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-to-playlist-modal-overlay" onClick={onClose}>
      <div className="add-to-playlist-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-to-playlist-modal-header">
          <h2>Thêm vào Playlist</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="add-to-playlist-modal-content">
          {loading ? (
            <div className="loading-message">Đang tải danh sách playlist...</div>
          ) : playlists.length === 0 ? (
            <div className="empty-message">
              <p>Bạn chưa có playlist nào.</p>
              <a href="/playlists/create" className="create-playlist-link" onClick={(e) => {
                e.preventDefault();
                onClose();
                window.location.href = '/playlists/create';
              }}>
                <FaPlus /> Tạo Playlist mới
              </a>
            </div>
          ) : (
            <ul className="playlist-list">
              {playlists.map((playlist) => (
                <li key={playlist.id} className="playlist-item">
                  <div className="playlist-info">
                    <div className="playlist-image">
                      <img 
                        src={getPlaylistCoverImage(playlist)} 
                        alt={playlist.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/src/assets/images/cover-images/11.jpg";
                        }}
                      />
                    </div>
                    <div className="playlist-name">{playlist.name}</div>
                  </div>
                  <button 
                    className="add-button"
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    disabled={addingToPlaylist === playlist.id}
                  >
                    {addingToPlaylist === playlist.id ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      <FaPlus />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
