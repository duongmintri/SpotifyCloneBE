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
export const getSongStreamUrl = async (songId) => {
  if (!songId) {
    console.error("songId không hợp lệ:", songId);
    return null;
  }

  try {
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    console.log(`Đang gọi API để lấy URL stream cho bài hát ID: ${songId}`);
    const response = await fetchWithAuth(`${API_URL}/api/songs/${songId}/stream/?t=${timestamp}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log("Không tìm thấy file audio");
        return null;
      }
      throw new Error('Không thể lấy URL stream của bài hát');
    }

    const data = await response.json();
    console.log("Nhận được URL audio từ API:", data.url);
    return data.url;
  } catch (error) {
    console.error('Lỗi khi lấy URL stream của bài hát:', error);
    return null;
  }
};

// Lấy URL download bài hát
export const getSongDownloadUrl = (songId) => {
  if (!songId) {
    console.error("songId không hợp lệ:", songId);
    return null;
  }

  // Thêm timestamp để tránh cache
  const timestamp = new Date().getTime();
  return `${API_URL}/api/songs/${songId}/download/?t=${timestamp}`;
};

// Lấy URL video của bài hát
export const getSongVideoUrl = async (songId) => {
  if (!songId) {
    console.error("songId không hợp lệ:", songId);
    return null;
  }

  try {
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    const response = await fetchWithAuth(`${API_URL}/api/songs/${songId}/video/?t=${timestamp}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log("Bài hát không có video");
        return null;
      }
      throw new Error('Không thể lấy video của bài hát');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Lỗi khi lấy video của bài hát:', error);
    return null;
  }
};

// Lấy danh sách playlist của người dùng
export const getPlaylists = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/playlists/`);

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
    const response = await fetchWithAuth(`${API_URL}/api/playlists/${playlistId}/`);

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
    console.log('Gọi createPlaylist với data:', playlistData);

    const response = await fetchWithAuth(`${API_URL}/api/playlists/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playlistData),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Không thể tạo playlist');
    }

    const result = await response.json();
    console.log('Create playlist result:', result);

    // Đảm bảo trả về dữ liệu đầy đủ
    return result;
  } catch (error) {
    console.error('Lỗi khi tạo playlist:', error);
    throw error;
  }
};

// Thêm bài hát vào playlist
export const addSongToPlaylist = async (playlistId, songId) => {
  try {
    console.log(`Thêm bài hát ${songId} vào playlist ${playlistId}`);

    const response = await fetchWithAuth(`${API_URL}/api/playlists/${playlistId}/add-song/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ song_id: songId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
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

// Xóa playlist
export const deletePlaylist = async (playlistId) => {
  try {
    console.log('Gọi deletePlaylist với playlistId:', playlistId);

    const response = await fetchWithAuth(`${API_URL}/api/playlists/${playlistId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Không thể xóa playlist');
    }

    return true; // Trả về true nếu xóa thành công
  } catch (error) {
    console.error('Lỗi khi xóa playlist:', error);
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
    console.log('Gọi toggleFavoriteSong với songId:', songId, 'type:', typeof songId);

    // Đảm bảo songId là số nguyên
    const id = Number(songId);
    if (isNaN(id)) {
      console.error('songId không phải là số hợp lệ:', songId);
      throw new Error('ID bài hát không hợp lệ');
    }

    console.log('Đã chuyển đổi songId thành số:', id);

    const response = await fetchWithAuth(`${API_URL}/api/favorites/toggle/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ song_id: id }),
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

// Tìm kiếm tổng hợp (bài hát, nghệ sĩ, album)
export const search = async (query) => {
  try {
    if (!query) {
      return {
        songs: [],
        albums: [],
        artists: [],
        error: 'Vui lòng nhập từ khóa để tìm kiếm'
      };
    }

    console.log('Gọi API tìm kiếm tổng hợp với query:', query);
    const response = await fetchWithAuth(`${API_URL}/api/search/?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể tìm kiếm');
    }

    const data = await response.json();
    console.log('Kết quả tìm kiếm tổng hợp:', data);
    return data;
  } catch (error) {
    console.error('Lỗi khi tìm kiếm:', error);
    return { songs: [], albums: [], artists: [], error: error.message };
  }
};

// Tìm kiếm bài hát
export const searchSongs = async (query) => {
  try {
    if (!query) {
      return { error: 'Vui lòng nhập từ khóa để tìm kiếm' };
    }

    console.log('Gọi API tìm kiếm bài hát với query:', query);
    const response = await fetchWithAuth(`${API_URL}/api/songs/search/?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể tìm kiếm bài hát');
    }

    const data = await response.json();
    console.log('Kết quả tìm kiếm bài hát:', data);
    return data;
  } catch (error) {
    console.error('Lỗi khi tìm kiếm bài hát:', error);
    return [];
  }
};

// Tìm kiếm album
export const searchAlbums = async (query) => {
  try {
    if (!query) {
      return { error: 'Vui lòng nhập từ khóa để tìm kiếm' };
    }

    console.log('Gọi API tìm kiếm album với query:', query);
    const response = await fetchWithAuth(`${API_URL}/api/albums/search/?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể tìm kiếm album');
    }

    const data = await response.json();
    console.log('Kết quả tìm kiếm album:', data);
    return data;
  } catch (error) {
    console.error('Lỗi khi tìm kiếm album:', error);
    return [];
  }
};

// Tìm kiếm nghệ sĩ
export const searchArtists = async (query) => {
  try {
    if (!query) {
      return { error: 'Vui lòng nhập từ khóa để tìm kiếm' };
    }

    console.log('Gọi API tìm kiếm nghệ sĩ với query:', query);
    const response = await fetchWithAuth(`${API_URL}/api/artists/search/?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể tìm kiếm nghệ sĩ');
    }

    const data = await response.json();
    console.log('Kết quả tìm kiếm nghệ sĩ:', data);
    return data;
  } catch (error) {
    console.error('Lỗi khi tìm kiếm nghệ sĩ:', error);
    return [];
  }
};
