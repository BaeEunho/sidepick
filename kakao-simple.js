// 간단한 카카오 로그인 구현 (SDK 없이)
const KAKAO_APP_KEY = '086f0d034b50fde43316d686a0bf74ea';

// 로컬 서버에서 실행 중인지 확인
const isLocalServer = window.location.protocol === 'http:' || window.location.protocol === 'https:';
const KAKAO_REDIRECT_URI = isLocalServer 
    ? window.location.origin + '/kakao-callback.html'
    : 'http://localhost:8000/kakao-callback.html';

// 카카오 로그인 함수
function kakaoLogin() {
    // 로컬 서버 실행 확인
    if (!isLocalServer) {
        alert('카카오 로그인을 사용하려면 웹 서버를 통해 접속해야 합니다.\n\nhttp://localhost:8000 으로 접속해주세요.');
        return;
    }
    
    // 이메일 권한 제거 (비즈니스 인증 필요)
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_APP_KEY}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;
    window.location.href = kakaoAuthUrl;
}

// 카카오 회원가입 (로그인과 동일)
function kakaoSignup() {
    kakaoLogin();
}