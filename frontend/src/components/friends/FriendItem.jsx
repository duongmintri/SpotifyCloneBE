import React from 'react';
import { FaComment, FaUserMinus } from 'react-icons/fa';
import useFriendStore from '../../store/friendStore';
import useChatStore from '../../store/chatStore';
import { showConfirmToast, showSuccessToast, showErrorToast } from '../../utils/toast';
import './FriendItem.css';

const FriendItem = ({ friend, onChatClick }) => {
  const { removeFriend } = useFriendStore();
  const { unreadByUser } = useChatStore();
  
  const handleRemoveFriend = async () => {
    showConfirmToast(
      `Bạn có chắc muốn xóa ${friend.username} khỏi danh sách bạn bè?`,
      async () => {
        try {
          await removeFriend(friend.id);
          showSuccessToast(`Đã xóa ${friend.username} khỏi danh sách bạn bè`);
        } catch (error) {
          console.error("Lỗi khi xóa bạn:", error);
          showErrorToast("Không thể xóa bạn. Vui lòng thử lại sau.");
        }
      }
    );
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
