// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // URL에서 bookingId 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    
    if (bookingId && window.DataSystem) {
        // 실제 예약 데이터 로드
        loadBookingInfo(bookingId);
    } else {
        // 기존 방식 (세션 스토리지)
        loadMeetingInfo();
    }
    
    // 사용자 정보 로드
    loadUserInfo();
    
    // 폼 이벤트 리스너 설정
    setupFormValidation();
});

// 실제 예약 정보 로드
function loadBookingInfo(bookingId) {
    const bookings = window.DataSystem.getBookingsDB();
    const booking = bookings[bookingId];
    
    if (!booking) {
        alert('예약 정보를 찾을 수 없습니다.');
        window.location.href = 'meeting-schedule.html';
        return;
    }
    
    // 미팅 정보 표시
    document.getElementById('meeting-title').textContent = booking.meetingTitle;
    document.getElementById('meeting-date').textContent = booking.meetingDate;
    document.getElementById('meeting-time').textContent = booking.meetingTime;
    document.getElementById('meeting-location').textContent = booking.meetingLocation;
    
    // 예약 ID 저장 (결제 페이지로 전달용)
    sessionStorage.setItem('currentBookingId', bookingId);
}

// 미팅 정보 로드 (기존 방식)
function loadMeetingInfo() {
    const meetingInfo = JSON.parse(sessionStorage.getItem('selectedMeeting'));
    
    if (!meetingInfo) {
        alert('선택된 소개팅 정보가 없습니다.');
        window.location.href = 'meeting-schedule.html';
        return;
    }
    
    // 미팅 정보 표시
    document.getElementById('meeting-title').textContent = meetingInfo.title;
    document.getElementById('meeting-date').textContent = meetingInfo.date;
    document.getElementById('meeting-time').textContent = meetingInfo.time;
    document.getElementById('meeting-location').textContent = meetingInfo.location;
}

// 사용자 정보 로드
function loadUserInfo() {
    // userType이 JSON 객체일 수도 있고, politicalType이 문자열일 수도 있음
    let userType;
    const politicalType = sessionStorage.getItem('politicalType');
    const userTypeStr = sessionStorage.getItem('userType');
    
    try {
        if (userTypeStr) {
            userType = JSON.parse(userTypeStr);
        } else if (politicalType) {
            // politicalType만 있는 경우 객체로 변환
            userType = { code: politicalType };
        }
    } catch (error) {
        console.error('Error parsing userType:', error);
        if (politicalType) {
            userType = { code: politicalType };
        }
    }
    
    const userGender = sessionStorage.getItem('userGender');
    
    if (!userType || !userGender) {
        alert('사용자 정보가 없습니다. 테스트를 다시 진행해주세요.');
        window.location.href = 'political-test.html';
        return;
    }
    
    // 아이콘 매핑
    const iconMap = {
        'MPOS': '🌐', 'MPON': '🚀', 'MPTS': '🗣️', 'MPTN': '🎓',
        'MCOS': '🏛️', 'MCON': '⚖️', 'MCTS': '🌾', 'MCTN': '👑',
        'GPOS': '🤝', 'GPON': '📊', 'GPTS': '✊', 'GPTN': '📋',
        'GCOS': '🏛️', 'GCON': '⚔️', 'GCTS': '🇰🇷', 'GCTN': '🏰'
    };
    
    // 사용자 정보 표시
    document.getElementById('user-type-icon').textContent = iconMap[userType.code] || '🎯';
    document.getElementById('user-type-name').textContent = userType.title;
    document.getElementById('user-gender').textContent = `(${userGender === 'male' ? '남성' : '여성'})`;
    
    // 프로필 정보 가져오기 (데모용: sessionStorage에서)
    const profileInfo = sessionStorage.getItem('userProfile');
    if (profileInfo) {
        const profile = JSON.parse(profileInfo);
        // 프로필 정보 자동 입력
        document.getElementById('participant-name').value = profile.name || '';
        document.getElementById('participant-email').value = profile.email || '';
        document.getElementById('participant-birth').value = profile.birthdate || '';
        document.getElementById('participant-phone').value = profile.phone || '';
    } else {
        // 데모용 기본값 설정
        document.getElementById('participant-name').value = '홍길동';
        document.getElementById('participant-email').value = 'hong@example.com';
        document.getElementById('participant-birth').value = '1995-01-01';
    }
}

// 폼 유효성 검사 설정
function setupFormValidation() {
    const form = document.getElementById('participant-form');
    const inputs = form.querySelectorAll('input[required]');
    
    // 각 입력 필드에 이벤트 리스너 추가
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
    });
    
    // 폼 제출 이벤트
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            // 참가자 정보 저장
            saveParticipantInfo();
            
            // 결제 페이지로 이동
            window.location.href = 'payment.html';
        }
    });
}

// 개별 필드 유효성 검사
function validateField(input) {
    let isValid = true;
    const value = input.value.trim();
    const errorElement = document.getElementById(input.name + '-error');
    
    // 빈 값 체크
    if (!value) {
        showError(input, errorElement, '필수 입력 항목입니다.');
        return false;
    }
    
    // 필드별 추가 검증
    switch (input.name) {
        case 'name':
            if (value.length < 2) {
                showError(input, errorElement, '이름은 2자 이상 입력해주세요.');
                isValid = false;
            } else if (!/^[가-힣a-zA-Z\s]+$/.test(value)) {
                showError(input, errorElement, '올바른 이름을 입력해주세요.');
                isValid = false;
            }
            break;
            
        case 'phone':
            const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
            if (!phoneRegex.test(value.replace(/-/g, ''))) {
                showError(input, errorElement, '올바른 휴대폰 번호를 입력해주세요.');
                isValid = false;
            }
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showError(input, errorElement, '올바른 이메일 주소를 입력해주세요.');
                isValid = false;
            }
            break;
            
        case 'birth':
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            
            if (age < 20 || age > 100) {
                showError(input, errorElement, '만 20세 이상만 참여 가능합니다.');
                isValid = false;
            }
            break;
    }
    
    if (isValid) {
        clearError(input);
    }
    
    return isValid;
}

// 전체 폼 유효성 검사
function validateForm() {
    const form = document.getElementById('participant-form');
    const requiredInputs = form.querySelectorAll('input[required]');
    const requiredCheckboxes = form.querySelectorAll('input[type="checkbox"][required]');
    let isValid = true;
    
    // 입력 필드 검증
    requiredInputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // 필수 약관 동의 체크
    requiredCheckboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            alert('필수 약관에 모두 동의해주세요.');
            isValid = false;
        }
    });
    
    return isValid;
}

// 에러 표시
function showError(input, errorElement, message) {
    input.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

// 에러 제거
function clearError(input) {
    input.classList.remove('error');
    const errorElement = document.getElementById(input.name + '-error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

// 전체 동의 체크박스 토글 - 약관이 하나만 남아서 더 이상 필요없음
// function toggleAllCheckboxes(checkbox) {
//     const checkboxes = document.querySelectorAll('input[name="terms"]');
//     checkboxes.forEach(cb => {
//         cb.checked = checkbox.checked;
//     });
// }

// 참가자 정보 저장
function saveParticipantInfo() {
    const form = document.getElementById('participant-form');
    const formData = new FormData(form);
    
    const participantInfo = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        birth: formData.get('birth'),
        timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem('participantInfo', JSON.stringify(participantInfo));
    
    // 신청 목록에 추가 (입금 대기 상태로) - 참가자 수는 증가시키지 않음
    const meetingInfo = JSON.parse(sessionStorage.getItem('selectedMeeting'));
    const userGender = sessionStorage.getItem('userGender');
    console.log('=== Saving participant info ===');
    console.log('Meeting info:', meetingInfo);
    console.log('User gender:', userGender);
    
    if (meetingInfo && userGender) {
        const appliedMeetings = JSON.parse(sessionStorage.getItem('appliedMeetings') || '{}');
        console.log('Current applied meetings:', appliedMeetings);
        
        appliedMeetings[meetingInfo.orientation] = {
            status: 'pending',  // 입금 대기
            appliedAt: new Date().toISOString(),
            orientation: meetingInfo.orientation,
            gender: userGender,
            meetingId: meetingInfo.id || meetingInfo.meetingId  // Handle both possible ID fields
        };
        
        console.log('Updated applied meetings:', appliedMeetings);
        sessionStorage.setItem('appliedMeetings', JSON.stringify(appliedMeetings));
        console.log('Applied meetings saved to sessionStorage');
    } else {
        console.error('Missing meetingInfo or userGender');
    }
}

// 참가자 수 증가 함수 (입금 대기 상태로만)
function incrementParticipantCount(orientation, gender) {
    // 전체 신청자 수 증가 (입금 대기 포함)
    const counts = JSON.parse(sessionStorage.getItem('meetingCounts') || '{}');
    if (!counts[orientation]) {
        counts[orientation] = { male: 0, female: 0 };
    }
    counts[orientation][gender] = Math.min((counts[orientation][gender] || 0) + 1, 4);
    sessionStorage.setItem('meetingCounts', JSON.stringify(counts));
    
    // 신청 목록에 추가 (입금 대기 상태로)
    const appliedMeetings = JSON.parse(sessionStorage.getItem('appliedMeetings') || '{}');
    const meetingInfo = JSON.parse(sessionStorage.getItem('selectedMeeting'));
    if (meetingInfo) {
        appliedMeetings[orientation] = {
            status: 'pending',  // 입금 대기
            appliedAt: new Date().toISOString(),
            orientation: orientation,
            gender: gender,
            meetingId: meetingInfo.id
        };
        sessionStorage.setItem('appliedMeetings', JSON.stringify(appliedMeetings));
    }
}

// 휴대폰 번호 자동 포맷팅
document.getElementById('participant-phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^0-9]/g, '');
    let formattedValue = '';
    
    if (value.length > 0) {
        if (value.length <= 3) {
            formattedValue = value;
        } else if (value.length <= 7) {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length <= 11) {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
        } else {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }
    }
    
    e.target.value = formattedValue;
});