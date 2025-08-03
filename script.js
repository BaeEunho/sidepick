// FAQ 아코디언 기능
// 알림 모달 표시
function showAlarmModal() {
    // 사용자 상태 확인
    const userState = AuthManager.getUserState();
    
    if (userState.type === 'guest') {
        // 비로그인 상태: 회원가입으로 유도
        alert('알림을 받으려면 먼저 회원가입이 필요합니다.');
        window.location.href = 'signup.html';
        return;
    } else if (userState.type === 'member') {
        // 로그인했지만 성향진단 안함: 성향진단으로 유도
        alert('알림을 받으려면 먼저 정치 성향 테스트를 완료해주세요.');
        window.location.href = 'political-test.html';
        return;
    }
    
    // 성향진단 완료 상태: 알림 모달 표시
    const userType = userState.politicalType;
    const userOrientation = userType.orientation === 'progressive' ? '진보' : '보수';
    
    const modal = document.getElementById('alarmModal');
    if (!modal) {
        // 모달이 없으면 생성
        const modalHTML = `
            <div id="alarmModal" class="modal">
                <div class="modal-content">
                    <span class="close" onclick="closeAlarmModal()">&times;</span>
                    <h2>다음 일정 알림 받기</h2>
                    <p>${userState.profile.name}님의 성향은 <strong>${userOrientation} 성향</strong>입니다.<br>
                    새로운 ${userOrientation} 성향 소개팅 일정이 등록되면 알려드립니다.</p>
                    <form id="alarmForm" onsubmit="submitAlarmForm(event)">
                        <div class="form-group">
                            <label>이메일</label>
                            <input type="email" name="email" required placeholder="your@email.com" value="${userState.profile.email || ''}">
                        </div>
                        <input type="hidden" name="preference" value="${userType.orientation}">
                        <button type="submit" class="submit-btn">알림 신청하기</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    document.getElementById('alarmModal').style.display = 'block';
}

// 알림 모달 닫기
function closeAlarmModal() {
    const modal = document.getElementById('alarmModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 알림 신청 폼 제출
function submitAlarmForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const preference = formData.get('preference');
    
    // 실제로는 서버로 전송
    const preferenceText = preference === 'progressive' ? '진보' : '보수';
    
    // 알림 설정을 sessionStorage에 저장
    sessionStorage.setItem('emailNotification', 'true');
    sessionStorage.setItem('notificationEmail', email);
    
    alert(`알림이 신청되었습니다!\n\n${email}로 새로운 ${preferenceText} 성향 소개팅 일정을 알려드리겠습니다.`);
    closeAlarmModal();
    event.target.reset();
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('alarmModal');
    if (event.target === modal) {
        closeAlarmModal();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // FAQ 토글 기능
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const toggle = question.querySelector('.faq-toggle');
            
            // 다른 FAQ 항목들 닫기
            const allFaqItems = document.querySelectorAll('.faq-item');
            allFaqItems.forEach(item => {
                if (item !== faqItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = '0';
                    item.querySelector('.faq-toggle').textContent = '+';
                }
            });
            
            // 현재 항목 토글
            faqItem.classList.toggle('active');
            
            if (faqItem.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                toggle.textContent = '−';
            } else {
                answer.style.maxHeight = '0';
                toggle.textContent = '+';
            }
        });
    });
    
    // 스크롤 시 헤더 스타일 변경
    let lastScroll = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        } else {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }
        
        lastScroll = currentScroll;
    });
    
    // 부드러운 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            // #만 있거나 빈 값인 경우 무시
            if (!targetId || targetId === '#') {
                return;
            }
            
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 성향 카드 호버 효과
    const personalityCards = document.querySelectorAll('.personality-card');
    
    personalityCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // 내비게이션 메뉴 액티브 상태
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    function setActiveLink() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', setActiveLink);
    
    // 모바일 메뉴 토글 (추후 구현을 위한 준비)
    function createMobileMenu() {
        const navContainer = document.querySelector('.nav-container');
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<span></span><span></span><span></span>';
        mobileMenuBtn.style.display = 'none';
        
        // 모바일 화면에서만 표시
        if (window.innerWidth <= 768) {
            mobileMenuBtn.style.display = 'block';
        }
        
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                mobileMenuBtn.style.display = 'block';
            } else {
                mobileMenuBtn.style.display = 'none';
            }
        });
    }
    
    // 로딩 애니메이션
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
    
    // 숫자 카운트 애니메이션
    function animateValue(element, start, end, duration) {
        const startTimestamp = Date.now();
        const step = (timestamp) => {
            const progress = Math.min((Date.now() - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            element.textContent = current;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // IntersectionObserver로 애니메이션 트리거
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // 숫자 카운트 애니메이션
                if (entry.target.classList.contains('price-info')) {
                    const priceElement = entry.target.querySelector('strong');
                    if (priceElement && !priceElement.dataset.animated) {
                        priceElement.dataset.animated = 'true';
                        const finalValue = 45000;
                        priceElement.textContent = '0';
                        setTimeout(() => {
                            animateValue(priceElement, 0, finalValue, 1000);
                            setTimeout(() => {
                                priceElement.textContent = '45,000원';
                            }, 1000);
                        }, 300);
                    }
                }
            }
        });
    }, observerOptions);
    
    // 애니메이션을 적용할 요소들 관찰
    const animatedElements = document.querySelectorAll('.feature-card, .meeting-card, .review-card, .step, .price-info, .problem-intro, .value-reveal, .our-mission, .experience-card, .issue-tags, .explanation, .target-audience');
    animatedElements.forEach(el => observer.observe(el));
});

// CSS에 추가할 애니메이션 클래스
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        .nav-menu a.active::after {
            width: 100%;
            background-color: var(--coral);
        }
        
        body.loaded .hero-content > * {
            animation: fadeInUp 0.8s ease forwards;
        }
        
        .mobile-menu-btn {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
        }
        
        .mobile-menu-btn span {
            display: block;
            width: 25px;
            height: 3px;
            background-color: var(--gray-800);
            margin: 5px 0;
            transition: all 0.3s ease;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});