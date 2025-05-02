import React, { useEffect } from 'react';
import useFriendStore from '../../store/friendStore';
import FriendRequestItem from './FriendRequestItem';
import './FriendRequests.css';

const FriendRequests = () => {
  const { 
    friendRequests, 
    isFetchingRequests, 
    requestsError, 
    fetchFriendRequests 
  } = useFriendStore();

  useEffect(() => {
    fetchFriendRequests();
  }, [fetchFriendRequests]);

  if (isFetchingRequests) {
    return <div className="friend-requests-loading">Đang tải lời mời kết bạn...</div>;
  }

  if (requestsError) {
    return <div className="friend-requests-error">{requestsError}</div>;
  }

  if (friendRequests.length === 0) {
    return <div className="friend-requests-empty">Không có lời mời kết bạn nào</div>;
  }

  return (
    <div className="friend-requests-list">
      {friendRequests.map(request => (
        <FriendRequestItem key={request.id} request={request} />
      ))}
    </div>
  );
};

export default FriendRequests;
