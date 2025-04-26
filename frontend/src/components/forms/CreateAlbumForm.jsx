import React, { useState, useEffect } from 'react';
import { createAlbum } from '../../services/musicApi';
import './CreateAlbumForm.css';

const CreateAlbumForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist_id: '',
    cover_image: '',
    release_date: new Date().toISOString().split('T')[0], // Ngày hiện tại
    is_public: true
  });
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy danh sách nghệ sĩ khi component được mount
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        // Tạm thời sử dụng danh sách nghệ sĩ cứng
        // Trong thực tế, bạn sẽ gọi API để lấy danh sách nghệ sĩ
        // const data = await getArtists();
        const data = [
          { id: 1, name: 'Artist One' },
          { id: 2, name: 'Artist Two' },
          { id: 3, name: 'Artist Three' }
        ];
        setArtists(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách nghệ sĩ:', error);
        setError('Không thể tải danh sách nghệ sĩ. Vui lòng thử lại sau.');
      }
    };

    fetchArtists();
  }, []);

  // Xử lý khi thay đổi input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
        release_date: new Date().toISOString().split('T')[0],
        is_public: true
      });
    } catch (error) {
      console.error('Lỗi khi tạo album:', error);
      setError('Không thể tạo album. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-album-form-container">
      <h2>Tạo Album Mới</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-album-form">
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
          <select
            id="artist_id"
            name="artist_id"
            value={formData.artist_id}
            onChange={handleChange}
            required
          >
            <option value="">Chọn nghệ sĩ</option>
            {artists.map(artist => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
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

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="is_public"
            name="is_public"
            checked={formData.is_public}
            onChange={handleChange}
          />
          <label htmlFor="is_public">Công khai album</label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Tạo Album'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAlbumForm;
