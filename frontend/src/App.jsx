import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet } from "react-router-dom";
import "./styles/App.css";
import "./styles/AuthStyles.css";
import "./styles/AdminStyles.css";
import Navbar from "./components/layout/Navbar";
import LeftSidebar from "./components/layout/LeftSidebar";
import RightSidebar from "./components/layout/RightSidebar";
import MainContent from "./components/content/MainContent";
import MusicPlayer from "./components/player/MusicPlayer";
import ModalManager from "./components/modals/ModalManager";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TestPage from "./pages/TestPage";
import AlbumDetailPage from "./pages/AlbumDetailPage";
import CreateAlbumPage from "./pages/CreateAlbumPage";
// import EditAlbumPage from "./pages/EditAlbumPage";
import AlbumList from "./components/content/AlbumList";
import FavoriteSongs from "./components/content/FavoriteSongs";
import { isAuthenticated } from "./services/api";
import CreatePlaylistPage from './pages/CreatePlaylistPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import PlaylistList from './components/content/PlaylistList';
import SearchPage from './components/pages/SearchPage';
import useChatStore from './store/chatStore';

// Admin imports
import AdminLayout from "./components/admin/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SongList from "./pages/admin/songs/SongList";
import ArtistList from "./pages/admin/artists/ArtistList";
import { default as AdminAlbumList } from "./pages/admin/albums/AlbumList";
import UserList from "./pages/admin/users/UserList";
import { isAdminAuthenticated } from "./services/adminApi";

// Lazy loaded components
const SongForm = lazy(() => import('./pages/admin/songs/SongFormLazy'));
const ArtistForm = lazy(() => import('./pages/admin/artists/ArtistFormLazy'));
const AlbumForm = lazy(() => import('./pages/admin/albums/AlbumFormLazy'));

// Component để xử lý redirect
const RedirectToLogin = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      navigate("/home");
    }
  }, [navigate]);
  return null;
};

// Layout chung cho tất cả các trang đã đăng nhập
const AppLayout = () => {
  const navigate = useNavigate();
  const { initWebSocket, closeWebSocket, fetchUnreadCount } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      // Khởi tạo WebSocket khi đã đăng nhập
      initWebSocket();

      // Lấy số lượng tin nhắn chưa đọc ban đầu
      fetchUnreadCount();

      // Thiết lập interval để cập nhật số lượng tin nhắn chưa đọc mỗi 10 giây
      const intervalId = setInterval(() => {
        fetchUnreadCount();
      }, 10000);

      return () => {
        // Xóa interval khi component unmount
        clearInterval(intervalId);
        // Đóng WebSocket khi component unmount
        closeWebSocket();
      };
    }
  }, [navigate, initWebSocket, closeWebSocket, fetchUnreadCount]);

  return (
    <div className="app">
      <div className="app-navbar">
        <Navbar />
      </div>
      <div className="main-container">
        <div className="sidebar left-sidebar">
          <LeftSidebar />
        </div>
        <div className="main-content">
          <Outlet />
        </div>
        <div className="sidebar right-sidebar">
          <RightSidebar />
        </div>
      </div>
      <div className="music-player">
        <MusicPlayer />
      </div>
      <ModalManager />
    </div>
  );
};

// Component trang chính
const HomePage = () => {
  return <MainContent />;
};

// Component trang album
const AlbumsPage = () => {
  return <AlbumList />;
};

// Component trang bài hát yêu thích
const FavoritesPage = () => {
  return <FavoriteSongs />;
};

// Component để xử lý redirect cho admin
const RedirectToAdminLogin = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate("/admin/login");
    } else {
      navigate("/admin/dashboard");
    }
  }, [navigate]);
  return null;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Trang chính (home), chỉ hiển thị nếu đã đăng nhập */}
        <Route path="/" element={<RedirectToLogin />} />

        {/* Layout chung cho các trang đã đăng nhập */}
        <Route path="/" element={<AppLayout />}>
          <Route path="home" element={<HomePage />} />
          <Route path="albums" element={<AlbumsPage />} />
          <Route path="albums/create" element={<CreateAlbumPage />} />
          <Route path="albums/:id" element={<AlbumDetailPage />} />
          {/* <Route path="albums/:id/edit" element={<EditAlbumPage />} /> */}
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="playlists" element={<PlaylistList />} />
          <Route path="playlists/create" element={<CreatePlaylistPage />} />
          <Route path="playlists/:id" element={<PlaylistDetailPage />} />
          <Route path="search" element={<SearchPage />} />
        </Route>

        {/* Trang đăng nhập */}
        <Route path="/login" element={<LoginPage />} />
        {/* Trang đăng ký */}
        <Route path="/signup" element={<SignupPage />} />
        {/* Trang test */}
        <Route path="/test" element={<TestPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<RedirectToAdminLogin />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Song routes */}
          <Route path="songs" element={<SongList />} />
          <Route path="songs/create" element={
            <Suspense fallback={<div className="admin-loading">Đang tải...</div>}>
              <SongForm />
            </Suspense>
          } />
          <Route path="songs/edit/:id" element={
            <Suspense fallback={<div className="admin-loading">Đang tải...</div>}>
              <SongForm />
            </Suspense>
          } />

          {/* Artist routes */}
          <Route path="artists" element={<ArtistList />} />
          <Route path="artists/create" element={
            <Suspense fallback={<div className="admin-loading">Đang tải...</div>}>
              <ArtistForm />
            </Suspense>
          } />
          <Route path="artists/edit/:id" element={
            <Suspense fallback={<div className="admin-loading">Đang tải...</div>}>
              <ArtistForm />
            </Suspense>
          } />

          {/* Album routes */}
          <Route path="albums" element={<AdminAlbumList />} />
          <Route path="albums/create" element={
            <Suspense fallback={<div className="admin-loading">Đang tải...</div>}>
              <AlbumForm />
            </Suspense>
          } />
          <Route path="albums/edit/:id" element={
            <Suspense fallback={<div className="admin-loading">Đang tải...</div>}>
              <AlbumForm />
            </Suspense>
          } />

          {/* User routes */}
          <Route path="users" element={<UserList />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
