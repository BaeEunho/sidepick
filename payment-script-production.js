// payment-script-production.js - 실제 운영 환경용
const clientKey = 'live_ck_YOUR_LIVE_CLIENT_KEY'; // 실제 클라이언트 키로 교체
const tossPayments = TossPayments(clientKey);
const SERVER_URL = 'https://www.sidepick.co.kr'; // 실제 서버 URL

// 결제 처리 (실제 버전)
async function processPayment(method) {
    const meetingInfo = JSON.parse(sessionStorage.getItem('selectedMeeting'));
    const participantInfo = JSON.parse(sessionStorage.getItem('participantInfo'));
    const orderId = 'ORD-' + Date.now();
    const orderName = meetingInfo.title;
    
    try {
        // 1. 서버에 주문 생성 요청
        const orderResponse = await fetch(`${SERVER_URL}/api/order/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId,
                amount: 45000,
                meetingId: meetingInfo.id,
                participantInfo,
                userGender: meetingInfo.userGender
            })
        });
        
        if (!orderResponse.ok) {
            throw new Error('주문 생성 실패');
        }
        
        // 2. 결제 요청
        await tossPayments.requestPayment(getPaymentMethod(method), {
            amount: 45000,
            orderId: orderId,
            orderName: orderName,
            customerName: participantInfo.name,
            customerEmail: participantInfo.email,
            customerMobilePhone: participantInfo.phone,
            successUrl: `${window.location.origin}/payment-success.html`,
            failUrl: `${window.location.origin}/payment-fail.html`,
        });
        
    } catch (error) {
        console.error('결제 요청 실패:', error);
        throw error;
    }
}

// 결제 방법 매핑
function getPaymentMethod(method) {
    const methodMap = {
        'card': '카드',
        'transfer': '계좌이체',
        'kakao': '카카오페이',
        'naver': '네이버페이',
        'toss': '토스페이'
    };
    return methodMap[method] || '카드';
}

// 결제 성공 페이지에서 호출
async function confirmPayment() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentKey = urlParams.get('paymentKey');
    const orderId = urlParams.get('orderId');
    const amount = urlParams.get('amount');
    
    try {
        // 서버에 결제 승인 요청
        const response = await fetch(`${SERVER_URL}/api/payment/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentKey, orderId, amount })
        });
        
        if (response.ok) {
            // 결제 완료 페이지로 이동
            window.location.href = '/payment-complete.html';
        } else {
            throw new Error('결제 승인 실패');
        }
        
    } catch (error) {
        console.error('결제 확인 실패:', error);
        alert('결제 처리 중 오류가 발생했습니다.');
        window.location.href = '/payment-fail.html';
    }
}