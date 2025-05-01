import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlaylists } from '../../services/musicApi';
import MusicCard from './MusicCard';
import { FaPlus } from 'react-icons/fa';
import './PlaylistList.css';

const PlaylistList = () => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy danh sách playlist khi component được mount
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setIsLoading(true);
        const data = await getPlaylists();
        setPlaylists(data);
        setError('');
      } catch (error) {
        console.error('Lỗi khi lấy danh sách playlist:', error);
        setError('Không thể tải danh sách playlist. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="playlist-list-container">
        <div className="loading-message">Đang tải danh sách playlist...</div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="playlist-list-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Hiển thị khi không có playlist nào
  if (playlists.length === 0) {
    return (
      <div className="playlist-list-container">
        <div className="playlist-header">
          <h2>Playlist của bạn</h2>
          <Link to="/playlists/create" className="create-playlist-button">
            <FaPlus /> Tạo Playlist
          </Link>
        </div>
        <div className="empty-message">Bạn chưa có playlist nào. Hãy tạo playlist đầu tiên!</div>
      </div>
    );
  }

  // Hiển thị danh sách playlist
  return (
    <div className="playlist-list-container">
      <div className="playlist-header">
        <h2>Playlist của bạn</h2>
        <Link to="/playlists/create" className="create-playlist-button">
          <FaPlus /> Tạo Playlist
        </Link>
      </div>
      <div className="playlist-grid">
        {playlists.map(playlist => (
          <Link to={`/playlists/${playlist.id}`} key={playlist.id} className="playlist-card-link">
            <MusicCard
              song={{
                id: `playlist-${playlist.id}`,
                title: playlist.name,
                artist: playlist.user?.username || 'Bạn',
                cover_image: playlist.cover_image || "/src/assets/images/cover-images/11.jpg"
              }}
              isPlaying={false}
              showPlayButton={false}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PlaylistList;