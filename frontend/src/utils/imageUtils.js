// Hàm xử lý ảnh bìa cho playlist
export const getPlaylistCoverImage = (playlist) => {
  console.log("getPlaylistCoverImage được gọi với playlist:", playlist);
  
  // Danh sách các URL mặc định hoặc không hợp lệ cần bỏ qua
  const defaultOrInvalidUrls = [
    "/src/assets/images/cover-images/11.jpg",
    "http://example.com/playlist.jpg",
    "https://example.com/playlist.jpg",
    "http://example.com/cover.jpg",
    "https://example.com/cover.jpg"
  ];
  
  // Nếu playlist đã có cover_image hợp lệ, sử dụng nó
  if (playlist.cover_image && 
      !defaultOrInvalidUrls.includes(playlist.cover_image)) {
    console.log("Sử dụng cover_image có sẵn:", playlist.cover_image);
    return playlist.cover_image;
  }
  
  // Nếu playlist có songs và có ít nhất 1 bài hát
  if (playlist.songs && playlist.songs.length > 0) {
    console.log("Playlist có", playlist.songs.length, "bài hát");
    console.log("Các bài hát:", playlist.songs);
    
    // Tìm bài hát đầu tiên có cover_image
    const songWithCover = playlist.songs.find(song => {
      console.log("Kiểm tra bài hát:", song);
      return song.cover_image && 
             !defaultOrInvalidUrls.includes(song.cover_image);
    });
    
    if (songWithCover) {
      console.log("Tìm thấy bài hát có cover_image:", songWithCover.cover_image);
      return songWithCover.cover_image;
    } else {
      console.log("Không tìm thấy bài hát nào có cover_image hợp lệ");
    }
  } else {
    console.log("Playlist không có bài hát hoặc songs không phải là mảng");
  }
  
  // Nếu không tìm thấy ảnh bìa từ bài hát, sử dụng ảnh mặc định
  console.log("Sử dụng ảnh mặc định");
  return "/src/assets/images/cover-images/11.jpg";
};
