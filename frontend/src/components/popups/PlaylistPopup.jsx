import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlay, FaEllipsisH, FaPause } from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import usePlayerStore from '../../store/playerStore';
import ImageLoader from '../player/ImageLoader';

// SortableTrack component for individual draggable tracks
const SortableTrack = ({ track, index, isCurrentSong, isPlaying, onPlaySong }) => {
  // Kiểm tra xem track có hợp lệ không
  if (!track || typeof track !== 'object') {
    console.warn("SortableTrack: track không hợp lệ", track);
    return null;
  }

  // Lấy các thuộc tính cần thiết một cách an toàn
  const id = track.id || Math.random().toString();
  const title = track.title || "Bài hát không tên";

  // Đảm bảo artist luôn là một chuỗi
  let artist = "Nghệ sĩ không xác định";
  if (track.artist) {
    if (typeof track.artist === 'string') {
      artist = track.artist;
    } else if (typeof track.artist === 'object') {
      // Nếu artist là một đối tượng, thử lấy thuộc tính name hoặc id
      artist = track.artist.name || track.artist.id || JSON.stringify(track.artist);
    }
  }

  const duration = track.duration || 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  // Format thời gian từ giây sang mm:ss
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`playlist-track ${isCurrentSong ? 'current-track' : ''}`}
    >
      <div className="track-number">
        {isCurrentSong ? (
          <button
            className="track-play-btn"
            onClick={() => onPlaySong(track)}
            title={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
        ) : (
          index + 1
        )}
      </div>
      <div className="track-info" onClick={() => onPlaySong(track)}>
        <div className="track-title">{title}</div>
        <div className="track-artist">{artist}</div>
      </div>
      <div className="track-duration">{formatTime(duration)}</div>
      <div className="track-actions">
        <button className="track-action-btn">
          <FaEllipsisH />
        </button>
      </div>
    </div>
  );
};

const PlaylistPopup = ({ isOpen, onClose, playlist = [], currentSong = null, onPlaySong }) => {
  // Lấy state từ playerStore
  const { isPlaying, queue, reorderQueue } = usePlayerStore();

  // Sensors for drag-and-drop (mouse and keyboard support)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end to reorder playlist
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = playlist.findIndex((item) => item.id === active.id);
      const newIndex = playlist.findIndex((item) => item.id === over.id);

      // Cập nhật thứ tự trong store
      reorderQueue(oldIndex, newIndex);
    }
  };

  if (!isOpen) return null;

  // Tính tổng thời lượng của playlist
  const totalDuration = playlist.reduce((total, track) => total + (track.duration || 0), 0);

  // Format tổng thời lượng
  const formatTotalDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} phút`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} giờ ${remainingMinutes} phút`;
    }
  };

  return (
    <div className="playlist-popup-container">
      <div className="playlist-popup-header">
        <h2>Danh sách phát hiện tại</h2>
        <button
          className="playlist-popup-close-btn"
          onClick={onClose}
          aria-label="Đóng"
        >
          <FaTimes />
        </button>
      </div>
      <div className="playlist-popup-content">
        <div className="playlist-info">
          <div className="playlist-cover">
            <ImageLoader
              songId={currentSong?.id}
              coverImage={currentSong?.cover_image}
              fallbackSrc="/src/assets/images/cover-images/3.jpg"
              alt="Playlist Cover"
            />
            <button
              className="playlist-play-btn"
              onClick={() => {
                if (playlist.length > 0) {
                  const { togglePlay, isPlaying } = usePlayerStore.getState();
                  togglePlay();
                }
              }}
              disabled={playlist.length === 0}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
          </div>
          <div className="playlist-details">
            <h3 className="playlist-title">Danh sách phát</h3>
            <p className="playlist-subtitle">
              {playlist.length} bài hát • {formatTotalDuration(totalDuration)}
            </p>
          </div>
        </div>
        <div className="playlist-tracks">
          <div className="playlist-table-header">
            <div className="track-number">#</div>
            <div className="track-info">Tiêu đề</div>
            <div className="track-duration">Thời lượng</div>
            <div className="track-actions"></div>
          </div>
          {playlist.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={playlist.map((track) => track.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="playlist-tracks-list">
                  {playlist.map((track, index) => (
                    <SortableTrack
                      key={track.id}
                      track={track}
                      index={index}
                      isCurrentSong={currentSong && currentSong.id === track.id}
                      isPlaying={isPlaying && currentSong && currentSong.id === track.id}
                      onPlaySong={onPlaySong}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="empty-playlist">
              <p>Danh sách phát trống</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistPopup;