# OAuth 소셜 로그인 설정 가이드

## 개요

방탕출 교육 플랫폼은 다음 3가지 소셜 로그인을 지원합니다:
- Google OAuth 2.0
- Kakao Login
- Naver Login

## 1. Google OAuth 설정

### 1.1 Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스 > OAuth 동의 화면** 이동
   - 사용자 유형: 외부 선택
   - 앱 이름: "방탈출 교육 플랫폼"
   - 사용자 지원 이메일: 본인 이메일
   - 승인된 도메인: (프로덕션 도메인 추가)
   - 개발자 연락처 정보: 본인 이메일

4. **API 및 서비스 > 사용자 인증 정보** 이동
   - **사용자 인증 정보 만들기 > OAuth 클라이언트 ID** 클릭
   - 애플리케이션 유형: 웹 애플리케이션
   - 이름: "방탕출 교육 플랫폼 Web Client"
   - 승인된 자바스크립트 원본:
     - `http://localhost:3000` (개발)
     - `https://yourdomain.com` (프로덕션)
   - 승인된 리디렉션 URI:
     - `http://localhost:4000/api/auth/google/callback` (개발)
     - `https://api.yourdomain.com/api/auth/google/callback` (프로덕션)

5. 생성된 **클라이언트 ID**와 **클라이언트 보안 비밀** 복사

### 1.2 환경 변수 설정

`backend/.env` 파일에 추가:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## 2. Kakao Login 설정

### 2.1 Kakao Developers 설정

1. [Kakao Developers](https://developers.kakao.com/) 접속 및 로그인
2. **내 애플리케이션 > 애플리케이션 추가하기**
   - 앱 이름: "방탕출 교육 플랫폼"
   - 사업자명: 본인 이름 또는 회사명

3. **앱 설정 > 플랫폼** 이동
   - **Web 플랫폼 등록**
   - 사이트 도메인:
     - `http://localhost:3000` (개발)
     - `https://yourdomain.com` (프로덕션)

4. **제품 설정 > 카카오 로그인** 이동
   - **활성화 설정** ON
   - **Redirect URI 등록**:
     - `http://localhost:4000/api/auth/kakao/callback` (개발)
     - `https://api.yourdomain.com/api/auth/kakao/callback` (프로덕션)

4. **제품 설정 > 카카오 로그인 > 동의항목** 이동
   - **닉네임**: 필수 동의
   - **카카오계정(이메일)**: 필수 동의 ⚠️ **중요!**

5. **제품 설정 > 카카오 로그인 > 보안** 이동 (선택사항)
   - **Client Secret** 코드 생성
   - 활성화 상태: "사용함"으로 변경
   - 생성된 코드 복사

6. **앱 설정 > 앱 키** 에서 **REST API 키** 복사

### 2.2 환경 변수 설정

`backend/.env` 파일에 추가:
```env
KAKAO_CLIENT_ID=your_kakao_rest_api_key_here
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here  # 선택사항
```

## 3. Naver Login 설정

### 3.1 Naver Developers 설정

1. [Naver Developers](https://developers.naver.com/) 접속 및 로그인
2. **Application > 애플리케이션 등록**
   - 애플리케이션 이름: "방탕출 교육 플랫폼"
   - 사용 API: **네이버 로그인** 선택

3. **로그인 오픈 API 서비스 환경** 설정
   - 서비스 URL:
     - `http://localhost:3000` (개발)
     - `https://yourdomain.com` (프로덕션)
   - Callback URL:
     - `http://localhost:4000/api/auth/naver/callback` (개발)
     - `https://api.yourdomain.com/api/auth/naver/callback` (프로덕션)

4. **제공 정보 선택**
   - 회원이름 (필수)
   - 이메일 주소 (필수)
   - 닉네임 (선택)

5. 등록 완료 후 **Client ID**와 **Client Secret** 복사

### 3.2 환경 변수 설정

`backend/.env` 파일에 추가:
```env
NAVER_CLIENT_ID=your_naver_client_id_here
NAVER_CLIENT_SECRET=your_naver_client_secret_here
```

## 4. 테스트

### 4.1 서버 재시작

환경 변수 설정 후 백엔드 서버 재시작:
```bash
cd backend
npm run dev
```

### 4.2 로그인 테스트

1. 프론트엔드 서버 실행:
```bash
cd frontend
npm run dev
```

2. 브라우저에서 `http://localhost:3000/login` 접속

3. 각 소셜 로그인 버튼 클릭하여 테스트:
   - Google로 계속하기
   - Kakao로 계속하기
   - Naver로 계속하기

4. 로그인 성공 시 메인 페이지로 리디렉션되고, 헤더에 사용자 이름 표시

## 5. 문제 해결

### Google OAuth 오류
- **redirect_uri_mismatch**: Callback URL이 정확히 일치하는지 확인
- **access_denied**: OAuth 동의 화면 설정 확인

### Kakao Login 오류
- **KOE006**: Redirect URI가 등록되지 않음 - Kakao Developers에서 URI 등록 확인
- **KOE101 (앱 관리자 설정 오류)**: 
  - 원인 1: 카카오 로그인이 활성화되지 않음 → 제품 설정 > 카카오 로그인 활성화
  - 원인 2: Redirect URI 미등록 또는 불일치 → 정확한 URI 등록 확인
  - 원인 3: 이메일 동의항목이 필수로 설정되지 않음 → 동의항목에서 이메일을 "필수 동의"로 변경
  - 원인 4: 플랫폼(Web) 미등록 → 앱 설정 > 플랫폼에서 Web 플랫폼 추가
- **KOE303**: 이메일 정보 없음 - 동의항목에서 이메일을 필수로 설정

### Naver Login 오류
- **invalid_request**: Callback URL 불일치 - Naver Developers에서 URL 확인
- **unauthorized_client**: Client ID/Secret 불일치 - 환경 변수 확인

## 6. 프로덕션 배포 시 주의사항

1. **HTTPS 필수**: 프로덕션 환경에서는 반드시 HTTPS 사용
2. **도메인 등록**: 각 OAuth 제공자에 프로덕션 도메인 등록
3. **환경 변수 보안**: `.env` 파일을 Git에 커밋하지 않도록 주의
4. **Callback URL 업데이트**: 프로덕션 서버의 Callback URL로 변경

## 7. 참고 자료

- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [Kakao Login 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Naver Login 문서](https://developers.naver.com/docs/login/api/)

