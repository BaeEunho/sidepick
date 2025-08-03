// 참석 인원 업데이트 스크립트
console.log('attendance-update.js 로드됨');

// 서버에서 참석 인원 가져오기
async function fetchAttendanceFromServer() {
    console.log('참석 인원 조회 시작...');
    try {
        const API_URL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : '';
        const response = await fetch(`${API_URL}/api/meetings/attendance`);
        const data = await response.json();
        console.log('서버 응답:', data);
        
        if (data.success && data.data) {
            updateAttendanceDisplay(data.data);
        }
    } catch (error) {
        console.error('참석 인원 조회 실패:', error);
    }
}

// 화면 업데이트
function updateAttendanceDisplay(attendanceData) {
    // 진보 모임 업데이트
    const progressiveCards = document.querySelectorAll('#progressive-meetings .meeting-card');
    progressiveCards.forEach(card => {
        let totalMale = 0;
        let totalFemale = 0;
        
        Object.values(attendanceData).forEach(meeting => {
            if (meeting.orientation === 'progressive') {
                totalMale += meeting.male;
                totalFemale += meeting.female;
            }
        });
        
        const maleCount = card.querySelector('.male-count');
        const femaleCount = card.querySelector('.female-count');
        
        if (maleCount) {
            maleCount.textContent = `👨 남자 ${totalMale}/4명`;
        }
        if (femaleCount) {
            femaleCount.textContent = `👩 여자 ${totalFemale}/4명`;
        }
    });
    
    // 보수 모임 업데이트
    const conservativeCards = document.querySelectorAll('#conservative-meetings .meeting-card');
    conservativeCards.forEach(card => {
        let totalMale = 0;
        let totalFemale = 0;
        
        Object.values(attendanceData).forEach(meeting => {
            if (meeting.orientation === 'conservative') {
                totalMale += meeting.male;
                totalFemale += meeting.female;
            }
        });
        
        const maleCount = card.querySelector('.male-count');
        const femaleCount = card.querySelector('.female-count');
        
        if (maleCount) {
            maleCount.textContent = `👨 남자 ${totalMale}/4명`;
        }
        if (femaleCount) {
            femaleCount.textContent = `👩 여자 ${totalFemale}/4명`;
        }
    });
}

// 시작
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료 - 참석 인원 업데이트 시작');
    fetchAttendanceFromServer();
    setInterval(fetchAttendanceFromServer, 5000);
});