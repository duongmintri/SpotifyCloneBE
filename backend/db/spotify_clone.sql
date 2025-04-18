-- DROP + CREATE DATABASE
DROP DATABASE IF EXISTS spotify_clone;
CREATE DATABASE spotify_clone
    WITH OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'C.UTF-8'
    LC_CTYPE = 'C.UTF-8'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Kết nối vào DB mới
\c spotify_clone;

-- Bảng artists
CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng albums
CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    artist_id INT REFERENCES artists(id) ON DELETE CASCADE,
    cover_image VARCHAR(255),
    release_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng songs
CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    artist_id INT REFERENCES artists(id) ON DELETE CASCADE,
    album_id INT REFERENCES albums(id) ON DELETE SET NULL,
    duration INT NOT NULL, -- Duration in seconds
    file_path VARCHAR(255) NOT NULL,
    cover_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng music_videos
CREATE TABLE music_videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    artist_id INT REFERENCES artists(id) ON DELETE CASCADE,
    album_id INT REFERENCES albums(id) ON DELETE SET NULL,
    duration INT NOT NULL, -- Duration in seconds
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_premium BOOLEAN DEFAULT FALSE
);

-- Bảng users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,  -- Thêm cột password cho mật khẩu mã hóa
    full_name VARCHAR(100),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    last_login TIMESTAMP,  -- Thêm cột last_login
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng playlists
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    cover_image VARCHAR(255),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng playlist_songs (bảng trung gian giữa playlists và songs)
CREATE TABLE playlist_songs (
    playlist_id INT REFERENCES playlists(id) ON DELETE CASCADE,
    song_id INT REFERENCES songs(id) ON DELETE CASCADE,
    PRIMARY KEY (playlist_id, song_id)
);

-- Bảng favorite_songs
CREATE TABLE favorite_songs (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    song_id INT REFERENCES songs(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, song_id)
);

-- Bảng friend_requests
CREATE TABLE friend_requests (
    id SERIAL PRIMARY KEY,
    from_user_id INT REFERENCES users(id) ON DELETE CASCADE,
    to_user_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_friend_request UNIQUE (from_user_id, to_user_id)
);

-- Bảng friend_activities
CREATE TABLE friend_activities (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    song_id INT REFERENCES songs(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- Ví dụ: "Listening to Inner Light"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chat_messages
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chèn dữ liệu mẫu
INSERT INTO artists (name, bio) VALUES 
    ('Street Beats', 'An urban music artist'),
    ('Tokyo Dreams', 'A dreamy pop band'),
    ('Shocking Lemon', 'A rock band with a twist'),
    ('Beach Boys', 'Classic beach vibes');

INSERT INTO albums (title, artist_id, cover_image, release_date) VALUES 
    ('Urban Jungle', 1, 'https://via.placeholder.com/150', '2020-01-01'),
    ('Neon Lights', 2, 'https://via.placeholder.com/150', '2021-06-15'),
    ('Inner Light', 3, 'https://via.placeholder.com/150', '2022-03-10'),
    ('Summer Daze', 4, 'https://via.placeholder.com/150', '2019-08-20');

INSERT INTO songs (title, artist_id, album_id, duration, file_path) VALUES 
    ('City Lights', 1, 1, 210, 'https://example.com/songs/city_lights.mp3'),
    ('Dreamscape', 2, 2, 180, 'https://example.com/songs/dreamscape.mp3'),
    ('Shocking Beat', 3, 3, 240, 'https://example.com/songs/shocking_beat.mp3'),
    ('Beach Waves', 4, 4, 200, 'https://example.com/songs/beach_waves.mp3');

INSERT INTO music_videos (title, artist_id, album_id, duration, file_path, is_premium) VALUES 
    ('City Lights MV', 1, 1, 210, 'https://example.com/videos/city_lights_mv.mp4', TRUE),
    ('Dreamscape MV', 2, 2, 180, 'https://example.com/videos/dreamscape_mv.mp4', FALSE);