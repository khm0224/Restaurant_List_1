(function () {
    const CHUNCHEON_CENTER = { lat: 37.8813, lng: 127.7298 };
    const COORDINATE_CSV_URL = './전국_음식점_정보csv/filter_file_Gyo_dong_JS_geocoded.csv';

    let map = null;
    let restaurantMarkers = [];
    let coordinatePromise = null;
    let pendingRestaurants = [];
    let renderRequestId = 0;
    let currentLocationMarker = null;
    let currentLocationAccuracyCircle = null;
    let pendingCurrentLocation = null;
    let searchRadiusCircle = null;
    let pendingSearchRadiusKm = null;

    function normalizeName(name) {
        return String(name || '').replace(/\s+/g, '').toLowerCase();
    }

    function parseCsvLine(line) {
        const values = [];
        let value = '';
        let insideQuotes = false;

        for (let index = 0; index < line.length; index += 1) {
            const character = line[index];

            if (character === '"') {
                if (insideQuotes && line[index + 1] === '"') {
                    value += '"';
                    index += 1;
                } else {
                    insideQuotes = !insideQuotes;
                }
            } else if (character === ',' && !insideQuotes) {
                values.push(value.trim());
                value = '';
            } else {
                value += character;
            }
        }

        values.push(value.trim());
        return values;
    }

    async function loadCoordinateMap() {
        if (coordinatePromise) {
            return coordinatePromise;
        }

        coordinatePromise = fetch(COORDINATE_CSV_URL, { cache: 'no-store' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`음식점 좌표를 불러오지 못했습니다. (${response.status})`);
                }

                return response.text();
            })
            .then(csvText => {
                const lines = csvText
                    .replace(/^\uFEFF/, '')
                    .split(/\r?\n/)
                    .filter(line => line.trim() !== '');

                if (lines.length < 2) {
                    return new Map();
                }

                const headers = parseCsvLine(lines[0]);
                const nameIndex = headers.indexOf('사업장명');
                const latitudeIndex = headers.indexOf('위도');
                const longitudeIndex = headers.indexOf('경도');
                const statusIndex = headers.indexOf('지오코딩상태');
                const coordinates = new Map();

                lines.slice(1).forEach(line => {
                    const values = parseCsvLine(line);
                    const latitude = Number(values[latitudeIndex]);
                    const longitude = Number(values[longitudeIndex]);

                    if (
                        values[statusIndex] === '성공' &&
                        Number.isFinite(latitude) &&
                        Number.isFinite(longitude)
                    ) {
                        coordinates.set(normalizeName(values[nameIndex]), {
                            lat: latitude,
                            lng: longitude
                        });
                    }
                });

                return coordinates;
            })
            .catch(error => {
                coordinatePromise = null;
                console.error(error);
                return new Map();
            });

        return coordinatePromise;
    }

    function getRestaurantKey(restaurant) {
        return [restaurant.district, restaurant.category, restaurant.index].join('|');
    }

    function clearMarkers() {
        restaurantMarkers.forEach(({ marker }) => marker.setMap(null));
        restaurantMarkers = [];
    }

    function focusRestaurant(restaurantKey) {
        if (!map || !restaurantKey) {
            return;
        }

        const selected = restaurantMarkers.find(item => item.key === restaurantKey);
        if (!selected) {
            return;
        }

        map.panTo(selected.marker.getPosition());
        if (map.getZoom() < 16) {
            map.setZoom(16);
        }

        selected.marker.setAnimation(google.maps.Animation.BOUNCE);
        window.setTimeout(() => selected.marker.setAnimation(null), 700);
    }

    async function showRestaurants(restaurants = []) {
        pendingRestaurants = Array.isArray(restaurants) ? restaurants : [];
        const requestId = ++renderRequestId;

        if (!map || !window.google?.maps) {
            return;
        }

        const requestedRestaurants = [...pendingRestaurants];
        const coordinates = await loadCoordinateMap();

        if (requestId !== renderRequestId) {
            return;
        }

        clearMarkers();

        const bounds = new google.maps.LatLngBounds();

        requestedRestaurants.forEach((restaurant, index) => {
            const position = coordinates.get(normalizeName(restaurant.name));
            if (!position) {
                return;
            }

            const key = getRestaurantKey(restaurant);
            const marker = new google.maps.Marker({
                map,
                position,
                label: {
                    text: String(index + 1),
                    color: '#ffffff',
                    fontWeight: '700'
                },
                title: restaurant.name
            });

            marker.addListener('click', () => {
                window.dispatchEvent(new CustomEvent('homepage:restaurant-focus', {
                    detail: { key }
                }));
                focusRestaurant(key);
            });

            restaurantMarkers.push({ marker, key });
            bounds.extend(position);
        });

        if (pendingCurrentLocation) {
            bounds.extend({
                lat: pendingCurrentLocation.latitude,
                lng: pendingCurrentLocation.longitude
            });
        }

        if (searchRadiusCircle?.getBounds()) {
            const radiusBounds = searchRadiusCircle.getBounds();
            bounds.extend(radiusBounds.getNorthEast());
            bounds.extend(radiusBounds.getSouthWest());
        }

        if (restaurantMarkers.length === 0) {
            if (searchRadiusCircle?.getBounds()) {
                map.fitBounds(searchRadiusCircle.getBounds(), 32);
                return;
            }

            map.setCenter(pendingCurrentLocation
                ? { lat: pendingCurrentLocation.latitude, lng: pendingCurrentLocation.longitude }
                : CHUNCHEON_CENTER);
            map.setZoom(pendingCurrentLocation ? 16 : 13);
            return;
        }

        if (restaurantMarkers.length === 1 && !pendingCurrentLocation) {
            map.setCenter(restaurantMarkers[0].marker.getPosition());
            map.setZoom(16);
            return;
        }

        map.fitBounds(bounds, 64);
        google.maps.event.addListenerOnce(map, 'idle', () => {
            if (map.getZoom() > 16) {
                map.setZoom(16);
            }
        });
    }

    function initHomepageMap() {
        const mapElement = document.getElementById('homepage-map');
        if (!mapElement || typeof google === 'undefined' || !google.maps) {
            return;
        }

        map = new google.maps.Map(mapElement, {
            center: CHUNCHEON_CENTER,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
                {
                    featureType: 'poi.business',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        if (pendingCurrentLocation) {
            showCurrentLocation(pendingCurrentLocation);
        }

        if (pendingCurrentLocation && pendingSearchRadiusKm) {
            showSearchRadius(pendingCurrentLocation, pendingSearchRadiusKm);
        }

        showRestaurants(pendingRestaurants);
    }

    function showCurrentLocation(position) {
        pendingCurrentLocation = position;

        if (!map || !Number.isFinite(position?.latitude) || !Number.isFinite(position?.longitude)) {
            return;
        }

        const location = { lat: position.latitude, lng: position.longitude };

        if (currentLocationMarker) {
            currentLocationMarker.setPosition(location);
            currentLocationMarker.setMap(map);
        } else {
            currentLocationMarker = new google.maps.Marker({
                map,
                position: location,
                title: '내 현재 위치',
                zIndex: 2000,
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

        if (Number.isFinite(position.accuracy) && position.accuracy > 0) {
            if (currentLocationAccuracyCircle) {
                currentLocationAccuracyCircle.setCenter(location);
                currentLocationAccuracyCircle.setRadius(position.accuracy);
                currentLocationAccuracyCircle.setMap(map);
            } else {
                currentLocationAccuracyCircle = new google.maps.Circle({
                    map,
                    center: location,
                    radius: position.accuracy,
                    clickable: false,
                    fillColor: '#2563eb',
                    fillOpacity: 0.12,
                    strokeColor: '#2563eb',
                    strokeOpacity: 0.35,
                    strokeWeight: 1,
                    zIndex: 10
                });
            }
        }
    }

    function hideCurrentLocation() {
        pendingCurrentLocation = null;
        pendingSearchRadiusKm = null;
        currentLocationMarker?.setMap(null);
        currentLocationAccuracyCircle?.setMap(null);
        searchRadiusCircle?.setMap(null);
    }

    function showSearchRadius(position, radiusKm) {
        pendingSearchRadiusKm = radiusKm;

        if (
            !map ||
            !Number.isFinite(position?.latitude) ||
            !Number.isFinite(position?.longitude) ||
            !Number.isFinite(radiusKm) ||
            radiusKm <= 0
        ) {
            return;
        }

        const center = { lat: position.latitude, lng: position.longitude };
        const radiusMeters = radiusKm * 1000;

        if (searchRadiusCircle) {
            searchRadiusCircle.setCenter(center);
            searchRadiusCircle.setRadius(radiusMeters);
            searchRadiusCircle.setMap(map);
        } else {
            searchRadiusCircle = new google.maps.Circle({
                map,
                center,
                radius: radiusMeters,
                clickable: false,
                fillColor: '#2563eb',
                fillOpacity: 0.06,
                strokeColor: '#2563eb',
                strokeOpacity: 0.65,
                strokeWeight: 2,
                zIndex: 5
            });
        }
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

    window.addEventListener('homepage:ranking-change', event => {
        showRestaurants(event.detail?.restaurants || []);
    });

    window.addEventListener('homepage:restaurant-focus-request', event => {
        focusRestaurant(event.detail?.key);
    });

    window.HomepageMap = {
        showRestaurants,
        focusRestaurant,
        clearMarkers,
        showCurrentLocation,
        showSearchRadius,
        hideCurrentLocation
    };

    if (document.getElementById('homepage-map')) {
        loadGoogleMaps();
    }
})();
