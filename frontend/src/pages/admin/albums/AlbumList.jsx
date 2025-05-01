import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { getAlbums, deleteAlbum } from "../../../services/adminApi";
import DeleteConfirmModal from "../../../components/admin/DeleteConfirmModal";

const AlbumList = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const data = await getAlbums();
      setAlbums(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách album:", error);
      setError("Không thể tải danh sách album. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleAddAlbum = () => {
    navigate("/admin/albums/create");
  };

  const handleEditAlbum = (id) => {
    navigate(`/admin/albums/edit/${id}`);
  };

  const handleDeleteClick = (album) => {
    setAlbumToDelete(album);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!albumToDelete) return;

    try {
      await deleteAlbum(albumToDelete.id);
      setAlbums(albums.filter((album) => album.id !== albumToDelete.id));
      setShowDeleteModal(false);
      setAlbumToDelete(null);
    } catch (error) {
      console.error("Lỗi khi xóa album:", error);
      setError("Không thể xóa album. Vui lòng thử lại sau.");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setAlbumToDelete(null);
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
        <h1 className="admin-header-title">Quản lý album</h1>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div className="admin-table-title">Danh sách album</div>
          <button className="admin-add-btn" onClick={handleAddAlbum}>
            <FaPlus className="admin-add-icon" /> Thêm album
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên album</th>
              <th>Nghệ sĩ</th>
              <th>Ngày phát hành</th>
              <th>Công khai</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {albums.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  Không có album nào
                </td>
              </tr>
            ) : (
              albums.map((album) => (
                <tr key={album.id}>
                  <td>{album.id}</td>
                  <td>{album.title}</td>
                  <td>{album.artist_name}</td>
                  <td>{album.release_date ? new Date(album.release_date).toLocaleDateString() : "Không có"}</td>
                  <td>{album.is_public ? "Có" : "Không"}</td>
                  <td className="admin-table-actions">
                    <button
                      className="admin-action-btn admin-edit-btn"
                      onClick={() => handleEditAlbum(album.id)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="admin-action-btn admin-delete-btn"
                      onClick={() => handleDeleteClick(album)}
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
          title="Xóa album"
          message={`Bạn có chắc chắn muốn xóa album "${albumToDelete?.title}" không?`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
};

export default AlbumList;
