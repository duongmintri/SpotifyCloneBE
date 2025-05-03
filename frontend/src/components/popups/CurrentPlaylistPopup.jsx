import React from 'react';
import { FaTimes, FaPlay, FaPause, FaEllipsisH, FaTrash } from 'react-icons/fa';
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
import './CurrentPlaylistPopup.css';

// SortableTrack component for individual draggable tracks
const SortableTrack = ({ track, index, isCurrentSong, isPlaying, onPlaySong, onRemoveTrack }) => {
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
    zIndex: isDragging ? 1000 : 1,
  };

  // Format thời gian từ giây sang mm:ss
  const formatTime = (timeInSeconds) => {
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
      className={`current-playlist-track ${isCurrentSong ? 'current-track' : ''}`}
    >
      <div className="track-number">
        {isCurrentSong ? (
          <button
            className="track-play-btn"
            onClick={(e) => {
              e.stopPropagation();
              onPlaySong(track, index);
            }}
          >
            {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
          </button>
        ) : (
          index + 1
        )}
      </div>
      <div 
        className="track-info" 
        onClick={() => {
          // Nếu là bài hát đang phát, chỉ toggle play/pause
          // Nếu không, phát bài hát mới
          if (isCurrentSong) {
            onPlaySong(track, index, true); // Thêm tham số để chỉ định toggle
          } else {
            onPlaySong(track, index);
          }
        }}
      >
        <div className="track-title">{track.title}</div>
        <div className="track-artist">
          {typeof track.artist === 'object' ? track.artist.name : track.artist}
        </div>
      </div>
      <div className="track-duration">{formatTime(track.duration || 0)}</div>
      <div className="track-actions">
        <button 
          className="track-action-btn track-remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveTrack(track.id);
          }}
          title="Xóa khỏi danh sách phát"
        >
          <FaTrash size={12} />
        </button>
        <button 
          className="track-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            // Thêm xử lý menu (nếu cần)
          }}
        >
          <FaEllipsisH size={14} />
        </button>
      </div>
    </div>
  );
};

const CurrentPlaylistPopup = ({ 
  isOpen, 
  onClose, 
  playlist = [], 
  currentSong, 
  isPlaying,
  onPlaySong,
  onReorderPlaylist,
  onRemoveTrack
}) => {
  // Sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Khoảng cách tối thiểu để bắt đầu kéo
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end to reorder playlist
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = playlist.findIndex(item => item.id === active.id);
      const newIndex = playlist.findIndex(item => item.id === over.id);
      
      if (onReorderPlaylist) {
        const newPlaylist = arrayMove(playlist, oldIndex, newIndex);
        onReorderPlaylist(newPlaylist, oldIndex, newIndex);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="current-playlist-overlay">
      <div className="current-playlist-container">
        <div className="current-playlist-header">
          <h2>Danh sách phát hiện tại</h2>
          <button className="current-playlist-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="current-playlist-content">
          <div className="current-playlist-info">
            <div className="playlist-cover">
              <img 
                src={currentSong?.cover_image || '/src/assets/images/default-playlist.png'} 
                alt="Playlist cover" 
              />
              <button 
                className="playlist-play-btn"
                onClick={() => {
                  if (playlist.length > 0 && onPlaySong) {
                    onPlaySong(playlist[0], 0);
                  }
                }}
              >
                {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
              </button>
            </div>
            
            <div className="playlist-details">
              <h3 className="playlist-title">Danh sách phát</h3>
              <p className="playlist-subtitle">
                {playlist.length} bài hát
              </p>
            </div>
          </div>
          
          <div className="current-playlist-tracks">
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
                  items={playlist.map(track => track.id)}
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
                        onRemoveTrack={onRemoveTrack}
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
    </div>
  );
};

export default CurrentPlaylistPopup;
