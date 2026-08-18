/**
 * login_modal.js — 공통 로그인 모달 로더
 *
 * 로그인 모달 HTML을 별도 파일에서 불러와 페이지에 끼워 넣고, 열기/닫기 동작을 연결합니다.
 * 모달 HTML의 경로는 script 태그의 data-login-component 속성으로 페이지마다 전달합니다.
 * 덕분에 여러 페이지가 같은 모달 마크업을 공유합니다.
 *
 * 의존: login.js (handleLogin)
 */

// 각 페이지에서 전달한 로그인 모달 HTML 경로를 사용합니다.
// document.currentScript는 지금 실행 중인 script 태그를 가리키며, 실행 시점에만 유효합니다.
const loginComponentScript = document.currentScript;

// 공통 로그인 모달을 불러오고 열기/닫기 이벤트를 연결합니다.
document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('login-modal-root');
    const componentUrl = loginComponentScript?.dataset.loginComponent;
    let componentBaseUrl;

    // 모달을 넣을 자리나 경로가 없는 페이지에서는 아무것도 하지 않음
    if (!root || !componentUrl) {
        return;
    }

    // 모달 마크업을 가져와 페이지에 삽입
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

    // 모달 안의 링크는 모달 HTML 위치를 기준으로 경로를 다시 계산
    // 삽입된 페이지의 폴더 깊이가 달라도 링크가 깨지지 않게 하기 위함
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

    // 클릭이 아닌 상황에서도 열어야 할 때가 있음(즐겨찾기 ☆를 비로그인으로 누른 경우).
    // data-login-open은 "이 요소를 누르면 연다"는 뜻이라 조건부로는 못 씀 —
    // 로그인한 사람에게도 열려버림. 그래서 함수를 내줌.
    // 모달이 fetch로 늦게 오므로 그 전에는 존재하지 않음. 부르는 쪽에서 ?.()로 확인할 것.
    window.openLoginModal = openModal;

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    closeButton.addEventListener('click', closeModal);

    // 로그인 버튼은 헤더 안에 있어 fetch로 나중에 생깁니다.
    // 버튼에 직접 이벤트를 걸면 그 시점에 버튼이 없어 연결되지 않으므로,
    // document에 걸어두고 클릭한 위치를 확인하는 방식(이벤트 위임)을 씁니다.
    //      버튼이 나중에 생겨도(헤더가 fetch로 늦게 도착) 동작합니다.
    //      profileMenu.js:55의 바깥클릭 감지와 같은 기법입니다.
    document.addEventListener('click', (event) => {
        if (event.target.closest('[data-login-open]')) openModal();
    });

    // 어두운 배경을 클릭했을 때만 닫기 (모달 내용 클릭은 통과)
    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // ESC로도 닫히게 합니다.
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // 제출은 기본 새로고침을 막고 login.js의 처리 함수로 넘김
    form.addEventListener('submit', event => {
        event.preventDefault();
        handleLogin();
    });
});