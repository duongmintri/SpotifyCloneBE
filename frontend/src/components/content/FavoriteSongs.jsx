import React, { useState, useEffect } from 'react';
import { getFavoriteSongs } from '../../services/musicApi';
import SongList from './SongList';
import './FavoriteSongs.css';

const FavoriteSongs = () => {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy danh sách bài hát yêu thích khi component được mount
  useEffect(() => {
    const fetchFavoriteSongs = async () => {
      try {
        setIsLoading(true);
        const data = await getFavoriteSongs();
        setSongs(data);
        setError('');
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bài hát yêu thích:', error);
        setError('Không thể tải danh sách bài hát yêu thích. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteSongs();
  }, []);

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="favorite-songs-container">
        <div className="loading-message">Đang tải danh sách bài hát yêu thích...</div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="favorite-songs-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Hiển thị khi không có bài hát yêu thích nào
  if (songs.length === 0) {
    return (
      <div className="favorite-songs-container">
        <h2>Bài hát yêu thích</h2>
        <div className="empty-message">
          <p>Bạn chưa có bài hát yêu thích nào.</p>
          <p>Hãy thêm bài hát vào danh sách yêu thích bằng cách nhấn vào biểu tượng trái tim.</p>
        </div>
      </div>
    );
  }

  // Hiển thị danh sách bài hát yêu thích
  return (
    <div className="favorite-songs-container">
      <h2>Bài hát yêu thích</h2>
      <SongList songs={songs} onSongRemoved={(songId) => {
        // Cập nhật danh sách khi bài hát bị xóa khỏi yêu thích
        setSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
      }} />
    </div>
  );
};

export default FavoriteSongs;
