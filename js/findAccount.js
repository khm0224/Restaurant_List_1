// ===== 탭 전환 =====

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // 모든 탭/패널에서 active 제거
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        // 클릭된 탭과 그에 연결된 패널만 active
        tab.classList.add('active');
        document.querySelector('#' + tab.dataset.tab).classList.add('active');
    });
});


// ===== 아이디 찾기 =====

function handleFindId() {
    const name  = document.querySelector('#findName').value.trim();
    const email = document.querySelector('#findEmail').value.trim();
    const msg   = document.querySelector('#findIdMsg');

    if (name === '' || email === '') {
        msg.textContent = '이름과 이메일을 모두 입력하세요.';
        msg.style.color = 'red';
        return;
    }

    const user = findUserByNameEmail(name, email);

    if (!user) {
        msg.textContent = '일치하는 회원 정보가 없습니다.';
        msg.style.color = 'red';
        return;
    }

    msg.textContent = `회원님의 아이디는 "${user.id}" 입니다.`;
    msg.style.color = 'green';
}


// ===== 비밀번호 재설정 =====

function handleResetPw() {
    const id    = document.querySelector('#resetId').value.trim();
    const email = document.querySelector('#resetEmail').value.trim();
    const newPw = document.querySelector('#resetPw').value.trim();
    const msg   = document.querySelector('#resetPwMsg');

    msg.style.color = 'red';

    if (id === '' || email === '') {
        msg.textContent = '아이디와 이메일을 모두 입력하세요.';
        return;
    }

    const user = findUserByIdEmail(id, email);

    if (!user) {
        msg.textContent = '일치하는 회원 정보가 없습니다.';
        return;
    }

    if (!PW_PATTERN.test(newPw)) {
        msg.textContent = '새 비밀번호는 영문과 숫자를 포함한 8~16자입니다.';
        return;
    }

    if (user.pw === newPw) {
        msg.textContent = '기존 비밀번호와 동일합니다.';
        return;
    }

    // 찾은 객체를 직접 수정 → users 배열의 값이 바뀜
    user.pw = newPw;
    saveUsers();

    msg.textContent = '비밀번호가 변경되었습니다. 새 비밀번호로 로그인하세요.';
    msg.style.color = 'green';
}


// ===== 이벤트 연결 =====

document.querySelector('#findIdBtn').addEventListener('click', handleFindId);
document.querySelector('#resetPwBtn').addEventListener('click', handleResetPw);