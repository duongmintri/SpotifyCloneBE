import React, { useState, useEffect } from "react";
import MusicCard from "./MusicCard";
import { getSongs, getPlaylists } from "../../services/musicApi";
import usePlayerStore from "../../store/playerStore";
import TestFavoriteButton from "./TestFavoriteButton";

const MainContent = () => {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentSong, isPlaying } = usePlayerStore();

  // Lấy danh sách bài hát và playlist từ backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy danh sách bài hát
        const songsData = await getSongs();
        console.log("Dữ liệu bài hát từ API:", JSON.stringify(songsData, null, 2));

        // Kiểm tra cấu trúc dữ liệu và xử lý
        if (Array.isArray(songsData)) {
          console.log("Dữ liệu bài hát là mảng, số lượng:", songsData.length);

          // Kiểm tra và xử lý từng bài hát
          const processedSongs = songsData.map(song => {
            // Kiểm tra xem bài hát có id không
            if (!song.id) {
              console.warn("Bài hát không có id:", song);
              return null;
            }

            // Kiểm tra xem bài hát có file_path không
            if (!song.file_path) {
              console.warn("Bài hát không có file_path:", song);
            }

            return song;
          }).filter(song => song !== null);

          console.log("Dữ liệu bài hát đã xử lý:", processedSongs);
          setSongs(processedSongs);
        } else if (songsData && Array.isArray(songsData.results)) {
          console.log("Dữ liệu bài hát có thuộc tính results, số lượng:", songsData.results.length);

          // Kiểm tra và xử lý từng bài hát
          const processedSongs = songsData.results.map(song => {
            // Kiểm tra xem bài hát có id không
            if (!song.id) {
              console.warn("Bài hát không có id:", song);
              return null;
            }

            // Kiểm tra xem bài hát có file_path không
            if (!song.file_path) {
              console.warn("Bài hát không có file_path:", song);
            }

            return song;
          }).filter(song => song !== null);

          console.log("Dữ liệu bài hát đã xử lý:", processedSongs);
          setSongs(processedSongs);
        } else {
          console.warn("Dữ liệu bài hát không đúng định dạng:", songsData);
          setSongs([]);
        }

        // Lấy danh sách playlist
        const playlistsData = await getPlaylists();
        console.log("Dữ liệu playlist từ API:", playlistsData);

        // Kiểm tra cấu trúc dữ liệu và xử lý
        if (Array.isArray(playlistsData)) {
          setPlaylists(playlistsData);
        } else if (playlistsData && Array.isArray(playlistsData.results)) {
          setPlaylists(playlistsData.results);
        } else {
          console.warn("Dữ liệu playlist không đúng định dạng:", playlistsData);
          setPlaylists([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError("Không thể lấy dữ liệu từ server. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Nếu không có dữ liệu thực từ backend, sử dụng dữ liệu mẫu
  const sampleSongs = [
    { id: 1, title: "Urban Jungle", artist: "Street Beats", cover_image: "./src/assets/images/cover-images/1.jpg", duration: 180 },
    { id: 2, title: "Neon Lights", artist: "Tokyo Dreams", cover_image: "./src/assets/images/cover-images/2.jpg", duration: 210 },
    { id: 3, title: "Inner Light", artist: "Shocking Lemon", cover_image: "./src/assets/images/cover-images/3.jpg", duration: 225 },
    { id: 4, title: "Summer Daze", artist: "Beach Boys", cover_image: "./src/assets/images/cover-images/4.jpg", duration: 195 }
  ];

  const recommendedSongs = [
    { id: 5, title: "Starlight", artist: "Another Artist", cover_image: "./src/assets/images/cover-images/5.jpg", duration: 240 },
    { id: 6, title: "Lost in Tokyo", artist: "City Waves", cover_image: "./src/assets/images/cover-images/6.jpg", duration: 185 },
    { id: 7, title: "Purple Sunset", artist: "Jazz Combo", cover_image: "./src/assets/images/cover-images/7.jpg", duration: 215 },
    { id: 8, title: "Digital Dreams", artist: "Electronic Masters", cover_image: "./src/assets/images/cover-images/8.jpg", duration: 230 },
    { id: 9, title: "Mountain High", artist: "Nature Sounds", cover_image: "./src/assets/images/cover-images/9.jpg", duration: 200 },
    { id: 10, title: "Ocean Vibes", artist: "Coastal Tunes", cover_image: "./src/assets/images/cover-images/10.jpg", duration: 190 }
  ];

  const samplePlaylists = [
    { id: 1, title: "Top 50 Global", creator: "Spotify", cover_image: "./src/assets/images/cover-images/11.jpg" },
    { id: 2, title: "Chill Hits", creator: "Spotify", cover_image: "./src/assets/images/cover-images/12.jpg" },
    { id: 3, title: "Dance Party", creator: "Spotify", cover_image: "./src/assets/images/cover-images/13.jpg" },
    { id: 4, title: "Rock Classics", creator: "Spotify", cover_image: "./src/assets/images/cover-images/14.jpg" }
  ];

  // Sử dụng dữ liệu từ backend nếu có, nếu không sử dụng dữ liệu mẫu
  const recentlyPlayed = songs.length > 0 ? songs : sampleSongs;
  const madeForYou = songs.length > 0 ? [...songs].reverse() : recommendedSongs;
  const popularPlaylists = playlists.length > 0 ? playlists : samplePlaylists;

  console.log("Dữ liệu bài hát đã xử lý:", recentlyPlayed);

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <div className="main-content">
        <div className="error-message">
          <h2>Đã xảy ra lỗi</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <h1 className="section-title">How is your day?</h1>

      {loading ? (
        <div className="loading-spinner">Đang tải...</div>
      ) : (
        <>
          <div className="card-row">
            {recentlyPlayed.map((song) => {
              // Kiểm tra xem song có đúng định dạng không
              if (!song || typeof song !== 'object') {
                console.warn("Bài hát không hợp lệ:", song);
                return null;
              }

              // Lấy các thuộc tính cần thiết một cách an toàn
              const id = song.id || Math.random().toString();
              const title = song.title || "Bài hát không tên";

              // Xử lý artist có thể là đối tượng
              let artist = "Nghệ sĩ không xác định";
              if (song.artist) {
                if (typeof song.artist === 'string') {
                  artist = song.artist;
                } else if (typeof song.artist === 'object') {
                  // Nếu artist là một đối tượng, thử lấy thuộc tính name hoặc id
                  artist = song.artist.name || song.artist.id || "Nghệ sĩ không xác định";
                  console.log("Artist là đối tượng:", song.artist);
                }
              }

              const coverImage = song.cover_image || "/src/assets/images/cover-images/1.jpg";
              const duration = song.duration || 0;

              const processedSong = {
                id,
                title,
                artist,
                cover_image: coverImage,
                duration
              };

              return (
                <MusicCard
                  key={id}
                  song={processedSong}
                  isPlaying={isPlaying && currentSong?.id === id}
                />
              );
            })}
          </div>

          <h2 className="sub-section-title">Made For You</h2>
          <div className="card-row">
            {madeForYou.map((song) => {
              // Kiểm tra xem song có đúng định dạng không
              if (!song || typeof song !== 'object') {
                console.warn("Bài hát không hợp lệ:", song);
                return null;
              }

              // Lấy các thuộc tính cần thiết một cách an toàn
              const id = song.id || Math.random().toString();
              const title = song.title || "Bài hát không tên";

              // Xử lý artist có thể là đối tượng
              let artist = "Nghệ sĩ không xác định";
              if (song.artist) {
                if (typeof song.artist === 'string') {
                  artist = song.artist;
                } else if (typeof song.artist === 'object') {
                  // Nếu artist là một đối tượng, thử lấy thuộc tính name hoặc id
                  artist = song.artist.name || song.artist.id || "Nghệ sĩ không xác định";
                  console.log("Artist là đối tượng:", song.artist);
                }
              }

              const coverImage = song.cover_image || "/src/assets/images/cover-images/5.jpg";
              const duration = song.duration || 0;

              const processedSong = {
                id,
                title,
                artist,
                cover_image: coverImage,
                duration
              };

              return (
                <MusicCard
                  key={id}
                  song={processedSong}
                  isPlaying={isPlaying && currentSong?.id === id}
                />
              );
            })}
          </div>

          <h2 className="sub-section-title">Popular Playlists</h2>
          <div className="card-row">
            {popularPlaylists.map((playlist) => {
              // Kiểm tra xem playlist có đúng định dạng không
              if (!playlist || typeof playlist !== 'object') {
                console.warn("Playlist không hợp lệ:", playlist);
                return null;
              }

              // Lấy các thuộc tính cần thiết một cách an toàn
              const id = playlist.id || Math.random().toString();

              // Xử lý title có thể là đối tượng
              let title = "Playlist không tên";
              if (playlist.title) {
                if (typeof playlist.title === 'string') {
                  title = playlist.title;
                } else if (typeof playlist.title === 'object') {
                  title = playlist.title.name || playlist.title.id || "Playlist không tên";
                  console.log("Title là đối tượng:", playlist.title);
                }
              } else if (playlist.name) {
                if (typeof playlist.name === 'string') {
                  title = playlist.name;
                } else if (typeof playlist.name === 'object') {
                  title = playlist.name.name || playlist.name.id || "Playlist không tên";
                  console.log("Name là đối tượng:", playlist.name);
                }
              }

              // Xử lý creator có thể là đối tượng
              let creator = "Spotify";
              if (playlist.creator) {
                if (typeof playlist.creator === 'string') {
                  creator = playlist.creator;
                } else if (typeof playlist.creator === 'object') {
                  creator = playlist.creator.name || playlist.creator.id || "Spotify";
                  console.log("Creator là đối tượng:", playlist.creator);
                }
              } else if (playlist.user) {
                if (typeof playlist.user === 'string') {
                  creator = playlist.user;
                } else if (typeof playlist.user === 'object') {
                  creator = playlist.user.name || playlist.user.id || "Spotify";
                  console.log("User là đối tượng:", playlist.user);
                }
              }

              const coverImage = playlist.cover_image || "/src/assets/images/cover-images/11.jpg";

              return (
                <MusicCard
                  key={id}
                  song={{
                    id: `playlist-${id}`,
                    title: title,
                    artist: creator,
                    cover_image: coverImage
                  }}
                  isPlaying={false}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default MainContent;