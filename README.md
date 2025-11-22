# 🎯 방탕출 교육 플랫폼

교육용 방탕출 게임을 제작하고 플레이할 수 있는 웹 기반 플랫폼입니다.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-Latest-red)](https://redis.io/)
[![License](https://img.shields.io/badge/License-CC%20BY--NC--ND-lightgrey)](LICENSE)

## 🚀 최신 업데이트 (2025-11-19)

- ✅ **소셜 로그인 구현** - Google, Kakao, Naver OAuth 지원
- ✅ **MySQL 초기 설정** - 자동화 스크립트 제공
- ✅ **컬러셋 미리보기** - 8가지 테마 선택 가능
- ✅ **개발 문서 완비** - OAuth 설정 가이드, 구현 가이드

## 🎯 주요 기능

### 관리자/제작자
- ✅ 실시간 협업 편집 (Redis Pub/Sub)
- ✅ 비로그인 편집 토큰 시스템
- ✅ 이미지 → SVG 자동 변환
- ✅ YouTube 비디오 삽입
- ✅ 9가지 문제 유형 지원
- ✅ 주관식 유사도 계산 (60% 임계값)
- ✅ 출력물 PDF 자동 생성
- ✅ 후원 시스템

### 사용자
- ✅ 비로그인 플레이 (로컬 저장)
- ✅ 3가지 플레이 모드 (온라인/현장/출력물)
- ✅ 오프라인 지원 (PWA)
- ✅ 뱃지 시스템
- ✅ IP 기반 접속 제한

---

## 💻 기술 스택

### 프론트엔드
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Offline Support**: Workbox (PWA)

### 백엔드
- **Runtime**: Node.js 20
- **Framework**: Express
- **Database**: MySQL (Verpex)
- **Real-time**: Redis (Upstash)
- **Authentication**: JWT + OAuth (Google, Kakao, Naver)

### 인프라
- **Hosting**: Verpex Shared Hosting
- **Database**: Verpex MySQL
- **Cache**: Upstash Redis (Free tier)

---

## 💰 비용 (월 10만원 이내)

| 항목 | 서비스 | 플랜 | 월 비용 |
|------|--------|------|---------|
| 호스팅 | Verpex | Start | ₩1,300 |
| Redis | Upstash | Free | 무료 |
| **합계** | | | **₩1,300** ✅ |

---

## 📁 프로젝트 구조

```
escaperoom/
├── frontend/          # Next.js 프론트엔드 (Port 3000)
├── backend/           # Express 백엔드 (Port 4000)
├── shared/            # 공유 타입 및 상수
├── docs/              # 문서
└── scripts/           # 유틸리티 스크립트
```

---

## 🚀 시작하기

### 필수 요구사항
- Node.js 20+
- npm 10+
- MySQL 8.0+
- Redis (또는 Upstash 계정)

### 빠른 시작 (Quick Start)

```bash
# 1. 저장소 클론
git clone https://github.com/neohum/escaperoom2.git
cd escaperoom

# 2. MySQL 초기 설정 (비밀번호 재설정 + 데이터베이스 생성)
./reset-mysql-password.sh  # MySQL root 비밀번호를 'root'로 설정
./setup-db.sh               # 데이터베이스 및 스키마 생성

# 3. 패키지 설치
npm install                 # 루트 의존성
cd backend && npm install   # 백엔드 의존성
cd ../frontend && npm install  # 프론트엔드 의존성
cd ..

# 4. 환경 변수 설정 (이미 설정되어 있음)
# backend/.env - MySQL 비밀번호가 자동으로 'root'로 설정됨
# OAuth 설정은 docs/OAUTH_SETUP.md 참조

# 5. 개발 서버 실행
cd backend && npm run dev   # 터미널 1: 백엔드 서버 (Port 4000)
cd frontend && npm run dev  # 터미널 2: 프론트엔드 서버 (Port 3000)
```

### 접속 URL

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000](http://localhost:4000)
- **컬러셋 미리보기**: [http://localhost:3000/color-preview](http://localhost:3000/color-preview)

---

## 📚 문서

### 설정 가이드
- **[OAuth 설정 가이드](./docs/OAUTH_SETUP.md)** - Google, Kakao, Naver 소셜 로그인 설정
- **[구현 가이드](./IMPLEMENTATION_GUIDE.md)** - 현재 개발 상황 및 다음 단계

### 프로젝트 문서
- [프로젝트 기획서](./docs/project-proposal.md) - 전체 기획 및 요구사항
- [프로젝트 구조](./docs/project-structure.md) - 폴더 구조 및 아키텍처
- [기술 스택 상세](./docs/tech-stack.md) - 사용 기술 상세 설명
- [시작 가이드](./docs/getting-started.md) - 설치 및 설정 가이드
- [요약](./docs/SUMMARY.md) - 프로젝트 요약

---

## 🎮 플레이 모드

### 1. 온라인 모드
- 풍부한 멀티미디어 경험
- 자동 진행 저장
- 힌트 시스템

### 2. 현장 연계 모드
- QR 코드 스캔
- GPS 위치 확인
- 실제 장소 탐험

### 3. 출력물 모드
- PDF 인쇄물
- 인터넷 불필요
- 협동 학습

---

## 🤝 기여하기

기여를 환영합니다! Pull Request를 보내주세요.

---

## 📝 라이선스

CC BY-NC-ND (저작자표시-비영리-변경금지)

---

**문서 버전**: 1.0.0  
**최종 수정일**: 2025-11-19

