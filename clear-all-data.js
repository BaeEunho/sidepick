// 사이드픽 모든 데이터 초기화 스크립트
// 브라우저 콘솔에서 실행하거나 HTML에 포함하여 사용

function clearAllSidepickData() {
    console.log('=== 사이드픽 데이터 초기화 시작 ===');
    
    // 1. sessionStorage 완전 초기화
    console.log('\n📌 sessionStorage 초기화...');
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
        console.log(`  - ${key} 삭제`);
        sessionStorage.removeItem(key);
    });
    console.log(`✅ sessionStorage ${sessionKeys.length}개 항목 삭제 완료`);
    
    // 2. localStorage에서 사이드픽 관련 데이터 삭제
    console.log('\n📌 localStorage 초기화...');
    const localStorageKeys = [
        'sidepick-test-progress',
        'sidepick-test-result',
        'registeredUsers',
        'adminToken'
    ];
    
    // politicalType_로 시작하는 모든 키 찾기
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('politicalType_') || 
                   key.startsWith('userProfile_') || 
                   key.startsWith('appliedMeetings_'))) {
            localStorageKeys.push(key);
        }
    }
    
    localStorageKeys.forEach(key => {
        if (localStorage.getItem(key) !== null) {
            console.log(`  - ${key} 삭제`);
            localStorage.removeItem(key);
        }
    });
    console.log(`✅ localStorage ${localStorageKeys.length}개 항목 삭제 완료`);
    
    // 3. 쿠키 삭제 (있는 경우)
    console.log('\n📌 쿠키 초기화...');
    document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            console.log(`  - ${name} 쿠키 삭제`);
        }
    });
    
    console.log('\n✅ 모든 사이드픽 데이터가 초기화되었습니다!');
    console.log('🔄 페이지를 새로고침하면 완전히 새로운 상태로 시작할 수 있습니다.');
    
    return true;
}

// 즉시 실행 (HTML에 포함된 경우)
if (typeof window !== 'undefined') {
    // 확인 메시지
    if (confirm('정말로 모든 사이드픽 데이터를 삭제하시겠습니까?\n(회원 정보, 테스트 결과, 모임 신청 내역 등 모든 데이터가 삭제됩니다)')) {
        clearAllSidepickData();
        
        // 3초 후 자동 새로고침
        setTimeout(() => {
            if (confirm('페이지를 새로고침하시겠습니까?')) {
                location.reload();
            }
        }, 1000);
    }
}