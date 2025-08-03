// SidePick 테스트 시뮬레이션
// 답변에 따른 성향 매칭이 올바르게 작동하는지 테스트

// questions.js와 results.js를 시뮬레이션
function simulateTest() {
    // 테스트 답변들 (1-5 척도)
    const testAnswers = {
        // 시장경제 성향 (높은 점수)
        market: [4, 4, 2, 5, 2, 5, 4, 2, 2, 3, 2, 5, 5, 2, 2], // economic축
        // 진보사회 성향 (높은 점수) 
        progressive: [5, 5, 5, 2, 5, 5, 5, 5, 5, 5, 2, 5, 5, 2, 5], // social축
        // 개방문화 성향 (높은 점수)
        open: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], // cultural축
        // 시민참여 성향 (높은 점수)
        citizen: [5, 2, 2, 5, 2, 5, 2, 5, 5, 5, 2, 5, 2, 5, 5] // participation축
    };

    // 축별 점수 계산 시뮬레이션
    const scores = calculateScores(testAnswers);
    console.log('계산된 점수:', scores);
    
    // 성향 유형 결정
    const typeCode = determineType(scores);
    console.log('예상 성향 코드:', typeCode);
    
    return { scores, typeCode };
}

function calculateScores(testAnswers) {
    const axisScores = {
        economic: [],
        social: [],
        cultural: [],
        participation: []
    };

    // economic축 계산 (government 방향 질문들은 점수 반전)
    testAnswers.market.forEach((answer, index) => {
        const questionDirections = ['government', 'government', 'government', 'market', 'government', 
                                   'market', 'market', 'government', 'government', 'government', 
                                   'government', 'market', 'market', 'government', 'government'];
        
        let score = answer;
        if (questionDirections[index] === 'government') {
            score = 6 - answer; // 점수 반전
        }
        axisScores.economic.push(score);
    });

    // social축 계산 (conservative 방향 질문들은 점수 반전)
    testAnswers.progressive.forEach((answer, index) => {
        const questionDirections = ['progressive', 'progressive', 'progressive', 'conservative', 'progressive',
                                   'progressive', 'progressive', 'progressive', 'progressive', 'progressive',
                                   'conservative', 'progressive', 'progressive', 'conservative', 'progressive'];
        
        let score = answer;
        if (questionDirections[index] === 'conservative') {
            score = 6 - answer; // 점수 반전
        }
        axisScores.social.push(score);
    });

    // cultural축 계산 (traditional 방향 질문들은 점수 반전)
    testAnswers.open.forEach((answer, index) => {
        let score = 6 - answer; // 모든 문화 질문이 traditional 방향이므로 반전
        axisScores.cultural.push(score);
    });

    // participation축 계산 (expert 방향 질문들은 점수 반전)
    testAnswers.citizen.forEach((answer, index) => {
        const questionDirections = ['citizen', 'expert', 'expert', 'citizen', 'expert',
                                   'citizen', 'expert', 'citizen', 'citizen', 'citizen',
                                   'expert', 'citizen', 'expert', 'citizen', 'citizen'];
        
        let score = answer;
        if (questionDirections[index] === 'expert') {
            score = 6 - answer; // 점수 반전
        }
        axisScores.participation.push(score);
    });

    // 평균 계산
    const averageScores = {};
    Object.keys(axisScores).forEach(axis => {
        const scores = axisScores[axis];
        averageScores[axis] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    return averageScores;
}

function determineType(scores) {
    const economic = scores.economic >= 3 ? 'M' : 'G';
    const social = scores.social >= 3 ? 'P' : 'C';
    const cultural = scores.cultural >= 3 ? 'O' : 'T';
    const participation = scores.participation >= 3 ? 'S' : 'N';

    return economic + social + cultural + participation;
}

// 테스트 실행
console.log('=== SidePick 성향 매칭 테스트 ===');
const result = simulateTest();
console.log('예상 결과: MPOS (시장 다원주의자)');
console.log('실제 결과:', result.typeCode);
console.log('매칭 성공:', result.typeCode === 'MPOS' ? '✅' : '❌');