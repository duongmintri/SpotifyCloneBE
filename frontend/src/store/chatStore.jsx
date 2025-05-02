import { create } from 'zustand';
import { getChatMessages, sendChatMessage, getUnreadCount, createWebSocketConnection } from '../services/chatApi';
import { getAuthToken } from '../utils/auth';

const useChatStore = create((set, get) => ({
  // Trạng thái chat
  activeChat: null,
  messages: {},
  isLoadingMessages: false,
  messageError: null,

  // Trạng thái WebSocket
  socket: null,
  isConnected: false,

  // Trạng thái tin nhắn chưa đọc
  unreadCount: 0,
  unreadByUser: {},

  // Khởi tạo WebSocket
  initWebSocket: () => {
    const token = getAuthToken();
    if (!token) return;

    // Đóng kết nối cũ nếu có
    const { socket, chatIntervalId } = get();
    if (socket) {
      socket.close();
    }
    if (chatIntervalId) {
      clearInterval(chatIntervalId);
    }

    // Tạo kết nối mới
    const newSocket = createWebSocketConnection(token);

    newSocket.onopen = () => {
      console.log('WebSocket connected');
      set({ socket: newSocket, isConnected: true });
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      set({ isConnected: false });
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    newSocket.onmessage = (event) => {
      console.log('Nhận tin nhắn WebSocket:', event.data);
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'chat_message') {
          const message = data.message;
          console.log('Tin nhắn đã nhận:', message);

          // Lấy thông tin người dùng hiện tại
          const currentUserId = parseInt(localStorage.getItem('userId'));

          // Xác định ID của người dùng khác (người gửi hoặc người nhận)
          const senderId = message.sender.id;
          const receiverId = message.receiver.id;
          const otherUserId = currentUserId === senderId ? receiverId : senderId;

          console.log(`Người dùng hiện tại: ${currentUserId}, Người gửi: ${senderId}, Người nhận: ${receiverId}, Người dùng khác: ${otherUserId}`);

          // Tạo key cho cuộc trò chuyện
          const chatKey = `chat_${otherUserId}`;

          // Kiểm tra xem tin nhắn này có phải là tin nhắn đến không
          const isIncomingMessage = senderId !== currentUserId;

          // Kiểm tra xem người dùng có đang chat với người gửi không
          const { activeChat } = get();
          const isChatActive = activeChat === senderId;

          // Cập nhật danh sách tin nhắn
          set(state => {
            // Lấy tin nhắn hiện tại của cuộc trò chuyện này
            const currentMessages = state.messages[chatKey] || [];

            // Kiểm tra xem tin nhắn đã tồn tại chưa
            const messageExists = currentMessages.some(msg => msg.id === message.id);

            if (messageExists) {
              console.log('Tin nhắn đã tồn tại, không cập nhật');
              return state;
            }

            console.log(`Cập nhật tin nhắn cho cuộc trò chuyện: ${chatKey}`);

            // Cập nhật tin nhắn
            const updatedMessages = {
              ...state.messages,
              [chatKey]: [...currentMessages, message]
            };

            // Cập nhật số lượng tin nhắn chưa đọc nếu là tin nhắn đến và người dùng không đang chat với người gửi
            if (isIncomingMessage && !isChatActive) {
              console.log(`Cập nhật số lượng tin nhắn chưa đọc cho người gửi: ${senderId}`);

              // Phát ra âm thanh thông báo
              try {
                const audio = new Audio('/notification.mp3');
                audio.play();
              } catch (error) {
                console.error('Không thể phát âm thanh thông báo:', error);
              }

              // Gọi hàm cập nhật số lượng tin nhắn chưa đọc sau khi cập nhật tin nhắn
              setTimeout(() => {
                get().updateUnreadCount(senderId);
              }, 0);
            }

            return { messages: updatedMessages };
          });
        }
      } catch (error) {
        console.error('Lỗi khi xử lý tin nhắn WebSocket:', error);
      }
    };

    set({ socket: newSocket });
  },

  // Đóng WebSocket
  closeWebSocket: () => {
    const { socket, chatIntervalId } = get();
    if (socket) {
      socket.close();
    }
    if (chatIntervalId) {
      clearInterval(chatIntervalId);
    }
    set({ socket: null, isConnected: false, chatIntervalId: null });
  },

  // Gửi tin nhắn qua WebSocket
  sendMessageWs: (receiverId, content) => {
    const { socket, isConnected } = get();

    if (!socket || !isConnected) {
      console.error('WebSocket không được kết nối');
      return false;
    }

    const message = {
      type: 'chat_message',
      receiver_id: receiverId,
      content: content
    };

    socket.send(JSON.stringify(message));
    return true;
  },

  // Lấy tin nhắn với một người dùng
  fetchMessages: async (userId) => {
    if (!userId) return;

    set({
      isLoadingMessages: true,
      messageError: null,
      activeChat: userId
    });

    try {
      const chatKey = `chat_${userId}`;
      const results = await getChatMessages(userId);

      if (results.error) {
        set({ messageError: results.error });
      } else {
        set(state => ({
          messages: {
            ...state.messages,
            [chatKey]: results
          }
        }));
      }
    } catch (error) {
      set({ messageError: error.message || 'Lỗi khi lấy tin nhắn' });
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  // Gửi tin nhắn mới
  sendMessage: async (receiverId, content) => {
    if (!receiverId || !content) {
      return { success: false, message: 'Thiếu thông tin người nhận hoặc nội dung' };
    }

    try {
      console.log(`Đang gửi tin nhắn đến người dùng ID ${receiverId}: ${content}`);
      console.log(`Trạng thái WebSocket: ${get().isConnected ? 'Đã kết nối' : 'Chưa kết nối'}`);

      // Thử gửi qua WebSocket trước nếu được kết nối
      const { isConnected } = get();
      let sentViaWebSocket = false;

      if (isConnected) {
        console.log('Đang thử gửi tin nhắn qua WebSocket...');
        sentViaWebSocket = get().sendMessageWs(receiverId, content);
        console.log(`Kết quả gửi qua WebSocket: ${sentViaWebSocket ? 'Thành công' : 'Thất bại'}`);
      }

      // Nếu không thành công qua WebSocket, gửi qua API
      if (!sentViaWebSocket) {
        console.log('Gửi tin nhắn qua API...');
        const response = await sendChatMessage(receiverId, content);

        if (response.error) {
          console.error('Lỗi khi gửi tin nhắn qua API:', response.error);
          return { success: false, message: response.error };
        }

        console.log('Tin nhắn đã được gửi thành công qua API:', response);

        // Cập nhật danh sách tin nhắn
        const chatKey = `chat_${receiverId}`;
        set(state => ({
          messages: {
            ...state.messages,
            [chatKey]: [...(state.messages[chatKey] || []), response]
          }
        }));

        return { success: true, message: response };
      }

      return { success: true };
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      return { success: false, message: error.message || 'Lỗi khi gửi tin nhắn' };
    }
  },

  // Lấy số lượng tin nhắn chưa đọc
  fetchUnreadCount: async () => {
    try {
      const response = await getUnreadCount();

      if (response.error) {
        console.error('Lỗi khi lấy số tin nhắn chưa đọc:', response.error);
      } else {
        console.log('Cập nhật số tin nhắn chưa đọc:', response);
        set({
          unreadCount: response.total_unread,
          unreadByUser: response.unread_by_sender
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy số tin nhắn chưa đọc:', error);
    }
  },

  // Cập nhật số lượng tin nhắn chưa đọc khi nhận tin nhắn mới
  updateUnreadCount: (senderId) => {
    set(state => {
      // Cập nhật số lượng tin nhắn chưa đọc
      const updatedUnreadByUser = { ...state.unreadByUser };
      updatedUnreadByUser[senderId] = (updatedUnreadByUser[senderId] || 0) + 1;

      // Tính lại tổng số tin nhắn chưa đọc
      const totalUnread = Object.values(updatedUnreadByUser).reduce((sum, count) => sum + count, 0);

      console.log('Cập nhật số tin nhắn chưa đọc:', {
        senderId,
        unreadByUser: updatedUnreadByUser,
        totalUnread
      });

      return {
        unreadByUser: updatedUnreadByUser,
        unreadCount: totalUnread
      };
    });
  },

  // Đánh dấu tin nhắn đã đọc
  markAsRead: (userId) => {
    // Khi mở chat với một người, đánh dấu là đã đọc
    set(state => {
      const updatedUnreadByUser = { ...state.unreadByUser };
      delete updatedUnreadByUser[userId];

      // Tính lại tổng số tin nhắn chưa đọc
      const totalUnread = Object.values(updatedUnreadByUser).reduce((sum, count) => sum + count, 0);

      return {
        unreadByUser: updatedUnreadByUser,
        unreadCount: totalUnread
      };
    });
  }
}));

export default useChatStore;
