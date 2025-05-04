import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { getArtists, deleteArtist } from "../../../services/adminApi";
import DeleteConfirmModal from "../../../components/admin/DeleteConfirmModal";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const ArtistList = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [artistToDelete, setArtistToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const data = await getArtists();
      setArtists(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nghệ sĩ:", error);
      setError("Không thể tải danh sách nghệ sĩ. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleAddArtist = () => {
    navigate("/admin/artists/create");
  };

  const handleEditArtist = (id) => {
    navigate(`/admin/artists/edit/${id}`);
  };

  const handleDeleteClick = (artist) => {
    setArtistToDelete(artist);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!artistToDelete) return;

    try {
      await deleteArtist(artistToDelete.id);
      setArtists(artists.filter((artist) => artist.id !== artistToDelete.id));
      setShowDeleteModal(false);
      setArtistToDelete(null);
      showSuccessToast("Xóa nghệ sĩ thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa nghệ sĩ:", error);
      setError("Không thể xóa nghệ sĩ. Vui lòng thử lại sau.");
      showErrorToast("Không thể xóa nghệ sĩ. Vui lòng thử lại sau.");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setArtistToDelete(null);
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
        <h1 className="admin-header-title">Quản lý nghệ sĩ</h1>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div className="admin-table-title">Danh sách nghệ sĩ</div>
          <button className="admin-add-btn" onClick={handleAddArtist}>
            <FaPlus className="admin-add-icon" /> Thêm nghệ sĩ
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nghệ sĩ</th>
              <th>Mô tả</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {artists.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Không có nghệ sĩ nào
                </td>
              </tr>
            ) : (
              artists.map((artist) => (
                <tr key={artist.id}>
                  <td>{artist.id}</td>
                  <td>{artist.name}</td>
                  <td>{artist.bio ? (artist.bio.length > 50 ? artist.bio.substring(0, 50) + "..." : artist.bio) : "Không có"}</td>
                  <td>{new Date(artist.created_at).toLocaleDateString()}</td>
                  <td className="admin-table-actions">
                    <button
                      className="admin-action-btn admin-edit-btn"
                      onClick={() => handleEditArtist(artist.id)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="admin-action-btn admin-delete-btn"
                      onClick={() => handleDeleteClick(artist)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          title="Xóa nghệ sĩ"
          message={`Bạn có chắc chắn muốn xóa nghệ sĩ "${artistToDelete?.name}" không?`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
};

export default ArtistList;
