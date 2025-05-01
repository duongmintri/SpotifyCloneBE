import React, { useRef, useEffect, useState } from 'react';
import { FaTimes, FaExpand, FaCompress, FaPlay, FaPause } from 'react-icons/fa';
import useCanvasStore from '../../store/canvasStore';
import usePlayerStore from '../../store/playerStore';
import './Canvas.css';

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

  // Lấy state từ playerStore
  const {
    isPlaying,
    currentSong
  } = usePlayerStore();

  // Đồng bộ trạng thái phát với player (chỉ play/pause)
  useEffect(() => {
    if (!videoRef.current) return;

    // Cập nhật trạng thái phát local
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
    setLocalIsPlaying(!localIsPlaying);

    if (videoRef.current) {
      if (!localIsPlaying) {
        videoRef.current.play().catch(err => {
          console.error('Không thể phát video:', err);
        });
      } else {
        videoRef.current.pause();
      }
    }
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
