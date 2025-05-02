import React, { useEffect, useState } from 'react';
import { FaUserPlus, FaChevronUp, FaChevronDown, FaBell, FaVideo } from 'react-icons/fa';
import useModalStore from '../../store/modalStore.jsx';
import useCanvasStore from '../../store/canvasStore.jsx';
import usePlayerStore from '../../store/playerStore';
import useFriendStore from '../../store/friendStore';
import useChatStore from '../../store/chatStore';
import { getSongVideoUrl } from '../../services/musicApi';
import Canvas from '../canvas/Canvas';
import FriendList from '../friends/FriendList';
import FriendRequests from '../friends/FriendRequests';
import './RightSidebar.css';

const RightSidebar = () => {
  const { openAddFriendModal } = useModalStore();
  const { currentSong } = usePlayerStore();
  const {
    isCanvasVisible,
    isFriendsCollapsed,
    setVideoUrl,
    toggleFriends
  } = useCanvasStore();

  const {
    friendRequests,
    fetchFriendRequests
  } = useFriendStore();

  const { unreadCount } = useChatStore();

  const [showRequests, setShowRequests] = useState(false);

  // Lấy URL video khi bài hát thay đổi
  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!currentSong) {
        setVideoUrl(null);
        return;
      }

      try {
        const videoUrl = await getSongVideoUrl(currentSong.id);
        setVideoUrl(videoUrl);
      } catch (error) {
        console.error('Lỗi khi lấy video:', error);
        setVideoUrl(null);
      }
    };

    fetchVideoUrl();
  }, [currentSong, setVideoUrl]);

  // Lấy danh sách lời mời kết bạn khi component được mount
  useEffect(() => {
    fetchFriendRequests();

    // Thiết lập interval để kiểm tra lời mời kết bạn mới mỗi 30 giây
    const interval = setInterval(() => {
      fetchFriendRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchFriendRequests]);

  return (
    <div className="right-sidebar-content">
      {/* Canvas component */}
      {isCanvasVisible && <Canvas />}

      {/* Friend requests section */}
      {friendRequests.length > 0 && (
        <div className="friend-requests-section">
          <div className="friend-requests-header">
            <div className="friend-requests-title-container">
              <h2 className="friend-requests-title">
                Lời mời kết bạn ({friendRequests.length})
              </h2>
              <button
                onClick={() => setShowRequests(!showRequests)}
                className="toggle-requests-btn"
                title={showRequests ? "Thu gọn" : "Mở rộng"}
              >
                {showRequests ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
          </div>

          {showRequests && <FriendRequests />}
        </div>
      )}

      {/* Friends section */}
      <div className="friends-section">
        <div className="friends-header">
          <div className="friends-title-container">
            <h2 className="friends-title">
              Bạn bè
              {unreadCount > 0 && (
                <span className="unread-badge friends-badge">{unreadCount}</span>
              )}
            </h2>
            <button
              onClick={toggleFriends}
              className="toggle-friends-btn"
              title={isFriendsCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              {isFriendsCollapsed ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          </div>
          <div className="friends-actions">
            <button
              onClick={openAddFriendModal}
              className="add-friend-btn"
              title="Thêm bạn bè"
            >
              <FaUserPlus />
            </button>
          </div>
        </div>

        {!isFriendsCollapsed && <FriendList />}
      </div>
    </div>
  );
};

export default RightSidebar;