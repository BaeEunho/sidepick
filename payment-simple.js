// 간단한 결제 처리 로직
async function processPayment() {
    console.log('=== 결제 처리 시작 ===');
    
    // 필요한 데이터 가져오기
    const meetingInfo = JSON.parse(sessionStorage.getItem('selectedMeeting') || '{}');
    const participantInfo = JSON.parse(sessionStorage.getItem('participantInfo') || '{}');
    const userEmail = sessionStorage.getItem('userEmail');
    const userGender = sessionStorage.getItem('userGender');
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken || !meetingInfo || !userEmail) {
        console.error('필수 데이터 없음');
        return false;
    }
    
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : 'https://sidepick.onrender.com';
    
    // 주문 정보 생성
    const orderData = {
        orderId: 'ORD-' + Date.now(),
        method: 'bank_transfer',
        amount: 45000,
        status: 'payment_pending',
        createdAt: new Date().toISOString()
    };
    
    // SessionStorage에 저장 (payment-complete에서 사용)
    sessionStorage.setItem('orderData', JSON.stringify(orderData));
    sessionStorage.setItem('paymentInfo', JSON.stringify({
        orderId: orderData.orderId,
        method: 'bank_transfer',
        amount: 45000
    }));
    
    try {
        // 결제 페이지는 이미 신청한 사용자만 접근 가능하므로
        // 기존 신청 정보를 조회하여 상태 업데이트
        console.log('기존 신청 정보 조회...');
        
        const meetingsResponse = await fetch(`${API_URL}/api/user/meetings`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!meetingsResponse.ok) {
            console.error('신청 정보 조회 실패:', meetingsResponse.status);
            return false;
        }
        
        const userData = await meetingsResponse.json();
        console.log('User meetings:', userData);
        
        if (!userData.meetings || userData.meetings.length === 0) {
            console.error('신청 정보가 없습니다');
            return false;
        }
        
        // 현재 성향의 신청 찾기
        const existingMeeting = userData.meetings.find(m => 
            m.orientation === meetingInfo.orientation && 
            m.status !== 'cancelled'
        );
        
        if (!existingMeeting) {
            console.error('해당 성향의 신청을 찾을 수 없습니다');
            return false;
        }
        
        // meetingId는 실제 meeting ID여야 함 (booking ID가 아님)
        const actualMeetingId = existingMeeting.meetingId;
        const bookingId = existingMeeting.id;
        console.log('Found existing meeting - bookingId:', bookingId, 'meetingId:', actualMeetingId);
        console.log('Current status:', existingMeeting.status);
        
        // 상태를 payment_pending으로 업데이트
        const updateResponse = await fetch(`${API_URL}/api/meetings/${actualMeetingId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                status: 'payment_pending',
                paymentInfo: {
                    orderId: orderData.orderId,
                    method: 'bank_transfer',
                    amount: 45000
                }
            })
        });
        
        console.log('Update response:', updateResponse.status);
        
        if (updateResponse.ok) {
            const result = await updateResponse.json();
            console.log('상태 업데이트 성공:', result);
            return true;
        } else {
            const errorText = await updateResponse.text();
            console.error('상태 업데이트 실패:', errorText);
            return false;
        }
        
    } catch (error) {
        console.error('처리 중 오류:', error);
        return false;
    }
}

// 전역으로 노출
window.processPayment = processPayment;