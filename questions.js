// 60개 질문 데이터
// 각 질문은 4개 축 중 하나에 속함: economic, social, culture, participation
// 점수는 1-5로 계산 (1: 매우 반대, 5: 매우 찬성)

const questions = [
    // 경제 정책 축 (15개 질문) - economic
    {
        id: 1,
        text: "회사가 어려울 때 정부가 지원하는 것이 필요하다고 생각해요",
        axis: "economic",
        direction: "government" // government vs market
    },
    {
        id: 2,
        text: "최저임금을 올리면 일자리가 줄어들 수 있어도 근로자를 보호해야 해요",
        axis: "economic",
        direction: "government"
    },
    {
        id: 3,
        text: "부자에게 더 많은 세금을 부과하는 것은 공정해요",
        axis: "economic",
        direction: "government"
    },
    {
        id: 4,
        text: "기업이 자유롭게 경쟁할 때 사회 전체가 더 발전해요",
        axis: "economic",
        direction: "market"
    },
    {
        id: 5,
        text: "모든 사람이 기본적인 생활을 할 수 있도록 국가가 보장해야 해요",
        axis: "economic",
        direction: "government"
    },
    {
        id: 6,
        text: "시장에서 자율적으로 가격이 정해지는 것이 가장 효율적이에요",
        axis: "economic",
        direction: "market"
    },
    {
        id: 7,
        text: "복지 혜택을 늘리면 사람들이 일할 의욕을 잃을 수 있어요",
        axis: "economic",
        direction: "market"
    },
    {
        id: 8,
        text: "대기업보다는 중소기업과 자영업자를 더 지원해야 해요",
        axis: "economic",
        direction: "government"
    },
    {
        id: 9,
        text: "부동산 투기를 막기 위해 정부가 강하게 규제해야 해요",
        axis: "economic",
        direction: "government"
    },
    {
        id: 10,
        text: "경제가 어려워도 환경 보호를 우선시해야 해요",
        axis: "economic",
        direction: "government"
    },
    {
        id: 11,
        text: "공공서비스는 민간보다 국가가 직접 운영하는 것이 좋아요",
        axis: "economic",
        direction: "government"
    },
    {
        id: 12,
        text: "개인의 노력으로 성공하면 그에 따른 보상을 받는 것이 당연해요",
        axis: "economic",
        direction: "market"
    },
    {
        id: 13,
        text: "일자리 창출을 위해 기업 규제를 완화하는 것이 필요해요",
        axis: "economic",
        direction: "market"
    },
    {
        id: 14,
        text: "소득 격차를 줄이는 것이 경제 성장보다 더 중요해요",
        axis: "economic",
        direction: "government"
    },
    {
        id: 15,
        text: "국가 부채가 늘어나도 경기 부양을 위한 투자는 필요해요",
        axis: "economic",
        direction: "government"
    },

    // 사회 이슈 축 (15개 질문) - social
    {
        id: 16,
        text: "성별에 관계없이 모든 직업에 동등한 기회가 주어져야 해요",
        axis: "social",
        direction: "progressive" // progressive vs conservative
    },
    {
        id: 17,
        text: "다양한 가족 형태(한부모, 동성커플 등)를 인정해야 해요",
        axis: "social",
        direction: "progressive"
    },
    {
        id: 18,
        text: "차별금지법으로 모든 형태의 차별을 금지해야 해요",
        axis: "social",
        direction: "progressive"
    },
    {
        id: 19,
        text: "여성 전용 공간(화장실, 탈의실 등)은 생물학적 여성만 사용해야 해요",
        axis: "social",
        direction: "conservative"
    },
    {
        id: 20,
        text: "이민자들도 우리나라 국민과 동등한 권리를 가져야 해요",
        axis: "social",
        direction: "progressive"
    },
    {
        id: 21,
        text: "성소수자의 권리를 법적으로 보장하는 것이 중요해요",
        axis: "social",
        direction: "progressive"
    },
    {
        id: 22,
        text: "종교적 신념도 존중받아야 하지만 법보다 우선할 수는 없어요",
        axis: "social",
        direction: "progressive"
    },
    {
        id: 23,
        text: "임신중단(낙태)은 여성이 스스로 결정할 수 있어야 해요",
        axis: "social",
        direction: "progressive"
    },
    {
        id: 24,
        text: "군 복무는 성별에 관계없이 모든 사람이 해야 해요",
        axis: "social",
        direction: "progressive"
    },
    {
        id: 25,
        text: "사회적 약자를 위한 우대 정책(할당제 등)이 필요해요",
        axis: "social",
        direction: "progressive"
    },
    {
        id: 26,
        text: "개인의 자유보다 사회 질서가 더 중요할 때가 있어요",
        axis: "social",
        direction: "conservative"
    },
    {
        id: 27,
        text: "범죄자에 대한 처벌보다 교화가 더 중요해요",
        axis: "social",
        direction: "progressive"
    },
    {
        id: 28,
        text: "표현의 자유는 다른 사람에게 해가 되지 않는 선에서 보장되어야 해요",
        axis: "social",
        direction: "progressive"
    },
    {
        id: 29,
        text: "사회 안전을 위해 개인 정보 수집을 허용할 수 있어요",
        axis: "social",
        direction: "conservative"
    },
    {
        id: 30,
        text: "모든 종교와 문화는 동등하게 존중받아야 해요",
        axis: "social",
        direction: "progressive"
    },

    // 문화 가치관 축 (15개 질문) - culture
    {
        id: 31,
        text: "전통적인 가족 제도(부모-자녀)를 지키는 것이 중요해요",
        axis: "cultural",
        direction: "traditional" // traditional vs open
    },
    {
        id: 32,
        text: "새로운 아이디어보다 검증된 방법이 더 안전해요",
        axis: "cultural",
        direction: "traditional"
    },
    {
        id: 33,
        text: "어른에 대한 공경과 예의는 꼭 필요해요",
        axis: "cultural",
        direction: "traditional"
    },
    {
        id: 34,
        text: "개인의 성취보다 집단의 화합이 더 소중해요",
        axis: "cultural",
        direction: "traditional"
    },
    {
        id: 35,
        text: "우리나라 고유의 문화와 전통을 보존해야 해요",
        axis: "cultural",
        direction: "traditional"
    },
    {
        id: 36,
        text: "변화보다는 안정된 삶이 더 바람직해요",
        axis: "cultural",
        direction: "traditional"
    },
    {
        id: 37,
        text: "개인의 행복보다 가족의 안녕이 더 중요해요",
        axis: "cultural",
        direction: "traditional"
    },
    {
        id: 38,
        text: "사회 구성원들이 비슷한 가치관을 가지는 것이 좋아요",
        axis: "cultural",
        direction: "traditional"
    },
    {
        id: 39,
        text: "외국 문화보다는 우리 문화가 더 우수해요",
        axis: "cultural",
        direction: "traditional"
    },
    {
        id: 40,
        text: "권위 있는 사람의 의견을 존중하는 것이 중요해요",
        axis: "cultural",
        direction: "traditional"
    },
    {
        id: 41,
        text: "젊은 세대는 기성세대의 경험을 배워야 해요",
        axis: "cultural",
        direction: "traditional"
    },
    {
        id: 42,
        text: "급진적인 변화보다는 점진적인 개선이 좋아요",
        axis: "cultural",
        direction: "traditional"
    },
    {
        id: 43,
        text: "공동체의 규칙을 지키는 것이 개인의 자유보다 중요해요",
        axis: "cultural",
        direction: "traditional"
    },
    {
        id: 44,
        text: "결혼과 출산은 사회를 위해서도 중요한 일이에요",
        axis: "cultural",
        direction: "traditional"
    },
    {
        id: 45,
        text: "다수의 의견을 따르는 것이 갈등을 줄이는 방법이에요",
        axis: "cultural",
        direction: "traditional"
    },

    // 참여 민주주의 축 (15개 질문) - participation
    {
        id: 46,
        text: "중요한 정책은 국민투표로 결정하는 것이 좋아요",
        axis: "participation",
        direction: "citizen" // citizen vs expert
    },
    {
        id: 47,
        text: "전문가의 의견이 일반 시민의 의견보다 더 중요할 수 있어요",
        axis: "participation",
        direction: "expert"
    },
    {
        id: 48,
        text: "정치인보다는 전문 관료가 정책을 만드는 것이 효율적이에요",
        axis: "participation",
        direction: "expert"
    },
    {
        id: 49,
        text: "시민들이 정치에 더 많이 참여해야 해요",
        axis: "participation",
        direction: "citizen"
    },
    {
        id: 50,
        text: "복잡한 정책은 전문가에게 맡기는 것이 좋아요",
        axis: "participation",
        direction: "expert"
    },
    {
        id: 51,
        text: "정부의 모든 정보는 국민에게 공개되어야 해요",
        axis: "participation",
        direction: "citizen"
    },
    {
        id: 52,
        text: "강한 리더십이 민주적 절차보다 중요할 때가 있어요",
        axis: "participation",
        direction: "expert"
    },
    {
        id: 53,
        text: "시민 사회 단체의 역할이 더 커져야 해요",
        axis: "participation",
        direction: "citizen"
    },
    {
        id: 54,
        text: "정치인은 전문성보다 국민과의 소통 능력이 더 중요해요",
        axis: "participation",
        direction: "citizen"
    },
    {
        id: 55,
        text: "국가 기밀도 국민의 알 권리를 위해 공개해야 해요",
        axis: "participation",
        direction: "citizen"
    },
    {
        id: 56,
        text: "선거로 뽑힌 사람이 모든 결정권을 가져야 해요",
        axis: "participation",
        direction: "expert"
    },
    {
        id: 57,
        text: "정부 정책에 대한 시민 감시가 더 강화되어야 해요",
        axis: "participation",
        direction: "citizen"
    },
    {
        id: 58,
        text: "효율성을 위해 일부 민주적 절차는 생략할 수 있어요",
        axis: "participation",
        direction: "expert"
    },
    {
        id: 59,
        text: "온라인 투표로 더 많은 사람이 정치에 참여할 수 있어야 해요",
        axis: "participation",
        direction: "citizen"
    },
    {
        id: 60,
        text: "사회 갈등이 있어도 충분한 토론을 거쳐 결정해야 해요",
        axis: "participation",
        direction: "citizen"
    }
];

// 질문들을 랜덤하게 섞는 함수
function shuffleQuestions(questions) {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 기본적으로 순서대로 출제하되, 필요시 섞을 수 있음
const getQuestions = (shuffle = false) => {
    return shuffle ? shuffleQuestions(questions) : questions;
};