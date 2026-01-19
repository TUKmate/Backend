-- TUKmate 데이터베이스 초기화 스크립트
-- 사용법: mysql -u root -p < init.sql

-- 데이터베이스 생성
CREATE DATABASE tukmate;
USE tukmate;

-- 파일 테이블 (users보다 먼저 생성)
CREATE TABLE IF NOT EXISTS files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  user_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- 사용자 테이블
CREATE TABLE users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 username VARCHAR(255) UNIQUE NOT NULL,
 password VARCHAR(255) NOT NULL,
 nickname VARCHAR(50) UNIQUE NOT NULL,
 major VARCHAR(100),
 year INT,
 dorm_type ENUM('TIP', 'DORM2'),
 sex ENUM('M', 'F'),
 age INT;
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 profile_image_id INT DEFAULT NULL,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (profile_image_id) REFERENCES files(id) ON DELETE SET NULL
);

-- 게시글 테이블
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  dorm_type ENUM('TIP', 'DORM2') NOT NULL,
  title VARCHAR(50) NOT NULL,
  content VARCHAR(500) NOT NULL,
  image_id INT DEFAULT NULL,

  mbti_ie ENUM('I', 'E'),
  mbti_ns ENUM('N', 'S'),
  mbti_ft ENUM('F', 'T'),
  mbti_jp ENUM('J', 'P'),

  birth_year INT,
  enrollment_year INT,

  sleep_start TIME,
  sleep_end TIME,

  smoking ENUM('X', 'O', 'lot'),
  bug ENUM('O', 'try', 'X'),
  shower_style ENUM('morning', 'random', 'night'),
  shower_duration INT,

  sleep_sensitivity ENUM('low', 'mid', 'high'),
  home_visit_cycle ENUM('often', 'sometimes', 'X'),
  sleep_habits SET('teeth_grinding', 'snoring', 'sleep_talking'),

  game ENUM('everyday', 'sometimes', 'never'),
  cleanliness ENUM('often', 'sometimes', 'rare'),
  discord ENUM('everyday', 'sometimes', 'never'),
  invite_friends ENUM('often', 'sometimes', 'never'),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id) REFERENCES files(id) ON DELETE SET NULL,
  ON DELETE CASCADE
);

-- 북마크 테이블
CREATE TABLE likes (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT NOT NULL,
 post_id INT NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY (user_id, post_id),
 FOREIGN KEY (user_id) REFERENCES users(id),
 FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- files.user_id에 FK 추가
ALTER TABLE files ADD CONSTRAINT fk_files_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
