// Lấy token từ localStorage
export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Lưu token vào localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('access_token', token);
};

// Xóa token khỏi localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('access_token');
};

// Lấy thông tin người dùng từ localStorage
export const getUserInfo = () => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      return JSON.parse(userString);
    } catch (e) {
      console.error('Lỗi khi parse thông tin người dùng:', e);
      return null;
    }
  }
  return null;
};

// Lưu thông tin người dùng vào localStorage
export const setUserInfo = (user) => {
  if (user && user.id) {
    localStorage.setItem('userId', user.id);
  }
  localStorage.setItem('user', JSON.stringify(user));
};

// Xóa thông tin người dùng khỏi localStorage
export const removeUserInfo = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
};

// Kiểm tra xem người dùng đã đăng nhập chưa
export const isAuthenticated = () => {
  return !!getAuthToken();
};
