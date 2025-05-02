import React from "react";
import { IoMdClose } from "react-icons/io";
import { FaCrown, FaCheck, FaMusic, FaDownload, FaAd } from "react-icons/fa";
import "./ModalStyles.css";

const PremiumModal = ({ isOpen, onClose, isPremium, onTogglePremium, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container premium-modal">
        <div className="modal-header">
          <h2>
            {isPremium ? "Hủy gói Premium" : "Nâng cấp lên Premium"}
            {!isPremium && <FaCrown style={{ color: "#FFD700", marginLeft: "10px" }} />}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <IoMdClose />
          </button>
        </div>

        <div className="modal-content">
          {isPremium ? (
            <div className="premium-content">
              <div className="premium-status">
                <FaCrown size={50} style={{ color: "#FFD700" }} />
                <h3>Bạn đang sử dụng gói Premium</h3>
              </div>
              
              <div className="premium-benefits">
                <p>Các quyền lợi bạn đang được hưởng:</p>
                <ul>
                  <li><FaMusic /> Nghe nhạc chất lượng cao</li>
                  <li><FaDownload /> Tải nhạc về máy</li>
                  <li><FaAd /> Không quảng cáo</li>
                  <li><FaCheck /> Truy cập tất cả nội dung Premium</li>
                </ul>
              </div>
              
              <div className="premium-warning">
                <p>Lưu ý: Khi hủy gói Premium, bạn sẽ mất tất cả các quyền lợi trên.</p>
              </div>
              
              <div className="premium-actions">
                <button 
                  className="cancel-premium-btn" 
                  onClick={onTogglePremium}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Hủy gói Premium"}
                </button>
                <button className="keep-premium-btn" onClick={onClose}>
                  Giữ gói Premium
                </button>
              </div>
            </div>
          ) : (
            <div className="premium-content">
              <div className="premium-offer">
                <h3>Nâng cấp lên Premium chỉ với 59.000đ/tháng</h3>
                <p>Trải nghiệm âm nhạc không giới hạn</p>
              </div>
              
              <div className="premium-benefits">
                <p>Quyền lợi của gói Premium:</p>
                <ul>
                  <li><FaMusic /> Nghe nhạc chất lượng cao</li>
                  <li><FaDownload /> Tải nhạc về máy</li>
                  <li><FaAd /> Không quảng cáo</li>
                  <li><FaCheck /> Truy cập tất cả nội dung Premium</li>
                </ul>
              </div>
              
              <div className="payment-options">
                <h4>Phương thức thanh toán</h4>
                <div className="payment-methods">
                  <div className="payment-method">
                    <input type="radio" id="credit-card" name="payment" defaultChecked />
                    <label htmlFor="credit-card">Thẻ tín dụng/ghi nợ</label>
                  </div>
                  <div className="payment-method">
                    <input type="radio" id="momo" name="payment" />
                    <label htmlFor="momo">Ví MoMo</label>
                  </div>
                  <div className="payment-method">
                    <input type="radio" id="banking" name="payment" />
                    <label htmlFor="banking">Internet Banking</label>
                  </div>
                </div>
              </div>
              
              <div className="premium-actions">
                <button 
                  className="upgrade-btn" 
                  onClick={onTogglePremium}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Nâng cấp ngay"}
                </button>
                <button className="cancel-btn" onClick={onClose}>
                  Để sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;