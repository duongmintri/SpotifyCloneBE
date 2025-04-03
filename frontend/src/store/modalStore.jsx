import { create } from 'zustand';

const useModalStore = create((set) => ({
  isLoginModalOpen: false,
  isSignupModalOpen: false,
  isAddFriendModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true, isSignupModalOpen: false }),
  openSignupModal: () => set({ isLoginModalOpen: false, isSignupModalOpen: true }),
  openAddFriendModal: () => set({ isLoginModalOpen: false, isSignupModalOpen: false, isAddFriendModalOpen: true }),
  closeModals: () => set({ isLoginModalOpen: false, isSignupModalOpen: false, isAddFriendModalOpen: false }),
  switchToLogin: () => set({ isLoginModalOpen: true, isSignupModalOpen: false }),
  switchToSignup: () => set({ isLoginModalOpen: false, isSignupModalOpen: true }),
}));

export default useModalStore;