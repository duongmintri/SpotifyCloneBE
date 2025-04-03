import React from 'react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import AddFriendModal from './AddFriendModal'; // Thêm import
import useModalStore from '../../store/modalStore.jsx'; // Điều chỉnh đường dẫn nếu cần

const ModalManager = () => {
  const {
    isLoginModalOpen,
    isSignupModalOpen,
    isAddFriendModalOpen, // Thêm trạng thái mới
    closeModals,
    switchToLogin,
    switchToSignup,
  } = useModalStore();

  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeModals} switchToSignup={switchToSignup} />
      <SignupModal isOpen={isSignupModalOpen} onClose={closeModals} switchToLogin={switchToLogin} />
      <AddFriendModal isOpen={isAddFriendModalOpen} onClose={closeModals} />
    </>
  );
};

export default ModalManager;