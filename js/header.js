/**
 * header.js — 공통 헤더 로더
 *
 * html/components/header.html을 fetch해 각 페이지의 #header-root에 삽입.
 * 컴포넌트 안의 경로는 헤더 파일 위치를 기준으로 다시 계산.
 *
 * 의존: auth.js, login.js (refreshAuthUI), profileMenu.js (initUserMenu)
 */

// currentScript는 실행 중일 때만 유효 — 콜백 안에서는 null이라 최상위에서 잡아둠
const headerComponentScript = document.currentScript;

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('header-root');
    const componentUrl = headerComponentScript?.dataset.headerComponent;

    if (!root || !componentUrl) return;

    let componentBaseUrl;

    try {
        const response = await fetch(componentUrl);

        if (!response.ok) {
            throw new Error(`헤더 로드 실패 (${response.status})`);
        }


        componentBaseUrl = response.url;   // 헤더 파일의 실제 주소 = 경로 계산의 기준점
        root.innerHTML = await response.text();
    } catch (error) {
        console.error('헤더 로드 실패', error);
        return;
    }

    // ===== 경로 재계산 =====

    // 삽입된 페이지가 아니라 헤더 파일 위치를 기준으로 계산.
    // 페이지마다 폴더 깊이가 달라도 결과가 같아짐.
    root.querySelectorAll('[data-header-link]').forEach(el => {
        el.href = new URL(el.dataset.headerLink, componentBaseUrl).href;
    });

    root.querySelectorAll('[data-header-src]').forEach(el => {
        el.src = new URL(el.dataset.headerSrc, componentBaseUrl).href;
    });

    // ===== 현재 페이지 표시 =====

    // 헤더는 자기가 어느 페이지에 붙었는지 모름. 페이지가 data-active로 알려줌.
    // pathname 자동 판별은 실패해도 에러가 안 나 발견이 늦음.
    const activeKey = root.dataset.active;
    if (activeKey) {
        root.querySelector(`[data-nav="${activeKey}"]`)?.classList.add('active');
    }


    // ===== 삽입 완료 후 초기화 =====

    // 헤더 안의 요소는 지금 시점에야 존재.
    // 순서 중요 — 메뉴를 조립한 뒤에 상태를 반영해야 함.
    window.initUserMenu?.();
    refreshAuthUI();
});