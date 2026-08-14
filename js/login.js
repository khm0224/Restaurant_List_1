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

function validateLogin(id, pw) {
    if (id === '' || pw === '') return LOGIN_RESULT.EMPTY_INPUT;

    const user = findUserById(id);

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
    updateHeader();
}


function handleLogout() {
    deleteCookie('loginUser');
    updateHeader();
}


function updateHeader() {
    const user = getCookie('loginUser');
    const loginBtn = document.querySelector('#login_Btn');
    const logoutBtn = document.querySelector('#logout_Btn');

    if (user) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}


window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#logout_Btn').addEventListener('click', handleLogout);
    updateHeader();
});