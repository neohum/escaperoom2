# 🔐 OAuth 소셜 로그인 빠른 설정 가이드

## ⚠️ 현재 상황
OAuth 클라이언트 ID가 설정되지 않아 소셜 로그인이 작동하지 않습니다.

---

## 🚀 Google OAuth 설정 (5분)

### 1단계: Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/) 로그인
2. 프로젝트 생성: "방탈출교육플랫폼" (없으면 생성)

### 2단계: OAuth 동의 화면 설정
1. 좌측 메뉴 **API 및 서비스** > **OAuth 동의 화면**
2. **사용자 유형**: **외부** 선택 → **만들기**
3. 필수 정보 입력:
   ```
   앱 이름: 방탈출 교육 플랫폼
   사용자 지원 이메일: neohum77@gmail.com
   개발자 연락처: neohum77@gmail.com
   ```
4. **저장 후 계속** 클릭
5. **범위** 단계: 건너뛰기 (기본값 사용)
6. **테스트 사용자** 단계: 
   - **ADD USERS** 클릭
   - `neohum77@gmail.com` 추가
7. **저장 후 대시보드로 돌아가기**

### 3단계: OAuth 클라이언트 ID 생성
1. 좌측 메뉴 **API 및 서비스** > **사용자 인증 정보**
2. **+ 사용자 인증 정보 만들기** > **OAuth 클라이언트 ID**
3. 설정:
   ```
   애플리케이션 유형: 웹 애플리케이션
   이름: 방탈출 교육 플랫폼 Web
   
   승인된 자바스크립트 원본:
   - http://localhost:3000
   
   승인된 리디렉션 URI:
   - http://localhost:4000/api/auth/google/callback
   ```
4. **만들기** 클릭

### 4단계: 클라이언트 ID 복사
생성 후 팝업에 표시되는 정보를 복사:
- **클라이언트 ID**: `123456789-abcdefg.apps.googleusercontent.com`
- **클라이언트 보안 비밀**: `GOCSPX-xxxxxxxxxxxx`

---

## 📝 .env 파일 업데이트

### backend/.env 파일에 추가:
```env
# Google OAuth (방금 복사한 값으로 변경)
GOOGLE_CLIENT_ID=여기에_클라이언트_ID_붙여넣기
GOOGLE_CLIENT_SECRET=여기에_클라이언트_보안_비밀_붙여넣기
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

---

## 🔄 적용 방법

1. `.env` 파일 저장
2. 백엔드 서버 재시작 (자동으로 nodemon이 감지)
3. 브라우저에서 **Google 로그인** 버튼 클릭
4. 로그인 성공! ✅

---

## ❌ 자주 발생하는 오류

### 1. "액세스 차단됨: 승인 오류 (401)"
**원인**: OAuth 클라이언트 ID가 .env에 없거나 잘못됨  
**해결**: 위 4단계의 값을 정확히 복사하여 .env에 붙여넣기

### 2. "redirect_uri_mismatch"
**원인**: Google Console의 리디렉션 URI가 다름  
**해결**: `http://localhost:4000/api/auth/google/callback` 정확히 입력

### 3. "Access blocked: This app's request is invalid"
**원인**: OAuth 동의 화면 설정 안됨  
**해결**: 위 2단계 다시 확인

---

## 🧪 테스트 방법

1. 브라우저에서 http://localhost:3000 접속
2. **로그인** 버튼 클릭
3. **Google로 로그인** 선택
4. Google 계정으로 로그인
5. 성공 시 메인 페이지로 리디렉션

---

## 📱 선택사항: 카카오/네이버 로그인

현재는 Google만 설정하면 됩니다.  
나중에 필요하면 `OAUTH_SETUP.md` 참고하여 추가 설정 가능합니다.

---

## 💡 도움이 필요하면

1. Google Cloud Console 스크린샷 공유
2. `.env` 파일 내용 확인 (비밀번호 제외)
3. 브라우저 콘솔 에러 메시지 확인
