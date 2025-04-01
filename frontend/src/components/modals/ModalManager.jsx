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

  // Gán hàm từ props để Navbar có thể gọi
  if (openLoginModal) openLoginModal.current = handleOpenLoginModal;
  if (openSignupModal) openSignupModal.current = handleOpenSignupModal;

  return (
    <>
      <LoginModal isOpen={showLoginModal} onClose={closeModals} />
      <SignupModal isOpen={showSignupModal} onClose={closeModals} />
    </>
  );
};

export default ModalManager;