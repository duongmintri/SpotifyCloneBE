import React from "react";

const RightSidebar = () => {
  const friends = [
    { name: 'As a Programmer', song: 'Starlight - Another Artist', artist: 'Another Artist', img: 'https://dummyimage.com/150/333333' },
    { name: 'Tania Star', song: 'Purple Sunset - Jazz Combo', artist: 'Jazz Combo', img: 'https://dummyimage.com/150/444444' },
    { name: 'David Myers', song: 'Inner Light - Shocking Lemon', artist: 'Shocking Lemon', img: 'https://dummyimage.com/150/555555' }
  ];

  return (
    <>
      <h2 className="playlists-section h2">Friend Activity</h2>
      <div
        style={{
          marginTop: '1rem',
          maxHeight: '300px', // Giới hạn chiều cao (tùy chỉnh theo nhu cầu)
          overflowY: 'auto',  // Bật cuộn dọc
        }}
      >
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