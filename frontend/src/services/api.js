// API service for authentication
// Sử dụng URL đầy đủ của backend
const API_URL = 'http://localhost:8000';

// Hàm để lấy CSRF token từ cookie
function getCsrfToken() {
  const name = 'csrftoken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return '';
}

// Đăng ký người dùng mới
export const registerUser = async (userData) => {
  try {
    console.log('Gửi request đăng ký đến:', `${API_URL}/accounts/register/`);
    console.log('Dữ liệu đăng ký:', userData);

    // Lấy CSRF token từ cookie (nếu có)
    const csrfToken = getCsrfToken();

    const response = await fetch(`${API_URL}/api/accounts/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });

    console.log('Nhận response với status:', response.status);

    // Kiểm tra response có phải là JSON không
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Đăng ký thất bại');
      }

      return data;
    } else {
      // Nếu không phải JSON, đọc text
      const text = await response.text();
      console.error('Response không phải JSON:', text);
      throw new Error('Phản hồi từ server không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    throw error;
  }
};

// Đăng nhập người dùng
export const loginUser = async (credentials) => {
  try {
    console.log('Gửi request đăng nhập đến:', `${API_URL}/accounts/login/`);
    console.log('Dữ liệu đăng nhập:', credentials);

    // Lấy CSRF token từ cookie (nếu có)
    const csrfToken = getCsrfToken();

    const response = await fetch(`${API_URL}/api/accounts/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    console.log('Nhận response với status:', response.status);

    // Kiểm tra response có phải là JSON không
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Đăng nhập thất bại');
      }

      return data;
    } else {
      // Nếu không phải JSON, đọc text
      const text = await response.text();
      console.error('Response không phải JSON:', text);
      throw new Error('Phản hồi từ server không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    throw error;
  }
};

// Lấy thông tin người dùng
export const getUserProfile = async (token) => {
  try {
    console.log('Gửi request lấy thông tin người dùng đến:', `${API_URL}/api/accounts/profile/`);

    // Lấy CSRF token từ cookie (nếu có)
    const csrfToken = getCsrfToken();

    const response = await fetch(`${API_URL}/api/accounts/profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
    });

    console.log('Nhận response với status:', response.status);

    // Kiểm tra response có phải là JSON không
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Thông tin người dùng từ API:', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Không thể lấy thông tin người dùng');
      }

      return data;
    } else {
      // Nếu không phải JSON, đọc text
      const text = await response.text();
      console.error('Response không phải JSON:', text);
      throw new Error('Phản hồi từ server không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    throw error;
  }
};

// Lưu thông tin đăng nhập vào localStorage
export const saveAuthData = (data) => {
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  localStorage.setItem('user', JSON.stringify(data.user));

  // Lưu userId riêng để dễ truy cập
  if (data.user && data.user.id) {
    localStorage.setItem('userId', data.user.id);
  }
};

// Lấy token từ localStorage
export const getAccessToken = () => {
  const token = localStorage.getItem('access_token');
  return token;
};

// Lấy refresh token từ localStorage
export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

// Refresh token khi access token hết hạn
export const refreshToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('Không có refresh token');
    }

    const csrfToken = getCsrfToken();
    const response = await fetch(`${API_URL}/api/accounts/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({ refresh: refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Không thể refresh token');
    }

    const data = await response.json();

    // Lưu access token mới vào localStorage
    localStorage.setItem('access_token', data.access);

    return data.access;
  } catch (error) {
    console.error('Lỗi refresh token:', error);
    // Nếu không thể refresh token, xóa thông tin đăng nhập
    clearAuthData();
    // Chuyển hướng về trang đăng nhập
    window.location.href = '/login';
    throw error;
  }
};

// Lấy thông tin người dùng từ localStorage
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    // Thử parse JSON
    const user = JSON.parse(userStr);
    return user;
  } catch (error) {
    console.error('Lỗi khi parse thông tin user:', error);
    return null;
  }
};

// Thêm hàm mới để cập nhật thông tin người dùng
export const updateUserInfo = async () => {
  try {
    // Gọi API để lấy thông tin người dùng mới nhất
    const response = await fetchWithAuth(`${API_URL}/api/accounts/profile/`);
    
    if (response.ok) {
      // Kiểm tra content-type trước khi parse JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const userData = await response.json();
        // Cập nhật thông tin user trong localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        console.error('Response không phải JSON:', await response.text());
        return null;
      }
    } else {
      console.error('Không thể cập nhật thông tin người dùng, status:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    return null;
  }
};

// Xóa thông tin đăng nhập khỏi localStorage
export const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
};

// Kiểm tra người dùng đã đăng nhập chưa
export const isAuthenticated = () => {
  const token = getAccessToken();
  console.log("Kiểm tra xác thực, token:", token ? "Có token" : "Không có token");
  return !!token;
};

// Hàm fetch với xác thực và tự động refresh token
export const fetchWithAuth = async (url, options = {}) => {
  // Lấy token hiện tại
  let token = getAccessToken();

  // Thêm headers nếu chưa có
  if (!options.headers) {
    options.headers = {};
  }

  // Thêm Content-Type nếu chưa có và có body
  if (options.body && !options.headers['Content-Type']) {
    options.headers['Content-Type'] = 'application/json';
  }

  // Thêm credentials nếu chưa có
  if (!options.credentials) {
    options.credentials = 'include';
  }

  // Thêm token vào headers
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  // Thực hiện fetch
  let response = await fetch(url, options);

  // Nếu token hết hạn (401 Unauthorized)
  if (response.status === 401) {
    try {
      console.log("Token hết hạn, đang refresh token...");
      // Thử refresh token
      token = await refreshToken();

      // Cập nhật token trong headers
      options.headers['Authorization'] = `Bearer ${token}`;

      // Thực hiện fetch lại
      console.log("Thực hiện fetch lại với token mới");
      response = await fetch(url, options);
    } catch (error) {
      console.error('Không thể refresh token:', error);
      throw error;
    }
  }

  return response;
};

// Cập nhật thông tin người dùng
export const updateUserProfile = async (userData) => {
  try {
    console.log('Gửi request cập nhật thông tin người dùng:', userData);
    
    const response = await fetchWithAuth(`${API_URL}/api/accounts/profile/`, {
      method: 'PUT', // Thay đổi từ PATCH sang PUT
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Không thể cập nhật thông tin người dùng');
    }

    const updatedUser = await response.json();
    console.log('Nhận response cập nhật thông tin:', updatedUser);
    
    // Cập nhật thông tin người dùng trong localStorage
    try {
      // Lấy user hiện tại từ localStorage
      const currentUser = getUser();
      if (currentUser) {
        // Cập nhật thông tin user
        const updatedUserData = {
          ...currentUser,
          ...updatedUser
        };
        
        // Lưu lại vào localStorage
        localStorage.setItem('user', JSON.stringify(updatedUserData));
      }
    } catch (storageError) {
      console.error('Lỗi khi cập nhật localStorage:', storageError);
      // Tiếp tục xử lý mà không dừng lại vì lỗi localStorage
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    throw error;
  }
};

// Hàm để kiểm tra trạng thái premium của người dùng
export const checkPremiumStatus = async () => {
  try {
    console.log('Đang kiểm tra trạng thái premium...');
    // Đảm bảo URL đúng với endpoint backend
    const response = await fetchWithAuth(`${API_URL}/api/accounts/premium-status/`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from premium status:', errorText);
      throw new Error('Không thể kiểm tra trạng thái premium');
    }
    
    const data = await response.json();
    console.log('Kết quả kiểm tra premium:', data);
    
    // Cập nhật thông tin user trong localStorage
    const currentUser = getUser();
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        is_premium: data.is_premium
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return data.is_premium;
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái premium:', error);
    return false;
  }
};
