const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MySQL 연결 풀 생성
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sidepick',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

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

// 인증 코드 저장소 (실제로는 Redis나 DB 사용 권장)
const verificationCodes = new Map();

// 회원가입 API
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name, phone, birthdate, gender } = req.body;
    
    try {
        // 이메일 중복 체크
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: '이미 사용 중인 이메일입니다.' 
            });
        }
        
        // 비밀번호 해싱
        const passwordHash = await bcrypt.hash(password, 10);
        
        // 사용자 정보 저장
        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, name, phone, birthdate, gender) VALUES (?, ?, ?, ?, ?, ?)',
            [email, passwordHash, name, phone, birthdate, gender]
        );
        
        // JWT 토큰 생성
        const token = jwt.sign(
            { userId: result.insertId, email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            data: {
                token,
                user: {
                    id: result.insertId,
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
        const [users] = await pool.query(
            'SELECT id, email, password_hash, name, phone, birthdate, gender, political_type FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: '이메일 또는 비밀번호가 일치하지 않습니다.' 
            });
        }
        
        const user = users[0];
        
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
        delete user.password_hash;
        
        res.json({
            success: true,
            message: '로그인 성공',
            data: {
                token,
                user
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

// 정치 성향 테스트 결과 저장 API
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
        // JWT 토큰 검증
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 정치 성향 업데이트
        await pool.query(
            'UPDATE users SET political_type = ? WHERE id = ?',
            [politicalType, decoded.userId]
        );
        
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

// 사용자 정보 조회 API
app.get('/api/auth/me', async (req, res) => {
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
        const [users] = await pool.query(
            'SELECT id, email, name, phone, birthdate, gender, political_type, created_at FROM users WHERE id = ?',
            [decoded.userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '사용자를 찾을 수 없습니다.' 
            });
        }
        
        res.json({
            success: true,
            data: { user: users[0] }
        });
        
    } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '사용자 정보 조회 중 오류가 발생했습니다.' 
        });
    }
});

// 미팅 목록 조회 API
app.get('/api/meetings', async (req, res) => {
    try {
        const [meetings] = await pool.query(
            `SELECT id, title, meeting_date, location, orientation, max_participants, fee, status 
             FROM meetings 
             WHERE meeting_date > NOW() AND status = 'open'
             ORDER BY meeting_date ASC`
        );
        
        // 각 미팅의 참가자 수 조회
        for (let meeting of meetings) {
            const [counts] = await pool.query(
                `SELECT 
                    COUNT(CASE WHEN u.gender = 'male' THEN 1 END) as male_count,
                    COUNT(CASE WHEN u.gender = 'female' THEN 1 END) as female_count
                 FROM bookings b
                 JOIN users u ON b.user_id = u.id
                 JOIN orders o ON b.order_id = o.order_id
                 WHERE b.meeting_id = ? AND b.status = 'confirmed' AND o.status = 'paid'`,
                [meeting.id]
            );
            
            meeting.participants = counts[0];
        }
        
        res.json({
            success: true,
            data: { meetings }
        });
        
    } catch (error) {
        console.error('미팅 목록 조회 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '미팅 목록 조회 중 오류가 발생했습니다.' 
        });
    }
});

// 관리자 API - 전체 사용자 목록 조회
app.get('/api/admin/users', async (req, res) => {
    try {
        // 간단한 관리자 인증 (실제로는 더 안전한 방법 사용)
        const adminToken = req.headers.authorization?.replace('Bearer ', '');
        if (adminToken !== 'admin-secret-token') {
            return res.status(401).json({ 
                success: false, 
                message: '관리자 권한이 필요합니다.' 
            });
        }
        
        // 사용자 목록 조회
        const [users] = await pool.query(`
            SELECT 
                u.id,
                u.email,
                u.name,
                u.phone,
                u.birthdate,
                u.gender,
                u.political_type,
                u.created_at as joinedDate,
                COUNT(DISTINCT b.id) as meetingCount,
                COUNT(DISTINCT p.id) as paymentCount
            FROM users u
            LEFT JOIN bookings b ON u.id = b.user_id
            LEFT JOIN orders o ON u.id = o.user_id
            LEFT JOIN payments p ON o.order_id = p.order_id AND p.status = 'DONE'
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);
        
        // 각 사용자의 미팅 상세 정보 조회
        for (let user of users) {
            // 미팅 정보
            const [meetings] = await pool.query(`
                SELECT 
                    m.id,
                    m.title,
                    m.meeting_date,
                    m.orientation,
                    b.status,
                    o.status as order_status
                FROM bookings b
                JOIN meetings m ON b.meeting_id = m.id
                JOIN orders o ON b.order_id = o.order_id
                WHERE b.user_id = ?
                ORDER BY m.meeting_date
            `, [user.id]);
            
            user.meetings = meetings;
            
            // 결제 정보
            const [payments] = await pool.query(`
                SELECT 
                    p.payment_key,
                    p.amount,
                    p.status,
                    p.approved_at
                FROM payments p
                JOIN orders o ON p.order_id = o.order_id
                WHERE o.user_id = ?
                ORDER BY p.created_at DESC
            `, [user.id]);
            
            user.payments = payments;
            
            // 정치 성향 정보 추가
            if (user.political_type) {
                user.politicalInfo = getPoliticalTypeInfo(user.political_type);
            }
        }
        
        res.json({
            success: true,
            data: { users }
        });
        
    } catch (error) {
        console.error('사용자 목록 조회 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '사용자 목록 조회 중 오류가 발생했습니다.' 
        });
    }
});

// 정치 성향 정보 헬퍼 함수
function getPoliticalTypeInfo(code) {
    const typeMap = {
        // 진보 성향
        'MPOS': { title: '시장 다원주의자', orientation: 'progressive' },
        'MPON': { title: '시장 자유주의자', orientation: 'progressive' },
        'MPTS': { title: '시장 유목민', orientation: 'progressive' },
        'MPTN': { title: '시장 무정부주의자', orientation: 'progressive' },
        'GPOS': { title: '사회 다원주의자', orientation: 'progressive' },
        'GPON': { title: '복지 자유주의자', orientation: 'progressive' },
        'GPTS': { title: '온정적 개혁주의자', orientation: 'progressive' },
        'GPTN': { title: '계몽적 엘리트주의자', orientation: 'progressive' },
        // 보수 성향
        'MCOS': { title: '시장 공동체주의자', orientation: 'conservative' },
        'MCON': { title: '기업가적 보수주의자', orientation: 'conservative' },
        'MCTS': { title: '실용적 전통주의자', orientation: 'conservative' },
        'MCTN': { title: '자유 보수주의자', orientation: 'conservative' },
        'GCOS': { title: '공동체 중심주의자', orientation: 'conservative' },
        'GCON': { title: '국가 보수주의자', orientation: 'conservative' },
        'GCTS': { title: '온정적 보수주의자', orientation: 'conservative' },
        'GCTN': { title: '권위주의적 보수주의자', orientation: 'conservative' }
    };
    
    return typeMap[code] || { title: '알 수 없음', orientation: 'unknown' };
}

// 이메일 인증 코드 발송 API
app.post('/api/email/send-verification', async (req, res) => {
    const { email } = req.body;
    
    try {
        // 6자리 인증 코드 생성
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 인증 코드 저장 (5분 유효)
        verificationCodes.set(email, {
            code: verificationCode,
            createdAt: Date.now(),
            expiresAt: Date.now() + 5 * 60 * 1000 // 5분
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
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        
                        <p style="color: #9ca3af; font-size: 14px; line-height: 1.5;">
                            본 메일은 사이드픽 회원가입을 위한 인증 메일입니다.<br>
                            본인이 요청하지 않은 경우, 이 메일을 무시하셔도 됩니다.
                        </p>
                    </div>
                    
                    <div style="background-color: #1f2937; padding: 20px; text-align: center;">
                        <p style="color: #9ca3af; margin: 0; font-size: 14px;">
                            © 2024 사이드픽. All rights reserved.
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
        const savedData = verificationCodes.get(email);
        
        if (!savedData) {
            return res.status(400).json({ 
                success: false, 
                message: '인증 코드가 존재하지 않습니다.' 
            });
        }
        
        // 유효 시간 확인
        if (Date.now() > savedData.expiresAt) {
            verificationCodes.delete(email);
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
        verificationCodes.delete(email);
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

// 주기적으로 만료된 인증 코드 정리 (10분마다)
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of verificationCodes.entries()) {
        if (now > data.expiresAt) {
            verificationCodes.delete(email);
        }
    }
}, 10 * 60 * 1000);

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`http://localhost:${PORT}`);
    console.log('이메일 인증 기능이 통합되었습니다.');
});