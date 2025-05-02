import { create } from 'zustand';
import { search, searchSongs, searchAlbums, searchArtists } from '../services/musicApi';

const useSearchStore = create((set, get) => ({
  // Trạng thái tìm kiếm
  searchQuery: '',
  searchResults: {
    songs: [],
    albums: [],
    artists: []
  },
  isSearching: false,
  searchError: null,
  activeTab: 'all', // 'all', 'songs', 'albums', 'artists'

  // Tìm kiếm tổng hợp
  searchAll: async (query) => {
    if (!query) {
      set({
        searchError: 'Vui lòng nhập từ khóa để tìm kiếm',
        searchResults: { songs: [], albums: [], artists: [] }
      });
      return;
    }

    set({ isSearching: true, searchError: null, searchQuery: query });

    try {
      const results = await search(query);

      if (results.error) {
        set({ searchError: results.error, searchResults: { songs: [], albums: [], artists: [] } });
      } else {
        // Kiểm tra và xử lý dữ liệu trả về
        console.log('Kết quả tìm kiếm nhận được:', results);

        // Đảm bảo các mảng kết quả tồn tại
        const processedResults = {
          songs: Array.isArray(results.songs) ? results.songs : [],
          albums: Array.isArray(results.albums) ? results.albums : [],
          artists: Array.isArray(results.artists) ? results.artists : []
        };

        // Kiểm tra xem có kết quả nào không
        const hasResults =
          processedResults.songs.length > 0 ||
          processedResults.albums.length > 0 ||
          processedResults.artists.length > 0;

        if (!hasResults) {
          set({ searchError: `Không tìm thấy kết quả nào cho "${query}"` });
        } else {
          console.log('Kết quả tìm kiếm đã xử lý:', processedResults);
          set({ searchResults: processedResults });
        }
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      set({
        searchError: error.message || 'Lỗi khi tìm kiếm',
        searchResults: { songs: [], albums: [], artists: [] }
      });
    } finally {
      set({ isSearching: false });
    }
  },

  // Tìm kiếm bài hát
  searchSongs: async (query) => {
    if (!query) {
      set({
        searchError: 'Vui lòng nhập từ khóa để tìm kiếm',
        searchResults: { ...get().searchResults, songs: [] }
      });
      return;
    }

    set({ isSearching: true, searchError: null, searchQuery: query });

    try {
      const results = await searchSongs(query);

      if (results.error) {
        set({ searchError: results.error, searchResults: { ...get().searchResults, songs: [] } });
      } else {
        console.log('Kết quả tìm kiếm bài hát:', results);

        // Đảm bảo kết quả là mảng
        const processedSongs = Array.isArray(results) ? results : [];

        set({ searchResults: { ...get().searchResults, songs: processedSongs } });
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm bài hát:', error);
      set({
        searchError: error.message || 'Lỗi khi tìm kiếm bài hát',
        searchResults: { ...get().searchResults, songs: [] }
      });
    } finally {
      set({ isSearching: false });
    }
  },

  // Tìm kiếm album
  searchAlbums: async (query) => {
    if (!query) {
      set({
        searchError: 'Vui lòng nhập từ khóa để tìm kiếm',
        searchResults: { ...get().searchResults, albums: [] }
      });
      return;
    }

    set({ isSearching: true, searchError: null, searchQuery: query });

    try {
      const results = await searchAlbums(query);

      if (results.error) {
        set({ searchError: results.error, searchResults: { ...get().searchResults, albums: [] } });
      } else {
        set({ searchResults: { ...get().searchResults, albums: results } });
      }
    } catch (error) {
      set({
        searchError: error.message || 'Lỗi khi tìm kiếm album',
        searchResults: { ...get().searchResults, albums: [] }
      });
    } finally {
      set({ isSearching: false });
    }
  },

  // Tìm kiếm nghệ sĩ
  searchArtists: async (query) => {
    if (!query) {
      set({
        searchError: 'Vui lòng nhập từ khóa để tìm kiếm',
        searchResults: { ...get().searchResults, artists: [] }
      });
      return;
    }

    set({ isSearching: true, searchError: null, searchQuery: query });

    try {
      const results = await searchArtists(query);

      if (results.error) {
        set({ searchError: results.error, searchResults: { ...get().searchResults, artists: [] } });
      } else {
        set({ searchResults: { ...get().searchResults, artists: results } });
      }
    } catch (error) {
      set({
        searchError: error.message || 'Lỗi khi tìm kiếm nghệ sĩ',
        searchResults: { ...get().searchResults, artists: [] }
      });
    } finally {
      set({ isSearching: false });
    }
  },

  // Đặt tab đang active
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  // Reset trạng thái tìm kiếm
  resetSearch: () => {
    set({
      searchQuery: '',
      searchResults: { songs: [], albums: [], artists: [] },
      isSearching: false,
      searchError: null,
      activeTab: 'all'
    });
  }
}));

export default useSearchStore;
