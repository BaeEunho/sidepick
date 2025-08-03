// 토스페이먼츠 초기화
const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'; // 테스트용 클라이언트 키
const tossPayments = TossPayments(clientKey);

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 주문 정보 로드
    loadOrderInfo();
    
    // 결제 수단 변경 이벤트
    setupPaymentMethodHandlers();
    
    // 카드 입력 포맷팅
    setupCardInputFormatting();
    
    // 결제 버튼 이벤트
    setupPaymentButton();
});

// 주문 정보 로드
function loadOrderInfo() {
    const meetingInfo = JSON.parse(sessionStorage.getItem('selectedMeeting'));
    const participantInfo = JSON.parse(sessionStorage.getItem('participantInfo'));
    
    if (!meetingInfo || !participantInfo) {
        alert('주문 정보가 없습니다.');
        window.location.href = 'meeting-schedule.html';
        return;
    }
    
    // 주문 정보 표시
    document.getElementById('order-title').textContent = meetingInfo.title;
    document.getElementById('order-date').textContent = meetingInfo.date;
    document.getElementById('order-time').textContent = meetingInfo.time;
    document.getElementById('order-location').textContent = meetingInfo.location;
    document.getElementById('order-participant').textContent = `${participantInfo.name} (${meetingInfo.userGender === 'male' ? '남성' : '여성'})`;
}

// 결제 수단 변경 핸들러
function setupPaymentMethodHandlers() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const cardForm = document.getElementById('card-form');
    const simplePaymentInfo = document.getElementById('simple-payment-info');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            if (e.target.value === 'card') {
                cardForm.style.display = 'block';
                simplePaymentInfo.style.display = 'none';
            } else {
                cardForm.style.display = 'none';
                simplePaymentInfo.style.display = 'block';
            }
        });
    });
}

// 카드 입력 포맷팅
function setupCardInputFormatting() {
    // 카드 번호 포맷팅
    const cardNumberInput = document.getElementById('card-number');
    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        e.target.value = formattedValue;
        validateCardNumber(e.target);
    });
    
    // 유효기간 포맷팅
    const cardExpiryInput = document.getElementById('card-expiry');
    cardExpiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        
        e.target.value = value;
        validateExpiry(e.target);
    });
    
    // CVC 숫자만 입력
    const cardCvcInput = document.getElementById('card-cvc');
    cardCvcInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
        validateCVC(e.target);
    });
    
    // 카드 소유자명 검증
    const cardNameInput = document.getElementById('card-name');
    cardNameInput.addEventListener('input', (e) => {
        validateCardName(e.target);
    });
}

// 카드 번호 검증
function validateCardNumber(input) {
    const value = input.value.replace(/\s/g, '');
    const errorElement = document.getElementById('card-number-error');
    
    if (value.length < 16) {
        showError(input, errorElement, '카드 번호를 16자리 모두 입력해주세요.');
        return false;
    }
    
    // 간단한 Luhn 알고리즘 체크
    if (!isValidCardNumber(value)) {
        showError(input, errorElement, '올바른 카드 번호를 입력해주세요.');
        return false;
    }
    
    clearError(input, errorElement);
    return true;
}

// Luhn 알고리즘
function isValidCardNumber(number) {
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

// 유효기간 검증
function validateExpiry(input) {
    const value = input.value;
    const errorElement = document.getElementById('card-expiry-error');
    
    if (value.length < 5) {
        showError(input, errorElement, '유효기간을 MM/YY 형식으로 입력해주세요.');
        return false;
    }
    
    const [month, year] = value.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(month) < 1 || parseInt(month) > 12) {
        showError(input, errorElement, '올바른 월을 입력해주세요.');
        return false;
    }
    
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        showError(input, errorElement, '유효기간이 만료된 카드입니다.');
        return false;
    }
    
    clearError(input, errorElement);
    return true;
}

// CVC 검증
function validateCVC(input) {
    const value = input.value;
    const errorElement = document.getElementById('card-cvc-error');
    
    if (value.length < 3) {
        showError(input, errorElement, 'CVC 3자리를 입력해주세요.');
        return false;
    }
    
    clearError(input, errorElement);
    return true;
}

// 카드 소유자명 검증
function validateCardName(input) {
    const value = input.value.trim();
    const errorElement = document.getElementById('card-name-error');
    
    if (value.length < 2) {
        showError(input, errorElement, '카드 소유자명을 입력해주세요.');
        return false;
    }
    
    if (!/^[가-힣a-zA-Z\s]+$/.test(value)) {
        showError(input, errorElement, '올바른 이름을 입력해주세요.');
        return false;
    }
    
    clearError(input, errorElement);
    return true;
}

// 에러 표시
function showError(input, errorElement, message) {
    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

// 에러 제거
function clearError(input, errorElement) {
    input.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
}

// 결제 버튼 설정
function setupPaymentButton() {
    const paymentButton = document.getElementById('payment-button');
    
    paymentButton.addEventListener('click', async () => {
        // 동의 체크박스 확인
        const agreePayment = document.getElementById('agree-payment').checked;
        const agreeCancelPolicy = document.getElementById('agree-cancel-policy').checked;
        
        if (!agreePayment || !agreeCancelPolicy) {
            alert('모든 확인 사항에 동의해주세요.');
            return;
        }
        
        // 선택된 결제 수단
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
        
        // 카드 결제인 경우 유효성 검사
        if (selectedMethod === 'card') {
            const cardNumber = document.getElementById('card-number');
            const cardExpiry = document.getElementById('card-expiry');
            const cardCvc = document.getElementById('card-cvc');
            const cardName = document.getElementById('card-name');
            
            const isValid = validateCardNumber(cardNumber) && 
                          validateExpiry(cardExpiry) && 
                          validateCVC(cardCvc) && 
                          validateCardName(cardName);
            
            if (!isValid) {
                alert('카드 정보를 올바르게 입력해주세요.');
                return;
            }
        }
        
        // 결제 진행
        paymentButton.disabled = true;
        paymentButton.textContent = '결제 처리 중...';
        
        try {
            await processPayment(selectedMethod);
        } catch (error) {
            console.error('결제 실패:', error);
            alert('결제 처리 중 오류가 발생했습니다.');
            paymentButton.disabled = false;
            paymentButton.textContent = '45,000원 결제하기';
        }
    });
}

// 결제 처리
async function processPayment(method) {
    const meetingInfo = JSON.parse(sessionStorage.getItem('selectedMeeting'));
    const participantInfo = JSON.parse(sessionStorage.getItem('participantInfo'));
    const orderId = 'ORD-' + Date.now();
    const orderName = meetingInfo.title;
    
    // 결제 정보 준비
    const paymentData = {
        amount: 45000,
        orderId: orderId,
        orderName: orderName,
        customerName: participantInfo.name,
        successUrl: window.location.origin + '/payment-complete.html',
        failUrl: window.location.origin + '/payment.html'
    };
    
    // 결제 방법별 처리
    switch(method) {
        case 'card':
            // 카드 결제는 입력받은 정보로 처리 (실제로는 PG사 연동 필요)
            // 데모를 위해 간단히 처리
            await simulateCardPayment(paymentData);
            break;
            
        case 'transfer':
            // 계좌이체
            await tossPayments.requestPayment('계좌이체', paymentData);
            break;
            
        case 'kakao':
            // 카카오페이
            await tossPayments.requestPayment('카카오페이', paymentData);
            break;
            
        case 'naver':
            // 네이버페이
            await tossPayments.requestPayment('네이버페이', paymentData);
            break;
            
        default:
            throw new Error('지원하지 않는 결제 방법입니다.');
    }
}

// 카드 결제 시뮬레이션 (실제로는 PG사 API 호출)
async function simulateCardPayment(paymentData) {
    // 카드 정보 수집
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvc = document.getElementById('card-cvc').value;
    const cardName = document.getElementById('card-name').value;
    
    // 실제로는 이 정보를 안전하게 암호화하여 PG사로 전송
    // 데모를 위해 2초 후 성공으로 처리
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 결제 성공 정보 저장
    savePaymentInfo('card', paymentData);
    
    // 완료 페이지로 이동
    window.location.href = 'payment-complete.html';
}

// 결제 정보 저장
function savePaymentInfo(method, paymentData) {
    const paymentInfo = {
        method: method,
        amount: paymentData.amount,
        orderId: paymentData.orderId,
        orderName: paymentData.orderName,
        customerName: paymentData.customerName,
        timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));
}