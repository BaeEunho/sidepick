# Glitch.com으로 백엔드 배포하기 (가장 간단!)

## 1. Glitch 접속
https://glitch.com 접속 (계정 생성 불필요)

## 2. 새 프로젝트 생성
1. "New project" 클릭
2. "glitch-hello-node" 선택

## 3. 파일 업로드
1. 좌측 Files 패널에서 기존 파일들 삭제
2. "Upload" 버튼으로 파일 업로드:
   - server-simple.js
   - firebase-config.js
   - package.json

## 4. 환경 변수 설정
1. 좌측 하단 "Tools" → "Terminal" 클릭
2. `.env` 파일 편집:
   ```
   JWT_SECRET=your-secret-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

## 5. package.json 수정
"scripts" 부분에 추가:
```json
"scripts": {
  "start": "node server-simple.js"
}
```

## 6. 프로젝트 URL 확인
상단에 표시되는 URL 복사 (예: https://your-project-name.glitch.me)

## 7. 프론트엔드 config.js 업데이트
```javascript
API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://your-project-name.glitch.me'
```

## 장점
- 완전 무료
- 브라우저에서 직접 편집 가능
- Git/GitHub 불필요
- 즉시 배포

## 단점
- 5분간 요청이 없으면 sleep (첫 요청 시 지연)
- 코드가 공개됨 (private은 유료)