import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useFavoriteStore from '../../store/favoriteStore';
import './FavoriteButton.css';

const FavoriteButton = ({ songId, size = 'md', className = '', onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isFavorite, checkFavoriteStatus, toggleFavorite } = useFavoriteStore();
  
  // Kiểm tra trạng thái yêu thích khi component được mount
  useEffect(() => {
    const checkStatus = async () => {
      if (!songId) return;
      await checkFavoriteStatus(songId);
    };
    
    checkStatus();
  }, [songId, checkFavoriteStatus]);
  
  // Lấy trạng thái yêu thích từ store
  const favoriteStatus = isFavorite(songId);

  // Xử lý khi click vào nút yêu thích
  const handleToggleFavorite = async (e) => {
    // Ngăn chặn sự kiện click lan ra ngoài và ngăn chặn hành vi mặc định
    e.stopPropagation();
    e.preventDefault();

    if (!songId || isLoading) return;
    
    setIsLoading(true);
    try {
      const newStatus = await toggleFavorite(songId);
      
      // Gọi callback onToggle nếu có
      if (onToggle) {
        onToggle(newStatus);
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái yêu thích:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xác định kích thước dựa trên prop size
  const sizeClass = {
    sm: 'favorite-btn-sm',
    md: 'favorite-btn-md',
    lg: 'favorite-btn-lg'
  }[size] || 'favorite-btn-md';

  return (
    <button
      className={`favorite-btn ${sizeClass} ${favoriteStatus ? 'active' : ''} ${className}`}
      onClick={handleToggleFavorite}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      disabled={isLoading}
      title={favoriteStatus ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      {favoriteStatus ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default FavoriteButton;
