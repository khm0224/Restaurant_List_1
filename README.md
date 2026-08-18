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
| 인증 | `html/auth계정 찾기 |/` | 로그인, 회원가입, 
| 데이터 비교 도구 | `html/compare_restaurants.html` | `restaurantData.js`와 CSV 데이터 비교 |

## 실행 방법

이 프로젝트는 별도 빌드 과정이나 패키지 설치가 필요 없는 HTML, CSS, JavaScript 기반 정적 사이트입니다. CSV, GeoJSON, HTML 컴포넌트를 `fetch`로 불러오기 때문에 브라우저에서 파일을 직접 열지 말고 로컬 HTTP 서버로 실행해야 합니다.

```powershell
cd c:\Users\hmv23\OneDrive\Documents\GitHub\Restaurant_List
py -m http.server 8000
```

서버 실행 후 브라우저에서 `http://127.0.0.1:5500/index.html`에 접속합니다.

## 지도 설정

메인 미니 지도와 맛집 탐색 지도는 Google Maps JavaScript API를 사용합니다.

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
	-> js/food_page.js, js/restaurantDetail.js
	-> 목록 및 상세 화면 표시

data/area/*.geojson
	-> js/restaurantMap.js
	-> 춘천시 및 행정동 경계 표시
```

현재 CSV 기반 지도 데이터는 교동 음식점을 대상으로 하며, 목록과 상세 화면은 `js/restaurantData.js`에 정의된 데이터를 사용합니다.

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

