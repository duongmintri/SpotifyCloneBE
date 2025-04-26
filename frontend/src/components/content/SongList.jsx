import React from 'react';
import { FaPlay, FaPause, FaEllipsisH, FaTrash } from 'react-icons/fa';
import usePlayerStore from '../../store/playerStore';
import FavoriteButton from '../common/FavoriteButton';
import './SongList.css';

const SongList = ({ songs, onSongRemoved, onRemoveSong, showAlbum = true }) => {
  const {
    currentSong,
    isPlaying,
    setCurrentSong,
    setIsPlaying,
    setQueue
  } = usePlayerStore();

  // Xử lý khi click vào nút phát
  const handlePlay = (song) => {
    // Nếu bài hát này đang phát, tạm dừng
    if (currentSong?.id === song.id && isPlaying) {
      setIsPlaying(false);
      return;
    }

    // Nếu bài hát này đã được chọn nhưng đang tạm dừng, tiếp tục phát
    if (currentSong?.id === song.id && !isPlaying) {
      setIsPlaying(true);
      return;
    }

    // Nếu là bài hát mới, đặt làm bài hát hiện tại và phát
    setQueue(songs, songs.findIndex(s => s.id === song.id));
    setCurrentSong(song);
    setIsPlaying(true);
  };

  // Format thời lượng từ giây sang mm:ss
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Xử lý khi bài hát bị xóa khỏi danh sách yêu thích
  const handleFavoriteToggle = (songId, isFavorite) => {
    if (!isFavorite && onSongRemoved) {
      onSongRemoved(songId);
    }
  };

  return (
    <div className="song-list">
      <div className="song-list-header">
        <div className="song-number">#</div>
        <div className="song-title">Tiêu đề</div>
        {showAlbum && <div className="song-album">Album</div>}
        <div className="song-duration">Thời lượng</div>
        <div className="song-actions"></div>
      </div>

      <div className="song-list-body">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className={`song-item ${currentSong?.id === song.id ? 'active' : ''}`}
          >
            <div className="song-number">
              {currentSong?.id === song.id && isPlaying ? (
                <FaPause
                  className="song-play-icon"
                  onClick={() => handlePlay(song)}
                />
              ) : (
                <div className="song-number-container">
                  <span className="song-index">{index + 1}</span>
                  <FaPlay
                    className="song-play-icon"
                    onClick={() => handlePlay(song)}
                  />
                </div>
              )}
            </div>

            <div className="song-title">
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
              <div className="song-info">
                <div className="song-name">{song.title}</div>
                <div className="song-artist">{song.artist?.name || 'Unknown Artist'}</div>
              </div>
            </div>

            {showAlbum && (
              <div className="song-album">
                {song.album?.title || 'Single'}
              </div>
            )}

            <div className="song-duration">
              {formatDuration(song.duration)}
            </div>

            <div className="song-actions">
              <FavoriteButton
                songId={song.id}
                size="sm"
                onToggle={(isFavorite) => handleFavoriteToggle(song.id, isFavorite)}
              />
              {onRemoveSong && (
                <FaTrash
                  className="song-remove-icon"
                  onClick={() => onRemoveSong(song.id)}
                  title="Xóa khỏi album"
                />
              )}
              <FaEllipsisH className="song-more-icon" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongList;
