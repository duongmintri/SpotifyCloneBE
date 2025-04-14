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

<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
  integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
  crossorigin="anonymous"
/>
export default App;