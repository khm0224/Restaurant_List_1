(function () {
    const CHUNCHEON_CENTER = { lat: 37.8813, lng: 127.7298 };
    const COORDINATE_CSV_URL = './전국_음식점_정보csv/filter_file_Gyo_dong_JS_geocoded.csv';

    let map = null;
    let restaurantMarkers = [];
    let coordinatePromise = null;
    let pendingRestaurants = [];
    let renderRequestId = 0;

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

        if (restaurantMarkers.length === 0) {
            map.setCenter(CHUNCHEON_CENTER);
            map.setZoom(13);
            return;
        }

        if (restaurantMarkers.length === 1) {
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

        showRestaurants(pendingRestaurants);
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
        clearMarkers
    };

    if (document.getElementById('homepage-map')) {
        loadGoogleMaps();
    }
})();
