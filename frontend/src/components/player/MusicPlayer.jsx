import React from "react";
import { FaPlay, FaStepBackward, FaStepForward, FaRandom, FaRedo, FaVolumeUp } from "react-icons/fa";

const MusicPlayer = () => {
  return (
    <div className="player-container">
      <div className="song-info">
        <img src="/src/assets/images/cover-images/3.jpg" alt="Inner Light" className="song-img" />
        <div className="song-details">
          <div className="song-title">Inner Light</div>
          <div className="song-artist">Shocking Lemon</div>
        </div>
      </div>
      
      <div className="player-controls">
        <div className="control-buttons">
          <button className="control-btn">
            <FaRandom />
          </button>
          <button className="control-btn">
            <FaStepBackward />
          </button>
          <button className="play-btn">
            <FaPlay />
          </button>
          <button className="control-btn">
            <FaStepForward />
          </button>
          <button className="control-btn">
            <FaRedo />
          </button>
        </div>
        
        <div className="progress-container">
          <div className="progress-time">1:23</div>
          <div className="progress-bar">
            <div className="progress-bar-fill"></div>
            <div className="progress-handle"></div>
          </div>
          <div className="progress-time">3:45</div>
        </div>
      </div>
      
      <div className="volume-container">
        <FaVolumeUp className="volume-icon" />
        <div className="volume-slider">
          <div className="volume-slider-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;