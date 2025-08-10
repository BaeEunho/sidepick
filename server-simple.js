// Firebase 기반 서버
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Firebase 설정 가져오기
const { admin, db, collections } = require('./firebase-config');

const app = express();
// CORS 설정 - 모든 origin 허용
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());
app.use(express.static('.'));

// JWT 비밀키
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
console.log('=== 서버 시작 시 JWT_SECRET 확인 ===');
console.log('JWT_SECRET 설정됨:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET 길이:', JWT_SECRET.length);
console.log('JWT_SECRET 첫 10자:', JWT_SECRET.substring(0, 10) + '...');

// API 상태 확인 엔드포인트
app.get('/api', (req, res) => {
    res.json({
        status: 'ok',
        message: '사이드픽 API 서버가 정상 작동 중입니다.',
        timestamp: new Date().toISOString()
    });
});

// API 상태 확인 엔드포인트 (더 자세한 정보)
app.get('/api/status', (req, res) => {
    res.json({
        status: 'ok',
        service: 'SidePick API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Firestore 컬렉션 참조 (메모리 대신 Firebase 사용)
// collections는 firebase-config.js에서 가져옴

// 이메일 인증 코드 발송 API
app.post('/api/email/send-verification', async (req, res) => {
    const { email } = req.body;
    
    try {
        // 6자리 인증 코드 생성
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Firestore에 인증 코드 저장 (5분 유효)
        await collections.verificationCodes.doc(email).set({
            code: verificationCode,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        
        // 이메일 내용
        const mailOptions = {
            from: `"사이드픽" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '[사이드픽] 이메일 인증 코드',
            html: `
                <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #4F46E5; padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">사이드픽</h1>
                        <p style="color: white; margin: 10px 0 0 0;">정치 성향 기반 만남 서비스</p>
                    </div>
                    
                    <div style="padding: 40px 30px; background-color: #f9fafb;">
                        <h2 style="color: #111827; margin-bottom: 20px;">이메일 인증</h2>
                        
                        <p style="color: #4b5563; line-height: 1.6;">
                            안녕하세요!<br>
                            사이드픽 회원가입을 위한 인증 코드를 안내해드립니다.
                        </p>
                        
                        <div style="background-color: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 30px; margin: 30px 0; text-align: center;">
                            <p style="color: #6b7280; margin: 0 0 10px 0;">인증 코드</p>
                            <h1 style="color: #4F46E5; letter-spacing: 8px; margin: 0;">${verificationCode}</h1>
                        </div>
                        
                        <p style="color: #4b5563; line-height: 1.6;">
                            위 인증 코드를 회원가입 페이지에 입력해주세요.<br>
                            인증 코드는 5분간 유효합니다.
                        </p>
                    </div>
                </div>
            `
        };
        
        // 이메일 전송 (필수)
        await transporter.sendMail(mailOptions);
        console.log('이메일 발송 완료:', email);
        
        res.json({ 
            success: true, 
            message: '인증 코드가 이메일로 발송되었습니다.'
        });
        
    } catch (error) {
        console.error('이메일 발송 실패:', error);
        res.status(500).json({ 
            success: false, 
            message: '이메일 발송에 실패했습니다.' 
        });
    }
});

// 이메일 인증 코드 확인 API
app.post('/api/email/verify-code', async (req, res) => {
    const { email, code } = req.body;
    
    try {
        const doc = await collections.verificationCodes.doc(email).get();
        
        if (!doc.exists) {
            return res.status(400).json({ 
                success: false, 
                message: '인증 코드가 존재하지 않습니다.' 
            });
        }
        
        const savedData = doc.data();
        
        // 유효 시간 확인
        if (new Date() > savedData.expiresAt.toDate()) {
            await collections.verificationCodes.doc(email).delete();
            return res.status(400).json({ 
                success: false, 
                message: '인증 코드가 만료되었습니다.' 
            });
        }
        
        // 코드 확인
        if (savedData.code !== code) {
            return res.status(400).json({ 
                success: false, 
                message: '인증 코드가 일치하지 않습니다.' 
            });
        }
        
        // 인증 성공
        await collections.verificationCodes.doc(email).delete();
        res.json({ 
            success: true, 
            message: '이메일 인증이 완료되었습니다.' 
        });
        
    } catch (error) {
        console.error('인증 확인 실패:', error);
        res.status(500).json({ 
            success: false, 
            message: '인증 확인에 실패했습니다.' 
        });
    }
});

// 비밀번호 재설정 요청 API
app.post('/api/password/reset-request', async (req, res) => {
    const { email } = req.body;
    
    try {
        // 사용자 확인
        const userDoc = await collections.users.doc(email).get();
        if (!userDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: '등록되지 않은 이메일입니다.' 
            });
        }
        
        // 6자리 인증 코드 생성
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Firestore에 인증 코드 저장 (5분 유효)
        await collections.verificationCodes.doc(email).set({
            code: verificationCode,
            type: 'password_reset',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        
        // 이메일 내용
        const mailOptions = {
            from: `"사이드픽" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '[사이드픽] 비밀번호 재설정 인증 코드',
            html: `
                <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #4F46E5; padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">사이드픽</h1>
                        <p style="color: white; margin: 10px 0 0 0;">정치 성향 기반 만남 서비스</p>
                    </div>
                    
                    <div style="padding: 40px 30px; background-color: #f9fafb;">
                        <h2 style="color: #111827; margin-bottom: 20px;">비밀번호 재설정</h2>
                        
                        <p style="color: #4b5563; line-height: 1.6;">
                            안녕하세요!<br>
                            비밀번호 재설정을 위한 인증 코드를 안내해드립니다.
                        </p>
                        
                        <div style="background-color: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 30px; margin: 30px 0; text-align: center;">
                            <p style="color: #6b7280; margin: 0 0 10px 0;">인증 코드</p>
                            <h1 style="color: #4F46E5; letter-spacing: 8px; margin: 0;">${verificationCode}</h1>
                        </div>
                        
                        <p style="color: #4b5563; line-height: 1.6;">
                            위 인증 코드를 비밀번호 재설정 페이지에 입력해주세요.<br>
                            인증 코드는 5분간 유효합니다.
                        </p>
                        
                        <p style="color: #ef4444; font-size: 14px; margin-top: 20px;">
                            * 본인이 요청하지 않은 경우 이 메일을 무시하세요.
                        </p>
                    </div>
                </div>
            `
        };
        
        // 이메일 전송 (필수)
        await transporter.sendMail(mailOptions);
        console.log('비밀번호 재설정 이메일 발송 완료:', email);
        
        res.json({ 
            success: true, 
            message: '인증 코드가 이메일로 발송되었습니다.'
        });
        
    } catch (error) {
        console.error('비밀번호 재설정 이메일 발송 실패:', error);
        res.status(500).json({ 
            success: false, 
            message: '이메일 발송에 실패했습니다.' 
        });
    }
});

// 비밀번호 재설정 인증 코드 확인 API
app.post('/api/password/verify-reset-code', async (req, res) => {
    const { email, code } = req.body;
    
    try {
        const doc = await collections.verificationCodes.doc(email).get();
        
        if (!doc.exists) {
            return res.status(400).json({ 
                success: false, 
                message: '인증 코드가 존재하지 않습니다.' 
            });
        }
        
        const savedData = doc.data();
        
        // 유효 시간 확인
        if (new Date() > savedData.expiresAt.toDate()) {
            await collections.verificationCodes.doc(email).delete();
            return res.status(400).json({ 
                success: false, 
                message: '인증 코드가 만료되었습니다.' 
            });
        }
        
        // 코드 확인
        if (savedData.code !== code) {
            return res.status(400).json({ 
                success: false, 
                message: '인증 코드가 일치하지 않습니다.' 
            });
        }
        
        // 인증 성공
        await collections.verificationCodes.doc(email).delete();
        
        // 임시 토큰 생성 (비밀번호 재설정용)
        const resetToken = jwt.sign(
            { email, type: 'password_reset' },
            JWT_SECRET,
            { expiresIn: '15m' }
        );
        
        res.json({ 
            success: true, 
            message: '인증이 완료되었습니다.',
            resetToken: resetToken
        });
        
    } catch (error) {
        console.error('인증 확인 실패:', error);
        res.status(500).json({ 
            success: false, 
            message: '인증 확인에 실패했습니다.' 
        });
    }
});

// 비밀번호 재설정 API
app.post('/api/password/reset', async (req, res) => {
    const { resetToken, newPassword } = req.body;
    
    try {
        // 토큰 검증
        const decoded = jwt.verify(resetToken, JWT_SECRET);
        
        if (decoded.type !== 'password_reset') {
            return res.status(400).json({ 
                success: false, 
                message: '유효하지 않은 토큰입니다.' 
            });
        }
        
        // 비밀번호 해싱
        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        // 비밀번호 업데이트
        await collections.users.doc(decoded.email).update({
            password_hash: passwordHash,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('비밀번호 재설정 완료:', decoded.email);
        
        res.json({
            success: true,
            message: '비밀번호가 성공적으로 변경되었습니다.'
        });
        
    } catch (error) {
        console.error('비밀번호 재설정 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '비밀번호 재설정에 실패했습니다.' 
        });
    }
});

// 회원가입 API (간단 버전)
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name, phone, birthdate, gender, marketingAgree } = req.body;
    
    try {
        // 이메일 중복 체크
        const existingUser = await collections.users.doc(email).get();
        if (existingUser.exists) {
            return res.status(400).json({ 
                success: false, 
                message: '이미 사용 중인 이메일입니다.' 
            });
        }
        
        // 비밀번호 해싱
        const passwordHash = await bcrypt.hash(password, 10);
        
        // 사용자 정보 저장
        const userId = collections.users.doc().id;
        const userData = {
            id: userId,
            email,
            password_hash: passwordHash,
            name,
            phone,
            birthdate,
            gender,
            marketingAgree: marketingAgree || false,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        };
        
        console.log('회원가입 - 저장할 사용자 데이터:', userData);
        
        await collections.users.doc(email).set(userData);
        
        console.log('회원가입 - Firebase에 저장 완료');
        
        // JWT 토큰 생성
        const token = jwt.sign(
            { userId, email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            data: {
                token,
                user: {
                    id: userId,
                    email,
                    name,
                    phone,
                    birthdate,
                    gender,
                    marketingAgree
                }
            }
        });
        
    } catch (error) {
        console.error('회원가입 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '회원가입 처리 중 오류가 발생했습니다.' 
        });
    }
});

// 로그인 API (간단 버전)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // 사용자 조회
        const userDoc = await collections.users.doc(email).get();
        
        if (!userDoc.exists) {
            return res.status(401).json({ 
                success: false, 
                message: '이메일 또는 비밀번호가 일치하지 않습니다.' 
            });
        }
        
        const user = userDoc.data();
        
        // 비밀번호 확인
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: '이메일 또는 비밀번호가 일치하지 않습니다.' 
            });
        }
        
        // JWT 토큰 생성
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // 비밀번호 제외하고 사용자 정보 반환
        const { password_hash, ...userWithoutPassword } = user;
        
        console.log('로그인 응답 사용자 정보:', JSON.stringify(userWithoutPassword, null, 2));
        
        res.json({
            success: true,
            message: '로그인 성공',
            data: {
                token,
                user: userWithoutPassword
            }
        });
        
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '로그인 처리 중 오류가 발생했습니다.' 
        });
    }
});

// 모임 신청 API
app.post('/api/meetings/apply', async (req, res) => {
    console.log('=== /api/meetings/apply 요청 받음 ===');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Authorization Header:', req.headers.authorization);
    
    const { meetingId, orientation, meetingInfo, applicationData } = req.body;
    const authHeader = req.headers.authorization;
    
    console.log('=== CRITICAL: ORIENTATION CHECK ===');
    console.log('Received orientation:', orientation);
    console.log('Type of orientation:', typeof orientation);
    console.log('meetingId:', meetingId);
    console.log('meetingInfo:', meetingInfo);
    console.log('===================================');
    
    if (!authHeader) {
        console.log('인증 헤더 없음');
        return res.status(401).json({ 
            success: false, 
            message: '로그인이 필요합니다.' 
        });
    }
    
    try {
        const token = authHeader.replace('Bearer ', '');
        console.log('토큰 추출:', token);
        console.log('JWT_SECRET 사용:', JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}...` : 'NOT SET');
        
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
            console.log('토큰 디코드 성공:', decoded);
        } catch (jwtError) {
            console.error('JWT 검증 실패:', jwtError.message);
            console.error('JWT 에러 타입:', jwtError.name);
            
            // 토큰 구조 분석
            try {
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
                    console.log('토큰 페이로드:', payload);
                    console.log('토큰 발급시간:', new Date(payload.iat * 1000).toISOString());
                    console.log('토큰 만료시간:', payload.exp ? new Date(payload.exp * 1000).toISOString() : '없음');
                }
            } catch (parseError) {
                console.error('토큰 구조 분석 실패:', parseError.message);
            }
            
            // 개발 환경에서만: 기본 시크릿으로 재시도
            if (process.env.NODE_ENV !== 'production' && JWT_SECRET !== process.env.JWT_SECRET) {
                console.log('기본 시크릿으로 재시도...');
                try {
                    decoded = jwt.verify(token, process.env.JWT_SECRET);
                    console.log('기본 시크릿으로 디코드 성공');
                } catch (retryError) {
                    throw jwtError; // 원래 에러를 다시 throw
                }
            } else {
                throw jwtError;
            }
        }
        
        const userDoc = await collections.users.doc(decoded.email).get();
        console.log('사용자 조회:', userDoc.exists ? `찾음 (${decoded.email})` : '못찾음');
        
        if (!userDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: '사용자를 찾을 수 없습니다.' 
            });
        }
        
        const user = userDoc.data();
        
        // 이미 신청한 모임인지 확인 (cancelled 제외)
        // Firestore 복합 쿼리 제한으로 인해 먼저 전체를 가져온 후 필터링
        const allBookings = await collections.bookings
            .where('userEmail', '==', user.email)
            .where('orientation', '==', orientation)
            .get();
        
        console.log(`=== 중복 신청 체크 ===`);
        console.log(`사용자: ${user.email}`);
        console.log(`성향: ${orientation}`);
        console.log(`전체 신청 건수: ${allBookings.size}`);
        
        // cancelled가 아닌 신청만 필터링
        const activeBookings = [];
        allBookings.forEach(doc => {
            const data = doc.data();
            console.log(`- Booking ID: ${doc.id}, Status: ${data.status}, MeetingId: ${data.meetingId}`);
            if (data.status !== 'cancelled') {
                activeBookings.push(doc);
            }
        });
        
        console.log(`활성 신청 건수: ${activeBookings.length}`);
        
        if (activeBookings.length > 0) {
            console.log('이미 신청한 모임이 있음');
            return res.status(400).json({
                success: false,
                message: '이미 신청하신 모임이 있습니다.'
            });
        }
        
        // 모임 신청 정보 저장
        const bookingId = collections.bookings.doc().id;
        const booking = {
            id: bookingId,
            userId: user.id,
            userEmail: user.email,
            meetingId,
            orientation,
            status: 'payment_pending',
            appliedAt: admin.firestore.FieldValue.serverTimestamp(),
            meetingTitle: meetingInfo?.title || '모임',
            meetingDate: meetingInfo?.date || '날짜 미정',
            meetingTime: meetingInfo?.time || '15:00',
            meetingLocation: meetingInfo?.location || '장소 미정',
            applicationData: applicationData
        };
        
        console.log('저장할 booking 객체:', JSON.stringify(booking, null, 2));
        console.log('특히 status 필드:', booking.status);
        
        try {
            await collections.bookings.doc(bookingId).set(booking);
            console.log('Firebase set() 완료');
            
            // 저장 확인
            const savedDoc = await collections.bookings.doc(bookingId).get();
            if (savedDoc.exists) {
                const savedData = savedDoc.data();
                console.log('저장 확인: 문서가 성공적으로 저장됨');
                console.log('저장된 데이터:', JSON.stringify(savedData, null, 2));
                console.log('저장된 status:', savedData.status);
                
                if (savedData.status !== 'payment_pending') {
                    console.error('WARNING: status가 변경되었습니다!');
                    console.error('원래 값: payment_pending');
                    console.error('저장된 값:', savedData.status);
                }
            } else {
                console.error('저장 실패: 문서를 찾을 수 없음');
            }
        } catch (saveError) {
            console.error('Firebase 저장 중 오류:', saveError);
            console.error('오류 상세:', saveError.message);
            throw saveError;
        }
        
        console.log('모임 신청 저장 완료!');
        
        // 전체 bookings 수 확인
        const bookingsSnapshot = await collections.bookings.get();
        console.log('현재 전체 bookings 개수:', bookingsSnapshot.size);
        
        res.json({
            success: true,
            message: '모임 신청이 완료되었습니다.',
            data: { bookingId }
        });
        
    } catch (error) {
        console.error('모임 신청 오류:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: `모임 신청 중 오류가 발생했습니다: ${error.message}`,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// 관리자 API - 전체 사용자 목록 조회
app.get('/api/admin/users', async (req, res) => {
    console.log('=== /api/admin/users 요청 받음 ===');
    
    try {
        // 모든 사용자 정보 가져오기
        const usersSnapshot = await collections.users.get();
        const users = [];
        
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            console.log(`Firebase에서 가져온 사용자 데이터 (${doc.id}):`, userData);
            users.push({ email: doc.id, ...userData });
        });
        
        console.log('현재 users 개수:', users.length);
        
        // 모든 booking 정보 가져오기
        const bookingsSnapshot = await collections.bookings.get();
        const allBookings = [];
        
        bookingsSnapshot.forEach(doc => {
            allBookings.push({ bookingId: doc.id, ...doc.data() });
        });
        
        console.log('현재 bookings 개수:', allBookings.length);
        
        // 사용자별로 모임 정보 매핑
        const usersList = users.map(user => {
            const { password_hash, ...userWithoutPassword } = user;
            
            console.log(`\n사용자 ${user.email} 처리 중...`);
            
            // 해당 사용자의 모임 신청 정보 찾기
            const userBookings = allBookings
                .filter(booking => {
                    const isMatch = booking.userEmail === user.email;
                    if (isMatch) {
                        console.log(`매칭된 booking:`, booking.bookingId, booking.meetingTitle);
                    }
                    return isMatch;
                })
                .map(booking => ({
                    id: booking.bookingId,  // booking ID를 사용
                    meetingId: booking.meetingId,
                    title: booking.meetingTitle || '모임',
                    date: booking.meetingDate || '날짜 미정',
                    location: booking.meetingLocation || '장소 미정',
                    orientation: booking.orientation,
                    status: booking.status,
                    appliedAt: booking.appliedAt
                }))
                // 최신순으로 정렬 (appliedAt 기준)
                .sort((a, b) => {
                    // Firebase Timestamp 처리
                    let dateA = new Date(0);
                    let dateB = new Date(0);
                    
                    if (a.appliedAt) {
                        if (a.appliedAt._seconds) {
                            dateA = new Date(a.appliedAt._seconds * 1000);
                        } else if (a.appliedAt.toDate) {
                            dateA = a.appliedAt.toDate();
                        } else {
                            dateA = new Date(a.appliedAt);
                        }
                    }
                    
                    if (b.appliedAt) {
                        if (b.appliedAt._seconds) {
                            dateB = new Date(b.appliedAt._seconds * 1000);
                        } else if (b.appliedAt.toDate) {
                            dateB = b.appliedAt.toDate();
                        } else {
                            dateB = new Date(b.appliedAt);
                        }
                    }
                    
                    return dateB - dateA; // 내림차순 (최신이 먼저)
                });
            
            console.log(`${user.email}의 모임 신청:`, userBookings.length, '개');
            
            // Handle Firebase Timestamp for joinedDate
            let joinedDate = new Date().toISOString();
            if (user.created_at) {
                // Handle Firebase Timestamp object
                if (user.created_at._seconds) {
                    joinedDate = new Date(user.created_at._seconds * 1000).toISOString();
                } else if (user.created_at.toDate) {
                    joinedDate = user.created_at.toDate().toISOString();
                } else {
                    joinedDate = user.created_at;
                }
            } else if (user.joinedDate) {
                joinedDate = user.joinedDate;
            }
            
            return {
                ...userWithoutPassword,
                joinedDate: joinedDate,
                marketingAgree: user.marketingAgree || false,
                meetings: userBookings,
                payments: userBookings
                    .filter(b => b.status === 'confirmed' || b.status === 'paid')
                    .map(b => ({ meetingId: b.id, amount: 45000, status: 'paid' }))
            };
        });
        
        console.log('\n최종 usersList 생성 완료:', usersList.length, '명');
        usersList.forEach(user => {
            console.log(`- ${user.email}: ${user.meetings.length}개 모임`);
        });
        
        res.json({
            success: true,
            data: { users: usersList }
        });
        
    } catch (error) {
        console.error('사용자 목록 조회 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '사용자 목록 조회 중 오류가 발생했습니다.' 
        });
    }
});

// 회원 탈퇴 API
app.delete('/api/auth/delete-account', async (req, res) => {
    console.log('=== 회원 탈퇴 요청 받음 ===');
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);
    
    if (!authHeader) {
        console.log('인증 헤더 없음');
        return res.status(401).json({ 
            success: false, 
            message: '인증이 필요합니다.' 
        });
    }
    
    try {
        // JWT 토큰 검증
        const token = authHeader.replace('Bearer ', '');
        console.log('토큰 추출:', token);
        
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('토큰 디코드 성공:', decoded);
        
        // 사용자 확인
        const userDoc = await collections.users.doc(decoded.email).get();
        if (!userDoc.exists) {
            console.log('사용자를 찾을 수 없음:', decoded.email);
            return res.status(404).json({ 
                success: false, 
                message: '사용자를 찾을 수 없습니다.' 
            });
        }
        
        console.log('사용자 찾음:', decoded.email);
        
        // 사용자 삭제
        await collections.users.doc(decoded.email).delete();
        console.log('사용자 삭제 완료');
        
        // 해당 사용자의 모든 booking 삭제
        const bookingsSnapshot = await collections.bookings
            .where('userEmail', '==', decoded.email)
            .get();
        
        console.log('삭제할 booking 수:', bookingsSnapshot.size);
        
        const batch = db.batch();
        bookingsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        console.log('회원 탈퇴 완료:', decoded.email);
        
        res.json({
            success: true,
            message: '회원 탈퇴가 완료되었습니다.'
        });
        
    } catch (error) {
        console.error('회원 탈퇴 오류:', error);
        console.error('에러 타입:', error.name);
        console.error('에러 메시지:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: '유효하지 않은 토큰입니다.' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: '회원 탈퇴 중 오류가 발생했습니다.' 
        });
    }
});

// 정치 성향 저장 API
app.post('/api/user/political-type', async (req, res) => {
    const { politicalType, testResult, testCompletedAt } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            message: '인증이 필요합니다.' 
        });
    }
    
    try {
        // JWT 토큰 검증
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 사용자 정보 업데이트
        await collections.users.doc(decoded.email).update({
            political_type: politicalType,
            test_completed_at: admin.firestore.FieldValue.serverTimestamp(),
            test_result: testResult,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`정치 성향 저장 완료: ${decoded.email} - ${politicalType}`);
        
        res.json({
            success: true,
            message: '정치 성향이 저장되었습니다.'
        });
        
    } catch (error) {
        console.error('정치 성향 저장 오류:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: '유효하지 않은 토큰입니다.' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: '정치 성향 저장 중 오류가 발생했습니다.' 
        });
    }
});

// 비밀번호 변경 API
app.post('/api/user/change-password', async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            message: '인증이 필요합니다.' 
        });
    }
    
    try {
        // JWT 토큰 검증
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 사용자 정보 조회
        const userDoc = await collections.users.doc(decoded.email).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: '사용자를 찾을 수 없습니다.' 
            });
        }
        
        const user = userDoc.data();
        
        // 현재 비밀번호 확인
        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: '현재 비밀번호가 올바르지 않습니다.' 
            });
        }
        
        // 새 비밀번호 해싱
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        
        // 비밀번호 업데이트
        await collections.users.doc(decoded.email).update({
            password_hash: newPasswordHash,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('비밀번호 변경 완료:', decoded.email);
        
        res.json({
            success: true,
            message: '비밀번호가 성공적으로 변경되었습니다.'
        });
        
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: '유효하지 않은 토큰입니다.' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: '비밀번호 변경 중 오류가 발생했습니다.' 
        });
    }
});

// 정치 성향 저장 API
app.post('/api/auth/save-political-type', async (req, res) => {
    const { politicalType, testResult } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            message: '인증이 필요합니다.' 
        });
    }
    
    try {
        // JWT 토큰 검증
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        
        console.log(`\n=== 정치 성향 저장 요청 ===`);
        console.log(`이메일: ${decoded.email}`);
        console.log(`정치 성향: ${politicalType}`);
        console.log(`테스트 결과 포함: ${!!testResult}`);
        if (testResult) {
            console.log(`- axisScores: ${JSON.stringify(testResult.axisScores)}`);
            console.log(`- userAnswers 개수: ${testResult.userAnswers ? testResult.userAnswers.length : 0}`);
        }
        
        // 사용자 문서 존재 확인
        const userDoc = await collections.users.doc(decoded.email).get();
        if (!userDoc.exists) {
            console.error(`[ERROR] 사용자 문서를 찾을 수 없음: ${decoded.email}`);
            console.log(`Firebase users 컬렉션에 ${decoded.email} 문서가 없습니다.`);
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        
        console.log(`사용자 문서 확인: ${decoded.email} 존재함`);
        
        // 업데이트할 데이터 준비
        const updateData = {
            political_type: politicalType,
            test_completed_at: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // testResult가 있으면 추가 정보 저장
        if (testResult) {
            if (testResult.axisScores) {
                updateData.axis_scores = testResult.axisScores;
            }
            if (testResult.userAnswers) {
                updateData.test_answers = testResult.userAnswers;
            }
        }
        
        console.log(`업데이트 데이터 준비 완료:`, JSON.stringify(updateData, null, 2));
        
        // 사용자 정보 업데이트
        try {
            await collections.users.doc(decoded.email).update(updateData);
            console.log(`[SUCCESS] 정치 성향 저장 완료: ${decoded.email} -> ${politicalType}`);
            
            // 업데이트 직후 데이터 확인
            const updatedDoc = await collections.users.doc(decoded.email).get();
            const updatedData = updatedDoc.data();
            console.log(`[VERIFY] 업데이트 후 정치 성향: ${updatedData.political_type}`);
            console.log(`[VERIFY] 업데이트 후 테스트 완료 시간: ${updatedData.test_completed_at}`);
            if (updatedData.axis_scores) {
                console.log(`[VERIFY] 업데이트 후 axis_scores: ${JSON.stringify(updatedData.axis_scores)}`);
            }
            console.log(`=== 정치 성향 저장 완료 ===\n`);
            
            res.json({
                success: true,
                message: '정치 성향이 저장되었습니다.'
            });
        } catch (updateError) {
            console.error(`[ERROR] Firebase 업데이트 실패:`, updateError);
            throw updateError;
        }
        
    } catch (error) {
        console.error('정치 성향 저장 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '정치 성향 저장 중 오류가 발생했습니다.' 
        });
    }
});

// 사용자 프로필 정보 API
app.get('/api/user/profile', async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            message: '인증이 필요합니다.' 
        });
    }
    
    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const userDoc = await collections.users.doc(decoded.email).get();
        if (!userDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: '사용자를 찾을 수 없습니다.' 
            });
        }
        
        const user = userDoc.data();
        
        // 해당 사용자의 모임 신청 정보 찾기
        const bookingsSnapshot = await collections.bookings
            .where('userEmail', '==', user.email)
            .get();
        
        const userBookings = [];
        bookingsSnapshot.forEach(doc => {
            const bookingData = doc.data();
            console.log(`[Booking ${doc.id}] status: ${bookingData.status}`);
            userBookings.push(bookingData);
        });
        
        const { password_hash, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            data: {
                ...userWithoutPassword,
                politicalType: user.political_type,
                meetings: userBookings.map(booking => ({
                    id: booking.meetingId,
                    title: booking.meetingTitle || '모임',
                    date: booking.meetingDate || '날짜 미정',
                    location: booking.meetingLocation || '장소 미정',
                    orientation: booking.orientation,
                    status: booking.status,
                    appliedAt: booking.appliedAt
                }))
            }
        });
        
    } catch (error) {
        console.error('프로필 조회 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '프로필 조회 중 오류가 발생했습니다.' 
        });
    }
});

// 사용자 모임 정보 API
app.get('/api/user/meetings', async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            message: '인증이 필요합니다.' 
        });
    }
    
    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        
        console.log(`\n=== 사용자 모임 조회: ${decoded.email} ===`);
        
        const userDoc = await collections.users.doc(decoded.email).get();
        if (!userDoc.exists) {
            console.log('사용자를 찾을 수 없음');
            return res.status(404).json({ 
                success: false, 
                message: '사용자를 찾을 수 없습니다.' 
            });
        }
        
        // 디버깅: 모든 bookings 확인
        console.log('=== 디버깅: 전체 bookings 컬렉션 확인 ===');
        const allBookingsSnapshot = await collections.bookings.limit(10).get();
        console.log(`전체 bookings 수: ${allBookingsSnapshot.size}`);
        allBookingsSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`Booking ID: ${doc.id}, Email: ${data.userEmail}, Status: ${data.status}`);
        });
        
        // 해당 사용자의 모임 신청 정보 찾기
        console.log(`\n=== ${decoded.email}의 bookings 검색 ===`);
        
        // 이메일 대소문자 문제 해결을 위해 두 가지 방법으로 검색
        let bookingsSnapshot = await collections.bookings
            .where('userEmail', '==', decoded.email)
            .get();
            
        console.log(`첫 번째 쿼리 (${decoded.email}): ${bookingsSnapshot.size}개 찾음`);
        
        // 만약 못 찾았으면 소문자로도 시도
        if (bookingsSnapshot.size === 0) {
            console.log('소문자로 재검색 시도...');
            bookingsSnapshot = await collections.bookings
                .where('userEmail', '==', decoded.email.toLowerCase())
                .get();
            console.log(`두 번째 쿼리 (${decoded.email.toLowerCase()}): ${bookingsSnapshot.size}개 찾음`);
        }
        
        console.log(`쿼리 결과: ${bookingsSnapshot.size}개 문서 찾음`);
        
        const userBookings = [];
        bookingsSnapshot.forEach(doc => {
            const booking = doc.data();
            console.log(`Booking ${doc.id}:`, {
                title: booking.meetingTitle,
                status: booking.status,
                updatedAt: booking.updatedAt
            });
            // bookingId를 포함하여 저장
            userBookings.push({
                bookingId: doc.id,
                ...booking
            });
        });
        
        console.log(`총 ${userBookings.length}개 모임 찾음`);
        
        const meetings = userBookings.map(booking => ({
            id: booking.bookingId,  // bookingId를 id로 반환
            meetingId: booking.meetingId,  // meetingId도 따로 반환
            title: booking.meetingTitle || '모임',
            date: booking.meetingDate || '8월 23일 (토)',
            location: booking.meetingLocation || '강남역 파티룸',
            time: '15:00',
            orientation: booking.orientation,
            status: booking.status,
            appliedAt: booking.appliedAt
        }));
        
        console.log('반환할 모임 데이터:', meetings.map(m => ({ title: m.title, status: m.status })));
        console.log('=== 모임 조회 완료 ===\n');
        
        res.json({
            success: true,
            meetings: meetings
        });
        
    } catch (error) {
        console.error('모임 조회 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '모임 조회 중 오류가 발생했습니다.' 
        });
    }
});

// 예약 정보 조회 API (payment-complete.html에서 사용)
app.get('/api/bookings/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    const authHeader = req.headers.authorization;
    
    console.log(`=== 예약 정보 조회: ${bookingId} ===`);
    
    try {
        // JWT 토큰 검증 (optional - 토큰이 있으면 검증)
        let userEmail = null;
        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const decoded = jwt.verify(token, JWT_SECRET);
                userEmail = decoded.email;
                console.log('인증된 사용자:', userEmail);
            } catch (error) {
                console.log('토큰 검증 실패 (계속 진행):', error.message);
            }
        }
        
        // 예약 정보 조회 (bookingId로 먼저 시도, 없으면 meetingId로 검색)
        let bookingDoc = await collections.bookings.doc(bookingId).get();
        let booking = null;
        let actualBookingId = bookingId;
        
        if (!bookingDoc.exists) {
            console.log('bookingId로 찾지 못함, meetingId로 검색 시도:', bookingId);

            console.log("collections all: ", collections.bookings)
            
            // meetingId로 검색
            const bookingsByMeetingId = await collections.bookings
                .where('meetingId', '==', bookingId)
                .limit(1)
                .get();
            
            if (!bookingsByMeetingId.empty) {
                bookingDoc = bookingsByMeetingId.docs[0];
                booking = bookingDoc.data();
                actualBookingId = bookingDoc.id;
                console.log('meetingId로 예약 찾음:', actualBookingId);
            } else {
                console.log('예약을 찾을 수 없음:', bookingId);
                return res.status(404).json({ 
                    success: false, 
                    message: '예약 정보를 찾을 수 없습니다.' 
                });
            }
        } else {
            booking = bookingDoc.data();
        }
        console.log('예약 정보 찾음:', booking);
        
        // 보안: 인증된 경우 본인 예약인지 확인
        if (userEmail && booking.userEmail.toLowerCase() !== userEmail.toLowerCase()) {
            console.log('권한 없음 - 다른 사용자의 예약');
            console.log('Booking email:', booking.userEmail);
            console.log('User email:', userEmail);
            return res.status(403).json({ 
                success: false, 
                message: '이 예약에 대한 권한이 없습니다.' 
            });
        }
        
        // 사용자 정보 조회
        const userDoc = await collections.users.doc(booking.userEmail).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        
        res.json({
            success: true,
            booking: {
                id: actualBookingId,  // 실제 bookingId 반환
                meeting: {
                    id: booking.meetingId,
                    title: booking.meetingTitle || '모임',
                    date: booking.meetingDate || '날짜 미정',
                    time: booking.meetingTime || '15:00',
                    location: booking.meetingLocation || '장소 미정',
                    orientation: booking.orientation
                },
                user: {
                    email: booking.userEmail,
                    name: userData.name || booking.applicationData?.name || '이름 없음',
                    phone: userData.phone || booking.applicationData?.phone || ''
                },
                status: booking.status,
                createdAt: booking.appliedAt ? 
                    (booking.appliedAt.toDate ? booking.appliedAt.toDate().toISOString() : booking.appliedAt) 
                    : new Date().toISOString(),
                paymentInfo: booking.paymentInfo || {}
            }
        });
        
    } catch (error) {
        console.error('예약 조회 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '예약 조회 중 오류가 발생했습니다.' 
        });
    }
});

// 관리자 API - 사용자 마케팅 동의 업데이트
app.put('/api/admin/users/:email/marketing', async (req, res) => {
    const { email } = req.params;
    const { marketingAgree } = req.body;
    
    console.log(`=== 마케팅 동의 업데이트: ${email} → ${marketingAgree} ===`);
    
    try {
        // 사용자 문서 업데이트
        await collections.users.doc(email).update({
            marketingAgree: marketingAgree
        });
        
        console.log(`${email} 사용자의 마케팅 동의 상태를 ${marketingAgree}로 업데이트 완료`);
        
        res.json({
            success: true,
            message: '마케팅 동의 상태가 업데이트되었습니다.'
        });
        
    } catch (error) {
        console.error('마케팅 동의 업데이트 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '마케팅 동의 업데이트 중 오류가 발생했습니다.' 
        });
    }
});

// 관리자 API - 결제 상태 업데이트
app.put('/api/admin/users/:email/payment-status', async (req, res) => {
    const { email } = req.params;
    const { status, bookingId } = req.body;
    
    console.log(`\n=== 결제 상태 업데이트 API 호출 ===`);
    console.log(`대상 이메일: ${email}`);
    console.log(`변경할 상태: ${status}`);
    console.log(`특정 bookingId: ${bookingId || '없음'}`);
    
    try {
        let targetBooking = null;
        
        // bookingId가 제공된 경우 해당 booking을 직접 조회
        if (bookingId) {
            console.log(`특정 bookingId로 조회: ${bookingId}`);
            const bookingDoc = await collections.bookings.doc(bookingId).get();
            
            if (bookingDoc.exists) {
                const bookingData = bookingDoc.data();
                if (bookingData.userEmail === email) {
                    targetBooking = {
                        id: bookingDoc.id,
                        ref: bookingDoc.ref,
                        ...bookingData
                    };
                    console.log('특정 booking 찾음:', {
                        id: targetBooking.id,
                        meetingTitle: targetBooking.meetingTitle,
                        현재상태: targetBooking.status
                    });
                } else {
                    console.log('bookingId와 email이 일치하지 않음');
                    return res.status(403).json({ 
                        success: false, 
                        message: '해당 예약에 대한 권한이 없습니다.' 
                    });
                }
            } else {
                console.log('bookingId에 해당하는 booking이 없음');
            }
        }
        
        // bookingId가 없거나 찾지 못한 경우, 기존 로직 실행
        if (!targetBooking) {
            console.log('기존 로직으로 booking 검색');
            
            // 사용자의 모든 booking 찾기
            const bookingsSnapshot = await collections.bookings
                .where('userEmail', '==', email)
                .get();
            
            console.log(`찾은 booking 수: ${bookingsSnapshot.size}`);
            
            if (bookingsSnapshot.empty) {
                console.log('booking이 없음!');
                return res.status(404).json({ 
                    success: false, 
                    message: '모임 신청 내역이 없습니다.' 
                });
            }
            
            // booking들을 배열로 변환하고 정렬
            const bookings = [];
            bookingsSnapshot.forEach(doc => {
                const data = doc.data();
                console.log(`Booking ${doc.id} 데이터:`, {
                    meetingTitle: data.meetingTitle,
                    status: data.status,
                    createdAt: data.createdAt,
                    appliedAt: data.appliedAt
                });
                
                bookings.push({
                    id: doc.id,
                    ref: doc.ref,
                    ...data,
                    // createdAt이 없으면 appliedAt 사용
                    sortDate: data.createdAt || data.appliedAt || new Date()
                });
            });
            
            // 날짜순으로 정렬 (최신 순)
            bookings.sort((a, b) => {
                const dateA = a.sortDate?._seconds ? new Date(a.sortDate._seconds * 1000) : new Date(a.sortDate);
                const dateB = b.sortDate?._seconds ? new Date(b.sortDate._seconds * 1000) : new Date(b.sortDate);
                return dateB - dateA;
            });
            
            console.log('정렬된 booking 목록:');
            bookings.forEach((booking, index) => {
                console.log(`${index + 1}. ${booking.meetingTitle} - 상태: ${booking.status} - ID: ${booking.id}`);
            });
            
            // 가장 최근의 booking을 선택 (모든 상태 업데이트 가능)
            // 업데이트할 booking 찾기
            if (bookings.length > 0) {
                targetBooking = bookings[0];  // 가장 최근 booking 선택
                console.log(`가장 최근 booking 선택: ${targetBooking.id} - 상태: ${targetBooking.status}`);
            }
        }
        
        if (targetBooking) {
            console.log(`업데이트할 booking 선택됨: ${targetBooking.id}`, {
                meetingTitle: targetBooking.meetingTitle,
                현재상태: targetBooking.status,
                새상태: status
            });
            
            try {
                await targetBooking.ref.update({ 
                    status: status,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                updateCount++;
                console.log('업데이트 성공!');
            } catch (updateError) {
                console.error('업데이트 중 오류:', updateError);
                throw updateError;
            }
        } else {
            console.log('업데이트할 booking이 없음');
        }
        
        if (updateCount === 0) {
            console.log('업데이트할 booking이 없음 (모두 처리됨)');
            return res.status(400).json({ 
                success: false, 
                message: '업데이트할 예약이 없습니다. 모든 예약이 이미 처리되었습니다.' 
            });
        }
        
        console.log(`${updateCount}개 booking의 상태를 ${status}로 업데이트 완료`);
        console.log('=== 결제 상태 업데이트 완료 ===\n');
        
        res.json({
            success: true,
            message: '결제 상태가 업데이트되었습니다.',
            updatedCount: updateCount
        });
        
    } catch (error) {
        console.error('결제 상태 업데이트 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '결제 상태 업데이트 중 오류가 발생했습니다.' 
        });
    }
});

// 관리자 API - 특정 사용자 삭제
app.delete('/api/admin/users/:email', async (req, res) => {
    const { email } = req.params;
    
    console.log(`=== 관리자 사용자 삭제 요청: ${email} ===`);
    
    try {
        // 사용자 확인
        const userDoc = await collections.users.doc(email).get();
        if (!userDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: '사용자를 찾을 수 없습니다.' 
            });
        }
        
        // 사용자 삭제
        await collections.users.doc(email).delete();
        
        // 해당 사용자의 모든 booking 삭제
        const bookingsSnapshot = await collections.bookings
            .where('userEmail', '==', email)
            .get();
        
        const batch = db.batch();
        bookingsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        console.log(`사용자 ${email} 삭제 완료`);
        
        res.json({
            success: true,
            message: '사용자가 삭제되었습니다.'
        });
        
    } catch (error) {
        console.error('사용자 삭제 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '사용자 삭제 중 오류가 발생했습니다.' 
        });
    }
});

// 모임별 참석 인원 조회 API
app.get('/api/meetings/attendance', async (req, res) => {
    console.log('=== 모임 참석 인원 조회 ===');
    
    try {
        // 모든 확정된 예약 조회
        const bookingsSnapshot = await collections.bookings
            .where('status', 'in', ['paid', 'confirmed'])
            .get();
        
        // 모임별로 참석 인원 계산
        const attendance = {};
        const bookings = [];
        
        bookingsSnapshot.forEach(doc => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        
        // 각 예약에 대해 사용자 정보 조회
        for (const booking of bookings) {
            const meetingKey = `${booking.orientation}_${booking.meetingId}`;
            
            if (!attendance[meetingKey]) {
                attendance[meetingKey] = {
                    meetingId: booking.meetingId,
                    orientation: booking.orientation,
                    male: 0,
                    female: 0,
                    total: 0
                };
            }
            
            // 사용자 성별 확인
            const userDoc = await collections.users.doc(booking.userEmail).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.gender === 'male' || userData.gender === 'M') {
                    attendance[meetingKey].male++;
                } else if (userData.gender === 'female' || userData.gender === 'F') {
                    attendance[meetingKey].female++;
                }
                attendance[meetingKey].total++;
            }
        }
        
        console.log('참석 인원 현황:', attendance);
        
        res.json({
            success: true,
            data: attendance
        });
        
    } catch (error) {
        console.error('참석 인원 조회 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '참석 인원 조회 중 오류가 발생했습니다.' 
        });
    }
});

// 모임 신청 취소 API
app.delete('/api/meetings/cancel/:meetingId', async (req, res) => {
    console.log('=== 모임 신청 취소 요청 ===');
    const { meetingId } = req.params;
    const authHeader = req.headers.authorization;
    
    console.log('취소 요청 meetingId:', meetingId);
    console.log('Authorization 존재:', !!authHeader);
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            message: '인증이 필요합니다.' 
        });
    }
    
    try {
        // JWT 토큰 검증
        const token = authHeader.replace('Bearer ', '');
        console.log('받은 토큰:', token.substring(0, 20) + '...');
        
        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({ 
                success: false, 
                message: '유효한 토큰이 없습니다. 다시 로그인해주세요.' 
            });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        console.log('디코드된 사용자 이메일:', decoded.email);
        
        // 먼저 bookingId로 직접 조회 시도
        let bookingDoc = await collections.bookings.doc(meetingId).get();
        let bookingRef = null;
        
        if (bookingDoc.exists && bookingDoc.data().userEmail === decoded.email) {
            // bookingId로 찾았고, 본인의 예약이 맞음
            bookingRef = bookingDoc.ref;
            console.log('bookingId로 예약 찾음');
        } else {
            // bookingId로 못 찾았으면 meetingId로 검색
            const bookingsSnapshot = await collections.bookings
                .where('userEmail', '==', decoded.email)
                .where('meetingId', '==', meetingId)
                .get();
            
            console.log('meetingId로 찾은 booking 수:', bookingsSnapshot.size);
            
            if (!bookingsSnapshot.empty) {
                bookingRef = bookingsSnapshot.docs[0].ref;
                console.log('meetingId로 예약 찾음');
            }
        }
        
        if (!bookingRef) {
            // 모든 bookings를 확인해서 디버깅
            const allBookings = await collections.bookings
                .where('userEmail', '==', decoded.email)
                .get();
            
            console.log('사용자의 전체 booking 수:', allBookings.size);
            allBookings.forEach(doc => {
                const data = doc.data();
                console.log('Booking:', doc.id, 'meetingId:', data.meetingId);
            });
            
            return res.status(404).json({ 
                success: false, 
                message: '신청 내역을 찾을 수 없습니다.' 
            });
        }
        
        // 예약 상태를 cancelled로 변경
        await bookingRef.update({ 
            status: 'cancelled',
            cancelledAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`모임 신청 취소 완료: ${decoded.email}, ${meetingId}`);
        
        res.json({
            success: true,
            message: '모임 신청이 취소되었습니다.'
        });
        
    } catch (error) {
        console.error('모임 취소 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '모임 취소 중 오류가 발생했습니다.' 
        });
    }
});

// 결제 확정 API
app.post('/api/meetings/confirm-payment', async (req, res) => {
    const { meetingId, orientation, paymentInfo } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            message: '인증이 필요합니다.' 
        });
    }
    
    try {
        // JWT 토큰 검증
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        const userEmail = decoded.email;
        
        console.log(`결제 확정 요청: ${userEmail} - ${meetingId}`);
        
        // 해당 사용자의 pending 상태 booking 찾기
        const bookingsSnapshot = await collections.bookings
            .where('userEmail', '==', userEmail)
            .where('meetingId', '==', meetingId)
            .where('status', '==', 'pending')
            .get();
        
        if (bookingsSnapshot.empty) {
            console.log('대기 중인 예약을 찾을 수 없음');
            return res.status(404).json({
                success: false,
                message: '대기 중인 예약을 찾을 수 없습니다.'
            });
        }
        
        // 첫 번째 매칭되는 booking 업데이트
        const bookingDoc = bookingsSnapshot.docs[0];
        const bookingId = bookingDoc.id;
        
        await collections.bookings.doc(bookingId).update({
            status: 'confirmed',
            paymentInfo: paymentInfo,
            confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`예약 확정 완료: ${bookingId}`);
        
        res.json({
            success: true,
            message: '예약이 확정되었습니다.',
            data: { bookingId }
        });
        
    } catch (error) {
        console.error('결제 확정 오류:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: '유효하지 않은 토큰입니다.' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: '결제 확정 중 오류가 발생했습니다.' 
        });
    }
});

// 미팅 상태 업데이트 API
app.put('/api/meetings/:meetingId/status', async (req, res) => {
    const { meetingId } = req.params;
    const { status, paymentInfo } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            message: '인증이 필요합니다.' 
        });
    }
    
    try {
        // JWT 토큰 검증
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        const userEmail = decoded.email;
        
        console.log(`상태 업데이트 요청: ${userEmail} - ${meetingId} - ${status}`);
        
        // 해당 사용자의 booking 찾기
        const bookingsSnapshot = await collections.bookings
            .where('userEmail', '==', userEmail)
            .where('meetingId', '==', meetingId)
            .get();
        
        if (bookingsSnapshot.empty) {
            console.log('예약을 찾을 수 없음');
            return res.status(404).json({
                success: false,
                message: '예약을 찾을 수 없습니다.'
            });
        }
        
        // cancelled가 아닌 booking 찾기
        let bookingDoc = null;
        for (const doc of bookingsSnapshot.docs) {
            const data = doc.data();
            if (data.status !== 'cancelled') {
                bookingDoc = doc;
                break;
            }
        }
        
        if (!bookingDoc) {
            console.log('활성 예약을 찾을 수 없음 (모두 취소됨)');
            return res.status(404).json({
                success: false,
                message: '활성 예약을 찾을 수 없습니다.'
            });
        }
        
        const bookingId = bookingDoc.id;
        
        const updateData = {
            status: status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // paymentInfo가 있으면 추가
        if (paymentInfo) {
            updateData.paymentInfo = paymentInfo;
        }
        
        // status별 추가 필드
        if (status === 'payment_pending') {
            updateData.paymentPendingAt = admin.firestore.FieldValue.serverTimestamp();
        } else if (status === 'paid') {
            updateData.paidAt = admin.firestore.FieldValue.serverTimestamp();
        } else if (status === 'confirmed') {
            updateData.confirmedAt = admin.firestore.FieldValue.serverTimestamp();
        }
        
        await collections.bookings.doc(bookingId).update(updateData);
        
        console.log(`예약 상태 업데이트 완료: ${bookingId} -> ${status}`);
        
        res.json({
            success: true,
            message: '예약 상태가 업데이트되었습니다.',
            data: { bookingId, status }
        });
        
    } catch (error) {
        console.error('상태 업데이트 오류:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: '유효하지 않은 토큰입니다.' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: '상태 업데이트 중 오류가 발생했습니다.' 
        });
    }
});

// 임시 관리자 비밀번호 재설정 API (개발용)
app.post('/api/admin/reset-password-temp', async (req, res) => {
    const { adminEmail, newPassword } = req.body;
    
    console.log(`=== 관리자 비밀번호 리셋 요청 ===`);
    console.log(`대상: ${adminEmail}`);
    
    // 특정 관리자 이메일만 허용
    if (adminEmail !== 'clsrna3@naver.com') {
        console.log('허용되지 않은 이메일');
        return res.status(403).json({
            success: false,
            message: '권한이 없습니다.'
        });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await collections.users.doc(adminEmail).update({
            password_hash: hashedPassword,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`관리자 비밀번호 재설정 완료: ${adminEmail}`);
        
        res.json({
            success: true,
            message: '비밀번호가 재설정되었습니다.'
        });
    } catch (error) {
        console.error('비밀번호 재설정 오류:', error);
        res.status(500).json({
            success: false,
            message: '비밀번호 재설정 중 오류가 발생했습니다.'
        });
    }
});

// 예약 정보 조회 API
app.get('/api/bookings/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            message: '인증이 필요합니다.' 
        });
    }
    
    try {
        // JWT 토큰 검증
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 예약 정보 조회
        const bookingDoc = await collections.bookings.doc(bookingId).get();
        
        if (!bookingDoc.exists) {
            return res.status(404).json({
                success: false,
                message: '예약 정보를 찾을 수 없습니다.'
            });
        }
        
        const booking = bookingDoc.data();
        
        // 사용자 정보 확인 (본인 예약인지 확인)
        if (booking.userId !== decoded.email && booking.userEmail !== decoded.email) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        
        // 사용자 정보 조회
        const userDoc = await collections.users.doc(booking.userEmail || booking.userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        
        // 응답 데이터 구성
        const responseData = {
            id: bookingId,
            user: {
                name: userData.name || booking.userName || '-',
                email: booking.userEmail || booking.userId,
                phone: userData.phone || '-'
            },
            meeting: {
                title: booking.meetingTitle || '-',
                date: booking.meetingDate || '-',
                time: booking.meetingTime || '-',
                location: booking.meetingLocation || '-'
            },
            status: booking.status || 'payment_pending',
            createdAt: booking.appliedAt?.toDate() || new Date(),
            applicationData: booking.applicationData || {}
        };
        
        res.json({
            success: true,
            booking: responseData
        });
        
    } catch (error) {
        console.error('예약 조회 오류:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다.'
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: '예약 정보 조회 중 오류가 발생했습니다.' 
        });
    }
});

// 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Firebase 서버가 포트 ${PORT}에서 실행 중입니다.`);
    if (process.env.NODE_ENV === 'production') {
        console.log(`Production mode - Port ${PORT}`);
    } else {
        console.log(`http://localhost:${PORT}`);
    }
    console.log('Firebase Firestore를 사용하여 데이터가 영구 저장됩니다.');
    console.log('이메일 인증 기능이 포함되어 있습니다.');
});