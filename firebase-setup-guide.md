# Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: sidepick)
4. Google Analytics 설정 (선택사항)

## 2. Firestore Database 설정

1. Firebase Console에서 "Firestore Database" 선택
2. "데이터베이스 만들기" 클릭
3. 프로덕션 모드로 시작
4. 위치 선택 (asia-northeast3 - 서울 권장)

## 3. 서비스 계정 키 생성

1. Firebase Console에서 프로젝트 설정 > 서비스 계정 탭
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드
4. 다운로드한 JSON 파일의 내용을 .env 파일에 추가

## 4. .env 파일 설정

1. `.env.example` 파일을 복사하여 `.env` 파일 생성
2. Firebase 서비스 계정 키의 정보를 입력:

```bash
# .env 파일
JWT_SECRET=your-secure-random-string

# Firebase 설정 (다운로드한 JSON 파일에서 복사)
FIREBASE_PROJECT_ID=sidepick-xxxxx
FIREBASE_PRIVATE_KEY_ID=xxxxxxxxxxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@sidepick-xxxxx.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=xxxxxxxxxxxxx
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40sidepick-xxxxx.iam.gserviceaccount.com

# 이메일 설정
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 5. Firestore 보안 규칙

Firebase Console에서 Firestore > 규칙 탭에서 다음 규칙 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 데이터만 읽을 수 있음
    match /users/{email} {
      allow read: if request.auth != null && request.auth.token.email == email;
      allow write: if false; // 서버에서만 쓰기 가능
    }
    
    // 인증 코드는 서버에서만 접근
    match /verificationCodes/{document=**} {
      allow read, write: if false;
    }
    
    // 예약 정보는 서버에서만 접근
    match /bookings/{document=**} {
      allow read, write: if false;
    }
    
    // 모임 정보는 모두 읽기 가능
    match /meetings/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## 6. 서버 실행

1. 기존 서버 종료 (Ctrl+C)
2. Firebase 서버 실행:

```bash
node server-firebase.js
```

## 7. 개발 환경 (Firebase 에뮬레이터)

로컬 개발 시 Firebase 에뮬레이터를 사용하려면:

1. Firebase CLI 설치:
```bash
npm install -g firebase-tools
```

2. Firebase 프로젝트 초기화:
```bash
firebase init
```

3. Firestore 에뮬레이터 선택

4. 에뮬레이터 실행:
```bash
firebase emulators:start --only firestore
```

5. `.env` 파일에서 Firebase 설정을 비워두면 자동으로 에뮬레이터 모드로 실행됩니다.

## 주요 변경사항

1. **데이터 영속성**: 서버 재시작해도 데이터가 유지됩니다
2. **확장성**: 여러 서버 인스턴스에서 동일한 데이터 접근 가능
3. **실시간 동기화**: Firestore의 실시간 리스너 기능 활용 가능
4. **백업**: Firebase Console에서 자동 백업 설정 가능

## 문제 해결

1. **"Firebase 초기화 실패" 오류**
   - .env 파일의 Firebase 설정 확인
   - 서비스 계정 키가 올바른지 확인

2. **"권한이 없습니다" 오류**
   - Firestore 보안 규칙 확인
   - 서비스 계정 권한 확인

3. **이메일 전송 실패**
   - Gmail 앱 비밀번호 생성 필요
   - 2단계 인증 활성화 후 앱 비밀번호 사용