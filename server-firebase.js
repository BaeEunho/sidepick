// Firebase 기반 서버
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const { admin, db, collections } = require('./firebase-config');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// JWT 비밀키
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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
        
        // 이메일 전송
        await transporter.sendMail(mailOptions);
        
        res.json({ 
            success: true, 
            message: '인증 코드가 발송되었습니다.' 
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

// 회원가입 API
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name, phone, birthdate, gender } = req.body;
    
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
            created_at: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await collections.users.doc(email).set(userData);
        
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
                    gender
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

// 로그인 API
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // 사용자 조회
        const userDoc = await collections.users.doc(email).get();
        console.log(userDoc)
        console.log(password)
        console.log(email)
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
        
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('토큰 디코드 성공:', decoded);
        
        const userDoc = await collections.users.doc(decoded.email).get();
        console.log('사용자 조회:', userDoc.exists ? `찾음 (${decoded.email})` : '못찾음');
        
        if (!userDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: '사용자를 찾을 수 없습니다.' 
            });
        }
        
        const user = userDoc.data();
        
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
            meetingLocation: meetingInfo?.location || '장소 미정',
            applicationData: applicationData
        };
        
        console.log('저장할 booking 객체:', JSON.stringify(booking, null, 2));
        
        await collections.bookings.doc(bookingId).set(booking);
        
        console.log('모임 신청 저장 완료!');
        
        res.json({
            success: true,
            message: '모임 신청이 완료되었습니다.',
            data: { bookingId }
        });
        
    } catch (error) {
        console.error('모임 신청 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '모임 신청 중 오류가 발생했습니다.' 
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
            users.push({ email: doc.id, ...doc.data() });
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
            const userBookings = allBookings.filter(booking => booking.userEmail === user.email);
            
            console.log(`${user.email}의 모임 신청:`, userBookings.length, '개');
            
            return {
                ...userWithoutPassword,
                joinedDate: user.created_at,
                meetings: userBookings.map(booking => ({
                    id: booking.meetingId,
                    title: booking.meetingTitle || '모임',
                    date: booking.meetingDate || '날짜 미정',
                    location: booking.meetingLocation || '장소 미정',
                    orientation: booking.orientation,
                    status: booking.status,
                    appliedAt: booking.appliedAt
                })),
                payments: userBookings
                    .filter(b => b.status === 'confirmed')
                    .map(b => ({ meetingId: b.meetingId, amount: 45000, status: 'paid' }))
            };
        });
        
        console.log('\n최종 usersList 생성 완료:', usersList.length, '명');
        
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
        
        // 사용자 확인
        const userDoc = await collections.users.doc(decoded.email).get();
        if (!userDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: '사용자를 찾을 수 없습니다.' 
            });
        }
        
        // 사용자 삭제
        await collections.users.doc(decoded.email).delete();
        
        // 해당 사용자의 모든 booking 삭제
        const bookingsSnapshot = await collections.bookings
            .where('userEmail', '==', decoded.email)
            .get();
        
        const batch = db.batch();
        bookingsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        res.json({
            success: true,
            message: '회원 탈퇴가 완료되었습니다.'
        });
        
    } catch (error) {
        console.error('회원 탈퇴 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '회원 탈퇴 중 오류가 발생했습니다.' 
        });
    }
});

// 정치 성향 저장 API
app.post('/api/auth/save-political-type', async (req, res) => {
    const { politicalType } = req.body;
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
        
        // 사용자 정보 업데이트
        await collections.users.doc(decoded.email).update({
            political_type: politicalType,
            test_completed_at: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({
            success: true,
            message: '정치 성향이 저장되었습니다.'
        });
        
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
            userBookings.push(doc.data());
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
        
        const userDoc = await collections.users.doc(decoded.email).get();
        if (!userDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: '사용자를 찾을 수 없습니다.' 
            });
        }
        
        // 해당 사용자의 모임 신청 정보 찾기
        const bookingsSnapshot = await collections.bookings
            .where('userEmail', '==', decoded.email)
            .get();
        
        const userBookings = [];
        bookingsSnapshot.forEach(doc => {
            userBookings.push(doc.data());
        });
        
        res.json({
            success: true,
            meetings: userBookings.map(booking => ({
                id: booking.meetingId,
                title: booking.meetingTitle || '모임',
                date: booking.meetingDate || '8월 23일 (토)',
                location: booking.meetingLocation || '강남역 파티룸',
                time: '15:00',
                orientation: booking.orientation,
                status: booking.status,
                appliedAt: booking.appliedAt
            }))
        });
        
    } catch (error) {
        console.error('모임 조회 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '모임 조회 중 오류가 발생했습니다.' 
        });
    }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Firebase 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`http://localhost:${PORT}`);
    console.log('Firebase Firestore를 사용합니다.');
    console.log('이메일 인증 기능이 포함되어 있습니다.');
});