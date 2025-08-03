# 사이드픽 결제 서버 구축 가이드

## 1. 서버 요구사항
- Node.js 18+ 또는 Python 3.8+
- HTTPS 필수 (SSL 인증서)
- 데이터베이스 (MySQL/PostgreSQL)

## 2. 서버 구조
```
sidepick-server/
├── app.js                 # 메인 서버 파일
├── routes/
│   ├── payment.js        # 결제 라우트
│   └── webhook.js        # 웹훅 처리
├── models/
│   ├── order.js          # 주문 모델
│   └── payment.js        # 결제 모델
└── config/
    └── toss.js           # 토스페이먼츠 설정
```

## 3. 필수 API 엔드포인트

### 3-1. 결제 요청 검증
```javascript
POST /api/payment/confirm
{
  "orderId": "ORD-xxx",
  "amount": 45000,
  "paymentKey": "xxx"
}
```

### 3-2. 결제 승인
```javascript
POST /api/payment/approve
{
  "paymentKey": "xxx",
  "orderId": "ORD-xxx",
  "amount": 45000
}
```

### 3-3. 웹훅 수신
```javascript
POST /api/webhook/payment
```

## 4. 보안 체크리스트
- [ ] HTTPS 적용
- [ ] API 키 환경변수로 관리
- [ ] CORS 설정
- [ ] Rate Limiting
- [ ] SQL Injection 방지
- [ ] XSS 방지