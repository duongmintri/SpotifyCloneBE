import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet } from "react-router-dom";
import "./styles/App.css";
import "./styles/AuthStyles.css";
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

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="app">
      <div className="app-navbar">
        <Navbar />
      </div>
      <div className="main-container">
        <div className="sidebar left-sidebar">
          <LeftSidebar />
        </div>
        <Outlet /> {/* Nơi các component con sẽ được render */}
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
        </Route>

        {/* Trang đăng nhập */}
        <Route path="/login" element={<LoginPage />} />
        {/* Trang đăng ký */}
        <Route path="/signup" element={<SignupPage />} />
        {/* Trang test */}
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </Router>
  );
};

export default App;
