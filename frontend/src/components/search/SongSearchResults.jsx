import React, { useEffect } from 'react';
import { FaPlay, FaMusic } from 'react-icons/fa';
import useSearchStore from '../../store/searchStore';
import usePlayerStore from '../../store/playerStore';
import './SearchResults.css';

const SongSearchResults = ({ query }) => {
  const { 
    searchResults, 
    searchError, 
    isSearching,
    searchSongs
  } = useSearchStore();
  
  const { setCurrentSong, setIsPlaying } = usePlayerStore();

  // Tìm kiếm khi query thay đổi
  useEffect(() => {
    if (query && query.length >= 3) {
      searchSongs(query);
    }
  }, [query, searchSongs]);

  // Xử lý khi click vào bài hát
  const handleSongClick = (song) => {
    setCurrentSong(song);
    setTimeout(() => {
      setIsPlaying(true);
    }, 100); // Đợi một chút để đảm bảo bài hát đã được thiết lập
  };

  // Hiển thị loading
  if (isSearching) {
    return <div className="loading-message">Đang tìm kiếm...</div>;
  }

  // Hiển thị lỗi
  if (searchError) {
    return <div className="error-message">{searchError}</div>;
  }

  // Kiểm tra xem có kết quả tìm kiếm không
  const hasSongs = searchResults.songs && searchResults.songs.length > 0;

  // Hiển thị khi không có kết quả tìm kiếm
  if (!hasSongs && query && query.length >= 3) {
    return <div className="no-results-message">Không tìm thấy bài hát nào cho "{query}"</div>;
  }

  // Hiển thị khi chưa tìm kiếm
  if (!query || query.length < 3) {
    return <div className="search-prompt">Nhập ít nhất 3 ký tự để tìm kiếm</div>;
  }

  // Hiển thị kết quả tìm kiếm
  return (
    <div className="song-search-results">
      <h2>Kết quả tìm kiếm cho "{query}"</h2>
      
      {hasSongs && (
        <div className="songs-list full-list">
          {searchResults.songs.map(song => (
            <div key={song.id} className="song-item" onClick={() => handleSongClick(song)}>
              <div className="song-cover">
                {song.cover_image ? (
                  <img src={song.cover_image} alt={song.title} />
                ) : (
                  <div className="default-cover"><FaMusic /></div>
                )}
                <div className="play-overlay"><FaPlay /></div>
              </div>
              <div className="song-info">
                <div className="song-title">{song.title}</div>
                <div className="song-artist">{song.artist?.name || 'Unknown Artist'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SongSearchResults;
