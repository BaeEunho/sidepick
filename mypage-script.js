// 마이페이지 스크립트
let refreshInterval;

document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크만 (테스트 완료 체크는 하지 않음)
    const userState = AuthManager.getUserState();
    
    if (userState.type === 'anonymous') {
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = 'login.html';
        return;
    }
    
    // 초기 로드
    refreshData();
    
    // 5초마다 자동 새로고침
    refreshInterval = setInterval(refreshData, 5000);
    
    // 페이지 이탈 시 인터벌 정리
    window.addEventListener('beforeunload', () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    });
});

// 데이터 새로고침 함수
async function refreshData() {
    showSyncStatus('loading', '데이터 동기화 중...');
    
    try {
        // 서버에서 최신 정보 가져오기
        await syncWithServer();
        
        // 사용자 정보 로드
        loadUserProfile();
        
        const userState = AuthManager.getUserState();
        
        // 테스트 완료 여부에 따라 다른 내용 표시
        if (userState.type === 'verified') {
            loadPoliticalType();
            await loadUpcomingMeetings();
        } else {
            showTestPrompt();
        }
        
        // 마지막 업데이트 시간 표시
        updateLastUpdateTime();
        
        // 성공 시 동기화 상태 숨기기
        hideSyncStatus();
        
    } catch (error) {
        console.error('데이터 새로고침 실패:', error);
        showSyncStatus('error', '동기화 실패');
        setTimeout(() => hideSyncStatus(), 3000);
    }
}

// 서버와 데이터 동기화
async function syncWithServer() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;
    
    try {
        // 서버에서 사용자 정보 가져오기
        const response = await fetch('http://localhost:3000/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            // 서버 데이터로 sessionStorage 업데이트
            if (data.politicalType) {
                sessionStorage.setItem('politicalType', data.politicalType);
                
                // 정치 성향 상세 정보가 있다면 업데이트
                if (window.resultTypes && window.resultTypes[data.politicalType]) {
                    sessionStorage.setItem('testResultDetail', JSON.stringify(window.resultTypes[data.politicalType]));
                    sessionStorage.setItem('userType', JSON.stringify(window.resultTypes[data.politicalType]));
                }
            }
            
            if (data.meetings) {
                // 모임 신청 정보 업데이트
                const appliedMeetings = {};
                data.meetings.forEach(meeting => {
                    appliedMeetings[meeting.orientation] = {
                        appliedAt: meeting.appliedAt,
                        status: meeting.status,
                        meetingId: meeting.id,
                        title: meeting.title,
                        date: meeting.date,
                        location: meeting.location
                    };
                });
                sessionStorage.setItem('appliedMeetings', JSON.stringify(appliedMeetings));
            }
        }
    } catch (error) {
        console.error('서버 동기화 실패:', error);
        // 서버 연결 실패 시에도 로컬 데이터로 계속 진행
    }
}

// 동기화 상태 표시 함수
function showSyncStatus(status, message) {
    const syncStatus = document.getElementById('sync-status');
    if (!syncStatus) return;
    
    syncStatus.className = `sync-status ${status}`;
    syncStatus.querySelector('.sync-text').textContent = message;
    syncStatus.classList.remove('hidden');
}

function hideSyncStatus() {
    const syncStatus = document.getElementById('sync-status');
    if (syncStatus) {
        syncStatus.classList.add('hidden');
    }
}

// 마지막 업데이트 시간 표시
function updateLastUpdateTime() {
    const lastUpdateEl = document.getElementById('last-update');
    if (lastUpdateEl) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        lastUpdateEl.textContent = `(최신 업데이트: ${timeStr})`;
    }
}

// 프로필 정보 로드
function loadUserProfile() {
    const userState = AuthManager.getUserState();
    const profile = userState.profile;
    
    document.getElementById('profile-name').textContent = profile.name || '-';
    document.getElementById('profile-email').textContent = profile.email || '-';
    document.getElementById('profile-phone').textContent = profile.phone || '-';
    document.getElementById('profile-gender').textContent = 
        profile.gender === 'male' ? '남성' : '여성';
}

// 정치 성향 정보 로드
function loadPoliticalType() {
    const userState = AuthManager.getUserState();
    const politicalType = sessionStorage.getItem('politicalType'); // 코드만 저장되어 있음
    const userTypeData = JSON.parse(sessionStorage.getItem('userType') || '{}'); // 상세 정보
    const testResultDetail = JSON.parse(sessionStorage.getItem('testResultDetail') || '{}'); // 테스트 상세 결과
    const testCompletedAt = sessionStorage.getItem('testCompletedAt');
    
    // 아이콘 매핑
    const iconMap = {
        'MPOS': '🌐', 'MPON': '🚀', 'MPTS': '🗣️', 'MPTN': '🎓',
        'MCOS': '🏛️', 'MCON': '⚖️', 'MCTS': '🌾', 'MCTN': '👑',
        'GPOS': '🤝', 'GPON': '📊', 'GPTS': '✊', 'GPTN': '📋',
        'GCOS': '🏛️', 'GCON': '⚔️', 'GCTS': '🇰🇷', 'GCTN': '🏰'
    };
    
    // 전체 정치 성향 타입 데이터 가져오기 - 저장된 상세 결과 우선 사용
    const typeData = testResultDetail && testResultDetail.title ? testResultDetail : 
                     (window.resultTypes ? window.resultTypes[politicalType] : null);
    
    if (typeData) {
        document.getElementById('type-icon').textContent = typeData.icon || iconMap[politicalType] || '🎯';
        document.getElementById('type-title').textContent = typeData.title;
        document.getElementById('type-code').textContent = `타입: ${politicalType}`;
        
        // 퍼센트 표시 요소 숨기기
        const percentageElement = document.getElementById('type-percentage');
        if (percentageElement) {
            percentageElement.style.display = 'none';
        }
        
        document.getElementById('type-description').textContent = typeData.description;
        
        // 축별 점수 표시
        const axisScoresDiv = document.getElementById('axis-scores');
        if (typeData.axisScores) {
            axisScoresDiv.innerHTML = Object.values(typeData.axisScores).map(axis => `
                <div class="axis-item">
                    <h5>${axis.label}</h5>
                    <p class="axis-score">${axis.score}</p>
                    <p class="axis-detail">${axis.detail}</p>
                </div>
            `).join('');
        }
        
        // 연애 특징 표시
        const traitsUl = document.getElementById('relationship-traits');
        if (typeData.relationshipTraits) {
            traitsUl.innerHTML = typeData.relationshipTraits.map(trait => `
                <li>${trait}</li>
            `).join('');
        }
        
        // 대화 가이드 표시
        const goodTopicsUl = document.getElementById('good-topics');
        if (typeData.goodTopics) {
            goodTopicsUl.innerHTML = typeData.goodTopics.map(topic => `
                <li>${topic}</li>
            `).join('');
        }
        
        const avoidTopicsUl = document.getElementById('avoid-topics');
        if (typeData.avoidTopics) {
            avoidTopicsUl.innerHTML = typeData.avoidTopics.map(topic => `
                <li>${topic}</li>
            `).join('');
        }
        
        // 잘 맞는 성향 표시
        const matchingDiv = document.getElementById('matching-types');
        if (typeData.matching) {
            matchingDiv.innerHTML = typeData.matching.map(matchCode => {
                const matchType = window.resultTypes[matchCode];
                if (matchType) {
                    return `
                        <div class="matching-type-card">
                            <span class="match-icon">${matchType.icon}</span>
                            <span class="match-title">${matchType.title}</span>
                            <span class="match-code">${matchCode}</span>
                        </div>
                    `;
                }
                return '';
            }).join('');
        }
        
        // 테스트 완료일 표시
        if (testCompletedAt) {
            const date = new Date(testCompletedAt);
            const dateStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
            document.getElementById('test-date').textContent = dateStr;
        }
    } else {
        // resultTypes가 없는 경우 기본 정보만 표시
        document.getElementById('type-icon').textContent = iconMap[politicalType] || '🎯';
        document.getElementById('type-title').textContent = userTypeData.title || politicalType;
        document.getElementById('type-code').textContent = `타입: ${politicalType}`;
        
        // 퍼센트 표시 요소 숨기기
        const percentageElement = document.getElementById('type-percentage');
        if (percentageElement) {
            percentageElement.style.display = 'none';
        }
        
        document.getElementById('type-description').textContent = 
            userTypeData.orientation === 'progressive' ? 
            '진보적 성향을 가진 타입입니다.' : 
            '보수적 성향을 가진 타입입니다.';
    }
}


// 예정된 소개팅 로드
async function loadUpcomingMeetings() {
    const upcomingDiv = document.getElementById('upcoming-meetings');
    const userState = AuthManager.getUserState();
    
    try {
        // 서버에서 사용자 정보 가져오기
        const token = localStorage.getItem('authToken');
        const API_URL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : '';
            
        const response = await fetch(`${API_URL}/api/user/meetings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.meetings && data.meetings.length > 0) {
                // 가장 최근 모임 표시
                const latestMeeting = data.meetings[0];
                
                // 상태 텍스트 변환
                let statusText, statusClass;
                switch(latestMeeting.status) {
                    case 'paid':
                    case 'confirmed':
                        statusText = '참가 확정';
                        statusClass = 'confirmed';
                        break;
                    case 'pending':
                        statusText = '입금 대기중';
                        statusClass = 'pending';
                        break;
                    case 'cancelled':
                        statusText = '취소됨';
                        statusClass = 'cancelled';
                        break;
                    default:
                        statusText = '입금 대기중';
                        statusClass = 'pending';
                }
        
                upcomingDiv.innerHTML = `
                    <div class="meeting-item">
                        <div class="meeting-header">
                            <h4>${latestMeeting.title}</h4>
                            <span class="meeting-status ${statusClass}">${statusText}</span>
                        </div>
                        <div class="meeting-details">
                            <p>📅 ${latestMeeting.date}</p>
                            <p>⏰ ${latestMeeting.time || '오후 3시 - 5시'}</p>
                            <p>📍 ${latestMeeting.location}</p>
                        </div>
                        ${statusClass === 'pending' ? `
                            <div class="payment-info">
                                <p class="payment-notice">입금을 완료해주세요</p>
                                <div class="bank-info">
                                    <p>신한은행 110-386-140132</p>
                                    <p>예금주: (주)사이드픽</p>
                                    <p>금액: 45,000원</p>
                                </div>
                            </div>
                        ` : ''}
                        ${(statusClass === 'pending' || statusClass === 'confirmed') ? `
                            <div class="meeting-actions">
                                <button class="cancel-meeting-btn" onclick="cancelMeeting('${latestMeeting.id}')">신청 취소</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            } else {
                upcomingDiv.innerHTML = '<p class="no-meeting">예정된 소개팅이 없습니다.</p>';
            }
        } else {
            throw new Error('모임 정보 조회 실패');
        }
    } catch (error) {
        console.error('모임 정보 로드 실패:', error);
        // 오류 시 로컬 데이터 사용 (폴백)
        const appliedMeetings = JSON.parse(sessionStorage.getItem('appliedMeetings') || '{}');
        const userType = sessionStorage.getItem('politicalType');
        const progressiveCodes = ['MPOS', 'MPON', 'MPTS', 'MPTN', 'GPOS', 'GPON', 'GPTS', 'GPTN'];
        const userOrientation = progressiveCodes.includes(userType) ? 'progressive' : 'conservative';
        
        const userMeeting = appliedMeetings[userOrientation];
        
        if (userMeeting) {
            const meetingInfo = {
                progressive: {
                    date: '8월 23일 (토)',
                    time: '오후 3시 - 5시',
                    location: '강남역 파티룸',
                    title: '진보 성향 소개팅'
                },
                conservative: {
                    date: '8월 9일 (토)',
                    time: '오후 3시 - 5시',
                    location: '강남역 파티룸',
                    title: '보수 성향 소개팅'
                }
            };
            
            const meeting = meetingInfo[userOrientation];
            const statusText = userMeeting.status === 'confirmed' ? '참가 확정' : '입금 대기중';
            const statusClass = userMeeting.status === 'confirmed' ? 'confirmed' : 'pending';
            
            upcomingDiv.innerHTML = `
                <div class="meeting-item">
                <div class="meeting-header">
                    <h4>${meeting.title}</h4>
                    <div class="meeting-status ${statusClass}">
                        ${statusText}
                    </div>
                </div>
                <div class="meeting-details">
                    <span class="detail-item">${meeting.date}</span>
                    <span class="detail-separator">•</span>
                    <span class="detail-item">${meeting.time}</span>
                    <span class="detail-separator">•</span>
                    <span class="detail-item">${meeting.location}</span>
                </div>
                ${userMeeting.status === 'pending' ? `
                    <div class="payment-notice">
                        <div class="payment-compact">
                            <span class="bank-info">신한은행 110-386-140132 (배은호)</span>
                            <span class="amount">45,000원</span>
                        </div>
                        <span class="warning-text">입금 기한 내 미입금 시 자동 취소</span>
                    </div>
                ` : ''}
            </div>
        `;
        } else {
            // 예정된 소개팅이 없는 경우
            upcomingDiv.innerHTML = `
                <div class="no-meetings-container">
                    <p class="no-meetings">예정된 소개팅이 없습니다.</p>
                    <button class="apply-meeting-btn" onclick="goToMeetingPage()">
                        소개팅 신청하기
                    </button>
                </div>
            `;
        }
    }
}


// 비밀번호 변경
function changePassword() {
    alert('비밀번호 변경 기능은 준비 중입니다.');
}

// 프로필 수정
function updateProfile() {
    alert('프로필 수정 기능은 준비 중입니다.');
}

// 회원 탈퇴
async function deleteAccount() {
    // 첫 번째 확인
    const firstConfirm = confirm('정말로 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.');
    
    if (!firstConfirm) return;
    
    // 두 번째 확인 (더 강한 경고)
    const secondConfirm = confirm('⚠️ 경고: 회원 탈퇴 후에는 모든 정보가 영구적으로 삭제됩니다.\n\n- 프로필 정보\n- 정치 성향 테스트 결과\n- 소개팅 신청 내역\n\n정말로 탈퇴하시겠습니까?');
    
    if (!secondConfirm) return;
    
    try {
        // 로딩 표시
        const deleteButton = event.target;
        const originalText = deleteButton.textContent;
        deleteButton.textContent = '처리 중...';
        deleteButton.disabled = true;
        
        // 서버에 회원 탈퇴 요청
        const userState = AuthManager.getUserState();
        const token = localStorage.getItem('authToken'); // localStorage에서 토큰 가져오기
        const API_URL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : '';
        const response = await fetch(`${API_URL}/api/auth/delete-account`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token || ''}`
            },
            body: JSON.stringify({
                email: userState.profile.email,
                confirmDelete: true
            })
        });
        
        if (response.ok) {
            // 탈퇴 성공
            alert('회원 탈퇴가 완료되었습니다.\n그동안 사이드픽을 이용해 주셔서 감사합니다.');
            
            // 모든 로컬 데이터 삭제
            sessionStorage.clear();
            localStorage.clear();
            
            // 메인 페이지로 이동
            window.location.href = 'index.html';
        } else {
            // 에러 처리
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.message || '회원 탈퇴 처리 중 오류가 발생했습니다.';
            
            alert(`탈퇴 실패: ${errorMessage}`);
            
            // 버튼 복원
            deleteButton.textContent = originalText;
            deleteButton.disabled = false;
        }
    } catch (error) {
        console.error('회원 탈퇴 중 오류:', error);
        
        // 데모 모드에서는 로컬 데이터만 삭제하고 성공 처리
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            alert('회원 탈퇴가 완료되었습니다.\n(데모 모드: 로컬 데이터만 삭제됨)');
            
            // 모든 로컬 데이터 삭제
            sessionStorage.clear();
            localStorage.clear();
            
            // 메인 페이지로 이동
            window.location.href = 'index.html';
        } else {
            alert('회원 탈퇴 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
            
            // 버튼 복원
            if (event.target) {
                event.target.textContent = '회원 탈퇴';
                event.target.disabled = false;
            }
        }
    }
}

// 테스트 미완료 시 안내 표시
function showTestPrompt() {
    // 정치 성향 카드 숨기기
    const politicalCard = document.querySelector('.political-type-card');
    const upcomingCard = document.querySelector('.upcoming-meetings-card');
    
    if (politicalCard) {
        politicalCard.style.display = 'none';
    }
    
    if (upcomingCard) {
        upcomingCard.innerHTML = `
            <h2>정치 성향 진단이 필요합니다</h2>
            <div class="test-prompt-container">
                <p class="test-prompt-message">
                    소개팅에 참여하시려면 먼저 정치 성향 진단을 완료해주세요.<br>
                    테스트는 약 3분 정도 소요됩니다.
                </p>
                <button class="test-prompt-btn" onclick="location.href='political-test.html?logged_in=true'">
                    정치 성향 진단하기
                </button>
            </div>
        `;
    }
}

// 소개팅 페이지로 이동
function goToMeetingPage() {
    const userType = sessionStorage.getItem('politicalType');
    const progressiveCodes = ['MPOS', 'MPON', 'MPTS', 'MPTN', 'GPOS', 'GPON', 'GPTS', 'GPTN'];
    const userOrientation = progressiveCodes.includes(userType) ? 'progressive' : 'conservative';
    
    // meeting-schedule.html로 이동 (해당 성향만 표시됨)
    window.location.href = 'meeting-schedule.html';
}

// resultTypes 데이터 로드 (정치 성향 상세 정보용)
// political-test-script.js에서 가져온 데이터
window.resultTypes = {
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
            "서로의 의견을 존중하고 경청하는 관계",
            "민주적이고 평등한 파트너십",
            "전통적 가치를 현대적으로 재해석",
            "지역사회와 함께하는 관계"
        ],
        goodTopics: [
            "시민 참여와 민주주의",
            "지역 공동체 활동",
            "전통과 현대의 조화",
            "사회적 기업과 협동조합"
        ],
        avoidTopics: [
            "권위주의적 태도",
            "시민 참여 무시",
            "극단적 개인주의",
            "공동체 가치 부정"
        ],
        matching: ["MPOS", "GPTS", "MCTS"]
    },
    "MPTN": {
        title: "효율 개혁주의자",
        icon: "🎓",
        description: "시장 경제의 효율성과 전문가의 합리적 판단이 사회 발전의 핵심이라고 믿는 성향입니다. 이념보다는 실용성을 중시하며, 데이터와 증거에 기반한 정책을 선호합니다.",
        features: [
            "효율성과 실용주의",
            "전문가 중심 정책",
            "이념보다 성과",
            "과학적 방법론"
        ],
        axisScores: {
            economic: { label: "경제", score: "시장 중심", detail: "효율적 자원 배분" },
            social: { label: "사회", score: "중도 진보", detail: "실용적 개혁" },
            cultural: { label: "문화", score: "전통 존중", detail: "검증된 가치 유지" },
            participation: { label: "참여", score: "전문가 주도", detail: "전문성 기반 의사결정" }
        },
        relationshipTraits: [
            "목표 지향적이고 효율적인 관계",
            "서로의 전문성을 활용하는 파트너십",
            "감정보다 이성을 중시",
            "실용적이고 건설적인 대화"
        ],
        goodTopics: [
            "성과와 효율성",
            "데이터 기반 의사결정",
            "전문 지식과 연구",
            "실용적 문제 해결"
        ],
        avoidTopics: [
            "감정적 호소",
            "비과학적 주장",
            "이념적 극단주의",
            "비효율적 관행"
        ],
        matching: ["MPON", "GPTN", "GPON"]
    },
    "MCOS": {
        title: "자유 전통주의자",
        icon: "🏛️",
        description: "시장 경제의 자유를 지지하면서도 전통적 가치와 사회 질서를 중요시하는 성향입니다. 급격한 변화보다는 점진적 발전을 선호하며, 개인의 자유와 사회적 책임의 균형을 추구합니다.",
        features: [
            "시장 경제와 전통 가치",
            "점진적 사회 변화",
            "질서와 안정 중시",
            "균형잡힌 자유"
        ],
        axisScores: {
            economic: { label: "경제", score: "자유 시장", detail: "규제 최소화" },
            social: { label: "사회", score: "온건 보수", detail: "전통적 가치관" },
            cultural: { label: "문화", score: "개방적", detail: "선택적 수용" },
            participation: { label: "참여", score: "대의 민주주의", detail: "간접 참여 선호" }
        },
        relationshipTraits: [
            "전통적이면서도 개방적인 관계",
            "서로의 독립성을 존중",
            "가족 가치를 중시하는 파트너십",
            "안정적이고 신뢰할 수 있는 관계"
        ],
        goodTopics: [
            "전통과 현대의 균형",
            "자유 시장과 기업가 정신",
            "가족과 공동체 가치",
            "책임감 있는 자유"
        ],
        avoidTopics: [
            "급진적 변화",
            "전통 가치 부정",
            "과도한 정부 개입",
            "무책임한 자유"
        ],
        matching: ["GCOS", "MCON", "MCTS"]
    },
    "MCON": {
        title: "시장 권위주의자",
        icon: "⚖️",
        description: "강한 법치와 질서 속에서 시장 경제가 효율적으로 작동해야 한다고 믿는 성향입니다. 사회 안정과 경제 발전을 위해서는 명확한 규칙과 강력한 집행이 필요하다고 생각합니다.",
        features: [
            "법치와 시장 경제",
            "강력한 질서 유지",
            "효율적 거버넌스",
            "명확한 규칙과 집행"
        ],
        axisScores: {
            economic: { label: "경제", score: "규제된 시장", detail: "질서 있는 경쟁" },
            social: { label: "사회", score: "보수적", detail: "엄격한 법치" },
            cultural: { label: "문화", score: "선택적 개방", detail: "통제된 변화" },
            participation: { label: "참여", score: "엘리트 주도", detail: "효율적 의사결정" }
        },
        relationshipTraits: [
            "명확한 역할과 책임을 가진 관계",
            "질서와 규칙을 중시",
            "권위와 능력을 존중하는 파트너십",
            "안정적이고 예측 가능한 관계"
        ],
        goodTopics: [
            "법과 질서",
            "경제 발전과 안정",
            "리더십과 책임",
            "효율적 시스템"
        ],
        avoidTopics: [
            "무질서와 혼란",
            "법치 무시",
            "무책임한 자유",
            "포퓰리즘"
        ],
        matching: ["GCON", "MCOS", "GCTN"]
    },
    "MCTS": {
        title: "공동체 자유주의자",
        icon: "🌾",
        description: "지역 공동체의 자율성과 전통을 존중하면서도 경제적 자유를 추구하는 성향입니다. 작은 정부와 강한 시민사회를 통해 공동체가 스스로 문제를 해결해야 한다고 믿습니다.",
        features: [
            "지역 자치와 자유 시장",
            "공동체 전통 존중",
            "작은 정부 선호",
            "자발적 연대"
        ],
        axisScores: {
            economic: { label: "경제", score: "자유 시장", detail: "지역 경제 활성화" },
            social: { label: "사회", score: "보수적", detail: "전통 공동체 가치" },
            cultural: { label: "문화", score: "전통주의", detail: "지역 문화 보존" },
            participation: { label: "참여", score: "공동체 중심", detail: "자율적 참여" }
        },
        relationshipTraits: [
            "공동체 속에서 함께 성장하는 관계",
            "전통적 가치를 공유",
            "상호 부조와 연대",
            "지역 사회에 뿌리내린 파트너십"
        ],
        goodTopics: [
            "지역 공동체와 전통",
            "자율과 책임",
            "상호 부조와 연대",
            "지역 경제와 문화"
        ],
        avoidTopics: [
            "중앙집권화",
            "전통 무시",
            "개인주의 극단",
            "공동체 가치 부정"
        ],
        matching: ["MPTS", "GCTS", "MCOS"]
    },
    "MCTN": {
        title: "전통 엘리트주의자",
        icon: "👑",
        description: "전통적 권위와 시장 경제가 조화를 이루어야 한다고 믿는 성향입니다. 사회의 엘리트들이 책임감을 가지고 경제와 사회를 이끌어야 하며, 전통적 가치가 현대 사회의 기반이 되어야 한다고 생각합니다.",
        features: [
            "전통적 엘리트 리더십",
            "시장 경제와 위계 질서",
            "노블레스 오블리주",
            "문화적 보수주의"
        ],
        axisScores: {
            economic: { label: "경제", score: "엘리트 시장", detail: "상류층 주도 경제" },
            social: { label: "사회", score: "매우 보수적", detail: "전통적 위계" },
            cultural: { label: "문화", score: "전통주의", detail: "고전적 가치 수호" },
            participation: { label: "참여", score: "엘리트 주도", detail: "귀족적 통치" }
        },
        relationshipTraits: [
            "품격과 교양을 중시하는 관계",
            "전통적 역할과 예의",
            "사회적 지위와 책임감",
            "격식과 품위를 갖춘 파트너십"
        ],
        goodTopics: [
            "전통과 품격",
            "교양과 문화",
            "사회적 책임",
            "역사와 전통"
        ],
        avoidTopics: [
            "평등주의",
            "급진적 변화",
            "전통 부정",
            "대중주의"
        ],
        matching: ["GCTN", "MCON", "GCON"]
    },
    "GPOS": {
        title: "복지 자유주의자",
        icon: "🤝",
        description: "정부가 적극적으로 복지를 제공하면서도 개인의 자유와 다양성을 존중해야 한다고 믿는 성향입니다. 사회 안전망을 통해 모든 사람이 공정한 기회를 가질 수 있도록 해야 한다고 생각합니다.",
        features: [
            "보편적 복지 추구",
            "사회적 자유 보장",
            "기회의 평등",
            "포용적 사회"
        ],
        axisScores: {
            economic: { label: "경제", score: "복지 국가", detail: "정부 주도 재분배" },
            social: { label: "사회", score: "매우 진보적", detail: "다양성과 포용" },
            cultural: { label: "문화", score: "개방적", detail: "문화적 다원주의" },
            participation: { label: "참여", score: "시민 참여", detail: "참여 민주주의" }
        },
        relationshipTraits: [
            "평등하고 존중하는 관계",
            "다양성을 축하하는 파트너십",
            "사회 정의를 함께 추구",
            "서로를 지지하고 격려"
        ],
        goodTopics: [
            "사회 정의와 평등",
            "복지와 인권",
            "다양성과 포용",
            "시민 운동과 참여"
        ],
        avoidTopics: [
            "차별과 편견",
            "약자 무시",
            "극단적 개인주의",
            "사회적 무관심"
        ],
        matching: ["MPOS", "GPON", "GPTS"]
    },
    "GPON": {
        title: "기술 진보주의자",
        icon: "📊",
        description: "정부와 전문가가 협력하여 과학기술을 통해 사회 문제를 해결해야 한다고 믿는 성향입니다. 데이터와 증거에 기반한 정책으로 효율적인 복지 국가를 만들 수 있다고 생각합니다.",
        features: [
            "과학 기술 기반 정책",
            "효율적 복지 시스템",
            "전문가-정부 협력",
            "혁신을 통한 진보"
        ],
        axisScores: {
            economic: { label: "경제", score: "혼합 경제", detail: "스마트 정부 개입" },
            social: { label: "사회", score: "진보적", detail: "과학적 사회 개혁" },
            cultural: { label: "문화", score: "혁신적", detail: "미래 지향적" },
            participation: { label: "참여", score: "전문가 협력", detail: "전문성과 민주주의" }
        },
        relationshipTraits: [
            "혁신과 진보를 함께 추구하는 관계",
            "데이터와 이성을 중시",
            "미래를 함께 설계하는 파트너십",
            "효율성과 공정성의 균형"
        ],
        goodTopics: [
            "기술과 사회 혁신",
            "데이터 기반 정책",
            "스마트 시티와 정부",
            "미래 사회 설계"
        ],
        avoidTopics: [
            "반과학적 태도",
            "기술 공포증",
            "비효율적 전통",
            "감정적 포퓰리즘"
        ],
        matching: ["MPON", "GPTN", "GPOS"]
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
            economic: { label: "경제", score: "위계적 경제", detail: "전통적 경제 질서" },
            social: { label: "사회", score: "매우 보수적", detail: "전통적 위계 체계" },
            cultural: { label: "문화", score: "전통주의", detail: "보수적 문화 가치" },
            participation: { label: "참여", score: "엘리트 주도", detail: "위계적 의사결정" }
        },
        relationshipTraits: [
            "전통적 역할과 위계를 중시",
            "예의와 격식을 갖춘 관계",
            "책임과 의무를 다하는 파트너십",
            "안정과 질서를 추구"
        ],
        goodTopics: [
            "전통과 예절",
            "사회 질서와 위계",
            "책임과 의무",
            "역사와 전통 가치"
        ],
        avoidTopics: [
            "평등주의",
            "급진적 변화",
            "전통 부정",
            "무질서"
        ],
        matching: ["MCTN", "GCON", "GCTS"]
    }
};

// 모임 신청 취소 함수
async function cancelMeeting(meetingId) {
    const confirmMessage = `정말로 모임 신청을 취소하시겠습니까?\n\n⚠️ 취소 시 재신청이 필요합니다.`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('authToken');
        const API_URL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : '';
            
        const response = await fetch(`${API_URL}/api/meetings/cancel/${meetingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            alert('모임 신청이 취소되었습니다.');
            
            // 페이지 새로고침하여 최신 상태 반영
            refreshData();
        } else {
            const error = await response.json();
            alert(error.message || '모임 취소 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('모임 취소 오류:', error);
        alert('모임 취소 중 오류가 발생했습니다.');
    }
}