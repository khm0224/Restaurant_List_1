// 음식점 탐색 페이지의 Google 지도와 춘천 행정동 경계를 관리합니다.
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

    function showMapError(message) {
        mapStatus.textContent = message;
        mapStatus.classList.add('is-error');
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

    function escapeHtml(value = '') {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

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
                title: restaurant.name
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

    async function loadRestaurantMarkers() {
        if (!window.RestaurantService) {
            throw new Error('식당 데이터 서비스를 불러오지 못했습니다.');
        }

        const restaurants = await window.RestaurantService.getRestaurants();
        createRestaurantMarkers(restaurants);
    }

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
