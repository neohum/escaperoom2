# 프로젝트 구조

## 📁 폴더 구조

```
escaperoom/
├── frontend/                   # Next.js 프론트엔드
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # 관리자 영역
│   │   ├── (game)/            # 컨텐츠 영역
│   │   ├── (auth)/            # 인증 영역
│   │   └── api/               # API 프록시 (백엔드 호출)
│   ├── components/            # React 컴포넌트
│   ├── lib/                   # 유틸리티
│   ├── public/                # 정적 파일
│   ├── styles/                # 스타일
│   └── package.json
│
├── backend/                    # Node.js + Express 백엔드
│   ├── src/
│   │   ├── controllers/       # 컨트롤러
│   │   ├── models/            # 데이터 모델
│   │   ├── routes/            # API 라우트
│   │   ├── middleware/        # 미들웨어
│   │   ├── services/          # 비즈니스 로직
│   │   ├── utils/             # 유틸리티
│   │   ├── config/            # 설정
│   │   └── app.ts             # Express 앱
│   ├── migrations/            # DB 마이그레이션
│   ├── tests/                 # 테스트
│   └── package.json
│
├── shared/                     # 공유 코드
│   ├── types/                 # TypeScript 타입 정의
│   └── constants/             # 상수
│
├── docs/                       # 문서
│   ├── project-proposal.md
│   ├── tech-stack.md
│   ├── getting-started.md
│   └── api-reference.md
│
├── scripts/                    # 유틸리티 스크립트
│   ├── setup.sh               # 초기 설정
│   └── deploy.sh              # 배포
│
└── README.md
```

## 🎯 분리 이유

### Frontend (Next.js)
- **역할**: UI/UX, 사용자 인터랙션, PWA
- **기술**: Next.js 14, React, Tailwind CSS
- **포트**: 3000
- **배포**: Verpex (정적 파일) 또는 Vercel

### Backend (Node.js + Express)
- **역할**: API, 비즈니스 로직, 데이터베이스 연결
- **기술**: Express, MySQL, Redis
- **포트**: 4000
- **배포**: Verpex (Node.js 앱)

### Shared
- **역할**: 프론트엔드와 백엔드가 공유하는 타입, 상수
- **이점**: 타입 안정성, 코드 중복 방지

## 🔄 통신 방식

```
Frontend (3000) ←→ Backend API (4000) ←→ MySQL / Redis
```

### 개발 환경
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Frontend에서 `/api/*` 요청 → Backend로 프록시

### 프로덕션 환경
- Frontend: `https://yourdomain.com`
- Backend: `https://yourdomain.com/api` (리버스 프록시)

## 📦 패키지 관리

### Monorepo 옵션 1: npm workspaces
```json
{
  "name": "escaperoom",
  "private": true,
  "workspaces": [
    "frontend",
    "backend",
    "shared"
  ]
}
```

### Monorepo 옵션 2: 독립 실행
각 폴더에서 독립적으로 `npm install` 및 실행

## 🚀 실행 방법

### 개발 환경
```bash
# 루트에서 모든 패키지 설치
npm install

# Frontend 실행
cd frontend && npm run dev

# Backend 실행 (다른 터미널)
cd backend && npm run dev
```

### 프로덕션 빌드
```bash
# Frontend 빌드
cd frontend && npm run build

# Backend 빌드
cd backend && npm run build
```

## 🔧 환경 변수

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=escaperoom
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

## 📝 다음 단계

1. ✅ 프로젝트 구조 설계
2. ⬜ Frontend 초기화 (Next.js)
3. ⬜ Backend 초기화 (Express)
4. ⬜ Shared 타입 정의
5. ⬜ MySQL 스키마 생성
6. ⬜ Redis 연결 설정

