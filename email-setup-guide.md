# 이메일 인증 설정 가이드

## 1. 필요한 패키지 설치

```bash
npm init -y
npm install express nodemailer cors dotenv
```

## 2. Gmail 설정 (권장)

### 2-1. Google 계정 설정
1. [Google 계정 설정](https://myaccount.google.com/security) 접속
2. **2단계 인증** 활성화
3. **앱 비밀번호** 생성:
   - 보안 → 2단계 인증 → 앱 비밀번호
   - 앱 선택: 메일
   - 기기 선택: 기타 (사이드픽)
   - 생성된 16자리 비밀번호 복사

### 2-2. .env 파일 설정
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # 16자리 앱 비밀번호 (공백 포함)
PORT=3001
```

## 3. 네이버 메일 설정 (대안)

### 3-1. 네이버 메일 설정
1. [네이버 메일 환경설정](https://mail.naver.com) 접속
2. 환경설정 → POP3/IMAP 설정
3. **IMAP/SMTP 사용함** 체크

### 3-2. email-server.js 수정
```javascript
// Gmail 대신 네이버 설정 사용
const transporter = nodemailer.createTransport({
    service: 'naver',
    host: 'smtp.naver.com',
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
```

### 3-3. .env 파일 설정
```env
EMAIL_USER=your-id@naver.com
EMAIL_PASS=your-naver-password
PORT=3001
```

## 4. 서버 실행

```bash
# .env 파일 생성 후
node email-server.js
```

## 5. 클라이언트 연동

### 5-1. 개발 환경
- signup.html의 SERVER_URL을 `http://localhost:3001`로 설정
- CORS 이슈 없음 (email-server.js에서 처리)

### 5-2. 프로덕션 환경
```javascript
// signup.html 수정
const SERVER_URL = 'https://api.sidepick.kr'; // 실제 서버 URL
```

## 6. 보안 주의사항

1. **환경 변수 관리**
   - .env 파일은 절대 Git에 커밋하지 마세요
   - .gitignore에 .env 추가 필수

2. **Rate Limiting 추가** (선택사항)
```javascript
const rateLimit = require('express-rate-limit');

const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 5, // 최대 5회
    message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.'
});

app.use('/api/email/send-verification', emailLimiter);
```

3. **프로덕션 체크리스트**
   - [ ] HTTPS 사용
   - [ ] 환경 변수 안전하게 관리
   - [ ] 에러 로깅 설정
   - [ ] 이메일 발송 실패 시 재시도 로직

## 7. 테스트

1. 서버 실행: `node email-server.js`
2. 브라우저에서 signup.html 열기
3. 이메일 입력 후 "인증번호 발송" 클릭
4. 이메일 확인 (Gmail/네이버)
5. 받은 인증 코드 입력

## 8. 트러블슈팅

### Gmail 발송 실패
- 2단계 인증 확인
- 앱 비밀번호 재생성
- "보안 수준이 낮은 앱 허용" 설정 불필요 (앱 비밀번호 사용 시)

### 네이버 발송 실패
- SMTP 사용 설정 확인
- 해외 IP 차단 해제 필요할 수 있음

### 인증 코드 미수신
- 스팸 메일함 확인
- 발신 이메일 주소 신뢰도 문제일 수 있음
- 도메인 인증(SPF, DKIM) 설정 권장

## 9. 프로덕션 이메일 서비스 (권장)

실제 서비스에서는 전문 이메일 서비스 사용 권장:
- SendGrid
- AWS SES
- Mailgun
- 네이버 클라우드 플랫폼 Outbound Mailer

이들 서비스는 더 높은 전송률과 분석 기능을 제공합니다.