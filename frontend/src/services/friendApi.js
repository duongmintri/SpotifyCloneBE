// API service for friend functionality
import { fetchWithAuth } from './api';

const API_URL = 'http://localhost:8000';

// Tìm kiếm người dùng
export const searchUsers = async (query) => {
  try {
    if (!query) {
      return { error: 'Vui lòng nhập từ khóa để tìm kiếm' };
    }

    const response = await fetchWithAuth(`${API_URL}/api/accounts/search/?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể tìm kiếm người dùng');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tìm kiếm người dùng:', error);
    return { error: error.message || 'Không thể tìm kiếm người dùng' };
  }
};

// Gửi lời mời kết bạn
export const sendFriendRequest = async (userId) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/accounts/friend-requests/send/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể gửi lời mời kết bạn');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi gửi lời mời kết bạn:', error);
    return { error: error.message || 'Không thể gửi lời mời kết bạn' };
  }
};

// Lấy danh sách lời mời kết bạn
export const getFriendRequests = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/accounts/friend-requests/`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể lấy danh sách lời mời kết bạn');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy danh sách lời mời kết bạn:', error);
    return { error: error.message || 'Không thể lấy danh sách lời mời kết bạn' };
  }
};

// Phản hồi lời mời kết bạn (chấp nhận hoặc từ chối)
export const respondToFriendRequest = async (requestId, action) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/accounts/friend-requests/${requestId}/respond/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể phản hồi lời mời kết bạn');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi phản hồi lời mời kết bạn:', error);
    return { error: error.message || 'Không thể phản hồi lời mời kết bạn' };
  }
};

// Lấy danh sách bạn bè
export const getFriends = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/accounts/friends/`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể lấy danh sách bạn bè');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bạn bè:', error);
    return { error: error.message || 'Không thể lấy danh sách bạn bè' };
  }
};

// Xóa bạn bè
export const removeFriend = async (userId) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/accounts/friends/remove/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể xóa bạn bè');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi xóa bạn bè:', error);
    return { error: error.message || 'Không thể xóa bạn bè' };
  }
};
