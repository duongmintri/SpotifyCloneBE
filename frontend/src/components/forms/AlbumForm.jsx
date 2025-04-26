import React, { useState } from 'react';
import { createAlbum } from '../../services/musicApi';
import './AlbumForm.css';

const AlbumForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist_id: '',
    cover_image: '',
    release_date: new Date().toISOString().split('T')[0] // Ngày hiện tại
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Xử lý khi thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra dữ liệu
    if (!formData.title || !formData.artist_id) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const newAlbum = await createAlbum(formData);
      
      // Gọi callback onSuccess nếu có
      if (onSuccess) {
        onSuccess(newAlbum);
      }
      
      // Reset form
      setFormData({
        title: '',
        artist_id: '',
        cover_image: '',
        release_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Lỗi khi tạo album:', error);
      setError('Không thể tạo album. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="album-form-container">
      <h2>Tạo Album Mới</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="album-form">
        <div className="form-group">
          <label htmlFor="title">Tên Album *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tên album"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="artist_id">Nghệ sĩ *</label>
          <input
            type="text"
            id="artist_id"
            name="artist_id"
            value={formData.artist_id}
            onChange={handleChange}
            placeholder="Nhập ID nghệ sĩ"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cover_image">Ảnh bìa</label>
          <input
            type="text"
            id="cover_image"
            name="cover_image"
            value={formData.cover_image}
            onChange={handleChange}
            placeholder="Nhập URL ảnh bìa"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="release_date">Ngày phát hành</label>
          <input
            type="date"
            id="release_date"
            name="release_date"
            value={formData.release_date}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Đang tạo...' : 'Tạo Album'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlbumForm;
