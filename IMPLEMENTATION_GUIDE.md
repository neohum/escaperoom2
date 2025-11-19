# 방탈출 교육 플랫폼 구현 가이드

## 📋 현재 상태 (최종 업데이트: 2025-11-19)

### ✅ 완료된 작업

#### 프로젝트 기본 설정
- [x] 프로젝트 초기 설정 (Frontend + Backend + Shared)
- [x] 데이터베이스 스키마 설계 (MySQL 11개 테이블)
- [x] 백엔드 기본 구조 (Express + TypeScript)
- [x] 프론트엔드 기본 구조 (Next.js 14 + TypeScript + Tailwind CSS)
- [x] 환경 변수 설정 (backend/.env, frontend/.env.local)
- [x] Git 워크플로우 설정 (main 브랜치)

#### 백엔드 API
- [x] **인증 API** (backend/src/routes/auth.routes.ts)
  - POST /api/auth/register - 회원가입
  - POST /api/auth/login - 로그인
  - POST /api/auth/logout - 로그아웃
  - GET /api/auth/me - 현재 사용자 정보
- [x] **Room API** (backend/src/routes/room.routes.ts)
  - GET /api/rooms - 공개된 게임 목록 조회
  - GET /api/rooms/:id - 게임 상세 조회 (팀원 정보 포함)
  - POST /api/rooms - 게임 생성 (인증 필요)
  - PUT /api/rooms/:id - 게임 수정 (권한 확인)
  - DELETE /api/rooms/:id - 게임 삭제 (권한 확인)
  - POST /api/rooms/:id/publish - 게임 공개
  - POST /api/rooms/:id/unpublish - 게임 비공개
- [x] **Question API** (backend/src/routes/question.routes.ts)
  - GET /api/questions/room/:roomId - 게임의 모든 문제 조회
  - GET /api/questions/:id - 문제 상세 조회
  - POST /api/questions - 문제 생성 (권한 확인)
  - PUT /api/questions/:id - 문제 수정 (권한 확인)
  - DELETE /api/questions/:id - 문제 삭제 (권한 확인)
  - POST /api/questions/:id/check-answer - 답안 확인 (유사도 계산)
- [x] **미들웨어** (backend/src/middleware/auth.middleware.ts)
  - JWT 인증 미들웨어 (verifyToken)
  - 선택적 인증 미들웨어 (optionalAuth)
  - Rate Limiting
  - 에러 처리

#### 프론트엔드 UI
- [x] **메인 페이지** (frontend/app/page.tsx)
  - Hero 섹션 (메인 타이틀, CTA 버튼)
  - 주요 기능 섹션 (6개 기능 카드)
  - 통계 섹션 (비용, 무제한, 무료)
  - 사용 방법 섹션 (4단계 프로세스)
  - CTA 섹션 (회원가입 유도)
  - Footer (링크, 문의 정보)
  - 로그인 상태 관리 (localStorage)
  - 개발 모드 바로가기 (컬러 팔레트, 미리보기)
- [x] **인증 페이지**
  - /login - 로그인 페이지 (frontend/app/login/page.tsx)
  - /register - 회원가입 페이지 (frontend/app/register/page.tsx)
- [x] **게임 페이지**
  - /rooms - 게임 목록 페이지 (frontend/app/rooms/page.tsx)
  - /rooms/[id] - 게임 상세/플레이 페이지 (frontend/app/rooms/[id]/page.tsx)
  - /create - 게임 생성 페이지 (frontend/app/create/page.tsx)
- [x] **디자인 시스템**
  - /colors - 컬러 팔레트 상세 페이지 (8가지 컬러셋)
  - /color-preview - 실시간 컬러 미리보기 페이지

#### 핵심 기능
- [x] **JWT 인증 시스템**
  - bcrypt 비밀번호 해싱
  - 7일 만료 토큰
  - localStorage 기반 클라이언트 상태 관리
- [x] **유사도 계산 알고리즘**
  - Levenshtein Distance 알고리즘 (fastest-levenshtein)
  - 주관식 답안 자동 채점 (60% 임계값)
- [x] **권한 관리**
  - 게임 생성자만 수정/삭제 가능
  - 팀원 정보 조회
- [x] **반응형 디자인**
  - Tailwind CSS 기반
  - 모바일, 태블릿, 데스크톱 대응

#### 디자인 시스템
- [x] **8가지 컬러셋 옵션**
  1. Indigo & Purple (현재 사용 중) - 신뢰감 & 창의성
  2. Teal & Orange (추천) - 활기차고 친근한
  3. Blue & Green - 교육적이고 신선한
  4. Rose & Pink - 따뜻하고 부드러운
  5. Violet & Fuchsia - 창의적이고 혁신적인
  6. Emerald & Lime - 자연스럽고 활력적인
  7. Amber & Yellow - 밝고 긍정적인
  8. Cyan & Sky - 시원하고 깨끗한
- [x] **컬러 미리보기 시스템**
  - 사이드바 컬러셋 선택
  - 실시간 인덱스 페이지 미리보기
  - Primary/Secondary 컬러 팔레트
  - Gradient 예시
  - UI 컴포넌트 예시 (버튼, 카드, 배지)

### 🚧 구현 필요 항목

## 1️⃣ 백엔드 API 구현

### 인증 시스템 ✅ 완료
- [x] POST /api/auth/register - 회원가입
- [x] POST /api/auth/login - 로그인
- [x] POST /api/auth/logout - 로그아웃
- [x] GET /api/auth/me - 현재 사용자 정보
- [ ] OAuth 연동 (Google, Kakao, Naver) - 선택사항

### Room API ✅ 완료
- [x] GET /api/rooms - 게임 목록 조회
- [x] GET /api/rooms/:id - 게임 상세 조회
- [x] POST /api/rooms - 게임 생성
- [x] PUT /api/rooms/:id - 게임 수정
- [x] DELETE /api/rooms/:id - 게임 삭제
- [x] POST /api/rooms/:id/publish - 게임 공개
- [x] POST /api/rooms/:id/unpublish - 게임 비공개
- [ ] POST /api/rooms/:id/team - 팀원 추가/삭제 - 추가 구현 필요

### Question API ✅ 완료
- [x] GET /api/questions/room/:roomId - 문제 목록
- [x] POST /api/questions - 문제 생성
- [x] PUT /api/questions/:id - 문제 수정
- [x] DELETE /api/questions/:id - 문제 삭제
- [x] POST /api/questions/:id/check-answer - 답안 확인 (유사도 계산 포함)

### Game API 🚧 부분 완료
- [x] 기본 라우트 파일 생성 (backend/src/routes/game.routes.ts)
- [ ] POST /api/game/sessions - 게임 세션 시작
- [ ] POST /api/game/sessions/:id/progress - 진행 상황 저장
- [ ] GET /api/game/sessions/:id - 세션 조회
- [ ] POST /api/game/sessions/:id/complete - 게임 완료

### Upload API 🚧 스켈레톤만 존재
- [ ] POST /api/upload/image - 이미지 업로드 + SVG 변환
- [ ] POST /api/upload/file - 파일 업로드
- [ ] DELETE /api/upload/:id - 파일 삭제
- [ ] 패키지 설치 필요: `sharp`, `potrace`, `multer`

### WebSocket ❌ 미구현
- [ ] 실시간 협업 편집
- [ ] 커서 위치 공유
- [ ] 변경사항 동기화
- [ ] 패키지 설치 필요: `socket.io`

## 2️⃣ 프론트엔드 UI 구현

### 공통 컴포넌트 🚧 인라인으로 구현됨
- [x] Header - 각 페이지에 인라인으로 구현됨
- [x] Footer - 메인 페이지에 구현됨
- [ ] Button - 재사용 가능한 컴포넌트로 분리 필요
- [ ] Input - 재사용 가능한 컴포넌트로 분리 필요
- [ ] Modal - 모달 다이얼로그
- [ ] Toast - 알림 메시지
- [ ] Loading - 로딩 스피너 (현재 인라인)

### 인증 페이지 ✅ 완료
- [x] /login - 로그인 페이지 (frontend/app/login/page.tsx)
  - 이메일, 비밀번호 입력
  - API 연동 완료
  - localStorage 토큰 저장
- [x] /register - 회원가입 페이지 (frontend/app/register/page.tsx)
  - 이름, 이메일, 비밀번호, 비밀번호 확인
  - API 연동 완료
  - 유효성 검사
- [ ] /forgot-password - 비밀번호 찾기 (선택사항)

### 메인 페이지 ✅ 완료
- [x] / - 홈페이지 (frontend/app/page.tsx)
  - Hero 섹션
  - 주요 기능 섹션 (6개 카드)
  - 통계 섹션
  - 사용 방법 섹션
  - CTA 섹션
  - Footer
  - 로그인 상태 관리
  - 개발 모드 바로가기
- [x] /rooms - 게임 목록 (frontend/app/rooms/page.tsx)
  - 카드 그리드 레이아웃
  - 난이도 배지
  - 카테고리 표시
  - API 연동 완료
- [x] /rooms/[id] - 게임 상세/플레이 (frontend/app/rooms/[id]/page.tsx)
  - 게임 정보 표시
  - 문제 목록 및 네비게이션
  - 답안 제출 기능
  - 힌트 표시
  - 유사도 피드백
  - API 연동 완료

### 편집기 페이지 🚧 부분 완료
- [x] /create - 게임 생성 (frontend/app/create/page.tsx)
  - 제목, 설명, 카테고리 입력
  - 난이도 슬라이더
  - 예상 시간 입력
  - API 연동 완료
- [ ] /edit/[id] - 게임 편집 ❌ 미구현
  - [ ] 기본 정보 편집
  - [ ] 문제 추가/수정/삭제 UI
  - [ ] 드래그 앤 드롭 순서 변경
  - [ ] 실시간 협업 기능
  - [ ] 미리보기 모드

### 디자인 시스템 ✅ 완료
- [x] /colors - 컬러 팔레트 상세 (frontend/app/colors/page.tsx)
  - 8가지 컬러셋 옵션
  - Primary/Secondary 컬러 팔레트
  - Gradient 예시
  - UI 컴포넌트 예시
  - Accent 컬러
- [x] /color-preview - 실시간 미리보기 (frontend/app/color-preview/page.tsx)
  - 사이드바 컬러셋 선택
  - 실시간 인덱스 페이지 미리보기
  - 각 컬러셋의 실제 적용 모습

### 관리자 페이지 ❌ 미구현
- [ ] /admin - 관리자 대시보드
- [ ] /admin/users - 사용자 관리
- [ ] /admin/rooms - 게임 관리
- [ ] /admin/stats - 통계

### 마이페이지 ❌ 미구현
- [ ] /profile - 프로필
- [ ] /my-rooms - 내가 만든 게임
- [ ] /my-games - 플레이한 게임
- [ ] /badges - 획득한 배지

## 3️⃣ 핵심 기능 구현

### 유사도 계산 ✅ 완료
**위치**: `backend/src/routes/question.routes.ts` (인라인 구현)

```typescript
// Levenshtein Distance 알고리즘 사용
import { distance } from 'fastest-levenshtein';

function calculateSimilarity(answer: string, userAnswer: string): number {
  const a = answer.toLowerCase().trim();
  const b = userAnswer.toLowerCase().trim();

  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;

  const dist = distance(a, b);
  return ((maxLen - dist) / maxLen) * 100;
}

// POST /api/questions/:id/check-answer 엔드포인트에서 사용
// 주관식 답안: 60% 임계값으로 자동 채점
// 객관식/OX: 정확히 일치해야 정답
```

**패키지**: `fastest-levenshtein` (설치 완료)

### SVG 변환 ❌ 미구현
**예정 위치**: `backend/src/services/svg.service.ts`

```typescript
// 구현 필요
import sharp from 'sharp';
import potrace from 'potrace';

export async function convertToSVG(imagePath: string): Promise<string> {
  // 1. Sharp로 이미지 전처리
  const buffer = await sharp(imagePath)
    .greyscale()
    .normalize()
    .toBuffer();

  // 2. Potrace로 SVG 변환
  return new Promise((resolve, reject) => {
    potrace.trace(buffer, (err, svg) => {
      if (err) reject(err);
      else resolve(svg);
    });
  });
}
```

**필요 패키지**: `sharp`, `potrace` (미설치)

### PDF 생성 ❌ 미구현
**예정 위치**: `backend/src/services/pdf.service.ts`

```typescript
// 구현 필요
import PDFDocument from 'pdfkit';
import fs from 'fs';

export async function generatePrintout(roomId: string): Promise<string> {
  const doc = new PDFDocument();
  const filename = `printout-${roomId}.pdf`;
  const stream = fs.createWriteStream(filename);

  doc.pipe(stream);

  // 게임 정보 및 문제 추가
  doc.fontSize(20).text('방탈출 게임', { align: 'center' });
  // ... 문제 추가

  doc.end();

  return new Promise((resolve) => {
    stream.on('finish', () => resolve(filename));
  });
}
```

**필요 패키지**: `pdfkit`, `@types/pdfkit` (미설치)

### 실시간 협업 ❌ 미구현
**예정 위치**: `backend/src/services/websocket.service.ts`

```typescript
// 구현 필요
import { Server } from 'socket.io';

export function setupWebSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 방 참여
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
    });

    // 변경사항 브로드캐스트
    socket.on('update', (data) => {
      socket.to(data.roomId).emit('update', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}
```

**필요 패키지**: `socket.io`, `socket.io-client` (미설치)

## 4️⃣ 데이터베이스 설정

### MySQL 설정
```bash
# 1. MySQL 설치 (macOS)
brew install mysql

# 2. MySQL 시작
brew services start mysql

# 3. 데이터베이스 생성
mysql -u root -p
CREATE DATABASE escaperoom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 4. 스키마 적용
mysql -u root -p escaperoom < backend/migrations/001_initial_schema.sql
```

### Redis 설정 (Upstash)
1. https://upstash.com/ 가입
2. Redis 데이터베이스 생성
3. REST URL 복사
4. `.env`에 `REDIS_URL` 설정

## 5️⃣ 환경 변수 설정

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=escaperoom

# Redis
REDIS_URL=your_upstash_redis_url

# JWT
JWT_SECRET=your_jwt_secret_key

# Frontend
FRONTEND_URL=http://localhost:3000

# OAuth (선택사항)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 6️⃣ 개발 서버 실행

```bash
# 전체 실행 (루트 디렉토리에서)
npm run dev

# 또는 개별 실행
cd backend && npm run dev  # 백엔드: http://localhost:4000
cd frontend && npm run dev # 프론트엔드: http://localhost:3000
```

## 7️⃣ 다음 단계

### 우선순위 1: 핵심 기능 완성
1. **데이터베이스 설정** ⚠️ 필수
   - MySQL 데이터베이스 생성
   - 스키마 적용 (`backend/migrations/001_initial_schema.sql`)
   - Redis/Upstash 설정
   - 환경 변수 설정 (DB 비밀번호 등)

2. **게임 편집 페이지** 🎯 중요
   - `/edit/[id]` 페이지 구현
   - 문제 추가/수정/삭제 UI
   - 드래그 앤 드롭 순서 변경
   - 이미지 업로드 기능

3. **Game Session API** 🎯 중요
   - 게임 세션 시작/진행/완료
   - 진행 상황 저장
   - 점수 계산

### 우선순위 2: 추가 기능
4. **Upload API** 📸 선택사항
   - 이미지 업로드
   - SVG 변환 (sharp, potrace)
   - 파일 관리

5. **실시간 협업** 🤝 선택사항
   - WebSocket 구현 (socket.io)
   - 커서 위치 공유
   - 변경사항 동기화

6. **마이페이지** 👤 선택사항
   - 프로필 관리
   - 내가 만든 게임
   - 플레이한 게임
   - 배지 시스템

### 우선순위 3: 운영 및 배포
7. **관리자 페이지** 🔧 선택사항
   - 사용자 관리
   - 게임 관리
   - 통계 대시보드

8. **테스트** ✅ 권장
   - 단위 테스트
   - 통합 테스트
   - E2E 테스트

9. **배포** 🚀 최종
   - Verpex 호스팅 배포
   - 환경 변수 설정
   - 도메인 연결

### 즉시 실행 가능한 작업
```bash
# 1. 서버 실행 테스트
cd backend && npm run dev
cd frontend && npm run dev

# 2. 데이터베이스 설정
mysql -u root -p
CREATE DATABASE escaperoom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE escaperoom;
source backend/migrations/001_initial_schema.sql;

# 3. 컬러셋 선택 및 적용
# http://localhost:3000/color-preview 에서 컬러셋 선택
# 선택한 컬러셋을 tailwind.config.ts에 적용
```

## 📚 참고 자료

### 프레임워크 & 라이브러리
- [Next.js 문서](https://nextjs.org/docs) - 프론트엔드 프레임워크
- [Express 문서](https://expressjs.com/) - 백엔드 프레임워크
- [Tailwind CSS 문서](https://tailwindcss.com/docs) - CSS 프레임워크

### 데이터베이스
- [MySQL 문서](https://dev.mysql.com/doc/) - 메인 데이터베이스
- [Redis 문서](https://redis.io/docs/) - 캐싱 및 실시간 기능
- [Upstash 문서](https://docs.upstash.com/) - Redis 호스팅

### 핵심 패키지
- [fastest-levenshtein](https://www.npmjs.com/package/fastest-levenshtein) - 유사도 계산 (설치됨)
- [bcrypt](https://www.npmjs.com/package/bcrypt) - 비밀번호 해싱 (설치됨)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - JWT 인증 (설치됨)
- [uuid](https://www.npmjs.com/package/uuid) - UUID 생성 (설치됨)

### 추가 구현 필요 패키지
- [Sharp 문서](https://sharp.pixelplumbing.com/) - 이미지 처리
- [Potrace](https://www.npmjs.com/package/potrace) - SVG 변환
- [PDFKit 문서](http://pdfkit.org/) - PDF 생성
- [Socket.IO 문서](https://socket.io/docs/) - 실시간 통신

## 📊 프로젝트 통계

### 코드 현황
- **백엔드 라우트**: 4개 (auth, room, question, game)
- **프론트엔드 페이지**: 8개 (/, /login, /register, /rooms, /rooms/[id], /create, /colors, /color-preview)
- **데이터베이스 테이블**: 11개
- **API 엔드포인트**: 약 20개 (구현 완료)

### 완성도
- **백엔드 API**: 약 70% 완성 (핵심 CRUD 완료, 세션/업로드 미완)
- **프론트엔드 UI**: 약 60% 완성 (주요 페이지 완료, 편집기/마이페이지 미완)
- **핵심 기능**: 약 50% 완성 (인증/유사도 완료, SVG/PDF/WebSocket 미완)
- **전체 프로젝트**: 약 60% 완성

### 설치된 패키지
```json
// backend
{
  "express": "^4.18.2",
  "typescript": "^5.0.0",
  "mysql2": "^3.6.0",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "uuid": "^9.0.0",
  "fastest-levenshtein": "^1.0.16",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}

// frontend
{
  "next": "14.0.0",
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0"
}
```

## 🎯 권장 다음 작업

1. **즉시 실행**: 서버 실행 및 테스트
   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

2. **데이터베이스 설정**: MySQL 스키마 적용

3. **컬러셋 선택**: `/color-preview` 페이지에서 원하는 컬러셋 선택 후 적용

4. **게임 편집 페이지**: `/edit/[id]` 구현 (가장 중요한 미완성 기능)

5. **테스트**: 실제 게임 생성 → 문제 추가 → 플레이 테스트

---

**마지막 업데이트**: 2025-11-19
**작성자**: AI Assistant
**프로젝트 상태**: 개발 중 (60% 완성)

