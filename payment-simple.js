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
        ? 'http://localhost:3001' 
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
        // 1. 먼저 apply 시도
        console.log('신청 시도...');
        const applyResponse = await fetch(`${API_URL}/api/meetings/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                meetingId: meetingInfo.id || meetingInfo.meetingId || `meeting_${meetingInfo.orientation}_${Date.now()}`,
                orientation: meetingInfo.orientation,
                status: 'payment_pending',
                meetingInfo: meetingInfo,
                applicationData: {
                    userEmail: userEmail,
                    userGender: userGender,
                    participantInfo: participantInfo,
                    orderData: orderData
                }
            })
        });
        
        console.log('Apply response:', applyResponse.status);
        
        if (applyResponse.ok) {
            console.log('새로운 신청 성공');
            return true;
        }
        
        // 2. 이미 신청한 경우 - 기존 신청 찾아서 업데이트
        if (applyResponse.status === 400) {
            console.log('이미 신청함 - 상태 업데이트 시도');
            
            // 기존 신청 정보 조회
            const meetingsResponse = await fetch(`${API_URL}/api/user/meetings`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (meetingsResponse.ok) {
                const userData = await meetingsResponse.json();
                console.log('User meetings:', userData);
                
                if (userData.meetings && userData.meetings.length > 0) {
                    const existingMeeting = userData.meetings.find(m => 
                        m.orientation === meetingInfo.orientation && 
                        m.status !== 'cancelled'
                    );
                    
                    if (existingMeeting) {
                        const meetingId = existingMeeting.id || existingMeeting.meetingId;
                        console.log('Found existing meeting:', meetingId);
                        
                        // 상태 업데이트
                        const updateResponse = await fetch(`${API_URL}/api/meetings/${meetingId}/status`, {
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
                            console.log('상태 업데이트 성공');
                            return true;
                        } else {
                            const errorText = await updateResponse.text();
                            console.error('업데이트 실패:', errorText);
                        }
                    }
                }
            }
        }
        
        return false;
        
    } catch (error) {
        console.error('처리 중 오류:', error);
        return false;
    }
}

// 전역으로 노출
window.processPayment = processPayment;