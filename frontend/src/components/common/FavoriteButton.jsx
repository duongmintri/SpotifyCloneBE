import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { checkFavoriteSong, toggleFavoriteSong } from '../../services/musicApi';
import './FavoriteButton.css';

const FavoriteButton = ({ songId, size = 'md', className = '', onToggle }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Kiểm tra trạng thái yêu thích khi component được mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!songId) {
        console.log('FavoriteButton - songId không hợp lệ:', songId);
        return;
      }

      console.log('FavoriteButton - Kiểm tra trạng thái yêu thích cho songId:', songId, 'type:', typeof songId);

      try {
        const response = await checkFavoriteSong(songId);
        console.log('FavoriteButton - Kết quả kiểm tra:', response);
        setIsFavorite(response.is_favorite);
      } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái yêu thích:', error);
      }
    };

    checkFavoriteStatus();
  }, [songId]);

  // Xử lý khi click vào nút yêu thích
  const handleToggleFavorite = async (e) => {
    // Ngăn chặn sự kiện click lan ra ngoài và ngăn chặn hành vi mặc định
    e.stopPropagation();
    e.preventDefault();

    if (!songId || isLoading) {
      console.log('Không thể toggle favorite: songId không hợp lệ hoặc đang loading');
      return;
    }

    console.log('Bắt đầu toggle favorite cho songId:', songId, 'type:', typeof songId);
    setIsLoading(true);

    try {
      // Đảm bảo songId là số nguyên
      const id = Number(songId);
      console.log('Đã chuyển đổi songId thành số:', id);

      // Gọi API để toggle favorite
      console.log('Gọi toggleFavoriteSong với id:', id);
      const response = await toggleFavoriteSong(id);
      console.log('Kết quả toggle favorite:', response);

      // Cập nhật trạng thái UI
      setIsFavorite(response.is_favorite);

      // Gọi callback onToggle nếu có
      if (onToggle) {
        onToggle(response.is_favorite);
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái yêu thích:', error);
      alert('Không thể thay đổi trạng thái yêu thích. Vui lòng thử lại sau.');
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
      className={`favorite-btn ${sizeClass} ${isFavorite ? 'active' : ''} ${className}`}
      onClick={handleToggleFavorite}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      disabled={isLoading}
      title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      {isFavorite ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default FavoriteButton;
