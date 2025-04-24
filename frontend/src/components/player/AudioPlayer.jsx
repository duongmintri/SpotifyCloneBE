import React, { useEffect, useRef } from 'react';
import { getAccessToken } from '../../services/api';

/**
 * AudioPlayer Component
 *
 * Xử lý việc phát nhạc từ API với xác thực token
 *
 * @param {number|string} songId - ID của bài hát cần phát
 * @param {boolean} isPlaying - Trạng thái phát/dừng
 * @param {function} onEnded - Callback khi bài hát kết thúc
 * @param {function} onTimeUpdate - Callback khi thời gian phát thay đổi
 * @param {function} onLoadedMetadata - Callback khi metadata được tải
 */
const AudioPlayer = ({ songId, isPlaying, onEnded, onTimeUpdate, onLoadedMetadata }) => {
  const audioRef = useRef(null);

  // 1. Xử lý các sự kiện audio (timeupdate, loadedmetadata, ended)
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => onTimeUpdate?.(audio.currentTime);
    const handleLoadedMetadata = () => onLoadedMetadata?.(audio.duration);
    const handleEnded = () => onEnded?.();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // Cleanup listeners khi component unmount
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate, onLoadedMetadata, onEnded]);

  // 2. Xử lý khi isPlaying thay đổi (play/pause)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(error => {
        console.error("Lỗi khi phát nhạc:", error);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // 3. Xử lý khi songId thay đổi - tải file audio mới
  useEffect(() => {
    if (!songId) return;

    // Tạo URL với timestamp để tránh cache
    const timestamp = new Date().getTime();
    const streamUrl = `http://localhost:8000/api/songs/${songId}/stream/?t=${timestamp}`;

    console.log("AudioPlayer - Stream URL:", streamUrl);

    // Lấy token xác thực
    const token = getAccessToken();

    // Sử dụng IIFE async để có thể dùng async/await
    (async () => {
      try {
        // Fetch audio file với token xác thực
        const response = await fetch(streamUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        console.log("AudioPlayer - Response status:", response.status);

        // Xử lý lỗi nếu có
        if (!response.ok) {
          const errorText = await response.text();
          console.error("AudioPlayer - Error text:", errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Chuyển response thành blob
        const blob = await response.blob();

        // Tạo URL từ blob
        const objectURL = URL.createObjectURL(blob);
        console.log("AudioPlayer - Created Object URL:", objectURL);

        // Đặt src cho audio element và phát nếu cần
        if (audioRef.current) {
          audioRef.current.src = objectURL;
          audioRef.current.load();

          if (isPlaying) {
            try {
              await audioRef.current.play();
            } catch (error) {
              console.error("AudioPlayer - Error playing:", error);
            }
          }
        }
      } catch (error) {
        console.error("AudioPlayer - Error fetching audio:", error);
      }
    })();

    // Cleanup function
    return () => {
      // Không cần revokeObjectURL ở đây vì browser sẽ tự động dọn dẹp
      // khi không còn tham chiếu đến objectURL
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [songId, isPlaying]);

  return (
    <audio
      ref={audioRef}
      preload="auto"
      style={{ display: 'none' }}
    />
  );
};

export default AudioPlayer;
