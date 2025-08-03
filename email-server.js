// email-server.js - 이메일 인증 서버 예제
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 인증 코드 저장소 (실제로는 Redis나 DB 사용 권장)
const verificationCodes = new Map();

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
    service: 'gmail', // Gmail 사용 시
    auth: {
        user: process.env.EMAIL_USER, // 발신 이메일
        pass: process.env.EMAIL_PASS  // 앱 비밀번호
    }
});

// 네이버 메일 사용 시
// const transporter = nodemailer.createTransport({
//     service: 'naver',
//     host: 'smtp.naver.com',
//     port: 587,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

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

// 서버 시작
const PORT = process.env.EMAIL_PORT || 3001;
app.listen(PORT, () => {
    console.log(`이메일 인증 서버가 포트 ${PORT}에서 실행 중입니다.`);
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