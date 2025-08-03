/**
 * Auth Check Console Test Suite
 * Run this in the browser console on any page that includes auth-check.js
 */

console.log('%c=== SidePick Auth Check Test Suite ===', 'color: #FF6B6B; font-size: 16px; font-weight: bold');

// Test results storage
const testResults = {
    passed: 0,
    failed: 0,
    errors: []
};

// Test helper functions
function test(name, fn) {
    try {
        console.log(`\n%cTesting: ${name}`, 'color: #4ECDC4; font-weight: bold');
        const result = fn();
        if (result === true) {
            console.log('%c✓ PASSED', 'color: green');
            testResults.passed++;
        } else {
            console.log('%c✗ FAILED', 'color: red');
            console.error(result);
            testResults.failed++;
            testResults.errors.push({ test: name, error: result });
        }
    } catch (error) {
        console.log('%c✗ ERROR', 'color: red');
        console.error(error);
        testResults.failed++;
        testResults.errors.push({ test: name, error: error.message });
    }
}

function assertEqual(actual, expected, message = '') {
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
        return true;
    }
    return `${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`;
}

// Override alert and location for testing
const originalAlert = window.alert;
const originalConfirm = window.confirm;
const originalLocation = window.location.href;
let lastAlert = '';
let lastRedirect = '';

window.alert = (msg) => { lastAlert = msg; };
window.confirm = () => true;
Object.defineProperty(window, 'location', {
    get: () => ({ href: lastRedirect }),
    set: (val) => { lastRedirect = val.href || val; }
});

// Run tests
console.log('\n%c1. Testing getUserState()', 'color: #FF6B6B; font-size: 14px');

test('Anonymous user state', () => {
    sessionStorage.clear();
    const state = AuthManager.getUserState();
    return assertEqual(state, { type: 'anonymous', isLoggedIn: false });
});

test('Authenticated user state', () => {
    sessionStorage.clear();
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userProfile', JSON.stringify({ name: '테스트', email: 'test@test.com' }));
    const state = AuthManager.getUserState();
    return state.type === 'authenticated' && 
           state.isLoggedIn === true && 
           state.profile.name === '테스트';
});

test('Verified user state', () => {
    sessionStorage.clear();
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('politicalType', 'MPOS');
    sessionStorage.setItem('userProfile', JSON.stringify({ name: '검증된' }));
    const state = AuthManager.getUserState();
    return state.type === 'verified' && 
           state.politicalType === 'MPOS' && 
           state.isLoggedIn === true;
});

test('Invalid JSON handling', () => {
    sessionStorage.clear();
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userProfile', 'invalid{json');
    const state = AuthManager.getUserState();
    return state.type === 'authenticated' && 
           typeof state.profile === 'object' && 
           Object.keys(state.profile).length === 0;
});

console.log('\n%c2. Testing checkPageAccess()', 'color: #FF6B6B; font-size: 14px');

test('Anonymous accessing authenticated page', () => {
    sessionStorage.clear();
    lastAlert = '';
    lastRedirect = '';
    const result = AuthManager.checkPageAccess('authenticated');
    return !result && 
           lastAlert === '로그인이 필요한 서비스입니다.' && 
           lastRedirect === 'login.html';
});

test('Anonymous accessing verified page', () => {
    sessionStorage.clear();
    lastAlert = '';
    lastRedirect = '';
    const result = AuthManager.checkPageAccess('verified');
    return !result && 
           lastAlert === '로그인이 필요한 서비스입니다.' && 
           lastRedirect === 'login.html';
});

test('Authenticated accessing verified page', () => {
    sessionStorage.clear();
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userProfile', JSON.stringify({ name: '테스트' }));
    lastAlert = '';
    lastRedirect = '';
    const result = AuthManager.checkPageAccess('verified');
    return !result && 
           lastAlert === '정치 성향 테스트를 먼저 완료해주세요.' && 
           lastRedirect === 'political-test.html?logged_in=true';
});

test('Verified user access all pages', () => {
    sessionStorage.clear();
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('politicalType', 'GCOS');
    sessionStorage.setItem('userProfile', JSON.stringify({ name: '검증된' }));
    const authAccess = AuthManager.checkPageAccess('authenticated');
    const verifiedAccess = AuthManager.checkPageAccess('verified');
    return authAccess === true && verifiedAccess === true;
});

console.log('\n%c3. Testing login() and logout()', 'color: #FF6B6B; font-size: 14px');

test('Login function', () => {
    sessionStorage.clear();
    const profile = { 
        name: '김철수', 
        email: 'kim@test.com', 
        gender: 'male',
        birthYear: 1990 
    };
    AuthManager.login('kim@test.com', profile);
    
    return sessionStorage.getItem('isLoggedIn') === 'true' &&
           sessionStorage.getItem('userEmail') === 'kim@test.com' &&
           sessionStorage.getItem('userGender') === 'male' &&
           JSON.parse(sessionStorage.getItem('userProfile')).name === '김철수';
});

test('Login with minimal profile', () => {
    sessionStorage.clear();
    AuthManager.login('minimal@test.com', { name: '최소' });
    
    return sessionStorage.getItem('isLoggedIn') === 'true' &&
           sessionStorage.getItem('userEmail') === 'minimal@test.com' &&
           sessionStorage.getItem('userGender') === null &&
           JSON.parse(sessionStorage.getItem('userProfile')).name === '최소';
});

test('Logout function', () => {
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userEmail', 'test@test.com');
    sessionStorage.setItem('politicalType', 'MPOS');
    lastRedirect = '';
    
    AuthManager.logout();
    
    return sessionStorage.length === 0 && lastRedirect === 'index.html';
});

console.log('\n%c4. Testing setTestComplete()', 'color: #FF6B6B; font-size: 14px');

test('Set test complete with full data', () => {
    sessionStorage.clear();
    const testData = {
        code: 'GPOS',
        title: '정부주도 진보개방 사회참여형',
        orientation: 'progressive'
    };
    
    const beforeTime = new Date().getTime();
    AuthManager.setTestComplete(testData);
    const afterTime = new Date().getTime();
    
    const savedType = sessionStorage.getItem('politicalType');
    const savedUserType = JSON.parse(sessionStorage.getItem('userType'));
    const savedTime = new Date(sessionStorage.getItem('testCompletedAt')).getTime();
    
    return savedType === 'GPOS' &&
           savedUserType.code === 'GPOS' &&
           savedUserType.title === '정부주도 진보개방 사회참여형' &&
           savedUserType.orientation === 'progressive' &&
           savedTime >= beforeTime &&
           savedTime <= afterTime;
});

test('Set test complete with minimal data', () => {
    sessionStorage.clear();
    AuthManager.setTestComplete({ code: 'TEST' });
    
    const savedType = sessionStorage.getItem('politicalType');
    const savedUserType = JSON.parse(sessionStorage.getItem('userType'));
    
    return savedType === 'TEST' &&
           savedUserType.code === 'TEST' &&
           savedUserType.title === undefined &&
           savedUserType.orientation === undefined;
});

console.log('\n%c5. Testing UI update functions', 'color: #FF6B6B; font-size: 14px');

test('UI functions handle missing elements', () => {
    // These should not throw errors even if elements don't exist
    try {
        AuthManager.updateHeader();
        AuthManager.updateIndexHeader();
        AuthManager.updateFixedCTA();
        AuthManager.updateCTAButtons();
        return true;
    } catch (error) {
        return `UI update threw error: ${error.message}`;
    }
});

// Restore original functions
window.alert = originalAlert;
window.confirm = originalConfirm;
Object.defineProperty(window, 'location', {
    value: { href: originalLocation },
    writable: true
});

// Show results
console.log('\n%c=== Test Results ===', 'color: #FF6B6B; font-size: 16px; font-weight: bold');
console.log(`%cPassed: ${testResults.passed}`, 'color: green; font-size: 14px');
console.log(`%cFailed: ${testResults.failed}`, 'color: red; font-size: 14px');

if (testResults.errors.length > 0) {
    console.log('\n%cFailed Tests:', 'color: red; font-weight: bold');
    testResults.errors.forEach(error => {
        console.log(`  - ${error.test}: ${error.error}`);
    });
}

console.log('\n%cTest Coverage Summary:', 'color: #4ECDC4; font-weight: bold');
console.log('✓ getUserState() - All user states and edge cases');
console.log('✓ checkPageAccess() - Access control and redirects');
console.log('✓ login() / logout() - Session management');
console.log('✓ setTestComplete() - Political test completion');
console.log('✓ UI update functions - Error handling');

// Return test results for automation
testResults;