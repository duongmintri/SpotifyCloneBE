import React from "react";
import { FaPlay } from "react-icons/fa";

const MusicCard = ({ title, artist, img }) => {
  return (
    <div className="music-card">
      <div className="card-img-container">
        <img src={img} alt={title} className="card-img" />
        <div className="play-icon">
          <FaPlay style={{ color: "black", fontSize: "1rem" }} />
        </div>
      </div>
      <h3 className="card-title">{title}</h3>
      <p className="card-artist">{artist}</p>
    </div>
  );
};

export default MusicCard;