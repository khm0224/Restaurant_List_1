const loginComponentScript = document.currentScript;

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('login-modal-root');
    const componentUrl = loginComponentScript?.dataset.loginComponent;

    if (!root || !componentUrl) {
        return;
    }

    try {
        const response = await fetch(componentUrl);

        if (!response.ok) {
            throw new Error(`로그인 모달 로드 실패 (${response.status})`);
        }

        root.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
        return;
    }

    const modal = root.querySelector('#loginModal');
    const closeButton = root.querySelector('[data-login-close]');
    const form = root.querySelector('[data-login-form]');
    const openButtons = document.querySelectorAll('[data-login-open]');

    if (!modal || !closeButton || !form) {
        console.error('로그인 모달 구성 요소를 찾지 못했습니다.');
        return;
    }

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
    });
});
