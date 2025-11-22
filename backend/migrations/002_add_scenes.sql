-- 화면(Scene) 기능 추가
-- 각 게임에 여러 화면을 추가하고 이미지와 텍스트를 포함할 수 있음

-- Scenes 테이블
CREATE TABLE IF NOT EXISTS scenes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(36) NOT NULL,
  order_index INT NOT NULL COMMENT '화면 순서',
  title VARCHAR(255) NOT NULL COMMENT '화면 제목',
  description TEXT COMMENT '화면 설명',
  background_image VARCHAR(500) COMMENT '배경 이미지 URL',
  background_color VARCHAR(20) DEFAULT '#ffffff' COMMENT '배경 색상',
  content JSON COMMENT '화면 콘텐츠 (텍스트, 이미지 등)',
  layout_type ENUM('full_image', 'text_only', 'image_text', 'split', 'custom') DEFAULT 'image_text',
  transition_type ENUM('none', 'fade', 'slide', 'zoom') DEFAULT 'fade',
  auto_advance TINYINT(1) DEFAULT 0 COMMENT '자동으로 다음 화면으로 이동',
  auto_advance_delay INT DEFAULT 0 COMMENT '자동 이동 대기 시간 (초)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_room_order (room_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scene Elements 테이블 (화면 내 개별 요소들)
CREATE TABLE IF NOT EXISTS scene_elements (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  scene_id VARCHAR(36) NOT NULL,
  element_type ENUM('text', 'image', 'video', 'button', 'input') NOT NULL,
  order_index INT NOT NULL COMMENT '요소 순서',
  content TEXT COMMENT '요소 내용',
  style JSON COMMENT '스타일 정보 (위치, 크기, 색상 등)',
  action JSON COMMENT '액션 정보 (클릭 시 동작 등)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
  INDEX idx_scene_order (scene_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Questions 테이블에 scene_id 컬럼 추가 (문제가 특정 화면에 연결될 수 있도록)
ALTER TABLE questions ADD COLUMN scene_id VARCHAR(36) COMMENT '연결된 화면 ID';
ALTER TABLE questions ADD FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE SET NULL;
ALTER TABLE questions ADD INDEX idx_scene (scene_id);
