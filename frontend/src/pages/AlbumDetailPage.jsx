import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAlbumDetails, addSongToAlbum, removeSongFromAlbum } from '../services/musicApi';
import { fetchWithAuth } from '../services/api';
import SongList from '../components/content/SongList';
import AddSongToAlbumForm from '../components/forms/AddSongToAlbumForm';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './AlbumDetailPage.css';

// Hàm xóa album trực tiếp
const deleteAlbum = async (albumId) => {
  try {
    console.log('Gọi deleteAlbum với albumId:', albumId);
    const API_URL = 'http://localhost:8000';

    const response = await fetchWithAuth(`${API_URL}/api/albums/${albumId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Không thể xóa album');
    }

    return true; // Trả về true nếu xóa thành công
  } catch (error) {
    console.error('Lỗi khi xóa album:', error);
    throw error;
  }
};

// Các hàm thông báo tạm thời
const showSuccessToast = (message) => {
  const toast = document.createElement('div');
  toast.className = 'custom-toast success';
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};

const showErrorToast = (message) => {
  const toast = document.createElement('div');
  toast.className = 'custom-toast error';
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas fa-times-circle"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};

const showConfirmToast = (message, onConfirm) => {
  if (window.confirm(message)) {
    onConfirm();
  }
};

// Thêm CSS cho toast
const toastStyles = `
  .custom-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #1db954;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 9998;
    transform: translateX(120%);
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    max-width: 400px;
  }
  
  .custom-toast.show {
    transform: translateX(0);
  }
  
  .custom-toast.error {
    background-color: #e74c3c;
  }
  
  .toast-content {
    display: flex;
    align-items: center;
  }
  
  .toast-content i {
    margin-right: 10px;
    font-size: 18px;
  }
  
  .toast-content span {
    font-size: 14px;
    font-weight: 500;
  }
`;

const AlbumDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddSongForm, setShowAddSongForm] = useState(false);

  // Thêm styles vào document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = toastStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Lấy thông tin chi tiết album
  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        setIsLoading(true);
        const data = await getAlbumDetails(id);
        setAlbum(data);
        setError('');
      } catch (error) {
        console.error('Lỗi khi lấy thông tin album:', error);
        setError('Không thể tải thông tin album. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAlbumDetails();
    }
  }, [id]);

  // Xử lý khi thêm bài hát vào album
  const handleAddSong = async (songId) => {
    try {
      await addSongToAlbum(id, songId);
      // Cập nhật lại thông tin album
      const updatedAlbum = await getAlbumDetails(id);
      setAlbum(updatedAlbum);
      setShowAddSongForm(false);
      showSuccessToast('Đã thêm bài hát vào album thành công!');
    } catch (error) {
      console.error('Lỗi khi thêm bài hát vào album:', error);
      showErrorToast('Không thể thêm bài hát vào album. Vui lòng thử lại sau.');
    }
  };

  // Xử lý khi xóa bài hát khỏi album
  const handleRemoveSong = async (songId) => {
    showConfirmToast(
      'Bạn có chắc chắn muốn xóa bài hát này khỏi album?',
      async () => {
        try {
          await removeSongFromAlbum(id, songId);
          // Cập nhật lại thông tin album
          const updatedAlbum = await getAlbumDetails(id);
          setAlbum(updatedAlbum);
          showSuccessToast('Đã xóa bài hát khỏi album thành công!');
        } catch (error) {
          console.error('Lỗi khi xóa bài hát khỏi album:', error);
          showErrorToast('Không thể xóa bài hát khỏi album. Vui lòng thử lại sau.');
        }
      }
    );
  };

  // Xử lý khi xóa album
  const handleDeleteAlbum = async () => {
    showConfirmToast(
      'Bạn có chắc chắn muốn xóa album này? Các bài hát trong album sẽ không bị xóa.',
      async () => {
        try {
          // Gọi API xóa album
          const result = await deleteAlbum(id);
          console.log('Kết quả xóa album:', result);
          
          // Hiển thị thông báo thành công
          showSuccessToast('Album đã được xóa thành công!');
          
          // Chuyển hướng về trang danh sách album
          setTimeout(() => {
            navigate('/albums');
          }, 1000);
        } catch (error) {
          console.error('Lỗi khi xóa album:', error);
          showErrorToast('Không thể xóa album. Vui lòng thử lại sau.');
        }
      }
    );
  };

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="album-detail-container">
        <div className="loading-message">Đang tải thông tin album...</div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="album-detail-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Hiển thị khi không tìm thấy album
  if (!album) {
    return (
      <div className="album-detail-container">
        <div className="error-message">Không tìm thấy album.</div>
      </div>
    );
  }

  return (
    <div className="album-detail-container">
      <div className="album-header">
        <div className="album-cover">
          <img 
            src={album.cover_image || '/src/assets/images/cover-images/1.jpg'} 
            alt={album.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/src/assets/images/cover-images/1.jpg';
            }}
          />
        </div>
        <div className="album-info">
          <h1>{album.title}</h1>
          <p className="album-artist">{album.artist?.name || 'Unknown Artist'}</p>
          <p className="album-release-date">
            {new Date(album.release_date).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="album-songs-count">{album.songs?.length || 0} bài hát</p>
          
          {album.is_owner && (
            <div className="album-actions">
              <button 
                className="btn-add-song"
                onClick={() => setShowAddSongForm(!showAddSongForm)}
              >
                <FaPlus /> {showAddSongForm ? 'Hủy' : 'Thêm bài hát'}
              </button>
              <button 
                className="btn-edit-album"
                onClick={() => navigate(`/albums/${id}/edit`)}
              >
                <FaEdit /> Chỉnh sửa
              </button>
              <button 
                className="btn-delete-album"
                onClick={handleDeleteAlbum}
              >
                <FaTrash /> Xóa album
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showAddSongForm && (
        <div className="add-song-form-container">
          <AddSongToAlbumForm 
            albumId={id} 
            onAddSong={handleAddSong}
            onCancel={() => setShowAddSongForm(false)}
          />
        </div>
      )}
      
      <div className="album-songs">
        <h2>Danh sách bài hát</h2>
        {album.songs && album.songs.length > 0 ? (
          <SongList 
            songs={album.songs} 
            showAlbum={false}
            onRemoveSong={album.is_owner ? handleRemoveSong : null}
          />
        ) : (
          <div className="empty-message">Album này chưa có bài hát nào.</div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetailPage;
