/**
 * login.js — 로그인 / 로그아웃 처리
 *
 * 로그인 폼의 입력값을 검증하고, 성공 시 loginUser 쿠키를 심거나 지웁니다.
 * 쿠키가 바뀐 뒤에는 항상 updateHeader()로 헤더를 다시 그립니다.
 *
 * 의존: auth.js (getCookie / setCookie / deleteCookie / findUserById)
 */


// 상태값 상수
const LOGIN_RESULT = {
    EMPTY_INPUT: 'EMPTY_INPUT',
    MISMATCH: 'MISMATCH',
    SUCCESS: 'SUCCESS',
};

// 문구 모음
const LOGIN_MESSAGE = {
    [LOGIN_RESULT.EMPTY_INPUT]: '아이디와 비밀번호를 입력하세요.',
    [LOGIN_RESULT.MISMATCH]: '아이디 또는 비밀번호가 일치하지 않습니다.',
    [LOGIN_RESULT.SUCCESS]: '',
};

// 입력값을 검사해 로그인 가능 여부를 상태값으로 반환합니다.
// 화면을 직접 건드리지 않고 결과만 돌려주므로 테스트하기 쉽습니다.
function validateLogin(id, pw) {
    if (id === '' || pw === '') return LOGIN_RESULT.EMPTY_INPUT;

    const user = findUserById(id);

    // 아이디가 없는 경우와 비밀번호가 틀린 경우를 같은 메시지로 처리
    // (어느 쪽이 틀렸는지 알려주면 아이디 존재 여부가 노출됨)
    if (!user || user.pw !== pw) return LOGIN_RESULT.MISMATCH;

    return LOGIN_RESULT.SUCCESS;
}


// 로그인 폼 제출을 처리합니다. 실패하면 메시지만 표시하고 종료합니다.
function handleLogin() {
    const idInput = document.querySelector('#loginId');
    const pwInput = document.querySelector('#loginPw');
    const msg = document.querySelector('#loginMsg');

    msg.textContent = '';

    const id = idInput.value.trim();
    const pw = pwInput.value;
    const result = validateLogin(id, pw);

    if (result !== LOGIN_RESULT.SUCCESS) {
        msg.textContent = LOGIN_MESSAGE[result];
        return;
    }

    // 로그인 상태 기록 → 모달 닫기 → 헤더 갱신 순서로 마무리
    setCookie('loginUser', id, 1);
    document.querySelector('#loginModal').classList.remove('active');
    updateHeader();
}


// 로그인 상태를 해제합니다. 헤더의 로그아웃 진입점은 모두 이 함수를 거칩니다.
function handleLogout() {
    deleteCookie('loginUser');
    updateHeader();
}


// 로그인 여부에 따라 헤더를 다시 그립니다.
// 로그인 / 로그아웃 / 페이지 로드 세 경우 모두 이 함수 하나로 처리해
// 화면 갱신 경로가 갈라지지 않도록 합니다.
function updateHeader() {
    const loginBtn = document.querySelector('#login_Btn');
    if (!loginBtn) return;

    const user = getCookie('loginUser');

    // 로그인 상태면 로그인 버튼을 감추고, 비로그인 상태면 다시 보여줌
    loginBtn.classList.toggle('hidden', Boolean(user));

    // 프로필 메뉴 갱신은 profileMenu.js에 위임
    // 헤더가 없는 페이지에는 해당 스크립트가 없으므로 ?. 로 안전하게 호출
    window.renderUserMenu?.();
}


// 첫 진입 시에도 쿠키를 보고 헤더 상태를 맞춰 줍니다.
window.addEventListener('DOMContentLoaded', () => {
    updateHeader();
});