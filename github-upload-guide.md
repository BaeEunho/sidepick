# GitHub에 백엔드 코드 업로드하기

## 1. GitHub 계정이 없다면
https://github.com 에서 계정 생성

## 2. 새 저장소 생성
1. GitHub 로그인 후 우측 상단 '+' 클릭
2. 'New repository' 선택
3. Repository name: `sidepick-backend`
4. Public 선택 (무료)
5. 'Create repository' 클릭

## 3. 백엔드 파일 준비
새 폴더에 백엔드 파일들만 복사:
```bash
mkdir sidepick-backend
cd sidepick-backend

# 필요한 파일들 복사 (Windows PowerShell)
copy ..\server-simple.js .
copy ..\firebase-config.js .
copy ..\package.json .
copy ..\Procfile .
copy ..\.env.example .env
```

## 4. Git 초기화 및 업로드
```bash
# Git 초기화
git init

# 파일 추가
git add .

# 커밋
git commit -m "Initial backend setup"

# GitHub 저장소 연결 (your-username을 실제 GitHub 사용자명으로 변경)
git remote add origin https://github.com/your-username/sidepick-backend.git

# 코드 푸시
git branch -M main
git push -u origin main
```

## 5. GitHub 인증
- Username: GitHub 사용자명
- Password: GitHub Personal Access Token (비밀번호 대신)
  * Settings → Developer settings → Personal access tokens → Generate new token

## 6. Render.com으로 돌아가기
1. Render.com에서 'New' → 'Web Service'
2. 'Connect account' 클릭해서 GitHub 연결
3. 저장소 목록에서 'sidepick-backend' 선택

## 대안: 직접 업로드 (Git 없이)
1. GitHub에서 'Upload files' 버튼 클릭
2. 파일들을 드래그 앤 드롭
3. Commit 메시지 입력 후 'Commit changes' 클릭