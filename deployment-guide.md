# 사이드픽 배포 가이드

## 배포 환경 체크리스트

### 1. 서버 설정
- [ ] Node.js 서버 (`server-simple.js`) 실행 중
- [ ] 포트 3000 또는 환경에 맞는 포트 설정
- [ ] PM2 또는 다른 프로세스 매니저로 서버 관리

### 2. 환경 변수 설정
`.env` 파일에 다음 변수들이 설정되어 있어야 함:
```
JWT_SECRET=your-secret-key
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Firebase 설정
- [ ] `firebase-config.js` 파일이 올바르게 설정됨
- [ ] Firebase 프로젝트가 활성화됨
- [ ] Firestore 데이터베이스 규칙이 설정됨

### 4. API 엔드포인트 확인
배포 환경에 맞게 API URL을 수정해야 할 수 있습니다.

현재 설정:
- 로컬: `http://localhost:3000`
- 배포: `''` (상대 경로)

만약 프론트엔드와 백엔드가 다른 도메인에 있다면:
1. 모든 API 호출 부분에서 실제 백엔드 URL로 변경
2. CORS 설정 확인

### 5. 배포 환경별 API URL 설정

#### 옵션 1: 환경 변수 사용
```javascript
const API_URL = process.env.REACT_APP_API_URL || 
                (window.location.hostname === 'localhost' 
                    ? 'http://localhost:3000' 
                    : 'https://sidepick.onrender.com');
```

#### 옵션 2: 설정 파일 사용
`config.js` 파일 생성:
```javascript
window.APP_CONFIG = {
    API_URL: 'https://sidepick.onrender.com'
};
```

### 6. 디버깅 팁

1. 브라우저 개발자 도구 콘솔 확인
2. Network 탭에서 API 호출 확인
3. 서버 로그 확인

### 7. 일반적인 문제 해결

#### 로그인이 안 될 때:
1. 콘솔에서 에러 메시지 확인
2. Network 탭에서 `/api/auth/login` 요청 확인
3. 서버 로그에서 요청이 도착하는지 확인

#### CORS 에러:
서버의 CORS 설정 확인 (`server-simple.js`):
```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});
```

#### 404 에러:
- 서버가 실행 중인지 확인
- API 경로가 올바른지 확인
- 프록시 설정이 필요한지 확인