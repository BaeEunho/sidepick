#!/bin/bash

# 사이드픽 서버 배포 스크립트
# Ubuntu/Debian 기준

echo "=== 사이드픽 서버 설정 시작 ==="

# 1. Node.js 설치 확인
if ! command -v node &> /dev/null; then
    echo "Node.js 설치 중..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "Node.js 버전: $(node -v)"
echo "NPM 버전: $(npm -v)"

# 2. PM2 설치
if ! command -v pm2 &> /dev/null; then
    echo "PM2 설치 중..."
    sudo npm install -g pm2
fi

# 3. 프로젝트 디렉토리로 이동
cd /var/www/sidepick || exit

# 4. 의존성 설치
echo "의존성 설치 중..."
npm install

# 5. 환경 변수 설정 확인
if [ ! -f .env ]; then
    echo "=== .env 파일을 생성해주세요 ==="
    echo "JWT_SECRET=your-secret-key-here"
    echo "EMAIL_USER=your-email@gmail.com"
    echo "EMAIL_PASS=your-app-password"
    exit 1
fi

# 6. PM2로 서버 시작
echo "서버 시작 중..."
pm2 stop sidepick-api 2>/dev/null
pm2 start server-simple.js --name sidepick-api
pm2 save
pm2 startup

# 7. 서버 상태 확인
sleep 3
echo "=== 서버 상태 확인 ==="
curl http://localhost:3000/api/status

echo ""
echo "=== 설정 완료 ==="
echo "다음 명령어로 로그 확인: pm2 logs sidepick-api"
echo "서버 재시작: pm2 restart sidepick-api"