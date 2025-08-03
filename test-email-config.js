const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('=== 이메일 설정 테스트 ===\n');

// 환경 변수 확인
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '설정됨 (숨김)' : '설정 안됨');

if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
    console.log('\n❌ EMAIL_USER가 설정되지 않았습니다.');
    console.log('📝 .env 파일에서 EMAIL_USER를 실제 Gmail 주소로 변경해주세요.');
    process.exit(1);
}

if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-password') {
    console.log('\n❌ EMAIL_PASS가 설정되지 않았습니다.');
    console.log('📝 Gmail 앱 비밀번호를 생성하여 .env 파일에 추가해주세요.');
    console.log('👉 https://myaccount.google.com/apppasswords');
    process.exit(1);
}

// 이메일 전송 테스트
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log('\n📧 테스트 이메일을 전송합니다...\n');

const testEmail = {
    from: `"사이드픽 테스트" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // 자기 자신에게 전송
    subject: '[테스트] 사이드픽 이메일 설정 확인',
    html: `
        <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4F46E5; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">사이드픽 이메일 테스트</h1>
            </div>
            
            <div style="padding: 40px 30px; background-color: #f9fafb;">
                <h2 style="color: #111827;">✅ 이메일 설정 성공!</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    축하합니다! 이메일 설정이 올바르게 구성되었습니다.<br>
                    이제 사이드픽에서 이메일 인증 기능을 사용할 수 있습니다.
                </p>
                
                <div style="background-color: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0; color: #6b7280;">
                        <strong>발신자:</strong> ${process.env.EMAIL_USER}<br>
                        <strong>시간:</strong> ${new Date().toLocaleString('ko-KR')}
                    </p>
                </div>
            </div>
        </div>
    `
};

transporter.sendMail(testEmail, (error, info) => {
    if (error) {
        console.log('❌ 이메일 전송 실패:', error.message);
        console.log('\n가능한 원인:');
        console.log('1. 앱 비밀번호가 올바르지 않음');
        console.log('2. 2단계 인증이 활성화되지 않음');
        console.log('3. 보안 수준이 낮은 앱 액세스가 차단됨');
    } else {
        console.log('✅ 이메일 전송 성공!');
        console.log(`📧 ${process.env.EMAIL_USER}로 테스트 이메일을 전송했습니다.`);
        console.log('\n이제 사이드픽에서 이메일 인증을 사용할 수 있습니다!');
    }
});