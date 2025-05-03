import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlaylistDetails, deletePlaylist, removeSongFromPlaylist } from '../services/musicApi';
import SongList from '../components/content/SongList';
import { FaArrowLeft, FaPlay, FaPause, FaTrash } from 'react-icons/fa';
import usePlayerStore from '../store/playerStore';
import usePlaylistStore from '../store/playlistStore';
import { getPlaylistCoverImage } from '../utils/imageUtils';
import { showSuccessToast, showErrorToast, showConfirmToast } from '../utils/toast.jsx';
import './PlaylistDetailPage.css';

// Xóa các hàm thông báo cũ
// const showSuccessToast = (message) => {
//   alert(message);
// };
// 
// const showErrorToast = (message) => {
//   alert(message);
// };

// Thêm hàm xử lý xóa playlist
const handleDeletePlaylist = async (playlistId, navigate, removePlaylist) => {
  showConfirmToast(
    'Bạn có chắc chắn muốn xóa playlist này không?',
    async () => {
      try {
        await deletePlaylist(playlistId);
        // Cập nhật store để xóa playlist khỏi danh sách
        removePlaylist(parseInt(playlistId));
        console.log("Đã xóa playlist ID:", playlistId, "khỏi store");
        showSuccessToast('Đã xóa playlist thành công!');
        setTimeout(() => {
          navigate('/home'); // Chuyển hướng về trang chính
        }, 1000);
      } catch (error) {
        console.error('Lỗi khi xóa playlist:', error);
        showErrorToast('Không thể xóa playlist. Vui lòng thử lại sau.');
      }
    },
    () => {
      // Hàm này sẽ được gọi khi người dùng nhấn "Hủy"
      console.log("Đã hủy xóa playlist");
    }
  );
};

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { setQueue, setCurrentSong, setIsPlaying, isPlaying, currentSong } = usePlayerStore();
  const { removePlaylist } = usePlaylistStore();

  // Thêm hàm xử lý xóa bài hát khỏi playlist
  const handleRemoveSong = async (songId) => {
    showConfirmToast(
      'Bạn có chắc chắn muốn xóa bài hát này khỏi playlist?',
      async () => {
        try {
          await removeSongFromPlaylist(id, songId);
          // Cập nhật lại danh sách bài hát
          const updatedPlaylist = await getPlaylistDetails(id);
          setPlaylist(updatedPlaylist);
          showSuccessToast('Đã xóa bài hát khỏi playlist thành công!');
        } catch (error) {
          console.error('Lỗi khi xóa bài hát khỏi playlist:', error);
          showErrorToast('Không thể xóa bài hát khỏi playlist. Vui lòng thử lại sau.');
        }
      },
      () => {
        console.log("Đã hủy xóa bài hát khỏi playlist");
      }
    );
  };

  // Lấy thông tin chi tiết playlist
  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        setLoading(true);
        const data = await getPlaylistDetails(id);
        console.log("Playlist details fetched:", data);
        console.log("Playlist songs:", data.songs);
        
        // Kiểm tra xem songs có phải là mảng không
        if (data.songs && Array.isArray(data.songs)) {
          console.log("Songs is an array with", data.songs.length, "items");
          
          // Kiểm tra từng bài hát
          data.songs.forEach((song, index) => {
            console.log(`Song ${index}:`, song);
            console.log(`Song ${index} cover_image:`, song.cover_image);
          });
        } else {
          console.log("Songs is not an array or is empty:", data.songs);
        }
        
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

    try {
      console.log("Playlist songs:", JSON.stringify(playlist.songs, null, 2));
      
      // Đảm bảo songs là mảng các đối tượng bài hát hợp lệ
      const validSongs = playlist.songs.map(song => {
        // Kiểm tra và đảm bảo song là đối tượng hợp lệ
        if (typeof song !== 'object' || song === null) {
          console.error('Invalid song object:', song);
          return null;
        }
        
        // Kiểm tra từng trường dữ liệu
        const processedSong = {
          id: song.id,
          title: song.title || "Unknown Title",
          artist: typeof song.artist === 'object' ? song.artist.name : song.artist || "Unknown Artist",
          album: song.album ? (typeof song.album === 'object' ? song.album.title : song.album) : "Unknown Album",
          cover_image: song.cover_image || "/src/assets/images/cover-images/11.jpg",
          audio_file: song.file_path || ""
        };
        
        console.log("Processed song:", processedSong);
        return processedSong;
      }).filter(song => song !== null);

      console.log("Valid songs for queue:", validSongs);

      // Nếu không, bắt đầu phát từ đầu
      const firstSong = validSongs[0];
      setQueue(validSongs, 0);
      setCurrentSong(firstSong);
      
      // Đảm bảo đã set current song trước khi phát
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    } catch (error) {
      console.error('Error in handlePlayAll:', error);
      setError('Không thể phát playlist. Vui lòng thử lại sau.');
    }
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
            {/* Log thông tin trước khi render */}
            {console.log("Rendering playlist image for:", playlist)}
            {console.log("Using getPlaylistCoverImage:", getPlaylistCoverImage(playlist))}
            
            <img 
              src={getPlaylistCoverImage(playlist)} 
              alt={name}
              onError={(e) => {
                console.log("Image error, using fallback");
                e.target.onerror = null;
                e.target.src = "/src/assets/images/cover-images/11.jpg";
              }}
            />
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
          <SongList 
            songs={songs} 
            onSongRemoved={handleRemoveSong} 
          />
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
