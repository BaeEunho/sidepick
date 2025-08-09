# Render.com 백엔드 배포 가이드 (무료)

## 1. Render.com 계정 생성
https://render.com 에서 GitHub으로 가입

## 2. GitHub에 백엔드 코드 업로드
백엔드 파일들을 GitHub 저장소에 업로드:
- server-simple.js
- firebase-config.js
- package.json
- .gitignore (node_modules 제외)

## 3. Render에서 새 Web Service 생성
1. Dashboard → New → Web Service
2. GitHub 저장소 연결
3. 설정:
   - Name: sidepick-api
   - Environment: Node
   - Build Command: npm install
   - Start Command: node server-simple.js

## 4. 환경 변수 설정
Environment 탭에서:
- JWT_SECRET = your-secret-key
- EMAIL_USER = your-email@gmail.com
- EMAIL_PASS = your-app-password

## 5. 배포
자동으로 배포됨. URL 형태:
https://sidepick-api.onrender.com

## 6. 프론트엔드 업데이트
config.js 파일 수정:
```javascript
API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://sidepick-api.onrender.com'
```

## 장점
- 완전 무료
- 자동 HTTPS
- GitHub 연동으로 자동 배포
- 환경 변수 관리 UI 제공

## 주의사항
- 무료 플랜은 15분 동안 요청이 없으면 서버가 sleep 모드로 전환
- 첫 요청 시 10-30초 정도 지연될 수 있음