// server-example.js - Express.js 기반 결제 서버 예시
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 토스페이먼츠 설정
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY; // 실제 시크릿 키
const TOSS_API_URL = 'https://api.tosspayments.com/v1/payments';

// 결제 승인 요청
app.post('/api/payment/confirm', async (req, res) => {
    const { paymentKey, orderId, amount } = req.body;
    
    try {
        // 1. 주문 정보 검증 (DB에서 확인)
        const order = await getOrderFromDB(orderId);
        if (!order || order.amount !== amount) {
            return res.status(400).json({ error: '주문 정보가 일치하지 않습니다.' });
        }
        
        // 2. 토스페이먼츠에 결제 승인 요청
        const response = await axios.post(
            `${TOSS_API_URL}/${paymentKey}`,
            { orderId, amount },
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        
        // 3. 결제 정보 DB 저장
        await savePaymentToDB({
            orderId,
            paymentKey,
            amount,
            status: 'DONE',
            approvedAt: response.data.approvedAt,
            method: response.data.method,
        });
        
        // 4. 성공 응답
        res.json({ success: true, payment: response.data });
        
    } catch (error) {
        console.error('결제 승인 실패:', error);
        res.status(400).json({ error: '결제 승인에 실패했습니다.' });
    }
});

// 웹훅 처리 (결제 상태 변경 알림)
app.post('/api/webhook/payment', async (req, res) => {
    const { data } = req.body;
    
    try {
        // 웹훅 서명 검증 (보안)
        const isValid = verifyWebhookSignature(req);
        if (!isValid) {
            return res.status(401).json({ error: '유효하지 않은 요청입니다.' });
        }
        
        // 결제 상태 업데이트
        await updatePaymentStatus(data.paymentKey, data.status);
        
        // 상태별 처리
        switch (data.status) {
            case 'DONE':
                // 결제 완료 - 예약 확정 처리
                await confirmBooking(data.orderId);
                await sendConfirmationEmail(data.orderId);
                break;
                
            case 'CANCELED':
                // 결제 취소 - 예약 취소 처리
                await cancelBooking(data.orderId);
                break;
                
            case 'FAILED':
                // 결제 실패
                await handlePaymentFailure(data.orderId);
                break;
        }
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('웹훅 처리 실패:', error);
        res.status(500).json({ error: '웹훅 처리 실패' });
    }
});

// 환불 처리
app.post('/api/payment/cancel', async (req, res) => {
    const { paymentKey, cancelReason } = req.body;
    
    try {
        // 환불 가능 여부 확인 (3일 전까지만 가능)
        const payment = await getPaymentFromDB(paymentKey);
        const booking = await getBookingFromDB(payment.orderId);
        
        const daysUntilMeeting = getDaysUntilMeeting(booking.meetingDate);
        if (daysUntilMeeting < 3) {
            return res.status(400).json({ error: '소개팅 3일 전에는 취소가 불가능합니다.' });
        }
        
        // 토스페이먼츠 환불 API 호출
        const response = await axios.post(
            `${TOSS_API_URL}/${paymentKey}/cancel`,
            { cancelReason },
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        
        // 환불 정보 저장
        await saveCancellationToDB({
            paymentKey,
            cancelReason,
            canceledAt: response.data.cancels[0].canceledAt,
            cancelAmount: response.data.cancels[0].cancelAmount,
        });
        
        res.json({ success: true, cancellation: response.data });
        
    } catch (error) {
        console.error('환불 처리 실패:', error);
        res.status(400).json({ error: '환불 처리에 실패했습니다.' });
    }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`결제 서버가 포트 ${PORT}에서 실행 중입니다.`);
});

// 데이터베이스 함수들 (실제 구현 필요)
async function getOrderFromDB(orderId) {
    // TODO: 실제 DB 조회 구현
}

async function savePaymentToDB(paymentData) {
    // TODO: 실제 DB 저장 구현
}

async function updatePaymentStatus(paymentKey, status) {
    // TODO: 실제 DB 업데이트 구현
}

function verifyWebhookSignature(req) {
    // TODO: 토스페이먼츠 웹훅 서명 검증 구현
    return true;
}