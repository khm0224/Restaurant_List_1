/**
 * signup.js — 회원가입 화면
 *
 * 가입 폼의 입력값을 순서대로 검증하고, 통과하면 users 배열에 추가한 뒤 저장합니다.
 * 아이디와 비밀번호 확인란은 입력하는 동안 실시간으로 안내 문구를 갱신합니다.
 *
 * 의존: auth.js (검증 패턴 / isDuplicateId / users / saveUsers)
 */


// 가입 폼 전체를 검증하고 통과 시 회원을 등록합니다.
// 검증은 위에서부터 순서대로 진행하며, 하나라도 실패하면 메시지를 남기고 즉시 종료합니다.
function handleSignUp() {
    const id = document.querySelector('#signupId').value.trim();
    const pw = document.querySelector('#signupPw').value.trim();
    const pw2 = document.querySelector('#signupPw2').value.trim();
    const name = document.querySelector('#signupName').value.trim();
    const email = document.querySelector('#signupEmail').value.trim();
    const agree = document.querySelector('#signupAgree').checked;
    const msg = document.querySelector('#signupMsg');

    // 아래 검증은 모두 실패 메시지이므로 색을 미리 지정
    msg.style.color = 'red';

    if (!ID_PATTERN.test(id)) {
        msg.textContent = '아이디는 영문으로 시작하는 4~16자입니다.';
        return;
    }

    if (isDuplicateId(id)) {
        msg.textContent = '이미 사용 중인 아이디입니다.';
        return;
    }

    if (!PW_PATTERN.test(pw)) {
        msg.textContent = '비밀번호는 영문과 숫자를 포함한 8~16자입니다.';
        return;
    }

    if (pw !== pw2) {
        msg.textContent = '비밀번호가 일치하지 않습니다.';
        return;
    }

    if (!NAME_PATTERN.test(name)) {
        msg.textContent = '이름은 한글 2~5자로 입력하세요.';
        return;
    }

    if (!EMAIL_PATTERN.test(email)) {
        msg.textContent = '이메일 형식이 올바르지 않습니다.';
        return;
    }

    if (!agree) {
        msg.textContent = '이용약관에 동의해야 가입할 수 있습니다.';
        return;
    }

    // 모든 검증 통과
    users.push({ id, pw, name, email });
    saveUsers();

    alert('회원가입이 완료되었습니다.');
    location.href = '../../index.html';
}

// 폼 제출 시 기본 새로고침을 막고 직접 검증합니다.
document.querySelector('#signupForm').addEventListener('submit', (event) => {
    event.preventDefault();
    handleSignUp();
});

// 아이디를 입력하는 동안 형식과 중복 여부를 실시간으로 안내합니다.
document.querySelector('#signupId').addEventListener('input', (e) => {
    const value = e.target.value.trim();
    const idMsg = document.querySelector('#idMsg');

    if (!ID_PATTERN.test(value)) {
        idMsg.textContent = '영문 시작 4~16자';
        idMsg.style.color = 'red';
    } else if (isDuplicateId(value)) {
        idMsg.textContent = '이미 사용 중입니다';
        idMsg.style.color = 'red';
    } else {
        idMsg.textContent = '사용 가능합니다';
        idMsg.style.color = 'green';
    }
});

// 비밀번호 확인란을 입력하는 동안 일치 여부를 실시간으로 안내합니다.
document.querySelector('#signupPw2').addEventListener('input', (e) => {
    const pw = document.querySelector('#signupPw').value;
    const pw2Msg = document.querySelector('#pw2Msg');
    const isMatch = pw === e.target.value;

    pw2Msg.textContent = isMatch ? '일치합니다' : '일치하지 않습니다';
    pw2Msg.style.color = isMatch ? 'green' : 'red';
}); 