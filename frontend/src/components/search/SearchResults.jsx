import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSearchStore from '../../store/searchStore';
import usePlayerStore from '../../store/playerStore';
import { FaPlay, FaMusic, FaCompactDisc, FaUser } from 'react-icons/fa';
import './SearchResults.css';

const SearchResults = ({ query }) => {
  const navigate = useNavigate();
  const {
    searchResults,
    searchError,
    isSearching,
    activeTab,
    setActiveTab,
    searchAll
  } = useSearchStore();

  const { setCurrentSong, setIsPlaying } = usePlayerStore();

  // Tìm kiếm khi query thay đổi
  useEffect(() => {
    if (query && query.length >= 3) {
      searchAll(query);
    }
  }, [query, searchAll]);

  // Xử lý khi click vào bài hát
  const handleSongClick = (song) => {
    setCurrentSong(song);
    setTimeout(() => {
      setIsPlaying(true);
    }, 100); // Đợi một chút để đảm bảo bài hát đã được thiết lập
  };

  // Xử lý khi click vào album
  const handleAlbumClick = (album) => {
    navigate(`/albums/${album.id}`);
  };

  // Xử lý khi click vào nghệ sĩ
  const handleArtistClick = (artist) => {
    // Có thể thêm trang chi tiết nghệ sĩ sau này
    console.log('Clicked on artist:', artist);
  };

  // Hiển thị loading
  if (isSearching) {
    return (
      <div className="search-results-container">
        <div className="search-tabs">
          <button
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => setActiveTab('all')}
          >
            Tất cả
          </button>
          <button
            className={activeTab === 'songs' ? 'active' : ''}
            onClick={() => setActiveTab('songs')}
          >
            Bài hát
          </button>
          <button
            className={activeTab === 'albums' ? 'active' : ''}
            onClick={() => setActiveTab('albums')}
          >
            Album
          </button>
          <button
            className={activeTab === 'artists' ? 'active' : ''}
            onClick={() => setActiveTab('artists')}
          >
            Nghệ sĩ
          </button>
        </div>
        <div className="loading-message">Đang tìm kiếm...</div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (searchError) {
    return (
      <div className="search-results-container">
        <div className="search-tabs">
          <button
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => setActiveTab('all')}
          >
            Tất cả
          </button>
          <button
            className={activeTab === 'songs' ? 'active' : ''}
            onClick={() => setActiveTab('songs')}
          >
            Bài hát
          </button>
          <button
            className={activeTab === 'albums' ? 'active' : ''}
            onClick={() => setActiveTab('albums')}
          >
            Album
          </button>
          <button
            className={activeTab === 'artists' ? 'active' : ''}
            onClick={() => setActiveTab('artists')}
          >
            Nghệ sĩ
          </button>
        </div>
        <div className="error-message">{searchError}</div>
      </div>
    );
  }

  // Kiểm tra xem có kết quả tìm kiếm không
  const hasSongs = searchResults.songs && searchResults.songs.length > 0;
  const hasAlbums = searchResults.albums && searchResults.albums.length > 0;
  const hasArtists = searchResults.artists && searchResults.artists.length > 0;
  const hasResults = hasSongs || hasAlbums || hasArtists;

  // Hiển thị khi không có kết quả tìm kiếm
  if (!hasResults && query && query.length >= 3) {
    return (
      <div className="search-results-container">
        <div className="search-tabs">
          <button
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => setActiveTab('all')}
          >
            Tất cả
          </button>
          <button
            className={activeTab === 'songs' ? 'active' : ''}
            onClick={() => setActiveTab('songs')}
          >
            Bài hát
          </button>
          <button
            className={activeTab === 'albums' ? 'active' : ''}
            onClick={() => setActiveTab('albums')}
          >
            Album
          </button>
          <button
            className={activeTab === 'artists' ? 'active' : ''}
            onClick={() => setActiveTab('artists')}
          >
            Nghệ sĩ
          </button>
        </div>
        <div className="no-results-message">Không tìm thấy kết quả nào cho "{query}"</div>
      </div>
    );
  }

  // Hiển thị khi chưa tìm kiếm
  if (!query || query.length < 3) {
    return (
      <div className="search-results-container">
        <div className="search-tabs">
          <button
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => setActiveTab('all')}
          >
            Tất cả
          </button>
          <button
            className={activeTab === 'songs' ? 'active' : ''}
            onClick={() => setActiveTab('songs')}
          >
            Bài hát
          </button>
          <button
            className={activeTab === 'albums' ? 'active' : ''}
            onClick={() => setActiveTab('albums')}
          >
            Album
          </button>
          <button
            className={activeTab === 'artists' ? 'active' : ''}
            onClick={() => setActiveTab('artists')}
          >
            Nghệ sĩ
          </button>
        </div>
        <div className="search-prompt">Nhập ít nhất 3 ký tự để tìm kiếm</div>
      </div>
    );
  }

  // Hiển thị kết quả tìm kiếm
  return (
    <div className="search-results-container">
      <div className="search-tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          Tất cả
        </button>
        <button
          className={activeTab === 'songs' ? 'active' : ''}
          onClick={() => setActiveTab('songs')}
        >
          Bài hát {hasSongs && `(${searchResults.songs.length})`}
        </button>
        <button
          className={activeTab === 'albums' ? 'active' : ''}
          onClick={() => setActiveTab('albums')}
        >
          Album {hasAlbums && `(${searchResults.albums.length})`}
        </button>
        <button
          className={activeTab === 'artists' ? 'active' : ''}
          onClick={() => setActiveTab('artists')}
        >
          Nghệ sĩ {hasArtists && `(${searchResults.artists.length})`}
        </button>
      </div>

      <div className="search-results">
        {/* Hiển thị tất cả kết quả */}
        {activeTab === 'all' && (
          <>
            {/* Bài hát */}
            {hasSongs && (
              <div className="result-section">
                <h3><FaMusic /> Bài hát</h3>
                <div className="songs-list">
                  {searchResults.songs.slice(0, 5).map(song => (
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
                  {searchResults.songs.length > 5 && (
                    <button
                      className="view-more-button"
                      onClick={() => setActiveTab('songs')}
                    >
                      Xem thêm {searchResults.songs.length - 5} bài hát
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Album */}
            {hasAlbums && (
              <div className="result-section">
                <h3><FaCompactDisc /> Album</h3>
                <div className="albums-grid">
                  {searchResults.albums.slice(0, 6).map(album => (
                    <div key={album.id} className="album-item" onClick={() => handleAlbumClick(album)}>
                      <div className="album-cover">
                        {album.cover_image ? (
                          <img src={album.cover_image} alt={album.title} />
                        ) : (
                          <div className="default-cover"><FaCompactDisc /></div>
                        )}
                        <div className="play-overlay"><FaPlay /></div>
                      </div>
                      <div className="album-title">{album.title}</div>
                      <div className="album-artist">{album.artist?.name || 'Unknown Artist'}</div>
                    </div>
                  ))}
                </div>
                {searchResults.albums.length > 6 && (
                  <button
                    className="view-more-button"
                    onClick={() => setActiveTab('albums')}
                  >
                    Xem thêm {searchResults.albums.length - 6} album
                  </button>
                )}
              </div>
            )}

            {/* Nghệ sĩ */}
            {hasArtists && (
              <div className="result-section">
                <h3><FaUser /> Nghệ sĩ</h3>
                <div className="artists-grid">
                  {searchResults.artists.slice(0, 6).map(artist => (
                    <div key={artist.id} className="artist-item" onClick={() => handleArtistClick(artist)}>
                      <div className="artist-avatar">
                        {artist.cover_image ? (
                          <img src={artist.cover_image} alt={artist.name} />
                        ) : (
                          <div className="default-avatar"><FaUser /></div>
                        )}
                      </div>
                      <div className="artist-name">{artist.name || 'Unknown Artist'}</div>
                    </div>
                  ))}
                </div>
                {searchResults.artists.length > 6 && (
                  <button
                    className="view-more-button"
                    onClick={() => setActiveTab('artists')}
                  >
                    Xem thêm {searchResults.artists.length - 6} nghệ sĩ
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Hiển thị chỉ bài hát */}
        {activeTab === 'songs' && hasSongs && (
          <div className="result-section">
            <h3><FaMusic /> Bài hát</h3>
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
          </div>
        )}

        {/* Hiển thị chỉ album */}
        {activeTab === 'albums' && hasAlbums && (
          <div className="result-section">
            <h3><FaCompactDisc /> Album</h3>
            <div className="albums-grid full-grid">
              {searchResults.albums.map(album => (
                <div key={album.id} className="album-item" onClick={() => handleAlbumClick(album)}>
                  <div className="album-cover">
                    {album.cover_image ? (
                      <img src={album.cover_image} alt={album.title} />
                    ) : (
                      <div className="default-cover"><FaCompactDisc /></div>
                    )}
                    <div className="play-overlay"><FaPlay /></div>
                  </div>
                  <div className="album-title">{album.title}</div>
                  <div className="album-artist">{album.artist?.name || 'Unknown Artist'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hiển thị chỉ nghệ sĩ */}
        {activeTab === 'artists' && hasArtists && (
          <div className="result-section">
            <h3><FaUser /> Nghệ sĩ</h3>
            <div className="artists-grid full-grid">
              {searchResults.artists.map(artist => (
                <div key={artist.id} className="artist-item" onClick={() => handleArtistClick(artist)}>
                  <div className="artist-avatar">
                    {artist.cover_image ? (
                      <img src={artist.cover_image} alt={artist.name} />
                    ) : (
                      <div className="default-avatar"><FaUser /></div>
                    )}
                  </div>
                  <div className="artist-name">{artist.name || 'Unknown Artist'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
