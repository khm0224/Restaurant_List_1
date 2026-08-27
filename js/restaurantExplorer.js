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

    // 즐겨찾기 저장 키를 지도 CSV에서도 비교할 수 있는 "행정동|음식점명" 키로 변환합니다.
    function getFavoriteRestaurantKeys() {
        const keys = [];
        const restaurantData = window.restaurantData || {};

        Object.entries(restaurantData).forEach(([district, districtData]) => {
            Object.entries(districtData).forEach(([category, stores]) => {
                stores.forEach((store, index) => {
                    if (isFavorite(`${district}_${category}_${index}`)) {
                        keys.push(`${district}|${store.name}`);
                    }
                });
            });
        });

        return keys;
    }

    function syncFavoriteMarkers() {
        window.RestaurantMap?.selectFavorites(
            favoritesOnly ? getFavoriteRestaurantKeys() : null
        );
    }

    // 카드에서 선택한 식당의 지역·카테고리·ID를 URL로 전달해 상세 화면을 엽니다.
    function openStoreDetail(district, category, index) {
        const parameters = new URLSearchParams({ district, category, id: index }); // 축약 문법
        // 실제로는
        // {
        //     district: district,
        //     category: category,
        //     id: index
        // } 이거 임
        window.location.href = `restaurant_detail.html?${parameters}`; // 페이지 이동 URL
    }
    // openStoreDetail('교동', '한식', 0); 이렇게 함수를 사용하면
    // district=교동&category=한식&id=0 이런 식으로 URL 문자열로 변환함
    // 위의 URL은 선택한 식당을 식별하고 상세 페이지로 전달하는 용도임

    // 선택된 동네와 업종으로 restaurantData를 필터링해 목록 카드를 다시 만듭니다.
    function renderSelectedStores(selectedCategory = sidebarCategorySelect.value) {
        // 지역·카테고리별로 저장된 전체 식당 데이터를 가져옵니다.
        const restaurantData = window.restaurantData || {};

        // 전체 선택이면 모든 지역을 사용하고, 특정 지역이 선택되면 해당 지역만 사용합니다.
        const districts = selectedDistricts.has(ALL_DISTRICTS)
            ? Object.entries(restaurantData)
            : Array.from(selectedDistricts, district => [district, restaurantData[district] || {}]);

        // 선택된 지역들의 데이터를 순회하며 카테고리별 식당 목록을 하나로 합칩니다.
        const stores = districts.flatMap(([district, districtData]) => {
            // 전체 카테고리면 해당 지역의 모든 카테고리를 사용하고,
            // 특정 카테고리면 선택된 카테고리만 사용합니다.
            const categories = selectedCategory === '전체'
                ? Object.keys(districtData)
                : [selectedCategory];

            // 각 식당 객체에 지역·카테고리·배열 인덱스를 추가해 식별할 수 있게 만듭니다.
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
            button.addEventListener('click', async event => {
                event.preventDefault();
                event.stopPropagation();

                const card = button.closest('.store-card');

                if (button.classList.contains('route-btn')) {
                    const store = window.restaurantData?.[card.dataset.district]
                        ?.[card.dataset.category]?.[Number(card.dataset.index)];

                    if (!store || !window.RestaurantService) {
                        window.alert('식당 위치 정보를 불러올 수 없습니다.');
                        return;
                    }

                    button.disabled = true;

                    try {
                        const restaurant = await window.RestaurantService.findRestaurant({
                            district: card.dataset.district,
                            name: store.name
                        });

                        if (!restaurant) {
                            throw new Error('식당 좌표를 찾을 수 없습니다.');
                        }

                        if (!window.DirectionsController?.setDestination(restaurant)) {
                            throw new Error('길찾기 화면에 도착지를 설정할 수 없습니다.');
                        }
                    } catch (error) {
                        window.alert(error.message || '식당 위치 정보를 불러올 수 없습니다.');
                    } finally {
                        button.disabled = false;
                    }

                    return;
                }

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

                if (favoritesOnly) {
                    syncFavoriteMarkers();
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
        // 전체를 선택하면 개별 동네 선택을 초기화하고 모든 동네를 대상으로 설정합니다.
        if (district === ALL_DISTRICTS) {
            selectedDistricts = new Set([ALL_DISTRICTS]);
        } else {
            // 개별 동네를 선택하면 전체 선택 상태를 해제합니다.
            selectedDistricts.delete(ALL_DISTRICTS);

            if (selectedDistricts.has(district)) {
                // 이미 선택된 동네를 다시 누르면 선택을 해제합니다.
                selectedDistricts.delete(district);
            } else {
                // 선택되지 않은 동네를 누르면 선택 목록에 추가합니다.
                selectedDistricts.add(district);
            }

            // 모든 동네가 해제되면 다시 전체 선택 상태로 되돌립니다.
            if (selectedDistricts.size === 0) {
                selectedDistricts.add(ALL_DISTRICTS);
            }
        }

        // 현재 선택된 동네 목록을 다른 화면 기능에서도 사용할 수 있도록 배열로 저장합니다.
        window.currentSelectedDistricts = Array.from(selectedDistricts);

        // 지역 버튼의 선택 스타일과 접근성 상태를 현재 선택값에 맞게 갱신합니다.
        const selectedButton = Array.from(categoryButtons).find(button => button.dataset.category === district);
        categoryButtons.forEach(button => {
            const isActive = selectedDistricts.has(button.dataset.category);
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        // URL로 특정 동네에 처음 진입한 경우 해당 버튼이 보이도록 스크롤합니다.
        if (scrollIntoView) {
            selectedButton?.scrollIntoView({ inline: 'center', block: 'nearest' });
        }

        // 선택된 동네를 지도와 식당 카드 목록에 반영합니다.
        window.RestaurantMap?.highlightDistricts(Array.from(selectedDistricts));
        renderSelectedStores();
    }

    // 업종 선택 상태를 드롭다운, 목록, 지도 마커에 동기화합니다.
    function selectCategory(category) {
        // 선택한 카테고리를 사이드바 드롭다운의 현재 값으로 반영합니다.
        sidebarCategorySelect.value = category;

        // 선택한 카테고리를 지도에 전달해 식당 마커를 필터링합니다.
        window.RestaurantMap?.selectCategory(category);

        // 선택한 카테고리를 기준으로 식당 카드 목록을 다시 생성합니다.
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
        syncFavoriteMarkers();
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

        syncFavoriteMarkers();
        renderSelectedStores();
    });
})();
