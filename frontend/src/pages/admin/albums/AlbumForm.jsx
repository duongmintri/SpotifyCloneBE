import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { getAlbumDetails, createAlbum, updateAlbum, getArtists } from "../../../services/adminApi";

const AlbumForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    cover_image: "",
    release_date: "",
    is_public: true,
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
            cover_image: albumData.cover_image || "",
            release_date: albumData.release_date ? albumData.release_date.substring(0, 10) : "",
            is_public: albumData.is_public,
          });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const albumData = {
        ...formData,
        artist_id: formData.artist,
      };
      
      if (isEditMode) {
        await updateAlbum(id, albumData);
      } else {
        await createAlbum(albumData);
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
            <label htmlFor="cover_image">Ảnh bìa (URL)</label>
            <input
              type="text"
              id="cover_image"
              name="cover_image"
              value={formData.cover_image}
              onChange={handleChange}
              className="admin-input-field"
            />
          </div>

          <div className="admin-form-group">
            <div className="admin-checkbox-group">
              <input
                type="checkbox"
                id="is_public"
                name="is_public"
                checked={formData.is_public}
                onChange={handleChange}
              />
              <label htmlFor="is_public">Album công khai</label>
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
