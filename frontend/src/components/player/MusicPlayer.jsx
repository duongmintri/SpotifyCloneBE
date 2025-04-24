import React, { useState, useRef } from "react";
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
import { getAccessToken } from "../../services/api";
import AudioPlayer from "./AudioPlayer";
import ImageLoader from "./ImageLoader";

const MusicPlayer = () => {
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
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
    togglePlay,
    setCurrentTime,
    setDuration,
    setVolume,
    seekTo,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
  } = usePlayerStore();

  // Không cần các useEffect để xử lý audio nữa vì đã có AudioPlayer component

  const togglePlaylistPopup = () => {
    setShowPlaylistPopup(!showPlaylistPopup);
  };

  // Xử lý khi click vào thanh progress
  const handleProgressClick = (e) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = offsetX / width;
    const newTime = percentage * duration;

    seekTo(newTime);
  };

  // Xử lý khi click vào thanh volume
  const handleVolumeClick = (e) => {
    if (!volumeRef.current) return;

    const rect = volumeRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = offsetX / width;

    setVolume(Math.max(0, Math.min(1, percentage)));
  };

  // Format thời gian từ giây sang mm:ss
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Tính toán phần trăm tiến độ
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Tính toán phần trăm âm lượng
  const volumePercentage = volume * 100;

  return (
    <>
      {/* Thêm AudioPlayer component */}
      <AudioPlayer
        songId={currentSong?.id}
        isPlaying={isPlaying}
        onEnded={() => {
          if (repeatMode === 'one') {
            // Nếu lặp lại một bài, reset thời gian và tiếp tục phát
            seekTo(0);
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
              onClick={toggleShuffle}
              title={isShuffled ? "Tắt phát ngẫu nhiên" : "Bật phát ngẫu nhiên"}
            >
              <FaRandom />
            </button>
            <button
              className="control-btn"
              onClick={playPrevious}
              title="Chuyển về bài trước"
              disabled={!currentSong}
            >
              <FaStepBackward />
            </button>
            <button
              className="play-btn"
              onClick={togglePlay}
              disabled={!currentSong}
              title={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button
              className="control-btn"
              onClick={playNext}
              title="Chuyển qua bài tiếp theo"
              disabled={!currentSong}
            >
              <FaStepForward />
            </button>
            <button
              className={`control-btn ${repeatMode !== 'none' ? 'active' : ''}`}
              onClick={toggleRepeat}
              title={
                repeatMode === 'none' ? "Bật lặp lại tất cả" :
                repeatMode === 'all' ? "Bật lặp lại một bài" : "Tắt lặp lại"
              }
            >
              <FaRedo />
              {repeatMode === 'one' && <span className="repeat-one">1</span>}
            </button>
          </div>

          <div className="progress-container">
            <div className="progress-time">{formatTime(currentTime)}</div>
            <div
              className="progress-bar"
              ref={progressRef}
              onClick={handleProgressClick}
            >
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
              <div
                className="progress-handle"
                style={{ left: `${progressPercentage}%` }}
              ></div>
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

                  // Không cần sử dụng getSongDownloadUrl vì chúng ta đã tạo URL trực tiếp

                  // Tạo một fetch request để lấy file audio với header Authorization
                  const token = getAccessToken();
                  console.log("Token được sử dụng cho download:", token);

                  // Thêm timestamp để tránh cache
                  const timestamp = new Date().getTime();
                  const url = `http://localhost:8000/api/songs/${currentSong.id}/download/?t=${timestamp}`;
                  console.log("Download URL:", url);

                  // Sử dụng async/await để code dễ đọc hơn
                  (async () => {
                    try {
                      const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                        },
                        credentials: 'include',
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

          {/* Nút âm lượng */}
          {volume === 0 ? (
            <FaVolumeMute
              className="volume-icon"
              title="Bật âm thanh"
              onClick={() => setVolume(0.5)}
            />
          ) : (
            <FaVolumeUp
              className="volume-icon"
              title="Tắt âm thanh"
              onClick={() => setVolume(0)}
            />
          )}

          <div
            className="volume-slider"
            ref={volumeRef}
            onClick={handleVolumeClick}
          >
            <div
              className="volume-slider-fill"
              style={{ width: `${volumePercentage}%` }}
            ></div>
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