# 방탈출 교육 플랫폼 구현 가이드

## 📋 현재 상태

### ✅ 완료된 작업
- [x] 프로젝트 초기 설정 (Frontend + Backend + Shared)
- [x] 데이터베이스 스키마 설계 (MySQL 11개 테이블)
- [x] 백엔드 기본 구조 (Express + TypeScript)
- [x] 프론트엔드 기본 구조 (Next.js 14 + TypeScript)
- [x] 인증 API (회원가입, 로그인, JWT)
- [x] 미들웨어 (인증, Rate Limiting, 에러 처리)

### 🚧 구현 필요 항목

## 1️⃣ 백엔드 API 구현

### 인증 시스템
- [x] POST /api/auth/register - 회원가입
- [x] POST /api/auth/login - 로그인
- [x] POST /api/auth/logout - 로그아웃
- [x] GET /api/auth/me - 현재 사용자 정보
- [ ] OAuth 연동 (Google, Kakao, Naver)

### Room API
- [ ] GET /api/rooms - 게임 목록 조회
- [ ] GET /api/rooms/:id - 게임 상세 조회
- [ ] POST /api/rooms - 게임 생성
- [ ] PUT /api/rooms/:id - 게임 수정
- [ ] DELETE /api/rooms/:id - 게임 삭제
- [ ] POST /api/rooms/:id/publish - 게임 공개
- [ ] POST /api/rooms/:id/team - 팀원 추가

### Question API
- [ ] GET /api/rooms/:roomId/questions - 문제 목록
- [ ] POST /api/rooms/:roomId/questions - 문제 생성
- [ ] PUT /api/questions/:id - 문제 수정
- [ ] DELETE /api/questions/:id - 문제 삭제
- [ ] POST /api/questions/:id/check - 답안 확인

### Game API
- [ ] POST /api/game/sessions - 게임 세션 시작
- [ ] POST /api/game/sessions/:id/progress - 진행 상황 저장
- [ ] GET /api/game/sessions/:id - 세션 조회
- [ ] POST /api/game/sessions/:id/complete - 게임 완료

### Upload API
- [ ] POST /api/upload/image - 이미지 업로드 + SVG 변환
- [ ] POST /api/upload/file - 파일 업로드
- [ ] DELETE /api/upload/:id - 파일 삭제

### WebSocket
- [ ] 실시간 협업 편집
- [ ] 커서 위치 공유
- [ ] 변경사항 동기화

## 2️⃣ 프론트엔드 UI 구현

### 공통 컴포넌트
- [ ] Header - 네비게이션 바
- [ ] Footer - 푸터
- [ ] Button - 버튼 컴포넌트
- [ ] Input - 입력 필드
- [ ] Modal - 모달 다이얼로그
- [ ] Toast - 알림 메시지

### 인증 페이지
- [ ] /login - 로그인 페이지
- [ ] /register - 회원가입 페이지
- [ ] /forgot-password - 비밀번호 찾기

### 메인 페이지
- [x] / - 홈페이지 (완료)
- [ ] /rooms - 게임 목록
- [ ] /rooms/:id - 게임 상세/플레이

### 편집기 페이지
- [ ] /create - 게임 생성
- [ ] /edit/:id - 게임 편집
  - [ ] 기본 정보 편집
  - [ ] 문제 추가/수정/삭제
  - [ ] 드래그 앤 드롭 순서 변경
  - [ ] 실시간 협업 기능
  - [ ] 미리보기

### 관리자 페이지
- [ ] /admin - 관리자 대시보드
- [ ] /admin/users - 사용자 관리
- [ ] /admin/rooms - 게임 관리
- [ ] /admin/stats - 통계

### 마이페이지
- [ ] /profile - 프로필
- [ ] /my-rooms - 내가 만든 게임
- [ ] /my-games - 플레이한 게임
- [ ] /badges - 획득한 배지

## 3️⃣ 핵심 기능 구현

### SVG 변환
```typescript
// backend/src/services/svg.service.ts
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

### 유사도 계산
```typescript
// backend/src/services/similarity.service.ts
import { distance } from 'fastest-levenshtein';

export function calculateSimilarity(answer: string, userAnswer: string): number {
  const a = answer.toLowerCase().trim();
  const b = userAnswer.toLowerCase().trim();
  
  const maxLen = Math.max(a.length, b.length);
  const dist = distance(a, b);
  
  return ((maxLen - dist) / maxLen) * 100;
}

export function checkAnswer(
  correctAnswer: string,
  userAnswer: string,
  threshold: number = 60
): boolean {
  const similarity = calculateSimilarity(correctAnswer, userAnswer);
  return similarity >= threshold;
}
```

### PDF 생성
```typescript
// backend/src/services/pdf.service.ts
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

1. **데이터베이스 설정** - MySQL 및 Redis 설정
2. **백엔드 API 완성** - Room, Question, Game API 구현
3. **프론트엔드 UI 완성** - 페이지 및 컴포넌트 구현
4. **실시간 협업** - WebSocket 구현
5. **테스트** - 단위 테스트 및 통합 테스트
6. **배포** - Verpex 호스팅 배포

## 📚 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Express 문서](https://expressjs.com/)
- [MySQL 문서](https://dev.mysql.com/doc/)
- [Redis 문서](https://redis.io/docs/)
- [Sharp 문서](https://sharp.pixelplumbing.com/)
- [PDFKit 문서](http://pdfkit.org/)

