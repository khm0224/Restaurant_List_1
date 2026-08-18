/**
 * auth.js — 인증 공통 모듈
 *
 * 회원 데이터 저장·조회(localStorage) + 로그인 상태 쿠키 입출력.
 * DOM은 다루지 않음. 로그인/회원가입/아이디찾기 화면이 가져다 씀.
 * 다른 인증 스크립트보다 항상 먼저 로드할 것.
 */


// ===== 쿠키 입출력 =====

function setCookie(name, value, days) {
    const now = new Date();
    now.setTime(now.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + now.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

function getCookie(name) {
    const cookieName = name + "=";
    const decode = decodeURIComponent(document.cookie);

    // 쿠키는 "이름=값; 이름=값" 형태의 한 문자열
    const cookieArray = decode.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i].trim();

        // 맨 앞에서 시작할 때만 일치로 판단 (다른 쿠키 이름에 포함된 경우 배제)
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length);
        }
    }
    return "";
}

function deleteCookie(name) {
    // 만료일을 과거로 지정 = 삭제
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
}


// ===== 회원 저장소 =====

// 쿠키 대신 localStorage를 쓰는 이유
//   1) 쿠키 4KB 한계 — 프로필 사진·즐겨찾기가 들어가면 5명도 못 담음
//   2) 쿠키는 모든 HTTP 요청에 실려 나감 — 회원 목록은 보낼 이유 없음
//   3) 값에 세미콜론이 들어가면 쿠키 파싱이 깨지던 문제 해소
// loginUser는 쿠키 유지 — 만료 기능이 필요하고 localStorage엔 없음
const USERS_STORAGE_KEY = 'userAccounts';

let users = [];

function saveUsers() {
    // localStorage는 문자열만 저장 가능
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function loadUsers() {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);

    // 저장된 적 없으면 null
    if (!saved) {
        users = [];
        return;
    }

    try {
        const parsed = JSON.parse(saved);

        // JSON.parse는 배열이 아닌 값도 통과시킴 ('5', '"abc"' 등)
        // users가 배열이 아니면 아래 조회 함수의 .find()가 전부 터짐
        users = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        // 값이 깨져도 users는 배열 상태 유지
        // 깨진 값은 원인 확인용으로 지우지 않고 남김
        console.error('회원 목록을 읽지 못했습니다.', error);
        users = [];
    }
}


// ===== 입력값 검증 패턴 =====

const ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]{3,15}$/;      // 영문으로 시작하는 4~16자
const PW_PATTERN = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,16}$/; // 영문+숫자 포함 8~16자
const NAME_PATTERN = /^[가-힣]{2,5}$/;                    // 한글 2~5자
const EMAIL_PATTERN = /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/;


// ===== 회원 조회 =====

function findUserById(id) {
    return users.find(u => u.id === id);
}

function isDuplicateId(id) {
    return users.some(u => u.id === id);
}

// 아이디 찾기용
function findUserByNameEmail(name, email) {
    return users.find(u => u.name === name && u.email === email);
}

// 비밀번호 재설정용
function findUserByIdEmail(id, email) {
    return users.find(u => u.id === id && u.email === email);
}

// 로그인 여부의 기준은 loginUser 쿠키 하나. 화면은 모두 이 값을 보고 그림.
function getCurrentUser() {
    const id = getCookie('loginUser');
    if (!id) return null;

    // 쿠키엔 아이디만. 이름·이미지는 users에서 조회
    // (쿠키에 이름까지 넣으면 회원정보 수정 시 두 곳이 어긋남)
    return findUserById(id) || null;
}


loadUsers();
