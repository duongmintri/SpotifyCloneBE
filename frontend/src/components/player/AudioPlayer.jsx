import React, { useEffect, useRef } from 'react';
import { fetchWithAuth } from '../../services/api';
import { getSongStreamUrl } from "../../services/musicApi";

// Thêm import API_URL
const API_URL = 'http://localhost:8000';

/**
 * AudioPlayer Component
 *
 * Xử lý việc phát nhạc từ API với xác thực token
 *
 * @param {number|string} songId - ID của bài hát cần phát
 * @param {string} audioUrl - URL của file audio (nếu đã có)
 * @param {boolean} isPlaying - Trạng thái phát/dừng
 * @param {number} currentTime - Thời gian hiện tại (từ store)
 * @param {number} volume - Âm lượng (từ store)
 * @param {string} repeatMode - Chế độ lặp lại ('none', 'all', 'one')
 * @param {function} onEnded - Callback khi bài hát kết thúc
 * @param {function} onTimeUpdate - Callback khi thời gian phát thay đổi
 * @param {function} onLoadedMetadata - Callback khi metadata được tải
 */
const AudioPlayer = ({ songId, audioUrl, isPlaying, currentTime, volume, repeatMode, onEnded, onTimeUpdate, onLoadedMetadata }) => {
  const audioRef = useRef(null);
  const isSeekingRef = useRef(false);
  const prevSongIdRef = useRef(null);

  // Expose audio element to window for debugging
  useEffect(() => {
    if (audioRef.current) {
      window._audioElement = audioRef.current;
      console.log("Audio element exposed as window._audioElement for debugging");
    }
    
    return () => {
      delete window._audioElement;
    };
  }, []);

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

    console.log("Trạng thái isPlaying thay đổi:", isPlaying);

    if (isPlaying) {
      try {
        console.log("Đang cố gắng phát nhạc...");
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
        console.log("Đang cố gắng dừng nhạc...");
        audio.pause();
        console.log("Đã dừng nhạc, trạng thái hiện tại:", audio.paused);
        if (onTimeUpdate) {
          onTimeUpdate(audio.currentTime);
        }
      } catch (error) {
        console.error("Lỗi khi dừng nhạc:", error);
      }
    }
  }, [isPlaying, onTimeUpdate]);

  // Xử lý khi songId thay đổi
  useEffect(() => {
    if (!songId) return;
    
    // Kiểm tra xem songId có thay đổi không
    if (prevSongIdRef.current !== songId) {
      console.log("Song ID thay đổi từ", prevSongIdRef.current, "thành", songId);
      prevSongIdRef.current = songId;
      
      // Tạo hàm lấy URL audio
      const fetchAudioUrl = async () => {
        try {
          console.log(`Đang lấy URL stream cho bài hát ID: ${songId}`);
          const url = await getSongStreamUrl(songId);
          
          if (!url) {
            console.error('Không thể lấy URL stream');
            return;
          }
          
          console.log("Nhận được URL audio:", url);
          
          // Cập nhật src cho audio element
          if (audioRef.current) {
            // Lưu vị trí hiện tại nếu là cùng bài hát
            const isSameSong = audioRef.current.src === url;
            const currentPosition = isSameSong ? audioRef.current.currentTime : 0;
            
            audioRef.current.src = url;
            audioRef.current.load();
            
            // Nếu là cùng bài hát, giữ nguyên vị trí
            if (isSameSong) {
              audioRef.current.currentTime = currentPosition;
            }
            
            // Nếu đang yêu cầu phát, phát khi đã tải xong
            if (isPlaying) {
              audioRef.current.oncanplay = () => {
                audioRef.current.play().catch(err => {
                  console.error('Không thể phát audio:', err);
                });
              };
            }
          }
        } catch (error) {
          console.error("Lỗi khi tải URL audio:", error);
        }
      };
      
      // Gọi hàm lấy URL audio
      fetchAudioUrl();
    }
  }, [songId, isPlaying]);

  // Xử lý khi currentTime thay đổi từ bên ngoài (seek)
  useEffect(() => {
    if (!audioRef.current || isSeekingRef.current) return;

    // Nếu thời gian từ store khác với thời gian hiện tại của audio > 0.5s
    const diff = Math.abs(audioRef.current.currentTime - currentTime);
    if (diff > 0.5) {
      console.log("Seek từ", audioRef.current.currentTime, "đến", currentTime);
      
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

  // Thêm sự kiện lắng nghe trạng thái audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handlePlay = () => {
      console.log("Audio đang phát");
      if (!isPlaying) {
        // Nếu trạng thái store không đồng bộ với audio
        console.log("Đồng bộ trạng thái phát với audio");
        onTimeUpdate?.(audio.currentTime);
      }
    };
    
    const handlePause = () => {
      console.log("Audio đã dừng");
      if (isPlaying) {
        // Nếu trạng thái store không đồng bộ với audio
        console.log("Đồng bộ trạng thái dừng với audio");
        onTimeUpdate?.(audio.currentTime);
      }
    };
    
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [isPlaying, onTimeUpdate]);

  // Thêm kiểm tra định kỳ trạng thái audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Kiểm tra mỗi 1 giây
    const intervalId = setInterval(() => {
      // Nếu trạng thái audio và store không khớp nhau
      if (audio.paused === isPlaying) {
        console.log("Phát hiện trạng thái không đồng bộ:");
        console.log("- Audio paused:", audio.paused);
        console.log("- Store isPlaying:", isPlaying);
        
        // Đồng bộ audio với store
        if (isPlaying && audio.paused) {
          console.log("Phát lại audio để đồng bộ");
          audio.play().catch(err => {
            console.error("Lỗi khi đồng bộ phát:", err);
          });
        } else if (!isPlaying && !audio.paused) {
          console.log("Dừng audio để đồng bộ");
          audio.pause();
        }
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isPlaying]);

  return (
    <audio
      ref={audioRef}
      preload="auto"
      style={{ display: 'none' }}
      crossOrigin="anonymous"
      playsInline
      onPlay={() => {
        console.log("Audio element đang phát, currentTime:", audioRef.current?.currentTime);
      }}
      onPause={() => {
        console.log("Audio element đã dừng, currentTime:", audioRef.current?.currentTime);
      }}
    />
  );
};

export default AudioPlayer;
