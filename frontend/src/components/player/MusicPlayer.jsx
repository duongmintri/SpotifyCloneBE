import React from "react";
import {
  FaPlay,
  FaStepBackward,
  FaStepForward,
  FaRandom,
  FaRedo,
  FaVolumeUp,
  FaVideo,
  FaList,
  FaDownload,
  FaLightHeart,
} from "react-icons/fa";
import useModalStore from "../../store/modalStore.jsx"; // Điều chỉnh đường dẫn nếu cần

const MusicPlayer = () => {
  const { openPlaylistModal } = useModalStore();

  return (
    <div className="player-container">
      <div className="song-info">
        <img
          src="/src/assets/images/cover-images/3.jpg"
          alt="Inner Light"
          className="song-img"
        />
        <div className="song-details">
          <div className="song-title">Inner Light</div>
          <div className="song-artist">Shocking Lemon</div>
        </div>
      </div>

      <div className="player-controls">
        <div className="control-buttons">
          <button className="control-btn">
            <FaRandom title="Bật phát nhạc ngẫu nhiên" />
          </button>
          <button className="control-btn">
            <FaStepBackward title="Chuyển về bài trước" />
          </button>
          <button className="play-btn">
            <FaPlay title="Ngừng/Tiếp tục" />
          </button>
          <button className="control-btn">
            <FaStepForward title="Chuyển qua bài tiếp theo" />
          </button>
          <button className="control-btn">
            <FaRedo title="Bật lặp lại" />
          </button>
        </div>

        <div className="progress-container">
          <div className="progress-time">1:23</div>
          <div className="progress-bar">
            <div className="progress-bar-fill"></div>
            <div className="progress-handle"></div>
          </div>
          <div className="progress-time">3:45</div>
        </div>
      </div>

      <div
        className="volume-container"
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        {/* Nút yêu thích */}
        <button className="control-btn" title="Yêu thích">
          <FaHeart />
        </button>

        {/* Nút download */}
        <div className="dropdown">
          <button className="control-btn dropdown-toggle" title="Tải xuống">
            <FaDownload />
          </button>
          <div className="dropdown-menu">
            <button
              className="dropdown-item"
              onClick={() => console.log("Tải video")}
            >
              Tải video
            </button>
            <button
              className="dropdown-item"
              onClick={() => console.log("Tải nhạc")}
            >
              Tải nhạc
            </button>
          </div>
        </div>

        {/* Nút mở video pop-up */}
        <button
          className="control-btn"
          onClick={() => console.log("Mở video pop-up (chưa có chức năng)")} // Tạm log, để sau thêm logic
          title="Xem video"
        >
          <FaVideo />
        </button>
        {/* Nút mở modal playlist */}
        <button
          className="control-btn"
          onClick={openPlaylistModal}
          title="Xem playlist hiện tại"
        >
          <FaList />
        </button>
        {/* Nút âm lượng hiện có */}
        <FaVolumeUp className="volume-icon" title="Điều chỉnh âm lượng" />

        <div className="volume-slider">
          <div className="volume-slider-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
