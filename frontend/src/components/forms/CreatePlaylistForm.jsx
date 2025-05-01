import React, { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { createPlaylist } from '../../services/musicApi';
import './CreatePlaylistForm.css';

const CreatePlaylistForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    cover_image: '',
    is_public: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Xử lý khi thay đổi input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra dữ liệu
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên playlist');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newPlaylist = await createPlaylist(formData);

      // Gọi callback onSuccess nếu có
      if (onSuccess) {
        onSuccess(newPlaylist);
      }

      // Reset form
      setFormData({
        name: '',
        cover_image: '',
        is_public: true
      });
    } catch (error) {
      console.error('Lỗi khi tạo playlist:', error);
      setError('Không thể tạo playlist. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-playlist-form">
      <div className="form-header">
        <h2>Tạo Playlist Mới</h2>
        {onCancel && (
          <button 
            className="close-button" 
            onClick={onCancel}
            title="Đóng"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Tên Playlist *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên playlist"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cover_image">Ảnh bìa (URL)</label>
          <input
            type="text"
            id="cover_image"
            name="cover_image"
            value={formData.cover_image}
            onChange={handleChange}
            placeholder="Nhập URL ảnh bìa"
          />
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="is_public"
            name="is_public"
            checked={formData.is_public}
            onChange={handleChange}
          />
          <label htmlFor="is_public">Công khai</label>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Hủy
            </button>
          )}
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Đang tạo...' : 'Tạo Playlist'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlaylistForm;