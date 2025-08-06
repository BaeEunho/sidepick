// 사이드픽 설정 파일
// 배포 환경에 맞게 이 파일을 수정하세요

window.APP_CONFIG = {
    // API 서버 URL
    // 로컬 개발: 'http://localhost:3000'
    // 같은 도메인 배포: ''
    // 다른 도메인 배포: 'https://api.sidepick.co.kr' 또는 'https://sidepick-api.herokuapp.com'
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : 'https://your-backend-url.com', // 여기에 실제 백엔드 URL 입력
    
    // 디버그 모드
    DEBUG: window.location.hostname === 'localhost',
    
    // 기타 설정
    SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7일
    REFRESH_INTERVAL: 5000, // 5초
};

// API URL 헬퍼 함수
window.getApiUrl = function(endpoint) {
    const baseUrl = window.APP_CONFIG.API_URL;
    // 슬래시 중복 방지
    if (baseUrl.endsWith('/') && endpoint.startsWith('/')) {
        return baseUrl + endpoint.substring(1);
    }
    return baseUrl + endpoint;
};

// 디버그 로그 헬퍼
window.debugLog = function(...args) {
    if (window.APP_CONFIG.DEBUG) {
        console.log('[SidePick]', ...args);
    }
};