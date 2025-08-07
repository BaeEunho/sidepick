// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 예약 정보 로드
    loadBookingInfo();
    
    // 결제 완료 시 확정 처리
    confirmParticipation();
    
    // 세션 정리 (선택적)
    // clearSessionData();
});

// 예약 정보 로드
function loadBookingInfo() {
    const meetingInfo = JSON.parse(sessionStorage.getItem('selectedMeeting'));
    const participantInfo = JSON.parse(sessionStorage.getItem('participantInfo'));
    const paymentInfo = JSON.parse(sessionStorage.getItem('paymentInfo'));
    
    if (!meetingInfo || !participantInfo || !paymentInfo) {
        alert('예약 정보를 찾을 수 없습니다.');
        window.location.href = 'index.html?from=payment-error';
        return;
    }
    
    // 예약 정보 표시
    document.getElementById('booking-title').textContent = meetingInfo.title;
    document.getElementById('booking-number').textContent = `예약번호: ${paymentInfo.orderId}`;
    document.getElementById('booking-date').textContent = meetingInfo.date;
    document.getElementById('booking-time').textContent = meetingInfo.time;
    document.getElementById('booking-location').textContent = meetingInfo.location;
    document.getElementById('booking-participant').textContent = 
        `${participantInfo.name} (${meetingInfo.userGender === 'male' ? '남성' : '여성'})`;
    
    // 결제 수단 표시
    const paymentMethodText = {
        'card': '신용/체크카드',
        'transfer': '계좌이체',
        'kakao': '카카오페이',
        'naver': '네이버페이'
    };
    document.getElementById('payment-method').textContent = paymentMethodText[paymentInfo.method] || '-';
}

// 캘린더에 추가
function addToCalendar() {
    const meetingInfo = JSON.parse(sessionStorage.getItem('selectedMeeting'));
    
    if (!meetingInfo) {
        alert('일정 정보를 찾을 수 없습니다.');
        return;
    }
    
    // 날짜 파싱 (예: "12월 15일 토요일")
    const dateStr = meetingInfo.date;
    const currentYear = new Date().getFullYear();
    const monthMap = {
        '1월': 0, '2월': 1, '3월': 2, '4월': 3, '5월': 4, '6월': 5,
        '7월': 6, '8월': 7, '9월': 8, '10월': 9, '11월': 10, '12월': 11
    };
    
    const monthMatch = dateStr.match(/(\d+)월/);
    const dayMatch = dateStr.match(/(\d+)일/);
    
    if (monthMatch && dayMatch) {
        const month = parseInt(monthMatch[1]) - 1;
        const day = parseInt(dayMatch[1]);
        
        // 시간 파싱 (예: "⏰ 오후 2시 - 4시")
        const timeStr = meetingInfo.time;
        const startTimeMatch = timeStr.match(/오후\s*(\d+)시/);
        let startHour = 14; // 기본값
        
        if (startTimeMatch) {
            startHour = parseInt(startTimeMatch[1]) + 12;
        }
        
        // 이벤트 시작 시간
        const startDate = new Date(currentYear, month, day, startHour, 0);
        const endDate = new Date(currentYear, month, day, startHour + 2, 0);
        
        // Google Calendar URL 생성
        const googleCalendarUrl = createGoogleCalendarUrl({
            title: `사이드픽 소개팅 - ${meetingInfo.title}`,
            details: `정치 성향 기반 소개팅\n장소: ${meetingInfo.location}`,
            location: meetingInfo.location.replace('📍 ', ''),
            startDate: startDate,
            endDate: endDate
        });
        
        // 새 창에서 Google Calendar 열기
        window.open(googleCalendarUrl, '_blank');
    }
}

// Google Calendar URL 생성
function createGoogleCalendarUrl(event) {
    const startDateStr = formatDateForGoogle(event.startDate);
    const endDateStr = formatDateForGoogle(event.endDate);
    
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        details: event.details,
        location: event.location,
        dates: `${startDateStr}/${endDateStr}`
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Google Calendar 날짜 형식
function formatDateForGoogle(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}${month}${day}T${hours}${minutes}00`;
}

// 결제 완료 시 처리 (입금 대기 상태 유지)
async function confirmParticipation() {
    const meetingInfo = JSON.parse(sessionStorage.getItem('selectedMeeting'));
    const userGender = sessionStorage.getItem('userGender');
    const participantInfo = JSON.parse(sessionStorage.getItem('participantInfo'));
    const paymentInfo = JSON.parse(sessionStorage.getItem('paymentInfo'));
    
    if (!meetingInfo || !userGender) {
        console.error('필수 정보 누락:', { meetingInfo, userGender });
        return;
    }
    
    console.log('=== 결제 확정 처리 시작 ===');
    console.log('meetingInfo:', meetingInfo);
    console.log('userGender:', userGender);
    console.log('participantInfo:', participantInfo);
    console.log('paymentInfo:', paymentInfo);
    
    // 디버깅용 로그 저장
    const debugLog = [];
    debugLog.push('=== 결제 확정 처리 시작 ===');
    debugLog.push(`meetingInfo: ${JSON.stringify(meetingInfo)}`);
    debugLog.push(`userGender: ${userGender}`);
    debugLog.push(`authToken 존재: ${localStorage.getItem('authToken') ? 'Yes' : 'No'}`);
    
    // 서버에 결제 정보 업데이트 (입금 대기 상태로)
    // 주의: 이것은 입금 확인이 아니라, 입금 요청 정보를 저장하는 것입니다
    try {
        const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://sidepick.onrender.com';
        const authToken = localStorage.getItem('authToken');
        const userEmail = sessionStorage.getItem('userEmail');
        
        if (!authToken) {
            console.error('인증 토큰이 없습니다!');
            // 토큰이 없어도 로컬 처리는 계속 진행
        } else {
            // 입금 정보 업데이트 API 호출 (있다면)
            // 현재는 서버에 해당 API가 없으므로 주석 처리
            console.log('입금 대기 상태로 유지됩니다. 관리자가 입금 확인 후 참가 확정 처리합니다.');
        }
    } catch (error) {
        console.error('서버 통신 오류:', error);
        // 오류가 발생해도 로컬 처리는 계속 진행
    }
    
    // 로컬 스토리지 업데이트 (백업용 + 즉시 UI 반영을 위해)
    console.log('로컬 스토리지 업데이트 시작');
    const appliedMeetings = JSON.parse(sessionStorage.getItem('appliedMeetings') || '{}');
    console.log('현재 appliedMeetings:', appliedMeetings);
    
    if (appliedMeetings[meetingInfo.orientation]) {
        console.log(`${meetingInfo.orientation} 모임 - 결제 안내 완료 상태로 변경`);
        // status를 payment_completed로 변경 (입금은 아직 안 함)
        appliedMeetings[meetingInfo.orientation].status = 'payment_completed';
        appliedMeetings[meetingInfo.orientation].paymentInfo = paymentInfo;
        appliedMeetings[meetingInfo.orientation].paymentCompletedAt = new Date().toISOString();
        sessionStorage.setItem('appliedMeetings', JSON.stringify(appliedMeetings));
        console.log('업데이트된 appliedMeetings:', appliedMeetings);
    } else {
        console.log(`경고: ${meetingInfo.orientation} 모임 정보가 appliedMeetings에 없습니다`);
        // 없는 경우 새로 추가
        appliedMeetings[meetingInfo.orientation] = {
            meetingId: meetingInfo.id || meetingInfo.meetingId,
            status: 'payment_completed', // 결제 안내 완료
            paymentCompletedAt: new Date().toISOString(),
            paymentInfo: paymentInfo
        };
        sessionStorage.setItem('appliedMeetings', JSON.stringify(appliedMeetings));
    }
    
    // 참가자 수는 관리자가 입금 확인 후에만 증가시켜야 함
    // 따라서 여기서는 증가시키지 않음
    console.log('입금 확인 후 관리자가 참가 확정 처리를 해야 참가자 수가 증가합니다.');
}

// 세션 데이터 정리 (선택적)
function clearSessionData() {
    // 예약 완료 후 민감한 정보 제거
    sessionStorage.removeItem('participantInfo');
    sessionStorage.removeItem('paymentInfo');
    // selectedMeeting은 유지 (사용자가 다시 확인할 수 있도록)
}

// 뒤로가기 방지
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // 결제 완료 후 뒤로가기로 다시 결제 페이지로 가는 것을 방지
        window.location.href = 'index.html?from=payment-complete&status=pending';
    }
});

// 홈으로 돌아가기 버튼 추가 (있다면)
document.addEventListener('DOMContentLoaded', function() {
    const homeButton = document.querySelector('.btn-home');
    if (homeButton) {
        homeButton.onclick = function() {
            window.location.href = 'index.html?from=payment-complete&status=pending';
        };
    }
});