const categoryScroll = document.getElementById('category-scroll');
const functionScrollPrev = document.getElementById('function-scroll-prev');
const functionScrollNext = document.getElementById('function-scroll-next');
const content = document.getElementById('content');
const sidebarToggle = document.getElementById('sidebar-toggle');

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

// 지도의 초기화와 CSV 기반 식당 마커 생성은 restaurantMap.js에서 담당합니다.
window.RestaurantMap?.load();
