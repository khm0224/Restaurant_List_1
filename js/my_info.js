/**
 * my_info.js — 개인정보 변경 화면
 *
 * users(localStorage)의 회원 객체를 직접 고침. 전용 저장소를 따로 두지 않음.
 * 빈 입력은 "유지" — 채워진 항목만 검증하고 반영.
 *
 * 의존: auth.js (getCurrentUser / saveUsers / findUserById / 검증 패턴)
 *       login.js (refreshAuthUI)
 * 구독: auth:changed — 로그인 상태에 따라 카드 전환
 */


// 200KB 초과 거부.
// Base64는 원본의 약 1.33배 — 200KB면 약 267KB로 저장됨.
// users 배열 전체가 문자열 하나로 saveUsers()에 들어가므로 회원 수만큼 곱해짐.
// 서버가 있으면 S3에 올리고 URL만 저장할 자리.
const MAX_AVATAR_BYTES = 200 * 1024;

const loginRequiredCard = document.getElementById('loginRequiredCard');
const verifyCard = document.getElementById('verifyCard');
const myInfoCard = document.getElementById('myInfoCard');

const verifyForm = document.getElementById('verifyForm');
const verifyPasswordInput = document.getElementById('verifyPasswordInput');
const verifyMessage = document.getElementById('verifyMessage');

const userIdDisplay = document.getElementById('userIdDisplay');
const userPasswordDisplay = document.getElementById('userPasswordDisplay');
const passwordToggleBtn = document.getElementById('passwordToggleBtn');
const userNameDisplay = document.getElementById('userNameDisplay');
const userEmailDisplay = document.getElementById('userEmailDisplay');

const form = document.getElementById('myInfoForm');
const nameInput = document.getElementById('nameInput');
const passwordInput = document.getElementById('passwordInput');
const emailInput = document.getElementById('emailInput');
const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
const formMessage = document.getElementById('formMessage');


// ===== 표시 =====

let isPasswordVisible = false;

// 길이를 그대로 반영하면 비밀번호 자릿수가 노출됨. 고정 길이로 표시.
function maskPassword() {
    return '********';
}

function updatePasswordDisplay(user) {
    if (!user) return;

    userPasswordDisplay.textContent = isPasswordVisible ? user.pw : maskPassword();
    passwordToggleBtn.textContent = isPasswordVisible ? '숨기기' : '보기';
    passwordToggleBtn.setAttribute('aria-label', isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 표시');
}

function renderProfile(user) {
    // 사용자 입력값이라 textContent — innerHTML이면 저장된 태그가 실행됨(XSS)
    userIdDisplay.textContent = user.id;
    updatePasswordDisplay(user);
    userNameDisplay.textContent = user.name;
    userEmailDisplay.textContent = user.email;

    // img 필드가 없는 기존 가입자 대비.
    // src=''는 브라우저가 현재 페이지 주소로 해석해 요청을 한 번 더 보냄 — 속성을 지움.
    if (user.img) {
        avatarPreview.src = user.img;
        avatarPreview.hidden = false;
    } else {
        avatarPreview.removeAttribute('src');
        avatarPreview.hidden = true;
    }
}

function setMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.classList.toggle('error', isError);
    formMessage.classList.toggle('success', !isError);
}

passwordToggleBtn.addEventListener('click', () => {
    const user = getCurrentUser();

    if (!user) return;

    isPasswordVisible = !isPasswordVisible;
    updatePasswordDisplay(user);
});


// ===== 본인 확인 =====

// 로그인 쿠키만으로 열어주지 않고 비밀번호를 한 번 더 받음.
// 로그인은 최대 1일 유지되므로 자리를 비운 사이 남이 열 수 있음.
//
// 변수에 두는 이유 (7장 ⑤ 기준):
//   화면에 "인증됨"이라고 표시되는 곳이 없음 — 카드 전환은 결과일 뿐 상태 자체가 아님.
//   저장소에 두면 탭을 닫았다 열어도 인증이 남아 확인 절차가 무의미해짐.
//   새로고침하면 풀리는 건 의도된 동작.
let isVerified = false;

verifyForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // 여기서도 매번 조회 — 확인 폼을 채우는 동안 쿠키가 만료됐을 수 있음
    const user = getCurrentUser();

    if (!user) {
        updateAuthState();
        return;
    }

    if (verifyPasswordInput.value !== user.pw) {
        verifyMessage.textContent = '비밀번호가 일치하지 않습니다.';
        verifyMessage.classList.add('error');
        verifyPasswordInput.select();
        return;
    }

    // 입력칸에 비밀번호가 남지 않도록 비움
    verifyForm.reset();
    verifyMessage.textContent = '';
    verifyMessage.classList.remove('error');

    isVerified = true;
    updateAuthState();

    // 카드가 통째로 바뀌어 포커스가 사라진 버튼에 남음. 새 화면의 첫 입력칸으로 옮김.
    avatarInput.focus();
});


// ===== 화면 전환 =====

// 로그인은 모달로 이뤄져 새로고침이 없음 — 상태가 바뀔 때마다 다시 불려야 함.
// 카드를 감추는 건 화면 정리일 뿐 방어가 아님. 진짜 차단은 submit 시점 재확인.
function updateAuthState() {
    // 변수에 잡아두지 않고 매번 조회.
    // 로그아웃 후 다른 계정으로 로그인하면 옛 사람의 객체를 고치게 됨.
    const user = getCurrentUser();

    // 로그아웃하면 인증도 함께 풀림.
    // 안 풀면 로그아웃 후 다른 계정으로 로그인했을 때 확인 없이 열림.
    if (!user) isVerified = false;

    loginRequiredCard.hidden = Boolean(user);
    verifyCard.hidden = !user || isVerified;
    myInfoCard.hidden = !user || !isVerified;

    if (user && isVerified) renderProfile(user);
}

document.addEventListener('auth:changed', updateAuthState);


// ===== 프로필 사진 =====

// 선택을 취소하거나 거부했을 때 부르는 함수.
// 미리보기를 그냥 감추면 등록돼 있던 사진까지 사라진 것처럼 보임 — 저장된 값으로 되돌림.
function restoreAvatarPreview() {
    const user = getCurrentUser();

    if (user) renderProfile(user);
}

avatarInput.addEventListener('change', () => {
    const file = avatarInput.files[0];

    // 파일 선택 창을 열었다가 취소하면 files가 빈 목록이 됨
    if (!file) {
        restoreAvatarPreview();
        return;
    }

    // 읽기 전에 검사. readAsDataURL을 통과시키면 이미 1.33배로 메모리에 올라간 뒤임.
    if (file.size > MAX_AVATAR_BYTES) {
        // 메시지만 띄우면 input.files[0]에 파일이 남아 저장할 때 그대로 들어감.
        // 선택 자체를 되돌려 화면과 실제 값을 맞춤.
        avatarInput.value = '';
        restoreAvatarPreview();

        setMessage(`사진은 ${Math.floor(MAX_AVATAR_BYTES / 1024)}KB 이하만 등록됩니다.`, true);
        return;
    }

    setMessage('');

    const reader = new FileReader();

    reader.onload = () => {
        avatarPreview.src = reader.result;
        avatarPreview.hidden = false;
    };

    reader.readAsDataURL(file);
});


// ===== 저장 =====

form.addEventListener('submit', (event) => {
    event.preventDefault();

    // 화면을 감춘 것만으로는 막히지 않음 — 제출 시점에 다시 확인.
    // loginUser 쿠키는 1일 만료라 폼을 채우는 동안 풀릴 수 있음.
    // 확인 없이 진행하면 user가 null이라 user.name 대입에서 TypeError.
    const user = getCurrentUser();

    if (!user || !isVerified) {
        updateAuthState();
        setMessage('로그인이 풀렸습니다. 다시 로그인하세요.', true);
        return;
    }

    const nextName = nameInput.value.trim();
    const nextEmail = emailInput.value.trim();
    const nextPassword = passwordInput.value.trim();
    // 미리보기에는 기존 사진도 그려져 있음 — 값이 달라졌을 때만 "변경"으로 침
    const nextImg = avatarPreview.hidden ? '' : avatarPreview.src;
    const imgChanged = Boolean(nextImg) && nextImg !== user.img;

    if (!nextName && !nextEmail && !nextPassword && !imgChanged) {
        setMessage('변경할 내용을 최소 1개 이상 입력하세요.', true);
        return;
    }

    // 빈 값은 "유지"이므로 검사를 건너뜀.
    // ''를 NAME_PATTERN.test()에 넣으면 false — 무조건 검사하면 안 바꾼 필드가 막힘.
    // && 는 왼쪽이 false면 오른쪽을 실행하지 않아 이 건너뛰기가 성립함.
    //
    // 패턴은 auth.js의 상수를 그대로 씀. signup.js와 같은 값이라 두 화면의 기준이 갈라지지 않음.
    // 메시지 문구도 signup.js와 맞춤 — 같은 규칙인데 다르게 말하면 사용자가 다른 규칙으로 읽음.
    if (nextName && !NAME_PATTERN.test(nextName)) {
        setMessage('이름은 한글 2~5자로 입력하세요.', true);
        return;
    }

    if (nextEmail && !EMAIL_PATTERN.test(nextEmail)) {
        setMessage('이메일 형식이 올바르지 않습니다.', true);
        return;
    }

    if (nextPassword && !PW_PATTERN.test(nextPassword)) {
        setMessage('비밀번호는 영문, 숫자, 특수문자를 포함한 8~16자입니다.', true);
        return;
    }

    // 본인 확인은 화면 진입 때 이미 받음 — 여기서 또 묻지 않음.
    // 같은 값으로 바꾸면 바뀐 게 없는데 저장됐다고 나와 혼란스러움.
    if (nextPassword && nextPassword === user.pw) {
        setMessage('기존 비밀번호와 동일합니다.', true);
        return;
    }

    // find가 돌려준 참조를 직접 고침 → users 배열에 그대로 반영됨.
    // id는 고치지 않음 — 댓글·리뷰의 authorId가 이 값을 가리키고 있어 끊김(board.js:35)
    if (nextName) user.name = nextName;
    if (nextEmail) user.email = nextEmail;
    if (nextPassword) user.pw = nextPassword;
    if (imgChanged) user.img = nextImg;

    // 위에서 이미 메모리의 회원 객체를 고쳤음. 저장이 실패하면 화면과 저장소가 어긋남.
    // 저장소를 다시 읽어 메모리를 진실에 맞춤 (되돌리기).
    if (!saveUsers()) {
        loadUsers();
        updateAuthState();
        setMessage('저장 공간이 부족합니다. 사진을 줄이거나 빼고 다시 시도하세요.', true);
        return;
    }

    form.reset();
    setMessage('개인정보가 저장되었습니다.');

    // 헤더의 이름·아바타가 옛 값을 들고 있음.
    // auth:changed를 다시 쏘면 구독자(profileMenu 등)가 각자 다시 그림.
    // 로그인 상태 자체는 안 바뀌었으므로 원인을 detail에 실어 구분 가능하게 함.
    refreshAuthUI('profile-updated');
});


updateAuthState();
