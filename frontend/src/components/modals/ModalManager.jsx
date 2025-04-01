// src/components/modals/ModalManager.jsx
import React, { useState } from "react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

const ModalManager = ({ openLoginModal, openSignupModal }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleOpenLoginModal = () => {
    setShowLoginModal(true);
    setShowSignupModal(false);
  };

  const handleOpenSignupModal = () => {
    setShowSignupModal(true);
    setShowLoginModal(false);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  // Thêm hàm để chuyển đổi giữa hai modal
  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  // Gán hàm từ props để Navbar có thể gọi
  if (openLoginModal) openLoginModal.current = handleOpenLoginModal;
  if (openSignupModal) openSignupModal.current = handleOpenSignupModal;

  return (
    <>
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeModals}
        switchToSignup={switchToSignup} // Truyền hàm để chuyển sang Signup
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={closeModals}
        switchToLogin={switchToLogin} // Truyền hàm để chuyển sang Login
      />
    </>
  );
};

export default ModalManager;