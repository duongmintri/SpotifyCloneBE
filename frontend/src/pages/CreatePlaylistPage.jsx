import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePlaylistStore from '../store/playlistStore';
import './CreatePlaylistPage.css';

const CreatePlaylistPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Lấy hàm createPlaylist từ store
  const { createPlaylist } = usePlaylistStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Vui lòng nhập tên playlist');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const playlistData = {
        name,
        description,
        is_public: isPublic
      };
      
      console.log("Creating playlist with data:", playlistData);
      const newPlaylist = await createPlaylist(playlistData);
      console.log('Playlist created:', newPlaylist);
      
      // Chuyển hướng đến trang chi tiết playlist
      navigate(`/playlists/${newPlaylist.id}`);
    } catch (error) {
      console.error('Error creating playlist:', error);
      setError('Không thể tạo playlist. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-playlist-page">
      <h1>Tạo Playlist Mới</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="playlist-form">
        <div className="form-group">
          <label htmlFor="name">Tên playlist</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên playlist"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Mô tả (tùy chọn)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả (tùy chọn)"
          />
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="is-public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <label htmlFor="is-public">Công khai</label>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate(-1)}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="create-button"
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo playlist'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlaylistPage;
