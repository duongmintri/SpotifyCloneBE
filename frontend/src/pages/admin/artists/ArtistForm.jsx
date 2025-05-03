import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { getArtistDetails, createArtist, updateArtist } from "../../../services/adminApi";

const ArtistForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  });

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!isEditMode) return;

      try {
        const artistData = await getArtistDetails(id);
        setFormData({
          name: artistData.name,
          bio: artistData.bio || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin nghệ sĩ:", error);
        setError("Không thể tải thông tin nghệ sĩ. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchArtist();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (isEditMode) {
        await updateArtist(id, formData);
      } else {
        await createArtist(formData);
      }

      navigate("/admin/artists");
    } catch (error) {
      console.error("Lỗi khi lưu nghệ sĩ:", error);
      setError("Không thể lưu nghệ sĩ. Vui lòng thử lại sau.");
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/artists");
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
          {isEditMode ? "Chỉnh sửa nghệ sĩ" : "Thêm nghệ sĩ mới"}
        </h1>
        <button
          className="admin-back-btn"
          onClick={() => navigate("/admin/artists")}
        >
          <FaArrowLeft /> Quay lại
        </button>
      </div>

      <div className="admin-form-container">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="name">Tên nghệ sĩ</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="admin-input-field"
              required
            />
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="bio">Tiểu sử</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="admin-input-field"
              rows="5"
            />
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

export default ArtistForm;
