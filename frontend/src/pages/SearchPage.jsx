import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaPlay, FaMusic, FaUser, FaSpinner } from 'react-icons/fa';
import { searchSongs } from '../services/musicApi';
import usePlayerStore from '../store/playerStore';
import './SearchPage.css';

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setCurrentSong, setIsPlaying, queue, setQueue } = usePlayerStore();

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      
      try {
        setIsLoading(true);
        setError('');
        
        console.log('Đang tìm kiếm:', searchQuery);
        const searchResults = await searchSongs(searchQuery);
        console.log('Kết quả tìm kiếm:', searchResults);
        
        setResults(searchResults);
      } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
        setError('Không thể tìm kiếm. Vui lòng thử lại sau.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [searchQuery]);

  const handlePlaySong = (song) => {
    // Nếu bài hát này chưa có trong queue, thêm vào
    if (!queue.some(item => item.id === song.id)) {
      setQueue([...queue, song], queue.length);
    }
    
    setCurrentSong(song);
    setIsPlaying(true);
  };

  // Lọc kết quả theo loại
  const songs = results.filter(item => item.type === 'song' || !item.type);
  const artists = results.filter(item => item.type === 'artist');
  const albums = results.filter(item => item.type === 'album');

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Kết quả tìm kiếm: "{searchQuery}"</h1>
      </div>
      
      {isLoading ? (
        <div className="search-loading">
          <FaSpinner className="loading-spinner" />
          <p>Đang tìm kiếm...</p>
        </div>
      ) : error ? (
        <div className="search-error">
          <p>{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="no-results">
          <p>Không tìm thấy kết quả nào cho "{searchQuery}"</p>
        </div>
      ) : (
        <div className="search-results">
          {songs.length > 0 && (
            <div className="search-section">
              <h2>Bài hát</h2>
              <div className="search-grid songs-grid">
                {songs.map(song => (
                  <div key={song.id} className="search-item song-item">
                    <div className="search-item-image">
                      <img 
                        src={song.cover_image || "/src/assets/images/cover-images/3.jpg"} 
                        alt={song.title} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/src/assets/images/cover-images/3.jpg";
                        }}
                      />
                      <button 
                        className="play-button"
                        onClick={() => handlePlaySong(song)}
                      >
                        <FaPlay />
                      </button>
                    </div>
                    <div className="search-item-info">
                      <h3 className="search-item-title">{song.title}</h3>
                      <p className="search-item-subtitle">
                        <FaMusic className="search-icon" />
                        {typeof song.artist === 'object' ? song.artist.name : song.artist || 'Unknown Artist'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {artists.length > 0 && (
            <div className="search-section">
              <h2>Nghệ sĩ</h2>
              <div className="search-grid artists-grid">
                {artists.map(artist => (
                  <div key={artist.id} className="search-item artist-item">
                    <div className="search-item-image artist-image">
                      <img 
                        src={artist.image || "/src/assets/images/default-artist.jpg"} 
                        alt={artist.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/src/assets/images/default-artist.jpg";
                        }}
                      />
                    </div>
                    <div className="search-item-info">
                      <h3 className="search-item-title">{artist.name}</h3>
                      <p className="search-item-subtitle">
                        <FaUser className="search-icon" />
                        Nghệ sĩ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {albums.length > 0 && (
            <div className="search-section">
              <h2>Album</h2>
              <div className="search-grid albums-grid">
                {albums.map(album => (
                  <div key={album.id} className="search-item album-item">
                    <div className="search-item-image">
                      <img 
                        src={album.cover_image || "/src/assets/images/cover-images/3.jpg"} 
                        alt={album.title} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/src/assets/images/cover-images/3.jpg";
                        }}
                      />
                      <button 
                        className="play-button"
                        onClick={() => {
                          // Xử lý phát album
                        }}
                      >
                        <FaPlay />
                      </button>
                    </div>
                    <div className="search-item-info">
                      <h3 className="search-item-title">{album.title}</h3>
                      <p className="search-item-subtitle">
                        {album.artist || 'Various Artists'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;