import React, { useState, useRef, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaRandom,
  FaRedo,
  FaVolumeUp,
  FaVolumeMute,
  FaVideo,
  FaList,
  FaDownload,
  FaHeart,
} from "react-icons/fa";

import PlaylistPopup from "../popups/PlaylistPopup";
import usePlayerStore from "../../store/playerStore";
import { fetchWithAuth } from "../../services/api";
import AudioPlayer from "./AudioPlayer";
import ImageLoader from "./ImageLoader";
import "./MusicPlayer.css";

const MusicPlayer = () => {
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  // Lấy state và actions từ playerStore
  const {
    isPlaying,
    currentSong,
    currentTime,
    duration,
    volume,
    isShuffled,
    repeatMode,
    queue,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    seekTo,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
  } = usePlayerStore();

  // Hàm toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Xử lý event listeners cho thanh tiến trình
  useEffect(() => {
    if (isDraggingProgress) {
      document.addEventListener('mousemove', handleProgressMouseMove);
      document.addEventListener('mouseup', handleProgressMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleProgressMouseMove);
        document.removeEventListener('mouseup', handleProgressMouseUp);
      };
    }
  }, [isDraggingProgress]);

  // Xử lý event listeners cho thanh âm lượng
  useEffect(() => {
    if (isDraggingVolume) {
      document.addEventListener('mousemove', handleVolumeMouseMove);
      document.addEventListener('mouseup', handleVolumeMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleVolumeMouseMove);
        document.removeEventListener('mouseup', handleVolumeMouseUp);
      };
    }
  }, [isDraggingVolume]);

  const togglePlaylistPopup = () => {
    setShowPlaylistPopup(!showPlaylistPopup);
  };

  // Xử lý thanh tiến trình
  const handleProgressClick = (e) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
    seekTo(percentage * duration);
  };

  const handleProgressMouseDown = (e) => {
    if (!progressRef.current || !duration) return;
    setIsDraggingProgress(true);
    e.preventDefault();
  };

  const handleProgressMouseMove = (e) => {
    if (!isDraggingProgress || !progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percentage = offsetX / rect.width;
    setCurrentTime(percentage * duration);
  };

  const handleProgressMouseUp = (e) => {
    if (!isDraggingProgress || !progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percentage = offsetX / rect.width;
    seekTo(percentage * duration);
    setIsDraggingProgress(false);
  };

  // Xử lý thanh âm lượng
  const handleVolumeClick = (e) => {
    if (!volumeRef.current) return;

    const rect = volumeRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
    setVolume(percentage);
  };

  const handleVolumeMouseDown = (e) => {
    if (!volumeRef.current) return;
    setIsDraggingVolume(true);
    e.preventDefault();
  };

  const handleVolumeMouseMove = (e) => {
    if (!isDraggingVolume || !volumeRef.current) return;

    const rect = volumeRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percentage = offsetX / rect.width;
    setVolume(Math.max(0, Math.min(1, percentage)));
  };

  const handleVolumeMouseUp = (e) => {
    if (!isDraggingVolume || !volumeRef.current) return;

    const rect = volumeRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percentage = offsetX / rect.width;
    setVolume(Math.max(0, Math.min(1, percentage)));
    setIsDraggingVolume(false);
  };

  // Format thời gian từ giây sang mm:ss
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Tính toán phần trăm tiến độ và âm lượng
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = volume * 100;

  return (
    <>
      {/* AudioPlayer component */}
      <AudioPlayer
        songId={currentSong?.id}
        isPlaying={isPlaying}
        currentTime={currentTime}
        volume={volume}
        repeatMode={repeatMode}
        onEnded={() => {
          setIsPlaying(false);

          if (repeatMode === 'one') {
            // Nếu lặp lại một bài, reset thời gian và tiếp tục phát
            seekTo(0);

            // Sử dụng setTimeout để đảm bảo seekTo đã hoàn thành
            setTimeout(() => {
              setIsPlaying(true);

              // Thêm một lần nữa để đảm bảo
              setTimeout(() => {
                if (!isPlaying) {
                  setIsPlaying(true);
                }
              }, 200);
            }, 300);
          } else {
            // Nếu không, chuyển bài tiếp theo
            playNext();
          }
        }}
        onTimeUpdate={setCurrentTime}
        onLoadedMetadata={setDuration}
      />

      <div className="player-container">
        <div className="song-info">
          <ImageLoader
            songId={currentSong?.id}
            coverImage={currentSong?.cover_image}
            fallbackSrc="/src/assets/images/cover-images/3.jpg"
            alt={currentSong?.title || "No song playing"}
            className="song-img"
          />
          <div className="song-details">
            <div className="song-title">{currentSong?.title || "No song playing"}</div>
            <div className="song-artist">{currentSong?.artist || "Unknown artist"}</div>
          </div>
        </div>

        <div className="player-controls">
          <div className="control-buttons">
            <button
              className={`control-btn ${isShuffled ? 'active' : ''}`}
              onClick={(e) => {
                // Thêm hiệu ứng ripple khi click
                const button = e.currentTarget;
                const ripple = document.createElement('span');
                ripple.classList.add('control-btn-ripple');
                button.appendChild(ripple);

                setTimeout(() => button.removeChild(ripple), 600);
                toggleShuffle();
              }}
              title={isShuffled ? "Tắt phát ngẫu nhiên" : "Bật phát ngẫu nhiên"}
            >
              <div className="shuffle-button-container">
                <FaRandom />
                {isShuffled && <div className="shuffle-indicator">Ngẫu nhiên</div>}
              </div>
            </button>
            <button
              className="control-btn"
              onClick={playPrevious}
              title="Chuyển về bài trước"
              disabled={!currentSong}
            >
              <div className="control-btn-container">
                <FaStepBackward />
                <span className="control-tooltip">Bài trước</span>
              </div>
            </button>
            <button
              className={`play-btn ${isPlaying ? 'playing' : ''}`}
              onClick={(e) => {
                // Thêm hiệu ứng ripple khi click
                const button = e.currentTarget;
                const ripple = document.createElement('span');
                ripple.classList.add('play-btn-ripple');
                button.appendChild(ripple);

                setTimeout(() => button.removeChild(ripple), 600);
                togglePlay();
              }}
              disabled={!currentSong}
              title={isPlaying ? "Tạm dừng" : "Phát"}
            >
              <div className="play-icon-container">
                {isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: '2px' }} />}
              </div>
            </button>
            <button
              className="control-btn"
              onClick={playNext}
              title="Chuyển qua bài tiếp theo"
              disabled={!currentSong}
            >
              <div className="control-btn-container">
                <FaStepForward />
                <span className="control-tooltip">Bài tiếp</span>
              </div>
            </button>
            <button
              className={`control-btn ${repeatMode !== 'none' ? 'active' : ''}`}
              onClick={(e) => {
                // Thêm hiệu ứng ripple khi click
                const button = e.currentTarget;
                const ripple = document.createElement('span');
                ripple.classList.add('control-btn-ripple');
                button.appendChild(ripple);

                setTimeout(() => button.removeChild(ripple), 600);
                toggleRepeat();
              }}
              title={
                repeatMode === 'none' ? "Bật lặp lại tất cả" :
                repeatMode === 'all' ? "Bật lặp lại một bài" : "Tắt lặp lại"
              }
            >
              <div className="repeat-button-container">
                <FaRedo />
                {repeatMode === 'one' && <span className="repeat-one">1</span>}
                {repeatMode !== 'none' && (
                  <div className="repeat-indicator">
                    {repeatMode === 'all' ? 'Tất cả' : 'Một bài'}
                  </div>
                )}
              </div>
            </button>
          </div>

          <div className="progress-container">
            <div className="progress-time">{formatTime(currentTime)}</div>
            <div
              className={`progress-bar ${isDraggingProgress ? 'dragging' : ''}`}
              ref={progressRef}
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
              onMouseMove={(e) => {
                if (isDraggingProgress) return;

                const rect = e.currentTarget.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
                const hoverTime = percentage * duration;

                const tooltip = e.currentTarget.querySelector('.progress-tooltip');
                if (tooltip) {
                  tooltip.style.left = `${offsetX}px`;
                  tooltip.textContent = formatTime(hoverTime);
                  tooltip.style.display = 'block';
                }
              }}
              onMouseLeave={(e) => {
                if (isDraggingProgress) return;

                const tooltip = e.currentTarget.querySelector('.progress-tooltip');
                if (tooltip) {
                  tooltip.style.display = 'none';
                }
              }}
            >
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
              <div
                className="progress-handle"
                style={{ left: `${progressPercentage}%` }}
              ></div>
              <div className="progress-tooltip">0:00</div>
            </div>
            <div className="progress-time">{formatTime(duration)}</div>
          </div>
        </div>

        <div
          className="volume-container"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          {/* Nút yêu thích */}
          <button
            className="control-btn"
            title="Yêu thích"
            disabled={!currentSong}
          >
            <FaHeart />
          </button>

          {/* Nút download */}
          <div className="dropdown">
            <button
              className="control-btn dropdown-toggle"
              title="Tải xuống"
              disabled={!currentSong}
            >
              <FaDownload />
            </button>
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  if (!currentSong) return;

                  // Thêm timestamp để tránh cache
                  const timestamp = new Date().getTime();
                  const url = `http://localhost:8000/api/songs/${currentSong.id}/download/?t=${timestamp}`;

                  // Sử dụng fetchWithAuth để tự động xử lý refresh token
                  (async () => {
                    try {
                      const response = await fetchWithAuth(url, {
                        method: 'GET',
                      });

                      console.log("Download response status:", response.status);
                      console.log("Download response headers:", [...response.headers.entries()]);

                      if (!response.ok) {
                        const errorText = await response.text();
                        console.error("Download response error text:", errorText);
                        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
                      }

                      const blob = await response.blob();

                      // Tạo URL từ blob
                      const objectURL = URL.createObjectURL(blob);

                      // Tạo một thẻ a tạm thời để tải xuống
                      const a = document.createElement('a');
                      a.href = objectURL;
                      a.download = `${currentSong.title || 'song'}.mp3`;
                      document.body.appendChild(a);
                      a.click();

                      // Dọn dẹp
                      URL.revokeObjectURL(objectURL);
                      document.body.removeChild(a);
                    } catch (error) {
                      console.error("Lỗi khi tải xuống file audio:", error);
                    }
                  })();
                }}
              >
                Tải nhạc
              </button>
            </div>
          </div>

          {/* Nút mở video pop-up */}
          <button
            className="control-btn"
            onClick={() => console.log("Mở video pop-up (chưa có chức năng)")}
            title="Xem video"
            disabled={!currentSong}
          >
            <FaVideo />
          </button>

          {/* Nút mở playlist popup */}
          <button
            className="control-btn"
            onClick={togglePlaylistPopup}
            title="Xem playlist hiện tại"
          >
            <FaList />
          </button>

          {/* Nút âm lượng với tooltip */}
          <div className="volume-control">
            <div className="volume-icon-wrapper">
              {volume === 0 ? (
                <FaVolumeMute
                  className="volume-icon"
                  title="Bật âm thanh"
                  onClick={() => setVolume(0.5)}
                />
              ) : volume < 0.3 ? (
                <FaVolumeUp
                  className="volume-icon volume-low"
                  title="Âm lượng thấp"
                  onClick={() => setVolume(0)}
                />
              ) : volume < 0.7 ? (
                <FaVolumeUp
                  className="volume-icon volume-medium"
                  title="Âm lượng vừa"
                  onClick={() => setVolume(0)}
                />
              ) : (
                <FaVolumeUp
                  className="volume-icon volume-high"
                  title="Âm lượng cao"
                  onClick={() => setVolume(0)}
                />
              )}
              <span className="volume-percentage">{Math.round(volumePercentage)}%</span>
            </div>

            <div
              className={`volume-slider ${isDraggingVolume ? 'dragging' : ''}`}
              ref={volumeRef}
              onClick={handleVolumeClick}
              onMouseDown={handleVolumeMouseDown}
              title={`Âm lượng: ${Math.round(volumePercentage)}%`}
            >
              <div
                className="volume-slider-fill"
                style={{ width: `${volumePercentage}%` }}
              ></div>
              <div
                className="volume-handle"
                style={{ left: `${volumePercentage}%` }}
              ></div>
              <div className="volume-tooltip">{Math.round(volumePercentage)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Popup */}
      <PlaylistPopup
        isOpen={showPlaylistPopup}
        onClose={togglePlaylistPopup}
        playlist={queue}
        currentSong={currentSong}
        onPlaySong={(song) => {
          const index = queue.findIndex(item => item.id === song.id);
          if (index !== -1) {
            usePlayerStore.getState().setCurrentSong(song);
            usePlayerStore.getState().setIsPlaying(true);
          }
        }}
      />
    </>
  );
};

export default MusicPlayer;