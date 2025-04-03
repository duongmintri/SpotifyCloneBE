import React from "react";
import "./App.css";
import Navbar from "./components/layout/Navbar";
import LeftSidebar from "./components/layout/LeftSidebar";
import RightSidebar from "./components/layout/RightSidebar";
import MainContent from "./components/content/MainContent";
import MusicPlayer from "./components/player/MusicPlayer";
import ModalManager from "./components/modals/ModalManager";

const App = () => {
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

export default App;