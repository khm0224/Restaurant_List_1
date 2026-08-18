# 봄내로그 (Restaurant_List)

춘천 지역 음식점을 동네와 업종별로 탐색하고, 지도에서 위치와 상세 정보를 확인할 수 있는 정적 웹 프로젝트입니다.

## 주요 기능

- 메인 화면 추천 음식점 슬라이더와 춘천 행정동 선택
- 동네별 음식점 목록 탐색 및 한식, 일식, 중식, 양식, 디저트 필터
- Google Maps 기반 음식점 마커와 춘천시/행정동 경계 표시
- 음식점 상세 정보, 카테고리별 메뉴, 리뷰 사진, 댓글 확인 및 작성
- 브라우저 기반 회원가입, 로그인, 아이디 찾기, 비밀번호 재설정, 프로필 메뉴
- 공지사항 및 소식 영역

## 화면 구성

| 화면 | 경로 | 내용 |
| --- | --- | --- |
| 메인 | `index.html` | 추천 맛집, 지역 선택, 공지사항 및 소식 |
| 맛집 탐색 | `html/food_page.html` | 행정동/업종 필터, 음식점 목록, 지도 |
| 맛집 상세 | `html/restaurant_detail.html` | 상세 정보, 메뉴, 리뷰, 댓글, 위치 지도 |
| 인증 | `html/auth/` | 로그인, 회원가입, 아이디/비밀번호 찾기 |
| 데이터 비교 도구 | `html/compare_restaurants.html` | `restaurantData.js`와 CSV 데이터 비교 |

## 실행 방법

이 프로젝트는 별도 빌드 과정이나 패키지 설치가 필요 없는 HTML, CSS, JavaScript 기반 정적 사이트입니다. CSV, GeoJSON, HTML 컴포넌트를 `fetch`로 불러오기 때문에 브라우저에서 파일을 직접 열지 말고 로컬 HTTP 서버로 실행해야 합니다.

서버 실행 후 브라우저에서 `http://localhost:8000/index.html`에 접속합니다.

## 지도 설정

메인 미니 지도(`js/restaurant_homepageMap.js`)와 맛집 탐색 지도(`js/restaurantMap.js`)는 모두 Google Maps JavaScript API를 사용합니다.

1. Google Cloud Console에서 Maps JavaScript API를 활성화합니다.
2. API 키의 HTTP 리퍼러 제한을 로컬 개발 주소와 배포 주소로 설정합니다.
3. `js/map-config.js`의 `window.GOOGLE_MAPS_API_KEY`에 발급받은 키를 넣습니다.

API 키가 없거나 유효하지 않으면 지도 영역에는 비활성화 안내가 표시되며, 나머지 기능은 사용할 수 있습니다. API 키는 공개 저장소에 커밋하지 않도록 주의합니다.

## 데이터 흐름

```text
전국_음식점_정보csv/filter_file_Gyo_dong_JS_geocoded.csv
	-> js/restaurantService.js
	-> js/restaurantMap.js
	-> 음식점 마커 표시

js/restaurantData.js
	-> js/headerSearch.js, js/restaurantExplorer.js, js/restaurantDetail.js
	-> 목록 및 상세 화면 표시

data/area/*.geojson
	-> js/restaurantMap.js
	-> 춘천시 및 행정동 경계 표시
```

현재 CSV 기반 지도 데이터는 교동 음식점을 대상으로 하며, 목록과 상세 화면은 `js/restaurantData.js`에 정의된 데이터를 사용합니다.

## 헤더 검색 기능

모든 공통 헤더 화면의 검색창은 동네 이름, 음식 종류, 식당명을 입력받아 적절한 화면으로 이동합니다. 헤더 UI는 `html/components/header.html`에 한 번만 정의하고, 검색 동작은 `js/headerSearch.js`에서 공통으로 처리합니다.

```text
헤더 검색창 입력
	-> js/headerSearch.js
	-> js/restaurantData.js에서 동네, 업종, 식당명 검색
	-> 탐색 화면 또는 상세 화면으로 URL 이동
	-> js/restaurantExplorer.js가 URL 필터를 적용
```

### 검색 대상과 결과

검색어는 아래 표의 순서대로 판정합니다 (동네 이름 → 업종 → 식당명).

| 입력 | 검색 방식 | 결과 |
| --- | --- | --- |
| `소양동`, `교동` 등 15개 행정동 이름 | 등록된 동 이름과 완전 일치 | 전체 업종에서 해당 동 목록 화면으로 이동 |
| `한식`, `일식`, `중식`, `양식`, `디저트` | 등록된 업종명과 완전 일치 | 전체 지역의 해당 업종 목록 화면으로 이동 |
| 식당명 | 정확히 일치하는 이름을 우선하고, 없으면 이름에 입력어가 포함된 첫 식당을 선택 | 해당 식당 상세 화면으로 이동 |
| 빈 값 | 검색하지 않음 | 현재 화면 유지 |
| 위 조건에 모두 해당 없음 | `restaurantData.js`에서 검색 실패 | `검색 결과가 없습니다.` 알림 표시 |

동 이름 검색은 다음과 같은 URL을 만듭니다.

```text
html/food_page.html?district=소양동
```

음식 종류 검색은 다음과 같은 URL을 만듭니다.

```text
html/food_page.html?district=전체&category=일식
```

식당명 검색은 식당이 속한 동네, 업종, 배열 인덱스를 URL에 전달합니다.

```text
html/restaurant_detail.html?district=교동&category=한식&id=0
```

### 검색어 자동완성 드롭다운

검색창에 입력할 때마다(`input` 이벤트) 이름에 그 글자가 포함된 식당을 최대 8개까지 실시간으로 걸러 입력창 아래 드롭다운으로 보여줍니다. 각 항목은 `식당명`과 `동네 · 업종`을 함께 표시하며, 클릭하면 바로 해당 식당의 상세 화면으로 이동합니다. 검색창 바깥 클릭이나 Esc 키, Enter로 검색을 실행하면 드롭다운이 닫힙니다.

### 파일별 역할

| 파일 | 역할 |
| --- | --- |
| `html/components/header.html` | 검색 입력창, 검색 버튼, 자동완성 드롭다운(`.search-dropdown`)을 포함한 공통 헤더 마크업 |
| `css/header.css` | 헤더와 검색창, 자동완성 드롭다운 스타일 |
| `js/headerSearch.js` | 클릭·Enter·입력을 감지해 검색어에 따라 탐색/상세 화면 URL을 생성하고, 자동완성 드롭다운을 갱신 |
| `js/restaurantData.js` | 검색, 자동완성, 목록 표시에 사용하는 동네별 음식점 데이터 제공 |
| `js/restaurantExplorer.js` | 탐색 화면 URL의 `district`, `category` 값을 읽어 동네 버튼, 업종 선택, 목록, 지도 마커를 동기화 |
| `js/food_page.js` | 탐색 화면의 동네 바 가로 스크롤, 사이드바 접기, 지도 초기화 담당 |

### 탐색 화면 필터 적용

`js/restaurantExplorer.js`는 URL을 읽어 초기 선택 상태를 만듭니다.

- `district`: 선택한 행정동입니다. 값이 없으면 화면의 기본 동네 버튼을 사용합니다.
- `category`: 사이드바에 등록된 업종 값일 때만 적용합니다. 올바르지 않은 값이면 기본 업종 선택을 유지합니다.
- 동네를 바꾸면 음식점 목록을 다시 만들고, Google Maps의 행정동 강조와 마커 표시를 갱신합니다.
- 업종을 바꾸면 음식점 목록과 지도 마커를 같은 업종으로 다시 필터링합니다.
- 목록 카드를 클릭하거나 Enter/Space 키를 누르면 해당 식당의 상세 화면으로 이동합니다. 길찾기와 즐겨찾기 버튼은 카드 이동 이벤트를 막습니다.

### 스크립트 연결 규칙

`headerSearch.js`는 검색 데이터가 준비된 뒤에 불러와야 합니다. 헤더는 `header.js`가 비동기로 삽입하지만, 검색 모듈은 `document`에 이벤트를 위임하므로 헤더가 삽입된 후에도 클릭과 Enter를 정상적으로 처리합니다.

맛집 탐색 화면의 권장 로드 순서는 다음과 같습니다.

```html
<script src="../js/restaurantData.js"></script>
<script src="../js/restaurantMap.js"></script>
<script src="../js/restaurantExplorer.js"></script>
<script src="../js/food_page.js"></script>
<script src="../js/headerSearch.js"></script>
```

다른 헤더 사용 페이지에서도 `restaurantData.js` 다음에 `headerSearch.js`를 추가해야 합니다. 이전 페이지별 검색 구현은 사용하지 않으며, 공통 검색은 `headerSearch.js` 하나만 유지합니다.

## 주요 디렉터리

```text
css/                     페이지 및 인증 화면 스타일
data/area/               춘천시/행정동 GeoJSON 경계 데이터
docs/                    기능 연동 문서
html/                    맛집 탐색, 상세, 인증 화면
html/components/         재사용 헤더 컴포넌트
img/foodlist/            음식점 이미지
js/                      화면 동작, 데이터, 지도, 인증 로직
js/auth/                 브라우저 기반 인증 및 프로필 로직
전국_음식점_정보csv/     음식점 원본/가공 CSV 데이터
```

## 브라우저 저장소 동작

- 회원 계정 정보는 브라우저 `localStorage`의 `userAccounts`에 저장됩니다.
- 로그인 상태는 `loginUser` 쿠키로 유지됩니다.
- 리뷰와 댓글은 브라우저 `localStorage`에 저장됩니다.

현재 인증과 게시 기능은 데모용 클라이언트 저장 방식입니다. 브라우저 데이터를 삭제하거나 다른 기기에서 접속하면 데이터가 유지되지 않으며, 실제 서비스로 확장하려면 서버 API와 데이터베이스 연동이 필요합니다.

## 참고 문서

- 인증 및 프로필 메뉴 구조: [docs/auth-guide.md](docs/auth-guide.md)

