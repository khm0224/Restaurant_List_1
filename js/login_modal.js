// 각 페이지에서 전달한 로그인 모달 HTML 경로를 사용합니다.
const loginComponentScript = document.currentScript;

// 공통 로그인 모달을 불러오고 열기/닫기 이벤트를 연결합니다.
document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('login-modal-root');
    const componentUrl = loginComponentScript?.dataset.loginComponent;
    let componentBaseUrl;

    if (!root || !componentUrl) {
        return;
    }

    try {
        const response = await fetch(componentUrl);

        if (!response.ok) {
            throw new Error(`로그인 모달 로드 실패 (${response.status})`);
        }

        componentBaseUrl = response.url;
        root.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
        return;
    }

    const modal = root.querySelector('#loginModal');
    const closeButton = root.querySelector('[data-login-close]');
    const form = root.querySelector('[data-login-form]');
    const openButtons = document.querySelectorAll('[data-login-open]');

    root.querySelectorAll('[data-auth-page]').forEach(link => {
        link.href = new URL(link.dataset.authPage, componentBaseUrl).href;
    });

    if (!modal || !closeButton || !form) {
        console.error('로그인 모달 구성 요소를 찾지 못했습니다.');
        return;
    }

    // 모달을 열 때 첫 입력칸으로 포커스를 이동합니다.
    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        modal.querySelector('input')?.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    openButtons.forEach(button => button.addEventListener('click', openModal));
    closeButton.addEventListener('click', closeModal);

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    form.addEventListener('submit', event => {
        event.preventDefault();
        handleLogin();
    });
});
