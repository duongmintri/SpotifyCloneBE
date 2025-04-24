// API service for music
import { getAccessToken } from './api';

const API_URL = 'http://localhost:8000';

// Lấy danh sách bài hát
export const getSongs = async () => {
  try {
    const token = getAccessToken();
    if (!token) {
      console.error("Token không hợp lệ");
      return [];
    }

    console.log("Đang lấy danh sách bài hát với token:", token);

    const response = await fetch(`${API_URL}/api/songs/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lỗi từ API:", errorText);
      throw new Error('Không thể lấy danh sách bài hát');
    }

    const data = await response.json();
    console.log("Dữ liệu bài hát từ API (raw):", data);
    return data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài hát:', error);
    return [];
  }
};

// Lấy thông tin chi tiết bài hát
export const getSongDetails = async (songId) => {
  try {
    const token = getAccessToken();

    const response = await fetch(`${API_URL}/api/songs/${songId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Không thể lấy thông tin bài hát');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy thông tin bài hát:', error);
    throw error;
  }
};

// Lấy URL stream bài hát
export const getSongStreamUrl = (songId) => {
  if (!songId) {
    console.error("songId không hợp lệ:", songId);
    return null;
  }

  const token = getAccessToken();
  if (!token) {
    console.error("Token không hợp lệ");
    return null;
  }

  // Thêm timestamp để tránh cache
  const timestamp = new Date().getTime();
  // Sử dụng header Authorization thay vì query parameter token
  return `${API_URL}/api/songs/${songId}/stream/?t=${timestamp}`;
};

// Lấy URL download bài hát
export const getSongDownloadUrl = (songId) => {
  if (!songId) {
    console.error("songId không hợp lệ:", songId);
    return null;
  }

  const token = getAccessToken();
  if (!token) {
    console.error("Token không hợp lệ");
    return null;
  }

  // Thêm timestamp để tránh cache
  const timestamp = new Date().getTime();
  // Sử dụng header Authorization thay vì query parameter token
  return `${API_URL}/api/songs/${songId}/download/?t=${timestamp}`;
};

// Lấy danh sách playlist
export const getPlaylists = async () => {
  try {
    const token = getAccessToken();

    const response = await fetch(`${API_URL}/api/playlists/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Không thể lấy danh sách playlist');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy danh sách playlist:', error);
    throw error;
  }
};

// Lấy thông tin chi tiết playlist
export const getPlaylistDetails = async (playlistId) => {
  try {
    const token = getAccessToken();

    const response = await fetch(`${API_URL}/api/playlists/${playlistId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Không thể lấy thông tin playlist');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy thông tin playlist:', error);
    throw error;
  }
};

// Tạo playlist mới
export const createPlaylist = async (playlistData) => {
  try {
    const token = getAccessToken();

    const response = await fetch(`${API_URL}/api/playlists/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playlistData),
    });

    if (!response.ok) {
      throw new Error('Không thể tạo playlist');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tạo playlist:', error);
    throw error;
  }
};

// Thêm bài hát vào playlist
export const addSongToPlaylist = async (playlistId, songId) => {
  try {
    const token = getAccessToken();

    const response = await fetch(`${API_URL}/api/playlists/${playlistId}/add-song/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ song_id: songId }),
    });

    if (!response.ok) {
      throw new Error('Không thể thêm bài hát vào playlist');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi thêm bài hát vào playlist:', error);
    throw error;
  }
};

// Xóa bài hát khỏi playlist
export const removeSongFromPlaylist = async (playlistId, songId) => {
  try {
    const token = getAccessToken();

    const response = await fetch(`${API_URL}/api/playlists/${playlistId}/remove-song/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ song_id: songId }),
    });

    if (!response.ok) {
      throw new Error('Không thể xóa bài hát khỏi playlist');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi xóa bài hát khỏi playlist:', error);
    throw error;
  }
};
