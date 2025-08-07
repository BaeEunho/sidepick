// JWT Secret 생성 스크립트
const crypto = require('crypto');

// 32바이트 (256비트) 랜덤 문자열 생성
const secret = crypto.randomBytes(32).toString('hex');

console.log('=== Generated JWT Secret ===');
console.log(secret);
console.log('\n이 값을 Render 환경 변수에 설정하세요:');
console.log('Key: JWT_SECRET');
console.log(`Value: ${secret}`);