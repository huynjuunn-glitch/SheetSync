# 케이크 가게 주문 관리 시스템

구글 시트와 연동된 케이크 주문 관리 웹 애플리케이션입니다.

## Vercel 배포 가이드

### 1. 프로젝트 설정
- Vercel에서 새 프로젝트 생성
- Root Directory를 `client`로 설정
- Framework Preset: `Vite`

### 2. 환경변수 설정 (선택사항)
Vercel 대시보드에서 다음 환경변수를 설정할 수 있습니다:
- `GOOGLE_API_KEY`: Google Sheets API 키
- `GOOGLE_SHEET_ID`: 구글 시트 ID
- `GOOGLE_SHEET_NAME`: 시트 이름 (기본값: Sheet1)

> **참고**: 환경변수를 설정하지 않아도 앱 내 관리자 설정에서 입력 가능합니다.

### 3. 배포
- `Deploy` 버튼 클릭
- 자동으로 빌드 및 배포 완료

### 4. 사용법
1. 배포된 사이트에서 관리자 설정 아이콘 클릭
2. Google API 키, 시트 ID, 시트 이름 입력
3. "주문 조회" 버튼으로 데이터 동기화
4. 날짜 선택하여 주문 조회 및 통계 확인

## 로컬 개발

\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

## 주요 기능
- 구글 시트 데이터 실시간 동기화
- 날짜 기반 주문 조회
- 케이크 속성별 통계 분석
- 반응형 웹 디자인