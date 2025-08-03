// 질문별 방향성 정의
// direction: "positive"는 동의할수록 해당 축의 첫 번째 값(M/P/O/S)에 가까워짐
// direction: "negative"는 동의할수록 해당 축의 두 번째 값(G/C/T/N)에 가까워짐

const questionsWithDirection = [
    // 경제 정책 축 (M: 시장 자유주의 vs G: 정부 개입주의)
    {
        id: 1,
        text: "회사가 어려울 때 정부가 지원하는 것이 필요하다고 생각해요",
        axis: "economic",
        direction: "negative" // 동의 → 정부 개입(G)
    },
    {
        id: 2,
        text: "최저임금을 올리면 일자리가 줄어들 수 있어도 근로자를 보호해야 해요",
        axis: "economic",
        direction: "negative" // 동의 → 정부 개입(G)
    },
    {
        id: 3,
        text: "부자에게 더 많은 세금을 부과하는 것은 공정해요",
        axis: "economic",
        direction: "negative" // 동의 → 정부 개입(G)
    },
    {
        id: 4,
        text: "기업이 자유롭게 경쟁할 때 사회 전체가 더 발전해요",
        axis: "economic",
        direction: "positive" // 동의 → 시장 자유(M)
    },
    {
        id: 5,
        text: "모든 사람이 기본적인 생활을 할 수 있도록 국가가 보장해야 해요",
        axis: "economic",
        direction: "negative" // 동의 → 정부 개입(G)
    },
    {
        id: 6,
        text: "시장에서 자율적으로 가격이 정해지는 것이 가장 효율적이에요",
        axis: "economic",
        direction: "positive" // 동의 → 시장 자유(M)
    },
    {
        id: 7,
        text: "복지 혜택을 늘리면 사람들이 일할 의욕을 잃을 수 있어요",
        axis: "economic",
        direction: "positive" // 동의 → 시장 자유(M)
    },
    {
        id: 8,
        text: "대기업보다는 중소기업과 자영업자를 더 지원해야 해요",
        axis: "economic",
        direction: "negative" // 동의 → 정부 개입(G)
    },
    {
        id: 9,
        text: "부동산 투기를 막기 위해 정부가 강하게 규제해야 해요",
        axis: "economic",
        direction: "negative" // 동의 → 정부 개입(G)
    },
    {
        id: 10,
        text: "경제가 어려워도 환경 보호를 우선시해야 해요",
        axis: "economic",
        direction: "negative" // 동의 → 정부 개입(G)
    },
    {
        id: 11,
        text: "공공서비스는 민간보다 국가가 직접 운영하는 것이 좋아요",
        axis: "economic",
        direction: "negative" // 동의 → 정부 개입(G)
    },
    {
        id: 12,
        text: "개인의 노력으로 성공하면 그에 따른 보상을 받는 것이 당연해요",
        axis: "economic",
        direction: "positive" // 동의 → 시장 자유(M)
    },
    {
        id: 13,
        text: "일자리 창출을 위해 기업 규제를 완화하는 것이 필요해요",
        axis: "economic",
        direction: "positive" // 동의 → 시장 자유(M)
    },
    {
        id: 14,
        text: "소득 격차를 줄이는 것이 경제 성장보다 더 중요해요",
        axis: "economic",
        direction: "negative" // 동의 → 정부 개입(G)
    },
    {
        id: 15,
        text: "국가 부채가 늘어나도 경기 부양을 위한 투자는 필요해요",
        axis: "economic",
        direction: "negative" // 동의 → 정부 개입(G)
    },
    
    // 사회 이슈 축 (P: 진보적 vs C: 보수적)
    {
        id: 16,
        text: "성별에 관계없이 모든 직업에 동등한 기회가 주어져야 해요",
        axis: "social",
        direction: "positive" // 동의 → 진보적(P)
    },
    {
        id: 17,
        text: "다양한 가족 형태(한부모, 동성커플 등)를 인정해야 해요",
        axis: "social",
        direction: "positive" // 동의 → 진보적(P)
    },
    {
        id: 18,
        text: "차별금지법으로 모든 형태의 차별을 금지해야 해요",
        axis: "social",
        direction: "positive" // 동의 → 진보적(P)
    },
    {
        id: 19,
        text: "여성 전용 공간(화장실, 탈의실 등)은 생물학적 여성만 사용해야 해요",
        axis: "social",
        direction: "negative" // 동의 → 보수적(C)
    },
    {
        id: 20,
        text: "이민자들도 우리나라 국민과 동등한 권리를 가져야 해요",
        axis: "social",
        direction: "positive" // 동의 → 진보적(P)
    },
    {
        id: 21,
        text: "성소수자의 권리를 법적으로 보장하는 것이 중요해요",
        axis: "social",
        direction: "positive" // 동의 → 진보적(P)
    },
    {
        id: 22,
        text: "종교적 신념도 존중받아야 하지만 법보다 우선할 수는 없어요",
        axis: "social",
        direction: "positive" // 동의 → 진보적(P)
    },
    {
        id: 23,
        text: "임신중단(낙태)은 여성이 스스로 결정할 수 있어야 해요",
        axis: "social",
        direction: "positive" // 동의 → 진보적(P)
    },
    {
        id: 24,
        text: "군 복무는 성별에 관계없이 모든 사람이 해야 해요",
        axis: "social",
        direction: "positive" // 동의 → 진보적(P)
    },
    {
        id: 25,
        text: "전통적인 가족 가치를 지키는 것이 사회 안정에 중요해요",
        axis: "social",
        direction: "negative" // 동의 → 보수적(C)
    },
    {
        id: 26,
        text: "노동조합 활동은 근로자의 권리로서 보장되어야 해요",
        axis: "social",
        direction: "positive" // 동의 → 진보적(P)
    },
    {
        id: 27,
        text: "사형제는 흉악범죄 예방을 위해 필요해요",
        axis: "social",
        direction: "negative" // 동의 → 보수적(C)
    },
    {
        id: 28,
        text: "학교에서 성교육을 적극적으로 시행해야 해요",
        axis: "social",
        direction: "positive" // 동의 → 진보적(P)
    },
    {
        id: 29,
        text: "부모님의 의견을 따르는 것이 자녀의 도리예요",
        axis: "social",
        direction: "negative" // 동의 → 보수적(C)
    },
    {
        id: 30,
        text: "대마초 같은 약물도 개인의 선택으로 허용할 수 있어요",
        axis: "social",
        direction: "positive" // 동의 → 진보적(P)
    },
    
    // 문화적 개방성 축 (O: 개방적 vs T: 전통적)
    {
        id: 31,
        text: "외국 문화를 적극적으로 받아들이는 것이 좋아요",
        axis: "cultural",
        direction: "positive" // 동의 → 개방적(O)
    },
    {
        id: 32,
        text: "한국의 전통문화를 지키는 것이 더 중요해요",
        axis: "cultural",
        direction: "negative" // 동의 → 전통적(T)
    },
    {
        id: 33,
        text: "글로벌 기업이 국내에 진출하는 것을 환영해요",
        axis: "cultural",
        direction: "positive" // 동의 → 개방적(O)
    },
    {
        id: 34,
        text: "한글 사용을 장려하고 외래어 사용을 줄여야 해요",
        axis: "cultural",
        direction: "negative" // 동의 → 전통적(T)
    },
    {
        id: 35,
        text: "다문화 가정 자녀도 완전한 한국인으로 받아들여야 해요",
        axis: "cultural",
        direction: "positive" // 동의 → 개방적(O)
    },
    {
        id: 36,
        text: "우리나라 역사와 전통에 자부심을 가져야 해요",
        axis: "cultural",
        direction: "negative" // 동의 → 전통적(T)
    },
    {
        id: 37,
        text: "해외 여행보다 국내 여행을 더 선호해요",
        axis: "cultural",
        direction: "negative" // 동의 → 전통적(T)
    },
    {
        id: 38,
        text: "K-POP이 전 세계로 퍼지는 것이 자랑스러워요",
        axis: "cultural",
        direction: "positive" // 동의 → 개방적(O)
    },
    {
        id: 39,
        text: "외국인과 결혼하는 것도 자연스러운 선택이에요",
        axis: "cultural",
        direction: "positive" // 동의 → 개방적(O)
    },
    {
        id: 40,
        text: "한국인의 정체성을 지키는 것이 가장 중요해요",
        axis: "cultural",
        direction: "negative" // 동의 → 전통적(T)
    },
    {
        id: 41,
        text: "영어교육은 국제 경쟁력을 위해 필수예요",
        axis: "cultural",
        direction: "positive" // 동의 → 개방적(O)
    },
    {
        id: 42,
        text: "서양 명절보다 우리 명절을 더 중요하게 여겨야 해요",
        axis: "cultural",
        direction: "negative" // 동의 → 전통적(T)
    },
    {
        id: 43,
        text: "외국 브랜드보다 국산 브랜드를 애용해야 해요",
        axis: "cultural",
        direction: "negative" // 동의 → 전통적(T)
    },
    {
        id: 44,
        text: "세계시민으로서의 의식을 가지는 것이 중요해요",
        axis: "cultural",
        direction: "positive" // 동의 → 개방적(O)
    },
    {
        id: 45,
        text: "조상님들의 지혜를 현대에도 활용해야 해요",
        axis: "cultural",
        direction: "negative" // 동의 → 전통적(T)
    },
    
    // 정치 참여 축 (S: 시민 참여 vs N: 엘리트 주도)
    {
        id: 46,
        text: "시민들이 직접 정치에 참여하는 것이 민주주의의 핵심이에요",
        axis: "participation",
        direction: "positive" // 동의 → 시민 참여(S)
    },
    {
        id: 47,
        text: "전문가들이 정책을 결정하는 것이 더 효율적이에요",
        axis: "participation",
        direction: "negative" // 동의 → 엘리트 주도(N)
    },
    {
        id: 48,
        text: "시위와 집회는 민주주의를 지키는 중요한 수단이에요",
        axis: "participation",
        direction: "positive" // 동의 → 시민 참여(S)
    },
    {
        id: 49,
        text: "정치인들에게 맡기고 일반 시민은 생업에 집중해야 해요",
        axis: "participation",
        direction: "negative" // 동의 → 엘리트 주도(N)
    },
    {
        id: 50,
        text: "온라인 청원 등으로 시민 의견을 적극 반영해야 해요",
        axis: "participation",
        direction: "positive" // 동의 → 시민 참여(S)
    },
    {
        id: 51,
        text: "복잡한 문제일수록 소수의 전문가가 결정해야 해요",
        axis: "participation",
        direction: "negative" // 동의 → 엘리트 주도(N)
    },
    {
        id: 52,
        text: "주민투표로 지역 문제를 직접 결정하는 것이 좋아요",
        axis: "participation",
        direction: "positive" // 동의 → 시민 참여(S)
    },
    {
        id: 53,
        text: "대중의 감정보다 전문가의 이성적 판단이 중요해요",
        axis: "participation",
        direction: "negative" // 동의 → 엘리트 주도(N)
    },
    {
        id: 54,
        text: "SNS를 통한 정치 참여가 활발해지는 것이 좋아요",
        axis: "participation",
        direction: "positive" // 동의 → 시민 참여(S)
    },
    {
        id: 55,
        text: "정치는 정치인들의 영역이라고 생각해요",
        axis: "participation",
        direction: "negative" // 동의 → 엘리트 주도(N)
    },
    {
        id: 56,
        text: "시민단체 활동이 사회 변화에 중요한 역할을 해요",
        axis: "participation",
        direction: "positive" // 동의 → 시민 참여(S)
    },
    {
        id: 57,
        text: "능력 있는 지도자에게 권한을 집중하는 것이 효과적이에요",
        axis: "participation",
        direction: "negative" // 동의 → 엘리트 주도(N)
    },
    {
        id: 58,
        text: "풀뿌리 민주주의가 진정한 민주주의예요",
        axis: "participation",
        direction: "positive" // 동의 → 시민 참여(S)
    },
    {
        id: 59,
        text: "대중은 선동에 취약하므로 엘리트의 지도가 필요해요",
        axis: "participation",
        direction: "negative" // 동의 → 엘리트 주도(N)
    },
    {
        id: 60,
        text: "모든 시민이 정치적 결정에 참여할 권리가 있어요",
        axis: "participation",
        direction: "positive" // 동의 → 시민 참여(S)
    }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = questionsWithDirection;
}