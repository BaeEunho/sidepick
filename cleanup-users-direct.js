// Firebase Admin SDK 직접 초기화
const admin = require('firebase-admin');
const path = require('path');

// 서비스 계정 파일 경로
const serviceAccountPath = path.resolve('./secret/sidepick-5e2bc-firebase-adminsdk-fbsvc-9dc442aa4b.json');
const serviceAccount = require(serviceAccountPath);

// Firebase 초기화
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

async function cleanupUsers() {
    console.log('=== 사용자 정리 시작 ===');
    console.log('clsrna3@naver.com을 제외한 모든 사용자를 삭제합니다...\n');
    
    try {
        // 1. 모든 사용자 조회
        const usersSnapshot = await db.collection('users').get();
        console.log(`전체 사용자 수: ${usersSnapshot.size}`);
        
        let deleteCount = 0;
        let keepCount = 0;
        const batch = db.batch();
        
        // 2. 각 사용자 처리
        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            const email = doc.id;
            
            if (email === 'clsrna3@naver.com') {
                console.log(`✓ 유지: ${email}`);
                keepCount++;
            } else {
                console.log(`✗ 삭제 예정: ${email}`);
                
                // 사용자 문서 삭제
                batch.delete(doc.ref);
                
                // 해당 사용자의 모든 booking도 함께 삭제
                const bookingsSnapshot = await db.collection('bookings')
                    .where('userEmail', '==', email)
                    .get();
                
                bookingsSnapshot.forEach(bookingDoc => {
                    batch.delete(bookingDoc.ref);
                });
                
                deleteCount++;
                console.log(`  - ${email}의 bookings ${bookingsSnapshot.size}개 삭제 예정`);
            }
        }
        
        // 3. 배치 실행
        console.log('\n삭제 작업 실행 중...');
        await batch.commit();
        
        console.log('\n=== 정리 완료 ===');
        console.log(`삭제된 사용자: ${deleteCount}명`);
        console.log(`유지된 사용자: ${keepCount}명`);
        
        // 4. 최종 확인
        const finalSnapshot = await db.collection('users').get();
        console.log(`\n최종 사용자 수: ${finalSnapshot.size}`);
        
        finalSnapshot.forEach(doc => {
            console.log(`- ${doc.id}`);
        });
        
    } catch (error) {
        console.error('사용자 정리 중 오류:', error);
    }
    
    process.exit(0);
}

// 실행
cleanupUsers();