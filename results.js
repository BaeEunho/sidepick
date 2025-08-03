// 16개 성향 유형 데이터
// 4개 축의 조합으로 16가지 유형 생성
// M/G (Market/Government) + P/C (Progressive/Conservative) + O/T (Open/Traditional) + S/N (citiZen/expert)

const personalityTypes = {
    // 시장경제 + 진보사회 + 개방문화 + 시민참여
    MPOS: {
        code: "MPOS",
        name: "시장 다원주의자",
        shortDesc: "자유로운 시장과 다양성을 추구하는 참여형 시민",
        description: "당신은 시장 경제를 지지하면서도 사회적 진보를 추구하는 성향을 가지고 있습니다. 자유로운 경제 활동을 중요하게 생각하지만, 동시에 사회적 다양성과 개방성을 지지합니다. 시민들의 적극적인 정치 참여를 통해 더 나은 사회를 만들어갈 수 있다고 믿습니다.",
        traits: ["혁신적 사고", "경제적 자유주의", "사회적 포용성", "시민 참여 중시"],
        percentage: 8.5
    },

    // 시장경제 + 진보사회 + 개방문화 + 전문가주도
    MPON: {
        code: "MPON",
        name: "테크노 자유주의자",
        shortDesc: "합리적 전문성과 개방적 가치를 결합하는 유형",
        description: "시장 중심의 경제 체제를 선호하면서도 사회적으로는 진보적 가치를 추구합니다. 복잡한 정책 결정에는 전문가의 역할이 중요하다고 생각하며, 합리적이고 효율적인 의사결정을 선호합니다.",
        traits: ["전문성 중시", "합리적 판단", "개방적 사고", "효율성 추구"],
        percentage: 12.3
    },

    // 시장경제 + 보수사회 + 개방문화 + 시민참여
    MCOS: {
        code: "MCOS",
        name: "문화 보수주의자",
        shortDesc: "경제적 실용성과 문화적 개방성을 조화시키는 유형",
        description: "시장 경제의 효율성을 인정하면서도 사회적으로는 보수적 가치를 일부 유지합니다. 문화적으로는 개방적이며, 시민들의 의견을 정책에 반영하는 것을 중요하게 생각합니다.",
        traits: ["실용적 사고", "문화적 개방성", "점진적 변화", "시민 의견 존중"],
        percentage: 15.7
    },

    // 시장경제 + 보수사회 + 개방문화 + 전문가주도
    MCON: {
        code: "MCON",
        name: "온건 보수주의자",
        shortDesc: "안정적 발전을 추구하는 현실주의적 성향",
        description: "시장 경제를 기반으로 하되 사회적 안정을 중시합니다. 급진적 변화보다는 점진적 개선을 선호하며, 전문가의 신중한 판단을 신뢰합니다.",
        traits: ["안정성 추구", "점진적 개선", "전문가 신뢰", "현실주의적"],
        percentage: 18.2
    },

    // 정부개입 + 진보사회 + 개방문화 + 시민참여
    GPOS: {
        code: "GPOS",
        name: "참여 사회민주주의자",
        shortDesc: "사회적 연대와 시민 참여를 중시하는 공동체주의",
        description: "정부가 적극적으로 사회 문제에 개입해야 한다고 생각하며, 진보적 사회 가치를 지지합니다. 시민들의 참여를 통한 민주주의 발전을 중요하게 여깁니다.",
        traits: ["사회적 연대", "정부 역할 확대", "민주적 참여", "포용적 사회"],
        percentage: 11.4
    },

    // 정부개입 + 진보사회 + 개방문화 + 전문가주도
    GPON: {
        code: "GPON",
        name: "전문가 사회민주주의자",
        shortDesc: "전문적 정책으로 평등한 사회를 추구하는 유형",
        description: "정부의 적극적 역할을 통해 사회 평등을 실현하고자 합니다. 전문적 정책 설계와 체계적 접근을 통해 사회 문제를 해결할 수 있다고 믿습니다.",
        traits: ["사회 평등 추구", "체계적 정책", "전문성 기반", "계획적 접근"],
        percentage: 9.8
    },

    // 정부개입 + 보수사회 + 개방문화 + 시민참여
    GCOS: {
        code: "GCOS",
        name: "온건 국가주의자",
        shortDesc: "전통 가치와 정부 역할을 조화시키는 균형형",
        description: "정부가 사회 안정을 위해 필요한 역할을 해야 한다고 생각하지만, 사회적으로는 보수적 가치를 지지합니다. 시민 참여를 통한 점진적 발전을 추구합니다.",
        traits: ["전통 가치 존중", "사회 안정 중시", "점진적 발전", "균형감각"],
        percentage: 13.6
    },

    // 정부개입 + 보수사회 + 개방문화 + 전문가주도
    GCON: {
        code: "GCON",
        name: "권위 보수주의자",
        shortDesc: "안정과 질서를 중시하는 체계적 보수주의",
        description: "강한 정부의 리더십과 전문가의 판단을 신뢰합니다. 사회 질서와 안정을 최우선으로 여기며, 체계적이고 계획적인 사회 운영을 선호합니다.",
        traits: ["질서 중시", "강한 리더십", "체계적 운영", "안정 우선"],
        percentage: 7.9
    },

    // 시장경제 + 진보사회 + 전통문화 + 시민참여
    MPTS: {
        code: "MPTS",
        name: "참여 자유주의자",
        shortDesc: "경제적 자유와 시민 참여를 중시하는 실용주의",
        description: "자유로운 시장 경제를 지지하면서도 사회적으로는 진보적 가치를 추구합니다. 다만 문화적으로는 전통을 존중하며, 시민들의 적극적 참여를 중요하게 생각합니다.",
        traits: ["경제적 자유", "사회적 진보", "전통 존중", "시민 참여"],
        percentage: 6.7
    },

    // 시장경제 + 진보사회 + 전통문화 + 전문가주도
    MPTN: {
        code: "MPTN",
        name: "엘리트 자유주의자",
        shortDesc: "전문성 기반의 자유주의적 개혁을 추구하는 유형",
        description: "시장 경제의 자유로움을 지지하고 사회적으로는 진보적이지만, 문화적으로는 전통을 중시합니다. 전문가의 신중한 판단을 통한 개혁을 선호합니다.",
        traits: ["전문가 중심", "신중한 개혁", "자유 시장", "균형적 시각"],
        percentage: 5.3
    },

    // 시장경제 + 보수사회 + 전통문화 + 시민참여
    MCTS: {
        code: "MCTS",
        name: "풀뿌리 보수주의자",
        shortDesc: "실용적 보수주의와 시민 참여를 결합하는 안정형",
        description: "시장 경제를 기반으로 하되 사회적, 문화적으로는 보수적 가치를 추구합니다. 시민들의 의견을 존중하면서도 안정적 발전을 추구하는 중도적 성향입니다.",
        traits: ["중도적 균형", "실용적 접근", "안정적 발전", "시민 의견 존중"],
        percentage: 16.8
    },

    // 시장경제 + 보수사회 + 전통문화 + 전문가주도
    MCTN: {
        code: "MCTN",
        name: "전통 보수주의자",
        shortDesc: "전통과 안정을 중시하는 신중한 보수주의",
        description: "시장 경제를 지지하면서도 사회적, 문화적으로는 전통적 가치를 중시합니다. 급진적 변화보다는 안정적이고 신중한 발전을 선호합니다.",
        traits: ["전통 가치", "신중한 판단", "안정 우선", "점진적 변화"],
        percentage: 19.4
    },

    // 정부개입 + 진보사회 + 전통문화 + 시민참여
    GPTS: {
        code: "GPTS",
        name: "민중 진보주의자",
        shortDesc: "사회적 연대와 전통을 조화시키는 참여형 공동체주의",
        description: "정부의 적극적 역할을 통해 사회 문제를 해결하고자 하며, 사회적으로는 진보적이지만 문화적으로는 전통을 존중합니다. 시민들의 직접적 참여를 중시합니다.",
        traits: ["사회적 연대", "전통 존중", "시민 참여", "공동체 중심"],
        percentage: 4.9
    },

    // 정부개입 + 진보사회 + 전통문화 + 전문가주도
    GPTN: {
        code: "GPTN",
        name: "계획 진보주의자",
        shortDesc: "체계적 계획과 사회 발전을 추구하는 전문가주의",
        description: "정부 주도의 체계적 계획을 통해 사회 발전을 추구합니다. 사회적으로는 진보적이지만 문화적으로는 전통을 중시하며, 전문가의 판단을 신뢰합니다.",
        traits: ["계획적 접근", "체계적 발전", "전문가 신뢰", "사회 진보"],
        percentage: 3.2
    },

    // 정부개입 + 보수사회 + 전통문화 + 시민참여
    GCTS: {
        code: "GCTS",
        name: "민족 보수주의자",
        shortDesc: "강한 국가와 전통 가치를 추구하는 애국적 보수주의",
        description: "강한 정부의 역할과 전통적 가치를 모두 중시합니다. 국가의 안정과 발전을 위해 시민들의 참여가 필요하다고 생각하지만, 전통적 질서 안에서의 참여를 선호합니다.",
        traits: ["국가 중심", "전통 중시", "질서 유지", "애국적 참여"],
        percentage: 2.8
    },

    // 정부개입 + 보수사회 + 전통문화 + 전문가주도
    GCTN: {
        code: "GCTN",
        name: "위계 보수주의자",
        shortDesc: "질서와 안정을 최우선으로 하는 전통적 권위주의",
        description: "강한 정부, 사회 질서, 전통 가치, 전문가 주도를 모두 중시하는 가장 보수적인 성향입니다. 안정과 질서를 통한 체계적 사회 운영을 추구합니다.",
        traits: ["강한 권위", "질서 우선", "전통 보존", "체계적 운영"],
        percentage: 1.7
    }
};

// 점수를 기반으로 성향 유형을 결정하는 함수
function determinePersonalityType(scores) {
    // 각 축별로 이분법적 결정
    const economic = scores.economic >= 3 ? 'M' : 'G';  // Market vs Government
    const social = scores.social >= 3 ? 'P' : 'C';      // Progressive vs Conservative  
    const culture = scores.culture >= 3 ? 'O' : 'T';    // Open vs Traditional
    const participation = scores.participation >= 3 ? 'S' : 'N'; // citiZen vs expert

    const typeCode = economic + social + culture + participation;
    return personalityTypes[typeCode];
}

// 축별 설명
const axisDescriptions = {
    economic: {
        name: "경제관",
        leftLabel: "정부개입",
        rightLabel: "시장경제",
        leftDesc: "정부가 경제에 적극 개입하여 불평등을 해결해야 한다",
        rightDesc: "시장의 자유로운 경쟁이 효율적이고 공정한 결과를 만든다"
    },
    social: {
        name: "사회관",
        leftLabel: "보수사회", 
        rightLabel: "진보사회",
        leftDesc: "사회 질서와 안정을 위해 전통적 가치를 유지해야 한다",
        rightDesc: "다양성과 포용을 통해 더 평등한 사회를 만들어야 한다"
    },
    culture: {
        name: "문화관",
        leftLabel: "전통문화",
        rightLabel: "개방문화", 
        leftDesc: "기존의 문화와 관습을 보존하고 계승하는 것이 중요하다",
        rightDesc: "새로운 문화와 가치에 열려있고 변화를 수용해야 한다"
    },
    participation: {
        name: "참여관",
        leftLabel: "전문가주도",
        rightLabel: "시민참여",
        leftDesc: "복잡한 정책은 전문가가 효율적으로 결정하는 것이 좋다", 
        rightDesc: "시민들이 직접 정치에 참여하여 의사결정에 영향을 미쳐야 한다"
    }
};