import React from "react";
import MusicCard from "./MusicCard";

const MainContent = () => {
  const recentlyPlayed = [
    { title: "Urban Jungle", artist: "Street Beats", img: "./src/assets/images/cover-images/1.jpg" },
    { title: "Neon Lights", artist: "Tokyo Dreams", img: "./src/assets/images/cover-images/2.jpg" },
    { title: "Inner Light", artist: "Shocking Lemon", img: "./src/assets/images/cover-images/3.jpg" },
    { title: "Summer Daze", artist: "Beach Boys", img: "./src/assets/images/cover-images/4.jpg" }
  ];
  
  const madeForYou = [
    { title: "Starlight", artist: "Another Artist", img: "./src/assets/images/cover-images/5.jpg" },
    { title: "Lost in Tokyo", artist: "City Waves", img: "./src/assets/images/cover-images/6.jpg" },
    { title: "Purple Sunset", artist: "Jazz Combo", img: "./src/assets/images/cover-images/7.jpg" },
    { title: "Digital Dreams", artist: "Electronic Masters", img: "./src/assets/images/cover-images/8.jpg" },
    { title: "Mountain High", artist: "Nature Sounds", img: "./src/assets/images/cover-images/9.jpg" },
    { title: "Ocean Vibes", artist: "Coastal Tunes", img: "./src/assets/images/cover-images/10.jpg" }
  ];
  
  const popularPlaylists = [
    { title: "Top 50 Global", artist: "Spotify", img: "./src/assets/images/cover-images/11.jpg" },
    { title: "Chill Hits", artist: "Spotify", img: "./src/assets/images/cover-images/12.jpg" },
    { title: "Dance Party", artist: "Spotify", img: "./src/assets/images/cover-images/13.jpg" },
    { title: "Rock Classics", artist: "Spotify", img: "./src/assets/images/cover-images/14.jpg" }
  ];

  return (
    <div className="main-content">
      <h1 className="section-title">Good afternoon</h1>
      
      <div className="card-row">
        {recentlyPlayed.map((item, index) => (
          <MusicCard 
            key={index}
            title={item.title}
            artist={item.artist}
            img={item.img}
          />
        ))}
      </div>
      
      <h2 className="sub-section-title">Made For You</h2>
      <div className="card-row">
        {madeForYou.map((item, index) => (
          <MusicCard 
            key={index}
            title={item.title}
            artist={item.artist}
            img={item.img}
          />
        ))}
      </div>
      
      <h2 className="sub-section-title">Popular Playlists</h2>
      <div className="card-row">
        {popularPlaylists.map((item, index) => (
          <MusicCard 
            key={index}
            title={item.title}
            artist={item.artist}
            img={item.img}
          />
        ))}
      </div>
    </div>
  );
};

export default MainContent;