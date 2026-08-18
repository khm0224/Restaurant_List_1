// 핵심 역할: Google Maps를 로드하고, 춘천 행정동 경계/식당 마커를 지도 위에 표시
// 목적: 지도 페이지에서 동네 구역 강조, 식당 위치 마커 클릭, 정보창 표시 기능 제공
// 구성: 경계 GeoJSON 로딩 + Google Maps 초기화 + 식당 마커 생성 + 마커 클릭 이벤트

(function () {
    const CHUNCHEON_BOUNDARY_URL = '../data/area/chuncheon-admin-dong.geojson';
    const CHUNCHEON_CITY_BOUNDARY_URL = '../data/area/chuncheon-city-boundary.geojson';
    const mapLoader = document.getElementById('map-loader');
    const mapStatus = document.getElementById('map-status');
    const mapControls = document.getElementById('map-controls');
    const zoomInButton = document.getElementById('map-zoom-in');
    const zoomOutButton = document.getElementById('map-zoom-out');
    const currentLocationButton = document.getElementById('map-current-location');
    const currentLocationLabel = document.getElementById('map-location-label');

    let map = null;
    let cityBoundaryLayer = null;
    let selectedOutlineLayer = null;
    let districtBoundaryGeoJson = null;
    let boundaryLoaded = false;
    const ALL_DISTRICTS = '전체';
    let selectedDistricts = new Set([ALL_DISTRICTS]);
    let selectedCategory = '전체';
    let restaurantMarkers = [];
    let restaurantInfoWindow = null;
    let infoWindowRenderId = 0;
    let currentLocationMarker = null;
    let hasCenteredOnCurrentLocation = false;

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
        const isSelected = selectedDistricts.has(feature.getProperty('ADM_NM'));

        return {
            clickable: false,
            visible: !selectedDistricts.has(ALL_DISTRICTS),
            fillColor: isSelected ? 'rgb(255, 255, 255)' : '#ffffff',
            fillOpacity: isSelected ? 0.28 : 0.02,
            strokeColor: '#64748b',
            strokeOpacity: isSelected ? 0 : 0.35,
            strokeWeight: isSelected ? 0 : 1,
            zIndex: isSelected ? 2 : 1
        };
    }

    // 선택한 행정동끼리 맞닿은 선은 제거하고 합쳐진 영역의 바깥 윤곽선만 만듭니다.
    function updateSelectedOutline() {
        if (!selectedOutlineLayer || !districtBoundaryGeoJson) {
            return;
        }

        selectedOutlineLayer.forEach(feature => selectedOutlineLayer.remove(feature));

        if (selectedDistricts.has(ALL_DISTRICTS)) {
            return;
        }

        const edges = new Map();
        const addRingEdges = ring => {
            for (let index = 0; index < ring.length - 1; index += 1) {
                const start = ring[index];
                const end = ring[index + 1];
                const startKey = `${start[0]},${start[1]}`;
                const endKey = `${end[0]},${end[1]}`;
                const key = startKey < endKey ? `${startKey}|${endKey}` : `${endKey}|${startKey}`;
                const edge = edges.get(key);

                if (edge) {
                    edge.count += 1;
                } else {
                    edges.set(key, { count: 1, coordinates: [start, end] });
                }
            }
        };

        districtBoundaryGeoJson.features
            .filter(feature => selectedDistricts.has(feature.properties.ADM_NM))
            .forEach(feature => {
                const polygons = feature.geometry.type === 'Polygon'
                    ? [feature.geometry.coordinates]
                    : feature.geometry.coordinates;

                polygons.forEach(polygon => polygon.forEach(addRingEdges));
            });

        const exteriorEdges = Array.from(edges.values())
            .filter(edge => edge.count === 1)
            .map(edge => edge.coordinates);

        if (exteriorEdges.length) {
            selectedOutlineLayer.addGeoJson({
                type: 'Feature',
                properties: {},
                geometry: { type: 'MultiLineString', coordinates: exteriorEdges }
            });
        }
    }

    function getFeatureBounds(feature) {
        const bounds = new google.maps.LatLngBounds();
        feature.getGeometry().forEachLatLng(latLng => bounds.extend(latLng));
        return bounds;
    }

    function updateMarkerVisibility() {
        restaurantInfoWindow?.close();

        restaurantMarkers.forEach(({ restaurants, marker }) => {
            const shouldShow = restaurants.some(matchesCurrentFilter);
            marker.setMap(shouldShow ? map : null);
        });
    }

    function selectCategory(categoryName) {
        selectedCategory = categoryName;
        updateMarkerVisibility();
    }

    // 동네를 선택하면 해당 구역을 하이라이트하고 지도를 해당 위치에 맞춥니다.
    function highlightDistricts(districtNames, moveMap = true) {
        selectedDistricts = new Set(districtNames.length ? districtNames : [ALL_DISTRICTS]);
        updateMarkerVisibility();

        if (!map || !boundaryLoaded) {
            return;
        }

        map.data.setStyle(getDistrictStyle);
        cityBoundaryLayer?.setMap(selectedDistricts.has(ALL_DISTRICTS) ? map : null);
        updateSelectedOutline();

        const selectedBounds = new google.maps.LatLngBounds();

        map.data.forEach(feature => {
            if (selectedDistricts.has(ALL_DISTRICTS)) {
                feature.getGeometry().forEachLatLng(latLng => selectedBounds.extend(latLng));
            } else if (selectedDistricts.has(feature.getProperty('ADM_NM'))) {
                feature.getGeometry().forEachLatLng(latLng => selectedBounds.extend(latLng));
            }
        });

        if (!moveMap) {
            return;
        }

        if (!selectedBounds.isEmpty()) {
            map.fitBounds(selectedBounds, selectedDistricts.has(ALL_DISTRICTS) ? 48 : 24);
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

        districtBoundaryGeoJson = districtGeoJson;
        map.data.addGeoJson(districtGeoJson);

        selectedOutlineLayer = new google.maps.Data({ map });
        selectedOutlineLayer.setStyle({
            clickable: false,
            strokeColor: '#ba0707',
            strokeOpacity: 1,
            strokeWeight: 4,
            zIndex: 3
        });

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
        highlightDistricts(Array.from(selectedDistricts));
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

    function matchesCurrentFilter(restaurant) {
        const matchesDistrict = selectedDistricts.has(ALL_DISTRICTS) || selectedDistricts.has(restaurant.district);
        const matchesCategory = selectedCategory === '전체' || restaurant.category === selectedCategory;
        return matchesDistrict && matchesCategory;
    }

    function openRestaurantGroup(marker, groupedRestaurants) {
        const visibleRestaurants = groupedRestaurants.filter(matchesCurrentFilter);
        if (!visibleRestaurants.length) {
            return;
        }

        let currentIndex = 0;

        const render = () => {
            const restaurant = visibleRestaurants[currentIndex];
            const renderId = `restaurant-info-${++infoWindowRenderId}`;
            const hasMultipleRestaurants = visibleRestaurants.length > 1;

            restaurantInfoWindow.setContent(`
                <div class="restaurant-map-info-shell${hasMultipleRestaurants ? '' : ' is-single'}" data-restaurant-info-id="${renderId}">
                    ${hasMultipleRestaurants ? `
                        <button class="restaurant-map-info-nav is-prev" type="button" aria-label="이전 음식점">‹</button>
                    ` : ''}
                    <div class="restaurant-map-info">
                        <strong>${escapeHtml(restaurant.name)}</strong>
                        <p>${escapeHtml(restaurant.category)}</p>
                        <p>${escapeHtml(restaurant.address)}</p>
                        <p>⭐ ${restaurant.rating} · 리뷰 ${restaurant.reviewCount}</p>
                        ${hasMultipleRestaurants ? `
                            <span class="restaurant-map-info-count">${currentIndex + 1} / ${visibleRestaurants.length}</span>
                        ` : ''}
                    </div>
                    ${hasMultipleRestaurants ? `
                        <button class="restaurant-map-info-nav is-next" type="button" aria-label="다음 음식점">›</button>
                    ` : ''}
                </div>
            `);
            restaurantInfoWindow.open({ map, anchor: marker });

            google.maps.event.addListenerOnce(restaurantInfoWindow, 'domready', () => {
                const container = document.querySelector(`[data-restaurant-info-id="${renderId}"]`);
                if (!container) {
                    return;
                }

                container.querySelector('.is-prev')?.addEventListener('click', () => {
                    currentIndex = (currentIndex - 1 + visibleRestaurants.length) % visibleRestaurants.length;
                    render();
                });

                container.querySelector('.is-next')?.addEventListener('click', () => {
                    currentIndex = (currentIndex + 1) % visibleRestaurants.length;
                    render();
                });
            });
        };

        render();
    }

    // 식당 배열을 기반으로 지도 마커를 생성하고 클릭 이벤트를 연결합니다.
    function createRestaurantMarkers(restaurants) {
        restaurantMarkers.forEach(({ marker }) => marker.setMap(null));
        restaurantMarkers = [];
        restaurantInfoWindow?.close();
        restaurantInfoWindow = new google.maps.InfoWindow();

        const restaurantGroups = new Map();

        restaurants.forEach(restaurant => {
            const coordinateKey = `${restaurant.latitude.toFixed(8)},${restaurant.longitude.toFixed(8)}`;
            const group = restaurantGroups.get(coordinateKey) || [];
            group.push(restaurant);
            restaurantGroups.set(coordinateKey, group);
        });

        restaurantGroups.forEach(groupedRestaurants => {
            const representative = groupedRestaurants[0];
            const shouldShow = groupedRestaurants.some(matchesCurrentFilter);
            const marker = new google.maps.Marker({
                map: shouldShow ? map : null,
                position: {
                    lat: representative.latitude,
                    lng: representative.longitude
                },
                title: groupedRestaurants.map(restaurant => restaurant.name).join(', '),
                icon: {
                    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(RESTAURANT_MARKER_SVG)}`,
                    scaledSize: new google.maps.Size(44, 48),
                    anchor: new google.maps.Point(22, 47)
                }
            });

            marker.addListener('click', () => {
                openRestaurantGroup(marker, groupedRestaurants);
            });

            restaurantMarkers.push({ restaurants: groupedRestaurants, marker });
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
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            // 구글 제공하는 마커 끄는 코드 //
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
            mapControls.hidden = false;
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

    zoomInButton?.addEventListener('click', () => {
        if (map) {
            map.setZoom(map.getZoom() + 1);
        }
    });

    zoomOutButton?.addEventListener('click', () => {
        if (map) {
            map.setZoom(map.getZoom() - 1);
        }
    });

    function updateCurrentLocationMarker(position) {
        const location = { lat: position.latitude, lng: position.longitude };

        if (currentLocationMarker) {
            currentLocationMarker.setPosition(location);
            currentLocationMarker.setMap(map);
        } else {
            currentLocationMarker = new google.maps.Marker({
                map,
                position: location,
                title: '내 현재 위치',
                zIndex: 1000,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#2563eb',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeOpacity: 1,
                    strokeWeight: 4,
                    scale: 9
                }
            });
        }

        if (!hasCenteredOnCurrentLocation) {
            map.panTo(location);
            map.setZoom(Math.max(map.getZoom(), 16));
            hasCenteredOnCurrentLocation = true;
        }
    }

    function stopCurrentLocationTracking() {
        window.GeolocationService?.stopWatching();
        currentLocationButton?.classList.remove('is-tracking');
        currentLocationButton?.setAttribute('aria-pressed', 'false');
        currentLocationLabel.textContent = '내 위치';
        hasCenteredOnCurrentLocation = false;
    }

    currentLocationButton?.addEventListener('click', () => {
        if (!map || !window.GeolocationService) {
            return;
        }

        if (window.GeolocationService.isWatching()) {
            stopCurrentLocationTracking();
            return;
        }

        currentLocationButton.classList.add('is-tracking');
        currentLocationButton.setAttribute('aria-pressed', 'true');
        currentLocationLabel.textContent = '추적 중';
        hasCenteredOnCurrentLocation = false;

        try {
            window.GeolocationService.startWatching(
                updateCurrentLocationMarker,
                error => {
                    stopCurrentLocationTracking();
                    window.alert(error.message);
                }
            );
        } catch (error) {
            stopCurrentLocationTracking();
            window.alert(error.message);
        }
    });

    window.addEventListener('pagehide', () => {
        window.GeolocationService?.stopWatching();
    });

    window.RestaurantMap = {
        load: loadGoogleMaps,
        highlightDistricts,
        selectCategory,
        setRestaurants: createRestaurantMarkers,
        resize,
        getMap: () => map
    };
})();
