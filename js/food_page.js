const categoryButtons = document.querySelectorAll('.category-btn');
const categoryScroll = document.getElementById('category-scroll');
const functionScrollPrev = document.getElementById('function-scroll-prev');
const functionScrollNext = document.getElementById('function-scroll-next');
const storeList = document.getElementById('store-list');
const sidebarCategorySelect = document.getElementById('sidebar-category-select');
const content = document.getElementById('content');
const sidebarToggle = document.getElementById('sidebar-toggle');
const mapLoader = document.getElementById('map-loader');
const mapStatus = document.getElementById('map-status');
const CHUNCHEON_BOUNDARY_URL = '../data/area/chuncheon-admin-dong.geojson';
const CHUNCHEON_CITY_BOUNDARY_URL = '../data/area/chuncheon-city-boundary.geojson';
let selectedDistrict = document.querySelector('.category-btn.active')?.dataset.category || '소양동';

// 선택한 식당 정보를 저장하고 상세 페이지로 이동합니다.
function openStoreDetail(category, index) {
    if (window.setSelectedRestaurant) {
        window.setSelectedRestaurant(selectedDistrict, category, index);
    }

    window.location.href = `restaurant_detail.html?district=${encodeURIComponent(selectedDistrict)}&category=${encodeURIComponent(category)}&id=${index}`;
}

// 현재 카테고리의 식당 목록과 클릭 이벤트를 화면에 만듭니다.
function renderSelectedStores(selectedCategory = sidebarCategorySelect.value) {

    const stores = (window.restaurantData?.[selectedCategory] || []).map((store, index) => ({
        ...store,
        category: selectedCategory,
        index
    }));

    if (stores.length === 0) {
        storeList.innerHTML = '<p class="empty-store-list">선택된 카테고리에 식당이 없습니다.</p>';
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
        selectedDistrict = button.dataset.category;

        categoryButtons.forEach(btn => {
            const isActive = btn === button;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });

        highlightDistrict(selectedDistrict);
        renderSelectedStores(sidebarCategorySelect.value);
    });
});

function updateFunctionScrollButtons() {
    const maxScrollLeft = categoryScroll.scrollWidth - categoryScroll.clientWidth;
    functionScrollPrev.disabled = categoryScroll.scrollLeft <= 0;
    functionScrollNext.disabled = categoryScroll.scrollLeft >= maxScrollLeft - 1;
}

function scrollFunctionBar(direction) {
    categoryScroll.scrollBy({
        left: direction * Math.max(240, categoryScroll.clientWidth * 0.7)
    });
    updateFunctionScrollButtons();
}

functionScrollPrev.addEventListener('click', () => scrollFunctionBar(-1));
functionScrollNext.addEventListener('click', () => scrollFunctionBar(1));
categoryScroll.addEventListener('scroll', updateFunctionScrollButtons);
window.addEventListener('resize', updateFunctionScrollButtons);
updateFunctionScrollButtons();

sidebarCategorySelect.addEventListener('change', () => {
    const selectedCategory = sidebarCategorySelect.value;
    renderSelectedStores(selectedCategory);
});

// 첫 화면에는 기본 카테고리인 한식을 표시합니다.
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

// API 키를 확인한 뒤 Google 지도 스크립트를 불러옵니다.
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

function getDistrictStyle(feature) {
    const isSelected = feature.getProperty('ADM_NM') === selectedDistrict;

    return {
        clickable: false,
        visible: selectedDistrict !== '전체',
        fillColor: isSelected ? 'rgb(255, 255, 255)' : '#ffffff',
        fillOpacity: isSelected ? 0.28 : 0.02,
        strokeColor: isSelected ? '#ba0707' : '#64748b',
        strokeOpacity: isSelected ? 1 : 0.35,
        strokeWeight: isSelected ? 4 : 1,
        zIndex: isSelected ? 2 : 1
    };
}

function getFeatureBounds(feature) {
    const bounds = new google.maps.LatLngBounds();
    feature.getGeometry().forEachLatLng(latLng => bounds.extend(latLng));
    return bounds;
}

function highlightDistrict(districtName, moveMap = true) {
    const map = window.foodMap;
    if (!map || !window.chuncheonBoundaryLoaded) {
        return;
    }

    selectedDistrict = districtName;
    map.data.setStyle(getDistrictStyle);
    window.chuncheonCityBoundaryLayer?.setMap(districtName === '전체' ? map : null);

    let selectedFeature = null;
    const allDistrictBounds = new google.maps.LatLngBounds();
    map.data.forEach(feature => {
        if (districtName === '전체') {
            feature.getGeometry().forEachLatLng(latLng => allDistrictBounds.extend(latLng));
        } else if (feature.getProperty('ADM_NM') === districtName) {
            selectedFeature = feature;
        }
    });

    if (moveMap) {
        if (districtName === '전체' && !allDistrictBounds.isEmpty()) {
            map.fitBounds(allDistrictBounds, 48);
        } else if (selectedFeature) {
            map.fitBounds(getFeatureBounds(selectedFeature), 48);
        }
    }
}

async function loadChuncheonBoundaries(map) {
    const [districtResponse, cityResponse] = await Promise.all([
        fetch(CHUNCHEON_BOUNDARY_URL),
        fetch(CHUNCHEON_CITY_BOUNDARY_URL)
    ]);
    if (!districtResponse.ok || !cityResponse.ok) {
        throw new Error('춘천시 경계 파일을 불러오지 못했습니다.');
    }

    const [districtGeoJson, cityGeoJson] = await Promise.all([
        districtResponse.json(),
        cityResponse.json()
    ]);
    map.data.addGeoJson(districtGeoJson);

    const cityBoundaryLayer = new google.maps.Data();
    cityBoundaryLayer.addGeoJson(cityGeoJson);
    cityBoundaryLayer.setStyle({
        clickable: false,
        strokeColor: '#ba0707',
        strokeOpacity: 1,
        strokeWeight: 4,
        zIndex: 2
    });
    window.chuncheonCityBoundaryLayer = cityBoundaryLayer;

    window.chuncheonBoundaryLoaded = true;
    highlightDistrict(selectedDistrict);
}

// 지도 로드가 완료되면 춘천 행정동 경계를 표시합니다.
async function initFoodMap() {
    const chuncheon = { lat: 37.8813, lng: 127.7298 };
    const map = new google.maps.Map(document.getElementById('map-api'), {
        center: chuncheon,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        //============== 기본 음식점 마커 표시 비활성화 코드 ==========//
        styles: [
            {
                featureType: 'poi.business',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });
    
    window.foodMap = map;

    try {
        await loadChuncheonBoundaries(map);
        mapLoader.hidden = true;
    } catch (error) {
        mapStatus.textContent = error.message;
        mapStatus.classList.add('is-error');
    }
}

loadGoogleMaps();
