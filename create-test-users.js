// 보수 여성 테스트 계정 생성 스크립트
// 브라우저 콘솔에서 실행하세요

const createConservativeWomenTestAccounts = async () => {
    const testUsers = [
        {
            email: 'test_conservative_woman1@test.com',
            password: 'test1234',
            name: '김보수',
            gender: 'female',
            birthYear: 1995,
            phone: '010-1234-5678',
            politicalType: 'MCOS', // 문화 보수주의자
            testResult: {
                economic: 25,  // 시장경제 성향
                social: 75,    // 보수적
                culture: 80,   // 전통적
                participation: 65  // 엘리트주의
            }
        },
        {
            email: 'test_conservative_woman2@test.com',
            password: 'test1234',
            name: '이전통',
            gender: 'female',
            birthYear: 1993,
            phone: '010-8765-4321',
            politicalType: 'GCON', // 권위 보수주의자
            testResult: {
                economic: 75,  // 정부개입 선호
                social: 80,    // 보수적
                culture: 85,   // 매우 전통적
                participation: 70  // 엘리트주의
            }
        }
    ];

    console.log('=== 보수 여성 테스트 계정 생성 시작 ===');
    
    for (const user of testUsers) {
        try {
            // 1. 회원가입
            console.log(`\n${user.name} (${user.email}) 계정 생성 중...`);
            
            // sessionStorage에 테스트 데이터 설정
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userEmail', user.email);
            sessionStorage.setItem('userGender', user.gender);
            sessionStorage.setItem('politicalType', user.politicalType);
            sessionStorage.setItem('testCompleted', 'true');
            
            // 사용자 프로필 저장
            const userProfile = {
                email: user.email,
                name: user.name,
                gender: user.gender,
                birthYear: user.birthYear,
                phone: user.phone
            };
            sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
            
            // 테스트 결과 저장
            sessionStorage.setItem('testResult', JSON.stringify({
                type: user.politicalType,
                scores: user.testResult
            }));
            
            // appliedMeetings 초기화 (보수 모임에 신청 가능)
            const appliedMeetings = {};
            sessionStorage.setItem('appliedMeetings', JSON.stringify(appliedMeetings));
            
            console.log(`✅ ${user.name} 계정 생성 완료!`);
            console.log(`   - 정치 성향: ${user.politicalType}`);
            console.log(`   - 성별: 여성`);
            console.log(`   - 이메일: ${user.email}`);
            console.log(`   - 비밀번호: ${user.password}`);
            
        } catch (error) {
            console.error(`❌ ${user.name} 계정 생성 실패:`, error);
        }
    }
    
    console.log('\n=== 테스트 계정 생성 완료 ===');
    console.log('생성된 계정으로 로그인하려면:');
    console.log('1. 로그인 페이지에서 이메일과 비밀번호(test1234) 입력');
    console.log('2. 정치 성향 테스트는 이미 완료된 상태');
    console.log('3. 보수 성향 모임에 바로 신청 가능');
    
    return testUsers;
};

// 실행
createConservativeWomenTestAccounts();