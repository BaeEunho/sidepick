// SidePick 정치 성향 테스트 메인 스크립트

class SidePickTest {
    constructor() {
        // 강제로 초기 상태 설정
        this.currentQuestionIndex = 0;
        this.answers = new Array(60).fill(null);
        this.questions = getQuestions(); // questions.js에서 가져옴
        this.totalQuestions = this.questions.length;
        this.testStartTime = null;
        
        // localStorage 정리
        localStorage.removeItem('sidepick-test-progress');
        localStorage.removeItem('sidepick-test-result');
        
        this.initializeElements();
        this.bindEvents();
        this.loadSavedProgress();
    }

    // DOM 요소들 초기화
    initializeElements() {
        // 화면 요소들
        this.screens = {
            intro: document.getElementById('intro-screen'),
            question: document.getElementById('question-screen'),
            loading: document.getElementById('loading-screen'),
            result: document.getElementById('result-screen')
        };

        // 버튼 요소들
        this.buttons = {
            startTest: document.getElementById('start-test-btn'),
            prev: document.getElementById('prev-btn'),
            next: document.getElementById('next-btn'),
            getMatching: document.getElementById('get-matching-btn'),
            saveResult: document.getElementById('save-result-btn'),
            shareResult: document.getElementById('share-result-btn'),
            restart: document.getElementById('restart-test-btn')
        };

        // 질문 관련 요소들
        this.questionElements = {
            currentNum: document.getElementById('current-question'),
            totalNum: document.getElementById('total-questions'),
            progressFill: document.getElementById('progress-fill'),
            questionText: document.getElementById('question-text'),
            answerButtons: document.querySelectorAll('.answer-btn')
        };

        // 결과 관련 요소들
        this.resultElements = {
            type: document.getElementById('result-type'),
            code: document.getElementById('result-code'),
            description: document.getElementById('result-description'),
            economicBar: document.getElementById('economic-bar'),
            socialBar: document.getElementById('social-bar'),
            cultureBar: document.getElementById('culture-bar'),
            participationBar: document.getElementById('participation-bar')
        };

        // 총 질문 수 설정
        this.questionElements.totalNum.textContent = this.totalQuestions;
    }

    // 이벤트 리스너 바인딩
    bindEvents() {
        // 테스트 시작 버튼
        this.buttons.startTest.addEventListener('click', () => this.startTest());

        // 이전/다음 버튼
        this.buttons.prev.addEventListener('click', () => this.previousQuestion());
        this.buttons.next.addEventListener('click', () => this.nextQuestion());

        // 답변 버튼들
        this.questionElements.answerButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAnswer(e));
        });

        // 결과 화면 버튼들
        this.buttons.getMatching.addEventListener('click', () => this.getMatching());
        this.buttons.saveResult.addEventListener('click', () => this.saveResult());
        this.buttons.shareResult.addEventListener('click', () => this.shareResult());
        this.buttons.restart.addEventListener('click', () => this.restartTest());

        // 키보드 이벤트
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // 저장된 진행상황 로드
    loadSavedProgress() {
        // 개발 중이므로 진행상황 로드 기능을 비활성화
        // const saved = localStorage.getItem('sidepick-test-progress');
        // if (saved) {
        //     try {
        //         const data = JSON.parse(saved);
        //         this.answers = data.answers || new Array(60).fill(null);
        //         this.currentQuestionIndex = data.currentQuestion || 0;
        //         
        //         if (this.currentQuestionIndex > 0) {
        //             // 진행 중이던 테스트가 있으면 질문 화면으로 이동
        //             this.showScreen('question');
        //             this.updateQuestionDisplay();
        //             this.updateNavigationButtons();
        //         }
        //     } catch (e) {
        //         console.log('저장된 데이터를 불러올 수 없습니다.');
        //     }
        // }
        
        // 항상 초기 상태로 시작
        this.currentQuestionIndex = 0;
        this.answers = new Array(60).fill(null);
        localStorage.removeItem('sidepick-test-progress');
        localStorage.removeItem('sidepick-test-result');
    }

    // 진행상황 저장
    saveProgress() {
        const data = {
            answers: this.answers,
            currentQuestion: this.currentQuestionIndex,
            timestamp: Date.now()
        };
        localStorage.setItem('sidepick-test-progress', JSON.stringify(data));
    }

    // 화면 전환
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
    }

    // 테스트 시작
    startTest() {
        this.testStartTime = Date.now();
        this.currentQuestionIndex = 0;
        this.answers = new Array(60).fill(null); // 답변 초기화
        
        // 기존 진행상황 삭제
        localStorage.removeItem('sidepick-test-progress');
        
        this.showScreen('question');
        this.updateQuestionDisplay();
        this.updateNavigationButtons();
        
        // 페이지 진입 애니메이션
        this.screens.question.style.animation = 'fadeIn 0.5s ease forwards';
    }

    // 질문 화면 업데이트
    updateQuestionDisplay() {
        // 인덱스가 범위를 벗어나면 첫 번째 질문으로 리셋
        if (this.currentQuestionIndex >= this.totalQuestions) {
            this.currentQuestionIndex = 0;
        }
        if (this.currentQuestionIndex < 0) {
            this.currentQuestionIndex = 0;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        
        // 진행률 업데이트
        this.questionElements.currentNum.textContent = this.currentQuestionIndex + 1;
        const progress = ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
        this.questionElements.progressFill.style.width = `${progress}%`;
        
        // 질문 텍스트 업데이트
        this.questionElements.questionText.textContent = question.text;
        
        // 답변 버튼 상태 업데이트
        this.updateAnswerButtons();
        
        // 애니메이션 효과
        this.questionElements.questionText.style.animation = 'slideIn 0.3s ease forwards';
    }

    // 답변 버튼 상태 업데이트
    updateAnswerButtons() {
        const currentAnswer = this.answers[this.currentQuestionIndex];
        
        this.questionElements.answerButtons.forEach(btn => {
            btn.classList.remove('selected');
            const value = parseInt(btn.dataset.value);
            
            if (currentAnswer === value) {
                btn.classList.add('selected');
            }
        });
    }

    // 네비게이션 버튼 상태 업데이트
    updateNavigationButtons() {
        // 이전 버튼
        this.buttons.prev.disabled = this.currentQuestionIndex === 0;
        
        // 다음 버튼
        const hasAnswer = this.answers[this.currentQuestionIndex] !== null;
        this.buttons.next.disabled = !hasAnswer;
        
        // 마지막 질문이면 "완료" 텍스트로 변경
        if (this.currentQuestionIndex === this.totalQuestions - 1) {
            this.buttons.next.textContent = '완료';
        } else {
            this.buttons.next.textContent = '다음';
        }
    }

    // 답변 선택
    selectAnswer(event) {
        const value = parseInt(event.currentTarget.dataset.value);
        this.answers[this.currentQuestionIndex] = value;
        
        // 버튼 상태 업데이트
        this.updateAnswerButtons();
        this.updateNavigationButtons();
        
        // 진행상황 저장
        this.saveProgress();
        
        // 자동 다음 질문 (선택사항)
        setTimeout(() => {
            if (this.currentQuestionIndex < this.totalQuestions - 1) {
                this.nextQuestion();
            } else {
                // 마지막 질문이면 결과 계산
                this.calculateResults();
            }
        }, 300);
    }

    // 이전 질문
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.updateQuestionDisplay();
            this.updateNavigationButtons();
            this.saveProgress();
        }
    }

    // 다음 질문
    nextQuestion() {
        if (this.currentQuestionIndex < this.totalQuestions - 1) {
            this.currentQuestionIndex++;
            this.updateQuestionDisplay();
            this.updateNavigationButtons();
            this.saveProgress();
        } else {
            // 마지막 질문이면 결과 계산
            this.calculateResults();
        }
    }

    // 결과 계산
    calculateResults() {
        // 로딩 화면 표시
        this.showScreen('loading');
        
        setTimeout(() => {
            // 축별 점수 계산
            const scores = this.calculateAxisScores();
            
            // 성향 유형 결정
            const personalityType = this.determinePersonalityType(scores);
            
            // 결과 저장
            this.saveTestResult(personalityType, scores);
            
            // result.html로 이동
            window.location.href = 'result.html';
            
        }, 2000); // 2초 로딩 시간
    }

    // 축별 점수 계산
    calculateAxisScores() {
        const axisScores = {
            economic: [],
            social: [],
            cultural: [],
            participation: []
        };

        // 각 질문의 답변을 해당 축에 누적
        this.questions.forEach((question, index) => {
            const answer = this.answers[index];
            if (answer !== null && question.axis) {
                let score = answer;
                
                // direction에 따라 점수 조정
                // government, conservative, traditional, expert 방향이면 점수 반전
                if (question.direction === 'government' || 
                    question.direction === 'conservative' || 
                    question.direction === 'traditional' || 
                    question.direction === 'expert') {
                    score = 6 - answer; // 1->5, 2->4, 3->3, 4->2, 5->1
                }
                
                axisScores[question.axis].push(score);
            }
        });

        // 각 축의 평균 계산 후 0-100 범위로 변환
        const averageScores = {};
        Object.keys(axisScores).forEach(axis => {
            const scores = axisScores[axis];
            if (scores.length > 0) {
                const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
                // 1-5 범위를 0-100 범위로 변환
                averageScores[axis] = Math.round(((average - 1) / 4) * 100);
            } else {
                averageScores[axis] = 50; // 기본값
            }
        });

        return averageScores;
    }

    // 성향 유형 결정
    determinePersonalityType(scores) {
        // 각 축의 점수에 따라 성향 코드 생성
        const economicCode = scores.economic >= 50 ? 'M' : 'G'; // Market vs Government
        const socialCode = scores.social >= 50 ? 'P' : 'C'; // Progressive vs Conservative  
        const culturalCode = scores.cultural >= 50 ? 'O' : 'T'; // Open vs Traditional
        const participationCode = scores.participation >= 50 ? 'S' : 'N'; // Social vs iNdividual

        const code = economicCode + socialCode + culturalCode + participationCode;
        
        console.log('계산된 점수:', scores);
        console.log('생성된 코드:', code);
        
        // result-data.js에서 해당 성향 찾기
        const personalityType = personalityResults[code];
        
        if (personalityType) {
            return personalityType;
        } else {
            // 매칭되는 성향이 없으면 가장 가까운 성향 찾기
            console.warn(`성향 코드 ${code}를 찾을 수 없습니다. 기본값 사용.`);
            return personalityResults['MPOS']; // 기본값
        }
    }

    // 점수 차트 업데이트
    updateScoreCharts(scores) {
        const chartBars = {
            economic: this.resultElements.economicBar,
            social: this.resultElements.socialBar,
            cultural: this.resultElements.cultureBar,
            participation: this.resultElements.participationBar
        };

        Object.keys(scores).forEach(axis => {
            const score = scores[axis];
            const percentage = ((score - 1) / 4) * 100; // 1-5를 0-100%로 변환
            const bar = chartBars[axis];
            
            if (score >= 3) {
                // 오른쪽 방향 (50%에서 시작)
                bar.style.width = `${percentage - 50}%`;
                bar.style.marginLeft = '50%';
            } else {
                // 왼쪽 방향 (50%에서 끝)
                bar.style.width = `${50 - percentage}%`;
                bar.style.marginLeft = `${percentage}%`;
            }
        });
    }

    // 테스트 결과 저장
    saveTestResult(personalityType, scores) {
        const result = {
            type: personalityType,
            scores: scores,
            answers: this.answers,
            completedAt: Date.now(),
            testDuration: this.testStartTime ? Date.now() - this.testStartTime : null
        };
        
        localStorage.setItem('sidepick-test-result', JSON.stringify(result));
        localStorage.removeItem('sidepick-test-progress'); // 진행상황 삭제
    }

    // 매칭 받기
    getMatching() {
        // 실제로는 결제 페이지나 매칭 서비스로 이동
        alert('매칭 서비스 페이지로 이동합니다. (개발 중)');
        // window.location.href = '/matching';
    }

    // 결과 저장
    saveResult() {
        alert('결과가 저장되었습니다!');
        // 추가적인 저장 로직 구현 가능
    }

    // 결과 공유
    shareResult() {
        const result = JSON.parse(localStorage.getItem('sidepick-test-result'));
        if (result && navigator.share) {
            navigator.share({
                title: 'SidePick 정치 성향 테스트 결과',
                text: `나의 정치 성향은 "${result.type.name}"입니다!`,
                url: window.location.href
            });
        } else {
            // 브라우저가 Web Share API를 지원하지 않으면 클립보드 복사
            const shareText = `나의 정치 성향은 "${result.type.name}"입니다! SidePick에서 확인해보세요: ${window.location.href}`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert('결과가 클립보드에 복사되었습니다!');
            });
        }
    }

    // 테스트 다시하기
    restartTest() {
        if (confirm('테스트를 다시 시작하시겠습니까? 현재 진행상황이 삭제됩니다.')) {
            // 데이터 초기화
            this.currentQuestionIndex = 0;
            this.answers = new Array(60).fill(null);
            this.testStartTime = null;
            
            // 저장된 데이터 삭제
            localStorage.removeItem('sidepick-test-progress');
            localStorage.removeItem('sidepick-test-result');
            
            // 인트로 화면으로 이동
            this.showScreen('intro');
        }
    }

    // 자동 테스트 완성 (개발용)
    autoCompleteTest(pattern = 'random') {
        if (pattern === 'random') {
            for (let i = 0; i < 60; i++) {
                this.answers[i] = Math.floor(Math.random() * 5) + 1;
            }
        } else if (pattern === 'MPOS') {
            // 시장 다원주의자 패턴
            for (let i = 0; i < 60; i++) {
                if (i < 15) this.answers[i] = Math.random() > 0.5 ? 4 : 5; // 시장경제
                else if (i < 30) this.answers[i] = Math.random() > 0.5 ? 4 : 5; // 진보사회
                else if (i < 45) this.answers[i] = Math.random() > 0.5 ? 1 : 2; // 개방문화 (전통 질문이므로 낮은 점수)
                else this.answers[i] = Math.random() > 0.5 ? 4 : 5; // 시민참여
            }
        }
        
        console.log('자동 완성된 답변:', this.answers);
        
        // 진행상황과 결과 삭제
        localStorage.removeItem('sidepick-test-progress');
        localStorage.removeItem('sidepick-test-result');
        
        // 결과 계산
        this.calculateResults();
    }

    // 키보드 이벤트 처리
    handleKeyboard(event) {
        // 개발자 단축키: Ctrl+Shift+T로 자동 테스트 (개발용)
        // if (event.ctrlKey && event.shiftKey && event.key === 'T') {
        //     this.autoCompleteTest('MPOS');
        //     return;
        // }
        
        if (this.screens.question.classList.contains('active')) {
            // 숫자 키로 답변 선택 (1-5)
            if (event.key >= '1' && event.key <= '5') {
                const value = parseInt(event.key);
                this.answers[this.currentQuestionIndex] = value;
                this.updateAnswerButtons();
                this.updateNavigationButtons();
                this.saveProgress();
                
                // 자동으로 다음 질문으로 이동
                setTimeout(() => {
                    if (this.currentQuestionIndex < this.totalQuestions - 1) {
                        this.nextQuestion();
                    } else {
                        this.calculateResults();
                    }
                }, 300);
            }
            
            // 화살표 키로 네비게이션
            if (event.key === 'ArrowLeft' && !this.buttons.prev.disabled) {
                this.previousQuestion();
            }
            if (event.key === 'ArrowRight' && !this.buttons.next.disabled) {
                this.nextQuestion();
            }
        }
    }
}

// DOM 로드 완료 후 테스트 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 페이지 로드 시 localStorage 완전 정리
    localStorage.removeItem('sidepick-test-progress');
    localStorage.removeItem('sidepick-test-result');
    
    window.sidePickTest = new SidePickTest();
});

// 페이지 언로드 시 진행상황 저장
window.addEventListener('beforeunload', () => {
    const testInstance = window.sidePickTest;
    if (testInstance) {
        testInstance.saveProgress();
    }
});