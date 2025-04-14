import React, { useState } from 'react';
import { FaTimes, FaPlay, FaEllipsisH } from 'react-icons/fa';
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

// SortableTrack component for individual draggable tracks
const SortableTrack = ({ track, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`playlist-track ${track.current ? 'current-track' : ''}`}
    >
      <div className="track-number">{index + 1}</div>
      <div className="track-info">
        <div className="track-title">{track.title}</div>
        <div className="track-artist">{track.artist}</div>
      </div>
      <div className="track-duration">{track.duration}</div>
      <div className="track-actions">
        <button className="track-action-btn">
          <FaEllipsisH />
        </button>
      </div>
    </div>
  );
};

const PlaylistPopup = ({ isOpen, onClose }) => {
  // State to manage playlist
  const [playlist, setPlaylist] = useState([
    { id: 1, title: 'Inner Light', artist: 'Shocking Lemon', duration: '3:45', current: true },
    { id: 2, title: 'Blue Bird', artist: 'Ikimono Gakari', duration: '3:38', current: false },
    { id: 3, title: 'Sign', artist: 'FLOW', duration: '4:01', current: false },
    { id: 4, title: 'Silhouette', artist: 'KANA-BOON', duration: '4:23', current: false },
    { id: 5, title: 'Haruka Kanata', artist: 'ASIAN KUNG-FU GENERATION', duration: '3:40', current: false },
    { id: 6, title: 'GO!!!', artist: 'FLOW', duration: '4:05', current: false },
    { id: 7, title: 'Diver', artist: 'NICO Touches the Walls', duration: '3:51', current: false },
  ]);

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
      setPlaylist((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (!isOpen) return null;

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
            <img src="/src/assets/images/cover-images/3.jpg" alt="Playlist Cover" />
            <div className="playlist-play-btn">
              <FaPlay />
            </div>
          </div>
          <div className="playlist-details">
            <h3 className="playlist-title">Anime Hits</h3>
            <p className="playlist-subtitle">7 bài hát • 27 phút</p>
          </div>
        </div>
        <div className="playlist-tracks">
          <div className="playlist-table-header">
            <div className="track-number">#</div>
            <div className="track-info">Tiêu đề</div>
            <div className="track-duration">Thời lượng</div>
            <div className="track-actions"></div>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]} // Add this to lock to vertical
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
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPopup;