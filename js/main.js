const categoryButtons = document.querySelectorAll('.category-btn');
const storeList = document.getElementById('store-list');

// 선택한 식당을 저장한 뒤 상세 화면으로 이동합니다.
function openStoreDetail(category, index) {
    if (window.setSelectedRestaurant) {
        window.setSelectedRestaurant(category, index);
    }

    window.location.href = `restaurant_detail.html?category=${encodeURIComponent(category)}&id=${index}`;
}

// 선택 카테고리의 식당 카드를 만들고 이동 이벤트를 연결합니다.
function renderStores(category) {
    if (!storeList) {
        return;
    }

    const district = window.currentSelectedDistrict || '교동';
    const stores = window.restaurantData?.[district]?.[category] || [];

    storeList.innerHTML = stores.map((store, index) => `
        <article class="store-card" data-category="${category}" data-index="${index}" tabindex="0">
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
                <button class="nav-btn route-btn" type="button" data-category="${category}" data-index="${index}">길찾기</button>
            </div>
        </article>
    `).join('');

    storeList.querySelectorAll('.route-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
    });

    storeList.querySelectorAll('.store-card').forEach(card => {
        card.addEventListener('click', (event) => {
            if (event.target.closest('.route-btn')) {
                return;
            }

            const targetCategory = card.dataset.category;
            const targetIndex = Number(card.dataset.index);
            openStoreDetail(targetCategory, targetIndex);
        });

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const targetCategory = card.dataset.category;
                const targetIndex = Number(card.dataset.index);
                openStoreDetail(targetCategory, targetIndex);
            }
        });
    });
}
// 카테고리 버튼이 있는 화면에서 목록 전환을 초기화합니다.
if (categoryButtons.length && storeList) {
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.toggle('active', btn === button));
            renderStores(button.dataset.category);
        });
    });

    renderStores('한식');
}

const regionButtons = document.querySelectorAll('.region-item');

if (regionButtons.length) {
    regionButtons.forEach(button => {
        button.addEventListener('click', () => {
            regionButtons.forEach(btn => btn.classList.toggle('active', btn === button));

            const district = button.dataset.region;
            window.location.href = `./html/food_page.html?district=${encodeURIComponent(district)}`;
        });
    });
}

if (document.getElementById('homepage-map')) {
    loadGoogleMaps();
}

// ===== 헤더 검색창 =====
// 헤더는 header.js가 fetch로 나중에 삽입하므로, 요소가 아직 없어도 걸리도록
// document에 이벤트 위임을 걸어둡니다. (login_modal.js의 로그인 버튼과 같은 방식)

const CUISINE_CATEGORIES = ['한식', '일식', '중식', '양식', '디저트'];

// 모든 동네·카테고리를 뒤져 이름이 일치하는 식당 한 곳을 찾습니다.
// 정확히 일치하는 식당을 우선하고, 없으면 부분 일치로 한 번 더 찾습니다.
function findRestaurantByName(keyword) {
    const restaurantData = window.restaurantData || {};
    const entries = Object.entries(restaurantData).flatMap(([district, districtData]) =>
        Object.entries(districtData).flatMap(([category, stores]) =>
            stores.map((store, index) => ({ store, district, category, index }))
        )
    );

    return entries.find(entry => entry.store.name === keyword)
        || entries.find(entry => entry.store.name.includes(keyword))
        || null;
}

function runHeaderSearch() {
    const input = document.querySelector('#header-root .search-box input');
    if (!input) return;

    const keyword = input.value.trim();
    if (!keyword) return;

    // 음식 카테고리명을 그대로 입력한 경우: 전체 지역에서 해당 카테고리로 이동
    if (CUISINE_CATEGORIES.includes(keyword)) {
        window.location.href = `./html/food_page.html?district=전체&category=${encodeURIComponent(keyword)}`;
        return;
    }

    // 그 외에는 음식점 이름 검색: 찾으면 해당 상세 페이지로 이동
    const found = findRestaurantByName(keyword);
    if (found) {
        window.location.href = `./html/restaurant_detail.html?district=${encodeURIComponent(found.district)}&category=${encodeURIComponent(found.category)}&id=${found.index}`;
        return;
    }

    alert('검색 결과가 없습니다.');
}

document.addEventListener('click', (event) => {
    if (event.target.closest('#header-root .search-btn')) {
        runHeaderSearch();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.matches('#header-root .search-box input')) {
        event.preventDefault();
        runHeaderSearch();
    }
});