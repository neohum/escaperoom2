-- 방탕출 교육 플랫폼 데이터베이스 스키마
-- MySQL 8.0+

-- 1. Users 테이블
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  role ENUM('admin', 'creator', 'user') DEFAULT 'user',
  provider ENUM('google', 'kakao', 'naver', 'local') DEFAULT 'local',
  provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_provider (provider, provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Rooms 테이블
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  creator_id VARCHAR(36),
  creator_email VARCHAR(255),
  edit_token VARCHAR(255) UNIQUE COMMENT '비로그인 편집용 토큰',
  play_modes JSON DEFAULT ('["online"]'),
  play_time_min INT COMMENT '최소 플레이 시간 (분)',
  play_time_max INT COMMENT '최대 플레이 시간 (분)',
  difficulty TINYINT DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  category VARCHAR(50),
  target_grade VARCHAR(50),
  credits JSON COMMENT '{"story": "이름", "design": "이름", ...}',
  donation_info JSON COMMENT '{"enabled": true, "methods": [...]}',
  is_published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_creator (creator_id),
  INDEX idx_published (is_published),
  INDEX idx_category (category),
  INDEX idx_edit_token (edit_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Questions 테이블
CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(36) NOT NULL,
  type ENUM('multiple_choice', 'multiple_answer', 'true_false', 'short_answer', 'image_puzzle', 'drag_drop', 'sequence', 'hotspot', 'password', 'story_choice', 'mini_game') NOT NULL,
  order_index INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content JSON NOT NULL COMMENT '문제 내용 (유형별로 다름)',
  answer JSON NOT NULL COMMENT '정답',
  similarity_threshold DECIMAL(3,2) DEFAULT 0.60 COMMENT '주관식 유사도 임계값',
  youtube_id VARCHAR(50) COMMENT 'YouTube 비디오 ID',
  character_svg_url VARCHAR(500) COMMENT '캐릭터 SVG URL',
  hint TEXT,
  points INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_room_order (room_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Team Members 테이블
CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36),
  guest_token VARCHAR(255) COMMENT '비로그인 사용자 토큰',
  role ENUM('admin', 'creator', 'story', 'design', 'code', 'advisor', 'music', 'video', 'guest') NOT NULL,
  permissions JSON DEFAULT ('["view"]') COMMENT '권한 배열',
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_room (room_id),
  INDEX idx_user (user_id),
  INDEX idx_guest_token (guest_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Game Sessions 테이블
CREATE TABLE IF NOT EXISTS game_sessions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36),
  guest_token VARCHAR(255) COMMENT '비로그인 플레이어 토큰',
  play_mode ENUM('online', 'onsite', 'printout') DEFAULT 'online',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  total_score INT DEFAULT 0,
  total_time_seconds INT,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_room (room_id),
  INDEX idx_user (user_id),
  INDEX idx_guest_token (guest_token),
  INDEX idx_completed (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Game Progress 테이블
CREATE TABLE IF NOT EXISTS game_progress (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_id VARCHAR(36) NOT NULL,
  question_id VARCHAR(36) NOT NULL,
  user_answer JSON NOT NULL,
  is_correct TINYINT(1) DEFAULT 0,
  similarity_score DECIMAL(5,2) COMMENT '유사도 점수 (0-100)',
  attempts INT DEFAULT 1,
  time_spent_seconds INT,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_session (session_id),
  INDEX idx_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Access Logs 테이블 (IP 기반 접속 제한)
CREATE TABLE IF NOT EXISTS access_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(36) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_room_ip (room_id, ip_address),
  INDEX idx_accessed_at (accessed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Onsite Checkins 테이블 (현장 체크인)
CREATE TABLE IF NOT EXISTS onsite_checkins (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_id VARCHAR(36) NOT NULL,
  question_id VARCHAR(36) NOT NULL,
  checkin_type ENUM('qr', 'gps') NOT NULL,
  qr_code VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Badges 테이블
CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  condition_type ENUM('complete_room', 'perfect_score', 'speed_run', 'custom') NOT NULL,
  condition_value JSON COMMENT '조건 값',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_condition_type (condition_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. User Badges 테이블
CREATE TABLE IF NOT EXISTS user_badges (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  badge_id VARCHAR(36) NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_badge (user_id, badge_id),
  INDEX idx_user (user_id),
  INDEX idx_badge (badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Donations 테이블
CREATE TABLE IF NOT EXISTS donations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(36) NOT NULL,
  donor_name VARCHAR(100),
  donor_email VARCHAR(255),
  amount DECIMAL(10, 2),
  method ENUM('toss', 'kakaopay', 'bank') NOT NULL,
  message TEXT,
  donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_room (room_id),
  INDEX idx_donated_at (donated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

