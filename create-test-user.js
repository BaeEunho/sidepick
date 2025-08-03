// 테스트용 계정 생성 스크립트
const { admin, db, collections } = require('./firebase-config');
const bcrypt = require('bcrypt');

async function createTestUser() {
    try {
        const email = 'toqha1585@gmail.com';
        const password = 'password123'; // 원하는 비밀번호로 변경
        
        const passwordHash = await bcrypt.hash(password, 10);
        
        const testUser = {
            email: email,
            password_hash: passwordHash,
            name: '테스트 유저',
            phone: '010-1234-5678',
            birthdate: '1990-01-01',
            gender: 'male',
            political_type: null,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await collections.users.doc(email).set(testUser);
        console.log('테스트 계정 생성 완료\!');
        console.log('이메일:', email);
        console.log('비밀번호:', password);
        process.exit(0);
    } catch (error) {
        console.error('계정 생성 실패:', error);
        process.exit(1);
    }
}

createTestUser();
