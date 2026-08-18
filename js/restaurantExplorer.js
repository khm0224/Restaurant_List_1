// 맛집 탐색 화면: URL 필터를 목록, 동네 버튼, 지도 마커에 함께 적용합니다.
(function () {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const storeList = document.getElementById('store-list');
    const sidebarCategorySelect = document.getElementById('sidebar-category-select');
    const searchParams = new URLSearchParams(window.location.search);
    let selectedDistrict = searchParams.get('district')
        || document.querySelector('.category-btn.active, .category-btn[aria-pressed="true"]')?.dataset.category
        || '전체';

    // 카드에서 선택한 식당의 위치를 URL로 전달해 상세 화면을 엽니다.
    function openStoreDetail(district, category, index) {
        const parameters = new URLSearchParams({ district, category, id: index });
        window.location.href = `restaurant_detail.html?${parameters}`;
    }

    // 선택된 동네와 업종으로 restaurantData를 필터링해 목록 카드를 다시 만듭니다.
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
                        <button class="nav-btn route-btn" type="button">길찾기</button>
                    </div>
                </div>
            </article>
        `).join('');

        // 카드 안의 보조 버튼은 클릭해도 상세 화면으로 이동하지 않게 합니다.
        storeList.querySelectorAll('.route-btn, .favorite-btn').forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
            });
        });

        storeList.querySelectorAll('.store-card').forEach(card => {
            const openSelectedStore = event => {
                if (event.target.closest('.route-btn, .favorite-btn')) {
                    return;
                }

                openStoreDetail(card.dataset.district, card.dataset.category, card.dataset.index);
            };

            card.addEventListener('click', openSelectedStore);
            card.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openSelectedStore(event);
                }
            });
        });
    }

    // 동네 선택 상태를 버튼, 목록, 지도 경계에 동기화합니다.
    function selectDistrict(district, scrollIntoView = false) {
        selectedDistrict = district;
        window.currentSelectedDistrict = district;

        const selectedButton = Array.from(categoryButtons).find(button => button.dataset.category === district);
        categoryButtons.forEach(button => {
            const isActive = button === selectedButton;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        if (scrollIntoView) {
            selectedButton?.scrollIntoView({ inline: 'center', block: 'nearest' });
        }

        window.RestaurantMap?.highlightDistrict(district);
        renderSelectedStores();
    }

    // 업종 선택 상태를 드롭다운, 목록, 지도 마커에 동기화합니다.
    function selectCategory(category) {
        sidebarCategorySelect.value = category;
        window.RestaurantMap?.selectCategory(category);
        renderSelectedStores(category);
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => selectDistrict(button.dataset.category));
    });

    sidebarCategorySelect.addEventListener('change', () => {
        selectCategory(sidebarCategorySelect.value);
    });

    // 헤더 검색이 전달한 URL 파라미터로 첫 화면의 필터를 복원합니다.
    const requestedCategory = searchParams.get('category');
    const categoryExists = requestedCategory
        && Array.from(sidebarCategorySelect.options).some(option => option.value === requestedCategory);

    selectDistrict(selectedDistrict, Boolean(searchParams.get('district')));
    selectCategory(categoryExists ? requestedCategory : sidebarCategorySelect.value);
})();