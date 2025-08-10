// 완전한 데이터 관리 시스템 (로컬 스토리지 기반)
const DataSystem = {
    // 데이터베이스 키
    MEETINGS_DB: 'sidepick_meetings',
    BOOKINGS_DB: 'sidepick_bookings',
    PAYMENTS_DB: 'sidepick_payments',
    
    // 미팅 데이터 초기화
    initializeMeetings: function() {
        const meetings = this.getMeetingsDB();
        if (Object.keys(meetings).length === 0) {
            // 기본 미팅 데이터 설정
            const defaultMeetings = {
                'progressive': {
                    id: 'meeting_prog_001',
                    title: '진보 성향 모임',
                    orientation: 'progressive',
                    date: '2025-08-23',
                    time: '15:00',
                    location: '강남역 파티룸',
                    ageRange: '20 - 39세',
                    price: 45000,
                    maxParticipants: { male: 4, female: 4 },
                    currentParticipants: { male: 0, female: 0 },
                    status: 'open'
                },
                'conservative': {
                    id: 'meeting_cons_001',
                    title: '보수 성향 모임',
                    orientation: 'conservative',
                    date: '2025-08-30',
                    time: '15:00',
                    location: '강남역 파티룸',
                    ageRange: '20 - 39세',
                    price: 45000,
                    maxParticipants: { male: 4, female: 4 },
                    currentParticipants: { male: 0, female: 0 },
                    status: 'open'
                }
            };
            this.saveMeetingsDB(defaultMeetings);
        }
    },
    
    // 미팅 데이터베이스 가져오기
    getMeetingsDB: function() {
        const meetingsJSON = localStorage.getItem(this.MEETINGS_DB);
        return meetingsJSON ? JSON.parse(meetingsJSON) : {};
    },
    
    // 미팅 데이터베이스 저장
    saveMeetingsDB: function(meetings) {
        localStorage.setItem(this.MEETINGS_DB, JSON.stringify(meetings));
    },
    
    // 예약 데이터베이스 가져오기
    getBookingsDB: function() {
        const bookingsJSON = localStorage.getItem(this.BOOKINGS_DB);
        return bookingsJSON ? JSON.parse(bookingsJSON) : {};
    },
    
    // 예약 데이터베이스 저장
    saveBookingsDB: function(bookings) {
        localStorage.setItem(this.BOOKINGS_DB, JSON.stringify(bookings));
    },
    
    // 결제 데이터베이스 가져오기
    getPaymentsDB: function() {
        const paymentsJSON = localStorage.getItem(this.PAYMENTS_DB);
        return paymentsJSON ? JSON.parse(paymentsJSON) : {};
    },
    
    // 결제 데이터베이스 저장
    savePaymentsDB: function(payments) {
        localStorage.setItem(this.PAYMENTS_DB, JSON.stringify(payments));
    },
    
    // 미팅 목록 조회
    getMeetings: function(orientation = null) {
        const meetings = this.getMeetingsDB();
        if (!orientation) {
            return Object.values(meetings);
        }
        return Object.values(meetings).filter(m => m.orientation === orientation);
    },
    
    // 미팅 신청
    applyForMeeting: function(meetingId, userEmail, userGender) {
        try {
            const meetings = this.getMeetingsDB();
            const bookings = this.getBookingsDB();
            
            // 미팅 찾기
            const meeting = Object.values(meetings).find(m => m.id === meetingId);
            if (!meeting) {
                return { success: false, message: '미팅을 찾을 수 없습니다.' };
            }
            
            // 이미 신청했는지 확인
            const existingBooking = Object.values(bookings).find(
                b => b.userEmail === userEmail && b.meetingId === meetingId && b.status !== 'cancelled'
            );
            if (existingBooking) {
                return { success: false, message: '이미 신청한 미팅입니다.' };
            }
            
            // 같은 성향의 다른 미팅에 이미 신청했는지 확인
            const sameOrientationBooking = Object.values(bookings).find(b => {
                if (b.userEmail !== userEmail || b.status === 'cancelled') return false;
                const bookingMeeting = Object.values(meetings).find(m => m.id === b.meetingId);
                return bookingMeeting && bookingMeeting.orientation === meeting.orientation;
            });
            if (sameOrientationBooking) {
                return { success: false, message: `이미 ${meeting.orientation === 'progressive' ? '진보' : '보수'} 성향 모임에 신청하셨습니다.` };
            }
            
            // 최근 신청 확인 (2초 이내 동일 사용자의 신청 방지)
            const recentBooking = Object.values(bookings).find(b => {
                if (b.userEmail !== userEmail) return false;
                const bookingTime = new Date(b.createdAt).getTime();
                const now = Date.now();
                return (now - bookingTime) < 2000; // 2초 이내
            });
            if (recentBooking) {
                return { success: false, message: '잠시 후 다시 시도해주세요.' };
            }
            
            // 자리 확인 - 주석 처리 (Firebase에서 이미 확인했으므로)
            // if (meeting.currentParticipants[userGender] >= meeting.maxParticipants[userGender]) {
            //     return { success: false, message: '해당 성별 자리가 마감되었습니다.' };
            // }
            
            // 예약 생성 (더 고유한 ID 생성)
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 7);
            const bookingId = `booking_${timestamp}_${randomStr}`;
            const booking = {
                id: bookingId,
                meetingId: meetingId,
                userEmail: userEmail,
                userGender: userGender,
                meetingTitle: meeting.title,
                meetingDate: meeting.date,
                meetingTime: meeting.time,
                meetingLocation: meeting.location,
                price: meeting.price,
                status: 'pending', // pending, paid, confirmed, cancelled
                createdAt: new Date().toISOString(),
                paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24시간
            };
            
            // 참가자 수 증가
            meeting.currentParticipants[userGender]++;
            
            // 저장
            bookings[bookingId] = booking;
            meetings[meeting.orientation] = meeting;
            
            this.saveBookingsDB(bookings);
            this.saveMeetingsDB(meetings);
            
            // 세션에 예약 정보 저장
            const appliedMeetings = JSON.parse(sessionStorage.getItem('appliedMeetings') || '{}');
            appliedMeetings[meeting.orientation] = {
                meetingId: meetingId,
                bookingId: bookingId,
                status: 'pending',
                appliedAt: new Date().toISOString()
            };
            sessionStorage.setItem('appliedMeetings', JSON.stringify(appliedMeetings));
            
            return {
                success: true,
                bookingId: bookingId,
                message: '미팅 신청이 완료되었습니다. 24시간 내에 입금해주세요.'
            };
        } catch (error) {
            return { success: false, message: '신청 중 오류가 발생했습니다: ' + error.message };
        }
    },
    
    // 예약 조회
    getUserBookings: function(userEmail) {
        const bookings = this.getBookingsDB();
        return Object.values(bookings).filter(b => b.userEmail === userEmail);
    },
    
    // 예약 상태 업데이트
    updateBookingStatus: function(bookingId, newStatus) {
        try {
            const bookings = this.getBookingsDB();
            const booking = bookings[bookingId];
            
            if (!booking) {
                return { success: false, message: '예약을 찾을 수 없습니다.' };
            }
            
            booking.status = newStatus;
            booking.updatedAt = new Date().toISOString();
            
            bookings[bookingId] = booking;
            this.saveBookingsDB(bookings);
            
            // 세션 업데이트
            const appliedMeetings = JSON.parse(sessionStorage.getItem('appliedMeetings') || '{}');
            const meetings = this.getMeetingsDB();
            const meeting = Object.values(meetings).find(m => m.id === booking.meetingId);
            
            if (meeting && appliedMeetings[meeting.orientation]) {
                appliedMeetings[meeting.orientation].status = newStatus;
                sessionStorage.setItem('appliedMeetings', JSON.stringify(appliedMeetings));
            }
            
            return { success: true, message: '예약 상태가 업데이트되었습니다.' };
        } catch (error) {
            return { success: false, message: '업데이트 중 오류가 발생했습니다: ' + error.message };
        }
    },
    
    // 결제 처리
    processPayment: function(bookingId, paymentInfo) {
        try {
            const bookings = this.getBookingsDB();
            const payments = this.getPaymentsDB();
            const booking = bookings[bookingId];
            
            if (!booking) {
                return { success: false, message: '예약을 찾을 수 없습니다.' };
            }
            
            // 결제 정보 생성
            const paymentId = 'payment_' + Date.now();
            const payment = {
                id: paymentId,
                bookingId: bookingId,
                userEmail: booking.userEmail,
                amount: booking.price,
                method: paymentInfo.method || 'bank_transfer',
                depositorName: paymentInfo.depositorName,
                status: 'payment_pending', // pending, completed, failed, refunded
                createdAt: new Date().toISOString()
            };
            
            payments[paymentId] = payment;
            this.savePaymentsDB(payments);
            
            // 예약 상태 업데이트
            this.updateBookingStatus(bookingId, 'paid');
            
            return {
                success: true,
                paymentId: paymentId,
                message: '결제 정보가 등록되었습니다. 확인 후 참가가 확정됩니다.'
            };
        } catch (error) {
            return { success: false, message: '결제 처리 중 오류가 발생했습니다: ' + error.message };
        }
    },
    
    // 예약 취소
    cancelBooking: function(bookingId) {
        try {
            const bookings = this.getBookingsDB();
            const meetings = this.getMeetingsDB();
            const booking = bookings[bookingId];
            
            if (!booking) {
                return { success: false, message: '예약을 찾을 수 없습니다.' };
            }
            
            // 미팅 참가자 수 감소
            const meeting = Object.values(meetings).find(m => m.id === booking.meetingId);
            if (meeting) {
                meeting.currentParticipants[booking.userGender]--;
                meetings[meeting.orientation] = meeting;
                this.saveMeetingsDB(meetings);
            }
            
            // 예약 상태 변경
            booking.status = 'cancelled';
            booking.cancelledAt = new Date().toISOString();
            bookings[bookingId] = booking;
            this.saveBookingsDB(bookings);
            
            // 세션에서 제거
            const appliedMeetings = JSON.parse(sessionStorage.getItem('appliedMeetings') || '{}');
            if (meeting && appliedMeetings[meeting.orientation]) {
                delete appliedMeetings[meeting.orientation];
                sessionStorage.setItem('appliedMeetings', JSON.stringify(appliedMeetings));
            }
            
            return { success: true, message: '예약이 취소되었습니다.' };
        } catch (error) {
            return { success: false, message: '취소 중 오류가 발생했습니다: ' + error.message };
        }
    },
    
    // 미팅 참가 확정 (관리자 기능)
    confirmParticipant: function(bookingId) {
        try {
            const bookings = this.getBookingsDB();
            const booking = bookings[bookingId];
            
            if (!booking) {
                return { success: false, message: '예약을 찾을 수 없습니다.' };
            }
            
            if (booking.status !== 'paid') {
                return { success: false, message: '결제가 완료되지 않은 예약입니다.' };
            }
            
            booking.status = 'confirmed';
            booking.confirmedAt = new Date().toISOString();
            bookings[bookingId] = booking;
            this.saveBookingsDB(bookings);
            
            // 결제 상태도 업데이트
            const payments = this.getPaymentsDB();
            const payment = Object.values(payments).find(p => p.bookingId === bookingId);
            if (payment) {
                payment.status = 'completed';
                payment.completedAt = new Date().toISOString();
                payments[payment.id] = payment;
                this.savePaymentsDB(payments);
            }
            
            return { success: true, message: '참가가 확정되었습니다.' };
        } catch (error) {
            return { success: false, message: '확정 중 오류가 발생했습니다: ' + error.message };
        }
    },
    
    // 데이터 초기화 (디버그용)
    reset: function() {
        if (confirm('모든 미팅 및 예약 데이터가 삭제됩니다. 계속하시겠습니까?')) {
            localStorage.removeItem(this.MEETINGS_DB);
            localStorage.removeItem(this.BOOKINGS_DB);
            localStorage.removeItem(this.PAYMENTS_DB);
            sessionStorage.removeItem('appliedMeetings');
            this.initializeMeetings();
            alert('데이터가 초기화되었습니다.');
        }
    }
};

// 초기화
DataSystem.initializeMeetings();

// 전역 객체로 노출
window.DataSystem = DataSystem;