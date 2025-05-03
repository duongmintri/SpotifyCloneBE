import React, { useState } from "react";
// Import các component khác
import ChangePasswordModal from "../components/modals/ChangePasswordModal";

const ProfilePage = () => {
  // State và các hàm khác
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  return (
    <div className="profile-page">
      {/* Các phần khác của trang profile */}
      
      <div className="profile-actions">
        <button 
          className="change-password-btn"
          onClick={() => setIsChangePasswordModalOpen(true)}
        >
          Đổi mật khẩu
        </button>
        {/* Các nút khác */}
      </div>
      
      {/* Modal đổi mật khẩu */}
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;