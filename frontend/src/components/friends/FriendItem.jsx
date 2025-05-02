import React from 'react';
import { FaComment, FaUserMinus } from 'react-icons/fa';
import useFriendStore from '../../store/friendStore';
import useChatStore from '../../store/chatStore';
import './FriendItem.css';

const FriendItem = ({ friend, onChatClick }) => {
  const { removeFriend } = useFriendStore();
  const { unreadByUser } = useChatStore();
  
  const handleRemoveFriend = async () => {
    if (window.confirm(`Bạn có chắc muốn xóa ${friend.username} khỏi danh sách bạn bè?`)) {
      await removeFriend(friend.id);
    }
  };
  
  const handleChatClick = () => {
    if (onChatClick) {
      onChatClick(friend);
    }
  };
  
  // Số tin nhắn chưa đọc từ người này
  const unreadCount = unreadByUser[friend.id] || 0;
  
  return (
    <div className="friend-item">
      <div className="friend-info">
        <span className="friend-name">{friend.username}</span>
      </div>
      <div className="friend-actions">
        <button 
          className="friend-chat-btn" 
          onClick={handleChatClick}
          title="Nhắn tin"
        >
          <FaComment />
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </button>
        <button 
          className="friend-remove-btn" 
          onClick={handleRemoveFriend}
          title="Xóa bạn bè"
        >
          <FaUserMinus />
        </button>
      </div>
    </div>
  );
};

export default FriendItem;
