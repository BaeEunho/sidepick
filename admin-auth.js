// Admin 인증 시스템
const AdminAuth = {
    // 관리자 이메일 (오직 이 계정만 admin 접근 가능)
    ADMIN_EMAIL: 'clsrna3@naver.com',
    
    // 관리자 세션 키
    ADMIN_SESSION_KEY: 'sidepick_admin_session',
    
    // 관리자 로그인
    login: async function(email, password) {
        // 관리자 이메일 확인
        if (email !== this.ADMIN_EMAIL) {
            return { success: false, message: '관리자 권한이 없습니다.' };
        }
        
        try {
            // 서버 API를 직접 호출하여 로그인
            const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
            console.log('API_URL:', API_URL);
            console.log('로그인 시도:', { email, password: password.substring(0, 3) + '***' });
            
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            console.log('응답 상태:', response.status);
            const result = await response.json();
            console.log('응답 결과:', result);
            
            if (!result.success) {
                return { success: false, message: result.message || '이메일 또는 비밀번호가 일치하지 않습니다.' };
            }
            
            // 로그인 성공 시 관리자 세션 생성
            const userData = result.data.user;
            const session = {
                email: email,
                name: userData.name,
                loginTime: new Date().toISOString(),
                expires: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2시간
                token: result.data.token
            };
            
            sessionStorage.setItem(this.ADMIN_SESSION_KEY, JSON.stringify(session));
            
            // 토큰 저장 (API 호출용)
            if (result.data.token) {
                localStorage.setItem('adminAuthToken', result.data.token);
            }
            
            return { success: true, message: '관리자 로그인 성공' };
        } catch (error) {
            console.error('관리자 로그인 오류:', error);
            return { success: false, message: '로그인 중 오류가 발생했습니다.' };
        }
    },
    
    // 관리자 로그아웃
    logout: function() {
        sessionStorage.removeItem(this.ADMIN_SESSION_KEY);
        localStorage.removeItem('adminAuthToken');
    },
    
    // 관리자 세션 확인
    isAuthenticated: function() {
        const sessionData = sessionStorage.getItem(this.ADMIN_SESSION_KEY);
        if (!sessionData) return false;
        
        try {
            const session = JSON.parse(sessionData);
            const expires = new Date(session.expires);
            
            // 세션 만료 확인
            if (new Date() > expires) {
                this.logout();
                return false;
            }
            
            return true;
        } catch (e) {
            return false;
        }
    },
    
    // 현재 관리자 정보
    getCurrentAdmin: function() {
        const sessionData = sessionStorage.getItem(this.ADMIN_SESSION_KEY);
        if (!sessionData) return null;
        
        try {
            return JSON.parse(sessionData);
        } catch (e) {
            return null;
        }
    },
    
    // 페이지 보호
    protectPage: function() {
        if (!this.isAuthenticated()) {
            window.location.href = 'admin-login.html';
        }
    }
};