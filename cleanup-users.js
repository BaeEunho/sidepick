// Firebase 설정 가져오기
const { admin, db, collections } = require('./firebase-config');

async function cleanupUsers() {
    console.log('=== 사용자 정리 시작 ===');
    console.log('clsrna3@naver.com을 제외한 모든 사용자를 삭제합니다...\n');
    
    try {
        // 1. 모든 사용자 조회
        const usersSnapshot = await collections.users.get();
        console.log(`전체 사용자 수: ${usersSnapshot.size}`);
        
        let deleteCount = 0;
        let keepCount = 0;
        
        // 2. 각 사용자 처리
        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            const email = doc.id;
            
            if (email === 'clsrna3@naver.com') {
                console.log(`✓ 유지: ${email}`);
                keepCount++;
            } else {
                console.log(`✗ 삭제: ${email}`);
                
                // 사용자 문서 삭제
                await collections.users.doc(email).delete();
                
                // 해당 사용자의 모든 booking 삭제
                const bookingsSnapshot = await collections.bookings
                    .where('userEmail', '==', email)
                    .get();
                
                const batch = db.batch();
                bookingsSnapshot.forEach(bookingDoc => {
                    batch.delete(bookingDoc.ref);
                });
                await batch.commit();
                
                deleteCount++;
                console.log(`  - bookings ${bookingsSnapshot.size}개 삭제 완료`);
            }
        }
        
        console.log('\n=== 정리 완료 ===');
        console.log(`삭제된 사용자: ${deleteCount}명`);
        console.log(`유지된 사용자: ${keepCount}명`);
        
        // 3. 최종 확인
        const finalSnapshot = await collections.users.get();
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