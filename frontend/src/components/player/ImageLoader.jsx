import React, { useState } from 'react';

/**
 * ImageLoader Component
 *
 * Hiển thị ảnh với xử lý lỗi và fallback
 *
 * @param {number|string} songId - ID của bài hát/playlist (không sử dụng trực tiếp nhưng giữ lại để tương thích)
 * @param {string} coverImage - URL của ảnh cần hiển thị
 * @param {string} fallbackSrc - URL của ảnh dự phòng khi ảnh chính không tải được
 * @param {string} alt - Văn bản thay thế cho ảnh
 * @param {string} className - CSS class cho ảnh
 */
const ImageLoader = ({ songId, coverImage, fallbackSrc, alt, className }) => {
  const [error, setError] = useState(false);

  // Sử dụng coverImage nếu có và không có lỗi, ngược lại sử dụng fallbackSrc
  const imageSrc = !error && coverImage ? coverImage : fallbackSrc;

  const handleError = () => {
    console.log("Lỗi khi tải ảnh:", imageSrc);
    setError(true);
  };

  return (
    <img
      src={imageSrc}
      alt={alt || "Music cover"}
      className={className}
      onError={handleError}
    />
  );
};

export default ImageLoader;
