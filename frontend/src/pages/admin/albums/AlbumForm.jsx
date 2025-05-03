import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaUpload, FaImage } from "react-icons/fa";
import { getAlbumDetails, createAlbum, updateAlbum, getArtists } from "../../../services/adminApi";

const AlbumForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const coverImageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    cover_image: null,
    release_date: "",
    is_public: true,
  });

  const [coverImageInfo, setCoverImageInfo] = useState({
    name: "",
    size: 0,
  });

  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy danh sách nghệ sĩ
        const artistsData = await getArtists();
        setArtists(artistsData);

        // Nếu là chế độ chỉnh sửa, lấy thông tin album
        if (isEditMode) {
          const albumData = await getAlbumDetails(id);
          setFormData({
            title: albumData.title,
            artist: albumData.artist.id,
            cover_image: null,
            release_date: albumData.release_date ? albumData.release_date.substring(0, 10) : "",
            is_public: albumData.is_public,
          });

          if (albumData.cover_image) {
            setCoverImageInfo({
              name: albumData.cover_image.split('/').pop(),
              size: 0,
            });
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra xem file có phải là ảnh không
    if (!file.type.includes('image/')) {
      setError("Chỉ chấp nhận file ảnh");
      return;
    }

    // Cập nhật formData với file ảnh mới
    setFormData({
      ...formData,
      cover_image: file,
    });

    // Cập nhật thông tin file ảnh
    setCoverImageInfo({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2), // Kích thước tính bằng MB
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Sử dụng FormData để gửi file
      const formDataToSend = new FormData();

      // Thêm các trường dữ liệu
      formDataToSend.append('title', formData.title);

      // Đảm bảo artist_id được gửi đúng cách
      if (formData.artist) {
        formDataToSend.append('artist_id', formData.artist);
        // Thêm cả trường artist để đảm bảo tương thích
        formDataToSend.append('artist', formData.artist);
      }

      if (formData.release_date) {
        formDataToSend.append('release_date', formData.release_date);
      }

      formDataToSend.append('is_public', 'true'); // Đảm bảo album luôn công khai

      // Thêm file ảnh bìa nếu có
      if (formData.cover_image) {
        formDataToSend.append('cover_image', formData.cover_image);
      }

      if (isEditMode) {
        await updateAlbum(id, formDataToSend);
      } else {
        await createAlbum(formDataToSend);
      }

      navigate("/admin/albums");
    } catch (error) {
      console.error("Lỗi khi lưu album:", error);
      setError("Không thể lưu album. Vui lòng thử lại sau.");
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/albums");
  };

  if (loading) {
    return <div className="admin-loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header-title">
          {isEditMode ? "Chỉnh sửa album" : "Thêm album mới"}
        </h1>
        <button
          className="admin-back-btn"
          onClick={() => navigate("/admin/albums")}
        >
          <FaArrowLeft /> Quay lại
        </button>
      </div>

      <div className="admin-form-container">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="title">Tên album</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="admin-input-field"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="artist">Nghệ sĩ</label>
            <select
              id="artist"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              className="admin-input-field"
              required
            >
              <option value="">Chọn nghệ sĩ</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label htmlFor="release_date">Ngày phát hành</label>
            <input
              type="date"
              id="release_date"
              name="release_date"
              value={formData.release_date}
              onChange={handleChange}
              className="admin-input-field"
            />
          </div>

          <div className="admin-form-group">
            <label>Ảnh bìa</label>
            <div className="admin-file-upload">
              <input
                type="file"
                ref={coverImageInputRef}
                onChange={handleCoverImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="admin-file-upload-btn"
                onClick={() => coverImageInputRef.current.click()}
              >
                <FaImage /> Chọn file ảnh
              </button>
              {coverImageInfo.name && (
                <div className="admin-file-info">
                  <FaImage className="admin-file-icon" />
                  <div className="admin-file-details">
                    <div className="admin-file-name">{coverImageInfo.name}</div>
                    <div className="admin-file-meta">
                      {coverImageInfo.size > 0 && <span>{coverImageInfo.size} MB</span>}
                    </div>
                  </div>
                </div>
              )}
              {isEditMode && !formData.cover_image && coverImageInfo.name && (
                <div className="admin-file-note">
                  * Chỉ cần chọn file mới nếu muốn thay thế ảnh hiện tại
                </div>
              )}
            </div>
          </div>



          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-cancel-btn"
              onClick={handleCancel}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="admin-save-btn"
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlbumForm;
