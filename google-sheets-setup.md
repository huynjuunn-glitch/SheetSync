# 구글 시트 연동 설정 가이드

현재 구글 시트 API에서 **403 권한 오류**가 발생하고 있습니다.

## 해결 방법:

### 1. 구글 시트 공개 설정
1. 구글 시트를 열고 우측 상단 **공유** 버튼 클릭
2. **일반 액세스**를 **"링크가 있는 모든 사용자"**로 변경
3. 권한을 **"뷰어"**로 설정

### 2. Google Cloud Console API 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 또는 선택
3. **API 및 서비스** > **라이브러리**에서 **Google Sheets API** 활성화
4. **사용자 인증 정보**에서 **API 키** 생성
5. API 키 **제한 사항**에서 **Google Sheets API**만 허용

### 3. 현재 테스트 정보
- API 키: AIzaSyCYEMuw-k4sc_68scPThQQ7HmaKmHIn_hY
- 시트 ID: 1j3XvcpJgjYnqcnk1WXxWv6a19ugiwhjExRRWSun52kk
- 시트 이름: 주문정보

### 4. 시트 구조 (A열부터 K열)
| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| 이름 | 디자인 | 주문일자 | 픽업일자 | 맛선택 | 시트 | 사이즈 | 크림 | 요청사항 | 특이사항 | 주문경로 |

## 임시 해결책
현재는 샘플 데이터로 앱이 정상 작동함을 확인할 수 있습니다.