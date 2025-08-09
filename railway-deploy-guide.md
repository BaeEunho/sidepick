# Railway.app으로 백엔드 배포하기 (GitHub 없이)

## 1. Railway 계정 생성
https://railway.app 에서 이메일로 가입

## 2. Railway CLI 설치
```bash
# Windows (PowerShell 관리자 권한)
npm install -g @railway/cli

# 또는 수동 다운로드
# https://github.com/railwayapp/cli/releases
```

## 3. 백엔드 폴더 생성
```bash
mkdir sidepick-backend
cd sidepick-backend

# 필요한 파일 복사
copy ..\server-simple.js .
copy ..\firebase-config.js .
copy ..\package.json .
```

## 4. Railway 로그인
```bash
railway login
```

## 5. 새 프로젝트 생성 및 배포
```bash
# 프로젝트 초기화
railway init

# 환경 변수 설정
railway variables set JWT_SECRET=your-secret-key
railway variables set EMAIL_USER=your-email@gmail.com
railway variables set EMAIL_PASS=your-app-password

# 배포
railway up
```

## 6. URL 확인
```bash
railway open
```

배포된 URL이 표시됩니다 (예: https://sidepick-backend.up.railway.app)

## 7. 프론트엔드 config.js 업데이트
```javascript
API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://sidepick-backend.up.railway.app'
```

## 장점
- GitHub 필요 없음
- CLI로 직접 배포
- 무료 크레딧 $5 제공 (약 1-2개월 사용 가능)