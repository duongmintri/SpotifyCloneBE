CREATE DATABASE spotify_clone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE spotify_clone;

CREATE TABLE `roles` (
  `role_id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_name` VARCHAR(50) NOT NULL,
  `is_premium` BOOLEAN DEFAULT FALSE,
  `description` TEXT
);

CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(50),
  `last_name` VARCHAR(50),
  `date_of_birth` DATE,
  `profile_picture` VARCHAR(255),
  `role_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`)
);

CREATE TABLE `artists` (
  `artist_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `bio` TEXT,
  `profile_picture` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `albums` (
  `album_id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `artist_id` INT,
  `release_date` DATE,
  `cover_image` VARCHAR(255),
  `description` TEXT,
  FOREIGN KEY (`artist_id`) REFERENCES `artists`(`artist_id`)
);

CREATE TABLE `songs` (
  `song_id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `artist_id` INT,
  `album_id` INT,
  `duration` INT NOT NULL, -- in seconds
  `file_path` VARCHAR(255) NOT NULL,
  `release_date` DATE,
  `plays_count` INT DEFAULT 0,
  `is_premium` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`artist_id`) REFERENCES `artists`(`artist_id`),
  FOREIGN KEY (`album_id`) REFERENCES `albums`(`album_id`)
);

CREATE TABLE `videos` (
  `video_id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `artist_id` INT,
  `duration` INT NOT NULL, -- in seconds
  `file_path` VARCHAR(255) NOT NULL,
  `thumbnail_path` VARCHAR(255),
  `release_date` DATE,
  `views_count` INT DEFAULT 0,
  `is_premium` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`artist_id`) REFERENCES `artists`(`artist_id`)
);

CREATE TABLE `playlists` (
  `playlist_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_public` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`)
);

CREATE TABLE `playlist_songs` (
  `playlist_id` INT,
  `song_id` INT,
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `position` INT,
  PRIMARY KEY (`playlist_id`, `song_id`),
  FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`playlist_id`),
  FOREIGN KEY (`song_id`) REFERENCES `songs`(`song_id`)
);

CREATE TABLE `favorites` (
  `user_id` INT,
  `song_id` INT,
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `song_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`),
  FOREIGN KEY (`song_id`) REFERENCES `songs`(`song_id`)
);

CREATE TABLE `user_albums` (
  `user_album_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`)
);

CREATE TABLE `user_album_songs` (
  `user_album_id` INT,
  `song_id` INT,
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_album_id`, `song_id`),
  FOREIGN KEY (`user_album_id`) REFERENCES `user_albums`(`user_album_id`),
  FOREIGN KEY (`song_id`) REFERENCES `songs`(`song_id`)
);

CREATE TABLE `messages` (
  `message_id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender_id` INT,
  `receiver_id` INT,
  `content` TEXT NOT NULL,
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_read` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`user_id`),
  FOREIGN KEY (`receiver_id`) REFERENCES `users`(`user_id`)
);