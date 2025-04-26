import React from 'react';
import { Link } from 'react-router-dom';
import './AlbumCard.css';

const AlbumCard = ({ album }) => {
  // Fallback image nếu không có ảnh bìa
  const fallbackImage = '/src/assets/images/cover-images/1.jpg';
  
  return (
    <Link to={`/albums/${album.id}`} className="album-card">
      <div className="album-image-container">
        <img 
          src={album.cover_image || fallbackImage} 
          alt={album.title}
          className="album-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
        <div className="album-overlay">
          <div className="play-icon">▶</div>
        </div>
      </div>
      <div className="album-info">
        <h3 className="album-title">{album.title}</h3>
        <p className="album-artist">{album.artist?.name || 'Unknown Artist'}</p>
      </div>
    </Link>
  );
};

export default AlbumCard;
