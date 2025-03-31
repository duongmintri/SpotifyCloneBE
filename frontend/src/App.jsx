import React from "react";
import "./App.css";
import Navbar from "./components/layout/Navbar";
import LeftSidebar from "./components/layout/LeftSidebar";
import RightSidebar from "./components/layout/RightSidebar";
import MainContent from "./components/content/MainContent";
import MusicPlayer from "./components/player/MusicPlayer";

const App = () => {
  return (
    <div className="app">
      {/* Navbar */}
      <div className="app-navbar">
        <Navbar />
      </div>
      
      {/* Main container */}
      <div className="main-container">
        {/* Left Sidebar */}
        <div className="sidebar left-sidebar">
          <LeftSidebar />
        </div>
        
        {/* Main Content - Scrollable */}
        <MainContent />
        
        {/* Right Sidebar */}
        <div className="sidebar right-sidebar">
          <RightSidebar />
        </div>
      </div>
      
      {/* Music Player */}
      <div className="music-player">
        <MusicPlayer />
      </div>
    </div>
  );
};

export default App;