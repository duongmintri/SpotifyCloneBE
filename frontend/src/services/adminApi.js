// API service for admin
import { fetchWithAuth } from './api';

const API_URL = 'http://localhost:8000';

// Admin login
export const adminLogin = async (credentials) => {
  try {
    console.log('Gửi request đăng nhập admin đến:', `${API_URL}/api/admin/login/`);
    console.log('Dữ liệu đăng nhập:', credentials);

    const response = await fetch(`${API_URL}/api/admin/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Đăng nhập thất bại');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi đăng nhập admin:', error);
    throw error;
  }
};

// Lưu thông tin đăng nhập admin vào localStorage
export const saveAdminAuthData = (data) => {
  localStorage.setItem('admin_access_token', data.access);
  localStorage.setItem('admin_refresh_token', data.refresh);
  localStorage.setItem('admin_user', JSON.stringify(data.user));
};

// Lấy token admin từ localStorage
export const getAdminAccessToken = () => {
  return localStorage.getItem('admin_access_token');
};

// Kiểm tra người dùng đã đăng nhập admin chưa
export const isAdminAuthenticated = () => {
  return !!getAdminAccessToken();
};

// Xóa thông tin đăng nhập admin khỏi localStorage
export const clearAdminAuthData = () => {
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
  localStorage.removeItem('admin_user');
};

// Hàm fetch với xác thực admin
export const fetchWithAdminAuth = async (url, options = {}) => {
  // Lấy token hiện tại
  let token = getAdminAccessToken();

  // Thêm headers nếu chưa có
  if (!options.headers) {
    options.headers = {};
  }

  // Thêm Content-Type nếu chưa có và có body, nhưng chỉ khi body không phải là FormData
  if (options.body && !options.headers['Content-Type'] && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
  }

  // Thêm token vào headers
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, options);
};

// Lấy danh sách người dùng
export const getUsers = async () => {
  try {
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/users/`);

    if (!response.ok) {
      throw new Error('Không thể lấy danh sách người dùng');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    return [];
  }
};

// Lấy danh sách nghệ sĩ
export const getArtists = async () => {
  try {
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/artists/`);

    if (!response.ok) {
      throw new Error('Không thể lấy danh sách nghệ sĩ');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nghệ sĩ:', error);
    return [];
  }
};

// Lấy thông tin chi tiết nghệ sĩ
export const getArtistDetails = async (artistId) => {
  try {
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/artists/${artistId}/`);

    if (!response.ok) {
      throw new Error('Không thể lấy thông tin nghệ sĩ');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy thông tin nghệ sĩ:', error);
    throw error;
  }
};

// Tạo nghệ sĩ mới
export const createArtist = async (artistData) => {
  try {
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/artists/`, {
      method: 'POST',
      body: JSON.stringify(artistData),
    });

    if (!response.ok) {
      throw new Error('Không thể tạo nghệ sĩ');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tạo nghệ sĩ:', error);
    throw error;
  }
};

// Cập nhật nghệ sĩ
export const updateArtist = async (artistId, artistData) => {
  try {
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/artists/${artistId}/`, {
      method: 'PUT',
      body: JSON.stringify(artistData),
    });

    if (!response.ok) {
      throw new Error('Không thể cập nhật nghệ sĩ');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi cập nhật nghệ sĩ:', error);
    throw error;
  }
};

// Xóa nghệ sĩ
export const deleteArtist = async (artistId) => {
  try {
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/artists/${artistId}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Không thể xóa nghệ sĩ');
    }

    return true;
  } catch (error) {
    console.error('Lỗi khi xóa nghệ sĩ:', error);
    throw error;
  }
};

// Lấy danh sách album
export const getAlbums = async () => {
  try {
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/albums/`);

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
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/albums/${albumId}/`);

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
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/albums/`, {
      method: 'POST',
      body: albumData, // Đã là FormData, không cần JSON.stringify
      headers: {
        // Không đặt Content-Type khi sử dụng FormData
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        throw new Error(errorData.error || JSON.stringify(errorData) || 'Không thể tạo album');
      } catch (jsonError) {
        console.log('Error parsing JSON:', jsonError);
        throw new Error(`Không thể tạo album: ${response.status} ${response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tạo album:', error);
    throw error;
  }
};

// Cập nhật album
export const updateAlbum = async (albumId, albumData) => {
  try {
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/albums/${albumId}/`, {
      method: 'PUT',
      body: albumData, // Đã là FormData, không cần JSON.stringify
      headers: {
        // Không đặt Content-Type khi sử dụng FormData
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        throw new Error(errorData.error || JSON.stringify(errorData) || 'Không thể cập nhật album');
      } catch (jsonError) {
        console.log('Error parsing JSON:', jsonError);
        throw new Error(`Không thể cập nhật album: ${response.status} ${response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi cập nhật album:', error);
    throw error;
  }
};

// Xóa album
export const deleteAlbum = async (albumId) => {
  try {
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/albums/${albumId}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Không thể xóa album');
    }

    return true;
  } catch (error) {
    console.error('Lỗi khi xóa album:', error);
    throw error;
  }
};

// Lấy danh sách bài hát
export const getSongs = async () => {
  try {
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/songs/`);

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
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/songs/${songId}/`);

    if (!response.ok) {
      throw new Error('Không thể lấy thông tin bài hát');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy thông tin bài hát:', error);
    throw error;
  }
};

// Tạo bài hát mới
export const createSong = async (songData) => {
  try {
    // Sử dụng FormData để gửi file
    const formData = new FormData();

    // Thêm file MP3
    if (songData.file) {
      formData.append('file', songData.file);
    }

    // Thêm các trường dữ liệu khác
    formData.append('title', songData.title);
    formData.append('artist', songData.artist);

    if (songData.album) {
      formData.append('album', songData.album);
    }

    if (songData.cover_image) {
      formData.append('cover_image', songData.cover_image);
    }

    if (songData.video) {
      formData.append('video', songData.video);
    }

    formData.append('is_premium', songData.is_premium);

    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/songs/`, {
      method: 'POST',
      body: formData,
      headers: {
        // Không đặt Content-Type khi sử dụng FormData
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        throw new Error(errorData.error || JSON.stringify(errorData) || 'Không thể tạo bài hát');
      } catch (jsonError) {
        console.log('Error parsing JSON:', jsonError);
        throw new Error(`Không thể tạo bài hát: ${response.status} ${response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tạo bài hát:', error);
    throw error;
  }
};

// Cập nhật bài hát
export const updateSong = async (songId, songData) => {
  try {
    // Sử dụng FormData để gửi file
    const formData = new FormData();

    // Thêm file MP3 nếu có
    if (songData.file) {
      formData.append('file', songData.file);
    }

    // Thêm các trường dữ liệu khác
    formData.append('title', songData.title);
    formData.append('artist', songData.artist);

    if (songData.album) {
      formData.append('album', songData.album);
    }

    if (songData.cover_image) {
      formData.append('cover_image', songData.cover_image);
    }

    if (songData.video) {
      formData.append('video', songData.video);
    }

    formData.append('is_premium', songData.is_premium);

    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/songs/${songId}/`, {
      method: 'PUT',
      body: formData,
      headers: {
        // Không đặt Content-Type khi sử dụng FormData
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Không thể cập nhật bài hát');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi cập nhật bài hát:', error);
    throw error;
  }
};

// Xóa bài hát
export const deleteSong = async (songId) => {
  try {
    const response = await fetchWithAdminAuth(`${API_URL}/api/admin/songs/${songId}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Không thể xóa bài hát');
    }

    return true;
  } catch (error) {
    console.error('Lỗi khi xóa bài hát:', error);
    throw error;
  }
};
