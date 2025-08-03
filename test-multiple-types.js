// 여러 성향 유형 테스트

function testMultiplePersonalities() {
    console.log('=== 다양한 성향 유형 테스트 ===\n');

    // 테스트 케이스들
    const testCases = [
        {
            name: 'MPOS (시장 다원주의자)',
            answers: {
                economic: 4.5,    // 시장경제 선호 (M)
                social: 4.2,      // 진보사회 선호 (P)  
                cultural: 3.8,    // 개방문화 선호 (O)
                participation: 4.1 // 시민참여 선호 (S)
            },
            expected: 'MPOS'
        },
        {
            name: 'GCTN (위계 보수주의자)',
            answers: {
                economic: 2.2,    // 정부개입 선호 (G)
                social: 1.8,      // 보수사회 선호 (C)
                cultural: 1.5,    // 전통문화 선호 (T)
                participation: 2.1 // 전문가주도 선호 (N)
            },
            expected: 'GCTN'
        },
        {
            name: 'MCON (온건 보수주의자)',
            answers: {
                economic: 3.8,    // 시장경제 선호 (M)
                social: 2.3,      // 보수사회 선호 (C)
                cultural: 3.2,    // 개방문화 선호 (O)
                participation: 2.8 // 전문가주도 선호 (N)
            },
            expected: 'MCON'
        },
        {
            name: 'GPOS (참여 사회민주주의자)',
            answers: {
                economic: 2.1,    // 정부개입 선호 (G)
                social: 4.5,      // 진보사회 선호 (P)
                cultural: 3.3,    // 개방문화 선호 (O)
                participation: 4.2 // 시민참여 선호 (S)
            },
            expected: 'GPOS'
        }
    ];

    testCases.forEach(testCase => {
        const result = determinePersonalityType(testCase.answers);
        const success = result === testCase.expected;
        
        console.log(`${testCase.name}:`);
        console.log(`  점수: ${JSON.stringify(testCase.answers)}`);
        console.log(`  예상: ${testCase.expected}`);
        console.log(`  실제: ${result}`);
        console.log(`  결과: ${success ? '✅ 성공' : '❌ 실패'}\n`);
    });
}

function determinePersonalityType(scores) {
    const economic = scores.economic >= 3 ? 'M' : 'G';
    const social = scores.social >= 3 ? 'P' : 'C';
    const cultural = scores.cultural >= 3 ? 'O' : 'T';
    const participation = scores.participation >= 3 ? 'S' : 'N';

    return economic + social + cultural + participation;
}

// 테스트 실행
testMultiplePersonalities();