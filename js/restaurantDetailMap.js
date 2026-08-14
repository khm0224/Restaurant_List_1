// 상세 페이지에서 선택한 음식점 한 곳의 위치만 표시합니다.
(function () {
    const mapElement = document.getElementById('restaurant-detail-map');
    let map = null;
    let marker = null;
    let selectedRestaurant = null;

    function showError(message) {
        if (!mapElement) {
            return;
        }

        mapElement.classList.add('is-error');
        mapElement.textContent = message;
    }

    function readSelectedRestaurant() {
        try {
            return JSON.parse(sessionStorage.getItem('selectedRestaurant') || 'null');
        } catch (error) {
            return null;
        }
    }

    async function resolveRestaurantLocation(restaurant) {
        if (
            Number.isFinite(Number(restaurant?.latitude)) &&
            Number.isFinite(Number(restaurant?.longitude))
        ) {
            return restaurant;
        }

        return window.RestaurantService?.findRestaurant({
            id: restaurant?.sourceId,
            district: restaurant?.district,
            name: restaurant?.name
        });
    }

    function renderMap(restaurant) {
        const position = {
            lat: Number(restaurant.latitude),
            lng: Number(restaurant.longitude)
        };

        mapElement.classList.remove('is-error');
        mapElement.textContent = '';

        map = new google.maps.Map(mapElement, {
            center: position,
            zoom: 17,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false,
            // ====== 미니맵 기본 음식점 마커 지우기 ====== //
            styles: [
                {
                    featureType: 'poi.business',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        marker = new google.maps.Marker({
            map,
            position,
            title: restaurant.name
        });
    }

    async function initMap() {
        try {
            const restaurant = await resolveRestaurantLocation(selectedRestaurant);

            if (!restaurant) {
                showError('음식점 위치 정보를 찾을 수 없습니다.');
                return;
            }

            renderMap(restaurant);
        } catch (error) {
            showError(error.message || '음식점 지도를 불러오지 못했습니다.');
        }
    }

    function loadGoogleMaps() {
        const apiKey = window.GOOGLE_MAPS_API_KEY?.trim();
        const hasValidApiKeyFormat = /^AIza[0-9A-Za-z_-]{30,}$/.test(apiKey || '');

        if (!hasValidApiKeyFormat) {
            showError('Google Maps API 키를 확인해주세요.');
            return;
        }

        if (window.google?.maps) {
            initMap();
            return;
        }

        window.initRestaurantDetailMap = initMap;
        window.gm_authFailure = () => showError('Google Maps 인증에 실패했습니다.');

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=initRestaurantDetailMap&v=weekly&language=ko&region=KR`;
        script.async = true;
        script.defer = true;
        script.onerror = () => showError('Google Maps 스크립트를 불러오지 못했습니다.');
        document.head.appendChild(script);
    }

    function load() {
        if (!mapElement) {
            return;
        }

        selectedRestaurant = readSelectedRestaurant();

        if (!selectedRestaurant) {
            showError('선택한 음식점 정보가 없습니다.');
            return;
        }

        loadGoogleMaps();
    }

    function resize() {
        if (!map || !window.google?.maps) {
            return;
        }

        const center = marker?.getPosition();
        google.maps.event.trigger(map, 'resize');

        if (center) {
            map.setCenter(center);
        }
    }

    window.RestaurantDetailMap = { load, resize };
    load();
})();
