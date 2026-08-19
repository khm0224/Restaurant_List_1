(function () {
    const rankingList = document.getElementById('homepage-ranking');
    const rankingTitle = document.getElementById('ranking-title');
    const rankingMore = document.getElementById('ranking-more');
    const prevButton = document.getElementById('rankingPrev');
    const nextButton = document.getElementById('rankingNext');
    const rankingTabs = Array.from(document.querySelectorAll('.ranking-tab'));
    const rankingPanel = document.querySelector('.ranking-panel');
    const nearbyControls = document.getElementById('nearby-controls');
    const nearbyLocationStatus = document.getElementById('nearby-location-status');
    const nearbySummary = document.getElementById('nearby-summary');
    const nearbyRadiusButtons = Array.from(document.querySelectorAll('[data-radius]'));
    const customRadiusButton = document.getElementById('nearby-custom-radius');

    if (!rankingList || !rankingTitle || !rankingMore || !prevButton || !nextButton) {
        return;
    }

    const districts = ['전체', ...Object.keys(window.restaurantData || {})];
    let selectedDistrictIndex = 0;
    let selectedRankingMode = 'district';
    let nearbyOrigin = null;
    let nearbyRadiusKm = 0.5;
    let nearbyRestaurants = [];

    function collectRestaurants(district) {
        const restaurantData = window.restaurantData || {};
        const targetDistricts = district === '전체'
            ? Object.entries(restaurantData)
            : [[district, restaurantData[district]]];

        return targetDistricts.flatMap(([districtName, districtData]) => {
            if (!districtData) {
                return [];
            }

            return Object.entries(districtData).flatMap(([category, stores]) =>
                stores.map((store, index) => ({
                    ...store,
                    district: districtName,
                    category,
                    index
                }))
            );
        });
    }

    function getTopRestaurants(district) {
        return collectRestaurants(district)
            .sort((first, second) =>
                second.rating - first.rating ||
                second.reviewCount - first.reviewCount
            )
            .slice(0, 3);
    }

    function getDetailUrl(restaurant) {
        if (!Number.isInteger(restaurant.index) || restaurant.index < 0) {
            return `./html/food_page.html?district=${encodeURIComponent(restaurant.district)}`;
        }

        const params = new URLSearchParams({
            district: restaurant.district,
            category: restaurant.category,
            id: String(restaurant.index)
        });

        return `./html/restaurant_detail.html?${params.toString()}`;
    }

    // 즐겨찾기 키. 맛집 탐색(restaurantExplorer.js:55)·내 활동과 같은 "동네_카테고리_순번" 형식.
    // 형식이 화면마다 갈라지면 여기서 담은 가게가 즐겨찾기 목록에 뜨지 않음.
    function getStoreId(restaurant) {
        return `${restaurant.district}_${restaurant.category}_${restaurant.index}`;
    }

    // 저장은 favorites.js가 맡음. 여기서는 화면 표시와 안내만 함.
    function setFavoriteState(button, isActive, name) {
        button.classList.toggle('active', isActive);
        button.textContent = isActive ? '♥' : '♡';
        button.setAttribute('aria-pressed', String(isActive));
        button.setAttribute('aria-label', `${name} 즐겨찾기 ${isActive ? '해제' : '추가'}`);
    }

    function createFavoriteButton(restaurant) {
        const storeId = getStoreId(restaurant);
        const button = document.createElement('button');
        button.className = 'ranking-favorite';
        button.type = 'button';

        // 그릴 때마다 저장소에 물어봄. 변수에 담아두면 계정이 바뀌었을 때 옛 값이 남음.
        setFavoriteState(button, isFavorite(storeId), restaurant.name);

        button.addEventListener('click', event => {
            // 카드 전체가 <a>라 막지 않으면 상세 페이지로 넘어가 버림
            event.preventDefault();
            event.stopPropagation();

            const added = toggleFavorite(storeId);

            // null = 비로그인 또는 저장 실패. 아무 반응이 없으면 고장으로 보이므로 로그인 모달로 안내
            // (맛집 탐색 화면 restaurantExplorer.js:94와 같은 처리).
            if (added === null) {
                if (!getCurrentUser()) window.openLoginModal?.();
                return;
            }

            setFavoriteState(button, added, restaurant.name);
        });

        return button;
    }

    function createRestaurantCard(restaurant, rank) {
        const card = document.createElement('a');
        card.className = 'ranking-item';
        card.href = getDetailUrl(restaurant);
        card.dataset.restaurantKey = [
            restaurant.district,
            restaurant.category,
            restaurant.index
        ].join('|');

        function requestMapFocus() {
            window.dispatchEvent(new CustomEvent('homepage:restaurant-focus-request', {
                detail: { key: card.dataset.restaurantKey }
            }));
        }

        card.addEventListener('mouseenter', requestMapFocus);
        card.addEventListener('focus', requestMapFocus);

        const image = document.createElement('div');
        image.className = 'ranking-image';
        image.style.backgroundImage = `url("${restaurant.img || restaurant.imageUrl || ''}")`;
        image.setAttribute('role', 'img');
        image.setAttribute('aria-label', `${restaurant.name} 이미지`);

        const rankBadge = document.createElement('span');
        rankBadge.className = 'ranking-number';
        rankBadge.textContent = String(rank);
        image.appendChild(rankBadge);

        const info = document.createElement('div');
        info.className = 'ranking-info';

        const category = document.createElement('span');
        category.className = 'ranking-category';
        category.textContent = restaurant.category;

        const name = document.createElement('h3');
        name.textContent = restaurant.name;

        const rating = document.createElement('p');
        rating.className = 'ranking-rating';
        rating.append(`★ ${restaurant.rating} `);

        const reviewCount = document.createElement('span');
        reviewCount.textContent = `(리뷰 ${restaurant.reviewCount})`;
        rating.appendChild(reviewCount);

        info.append(category, name, rating);

        if (restaurant.address) {
            const description = document.createElement('p');
            description.className = 'ranking-description';
            description.textContent = restaurant.address;
            info.appendChild(description);
        }

        card.append(image, info);

        // 거리는 주변 탭에만 있고, 하트는 두 탭 모두에 붙음.
        // 둘 다 없으면 빈 칸만 생기므로 하나라도 있을 때만 side를 만듦.
        const hasDistance = Number.isFinite(restaurant.distanceKm);

        // index는 카테고리 배열 안의 순번.
        // 지역별 탭은 목록을 만들 때 붙인 값이라 항상 있지만(collectRestaurants),
        // 주변 탭은 이름으로 찾아낸 값이라 못 찾으면 -1(enrichNearbyRestaurant).
        // -1로 키를 만들면 "교동_양식_-1"이 되어 서로 다른 가게가 한 칸에 뭉침.
        const canFavorite = Number.isInteger(restaurant.index) && restaurant.index >= 0;

        if (hasDistance || canFavorite) {
            const side = document.createElement('div');
            side.className = 'ranking-side';

            if (hasDistance) {
                const distance = document.createElement('span');
                distance.className = 'ranking-distance';
                distance.textContent = restaurant.distanceLabel;
                side.appendChild(distance);
            } else {
                // side는 위아래로 벌리는 배치(space-between)라 하트만 있으면 위로 붙음.
                // 지역별 탭 카드는 거리가 없으므로 가운데로 맞춤.
                side.classList.add('is-favorite-only');
            }

            if (canFavorite) {
                side.appendChild(createFavoriteButton(restaurant));
            }

            card.appendChild(side);
        }

        return card;
    }

    function updateDistrictHeading(district) {
        const isAllDistricts = district === '전체';

        rankingTitle.textContent = isAllDistricts
            ? '춘천 전체 맛집'
            : `${district} 맛집`;

        rankingMore.textContent = isAllDistricts
            ? '춘천 맛집 전체보기 ›'
            : `${district} 맛집 전체보기 ›`;

        rankingMore.href = `./html/food_page.html?district=${encodeURIComponent(district)}`;
    }

    function renderDistrict(district) {
        const restaurants = getTopRestaurants(district);
        rankingList.replaceChildren();
        updateDistrictHeading(district);

        if (restaurants.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'ranking-empty';
            emptyMessage.textContent = '등록된 맛집이 없습니다.';
            rankingList.appendChild(emptyMessage);
            window.dispatchEvent(new CustomEvent('homepage:ranking-change', {
                detail: { district, restaurants: [] }
            }));
            return;
        }

        const fragment = document.createDocumentFragment();
        restaurants.forEach((restaurant, index) => {
            fragment.appendChild(createRestaurantCard(restaurant, index + 1));
        });
        rankingList.appendChild(fragment);

        window.dispatchEvent(new CustomEvent('homepage:ranking-change', {
            detail: { district, restaurants }
        }));
    }

    function selectDistrict(district) {
        const districtIndex = districts.indexOf(district);

        if (districtIndex === -1) {
            return;
        }

        selectedDistrictIndex = districtIndex;
        renderDistrict(district);
    }

    function moveDistrict(step) {
        const totalDistricts = districts.length;
        selectedDistrictIndex = (
            selectedDistrictIndex + step + totalDistricts
        ) % totalDistricts;

        renderDistrict(districts[selectedDistrictIndex]);
    }

    function enrichNearbyRestaurant(restaurant) {
        const districtData = window.restaurantData?.[restaurant.district] || {};
        let matchedCategory = restaurant.category;
        let matchedIndex = -1;
        let matchedRestaurant = null;

        Object.entries(districtData).some(([category, stores]) => {
            const index = stores.findIndex(store => store.name === restaurant.name);

            if (index === -1) {
                return false;
            }

            matchedCategory = category;
            matchedIndex = index;
            matchedRestaurant = stores[index];
            return true;
        });

        return {
            ...restaurant,
            ...matchedRestaurant,
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
            category: matchedCategory,
            index: matchedIndex
        };
    }

    function formatRadius(radiusKm) {
        return radiusKm < 1
            ? `${Math.round(radiusKm * 1000)}m`
            : `${radiusKm}km`;
    }

    function renderNearbyResults() {
        window.HomepageMap?.showSearchRadius(nearbyOrigin, nearbyRadiusKm);

        const results = window.NearbyRestaurantService.findNearby({
            origin: nearbyOrigin,
            restaurants: nearbyRestaurants,
            radiusKm: nearbyRadiusKm,
            limit: 3,
            sortBy: 'rating'
        });

        rankingList.replaceChildren();
        const radiusLabel = formatRadius(nearbyRadiusKm);
        nearbySummary.textContent = `${radiusLabel} 이내 맛집을 평점순으로 표시합니다.`;
        rankingMore.hidden = false;
        rankingMore.textContent = '더 많은 주변 맛집 보기 ›';
        rankingMore.href = `./html/food_page.html?nearby=true&radius=${nearbyRadiusKm}`;

        if (results.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'ranking-empty';
            emptyMessage.textContent = `현재 위치의 ${radiusLabel} 이내에 등록된 맛집이 없습니다.`;
            rankingList.appendChild(emptyMessage);
        } else {
            const fragment = document.createDocumentFragment();
            results.forEach((restaurant, index) => {
                fragment.appendChild(createRestaurantCard(restaurant, index + 1));
            });
            rankingList.appendChild(fragment);
        }

        window.dispatchEvent(new CustomEvent('homepage:ranking-change', {
            detail: { district: '내 주변', restaurants: results }
        }));
    }

    async function loadNearbyRestaurants() {
        rankingTitle.textContent = '내 주변 맛집';
        rankingList.innerHTML = '<p class="ranking-empty">현재 위치와 주변 맛집을 확인하고 있습니다.</p>';
        rankingMore.hidden = true;
        nearbyLocationStatus.textContent = '현재 위치 확인 중…';

        try {
            const [position, restaurants] = await Promise.all([
                window.GeolocationService.getCurrentPosition(),
                window.RestaurantService.getRestaurants()
            ]);

            if (selectedRankingMode !== 'nearby') {
                return;
            }

            nearbyOrigin = position;
            nearbyRestaurants = restaurants.map(enrichNearbyRestaurant);
            nearbyLocationStatus.textContent = `현재 위치 기준 · 정확도 약 ${Math.round(position.accuracy)}m`;
            window.HomepageMap?.showCurrentLocation(position);
            renderNearbyResults();
        } catch (error) {
            if (selectedRankingMode !== 'nearby') {
                return;
            }

            rankingList.innerHTML = `<p class="ranking-empty">${error.message}</p>`;
            nearbyLocationStatus.textContent = '현재 위치를 사용할 수 없습니다.';
        }
    }

    function selectRankingMode(selectedTab) {
        selectedRankingMode = selectedTab.dataset.rankingMode;
        rankingTabs.forEach(tab => {
            const isActive = tab === selectedTab;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
        });

        const isNearby = selectedRankingMode === 'nearby';
        rankingPanel.classList.toggle('is-nearby', isNearby);
        nearbyControls.hidden = !isNearby;

        if (isNearby) {
            rankingTitle.textContent = '내 주변 맛집';
            prevButton.disabled = true;
            nextButton.disabled = true;
            loadNearbyRestaurants();
            return;
        }

        rankingMore.hidden = false;
        prevButton.disabled = false;
        nextButton.disabled = false;
        window.HomepageMap?.hideCurrentLocation();
        renderDistrict(districts[selectedDistrictIndex]);
    }

    prevButton.addEventListener('click', () => moveDistrict(-1));
    nextButton.addEventListener('click', () => moveDistrict(1));
    rankingTabs.forEach(tab => {
        tab.addEventListener('click', () => selectRankingMode(tab));
    });

    nearbyRadiusButtons.forEach(button => {
        button.addEventListener('click', () => {
            nearbyRadiusKm = Number(button.dataset.radius);
            nearbyRadiusButtons.forEach(item => item.classList.toggle('active', item === button));
            customRadiusButton.classList.remove('active');
            customRadiusButton.textContent = '직접설정';

            if (nearbyOrigin) {
                renderNearbyResults();
            }
        });
    });

    customRadiusButton.addEventListener('click', () => {
        const input = window.prompt('검색할 반경을 km 단위로 입력해 주세요. (0.1~50)', String(nearbyRadiusKm));

        if (input === null) {
            return;
        }

        const customRadius = Number(input);

        if (!Number.isFinite(customRadius) || customRadius < 0.1 || customRadius > 50) {
            window.alert('검색 반경은 0.1km 이상 50km 이하로 입력해 주세요.');
            return;
        }

        nearbyRadiusKm = Math.round(customRadius * 10) / 10;
        nearbyRadiusButtons.forEach(button => button.classList.remove('active'));
        customRadiusButton.classList.add('active');
        customRadiusButton.textContent = formatRadius(nearbyRadiusKm);

        if (nearbyOrigin) {
            renderNearbyResults();
        }
    });

    window.addEventListener('homepage:restaurant-focus', event => {
        const restaurantKey = event.detail?.key;

        rankingList.querySelectorAll('.ranking-item').forEach(card => {
            card.classList.toggle(
                'is-map-focused',
                card.dataset.restaurantKey === restaurantKey
            );
        });

        const selectedCard = rankingList.querySelector(
            `.ranking-item[data-restaurant-key="${CSS.escape(restaurantKey || '')}"]`
        );
        selectedCard?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    // 로그인은 모달로 이뤄져 새로고침이 없음. ♡/♥는 사람마다 다르므로 다시 그림.
    document.addEventListener('auth:changed', () => {
        if (selectedRankingMode !== 'nearby') {
            renderDistrict(districts[selectedDistrictIndex]);
            return;
        }

        // 위치를 아직 못 받았으면 그릴 목록 자체가 없어 건너뜀 —
        // 여기서 loadNearbyRestaurants를 부르면 로그인할 때마다 위치를 다시 물음.
        if (nearbyOrigin) {
            renderNearbyResults();
        }
    });

    window.HomepageRanking = {
        showDistrict: selectDistrict
    };

    renderDistrict('전체');
})();
