# 사이드픽 실제 인증 시스템 설정 가이드

## 사전 준비사항

1. **Node.js 설치** (v14 이상)
2. **MySQL 설치** (v5.7 이상)

## 1단계: 데이터베이스 설정

### MySQL 데이터베이스 생성

```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE sidepick;

# 데이터베이스 선택
USE sidepick;

# database-schema.sql 파일 실행
source database-schema.sql;
```

## 2단계: 서버 설정

### 패키지 설치

```bash
npm install
```

### 환경 변수 설정

`.env` 파일을 열어 MySQL 설정에 맞게 수정:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password  # MySQL 비밀번호 입력
DB_NAME=sidepick
JWT_SECRET=your-secret-key  # 안전한 비밀키로 변경
```

## 3단계: 서버 실행

### 개별 터미널에서 실행

**터미널 1: 백엔드 서버 (포트 3000)**
```bash
npm start
# 또는 개발 모드
npm run dev
```

**터미널 2: 프론트엔드 서버 (포트 8080)**
```bash
npm run client
# 또는
python3 -m http.server 8080
```

## 4단계: 접속 및 테스트

1. 브라우저에서 `http://localhost:8080` 접속
2. 회원가입 진행
3. 로그인 테스트

## 서버 상태 확인

- 백엔드 서버가 실행 중이면: **실제 인증 모드**
  - 회원 정보가 MySQL에 저장됨
  - JWT 토큰 기반 인증
  - 실제 이메일/비밀번호 검증

- 백엔드 서버가 꺼져있으면: **데모 모드**
  - 회원 정보가 브라우저 localStorage에 저장됨
  - 비밀번호 검증 없음
  - 테스트용으로만 사용

## 문제 해결

### MySQL 연결 오류
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
→ MySQL 서버가 실행 중인지 확인

### 포트 충돌
```
Error: listen EADDRINUSE: address already in use :::3000
```
→ 다른 프로세스가 포트를 사용 중. 해당 프로세스 종료 또는 포트 변경

### CORS 오류
→ 브라우저에서 `http://localhost:8080`으로 접속 (파일 경로 직접 열기 X)