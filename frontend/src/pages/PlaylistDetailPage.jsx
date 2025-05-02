import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlaylistDetails, deletePlaylist } from '../services/musicApi';
import SongList from '../components/content/SongList';
import { FaArrowLeft, FaPlay, FaPause, FaTrash } from 'react-icons/fa';
import usePlayerStore from '../store/playerStore';
import usePlaylistStore from '../store/playlistStore';
import './PlaylistDetailPage.css';

// Thêm hàm xử lý xóa playlist
const handleDeletePlaylist = async (playlistId, navigate, removePlaylist) => {
  if (window.confirm('Bạn có chắc chắn muốn xóa playlist này không?')) {
    try {
      await deletePlaylist(playlistId);
      // Cập nhật store để xóa playlist khỏi danh sách
      removePlaylist(parseInt(playlistId));
      console.log("Đã xóa playlist ID:", playlistId, "khỏi store");
      navigate('/home'); // Chuyển hướng về trang chính
    } catch (error) {
      console.error('Lỗi khi xóa playlist:', error);
      alert('Không thể xóa playlist. Vui lòng thử lại sau.');
    }
  }
};

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { setQueue, setCurrentSong, setIsPlaying, isPlaying, currentSong } = usePlayerStore();
  const { removePlaylist } = usePlaylistStore();

  // Lấy thông tin chi tiết playlist
  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        setLoading(true);
        const data = await getPlaylistDetails(id);
        setPlaylist(data);
        setError(null);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin playlist:', error);
        setError('Không thể tải thông tin playlist. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlaylistDetails();
    }
  }, [id]);

  // Xử lý phát toàn bộ playlist
  const handlePlayAll = () => {
    if (!playlist || !playlist.songs || playlist.songs.length === 0) return;

    // Nếu đang phát playlist này, tạm dừng
    if (isPlaying && currentSong && playlist.songs.some(song => song.id === currentSong.id)) {
      setIsPlaying(false);
      return;
    }

    // Nếu không, bắt đầu phát từ đầu
    setQueue(playlist.songs, 0);
    setCurrentSong(playlist.songs[0]);
    setIsPlaying(true);
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="playlist-detail-page">
        <div className="loading-message">Đang tải thông tin playlist...</div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="playlist-detail-page">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Quay lại
        </button>
      </div>
    );
  }

  // Hiển thị khi không tìm thấy playlist
  if (!playlist) {
    return (
      <div className="playlist-detail-page">
        <div className="error-message">Không tìm thấy playlist</div>
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Quay lại
        </button>
      </div>
    );
  }

  // Lấy thông tin cần thiết từ playlist
  const { name, user, cover_image, songs = [] } = playlist;
  const playlistImage = cover_image || "/src/assets/images/cover-images/11.jpg";
  const createdBy = user?.username || 'Bạn';
  const songCount = songs.length;

  return (
    <div className="playlist-detail-page">
      <div className="playlist-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Quay lại
        </button>
        
        <div className="playlist-info">
          <div className="playlist-image">
            <img src={playlistImage} alt={name} />
          </div>
          <div className="playlist-details">
            <h1>{name}</h1>
            <p className="playlist-creator">Tạo bởi: {createdBy}</p>
            <p className="playlist-stats">{songCount} bài hát</p>
            
            <div className="playlist-actions">
              <button 
                className="play-all-button"
                onClick={handlePlayAll}
                disabled={songs.length === 0}
              >
                {isPlaying && currentSong && songs.some(song => song.id === currentSong.id) 
                  ? <><FaPause /> Tạm dừng</> 
                  : <><FaPlay /> Phát tất cả</>
                }
              </button>
              
              <button 
                className="delete-playlist-button"
                onClick={() => handleDeletePlaylist(id, navigate, removePlaylist)}
              >
                <FaTrash /> Xóa playlist
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="playlist-content">
        {songs.length > 0 ? (
          <SongList songs={songs} />
        ) : (
          <div className="empty-message">
            Playlist này chưa có bài hát nào. Hãy thêm bài hát vào playlist!
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetailPage;
