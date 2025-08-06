// 실제 작동하는 인증 시스템 (Firebase 연동)
const AuthSystem = {
    // 사용자 데이터베이스 키 (로컬 백업용)
    USERS_DB: 'sidepick_users',
    CURRENT_USER: 'sidepick_current_user',
    
    // API 엔드포인트
    API_URL: window.location.hostname === 'localhost' ? 'http://localhost:3000' : '',
    
    // 사용자 데이터베이스 가져오기
    getUsersDB: function() {
        const usersJSON = localStorage.getItem(this.USERS_DB);
        return usersJSON ? JSON.parse(usersJSON) : {};
    },
    
    // 사용자 데이터베이스 저장
    saveUsersDB: function(users) {
        localStorage.setItem(this.USERS_DB, JSON.stringify(users));
    },
    
    // 비밀번호 해싱 (간단한 해시 함수)
    hashPassword: function(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    },
    
    // 회원가입
    signup: async function(userData) {
        try {
            // Firebase 서버로 회원가입 요청
            const response = await fetch(`${this.API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Firebase 회원가입 성공
                const serverUser = result.data.user;
                
                // 로컬 백업용 사용자 정보 저장
                const hashedPassword = this.hashPassword(userData.password);
                const newUser = {
                    email: serverUser.email,
                    password: hashedPassword,
                    name: serverUser.name,
                    phone: serverUser.phone,
                    birthdate: serverUser.birthdate,
                    gender: serverUser.gender,
                    marketingAgree: serverUser.marketingAgree || false,
                    signupDate: new Date().toISOString(),
                    politicalType: null,
                    testCompletedAt: null
                };
                
                // 로컬 스토리지에 백업
                const users = this.getUsersDB();
                users[userData.email] = newUser;
                this.saveUsersDB(users);
                
                // 토큰 저장
                if (result.data.token) {
                    localStorage.setItem('authToken', result.data.token);
                }
                
                // 자동 로그인
                this.setCurrentUser(newUser);
                
                return result;
            } else {
                return result;
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            
            // 네트워크 오류 시 로컬에만 저장 (오프라인 모드)
            const users = this.getUsersDB();
            
            // 이메일 중복 체크
            if (users[userData.email]) {
                return {
                    success: false,
                    message: '이미 등록된 이메일입니다.'
                };
            }
            
            // 사용자 정보 저장
            const hashedPassword = this.hashPassword(userData.password);
            const newUser = {
                email: userData.email,
                password: hashedPassword,
                name: userData.name,
                phone: userData.phone,
                birthdate: userData.birthdate,
                gender: userData.gender,
                marketingAgree: userData.marketingAgree || false,
                signupDate: new Date().toISOString(),
                politicalType: null,
                testCompletedAt: null
            };
            
            users[userData.email] = newUser;
            this.saveUsersDB(users);
            
            // 자동 로그인
            this.setCurrentUser(newUser);
            
            return {
                success: true,
                data: {
                    user: {
                        email: newUser.email,
                        name: newUser.name,
                        phone: newUser.phone,
                        birthdate: newUser.birthdate,
                        gender: newUser.gender,
                        political_type: newUser.politicalType
                    },
                    token: 'local_' + Date.now()
                },
                offline: true
            };
        }
    },
    
    // 로그인
    login: async function(email, password) {
        try {
            // 먼저 Firebase 서버로 로그인 시도
            const response = await fetch(`${this.API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Firebase 로그인 성공
                const userData = result.data.user;
                
                // 로컬 사용자 정보 저장
                const localUser = {
                    email: userData.email,
                    password: this.hashPassword(password), // 로컬 백업용
                    name: userData.name,
                    phone: userData.phone,
                    birthdate: userData.birthdate,
                    gender: userData.gender,
                    marketingAgree: userData.marketingAgree,
                    politicalType: userData.political_type,
                    testCompletedAt: userData.test_completed_at,
                    signupDate: userData.created_at
                };
                
                // 로컬 스토리지에 백업
                const users = this.getUsersDB();
                users[email] = localUser;
                this.saveUsersDB(users);
                
                // 토큰 저장
                if (result.data.token) {
                    localStorage.setItem('authToken', result.data.token);
                }
                
                // 세션 설정
                this.setCurrentUser(localUser);
                
                return result;
            } else {
                // Firebase 로그인 실패
                return result;
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            
            // 네트워크 오류 시 로컬 로그인 시도
            const users = this.getUsersDB();
            const user = users[email];
            
            if (!user) {
                return {
                    success: false,
                    message: '이메일 또는 비밀번호가 일치하지 않습니다.'
                };
            }
            
            const hashedPassword = this.hashPassword(password);
            if (user.password !== hashedPassword) {
                return {
                    success: false,
                    message: '이메일 또는 비밀번호가 일치하지 않습니다.'
                };
            }
            
            // 로컬 로그인 성공
            this.setCurrentUser(user);
            
            return {
                success: true,
                data: {
                    user: {
                        email: user.email,
                        name: user.name,
                        phone: user.phone,
                        birthdate: user.birthdate,
                        gender: user.gender,
                        political_type: user.politicalType
                    },
                    token: 'local_' + Date.now()
                },
                offline: true
            };
        }
    },
    
    // 현재 사용자 설정
    setCurrentUser: function(user) {
        // 세션 스토리지에 로그인 정보 저장
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userProfile', JSON.stringify({
            name: user.name,
            email: user.email,
            phone: user.phone,
            birthdate: user.birthdate,
            gender: user.gender
        }));
        sessionStorage.setItem('userGender', user.gender);
        
        if (user.politicalType) {
            sessionStorage.setItem('politicalType', user.politicalType);
        }
        
        if (user.testCompletedAt) {
            sessionStorage.setItem('testCompletedAt', user.testCompletedAt);
        }
        
        // 로컬 스토리지에 현재 사용자 저장
        localStorage.setItem(this.CURRENT_USER, user.email);
    },
    
    // 로그아웃
    logout: function() {
        // 로그인 관련 정보만 삭제 (테스트 결과는 유지)
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('userProfile');
        sessionStorage.removeItem('userGender');
        sessionStorage.removeItem('appliedMeetings');
        localStorage.removeItem(this.CURRENT_USER);
        localStorage.removeItem('authToken');
    },
    
    // 현재 로그인한 사용자 가져오기
    getCurrentUser: function() {
        const email = sessionStorage.getItem('userEmail');
        if (!email) return null;
        
        const users = this.getUsersDB();
        return users[email] || null;
    },
    
    // 정치 성향 저장
    savePoliticalType: async function(politicalType, testResult) {
        try {
            const email = sessionStorage.getItem('userEmail');
            const authToken = localStorage.getItem('authToken');
            
            if (!email) {
                return {
                    success: false,
                    message: '로그인이 필요합니다.'
                };
            }
            
            // Firebase 서버로 정치 성향 저장
            if (authToken) {
                try {
                    const response = await fetch(`${this.API_URL}/api/user/political-type`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                            politicalType: politicalType,
                            testResult: testResult,
                            testCompletedAt: new Date().toISOString()
                        })
                    });
                    
                    if (response.ok) {
                        console.log('Firebase에 정치 성향 저장 성공');
                    }
                } catch (error) {
                    console.error('Firebase 저장 오류:', error);
                }
            }
            
            // 로컬 스토리지 업데이트 (백업용)
            const users = this.getUsersDB();
            const user = users[email];
            
            if (!user) {
                return {
                    success: false,
                    message: '사용자를 찾을 수 없습니다.'
                };
            }
            
            // 정치 성향 정보 업데이트
            user.politicalType = politicalType;
            user.testCompletedAt = new Date().toISOString();
            user.testResult = testResult;
            
            users[email] = user;
            this.saveUsersDB(users);
            
            // 세션 스토리지 업데이트
            sessionStorage.setItem('politicalType', politicalType);
            sessionStorage.setItem('testCompletedAt', user.testCompletedAt);
            
            return {
                success: true,
                message: '정치 성향이 저장되었습니다.'
            };
        } catch (error) {
            return {
                success: false,
                message: '저장 중 오류가 발생했습니다: ' + error.message
            };
        }
    },
    
    // 비밀번호 변경
    changePassword: async function(email, oldPassword, newPassword) {
        try {
            const users = this.getUsersDB();
            const user = users[email];
            
            if (!user) {
                return {
                    success: false,
                    message: '사용자를 찾을 수 없습니다.'
                };
            }
            
            const hashedOldPassword = this.hashPassword(oldPassword);
            if (user.password !== hashedOldPassword) {
                return {
                    success: false,
                    message: '현재 비밀번호가 일치하지 않습니다.'
                };
            }
            
            user.password = this.hashPassword(newPassword);
            users[email] = user;
            this.saveUsersDB(users);
            
            return {
                success: true,
                message: '비밀번호가 변경되었습니다.'
            };
        } catch (error) {
            return {
                success: false,
                message: '비밀번호 변경 중 오류가 발생했습니다: ' + error.message
            };
        }
    },
    
    // 계정 삭제
    deleteAccount: async function(email) {
        try {
            const users = this.getUsersDB();
            
            if (!users[email]) {
                return {
                    success: false,
                    message: '사용자를 찾을 수 없습니다.'
                };
            }
            
            delete users[email];
            this.saveUsersDB(users);
            
            // 로그아웃
            this.logout();
            
            return {
                success: true,
                message: '계정이 삭제되었습니다.'
            };
        } catch (error) {
            return {
                success: false,
                message: '계정 삭제 중 오류가 발생했습니다: ' + error.message
            };
        }
    },
    
    // 초기화 (디버그용)
    reset: function() {
        if (confirm('모든 사용자 데이터가 삭제됩니다. 계속하시겠습니까?')) {
            localStorage.removeItem(this.USERS_DB);
            localStorage.removeItem(this.CURRENT_USER);
            sessionStorage.clear();
            alert('초기화되었습니다.');
        }
    }
};

// 전역 객체로 노출
window.AuthSystem = AuthSystem;