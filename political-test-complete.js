    // 16가지 성향 타입 정의
    const resultTypes = {
        "MPOS": {
            title: "시장 다원주의자",
            icon: "🌐",
            percentage: "전체의 6%",
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
            matching: ["사회적 기업가", "다원주의자", "글로벌 시민"]
        },
        "MPON": {
            title: "테크노 자유주의자",
            icon: "🚀",
            percentage: "전체의 4%",
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
            matching: ["기술 혁신가", "과학적 진보주의자", "실리콘밸리형"]
        },
        "MPTS": {
            title: "참여 자유주의자",
            icon: "🗣️",
            percentage: "전체의 5%",
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
            matching: ["시민 활동가", "지역 리더", "참여 민주주의자"]
        },
        "MPTN": {
            title: "엘리트 자유주의자",
            icon: "🎓",
            percentage: "전체의 3%",
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
            matching: ["지식 엘리트", "문화 귀족", "합리적 개혁가"]
        },
        "MCOS": {
            title: "문화 보수주의자",
            icon: "🏛️",
            percentage: "전체의 7%",
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
            matching: ["온건 보수주의자", "문화적 보수", "전통 개방주의자"]
        },
        "MCON": {
            title: "온건 보수주의자",
            icon: "⚖️",
            percentage: "전체의 8%",
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
            matching: ["실용적 보수", "중도 우파", "안정 추구형"]
        },
        "MCTS": {
            title: "풀뿌리 보수주의자",
            icon: "🌾",
            percentage: "전체의 6%",
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
            matching: ["지역 보수주의자", "공동체주의자", "전통 수호자"]
        },
        "MCTN": {
            title: "전통 보수주의자",
            icon: "👑",
            percentage: "전체의 9%",
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
            matching: ["귀족적 보수", "전통주의자", "질서 수호자"]
        },
        "GPOS": {
            title: "참여 사회민주주의자",
            icon: "🤝",
            percentage: "전체의 7%",
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
            matching: ["진보적 활동가", "사회민주주의자", "참여 시민"]
        },
        "GPON": {
            title: "전문가 사회민주주의자",
            icon: "📊",
            percentage: "전체의 5%",
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
            matching: ["정책 전문가", "테크노크라트", "계획 진보주의자"]
        },
        "GPTS": {
            title: "민중 진보주의자",
            icon: "✊",
            percentage: "전체의 6%",
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
            matching: ["노동 운동가", "민중주의자", "공동체 활동가"]
        },
        "GPTN": {
            title: "계획 진보주의자",
            icon: "📋",
            percentage: "전체의 4%",
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
            matching: ["사회 계획가", "체제 개혁가", "발전주의자"]
        },
        "GCOS": {
            title: "온건 국가주의자",
            icon: "🏛️",
            percentage: "전체의 8%",
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
            matching: ["애국적 중도주의자", "국민 통합론자", "온건 민족주의자"]
        },
        "GCON": {
            title: "권위 보수주의자",
            icon: "⚔️",
            percentage: "전체의 10%",
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
            matching: ["법과 질서 수호자", "권위주의자", "국가 우선주의자"]
        },
        "GCTS": {
            title: "민족 보수주의자",
            icon: "🇰🇷",
            percentage: "전체의 9%",
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
            matching: ["애국 보수주의자", "전통 수호자", "민족주의자"]
        },
        "GCTN": {
            title: "위계 보수주의자",
            icon: "🏰",
            percentage: "전체의 11%",
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
            matching: ["전통주의자", "질서 수호자", "보수 엘리트"]
        }
    };
    
    // 점수 기반으로 성향 결정
    function determineType() {
        // 각 축의 점수를 기준으로 코드 생성
        let code = "";
        
        // 경제축: 3점 미만이면 M(시장), 이상이면 G(정부)
        code += economicScore < 3 ? "M" : "G";
        
        // 사회축: 3점 이상이면 P(진보), 미만이면 C(보수)
        code += socialScore >= 3 ? "P" : "C";
        
        // 문화축: 3점 이상이면 O(개방), 미만이면 T(전통)
        code += culturalScore >= 3 ? "O" : "T";
        
        // 참여축: 3점 이상이면 S(시민), 미만이면 N(엘리트)
        code += participationScore >= 3 ? "S" : "N";
        
        return resultTypes[code];
    }