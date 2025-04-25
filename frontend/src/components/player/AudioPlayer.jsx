import React, { useEffect, useRef } from 'react';
import { getAccessToken } from '../../services/api';

/**
 * AudioPlayer Component
 *
 * Xử lý việc phát nhạc từ API với xác thực token
 *
 * @param {number|string} songId - ID của bài hát cần phát
 * @param {boolean} isPlaying - Trạng thái phát/dừng
 * @param {number} currentTime - Thời gian hiện tại (từ store)
 * @param {number} volume - Âm lượng (từ store)
 * @param {function} onEnded - Callback khi bài hát kết thúc
 * @param {function} onTimeUpdate - Callback khi thời gian phát thay đổi
 * @param {function} onLoadedMetadata - Callback khi metadata được tải
 */
const AudioPlayer = ({ songId, isPlaying, currentTime, volume, onEnded, onTimeUpdate, onLoadedMetadata }) => {
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
      // Khi bấm play, tiếp tục phát từ vị trí hiện tại
      const playPromise = audio.play();

      // Xử lý lỗi nếu có
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Lỗi khi phát nhạc:", error);
          // Nếu có lỗi khi phát, cập nhật lại trạng thái
          if (onTimeUpdate) {
            onTimeUpdate(audio.currentTime);
          }
        });
      }
    } else {
      // Khi bấm pause, dừng lại nhưng không reset thời gian
      audio.pause();

      // Đảm bảo thời gian hiện tại được cập nhật chính xác
      if (onTimeUpdate) {
        onTimeUpdate(audio.currentTime);
      }
    }
  }, [isPlaying, onTimeUpdate]);

  // Lưu trữ songId trước đó để so sánh
  const prevSongIdRef = useRef(null);

  // 3. Xử lý khi songId thay đổi - tải file audio mới
  useEffect(() => {
    if (!songId) return;

    // Kiểm tra xem có phải là cùng một bài hát không
    const isSameSong = prevSongIdRef.current === songId;
    prevSongIdRef.current = songId;

    console.log(`AudioPlayer - songId changed: ${songId}, isSameSong: ${isSameSong}, isPlaying: ${isPlaying}`);

    // Nếu là cùng một bài hát và đang pause/play lại, không cần tải lại
    // Kiểm tra xem src có hợp lệ không (không phải empty string và không phải about:blank)
    const hasValidSource = audioRef.current &&
                          audioRef.current.src &&
                          audioRef.current.src !== '' &&
                          audioRef.current.src !== 'about:blank' &&
                          !audioRef.current.error;

    if (isSameSong && hasValidSource) {
      console.log(`AudioPlayer - Same song, no need to reload. Current time: ${audioRef.current.currentTime}, Source: ${audioRef.current.src}`);

      // Cập nhật thời gian hiện tại
      if (onTimeUpdate) {
        onTimeUpdate(audioRef.current.currentTime);
      }

      // Nếu đang yêu cầu phát, phát từ vị trí hiện tại
      if (isPlaying) {
        try {
          // Kiểm tra lại một lần nữa trước khi phát
          if (audioRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or better
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error("AudioPlayer - Error playing same song:", error);
                // Nếu có lỗi, tải lại file
                console.log("AudioPlayer - Reloading due to play error");
                // Không return ở đây để tiếp tục tải file mới
              });
            }
            return; // Chỉ return nếu đã phát thành công
          } else {
            console.log("AudioPlayer - Audio not ready, need to reload");
            // Không return ở đây để tiếp tục tải file mới
          }
        } catch (error) {
          console.error("AudioPlayer - Exception when trying to play:", error);
          // Không return ở đây để tiếp tục tải file mới
        }
      } else {
        return; // Nếu không phát, có thể return an toàn
      }
    }

    // Nếu code chạy đến đây, nghĩa là cần tải lại file audio

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
          // Lưu lại thời gian hiện tại nếu là cùng một bài hát
          const currentTime = isSameSong ? audioRef.current.currentTime : 0;
          console.log(`AudioPlayer - Setting up audio. isSameSong: ${isSameSong}, currentTime: ${currentTime}`);

          // Lưu URL cũ để revoke sau khi tải xong
          const oldSrc = audioRef.current.src;

          // Đặt src mới và tải
          audioRef.current.src = objectURL;

          // Thêm event listener để xử lý khi audio đã sẵn sàng
          const handleCanPlay = () => {
            console.log("AudioPlayer - Audio can play now");

            // Khôi phục thời gian nếu là cùng một bài hát
            if (isSameSong && currentTime > 0) {
              console.log(`AudioPlayer - Restoring time to ${currentTime}`);
              audioRef.current.currentTime = currentTime;

              // Cập nhật thời gian trong store
              if (onTimeUpdate) {
                onTimeUpdate(currentTime);
              }
            } else {
              // Reset thời gian về 0 cho bài hát mới
              if (onTimeUpdate) {
                onTimeUpdate(0);
              }
            }

            // Phát nếu đang yêu cầu phát
            if (isPlaying) {
              try {
                console.log(`AudioPlayer - Auto playing after canplay event`);
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                  playPromise.catch(error => {
                    console.error("AudioPlayer - Error playing after canplay:", error);
                  });
                }
              } catch (error) {
                console.error("AudioPlayer - Exception when playing after canplay:", error);
              }
            }

            // Cleanup event listener
            audioRef.current.removeEventListener('canplay', handleCanPlay);
          };

          // Thêm event listener để xử lý khi có lỗi
          const handleError = (e) => {
            console.error("AudioPlayer - Error loading audio:", e);
            console.error("AudioPlayer - Error code:", audioRef.current.error ? audioRef.current.error.code : "Unknown");
            console.error("AudioPlayer - Error message:", audioRef.current.error ? audioRef.current.error.message : "Unknown");

            // Cleanup event listener
            audioRef.current.removeEventListener('error', handleError);
          };

          // Đăng ký các event listener
          audioRef.current.addEventListener('canplay', handleCanPlay);
          audioRef.current.addEventListener('error', handleError);

          // Bắt đầu tải audio
          audioRef.current.load();

          // Revoke URL cũ nếu là blob URL
          if (oldSrc && oldSrc.startsWith('blob:')) {
            URL.revokeObjectURL(oldSrc);
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
        // Xóa tất cả các event listener có thể đã được thêm vào
        const cloneAudio = audioRef.current;

        // Xóa tất cả các event listener có thể đã được thêm vào
        // Sử dụng một phiên bản mới của audio element để tránh vấn đề với event listener
        const newAudio = document.createElement('audio');
        newAudio.preload = "auto";

        // Chỉ dừng và reset src nếu không phải là cùng một bài hát
        if (!isSameSong) {
          cloneAudio.pause();

          // Thay thế audio element cũ bằng một cái mới
          if (cloneAudio.parentNode) {
            cloneAudio.parentNode.replaceChild(newAudio, cloneAudio);
          }

          // Cập nhật ref
          audioRef.current = newAudio;
        }
      }
    };
  }, [songId, isPlaying]);

  // 4. Xử lý khi currentTime thay đổi từ bên ngoài (seek)
  const isSeekingRef = useRef(false);

  useEffect(() => {
    if (!audioRef.current || isSeekingRef.current) return;

    // Nếu thời gian từ store khác với thời gian hiện tại của audio > 0.5s
    // thì đây là một hành động seek từ bên ngoài
    const diff = Math.abs(audioRef.current.currentTime - currentTime);
    if (diff > 0.5) {
      console.log(`AudioPlayer - External seek: ${audioRef.current.currentTime} -> ${currentTime}`);

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

  // 5. Xử lý khi volume thay đổi từ bên ngoài
  useEffect(() => {
    if (!audioRef.current) return;

    // Nếu âm lượng từ store khác với âm lượng hiện tại của audio
    if (audioRef.current.volume !== volume) {
      console.log(`AudioPlayer - Volume changed: ${audioRef.current.volume} -> ${volume}`);

      // Đặt âm lượng mới
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
