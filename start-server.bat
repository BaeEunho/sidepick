@echo off
echo 사이드픽 웹 서버를 시작합니다...
echo.
echo 서버가 시작되면 브라우저에서 다음 주소로 접속하세요:
echo http://localhost:8000
echo.
echo 종료하려면 Ctrl+C를 누르세요.
echo.
python -m http.server 8000