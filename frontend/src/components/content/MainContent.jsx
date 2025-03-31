import React from "react";
import MusicCard from "./MusicCard";

const MainContent = () => {
  const recentlyPlayed = [
    { title: "Urban Jungle", artist: "Street Beats", img: "https://dummyimage.com/300/222222" },
    { title: "Neon Lights", artist: "Tokyo Dreams", img: "https://dummyimage.com/300/333333" },
    { title: "Inner Light", artist: "Shocking Lemon", img: "https://dummyimage.com/300/444444" },
    { title: "Summer Daze", artist: "Beach Boys", img: "https://dummyimage.com/300/555555" }
  ];
  
  const madeForYou = [
    { title: "Starlight", artist: "Another Artist", img: "https://dummyimage.com/300/666666" },
    { title: "Lost in Tokyo", artist: "City Waves", img: "https://dummyimage.com/300/777777" },
    { title: "Purple Sunset", artist: "Jazz Combo", img: "https://dummyimage.com/300/888888" },
    { title: "Digital Dreams", artist: "Electronic Masters", img: "https://dummyimage.com/300/999999" },
    { title: "Mountain High", artist: "Nature Sounds", img: "https://dummyimage.com/300/aaaaaa" },
    { title: "Ocean Vibes", artist: "Coastal Tunes", img: "https://dummyimage.com/300/bbbbbb" }
  ];
  
  const popularPlaylists = [
    { title: "Top 50 Global", artist: "Spotify", img: "https://dummyimage.com/300/cccccc" },
    { title: "Chill Hits", artist: "Spotify", img: "https://dummyimage.com/300/dddddd" },
    { title: "Dance Party", artist: "Spotify", img: "https://dummyimage.com/300/eeeeee" },
    { title: "Rock Classics", artist: "Spotify", img: "https://dummyimage.com/300/ffffff" }
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