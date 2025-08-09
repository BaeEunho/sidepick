// Firebase에 직접 보수 여성 테스트 계정 생성
// 서버에서 실행하거나 Firebase Admin SDK가 있는 환경에서 실행

const bcrypt = require('bcrypt');
const admin = require('firebase-admin');

const createTestUsersInFirebase = async () => {
    const testUsers = [
        {
            email: 'conservative_woman1@test.com',
            password: 'test1234',
            name: '김보수',
            gender: 'female',
            birthYear: 1995,
            phone: '010-1234-5678',
            politicalType: 'MCOS', // 문화 보수주의자
            testResult: {
                economic: 25,
                social: 75,
                culture: 80,
                participation: 65
            }
        },
        {
            email: 'conservative_woman2@test.com',
            password: 'test1234',
            name: '이전통',
            gender: 'female',
            birthYear: 1993,
            phone: '010-8765-4321',
            politicalType: 'GCON', // 권위 보수주의자
            testResult: {
                economic: 75,
                social: 80,
                culture: 85,
                participation: 70
            }
        }
    ];

    const db = admin.firestore();
    const usersCollection = db.collection('users');

    for (const user of testUsers) {
        try {
            // 비밀번호 해싱
            const hashedPassword = await bcrypt.hash(user.password, 10);
            
            // Firestore에 사용자 추가
            await usersCollection.doc(user.email).set({
                email: user.email,
                password_hash: hashedPassword,
                name: user.name,
                gender: user.gender,
                birth_year: user.birthYear,
                phone: user.phone,
                political_type: user.politicalType,
                test_result: user.testResult,
                test_completed_at: admin.firestore.FieldValue.serverTimestamp(),
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
                is_test_account: true // 테스트 계정 표시
            });
            
            console.log(`✅ ${user.name} (${user.email}) 계정 생성 완료`);
            
        } catch (error) {
            console.error(`❌ ${user.name} 계정 생성 실패:`, error);
        }
    }
    
    console.log('\n=== Firebase 테스트 계정 생성 완료 ===');
};

// 실행
if (require.main === module) {
    createTestUsersInFirebase()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = createTestUsersInFirebase;