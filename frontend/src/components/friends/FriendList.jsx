import React, { useEffect, useState } from 'react';
import useFriendStore from '../../store/friendStore';
import useChatStore from '../../store/chatStore';
import FriendItem from './FriendItem';
import ChatWindow from '../chat/ChatWindow';
import './FriendList.css';

const FriendList = () => {
  const {
    friends,
    isFetchingFriends,
    friendsError,
    fetchFriends
  } = useFriendStore();

  const { initWebSocket, fetchUnreadCount } = useChatStore();

  // State để lưu trữ người dùng đang chat
  const [activeChatFriend, setActiveChatFriend] = useState(null);

  useEffect(() => {
    fetchFriends();
    fetchUnreadCount();

    // Khởi tạo WebSocket
    initWebSocket();

    // Thiết lập interval để kiểm tra tin nhắn chưa đọc mỗi 30 giây
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchFriends, fetchUnreadCount, initWebSocket]);

  // Xử lý khi click vào nút chat
  const handleChatClick = (friend) => {
    setActiveChatFriend(friend);
  };

  // Đóng cửa sổ chat
  const handleCloseChat = () => {
    setActiveChatFriend(null);
  };

  if (isFetchingFriends) {
    return <div className="friends-loading">Đang tải danh sách bạn bè...</div>;
  }

  if (friendsError) {
    return <div className="friends-error">{friendsError}</div>;
  }

  if (friends.length === 0) {
    return <div className="friends-empty">Bạn chưa có bạn bè nào</div>;
  }

  return (
    <>
      <div className="friends-list">
        {friends.map(friend => (
          <FriendItem
            key={friend.id}
            friend={friend}
            onChatClick={handleChatClick}
          />
        ))}
      </div>

      {/* Hiển thị cửa sổ chat nếu có người dùng đang chat */}
      {activeChatFriend && (
        <ChatWindow
          friend={activeChatFriend}
          onClose={handleCloseChat}
        />
      )}
    </>
  );
};

export default FriendList;
