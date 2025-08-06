// 전역 변수
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const itemsPerPage = 10;
let refreshInterval;
let currentSort = { field: 'joinedDate', order: 'desc' };

// 페이지 로드 시 데이터 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 관리자 인증 확인
    if (window.AdminAuth) {
        window.AdminAuth.protectPage();
    }
    
    // 초기 로드
    refreshData();
    
    // 자동 새로고침 설정 (기본적으로 OFF)
    setupAutoRefresh();
    
    // 페이지 이탈 시 인터벌 정리
    window.addEventListener('beforeunload', () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    });
});

// 관리자 로그아웃
function logoutAdmin() {
    if (window.AdminAuth) {
        window.AdminAuth.logout();
        window.location.href = 'admin-login.html';
    }
}

// 데이터 로드
async function loadData() {
    try {
        // 항상 서버에서 먼저 시도
        await loadFromServer();
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        // 서버 연결 실패 시에만 로컬 스토리지 사용
        loadFromLocalStorage();
    }
    
    // 초기 정렬 적용
    sortTable(currentSort.field);
    
    updateStats();
}

// 서버에서 데이터 로드
async function loadFromServer() {
    console.log('=== 관리자 페이지: 서버에서 데이터 로드 중 ===');
    try {
        const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
        const response = await fetch(`${API_URL}/api/admin/users`);
        console.log('서버 응답 상태:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('서버 응답 데이터:', data);
            
            allUsers = data.data.users || [];
            console.log('받은 사용자 수:', allUsers.length);
            
            // 각 사용자의 모임 정보 로그
            allUsers.forEach(user => {
                console.log(`\n사용자: ${user.email}`);
                console.log('- 모임 수:', user.meetings ? user.meetings.length : 0);
                if (user.meetings && user.meetings.length > 0) {
                    user.meetings.forEach(meeting => {
                        console.log(`  - ${meeting.title} (${meeting.status})`);
                    });
                }
            });
            
            // 각 사용자의 정치 성향 정보 추가
            allUsers = allUsers.map(user => {
                if (user.political_type) {
                    user.politicalInfo = getPoliticalTypeInfo(user.political_type);
                }
                return user;
            });
            
            filteredUsers = [...allUsers];
            console.log('데이터 로드 완료!');
        } else {
            throw new Error('서버 응답 오류');
        }
    } catch (error) {
        console.error('서버 데이터 로드 실패:', error);
        throw error;
    }
}

// localStorage에서 데이터 로드 (데모 모드)
function loadFromLocalStorage() {
    const users = [];
    
    // 현재 세션의 사용자가 있으면 추가
    const currentUser = getCurrentSessionUser();
    if (currentUser) {
        users.push(currentUser);
    }
    
    allUsers = users;
    filteredUsers = [...allUsers];
}

// 현재 세션의 사용자 정보 가져오기
function getCurrentSessionUser() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') return null;
    
    const userProfile = JSON.parse(sessionStorage.getItem('userProfile') || '{}');
    const userEmail = sessionStorage.getItem('userEmail');
    const politicalType = sessionStorage.getItem('politicalType');
    const appliedMeetings = JSON.parse(sessionStorage.getItem('appliedMeetings') || '{}');
    
    if (!userEmail) return null;
    
    const userData = {
        email: userEmail,
        name: userProfile.name || '이름 없음',
        phone: userProfile.phone || '전화번호 없음',
        gender: userProfile.gender || sessionStorage.getItem('userGender') || 'unknown',
        birthdate: userProfile.birthdate || '1990-01-01',
        joinedDate: new Date().toISOString(),
        politicalType: politicalType,
        meetings: [],
        payments: []
    };
    
    // 정치 성향 정보 추가
    if (politicalType) {
        userData.politicalInfo = getPoliticalTypeInfo(politicalType);
    }
    
    // 모임 신청 정보 추가
    Object.entries(appliedMeetings).forEach(([orientation, meetingData]) => {
        // meetingData가 객체인 경우 (새로운 형식)
        if (typeof meetingData === 'object' && meetingData.meetingId) {
            userData.meetings.push({
                id: meetingData.meetingId,
                title: meetingData.title || `${orientation === 'progressive' ? '진보' : '보수'} 모임`,
                date: meetingData.date || '미정',
                location: meetingData.location || '장소 미정',
                orientation: orientation,
                status: meetingData.status || 'pending'
            });
            
            if (meetingData.status === 'confirmed') {
                userData.payments.push({
                    meetingId: meetingData.meetingId,
                    amount: 45000,
                    status: 'paid'
                });
            }
        }
    });
    
    return userData;
}

// 정치 성향 정보 가져오기
function getPoliticalTypeInfo(code) {
    const typeMap = {
        // 진보 성향
        'MPOS': { title: '시장 다원주의자', orientation: 'progressive' },
        'MPON': { title: '테크노 자유주의자', orientation: 'progressive' },
        'MPTS': { title: '참여 자유주의자', orientation: 'progressive' },
        'MPTN': { title: '엘리트 자유주의자', orientation: 'progressive' },
        'GPOS': { title: '참여 사회민주주의자', orientation: 'progressive' },
        'GPON': { title: '전문가 사회민주주의자', orientation: 'progressive' },
        'GPTS': { title: '민중 진보주의자', orientation: 'progressive' },
        'GPTN': { title: '계획 진보주의자', orientation: 'progressive' },
        // 보수 성향
        'MCOS': { title: '문화 보수주의자', orientation: 'conservative' },
        'MCON': { title: '온건 보수주의자', orientation: 'conservative' },
        'MCTS': { title: '풀뿌리 보수주의자', orientation: 'conservative' },
        'MCTN': { title: '전통 보수주의자', orientation: 'conservative' },
        'GCOS': { title: '온건 국가주의자', orientation: 'conservative' },
        'GCON': { title: '권위 보수주의자', orientation: 'conservative' },
        'GCTS': { title: '민족 보수주의자', orientation: 'conservative' },
        'GCTN': { title: '위계 보수주의자', orientation: 'conservative' }
    };
    
    return typeMap[code] || { title: '분류 없음', orientation: 'unknown' };
}

// 통계 업데이트
function updateStats() {
    const totalUsers = allUsers.length;
    const testCompleted = allUsers.filter(u => u.political_type || u.politicalType).length;
    const meetingApplied = allUsers.filter(u => u.meetings && u.meetings.length > 0).length;
    const paymentCompleted = allUsers.filter(u => u.payments && u.payments.length > 0).length;
    
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('test-completed').textContent = testCompleted;
    document.getElementById('meeting-applied').textContent = meetingApplied;
    document.getElementById('payment-completed').textContent = paymentCompleted;
}

// 사용자 목록 표시
function displayUsers() {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    
    // 페이지네이션 계산
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageUsers = filteredUsers.slice(startIndex, endIndex);
    
    // 사용자 행 추가
    pageUsers.forEach(user => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });
    
    // 페이지네이션 업데이트
    updatePagination();
}

// 사용자 행 생성
function createUserRow(user) {
    const row = document.createElement('tr');
    
    // 나이 계산 (birthdate가 없는 경우 처리)
    const age = user.birthdate ? 
        new Date().getFullYear() - new Date(user.birthdate).getFullYear() : '-';
    
    // 성별 표시
    const genderText = user.gender === 'male' || user.gender === 'M' ? '남' : 
                      user.gender === 'female' || user.gender === 'F' ? '여' : '-';
    
    // 정치 성향 표시
    const politicalText = user.politicalInfo ? 
        `<span class="badge badge-${user.politicalInfo.orientation}">${user.politicalInfo.title}</span>` : 
        '<span class="badge badge-none">미분류</span>';
    
    // 모임 신청 현황
    const meetingCount = user.meetings ? user.meetings.length : 0;
    const meetingText = meetingCount > 0 ? `${meetingCount}건` : '-';
    
    // 마케팅 수신 동의 표시
    const marketingText = user.marketingAgree ? 
        '<span style="color: #10b981;">동의</span>' : 
        '<span style="color: #ef4444;">미동의</span>';
    
    // 결제 현황 (드롭다운으로 변경 가능)
    let paymentStatusHtml = '-';
    if (meetingCount > 0) {
        // 최신 모임의 상태를 가져옴
        const latestMeeting = user.meetings[0];
        const currentStatus = latestMeeting.status || 'pending';
        
        paymentStatusHtml = `
            <select class="payment-status-select" onchange="updatePaymentStatus('${user.email}', this.value)" data-current="${currentStatus}">
                <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>입금대기</option>
                <option value="paid" ${currentStatus === 'paid' || currentStatus === 'confirmed' ? 'selected' : ''}>결제완료</option>
                <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>취소</option>
            </select>
        `;
    }
    
    // Firebase Timestamp 처리
    let joinedDateStr = '-';
    if (user.joinedDate) {
        if (user.joinedDate._seconds) {
            // Firebase Timestamp 객체인 경우
            joinedDateStr = new Date(user.joinedDate._seconds * 1000).toLocaleDateString();
        } else if (typeof user.joinedDate === 'string') {
            // ISO 문자열인 경우
            joinedDateStr = new Date(user.joinedDate).toLocaleDateString();
        } else {
            // Date 객체인 경우
            joinedDateStr = new Date(user.joinedDate).toLocaleDateString();
        }
    }
    
    row.innerHTML = `
        <td>${joinedDateStr}</td>
        <td>${user.name || '정보 없음'}</td>
        <td>${user.email}</td>
        <td>${user.phone || '정보 없음'}</td>
        <td>${genderText}</td>
        <td>${age === '-' ? '-' : age + '세'}</td>
        <td>${politicalText}</td>
        <td>${marketingText}</td>
        <td>${meetingText}</td>
        <td>${paymentStatusHtml}</td>
        <td><button class="btn-detail" onclick="showUserDetail('${user.email}')">상세</button></td>
    `;
    
    return row;
}

// 페이지네이션 업데이트
function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    // 이전 버튼
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '이전';
        prevBtn.onclick = () => changePage(currentPage - 1);
        pagination.appendChild(prevBtn);
    }
    
    // 페이지 번호
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.onclick = () => changePage(i);
        pagination.appendChild(pageBtn);
    }
    
    // 다음 버튼
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '다음';
        nextBtn.onclick = () => changePage(currentPage + 1);
        pagination.appendChild(nextBtn);
    }
}

// 페이지 변경
function changePage(page) {
    currentPage = page;
    displayUsers();
}

// 필터링
function filterUsers() {
    const statusFilter = document.getElementById('filter-status').value;
    const orientationFilter = document.getElementById('filter-orientation').value;
    
    filteredUsers = allUsers.filter(user => {
        // 상태 필터
        if (statusFilter !== 'all') {
            switch (statusFilter) {
                case 'registered':
                    if (user.politicalType) return false;
                    break;
                case 'tested':
                    if (!user.politicalType) return false;
                    break;
                case 'applied':
                    if (!user.meetings || user.meetings.length === 0) return false;
                    break;
                case 'paid':
                    if (!user.payments || user.payments.length === 0) return false;
                    break;
            }
        }
        
        // 성향 필터
        if (orientationFilter !== 'all') {
            if (orientationFilter === 'none' && user.politicalType) return false;
            if (orientationFilter !== 'none') {
                if (!user.politicalInfo || user.politicalInfo.orientation !== orientationFilter) return false;
            }
        }
        
        return true;
    });
    
    // 현재 정렬 상태 유지
    if (currentSort.field) {
        sortTable(currentSort.field);
    } else {
        currentPage = 1;
        displayUsers();
    }
}

// 검색
function searchUsers() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    if (!searchTerm) {
        filteredUsers = [...allUsers];
    } else {
        filteredUsers = allUsers.filter(user => 
            (user.name && user.name.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm))
        );
    }
    
    // 현재 정렬 상태 유지
    if (currentSort.field) {
        sortTable(currentSort.field);
    } else {
        currentPage = 1;
        displayUsers();
    }
}

// 사용자 상세 정보 표시
function showUserDetail(email) {
    const user = allUsers.find(u => u.email === email);
    if (!user) return;
    
    // 기본 정보
    document.getElementById('detail-name').textContent = user.name;
    document.getElementById('detail-email').textContent = user.email;
    document.getElementById('detail-phone').textContent = user.phone;
    document.getElementById('detail-birth').textContent = user.birthdate;
    document.getElementById('detail-gender').textContent = user.gender === 'male' ? '남성' : user.gender === 'female' ? '여성' : '미지정';
    document.getElementById('detail-joined').textContent = new Date(user.joinedDate).toLocaleString();
    
    // 정치 성향
    const politicalDetail = document.getElementById('political-detail');
    if (user.political_type) {
        const info = user.politicalInfo || getPoliticalTypeInfo(user.political_type);
        politicalDetail.innerHTML = `
            <div class="detail-item">
                <label>성향 코드:</label>
                <span>${user.political_type}</span>
            </div>
            <div class="detail-item">
                <label>성향 이름:</label>
                <span>${info.title}</span>
            </div>
            <div class="detail-item">
                <label>정치 성향:</label>
                <span class="badge badge-${info.orientation}">
                    ${info.orientation === 'progressive' ? '진보' : '보수'}
                </span>
            </div>
        `;
    } else {
        politicalDetail.innerHTML = '<p class="no-data">정치 성향 테스트를 완료하지 않았습니다.</p>';
    }
    
    // 모임 신청 내역
    const meetingsDetail = document.getElementById('meetings-detail');
    if (user.meetings && user.meetings.length > 0) {
        const meetingsHtml = user.meetings.map(meeting => `
            <div class="meeting-item">
                <h4>${meeting.title}</h4>
                <p>날짜: ${meeting.date}</p>
                <p>성향: ${meeting.orientation === 'progressive' ? '진보' : '보수'}</p>
                <p>상태: <span class="status-${meeting.status}">${getStatusText(meeting.status)}</span></p>
            </div>
        `).join('');
        meetingsDetail.innerHTML = meetingsHtml;
    } else {
        meetingsDetail.innerHTML = '<p class="no-data">모임 신청 내역이 없습니다.</p>';
    }
    
    // 모달 표시
    document.getElementById('user-detail-modal').style.display = 'block';
}

// 상태 텍스트 변환
function getStatusText(status) {
    const statusMap = {
        'pending': '입금 대기',
        'paid': '결제 완료',
        'confirmed': '참가 확정',
        'cancelled': '취소됨',
        'completed': '완료됨'
    };
    return statusMap[status] || status;
}

// 모달 닫기
function closeModal() {
    document.getElementById('user-detail-modal').style.display = 'none';
}

// 데이터 새로고침
async function refreshData() {
    showSyncStatus('loading', '데이터 동기화 중...');
    
    try {
        await loadData();
        
        // 마지막 업데이트 시간 표시
        updateLastUpdateTime();
        
        // 성공 시 동기화 상태 숨기기
        hideSyncStatus();
        
    } catch (error) {
        console.error('데이터 새로고침 실패:', error);
        showSyncStatus('error', '동기화 실패');
        setTimeout(() => hideSyncStatus(), 3000);
    }
}

// 자동 새로고침 설정
function setupAutoRefresh() {
    const checkbox = document.getElementById('auto-refresh');
    
    if (checkbox) {
        // 초기 상태에 따라 자동 새로고침 시작
        if (checkbox.checked) {
            startAutoRefresh();
        }
        
        // 체크박스 상태 변경 시
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                startAutoRefresh();
            } else {
                stopAutoRefresh();
            }
        });
    }
}

// 자동 새로고침 시작
function startAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    // 5초마다 자동 새로고침
    refreshInterval = setInterval(refreshData, 5000);
}

// 자동 새로고침 중지
function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// 동기화 상태 표시 함수
function showSyncStatus(status, message) {
    const syncStatus = document.getElementById('sync-status');
    if (!syncStatus) return;
    
    syncStatus.className = `sync-status ${status}`;
    syncStatus.querySelector('.sync-text').textContent = message;
    syncStatus.classList.remove('hidden');
}

function hideSyncStatus() {
    const syncStatus = document.getElementById('sync-status');
    if (syncStatus) {
        syncStatus.classList.add('hidden');
    }
}

// 마지막 업데이트 시간 표시
function updateLastUpdateTime() {
    const lastUpdateEl = document.getElementById('last-update');
    if (lastUpdateEl) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        lastUpdateEl.textContent = `(최신 업데이트: ${timeStr})`;
    }
}

// 결제 상태 업데이트
async function updatePaymentStatus(email, newStatus) {
    console.log(`=== 관리자: 결제 상태 변경 시작 ===`);
    console.log(`대상: ${email}`);
    console.log(`새 상태: ${newStatus}`);
    
    try {
        const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
        console.log(`API 호출: ${API_URL}/api/admin/users/${email}/payment-status`);
        
        const response = await fetch(`${API_URL}/api/admin/users/${email}/payment-status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        console.log('서버 응답 상태:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('서버 응답:', result);
            
            // 성공 시 데이터 새로고침
            await refreshData();
            
            // 성공 메시지 표시
            showSyncStatus('success', '결제 상태가 업데이트되었습니다.');
            setTimeout(() => hideSyncStatus(), 2000);
        } else {
            const error = await response.text();
            console.error('서버 오류 응답:', error);
            throw new Error('결제 상태 업데이트 실패');
        }
    } catch (error) {
        console.error('결제 상태 업데이트 오류:', error);
        showSyncStatus('error', '결제 상태 업데이트 실패');
        setTimeout(() => hideSyncStatus(), 3000);
        
        // 실패 시 원래 값으로 되돌리기
        await refreshData();
    }
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('user-detail-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// 테이블 정렬
function sortTable(field) {
    // 같은 필드를 다시 클릭하면 정렬 순서 반전
    if (currentSort.field === field) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.order = 'asc';
    }
    
    // 정렬 수행
    filteredUsers.sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];
        
        // 특수 처리가 필요한 필드들
        if (field === 'joinedDate') {
            aValue = new Date(a.joinedDate || a.signupDate || 0);
            bValue = new Date(b.joinedDate || b.signupDate || 0);
        } else if (field === 'age') {
            // 생년월일에서 나이 계산
            aValue = calculateAge(a.birthdate);
            bValue = calculateAge(b.birthdate);
        } else if (field === 'politicalType') {
            aValue = a.political_type || a.politicalType || '';
            bValue = b.political_type || b.politicalType || '';
        }
        
        // null/undefined 처리
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
        // 정렬
        let comparison = 0;
        if (aValue < bValue) {
            comparison = -1;
        } else if (aValue > bValue) {
            comparison = 1;
        }
        
        return currentSort.order === 'asc' ? comparison : -comparison;
    });
    
    // 정렬 아이콘 업데이트
    updateSortIcons();
    
    // 첫 페이지로 이동하고 테이블 다시 표시
    currentPage = 1;
    displayUsers();
}

// 정렬 아이콘 업데이트
function updateSortIcons() {
    // 모든 정렬 아이콘 초기화
    document.querySelectorAll('.sort-icon').forEach(icon => {
        icon.textContent = '↕';
    });
    
    // 현재 정렬 필드의 아이콘 업데이트
    const th = document.querySelector(`th[onclick="sortTable('${currentSort.field}')"]`);
    if (th) {
        const icon = th.querySelector('.sort-icon');
        if (icon) {
            icon.textContent = currentSort.order === 'asc' ? '↑' : '↓';
        }
    }
}

// 나이 계산 함수
function calculateAge(birthdate) {
    if (!birthdate) return 0;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}