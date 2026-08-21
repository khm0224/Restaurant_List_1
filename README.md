# 봄내로그 (Bomnaelog)

춘천시 지역 음식점을 중심으로 동네별 맛집을 탐색하고, 지도에서 위치를 확인하며, 식당 상세 정보를 살펴볼 수 있는 정적 웹 애플리케이션입니다.

이 프로젝트는 실제 백엔드 서버 없이 HTML, CSS, JavaScript만으로 구성된 프론트엔드형 서비스로, 로컬 환경에서 간단히 실행할 수 있습니다. 사용자는 동네, 음식 종류, 식당명을 기준으로 식당을 찾고, 지도와 길찾기, 즐겨찾기, 상세 페이지, 리뷰/댓글 기능을 통해 맛집 탐색 경험을 제공합니다.

---

## 프로젝트 소개

### 핵심 목표

- 춘천 내 동네/업종별 음식점 정보를 한눈에 탐색할 수 있도록 제공
- 지도 기반으로 식당 위치와 행정동 경계를 직관적으로 확인
- 정적 웹 환경에서도 로그인/프로필/즐겨찾기 같은 사용자 경험 구현
- 학습용 프로젝트로서 데이터 구조와 UI 로직을 분리해 유지보수하기 쉽게 구성

### 프로젝트 컨셉

봄내로그는 "춘천 구석구석 맛집 찾기"를 주제로 한 지역 기반 음식점 탐색 서비스입니다. 사용자는 메인 페이지에서 지역을 고르거나, 검색창을 통해 식당을 찾고, 이동 보조 도구와 리뷰 정보를 함께 확인할 수 있습니다.

이 프로젝트는 실제 배포용 서비스라기보다, 프론트엔드 동작과 UI/UX를 학습하고 구현해보는 데 초점을 두고 있으며, 데이터는 로컬 JavaScript 객체와 CSV/GeoJSON 파일을 활용합니다.

---

## 주요 기능

### 1. 동네 기반 맛집 탐색

- 메인 페이지에서 춘천 행정동을 선택 가능
- 행정동별로 음식점을 카테고리별로 필터링
- 상단/사이드바에서 동네와 업종을 변경하며 목록 실시간 갱신
- 식당 카드 클릭 시 상세 페이지 이동

### 2. 업종 필터 기능

지원 업종은 다음과 같습니다.

- 한식
- 일식
- 중식
- 양식
- 디저트

사용자는 선택한 지역을 기준으로 업종별 식당 목록을 빠르게 좁혀 볼 수 있으며, 목록과 지도 마커가 함께 동기화됩니다.

### 3. 지도 시각화

- Kakao Maps 기반으로 식당 위치 마커 표시
- 행정동/시 경계 GeoJSON 데이터를 이용해 지역 경계 표시
- 선택한 동네에 따라 테두리와 강조 스타일 동기화
- 마커 클릭 시 식당 정보창 표시
- 길찾기 기능 및 현재 위치 기반 UI 구성
메인 미니 지도(`js/restaurant_homepageMap.js`)와 맛집 탐색 지도(`js/restaurantMap.js`)는 모두 Google Maps JavaScript API를 사용합니다. 
<- 메인 지도는 카카오 지도로 변경

### 4. 상세 페이지 기능

- 식당명, 주소, 평점, 리뷰 수 표시
- 메뉴/사진/리뷰/댓글 UI 구성
- 식당별로 이미지, 평점, 위치 정보를 볼 수 있음
- 리뷰 및 댓글 작성 기능이 브라우저 localStorage에 저장됨

### 5. 공통 헤더 검색

- 모든 페이지에 공통으로 적용되는 헤더 검색 기능
- 검색어 입력 시 자동완성 드롭다운 제공
- 검색 대상은 다음 우선순위로 판별
  1. 동네 이름
  2. 음식 종류
  3. 식당명
- 검색 결과가 있으면 해당 식당 상세 페이지 또는 맛집 탐색 페이지로 이동

### 6. 회원 기능 (시뮬레이션)

브라우저 기반으로 동작하는 데모 인증 기능이 포함되어 있습니다.

- 회원가입
- 로그인
- 로그아웃
- 아이디 찾기
- 비밀번호 재설정
- 프로필 메뉴 표시
- 관리자 계정 시드 생성

모든 데이터는 localStorage와 쿠키를 활용하며, 실제 서버/DB가 없으므로 데모용 구현입니다.

### 7. 즐겨찾기 기능

- 식당을 즐겨찾기 목록에 추가/삭제 가능
- 브라우저 로컬 데이터 기반으로 저장
- 맛집 탐색 페이지에서 즐겨찾기 버튼 및 목록 표시 지원

### 8. 길찾기 및 현재 위치 기능

- 지도에서 출발지/도착지 설정 가능
- 사용자 위치를 기준으로 경로 탐색 흐름 제공
- 경로 탐색 UI와 지도 컨트롤 구성

### 9. 공지사항 / 뉴스 영역

- 메인 페이지에서 공지사항, 소식, 지역 정보를 보여주는 영역이 존재
- 게시판형 동작이 아닌 정적 콘텐츠 기반으로 구성

---

## 기술 스택

### Frontend

- HTML5
- CSS3
- JavaScript (ES6+)
- Kakao Maps JavaScript API
- Google Maps JavaScript API (관련 설정이 남아 있는 구조)

### Data & Storage

- CSV 데이터 파일
- GeoJSON 경계 데이터
- localStorage
- document.cookie 기반 로그인 쿠키

### Design / UI

- 반응형 레이아웃
- 공통 헤더 컴포넌트
- 카드형 식당 목록 UI
- 지도 정보창과 탐색 패널 UI

### 개발 특성

- 별도의 빌드 툴 없이 정적 파일로 구성
- 브라우저에서 직접 실행 가능
- `fetch`로 HTML 컴포넌트와 GeoJSON 데이터를 불러오는 구조

---

## 프로젝트 구조

```text
Restaurant_List/
├── index.html
├── README.md
├── css/
│   ├── announcement.css
│   ├── favorites.css
│   ├── food_page.css
│   ├── header.css
│   ├── homepageRestaurantRanking.css
│   ├── main_info.css
│   ├── main_page_style.css
│   ├── my_info.css
│   ├── restaurant_detail.css
│   └── auth/
│       ├── find_account.css
│       ├── login_page.css
│       ├── signup_page.css
│       └── user_menu.css
├── data/
│   └── area/
│       ├── chuncheon-admin-dong.geojson
│       └── chuncheon-city-boundary.geojson
├── docs/
│   └── auth-guide.md
├── html/
│   ├── compare_restaurants.html
│   ├── food_page.html
│   ├── restaurant_detail.html
│   ├── auth/
│   │   ├── find_account.html
│   │   ├── login_page.html
│   │   └── signup_page.html
│   ├── components/
│   │   └── header.html
│   ├── main/
│   │   ├── announcement.html
│   │   ├── Chuncheon_illustrations.html
│   │   ├── main_info.html
│   │   └── news.html
│   └── user_information/
│       ├── my_activity.html
│       └── my_info.html
├── img/
│   └── foodlist/
├── js/
│   ├── announcement.js
│   ├── board.js
│   ├── compareRestaurants.js
│   ├── directionsController.js
│   ├── directionsService.js
│   ├── food_page.js
│   ├── geolocationService.js
│   ├── header.js
│   ├── headerSearch.js
│   ├── homepageRestaurantRanking.js
│   ├── main_hero-slider.js
│   ├── main.js
│   ├── map-config-KakaoJS.js
│   ├── map-config-KakaoRest.js
│   ├── map-config.js
│   ├── my_activity.js
│   ├── my_info.js
│   ├── nearbyRestaurantService.js
│   ├── news.js
│   ├── places-photos.js
│   ├── region-slider.js
│   ├── restaurant_homepageMap.js
│   ├── restaurantData.js
│   ├── restaurantDetail.js
│   ├── restaurantDetailMap.js
│   ├── restaurantExplorer.js
│   ├── restaurantMap.js
│   ├── restaurantService.js
│   └── auth/
│       ├── auth.js
│       ├── favorites.js
│       ├── findAccount.js
│       ├── login_modal.js
│       ├── login.js
│       ├── profileMenu.js
│       └── signup.js
├── 전국_음식점_정보csv/
│   ├── filter_file_*.csv
│   ├── res_Food_List.csv
│   ├── res_Food_List_geocoded.csv
│   ├── title.csv
│   └── ...
└── ...
```

---

## 주요 파일 설명

### 1. `index.html`

메인 랜딩 페이지입니다. 히어로 섹션, 지역 선택 버튼, 추천 맛집 슬라이더, 커뮤니티/공지 관련 영역이 구성되어 있습니다.

### 2. `html/food_page.html`

지역과 업종 기반 탐색용 페이지입니다. 좌측 목록, 우측 지도, 동네/카테고리 필터, 길찾기 패널이 포함됩니다.

### 3. `js/restaurantData.js`

프로젝트의 핵심 데이터 구조 파일입니다. 지역별 업종별 식당 배열을 정의하고 전역 객체 `window.restaurantData`로 저장합니다. 검색, 카드 목록, 상세 페이지 이동, 자동완성 기능의 근간이 됩니다.

### 4. `js/restaurantMap.js`

지도 초기화, 마커 생성, 경계 오버레이, 지역 강조, 식당 정보창 표시 로직을 담당합니다.

### 5. `js/restaurantExplorer.js`

URL 파라미터를 읽어 현재 동네/카테고리 상태를 적용하고, 식당 목록과 지도 마커를 동기화합니다.

### 6. `js/headerSearch.js`

공통 헤더 검색창에서 발생하는 입력, 클릭, Enter, 자동완성 동작을 처리합니다. 검색 결과에 따라 상세 페이지 또는 탐색 페이지로 이동합니다.

### 7. `js/auth/auth.js`

회원 저장소, 쿠키 처리, 로그인 상태 확인, 관리자 시드 생성 등의 인증 로직 중앙 관리 파일입니다.

### 8. `js/auth/login.js`

로그인/로그아웃 절차와 헤더 갱신을 담당합니다.

### 9. `js/auth/profileMenu.js`

로그인 상태에서 프로필 메뉴 드롭다운 UI와 사용자 표시를 처리합니다.

### 10. `js/restaurantDetail.js`

식당 상세 페이지에서 식당 정보를 렌더링하고, 리뷰/댓글을 화면에 표시하는 로직입니다.

---

## 데이터 흐름

### 식당 데이터 흐름

```text
restaurantData.js
  -> 식당 정보 객체 생성
  -> headerSearch.js / restaurantExplorer.js / restaurantDetail.js
  -> 지도 마커 / 리스트 렌더링 / 상세 정보 표시
```

### 지도 데이터 흐름

```text
data/area/chuncheon-admin-dong.geojson
  -> restaurantMap.js
  -> 행정동 경계 렌더링

data/area/chuncheon-city-boundary.geojson
  -> restaurantMap.js
  -> 춘천시 경계 표시
```

### 검색 데이터 흐름

```text
헤더 검색 입력
  -> headerSearch.js
  -> restaurantData.js로 검색 대상 조회
  -> district / category / 식당명 판별
  -> food_page.html 또는 restaurant_detail.html 이동
```

### 인증 데이터 흐름

```text
회원가입/로그인 폼
  -> auth.js
  -> localStorage userAccounts 저장
  -> loginUser 쿠키 저장
  -> profileMenu.js / login.js로 UI 갱신
```

---

## 실행 방법

이 프로젝트는 서버 프레임워크 없이 정적 파일 기반으로 구성되어 있으므로, 브라우저에서 직접 파일을 열기보다 로컬 HTTP 서버를 통해 실행하는 것을 권장합니다.

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/Restaurant_List.git
cd Restaurant_List
```

### 2. 로컬 서버 실행

Python을 사용한 경우:

```bash
python -m http.server 8000
```

그 다음 브라우저에서 다음 주소를 접속합니다.

```text
http://localhost:8000/index.html
```

### 3. 브라우저 접속

- 메인 페이지: `http://localhost:8000/index.html`
- 맛집 탐색 페이지: `http://localhost:8000/html/food_page.html`
- 상세 페이지는 식당 데이터 선택 시 동적으로 이동됩니다.

> 주의: 이 프로젝트는 `fetch`를 통해 HTML 컴포넌트, GeoJSON, CSV 파일을 불러오므로 파일 경로로 직접 열면 일부 기능이 정상 동작하지 않을 수 있습니다.

---

## 지도 API 설정

현재 프로젝트는 Kakao Maps를 중심으로 동작하고 있으며, 일부 구조에서는 Google Maps 관련 설정도 포함되어 있습니다.

### Kakao Maps

`js/map-config-KakaoJS.js` 또는 관련 설정 파일에서 API 키를 관리합니다.

```
window.KAKAO_JS_MAPS_API_KEY
```

이 값이 유효하지 않으면 지도는 비활성화되며, 사용자에게 안내 메시지가 표시됩니다.

### Google Maps

기존 구조상 Google Maps 기반 로직도 일부 남아 있으며, `js/map-config.js` 또는 관련 파일에서 키를 연결할 수 있도록 설계되어 있습니다. 실제 운영 환경에서는 민감한 API 키를 공개 저장소에 커밋하지 않는 것이 안전합니다.

---

## 인증 및 브라우저 저장소 동작

### 저장 방식

- 회원 정보: `localStorage`의 `userAccounts`
- 로그인 상태: `loginUser` 쿠키
- 리뷰/댓글: `localStorage`
- 즐겨찾기: `localStorage`

### 특이점

이 프로젝트는 서버를 두지 않고 브라우저에서만 동작하는 데모 앱입니다. 즉,

- 회원 정보가 실제 DB에 저장되지 않음
- 다른 브라우저 또는 기기에서 동일 계정 정보 유지 불가
- 데이터가 삭제되면 초기화됨
- 실제 서비스 확장 시 서버와 데이터베이스가 필요함

### 관리자 계정

`js/auth/auth.js`에 관리자 계정이 시드로 주입됩니다.

```text
id: admin
pw: admin1234
```

이 계정은 데모용으로만 사용되며, 실제 운영 환경에서는 보안상 제거해야 합니다.

---

## 맛집 탐색 로직 상세

### 동네 및 업종 선택 흐름

1. 사용자가 메인 화면 또는 탐색 화면에서 동네 선택
2. URL 쿼리 파라미터가 생성되거나 읽어짐
3. `restaurantExplorer.js`가 현재 선택 상태를 반영
4. 식당 목록 렌더링
5. 지도 마커 및 행정동 경계 강조
6. 카드 클릭 시 상세 페이지 이동

### 검색 로직

검색어는 우선순위에 따라 다음 방식으로 판단됩니다.

- 동네 이름 일치 시: 해당 동네의 전체 업종 목록 이동
- 업종명 일치 시: 전체 동네 범위 중 해당 업종 필터 적용
- 식당명 일치 시: 상세 페이지로 이동
- 검색어 없음: 현재 화면 유지
- 일치 항목이 없을 경우: 검색 결과 없음 메시지 표시

### 자동완성 기능

`headerSearch.js`는 입력 이벤트를 감지해, 사용자 입력 문자열을 포함하는 식당 이름을 최대 8개까지 보여줍니다. 각 항목은 아래 정보를 표시합니다.

- 식당명
- 동네
- 업종

클릭 시 즉시 해당 식당의 상세 페이지로 이동합니다.

---

## 화면 구성

| 화면 | 경로 | 설명 |
| --- | --- | --- |
| 메인 화면 | `index.html` | 추천 맛집, 지역 선택, 행사/공지/소식 영역 |
| 맛집 탐색 | `html/food_page.html` | 동네/업종 기반 식당 목록 및 지도 |
| 식당 상세 | `html/restaurant_detail.html` | 식당 정보, 메뉴, 리뷰, 댓글, 위치 안내 |
| 로그인 | `html/auth/login_page.html` | 로그인 폼 및 인증 모달 |
| 회원가입 | `html/auth/signup_page.html` | 회원 생성 페이지 |
| 아이디/비밀번호 찾기 | `html/auth/find_account.html` | 계정 찾기 기능 |
| 마이 페이지 | `html/user_information/my_info.html` | 내 정보/활동 페이지 |
| 공지사항/뉴스 | `html/main/*.html` | 정적 정보 페이지 |

---

## 주요 구현 포인트

### 1. 공통 헤더 구조

- `html/components/header.html`에 공통 헤더 구조가 포함됨
- 페이지마다 `header.js`가 이 구조를 불러와 삽입
- 검색 기능은 각 페이지마다 따로 만들지 않고 전역적으로 처리

### 2. 모듈화된 JS 구조

- 데이터 관리: `restaurantData.js`
- 지도 렌더링: `restaurantMap.js`
- 탐색 UI: `restaurantExplorer.js`
- 검색: `headerSearch.js`
- 인증: `auth.js`, `login.js`, `signup.js`
- 즐겨찾기: `favorites.js`

### 3. 정적 웹앱 장점

- 빠른 초기 개발
- 별도 프레임워크나 서버 설치 불필요
- 작은 프로젝트를 빠르게 시연/운영 가능

### 4. 데모용 한계

- 백엔드 부재
- 실제 사용자 인증 및 권한 관리 불가
- 데이터 영속성 제한
- 실사용 서비스로는 확장 불가

---

## 향후 개선 방향

이 프로젝트는 학습용 정적 웹앱이지만, 실제 서비스로 발전시키기 위해 다음 항목을 적용할 수 있습니다.

- Node.js + Express 또는 Spring Boot 백엔드 도입
- MySQL / PostgreSQL 연동
- JWT 기반 인증 시스템
- 실제 업소 데이터베이스 구축
- 관리자 페이지 추가
- 리뷰/댓글 CRUD 서버화
- 사진 업로드 기능
- 지도 API 고도화 및 별도 페이지 구성
- 검색 기능 서버 처리로 확장

---

## 문서 참고

- 인증 로직 구조 설명: [docs/auth-guide.md](docs/auth-guide.md)

---

## 프로젝트 요약

봄내로그는 춘천 지역 음식점을 탐색하는 정적 웹 애플리케이션으로, 지역 기반 맛집 안내, 지도 시각화, 검색, 상세 페이지, 인증, 즐겨찾기 기능을 함께 갖춘 데모 프로젝트입니다.

작은 규모의 프론트엔드 프로젝트를 빠르게 구축하고, 실사용 서비스로 발전시킬 수 있는 기반 구조를 담고 있다는 점에서 의미가 있습니다.

---

## 라이선스

현재 저장소에는 별도의 라이선스 파일이 명시되어 있지 않으므로, 프로젝트를 복제하거나 수정할 때 각자의 용도에 맞게 라이선스를 추가하는 것을 권장합니다.

