import { create } from 'zustand';

const useModalStore = create((set) => ({
  isLoginModalOpen: false,
  isSignupModalOpen: false,
  isAddFriendModalOpen: false,
  isPlaylistModalOpen: false, // Thêm trạng thái mới cho modal playlist
  openLoginModal: () => set({ isLoginModalOpen: true, isSignupModalOpen: false, isAddFriendModalOpen: false, isPlaylistModalOpen: false }),
  openSignupModal: () => set({ isLoginModalOpen: false, isSignupModalOpen: true, isAddFriendModalOpen: false, isPlaylistModalOpen: false }),
  openAddFriendModal: () => set({ isLoginModalOpen: false, isSignupModalOpen: false, isAddFriendModalOpen: true, isPlaylistModalOpen: false }),
  openPlaylistModal: () => set({ isLoginModalOpen: false, isSignupModalOpen: false, isAddFriendModalOpen: false, isPlaylistModalOpen: true }), // Thêm hàm mở modal playlist
  closeModals: () => set({ isLoginModalOpen: false, isSignupModalOpen: false, isAddFriendModalOpen: false, isPlaylistModalOpen: false }), // Đóng tất cả modal
  switchToLogin: () => set({ isLoginModalOpen: true, isSignupModalOpen: false, isAddFriendModalOpen: false, isPlaylistModalOpen: false }),
  switchToSignup: () => set({ isLoginModalOpen: false, isSignupModalOpen: true, isAddFriendModalOpen: false, isPlaylistModalOpen: false }),
}));

export default useModalStore;