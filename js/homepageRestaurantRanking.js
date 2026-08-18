(function () {
    const rankingList = document.getElementById('homepage-ranking');
    const rankingTitle = document.getElementById('ranking-title');
    const rankingMore = document.getElementById('ranking-more');
    const prevButton = document.getElementById('rankingPrev');
    const nextButton = document.getElementById('rankingNext');
    const rankingTabs = Array.from(document.querySelectorAll('.ranking-tab'));

    if (!rankingList || !rankingTitle || !rankingMore || !prevButton || !nextButton) {
        return;
    }

    const districts = ['전체', ...Object.keys(window.restaurantData || {})];
    let selectedDistrictIndex = 0;

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

        const image = document.createElement('div');
        image.className = 'ranking-image';
        image.style.backgroundImage = `url("${restaurant.img || ''}")`;
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
        card.append(image, info);

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
            return;
        }

        const fragment = document.createDocumentFragment();
        restaurants.forEach((restaurant, index) => {
            fragment.appendChild(createRestaurantCard(restaurant, index + 1));
        });
        rankingList.appendChild(fragment);
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

    function selectRankingMode(selectedTab) {
        rankingTabs.forEach(tab => {
            const isActive = tab === selectedTab;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
        });

        if (selectedTab.dataset.rankingMode === 'nearby') {
            rankingTitle.textContent = '내 주변 맛집';
            rankingList.innerHTML = '<p class="ranking-empty">내 주변 맛집 기능은 준비 중입니다.</p>';
            rankingMore.hidden = true;
            prevButton.disabled = true;
            nextButton.disabled = true;
            return;
        }

        rankingMore.hidden = false;
        prevButton.disabled = false;
        nextButton.disabled = false;
        renderDistrict(districts[selectedDistrictIndex]);
    }

    prevButton.addEventListener('click', () => moveDistrict(-1));
    nextButton.addEventListener('click', () => moveDistrict(1));
    rankingTabs.forEach(tab => {
        tab.addEventListener('click', () => selectRankingMode(tab));
    });

    window.HomepageRanking = {
        showDistrict: selectDistrict
    };

    renderDistrict('전체');
})();
