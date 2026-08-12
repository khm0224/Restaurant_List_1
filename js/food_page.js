const categoryButtons = document.querySelectorAll('.category-btn');
const storeList = document.getElementById('store-list');
const content = document.getElementById('content');
const sidebarToggle = document.getElementById('sidebar-toggle');
const mapKeyInput = document.getElementById('map-api-key');
const loadMapButton = document.getElementById('load-map-btn');
const mapLoader = document.getElementById('map-loader');
const mapStatus = document.getElementById('map-status');

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
        <a class="store-card-link" href="restaurant_detail.html?category=${encodeURIComponent(store.category)}&id=${store.index}">
            <article class="store-card">
                <img src="${store.img}" alt="${store.name}" class="store-img">
                <div class="store-info">
                    <h3 class="store-name">${store.name}</h3>
                    <p class="store-address">${store.address}</p>
                    <div class="store-meta">
                        <span>⭐ ${store.rating}</span>
                        <span>리뷰 ${store.reviewCount}</span>
                    </div>
                </div>
            </article>
        </a>
    `).join('');
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

loadMapButton.addEventListener('click', loadGoogleMaps);
mapKeyInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') loadGoogleMaps();
});

function loadGoogleMaps() {
    const apiKey = mapKeyInput.value.trim();

    if (!apiKey) {
        mapStatus.textContent = 'API 키를 입력하세요.';
        mapKeyInput.focus();
        return;
    }

    loadMapButton.disabled = true;
    mapStatus.textContent = '지도를 불러오는 중입니다…';

    window.initFoodMap = initFoodMap;
    window.gm_authFailure = () => {
        mapStatus.textContent = '인증에 실패했습니다. API 키와 HTTP 리퍼러 제한을 확인하세요.';
        loadMapButton.disabled = false;
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=initFoodMap&v=weekly&language=ko&region=KR`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
        mapStatus.textContent = 'Google Maps 스크립트를 불러오지 못했습니다.';
        loadMapButton.disabled = false;
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
    mapKeyInput.value = '';
    mapLoader.hidden = true;
}
