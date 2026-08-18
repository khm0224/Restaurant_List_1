/**
 * login.js — 로그인 / 로그아웃 처리
 *
 * loginUser 쿠키를 심고 지움. 쿠키가 바뀌면 반드시 refreshAuthUI()를 거침.
 *
 * 의존: auth.js (setCookie / deleteCookie / getCurrentUser / findUserById)
 * 발행: auth:changed
 */


const LOGIN_RESULT = {
    EMPTY_INPUT: 'EMPTY_INPUT',
    MISMATCH: 'MISMATCH',
    SUCCESS: 'SUCCESS',
};

const LOGIN_MESSAGE = {
    [LOGIN_RESULT.EMPTY_INPUT]: '아이디와 비밀번호를 입력하세요.',
    [LOGIN_RESULT.MISMATCH]: '아이디 또는 비밀번호가 일치하지 않습니다.',
    [LOGIN_RESULT.SUCCESS]: '',
};

// 화면을 건드리지 않고 결과만 반환 — 테스트하기 쉬운 형태로 분리
function validateLogin(id, pw) {
    if (id === '' || pw === '') return LOGIN_RESULT.EMPTY_INPUT;

    const user = findUserById(id);

    // 아이디 없음과 비밀번호 틀림을 같은 메시지로 처리
    // 어느 쪽인지 알려주면 아이디 존재 여부가 노출됨
    if (!user || user.pw !== pw) return LOGIN_RESULT.MISMATCH;

    return LOGIN_RESULT.SUCCESS;
}


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

    setCookie('loginUser', id, 1);
    document.querySelector('#loginModal').classList.remove('active');
    refreshAuthUI();
}


// 로그아웃 진입점은 모두 이 함수를 거침 (경로가 갈라지면 화면이 어긋남)
function handleLogout() {
    deleteCookie('loginUser');
    refreshAuthUI();
}


// 로그인 상태 변경의 단일 통로. 로그인 / 로그아웃 / 페이지 진입 모두 여기를 거침.
// 로그인 버튼만 직접 갱신하고 나머지 화면은 auth:changed를 구독해 각자 처리.
// 구독자가 늘어도 이 파일은 수정하지 않음.
function refreshAuthUI() {
    const loginBtn = document.querySelector('#login_Btn');

    // 헤더는 fetch로 나중에 삽입됨. 없더라도 이벤트는 나가야 하므로 return 하지 않음
    if (loginBtn) {
        loginBtn.classList.toggle('hidden', Boolean(getCurrentUser()));
    }

    document.dispatchEvent(new CustomEvent('auth:changed'));
}


window.addEventListener('DOMContentLoaded', () => {
    refreshAuthUI();
});