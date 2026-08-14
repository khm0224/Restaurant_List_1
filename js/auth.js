function setCookie(name, value, days) {
    const now = new Date();
    now.setTime(now.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + now.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

function getCookie(name) {
    const cookieName = name + "=";
    const decode = decodeURIComponent(document.cookie);

    const cookieArray = decode.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i].trim();

        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length);
        }
    }
    return "";
}

function deleteCookie(name) {
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
}

// 회원 목록 저장소 
let users = [];

// 회원 목록을 쿠키에 저장
function saveUsers() {
    setCookie('users', JSON.stringify(users), 30);
}

// 쿠키에서 회원 목록 불러오기
function loadUsers() {
    const saved = getCookie('users');

    if (saved) {
        users = JSON.parse(saved);
    } else {
        users = [];
    }
}

// ===== 유효성 검사 패턴 ===== by AI
const ID_PATTERN    = /^[a-zA-Z][a-zA-Z0-9_]{3,15}$/;
const PW_PATTERN    = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,16}$/;
const NAME_PATTERN  = /^[가-힣]{2,5}$/;
const EMAIL_PATTERN = /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/;

function findUserById(id) {
    return users.find(u => u.id === id);
}

function isDuplicateId(id) {
    return users.some(u => u.id === id);
}

function findUserByNameEmail(name, email) {
    return users.find(u => u.name === name && u.email === email);    
}

function findUserByIdEmail(id, email) {
    return users.find(u => u.id === id && u.email === email);
}

// 파일이 로드될 때 자동 실행
loadUsers();