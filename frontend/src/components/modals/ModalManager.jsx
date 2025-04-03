import React from 'react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import AddFriendModal from './AddFriendModal';
import PlaylistModal from './PlaylistModal'; // Thêm import
import useModalStore from '../../store/modalStore.jsx';

const ModalManager = () => {
  const {
    isLoginModalOpen,
    isSignupModalOpen,
    isAddFriendModalOpen,
    isPlaylistModalOpen, // Thêm trạng thái mới
    closeModals,
    switchToLogin,
    switchToSignup,
  } = useModalStore();

  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeModals} switchToSignup={switchToSignup} />
      <SignupModal isOpen={isSignupModalOpen} onClose={closeModals} switchToLogin={switchToLogin} />
      <AddFriendModal isOpen={isAddFriendModalOpen} onClose={closeModals} />
      <PlaylistModal isOpen={isPlaylistModalOpen} onClose={closeModals} />
    </>
  );
};

export default ModalManager;