import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import useChatStore from '../../store/chatStore';
import './ChatWindow.css';

// Hàm để lấy ID người dùng hiện tại từ localStorage
const getCurrentUserId = () => {
  return parseInt(localStorage.getItem('userId'));
};

const ChatWindow = ({ friend, onClose }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const {
    messages,
    isLoadingMessages,
    messageError,
    fetchMessages,
    sendMessage,
    markAsRead,
    activeChat
  } = useChatStore();

  // Lấy tin nhắn khi component được mount hoặc khi friend thay đổi
  useEffect(() => {
    if (friend) {
      fetchMessages(friend.id);
      markAsRead(friend.id);
    }
  }, [friend, fetchMessages, markAsRead]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    console.log(`Gửi tin nhắn đến ${friend.username} (ID: ${friend.id}): ${message}`);
    const result = await sendMessage(friend.id, message);
    if (result.success) {
      setMessage('');
      console.log('Tin nhắn đã được gửi thành công');
    } else {
      console.error('Lỗi khi gửi tin nhắn:', result.message);
    }
  };

  // Lấy tin nhắn của cuộc trò chuyện hiện tại
  const chatMessages = friend ? messages[`chat_${friend.id}`] || [] : [];

  if (!friend) {
    return null;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <span className="chat-username">{friend.username}</span>
        </div>
        <button className="chat-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="chat-messages">
        {isLoadingMessages ? (
          <div className="chat-loading">Đang tải tin nhắn...</div>
        ) : messageError ? (
          <div className="chat-error">{messageError}</div>
        ) : chatMessages.length === 0 ? (
          <div className="chat-empty">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</div>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${msg.sender.id !== getCurrentUserId() ? 'received' : 'sent'}`}
            >
              <div className="message-content">{msg.content}</div>
              <div className="message-time">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input"
          placeholder="Nhập tin nhắn..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="chat-send-btn" disabled={!message.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
