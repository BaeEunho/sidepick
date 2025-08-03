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
        window.location.href = 'index.html';
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

// 결제 완료 시 참가 확정 처리
function confirmParticipation() {
    const meetingInfo = JSON.parse(sessionStorage.getItem('selectedMeeting'));
    const userGender = sessionStorage.getItem('userGender');
    
    if (!meetingInfo || !userGender) return;
    
    // 신청 상태를 확정으로 변경
    const appliedMeetings = JSON.parse(sessionStorage.getItem('appliedMeetings') || '{}');
    if (appliedMeetings[meetingInfo.orientation]) {
        appliedMeetings[meetingInfo.orientation].status = 'confirmed';
        appliedMeetings[meetingInfo.orientation].confirmedAt = new Date().toISOString();
        sessionStorage.setItem('appliedMeetings', JSON.stringify(appliedMeetings));
    }
    
    // 확정된 참가자 수 증가
    const confirmedCounts = JSON.parse(sessionStorage.getItem('confirmedMeetingCounts') || '{}');
    if (!confirmedCounts[meetingInfo.orientation]) {
        confirmedCounts[meetingInfo.orientation] = { male: 0, female: 0 };
    }
    confirmedCounts[meetingInfo.orientation][userGender] = 
        Math.min((confirmedCounts[meetingInfo.orientation][userGender] || 0) + 1, 4);
    sessionStorage.setItem('confirmedMeetingCounts', JSON.stringify(confirmedCounts));
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
        window.location.href = 'index.html';
    }
});