# 프로젝트 설정 가이드

## ✅ 완료된 작업

### 1. 프로젝트 구조 생성
```
escaperoom/
├── frontend/              # Next.js 14 + TypeScript + Tailwind
├── backend/               # Express + TypeScript
├── shared/                # 공유 타입 및 상수
├── docs/                  # 문서
└── scripts/               # 유틸리티 스크립트
```

### 2. 생성된 파일

#### Backend
- ✅ `backend/package.json` - 의존성 정의
- ✅ `backend/tsconfig.json` - TypeScript 설정
- ✅ `backend/.env.example` - 환경 변수 템플릿
- ✅ `backend/src/app.ts` - Express 앱 진입점
- ✅ `backend/src/config/database.ts` - MySQL 연결
- ✅ `backend/src/config/redis.ts` - Redis 연결
- ✅ `backend/src/middleware/error.middleware.ts` - 에러 핸들러
- ✅ `backend/src/middleware/rateLimit.middleware.ts` - Rate Limiting
- ✅ `backend/src/routes/*.routes.ts` - API 라우트 (5개)
- ✅ `backend/src/services/websocket.service.ts` - WebSocket 서비스
- ✅ `backend/migrations/001_initial_schema.sql` - MySQL 스키마

#### Frontend
- ✅ Next.js 14 프로젝트 초기화 완료
- ✅ TypeScript, Tailwind CSS 설정 완료

#### Shared
- ✅ `shared/types/index.ts` - 공유 타입 정의
- ✅ `shared/constants/index.ts` - 공유 상수

#### 문서
- ✅ `docs/project-proposal.md` - 프로젝트 기획서
- ✅ `docs/project-structure.md` - 프로젝트 구조
- ✅ `docs/tech-stack.md` - 기술 스택
- ✅ `docs/SUMMARY.md` - 프로젝트 요약
- ✅ `README.md` - 프로젝트 소개

---

## 🔧 다음 단계

### 1. MySQL 데이터베이스 설정

```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE escaperoom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 스키마 적용
USE escaperoom;
SOURCE backend/migrations/001_initial_schema.sql;

# 확인
SHOW TABLES;
```

### 2. Redis 설정 (Upstash)

1. [Upstash](https://upstash.com/) 가입
2. Redis 데이터베이스 생성
3. Connection URL 복사

### 3. 환경 변수 설정

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

`.env` 파일 편집:
```env
PORT=4000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=escaperoom

# Redis (Upstash)
REDIS_URL=rediss://default:your_password@your-redis.upstash.io:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```bash
cd frontend
cp .env.example .env.local
```

`.env.local` 파일 편집:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 소셜 로그인 API 키 발급

#### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com/)
2. 프로젝트 생성
3. OAuth 2.0 클라이언트 ID 생성
4. Redirect URI: `http://localhost:4000/api/auth/google/callback`

#### Kakao OAuth
1. [Kakao Developers](https://developers.kakao.com/)
2. 앱 생성
3. REST API 키 복사
4. Redirect URI: `http://localhost:4000/api/auth/kakao/callback`

#### Naver OAuth
1. [Naver Developers](https://developers.naver.com/)
2. 애플리케이션 등록
3. Client ID, Secret 복사
4. Callback URL: `http://localhost:4000/api/auth/naver/callback`

### 5. 개발 서버 실행

```bash
# 루트 디렉토리에서
npm run dev
```

또는 개별 실행:
```bash
# Frontend (터미널 1)
npm run dev:frontend

# Backend (터미널 2)
npm run dev:backend
```

### 6. 확인

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/health

---

## 📝 TODO

### Backend 구현
- [ ] 인증 시스템 (JWT + OAuth)
- [ ] Room CRUD API
- [ ] Question CRUD API
- [ ] 게임 세션 관리
- [ ] 파일 업로드 (SVG 변환)
- [ ] 유사도 계산 로직
- [ ] PDF 생성

### Frontend 구현
- [ ] 관리자 대시보드
- [ ] 게임 편집기
- [ ] 게임 플레이어
- [ ] PWA 설정
- [ ] 오프라인 지원

### 테스트
- [ ] Backend API 테스트
- [ ] Frontend 컴포넌트 테스트
- [ ] E2E 테스트

---

## 🚀 배포 준비

### Verpex 호스팅
1. Verpex 계정 가입
2. Start Plan 선택 ($0.99/월)
3. cPanel 접속
4. Node.js 앱 설정
5. MySQL 데이터베이스 생성
6. 파일 업로드 (FTP 또는 Git)

---

**작성일**: 2025-01-19

