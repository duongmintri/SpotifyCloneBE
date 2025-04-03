import { create } from "zustand";

const useModalStore = create((set) => ({
  isLoginOpen: false,
  isSignupOpen: false,
  openLoginModal: () => set({ isLoginOpen: true, isSignupOpen: false }),
  openSignupModal: () => set({ isSignupOpen: true, isLoginOpen: false }),
  closeModals: () => set({ isLoginOpen: false, isSignupOpen: false }),
}));

export default useModalStore;
