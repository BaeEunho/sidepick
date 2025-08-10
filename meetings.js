async function handleApply(meetingId, orientation) {    
    // 사용자 정보 가져오기
    const userState = AuthManager.getUserState();
    const politicalType = sessionStorage.getItem('politicalType');
    
    // 모임 정보 가져오기 (화면에서) - 라벨 기반으로 안전하게 가져오기
    const meetingTitle = orientation == "progressive" ? "진보 성향 소개팅" : "보수 성향 소개팅";
    
    // 각 info-item에서 라벨과 값을 매칭하여 가져오기
    const meetingDate = orientation === "progressive" ? "8월 23일 (토) 15:00" : "8월 30일 (토) 15:00";
    const meetingLocation = '강남역 파티룸';

    let age = '0세';
    // 나이 계산 (한국식 나이)
    const birthDate = userState.profile.birthdate ? new Date(userState.profile.birthdate) : null;
    if (birthDate) {
        const today = new Date();
        // 한국식 나이 계산: 현재 연도 - 출생 연도 + 1
        const koreanAge = today.getFullYear() - birthDate.getFullYear() + 1;
        age = koreanAge + '세';
    } else {
        age = '정보 없음';
    }

    const applicationData = {
        name: userState.profile.name,
        age,
        gender: userState.profile.gender === 'male' ? '남성' : '여성',
        type: politicalType.title || '정보 없음'
    }
    
    // API 요청 데이터 구성
    const requestData = {
        meetingId,
        orientation,
        meetingInfo: {
            title: meetingTitle,
            date: meetingDate,
            location: meetingLocation
        },
        applicationData
    };
    
    // 디버깅: 전송할 데이터 확인
    console.log('=== 모임 신청 데이터 ===');
    console.log('Request Data:', requestData);
    console.log('User Email:', userState.profile?.email || sessionStorage.getItem('userEmail'));
    console.log('Political Type:', politicalType);
    const authToken = localStorage.getItem('authToken');
    console.log('Auth Token:', authToken ? `${authToken.substring(0, 20)}...` : 'NO TOKEN');
    console.log('Token exists:', !!authToken);
    console.log('API URL:', 'https://sidepick.onrender.com/api/meetings/apply');
    
    // 디버깅: 전송 데이터 확인
    console.log('모임 신청 데이터:', requestData);
    console.log('사용자 이메일:', userState.email);
    console.log('정치 성향:', politicalType);
    console.log('인증 토큰:', localStorage.getItem('authToken'));
    
    try {
        // 서버 API 호출
        const response = await fetch('https://sidepick.onrender.com/api/meetings/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}` // localStorage에서 토큰 가져오기
            },
            body: JSON.stringify(requestData)
        });
        
        // 디버깅: 서버 응답 확인
        console.log('서버 응답 상태:', response.status);
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
                console.error('서버 오류 응답:', errorData);
            } catch (e) {
                console.error('응답 파싱 실패:', e);
                errorData = { message: `서버 오류: ${response.status} ${response.statusText}` };
            }
            
            // 서버에서 명시적인 에러 메시지가 있으면 표시
            if (errorData.message) {
                alert(errorData.message);
                return;
            }
            
            throw new Error(`서버 오류: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('서버 응답 데이터:', result);
        
        if (result.success) {
            console.log('=== API 호출 성공 ===');
            console.log('Booking ID:', result.data?.bookingId);
            
            // appliedMeetings 업데이트 (서버 응답 반영)
            const appliedMeetings = JSON.parse(sessionStorage.getItem('appliedMeetings') || '{}');
            appliedMeetings[orientation] = {
                appliedAt: new Date().toISOString(),
                status: 'payment_pending',
                formData: applicationData,
                meetingId: meetingId,
                title: meetingTitle,
                date: meetingDate,
                location: meetingLocation,
                bookingId: result.data?.bookingId || `booking_${Date.now()}`
            };
            sessionStorage.setItem('appliedMeetings', JSON.stringify(appliedMeetings));
            console.log('Saved appliedMeetings:', appliedMeetings);
            
            // 예약 정보를 pendingBooking에 저장
            const bookingInfo = {
                meetingId: meetingId,
                title: meetingTitle,
                date: meetingDate,
                location: meetingLocation,
                orientation: orientation,
                bookingId: result.data?.bookingId || `booking_${Date.now()}`
            };
            sessionStorage.setItem('pendingBooking', JSON.stringify(bookingInfo));
            
            alert('모임 신청이 완료되었습니다!');
            
            // booking-confirm 페이지로 이동 (약간의 지연을 주어 sessionStorage 저장 보장)
            setTimeout(() => {
                const bookingId = result.data?.bookingId || '';
                window.location.href = `payment-complete.html?bookingId=${bookingId}`;
            }, 100);
        } else {
            console.error('API 응답 실패:', result.message);
            alert(`모임 신청 실패: ${result.message}`);
        }
        
    } catch (error) {
        console.error('신청 처리 중 오류:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // 사용자에게 더 자세한 에러 메시지 표시
        alert(`모임 신청 중 오류가 발생했습니다.\n\n오류: ${error.message}\n\n문제가 계속되면 관리자에게 문의해주세요.`);
        
        // API 호출 실패 시 폴백: sessionStorage에만 저장 (데모 모드)
        const appliedMeetings = JSON.parse(sessionStorage.getItem('appliedMeetings') || '{}');
        appliedMeetings[orientation] = {
            appliedAt: new Date().toISOString(),
            status: 'pending',
            formData: applicationData,
            meetingId: meetingId,
            title: meetingTitle,
            date: meetingDate,
            location: meetingLocation,
            demoMode: true // 데모 모드 표시
        };
        sessionStorage.setItem('appliedMeetings', JSON.stringify(appliedMeetings));
        console.log('Saved appliedMeetings (demo mode):', appliedMeetings);
        
        // 예약 정보를 pendingBooking에 저장 (데모 모드)
        const bookingInfo = {
            meetingId: meetingId,
            title: meetingTitle,
            date: meetingDate,
            location: meetingLocation,
            orientation: orientation,
            bookingId: `demo_booking_${Date.now()}`,
            demoMode: true
        };
        sessionStorage.setItem('pendingBooking', JSON.stringify(bookingInfo));
        
        // booking-confirm 페이지로 이동 (약간의 지연을 주어 sessionStorage 저장 보장)
        setTimeout(() => {
            const bookingId = bookingInfo.bookingId || '';
            window.location.href = `payment-complete.html?bookingId=${bookingId}`;
        }, 100);
    }
}