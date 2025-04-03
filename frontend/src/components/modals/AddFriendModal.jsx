import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa'; // FaTimes thay cho IoMdClose để đồng bộ icon

const AddFriendModal = ({ isOpen, onClose }) => {
  const [friendName, setFriendName] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Tìm kiếm:', friendName); // Thay bằng logic tìm kiếm thực tế sau
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-container add-friend-modal">
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <h2 className="modal-title">Thêm bạn bè</h2>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSearch} className="add-friend-form">
            <div className="form-group" style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#b3b3b3' }} />
              <input
                type="text"
                placeholder="Nhập tên bạn bè"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 35px',
                  borderRadius: '23px',
                  border: '1px solid #ccc',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <button type="submit" className="addFriendModal submit-btn" style={{ marginTop: '10px' }}>
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;