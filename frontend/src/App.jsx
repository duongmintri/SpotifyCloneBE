import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
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

// Component trang chính
const HomePage = () => {
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
        <MainContent />
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

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Trang chính (home), chỉ hiển thị nếu đã đăng nhập */}
        <Route path="/" element={<RedirectToLogin />} />
        <Route path="/home" element={<HomePage />} />
        {/* Trang đăng nhập */}
        <Route path="/login" element={<LoginPage />} />
        {/* Trang đăng ký */}
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
  );
};

export default App;