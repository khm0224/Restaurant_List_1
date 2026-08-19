// 웹 지도 우클릭 메뉴에서 출발지와 도착지를 지정합니다.
(function () {
    const mapArea = document.getElementById('map-area');
    const mapElement = document.getElementById('map-api');
    const contextMenu = document.getElementById('map-route-context-menu');
    const routePanel = document.getElementById('route-panel');
    const routeToggleButton = document.getElementById('map-route-search');
    const originInput = document.getElementById('route-origin');
    const destinationInput = document.getElementById('route-destination');
    const markers = { origin: null, destination: null };
    const routeLocations = { origin: null, destination: null };
    let selectedLocation = null;

    if (!mapArea || !mapElement || !contextMenu) {
        return;
    }

    function closeContextMenu() {
        contextMenu.hidden = true;
        selectedLocation = null;
    }

    function openRoutePanel() {
        if (routePanel?.hidden) {
            routeToggleButton?.click();
        }
    }

    function formatLocation(location) {
        return `지도에서 선택 (${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)})`;
    }

    function createOrMoveMarker(type, location) {
        const map = window.RestaurantMap?.getMap();

        if (!map || !window.google?.maps) {
            return;
        }

        const position = { lat: location.latitude, lng: location.longitude };
        const isOrigin = type === 'origin';
        const markerColor = isOrigin ? '#2563eb' : '#ef5b62';
        const markerText = isOrigin ? '출발' : '도착';

        if (markers[type]) {
            markers[type].setPosition(position);
            markers[type].setMap(map);
            return;
        }

        markers[type] = new google.maps.Marker({
            map,
            position,
            title: isOrigin ? '출발지' : '도착지',
            icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="48" viewBox="0 0 44 48">
                        <path fill="${markerColor}" stroke="#ffffff" stroke-width="2"
                            d="M22 1C10.4 1 2 9.7 2 20.4C2 34 22 47 22 47S42 34 42 20.4C42 9.7 33.6 1 22 1Z"/>
                        <circle cx="22" cy="20" r="14" fill="#ffffff"/>
                        <text x="22" y="24" fill="${markerColor}" font-family="Arial, sans-serif"
                            font-size="10" font-weight="700" text-anchor="middle">${markerText}</text>
                    </svg>
                `)}`,
                scaledSize: new google.maps.Size(44, 48),
                anchor: new google.maps.Point(22, 47)
            },
            zIndex: 1100
        });
    }

    function setRoutePoint(type) {
        if (!selectedLocation) {
            return;
        }

        applyRoutePoint(type, selectedLocation, formatLocation(selectedLocation));
        closeContextMenu();
    }

    function applyRoutePoint(type, location, displayValue) {
        const input = type === 'origin' ? originInput : destinationInput;

        if (input) {
            input.value = displayValue;
            input.dataset.latitude = String(location.latitude);
            input.dataset.longitude = String(location.longitude);
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        routeLocations[type] = location;
        createOrMoveMarker(type, location);
        openRoutePanel();
    }

    function clearRoutePoint(type) {
        const input = type === 'origin' ? originInput : destinationInput;

        if (input) {
            input.value = '';
            delete input.dataset.latitude;
            delete input.dataset.longitude;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.focus();
        }

        if (markers[type]) {
            markers[type].setMap(null);
            markers[type] = null;
        }

        routeLocations[type] = null;
    }

    function showContextMenu(detail) {
        const areaRect = mapArea.getBoundingClientRect();
        const fallbackRect = mapElement.getBoundingClientRect();
        const clientX = Number.isFinite(detail.clientX) ? detail.clientX : fallbackRect.left + fallbackRect.width / 2;
        const clientY = Number.isFinite(detail.clientY) ? detail.clientY : fallbackRect.top + fallbackRect.height / 2;

        selectedLocation = {
            latitude: detail.latitude,
            longitude: detail.longitude
        };
        contextMenu.hidden = false;
        contextMenu.style.left = `${clientX - areaRect.left}px`;
        contextMenu.style.top = `${clientY - areaRect.top}px`;

        // 메뉴가 지도 바깥으로 넘치지 않도록 실제 크기를 확인한 뒤 위치를 보정합니다.
        const menuWidth = contextMenu.offsetWidth;
        const menuHeight = contextMenu.offsetHeight;
        const left = Math.max(8, Math.min(clientX - areaRect.left, areaRect.width - menuWidth - 8));
        const top = Math.max(8, Math.min(clientY - areaRect.top, areaRect.height - menuHeight - 8));
        contextMenu.style.left = `${left}px`;
        contextMenu.style.top = `${top}px`;
        contextMenu.querySelector('button')?.focus();
    }

    mapElement.addEventListener('contextmenu', event => event.preventDefault());

    document.addEventListener('restaurant-map:rightclick', event => {
        showContextMenu(event.detail);
    });

    document.addEventListener('restaurant-map:ready', () => {
        Object.entries(routeLocations).forEach(([type, location]) => {
            if (location) {
                createOrMoveMarker(type, location);
            }
        });
    });

    function setRestaurantDestination(restaurant) {
        if (!restaurant || !Number.isFinite(restaurant.latitude) || !Number.isFinite(restaurant.longitude)) {
            return false;
        }

        applyRoutePoint('destination', {
            latitude: restaurant.latitude,
            longitude: restaurant.longitude
        }, `${restaurant.name} · ${restaurant.address}`);

        const map = window.RestaurantMap?.getMap();

        if (map) {
            map.panTo({
                lat: restaurant.latitude,
                lng: restaurant.longitude
            });
            map.setZoom(17);
        }

        return true;
    }

    window.DirectionsController = {
        setDestination: setRestaurantDestination,
        clearRoutePoint
    };

    contextMenu.addEventListener('click', event => {
        const button = event.target.closest('[data-route-point]');

        if (button) {
            setRoutePoint(button.dataset.routePoint);
        }
    });

    document.querySelectorAll('[data-clear-route-point]').forEach(button => {
        button.addEventListener('click', () => {
            clearRoutePoint(button.dataset.clearRoutePoint);
        });
    });

    document.addEventListener('pointerdown', event => {
        if (!contextMenu.hidden && !contextMenu.contains(event.target)) {
            closeContextMenu();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !contextMenu.hidden) {
            closeContextMenu();
        }
    });
})();
