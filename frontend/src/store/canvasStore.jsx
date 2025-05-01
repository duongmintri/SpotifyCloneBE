import { create } from 'zustand';

const useCanvasStore = create((set, get) => ({
  // Trạng thái hiển thị canvas
  isCanvasVisible: false,

  // Trạng thái thu gọn phần bạn bè
  isFriendsCollapsed: false,

  // URL video hiện tại
  currentVideoUrl: null,

  // Trạng thái đồng bộ với player
  isSyncWithPlayer: false,

  // Hiển thị/ẩn canvas
  toggleCanvas: () => {
    const { isCanvasVisible } = get();
    set({ isCanvasVisible: !isCanvasVisible });
  },

  // Hiển thị canvas
  showCanvas: () => set({ isCanvasVisible: true }),

  // Ẩn canvas
  hideCanvas: () => set({ isCanvasVisible: false }),

  // Thu gọn/mở rộng phần bạn bè
  toggleFriends: () => {
    const { isFriendsCollapsed } = get();
    set({ isFriendsCollapsed: !isFriendsCollapsed });
  },

  // Cập nhật URL video
  setVideoUrl: (url) => {
    set({
      currentVideoUrl: url,
      isCanvasVisible: url !== null
    });
  },

  // Bật/tắt đồng bộ với player
  toggleSync: () => {
    const { isSyncWithPlayer } = get();
    set({ isSyncWithPlayer: !isSyncWithPlayer });
  },

  // Đặt trạng thái đồng bộ
  setSync: (sync) => set({ isSyncWithPlayer: sync }),
}));

export default useCanvasStore;
