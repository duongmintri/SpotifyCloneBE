import React from 'react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import useModalStore from '../../store/modalStore.jsx';

const ModalManager = () => {
  const {
    isLoginModalOpen,
    isSignupModalOpen,
    closeModals,
    switchToLogin,
    switchToSignup,
  } = useModalStore();

  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeModals}
        switchToSignup={switchToSignup}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={closeModals}
        switchToLogin={switchToLogin}
      />
    </>
  );
};

export default ModalManager;