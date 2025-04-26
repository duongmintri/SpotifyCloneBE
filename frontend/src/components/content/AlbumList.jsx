import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAlbums } from '../../services/musicApi';
import AlbumCard from './AlbumCard';
import { FaPlus } from 'react-icons/fa';
import './AlbumList.css';

const AlbumList = () => {
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy danh sách album khi component được mount
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setIsLoading(true);
        const data = await getAlbums();
        setAlbums(data);
        setError('');
      } catch (error) {
        console.error('Lỗi khi lấy danh sách album:', error);
        setError('Không thể tải danh sách album. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="album-list-container">
        <div className="loading-message">Đang tải danh sách album...</div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="album-list-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Hiển thị khi không có album nào
  if (albums.length === 0) {
    return (
      <div className="album-list-container">
        <div className="empty-message">Không có album nào.</div>
      </div>
    );
  }

  // Hiển thị danh sách album
  return (
    <div className="album-list-container">
      <div className="album-header">
        <h2>Albums</h2>
        <Link to="/albums/create" className="create-album-button">
          <FaPlus /> Tạo Album
        </Link>
      </div>
      <div className="album-grid">
        {albums.map(album => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
};

export default AlbumList;
