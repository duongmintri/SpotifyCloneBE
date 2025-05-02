// API service for chat
import { fetchWithAuth } from './api';

const API_URL = 'http://localhost:8000';

// Lấy danh sách tin nhắn với một người dùng
export const getChatMessages = async (userId) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/accounts/chat/messages/?user_id=${userId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể lấy tin nhắn');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy tin nhắn:', error);
    return { error: error.message || 'Không thể lấy tin nhắn' };
  }
};

// Gửi tin nhắn mới
export const sendChatMessage = async (receiverId, content) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/accounts/chat/messages/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiver_id: receiverId,
        content: content,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể gửi tin nhắn');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn:', error);
    return { error: error.message || 'Không thể gửi tin nhắn' };
  }
};

// Lấy số lượng tin nhắn chưa đọc
export const getUnreadCount = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/accounts/chat/unread/`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể lấy số tin nhắn chưa đọc');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy số tin nhắn chưa đọc:', error);
    return { error: error.message || 'Không thể lấy số tin nhắn chưa đọc' };
  }
};

// Tạo kết nối WebSocket
export const createWebSocketConnection = (token) => {
  const wsUrl = `ws://localhost:8000/ws/chat/?token=${token}`;
  console.log(`Tạo kết nối WebSocket đến: ${wsUrl}`);
  return new WebSocket(wsUrl);
};
