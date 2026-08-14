const categoryButtons = document.querySelectorAll('.category-btn');
const categoryScroll = document.getElementById('category-scroll');
const functionScrollPrev = document.getElementById('function-scroll-prev');
const functionScrollNext = document.getElementById('function-scroll-next');
const storeList = document.getElementById('store-list');
const sidebarCategorySelect = document.getElementById('sidebar-category-select');
const content = document.getElementById('content');
const sidebarToggle = document.getElementById('sidebar-toggle');
let selectedDistrict = document.querySelector('.category-btn.active, .category-btn[aria-pressed="true"]')?.dataset.category || '전체';

// 선택한 식당 정보를 세션 스토리지에 저장하고 상세 페이지로 이동합니다.
function openStoreDetail(district, category, index) {
    if (window.setSelectedRestaurant) {
        window.setSelectedRestaurant(district, category, index);
    }

    window.location.href = `restaurant_detail.html?district=${encodeURIComponent(district)}&category=${encodeURIComponent(category)}&id=${index}`;
}

// 현재 선택된 동네/카테고리에 맞는 식당 목록을 생성하고 카드 클릭 이벤트를 연결합니다.
function renderSelectedStores(selectedCategory = sidebarCategorySelect.value) {
    const restaurantData = window.restaurantData || {};
    const districts = selectedDistrict === '전체'
        ? Object.entries(restaurantData)
        : [[selectedDistrict, restaurantData[selectedDistrict] || {}]];
    const stores = districts.flatMap(([district, districtData]) => {
        const categories = selectedCategory === '전체'
            ? Object.keys(districtData)
            : [selectedCategory];

        return categories.flatMap(category =>
            (districtData[category] || []).map((store, index) => ({
                ...store,
                district,
                category,
                index
            }))
        );
    });

    if (stores.length === 0) {
        storeList.innerHTML = '<p class="empty-store-list">선택된 카테고리에 식당이 없습니다.</p>';
        return;
    }

    storeList.innerHTML = stores.map(store => `
        <article class="store-card" data-district="${store.district}" data-category="${store.category}" data-index="${store.index}" tabindex="0">
            <div class="store-main-row">
                <img src="${store.img}" alt="${store.name}" class="store-img">
                <div class="store-info">
                    <h3 class="store-name">${store.name}</h3>
                    <p class="store-address">${store.address}</p>
                    <div class="store-meta">
                        <span>⭐ ${store.rating}</span>
                        <span>리뷰 ${store.reviewCount}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="favorite-btn" type="button" aria-label="즐겨찾기" title="즐겨찾기">☆</button>
                    <button class="nav-btn route-btn" type="button" data-category="${store.category}" data-index="${store.index}">길찾기</button>
                </div>
            </div>
        </article>
    `).join('');

    storeList.querySelectorAll('.route-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
    });

    storeList.querySelectorAll('.favorite-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
    });

    storeList.querySelectorAll('.store-card').forEach(card => {
        card.addEventListener('click', (event) => {
            if (event.target.closest('.route-btn') || event.target.closest('.favorite-btn')) {
                return;
            }

            const targetCategory = card.dataset.category;
            const targetDistrict = card.dataset.district;
            const targetIndex = Number(card.dataset.index);
            openStoreDetail(targetDistrict, targetCategory, targetIndex);
        });

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const targetCategory = card.dataset.category;
                const targetDistrict = card.dataset.district;
                const targetIndex = Number(card.dataset.index);
                openStoreDetail(targetDistrict, targetCategory, targetIndex);
            }
        });
    });
}

// 동네 버튼 클릭 시 선택 상태와 지도 강조, 목록 재렌더링을 함께 처리합니다.
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        selectedDistrict = button.dataset.category;
        window.currentSelectedDistrict = selectedDistrict;

        categoryButtons.forEach(btn => {
            const isActive = btn === button;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });

        window.RestaurantMap?.highlightDistrict(selectedDistrict);
        renderSelectedStores(sidebarCategorySelect.value);
    });
});

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

// 사이드바 카테고리 선택 값이 바뀌면 목록을 다시 그립니다.
sidebarCategorySelect.addEventListener('change', () => {
    const selectedCategory = sidebarCategorySelect.value;
    window.RestaurantMap?.selectCategory(selectedCategory);
    renderSelectedStores(selectedCategory);
});

// 첫 화면에는 기본 카테고리인 한식을 표시합니다.
renderSelectedStores();

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
