import React from 'react';
import { FaPlay, FaPause, FaTrash } from 'react-icons/fa';
import usePlayerStore from '../../store/playerStore';
import './SongList.css';

const SongPlaylist = ({ songs, onSongRemoved }) => {
  const {
    currentSong,
    isPlaying,
    setCurrentSong,
    setIsPlaying,
    setQueue
  } = usePlayerStore();

  // Xử lý khi click vào bài hát
  const handlePlaySong = (song, index) => {
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
    // Đảm bảo mỗi bài hát trong queue có artist được xử lý đúng cách
    const processedSongs = songs.map(s => {
      // Tạo bản sao của bài hát
      const processedSong = { ...s };

      // Giữ nguyên đối tượng artist để đảm bảo thông tin đầy đủ
      // Việc xử lý hiển thị sẽ được thực hiện ở component hiển thị

      return processedSong;
    });

    setQueue(processedSongs, processedSongs.findIndex(s => s.id === song.id));
    setCurrentSong({ ...song });
    setIsPlaying(true);
  };

  // Format thời lượng từ giây sang mm:ss
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Xử lý khi xóa bài hát khỏi playlist
  const handleRemoveSong = (e, songId) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
    console.log("Removing song with ID:", songId);
    if (onSongRemoved) {
      onSongRemoved(songId);
    } else {
      console.warn("onSongRemoved function not provided");
    }
  };

  return (
    <div className="song-list">
      <table className="song-table">
        <thead>
          <tr>
            <th className="song-number-col">#</th>
            <th className="song-image-col"></th>
            <th className="song-title-col">Tiêu đề</th>
            <th className="song-artist-col">Nghệ sĩ</th>
            <th className="song-duration-col">Thời lượng</th>
            <th className="song-actions-col"></th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => {
            const isCurrentSong = currentSong && currentSong.id === song.id;
            const formattedDuration = formatDuration(song.duration);
            let artistName = 'Unknown Artist';
            if (song.artist) {
              if (typeof song.artist === 'string') {
                artistName = song.artist;
              } else if (typeof song.artist === 'object') {
                artistName = song.artist.name || song.artist.id || 'Unknown Artist';
              }
            }

            return (
              <tr
                key={song.id}
                className={`song-row ${isCurrentSong ? 'active' : ''}`}
                onClick={() => handlePlaySong(song, index)}
              >
                <td className="song-number-cell">
                  {isCurrentSong && isPlaying ? (
                    <FaPause className="song-playing-icon" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </td>
                <td className="song-image-cell">
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
                </td>
                <td className="song-title-cell">
                  <div className="song-title">{song.title}</div>
                </td>
                <td className="song-artist-cell">{artistName}</td>
                <td className="song-duration-cell">{formattedDuration}</td>
                <td className="song-actions-cell">
                  <button
                    className="song-action-btn remove-btn"
                    onClick={(e) => handleRemoveSong(e, song.id)}
                    title="Xóa khỏi playlist"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SongPlaylist;