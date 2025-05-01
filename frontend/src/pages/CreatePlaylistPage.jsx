import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreatePlaylistForm from '../components/forms/CreatePlaylistForm';
import './CreatePlaylistPage.css';

const CreatePlaylistPage = () => {
  const navigate = useNavigate();

  // Xử lý khi tạo playlist thành công
  const handleSuccess = (playlist) => {
    // Chuyển hướng đến trang chi tiết playlist
    navigate(`/playlists/${playlist.id}`);
  };

  // Xử lý khi hủy tạo playlist
  const handleCancel = () => {
    // Quay lại trang trước đó
    navigate(-1);
  };

  return (
    <div className="create-playlist-page">
      <CreatePlaylistForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreatePlaylistPage;