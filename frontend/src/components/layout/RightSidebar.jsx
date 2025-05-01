import React, { useEffect } from 'react';
import { FaUserPlus, FaChevronUp, FaChevronDown, FaVideo } from 'react-icons/fa';
import useModalStore from '../../store/modalStore.jsx';
import useCanvasStore from '../../store/canvasStore.jsx';
import usePlayerStore from '../../store/playerStore';
import { getSongVideoUrl } from '../../services/musicApi';
import Canvas from '../canvas/Canvas';
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

  const friends = [
    { name: 'As a Programmer', song: 'Starlight - Another Artist', artist: 'Another Artist', img: './src/assets/images/luu.jpg' },
    { name: 'Tania Star', song: 'Purple Sunset - Jazz Combo', artist: 'Jazz Combo', img: './src/assets/images/luu.jpg' },
    { name: 'David Myers', song: 'Inner Light - Shocking Lemon', artist: 'Shocking Lemon', img: './src/assets/images/luu.jpg' },
  ];

  return (
    <div className="right-sidebar-content">
      {/* Canvas component */}
      {isCanvasVisible && <Canvas />}

      {/* Friends section */}
      <div className="friends-section">
        <div className="friends-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="friends-title-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="playlists-section h2">Bạn bè</h2>
            <button
              onClick={toggleFriends}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#b3b3b3',
                display: 'flex',
                alignItems: 'center',
              }}
              title={isFriendsCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              {isFriendsCollapsed ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          </div>
          <div className="friends-actions">
            <button
              onClick={openAddFriendModal}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '1.2rem',
              }}
              title="Thêm bạn bè"
            >
              <FaUserPlus />
            </button>
          </div>
        </div>

        {!isFriendsCollapsed && (
          <div className="friends-list">
            {friends.map((friend, index) => (
              <div key={index} className="friend-row">
                <img src={friend.img} alt={friend.name} className="friend-avatar" />
                <div className="friend-info">
                  <div className="friend-name">{friend.name}</div>
                  <div className="friend-song">{friend.song}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;