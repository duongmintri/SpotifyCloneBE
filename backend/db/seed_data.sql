-- seed_data.sql
INSERT INTO artists (name, bio, created_at) VALUES 
    ('Street Beats', 'An urban music artist', CURRENT_TIMESTAMP),
    ('Tokyo Dreams', 'A dreamy pop band', CURRENT_TIMESTAMP),
    ('Shocking Lemon', 'A rock band with a twist', CURRENT_TIMESTAMP),
    ('Beach Boys', 'Classic beach vibes', CURRENT_TIMESTAMP);

INSERT INTO albums (title, artist_id, cover_image, release_date, created_at) VALUES 
    ('Urban Jungle', 1, 'https://via.placeholder.com/150', '2020-01-01', CURRENT_TIMESTAMP),
    ('Neon Lights', 2, 'https://via.placeholder.com/150', '2021-06-15', CURRENT_TIMESTAMP),
    ('Inner Light', 3, 'https://via.placeholder.com/150', '2022-03-10', CURRENT_TIMESTAMP),
    ('Summer Daze', 4, 'https://via.placeholder.com/150', '2019-08-20', CURRENT_TIMESTAMP);

INSERT INTO songs (title, artist_id, album_id, duration, file_path, is_premium, created_at) VALUES 
    ('City Lights', 1, 1, 210, 'https://example.com/songs/city_lights.mp3', FALSE, CURRENT_TIMESTAMP),
    ('Dreamscape', 2, 2, 180, 'https://example.com/songs/dreamscape.mp3', FALSE, CURRENT_TIMESTAMP),
    ('Shocking Beat', 3, 3, 240, 'https://example.com/songs/shocking_beat.mp3', FALSE, CURRENT_TIMESTAMP),
    ('Beach Waves', 4, 4, 200, 'https://example.com/songs/beach_waves.mp3', FALSE, CURRENT_TIMESTAMP);