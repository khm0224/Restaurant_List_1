const categoryScroll = document.getElementById('category-scroll');
const functionScrollPrev = document.getElementById('function-scroll-prev');
const functionScrollNext = document.getElementById('function-scroll-next');
const content = document.getElementById('content');
const sidebarToggle = document.getElementById('sidebar-toggle');
const routeSearchButton = document.getElementById('map-route-search');
const routePanel = document.getElementById('route-panel');
const routePanelCloseButton = document.getElementById('route-panel-close');
const routeOriginInput = document.getElementById('route-origin');

// 카테고리 가로 스크롤 상태에 따라 이전/다음 버튼의 활성/비활성 상태를 갱신합니다.
function updateFunctionScrollButtons() {
    const maxScrollLeft = categoryScroll.scrollWidth - categoryScroll.clientWidth;
    functionScrollPrev.disabled = categoryScroll.scrollLeft <= 0;
    functionScrollNext.disabled = categoryScroll.scrollLeft >= maxScrollLeft - 1;
}

// 카테고리 바를 좌우로 이동시키고 버튼 상태를 다시 계산합니다.
function scrollFunctionBar(direction) {
    categoryScroll.scrollBy({
        left: direction * Math.max(240, categoryScroll.clientWidth * 0.7)
    });
    updateFunctionScrollButtons();
}

functionScrollPrev.addEventListener('click', () => scrollFunctionBar(-1));
functionScrollNext.addEventListener('click', () => scrollFunctionBar(1));
categoryScroll.addEventListener('scroll', updateFunctionScrollButtons);
window.addEventListener('resize', updateFunctionScrollButtons);
updateFunctionScrollButtons();

// 사이드바 접기/펼치기 토글을 처리하고 지도 크기를 다시 조정합니다.
sidebarToggle.addEventListener('click', () => {
    const isCollapsed = content.classList.toggle('sidebar-collapsed');
    sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
    sidebarToggle.setAttribute('aria-label', isCollapsed ? '식당 목록 보이기' : '식당 목록 숨기기');

    window.setTimeout(() => {
        window.RestaurantMap?.resize();
    }, 320);
});

// 길찾기 패널의 표시 상태와 버튼의 접근성 정보를 함께 갱신합니다.
function setRoutePanelOpen(isOpen, restoreFocus = false) {
    if (!routePanel || !routeSearchButton) {
        return;
    }

    routePanel.hidden = !isOpen;
    routeSearchButton.setAttribute('aria-expanded', String(isOpen));
    routeSearchButton.setAttribute('aria-label', isOpen ? '경로 탐색 닫기' : '경로 탐색 열기');

    if (isOpen) {
        routeOriginInput?.focus();
    } else if (restoreFocus) {
        routeSearchButton.focus();
    }
}

// 지도 도구 버튼으로 길찾기 패널을 열거나 닫습니다.
routeSearchButton?.addEventListener('click', () => {
    setRoutePanelOpen(routePanel?.hidden ?? false);
});

// 닫기 버튼으로 패널을 닫고 경로 탐색 버튼으로 초점을 돌려보냅니다.
routePanelCloseButton?.addEventListener('click', () => {
    setRoutePanelOpen(false, true);
});

// 키보드 사용자는 Escape 키로 길찾기 패널을 닫을 수 있습니다.
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && routePanel && !routePanel.hidden) {
        setRoutePanelOpen(false, true);
    }
});

// 지도의 초기화와 CSV 기반 식당 마커 생성은 restaurantMap.js에서 담당합니다.
window.RestaurantMap?.load();
