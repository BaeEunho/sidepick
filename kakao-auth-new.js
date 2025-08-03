// Kakao SDK 초기화 - easyXDM 에러 방지 버전
const KAKAO_APP_KEY = '086f0d034b50fde43316d686a0bf74ea';

// easyXDM 에러 방지를 위한 전처리
(function() {
    // easyXDM이 사용하는 window.location 속성들을 보호
    const originalLocation = window.location;
    const safeLocation = {
        href: originalLocation.href,
        protocol: originalLocation.protocol,
        host: originalLocation.host,
        hostname: originalLocation.hostname,
        port: originalLocation.port,
        pathname: originalLocation.pathname,
        search: originalLocation.search,
        hash: originalLocation.hash ? originalLocation.hash.replace(/[#&]xdm_[^&]+/g, '') : ''
    };
    
    // easyXDM이 location을 파싱할 때 에러가 나지 않도록 처리
    Object.defineProperty(window, 'location', {
        get: function() {
            // hash에서 xdm 관련 파라미터 제거
            if (originalLocation.hash && originalLocation.hash.includes('xdm')) {
                return safeLocation;
            }
            return originalLocation;
        },
        configurable: true
    });
})();

// Kakao SDK 초기화 함수
function initKakaoSDK() {
    if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
        try {
            Kakao.init(KAKAO_APP_KEY);
            console.log('Kakao SDK 초기화 완료');
            
            // location 속성 원복
            delete window.location;
        } catch (error) {
            console.error('Kakao SDK 초기화 에러:', error);
        }
    }
}

// 페이지 로드 완료 후 SDK 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initKakaoSDK, 100);
    });
} else {
    setTimeout(initKakaoSDK, 100);
}

// 카카오 로그인 (간소화된 버전)
function kakaoLoginDirect() {
    // SDK 체크
    if (typeof Kakao === 'undefined' || !Kakao.isInitialized()) {
        if (typeof Kakao !== 'undefined') {
            initKakaoSDK();
        } else {
            alert('카카오 로그인 준비 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }
    }
    
    // 직접 OAuth 인증 URL로 리다이렉트 (easyXDM 우회)
    const redirectUri = encodeURIComponent(window.location.origin + '/signup.html');
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_APP_KEY}&redirect_uri=${redirectUri}&response_type=code&scope=profile_nickname,account_email`;
    
    // 팝업으로 열기
    const width = 480;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
        kakaoAuthUrl,
        'kakaoLogin',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
    
    // 팝업 체크
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
    }
}

// 기존 kakaoLogin과 kakaoSignup 함수 대체
function kakaoLogin() {
    kakaoLoginDirect();
}

function kakaoSignup() {
    kakaoLoginDirect();
}

// OAuth 콜백 처리
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        // 인증 코드가 있으면 처리
        console.log('카카오 인증 코드 받음:', code);
        // 여기서 백엔드로 코드를 보내서 액세스 토큰을 받아야 함
        // 현재는 데모이므로 간단히 처리
        alert('카카오 로그인이 완료되었습니다.');
        
        // URL에서 code 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // 로그인 성공 처리
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('loginType', 'kakao');
        
        // 테스트 페이지로 이동
        setTimeout(() => {
            window.location.href = 'political-test.html';
        }, 1000);
    }
});