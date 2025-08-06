# 같은 서버에서 프론트엔드와 백엔드 함께 운영하기

## 서버에 SSH 접속 후 실행:

### 1. Node.js 설치
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs
```

### 2. PM2 설치
```bash
sudo npm install -g pm2
```

### 3. 프로젝트 파일 업로드
```bash
# 백엔드 파일들을 서버에 업로드
# server-simple.js, package.json, firebase-config.js, .env
```

### 4. 의존성 설치
```bash
cd /path/to/your/backend
npm install
```

### 5. PM2로 서버 시작
```bash
pm2 start server-simple.js --name sidepick-api
pm2 save
pm2 startup
```

### 6. 웹서버 설정 (Apache 예시)
```apache
# /etc/apache2/sites-available/sidepick.conf

<VirtualHost *:80>
    ServerName www.sidepick.co.kr
    DocumentRoot /var/www/sidepick

    # API 프록시
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
</VirtualHost>
```

Apache 모듈 활성화:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

### 7. config.js 수정
```javascript
API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : '' // 같은 도메인이므로 빈 문자열
```