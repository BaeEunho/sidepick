console.log('schedule-script.js 파일 로드 시작');

// 페이지별 참가자 수 저장 (실제로는 서버에서 관리해야 함)
if (!sessionStorage.getItem('meetingCounts')) {
    sessionStorage.setItem('meetingCounts', JSON.stringify({
        progressive: { male: 0, female: 0 },
        conservative: { male: 0, female: 0 }
    }));
}

// 확정된 참가자 수 (입금 완료자만)
if (!sessionStorage.getItem('confirmedMeetingCounts')) {
    sessionStorage.setItem('confirmedMeetingCounts', JSON.stringify({
        progressive: { male: 0, female: 0 },
        conservative: { male: 0, female: 0 }
    }));
}

// 서버에서 참석 인원 가져오기
async function fetchAttendanceFromServer() {
    console.log('fetchAttendanceFromServer 호출됨');
    try {
        const API_URL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : 'https://sidepick.onrender.com';
        console.log('API URL:', `${API_URL}/api/meetings/attendance`);
        
        const response = await fetch(`${API_URL}/api/meetings/attendance`);
        console.log('응답 상태:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('서버에서 받은 참석 인원:', data);
            
            if (data.success && data.data) {
                updateAttendanceDisplay(data.data);
            } else {
                console.log('데이터가 없거나 success가 false:', data);
            }
        } else {
            console.error('응답이 ok가 아님:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('참석 인원 조회 실패:', error);
    }
}

// 참석 인원 표시 업데이트
function updateAttendanceDisplay(attendanceData) {
    console.log('updateAttendanceDisplay 호출됨:', attendanceData);
    
    // 모든 모임 카드 선택
    const meetingCards = document.querySelectorAll('.meeting-card');
    console.log('찾은 모임 카드 수:', meetingCards.length);
    
    meetingCards.forEach((card, index) => {
        // 모임의 성향 확인 (진보/보수)
        const section = card.closest('#progressive-meetings, #conservative-meetings');
        if (!section) {
            console.log(`카드 ${index}: 섹션을 찾을 수 없음`);
            return;
        }
        
        const orientation = section.id === 'progressive-meetings' ? 'progressive' : 'conservative';
        console.log(`카드 ${index}: ${orientation} 성향`);
        
        // 해당 모임의 참석 인원 찾기
        let totalMale = 0;
        let totalFemale = 0;
        
        Object.values(attendanceData).forEach(meeting => {
            if (meeting.orientation === orientation) {
                totalMale += meeting.male;
                totalFemale += meeting.female;
                console.log(`${orientation} 모임 참석자 추가: 남 ${meeting.male}, 여 ${meeting.female}`);
            }
        });
        
        // 참석 인원 표시 업데이트
        const maleCount = card.querySelector('.male-count');
        const femaleCount = card.querySelector('.female-count');
        
        if (maleCount) {
            maleCount.textContent = `👨 남자 ${totalMale}/4명`;
            maleCount.setAttribute('data-current', totalMale);
            console.log(`남자 참석 인원 업데이트: ${totalMale}`);
        }
        
        if (femaleCount) {
            femaleCount.textContent = `👩 여자 ${totalFemale}/4명`;
            femaleCount.setAttribute('data-current', totalFemale);
            console.log(`여자 참석 인원 업데이트: ${totalFemale}`);
        }
    });
}

// 참석 인원 자동 업데이트 시작
function startAttendanceUpdates() {
    fetchAttendanceFromServer();
    
    // 5초마다 자동 업데이트
    setInterval(fetchAttendanceFromServer, 5000);
}

// 사용자 모임 신청 정보를 저장할 전역 변수
let userMeetingInfo = {
    progressive: null,
    conservative: null
};

// 서버에서 사용자의 모임 신청 정보 가져오기
async function fetchUserMeetingInfo() {
    try {
        const userEmail = sessionStorage.getItem('userEmail');
        if (!userEmail) return;
        
        // 전역 변수 초기화
        userMeetingInfo = {
            progressive: null,
            conservative: null
        };
        
        // 먼저 로컬 DataSystem에서 확인
        if (window.DataSystem) {
            const bookings = window.DataSystem.getUserBookings(userEmail);
            bookings.forEach(booking => {
                if (booking.status !== 'cancelled') {
                    const meetings = window.DataSystem.getMeetings();
                    const meeting = meetings.find(m => m.id === booking.meetingId);
                    if (meeting) {
                        userMeetingInfo[meeting.orientation] = {
                            status: booking.status,
                            meetingId: booking.meetingId
                        };
                    }
                }
            });
        }
        
        // 세션 스토리지에서도 확인 (이전 버전 호환성)
        const appliedMeetings = JSON.parse(sessionStorage.getItem('appliedMeetings') || '{}');
        Object.keys(appliedMeetings).forEach(orientation => {
            const meetingData = appliedMeetings[orientation];
            if (meetingData && meetingData.status !== 'cancelled') {
                userMeetingInfo[orientation] = {
                    status: meetingData.status,
                    meetingId: meetingData.meetingId
                };
            }
        });
        
        // 서버에서도 확인 (있을 경우)
        const token = localStorage.getItem('authToken');
        if (token) {
            const API_URL = window.location.hostname === 'localhost' 
                ? 'http://localhost:3000' 
                : 'https://sidepick.onrender.com';
                
            try {
                const response = await fetch(`${API_URL}/api/user/meetings`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.meetings && data.meetings.length > 0) {
                        data.meetings.forEach(meeting => {
                            // cancelled 상태는 무시
                            if (meeting.status !== 'cancelled') {
                                userMeetingInfo[meeting.orientation] = {
                                    status: meeting.status,
                                    meetingId: meeting.id
                                };
                            }
                        });
                    }
                }
            } catch (error) {
                console.log('서버 연결 실패, 로컬 데이터만 사용');
            }
        }
        
        // UI 업데이트
        const userGender = sessionStorage.getItem('userGender');
        if (userGender) {
            updateMeetingAvailability(userGender);
        }
    } catch (error) {
        console.error('사용자 모임 정보 조회 실패:', error);
    }
}

// 알림 모달 표시
function showAlarmModal() {
    const userState = AuthManager.getUserState();
    const modal = document.getElementById('alarmModal');
    
    if (!modal) return;
    
    if (userState.type === 'verified') {
        // 로그인하고 테스트 완료한 사용자
        const userType = userState.politicalType;
        const userOrientation = getOrientationFromCode(userType);
        const userOrientationText = userOrientation === 'progressive' ? '진보' : '보수';
        
        const messageElement = document.getElementById('alarm-message');
        if (messageElement) {
            messageElement.innerHTML = `${userState.profile.name}님의 성향은 <strong>${userOrientationText} 성향</strong>입니다.<br>
            새로운 ${userOrientationText} 성향 소개팅 일정이 등록되면 알려드립니다.`;
        }
        
        // 이메일 입력 필드 업데이트
        const emailInput = modal.querySelector('input[name="email"]');
        if (emailInput) {
            emailInput.value = userState.profile.email || '';
        }
        
        // preference 설정
        const preferenceInput = modal.querySelector('input[name="preference"]');
        if (preferenceInput) {
            preferenceInput.value = userOrientation;
        }
    } else {
        // 비로그인 또는 테스트 미완료 사용자
        const messageElement = document.getElementById('alarm-message');
        if (messageElement) {
            messageElement.innerHTML = `새로운 소개팅 일정이 등록되면 알려드립니다.<br>
            성향 테스트를 완료하시면 맞춤 알림을 받으실 수 있습니다.`;
        }
    }
    
    modal.style.display = 'block';
}

// 알림 모달 닫기
function closeAlarmModal() {
    const modal = document.getElementById('alarmModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 알림 신청 폼 제출
function submitAlarmForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const preference = formData.get('preference');
    
    // 실제로는 서버로 전송
    const preferenceText = preference === 'progressive' ? '진보' : '보수';
    
    // 알림 설정을 sessionStorage에 저장
    sessionStorage.setItem('emailNotification', 'true');
    sessionStorage.setItem('notificationEmail', email);
    
    alert(`알림이 신청되었습니다!\n\n${email}로 새로운 ${preferenceText} 성향 소개팅 일정을 알려드리겠습니다.`);
    closeAlarmModal();
    event.target.reset();
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('alarmModal');
    if (event.target === modal) {
        closeAlarmModal();
    }
}

// 코드에서 성향 추출
function getOrientationFromCode(code) {
    const progressiveCodes = ['MPOS', 'MPON', 'MPTS', 'MPTN', 'GPOS', 'GPON', 'GPTS', 'GPTN'];
    return progressiveCodes.includes(code) ? 'progressive' : 'conservative';
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded 이벤트 발생');
    
    // DataSystem 초기화
    if (window.DataSystem) {
        window.DataSystem.initializeMeetings();
    }
    
    // 참석 인원 업데이트 시작 (AuthManager와 독립적으로 실행)
    try {
        startAttendanceUpdates();
    } catch (error) {
        console.error('참석 인원 업데이트 시작 실패:', error);
    }
    
    // AuthManager가 있을 때만 사용자 상태 확인
    if (typeof AuthManager !== 'undefined') {
        const userState = AuthManager.getUserState();
        
        if (userState.type === 'verified') {
            // 로그인하고 테스트 완료한 사용자
            const politicalType = sessionStorage.getItem('politicalType');
            const userGender = sessionStorage.getItem('userGender');
            
            // 사용자 성향 정보 표시
            displayUserType(politicalType);
            
            // 해당 성향 모임만 표시
            const userOrientation = getOrientationFromCode(politicalType);
            filterMeetingsByOrientation(userOrientation);
            
            // 사용자 타입과 일치하는 태그 강조
            highlightMatchingTypes(politicalType);
            
            // 성별 정보 표시
            if (userGender) {
                displayUserGender(userGender);
            }
            
            // 사용자의 모임 신청 정보 가져오기
            fetchUserMeetingInfo().then(() => {
                // 성별에 따른 신청 가능 여부 표시
                if (userGender) {
                    updateMeetingAvailability(userGender);
                }
            });
        } else {
            // 비로그인 또는 테스트 미완료 사용자도 일정 조회 가능
            // 기본 상태로 모든 모임 표시
            document.getElementById('user-type-icon').textContent = '🎯';
            document.getElementById('user-type-title').textContent = '정치 성향 진단이 필요합니다';
            document.getElementById('orientation-text').textContent = '성향 테스트 후 맞춤 소개팅을 추천해드립니다';
            
            // 모든 모임 표시
            document.getElementById('progressive-meetings').classList.remove('hidden');
            document.getElementById('conservative-meetings').classList.remove('hidden');
        }
        
        // 참가자 수 업데이트 (모든 사용자에게 표시)
        updateParticipantCounts();
    }
});

// 사용자 성향 정보 표시
function displayUserType(typeCode) {
    // 아이콘과 타이틀 업데이트
    const iconMap = {
        'MPOS': '🌐', 'MPON': '🚀', 'MPTS': '🗣️', 'MPTN': '🎓',
        'MCOS': '🏛️', 'MCON': '⚖️', 'MCTS': '🌾', 'MCTN': '👑',
        'GPOS': '🤝', 'GPON': '📊', 'GPTS': '✊', 'GPTN': '📋',
        'GCOS': '🏛️', 'GCON': '⚔️', 'GCTS': '🇰🇷', 'GCTN': '🏰'
    };
    
    const typeNames = {
        'MPOS': '시장 다원주의자',
        'MPON': '테크노 자유주의자',
        'MPTS': '참여 자유주의자',
        'MPTN': '엘리트 자유주의자',
        'MCOS': '문화 보수주의자',
        'MCON': '온건 보수주의자',
        'MCTS': '풀뿌리 보수주의자',
        'MCTN': '전통 보수주의자',
        'GPOS': '참여 사회민주주의자',
        'GPON': '전문가 사회민주주의자',
        'GPTS': '민중 진보주의자',
        'GPTN': '계획 진보주의자',
        'GCOS': '온건 국가주의자',
        'GCON': '권위 보수주의자',
        'GCTS': '민족 보수주의자',
        'GCTN': '위계 보수주의자'
    };
    
    document.getElementById('user-type-icon').textContent = iconMap[typeCode] || '🎯';
    document.getElementById('user-type-title').textContent = typeNames[typeCode] || '정치 성향';
    
    // 성향 텍스트 업데이트
    const orientationText = document.getElementById('orientation-text');
    const userOrientation = getOrientationFromCode(typeCode);
    if (userOrientation === 'progressive') {
        orientationText.textContent = '진보 성향 소개팅에 참여하실 수 있습니다';
        orientationText.className = 'orientation-info progressive';
    } else {
        orientationText.textContent = '보수 성향 소개팅에 참여하실 수 있습니다';
        orientationText.className = 'orientation-info conservative';
    }
}

// 성향별 소개팅 필터링
function filterMeetingsByOrientation(orientation) {
    const progressiveMeetings = document.getElementById('progressive-meetings');
    const conservativeMeetings = document.getElementById('conservative-meetings');
    
    if (orientation === 'progressive') {
        // 진보 성향: 보수 소개팅 숨기기
        conservativeMeetings.classList.add('hidden');
        progressiveMeetings.classList.remove('hidden');
        
        // 보수 소개팅 카드들을 비활성화
        conservativeMeetings.querySelectorAll('.meeting-card').forEach(card => {
            card.classList.add('disabled');
        });
    } else {
        // 보수 성향: 진보 소개팅 숨기기
        progressiveMeetings.classList.add('hidden');
        conservativeMeetings.classList.remove('hidden');
        
        // 진보 소개팅 카드들을 비활성화
        progressiveMeetings.querySelectorAll('.meeting-card').forEach(card => {
            card.classList.add('disabled');
        });
    }
}

// 사용자 타입과 일치하는 태그 강조
function highlightMatchingTypes(userCode) {
    // 코드를 한글 이름으로 변환
    const typeNames = {
        'MPOS': '시장 다원주의자',
        'MPON': '테크노 자유주의자',
        'MPTS': '참여 자유주의자',
        'MPTN': '엘리트 자유주의자',
        'MCOS': '문화 보수주의자',
        'MCON': '온건 보수주의자',
        'MCTS': '풀뿌리 보수주의자',
        'MCTN': '전통 보수주의자',
        'GPOS': '참여 사회민주주의자',
        'GPON': '전문가 사회민주주의자',
        'GPTS': '민중 진보주의자',
        'GPTN': '계획 진보주의자',
        'GCOS': '온건 국가주의자',
        'GCON': '권위 보수주의자',
        'GCTS': '민족 보수주의자',
        'GCTN': '위계 보수주의자'
    };
    
    const userTypeName = typeNames[userCode];
    
    document.querySelectorAll('.type-tag').forEach(tag => {
        if (tag.textContent === userTypeName) {
            tag.classList.add('matched');
        }
    });
}

// 사용자 성별 정보 표시
function displayUserGender(gender) {
    const orientationElement = document.getElementById('orientation-text');
    const genderText = gender === 'male' ? '남성' : '여성';
    const currentText = orientationElement.textContent;
    orientationElement.innerHTML = `<span class="gender-info">${genderText}</span> | ${currentText}`;
}

// 참가자 수 업데이트 (확정된 인원만 표시)
function updateParticipantCounts() {
    // 확정된 참가자 수만 표시
    const confirmedCounts = JSON.parse(sessionStorage.getItem('confirmedMeetingCounts') || '{}');
    
    // 진보 모임 카운트 업데이트
    const progressiveMeeting = document.querySelector('#progressive-meetings .meeting-card');
    if (progressiveMeeting) {
        const maleCount = progressiveMeeting.querySelector('.male-count');
        const femaleCount = progressiveMeeting.querySelector('.female-count');
        if (maleCount) {
            maleCount.textContent = `👨 남자 ${confirmedCounts.progressive?.male || 0}/4명`;
            maleCount.setAttribute('data-current', confirmedCounts.progressive?.male || 0);
        }
        if (femaleCount) {
            femaleCount.textContent = `👩 여자 ${confirmedCounts.progressive?.female || 0}/4명`;
            femaleCount.setAttribute('data-current', confirmedCounts.progressive?.female || 0);
        }
    }
    
    // 보수 모임 카운트 업데이트
    const conservativeMeeting = document.querySelector('#conservative-meetings .meeting-card');
    if (conservativeMeeting) {
        const maleCount = conservativeMeeting.querySelector('.male-count');
        const femaleCount = conservativeMeeting.querySelector('.female-count');
        if (maleCount) {
            maleCount.textContent = `👨 남자 ${confirmedCounts.conservative?.male || 0}/4명`;
            maleCount.setAttribute('data-current', confirmedCounts.conservative?.male || 0);
        }
        if (femaleCount) {
            femaleCount.textContent = `👩 여자 ${confirmedCounts.conservative?.female || 0}/4명`;
            femaleCount.setAttribute('data-current', confirmedCounts.conservative?.female || 0);
        }
    }
}

// 소개팅 신청 기능
function applyMeeting(button) {
    // 중복 클릭 방지
    if (button.disabled || button.classList.contains('processing')) {
        return;
    }
    
    // 버튼 비활성화 및 처리 중 표시
    button.disabled = true;
    button.classList.add('processing');
    const originalText = button.textContent;
    button.textContent = '처리 중...';
    
    const meetingCard = button.closest('.meeting-card');
    const meetingIdElement = meetingCard.getAttribute('data-meeting-id');
    const isProgressive = meetingCard.closest('#progressive-meetings') !== null;
    const meetingOrientation = isProgressive ? 'progressive' : 'conservative';
    
    const userEmail = sessionStorage.getItem('userEmail');
    const userGender = sessionStorage.getItem('userGender');
    const userType = sessionStorage.getItem('politicalType');
    const userOrientation = getOrientationFromCode(userType);
    
    // 로그인 확인
    if (!userEmail) {
        alert('로그인이 필요합니다.');
        button.disabled = false;
        button.classList.remove('processing');
        button.textContent = originalText;
        window.location.href = 'login.html';
        return;
    }
    
    // 1. 성향 일치 여부 확인
    if (userOrientation !== meetingOrientation) {
        alert(`${userOrientation === 'progressive' ? '진보' : '보수'} 성향의 회원님은 ${meetingOrientation === 'progressive' ? '진보' : '보수'} 성향 소개팅에만 참여하실 수 있습니다.`);
        button.disabled = false;
        button.classList.remove('processing');
        button.textContent = originalText;
        return;
    }
    
    // 실제 DataSystem을 사용한 미팅 신청
    if (window.DataSystem) {
        const meetings = window.DataSystem.getMeetings(meetingOrientation);
        if (meetings.length > 0) {
            const meeting = meetings[0]; // 현재는 각 성향별로 하나씩만 있음
            const result = window.DataSystem.applyForMeeting(meeting.id, userEmail, userGender);
            
            if (result.success) {
                alert(result.message);
                window.location.href = `booking-confirm.html?bookingId=${result.bookingId}`;
            } else {
                alert(result.message);
                button.disabled = false;
                button.classList.remove('processing');
                button.textContent = originalText;
            }
            return;
        }
    }
    
    // 폴백: 기존 방식
    const meetingTitle = meetingCard.querySelector('h4').textContent;
    const meetingDate = meetingCard.querySelector('.day').textContent + '일';
    const meetingMonth = meetingCard.querySelector('.month').textContent;
    const meetingWeekday = meetingCard.querySelector('.weekday').textContent;
    const meetingLocation = meetingCard.querySelector('.location').textContent;
    const meetingTime = meetingCard.querySelector('.time').textContent;
    
    // 미팅 정보를 sessionStorage에 저장
    const meetingInfo = {
        id: meetingId,
        title: meetingTitle,
        date: `${meetingMonth} ${meetingDate} ${meetingWeekday}`,
        location: meetingLocation,
        time: meetingTime,
        fee: 45000,
        userType: userType,
        orientation: meetingOrientation
    };
    
    sessionStorage.setItem('selectedMeeting', JSON.stringify(meetingInfo));
    
    // meeting-apply.html로 직접 이동 (meetingId와 orientation 파라미터 전달)
    const meetingIdParam = `meeting_${meetingOrientation}_${Date.now()}`;
    window.location.href = `meeting-apply.html?meetingId=${meetingIdParam}&orientation=${meetingOrientation}`;
}

// 성별에 따른 신청 가능 여부 업데이트
function updateMeetingAvailability(userGender) {
    const confirmedCounts = JSON.parse(sessionStorage.getItem('confirmedMeetingCounts') || '{}');
    const userType = sessionStorage.getItem('politicalType');
    const userOrientation = getOrientationFromCode(userType);
    
    document.querySelectorAll('.meeting-card').forEach(card => {
        const isProgressive = card.closest('#progressive-meetings') !== null;
        const meetingOrientation = isProgressive ? 'progressive' : 'conservative';
        const meetingId = card.querySelector('h4').textContent;
        
        if (meetingOrientation !== userOrientation) return; // 다른 성향은 스킵
        
        const maleCountElement = card.querySelector('.male-count');
        const femaleCountElement = card.querySelector('.female-count');
        const applyBtn = card.querySelector('.apply-btn');
        
        const currentCount = confirmedCounts[userOrientation]?.[userGender] || 0;
        
        // 이미 신청한 경우 (전역 변수에서 확인)
        if (userMeetingInfo[meetingOrientation]) {
            const status = userMeetingInfo[meetingOrientation].status;
            if (status === 'pending') {
                applyBtn.textContent = '결제 진행하기';
                applyBtn.classList.add('waiting');
                applyBtn.classList.remove('confirmed', 'notify-btn');
                applyBtn.disabled = false;
                // 결제 에러 후 재신청 가능하도록 처리
                applyBtn.onclick = () => {
                    // 기존 신청 정보로 결제 페이지로 이동
                    const meetingInfo = {
                        id: userMeetingInfo[meetingOrientation].meetingId,
                        title: card.querySelector('h4').textContent,
                        date: card.querySelector('.month').textContent + ' ' + 
                              card.querySelector('.day').textContent + '일 ' + 
                              card.querySelector('.weekday').textContent,
                        location: card.querySelector('.location').textContent,
                        time: card.querySelector('.time').textContent,
                        fee: 45000,
                        userType: userType,
                        orientation: meetingOrientation
                    };
                    sessionStorage.setItem('selectedMeeting', JSON.stringify(meetingInfo));
                    window.location.href = `booking-confirm.html?reapply=true`;
                };
            } else if (status === 'confirmed' || status === 'paid') {
                applyBtn.textContent = '참가 확정';
                applyBtn.classList.add('confirmed');
                applyBtn.disabled = true;
                applyBtn.onclick = null;
            }
        } 
        // 해당 성별이 마감된 경우
        else if (currentCount >= 4) {
            applyBtn.textContent = '알림 받기';
            applyBtn.classList.add('notify-btn');
            applyBtn.onclick = () => showAlarmModal();
        } else {
            // 신청 가능한 상태로 초기화
            applyBtn.textContent = '신청하기';
            applyBtn.classList.remove('waiting', 'confirmed', 'notify-btn');
            applyBtn.onclick = () => applyMeeting(applyBtn);
        }
        
        // 성별별 자리 상태 표시
        if (userGender === 'male') {
            maleCountElement.classList.add('my-gender');
            if (currentCount >= 4) {
                maleCountElement.classList.add('full');
            }
        } else {
            femaleCountElement.classList.add('my-gender');
            if (currentCount >= 4) {
                femaleCountElement.classList.add('full');
            }
        }
    });
}

// 신청 완료 후 카운트 증가 (booking-confirm.html에서 호출)
function incrementParticipantCount(meetingOrientation, gender) {
    const counts = JSON.parse(sessionStorage.getItem('meetingCounts') || '{}');
    if (!counts[meetingOrientation]) {
        counts[meetingOrientation] = { male: 0, female: 0 };
    }
    counts[meetingOrientation][gender] = Math.min((counts[meetingOrientation][gender] || 0) + 1, 4);
    sessionStorage.setItem('meetingCounts', JSON.stringify(counts));
}

// 뒤로가기 방지 (테스트 결과 유지)
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // 페이지가 캐시에서 복원된 경우
        const politicalType = sessionStorage.getItem('politicalType');
        if (!politicalType) {
            window.location.href = 'political-test.html?logged_in=true';
        }
    }
});