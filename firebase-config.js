// Firebase Admin SDK 설정
const admin = require('firebase-admin');
const path = require('path');

// Firebase 초기화
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    // Base64로 인코딩된 서비스 계정 사용 (Render 등 PaaS용)
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(json);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log('Firebase Admin SDK 초기화 완료 (Base64 환경변수 사용)');
  } else if (process.env.SERVICE_ACCOUNT_PATH) {
    // 서비스 계정 파일 경로 사용
    const serviceAccountPath = path.resolve(process.env.SERVICE_ACCOUNT_PATH);
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log('Firebase Admin SDK 초기화 완료 (서비스 계정 파일 사용)');
  } else {
    // 개발 환경에서는 에뮬레이터 사용
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    admin.initializeApp({
      projectId: 'sidepick-demo'
    });
    console.log('Firebase 에뮬레이터 모드로 실행 중');
  }
} catch (error) {
  console.error('Firebase 초기화 실패:', error);
}

// Firestore 인스턴스
const db = admin.firestore();

// 컬렉션 참조
const collections = {
  users: db.collection('users'),
  meetings: db.collection('meetings'),
  bookings: db.collection('bookings'),
  verificationCodes: db.collection('verificationCodes')
};

module.exports = {
  admin,
  db,
  collections
};