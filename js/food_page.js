const categoryButtons = document.querySelectorAll('.category-btn');
const storeList = document.getElementById('store-list');
const content = document.getElementById('content');
const sidebarToggle = document.getElementById('sidebar-toggle');
const mapLoader = document.getElementById('map-loader');
const mapStatus = document.getElementById('map-status');

function openStoreDetail(category, index) {
    if (window.setSelectedRestaurant) {
        window.setSelectedRestaurant(category, index);
    }

    window.location.href = `restaurant_detail.html?category=${encodeURIComponent(category)}&id=${index}`;
}

function renderSelectedStores() {
    const selectedCategories = [...categoryButtons]
        .filter(button => button.classList.contains('active'))
        .map(button => button.dataset.category);

    const stores = selectedCategories.flatMap(category =>
        (window.restaurantData?.[category] || []).map((store, index) => ({
            ...store,
            category,
            index
        }))
    );

    if (stores.length === 0) {
        storeList.innerHTML = '<p class="empty-store-list">음식 종류를 하나 이상 선택하세요.</p>';
        return;
    }

    storeList.innerHTML = stores.map(store => `
        <article class="store-card" data-category="${store.category}" data-index="${store.index}" tabindex="0">
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

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        const isSelected = button.classList.toggle('active');
        button.setAttribute('aria-pressed', String(isSelected));
        renderSelectedStores();
    });
});

renderSelectedStores();

sidebarToggle.addEventListener('click', () => {
    const isCollapsed = content.classList.toggle('sidebar-collapsed');
    sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
    sidebarToggle.setAttribute('aria-label', isCollapsed ? '식당 목록 보이기' : '식당 목록 숨기기');

    window.setTimeout(() => {
        if (window.foodMap) {
            google.maps.event.trigger(window.foodMap, 'resize');
        }
    }, 320);
});

function loadGoogleMaps() {
    const apiKey = window.GOOGLE_MAPS_API_KEY?.trim();
    const hasValidApiKeyFormat = /^AIza[0-9A-Za-z_-]{30,}$/.test(apiKey || '');

    if (!hasValidApiKeyFormat) {
        mapStatus.textContent = '유효한 Google Maps API 키가 없어 지도가 비활성화되었습니다.';
        mapStatus.classList.add('is-error');
        return;
    }

    mapStatus.textContent = '지도를 불러오는 중입니다…';

    window.initFoodMap = initFoodMap;
    window.gm_authFailure = () => {
        mapStatus.textContent = '인증에 실패했습니다. API 키와 HTTP 리퍼러 제한을 확인하세요.';
        mapStatus.classList.add('is-error');
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=initFoodMap&v=weekly&language=ko&region=KR`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
        mapStatus.textContent = 'Google Maps 스크립트를 불러오지 못했습니다.';
        mapStatus.classList.add('is-error');
    };
    document.head.appendChild(script);
}

function initFoodMap() {
    const seoulCityHall = { lat: 37.5665, lng: 126.9780 };
    const map = new google.maps.Map(document.getElementById('map-api'), {
        center: seoulCityHall,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false
    });
    window.foodMap = map;

    const marker = new google.maps.Marker({
        position: seoulCityHall,
        map,
        title: '서울특별시청'
    });

    const infoWindow = new google.maps.InfoWindow({
        content: '<strong>서울특별시청</strong><br>지도 연결 테스트가 완료되었습니다.'
    });

    marker.addListener('click', () => infoWindow.open({ anchor: marker, map }));
    mapLoader.hidden = true;
}

loadGoogleMaps();
