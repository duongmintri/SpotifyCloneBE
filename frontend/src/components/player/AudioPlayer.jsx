import React, { useEffect, useRef } from 'react';
import { fetchWithAuth } from '../../services/api';

/**
 * AudioPlayer Component
 *
 * Xử lý việc phát nhạc từ API với xác thực token
 *
 * @param {number|string} songId - ID của bài hát cần phát
 * @param {boolean} isPlaying - Trạng thái phát/dừng
 * @param {number} currentTime - Thời gian hiện tại (từ store)
 * @param {number} volume - Âm lượng (từ store)
 * @param {string} repeatMode - Chế độ lặp lại ('none', 'all', 'one')
 * @param {function} onEnded - Callback khi bài hát kết thúc
 * @param {function} onTimeUpdate - Callback khi thời gian phát thay đổi
 * @param {function} onLoadedMetadata - Callback khi metadata được tải
 */
const AudioPlayer = ({ songId, isPlaying, currentTime, volume, repeatMode, onEnded, onTimeUpdate, onLoadedMetadata }) => {
  const audioRef = useRef(null);
  const isSeekingRef = useRef(false);
  const prevSongIdRef = useRef(null);

  // Xử lý các sự kiện audio (timeupdate, loadedmetadata, ended)
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => onTimeUpdate?.(audio.currentTime);
    const handleLoadedMetadata = () => onLoadedMetadata?.(audio.duration);
    const handleEnded = () => onEnded?.();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate, onLoadedMetadata, onEnded]);

  // Xử lý khi isPlaying thay đổi (play/pause)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Lỗi khi phát nhạc:", error);
            if (onTimeUpdate) {
              onTimeUpdate(audio.currentTime);
            }
          });
        }
      } catch (error) {
        console.error("Lỗi khi phát nhạc:", error);
      }
    } else {
      try {
        audio.pause();
        if (onTimeUpdate) {
          onTimeUpdate(audio.currentTime);
        }
      } catch (error) {
        console.error("Lỗi khi dừng nhạc:", error);
      }
    }
  }, [isPlaying, onTimeUpdate]);

  // Xử lý khi songId thay đổi - tải file audio mới
  useEffect(() => {
    if (!songId) return;

    // Kiểm tra xem có phải là cùng một bài hát không
    const isSameSong = prevSongIdRef.current === songId;
    prevSongIdRef.current = songId;

    // Kiểm tra xem src có hợp lệ không
    const hasValidSource = audioRef.current &&
                          audioRef.current.src &&
                          audioRef.current.src !== '' &&
                          audioRef.current.src !== 'about:blank' &&
                          !audioRef.current.error;

    if (isSameSong && hasValidSource) {
      // Cập nhật thời gian hiện tại
      if (onTimeUpdate) {
        onTimeUpdate(audioRef.current.currentTime);
      }

      // Nếu đang yêu cầu phát, phát từ vị trí hiện tại
      if (isPlaying && audioRef.current.readyState >= 2) {
        try {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
          return;
        } catch (error) {
          console.error("Lỗi khi phát nhạc:", error);
        }
      } else if (!isPlaying) {
        return;
      }
    }

    // Tạo URL với timestamp để tránh cache
    const timestamp = new Date().getTime();
    const streamUrl = `http://localhost:8000/api/songs/${songId}/stream/?t=${timestamp}`;

    // Tải file audio mới với xác thực và tự động refresh token
    (async () => {
      try {
        const response = await fetchWithAuth(streamUrl, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);

        if (audioRef.current) {
          // Lưu lại thời gian hiện tại nếu là cùng một bài hát
          const currentTime = isSameSong ? audioRef.current.currentTime : 0;
          const oldSrc = audioRef.current.src;

          // Đặt src mới và tải
          audioRef.current.src = objectURL;

          // Xử lý khi audio đã sẵn sàng
          const handleCanPlay = () => {
            // Khôi phục thời gian nếu là cùng một bài hát
            if (isSameSong && currentTime > 0) {
              audioRef.current.currentTime = currentTime;
              if (onTimeUpdate) {
                onTimeUpdate(currentTime);
              }
            } else if (onTimeUpdate) {
              onTimeUpdate(0);
            }

            // Phát nếu đang yêu cầu phát
            if (isPlaying) {
              try {
                audioRef.current.play().catch(() => {});
              } catch (error) {
                console.error("Lỗi khi phát nhạc:", error);
              }
            }

            audioRef.current.removeEventListener('canplay', handleCanPlay);
          };

          // Xử lý khi có lỗi
          const handleError = () => {
            audioRef.current.removeEventListener('error', handleError);
          };

          audioRef.current.addEventListener('canplay', handleCanPlay);
          audioRef.current.addEventListener('error', handleError);
          audioRef.current.load();

          // Revoke URL cũ
          if (oldSrc && oldSrc.startsWith('blob:')) {
            URL.revokeObjectURL(oldSrc);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải file audio:", error);
      }
    })();

    // Cleanup function
    return () => {
      if (audioRef.current && !isSameSong) {
        audioRef.current.pause();

        // Tạo audio element mới để tránh vấn đề với event listener
        const newAudio = document.createElement('audio');
        newAudio.preload = "auto";

        if (audioRef.current.parentNode) {
          audioRef.current.parentNode.replaceChild(newAudio, audioRef.current);
        }

        audioRef.current = newAudio;
      }
    };
  }, [songId, isPlaying, onTimeUpdate]);

  // Xử lý khi currentTime thay đổi từ bên ngoài (seek)
  useEffect(() => {
    if (!audioRef.current || isSeekingRef.current) return;

    // Nếu thời gian từ store khác với thời gian hiện tại của audio > 0.5s
    const diff = Math.abs(audioRef.current.currentTime - currentTime);
    if (diff > 0.5) {
      // Đánh dấu đang seek để tránh vòng lặp vô hạn
      isSeekingRef.current = true;

      // Seek đến thời điểm mới
      audioRef.current.currentTime = currentTime;

      // Reset đánh dấu sau 100ms
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 100);
    }
  }, [currentTime]);

  // Xử lý khi volume thay đổi từ bên ngoài
  useEffect(() => {
    if (!audioRef.current) return;

    // Nếu âm lượng từ store khác với âm lượng hiện tại của audio
    if (audioRef.current.volume !== volume) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Xử lý lặp lại một bài
  useEffect(() => {
    if (!audioRef.current) return;

    // Đặt thuộc tính loop cho audio element dựa vào repeatMode
    audioRef.current.loop = repeatMode === 'one';
  }, [repeatMode]);

  return (
    <audio
      ref={audioRef}
      preload="auto"
      style={{ display: 'none' }}
      crossOrigin="anonymous"
      playsInline
    />
  );
};

export default AudioPlayer;
