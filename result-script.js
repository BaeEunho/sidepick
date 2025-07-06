// SidePick 결과 페이지 JavaScript

class ResultPage {
    constructor() {
        this.personalityResult = null;
        this.scores = null;
        this.chart = null;
        
        this.init();
    }

    init() {
        // URL에서 결과 데이터 가져오기 또는 localStorage에서 가져오기
        this.loadResultData();
        
        if (this.personalityResult) {
            this.displayResult();
            this.bindEvents();
        } else {
            this.showError();
        }
    }

    // 결과 데이터 로드
    loadResultData() {
        // URL 파라미터에서 결과 코드 확인
        const urlParams = new URLSearchParams(window.location.search);
        const resultCode = urlParams.get('result');
        
        if (resultCode && personalityResults[resultCode]) {
            // URL에서 지정된 결과 표시
            this.personalityResult = personalityResults[resultCode];
            // '다른 성향 알아보기'에서도 동일한 axes 데이터 사용
            this.scores = this.personalityResult.axes;
        } else {
            // localStorage에서 테스트 결과 가져오기
            const savedResult = localStorage.getItem('sidepick-test-result');
            
            if (savedResult) {
                try {
                    const data = JSON.parse(savedResult);
                    this.personalityResult = data.type;
                    this.scores = data.scores;
                } catch (e) {
                    console.error('저장된 결과를 불러올 수 없습니다:', e);
                }
            }
        }
    }

    // 결과 표시
    displayResult() {
        if (!this.personalityResult) return;

        // 기본 성향 정보 표시
        this.updateBasicInfo();
        
        // 축별 점수 표시
        this.updateAxisIndicators();
        
        // 상세 정보 표시
        this.updateDetailedInfo();
        
        // 호환성 정보 표시
        this.updateCompatibilityInfo();
        
        // 대화 주제 표시
        this.updateTopicsInfo();
    }

    // 기본 정보 업데이트
    updateBasicInfo() {
        const elements = {
            name: document.getElementById('personality-name'),
            code: document.getElementById('personality-code'),
            motto: document.getElementById('personality-motto')
        };

        if (elements.name) elements.name.textContent = this.personalityResult.name;
        if (elements.code) elements.code.textContent = this.personalityResult.code;
        if (elements.motto) elements.motto.textContent = this.personalityResult.motto;

        // 배경색 적용
        if (this.personalityResult.bgColor) {
            document.documentElement.style.setProperty('--personality-color', this.personalityResult.bgColor);
        }
    }

    // 축별 점수 표시기 업데이트
    updateAxisIndicators() {
        if (!this.scores) return;

        const indicators = {
            economic: document.getElementById('economic-indicator'),
            social: document.getElementById('social-indicator'),
            cultural: document.getElementById('cultural-indicator'),
            participation: document.getElementById('participation-indicator')
        };

        Object.keys(this.scores).forEach(axis => {
            const indicator = indicators[axis];
            const scaleBar = indicator?.parentElement;
            if (!indicator || !scaleBar) return;

            const score = this.scores[axis];
            
            // 각 축별로 높은 점수가 의미하는 바가 다름
            // 모든 축에서 높은 점수(50 이상)는 오른쪽 성향을 의미
            const isRightSide = score >= 50;
            const percentage = Math.max(score, 100 - score); // 더 강한 성향의 비율 표시

            // 기존 스타일 초기화
            indicator.style.left = '';
            indicator.style.right = '';
            indicator.style.background = '';
            indicator.classList.remove('left-side');
            
            // 애니메이션 효과 (모바일 최적화)
            const applyStyles = () => {
                // 강제로 모든 스타일 초기화
                indicator.style.cssText = '';
                indicator.className = 'scale-indicator';
                
                if (isRightSide) {
                    // 오른쪽 성향 - 오른쪽부터 색칠
                    indicator.style.cssText = `
                        position: absolute;
                        top: 0;
                        right: 0;
                        left: auto;
                        height: 100%;
                        width: ${percentage}%;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        border-radius: 4px;
                        opacity: 1;
                        display: block;
                        transition: none;
                    `;
                } else {
                    // 왼쪽 성향 - 왼쪽부터 색칠
                    indicator.style.cssText = `
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: auto;
                        height: 100%;
                        width: ${percentage}%;
                        background: linear-gradient(135deg, #f093fb, #f5576c);
                        border-radius: 4px;
                        opacity: 1;
                        display: block;
                        transition: none;
                    `;
                    indicator.classList.add('left-side');
                }
                
                // 확실히 표시되도록 강제
                indicator.setAttribute('data-percentage', percentage);
                indicator.setAttribute('data-side', isRightSide ? 'right' : 'left');
            };
            
            // 모바일에서는 즉시 표시, 데스크톱에서는 애니메이션
            if (window.innerWidth <= 768) {
                applyStyles();
                // 추가 보험 - 100ms 후 다시 한번 적용
                setTimeout(applyStyles, 100);
            } else {
                setTimeout(applyStyles, 500);
            }
        });
    }

    // 상세 정보 업데이트
    updateDetailedInfo() {
        // 성향 설명
        const descriptionEl = document.getElementById('personality-description');
        if (descriptionEl && this.personalityResult.description) {
            descriptionEl.textContent = this.personalityResult.description;
        }

        // 핵심 가치관
        const coreValuesList = document.getElementById('core-values-list');
        if (coreValuesList && this.personalityResult.coreValues) {
            coreValuesList.innerHTML = '';
            this.personalityResult.coreValues.forEach(value => {
                const li = document.createElement('li');
                li.textContent = value;
                coreValuesList.appendChild(li);
            });
        }

        // 일상 특징
        const dailyTraits = document.getElementById('daily-traits');
        if (dailyTraits && this.personalityResult.dailyTraits) {
            dailyTraits.innerHTML = '';
            this.personalityResult.dailyTraits.forEach((trait, index) => {
                const traitCard = document.createElement('div');
                traitCard.className = 'trait-card';
                
                const icons = ['💼', '🌈', '🆕', '🗳️', '📊', '🤝', '🎯', '💡'];
                const icon = icons[index % icons.length];
                
                traitCard.innerHTML = `
                    <div class="trait-icon">${icon}</div>
                    <p>${trait}</p>
                `;
                dailyTraits.appendChild(traitCard);
            });
        }
    }

    // 호환성 정보 업데이트
    updateCompatibilityInfo() {
        const compatibleTypes = document.getElementById('compatible-types');
        if (compatibleTypes && this.personalityResult.compatibleTypes) {
            compatibleTypes.innerHTML = '';
            this.personalityResult.compatibleTypes.forEach(type => {
                const card = document.createElement('div');
                card.className = 'compatibility-card';
                card.innerHTML = `
                    <div class="compatibility-header">
                        <h3>${type.name}</h3>
                        <span class="compatibility-code">${type.code}</span>
                    </div>
                    <p class="compatibility-reason">${type.reason}</p>
                `;
                compatibleTypes.appendChild(card);
            });
        }
    }

    // 대화 주제 정보 업데이트
    updateTopicsInfo() {
        // 좋은 대화 주제
        const goodTopicsList = document.getElementById('good-topics-list');
        if (goodTopicsList && this.personalityResult.goodTopics) {
            goodTopicsList.innerHTML = '';
            this.personalityResult.goodTopics.forEach(topic => {
                const li = document.createElement('li');
                li.textContent = topic;
                goodTopicsList.appendChild(li);
            });
        }

        // 민감한 주제
        const sensitiveTopicsList = document.getElementById('sensitive-topics-list');
        if (sensitiveTopicsList && this.personalityResult.sensitiveTopics) {
            sensitiveTopicsList.innerHTML = '';
            this.personalityResult.sensitiveTopics.forEach(topic => {
                const li = document.createElement('li');
                li.textContent = topic;
                sensitiveTopicsList.appendChild(li);
            });
        }
    }


    // 이벤트 바인딩
    bindEvents() {
        // 매칭 받기 버튼
        const getMatchingBtn = document.getElementById('get-matching-btn');
        if (getMatchingBtn) {
            getMatchingBtn.addEventListener('click', () => this.getMatching());
        }

        // 결과 공유 버튼
        const shareResultBtn = document.getElementById('share-result-btn');
        if (shareResultBtn) {
            shareResultBtn.addEventListener('click', () => this.shareResult());
        }
    }

    // 매칭 서비스 이동
    getMatching() {
        // 프로필 작성 페이지로 이동
        window.location.href = 'profile.html';
    }

    // 결과 공유
    shareResult() {
        if (!this.personalityResult) return;

        const shareData = {
            title: 'SidePick 정치 성향 테스트 결과',
            text: `나의 정치 성향은 "${this.personalityResult.name}"입니다! ${this.personalityResult.motto}`,
            url: `${window.location.origin}${window.location.pathname}?result=${this.personalityResult.code}`
        };

        if (navigator.share) {
            navigator.share(shareData).catch(err => {
                console.log('공유 실패:', err);
                this.fallbackShare(shareData);
            });
        } else {
            this.fallbackShare(shareData);
        }
    }

    // 공유 대체 방법
    fallbackShare(shareData) {
        const shareText = `${shareData.text}\n\n${shareData.url}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('결과가 클립보드에 복사되었습니다!');
            }).catch(() => {
                this.showShareModal(shareText);
            });
        } else {
            this.showShareModal(shareText);
        }
    }

    // 공유 모달 표시
    showShareModal(text) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 15px;
            max-width: 500px;
            margin: 1rem;
        `;

        modalContent.innerHTML = `
            <h3 style="margin-bottom: 1rem;">결과 공유하기</h3>
            <textarea readonly style="width: 100%; height: 150px; margin-bottom: 1rem; padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px;">${text}</textarea>
            <div style="text-align: right;">
                <button id="copy-btn" style="margin-right: 0.5rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">복사</button>
                <button id="close-btn" style="padding: 0.5rem 1rem; background: #ccc; color: black; border: none; border-radius: 5px; cursor: pointer;">닫기</button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // 이벤트 리스너
        modalContent.querySelector('#copy-btn').addEventListener('click', () => {
            const textarea = modalContent.querySelector('textarea');
            textarea.select();
            
            // 최신 브라우저의 클립보드 API 사용
            if (navigator.clipboard) {
                navigator.clipboard.writeText(textarea.value).then(() => {
                    this.showNotification('복사되었습니다!');
                }).catch(() => {
                    // 폴백: 구식 방법
                    try {
                        document.execCommand('copy');
                        this.showNotification('복사되었습니다!');
                    } catch (e) {
                        this.showNotification('복사에 실패했습니다.');
                    }
                });
            } else {
                // 폴백: 구식 방법
                try {
                    document.execCommand('copy');
                    this.showNotification('복사되었습니다!');
                } catch (e) {
                    this.showNotification('복사에 실패했습니다.');
                }
            }
        });

        const closeModal = () => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        };

        modalContent.querySelector('#close-btn').addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // 알림 표시
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 에러 표시
    showError() {
        const main = document.querySelector('main') || document.body;
        main.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem;">
                <h2>결과를 불러올 수 없습니다</h2>
                <p style="margin: 1rem 0;">테스트 결과가 없거나 만료되었습니다.</p>
                <a href="test.html" style="display: inline-block; padding: 1rem 2rem; background: #667eea; color: white; text-decoration: none; border-radius: 25px; margin-top: 1rem;">테스트 다시하기</a>
            </div>
        `;
    }
}

// URL에서 결과 코드로 직접 결과 페이지 접근 가능하도록 하는 함수
function getResultByCode(code) {
    const result = personalityResults[code];
    if (result) {
        // URL 업데이트
        const url = new URL(window.location);
        url.searchParams.set('result', code);
        window.history.replaceState({}, '', url);
        
        // 결과 페이지 새로고침
        new ResultPage();
    }
}

// DOM 로드 완료 후 결과 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    new ResultPage();
});

// localStorage 정리 후 리다이렉트
function clearStorageAndRedirect(url) {
    localStorage.removeItem('sidepick-test-progress');
    localStorage.removeItem('sidepick-test-result');
    window.location.href = url;
}

// 친구 테스트 링크 복사
function copyTestLink() {
    const testUrl = `${window.location.origin}${window.location.pathname.replace('result.html', 'index.html')}`;
    const shareText = `🧭 SidePick에서 나의 정치 성향을 알아봤어요!\n\n당신도 테스트해보세요: ${testUrl}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('테스트 링크가 클립보드에 복사되었습니다!');
        }).catch(() => {
            fallbackCopyMethod(shareText);
        });
    } else {
        fallbackCopyMethod(shareText);
    }
}

// 복사 대체 방법
function fallbackCopyMethod(text) {
    // 임시 텍스트 영역 생성
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('테스트 링크가 클립보드에 복사되었습니다!');
    } catch (e) {
        showNotification('복사에 실패했습니다. 링크를 수동으로 복사해주세요.');
    }
    
    document.body.removeChild(textArea);
}

// 알림 표시 함수 (기존 함수 재사용)
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 전역 함수로 노출
window.getResultByCode = getResultByCode;
window.clearStorageAndRedirect = clearStorageAndRedirect;
window.copyTestLink = copyTestLink;