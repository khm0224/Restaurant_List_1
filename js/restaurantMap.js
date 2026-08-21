// 카카오 지도를 초기화하고 춘천 행정동 경계와 식당 마커를 표시합니다.
(function () {
    // 지도 경계 데이터 파일과 필터에서 사용하는 공통 값입니다.
    const DISTRICT_URL = '../data/area/chuncheon-admin-dong.geojson';
    const CITY_URL = '../data/area/chuncheon-city-boundary.geojson';
    const ALL = '전체';
    const mapElement = document.getElementById('map-api');
    const loader = document.getElementById('map-loader');
    const status = document.getElementById('map-status');
    const controls = document.getElementById('map-controls');
    const locationButton = document.getElementById('map-current-location');
    const locationLabel = document.getElementById('map-location-label');

    // 지도 객체와 현재 화면에 표시된 경계·마커 상태를 저장합니다.
    let map;
    let districtGeoJson;
    let cityGeoJson;
    let boundaryLoaded = false;
    let boundaryOverlays = [];
    let outlineOverlays = [];
    let selectedDistricts = new Set([ALL]);
    let selectedCategory = ALL;
    let favoriteRestaurantKeys = null;
    let restaurantMarkers = [];
    let infoWindow;
    let infoId = 0;
    let currentLocationMarker;
    let centeredOnLocation = false;
    let contextPointer;

    // 모든 식당 위치에 사용하는 포크·나이프 모양의 SVG 핀입니다.
    const MARKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="48" viewBox="0 0 44 48">
        <path fill="#16845b" stroke="#fff" stroke-width="2" d="M22 1C10.4 1 2 9.7 2 20.4C2 34 22 47 22 47S42 34 42 20.4C42 9.7 33.6 1 22 1Z"/>
        <circle cx="22" cy="20" r="14" fill="#fff"/><g fill="none" stroke="#16845b" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4">
        <path d="M15 11v8M12 11v5c0 2 1.3 3 3 3s3-1 3-3v-5M15 19v10"/><path d="M25 11v18M25 11c4 1.5 5 6.5 0 10"/></g></svg>`;

    // 지도 로딩 중 오류가 발생하면 로딩 화면에 안내 문구를 표시합니다.
    const fail = message => {
        status.textContent = message;
        status.classList.add('is-error');
    };
    // GeoJSON의 [경도, 위도] 좌표를 카카오 지도의 위·경도 객체로 변환합니다.
    const latLng = coordinate => new kakao.maps.LatLng(coordinate[1], coordinate[0]);

    // Polygon과 MultiPolygon을 동일한 반복 구조로 처리합니다.
    const polygonsOf = geometry => geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

    // 지도에 남아 있는 경계선 또는 도형을 모두 제거합니다.
    const clearOverlays = overlays => {
        overlays.forEach(overlay => overlay.setMap(null));
        overlays.length = 0;
    };
    // GeoJSON의 중첩 깊이와 관계없이 모든 실제 좌표를 순회합니다.
    function forEachCoordinate(coordinates, callback) {
        if (typeof coordinates?.[0] === 'number' && typeof coordinates?.[1] === 'number') {
            callback(coordinates);
            return;
        }
        coordinates?.forEach(item => forEachCoordinate(item, callback));
    }
    // 주어진 도형의 모든 좌표를 지도 표시 범위에 포함합니다.
    const addToBounds = (bounds, geometry) =>
        forEachCoordinate(geometry.coordinates, coordinate => bounds.extend(latLng(coordinate)));
    // 식당이 현재 선택한 행정동과 음식 카테고리에 해당하는지 검사합니다.
    const getRestaurantKey = restaurant => `${restaurant.district}|${restaurant.name}`;
    const matchesFilter = restaurant =>
        (selectedDistricts.has(ALL) || selectedDistricts.has(restaurant.district)) &&
        (selectedCategory === ALL || restaurant.category === selectedCategory) &&
        (favoriteRestaurantKeys === null || favoriteRestaurantKeys.has(getRestaurantKey(restaurant)));

    // SVG 문자열을 카카오 지도 MarkerImage 객체로 변환합니다.
    // 출발지·도착지 핀도 이 함수를 공유합니다.
    function createMarkerImage(svg) {
        return new kakao.maps.MarkerImage(
            `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
            new kakao.maps.Size(44, 48),
            { offset: new kakao.maps.Point(22, 47) }
        );
    }

    // 전체 선택 시 춘천시 외곽선을, 동 선택 시 행정동 영역을 그립니다.
    function drawBoundaries() {
        clearOverlays(boundaryOverlays);
        const showAll = selectedDistricts.has(ALL);
        const features = showAll ? cityGeoJson.features : districtGeoJson.features;
        features.forEach(feature => {
            const selected = showAll || selectedDistricts.has(feature.properties?.ADM_NM);
            // 시 외곽선 파일은 MultiLineString이므로 Polyline으로 표시합니다.
            if (feature.geometry.type === 'MultiLineString') {
                feature.geometry.coordinates.forEach(line => {
                    boundaryOverlays.push(new kakao.maps.Polyline({
                        map,
                        path: line.map(latLng),
                        strokeWeight: 4,
                        strokeColor: '#ba0707',
                        strokeOpacity: 1
                    }));
                });
                return;
            }
            // 행정동 파일은 MultiPolygon이므로 면 도형으로 표시합니다.
            polygonsOf(feature.geometry).forEach(polygon => {
                boundaryOverlays.push(new kakao.maps.Polygon({
                    map,
                    path: polygon.map(ring => ring.map(latLng)),
                    strokeWeight: showAll ? 4 : (selected ? 0 : 1),
                    strokeColor: showAll ? '#ba0707' : '#64748b',
                    strokeOpacity: showAll ? 1 : 0.35,
                    fillColor: '#fff',
                    fillOpacity: selected ? 0.28 : 0.02
                }));
            });
        });
    }

    // 여러 동을 선택했을 때 서로 맞닿은 내부 선은 제외하고 바깥 윤곽만 그립니다.
    function drawSelectedOutline() {
        clearOverlays(outlineOverlays);
        if (selectedDistricts.has(ALL)) return;
        const edges = new Map();
        const addEdges = ring => {
            for (let i = 0; i < ring.length - 1; i += 1) {
                const [start, end] = [ring[i], ring[i + 1]];
                const keys = [`${start[0]},${start[1]}`, `${end[0]},${end[1]}`];
                const key = keys[0] < keys[1] ? keys.join('|') : keys.reverse().join('|');
                const edge = edges.get(key);
                if (edge) edge.count += 1;
                else edges.set(key, { count: 1, coordinates: [start, end] });
            }
        };
        districtGeoJson.features.filter(feature => selectedDistricts.has(feature.properties.ADM_NM))
            .forEach(feature => polygonsOf(feature.geometry).forEach(polygon => polygon.forEach(addEdges)));
        Array.from(edges.values()).filter(edge => edge.count === 1).forEach(edge => {
            outlineOverlays.push(new kakao.maps.Polyline({
                map, path: edge.coordinates.map(latLng), strokeWeight: 4,
                strokeColor: '#ba0707', strokeOpacity: 1
            }));
        });
    }

    // 현재 지역·카테고리 필터에 맞는 식당 핀만 지도에 남깁니다.
    function updateMarkerVisibility() {
        infoWindow?.close();
        restaurantMarkers.forEach(({ restaurants, marker }) =>
            marker.setMap(restaurants.some(matchesFilter) ? map : null));
    }

    // 선택된 행정동을 강조하고 필요하면 해당 구역 전체가 보이도록 지도를 이동합니다.
    function highlightDistricts(names, moveMap = true) {
        selectedDistricts = new Set(names.length ? names : [ALL]);
        updateMarkerVisibility();
        if (!map || !boundaryLoaded) return;
        drawBoundaries();
        drawSelectedOutline();
        if (!moveMap) return;
        const bounds = new kakao.maps.LatLngBounds();
        const source = selectedDistricts.has(ALL) ? cityGeoJson : districtGeoJson;
        source.features.forEach(feature => {
            if (selectedDistricts.has(ALL) || selectedDistricts.has(feature.properties.ADM_NM)) addToBounds(bounds, feature.geometry);
        });
        map.setBounds(bounds, 48, 48, 48, 48);
    }

    // 춘천시 및 행정동 GeoJSON 파일을 병렬로 불러옵니다.
    async function loadBoundaries() {
        const responses = await Promise.all([fetch(DISTRICT_URL), fetch(CITY_URL)]);
        if (responses.some(response => !response.ok)) throw new Error('춘천시 경계 파일을 불러오지 못했습니다.');
        [districtGeoJson, cityGeoJson] = await Promise.all(responses.map(response => response.json()));
        boundaryLoaded = true;
        highlightDistricts(Array.from(selectedDistricts));
    }

    // 식당 데이터가 정보창 HTML로 삽입될 때 태그로 해석되지 않도록 처리합니다.
    const escapeHtml = (value = '') => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

    // 하나의 좌표에 있는 식당 정보를 열고, 여러 곳이면 이전·다음 탐색을 제공합니다.
    function openRestaurantGroup(marker, restaurants) {
        const visible = restaurants.filter(matchesFilter);
        if (!visible.length) return;
        let index = 0;
        const render = () => {
            const restaurant = visible[index];
            const renderId = `restaurant-info-${++infoId}`;
            const multiple = visible.length > 1;
            infoWindow.setContent(`<div class="restaurant-map-info-shell${multiple ? '' : ' is-single'}" data-restaurant-info-id="${renderId}">
                ${multiple ? '<button class="restaurant-map-info-nav is-prev" type="button" aria-label="이전 음식점">‹</button>' : ''}
                <div class="restaurant-map-info"><strong>${escapeHtml(restaurant.name)}</strong><p>${escapeHtml(restaurant.category)}</p>
                <p>${escapeHtml(restaurant.address)}</p><p>⭐ ${restaurant.rating} · 리뷰 ${restaurant.reviewCount}</p>
                ${multiple ? `<span class="restaurant-map-info-count">${index + 1} / ${visible.length}</span>` : ''}</div>
                ${multiple ? '<button class="restaurant-map-info-nav is-next" type="button" aria-label="다음 음식점">›</button>' : ''}</div>`);
            infoWindow.open(map, marker);
            setTimeout(() => {
                const element = document.querySelector(`[data-restaurant-info-id="${renderId}"]`);
                element?.querySelector('.is-prev')?.addEventListener('click', () => { index = (index - 1 + visible.length) % visible.length; render(); });
                element?.querySelector('.is-next')?.addEventListener('click', () => { index = (index + 1) % visible.length; render(); });
            });
        };
        render();
    }

    // 식당을 좌표별로 묶어 마커를 만들고 클릭 정보창 이벤트를 연결합니다.
    function createRestaurantMarkers(restaurants) {
        restaurantMarkers.forEach(({ marker }) => marker.setMap(null));
        restaurantMarkers = [];
        infoWindow?.close();
        infoWindow = new kakao.maps.InfoWindow({ removable: true });
        const groups = new Map();
        // 위·경도가 같은 식당은 핀 하나로 합칩니다.
        restaurants.forEach(restaurant => {
            const key = `${restaurant.latitude.toFixed(8)},${restaurant.longitude.toFixed(8)}`;
            const group = groups.get(key) || [];
            group.push(restaurant);
            groups.set(key, group);
        });
        groups.forEach(restaurantsAtPosition => {
            const restaurant = restaurantsAtPosition[0];
            const marker = new kakao.maps.Marker({
                map: restaurantsAtPosition.some(matchesFilter) ? map : null,
                position: new kakao.maps.LatLng(restaurant.latitude, restaurant.longitude),
                title: restaurantsAtPosition.map(item => item.name).join(', '),
                image: createMarkerImage(MARKER_SVG)
            });
            kakao.maps.event.addListener(marker, 'click', () => openRestaurantGroup(marker, restaurantsAtPosition));
            restaurantMarkers.push({ restaurants: restaurantsAtPosition, marker });
        });
    }

    // 카카오 지도 본체를 생성한 뒤 우클릭, 경계, 식당 핀 기능을 초기화합니다.
    async function initFoodMap() {
        map = new kakao.maps.Map(mapElement, { center: new kakao.maps.LatLng(37.8813, 127.7298), level: 7 });
        window.foodMap = map;
        document.dispatchEvent(new CustomEvent('restaurant-map:ready'));
        // 브라우저 우클릭 위치를 저장해 사용자 메뉴를 같은 화면 위치에 표시합니다.
        mapElement.addEventListener('contextmenu', event => {
            event.preventDefault();
            contextPointer = { clientX: event.clientX, clientY: event.clientY };
        }, true);
        // 카카오 지도의 우클릭 좌표를 길찾기 컨트롤러에 전달합니다.
        kakao.maps.event.addListener(map, 'rightclick', event => {
            document.dispatchEvent(new CustomEvent('restaurant-map:rightclick', { detail: {
                latitude: event.latLng.getLat(), longitude: event.latLng.getLng(),
                clientX: contextPointer?.clientX, clientY: contextPointer?.clientY
            }}));
        });
        try {
            if (!window.RestaurantService) throw new Error('식당 데이터 서비스를 불러오지 못했습니다.');
            await Promise.all([loadBoundaries(), window.RestaurantService.getRestaurants().then(createRestaurantMarkers)]);
            loader.hidden = true;
            controls.hidden = false;
        } catch (error) {
            fail(error.message);
        }
    }

    // JavaScript 키를 검사하고 카카오 지도 SDK를 동적으로 불러옵니다.
    function loadKakaoMaps() {
        const apiKey = window.KAKAO_JS_MAPS_API_KEY?.trim();
        if (!/^[0-9a-f]{32}$/i.test(apiKey || '')) {
            fail('유효한 Kakao Maps JavaScript 키가 없어 지도가 비활성화되었습니다.');
            return;
        }
        status.textContent = '카카오 지도를 불러오는 중입니다…';
        const start = () => kakao.maps.load(initFoodMap);
        if (window.kakao?.maps) return start();
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(apiKey)}&autoload=false`;
        script.async = true;
        script.onload = start;
        script.onerror = () => fail('Kakao Maps 스크립트를 불러오지 못했습니다.');
        document.head.appendChild(script);
    }

    // 카카오 지도는 level 값이 작을수록 확대되고 클수록 축소됩니다.
    document.getElementById('map-zoom-in')?.addEventListener('click', () => map?.setLevel(Math.max(1, map.getLevel() - 1), { animate: true }));
    document.getElementById('map-zoom-out')?.addEventListener('click', () => map?.setLevel(map.getLevel() + 1, { animate: true }));

    // 브라우저에서 받은 현재 위치를 지도 마커에 반영하고 최초 한 번 중심을 이동합니다.
    function updateCurrentLocation(position) {
        const positionLatLng = new kakao.maps.LatLng(position.latitude, position.longitude);
        if (currentLocationMarker) {
            currentLocationMarker.setPosition(positionLatLng);
            currentLocationMarker.setMap(map);
        } else {
            currentLocationMarker = new kakao.maps.CustomOverlay({ map, position: positionLatLng, zIndex: 10,
                content: '<span style="display:block;width:18px;height:18px;border:4px solid #fff;border-radius:50%;background:#2563eb;box-shadow:0 1px 4px #555"></span>' });
        }
        if (!centeredOnLocation) {
            map.panTo(positionLatLng);
            map.setLevel(Math.min(map.getLevel(), 3));
            centeredOnLocation = true;
        }
    }

    // 실시간 위치 추적을 중단하고 버튼 UI를 초기 상태로 되돌립니다.
    function stopLocation() {
        window.GeolocationService?.stopWatching();
        locationButton?.classList.remove('is-tracking');
        locationButton?.setAttribute('aria-pressed', 'false');
        locationLabel.textContent = '내 위치';
        centeredOnLocation = false;
    }

    // 내 위치 버튼을 누를 때 실시간 위치 추적을 시작하거나 중단합니다.
    locationButton?.addEventListener('click', () => {
        if (!map || !window.GeolocationService) return;
        if (window.GeolocationService.isWatching()) return stopLocation();
        locationButton.classList.add('is-tracking');
        locationButton.setAttribute('aria-pressed', 'true');
        locationLabel.textContent = '추적 중';
        centeredOnLocation = false;
        try {
            window.GeolocationService.startWatching(updateCurrentLocation, error => { stopLocation(); alert(error.message); });
        } catch (error) {
            stopLocation();
            alert(error.message);
        }
    });
    window.addEventListener('pagehide', () => window.GeolocationService?.stopWatching());

    // 다른 스크립트에서 지도 기능을 호출할 수 있도록 공개하는 인터페이스입니다.
    window.RestaurantMap = {
        load: loadKakaoMaps,
        highlightDistricts,
        selectCategory(category) { selectedCategory = category; updateMarkerVisibility(); },
        selectFavorites(keys) {
            favoriteRestaurantKeys = keys === null ? null : new Set(keys);
            updateMarkerVisibility();
        },
        setRestaurants: createRestaurantMarkers,
        resize() { map?.relayout(); },
        getMap: () => map,
        createMarkerImage
    };
})();
