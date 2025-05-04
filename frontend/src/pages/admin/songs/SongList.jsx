import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { getSongs, deleteSong } from "../../../services/adminApi";
import DeleteConfirmModal from "../../../components/admin/DeleteConfirmModal";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const data = await getSongs();
      setSongs(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài hát:", error);
      setError("Không thể tải danh sách bài hát. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleAddSong = () => {
    navigate("/admin/songs/create");
  };

  const handleEditSong = (id) => {
    navigate(`/admin/songs/edit/${id}`);
  };

  const handleDeleteClick = (song) => {
    setSongToDelete(song);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!songToDelete) return;

    try {
      await deleteSong(songToDelete.id);
      setSongs(songs.filter((song) => song.id !== songToDelete.id));
      setShowDeleteModal(false);
      setSongToDelete(null);
      showSuccessToast("Xóa bài hát thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa bài hát:", error);
      setError("Không thể xóa bài hát. Vui lòng thử lại sau.");
      showErrorToast("Không thể xóa bài hát. Vui lòng thử lại sau.");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSongToDelete(null);
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
        <h1 className="admin-header-title">Quản lý bài hát</h1>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div className="admin-table-title">Danh sách bài hát</div>
          <button className="admin-add-btn" onClick={handleAddSong}>
            <FaPlus className="admin-add-icon" /> Thêm bài hát
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên bài hát</th>
              <th>Nghệ sĩ</th>
              <th>Album</th>
              <th>Thời lượng</th>
              <th>Premium</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {songs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Không có bài hát nào
                </td>
              </tr>
            ) : (
              songs.map((song) => (
                <tr key={song.id}>
                  <td>{song.id}</td>
                  <td>{song.title}</td>
                  <td>{song.artist_name}</td>
                  <td>{song.album_title || "Không có"}</td>
                  <td>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</td>
                  <td>{song.is_premium ? "Có" : "Không"}</td>
                  <td className="admin-table-actions">
                    <button
                      className="admin-action-btn admin-edit-btn"
                      onClick={() => handleEditSong(song.id)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="admin-action-btn admin-delete-btn"
                      onClick={() => handleDeleteClick(song)}
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
          title="Xóa bài hát"
          message={`Bạn có chắc chắn muốn xóa bài hát "${songToDelete?.title}" không?`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
};

export default SongList;
