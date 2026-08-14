/**
 * header.js — 공통 헤더 로더
 */

// WHY: document.currentScript는 "지금 실행 중인 script 태그"를 가리키며 실행 시점에만 유효합니다.
//      그래서 함수 안이 아니라 최상위에서 미리 잡아둡니다.
//      ⚠️ 이 script 태그에 defer를 붙이면 currentScript가 null이 됩니다. 붙이지 마세요.
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


        componentBaseUrl = response.url;   // WHY: 헤더 파일의 실제 주소 = 경로 계산의 기준점
        root.innerHTML = await response.text();
    } catch (error) {
        console.error('헤더 로드 실패', error);
        return;
    }

    // ===== 경로 재계산 =====

    // WHY: new URL(상대경로, 기준주소) — 삽입된 페이지가 아니라 헤더 파일 위치를 기준으로 계산합니다.
    //      헤더 파일 위치는 하나로 고정이므로 어느 페이지에 붙어도 결과가 같습니다.
    root.querySelectorAll('[data-header-link]').forEach(el => {
        el.href = new URL(el.dataset.headerLink, componentBaseUrl).href;
    });

    root.querySelectorAll('[data-header-src]').forEach(el => {
        el.src = new URL(el.dataset.headerSrc, componentBaseUrl).href;
    });

    // ===== 현재 페이지 표시 =====

    // WHY: 헤더는 자기가 어느 페이지에 붙었는지 모릅니다. 페이지가 data-active로 알려줍니다.
    //      location.pathname 자동 판별은 실패해도 에러가 안 나 발견이 늦습니다.
    const activeKey = root.dataset.active;
    if (activeKey) {
        root.querySelector(`[data-nav="${activeKey}"]`)?.classList.add('active');
    }


    // ===== 삽입 완료를 기다리던 기능들 시작 =====

    // WHY: 이 두 줄이 Q3의 답입니다.
    //      두 함수 모두 헤더 안의 요소를 찾는데, 지금 시점에야 그 요소들이 존재합니다.
    //      순서 중요 — 메뉴를 조립한 뒤에 상태를 반영해야 합니다.
    window.initUserMenu?.();
    updateHeader();
});