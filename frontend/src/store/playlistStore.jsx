import { create } from 'zustand';
import { fetchWithAuth } from '../services/api';

const usePlaylistStore = create((set) => ({
  playlists: [],
  loading: false,
  error: null,
  
  // Fetch playlists from API
  fetchPlaylists: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetchWithAuth(`http://localhost:8000/api/playlists/`);
      
      if (!response.ok) {
        throw new Error("Không thể tải danh sách playlist");
      }
      
      const data = await response.json();
      set({ playlists: data, loading: false });
      return data;
    } catch (err) {
      console.error("Error fetching playlists:", err);
      set({ error: "Không thể tải danh sách playlist", loading: false });
      return [];
    }
  },
  
  // Add a new playlist to the store
  addPlaylist: (playlist) => {
    set((state) => ({
      playlists: [...state.playlists, playlist]
    }));
  },
  
  // Update a playlist in the store
  updatePlaylist: (updatedPlaylist) => {
    set((state) => ({
      playlists: state.playlists.map(playlist => 
        playlist.id === updatedPlaylist.id ? updatedPlaylist : playlist
      )
    }));
  },
  
  // Remove a playlist from the store
  removePlaylist: (playlistId) => {
    set((state) => ({
      playlists: state.playlists.filter(playlist => playlist.id !== playlistId)
    }));
  }
}));

export default usePlaylistStore;