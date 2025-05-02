import React, { useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import useFriendStore from '../../store/friendStore';
import './FriendRequestItem.css';

const FriendRequestItem = ({ request }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { respondToRequest } = useFriendStore();

  const handleResponse = async (action) => {
    setIsLoading(true);
    setMessage('');

    try {
      const result = await respondToRequest(request.id, action);
      if (!result.success) {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="friend-request-item">
      <div className="friend-request-avatar">
        <img 
          src={request.from_user.profile_image || './src/assets/images/default-avatar.jpg'} 
          alt={request.from_user.username} 
        />
      </div>
      <div className="friend-request-info">
        <div className="friend-request-name">{request.from_user.username}</div>
        <div className="friend-request-fullname">{request.from_user.full_name || ''}</div>
      </div>
      <div className="friend-request-actions">
        <button 
          className="friend-request-accept" 
          onClick={() => handleResponse('accept')}
          disabled={isLoading}
        >
          <FaCheck />
        </button>
        <button 
          className="friend-request-reject" 
          onClick={() => handleResponse('reject')}
          disabled={isLoading}
        >
          <FaTimes />
        </button>
      </div>
      {message && <div className="friend-request-message">{message}</div>}
    </div>
  );
};

export default FriendRequestItem;
