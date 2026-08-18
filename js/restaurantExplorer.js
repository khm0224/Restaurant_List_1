// 맛집 탐색 화면: URL 필터를 목록, 동네 버튼, 지도 마커에 함께 적용합니다.
(function () {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const storeList = document.getElementById('store-list');
    const sidebarCategorySelect = document.getElementById('sidebar-category-select');
    const favoritesButton = document.getElementById('favorites-button');
    const searchParams = new URLSearchParams(window.location.search);
    const ALL_DISTRICTS = '전체';
    const initialDistrict = searchParams.get('district')
        || document.querySelector('.category-btn.active, .category-btn[aria-pressed="true"]')?.dataset.category
        || ALL_DISTRICTS;
    let selectedDistricts = new Set();
    let favoritesOnly = false;

    // 카드에서 선택한 식당의 위치를 URL로 전달해 상세 화면을 엽니다.
    function openStoreDetail(district, category, index) {
        const parameters = new URLSearchParams({ district, category, id: index });
        window.location.href = `restaurant_detail.html?${parameters}`;
    }

    // 선택된 동네와 업종으로 restaurantData를 필터링해 목록 카드를 다시 만듭니다.
    function renderSelectedStores(selectedCategory = sidebarCategorySelect.value) {
        const restaurantData = window.restaurantData || {};
        const districts = selectedDistricts.has(ALL_DISTRICTS)
            ? Object.entries(restaurantData)
            : Array.from(selectedDistricts, district => [district, restaurantData[district] || {}]);
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

        const filteredStores = favoritesOnly
            ? stores.filter(store => isFavorite(`${store.district}_${store.category}_${store.index}`))
            : stores;

        if (filteredStores.length === 0) {
            storeList.innerHTML = favoritesOnly
                ? '<p class="empty-store-list">즐겨찾기한 식당이 없습니다.</p>'
                : '<p class="empty-store-list">선택된 카테고리에 식당이 없습니다.</p>';
            return;
        }

        // storeList.innerHTML 이게 food_page의 식당 카드 생성 구간 
        storeList.innerHTML = filteredStores.map(store => {
            const storeId = `${store.district}_${store.category}_${store.index}`;
            const favorite = isFavorite(storeId);

            return `
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
                        <button class="favorite-btn${favorite ? ' active' : ''}" type="button" aria-label="즐겨찾기" title="즐겨찾기">${favorite ? '★' : '☆'}</button>
                        <button class="nav-btn route-btn" type="button">길찾기</button>
                    </div>
                </div>
            </article>
        `;
        }).join('');

        // 카드 안의 보조 버튼은 클릭해도 상세 화면으로 이동하지 않게 합니다.
        storeList.querySelectorAll('.route-btn, .favorite-btn').forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();

                if (!button.classList.contains('favorite-btn')) return;

                const card = button.closest('.store-card');
                const storeId = `${card.dataset.district}_${card.dataset.category}_${card.dataset.index}`;

                const favorite = toggleFavorite(storeId);

                // null = 비로그인(또는 저장 실패). 아무 반응이 없으면 고장으로 보이므로 안내.
                // 버튼을 감추지 않고 남겨둔 이유 — 감추면 기능이 있다는 걸 모름.
                if (favorite === null) {
                    if (!getCurrentUser()) window.openLoginModal?.();
                    return;
                }

                button.textContent = favorite ? '★' : '☆';
                button.classList.toggle('active', favorite);

                if (favoritesOnly && !favorite) {
                    renderSelectedStores();
                }
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
        if (district === ALL_DISTRICTS) {
            selectedDistricts = new Set([ALL_DISTRICTS]);
        } else {
            selectedDistricts.delete(ALL_DISTRICTS);

            if (selectedDistricts.has(district)) {
                selectedDistricts.delete(district);
            } else {
                selectedDistricts.add(district);
            }

            if (selectedDistricts.size === 0) {
                selectedDistricts.add(ALL_DISTRICTS);
            }
        }

        window.currentSelectedDistricts = Array.from(selectedDistricts);

        const selectedButton = Array.from(categoryButtons).find(button => button.dataset.category === district);
        categoryButtons.forEach(button => {
            const isActive = selectedDistricts.has(button.dataset.category);
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        if (scrollIntoView) {
            selectedButton?.scrollIntoView({ inline: 'center', block: 'nearest' });
        }

        window.RestaurantMap?.highlightDistricts(Array.from(selectedDistricts));
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

    favoritesButton.addEventListener('click', () => {
        favoritesOnly = !favoritesOnly;
        favoritesButton.setAttribute('aria-pressed', String(favoritesOnly));
        sidebarCategorySelect.value = '전체';
        window.RestaurantMap?.selectCategory('전체');
        selectDistrict(ALL_DISTRICTS);
    });

    // 헤더 검색이 전달한 URL 파라미터로 첫 화면의 필터를 복원합니다.
    const requestedCategory = searchParams.get('category');
    const categoryExists = requestedCategory
        && Array.from(sidebarCategorySelect.options).some(option => option.value === requestedCategory);

    selectDistrict(initialDistrict, Boolean(searchParams.get('district')));
    selectCategory(categoryExists ? requestedCategory : sidebarCategorySelect.value);

    window.addEventListener('pageshow', event => {
        if (event.persisted) {
            renderSelectedStores();
        }
    });

    // 로그인은 모달로 이뤄져 새로고침이 없음.
    // ☆/★은 사람마다 다르므로 로그인·로그아웃 때 다시 그려야 함.
    document.addEventListener('auth:changed', () => {
        // 로그아웃하면 즐겨찾기가 비어 목록이 통째로 사라짐 — 전체 보기로 되돌림
        if (favoritesOnly && !getCurrentUser()) {
            favoritesOnly = false;
            favoritesButton.setAttribute('aria-pressed', 'false');
        }

        renderSelectedStores();
    });
})();
