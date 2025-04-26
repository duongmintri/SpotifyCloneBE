// API service for music
import { fetchWithAuth } from './api';

const API_URL = 'http://localhost:8000';

// Lấy danh sách bài hát
export const getSongs = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/songs/`);

    if (!response.ok) {
      throw new Error('Không thể lấy danh sách bài hát');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài hát:', error);
    return [];
  }
};

// Lấy thông tin chi tiết bài hát
export const getSongDetails = async (songId) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/songs/${songId}/`);

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

  // Thêm timestamp để tránh cache
  const timestamp = new Date().getTime();
  return `${API_URL}/api/songs/${songId}/stream/?t=${timestamp}`;
};

// Lấy URL download bài hát
export const getSongDownloadUrl = (songId) => {
  if (!songId) {
    console.error("songId không hợp lệ:", songId);
    return null;
  }

  return `${API_URL}/api/songs/${songId}/download/`;
};

// Tìm kiếm bài hát
export const searchSongs = async (query) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/songs/search/?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error('Không thể tìm kiếm bài hát');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tìm kiếm bài hát:', error);
    return [];
  }
};

// Tạo playlist mới
export const createPlaylist = async (playlistData) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/playlists/`, {
      method: 'POST',
      headers: {
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
    const response = await fetchWithAuth(`${API_URL}/api/playlists/${playlistId}/add-song/`, {
      method: 'POST',
      headers: {
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
    const response = await fetchWithAuth(`${API_URL}/api/playlists/${playlistId}/remove-song/`, {
      method: 'POST',
      headers: {
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

// Lấy danh sách album
export const getAlbums = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/albums/`);

    if (!response.ok) {
      throw new Error('Không thể lấy danh sách album');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy danh sách album:', error);
    return [];
  }
};

// Lấy thông tin chi tiết album
export const getAlbumDetails = async (albumId) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/albums/${albumId}/`);

    if (!response.ok) {
      throw new Error('Không thể lấy thông tin album');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy thông tin album:', error);
    throw error;
  }
};

// Tạo album mới
export const createAlbum = async (albumData) => {
  try {
    console.log('Gọi createAlbum với data:', albumData);

    const response = await fetchWithAuth(`${API_URL}/api/albums/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(albumData),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Không thể tạo album');
    }

    const result = await response.json();
    console.log('Create album result:', result);
    return result;
  } catch (error) {
    console.error('Lỗi khi tạo album:', error);
    throw error;
  }
};

// Thêm bài hát vào album
export const addSongToAlbum = async (albumId, songId) => {
  try {
    console.log('Gọi addSongToAlbum với albumId:', albumId, 'songId:', songId);

    const response = await fetchWithAuth(`${API_URL}/api/albums/${albumId}/add-song/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ song_id: songId }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Không thể thêm bài hát vào album');
    }

    const result = await response.json();
    console.log('Add song to album result:', result);
    return result;
  } catch (error) {
    console.error('Lỗi khi thêm bài hát vào album:', error);
    throw error;
  }
};

// Xóa bài hát khỏi album
export const removeSongFromAlbum = async (albumId, songId) => {
  try {
    console.log('Gọi removeSongFromAlbum với albumId:', albumId, 'songId:', songId);

    const response = await fetchWithAuth(`${API_URL}/api/albums/${albumId}/remove-song/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ song_id: songId }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Không thể xóa bài hát khỏi album');
    }

    const result = await response.json();
    console.log('Remove song from album result:', result);
    return result;
  } catch (error) {
    console.error('Lỗi khi xóa bài hát khỏi album:', error);
    throw error;
  }
};

// Xóa album
export const deleteAlbum = async (albumId) => {
  try {
    console.log('Gọi deleteAlbum với albumId:', albumId);

    const response = await fetchWithAuth(`${API_URL}/api/albums/${albumId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Không thể xóa album');
    }

    return true; // Trả về true nếu xóa thành công
  } catch (error) {
    console.error('Lỗi khi xóa album:', error);
    throw error;
  }
};

// Cập nhật album
export const updateAlbum = async (albumId, albumData) => {
  try {
    console.log('Gọi updateAlbum với albumId:', albumId, 'data:', albumData);

    const response = await fetchWithAuth(`${API_URL}/api/albums/${albumId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(albumData),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Không thể cập nhật album');
    }

    const result = await response.json();
    console.log('Update album result:', result);
    return result;
  } catch (error) {
    console.error('Lỗi khi cập nhật album:', error);
    throw error;
  }
};

// Xóa album
export const deleteAlbum = async (albumId) => {
  try {
    console.log('Gọi deleteAlbum với albumId:', albumId);

    const response = await fetchWithAuth(`${API_URL}/api/albums/${albumId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Không thể xóa album');
    }

    return true; // Trả về true nếu xóa thành công
  } catch (error) {
    console.error('Lỗi khi xóa album:', error);
    throw error;
  }
};

// Lấy danh sách bài hát yêu thích
export const getFavoriteSongs = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/favorites/`);

    if (!response.ok) {
      throw new Error('Không thể lấy danh sách bài hát yêu thích');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài hát yêu thích:', error);
    return [];
  }
};

// Thêm/xóa bài hát khỏi danh sách yêu thích
export const toggleFavoriteSong = async (songId) => {
  try {
    console.log('Gọi toggleFavoriteSong với songId:', songId);

    const response = await fetchWithAuth(`${API_URL}/api/favorites/toggle/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ song_id: songId }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Không thể thêm/xóa bài hát khỏi danh sách yêu thích');
    }

    const result = await response.json();
    console.log('Toggle favorite result:', result);
    return result;
  } catch (error) {
    console.error('Lỗi khi thêm/xóa bài hát khỏi danh sách yêu thích:', error);
    throw error;
  }
};

// Kiểm tra xem bài hát có trong danh sách yêu thích không
export const checkFavoriteSong = async (songId) => {
  try {
    console.log('Gọi checkFavoriteSong với songId:', songId, 'type:', typeof songId);

    // Đảm bảo songId là số nguyên
    const id = Number(songId);
    if (isNaN(id)) {
      console.error('songId không phải là số hợp lệ:', songId);
      return { is_favorite: false };
    }

    const url = `${API_URL}/api/favorites/check/${id}/`;
    console.log('URL kiểm tra yêu thích:', url);

    const response = await fetchWithAuth(url);
    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Không thể kiểm tra trạng thái yêu thích');
    }

    const result = await response.json();
    console.log('Check favorite result:', result);
    return result;
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái yêu thích:', error);
    return { is_favorite: false };
  }
};
