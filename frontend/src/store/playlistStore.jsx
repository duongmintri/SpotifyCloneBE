import { create } from 'zustand';
import { fetchWithAuth } from '../services/api';

const API_URL = 'http://localhost:8000';

const usePlaylistStore = create((set, get) => ({
  playlists: [],
  loading: false,
  error: null,
  
  // Fetch playlists from API
  fetchPlaylists: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetchWithAuth(`${API_URL}/api/playlists/`);
      
      if (!response.ok) {
        throw new Error("Không thể tải danh sách playlist");
      }
      
      const data = await response.json();
      console.log("Fetched playlists:", data);
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
    console.log("Adding playlist to store:", playlist);
    set((state) => {
      const newPlaylists = [...state.playlists, playlist];
      console.log("Updated playlists:", newPlaylists);
      return { playlists: newPlaylists };
    });
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
    console.log("Removing playlist with ID:", playlistId, "Type:", typeof playlistId);
    set((state) => {
      const filteredPlaylists = state.playlists.filter(playlist => {
        console.log("Comparing:", playlist.id, typeof playlist.id, "with", playlistId, typeof playlistId);
        return playlist.id !== playlistId;
      });
      console.log("Filtered playlists:", filteredPlaylists);
      return { playlists: filteredPlaylists };
    });
  },
  
  // Create a new playlist and add it to the store
  createPlaylist: async (playlistData) => {
    try {
      set({ loading: true, error: null });
      
      // Kiểm tra xem playlistData có phải là FormData không
      const isFormData = playlistData instanceof FormData;
      
      const headers = {};
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetchWithAuth(`${API_URL}/api/playlists/`, {
        method: 'POST',
        headers,
        body: isFormData ? playlistData : JSON.stringify(playlistData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Không thể tạo playlist');
      }
      
      const newPlaylist = await response.json();
      console.log("Created new playlist:", newPlaylist);
      
      // Add to store
      get().addPlaylist(newPlaylist);
      
      set({ loading: false });
      return newPlaylist;
    } catch (err) {
      console.error("Error creating playlist:", err);
      set({ error: "Không thể tạo playlist", loading: false });
      throw err;
    }
  }
}));

export default usePlaylistStore;
