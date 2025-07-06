// SidePick 프로필 작성 페이지 JavaScript

class ProfileForm {
    constructor() {
        this.formData = {};
        this.uploadedPhotos = [];
        this.maxPhotos = 3;
        
        this.init();
    }

    init() {
        this.cleanupLocalStorage(); // 저장 공간 정리
        this.loadUserPersonality();
        this.setupEventListeners();
        this.loadSavedData();
        this.setupFormValidation();
        this.updateSubmitButtonState(); // 초기 버튼 상태 설정
        
        // 콘솔 로그 지속 설정 (개발자 도구에서 Preserve log 체크)
        console.log('📋 SidePick 프로필 폼 초기화 완료');
        console.log('💡 개발자 도구에서 "Preserve log" 옵션을 체크하면 페이지 이동 후에도 로그를 볼 수 있습니다.');
    }

    // 로컬 스토리지 정리
    cleanupLocalStorage() {
        try {
            // 임시 저장 데이터 정리 (1일 이상 된 데이터 삭제)
            const draft = localStorage.getItem('sidepick-profile-draft');
            if (draft) {
                const draftData = JSON.parse(draft);
                const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
                if (draftData.savedAt && new Date(draftData.savedAt).getTime() < oneDayAgo) {
                    localStorage.removeItem('sidepick-profile-draft');
                    console.log('오래된 임시 저장 데이터를 정리했습니다.');
                }
            }

            // 관리자 백업 데이터 정리 (10개 초과 시 오래된 것부터 삭제)
            const submissions = JSON.parse(localStorage.getItem('sidepick-admin-submissions') || '[]');
            if (submissions.length > 10) {
                const recentSubmissions = submissions.slice(-10);
                localStorage.setItem('sidepick-admin-submissions', JSON.stringify(recentSubmissions));
                console.log('오래된 백업 데이터를 정리했습니다.');
            }
        } catch (error) {
            console.log('로컬 스토리지 정리 중 오류:', error);
        }
    }

    // 사용자 성향 정보 로드
    loadUserPersonality() {
        const savedResult = localStorage.getItem('sidepick-test-result');
        if (savedResult) {
            try {
                const data = JSON.parse(savedResult);
                const personalityType = data.type;
                
                document.getElementById('user-personality-code').textContent = personalityType.code || 'MPOS';
                document.getElementById('user-personality-name').textContent = personalityType.name || '시장 다원주의자';
                document.getElementById('user-personality-desc').textContent = 
                    personalityType.description ? personalityType.description.substring(0, 50) + '...' : 
                    '경제적 자유와 사회적 다양성을 추구하는 성향';
            } catch (e) {
                console.log('성향 정보를 불러올 수 없습니다.');
            }
        }
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 폼 제출 이벤트만 사용 (클릭 이벤트 제거)
        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                console.log('폼 제출 이벤트 발생');
                e.preventDefault(); // 기본 폼 제출 방지
                this.handleSubmit(e);
            });
        }
        
        // 사진 업로드
        this.setupPhotoUpload();
        
        // 자기소개 글자 수 카운트
        const introTextarea = document.querySelector('textarea[name="introduction"]');
        if (introTextarea) {
            introTextarea.addEventListener('input', () => this.updateCharCount(introTextarea));
        }
        
        // 지역 상관없음 체크박스 특수 처리
        const locationAnyCheckbox = document.getElementById('location-any');
        if (locationAnyCheckbox) {
            locationAnyCheckbox.addEventListener('change', () => this.handleLocationAnyChange());
        }
        
        // 나이 범위 검증
        this.setupAgeRangeValidation();
        
        // 실시간 폼 저장
        this.setupAutoSave();
    }

    // 사진 업로드 설정
    setupPhotoUpload() {
        const uploadArea = document.getElementById('photo-upload-area');
        const photoInput = document.getElementById('photo-input');
        const previewGrid = document.getElementById('photo-preview-grid');

        // 클릭으로 파일 선택
        uploadArea.addEventListener('click', () => {
            if (this.uploadedPhotos.length < this.maxPhotos) {
                photoInput.click();
            }
        });

        // 드래그 앤 드롭
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#667eea';
            uploadArea.style.background = '#f8f9ff';
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ccc';
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ccc';
            uploadArea.style.background = '';
            
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            this.handlePhotoFiles(files);
        });

        // 파일 입력 변경
        photoInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handlePhotoFiles(files);
        });
    }

    // 사진 파일 처리
    handlePhotoFiles(files) {
        const validFiles = [];
        
        // 파일 유효성 검증
        for (const file of files) {
            if (this.uploadedPhotos.length + validFiles.length >= this.maxPhotos) {
                this.showNotification(`최대 ${this.maxPhotos}장까지 업로드 가능합니다.`, 'warning');
                break;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB 제한
                this.showNotification(`${file.name}: 파일 크기는 5MB 이하만 가능합니다.`, 'error');
                continue;
            }

            if (!file.type.startsWith('image/')) {
                this.showNotification(`${file.name}: 이미지 파일만 업로드 가능합니다.`, 'error');
                continue;
            }

            validFiles.push(file);
        }

        // 유효한 파일들 처리
        validFiles.forEach((file, index) => {
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const photoData = {
                            file: file,
                            dataUrl: e.target.result,
                            id: Date.now() + Math.random() + index
                        };
                        
                        this.uploadedPhotos.push(photoData);
                        this.updatePhotoPreview();
                        this.updateSubmitButtonState();
                        console.log(`사진 업로드 성공: ${file.name}, 총 ${this.uploadedPhotos.length}장`);
                    } catch (error) {
                        console.error('사진 데이터 처리 오류:', error);
                        this.showNotification(`${file.name}: 사진 처리 중 오류가 발생했습니다.`, 'error');
                    }
                };
                
                reader.onerror = (error) => {
                    console.error('파일 읽기 오류:', error);
                    this.showNotification(`${file.name}: 파일을 읽을 수 없습니다.`, 'error');
                };
                
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('파일 처리 오류:', error);
                this.showNotification(`${file.name}: 파일 처리 중 오류가 발생했습니다.`, 'error');
            }
        });
    }

    // 사진 미리보기 업데이트
    updatePhotoPreview() {
        const previewGrid = document.getElementById('photo-preview-grid');
        previewGrid.innerHTML = '';

        this.uploadedPhotos.forEach((photo, index) => {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'photo-preview';
            
            // dataUrl이 없는 경우 처리
            const imageUrl = photo.dataUrl || (photo.file ? URL.createObjectURL(photo.file) : '');
            
            if (imageUrl) {
                previewDiv.innerHTML = `
                    <img src="${imageUrl}" alt="프로필 사진 ${index + 1}">
                    <button type="button" class="photo-remove" onclick="profileForm.removePhoto(${photo.id})">×</button>
                    ${index === 0 ? '<div class="main-photo-badge">대표사진</div>' : ''}
                `;
            } else {
                previewDiv.innerHTML = `
                    <div class="photo-placeholder">이미지 로딩 중...</div>
                    <button type="button" class="photo-remove" onclick="profileForm.removePhoto(${photo.id})">×</button>
                `;
            }
            
            previewGrid.appendChild(previewDiv);
        });

        // 업로드 영역 표시/숨김
        const uploadPlaceholder = document.querySelector('.upload-placeholder');
        if (this.uploadedPhotos.length >= this.maxPhotos) {
            uploadPlaceholder.style.display = 'none';
        } else {
            uploadPlaceholder.style.display = 'block';
        }
    }

    // 사진 제거
    removePhoto(photoId) {
        this.uploadedPhotos = this.uploadedPhotos.filter(photo => photo.id !== photoId);
        this.updatePhotoPreview();
        this.updateSubmitButtonState();
    }

    // 자기소개 글자 수 카운트
    updateCharCount(textarea) {
        const charCount = document.querySelector('.char-count');
        if (charCount) {
            const currentLength = textarea.value.length;
            charCount.textContent = `${currentLength}/500`;
            
            if (currentLength < 50) {
                charCount.style.color = '#e74c3c';
            } else if (currentLength > 450) {
                charCount.style.color = '#f39c12';
            } else {
                charCount.style.color = '#667eea';
            }
        }
    }

    // 지역 상관없음 처리
    handleLocationAnyChange() {
        const locationAnyCheckbox = document.getElementById('location-any');
        const otherLocationCheckboxes = document.querySelectorAll('input[name="preferredLocation"]:not(#location-any)');
        
        if (locationAnyCheckbox.checked) {
            otherLocationCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.disabled = true;
            });
        } else {
            otherLocationCheckboxes.forEach(checkbox => {
                checkbox.disabled = false;
            });
        }
    }

    // 나이 범위 검증
    setupAgeRangeValidation() {
        const minAgeInput = document.querySelector('input[name="minAge"]');
        const maxAgeInput = document.querySelector('input[name="maxAge"]');

        const validateAgeRange = () => {
            const minAge = parseInt(minAgeInput.value);
            const maxAge = parseInt(maxAgeInput.value);

            if (minAge && maxAge && minAge > maxAge) {
                maxAgeInput.setCustomValidity('최대 나이는 최소 나이보다 커야 합니다.');
            } else {
                maxAgeInput.setCustomValidity('');
            }
        };

        minAgeInput.addEventListener('input', validateAgeRange);
        maxAgeInput.addEventListener('input', validateAgeRange);
    }

    // 자동 저장 설정
    setupAutoSave() {
        const formInputs = document.querySelectorAll('input, select, textarea');
        let autoSaveCount = 0;
        
        formInputs.forEach(input => {
            input.addEventListener('change', () => {
                clearTimeout(this.autoSaveTimeout);
                
                // 자동저장 빈도 제한 (5번마다 한 번만)
                autoSaveCount++;
                if (autoSaveCount % 5 === 0) {
                    this.autoSaveTimeout = setTimeout(() => {
                        // 텍스트 필드만 자동저장 (사진 제외)
                        if (input.type !== 'file') {
                            this.saveDraft(true); // silent save
                        }
                    }, 5000); // 5초로 연장
                }
                
                // 실시간 버튼 상태 업데이트
                this.updateSubmitButtonState();
            });
        });
        
        // 페이지 이탈 시에만 자동저장
        window.addEventListener('beforeunload', () => {
            try {
                this.saveDraft(true);
            } catch (error) {
                console.log('페이지 이탈 시 저장 실패:', error);
            }
        });
    }

    // 제출 버튼 상태 업데이트
    updateSubmitButtonState() {
        const submitButton = document.getElementById('submit-profile');
        if (!submitButton) return;

        const isFormValid = this.checkFormCompleteness();
        
        if (isFormValid) {
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.style.cursor = 'pointer';
        } else {
            submitButton.disabled = true;
            submitButton.style.opacity = '0.5';
            submitButton.style.cursor = 'not-allowed';
        }
    }

    // 폼 완성도 체크
    checkFormCompleteness() {
        // 필수 입력 필드 체크
        const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                return false;
            }
        }

        // 사진 업로드 체크
        if (this.uploadedPhotos.length === 0) {
            return false;
        }

        // 선호 지역 체크
        const preferredLocations = document.querySelectorAll('input[name="preferredLocation"]:checked');
        if (preferredLocations.length === 0) {
            return false;
        }

        // 필수 약관 동의 체크
        const requiredAgreements = document.querySelectorAll('input[name="agreement"][required]');
        for (let agreement of requiredAgreements) {
            if (!agreement.checked) {
                return false;
            }
        }

        return true;
    }

    // 폼 검증 설정
    setupFormValidation() {
        const form = document.getElementById('profile-form');
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            input.addEventListener('invalid', (e) => {
                e.preventDefault();
                this.showFieldError(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    // 필드 오류 표시
    showFieldError(input) {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            
            let errorMsg = formGroup.querySelector('.error-message');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                formGroup.appendChild(errorMsg);
            }
            
            errorMsg.textContent = input.validationMessage;
        }
    }

    // 필드 오류 제거
    clearFieldError(input) {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
            const errorMsg = formGroup.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        }
    }

    // 폼 데이터 수집
    collectFormData() {
        const form = document.getElementById('profile-form');
        const formData = new FormData(form);
        const data = {};

        // 기본 필드 데이터
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        // 사진 데이터 추가
        data.photos = this.uploadedPhotos;

        // 성향 정보 추가
        const savedResult = localStorage.getItem('sidepick-test-result');
        if (savedResult) {
            data.personalityResult = JSON.parse(savedResult);
        }

        return data;
    }

    // 폼 제출 처리
    async handleSubmit(e) {
        e.preventDefault();
        console.log('폼 제출 시작됨');

        // 필수 검증
        console.log('폼 검증 시작');
        if (!this.validateForm()) {
            console.log('폼 검증 실패');
            return;
        }
        console.log('폼 검증 통과');

        const submitButton = document.getElementById('submit-profile');
        const originalText = submitButton.textContent;
        
        try {
            console.log('제출 버튼 비활성화');
            submitButton.disabled = true;
            submitButton.textContent = '제출 중...';

            console.log('폼 데이터 수집 시작');
            const formData = this.collectFormData();
            console.log('폼 데이터 수집 완료:', formData);
            
            // 프로필 데이터 저장
            console.log('로컬 데이터 저장 시작');
            this.saveProfileData(formData);
            console.log('로컬 데이터 저장 완료');
            
            // 관리자용 데이터 저장 후 페이지 이동
            console.log('스프레드시트 저장 시작');
            await this.saveToSpreadsheet(formData);
            console.log('스프레드시트 저장 완료');
            
            // 스프레드시트 저장 완료 후 페이지 이동
            console.log('완료 페이지로 이동');
            window.location.href = 'submit-complete.html';

        } catch (error) {
            console.error('프로필 등록 오류:', error);
            this.showNotification('프로필 등록 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    // 모바일 기기 감지
    isMobileDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // 모바일 기기 체크
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        
        // 갤럭시 기기 특별 체크
        const isGalaxy = /samsung|sm-|galaxy/i.test(userAgent);
        
        console.log('사용자 에이전트:', userAgent);
        console.log('모바일 기기:', isMobile);
        console.log('갤럭시 기기:', isGalaxy);
        
        return isMobile || isGalaxy;
    }

    // 폼 검증
    validateForm() {
        const form = document.getElementById('profile-form');
        console.log('폼 검증 진행 중...');
        
        // HTML5 기본 검증
        console.log('HTML5 기본 검증 시작');
        if (!form.checkValidity()) {
            console.log('HTML5 기본 검증 실패');
            form.reportValidity();
            return false;
        }
        console.log('HTML5 기본 검증 통과');

        // 사진 업로드 검증
        console.log('사진 업로드 검증 - 업로드된 사진 수:', this.uploadedPhotos.length);
        if (this.uploadedPhotos.length === 0) {
            console.log('사진 업로드 검증 실패');
            this.showNotification('프로필 사진을 최소 1장 업로드해주세요.', 'error');
            document.getElementById('photo-upload-area').scrollIntoView({ behavior: 'smooth' });
            return false;
        }
        console.log('사진 업로드 검증 통과');

        // 선호 지역 검증
        const preferredLocations = document.querySelectorAll('input[name="preferredLocation"]:checked');
        console.log('선호 지역 검증 - 선택된 지역 수:', preferredLocations.length);
        if (preferredLocations.length === 0) {
            console.log('선호 지역 검증 실패');
            this.showNotification('선호하는 거주 지역을 최소 1개 선택해주세요.', 'error');
            document.getElementById('preferred-locations').scrollIntoView({ behavior: 'smooth' });
            return false;
        }
        console.log('선호 지역 검증 통과');

        // 필수 약관 동의 검증
        const requiredAgreements = document.querySelectorAll('input[name="agreement"][required]');
        const uncheckedRequired = Array.from(requiredAgreements).filter(input => !input.checked);
        
        if (uncheckedRequired.length > 0) {
            this.showNotification('필수 약관에 모두 동의해주세요.', 'error');
            uncheckedRequired[0].scrollIntoView({ behavior: 'smooth' });
            return false;
        }

        return true;
    }

    // 프로필 데이터 저장
    saveProfileData(data) {
        try {
            // 사진 데이터를 제외한 가벼운 버전만 로컬 스토리지에 저장
            const lightData = {
                ...data,
                photos: data.photos ? data.photos.map(photo => ({
                    id: photo.id,
                    filename: photo.file?.name || 'photo',
                    size: photo.file?.size || 0
                })) : [] // 사진 메타데이터만 저장
            };
            
            localStorage.setItem('sidepick-profile-data', JSON.stringify(lightData));
            console.log('프로필 데이터가 로컬에 저장되었습니다 (사진 제외)');
        } catch (error) {
            console.warn('로컬 스토리지 저장 실패:', error);
            // 로컬 스토리지 저장 실패해도 제출은 계속 진행
        }
        
        // 임시저장 데이터 삭제
        localStorage.removeItem('sidepick-profile-draft');
    }

    // 관리자용 스프레드시트에 데이터 저장
    async saveToSpreadsheet(data) {
        try {
            // 제출 시간 추가
            const submissionTime = new Date().toLocaleString('ko-KR', {
                timeZone: 'Asia/Seoul',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            // 정치 성향 정보 추출
            const personalityInfo = data.personalityResult ? {
                code: data.personalityResult.type?.code || '',
                name: data.personalityResult.type?.name || '',
                motto: data.personalityResult.type?.motto || '',
                economic: data.personalityResult.scores?.economic || 0,
                social: data.personalityResult.scores?.social || 0,
                cultural: data.personalityResult.scores?.cultural || 0,
                participation: data.personalityResult.scores?.participation || 0
            } : {};

            // 이미지를 Google Drive에 업로드하고 링크 생성
            console.log('🖼️ 이미지 Google Drive 업로드 시작, 업로드된 사진 수:', data.photos ? data.photos.length : 0);
            const photoLinks = await this.uploadPhotosToGoogleDrive(data.photos || []);
            console.log('🖼️ 이미지 업로드 완료, 생성된 링크 수:', photoLinks.length);

            // CSV 형태로 구성할 데이터
            const csvData = {
                제출시간: submissionTime,
                성별: data.gender || '',
                나이: data.age || '',
                거주지역: data.location || '',
                실명: data.realName || '',
                별명: data.nickname || '',
                휴대폰번호: data.phoneNumber || '',
                자기소개: (data.introduction || '').replace(/\n/g, ' '), // 줄바꿈 제거
                최소나이: data.minAge || '',
                최대나이: data.maxAge || '',
                선호지역: Array.isArray(data.preferredLocation) ? data.preferredLocation.join(', ') : (data.preferredLocation || ''),
                관계목적: data.relationshipGoal || '',
                성향코드: personalityInfo.code,
                성향명: personalityInfo.name,
                성향모토: personalityInfo.motto,
                경제관점수: personalityInfo.economic,
                사회관점수: personalityInfo.social,
                문화관점수: personalityInfo.cultural,
                참여관점수: personalityInfo.participation,
                프로필사진수: photoLinks.length,
                사진1링크: photoLinks[0] || '',
                사진2링크: photoLinks[1] || '',
                사진3링크: photoLinks[2] || ''
            };

            // 관리자용 Google Sheets에 전송
            await this.sendToGoogleSheets(csvData);
            
        } catch (error) {
            console.error('스프레드시트 저장 오류:', error);
            // 오류가 있어도 제출 과정은 계속 진행
        }
    }

    // 이미지를 Google Drive에 업로드하고 링크 반환 (대체 방안 포함)
    async uploadPhotosToGoogleDrive(photos) {
        const photoLinks = [];
        let driveUploadFailed = false;
        
        for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            try {
                console.log(`📤 이미지 ${i + 1} Google Drive 업로드 시작...`);
                
                let imageFile = null;
                let fileName = `sidepick_profile_${Date.now()}_${i + 1}`;
                
                if (photo.file) {
                    imageFile = photo.file;
                    // 파일명 간단하게 변경 (확장자만 유지)
                    const fileExtension = photo.file.name.split('.').pop().toLowerCase();
                    fileName = `img_${i + 1}_${Date.now().toString().slice(-6)}.${fileExtension}`;
                } else if (photo.dataUrl) {
                    // base64를 Blob으로 변환
                    fileName = `img_${i + 1}_${Date.now().toString().slice(-6)}.jpg`;
                    imageFile = this.dataUrlToFile(photo.dataUrl, fileName);
                }
                
                if (imageFile) {
                    // Google Apps Script를 통해 Google Drive에 업로드
                    const driveLink = await this.uploadToGoogleDriveViaScript(imageFile, fileName);
                    
                    if (driveLink) {
                        photoLinks.push(driveLink);
                        console.log(`✅ 이미지 ${i + 1} 업로드 완료: ${driveLink}`);
                    } else {
                        console.error(`❌ 이미지 ${i + 1} Google Drive 업로드 실패, 대체 방안 사용`);
                        driveUploadFailed = true;
                        
                        // 대체 방안: base64 데이터를 압축하여 저장
                        const fallbackData = await this.createFallbackImageData(photo);
                        photoLinks.push(fallbackData);
                    }
                } else {
                    photoLinks.push('');
                }
                
                // 업로드 간격 조정 (API 제한 대응)
                if (i < photos.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
            } catch (error) {
                console.error(`이미지 ${i + 1} 업로드 오류:`, error);
                driveUploadFailed = true;
                
                // 대체 방안 사용
                const fallbackData = await this.createFallbackImageData(photo);
                photoLinks.push(fallbackData);
            }
        }
        
        const successCount = photoLinks.filter(link => link && !link.startsWith('data:')).length;
        const fallbackCount = photoLinks.filter(link => link && link.startsWith('data:')).length;
        
        console.log(`📁 Google Drive 업로드 완료: ${successCount}/${photos.length}개 성공`);
        if (fallbackCount > 0) {
            console.log(`🔄 대체 방안 사용: ${fallbackCount}개 (압축된 base64 데이터)`);
        }
        // 알림 메시지 제거 (사용자에게 불필요한 정보)
        
        return photoLinks;
    }

    // 대체 방안: 압축된 이미지 데이터 생성
    async createFallbackImageData(photo) {
        try {
            let imageData = '';
            
            if (photo.dataUrl) {
                imageData = photo.dataUrl;
            } else if (photo.file) {
                imageData = await this.fileToBase64(photo.file);
            }
            
            if (imageData) {
                // 적당한 크기로 압축 (스프레드시트 저장용)
                const compressedImage = await this.compressImage(imageData, 0.6, 400); // 60% 품질, 최대 400px
                console.log(`📦 이미지 압축 완료: ${Math.round(compressedImage.length / 1024)}KB`);
                return compressedImage;
            }
            
            return '';
        } catch (error) {
            console.error('대체 방안 생성 오류:', error);
            return '';
        }
    }

    // base64 데이터를 File 객체로 변환
    dataUrlToFile(dataUrl, fileName) {
        try {
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            
            return new File([u8arr], fileName, { type: mime });
        } catch (error) {
            console.error('dataUrl to File 변환 오류:', error);
            return null;
        }
    }

    // Google Apps Script를 통한 Google Drive 업로드 (JSONP 방식)
    async uploadToGoogleDriveViaScript(file, fileName) {
        try {
            console.log(`📁 Google Drive 업로드 시작: ${fileName} (크기: ${Math.round(file.size / 1024)}KB)`);
            
            // 파일을 base64로 변환
            const base64Data = await this.fileToBase64(file);
            
            // 이미지 크기 체크 및 압축 (3MB 이상이면 고화질 압축)
            let finalData = base64Data;
            if (base64Data.length > 3 * 1024 * 1024) {
                console.log('🔄 이미지가 큽니다. 고화질 압축 중...');
                finalData = await this.compressImage(base64Data, 0.8, 1600); // 80% 품질, 최대 1600px
                console.log(`📦 압축 완료: ${Math.round(finalData.length / 1024)}KB`);
            }
            
            return await this.uploadViaJSONP(finalData, fileName, file.type);
            
        } catch (error) {
            console.error('❌ Google Drive 업로드 오류:', error);
            return null;
        }
    }

    // JSONP 방식으로 업로드 (실제 응답 확인 가능)
    uploadViaJSONP(base64Data, fileName, mimeType) {
        return new Promise((resolve) => {
            try {
                // 고유한 콜백 함수명 생성
                const callbackName = `driveCallback_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                
                // 전역 콜백 함수 등록
                window[callbackName] = (result) => {
                    console.log('📥 Google Drive 응답:', result);
                    
                    // 콜백 함수 정리
                    delete window[callbackName];
                    if (document.body.contains(script)) {
                        document.body.removeChild(script);
                    }
                    
                    if (result && result.success && result.shareLink) {
                        console.log(`✅ Google Drive 업로드 성공: ${result.shareLink}`);
                        resolve(result.shareLink);
                    } else {
                        console.error('❌ Google Drive 업로드 실패:', result);
                        resolve(null);
                    }
                };
                
                // URL 파라미터 생성
                const params = new URLSearchParams({
                    action: 'uploadToDrive',
                    fileName: fileName,
                    fileData: base64Data,
                    mimeType: mimeType || 'image/jpeg',
                    callback: callbackName
                });
                
                // JSONP 스크립트 태그 생성
                const script = document.createElement('script');
                script.src = `https://script.google.com/macros/s/AKfycbxFattZ5TVsQY9sr0aZKZgf40WHkbDueYQrCca2ltB4WgCKDX46AmrpTNLRW7rMrPlE/exec?${params.toString()}`;
                
                // 에러 처리
                script.onerror = () => {
                    console.error('❌ 스크립트 로드 실패');
                    delete window[callbackName];
                    if (document.body.contains(script)) {
                        document.body.removeChild(script);
                    }
                    resolve(null);
                };
                
                // 타임아웃 설정 (30초)
                setTimeout(() => {
                    if (window[callbackName]) {
                        console.error('❌ Google Drive 업로드 타임아웃');
                        delete window[callbackName];
                        if (document.body.contains(script)) {
                            document.body.removeChild(script);
                        }
                        resolve(null);
                    }
                }, 30000);
                
                document.body.appendChild(script);
                
            } catch (error) {
                console.error('❌ JSONP 업로드 오류:', error);
                resolve(null);
            }
        });
    }

    // 파일을 공개로 설정하고 공유 링크 생성
    async makeFilePublic(fileId, apiKey) {
        try {
            console.log(`🔗 파일 공개 설정 중: ${fileId}`);
            
            // 파일을 공개로 설정
            const permissionResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: 'reader',
                    type: 'anyone'
                })
            });
            
            if (permissionResponse.ok) {
                console.log(`✅ 파일 공개 설정 완료: ${fileId}`);
                // 직접 접근 가능한 링크 반환
                return `https://drive.google.com/uc?export=view&id=${fileId}`;
            } else {
                console.error('❌ 파일 공개 설정 실패:', permissionResponse.status);
                return `https://drive.google.com/file/d/${fileId}/view`;
            }
            
        } catch (error) {
            console.error('❌ 파일 공개 설정 오류:', error);
            return `https://drive.google.com/file/d/${fileId}/view`;
        }
    }

    // 파일을 base64로 변환하는 헬퍼 함수
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // 이미지 압축 함수 (Google Sheets 용량 제한 대응)
    compressImage(dataUrl, quality = 0.7, maxWidth = 800) {
        return new Promise((resolve) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                img.onload = () => {
                    // 이미지 크기 계산 (비율 유지하면서 최대 크기 제한)
                    let { width, height } = img;
                    
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    if (height > maxWidth) {
                        width = (width * maxWidth) / height;
                        height = maxWidth;
                    }
                    
                    // 캔버스 크기 설정
                    canvas.width = width;
                    canvas.height = height;
                    
                    // 이미지 그리기
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // 압축된 base64 데이터 반환
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedDataUrl);
                };
                
                img.onerror = () => {
                    console.error('이미지 압축 실패, 원본 반환');
                    resolve(dataUrl); // 압축 실패 시 원본 반환
                };
                
                img.src = dataUrl;
            } catch (error) {
                console.error('이미지 압축 오류:', error);
                resolve(dataUrl); // 오류 시 원본 반환
            }
        });
    }

    // CSV 파일 다운로드
    downloadCSV(data, timestamp) {
        try {
            // CSV 헤더와 데이터 생성
            const headers = Object.keys(data);
            const values = Object.values(data);
            
            // CSV 문자열 생성 (쉼표가 포함된 데이터는 따옴표로 감싸기)
            const csvContent = [
                headers.join(','),
                values.map(value => {
                    // 값에 쉼표나 줄바꿈이 있으면 따옴표로 감싸기
                    const stringValue = String(value);
                    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }
                    return stringValue;
                }).join(',')
            ].join('\n');

            // BOM 추가 (한글 깨짐 방지)
            const bom = '\uFEFF';
            const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
            
            // 다운로드 링크 생성
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            
            // 파일명에 타임스탬프 포함
            const filename = `sidepick_profile_${timestamp.replace(/[: ]/g, '_').replace(/\//g, '-')}.csv`;
            link.setAttribute('download', filename);
            
            // 다운로드 실행
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // URL 정리
            URL.revokeObjectURL(url);
            
            console.log('프로필 데이터가 CSV 파일로 저장되었습니다:', filename);
            
        } catch (error) {
            console.error('CSV 다운로드 오류:', error);
        }
    }

    // Google Sheets API 연동
    async sendToGoogleSheets(data) {
        // Google Sheets 설정
        const SPREADSHEET_ID = '1zBnhckh6U5R7MGO73t53h_TNKZkl3T61H0S-3YXMsaY'; // 스프레드시트 ID
        const SHEET_NAME = 'Sheet1'; // 기본 시트명
        const API_KEY = 'AIzaSyCtC6xxMRATlhQTNavPX4HTUaalRW2VpOw'; // API 키
        
        console.log('=== Google Sheets 저장 시작 ===');
        console.log('스프레드시트 ID:', SPREADSHEET_ID);
        console.log('시트명:', SHEET_NAME);
        console.log('전송할 데이터 키:', Object.keys(data));
        
        try {
            // 스프레드시트가 공개되어 있는지 먼저 확인
            const checkUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`;
            console.log('스프레드시트 접근 확인 URL:', checkUrl);
            
            const checkResponse = await fetch(checkUrl);
            console.log('스프레드시트 접근 확인 응답:', checkResponse.status);
            
            if (!checkResponse.ok) {
                const checkError = await checkResponse.text();
                console.error('❌ 스프레드시트 접근 실패:', checkResponse.status, checkError);
                console.log('🔄 Google Apps Script 웹앱으로 전환...');
                
                // 웹앱 방식으로 시도
                return await this.sendToGoogleAppsScript(data);
            } else {
                console.log('✅ 스프레드시트 접근 성공, Google Sheets API로 계속 진행...');
            }
            
            // 데이터 준비
            const values = [Object.values(data)];
            console.log('전송할 데이터 값:', values);
            
            // Google Sheets API 호출
            const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS&key=${API_KEY}`;
            console.log('데이터 추가 URL:', appendUrl);
            
            const response = await fetch(appendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: values
                })
            });
            
            console.log('Google Sheets API 응답 상태:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Google Sheets에 데이터가 저장되었습니다:', result);
                this.showNotification('데이터가 성공적으로 저장되었습니다!', 'success');
                return true;
            } else {
                const errorData = await response.text();
                console.error('❌ Google Sheets 저장 실패:', errorData);
                
                // 웹앱 방식으로 대체 시도
                return await this.sendToGoogleAppsScript(data);
            }
        } catch (error) {
            console.error('❌ Google Sheets 저장 오류:', error);
            
            // 웹앱 방식으로 대체 시도
            return await this.sendToGoogleAppsScript(data);
        }
    }
    
    // Google Apps Script 웹앱으로 바로 시트에 데이터 전송
    async sendToGoogleAppsScript(data) {
        try {
            console.log('🔄 Google Apps Script 웹앱으로 직접 시트에 저장 시도...');
            
            // Google Apps Script 웹앱 URL (최신 배포)
            const webAppUrl = 'https://script.google.com/macros/s/AKfycbxFattZ5TVsQY9sr0aZKZgf40WHkbDueYQrCca2ltB4WgCKDX46AmrpTNLRW7rMrPlE/exec';
            
            // 전송할 데이터 준비 (이미지 데이터 유효성 확인 포함)
            const postData = {
                spreadsheetId: '1zBnhckh6U5R7MGO73t53h_TNKZkl3T61H0S-3YXMsaY',
                sheetName: 'Sheet1',
                data: [
                    data.제출시간 || '',
                    data.성별 || '',
                    data.나이 || '',
                    data.거주지역 || '',
                    data.실명 || '',
                    data.별명 || '',
                    data.휴대폰번호 || '',
                    data.자기소개 || '',
                    data.최소나이 || '',
                    data.최대나이 || '',
                    data.선호지역 || '',
                    data.관계목적 || '',
                    data.성향코드 || '',
                    data.성향명 || '',
                    data.성향모토 || '',
                    data.경제관점수 || '',
                    data.사회관점수 || '',
                    data.문화관점수 || '',
                    data.참여관점수 || '',
                    data.프로필사진수 || '',
                    // 이미지 링크 전송
                    data.사진1링크 || '',
                    data.사진2링크 || '',
                    data.사진3링크 || ''
                ]
            };
            
            console.log('📡 Google Apps Script 웹앱으로 데이터 전송...');
            console.log('웹앱 URL:', webAppUrl);
            console.log('전송 데이터 항목 수:', postData.data.length);
            console.log('🖼️ 사진 링크 확인:');
            console.log('- 사진1 링크:', data.사진1링크 || '없음');
            console.log('- 사진2 링크:', data.사진2링크 || '없음');
            console.log('- 사진3 링크:', data.사진3링크 || '없음');
            
            // 데이터 크기가 너무 큰 경우 분할 전송
            const dataSize = JSON.stringify(postData).length;
            console.log('📊 전송 데이터 크기:', Math.round(dataSize / 1024), 'KB');
            
            if (dataSize > 50 * 1024 * 1024) { // 50MB 이상이면 분할 전송
                console.log('⚠️ 데이터가 너무 큽니다. 분할 전송을 시도합니다...');
                return await this.sendLargeDataInChunks(postData, webAppUrl);
            }
            
            // 일반 전송
            const response = await fetch(webAppUrl, {
                method: 'POST',
                mode: 'no-cors', // CORS 우회
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });
            
            // no-cors 모드에서는 응답 상태를 확인할 수 없음
            console.log('📤 Google Apps Script 웹앱으로 데이터 전송 완료 (no-cors 모드)');
            console.log('✅ 요청이 성공적으로 전송되었습니다 (응답 확인 불가)');
            console.log('⏰ 3초 후 Google Apps Script 실행 로그를 확인해보세요.');
            
            // 백업용으로 로컬에도 저장
            this.saveToLocalStorage(data);
            
            // no-cors 모드에서는 성공으로 간주
            return true;
            
        } catch (error) {
            console.error('❌ Google Apps Script 웹앱 전송 실패:', error);
            
            // 최종 백업: 로컬 저장소에만 저장
            this.saveToLocalStorage(data);
            
            return false;
        }
    }

    // 이미지 데이터 유효성 검증
    validateImageData(imageData) {
        if (!imageData || typeof imageData !== 'string') {
            return null;
        }
        
        // base64 형식 확인
        if (!imageData.startsWith('data:image/')) {
            console.warn('올바르지 않은 이미지 형식');
            return null;
        }
        
        // 크기 제한 (Google Sheets 셀 최대 50KB)
        if (imageData.length > 50000) {
            console.warn(`이미지가 너무 큽니다 (${Math.round(imageData.length / 1024)}KB > 50KB)`);
            // 추가 압축 시도
            return this.truncateImage(imageData);
        }
        
        return imageData;
    }

    // 이미지 데이터 잘라내기 (최후 수단)
    truncateImage(imageData) {
        if (imageData.length <= 50000) {
            return imageData;
        }
        
        console.log('이미지 데이터를 50KB로 자릅니다...');
        const truncated = imageData.substring(0, 49950) + '...';
        return truncated;
    }

    // 대용량 데이터 분할 전송
    async sendLargeDataInChunks(postData, webAppUrl) {
        try {
            // 텍스트 데이터와 이미지 데이터 분리
            const textData = postData.data.slice(0, 20); // 이미지 제외한 텍스트 데이터
            const imageData = postData.data.slice(20, 23); // 이미지 3개
            
            // 1단계: 텍스트 데이터 전송
            const textPostData = {
                ...postData,
                data: [...textData, '', '', ''], // 이미지 필드는 빈 값으로
                step: 'text'
            };
            
            console.log('📤 1단계: 텍스트 데이터 전송...');
            await fetch(webAppUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(textPostData)
            });
            
            // 2단계: 이미지 데이터 개별 전송
            for (let i = 0; i < imageData.length; i++) {
                if (imageData[i]) {
                    const imagePostData = {
                        spreadsheetId: postData.spreadsheetId,
                        sheetName: postData.sheetName,
                        imageIndex: i + 1,
                        imageData: imageData[i],
                        step: 'image'
                    };
                    
                    console.log(`📤 2단계-${i + 1}: 이미지 ${i + 1} 전송...`);
                    await fetch(webAppUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(imagePostData)
                    });
                    
                    // 각 이미지 전송 간 1초 대기
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            console.log('✅ 분할 전송 완료');
            return true;
            
        } catch (error) {
            console.error('❌ 분할 전송 실패:', error);
            return false;
        }
    }
    
    // 첫 번째 제출인지 확인
    async checkIfFirstSubmission() {
        const SPREADSHEET_ID = '1zBnhckh6U5R7MGO73t53h_TNKZkl3T61H0S-3YXMsaY';
        const SHEET_NAME = 'Sheet1';
        const API_KEY = 'AIzaSyCtC6xxMRATlhQTNavPX4HTUaalRW2VpOw';
        
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const result = await response.json();
                // 시트에 데이터가 없으면 첫 번째 제출
                return !result.values || result.values.length === 0;
            }
            return true; // 오류 시에는 헤더를 추가
        } catch (error) {
            console.log('시트 확인 오류 (헤더 추가):', error);
            return true;
        }
    }
    
    // 로컬 저장소에 백업 저장
    saveToLocalStorage(data) {
        try {
            // 사진 데이터 크기 최적화
            const lightData = {
                ...data,
                photos: data.photos ? data.photos.map(photo => ({
                    filename: photo.file?.name || 'photo',
                    size: photo.file?.size || 0,
                    type: photo.file?.type || 'image/*'
                })) : [], // 사진 메타데이터만 저장
                savedAt: new Date().toISOString()
            };
            
            const submissions = JSON.parse(localStorage.getItem('sidepick-admin-submissions') || '[]');
            
            // 저장 공간 관리: 최대 10개 항목만 유지
            if (submissions.length >= 10) {
                submissions.splice(0, submissions.length - 9);
            }
            
            submissions.push(lightData);
            localStorage.setItem('sidepick-admin-submissions', JSON.stringify(submissions));
            console.log('로컬 저장소에 백업되었습니다 (사진 제외).');
        } catch (error) {
            console.error('로컬 저장소 백업 오류:', error);
            
            // 저장 공간 부족 시 기존 데이터 정리 후 재시도
            if (error.name === 'QuotaExceededError') {
                try {
                    localStorage.removeItem('sidepick-admin-submissions');
                    localStorage.setItem('sidepick-admin-submissions', JSON.stringify([{
                        ...data,
                        photos: [], // 사진 제외
                        savedAt: new Date().toISOString(),
                        note: '저장 공간 부족으로 사진 데이터 제외됨'
                    }]));
                    console.log('저장 공간 정리 후 백업 완료');
                } catch (retryError) {
                    console.error('재시도 백업도 실패:', retryError);
                }
            }
        }
    }

    // Google Sheets 헤더 설정 함수 (최초 1회만 실행)
    async setupGoogleSheetsHeaders() {
        const SPREADSHEET_ID = '1zBnhckh6U5R7MGO73t53h_TNKZkl3T61H0S-3YXMsaY';
        const SHEET_NAME = 'SidePick_Users';
        const API_KEY = 'AIzaSyCtC6xxMRATlhQTNavPX4HTUaalRW2VpOw';
        
        const headers = [
            '제출시간', '성별', '나이', '거주지역', '실명', '별명', '휴대폰번호', 
            '자기소개', '최소나이', '최대나이', '선호지역', '관계목적', 
            '성향코드', '성향명', '성향모토', '경제관점수', '사회관점수', 
            '문화관점수', '참여관점수', '프로필사진수', '사진1', '사진2', '사진3'
        ];
        
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A1:append?valueInputOption=RAW&key=${API_KEY}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [headers]
                })
            });
            
            if (response.ok) {
                console.log('Google Sheets 헤더가 설정되었습니다.');
            }
        } catch (error) {
            console.error('헤더 설정 오류:', error);
        }
    }

    // 임시저장
    saveDraft(silent = false) {
        try {
            const formData = this.collectFormData();
            
            // 사진 데이터를 제외한 가벼운 버전으로 임시저장
            const lightFormData = {
                ...formData,
                photos: formData.photos ? formData.photos.map(photo => ({
                    id: photo.id,
                    filename: photo.file?.name || 'photo',
                    size: photo.file?.size || 0,
                    type: photo.file?.type || 'image/*'
                })) : [], // 사진 메타데이터만 저장
                savedAt: new Date().toISOString()
            };
            
            // 기존 임시저장 데이터 크기 확인
            const existingDraft = localStorage.getItem('sidepick-profile-draft');
            if (existingDraft && existingDraft.length > 100000) { // 100KB 이상이면 삭제
                localStorage.removeItem('sidepick-profile-draft');
                console.log('기존 임시저장 데이터가 너무 커서 삭제했습니다.');
            }
            
            localStorage.setItem('sidepick-profile-draft', JSON.stringify(lightFormData));
            
            if (!silent) {
                this.showNotification('임시저장되었습니다.', 'success');
            }
            console.log('임시저장 완료 (사진 제외)');
        } catch (error) {
            console.warn('임시저장 실패:', error);
            
            if (error.name === 'QuotaExceededError') {
                // 할당량 초과 시 기존 데이터 정리
                try {
                    localStorage.removeItem('sidepick-profile-draft');
                    localStorage.removeItem('sidepick-admin-submissions');
                    
                    // 최소한의 데이터만 저장
                    const minimalData = {
                        realName: document.querySelector('input[name="realName"]')?.value || '',
                        phoneNumber: document.querySelector('input[name="phoneNumber"]')?.value || '',
                        savedAt: new Date().toISOString(),
                        note: '저장 공간 부족으로 최소 데이터만 저장됨'
                    };
                    
                    localStorage.setItem('sidepick-profile-draft', JSON.stringify(minimalData));
                    
                    if (!silent) {
                        this.showNotification('저장 공간 부족으로 일부 데이터만 임시저장되었습니다.', 'warning');
                    }
                } catch (retryError) {
                    console.error('재시도 임시저장도 실패:', retryError);
                    if (!silent) {
                        this.showNotification('임시저장에 실패했습니다.', 'error');
                    }
                }
            } else {
                if (!silent) {
                    this.showNotification('임시저장에 실패했습니다.', 'error');
                }
            }
        }
    }

    // 저장된 데이터 로드
    loadSavedData() {
        const savedDraft = localStorage.getItem('sidepick-profile-draft');
        if (savedDraft) {
            try {
                const data = JSON.parse(savedDraft);
                this.fillFormWithData(data);
            } catch (e) {
                console.log('저장된 임시 데이터를 불러올 수 없습니다.');
            }
        }
    }

    // 폼에 데이터 채우기
    fillFormWithData(data) {
        Object.keys(data).forEach(key => {
            if (key === 'photos') {
                // 임시저장된 photos는 메타데이터만 있으므로 스킵
                // (실제 이미지 데이터가 없어서 미리보기가 불가능)
                if (data[key] && data[key].length > 0 && data[key][0].dataUrl) {
                    this.uploadedPhotos = data[key] || [];
                    this.updatePhotoPreview();
                }
                return;
            }

            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'radio' || input.type === 'checkbox') {
                    if (Array.isArray(data[key])) {
                        data[key].forEach(value => {
                            const specificInput = document.querySelector(`[name="${key}"][value="${value}"]`);
                            if (specificInput) specificInput.checked = true;
                        });
                    } else {
                        const specificInput = document.querySelector(`[name="${key}"][value="${data[key]}"]`);
                        if (specificInput) specificInput.checked = true;
                    }
                } else {
                    input.value = data[key];
                }
            }
        });
    }

    // 계좌 정보 복사
    copyAccountInfo() {
        const accountInfo = `신한은행 110-386-140132 (배은호)\n입금자명: 휴대폰 뒷자리 4자리`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(accountInfo).catch(() => {
                this.fallbackCopy(accountInfo);
            });
        } else {
            this.fallbackCopy(accountInfo);
        }
    }

    // 대체 복사 방법
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (e) {
            console.log('복사 실패');
        }
        
        document.body.removeChild(textArea);
    }

    // 결제 안내 모달 표시
    showPaymentModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 2.5rem;
            border-radius: 20px;
            max-width: 500px;
            margin: 1rem;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
        `;

        modalContent.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
            <h2 style="color: #2c3e50; margin-bottom: 1rem; font-size: 1.5rem;">신청이 완료되었습니다!</h2>
            <p style="color: #666; margin-bottom: 2rem; line-height: 1.6;">
                아래 계좌로 <strong style="color: #e74c3c;">입금을 완료해야</strong><br>
                매칭 서비스가 시작되며,<br>
                입금 확인 후 <strong>24시간 내에 매칭 결과</strong>를 안내드립니다.
            </p>
            
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 2px solid #e9ecef;">
                <h3 style="color: #2c3e50; margin-bottom: 1rem; font-size: 1.2rem;">입금 정보</h3>
                <div style="margin-bottom: 0.8rem;">
                    <span style="color: #666; font-weight: 500;">은행:</span>
                    <span style="color: #2c3e50; font-weight: bold; margin-left: 0.5rem;">신한은행</span>
                </div>
                <div style="margin-bottom: 0.8rem;">
                    <span style="color: #666; font-weight: 500;">계좌번호:</span>
                    <span style="color: #2c3e50; font-weight: bold; margin-left: 0.5rem;">110-386-140132</span>
                    <button id="copy-account-btn" style="margin-left: 0.5rem; background: #667eea; color: white; border: none; padding: 0.3rem 0.8rem; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">복사</button>
                </div>
                <div style="margin-bottom: 0.8rem;">
                    <span style="color: #666; font-weight: 500;">예금주:</span>
                    <span style="color: #2c3e50; font-weight: bold; margin-left: 0.5rem;">배은호</span>
                </div>
                <div style="margin-bottom: 0.8rem;">
                    <span style="color: #666; font-weight: 500;">금액:</span>
                    <span style="color: #e74c3c; font-weight: bold; margin-left: 0.5rem; font-size: 1.1rem;">6,900원</span>
                </div>
            </div>
            
            <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; border-left: 4px solid #ffc107;">
                <p style="color: #856404; font-weight: 500; margin: 0; font-size: 0.9rem;">
                    ⚠️ 입금자명을 휴대폰 번호 뒷자리 4자리로 해주세요
                </p>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button id="close-modal-btn" style="background: #6c757d; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 25px; cursor: pointer; font-weight: 600;">닫기</button>
                <button id="go-home-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 25px; cursor: pointer; font-weight: 600;">홈으로 가기</button>
            </div>
        `;

        // CSS 애니메이션 추가
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // 이벤트 리스너
        modalContent.querySelector('#copy-account-btn').addEventListener('click', () => {
            copyAccountNumber();
        });

        modalContent.querySelector('#close-modal-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modalContent.querySelector('#go-home-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // 알림 표시
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const bgColors = {
            success: '#28a745',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#17a2b8'
        };
        
        notification.style.background = bgColors[type] || bgColors.success;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 계좌번호 복사 함수 (전역)
function copyAccountNumber() {
    const accountNumber = '110-386-140132';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(accountNumber).then(() => {
            profileForm.showNotification('계좌번호가 복사되었습니다!');
        }).catch(() => {
            profileForm.fallbackCopy(accountNumber);
            profileForm.showNotification('계좌번호가 복사되었습니다!');
        });
    } else {
        profileForm.fallbackCopy(accountNumber);
        profileForm.showNotification('계좌번호가 복사되었습니다!');
    }
}

// 전역 변수로 인스턴스 생성
let profileForm;

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    profileForm = new ProfileForm();
});