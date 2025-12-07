# 방탕출 교육 플랫폼 기획서

## 📋 프로젝트 개요

### 프로젝트 명
**방탕출 교육 플랫폼 (Escape Room Education Platform)**

### 목적
교육용 방탕출 컨텐츠을 제작하고 배포할 수 있는 웹 기반 플랫폼 구축
- 관리자: 전체 관리자 권한, 로그인 필요, 사용 현황 및 접속자 수 등 확인 가능
- 컨텐츠 제작자 : 여러 명이 동시에 협업하여 컨텐츠 제작, 로그인 필요, 최초로 컨텐츠을 생성한 사람이 다른 사람이 컨텐츠을 편집할 수 있도록 권한을 줄 수 있음. 꼭 가입하지 않아도 가능해야 함.
- 사용자: 온라인/오프라인 환경에서 컨텐츠 플레이, 뱃지 등 기록을 남기려면 로그인 필요

### 핵심 가치
- 🎓 **교육적 가치**: 역사, 과학, 수학 등 다양한 주제의 학습 콘텐츠
- 🤝 **협업 중심**: 스토리 작가, 디자이너, 개발자 등 역할별 협업
- 🌐 **접근성**: 온라인, 현장, 출력물 등 다양한 플레이 모드
- 💾 **오프라인 지원**: 인터넷 없이도 컨텐츠 플레이 가능

---

## 🎯 참고 사례 분석

### 1. 산으로 간 물고기 (죽봉 김태원 방탕출)
- **플랫폼**: 웹 기반
- **주제**: 어등산 의병장 역사
- **특징**:
  - 플레이타임: 1-2차시 (40-80분)
  - 난이도: 3/5
  - 개인/협동 플레이 가능
  - 교사용 안내 페이지 제공
  - 여러 백업 링크 제공

### 2. 동쪽에서 온 손님 (독도 방탕출)
- **플랫폼**: Google Sites
- **주제**: 독도 역사 교육
- **특징**:
  - 공동 주최/주관 체계 (동북아역사재단 × 인천교육청)
  - 다양한 역할 분담 (스토리, 삽화, 영상, 코딩, 역사자문)
  - 멀티미디어 활용 (댄스, 음악, 영상)

### 3. 기념관의 비밀과 신비한 조각 (김대중 노벨평화상)
- **플랫폼**: 웹 기반
- **주제**: 노벨평화상 교육
- **특징**:
  - **하이브리드 모드**: 현장 + 교실
  - 현장: 김대중 노벨평화상 기념관
  - 교실: 출력물 활용
  - IP 제한 관리 (과도한 접속 방지)
  - 교사용 안내 + 출력물 제공

### 4. 세 가지 꽃말 (학생독립운동)
- **플랫폼**: 웹 기반
- **주제**: 학생독립운동
- **특징**:
  - 스마트 기기 활용
  - 나주미래교육지원센터 제작
  - 간결한 팀 구성

---

## 🎨 핵심 기능

### 관리자 기능

#### 1. 실시간 협업 편집
- 여러 컨텐츠 제작자 또는 편집 권한 링크를 받은 사람이 동시에 같은 컨텐츠 편집
- 실시간 변경 사항 동기화
- 변경 이력 추적 및 버전 관리

#### 2. 멀티미디어 콘텐츠 관리
- 이미지 업로드 및 편집, 이미지는 svg로 변환하여 저장
- 오디오/비디오 삽입, youtube를 이용하여 삽입
- 배경 음악 설정
- 캐릭터 및 배경 이미지 관리, 캐릭터는 svg로 변환하여 저장

#### 3. 문제 유형별 에디터
- 객관식 (Multiple Choice)
- 주관식 (Short Answer), 입력한 텍스트를 기반으로 유사도를 계산하여 몇 프로 형식으로 표현하여 60프로 이상이면 정답으로 인정
- 이미지 퍼즐 (Image Puzzle)
- 드래그 앤 드롭 (Drag & Drop)
- 순서 맞추기 (Sequence)
- 이미지 영역 클릭 (Hotspot)
- 비밀번호 입력 (Password)
- 스토리 선택지 (Story Choice)
- 미니컨텐츠 (Mini Game)

#### 4. 플레이 모드 설정
- 온라인 전용 모드
- 현장 연계 모드 (QR 코드, GPS)
- 출력물 혼합 모드

#### 5. 출력물 자동 생성
- 학습지 PDF 자동 생성
- 정답지 PDF 생성
- 교사용 가이드 생성

#### 6. 크레딧 관리
- 팀원 역할별 자동 크레딧 생성
- 저작권 정보 관리
- 라이선스 설정
- 후원 관리

### 사용자 기능

#### 1. 비로그인 플레이
- 회원가입 없이 즉시 컨텐츠 시작
- 로컬 저장소에 진행 상황 저장

#### 2. 선택적 로그인
- 로그인 시 뱃지 획득
- 컨텐츠 기록 저장
- 여러 기기에서 진행 상황 동기화

#### 3. 오프라인 모드
- PWA (Progressive Web App) 기술 활용
- 컨텐츠 데이터 사전 캐싱
- 인터넷 없이 플레이 가능
- 온라인 복귀 시 자동 동기화

#### 4. 3가지 플레이 모드

##### 온라인 모드
- 풍부한 멀티미디어 경험
- 자동 진행 상황 저장
- 힌트 시스템
- 실시간 피드백

##### 현장 연계 모드
- QR 코드 스캔으로 체크인
- GPS 위치 확인
- 실제 장소 탐험
- 몰입형 경험

##### 출력물 모드
- 인쇄물 활용
- 인터넷 불필요
- 협동 학습 가능
- 교사용 가이드 포함

---

## 🏗️ 시스템 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    플레이 모드 (3가지)                         │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐        ┌──────────┐        ┌──────────┐
   │ 온라인   │        │ 현장연계 │        │ 출력물   │
   │ 전용     │        │ 하이브리드│        │ 혼합     │
   └──────────┘        └──────────┘        └──────────┘
         │                    │                    │
         └────────────────────┴────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js PWA Application                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  컨텐츠 모드 선택 레이어                               │     │
│  │  - 온라인 모드: 전체 인터랙티브                      │     │
│  │  - 현장 모드: GPS/QR 코드 연동                       │     │
│  │  - 출력물 모드: 정답 입력 중심                       │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  멀티미디어 엔진                                     │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐       │     │
│  │  │ 스토리   │ │ 이미지   │ │ 오디오/비디오 │       │     │
│  │  │ 렌더러   │ │ 갤러리   │ │ 플레이어      │       │     │
│  │  └──────────┘ └──────────┘ └──────────────┘       │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  오프라인 + 동기화                                   │     │
│  │  - 컨텐츠 데이터 캐싱 (IndexedDB)                      │     │
│  │  - 진행 상황 로컬 저장                               │     │
│  │  - IP 기반 접속 제한 관리                            │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              관리자 협업 CMS (역할 기반)                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │  역할별 편집 권한                                    │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐       │     │
│  │  │ 스토리   │ │ 디자인   │ │ 역사자문      │       │     │
│  │  │ 작가     │ │ 팀       │ │ 검수          │       │     │
│  │  └──────────┘ └──────────┘ └──────────────┘       │     │
│  │  - 실시간 협업 (Supabase Realtime)                  │     │
│  │  - 버전 관리 및 승인 워크플로우                      │     │
│  │  - 크레딧 자동 생성                                  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                         │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐      │
│  │ PostgreSQL   │ │ Storage      │ │ Edge Functions │      │
│  │ - Rooms      │ │ - Images     │ │ - IP 제한      │      │
│  │ - Questions  │ │ - Audio      │ │ - PDF 생성     │      │
│  │ - Credits    │ │ - Videos     │ │ - QR 생성      │      │
│  │ - Printouts  │ │ - Printouts  │ │                │      │
│  └──────────────┘ └──────────────┘ └────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 기술 스택

#### 프론트엔드
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Offline Support**: Workbox (PWA)
- **Real-time**: Supabase Realtime
- **Image Upload**: react-dropzone
- **QR Code**: html5-qrcode
- **PDF Generation**: pdfkit

#### 백엔드
- **Runtime**: Node.js 20
- **Framework**: Next.js API Routes (서버리스)
- **Database**: mysql
- **Real-time**: redis
- **Storage**: hosting storage folder
- **Authentication**: social login, id pw login
- **Edge Functions**: 

#### 인프라
- **Hosting**: verpex shared hosting
- **Database**: verpex mysql
- **CDN**: no
- **Domain**: verpex

---

## 💾 데이터베이스 설계

### 주요 테이블

#### 1. rooms (컨텐츠 룸)
```sql
CREATE TABLE rooms (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  thumbnail_url TEXT,

  -- 제작자 정보
  creator_id VARCHAR(36),
  creator_email VARCHAR(255),
  edit_token VARCHAR(255) UNIQUE COMMENT '비로그인 편집용 토큰',

  -- 플레이 모드 (JSON 배열로 저장)
  play_modes JSON DEFAULT ('["online"]'),

  -- 현장 연계 정보 (JSON)
  onsite_location JSON,

  -- 메타데이터
  play_time_min INT,
  play_time_max INT,
  difficulty TINYINT CHECK (difficulty BETWEEN 1 AND 5),
  target_grades JSON COMMENT 'JSON 배열',
  category VARCHAR(100),

  -- 교육용
  educational_goals JSON COMMENT 'JSON 배열',
  teacher_guide_url TEXT,
  printout_urls JSON,

  -- 크레딧 (JSON)
  credits JSON COMMENT '{"story": "이름", "design": "이름", ...}',

  -- 후원 정보
  donation_info JSON COMMENT '{"enabled": true, "methods": [...]}',

  -- 저작권
  copyright_owner VARCHAR(255),
  copyright_license VARCHAR(100) DEFAULT 'CC BY-NC-ND',

  -- 접속 제한
  ip_limit_enabled TINYINT(1) DEFAULT 0,
  max_concurrent_users INT DEFAULT 5,

  is_published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_creator (creator_id),
  INDEX idx_edit_token (edit_token),
  INDEX idx_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2. questions (문제)
```sql
CREATE TABLE questions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT 'multiple-choice, short-answer, image-puzzle 등',

  -- 스토리 요소
  story_text TEXT,
  character_name VARCHAR(100),
  character_svg_url TEXT COMMENT 'SVG 형식 캐릭터 이미지',
  background_image_url TEXT,
  background_music_url TEXT,
  video_url TEXT COMMENT 'YouTube URL 또는 직접 업로드',
  youtube_id VARCHAR(50) COMMENT 'YouTube 비디오 ID',

  -- 문제 내용
  title VARCHAR(255) NOT NULL,
  content JSON NOT NULL COMMENT '문제 유형별 데이터',
  hint JSON COMMENT '힌트 배열',

  -- 정답 및 피드백
  answer JSON NOT NULL COMMENT '정답 데이터',
  similarity_threshold DECIMAL(3,2) DEFAULT 0.60 COMMENT '주관식 유사도 임계값 (60%)',
  correct_feedback TEXT,
  wrong_feedback TEXT,

  -- 플로우
  next_question_id VARCHAR(36),
  conditional_next JSON COMMENT '조건부 다음 문제',

  -- 현장 연계
  onsite_data JSON COMMENT 'QR 코드, GPS 정보',

  -- 출력물 연계
  printout_page_number INT,

  -- 위치
  position JSON COMMENT '화면상 위치 정보',

  -- 점수 및 시간
  points INT DEFAULT 0,
  time_limit INT COMMENT '제한 시간 (초)',

  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (next_question_id) REFERENCES questions(id) ON DELETE SET NULL,
  UNIQUE KEY unique_room_order (room_id, order_index),
  INDEX idx_room (room_id),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3. users (사용자)
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) COMMENT '소셜 로그인 시 NULL',
  name VARCHAR(100),

  -- 소셜 로그인
  provider VARCHAR(50) COMMENT 'google, kakao, naver 등',
  provider_id VARCHAR(255),

  -- 프로필
  avatar_url TEXT,
  bio TEXT,

  -- 역할
  is_admin TINYINT(1) DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,

  UNIQUE KEY unique_provider (provider, provider_id),
  INDEX idx_email (email),
  INDEX idx_admin (is_admin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 4. team_members (팀원 관리)
```sql
CREATE TABLE team_members (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) COMMENT '로그인 사용자의 경우',
  guest_token VARCHAR(255) COMMENT '비로그인 사용자의 경우',
  role VARCHAR(50) NOT NULL COMMENT 'story, design, code, music, video, advisor 등',
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  permissions JSON COMMENT '{"can_edit": true, "can_approve": false, ...}',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_room_user_role (room_id, user_id, role),
  INDEX idx_room (room_id),
  INDEX idx_user (user_id),
  INDEX idx_guest_token (guest_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 5. game_sessions (컨텐츠 세션)
```sql
CREATE TABLE game_sessions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) COMMENT '로그인 사용자만',
  device_id VARCHAR(255) COMMENT '비로그인 사용자 식별',

  play_mode VARCHAR(20) COMMENT 'online, onsite, printout',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  score INT DEFAULT 0,
  time_spent INT DEFAULT 0 COMMENT '초 단위',

  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_room (room_id),
  INDEX idx_user (user_id),
  INDEX idx_device (device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 6. game_progress (진행 상황)
```sql
CREATE TABLE game_progress (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_id VARCHAR(36) NOT NULL,
  question_id VARCHAR(36) NOT NULL,

  user_answer JSON COMMENT '사용자 답변',
  similarity_score DECIMAL(5,2) COMMENT '주관식 유사도 점수',
  is_correct TINYINT(1),
  attempts INT DEFAULT 1,
  hints_used INT DEFAULT 0,

  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  time_spent INT DEFAULT 0 COMMENT '초 단위',
  points_earned INT DEFAULT 0,

  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_session (session_id),
  INDEX idx_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 7. access_logs (접속 로그)
```sql
CREATE TABLE access_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(36) NOT NULL,
  ip_address VARCHAR(45) NOT NULL COMMENT 'IPv4 또는 IPv6',
  user_agent TEXT,
  session_id VARCHAR(36),

  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_ip_room (ip_address, room_id, accessed_at),
  INDEX idx_room_time (room_id, accessed_at)
);
```

#### 8. onsite_checkins (현장 체크인)
```sql
CREATE TABLE onsite_checkins (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(36) NOT NULL,

  location_name VARCHAR(255),
  qr_code VARCHAR(255),
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),

  checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  INDEX idx_session (session_id),
  INDEX idx_qr (qr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 9. badges (뱃지)
```sql
CREATE TABLE badges (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  condition_type VARCHAR(50) COMMENT 'game_completed, no_hints, time_limit 등',
  condition_value JSON COMMENT '조건 상세 정보',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_type (condition_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 10. user_badges (사용자 뱃지)
```sql
CREATE TABLE user_badges (
  user_id VARCHAR(36) NOT NULL,
  badge_id VARCHAR(36) NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_earned (earned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 11. donations (후원 정보)
```sql
CREATE TABLE donations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id VARCHAR(36) NOT NULL,
  donor_name VARCHAR(100),
  donor_email VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KRW',
  payment_method VARCHAR(50) COMMENT 'toss, kakaopay, paypal 등',
  transaction_id VARCHAR(255),
  message TEXT,
  is_anonymous TINYINT(1) DEFAULT 0,

  donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_room (room_id),
  INDEX idx_date (donated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 💰 비용 산정 (월 10만원 이내)

### 예상 월 비용

| 항목 | 서비스 | 플랜 | 월 비용 |
|------|--------|------|---------|
| 호스팅 + 도메인 | Verpex Shared Hosting | Start | $0.99/월 (₩1,300) |
| 데이터베이스 | Verpex MySQL | 포함 | 포함 |
| 스토리지 | Verpex Storage | 100GB 포함 | 포함 |
| Redis | Upstash | Free | 무료 (10,000 commands/day) |
| 이미지 최적화 | Sharp (자체) | - | 무료 |
| **합계** | | | **₩1,300** ✅ |

### Verpex Shared Hosting 상세

**Start Plan ($0.99/월 - 첫 달)**
- 100GB SSD 스토리지
- 무제한 대역폭
- MySQL 데이터베이스 무제한
- 무료 SSL 인증서
- cPanel 제공
- Node.js 지원
- 일일 백업

**갱신 후 ($2.99/월)**
- 여전히 월 10만원 이내 (₩3,900)

### Redis 캐싱 (Upstash Free Tier)

**무료 플랜**
- 10,000 commands/day
- 256MB 메모리
- 실시간 협업 세션 관리
- IP 접속 제한 캐싱
- 컨텐츠 진행 상황 임시 저장

**확장 시 ($10/월)**
- 100,000 commands/day
- 1GB 메모리

### 비용 최적화 전략

1. **Verpex Shared Hosting**
   - Node.js 앱 직접 배포
   - MySQL 데이터베이스 포함
   - 파일 스토리지 포함
   - 무료 SSL/도메인

2. **이미지 최적화**
   - SVG 형식 사용 (용량 최소화)
   - Sharp 라이브러리로 서버 측 최적화
   - WebP 자동 변환
   - Lazy loading

3. **Redis 캐싱**
   - 실시간 협업 세션 관리
   - IP 접속 제한 캐싱
   - 데이터베이스 쿼리 결과 캐싱
   - 컨텐츠 진행 상황 임시 저장

4. **PWA 오프라인 캐싱**
   - Service Worker로 정적 파일 캐싱
   - IndexedDB로 컨텐츠 데이터 로컬 저장
   - 대역폭 사용량 최소화

### 확장 가능성

**사용자 증가 시**
- Verpex Business Plan ($5.99/월 → ₩7,800)
  - 무제한 스토리지
  - 더 많은 CPU/메모리
  - 우선 지원

**Redis 확장 시**
- Upstash Pay-as-you-go ($10/월 → ₩13,000)
  - 100,000 commands/day
  - 1GB 메모리

**총 확장 비용**: 약 ₩20,800/월 (여전히 10만원 이내)

---

## 📱 프로젝트 구조

```
escaperoom/
├── app/
│   ├── (admin)/                    # 관리자 영역
│   │   ├── dashboard/              # 대시보드
│   │   ├── rooms/                  # 룸 관리
│   │   │   ├── [id]/
│   │   │   │   ├── edit/           # 편집
│   │   │   │   ├── team/           # 팀 관리
│   │   │   │   ├── printouts/      # 출력물
│   │   │   │   └── analytics/      # 통계
│   │   │   └── new/                # 새 룸 생성
│   │   └── layout.tsx
│   ├── (game)/                     # 컨텐츠 영역
│   │   ├── play/[roomId]/
│   │   │   ├── online/             # 온라인 모드
│   │   │   ├── onsite/             # 현장 모드
│   │   │   └── printout/           # 출력물 모드
│   │   └── layout.tsx
│   ├── api/                        # API 라우트
│   │   ├── rooms/
│   │   │   ├── [id]/
│   │   │   │   ├── check-access/   # IP 제한
│   │   │   │   ├── generate-printout/ # PDF 생성
│   │   │   │   └── qr-codes/       # QR 생성
│   │   ├── sync/                   # 오프라인 동기화
│   │   └── webhooks/
│   └── layout.tsx
├── components/
│   ├── admin/                      # 관리자 컴포넌트
│   │   ├── RoleBasedEditor.tsx
│   │   ├── TeamManager.tsx
│   │   ├── QuestionEditor.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── ApprovalWorkflow.tsx
│   │   └── CreditGenerator.tsx
│   ├── game/                       # 컨텐츠 컴포넌트
│   │   ├── PlayModeSelector.tsx
│   │   ├── QRCodeScanner.tsx
│   │   ├── StoryRenderer.tsx
│   │   ├── QuestionRenderer.tsx
│   │   ├── MultimediaPlayer.tsx
│   │   ├── ProgressTracker.tsx
│   │   └── PrintoutViewer.tsx
│   └── ui/                         # UI 컴포넌트 (shadcn/ui)
├── lib/
│   ├── db/
│   │   ├── mysql.ts                # MySQL 연결
│   │   └── redis.ts                # Redis 연결
│   ├── auth/
│   │   ├── social.ts               # 소셜 로그인
│   │   └── session.ts              # 세션 관리
│   ├── offline/
│   │   ├── db.ts                   # IndexedDB wrapper
│   │   └── sync.ts                 # 동기화 로직
│   ├── pdf/                        # PDF 생성
│   ├── qr/                         # QR 코드 생성
│   ├── svg/                        # SVG 변환
│   ├── similarity/                 # 텍스트 유사도 계산
│   └── types/                      # TypeScript 타입
├── public/
│   ├── manifest.json               # PWA manifest
│   ├── sw.js                       # Service Worker
│   └── icons/
├── docs/                           # 문서
│   ├── project-proposal.md         # 기획서
│   ├── api-reference.md            # API 문서
│   └── user-guide.md               # 사용자 가이드
└── package.json
```

---

## 🚀 개발 로드맵 (6주)

### Week 1-2: 기반 구축
- [ ] Next.js + TypeScript + Tailwind 프로젝트 초기화
- [ ] Verpex 호스팅 설정 및 Node.js 환경 구성
- [ ] MySQL 데이터베이스 스키마 생성
- [ ] Redis (Upstash) 연동
- [ ] 소셜 로그인 구현 (Google, Kakao, Naver)
- [ ] 일반 로그인 (ID/PW) 구현
- [ ] 비로그인 편집 토큰 시스템
- [ ] PWA 설정 (manifest.json, service worker)
- [ ] 기본 UI 컴포넌트 구축 (shadcn/ui)

### Week 3-4: 관리자 기능
- [ ] 역할 기반 권한 시스템 (관리자/제작자/게스트)
- [ ] 룸 생성/편집 페이지
- [ ] 문제 에디터 (9가지 유형)
- [ ] 이미지 → SVG 변환 업로드
- [ ] YouTube 비디오 삽입
- [ ] 오디오 업로드
- [ ] 실시간 협업 기능 (Redis Pub/Sub)
- [ ] 팀원 관리 시스템 (로그인/비로그인)
- [ ] 주관식 유사도 계산 (60% 임계값)
- [ ] 출력물 자동 생성 (PDF)
- [ ] 크레딧 자동 생성
- [ ] 후원 시스템 구현

### Week 5: 사용자 기능
- [ ] 플레이 모드 선택 UI
- [ ] 온라인 모드 구현
- [ ] 현장 모드 구현 (QR 스캔, GPS)
- [ ] 출력물 모드 구현
- [ ] 문제 유형별 렌더러 (9가지)
- [ ] 진행 상황 추적
- [ ] 뱃지 시스템
- [ ] 오프라인 지원 (IndexedDB, Service Worker)
- [ ] IP 기반 접속 제한 (Redis 캐싱)
- [ ] 비로그인 플레이 (로컬 저장)
- [ ] 로그인 플레이 (서버 동기화)

### Week 6: 테스트 & 배포
- [ ] 샘플 컨텐츠 제작 ("산으로 간 물고기" 스타일)
- [ ] 성능 최적화
  - [ ] SVG 최적화
  - [ ] 이미지 최적화 (WebP, lazy loading)
  - [ ] 코드 스플리팅
  - [ ] Redis 캐싱 전략
  - [ ] MySQL 쿼리 최적화
- [ ] 교사용 가이드 작성
- [ ] 사용자 매뉴얼 작성
- [ ] Verpex 배포
- [ ] 도메인 연결 (Verpex 제공)
- [ ] SSL 인증서 설정
- [ ] 모니터링 설정
- [ ] 버그 수정 및 QA

---

## 🎯 주요 기능 상세

### 1. 실시간 협업 편집

**기술**: Redis Pub/Sub + WebSocket

**기능**:
- 여러 제작자가 동시에 같은 룸 편집 (로그인/비로그인)
- 실시간 변경 사항 동기화
- 다른 사용자의 커서 위치 표시
- 충돌 방지 (Conflict Resolution)
- 변경 이력 추적

**구현 예시**:
```typescript
// Redis Pub/Sub으로 실시간 동기화
import { redis } from '@/lib/db/redis';

// 변경 사항 발행
await redis.publish(`room:${roomId}:changes`, JSON.stringify({
  type: 'question_update',
  questionId,
  data: updatedQuestion,
  userId: session?.user?.id || guestToken,
}));

// 변경 사항 구독
const subscriber = redis.duplicate();
await subscriber.subscribe(`room:${roomId}:changes`);

subscriber.on('message', (channel, message) => {
  const change = JSON.parse(message);
  updateLocalState(change);
});

// 활성 사용자 추적 (Redis Set)
await redis.sadd(`room:${roomId}:active`, userId);
await redis.expire(`room:${roomId}:active`, 300); // 5분 TTL
```

### 2. 오프라인 지원 (PWA)

**기술**: Service Worker + IndexedDB

**기능**:
- 컨텐츠 데이터 사전 캐싱
- 오프라인 플레이 가능
- 진행 상황 로컬 저장
- 온라인 복귀 시 자동 동기화

**구현 예시**:
```typescript
// Service Worker에서 컨텐츠 데이터 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('game-cache-v1').then((cache) => {
      return cache.addAll([
        '/play/[roomId]/online',
        '/api/rooms/[id]',
        // 이미지, 오디오 등
      ]);
    })
  );
});

// IndexedDB에 진행 상황 저장
await db.put('progress', {
  sessionId,
  questionId,
  answer,
  timestamp: Date.now()
});
```

### 3. 하이브리드 플레이 모드

#### 온라인 모드
- 풍부한 멀티미디어 경험
- 자동 진행 상황 저장
- 힌트 시스템
- 실시간 피드백

#### 현장 연계 모드
- QR 코드 스캔으로 체크인
- GPS 위치 확인
- 실제 장소 탐험
- 몰입형 경험

**구현 예시**:
```typescript
// QR 코드 스캔
const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10 });
scanner.render(async (decodedText) => {
  if (decodedText === expectedQRCode) {
    await checkIn(roomId, sessionId, decodedText);
    onSuccess();
  }
});
```

#### 출력물 모드
- 인쇄물 활용
- 인터넷 불필요
- 협동 학습 가능
- 교사용 가이드 포함

**구현 예시**:
```typescript
// PDF 자동 생성
const doc = new PDFDocument();
doc.fontSize(20).text(room.title);
room.questions.forEach((q, i) => {
  doc.fontSize(14).text(`문제 ${i + 1}: ${q.title}`);
  doc.text('답: _____________________');
});
doc.end();
```

### 4. IP 기반 접속 제한

**목적**: 과도한 접속 방지 (동일 IP에서 반복 접속)

**기술**: Redis 캐싱 + MySQL 로깅

**기능**:
- 1시간 내 동일 IP 접속 횟수 제한
- 제한 초과 시 안내 메시지
- 1-2시간 후 재시도 가능

**구현 예시**:
```typescript
import { redis } from '@/lib/db/redis';
import { db } from '@/lib/db/mysql';

// Redis로 빠른 접속 체크
const key = `ip_limit:${roomId}:${ip}`;
const count = await redis.incr(key);

if (count === 1) {
  await redis.expire(key, 3600); // 1시간 TTL
}

if (count > maxConcurrentUsers) {
  const ttl = await redis.ttl(key);
  return { allowed: false, retryAfter: ttl };
}

// MySQL에 접속 로그 저장 (비동기)
await db.query(
  'INSERT INTO access_logs (room_id, ip_address, user_agent, accessed_at) VALUES (?, ?, ?, NOW())',
  [roomId, ip, userAgent]
);
```

### 5. 주관식 답변 유사도 계산

**목적**: 주관식 답변의 유연한 채점

**기술**: Levenshtein Distance 또는 Cosine Similarity

**기능**:
- 정답과 사용자 답변의 유사도 계산
- 60% 이상 유사하면 정답 처리
- 유사도 점수 표시

**구현 예시**:
```typescript
import { distance } from 'fastest-levenshtein';

function calculateSimilarity(answer: string, userAnswer: string): number {
  const a = answer.toLowerCase().trim();
  const b = userAnswer.toLowerCase().trim();

  const maxLen = Math.max(a.length, b.length);
  const dist = distance(a, b);

  return ((maxLen - dist) / maxLen) * 100;
}

// 사용
const similarity = calculateSimilarity('의병', '의병활동');
// similarity = 75% → 정답 처리

if (similarity >= question.similarity_threshold) {
  // 정답!
  await saveProgress({
    isCorrect: true,
    similarityScore: similarity,
  });
}
```

### 6. SVG 이미지 변환

**목적**: 용량 최소화 및 확대/축소 시 품질 유지

**기술**: Sharp + Potrace

**기능**:
- PNG/JPG → SVG 자동 변환
- 벡터 그래픽으로 저장
- 파일 크기 대폭 감소

**구현 예시**:
```typescript
import sharp from 'sharp';
import potrace from 'potrace';

async function convertToSVG(imageBuffer: Buffer): Promise<string> {
  // 이미지 전처리
  const processed = await sharp(imageBuffer)
    .greyscale()
    .threshold(128)
    .toBuffer();

  // SVG 변환
  return new Promise((resolve, reject) => {
    potrace.trace(processed, (err, svg) => {
      if (err) reject(err);
      else resolve(svg);
    });
  });
}
```

### 7. 역할 기반 권한 관리

**역할**:
- **admin**: 전체 관리자 (모든 권한)
- **creator**: 컨텐츠 제작자 (최초 생성자)
- **story**: 스토리 작가 (스토리 텍스트, 대화 편집)
- **design**: 디자이너 (이미지, 레이아웃 편집)
- **code**: 코딩 (문제 로직, 플로우 편집)
- **advisor**: 역사자문 (내용 검수, 승인)
- **music**: 음악 (오디오 업로드)
- **video**: 영상 (비디오 업로드)
- **guest**: 게스트 (편집 토큰으로 접근)

**권한**:
- `can_edit`: 편집 가능
- `can_approve`: 승인 가능
- `can_publish`: 게시 가능
- `can_invite`: 팀원 초대 가능

**구현 예시**:
```typescript
// 권한 체크 미들웨어
async function checkPermission(
  userId: string | null,
  guestToken: string | null,
  roomId: string,
  permission: 'can_edit' | 'can_approve' | 'can_publish'
): Promise<boolean> {
  const member = await db.query(
    `SELECT permissions FROM team_members
     WHERE room_id = ? AND (user_id = ? OR guest_token = ?)`,
    [roomId, userId, guestToken]
  );

  if (!member) return false;

  const perms = JSON.parse(member.permissions);
  return perms[permission] === true;
}
```

---

## 🔒 보안 고려사항

### 1. 데이터베이스 보안

**MySQL 권한 관리**:
```sql
-- 애플리케이션 전용 사용자 생성
CREATE USER 'escaperoom_app'@'localhost' IDENTIFIED BY 'strong_password';

-- 필요한 권한만 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON escaperoom.* TO 'escaperoom_app'@'localhost';

-- 민감한 테이블은 제한
REVOKE DELETE ON escaperoom.users FROM 'escaperoom_app'@'localhost';
```

**애플리케이션 레벨 권한 체크**:
```typescript
// 편집 권한 체크
async function canEdit(userId: string, roomId: string): Promise<boolean> {
  const [member] = await db.query(
    `SELECT permissions FROM team_members
     WHERE room_id = ? AND user_id = ?
     AND JSON_EXTRACT(permissions, '$.can_edit') = true`,
    [roomId, userId]
  );
  return !!member;
}
```

### 2. API Rate Limiting

**Redis 기반 Rate Limiting**:
```typescript
import { redis } from '@/lib/db/redis';

async function rateLimit(ip: string, limit: number = 100): Promise<boolean> {
  const key = `rate_limit:${ip}`;
  const requests = await redis.incr(key);

  if (requests === 1) {
    await redis.expire(key, 60); // 1분 윈도우
  }

  return requests <= limit;
}
```

### 3. 데이터 검증

**클라이언트 + 서버 양쪽 검증**:
```typescript
import { z } from 'zod';

const QuestionSchema = z.object({
  title: z.string().min(1).max(255),
  type: z.enum(['multiple-choice', 'short-answer', 'image-puzzle', ...]),
  content: z.record(z.any()),
  answer: z.record(z.any()),
});

// 서버에서 검증
export async function POST(req: Request) {
  const body = await req.json();
  const validated = QuestionSchema.parse(body); // 실패 시 에러
  // ...
}
```

**SQL Injection 방지**:
```typescript
// ❌ 위험
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ 안전 (Prepared Statement)
const [users] = await db.query(
  'SELECT * FROM users WHERE email = ?',
  [email]
);
```

### 4. 인증 및 세션 관리

**JWT 기반 세션**:
```typescript
import jwt from 'jsonwebtoken';

// 로그인 시 토큰 발급
const token = jwt.sign(
  { userId, email, role },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);

// 요청 시 토큰 검증
const decoded = jwt.verify(token, process.env.JWT_SECRET!);
```

**비로그인 편집 토큰**:
```typescript
// 컨텐츠 생성 시 편집 토큰 발급
const editToken = crypto.randomBytes(32).toString('hex');

await db.query(
  'UPDATE rooms SET edit_token = ? WHERE id = ?',
  [editToken, roomId]
);

// 편집 시 토큰 검증
const [room] = await db.query(
  'SELECT * FROM rooms WHERE id = ? AND edit_token = ?',
  [roomId, editToken]
);
```

---

## 📊 성능 최적화

### 1. 이미지 최적화

**SVG 우선 사용**:
- 캐릭터, 아이콘은 SVG로 저장
- 확대/축소 시 품질 유지
- 파일 크기 최소화

**래스터 이미지 최적화**:
```typescript
import sharp from 'sharp';

// 이미지 리사이징 및 WebP 변환
await sharp(inputBuffer)
  .resize(1920, 1080, { fit: 'inside' })
  .webp({ quality: 80 })
  .toFile(outputPath);
```

**Lazy Loading**:
```typescript
<Image
  src={imageUrl}
  alt="description"
  loading="lazy"
  width={800}
  height={600}
/>
```

### 2. 코드 스플리팅

**Dynamic Imports**:
```typescript
// 무거운 컴포넌트는 동적 로딩
const QRCodeScanner = dynamic(() => import('@/components/game/QRCodeScanner'), {
  loading: () => <p>로딩 중...</p>,
  ssr: false,
});
```

**Route-based Splitting**:
- Next.js가 자동으로 페이지별 코드 분할
- 필요한 코드만 로드

### 3. 캐싱 전략

**Redis 캐싱**:
```typescript
// 자주 조회되는 데이터 캐싱
async function getRoom(roomId: string) {
  const cached = await redis.get(`room:${roomId}`);
  if (cached) return JSON.parse(cached);

  const room = await db.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
  await redis.setex(`room:${roomId}`, 3600, JSON.stringify(room));

  return room;
}
```

**브라우저 캐싱 (Service Worker)**:
```typescript
// 정적 파일 캐싱
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**React Query 활용**:
```typescript
const { data: room } = useQuery({
  queryKey: ['room', roomId],
  queryFn: () => fetchRoom(roomId),
  staleTime: 5 * 60 * 1000, // 5분
  cacheTime: 10 * 60 * 1000, // 10분
});
```

### 4. 데이터베이스 최적화

**인덱스 생성**:
```sql
-- 자주 조회되는 컬럼에 인덱스
CREATE INDEX idx_rooms_published ON rooms(is_published);
CREATE INDEX idx_questions_room_order ON questions(room_id, order_index);
CREATE INDEX idx_sessions_user ON game_sessions(user_id, created_at);
```

**쿼리 최적화**:
```sql
-- ❌ N+1 문제
SELECT * FROM rooms;
-- 각 room마다 questions 조회

-- ✅ JOIN 사용
SELECT r.*, q.*
FROM rooms r
LEFT JOIN questions q ON r.id = q.room_id
WHERE r.is_published = 1;
```

**Connection Pooling**:
```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

---

## 📚 참고 자료

### 기술 문서
- [Next.js Documentation](https://nextjs.org/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Redis Documentation](https://redis.io/docs/)
- [Upstash Documentation](https://docs.upstash.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Sharp (Image Processing)](https://sharp.pixelplumbing.com/)
- [Potrace (SVG Conversion)](https://www.npmjs.com/package/potrace)

### 참고 프로젝트
- [산으로 간 물고기](https://11quiz-db.tistory.com/entry/fish-1-title)
- [동쪽에서 온 손님](https://sites.google.com/view/dokdo)
- [기념관의 비밀과 신비한 조각](https://11quiz-db.tistory.com/entry/Nobel-Peace-Prize)
- [세 가지 꽃말](https://esc-game.tistory.com/3)

---

## 🎓 교육적 활용

### 대상
- 초등학생 (5-6학년)
- 중학생
- 고등학생

### 주제
- 역사 (독립운동, 의병, 노벨평화상 등)
- 과학
- 수학
- 문학
- 사회

### 활용 방법
1. **수업 전**: 교사가 컨텐츠 제작 또는 기존 컨텐츠 선택
2. **수업 중**: 학생들이 개인 또는 팀으로 플레이
3. **수업 후**: 토론, 발표, 추가 학습

### 교사 지원
- 교사용 가이드 제공
- 학습 목표 명시
- 토론 질문 제공
- 추가 자료 링크

---

## 🤝 협업 체계

### 제작 팀 구성 예시

**교육청/재단**
- 총괄 기획
- 예산 지원
- 감수

**실천교육교사모임**
- 스토리 작성
- 역사 내용 검증
- 교사용 가이드 작성

**디자인 팀**
- UI/UX 디자인
- 삽화 제작
- 일러스트

**개발 팀**
- 웹 개발
- 시스템 구축
- 유지보수

**멀티미디어 팀**
- 음악 제작
- 영상 촬영/편집
- 사진 촬영

---

## 📝 라이선스 및 저작권

### 기본 라이선스
**CC BY-NC-ND (저작자표시-비영리-변경금지)**

### 저작권 표시 예시
```
제작: 전라남도 교육청
참여:
  총괄 - 신봉석
  역사 내용 - 이민화, 박주현, 나효정, 양누리
  감수 - 김남철, 김철민
  방탕출 문제 - 이해중, 최선주, 이지연
  코딩 - 문유진
  디자인 - 정일승
  삽화 - 유루시아
  음악 - 박영수
  영상 - 박병우

해당 콘텐츠의 저작권은 전라남도 교육청에 있습니다.
교육 목적 외 허가없이 무단 사용을 금합니다.
```

---

## 🎉 기대 효과

### 교육적 효과
- 몰입형 학습 경험
- 협동 학습 촉진
- 문제 해결 능력 향상
- 역사/과학 등 주제에 대한 흥미 증대

### 기술적 효과
- 교육 콘텐츠 제작 플랫폼 확보
- 재사용 가능한 컨텐츠 템플릿
- 지속적인 콘텐츠 업데이트 가능

### 사회적 효과
- 교육 격차 해소 (무료 제공)
- 오프라인 환경에서도 학습 가능
- 전국 어디서나 접근 가능

---

## 📞 문의 및 지원

### 기술 지원
- GitHub Issues
- 이메일 지원
- 사용자 커뮤니티

### 콘텐츠 제작 문의
- 교육청 담당자 연락처
- 협업 제안 양식

---

## 🔄 버전 관리

### v1.0.0 (초기 버전)
- 기본 기능 구현
- 3가지 플레이 모드
- 관리자 협업 시스템

### v1.1.0 (예정)
- 추가 문제 유형
- 고급 통계 기능
- 모바일 앱 (React Native)

### v2.0.0 (예정)
- AI 기반 문제 생성
- 음성 인식
- AR/VR 지원

---

## 📅 마일스톤

| 날짜 | 마일스톤 | 상태 |
|------|----------|------|
| Week 1-2 | 프로젝트 초기화 및 기반 구축 | 🔜 예정 |
| Week 3-4 | 관리자 기능 개발 | 🔜 예정 |
| Week 5 | 사용자 기능 개발 | 🔜 예정 |
| Week 6 | 테스트 및 배포 | 🔜 예정 |

---

## ✅ 체크리스트

### 프로젝트 시작 전
- [ ] Verpex 호스팅 계정 생성
- [ ] Upstash Redis 계정 생성
- [ ] 도메인 설정 (Verpex 제공)
- [ ] GitHub 저장소 생성
- [ ] 팀원 역할 분담
- [ ] 소셜 로그인 API 키 발급 (Google, Kakao, Naver)

### 개발 중
- [ ] 데이터베이스 스키마 검토
- [ ] UI/UX 디자인 확정
- [ ] 샘플 콘텐츠 준비
- [ ] 테스트 계획 수립

### 배포 전
- [ ] 성능 테스트
- [ ] 보안 검토
- [ ] 사용자 매뉴얼 작성
- [ ] 교사용 가이드 작성

---

**문서 버전**: 1.0.0
**최종 수정일**: 2025-01-19
**작성자**: AI Assistant

