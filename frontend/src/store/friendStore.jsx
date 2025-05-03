import { create } from 'zustand';
import {
  searchUsers,
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
  getFriends,
  removeFriend
} from '../services/friendApi';

const useFriendStore = create((set, get) => ({
  // Trạng thái tìm kiếm
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  searchError: null,

  // Trạng thái lời mời kết bạn
  friendRequests: [],
  isFetchingRequests: false,
  requestsError: null,

  // Trạng thái danh sách bạn bè
  friends: [],
  isFetchingFriends: false,
  friendsError: null,

  // Tìm kiếm người dùng
  searchForUsers: async (query) => {
    if (!query) {
      set({
        searchError: 'Vui lòng nhập từ khóa để tìm kiếm',
        searchResults: []
      });
      return;
    }

    set({ isSearching: true, searchError: null, searchQuery: query });

    try {
      const results = await searchUsers(query);

      if (results.error) {
        set({ searchError: results.error, searchResults: [] });
      } else {
        set({ searchResults: results });
      }
    } catch (error) {
      set({ searchError: error.message || 'Lỗi khi tìm kiếm người dùng', searchResults: [] });
    } finally {
      set({ isSearching: false });
    }
  },

  // Gửi lời mời kết bạn
  sendRequest: async (userId) => {
    try {
      const response = await sendFriendRequest(userId);

      if (response.error) {
        return { success: false, message: response.error };
      }

      // Cập nhật kết quả tìm kiếm để hiển thị trạng thái đã gửi lời mời
      set(state => ({
        searchResults: state.searchResults.map(user =>
          user.id === userId
            ? { ...user, has_pending_request: true }
            : user
        )
      }));

      return { success: true, message: 'Đã gửi lời mời kết bạn' };
    } catch (error) {
      return { success: false, message: error.message || 'Lỗi khi gửi lời mời kết bạn' };
    }
  },

  // Lấy danh sách lời mời kết bạn
  fetchFriendRequests: async () => {
    set({ isFetchingRequests: true, requestsError: null });

    try {
      const results = await getFriendRequests();

      if (results.error) {
        set({ requestsError: results.error, friendRequests: [] });
      } else {
        set({ friendRequests: results });
      }
    } catch (error) {
      set({
        requestsError: error.message || 'Lỗi khi lấy danh sách lời mời kết bạn',
        friendRequests: []
      });
    } finally {
      set({ isFetchingRequests: false });
    }
  },

  // Phản hồi lời mời kết bạn
  respondToRequest: async (requestId, action) => {
    try {
      const response = await respondToFriendRequest(requestId, action);

      if (response.error) {
        return { success: false, message: response.error };
      }

      // Cập nhật danh sách lời mời kết bạn
      set(state => ({
        friendRequests: state.friendRequests.filter(request => request.id !== requestId)
      }));

      // Nếu chấp nhận, cập nhật danh sách bạn bè
      if (action === 'accept') {
        await get().fetchFriends();
      }

      return {
        success: true,
        message: action === 'accept' ? 'Đã chấp nhận lời mời kết bạn' : 'Đã từ chối lời mời kết bạn'
      };
    } catch (error) {
      return { success: false, message: error.message || 'Lỗi khi phản hồi lời mời kết bạn' };
    }
  },

  // Lấy danh sách bạn bè
  fetchFriends: async () => {
    set({ isFetchingFriends: true, friendsError: null });

    try {
      const results = await getFriends();

      if (results.error) {
        set({ friendsError: results.error, friends: [] });
      } else {
        set({ friends: results });
      }
    } catch (error) {
      set({
        friendsError: error.message || 'Lỗi khi lấy danh sách bạn bè',
        friends: []
      });
    } finally {
      set({ isFetchingFriends: false });
    }
  },

  // Xóa bạn bè
  removeFriend: async (userId) => {
    try {
      const response = await removeFriend(userId);

      if (response.error) {
        return { success: false, message: response.error };
      }

      // Cập nhật danh sách bạn bè
      set(state => ({
        friends: state.friends.filter(friend => friend.id !== userId)
      }));

      return { success: true, message: 'Đã xóa khỏi danh sách bạn bè' };
    } catch (error) {
      return { success: false, message: error.message || 'Lỗi khi xóa bạn bè' };
    }
  },

  // Reset trạng thái tìm kiếm
  resetSearch: () => {
    set({
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      searchError: null
    });
  }
}));

export default useFriendStore;
