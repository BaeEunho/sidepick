#!/bin/bash

# PM2로 서버 시작
echo "🚀 서버를 시작합니다..."

# 기존 프로세스 종료 (있다면)
npx pm2 stop sidepick 2>/dev/null
npx pm2 delete sidepick 2>/dev/null

# 서버 시작
npx pm2 start server-simple.js --name sidepick

# 로그 보기
echo "✅ 서버가 시작되었습니다!"
echo ""
echo "유용한 명령어:"
echo "  npx pm2 status     - 서버 상태 확인"
echo "  npx pm2 logs       - 로그 보기"
echo "  npx pm2 stop all   - 서버 중지"
echo "  npx pm2 restart all - 서버 재시작"
echo ""
echo "서버는 백그라운드에서 계속 실행됩니다."