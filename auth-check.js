// 전역 AuthManager 객체
window.AuthManager = {
    // 사용자 상태 확인
    getUserState: function() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const politicalType = sessionStorage.getItem('politicalType');
        
        let userProfile = {};
        try {
            userProfile = JSON.parse(sessionStorage.getItem('userProfile') || '{}');
        } catch (error) {
            console.error('Failed to parse userProfile:', error);
            userProfile = {};
        }
        
        if (!isLoggedIn) {
            return { 
                type: 'anonymous',
                isLoggedIn: false
            };
        } else if (!politicalType) {
            return { 
                type: 'authenticated', 
                profile: userProfile,
                isLoggedIn: true
            };
        } else {
            return { 
                type: 'verified', 
                politicalType: politicalType,
                profile: userProfile,
                isLoggedIn: true
            };
        }
    },

    // 페이지 접근 권한 체크
    checkPageAccess: function(requiredState) {
        const userState = this.getUserState();
        
        if (requiredState === 'authenticated' && userState.type === 'anonymous') {
            alert('로그인이 필요한 서비스입니다.');
            window.location.href = 'login.html';
            return false;
        }
        
        if (requiredState === 'verified' && userState.type !== 'verified') {
            if (userState.type === 'anonymous') {
                alert('로그인이 필요한 서비스입니다.');
                window.location.href = 'login.html';
            } else {
                alert('정치 성향 테스트를 먼저 완료해주세요.');
                window.location.href = 'political-test.html?logged_in=true';
            }
            return false;
        }
        
        return true;
    },

    // 헤더 업데이트 (일반 페이지용)
    updateHeader: function() {
        const userState = this.getUserState();
        const navCta = document.querySelector('.nav-cta');
        
        if (!navCta) return;
        
        if (userState.type === 'anonymous') {
            navCta.innerHTML = '<a href="political-test.html" class="nav-btn">성향 테스트 받기</a>';
        } else if (userState.type === 'authenticated') {
            navCta.innerHTML = `
                <span class="user-name">${userState.profile.name}님</span>
                <a href="political-test.html?logged_in=true" class="nav-btn">성향 테스트 받기</a>
                <button onclick="logout()" class="btn-logout-simple">로그아웃</button>
            `;
        } else {
            navCta.innerHTML = `
                <span class="user-name">${userState.profile.name}님</span>
                <a href="mypage.html" class="nav-btn">마이페이지</a>
                <button onclick="logout()" class="btn-logout-simple">로그아웃</button>
            `;
        }
    },

    // index.html 전용 헤더 업데이트
    updateIndexHeader: function() {
        const userState = this.getUserState();
        const authButtons = document.querySelector('.auth-buttons');
        
        if (!authButtons) return;
        
        if (userState.type === 'anonymous') {
            authButtons.innerHTML = `
                <a href="login.html" class="btn-login">로그인</a>
                <a href="signup.html" class="btn-signup">회원가입</a>
            `;
        } else if (userState.type === 'authenticated') {
            authButtons.innerHTML = `
                <span class="user-welcome">안녕하세요, ${userState.profile.name}님</span>
                <a href="mypage.html" class="btn-mypage">마이페이지</a>
                <button onclick="logout()" class="btn-logout-simple">로그아웃</button>
            `;
        } else {
            // verified 상태
            authButtons.innerHTML = `
                <span class="user-welcome">${userState.profile.name}님</span>
                <a href="mypage.html" class="btn-mypage">마이페이지</a>
                <button onclick="logout()" class="btn-logout-simple">로그아웃</button>
            `;
        }
        
        // 모바일 메뉴 업데이트
        this.updateMobileMenu(userState);
    },
    
    // 모바일 메뉴 업데이트
    updateMobileMenu: function(userState) {
        const mobileMenuAuth = document.getElementById('mobileMenuAuth');
        if (!mobileMenuAuth) return;
        
        if (userState.type === 'anonymous') {
            mobileMenuAuth.innerHTML = `
                <a href="login.html" class="mobile-login-btn">로그인</a>
                <a href="signup.html" class="mobile-signup-btn">회원가입</a>
            `;
        } else if (userState.type === 'authenticated') {
            mobileMenuAuth.innerHTML = `
                <div class="mobile-user-info">
                    <span>${userState.profile.name}님</span>
                    <a href="political-test.html?logged_in=true" class="mobile-test-btn">성향 테스트 받기</a>
                </div>
                <button onclick="logout()" class="mobile-logout-btn">로그아웃</button>
            `;
        } else {
            mobileMenuAuth.innerHTML = `
                <div class="mobile-user-info">
                    <span>${userState.profile.name}님</span>
                    <a href="mypage.html" class="mobile-mypage-btn">마이페이지</a>
                </div>
                <button onclick="logout()" class="mobile-logout-btn">로그아웃</button>
            `;
        }
    },

    // CTA 버튼 업데이트 (일반 페이지용)
    updateCTAButtons: function() {
        const userState = this.getUserState();
        const ctaButtons = document.querySelectorAll('.cta-main, .nav-btn');
        
        ctaButtons.forEach(button => {
            if (button.textContent.includes('테스트')) {
                if (userState.type === 'authenticated') {
                    button.href = 'political-test.html?logged_in=true';
                } else if (userState.type === 'verified') {
                    button.textContent = '소개팅 일정 보기';
                    button.href = 'meeting-schedule.html';
                }
            }
        });
    },

    // index.html 전용 고정 CTA 업데이트
    updateFixedCTA: function() {
        const userState = this.getUserState();
        const fixedCta = document.getElementById('fixedCta');
        
        if (!fixedCta) return;
        
        if (userState.type === 'anonymous') {
            fixedCta.innerHTML = '<a href="political-test.html" class="cta-main">내 정치 성향 알아보기</a>';
        } else if (userState.type === 'authenticated') {
            fixedCta.innerHTML = '<a href="political-test.html?logged_in=true" class="cta-main">내 정치 성향 알아보기</a>';
        } else {
            fixedCta.innerHTML = '<a href="meeting-schedule.html" class="cta-main">소개팅 일정 보기</a>';
        }
    },

    // 로그인
    login: function(email, profile) {
        // 로그인 상태 저장
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', email);
        
        // 프로필 정보 저장
        sessionStorage.setItem('userProfile', JSON.stringify(profile));
        
        // 성별 정보 별도 저장 (호환성)
        if (profile.gender) {
            sessionStorage.setItem('userGender', profile.gender);
        }
        
        // 나이 계산 및 저장
        if (profile.birthdate) {
            const birthDate = new Date(profile.birthdate);
            const today = new Date();
            // 한국식 나이 계산
            const age = today.getFullYear() - birthDate.getFullYear() + 1;
            sessionStorage.setItem('userAge', age.toString());
        }
    },

    // 로그아웃
    logout: function() {
        if (confirm('로그아웃 하시겠습니까?')) {
            // 로그인 관련 정보만 삭제 (테스트 결과는 유지)
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userEmail');
            sessionStorage.removeItem('userProfile');
            sessionStorage.removeItem('userGender');
            sessionStorage.removeItem('userAge');
            sessionStorage.removeItem('appliedMeetings');
            
            // 로컬 스토리지의 토큰과 자동 로그인 정보도 삭제
            localStorage.removeItem('authToken');
            localStorage.removeItem('rememberMe');
            
            // 정치 성향 테스트 결과는 유지
            // politicalType, userType, testResultDetail, axisScores, userAnswers, testCompletedAt 등은 삭제하지 않음
            
            // 메인 페이지로 이동
            window.location.href = 'index.html';
        }
    },

    // 정치 성향 테스트 완료 처리
    setTestComplete: function(typeData) {
        // 정치 성향 코드 저장
        sessionStorage.setItem('politicalType', typeData.code);
        
        // 사용자 타입 정보 저장
        sessionStorage.setItem('userType', JSON.stringify({
            code: typeData.code,
            title: typeData.title,
            orientation: typeData.orientation
        }));
        
        // 테스트 완료 시간 저장
        sessionStorage.setItem('testCompletedAt', new Date().toISOString());
    }
};

// 전역으로 로그아웃 함수 노출
window.logout = AuthManager.logout;

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', () => {
    // 자동 로그인 체크
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe && !sessionStorage.getItem('isLoggedIn')) {
        try {
            const rememberData = JSON.parse(rememberMe);
            
            // 만료 시간 확인
            if (rememberData.expiry && new Date().getTime() < rememberData.expiry) {
                // 세션 복원
                if (window.syncAuthData) {
                    syncAuthData({
                        email: rememberData.email,
                        name: rememberData.name,
                        token: rememberData.token
                    }, rememberData.token);
                }
                
                // AuthManager로 로그인 처리
                AuthManager.login(rememberData.email, {
                    name: rememberData.name,
                    email: rememberData.email,
                    birthdate: rememberData.birthdate,
                    gender: rememberData.gender
                });
                
                console.log('자동 로그인 성공');
            } else {
                // 만료된 데이터 삭제
                localStorage.removeItem('rememberMe');
                console.log('자동 로그인 데이터 만료됨');
            }
        } catch (error) {
            console.error('자동 로그인 실패:', error);
            localStorage.removeItem('rememberMe');
        }
    }
    
    // index.html인 경우 특별 처리
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === '') {
        AuthManager.updateIndexHeader();
        AuthManager.updateFixedCTA();
    } else {
        AuthManager.updateHeader();
        AuthManager.updateCTAButtons();
    }
});