// Kakao SDK 초기화
const KAKAO_APP_KEY = '086f0d034b50fde43316d686a0bf74ea';

// easyXDM 관련 오류 방지를 위한 전역 처리
if (typeof window !== 'undefined' && window.location.hash) {
    // xdm 관련 해시 제거
    if (window.location.hash.includes('xdm_') || window.location.hash.includes('xdm=')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
}

// SDK 로드 후 초기화 (지연 실행으로 easyXDM 에러 방지)
window.addEventListener('DOMContentLoaded', function() {
    // Kakao SDK 스크립트가 완전히 로드되었는지 확인
    function initializeKakaoSDK() {
        if (typeof Kakao !== 'undefined' && Kakao.init) {
            try {
                if (!Kakao.isInitialized()) {
                    Kakao.init(KAKAO_APP_KEY);
                    console.log('Kakao SDK initialized:', Kakao.isInitialized());
                }
            } catch (error) {
                console.error('Kakao SDK 초기화 에러:', error);
            }
        } else {
            console.error('Kakao SDK를 찾을 수 없습니다.');
        }
    }
    
    // 스크립트 로드 상태 확인 후 초기화
    if (document.readyState === 'complete') {
        setTimeout(initializeKakaoSDK, 100);
    } else {
        window.addEventListener('load', function() {
            setTimeout(initializeKakaoSDK, 100);
        });
    }
});

// 카카오 로그인
function kakaoLogin() {
    // Kakao SDK 로드 확인
    if (typeof Kakao === 'undefined' || !Kakao.isInitialized()) {
        console.error('Kakao SDK가 초기화되지 않았습니다.');
        // SDK 재초기화 시도
        if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
            try {
                Kakao.init(KAKAO_APP_KEY);
                console.log('Kakao SDK 재초기화 성공');
            } catch (e) {
                alert('카카오 로그인 준비 중입니다. 잠시 후 다시 시도해주세요.');
                return;
            }
        } else {
            alert('카카오 로그인 준비 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }
    }

    // 로그인 실행
    try {
        Kakao.Auth.login({
            throughTalk: false,  // PC 웹에서는 팝업 로그인 사용
            persistAccessToken: true,
            persistRefreshToken: true,
            success: function(authObj) {
            // 로그인 성공 시 사용자 정보 요청
            Kakao.API.request({
                url: '/v2/user/me',
                success: function(response) {
                    console.log('카카오 사용자 정보:', response);
                    
                    // 사용자 정보 추출
                    const kakaoAccount = response.kakao_account;
                    const profile = kakaoAccount.profile || {};
                    
                    const userProfile = {
                        name: profile.nickname || '카카오사용자',
                        email: kakaoAccount.email || '',
                        phone: kakaoAccount.phone_number || '',
                        birthdate: kakaoAccount.birthday ? `${kakaoAccount.birthyear}-${kakaoAccount.birthday.substring(0,2)}-${kakaoAccount.birthday.substring(2,4)}` : '',
                        gender: kakaoAccount.gender || ''
                    };
                    
                    // 세션에 저장
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
                    sessionStorage.setItem('userGender', userProfile.gender);
                    sessionStorage.setItem('loginType', 'kakao');
                    
                    // 추가 정보가 필요한지 확인
                    if (!userProfile.birthdate || !userProfile.gender || !userProfile.phone) {
                        // 추가 정보 입력이 필요한 경우
                        alert('카카오 로그인이 완료되었습니다.\n추가 정보를 입력해주세요.');
                        window.location.href = 'signup.html?kakao=true';
                    } else {
                        // 모든 정보가 있는 경우 바로 테스트 페이지로
                        alert('카카오 로그인이 완료되었습니다.\n정치 성향 테스트를 진행해주세요.');
                        window.location.href = 'political-test.html';
                    }
                },
                fail: function(error) {
                    console.error('사용자 정보 요청 실패:', error);
                    alert('사용자 정보를 가져오는데 실패했습니다.');
                }
            });
        },
        fail: function(err) {
            console.error('카카오 로그인 실패:', err);
            // KOE009 에러 체크
            if (err.error === 'KOE009') {
                alert('카카오 앱 설정 오류입니다.\nKakao Developers 콘솔에서 도메인 설정을 확인해주세요.');
            } else {
                alert('카카오 로그인에 실패했습니다.\n' + (err.error_description || ''));
            }
        }
        });
    } catch (error) {
        console.error('카카오 로그인 실행 중 에러:', error);
        alert('카카오 로그인 중 오류가 발생했습니다.');
    }
}

// 카카오 회원가입
function kakaoSignup() {
    // 회원가입도 로그인과 동일한 프로세스
    // easyXDM 해시 재확인
    if (window.location.hash && (window.location.hash.includes('xdm_') || window.location.hash.includes('xdm='))) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    kakaoLogin();
}

// 카카오 로그아웃
function kakaoLogout() {
    if (typeof Kakao === 'undefined' || !Kakao.Auth.getAccessToken()) {
        console.log('Already logged out from Kakao');
        return;
    }

    Kakao.Auth.logout(function() {
        console.log('카카오 로그아웃 완료');
    });
}

// 카카오 계정 연결 끊기
function kakaoUnlink() {
    if (typeof Kakao === 'undefined') {
        return;
    }

    Kakao.API.request({
        url: '/v1/user/unlink',
        success: function(response) {
            console.log('카카오 계정 연결 해제:', response);
        },
        fail: function(error) {
            console.error('카카오 계정 연결 해제 실패:', error);
        }
    });
}

// 페이지 로드 시 카카오 정보로 폼 채우기
function fillFormWithKakaoData() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('kakao') === 'true') {
        const userProfile = JSON.parse(sessionStorage.getItem('userProfile') || '{}');
        
        if (userProfile.name) {
            const nameInput = document.getElementById('name');
            if (nameInput) {
                nameInput.value = userProfile.name;
                nameInput.readOnly = true;
            }
        }
        
        if (userProfile.email) {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.value = userProfile.email;
                emailInput.readOnly = true;
            }
        }
        
        // 이메일 인증 버튼 숨기기
        const verifyBtn = document.querySelector('.verify-btn');
        if (verifyBtn) {
            verifyBtn.style.display = 'none';
        }
        
        // 비밀번호 필드 숨기기
        const passwordFields = document.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => {
            const formGroup = field.closest('.form-group');
            if (formGroup) {
                formGroup.style.display = 'none';
            }
        });
        
        // 제목 변경
        const subtitle = document.querySelector('.auth-subtitle');
        if (subtitle) {
            subtitle.textContent = '카카오 계정 연동이 완료되었습니다. 추가 정보를 입력해주세요.';
        }
    }
}

// DOM이 로드되면 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fillFormWithKakaoData);
} else {
    fillFormWithKakaoData();
}