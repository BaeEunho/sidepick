# Heroku 백엔드 배포 가이드

## 1. Heroku CLI 설치
https://devcenter.heroku.com/articles/heroku-cli

## 2. Heroku 계정 생성 및 로그인
```bash
heroku login
```

## 3. 백엔드 전용 폴더 생성
```bash
# 백엔드 파일만 있는 새 폴더 생성
mkdir sidepick-backend
cd sidepick-backend

# 필요한 파일 복사
cp ../server-simple.js .
cp ../firebase-config.js .
cp ../package.json .
cp ../Procfile .
cp ../.env.example .env
```

## 4. Git 저장소 초기화
```bash
git init
git add .
git commit -m "Initial commit"
```

## 5. Heroku 앱 생성
```bash
heroku create sidepick-api
# 또는 원하는 이름으로
# heroku create your-app-name
```

## 6. 환경 변수 설정
```bash
heroku config:set JWT_SECRET=your-secret-key-here
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
```

## 7. Firebase 서비스 계정 키 설정
Firebase 서비스 계정 키를 환경 변수로 설정:
```bash
# firebase-key.json 내용을 base64로 인코딩
cat firebase-key.json | base64

# 환경 변수로 설정
heroku config:set FIREBASE_SERVICE_ACCOUNT_BASE64=<base64-encoded-string>
```

## 8. 배포
```bash
git push heroku main
```

## 9. 로그 확인
```bash
heroku logs --tail
```

## 10. 앱 URL 확인
```bash
heroku info
# Web URL이 백엔드 주소입니다
# 예: https://sidepick-api.herokuapp.com
```

## 11. 프론트엔드 config.js 업데이트
```javascript
API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://sidepick-api.herokuapp.com', // Heroku 앱 URL
```