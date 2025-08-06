// API 클라이언트 설정
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://sidepick.onrender.com/api';

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
        }
        
        return data;
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
}

// 회원가입 API
async function signup(userData) {
    // 실제 로컬 인증 시스템 사용
    if (window.AuthSystem) {
        return await window.AuthSystem.signup(userData);
    }
    
    // 폴백: 기존 API 호출
    return await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

// 로그인 API
async function login(email, password) {
    // 실제 로컬 인증 시스템 사용
    if (window.AuthSystem) {
        return await window.AuthSystem.login(email, password);
    }
    
    // 폴백: 기존 API 호출
    return await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

// 정치 성향 저장 API
async function savePoliticalType(politicalType, testResult) {
    // 실제 로컬 인증 시스템 사용
    if (window.AuthSystem) {
        return await window.AuthSystem.savePoliticalType(politicalType, testResult);
    }
    
    // 폴백: 기존 API 호출
    return await apiCall('/auth/save-political-type', {
        method: 'POST',
        body: JSON.stringify({ politicalType })
    });
}

// 사용자 정보 조회 API
async function getUserInfo() {
    return await apiCall('/auth/me');
}

// 미팅 목록 조회 API
async function getMeetings() {
    return await apiCall('/meetings');
}

// 로컬 스토리지와 세션 스토리지 동기화
function syncAuthData(userData, token) {
    // 토큰은 로컬 스토리지에 저장 (지속성)
    if (token) {
        localStorage.setItem('authToken', token);
    }
    
    // 사용자 정보는 세션 스토리지에 저장 (기존 코드 호환성)
    if (userData) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', userData.email);
        sessionStorage.setItem('userProfile', JSON.stringify({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            birthdate: userData.birthdate,
            gender: userData.gender
        }));
        sessionStorage.setItem('userGender', userData.gender);
        
        if (userData.political_type) {
            sessionStorage.setItem('politicalType', userData.political_type);
        }
    }
}

// 로그아웃
function logoutUser() {
    // 로컬 스토리지 토큰 제거
    localStorage.removeItem('authToken');
    
    // 세션 스토리지 초기화
    sessionStorage.clear();
    
    // 메인 페이지로 이동
    window.location.href = 'index.html';
}