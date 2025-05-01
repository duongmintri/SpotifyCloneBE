import React from "react";
import { IoMdClose } from "react-icons/io";

const DeleteConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-container">
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">{title}</h2>
          <button className="admin-modal-close-btn" onClick={onCancel}>
            <IoMdClose />
          </button>
        </div>
        <div className="admin-modal-content">
          <p>{message}</p>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-cancel-btn" onClick={onCancel}>
            Hủy
          </button>
          <button className="admin-save-btn" onClick={onConfirm} style={{ backgroundColor: "#ff5555" }}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
