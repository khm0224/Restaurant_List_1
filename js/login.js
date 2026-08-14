function handleLogin() {
    const id = document.querySelector('#loginId').value.trim();
    const pw = document.querySelector('#loginPw').value.trim(); 
    const msg = document.querySelector('#loginMsg');


    if (id === '' || pw === '') {
        msg.textContent = '아이디와 비밀번호를 입력하세요.';
        return;
    }

    const user = findUserById(id);
    if (user.pw !== pw) return "비밀번호가 일치하지 않습니다."

    if (!user) {
        msg.textContent = '존재하지 않는 아이디입니다.';
        return;
    }

    setCookie('loginUser', id, 1);
    document.querySelector('#loginModal').classList.remove('active');
    updateHeader()
}

function handleLogout() {
    deleteCookie('loginUser');
    updateHeader()
}

function updateHeader() {
    const user = getCookie('loginUser');
    const logoutBtn = document.querySelector('#logout_Btn')
    const loginBtn = document.querySelector('#login_Btn')
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