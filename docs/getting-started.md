# 시작 가이드

이 문서는 방탕출 교육 플랫폼을 처음 시작하는 개발자를 위한 가이드입니다.

## 📋 목차

1. [사전 준비](#사전-준비)
2. [Supabase 설정](#supabase-설정)
3. [프로젝트 설정](#프로젝트-설정)
4. [개발 서버 실행](#개발-서버-실행)
5. [배포](#배포)
6. [문제 해결](#문제-해결)

---

## 🔧 사전 준비

### 필수 요구사항

다음 도구들이 설치되어 있어야 합니다:

- **Node.js** 20 이상
- **npm** 10 이상 (또는 yarn, pnpm)
- **Git**
- **코드 에디터** (VS Code 권장)

### 계정 생성

다음 서비스의 계정이 필요합니다:

1. **Supabase** - https://supabase.com
   - 무료 계정으로 시작 가능
   - 프로젝트 생성 필요

2. **Vercel** (배포용) - https://vercel.com
   - GitHub 계정으로 로그인 가능
   - 무료 Hobby 플랜 사용

3. **GitHub** - https://github.com
   - 코드 저장소 관리

---

## 🗄️ Supabase 설정

### 1. 프로젝트 생성

1. [Supabase 대시보드](https://app.supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: `escaperoom-edu`
   - **Database Password**: 안전한 비밀번호 생성
   - **Region**: `Northeast Asia (Seoul)` 선택
4. "Create new project" 클릭

### 2. API 키 확인

프로젝트 생성 후:

1. 좌측 메뉴에서 **Settings** → **API** 클릭
2. 다음 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (공개 키)
   - **service_role**: `eyJhbGc...` (서비스 키, 비공개)

### 3. 데이터베이스 마이그레이션

#### 방법 1: SQL Editor 사용 (권장)

1. Supabase 대시보드에서 **SQL Editor** 클릭
2. "New query" 클릭
3. `supabase/migrations/001_initial_schema.sql` 파일 내용 복사
4. SQL Editor에 붙여넣기
5. "Run" 클릭

#### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-id

# 마이그레이션 실행
supabase db push
```

### 4. Storage 버킷 생성

1. Supabase 대시보드에서 **Storage** 클릭
2. "Create a new bucket" 클릭
3. 다음 버킷 생성:
   - `images` (Public)
   - `audio` (Public)
   - `videos` (Public)
   - `printouts` (Public)

각 버킷 설정:
- **Public bucket**: ✅ 체크
- **File size limit**: 10MB (이미지), 50MB (오디오/비디오)
- **Allowed MIME types**: 적절한 타입 설정

---

## 💻 프로젝트 설정

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/escaperoom.git
cd escaperoom
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env.local` 생성:

```bash
cp .env.example .env.local
```

`.env.local` 파일 편집:

```bash
# Supabase 설정 (위에서 복사한 값 입력)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# 애플리케이션 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 기타 설정
NODE_ENV=development
NEXT_PUBLIC_PWA_ENABLED=false
NEXT_PUBLIC_DEBUG=true
```

### 4. Next.js 설정 업데이트

`next.config.js` 파일에서 Supabase 도메인 추가:

```javascript
images: {
  domains: [
    'localhost',
    'xxxxx.supabase.co', // 여기에 실제 프로젝트 ID 입력
  ],
  // ...
}
```

---

## 🚀 개발 서버 실행

### 개발 서버 시작

```bash
npm run dev
```

브라우저에서 http://localhost:3000 열기

### 사용 가능한 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint

# 타입 체크
npm run type-check

# 테스트 실행
npm test
```

---

## 📦 배포

### Vercel 배포

#### 방법 1: GitHub 연동 (권장)

1. GitHub에 저장소 푸시
2. [Vercel 대시보드](https://vercel.com/dashboard) 접속
3. "Add New..." → "Project" 클릭
4. GitHub 저장소 선택
5. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. "Deploy" 클릭

#### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경 변수 설정

Vercel 대시보드에서:

1. 프로젝트 선택
2. "Settings" → "Environment Variables"
3. 다음 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (배포된 URL)

### 도메인 연결

1. Vercel 대시보드에서 "Settings" → "Domains"
2. 커스텀 도메인 추가
3. DNS 설정 (Cloudflare 사용 시):
   - A 레코드: `76.76.21.21`
   - CNAME 레코드: `cname.vercel-dns.com`

---

## 🐛 문제 해결

### 일반적인 문제

#### 1. Supabase 연결 오류

**증상**: `Failed to fetch` 또는 `Network error`

**해결**:
- `.env.local` 파일의 Supabase URL과 키 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 브라우저 콘솔에서 네트워크 탭 확인

#### 2. 이미지 로딩 실패

**증상**: 이미지가 표시되지 않음

**해결**:
- `next.config.js`에 Supabase 도메인 추가 확인
- Storage 버킷이 Public으로 설정되어 있는지 확인
- 이미지 URL이 올바른지 확인

#### 3. PWA 작동 안 함

**증상**: 오프라인 모드가 작동하지 않음

**해결**:
- 프로덕션 빌드에서만 PWA 활성화됨
- `npm run build && npm start`로 테스트
- 브라우저 개발자 도구 → Application → Service Workers 확인

#### 4. TypeScript 오류

**증상**: 타입 오류 발생

**해결**:
```bash
# 타입 체크
npm run type-check

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 5. 빌드 실패

**증상**: `npm run build` 실패

**해결**:
- 린트 오류 확인: `npm run lint`
- 타입 오류 확인: `npm run type-check`
- 환경 변수 확인
- Node.js 버전 확인 (20 이상)

---

## 📚 다음 단계

### 학습 자료

1. **Next.js 문서**: https://nextjs.org/docs
2. **Supabase 문서**: https://supabase.com/docs
3. **Tailwind CSS**: https://tailwindcss.com/docs
4. **shadcn/ui**: https://ui.shadcn.com

### 개발 가이드

1. [프로젝트 기획서](./project-proposal.md) - 전체 기획 이해
2. [기술 스택](./tech-stack.md) - 사용 기술 상세
3. [API 문서](./api-reference.md) - API 레퍼런스 (예정)
4. [컴포넌트 가이드](./components.md) - 컴포넌트 사용법 (예정)

### 첫 번째 작업

#### 1. 샘플 데이터 추가

Supabase SQL Editor에서 실행:

```sql
-- 샘플 룸 생성
INSERT INTO rooms (title, subtitle, description, difficulty, category, is_published)
VALUES (
  '산으로 간 물고기',
  '역사 교육 방탕출',
  '의병 활동에 대해 배우는 교육용 게임',
  3,
  '역사',
  true
);

-- 샘플 문제 생성
INSERT INTO questions (room_id, type, title, content, answer, order_index)
VALUES (
  (SELECT id FROM rooms WHERE title = '산으로 간 물고기'),
  'multiple-choice',
  '첫 번째 문제',
  '{"question": "의병은 언제 활동했나요?", "choices": ["조선시대", "고려시대", "삼국시대"]}'::jsonb,
  '{"correct": 0}'::jsonb,
  1
);
```

#### 2. 관리자 계정 생성

1. http://localhost:3000 접속
2. 회원가입 (Supabase Auth 사용)
3. Supabase 대시보드에서 사용자 확인
4. 팀원으로 추가:

```sql
INSERT INTO team_members (room_id, user_id, role, name, permissions)
VALUES (
  (SELECT id FROM rooms WHERE title = '산으로 간 물고기'),
  'user-uuid-here',
  'admin',
  '관리자',
  '{"can_edit": true, "can_approve": true, "can_publish": true}'::jsonb
);
```

#### 3. 첫 게임 플레이

1. http://localhost:3000/play 접속
2. 게임 선택
3. 플레이 모드 선택 (온라인/현장/출력물)
4. 게임 시작!

---

## 🤝 기여하기

### 개발 워크플로우

1. **이슈 생성**: 버그 또는 기능 제안
2. **브랜치 생성**: `feature/기능명` 또는 `fix/버그명`
3. **개발**: 코드 작성 및 테스트
4. **커밋**: 의미 있는 커밋 메시지
5. **푸시**: GitHub에 푸시
6. **PR 생성**: Pull Request 생성
7. **리뷰**: 코드 리뷰 및 수정
8. **머지**: main 브랜치에 병합

### 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 설정 등
```

예시:
```
feat: 문제 유형에 드래그 앤 드롭 추가
fix: 오프라인 모드에서 이미지 로딩 오류 수정
docs: README에 설치 가이드 추가
```

### 코드 스타일

- ESLint 규칙 준수
- Prettier로 자동 포맷팅
- TypeScript strict 모드 사용
- 컴포넌트는 함수형으로 작성
- 주석은 한글로 작성

---

## 📞 도움 받기

### 커뮤니티

- **GitHub Issues**: 버그 리포트 및 기능 제안
- **GitHub Discussions**: 질문 및 토론
- **이메일**: your-email@example.com

### 유용한 링크

- [프로젝트 저장소](https://github.com/your-username/escaperoom)
- [이슈 트래커](https://github.com/your-username/escaperoom/issues)
- [위키](https://github.com/your-username/escaperoom/wiki)

---

**Happy Coding! 🎉**


