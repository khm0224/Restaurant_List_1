function initHomepageMap() {
    const mapElement = document.getElementById('homepage-map');
    if (!mapElement || typeof google === 'undefined' || !google.maps) {
        return;
    }

    const chuncheon = { lat: 37.8813, lng: 127.7298 };

    const map = new google.maps.Map(mapElement, {
        center: chuncheon,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });

    new google.maps.Marker({
        map,
        position: chuncheon,
        title: '춘천'
    });
}

function loadGoogleMaps() {
    const mapStatus = document.getElementById('homepage-map-status');
    const mapElement = document.getElementById('homepage-map');

    if (!mapElement || !mapStatus) {
        return;
    }

    const apiKey = window.GOOGLE_MAPS_API_KEY?.trim();
    const hasValidApiKeyFormat = /^AIza[0-9A-Za-z_-]{30,}$/.test(apiKey || '');

    if (!hasValidApiKeyFormat) {
        mapStatus.textContent = '유효한 Google Maps API 키가 없어 미니 맵이 비활성화되었습니다.';
        mapStatus.classList.add('is-disabled');
        return;
    }

    window.initHomepageMap = initHomepageMap;
    window.gm_authFailure = () => {
        mapStatus.textContent = 'Google Maps 인증에 실패했습니다. API 키 설정을 확인하세요.';
        mapStatus.classList.add('is-error');
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=initHomepageMap&v=weekly&language=ko&region=KR`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
        mapStatus.textContent = 'Google Maps를 불러오지 못했습니다.';
        mapStatus.classList.add('is-error');
    };
    document.head.appendChild(script);
}

const categoryButtons = document.querySelectorAll('.category-btn');
const storeList = document.getElementById('store-list');

function openStoreDetail(category, index) {
    if (window.setSelectedRestaurant) {
        window.setSelectedRestaurant(category, index);
    }

    window.location.href = `restaurant_detail.html?category=${encodeURIComponent(category)}&id=${index}`;
}

function renderStores(category) {
    if (!storeList) {
        return;
    }

    const stores = window.restaurantData?.[category] || [];

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
        });
    });
}

if (document.getElementById('homepage-map')) {
    loadGoogleMaps();
}



// 히어로에 맛집 이미지 끌어오기
fetchNearbyRestaurantsWithPhotos(37.5563, 126.9236).then(restaurants => {
    const cards = document.querySelectorAll('.hero-card-img');
    restaurants.forEach((r, i) => {
        if (cards[i] && r.photoUrl) {
            cards[i].style.backgroundImage = `url('${r.photoUrl}')`;
        }
    });
});