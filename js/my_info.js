// 개인정보 변경 페이지용 로직
// 핵심 규칙:
// - 비밀번호, 이름, 이메일 중 최소 1개만 입력해도 저장 가능
// - 빈 값은 무시하고, 기존 값은 유지
// - 현재는 로그인 연동 없이 로컬 샘플 데이터로 동작
// - 실제 서버 연동 시, loadProfile()/saveProfile()만 API 호출 구조로 바꾸면 된다

// 기본 사용자 정보. 실제 로그인 사용자 정보가 들어오면 이 값 대신 교체.
const defaultProfile = { // 임시 정보
  userId: 'user_info',
  name: '익명',
  email: '123123@naver.com',
  password: 'q1w2e3r4!@'
};

// 로컬 저장소 키. 화면이 refresh 되어도 값 유지.
const STORAGE_KEY = 'myInfoProfile';

// localStorage에서 사용자 정보를 읽어온다.
// 저장 값이 없으면 기본값을 넣고 반환한다.
function loadProfile() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
    return { ...defaultProfile };
  }

  try {
    return { ...defaultProfile, ...JSON.parse(saved) };
  } catch (error) {
    console.error('프로필 불러오기 실패:', error);
    return { ...defaultProfile };
  }
}

// 사용자 정보를 저장한다.
function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

// 비밀번호 마스킹 처리.
// 실제 비밀번호를 노출하지 않고 최소 8자리 이상으로 보이게 처리한다.
function maskPassword(password) {
  if (!password) return '********';
  return '*'.repeat(Math.max(password.length, 8));
}

// 페이지의 표시용 텍스트를 최신 값으로 갱신한다.
// DOM id: userIdDisplay, userNameDisplay, userEmailDisplay, userPasswordDisplay
function renderProfile(profile) {
  const userIdDisplay = document.getElementById('userIdDisplay');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userEmailDisplay = document.getElementById('userEmailDisplay');
  const userPasswordDisplay = document.getElementById('userPasswordDisplay');

  if (userIdDisplay) userIdDisplay.textContent = profile.userId;
  if (userNameDisplay) userNameDisplay.textContent = profile.name;
  if (userEmailDisplay) userEmailDisplay.textContent = profile.email;
  if (userPasswordDisplay) userPasswordDisplay.textContent = maskPassword(profile.password);
}

// 상태 메시지 표시 함수.
// DOM id: formMessage
function setMessage(message, isError = false) {
  const formMessage = document.getElementById('formMessage');

  if (!formMessage) return;

  formMessage.textContent = message;
  formMessage.classList.toggle('error', isError);
  formMessage.classList.toggle('success', !isError);
}

// 폼 submit 이벤트 바인딩.
// 조건: 비밀번호, 이름, 이메일 중 최소 1개만 입력되어 있으면 저장 허용.
function bindProfileForm() {
  const form = document.getElementById('myInfoForm');
  if (!form) return;

  const profile = loadProfile();
  renderProfile(profile);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // 변경 입력 필드
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');

    const nextName = nameInput?.value.trim() || '';
    const nextEmail = emailInput?.value.trim() || '';
    const nextPassword = passwordInput?.value.trim() || '';

    // 최소 1개 입력 여부 판별.
    const hasAnyChange = nextName || nextEmail || nextPassword;

    if (!hasAnyChange) {
      setMessage('변경할 내용을 최소 1개 이상 입력해주세요.', true);
      return;
    }

    const updatedProfile = { ...profile };

    // 빈 문자열이 아닌 경우에만 반영.
    // 즉, 비밀번호만 수정하거나 이름만 수정하는 것도 허용.
    if (nextName) {
      updatedProfile.name = nextName;
    }

    if (nextEmail) {
      updatedProfile.email = nextEmail;
    }

    if (nextPassword) {
      updatedProfile.password = nextPassword;
    }

    saveProfile(updatedProfile);
    renderProfile(updatedProfile);
    form.reset();
    setMessage('개인정보가 저장되었습니다.');
  });
}

// 페이지 로드시 실행.
bindProfileForm();
