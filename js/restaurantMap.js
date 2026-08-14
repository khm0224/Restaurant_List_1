// 핵심 역할: Google Maps를 로드하고, 춘천 행정동 경계/식당 마커를 지도 위에 표시
// 목적: 지도 페이지에서 동네 구역 강조, 식당 위치 마커 클릭, 정보창 표시 기능 제공
// 구성: 경계 GeoJSON 로딩 + Google Maps 초기화 + 식당 마커 생성 + 마커 클릭 이벤트

(function () {
    const CHUNCHEON_BOUNDARY_URL = '../data/area/chuncheon-admin-dong.geojson';
    const CHUNCHEON_CITY_BOUNDARY_URL = '../data/area/chuncheon-city-boundary.geojson';
    const mapLoader = document.getElementById('map-loader');
    const mapStatus = document.getElementById('map-status');

    let map = null;
    let cityBoundaryLayer = null;
    let boundaryLoaded = false;
    let selectedDistrict = '전체';
    let restaurantMarkers = [];
    let restaurantInfoWindow = null;

    const RESTAURANT_MARKER_SVG = `
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="48" viewBox="0 0 44 48">
            <path fill="#16845b" stroke="#ffffff" stroke-width="2"
                d="M22 1C10.4 1 2 9.7 2 20.4C2 34 22 47 22 47S42 34 42 20.4C42 9.7 33.6 1 22 1Z"/>
            <circle cx="22" cy="20" r="14" fill="#ffffff"/>
            <g fill="none" stroke="#16845b" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4">
                <path d="M15 11v8M12 11v5c0 2 1.3 3 3 3s3-1 3-3v-5M15 19v10"/>
                <path d="M25 11v18M25 11c4 1.5 5 6.5 0 10"/>
            </g>
        </svg>
    `;

    // 지도 로딩 실패 시 사용자에게 상태 메시지를 보여줍니다.
    function showMapError(message) {
        mapStatus.textContent = message;
        mapStatus.classList.add('is-error');
    }

    // 선택된 동네를 강조하는 경계 스타일을 계산합니다.
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

    // 동네를 선택하면 해당 구역을 하이라이트하고 지도를 해당 위치에 맞춥니다.
    function highlightDistrict(districtName, moveMap = true) {
        selectedDistrict = districtName;

        if (!map || !boundaryLoaded) {
            return;
        }

        map.data.setStyle(getDistrictStyle);
        cityBoundaryLayer?.setMap(districtName === '전체' ? map : null);

        let selectedFeature = null;
        const allDistrictBounds = new google.maps.LatLngBounds();

        map.data.forEach(feature => {
            if (districtName === '전체') {
                feature.getGeometry().forEachLatLng(latLng => allDistrictBounds.extend(latLng));
            } else if (feature.getProperty('ADM_NM') === districtName) {
                selectedFeature = feature;
            }
        });

        if (!moveMap) {
            return;
        }

        if (districtName === '전체' && !allDistrictBounds.isEmpty()) {
            map.fitBounds(allDistrictBounds, 48);
        } else if (selectedFeature) {
            map.fitBounds(getFeatureBounds(selectedFeature), 24);
        }
    }

    // 춘천 시/행정동 경계 GeoJSON 파일을 불러와 지도에 적용합니다.
    async function loadChuncheonBoundaries() {
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

        cityBoundaryLayer = new google.maps.Data();
        cityBoundaryLayer.addGeoJson(cityGeoJson);
        cityBoundaryLayer.setStyle({
            clickable: false,
            strokeColor: '#ba0707',
            strokeOpacity: 1,
            strokeWeight: 4,
            zIndex: 2
        });

        boundaryLoaded = true;
        highlightDistrict(selectedDistrict);
    }

    // 인포윈도우에 넣는 문자열을 안전하게 escape 처리합니다.
    function escapeHtml(value = '') {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // 식당 배열을 기반으로 지도 마커를 생성하고 클릭 이벤트를 연결합니다.
    function createRestaurantMarkers(restaurants) {
        restaurantMarkers.forEach(({ marker }) => marker.setMap(null));
        restaurantMarkers = [];
        restaurantInfoWindow?.close();
        restaurantInfoWindow = new google.maps.InfoWindow();

        restaurants.forEach(restaurant => {
            const marker = new google.maps.Marker({
                map,
                position: {
                    lat: restaurant.latitude,
                    lng: restaurant.longitude
                },
                title: restaurant.name,
                icon: {
                    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(RESTAURANT_MARKER_SVG)}`,
                    scaledSize: new google.maps.Size(44, 48),
                    anchor: new google.maps.Point(22, 47)
                }
            });

            marker.addListener('click', () => {
                restaurantInfoWindow.setContent(`
                    <div class="restaurant-map-info">
                        <strong>${escapeHtml(restaurant.name)}</strong>
                        <p>${escapeHtml(restaurant.category)}</p>
                        <p>${escapeHtml(restaurant.address)}</p>
                        <p>⭐ ${restaurant.rating} · 리뷰 ${restaurant.reviewCount}</p>
                    </div>
                `);
                restaurantInfoWindow.open({ map, anchor: marker });
            });

            restaurantMarkers.push({ restaurant, marker });
        });
    }

    // RestaurantService에서 식당 좌표 데이터를 받아 지도 마커로 표시합니다.
    async function loadRestaurantMarkers() {
        if (!window.RestaurantService) {
            throw new Error('식당 데이터 서비스를 불러오지 못했습니다.');
        }

        const restaurants = await window.RestaurantService.getRestaurants();
        createRestaurantMarkers(restaurants);
    }

    // Google Maps를 초기화하고 경계/마커를 함께 불러옵니다.
    async function initFoodMap() {
        const chuncheon = { lat: 37.8813, lng: 127.7298 };

        map = new google.maps.Map(document.getElementById('map-api'), {
            center: chuncheon,
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            styles: [
                {
                    featureType: 'poi.business',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        // 기존 코드와 다른 페이지에서 지도를 참조할 수 있도록 유지합니다.
        window.foodMap = map;

        try {
            await Promise.all([
                loadChuncheonBoundaries(),
                loadRestaurantMarkers()
            ]);
            mapLoader.hidden = true;
        } catch (error) {
            showMapError(error.message);
        }
    }

    // API 키가 있으면 Google Maps 스크립트를 동적으로 불러옵니다.
    function loadGoogleMaps() {
        const apiKey = window.GOOGLE_MAPS_API_KEY?.trim();
        const hasValidApiKeyFormat = /^AIza[0-9A-Za-z_-]{30,}$/.test(apiKey || '');

        if (!hasValidApiKeyFormat) {
            showMapError('유효한 Google Maps API 키가 없어 지도가 비활성화되었습니다.');
            return;
        }

        mapStatus.textContent = '지도를 불러오는 중입니다…';
        window.initFoodMap = initFoodMap;
        window.gm_authFailure = () => {
            showMapError('인증에 실패했습니다. API 키와 HTTP 리퍼러 제한을 확인하세요.');
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=initFoodMap&v=weekly&language=ko&region=KR`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
            showMapError('Google Maps 스크립트를 불러오지 못했습니다.');
        };
        document.head.appendChild(script);
    }

    // 지도 레이아웃이 바뀌면 다시 그려서 깨짐을 방지합니다.
    function resize() {
        if (map && window.google?.maps) {
            google.maps.event.trigger(map, 'resize');
        }
    }

    window.RestaurantMap = {
        load: loadGoogleMaps,
        highlightDistrict,
        setRestaurants: createRestaurantMarkers,
        resize,
        getMap: () => map
    };
})();
