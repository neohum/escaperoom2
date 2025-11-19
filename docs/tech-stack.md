# 기술 스택 상세 문서

## 📚 목차
1. [프론트엔드](#프론트엔드)
2. [백엔드](#백엔드)
3. [데이터베이스](#데이터베이스)
4. [인프라](#인프라)
5. [개발 도구](#개발-도구)
6. [패키지 목록](#패키지-목록)

---

## 🎨 프론트엔드

### Next.js 14 (App Router)
**선택 이유**:
- React 기반 풀스택 프레임워크
- App Router로 최신 기능 활용
- 서버 컴포넌트로 성능 최적화
- 자동 코드 스플리팅
- 이미지 최적화 내장
- API Routes로 백엔드 통합

**주요 기능**:
- Server Components
- Client Components
- Streaming SSR
- Route Handlers (API)
- Middleware
- Image Optimization

### TypeScript
**선택 이유**:
- 타입 안정성
- 개발 생산성 향상
- IDE 자동완성
- 런타임 에러 사전 방지

**설정**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Tailwind CSS
**선택 이유**:
- Utility-first CSS
- 빠른 개발 속도
- 일관된 디자인 시스템
- 작은 번들 사이즈 (PurgeCSS)
- 반응형 디자인 용이

**설정**:
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
```

### shadcn/ui
**선택 이유**:
- 고품질 UI 컴포넌트
- Radix UI 기반 (접근성 우수)
- 커스터마이징 용이
- 복사-붙여넣기 방식 (의존성 최소화)

**주요 컴포넌트**:
- Button
- Dialog
- Dropdown Menu
- Form
- Input
- Select
- Tabs
- Toast

### Zustand
**선택 이유**:
- 간단한 상태 관리
- 작은 번들 사이즈 (1KB)
- Redux보다 간결한 API
- TypeScript 지원 우수

**사용 예시**:
```typescript
import { create } from 'zustand';

interface GameState {
  currentQuestion: number;
  score: number;
  incrementScore: (points: number) => void;
  nextQuestion: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentQuestion: 0,
  score: 0,
  incrementScore: (points) => set((state) => ({ 
    score: state.score + points 
  })),
  nextQuestion: () => set((state) => ({ 
    currentQuestion: state.currentQuestion + 1 
  })),
}));
```

### Workbox (PWA)
**선택 이유**:
- Google의 PWA 라이브러리
- Service Worker 관리 용이
- 오프라인 캐싱 전략
- 백그라운드 동기화

**설정**:
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

### React Dropzone
**선택 이유**:
- 드래그 앤 드롭 파일 업로드
- 파일 타입 검증
- 파일 크기 제한
- 미리보기 기능

### html5-qrcode
**선택 이유**:
- QR 코드 스캔 기능
- 카메라 접근
- 크로스 브라우저 지원

---

## 🔧 백엔드

### Next.js API Routes
**선택 이유**:
- 서버리스 함수
- 프론트엔드와 통합
- 자동 배포 (Vercel)
- TypeScript 지원

**구조**:
```
app/api/
├── rooms/
│   ├── route.ts              # GET /api/rooms
│   └── [id]/
│       ├── route.ts          # GET /api/rooms/[id]
│       ├── check-access/
│       │   └── route.ts      # POST /api/rooms/[id]/check-access
│       └── generate-printout/
│           └── route.ts      # POST /api/rooms/[id]/generate-printout
```

### Supabase
**선택 이유**:
- PostgreSQL 기반
- 실시간 기능 내장
- 인증 시스템
- 스토리지 포함
- Row Level Security (RLS)
- 무료 티어 제공

**주요 기능**:
1. **Database**: PostgreSQL
2. **Auth**: 이메일, OAuth
3. **Storage**: 파일 저장
4. **Realtime**: WebSocket 기반
5. **Edge Functions**: Deno 기반 서버리스

**클라이언트 설정**:
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**서버 설정**:
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

### PDFKit
**선택 이유**:
- PDF 생성 라이브러리
- Node.js 환경에서 동작
- 한글 폰트 지원
- 이미지 삽입 가능

**사용 예시**:
```typescript
import PDFDocument from 'pdfkit';

const doc = new PDFDocument();
doc.fontSize(20).text('방탈출 게임', { align: 'center' });
doc.fontSize(12).text('문제 1: ...');
doc.end();
```

---

## 💾 데이터베이스

### PostgreSQL (Supabase)
**선택 이유**:
- 강력한 관계형 데이터베이스
- JSONB 타입 지원
- 풀텍스트 검색
- 트랜잭션 지원
- 확장성

**주요 기능**:
- Row Level Security (RLS)
- Triggers
- Functions
- Views
- Indexes

**RLS 예시**:
```sql
-- 공개된 룸만 조회 가능
CREATE POLICY "Anyone can view published rooms"
ON rooms FOR SELECT
USING (is_published = true);

-- 팀원만 편집 가능
CREATE POLICY "Team members can edit"
ON questions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.room_id = questions.room_id
    AND team_members.user_id = auth.uid()
    AND team_members.permissions->>'can_edit' = 'true'
  )
);
```

### IndexedDB
**선택 이유**:
- 브라우저 내장 데이터베이스
- 오프라인 데이터 저장
- 대용량 데이터 지원
- 비동기 API

**라이브러리**: idb (IndexedDB wrapper)

**사용 예시**:
```typescript
import { openDB } from 'idb';

const db = await openDB('escape-room-db', 1, {
  upgrade(db) {
    db.createObjectStore('rooms', { keyPath: 'id' });
    db.createObjectStore('progress', { keyPath: 'id' });
  },
});

// 데이터 저장
await db.put('rooms', roomData);

// 데이터 조회
const room = await db.get('rooms', roomId);
```

---

## 🚀 인프라

### Vercel
**선택 이유**:
- Next.js 최적화
- 자동 배포 (Git 연동)
- 엣지 네트워크 (CDN)
- 서버리스 함수
- 무료 티어 제공

**주요 기능**:
- **Hobby Plan (무료)**:
  - 100GB 대역폭/월
  - 서버리스 함수 100GB-시간
  - 자동 HTTPS
  - 커스텀 도메인
  - Git 통합

**배포 설정**:
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["icn1"]
}
```

### Cloudflare
**선택 이유**:
- 도메인 등록 저렴
- DNS 관리 무료
- CDN 무료
- DDoS 방어

---

## 🛠️ 개발 도구

### ESLint
**설정**:
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Prettier
**설정**:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Husky + lint-staged
**목적**: Git commit 전 자동 검사

**설정**:
```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## 📦 패키지 목록

### 필수 패키지

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",

    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.0.10",

    "tailwindcss": "^3.4.0",
    "@tailwindcss/typography": "^0.5.10",

    "zustand": "^4.4.7",

    "next-pwa": "^5.6.0",
    "workbox-window": "^7.0.0",

    "react-dropzone": "^14.2.3",
    "html5-qrcode": "^2.3.8",
    "pdfkit": "^0.14.0",

    "idb": "^8.0.0",

    "framer-motion": "^10.16.16",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.42",
    "@types/react-dom": "^18.2.17",

    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.0",
    "@typescript-eslint/eslint-plugin": "^6.13.2",
    "@typescript-eslint/parser": "^6.13.2",

    "prettier": "^3.1.0",
    "prettier-plugin-tailwindcss": "^0.5.9",

    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  }
}
```

### shadcn/ui 컴포넌트

```bash
# 설치 명령어
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
```

---

## 🔐 환경 변수

### .env.local

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics (선택)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 📊 성능 모니터링

### Vercel Analytics
**기능**:
- 페이지 로딩 속도
- Core Web Vitals
- 사용자 경험 지표

### Supabase Dashboard
**기능**:
- 데이터베이스 쿼리 성능
- API 요청 통계
- 스토리지 사용량

---

## 🧪 테스트

### Jest + React Testing Library
**설정**:
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

### Playwright (E2E)
**설정**:
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

---

## 📱 모바일 지원

### PWA (Progressive Web App)
**기능**:
- 홈 화면 추가
- 오프라인 동작
- 푸시 알림 (선택)
- 앱과 유사한 경험

**manifest.json**:
```json
{
  "name": "방탈출 교육 플랫폼",
  "short_name": "방탈출",
  "description": "교육용 방탈출 게임 플랫폼",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 반응형 디자인
**브레이크포인트** (Tailwind CSS):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🔄 CI/CD

### GitHub Actions
**워크플로우**:
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### Vercel 자동 배포
- `main` 브랜치 → Production
- `develop` 브랜치 → Preview
- PR → Preview

---

## 📚 추가 라이브러리 (선택)

### React Query (TanStack Query)
**목적**: 서버 상태 관리

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['room', roomId],
  queryFn: () => fetchRoom(roomId),
});
```

### Zod
**목적**: 스키마 검증

```typescript
import { z } from 'zod';

const roomSchema = z.object({
  title: z.string().min(1).max(255),
  difficulty: z.number().min(1).max(5),
  playModes: z.array(z.enum(['online', 'onsite', 'printout'])),
});

type Room = z.infer<typeof roomSchema>;
```

### date-fns
**목적**: 날짜 처리

```typescript
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

format(new Date(), 'yyyy-MM-dd', { locale: ko });
formatDistanceToNow(new Date(), { locale: ko, addSuffix: true });
```

---

## 🎯 최적화 전략

### 1. 이미지 최적화
```typescript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  placeholder="blur"
/>
```

### 2. 코드 스플리팅
```typescript
import dynamic from 'next/dynamic';

const QRScanner = dynamic(() => import('@/components/QRScanner'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
```

### 3. 폰트 최적화
```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

---

**문서 버전**: 1.0.0
**최종 수정일**: 2025-01-19
**작성자**: AI Assistant


