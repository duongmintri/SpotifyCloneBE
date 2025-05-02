import React, { useState, useEffect } from 'react';
import { FaTimes, FaUserPlus, FaCheck } from 'react-icons/fa';
import useFriendStore from '../../store/friendStore';
import './AddFriendModal.css';

const AddFriendModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' hoặc 'error'

  const {
    searchResults,
    isSearching,
    searchError,
    searchForUsers,
    sendRequest,
    resetSearch
  } = useFriendStore();

  // Reset trạng thái khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setMessage('');
      setMessageType('');
      resetSearch();
    }
  }, [isOpen, resetSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setMessage('');

    if (!searchTerm.trim()) {
      setMessage('Vui lòng nhập từ khóa để tìm kiếm');
      setMessageType('error');
      return;
    }

    searchForUsers(searchTerm);
  };

  const handleSendRequest = async (userId) => {
    setMessage('');

    const result = await sendRequest(userId);

    setMessage(result.message);
    setMessageType(result.success ? 'success' : 'error');
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
            <div className="form-group search-input-container">
              <input
                type="text"
                placeholder="Nhập tên người dùng hoặc tên đầy đủ"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={isSearching}
              />
            </div>
            <button
              type="submit"
              className="search-button"
              disabled={isSearching || !searchTerm.trim()}
            >
              {isSearching ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
            </button>
          </form>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          {searchError && (
            <div className="search-error">
              {searchError}
            </div>
          )}

          <div className="search-results">
            {searchResults.length > 0 ? (
              searchResults.map(user => (
                <div key={user.id} className="user-result">
                  <div className="user-info">
                    <div className="user-avatar">
                      <img
                        src={user.profile_image || './src/assets/images/default-avatar.jpg'}
                        alt={user.username}
                      />
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user.username}</div>
                      {user.full_name && <div className="user-fullname">{user.full_name}</div>}
                    </div>
                  </div>
                  <div className="user-actions">
                    {user.is_friend ? (
                      <span className="already-friend">Đã là bạn bè</span>
                    ) : user.has_pending_request ? (
                      <span className="pending-request">
                        <FaCheck /> Đã gửi lời mời
                      </span>
                    ) : (
                      <button
                        className="add-friend-btn"
                        onClick={() => handleSendRequest(user.id)}
                      >
                        <FaUserPlus /> Kết bạn
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : searchTerm.trim() && !isSearching && !searchError ? (
              <div className="no-results">Không tìm thấy người dùng nào</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;