import React, { useRef, useEffect, useState } from 'react';
import { FaTimes, FaExpand, FaCompress, FaPlay, FaPause, FaDownload } from 'react-icons/fa';
import useCanvasStore from '../../store/canvasStore';
import usePlayerStore from '../../store/playerStore';
import { fetchWithAuth } from '../../services/api';
import { showErrorToast, showInfoToast } from '../../utils/toast';
import './Canvas.css';

// Thêm định nghĩa API_URL
const API_URL = 'http://localhost:8000';

const Canvas = () => {
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Lấy state từ canvasStore
  const {
    isCanvasVisible,
    currentVideoUrl,
    hideCanvas
  } = useCanvasStore();

  // Lấy state và actions từ playerStore
  const {
    isPlaying,
    currentSong,
    setIsPlaying
  } = usePlayerStore();

  // Đồng bộ trạng thái phát với player (chỉ play/pause)
  useEffect(() => {
    if (!videoRef.current) return;

    // Cập nhật trạng thái phát local để đồng bộ với player
    setLocalIsPlaying(isPlaying);

    if (isPlaying) {
      // Chỉ phát video nếu đã tải xong
      if (isVideoLoaded) {
        videoRef.current.play().catch(err => {
          console.error('Không thể phát video:', err);
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, isVideoLoaded]);

  // Xử lý khi người dùng tự điều khiển video
  const handleVideoPlayPause = () => {
    // Đảo ngược trạng thái phát
    const newPlayingState = !isPlaying;

    // Cập nhật trạng thái phát của player (sẽ tự động đồng bộ với video qua useEffect)
    setIsPlaying(newPlayingState);

    // Không cần điều khiển video trực tiếp ở đây vì useEffect sẽ xử lý
    // khi trạng thái isPlaying thay đổi
  };

  // Xử lý khi URL video thay đổi
  useEffect(() => {
    if (videoRef.current && currentVideoUrl) {
      setIsVideoLoaded(false);
      videoRef.current.load();
    }
  }, [currentVideoUrl]);

  // Xử lý khi video đã tải xong
  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);

    // Nếu player đang phát, phát video
    if (isPlaying) {
      videoRef.current.play().catch(err => {
        console.error('Không thể phát video:', err);
      });
    }
  };

  // Xử lý fullscreen
  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Xử lý tải xuống video
  const handleDownloadVideo = async () => {
    if (!currentSong || !currentVideoUrl) return;

    // Kiểm tra trạng thái premium trước khi tải
    try {
      const premiumResponse = await fetchWithAuth(`${API_URL}/api/accounts/premium-status/`);
      const premiumData = await premiumResponse.json();
      
      if (!premiumData.is_premium) {
        showInfoToast("Chỉ người dùng premium mới có thể tải video. Vui lòng nâng cấp tài khoản của bạn.");
        return;
      }
      
      // Thêm timestamp để tránh cache
      const timestamp = new Date().getTime();
      const url = `http://localhost:8000/api/songs/${currentSong.id}/video/?t=${timestamp}`;
      
      // Phần code tải xuống giữ nguyên
      (async () => {
        try {
          const response = await fetchWithAuth(url, {
            method: 'GET',
          });

          console.log("Download video response status:", response.status);
          console.log("Download video response headers:", [...response.headers.entries()]);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Download video response error text:", errorText);
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
          }

          // Kiểm tra nếu response là JSON (trường hợp S3)
          const contentType = response.headers.get('content-type');

          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.url) {
              // Nếu là URL từ S3, mở cửa sổ mới để tải xuống
              const a = document.createElement('a');
              a.href = data.url;
              a.download = `${currentSong.title || 'video'}.mp4`;
              a.target = '_blank';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } else {
              throw new Error('Không tìm thấy URL trong response');
            }
          } else {
            // Nếu là blob từ backend, tạo objectURL
            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);

            // Tạo một thẻ a tạm thời để tải xuống
            const a = document.createElement('a');
            a.href = objectURL;
            a.download = `${currentSong.title || 'video'}.mp4`;
            document.body.appendChild(a);
            a.click();

            // Dọn dẹp
            URL.revokeObjectURL(objectURL);
            document.body.removeChild(a);
          }
        } catch (error) {
          console.error("Lỗi khi tải xuống file video:", error);
          showErrorToast("Lỗi khi tải xuống video. Vui lòng thử lại sau.");
        }
      })();
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái premium:", error);
      showErrorToast("Không thể kiểm tra trạng thái premium. Vui lòng thử lại sau.");
    }
  };

  // Theo dõi trạng thái fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Nếu canvas không hiển thị hoặc không có URL video, không hiển thị gì
  if (!isCanvasVisible || !currentVideoUrl) {
    return null;
  }

  return (
    <div className="canvas-container">
      <div className="canvas-header">
        <div className="canvas-title">
          {currentSong?.title || 'Canvas'}
        </div>
        <div className="canvas-controls">
          <button
            className="canvas-control-btn"
            onClick={handleVideoPlayPause}
            title={localIsPlaying ? "Tạm dừng video" : "Phát video"}
          >
            {localIsPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button
            className="canvas-control-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
          <button
            className="canvas-control-btn"
            onClick={handleDownloadVideo}
            title="Tải xuống video"
            disabled={!currentVideoUrl}
          >
            <FaDownload />
          </button>
          <button
            className="canvas-control-btn"
            onClick={hideCanvas}
            title="Đóng canvas"
          >
            <FaTimes />
          </button>
        </div>
      </div>
      <div className="canvas-video-container">
        <video
          ref={videoRef}
          className="canvas-video"
          src={currentVideoUrl}
          playsInline
          muted
          loop
          preload="auto"
          onLoadedData={handleVideoLoaded}
        >
          <source src={currentVideoUrl} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video.
        </video>
        <div className={`canvas-overlay ${isVideoLoaded ? 'hidden' : ''}`}>
          <div className="canvas-loading">Đang tải video...</div>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
