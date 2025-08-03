# 사이드픽 테스트 가이드

## 1. 데모 모드 테스트 (서버 없이)

가장 간단한 테스트 방법입니다. 서버 설정 없이 바로 테스트할 수 있습니다.

### 실행 방법
```bash
# Python이 설치된 경우
python -m http.server 8080

# Node.js가 설치된 경우  
npx http-server -p 8080

# VS Code 사용 시
# Live Server 확장 설치 후 index.html 우클릭 > "Open with Live Server"
```

### 브라우저에서 접속
http://localhost:8080

### 테스트 시나리오
1. **회원가입**: 아무 이메일로 가입 (데모 모드에서는 모든 입력 허용)
2. **로그인**: 가입한 이메일로 로그인
3. **정치 성향 테스트**: 60개 질문 완료
4. **미팅 신청**: 성향에 맞는 미팅 신청
5. **결제**: 데모 결제 프로세스 진행

## 2. 서버 포함 테스트 (실제 환경)

### 사전 준비
1. MySQL 설치 (또는 XAMPP/MAMP 사용)
2. Node.js 설치

### 데이터베이스 설정
```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE sidepick;
USE sidepick;

# 스키마 적용
source database-schema.sql;
```

### 서버 설정
```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 DB 정보 수정

# 3. 서버 실행
npm start
```

### 클라이언트 실행
```bash
# 새 터미널에서
npm run client
```

### 브라우저에서 테스트
- 서버: http://localhost:3000
- 클라이언트: http://localhost:8080

## 3. 빠른 테스트를 위한 콘솔 명령어

브라우저 개발자 도구 콘솔(F12)에서 사용:

```javascript
// 로그인 상태 확인
console.log('로그인:', sessionStorage.getItem('isLoggedIn'));
console.log('이메일:', sessionStorage.getItem('userEmail'));
console.log('정치성향:', sessionStorage.getItem('politicalType'));

// 테스트 데이터 설정 (빠른 테스트용)
// 로그인 상태로 만들기
sessionStorage.setItem('isLoggedIn', 'true');
sessionStorage.setItem('userEmail', 'test@example.com');
sessionStorage.setItem('userProfile', JSON.stringify({
    name: '테스터',
    email: 'test@example.com',
    phone: '010-1234-5678',
    birthdate: '1995-01-01',
    gender: 'male'
}));
sessionStorage.setItem('userGender', 'male');

// 정치 성향 테스트 완료 상태로 만들기 (진보)
sessionStorage.setItem('politicalType', 'MPOS');
sessionStorage.setItem('userType', JSON.stringify({
    code: 'MPOS',
    title: '시장 다원주의자',
    orientation: 'progressive'
}));
sessionStorage.setItem('hasCompletedTest', 'true');

// 페이지 새로고침
location.reload();

// 모든 세션 데이터 초기화
sessionStorage.clear();
```

## 4. 주요 테스트 포인트

### 회원가입/로그인
- [ ] 이메일 형식 검증
- [ ] 비밀번호 규칙 (8자 이상, 영문+숫자+특수문자)
- [ ] 나이 제한 (만 20세 이상)
- [ ] 휴대폰 번호 형식

### 정치 성향 테스트
- [ ] 60개 질문 모두 표시
- [ ] 답변 저장 및 점수 계산
- [ ] 16가지 성향 중 하나 결과 표시
- [ ] 테스트 완료 상태 저장

### 미팅 신청
- [ ] 진보/보수 성향별 미팅 필터링
- [ ] 중복 신청 방지
- [ ] 신청 정보 저장

### 마이페이지
- [ ] 프로필 정보 표시
- [ ] 정치 성향 결과 표시
- [ ] 신청한 미팅 목록
- [ ] 결제 상태 표시

## 5. 문제 해결

### 서버 연결 실패
- 서버가 실행 중인지 확인: `npm start`
- 포트 충돌 확인: 3000번 포트 사용 중인지 확인
- CORS 설정 확인

### 데이터베이스 연결 실패
- MySQL 서비스 실행 확인
- .env 파일의 DB 정보 확인
- 데이터베이스와 테이블 생성 확인

### 로그인 안됨
- 브라우저 콘솔에서 에러 확인
- sessionStorage 데이터 확인
- 서버 로그 확인

## 6. 개발자 도구 활용

Chrome/Edge 개발자 도구(F12) 활용:
- **Network 탭**: API 요청/응답 확인
- **Console 탭**: JavaScript 에러 확인
- **Application 탭**: sessionStorage/localStorage 데이터 확인
- **Elements 탭**: HTML/CSS 확인