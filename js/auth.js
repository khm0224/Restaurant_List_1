/**
 auth.js — 인증 공통 모듈
 
 회원 데이터의 저장·조회와 쿠키 입출력을 담당합니다.
 화면(DOM)은 다루지 않으며, 로그인/회원가입/아이디찾기 화면이 이 파일의 함수를 가져다 씁니다.
 
 로드 시 loadUsers()가 자동 실행되어 users 배열을 복원합니다.
 이 파일은 다른 인증 스크립트보다 항상 먼저 로드되어야 합니다.
 */


// ===== 쿠키 입출력 =====

// 값을 URL 인코딩해 지정한 일수만큼 유지되는 쿠키로 저장합니다.
function setCookie(name, value, days) {
    const now = new Date();
    now.setTime(now.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + now.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

// 이름이 일치하는 쿠키 값을 찾아 반환하고, 없으면 빈 문자열을 반환합니다.
function getCookie(name) {
    const cookieName = name + "=";
    const decode = decodeURIComponent(document.cookie);

    // 쿠키는 "이름=값; 이름=값" 형태의 한 문자열이라 세미콜론으로 나눠 하나씩 확인
    const cookieArray = decode.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i].trim();

        // 이름이 문자열 맨 앞(0번째)에서 시작할 때만 일치로 판단
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length);
        }
    }
    return "";
}

// 만료일을 과거로 지정해 쿠키를 삭제합니다.
function deleteCookie(name) {
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
}


// ===== 회원 저장소 =====

// 전체 회원 목록. 서버가 없어 쿠키를 DB 대신 사용합니다.
let users = [];

// 현재 회원 목록을 쿠키에 저장합니다.
function saveUsers() {
    setCookie('users', JSON.stringify(users), 30);
}

// 쿠키에 저장된 회원 목록을 users 배열로 복원합니다.
function loadUsers() {
    const saved = getCookie('users');

    if (saved) {
        users = JSON.parse(saved);
    } else {
        users = [];
    }
}


// ===== 입력값 검증 패턴 =====

const ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]{3,15}$/;      // 영문으로 시작하는 4~16자
const PW_PATTERN = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,16}$/; // 영문+숫자를 모두 포함한 8~16자
const NAME_PATTERN = /^[가-힣]{2,5}$/;                    // 한글 2~5자
const EMAIL_PATTERN = /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/;


// ===== 회원 조회 =====

// 아이디로 회원 한 명을 찾습니다.
function findUserById(id) {
    return users.find(u => u.id === id);
}

// 이미 사용 중인 아이디인지 확인합니다. (회원가입 중복 검사용)
function isDuplicateId(id) {
    return users.some(u => u.id === id);
}

// 이름과 이메일이 모두 일치하는 회원을 찾습니다. (아이디 찾기용)
function findUserByNameEmail(name, email) {
    return users.find(u => u.name === name && u.email === email);
}

// 아이디와 이메일이 모두 일치하는 회원을 찾습니다. (비밀번호 재설정용)
function findUserByIdEmail(id, email) {
    return users.find(u => u.id === id && u.email === email);
}

// 현재 로그인한 회원 객체를 반환하고, 비로그인 상태면 null을 반환합니다.
// 로그인 여부의 기준은 loginUser 쿠키 하나이며, 화면은 모두 이 값을 보고 그립니다.
function getCurrentUser() {
    const id = getCookie('loginUser');
    if (!id) return null;

    // 쿠키에는 아이디만 저장하고 이름·이미지는 users에서 조회
    // (쿠키에 이름까지 넣으면 회원정보 수정 시 두 곳의 값이 어긋남)
    return findUserById(id) || null;
}


// 파일이 로드될 때 자동 실행
loadUsers();