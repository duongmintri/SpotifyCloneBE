import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaUpload, FaMusic, FaImage, FaVideo } from "react-icons/fa";
import {
  getSongDetails,
  createSong,
  updateSong,
  getArtists,
  getAlbums
} from "../../../services/adminApi";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const SongForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileInputRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    is_premium: false,
    cover_image: null,
    file: null,
    video: null,
  });

  const [fileInfo, setFileInfo] = useState({
    name: "",
    size: 0,
    duration: 0,
  });

  const [coverImageInfo, setCoverImageInfo] = useState({
    name: "",
    size: 0,
  });

  const [videoInfo, setVideoInfo] = useState({
    name: "",
    size: 0,
  });

  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy danh sách nghệ sĩ và album
        const artistsData = await getArtists();
        setArtists(artistsData);

        const albumsData = await getAlbums();
        setAlbums(albumsData);

        // Nếu là chế độ chỉnh sửa, lấy thông tin bài hát
        if (isEditMode) {
          const songData = await getSongDetails(id);
          setFormData({
            title: songData.title,
            artist: songData.artist,
            album: songData.album || "",
            is_premium: songData.is_premium,
            cover_image: null,
            file: null,
            video: null,
          });

          setFileInfo({
            name: songData.file_path.split('/').pop(),
            size: 0,
            duration: songData.duration,
          });

          if (songData.cover_image) {
            setCoverImageInfo({
              name: songData.cover_image.split('/').pop(),
              size: 0,
            });
          }

          if (songData.video) {
            setVideoInfo({
              name: songData.video.split('/').pop(),
              size: 0,
            });
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra xem file có phải là MP3 không
    if (!file.type.includes('audio/mp3') && !file.type.includes('audio/mpeg')) {
      setError("Chỉ chấp nhận file MP3");
      return;
    }

    // Cập nhật formData với file mới
    setFormData({
      ...formData,
      file: file,
    });

    // Lấy thông tin file
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContext.decodeAudioData(e.target.result, function(buffer) {
        const duration = Math.round(buffer.duration);
        setFileInfo({
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2), // Kích thước tính bằng MB
          duration: duration,
        });
      });
    };

    fileReader.readAsArrayBuffer(file);
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra xem file có phải là ảnh không
    if (!file.type.includes('image/')) {
      setError("Chỉ chấp nhận file ảnh");
      return;
    }

    // Cập nhật formData với file ảnh mới
    setFormData({
      ...formData,
      cover_image: file,
    });

    // Cập nhật thông tin file ảnh
    setCoverImageInfo({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2), // Kích thước tính bằng MB
    });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra xem file có phải là video không
    if (!file.type.includes('video/')) {
      setError("Chỉ chấp nhận file video");
      return;
    }

    // Cập nhật formData với file video mới
    setFormData({
      ...formData,
      video: file,
    });

    // Cập nhật thông tin file video
    setVideoInfo({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2), // Kích thước tính bằng MB
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra xem có file được chọn chưa (bắt buộc khi thêm mới)
    if (!isEditMode && !formData.file) {
      setError("Vui lòng chọn file MP3");
      return;
    }

    try {
      setSaving(true);

      if (isEditMode) {
        await updateSong(id, formData);
        showSuccessToast("Cập nhật bài hát thành công!");
      } else {
        await createSong(formData);
        showSuccessToast("Thêm bài hát mới thành công!");
      }

      navigate("/admin/songs");
    } catch (error) {
      console.error("Lỗi khi lưu bài hát:", error);
      setError(error.message || "Không thể lưu bài hát. Vui lòng thử lại sau.");
      showErrorToast(error.message || "Không thể lưu bài hát. Vui lòng thử lại sau.");
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/songs");
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="admin-loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header-title">
          {isEditMode ? "Chỉnh sửa bài hát" : "Thêm bài hát mới"}
        </h1>
        <button
          className="admin-back-btn"
          onClick={() => navigate("/admin/songs")}
        >
          <FaArrowLeft /> Quay lại
        </button>
      </div>

      <div className="admin-form-container">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="title">Tên bài hát</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="admin-input-field"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="artist">Nghệ sĩ</label>
            <select
              id="artist"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              className="admin-input-field"
              required
            >
              <option value="">Chọn nghệ sĩ</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label htmlFor="album">Album (tùy chọn)</label>
            <select
              id="album"
              name="album"
              value={formData.album}
              onChange={handleChange}
              className="admin-input-field"
            >
              <option value="">Không thuộc album nào</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label>File MP3</label>
            <div className="admin-file-upload">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".mp3,audio/mp3,audio/mpeg"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="admin-file-upload-btn"
                onClick={() => fileInputRef.current.click()}
              >
                <FaUpload /> Chọn file MP3
              </button>
              {fileInfo.name && (
                <div className="admin-file-info">
                  <FaMusic className="admin-file-icon" />
                  <div className="admin-file-details">
                    <div className="admin-file-name">{fileInfo.name}</div>
                    <div className="admin-file-meta">
                      {fileInfo.size > 0 && <span>{fileInfo.size} MB</span>}
                      {fileInfo.duration > 0 && <span> • {formatDuration(fileInfo.duration)}</span>}
                    </div>
                  </div>
                </div>
              )}
              {isEditMode && !formData.file && (
                <div className="admin-file-note">
                  * Chỉ cần chọn file mới nếu muốn thay thế file hiện tại
                </div>
              )}
            </div>
          </div>

          <div className="admin-form-group">
            <label>Ảnh bìa</label>
            <div className="admin-file-upload">
              <input
                type="file"
                ref={coverImageInputRef}
                onChange={handleCoverImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="admin-file-upload-btn"
                onClick={() => coverImageInputRef.current.click()}
              >
                <FaImage /> Chọn file ảnh
              </button>
              {coverImageInfo.name && (
                <div className="admin-file-info">
                  <FaImage className="admin-file-icon" />
                  <div className="admin-file-details">
                    <div className="admin-file-name">{coverImageInfo.name}</div>
                    <div className="admin-file-meta">
                      {coverImageInfo.size > 0 && <span>{coverImageInfo.size} MB</span>}
                    </div>
                  </div>
                </div>
              )}
              {isEditMode && !formData.cover_image && coverImageInfo.name && (
                <div className="admin-file-note">
                  * Chỉ cần chọn file mới nếu muốn thay thế ảnh hiện tại
                </div>
              )}
            </div>
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label>Video (tùy chọn)</label>
            <div className="admin-file-upload">
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoChange}
                accept="video/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="admin-file-upload-btn"
                onClick={() => videoInputRef.current.click()}
              >
                <FaVideo /> Chọn file video
              </button>
              {videoInfo.name && (
                <div className="admin-file-info">
                  <FaVideo className="admin-file-icon" />
                  <div className="admin-file-details">
                    <div className="admin-file-name">{videoInfo.name}</div>
                    <div className="admin-file-meta">
                      {videoInfo.size > 0 && <span>{videoInfo.size} MB</span>}
                    </div>
                  </div>
                </div>
              )}
              {isEditMode && !formData.video && videoInfo.name && (
                <div className="admin-file-note">
                  * Chỉ cần chọn file mới nếu muốn thay thế video hiện tại
                </div>
              )}
            </div>
          </div>

          <div className="admin-form-group">
            <div className="admin-checkbox-group">
              <input
                type="checkbox"
                id="is_premium"
                name="is_premium"
                checked={formData.is_premium}
                onChange={handleChange}
              />
              <label htmlFor="is_premium">Bài hát premium</label>
            </div>
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-cancel-btn"
              onClick={handleCancel}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="admin-save-btn"
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SongForm;
