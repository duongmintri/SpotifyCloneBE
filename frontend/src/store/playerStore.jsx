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

  // Chế độ phát
  isShuffled: false,
  repeatMode: 'none', // 'none', 'all', 'one'

  // Phát/tạm dừng
  togglePlay: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },

  // Cập nhật trạng thái phát
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  // Cập nhật bài hát hiện tại
  setCurrentSong: (song, resetTime = true) => {
    if (!song || !song.id) {
      console.error("Không thể phát bài hát không hợp lệ:", song);
      return;
    }

    const { currentSong, currentTime } = get();
    const isSameSong = currentSong && currentSong.id === song.id;
    const newTime = (isSameSong && !resetTime) ? currentTime : 0;

    set({
      currentSong: song,
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
    set({
      queue: songs,
      currentIndex: startIndex
    });

    if (songs.length > 0 && startIndex < songs.length) {
      get().setCurrentSong(songs[startIndex]);
    }
  },

  // Chuyển đến bài tiếp theo
  playNext: () => {
    const { queue, currentIndex, isShuffled, repeatMode } = get();

    if (queue.length === 0) return;

    let nextIndex;

    if (isShuffled) {
      // Phát ngẫu nhiên
      nextIndex = Math.floor(Math.random() * queue.length);
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

    set({ currentIndex: nextIndex });
    get().setCurrentSong(queue[nextIndex]);
    get().setIsPlaying(true);
  },

  // Chuyển đến bài trước đó
  playPrevious: () => {
    const { queue, currentIndex, currentTime } = get();

    if (queue.length === 0) return;

    // Nếu đã phát hơn 3 giây, quay lại đầu bài hát hiện tại
    if (currentTime > 3) {
      get().seekTo(0);
      return;
    }

    let prevIndex = currentIndex - 1;

    // Xử lý khi ở đầu danh sách
    if (prevIndex < 0) {
      prevIndex = queue.length - 1; // Quay lại bài cuối cùng
    }

    set({ currentIndex: prevIndex });
    get().setCurrentSong(queue[prevIndex]);
    get().setIsPlaying(true);
  },

  // Bật/tắt chế độ phát ngẫu nhiên
  toggleShuffle: () => {
    set({ isShuffled: !get().isShuffled });
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
    const { queue, currentIndex } = get();
    const newQueue = queue.filter(song => song.id !== songId);

    // Điều chỉnh currentIndex nếu cần
    let newIndex = currentIndex;
    if (currentIndex >= newQueue.length) {
      newIndex = Math.max(0, newQueue.length - 1);
    }

    set({
      queue: newQueue,
      currentIndex: newIndex
    });
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
