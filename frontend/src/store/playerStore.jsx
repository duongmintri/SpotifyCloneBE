import { create } from 'zustand';

const usePlayerStore = create((set, get) => ({
  // Trạng thái phát nhạc
  isPlaying: false,
  currentSong: null,
  currentTime: 0,
  duration: 0,
  volume: 0.7,

  // Danh sách phát
  queue: [],
  currentIndex: 0,

  // Lịch sử phát ngẫu nhiên
  shuffleHistory: [],

  // Chế độ phát
  isShuffled: false,
  repeatMode: 'none', // 'none', 'all', 'one'

  // Phát/tạm dừng
  togglePlay: () => {
    const { isPlaying } = get();
    const newState = !isPlaying;

    // Cập nhật trạng thái
    set({ isPlaying: newState });

    // Xử lý trực tiếp audio element nếu có
    if (window._audioElement) {
      if (newState) {
        // Phát từ vị trí hiện tại
        console.log("Phát từ vị trí:", window._audioElement.currentTime);
        window._audioElement.play().catch(err => {
          console.error("Lỗi khi phát audio từ store:", err);
        });
      } else {
        window._audioElement.pause();
      }
    }
  },

  // Cập nhật trạng thái phát
  setIsPlaying: (isPlaying) => {
    set({ isPlaying });

    // Xử lý trực tiếp audio element nếu có
    if (window._audioElement) {
      if (isPlaying) {
        window._audioElement.play().catch(err => {
          console.error("Lỗi khi phát audio từ store:", err);
        });
      } else {
        window._audioElement.pause();
      }
    }
  },

  // Cập nhật bài hát hiện tại
  setCurrentSong: (song, resetTime = true) => {
    if (!song || !song.id) {
      console.error("Không thể phát bài hát không hợp lệ:", song);
      return;
    }

    const { currentSong, currentTime } = get();
    const isSameSong = currentSong && currentSong.id === song.id;
    const newTime = (isSameSong && !resetTime) ? currentTime : 0;

    // Xử lý thông tin nghệ sĩ trước khi lưu vào store
    let processedSong = { ...song };

    // Xử lý artist có thể là đối tượng
    if (processedSong.artist) {
      if (typeof processedSong.artist === 'string') {
        // Giữ nguyên nếu đã là chuỗi
      } else if (typeof processedSong.artist === 'object' && processedSong.artist !== null) {
        // Nếu artist là một đối tượng, chuyển đổi thành đối tượng có cấu trúc đầy đủ
        // để đảm bảo hiển thị đúng ở mọi nơi
        if (!processedSong.artist.name && processedSong.artist.id) {
          processedSong.artist.name = `Artist ID: ${processedSong.artist.id}`;
        }
      }
    }

    set({
      currentSong: processedSong,
      isPlaying: false,
      currentTime: newTime
    });
  },

  // Cập nhật thời gian hiện tại
  setCurrentTime: (time) => set({ currentTime: time }),

  // Cập nhật thời lượng
  setDuration: (duration) => set({ duration }),

  // Cập nhật âm lượng
  setVolume: (volume) => set({ volume }),

  // Tìm kiếm đến thời điểm cụ thể
  seekTo: (time) => set({ currentTime: time }),

  // Cập nhật danh sách phát
  setQueue: (songs, startIndex = 0) => {
    const { isShuffled } = get();

    // Khởi tạo lịch sử phát ngẫu nhiên với bài hát đầu tiên nếu đang ở chế độ shuffle
    const initialHistory = (songs.length > 0 && startIndex < songs.length && isShuffled)
      ? [songs[startIndex].id]
      : [];

    set({
      queue: songs,
      currentIndex: startIndex,
      // Reset lịch sử phát ngẫu nhiên khi thay đổi danh sách phát
      shuffleHistory: initialHistory
    });

    if (songs.length > 0 && startIndex < songs.length) {
      get().setCurrentSong(songs[startIndex]);

      if (isShuffled) {
        console.log("Đã khởi tạo lịch sử phát ngẫu nhiên cho danh sách phát mới:", initialHistory);
      }
    }
  },

  // Chuyển đến bài tiếp theo
  playNext: () => {
    const { queue, currentIndex, isShuffled, repeatMode, shuffleHistory, currentSong } = get();

    if (queue.length === 0) return;

    let nextIndex;
    let nextSongId;

    if (isShuffled) {
      // Phát ngẫu nhiên không lặp lại
      if (shuffleHistory.length >= queue.length) {
        // Nếu đã phát hết tất cả các bài hát trong danh sách
        if (repeatMode === 'all') {
          // Nếu chế độ lặp lại tất cả, reset lịch sử và bắt đầu lại
          console.log("Đã phát hết tất cả bài hát, bắt đầu lại với chế độ lặp lại tất cả");
          set({ shuffleHistory: currentSong ? [currentSong.id] : [] });
        } else {
          // Nếu không lặp lại, dừng phát
          console.log("Đã phát hết tất cả bài hát và không lặp lại");
          return;
        }
      }

      // Tìm bài hát chưa phát
      const unplayedSongs = queue.filter(song => !shuffleHistory.includes(song.id));

      if (unplayedSongs.length > 0) {
        // Chọn ngẫu nhiên từ các bài hát chưa phát
        const randomUnplayedIndex = Math.floor(Math.random() * unplayedSongs.length);
        nextSongId = unplayedSongs[randomUnplayedIndex].id;
        nextIndex = queue.findIndex(song => song.id === nextSongId);

        console.log(`Chọn bài hát ngẫu nhiên chưa phát: ${nextSongId} (index: ${nextIndex})`);
      } else {
        // Không còn bài hát chưa phát (trường hợp này không nên xảy ra do kiểm tra ở trên)
        console.log("Không còn bài hát chưa phát, chọn ngẫu nhiên từ tất cả");
        nextIndex = Math.floor(Math.random() * queue.length);
      }
    } else {
      // Phát tuần tự
      nextIndex = currentIndex + 1;

      // Xử lý khi đến cuối danh sách
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0; // Lặp lại từ đầu
        } else {
          return; // Dừng nếu không lặp lại
        }
      }
    }

    // Cập nhật lịch sử phát ngẫu nhiên nếu đang ở chế độ shuffle
    if (isShuffled && queue[nextIndex]) {
      const newHistory = [...shuffleHistory, queue[nextIndex].id];
      console.log("Cập nhật lịch sử phát ngẫu nhiên:", newHistory);
      set({
        currentIndex: nextIndex,
        shuffleHistory: newHistory
      });
    } else {
      set({ currentIndex: nextIndex });
    }

    get().setCurrentSong(queue[nextIndex]);
    get().setIsPlaying(true);
  },

  // Chuyển đến bài trước đó
  playPrevious: () => {
    const { queue, currentIndex, currentTime, isShuffled, shuffleHistory, currentSong } = get();

    if (queue.length === 0) return;

    // Nếu đã phát hơn 3 giây, quay lại đầu bài hát hiện tại
    if (currentTime > 3) {
      get().seekTo(0);
      return;
    }

    let prevIndex;

    if (isShuffled && shuffleHistory.length > 1) {
      // Trong chế độ phát ngẫu nhiên, quay lại bài hát trước đó trong lịch sử

      // Xóa bài hát hiện tại khỏi lịch sử (phần tử cuối cùng)
      const newHistory = [...shuffleHistory];
      newHistory.pop();

      // Lấy bài hát trước đó từ lịch sử (phần tử cuối cùng mới)
      const prevSongId = newHistory[newHistory.length - 1];
      prevIndex = queue.findIndex(song => song.id === prevSongId);

      // Nếu không tìm thấy bài hát trong queue (trường hợp hiếm gặp), quay lại bài đầu tiên
      if (prevIndex === -1) {
        prevIndex = 0;
        console.log("Không tìm thấy bài hát trước đó trong queue, quay lại bài đầu tiên");
      } else {
        console.log(`Quay lại bài hát trước đó trong lịch sử: ${prevSongId} (index: ${prevIndex})`);
      }

      // Cập nhật lịch sử phát ngẫu nhiên
      set({ shuffleHistory: newHistory });
    } else {
      // Phát tuần tự hoặc không có lịch sử
      prevIndex = currentIndex - 1;

      // Xử lý khi ở đầu danh sách
      if (prevIndex < 0) {
        prevIndex = queue.length - 1; // Quay lại bài cuối cùng
      }
    }

    set({ currentIndex: prevIndex });
    get().setCurrentSong(queue[prevIndex]);
    get().setIsPlaying(true);
  },

  // Bật/tắt chế độ phát ngẫu nhiên
  toggleShuffle: () => {
    const { isShuffled, currentSong } = get();
    const newShuffleState = !isShuffled;

    // Khởi tạo lại lịch sử phát ngẫu nhiên khi bật chế độ shuffle
    // Nếu có bài hát đang phát, thêm vào lịch sử để không lặp lại ngay
    const initialHistory = currentSong ? [currentSong.id] : [];

    set({
      isShuffled: newShuffleState,
      // Reset lịch sử phát ngẫu nhiên khi bật/tắt
      shuffleHistory: newShuffleState ? initialHistory : []
    });

    console.log("Chế độ phát ngẫu nhiên:", newShuffleState ? "Bật" : "Tắt");
    if (newShuffleState) {
      console.log("Đã khởi tạo lịch sử phát ngẫu nhiên:", initialHistory);
    }
  },

  // Thay đổi chế độ lặp lại
  toggleRepeat: () => {
    const { repeatMode } = get();
    let newMode;

    switch (repeatMode) {
      case 'none': newMode = 'all'; break;
      case 'all': newMode = 'one'; break;
      case 'one': newMode = 'none'; break;
      default: newMode = 'none';
    }

    set({ repeatMode: newMode });
  },

  // Thêm bài hát vào danh sách phát
  addToQueue: (song) => {
    const { queue } = get();
    set({ queue: [...queue, song] });
  },

  // Xóa bài hát khỏi danh sách phát
  removeFromQueue: (songId) => {
    const { queue, currentIndex, currentSong } = get();

    // Tìm vị trí của bài hát cần xóa
    const indexToRemove = queue.findIndex(song => song.id === songId);

    // Nếu không tìm thấy, không làm gì cả
    if (indexToRemove === -1) return;

    // Tạo queue mới không có bài hát cần xóa
    const newQueue = queue.filter((_, index) => index !== indexToRemove);

    // Xác định currentIndex mới
    let newIndex = currentIndex;

    // Nếu xóa bài hát trước currentIndex, giảm currentIndex
    if (indexToRemove < currentIndex) {
      newIndex--;
    }

    // Nếu xóa bài hát đang phát
    if (currentSong && currentSong.id === songId) {
      // Nếu còn bài hát trong queue
      if (newQueue.length > 0) {
        // Nếu xóa bài cuối cùng, chuyển về bài đầu tiên
        if (newIndex >= newQueue.length) {
          newIndex = 0;
        }

        // Cập nhật bài hát hiện tại
        const nextSong = newQueue[newIndex];
        set({
          queue: newQueue,
          currentIndex: newIndex,
          currentSong: nextSong
        });
      } else {
        // Nếu không còn bài hát nào, reset player
        set({
          queue: [],
          currentIndex: 0,
          currentSong: null,
          isPlaying: false
        });
      }
    } else {
      // Nếu không phải bài hát đang phát, chỉ cập nhật queue và currentIndex
      set({
        queue: newQueue,
        currentIndex: newIndex
      });
    }
  },

  // Sắp xếp lại danh sách phát
  reorderQueue: (oldIndex, newIndex) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    const [removed] = newQueue.splice(oldIndex, 1);
    newQueue.splice(newIndex, 0, removed);

    // Điều chỉnh currentIndex nếu cần
    let newCurrentIndex = currentIndex;
    if (currentIndex === oldIndex) {
      newCurrentIndex = newIndex;
    } else if (currentIndex > oldIndex && currentIndex <= newIndex) {
      newCurrentIndex--;
    } else if (currentIndex < oldIndex && currentIndex >= newIndex) {
      newCurrentIndex++;
    }

    set({
      queue: newQueue,
      currentIndex: newCurrentIndex
    });
  }
}));

export default usePlayerStore;
