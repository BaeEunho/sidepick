# Google Sheets API 설정 가이드

SidePick 프로필 데이터를 Google Sheets에 자동으로 저장하기 위한 설정 방법입니다.

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트명: `SidePick-Data` (또는 원하는 이름)

### 1.2 필요한 API 활성화
1. 좌측 메뉴 → "API 및 서비스" → "라이브러리"
2. **Google Sheets API** 검색 후 선택 → "사용 설정" 클릭
3. **Google Drive API** 검색 후 선택 → "사용 설정" 클릭

### 1.3 API 키 생성
1. 좌측 메뉴 → "API 및 서비스" → "사용자 인증 정보"
2. "사용자 인증 정보 만들기" → "API 키"
3. 생성된 API 키 복사 (예: `AIzaSyBvOiM9S30ChIuD3Ge4E6ShL-Y4_CpqFoo`)

### 1.4 API 키 제한 설정 (보안)
1. 생성된 API 키 클릭
2. "애플리케이션 제한사항" → "HTTP 리퍼러(웹사이트)" 선택
3. 웹사이트 제한사항에 도메인 추가:
   - `localhost:*` (개발용)
   - `your-domain.com/*` (실서버용)
4. "API 제한사항" → "키 제한" 선택
5. **"Google Sheets API"와 "Google Drive API"** 모두 선택 후 저장

## 2. Google Sheets 설정

### 2.1 스프레드시트 생성
1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성
3. 이름을 "SidePick 사용자 데이터"로 변경
4. 첫 번째 시트명을 "SidePick_Users"로 변경

### 2.2 스프레드시트 ID 확인
URL에서 스프레드시트 ID 복사:
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
```
예: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### 2.3 공유 설정
1. 스프레드시트 우상단 "공유" 클릭
2. "일반 액세스" → "링크가 있는 모든 사용자" 선택
3. 권한을 "편집자"로 설정
4. "완료" 클릭

## 3. Google Drive 폴더 설정 (선택사항)

### 3.1 전용 폴더 생성
1. [Google Drive](https://drive.google.com) 접속
2. "새로 만들기" → "폴더" 클릭
3. 폴더명: "SidePick 프로필 이미지" 입력
4. "만들기" 클릭

### 3.2 폴더 ID 확인
1. 생성된 폴더 클릭하여 열기
2. 주소창에서 폴더 ID 복사
```
https://drive.google.com/drive/folders/1ieT-m38FgzhhpAtSiTIH9K_h0Qyzy7Qe
폴더 ID: 1ieT-m38FgzhhpAtSiTIH9K_h0Qyzy7Qe
```

## 4. 코드에 설정값 입력

`profile-script.js` 파일에서 다음 값들을 수정하세요:

```javascript
// Google Sheets 및 Drive 설정
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // ← 2.2에서 복사한 스프레드시트 ID
const SHEET_NAME = 'SidePick_Users'; // ← 시트명 (변경했다면 수정)
const API_KEY = 'YOUR_API_KEY'; // ← 1.3에서 생성한 API 키 (Sheets + Drive 권한)
const DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID'; // ← 3.2에서 복사한 폴더 ID (선택사항)
```

### 실제 예시:
```javascript
const SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
const SHEET_NAME = 'SidePick_Users';
const API_KEY = 'AIzaSyBvOiM9S30ChIuD3Ge4E6ShL-Y4_CpqFoo';
const DRIVE_FOLDER_ID = '1ieT-m38FgzhhpAtSiTIH9K_h0Qyzy7Qe';
```

## 4. 헤더 행 설정 (최초 1회)

브라우저 개발자 도구(F12)에서 다음 코드를 실행하여 헤더를 설정하세요:

```javascript
// 프로필 폼 인스턴스가 있을 때 실행
if (typeof profileForm !== 'undefined') {
    profileForm.setupGoogleSheetsHeaders();
}
```

## 5. 저장되는 데이터 항목

다음 항목들이 Google Sheets에 자동으로 저장됩니다:

| 열 | 항목 | 설명 |
|---|---|---|
| A | 제출시간 | 프로필 제출 시각 |
| B | 성별 | 남성/여성 |
| C | 나이 | 만 나이 |
| D | 거주지역 | 시/도 |
| E | 실명 | 사용자 실명 |
| F | 별명 | 닉네임 |
| G | 휴대폰번호 | 연락처 |
| H | 자기소개 | 프로필 소개글 |
| I | 최소나이 | 선호 나이 범위 하한 |
| J | 최대나이 | 선호 나이 범위 상한 |
| K | 선호지역 | 선호하는 거주지역 |
| L | 관계목적 | 연애/친구/열린관계 |
| M | 성향코드 | 정치성향 코드 (예: MPOS) |
| N | 성향명 | 성향 이름 |
| O | 성향모토 | 성향 설명 |
| P | 경제관점수 | 경제관 점수 (0-100) |
| Q | 사회관점수 | 사회관 점수 (0-100) |
| R | 문화관점수 | 문화관 점수 (0-100) |
| S | 참여관점수 | 참여관 점수 (0-100) |
| T | 프로필사진수 | 업로드된 사진 개수 |
| U | 사진1링크 | 첫 번째 사진 Google Drive 링크 |
| V | 사진2링크 | 두 번째 사진 Google Drive 링크 |
| W | 사진3링크 | 세 번째 사진 Google Drive 링크 |

## 6. 보안 주의사항

⚠️ **중요**: API 키가 노출되지 않도록 주의하세요.

### 개발 환경에서만 사용하는 경우:
- 현재 설정으로 충분합니다.

### 실제 서비스에서 사용하는 경우:
- 서버 사이드에서 API 키를 관리하고 프론트엔드에서는 서버로 데이터를 전송하는 방식을 권장합니다.
- 또는 Google Apps Script를 활용한 웹앱 URL로 데이터를 전송하는 방법도 있습니다.

## 7. 테스트

설정 완료 후:
1. 프로필 작성 페이지에서 테스트 데이터 입력
2. "프로필 작성 완료 및 결제하기" 버튼 클릭
3. Google Sheets에서 데이터 확인

문제가 있다면 브라우저 개발자 도구의 콘솔에서 오류 메시지를 확인하세요.