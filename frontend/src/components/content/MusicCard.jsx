import React from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import usePlayerStore from "../../store/playerStore";
import ImageLoader from "../player/ImageLoader";
import FavoriteButton from "../common/FavoriteButton";

const MusicCard = ({ song, isPlaying = false }) => {
  const { setCurrentSong, setIsPlaying, setQueue, queue } = usePlayerStore();

  // Kiểm tra xem song có hợp lệ không
  if (!song || typeof song !== 'object') {
    console.warn("MusicCard: song không hợp lệ", song);
    return null;
  }

  console.log("MusicCard nhận được song:", song);

  // Lấy các thuộc tính cần thiết một cách an toàn
  const id = song.id || Math.random().toString();
  console.log("MusicCard - song ID:", id, "type:", typeof id);
  const title = song.title || "Bài hát không tên";

  // Đảm bảo artist luôn là một chuỗi
  let artist = "Nghệ sĩ không xác định";
  if (song.artist) {
    if (typeof song.artist === 'string') {
      artist = song.artist;
    } else if (typeof song.artist === 'object') {
      // Nếu artist là một đối tượng, thử lấy thuộc tính name hoặc id
      artist = song.artist.name || song.artist.id || JSON.stringify(song.artist);
      console.log("Artist là đối tượng:", song.artist);
    }
  }

  const coverImage = song.cover_image || "/src/assets/images/cover-images/3.jpg";

  const handlePlay = () => {
    console.log("Xử lý phát nhạc cho bài hát:", song);

    // Nếu bài hát này đang phát, tạm dừng
    if (isPlaying) {
      console.log("Tạm dừng bài hát đang phát");
      setIsPlaying(false);
      return;
    }

    // Nếu bài hát này chưa có trong queue, thêm vào
    if (!queue.some(item => item.id === id)) {
      console.log("Thêm bài hát vào queue và phát");
      setQueue([...queue, song], queue.length);
      setCurrentSong(song);
      setIsPlaying(true);
    } else {
      // Nếu đã có trong queue, phát bài hát đó
      console.log("Bài hát đã có trong queue, phát trực tiếp");
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  return (
    <div className="music-card">
      <div className="card-img-container">
        <ImageLoader
          songId={id}
          coverImage={coverImage}
          fallbackSrc="/src/assets/images/cover-images/3.jpg"
          alt={title}
          className="card-img"
        />
        <div
          className="play-icon"
          onClick={handlePlay}
        >
          {isPlaying ? (
            <FaPause style={{ color: "black", fontSize: "1rem" }} />
          ) : (
            <FaPlay style={{ color: "black", fontSize: "1rem" }} />
          )}
        </div>
        <div
          className="favorite-button-container"
          onClick={(e) => {
            // Ngăn chặn sự kiện click lan ra ngoài
            e.stopPropagation();
            e.preventDefault();
            console.log("Clicked on favorite button container");
          }}
        >
          <div onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log("Clicked on favorite button wrapper");
          }}>
            <FavoriteButton songId={Number(id)} size="sm" />
          </div>
        </div>
      </div>
      <h3 className="card-title">{title}</h3>
      <p className="card-artist">{artist}</p>
    </div>
  );
};

export default MusicCard;