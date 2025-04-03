import React from 'react';
import { FaUserPlus } from 'react-icons/fa'; // Icon "Thêm bạn bè"
import useModalStore from '../../store/modalStore.jsx'; // Điều chỉnh đường dẫn nếu cần

const RightSidebar = () => {
  const { openAddFriendModal } = useModalStore();

  const friends = [
    { name: 'As a Programmer', song: 'Starlight - Another Artist', artist: 'Another Artist', img: './src/assets/images/luu.jpg' },
    { name: 'Tania Star', song: 'Purple Sunset - Jazz Combo', artist: 'Jazz Combo', img: './src/assets/images/luu.jpg' },
    { name: 'David Myers', song: 'Inner Light - Shocking Lemon', artist: 'Shocking Lemon', img: './src/assets/images/luu.jpg' },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="playlists-section h2">Bạn bè</h2>
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
      <div>
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
    </>
  );
};

export default RightSidebar;