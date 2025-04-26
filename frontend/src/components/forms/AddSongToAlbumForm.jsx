import React, { useState, useEffect } from 'react';
import { getSongs } from '../../services/musicApi';
import { FaSearch, FaPlus } from 'react-icons/fa';
import './AddSongToAlbumForm.css';

const AddSongToAlbumForm = ({ albumId, onAddSong, onCancel }) => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy danh sách bài hát khi component được mount
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true);
        const data = await getSongs();
        // Lọc bỏ các bài hát đã có trong album
        const availableSongs = data.filter(song => !song.album || song.album.id !== parseInt(albumId));
        setSongs(availableSongs);
        setFilteredSongs(availableSongs);
        setError('');
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bài hát:', error);
        setError('Không thể tải danh sách bài hát. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [albumId]);

  // Lọc bài hát theo từ khóa tìm kiếm
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSongs(songs);
    } else {
      const filtered = songs.filter(song => 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (song.artist && song.artist.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSongs(filtered);
    }
  }, [searchTerm, songs]);

  // Xử lý khi thay đổi từ khóa tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Xử lý khi thêm bài hát vào album
  const handleAddSong = (songId) => {
    if (onAddSong) {
      onAddSong(songId);
    }
  };

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="add-song-form">
        <div className="loading-message">Đang tải danh sách bài hát...</div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="add-song-form">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="add-song-form">
      <h3>Thêm bài hát vào album</h3>
      
      <div className="search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm bài hát..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      
      <div className="songs-list">
        {filteredSongs.length > 0 ? (
          filteredSongs.map(song => (
            <div key={song.id} className="song-item">
              <div className="song-info">
                <div className="song-image">
                  <img 
                    src={song.cover_image || "/src/assets/images/cover-images/3.jpg"} 
                    alt={song.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/src/assets/images/cover-images/3.jpg";
                    }}
                  />
                </div>
                <div className="song-details">
                  <div className="song-title">{song.title}</div>
                  <div className="song-artist">{song.artist?.name || 'Unknown Artist'}</div>
                </div>
              </div>
              <button 
                className="add-button"
                onClick={() => handleAddSong(song.id)}
                title="Thêm vào album"
              >
                <FaPlus />
              </button>
            </div>
          ))
        ) : (
          <div className="empty-message">
            {searchTerm ? 'Không tìm thấy bài hát phù hợp.' : 'Không có bài hát nào khả dụng.'}
          </div>
        )}
      </div>
      
      <div className="form-actions">
        <button className="cancel-button" onClick={onCancel}>Hủy</button>
      </div>
    </div>
  );
};

export default AddSongToAlbumForm;
