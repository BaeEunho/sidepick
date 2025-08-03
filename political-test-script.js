// 60개 질문 데이터
const questions = [
    // 경제 정책 축 (15개 질문)
    {
        id: 1,
        text: "회사가 어려울 때 정부가 지원하는 것이 필요하다고 생각해요"
    },
    {
        id: 2,
        text: "최저임금을 올리면 일자리가 줄어들 수 있어도 근로자를 보호해야 해요"
    },
    {
        id: 3,
        text: "부자에게 더 많은 세금을 부과하는 것은 공정해요"
    },
    {
        id: 4,
        text: "기업이 자유롭게 경쟁할 때 사회 전체가 더 발전해요"
    },
    {
        id: 5,
        text: "모든 사람이 기본적인 생활을 할 수 있도록 국가가 보장해야 해요"
    },
    {
        id: 6,
        text: "시장에서 자율적으로 가격이 정해지는 것이 가장 효율적이에요"
    },
    {
        id: 7,
        text: "복지 혜택을 늘리면 사람들이 일할 의욕을 잃을 수 있어요"
    },
    {
        id: 8,
        text: "대기업보다는 중소기업과 자영업자를 더 지원해야 해요"
    },
    {
        id: 9,
        text: "부동산 투기를 막기 위해 정부가 강하게 규제해야 해요"
    },
    {
        id: 10,
        text: "경제가 어려워도 환경 보호를 우선시해야 해요"
    },
    {
        id: 11,
        text: "공공서비스는 민간보다 국가가 직접 운영하는 것이 좋아요"
    },
    {
        id: 12,
        text: "개인의 노력으로 성공하면 그에 따른 보상을 받는 것이 당연해요"
    },
    {
        id: 13,
        text: "일자리 창출을 위해 기업 규제를 완화하는 것이 필요해요"
    },
    {
        id: 14,
        text: "소득 격차를 줄이는 것이 경제 성장보다 더 중요해요"
    },
    {
        id: 15,
        text: "국가 부채가 늘어나도 경기 부양을 위한 투자는 필요해요"
    },
    // 사회 이슈 축 (15개 질문)
    {
        id: 16,
        text: "성별에 관계없이 모든 직업에 동등한 기회가 주어져야 해요"
    },
    {
        id: 17,
        text: "다양한 가족 형태(한부모, 동성커플 등)를 인정해야 해요"
    },
    {
        id: 18,
        text: "차별금지법으로 모든 형태의 차별을 금지해야 해요"
    },
    {
        id: 19,
        text: "여성 전용 공간(화장실, 탈의실 등)은 생물학적 여성만 사용해야 해요"
    },
    {
        id: 20,
        text: "이민자들도 우리나라 국민과 동등한 권리를 가져야 해요"
    },
    {
        id: 21,
        text: "성소수자의 권리를 법적으로 보장하는 것이 중요해요"
    },
    {
        id: 22,
        text: "종교적 신념도 존중받아야 하지만 법보다 우선할 수는 없어요"
    },
    {
        id: 23,
        text: "임신중단(낙태)은 여성이 스스로 결정할 수 있어야 해요"
    },
    {
        id: 24,
        text: "군 복무는 성별에 관계없이 모든 사람이 해야 해요"
    },
    {
        id: 25,
        text: "사회적 약자를 위한 우대 정책(할당제 등)이 필요해요"
    },
    {
        id: 26,
        text: "개인의 자유보다 사회 질서가 더 중요할 때가 있어요"
    },
    {
        id: 27,
        text: "범죄자에 대한 처벌보다 교화가 더 중요해요"
    },
    {
        id: 28,
        text: "표현의 자유는 다른 사람에게 해가 되지 않는 선에서 보장되어야 해요"
    },
    {
        id: 29,
        text: "사회 안전을 위해 개인 정보 수집을 허용할 수 있어요"
    },
    {
        id: 30,
        text: "모든 종교와 문화는 동등하게 존중받아야 해요"
    },
    // 문화 가치관 축 (15개 질문)
    {
        id: 31,
        text: "전통적인 가족 제도(부모-자녀)를 지키는 것이 중요해요"
    },
    {
        id: 32,
        text: "새로운 아이디어보다 검증된 방법이 더 안전해요"
    },
    {
        id: 33,
        text: "어른에 대한 공경과 예의는 꼭 필요해요"
    },
    {
        id: 34,
        text: "개인의 성취보다 집단의 화합이 더 소중해요"
    },
    {
        id: 35,
        text: "우리나라 고유의 문화와 전통을 보존해야 해요"
    },
    {
        id: 36,
        text: "변화보다는 안정된 삶이 더 바람직해요"
    },
    {
        id: 37,
        text: "개인의 행복보다 가족의 안녕이 더 중요해요"
    },
    {
        id: 38,
        text: "사회 구성원들이 비슷한 가치관을 가지는 것이 좋아요"
    },
    {
        id: 39,
        text: "외국 문화보다는 우리 문화가 더 우수해요"
    },
    {
        id: 40,
        text: "권위 있는 사람의 의견을 존중하는 것이 중요해요"
    },
    {
        id: 41,
        text: "젊은 세대는 기성세대의 경험을 배워야 해요"
    },
    {
        id: 42,
        text: "급진적인 변화보다는 점진적인 개선이 좋아요"
    },
    {
        id: 43,
        text: "공동체의 규칙을 지키는 것이 개인의 자유보다 중요해요"
    },
    {
        id: 44,
        text: "결혼과 출산은 사회를 위해서도 중요한 일이에요"
    },
    {
        id: 45,
        text: "다수의 의견을 따르는 것이 갈등을 줄이는 방법이에요"
    },
    // 참여 민주주의 축 (15개 질문)
    {
        id: 46,
        text: "중요한 정책은 국민투표로 결정하는 것이 좋아요"
    },
    {
        id: 47,
        text: "전문가의 의견이 일반 시민의 의견보다 더 중요할 수 있어요"
    },
    {
        id: 48,
        text: "정치인보다는 전문 관료가 정책을 만드는 것이 효율적이에요"
    },
    {
        id: 49,
        text: "시민들이 정치에 더 많이 참여해야 해요"
    },
    {
        id: 50,
        text: "복잡한 정책은 전문가에게 맡기는 것이 좋아요"
    },
    {
        id: 51,
        text: "정부의 모든 정보는 국민에게 공개되어야 해요"
    },
    {
        id: 52,
        text: "강한 리더십이 민주적 절차보다 중요할 때가 있어요"
    },
    {
        id: 53,
        text: "시민 사회 단체의 역할이 더 커져야 해요"
    },
    {
        id: 54,
        text: "정치인은 전문성보다 국민과의 소통 능력이 더 중요해요"
    },
    {
        id: 55,
        text: "국가 기밀도 국민의 알 권리를 위해 공개해야 해요"
    },
    {
        id: 56,
        text: "선거로 뽑힌 사람이 모든 결정권을 가져야 해요"
    },
    {
        id: 57,
        text: "정부 정책에 대한 시민 감시가 더 강화되어야 해요"
    },
    {
        id: 58,
        text: "효율성을 위해 일부 민주적 절차는 생략할 수 있어요"
    },
    {
        id: 59,
        text: "온라인 투표로 더 많은 사람이 정치에 참여할 수 있어야 해요"
    },
    {
        id: 60,
        text: "사회 갈등이 있어도 충분한 토론을 거쳐 결정해야 해요"
    }
];

// 16가지 성향 타입 정의 (전역 변수로 이동)
const resultTypes = {
    "MPOS": {
        title: "시장 다원주의자",
        icon: "🌐",
        description: "자유로운 시장경제를 신뢰하면서도 사회적 다양성을 적극 지지하는 성향입니다. 경제적 효율성과 사회적 평등이 조화를 이룰 수 있다고 믿으며, 개인의 자유와 사회적 책임을 균형있게 추구합니다.",
        features: [
            "시장 경제의 효율성 추구",
            "사회적 다양성 존중",
            "개인의 자유와 평등 조화",
            "시민 참여 활성화"
        ],
        axisScores: {
            economic: { label: "경제", score: "시장 경제", detail: "자유 시장과 경쟁 중시" },
            social: { label: "사회", score: "진보적", detail: "다양성과 포용성 추구" },
            cultural: { label: "문화", score: "개방적", detail: "새로운 문화와 가치 수용" },
            participation: { label: "참여", score: "시민 주도", detail: "적극적인 시민 참여" }
        },
        relationshipTraits: [
            "서로의 개성과 자유를 존중하는 관계",
            "다양한 가치관을 인정하고 포용",
            "경제적 독립성을 유지하면서도 협력",
            "사회 문제에 함께 관심을 갖는 파트너십"
        ],
        goodTopics: [
            "창업과 혁신적인 비즈니스",
            "다양성과 포용의 가치",
            "글로벌 트렌드와 문화",
            "사회적 기업과 윤리적 소비"
        ],
        avoidTopics: [
            "획일적인 사고방식",
            "과도한 규제나 통제",
            "편견이나 차별적 발언",
            "변화를 거부하는 태도"
        ],
        matching: ["MPON", "MPTS", "GPOS"]
    },
    "MPON": {
        title: "테크노 자유주의자",
        icon: "🚀",
        description: "시장경제의 효율성을 믿으면서도 전문가의 지식과 합리적 접근을 중시하는 성향입니다. 복잡한 사회 문제는 전문가가 과학적 근거를 바탕으로 해결해야 한다고 생각하며, 기술과 혁신을 통한 발전을 추구합니다.",
        features: [
            "시장 경제와 기술 혁신",
            "전문가의 역할 중시",
            "과학적 근거와 데이터",
            "효율적 문제 해결"
        ],
        axisScores: {
            economic: { label: "경제", score: "자유 시장", detail: "기술 혁신과 시장 효율성" },
            social: { label: "사회", score: "진보적", detail: "개인의 자유와 다양성" },
            cultural: { label: "문화", score: "개방적", detail: "혁신과 변화 수용" },
            participation: { label: "참여", score: "전문가 주도", detail: "전문성 기반 의사결정" }
        },
        relationshipTraits: [
            "지적 호기심과 합리성을 공유하는 관계",
            "서로의 전문성을 존중하고 인정",
            "효율적이고 실용적인 파트너십",
            "미래 지향적이고 혁신적인 사고"
        ],
        goodTopics: [
            "최신 기술과 혁신 트렌드",
            "데이터와 과학적 접근법",
            "효율성과 생산성 향상",
            "미래 사회와 기술의 역할"
        ],
        avoidTopics: [
            "반과학적 사고",
            "감정적 접근",
            "전통주의적 고집",
            "비효율적 관습"
        ],
        matching: ["MPOS", "MPTN", "GPON"]
    },
    "MPTS": {
        title: "참여 자유주의자",
        icon: "🗣️",
        description: "경제적 자유를 추구하면서도 시민들이 직접 정치에 참여해야 한다고 믿는 성향입니다. 시장의 자율성을 존중하되, 시민 감시와 참여를 통해 공정성을 확보해야 한다고 생각합니다.",
        features: [
            "시장 경제와 시민 참여",
            "풀뿌리 민주주의",
            "전통과 혁신의 조화",
            "지역 공동체 중시"
        ],
        axisScores: {
            economic: { label: "경제", score: "자유 시장", detail: "시민 감시하의 자유 경제" },
            social: { label: "사회", score: "진보적", detail: "개인 자유와 권리 보장" },
            cultural: { label: "문화", score: "전통적", detail: "전통 가치 속 점진적 변화" },
            participation: { label: "참여", score: "시민 주도", detail: "직접 민주주의 추구" }
        },
        relationshipTraits: [
            "서로의 의견을 존중하는 민주적 관계",
            "지역 사회에 함께 참여하는 파트너십",
            "전통적 가치와 현대적 사고의 균형",
            "상호 신뢰와 협력을 중시"
        ],
        goodTopics: [
            "지역 사회 활동과 참여",
            "시민의 권리와 책임",
            "전통과 혁신의 조화",
            "풀뿌리 민주주의"
        ],
        avoidTopics: [
            "엘리트주의",
            "정치 무관심",
            "극단적 변화",
            "공동체 무시"
        ],
        matching: ["MPOS", "MPON", "GPOS"]
    },
    "MPTN": {
        title: "엘리트 자유주의자",
        icon: "🎓",
        description: "시장경제의 효율성을 신뢰하면서도 전문가의 체계적 접근을 통해 사회를 개선해야 한다고 믿는 성향입니다. 급진적 변화보다는 검증된 방법과 점진적 개선을 선호하며, 전통적 가치도 선택적으로 수용합니다.",
        features: [
            "시장 경제와 엘리트 리더십",
            "전문성과 합리성",
            "점진적 개혁",
            "검증된 방법론"
        ],
        axisScores: {
            economic: { label: "경제", score: "자유 시장", detail: "효율적 시장 경제" },
            social: { label: "사회", score: "진보적", detail: "합리적 사회 개혁" },
            cultural: { label: "문화", score: "전통적", detail: "선택적 전통 수용" },
            participation: { label: "참여", score: "엘리트 주도", detail: "전문가 중심 결정" }
        },
        relationshipTraits: [
            "지적이고 세련된 관계 추구",
            "서로의 성취와 성공을 중시",
            "합리적이고 계획적인 파트너십",
            "사회적 지위와 품격을 고려"
        ],
        goodTopics: [
            "전문 분야와 커리어",
            "문화와 예술",
            "투자와 자산 관리",
            "교육과 자기계발"
        ],
        avoidTopics: [
            "포퓰리즘",
            "반지성주의",
            "즉흥적 결정",
            "무계획성"
        ],
        matching: ["MPON", "GPON", "GPTN"]
    },
    "MCOS": {
        title: "문화 보수주의자",
        icon: "🏛️",
        description: "경제적으로는 자유 시장을 신뢰하지만 사회적으로는 보수적 가치를 중시하는 성향입니다. 급격한 사회 변화보다는 점진적 개선을 선호하며, 전통적 가치와 새로운 문화가 조화를 이루어야 한다고 생각합니다.",
        features: [
            "시장 경제와 전통 가치",
            "보수적 사회관",
            "문화적 개방성",
            "시민 참여 중시"
        ],
        axisScores: {
            economic: { label: "경제", score: "자유 시장", detail: "경제적 자유 추구" },
            social: { label: "사회", score: "보수적", detail: "전통적 가치관 유지" },
            cultural: { label: "문화", score: "개방적", detail: "문화적 다양성 수용" },
            participation: { label: "참여", score: "시민 주도", detail: "적극적 시민 참여" }
        },
        relationshipTraits: [
            "전통적 가치관을 공유하는 관계",
            "안정적이면서도 문화적으로 개방적",
            "가족 중심의 미래 계획",
            "보수적이지만 다양성을 인정"
        ],
        goodTopics: [
            "가족과 전통의 가치",
            "문화 예술과 교양",
            "경제적 성공과 안정",
            "지역 사회 봉사"
        ],
        avoidTopics: [
            "급진적 사회 변화",
            "전통 무시",
            "극단적 개인주의",
            "문화적 획일성"
        ],
        matching: ["MCON", "MCTS", "GCOS"]
    },
    "MCON": {
        title: "온건 보수주의자",
        icon: "⚖️",
        description: "시장경제의 장점을 인정하면서도 급진적 변화보다는 안정적이고 점진적인 발전을 추구하는 성향입니다. 새로운 정책이나 제도는 충분히 검증된 후에 도입해야 한다고 생각하며, 전문가의 의견을 중시합니다.",
        features: [
            "시장 경제와 온건한 보수",
            "점진적 변화",
            "전문가 의견 존중",
            "안정과 질서"
        ],
        axisScores: {
            economic: { label: "경제", score: "온건 시장", detail: "규제된 자유 시장" },
            social: { label: "사회", score: "보수적", detail: "전통적 사회 질서" },
            cultural: { label: "문화", score: "개방적", detail: "선택적 문화 수용" },
            participation: { label: "참여", score: "엘리트 주도", detail: "전문가 중심 의사결정" }
        },
        relationshipTraits: [
            "안정적이고 예측 가능한 관계",
            "상호 존중과 신뢰 중시",
            "현실적이고 실용적인 파트너십",
            "점진적인 관계 발전 추구"
        ],
        goodTopics: [
            "안정적인 미래 계획",
            "실용적인 해결책",
            "전통과 현대의 조화",
            "합리적인 의사결정"
        ],
        avoidTopics: [
            "급진적 변화",
            "극단적 이념",
            "무모한 도전",
            "검증되지 않은 시도"
        ],
        matching: ["MCOS", "MCTN", "GCON"]
    },
    "MCTS": {
        title: "풀뿌리 보수주의자",
        icon: "🌾",
        description: "보수적 가치를 지지하면서도 시민들이 직접 참여하는 민주주의를 중시하는 성향입니다. 지역 공동체의 힘을 믿으며, 풀뿌리 차원에서의 점진적 변화를 추구합니다. 전통적 가치를 소중히 여기면서도 시민의 목소리를 중요하게 생각합니다.",
        features: [
            "시장 경제와 지역 공동체",
            "보수적 가치관",
            "전통 문화 보존",
            "시민 직접 참여"
        ],
        axisScores: {
            economic: { label: "경제", score: "자유 시장", detail: "지역 기반 경제" },
            social: { label: "사회", score: "보수적", detail: "전통적 사회 가치" },
            cultural: { label: "문화", score: "전통적", detail: "지역 문화와 전통 보존" },
            participation: { label: "참여", score: "시민 주도", detail: "풀뿌리 민주주의" }
        },
        relationshipTraits: [
            "지역 사회에 뿌리내린 관계",
            "전통적 가치를 공유하는 파트너십",
            "공동체 활동에 함께 참여",
            "신뢰와 책임을 중시하는 관계"
        ],
        goodTopics: [
            "지역 사회와 전통",
            "가족과 공동체의 가치",
            "지역 경제와 발전",
            "전통 문화 보존"
        ],
        avoidTopics: [
            "지역 정체성 무시",
            "전통 경시",
            "개인주의 극단",
            "중앙집권주의"
        ],
        matching: ["MCOS", "MCON", "GCTS"]
    },
    "MCTN": {
        title: "전통 보수주의자",
        icon: "👑",
        description: "시장경제의 효율성을 인정하면서도 전통적 가치와 사회 질서를 매우 중시하는 성향입니다. 급격한 변화보다는 검증된 시스템과 점진적 개선을 선호하며, 전문가의 지식과 기존 경험을 중요하게 생각합니다.",
        features: [
            "시장 경제와 전통 질서",
            "보수적 사회관",
            "전통 문화 중시",
            "엘리트 리더십"
        ],
        axisScores: {
            economic: { label: "경제", score: "자유 시장", detail: "전통적 시장 경제" },
            social: { label: "사회", score: "매우 보수적", detail: "전통적 사회 질서" },
            cultural: { label: "문화", score: "전통주의", detail: "문화 전통 고수" },
            participation: { label: "참여", score: "엘리트 주도", detail: "권위 있는 리더십" }
        },
        relationshipTraits: [
            "전통적인 성 역할과 가족관",
            "안정적이고 장기적인 관계",
            "위계와 질서를 존중",
            "가문과 명예를 중시"
        ],
        goodTopics: [
            "전통과 역사",
            "가문과 가족의 명예",
            "사회 질서와 안정",
            "검증된 가치와 지혜"
        ],
        avoidTopics: [
            "급진적 변화",
            "전통 파괴",
            "권위 도전",
            "무질서와 혼란"
        ],
        matching: ["MCON", "GCON", "GCTN"]
    },
    "GPOS": {
        title: "참여 사회민주주의자",
        icon: "🤝",
        description: "정부가 적극적으로 사회 문제를 해결해야 한다고 믿으면서도, 시민들이 직접 정책 결정에 참여해야 한다고 생각하는 성향입니다. 사회적 평등과 연대를 중시하며, 모든 시민이 정치 과정에 참여할 권리가 있다고 봅니다.",
        features: [
            "적극적 정부 역할",
            "사회적 평등 추구",
            "문화적 다양성",
            "직접 민주주의"
        ],
        axisScores: {
            economic: { label: "경제", score: "사회민주주의", detail: "복지 국가와 재분배" },
            social: { label: "사회", score: "진보적", detail: "평등과 인권 중시" },
            cultural: { label: "문화", score: "개방적", detail: "다문화와 다양성" },
            participation: { label: "참여", score: "시민 주도", detail: "참여 민주주의" }
        },
        relationshipTraits: [
            "평등하고 민주적인 관계",
            "사회 정의를 함께 추구",
            "다양성을 존중하는 파트너십",
            "연대와 협력을 중시"
        ],
        goodTopics: [
            "사회 정의와 평등",
            "시민 참여와 민주주의",
            "복지와 인권",
            "문화 다양성"
        ],
        avoidTopics: [
            "엘리트주의",
            "차별과 불평등",
            "정치 무관심",
            "개인주의 극단"
        ],
        matching: ["MPOS", "MPTS", "GPTS"]
    },
    "GPON": {
        title: "전문가 사회민주주의자",
        icon: "📊",
        description: "사회적 평등과 복지를 추구하면서도 전문가의 체계적 접근을 통해 정책을 설계해야 한다고 믿는 성향입니다. 정부의 적극적 역할을 지지하되, 그 정책들은 과학적 근거와 전문적 지식에 기반해야 한다고 생각합니다.",
        features: [
            "복지 국가 추구",
            "전문가 중심 정책",
            "과학적 접근법",
            "체계적 개혁"
        ],
        axisScores: {
            economic: { label: "경제", score: "계획 경제", detail: "전문가 주도 경제 정책" },
            social: { label: "사회", score: "진보적", detail: "체계적 사회 개혁" },
            cultural: { label: "문화", score: "개방적", detail: "합리적 문화 정책" },
            participation: { label: "참여", score: "전문가 주도", detail: "전문성 기반 거버넌스" }
        },
        relationshipTraits: [
            "지적이고 합리적인 관계",
            "사회 개혁의 비전 공유",
            "전문성을 존중하는 파트너십",
            "계획적이고 체계적인 미래 설계"
        ],
        goodTopics: [
            "정책과 제도 개선",
            "과학적 문제 해결",
            "복지 시스템 설계",
            "전문적 지식과 연구"
        ],
        avoidTopics: [
            "포퓰리즘",
            "감정적 접근",
            "비과학적 사고",
            "즉흥적 결정"
        ],
        matching: ["MPON", "MPTN", "GPTN"]
    },
    "GPTS": {
        title: "민중 진보주의자",
        icon: "✊",
        description: "사회적 평등을 추구하면서도 전통적 공동체 가치를 소중히 여기는 성향입니다. 정부가 적극적으로 사회 문제를 해결해야 한다고 믿으며, 특히 서민과 노동자의 입장에서 정책을 바라봅니다.",
        features: [
            "서민 중심 정책",
            "전통적 공동체 가치",
            "노동자 권익 보호",
            "풀뿌리 연대"
        ],
        axisScores: {
            economic: { label: "경제", score: "복지 국가", detail: "서민 복지 확대" },
            social: { label: "사회", score: "진보적", detail: "노동자와 서민 권익" },
            cultural: { label: "문화", score: "전통적", detail: "민중 문화와 전통" },
            participation: { label: "참여", score: "대중 주도", detail: "민중 직접 행동" }
        },
        relationshipTraits: [
            "서민적이고 따뜻한 관계",
            "연대와 상부상조 중시",
            "전통적 정을 나누는 파트너십",
            "함께 어려움을 극복하는 동지애"
        ],
        goodTopics: [
            "노동과 일자리",
            "서민 생활과 복지",
            "전통 문화와 공동체",
            "사회 연대와 협동"
        ],
        avoidTopics: [
            "엘리트주의",
            "개인주의 극단",
            "서민 무시",
            "신자유주의"
        ],
        matching: ["MPTS", "GPOS", "GPTN"]
    },
    "GPTN": {
        title: "계획 진보주의자",
        icon: "📋",
        description: "사회적 평등과 발전을 위해서는 체계적이고 장기적인 계획이 필요하다고 믿는 성향입니다. 전문가들이 과학적 방법론을 바탕으로 사회 정책을 설계하고 실행해야 한다고 생각하며, 개인의 자유보다는 집단의 발전을 우선시합니다.",
        features: [
            "체계적 사회 계획",
            "전문가 주도 개혁",
            "장기적 비전",
            "집단 발전 우선"
        ],
        axisScores: {
            economic: { label: "경제", score: "계획 경제", detail: "국가 주도 경제 계획" },
            social: { label: "사회", score: "진보적", detail: "평등 사회 건설" },
            cultural: { label: "문화", score: "전통적", detail: "계획된 문화 정책" },
            participation: { label: "참여", score: "엘리트 주도", detail: "전문가 중심 계획" }
        },
        relationshipTraits: [
            "목표 지향적이고 계획적인 관계",
            "장기적 비전을 공유",
            "체계적이고 조직적인 파트너십",
            "집단의 이익을 고려하는 관계"
        ],
        goodTopics: [
            "장기 발전 계획",
            "사회 시스템 개선",
            "과학적 방법론",
            "체계적 문제 해결"
        ],
        avoidTopics: [
            "즉흥성",
            "무계획성",
            "개인주의",
            "단기적 사고"
        ],
        matching: ["MPTN", "GPON", "GPTS"]
    },
    "GCOS": {
        title: "온건 국가주의자",
        icon: "🏛️",
        description: "국가가 적극적으로 사회를 이끌어야 한다고 믿으면서도, 전통적 가치와 문화적 개방성의 균형을 추구하는 성향입니다. 강한 정부의 역할을 지지하지만 시민들의 의견도 충분히 반영되어야 한다고 생각합니다.",
        features: [
            "강한 정부 역할",
            "보수적 사회 질서",
            "문화적 유연성",
            "시민 의견 수렴"
        ],
        axisScores: {
            economic: { label: "경제", score: "혼합 경제", detail: "국가 주도 시장 경제" },
            social: { label: "사회", score: "온건 보수", detail: "질서와 안정 추구" },
            cultural: { label: "문화", score: "개방적", detail: "선택적 문화 수용" },
            participation: { label: "참여", score: "균형적", detail: "정부 주도와 시민 참여" }
        },
        relationshipTraits: [
            "안정적이고 균형잡힌 관계",
            "국가와 사회에 대한 책임감",
            "전통과 현대의 조화 추구",
            "상호 존중과 협력"
        ],
        goodTopics: [
            "국가 발전과 안정",
            "전통과 혁신의 균형",
            "사회 질서와 발전",
            "문화적 정체성"
        ],
        avoidTopics: [
            "극단적 이념",
            "무정부주의",
            "급진적 변화",
            "국가 정체성 부정"
        ],
        matching: ["MCOS", "GCON", "GCTS"]
    },
    "GCON": {
        title: "권위 보수주의자",
        icon: "⚔️",
        description: "사회의 질서와 안정이 무엇보다 중요하며, 이를 위해서는 명확한 체계와 전문적 관리가 필요하다고 믿는 성향입니다. 정부가 강력한 리더십을 발휘해야 하고, 전문가와 권위 있는 기관의 결정을 존중해야 한다고 생각합니다.",
        features: [
            "강력한 정부 권한",
            "엄격한 사회 질서",
            "권위와 위계 존중",
            "전문가 통치"
        ],
        axisScores: {
            economic: { label: "경제", score: "국가 통제", detail: "정부 주도 경제 운영" },
            social: { label: "사회", score: "매우 보수적", detail: "엄격한 사회 질서" },
            cultural: { label: "문화", score: "개방적", detail: "통제된 문화 개방" },
            participation: { label: "참여", score: "엘리트 주도", detail: "권위적 의사결정" }
        },
        relationshipTraits: [
            "명확한 역할과 위계를 중시",
            "권위와 책임을 존중하는 관계",
            "안정과 질서를 추구",
            "전통적 가치관 공유"
        ],
        goodTopics: [
            "사회 질서와 안정",
            "리더십과 권위",
            "국가 안보와 발전",
            "전문성과 책임"
        ],
        avoidTopics: [
            "무질서와 혼란",
            "권위 도전",
            "급진적 민주주의",
            "개인주의 극단"
        ],
        matching: ["MCON", "GCOS", "GCTN"]
    },
    "GCTS": {
        title: "민족 보수주의자",
        icon: "🇰🇷",
        description: "우리나라의 고유한 전통과 문화에 자부심을 가지고 있으며, 이를 바탕으로 자주적인 발전을 이루어야 한다고 믿는 성향입니다. 국가가 적극적인 역할을 해야 하지만, 그 방향은 시민들의 전통적 가치관과 일치해야 한다고 생각합니다.",
        features: [
            "민족 정체성 중시",
            "전통 문화 보존",
            "자주적 발전",
            "시민 참여"
        ],
        axisScores: {
            economic: { label: "경제", score: "민족 경제", detail: "자주적 경제 발전" },
            social: { label: "사회", score: "보수적", detail: "전통적 사회 가치" },
            cultural: { label: "문화", score: "전통주의", detail: "민족 문화 계승" },
            participation: { label: "참여", score: "대중 주도", detail: "민족적 단결" }
        },
        relationshipTraits: [
            "민족적 자부심을 공유하는 관계",
            "전통 문화를 함께 계승",
            "가족과 공동체를 중시",
            "애국심과 책임감"
        ],
        goodTopics: [
            "우리 역사와 전통",
            "민족 문화와 정체성",
            "자주 국방과 발전",
            "전통 가치 계승"
        ],
        avoidTopics: [
            "사대주의",
            "문화 사대주의",
            "민족 정체성 부정",
            "무분별한 서구화"
        ],
        matching: ["MCTS", "GCOS", "GCTN"]
    },
    "GCTN": {
        title: "위계 보수주의자",
        icon: "🏰",
        description: "사회의 안정과 질서를 위해서는 전통적인 위계와 체계가 필요하다고 믿는 성향입니다. 각자의 역할과 책임이 명확해야 하고, 전문가와 경험 있는 지도자들의 의견을 존중해야 한다고 생각합니다.",
        features: [
            "전통적 위계 질서",
            "명확한 역할 분담",
            "권위 존중",
            "체계적 관리"
        ],
        axisScores: {
            economic: { label: "경제", score: "위계적 경제", detail: "계층적 경제 구조" },
            social: { label: "사회", score: "매우 보수적", detail: "전통적 사회 위계" },
            cultural: { label: "문화", score: "전통주의", detail: "위계 문화 보존" },
            participation: { label: "참여", score: "엘리트 주도", detail: "위계적 의사결정" }
        },
        relationshipTraits: [
            "전통적인 성 역할 구분",
            "위계와 예절을 중시",
            "가문과 명예를 고려",
            "장기적이고 안정적인 관계"
        ],
        goodTopics: [
            "전통과 예절",
            "사회 질서와 위계",
            "가문과 명예",
            "책임과 의무"
        ],
        avoidTopics: [
            "평등주의 극단",
            "전통 파괴",
            "무례와 무질서",
            "권위 무시"
        ],
        matching: ["MCTN", "GCON", "GCTS"]
    }
};

let currentQuestion = 0;
let answers = [];

// 페이지 로드 시 로그인 체크
window.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    const userState = AuthManager.getUserState();
    
    const loginCheckBox = document.querySelector('.login-check-box');
    const testContent = document.getElementById('test-content');
    
    if (userState.isLoggedIn) {
        // 로그인된 사용자는 테스트 콘텐츠 표시
        if (loginCheckBox) loginCheckBox.style.display = 'none';
        if (testContent) testContent.style.display = 'block';
    } else {
        // 비로그인 상태면 로그인 안내 표시
        if (loginCheckBox) loginCheckBox.style.display = 'block';
        if (testContent) testContent.style.display = 'none';
    }
});

// 테스트 시작
function startTest() {
    document.getElementById('test-intro').style.display = 'none';
    document.getElementById('test-questions').style.display = 'block';
    document.querySelector('.test-progress').style.display = 'block';
    showQuestion();
}

// 질문 표시
function showQuestion() {
    const question = questions[currentQuestion];
    document.getElementById('question-text').textContent = question.text;
    
    // 진행률 업데이트 (퍼센트만 표시)
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.querySelector('.progress-fill').style.width = `${progress}%`;
    document.querySelector('.progress-text').textContent = `${Math.round(progress)}%`;
    
    // 이전 버튼 활성화/비활성화
    document.querySelector('.prev-btn').disabled = currentQuestion === 0;
}

// 답변 선택 - 디바운싱 추가
let isProcessing = false;
function selectAnswer(answerIndex) {
    // 이미 처리 중이면 무시
    if (isProcessing) return;
    
    isProcessing = true;
    answers[currentQuestion] = answerIndex;
    
    // 짧은 지연 후 다음 질문으로 이동
    setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion();
        } else {
            showResult();
        }
        // 질문이 바뀐 후 플래그 해제
        setTimeout(() => {
            isProcessing = false;
        }, 300);
    }, 100);
}

// 이전 질문
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}

// 결과 표시
function showResult() {
    document.getElementById('test-questions').style.display = 'none';
    document.getElementById('test-result').style.display = 'block';
    document.querySelector('.test-progress').style.display = 'none';
    
    // 답변 점수 계산
    const scores = calculateScores();
    const typeCode = generateTypeCode(scores);
    const result = resultTypes[typeCode];
    
    // 전역 변수에 저장 (goToMatching에서 사용)
    window.currentTypeCode = typeCode;
    window.currentResult = result;
    
    // 축별 점수도 세션스토리지에 저장 (마이페이지에서 사용)
    sessionStorage.setItem('testScores', JSON.stringify(scores));
    sessionStorage.setItem('axisScores', JSON.stringify(result.axisScores));
    
    // 결과 화면 업데이트
    document.getElementById('result-title').textContent = result.title;
    document.querySelector('.type-icon').textContent = result.icon;
    document.getElementById('result-description').textContent = result.description;
    
    const featuresList = document.getElementById('result-features');
    featuresList.innerHTML = result.features.map(feature => `<li>${feature}</li>`).join('');
    
    // 성향 코드를 실제 이름으로 변환하는 맵
    const typeNames = {
        "MPOS": "시장 다원주의자",
        "MPON": "테크노 자유주의자",
        "MPTS": "참여 자유주의자",
        "MPTN": "엘리트 자유주의자",
        "MCOS": "문화 보수주의자",
        "MCON": "온건 보수주의자", 
        "MCTS": "풀뿌리 보수주의자",
        "MCTN": "전통 보수주의자",
        "GPOS": "참여 사회민주주의자",
        "GPON": "전문가 사회민주주의자",
        "GPTS": "민중 진보주의자",
        "GPTN": "계획 진보주의자",
        "GCOS": "온건 국가주의자",
        "GCON": "권위 보수주의자",
        "GCTS": "민족 보수주의자",
        "GCTN": "위계 보수주의자"
    };
    
    const matchingTypes = document.querySelector('.type-badges');
    matchingTypes.innerHTML = result.matching.map(typeCode => {
        const typeName = typeNames[typeCode] || typeCode;
        return `<span class="type-badge">${typeName}</span>`;
    }).join('');
    
    // 테스트 완료 상태를 즉시 저장
    const orientation = ['MPOS', 'MPON', 'MPTS', 'MPTN', 'GPOS', 'GPON', 'GPTS', 'GPTN'].includes(typeCode) ? 'progressive' : 'conservative';
    const typeData = {
        code: typeCode,
        title: result.title,
        orientation: orientation
    };
    
    // AuthManager를 통해 테스트 완료 상태 저장
    if (typeof AuthManager !== 'undefined' && AuthManager.setTestComplete) {
        AuthManager.setTestComplete(typeData);
    }
    
    // 추가로 상세 정보도 저장 (마이페이지용)
    sessionStorage.setItem('testResultDetail', JSON.stringify(result));
    sessionStorage.setItem('userAnswers', JSON.stringify(answers));
    
    // 서버에 정치 성향 저장 (데모 모드에서는 localStorage에만 저장)
    savePoliticalTypeToServer(typeCode);
    
    // 새로운 섹션들을 동적으로 추가
    const resultCard = document.querySelector('.result-card');
    
    // 축별 점수 추가
    const axisSection = document.createElement('div');
    axisSection.className = 'axis-scores';
    axisSection.innerHTML = `
        <h3>세부 성향 분석</h3>
        <div class="axis-grid">
            ${Object.values(result.axisScores).map(axis => `
                <div class="axis-item">
                    <h4>${axis.label}</h4>
                    <p class="axis-score">${axis.score}</p>
                    <p class="axis-detail">${axis.detail}</p>
                </div>
            `).join('')}
        </div>
    `;
    
    // 연애 성향 추가
    const relationshipSection = document.createElement('div');
    relationshipSection.className = 'relationship-traits';
    relationshipSection.innerHTML = `
        <h3>연애에서의 특징</h3>
        <ul>
            ${result.relationshipTraits.map(trait => `<li>${trait}</li>`).join('')}
        </ul>
    `;
    
    // 대화 주제 추가
    const topicsSection = document.createElement('div');
    topicsSection.className = 'conversation-topics';
    topicsSection.innerHTML = `
        <h3>추천 대화 주제</h3>
        <div class="topics-grid">
            <div class="good-topics">
                <h4>💚 이런 대화를 즐겨요</h4>
                <ul>
                    ${result.goodTopics.map(topic => `<li>${topic}</li>`).join('')}
                </ul>
            </div>
            <div class="avoid-topics">
                <h4>💔 이런 대화는 피해주세요</h4>
                <ul>
                    ${result.avoidTopics.map(topic => `<li>${topic}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    // 요소들을 결과 카드에 추가
    const matchingSection = document.querySelector('.matching-types');
    resultCard.insertBefore(axisSection, matchingSection);
    resultCard.insertBefore(relationshipSection, matchingSection);
    resultCard.insertBefore(topicsSection, matchingSection);
}

// 질문별 방향성 데이터
const questionDirections = [
    // 경제 축 (1-15번): positive = Market(M), negative = Government(G)
    'negative', 'negative', 'negative', 'positive', 'negative',
    'positive', 'positive', 'negative', 'negative', 'negative',
    'negative', 'positive', 'positive', 'negative', 'negative',
    // 사회 축 (16-30번): positive = Progressive(P), negative = Conservative(C)
    'positive', 'positive', 'positive', 'negative', 'positive',
    'positive', 'positive', 'positive', 'positive', 'negative',
    'positive', 'negative', 'positive', 'negative', 'positive',
    // 문화 축 (31-45번): positive = Open(O), negative = Traditional(T)
    'positive', 'negative', 'positive', 'negative', 'positive',
    'negative', 'negative', 'positive', 'positive', 'negative',
    'positive', 'negative', 'negative', 'positive', 'negative',
    // 참여 축 (46-60번): positive = Social(S), negative = elitist(N)
    'positive', 'negative', 'positive', 'negative', 'positive',
    'negative', 'positive', 'negative', 'positive', 'negative',
    'positive', 'negative', 'positive', 'negative', 'positive'
];

// 점수 계산 함수 (방향성 고려)
function calculateScores() {
    try {
        // answers 배열 확인
        if (!Array.isArray(answers) || answers.length !== 60) {
            console.error('Invalid answers array:', answers);
            alert('테스트 답변이 올바르지 않습니다. 다시 시도해주세요.');
            return null;
        }
        
        let economicScore = 0;
        let socialScore = 0;
        let culturalScore = 0;
        let participationScore = 0;
        
        // 각 축별로 점수 계산 (방향성 고려)
        answers.forEach((answer, index) => {
            if (answer === null || answer === undefined) return;
            
            // 방향성에 따라 점수 조정
            let adjustedScore = answer;
            if (questionDirections[index] === 'negative') {
                // negative 방향일 때는 점수를 반전 (1→5, 2→4, 3→3, 4→2, 5→1)
                adjustedScore = 6 - answer;
            }
            
            if (index < 15) {
                economicScore += adjustedScore;
            } else if (index < 30) {
                socialScore += adjustedScore;
            } else if (index < 45) {
                culturalScore += adjustedScore;
            } else {
                participationScore += adjustedScore;
            }
        });
        
        // 평균 점수 계산
        return {
            economic: economicScore / 15,
            social: socialScore / 15,
            cultural: culturalScore / 15,
            participation: participationScore / 15
        };
    } catch (error) {
        console.error('Error calculating scores:', error);
        alert('점수 계산 중 오류가 발생했습니다.');
        return null;
    }
}

// 타입 코드 생성 함수
function generateTypeCode(scores) {
    let code = "";
    // 점수가 높을수록(>3) 첫 번째 값에 가까움
    code += scores.economic > 3 ? "M" : "G";  // Market(시장) vs Government(정부)
    code += scores.social > 3 ? "P" : "C";    // Progressive(진보) vs Conservative(보수)  
    code += scores.cultural > 3 ? "O" : "T";  // Open(개방) vs Traditional(전통)
    code += scores.participation > 3 ? "S" : "N"; // Social(시민) vs elitist(엘리트)
    return code;
}

// 매칭 서비스로 이동
function goToMatching() {
    // 전역 변수 확인
    if (!window.currentTypeCode || !window.currentResult) {
        alert('테스트 결과를 찾을 수 없습니다. 다시 시도해주세요.');
        return;
    }
    
    // 테스트 결과는 이미 showResult()에서 저장되었으므로 여기서는 페이지 이동만 수행
    
    window.location.href = 'meeting-schedule.html';
}

// 결과 공유하기
function shareResult() {
    const result = window.currentResult;
    const typeCode = window.currentTypeCode;
    
    if (!result || !typeCode) {
        alert('테스트 결과를 찾을 수 없습니다.');
        return;
    }
    
    const shareText = `나의 정치 성향은 '${result.title}'입니다! 당신의 성향도 알아보세요.`;
    const shareUrl = window.location.origin + '/political-test.html';
    const textToCopy = `${shareText}\n${shareUrl}`;
    
    // 클립보드에 복사
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showCopyNotification('링크가 복사되었습니다!');
        }).catch(() => {
            fallbackCopyToClipboard(textToCopy);
        });
    } else {
        fallbackCopyToClipboard(textToCopy);
    }
}

// 구형 브라우저용 복사 함수
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-999px';
    textArea.style.left = '-999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyNotification('링크가 복사되었습니다!');
    } catch (err) {
        showCopyNotification('복사에 실패했습니다. 수동으로 복사해주세요.');
    }
    
    document.body.removeChild(textArea);
}

// 복사 알림 표시
function showCopyNotification(message) {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.copy-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 애니메이션
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 3초 후 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 서버에 정치 성향 저장
async function savePoliticalTypeToServer(politicalType) {
    const userEmail = sessionStorage.getItem('userEmail');
    
    try {
        // api-client.js의 savePoliticalType 함수 사용
        if (typeof savePoliticalType === 'function') {
            const response = await savePoliticalType(politicalType);
            
            if (response.success) {
                console.log('정치 성향이 서버에 저장되었습니다.');
            } else {
                console.error('정치 성향 저장 실패:', response.message);
            }
        } else {
            // API 함수가 없는 경우 - 폴백
            console.log('서버 API 사용 불가 - 로컬 저장만 수행');
            saveToLocalStorageOnly(politicalType);
        }
    } catch (error) {
        console.error('정치 성향 저장 중 오류:', error);
        
        // 서버 연결 실패 시 로컬 스토리지에만 저장
        saveToLocalStorageOnly(politicalType);
    }
}

// 로컬 스토리지에만 저장 (데모 모드)
function saveToLocalStorageOnly(politicalType) {
    const userEmail = sessionStorage.getItem('userEmail');
    if (userEmail) {
        localStorage.setItem(`politicalType_${userEmail}`, politicalType);
        console.log('정치 성향이 로컬에 저장되었습니다. (데모 모드)');
    }
}