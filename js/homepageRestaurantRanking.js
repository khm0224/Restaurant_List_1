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

        if (Number.isFinite(restaurant.distanceKm)) {
            const side = document.createElement('div');
            side.className = 'ranking-side';

            const distance = document.createElement('span');
            distance.className = 'ranking-distance';
            distance.textContent = restaurant.distanceLabel;

            const favorite = document.createElement('button');
            favorite.className = 'ranking-favorite';
            favorite.type = 'button';
            favorite.setAttribute('aria-label', `${restaurant.name} 즐겨찾기`);
            favorite.textContent = '♡';
            favorite.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                favorite.classList.toggle('active');
                favorite.textContent = favorite.classList.contains('active') ? '♥' : '♡';
            });

            side.append(distance, favorite);
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

    window.HomepageRanking = {
        showDistrict: selectDistrict
    };

    renderDistrict('전체');
})();
