import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateAlbumForm from '../components/forms/CreateAlbumForm';
import './CreateAlbumPage.css';

const CreateAlbumPage = () => {
  const navigate = useNavigate();

  // Xử lý khi tạo album thành công
  const handleSuccess = (album) => {
    // Chuyển hướng đến trang chi tiết album
    navigate(`/albums/${album.id}`);
  };

  // Xử lý khi hủy tạo album
  const handleCancel = () => {
    // Quay lại trang trước đó
    navigate(-1);
  };

  return (
    <div className="create-album-page">
      <CreateAlbumForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateAlbumPage;
