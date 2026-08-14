const categoryButtons = document.querySelectorAll('.category-btn');
const categoryScroll = document.getElementById('category-scroll');
const functionScrollPrev = document.getElementById('function-scroll-prev');
const functionScrollNext = document.getElementById('function-scroll-next');
const storeList = document.getElementById('store-list');
const sidebarCategorySelect = document.getElementById('sidebar-category-select');
const content = document.getElementById('content');
const sidebarToggle = document.getElementById('sidebar-toggle');
let selectedDistrict = document.querySelector('.category-btn.active, .category-btn[aria-pressed="true"]')?.dataset.category || '전체';

// 선택한 식당 정보를 저장하고 상세 페이지로 이동합니다.
function openStoreDetail(district, category, index) {
    if (window.setSelectedRestaurant) {
        window.setSelectedRestaurant(district, category, index);
    }

    window.location.href = `restaurant_detail.html?district=${encodeURIComponent(district)}&category=${encodeURIComponent(category)}&id=${index}`;
}

// 현재 카테고리의 식당 목록과 클릭 이벤트를 화면에 만듭니다.
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

function updateFunctionScrollButtons() {
    const maxScrollLeft = categoryScroll.scrollWidth - categoryScroll.clientWidth;
    functionScrollPrev.disabled = categoryScroll.scrollLeft <= 0;
    functionScrollNext.disabled = categoryScroll.scrollLeft >= maxScrollLeft - 1;
}

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

sidebarCategorySelect.addEventListener('change', () => {
    const selectedCategory = sidebarCategorySelect.value;
    renderSelectedStores(selectedCategory);
});

// 첫 화면에는 기본 카테고리인 한식을 표시합니다.
renderSelectedStores();

sidebarToggle.addEventListener('click', () => {
    const isCollapsed = content.classList.toggle('sidebar-collapsed');
    sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
    sidebarToggle.setAttribute('aria-label', isCollapsed ? '식당 목록 보이기' : '식당 목록 숨기기');

    window.setTimeout(() => {
        window.RestaurantMap?.resize();
    }, 320);
});

// 지도 관련 구현은 restaurantMap.js로 이관.
window.RestaurantMap?.load();
